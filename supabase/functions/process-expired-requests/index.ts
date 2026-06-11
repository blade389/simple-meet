import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.log("RESEND_API_KEY not configured, skipping email");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: "Match App <noreply@flashmatch.org>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to send email: ${response.status} - ${errorText}`);
  } else {
    console.log(`Email sent successfully to ${to}`);
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const pushSecret = Deno.env.get("PUSH_NOTIFICATION_SECRET")!;

    console.log("Processing expired match requests...");

    // Find all pending non-premium requests that have expired (donna→uomo)
    const { data: expiredRequests, error: fetchError } = await supabase
      .from("match_requests")
      .select(`
        id, 
        receiver_id, 
        sender_id,
        is_premium,
        sender:profiles!fk_match_requests_sender(full_name),
        receiver:profiles!fk_match_requests_receiver(full_name)
      `)
      .eq("status", "pending")
      .eq("is_premium", false)
      .lt("expires_at", new Date().toISOString());

    if (fetchError) {
      console.error("Error fetching expired requests:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredRequests?.length || 0} expired non-premium requests`);

    // Process each expired non-premium request (donna→uomo)
    for (const request of expiredRequests || []) {
      // Update request status to rejected
      const { error: updateError } = await supabase
        .from("match_requests")
        .update({ status: "rejected" })
        .eq("id", request.id);

      if (updateError) {
        console.error(`Error updating request ${request.id}:`, updateError);
        continue;
      }

      // Deduct 1 token from the male receiver (since this is donna→uomo)
      const { data: currentTokens, error: tokenFetchError } = await supabase
        .from("tokens")
        .select("amount")
        .eq("user_id", request.receiver_id)
        .maybeSingle();

      if (tokenFetchError) {
        console.error(`Error fetching tokens for user ${request.receiver_id}:`, tokenFetchError);
        continue;
      }

      const newAmount = Math.max(0, (currentTokens?.amount || 0) - 1);

      const { error: tokenUpdateError } = await supabase
        .from("tokens")
        .update({ amount: newAmount, last_updated: new Date().toISOString() })
        .eq("user_id", request.receiver_id);

      if (tokenUpdateError) {
        console.error(`Error updating tokens for user ${request.receiver_id}:`, tokenUpdateError);
      } else {
        console.log(`Successfully processed expired non-premium request ${request.id}, deducted 1 token from male user ${request.receiver_id}`);
      }

      const senderName = (request.sender as any)?.full_name || "L'utente";
      const receiverName = (request.receiver as any)?.full_name || "L'utente";

      // Send push notification to sender (donna)
      try {
        await supabase.functions.invoke("send-push-notification", {
          body: {
            userId: request.sender_id,
            title: "❌ Richiesta scaduta",
            body: `${receiverName} non ha risposto in tempo`,
            url: "/dashboard",
            tag: "request-expired",
          },
          headers: {
            'x-internal-secret': pushSecret,
          },
        });
      } catch (pushError) {
        console.error("Failed to send push notification to sender:", pushError);
      }

      // Send email to male receiver about token deduction
      try {
        const { data: receiverUser, error: userError } = await supabase.auth.admin.getUserById(request.receiver_id);
        
        if (userError || !receiverUser?.user?.email) {
          console.error(`Could not get email for user ${request.receiver_id}:`, userError);
        } else {
          await sendEmail(
            receiverUser.user.email,
            "❌ Richiesta scaduta - 1 gettone scalato",
            `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #e53e3e;">Richiesta scaduta</h2>
                <p>Ciao,</p>
                <p><strong>${senderName}</strong> ti aveva inviato una richiesta di match, ma non hai risposto in tempo.</p>
                <p>La richiesta è stata automaticamente rifiutata e ti è stato scalato <strong>1 gettone</strong>.</p>
                <p>Ti consigliamo di rispondere alle richieste entro 48 ore per evitare la perdita di gettoni.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">Match App</p>
              </div>
            `
          );
        }
      } catch (emailError) {
        console.error(`Failed to send email to receiver ${request.receiver_id}:`, emailError);
      }
    }

    // Process expired premium requests (uomo→donna) - just reject, trigger will refund
    const { data: expiredPremiumRequests } = await supabase
      .from("match_requests")
      .select(`
        id,
        sender_id,
        receiver:profiles!fk_match_requests_receiver(full_name)
      `)
      .eq("status", "pending")
      .eq("is_premium", true)
      .lt("expires_at", new Date().toISOString());

    console.log(`Found ${expiredPremiumRequests?.length || 0} expired premium requests`);

    for (const request of expiredPremiumRequests || []) {
      await supabase
        .from("match_requests")
        .update({ status: "rejected" })
        .eq("id", request.id);
      
      console.log(`Rejected expired premium request ${request.id}, trigger will refund token`);

      const receiverName = (request.receiver as any)?.full_name || "L'utente";

      // Send push notification to sender (uomo)
      try {
        await supabase.functions.invoke("send-push-notification", {
          body: {
            userId: request.sender_id,
            title: "❌ Richiesta scaduta",
            body: `${receiverName} non ha risposto in tempo. Il gettone è stato rimborsato.`,
            url: "/dashboard",
            tag: "request-expired",
          },
          headers: {
            'x-internal-secret': pushSecret,
          },
        });
      } catch (pushError) {
        console.error("Failed to send push notification:", pushError);
      }

      // Send email to male sender about token refund
      try {
        const { data: senderUser, error: userError } = await supabase.auth.admin.getUserById(request.sender_id);
        
        if (userError || !senderUser?.user?.email) {
          console.error(`Could not get email for user ${request.sender_id}:`, userError);
        } else {
          await sendEmail(
            senderUser.user.email,
            "❌ Richiesta premium scaduta - Gettone rimborsato",
            `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #e53e3e;">Richiesta premium scaduta</h2>
                <p>Ciao,</p>
                <p>La tua richiesta premium a <strong>${receiverName}</strong> è scaduta perché non ha risposto in tempo.</p>
                <p>Il tuo <strong>gettone è stato rimborsato</strong> automaticamente.</p>
                <p>Puoi usarlo per inviare una nuova richiesta a un altro profilo.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">Match App</p>
              </div>
            `
          );
        }
      } catch (emailError) {
        console.error(`Failed to send email to sender ${request.sender_id}:`, emailError);
      }
    }

    const totalProcessed = (expiredRequests?.length || 0) + (expiredPremiumRequests?.length || 0);

    return new Response(
      JSON.stringify({ 
        message: `Processed ${totalProcessed} expired requests`,
        nonPremium: expiredRequests?.length || 0,
        premium: expiredPremiumRequests?.length || 0
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in process-expired-requests function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
