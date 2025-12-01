import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const EmailRequestSchema = z.object({
  receiverId: z.string().uuid(),
  senderName: z.string().min(1).max(200),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate input
    const requestBody = await req.json();
    const validationResult = EmailRequestSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return new Response(
        JSON.stringify({ error: 'Invalid request data', details: validationResult.error.issues }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { receiverId, senderName } = validationResult.data;

    // Get receiver's profile and email
    const { data: receiverProfile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", receiverId)
      .single();

    if (profileError) {
      console.error("Error fetching receiver profile:", profileError);
      throw profileError;
    }

    // Get receiver's email from auth.users
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(receiverId);

    if (userError || !user?.email) {
      console.error("Error fetching receiver email:", userError);
      throw userError || new Error("Receiver email not found");
    }

    // Send email using Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Match App <noreply@scopami.online>",
        to: [user.email],
        subject: "Hai ricevuto una nuova richiesta di match!",
        html: `
          <h1>Ciao ${receiverProfile.full_name}!</h1>
          <p><strong>${senderName}</strong> ti ha inviato una richiesta di match.</p>
          <p>Hai <strong>48 ore</strong> per accettare o rifiutare questa richiesta.</p>
          <p>Se non risponderai entro 48 ore, la richiesta sarà automaticamente rifiutata e ti verrà scalato 1 gettone.</p>
          <p>Accedi all'app per visualizzare la richiesta e decidere.</p>
          <p>Buona fortuna!</p>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error("Resend API error:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const emailResult = await resendResponse.json();
    console.log("Email sent successfully:", emailResult);

    // Send push notification
    const oneSignalAppId = Deno.env.get("ONESIGNAL_APP_ID");
    const oneSignalRestApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");

    console.log("OneSignal App ID configured:", !!oneSignalAppId);
    console.log("OneSignal REST API Key configured:", !!oneSignalRestApiKey);
    console.log("Target receiver ID for notification:", receiverId);

    if (oneSignalAppId && oneSignalRestApiKey) {
      try {
        const notificationPayload = {
          app_id: oneSignalAppId,
          include_aliases: { external_id: [receiverId] },
          target_channel: "push",
          headings: { en: "Nuova Richiesta!", it: "Nuova Richiesta!" },
          contents: { en: `${senderName} ti ha inviato una richiesta di match.`, it: `${senderName} ti ha inviato una richiesta di match.` },
          url: "https://scopami.online/dashboard",
        };
        
        console.log("Sending OneSignal notification with payload:", JSON.stringify(notificationPayload));
        
        const notificationResponse = await fetch("https://onesignal.com/api/v1/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${oneSignalRestApiKey}`,
          },
          body: JSON.stringify(notificationPayload),
        });
        
        const notificationResult = await notificationResponse.json();
        console.log("OneSignal API response status:", notificationResponse.status);
        console.log("OneSignal API response:", JSON.stringify(notificationResult));
        
        if (!notificationResponse.ok) {
          console.error("OneSignal API error:", notificationResult);
        }
      } catch (pushError) {
        console.error("Error sending push notification:", pushError);
      }
    } else {
      console.log("OneSignal credentials not configured, skipping push notification");
    }

    return new Response(JSON.stringify(emailResult), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-match-request-email function:", error);
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
