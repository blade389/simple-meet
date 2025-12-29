import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    if (!expiredRequests || expiredRequests.length === 0) {
      // Also check for premium requests
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

      if (!expiredPremiumRequests || expiredPremiumRequests.length === 0) {
        console.log("No expired requests found");
        return new Response(
          JSON.stringify({ message: "No expired requests found" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Process premium requests
      for (const request of expiredPremiumRequests) {
        await supabase
          .from("match_requests")
          .update({ status: "rejected" })
          .eq("id", request.id);
        
        console.log(`Rejected expired premium request ${request.id}, trigger will refund token`);

        // Send push notification to sender (uomo)
        const receiverName = (request.receiver as any)?.full_name || "L'utente";
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
      }

      return new Response(
        JSON.stringify({ message: `Processed ${expiredPremiumRequests.length} expired premium requests` }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Process each expired non-premium request (donna→uomo)
    for (const request of expiredRequests) {
      // Update request status to rejected (trigger will NOT refund premium tokens)
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

      // Send push notification to sender (donna)
      const receiverName = (request.receiver as any)?.full_name || "L'utente";
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
        console.error("Failed to send push notification:", pushError);
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

    for (const request of expiredPremiumRequests || []) {
      await supabase
        .from("match_requests")
        .update({ status: "rejected" })
        .eq("id", request.id);
      
      console.log(`Rejected expired premium request ${request.id}, trigger will refund token`);

      // Send push notification to sender (uomo)
      const receiverName = (request.receiver as any)?.full_name || "L'utente";
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
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${expiredRequests.length} expired requests`,
        processed: expiredRequests.length 
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
