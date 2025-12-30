import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const EmailRequestSchema = z.object({
  senderId: z.string().uuid(),
  receiverId: z.string().uuid(),
  senderName: z.string().min(1).max(200),
  receiverName: z.string().min(1).max(200),
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

    const { senderId, receiverId, senderName, receiverName } = validationResult.data;

    // Get sender's email from auth.users
    const { data: { user: senderUser }, error: senderError } = await supabase.auth.admin.getUserById(senderId);

    if (senderError || !senderUser?.email) {
      console.error("Error fetching sender email:", senderError);
      throw senderError || new Error("Sender email not found");
    }

    // Get receiver's email from auth.users
    const { data: { user: receiverUser }, error: receiverError } = await supabase.auth.admin.getUserById(receiverId);

    if (receiverError || !receiverUser?.email) {
      console.error("Error fetching receiver email:", receiverError);
      throw receiverError || new Error("Receiver email not found");
    }

    // Send email to SENDER (the one who made the request)
    const senderEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Match App <noreply@scopami.online>",
        to: [senderUser.email],
        subject: "La tua richiesta è stata accettata!",
        html: `
          <h1>Buone notizie!</h1>
          <p><strong>${receiverName}</strong> ha accettato la tua richiesta di match!</p>
          <p>Ora puoi chattare e fissare un appuntamento.</p>
          <p>Hai <strong>48 ore</strong> per fissare l'appuntamento, altrimenti la conversazione verrà chiusa.</p>
          <p>Accedi all'app per iniziare a chattare.</p>
          <p>Buon divertimento!</p>
        `,
      }),
    });

    if (!senderEmailResponse.ok) {
      const error = await senderEmailResponse.text();
      console.error("Resend API error (sender email):", error);
    } else {
      console.log("Email sent to sender successfully");
    }

    // Send email to RECEIVER (the one who accepted the request)
    const receiverEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Match App <noreply@scopami.online>",
        to: [receiverUser.email],
        subject: "Match confermato! Ora puoi chattare",
        html: `
          <h1>Match confermato! 🎉</h1>
          <p>Hai accettato la richiesta di <strong>${senderName}</strong>!</p>
          <p>Ora potete chattare e fissare un appuntamento insieme.</p>
          <p>Ricorda: avete <strong>48 ore</strong> per fissare l'appuntamento, altrimenti la conversazione verrà chiusa automaticamente.</p>
          <p>Accedi all'app per iniziare a chattare!</p>
        `,
      }),
    });

    if (!receiverEmailResponse.ok) {
      const error = await receiverEmailResponse.text();
      console.error("Resend API error (receiver email):", error);
    } else {
      console.log("Email sent to receiver successfully");
    }

    // Send push notification to SENDER
    const oneSignalAppId = Deno.env.get("ONESIGNAL_APP_ID");
    const oneSignalRestApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");

    if (oneSignalAppId && oneSignalRestApiKey) {
      try {
        // Push to sender
        const senderNotificationResponse = await fetch("https://onesignal.com/api/v1/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${oneSignalRestApiKey}`,
          },
          body: JSON.stringify({
            app_id: oneSignalAppId,
            include_aliases: { external_id: [senderId] },
            target_channel: "push",
            headings: { en: "Match confermato! 🎉", it: "Match confermato! 🎉" },
            contents: { en: `${receiverName} ha accettato la tua richiesta`, it: `${receiverName} ha accettato la tua richiesta` },
            url: "https://scopami.online/appointments",
          }),
        });
        
        const senderNotificationResult = await senderNotificationResponse.json();
        console.log("Push notification sent to sender:", senderNotificationResult);

        // Push to receiver
        const receiverNotificationResponse = await fetch("https://onesignal.com/api/v1/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${oneSignalRestApiKey}`,
          },
          body: JSON.stringify({
            app_id: oneSignalAppId,
            include_aliases: { external_id: [receiverId] },
            target_channel: "push",
            headings: { en: "Match confermato! 🎉", it: "Match confermato! 🎉" },
            contents: { en: `Ora puoi chattare con ${senderName}`, it: `Ora puoi chattare con ${senderName}` },
            url: "https://scopami.online/appointments",
          }),
        });
        
        const receiverNotificationResult = await receiverNotificationResponse.json();
        console.log("Push notification sent to receiver:", receiverNotificationResult);
      } catch (pushError) {
        console.error("Failed to send push notification:", pushError);
      }
    } else {
      console.log("OneSignal credentials not configured, skipping push notification");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-request-accepted-email function:", error);
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
