import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getTranslation, getEmailWrapper } from "../_shared/translations.ts";

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

    // Get profiles with language preferences
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("preferred_language")
      .eq("id", senderId)
      .single();

    const { data: receiverProfile } = await supabase
      .from("profiles")
      .select("preferred_language")
      .eq("id", receiverId)
      .single();

    const senderT = getTranslation(senderProfile?.preferred_language);
    const receiverT = getTranslation(receiverProfile?.preferred_language);

    // Get sender's email
    const { data: { user: senderUser }, error: senderError } = await supabase.auth.admin.getUserById(senderId);
    if (senderError || !senderUser?.email) {
      throw senderError || new Error("Sender email not found");
    }

    // Get receiver's email
    const { data: { user: receiverUser }, error: receiverError } = await supabase.auth.admin.getUserById(receiverId);
    if (receiverError || !receiverUser?.email) {
      throw receiverError || new Error("Receiver email not found");
    }

    // Email to SENDER (who made the request)
    const senderContent = `
      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">${senderT.requestAccepted.title} 🎉</h2>
      <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px;">
        <strong>${receiverName}</strong> ${senderT.requestAccepted.message}
      </p>
      <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 14px;">
        ${senderT.requestAccepted.scheduleReminder}
      </p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://flashmatch.online/appointments" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
          ${senderT.requestAccepted.cta}
        </a>
      </div>
    `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "FlashMatch <noreply@flashmatch.online>",
        to: [senderUser.email],
        subject: senderT.requestAccepted.subject,
        html: getEmailWrapper(senderContent, senderT),
      }),
    });

    // Email to RECEIVER (who accepted)
    const receiverContent = `
      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">${receiverT.requestAccepted.title} 🎉</h2>
      <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px;">
        ${receiverT.common.greeting}! Ora puoi chattare con <strong>${senderName}</strong>.
      </p>
      <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 14px;">
        ${receiverT.requestAccepted.scheduleReminder}
      </p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://flashmatch.online/appointments" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
          ${receiverT.requestAccepted.cta}
        </a>
      </div>
    `;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "FlashMatch <noreply@flashmatch.online>",
        to: [receiverUser.email],
        subject: receiverT.requestAccepted.subject,
        html: getEmailWrapper(receiverContent, receiverT),
      }),
    });

    // Push notifications
    const oneSignalAppId = Deno.env.get("ONESIGNAL_APP_ID");
    const oneSignalRestApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");

    if (oneSignalAppId && oneSignalRestApiKey) {
      // Push to sender
      await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${oneSignalRestApiKey}`,
        },
        body: JSON.stringify({
          app_id: oneSignalAppId,
          include_aliases: { external_id: [senderId] },
          target_channel: "push",
          headings: { en: `${senderT.requestAccepted.title} 🎉` },
          contents: { en: `${receiverName} ${senderT.requestAccepted.notification}` },
          url: "https://flashmatch.online/appointments",
        }),
      });

      // Push to receiver
      await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${oneSignalRestApiKey}`,
        },
        body: JSON.stringify({
          app_id: oneSignalAppId,
          include_aliases: { external_id: [receiverId] },
          target_channel: "push",
          headings: { en: `${receiverT.requestAccepted.title} 🎉` },
          contents: { en: `${receiverT.requestAccepted.cta}` },
          url: "https://flashmatch.online/appointments",
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-request-accepted-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
