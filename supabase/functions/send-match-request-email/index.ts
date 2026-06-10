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
  receiverId: z.string().uuid(),
  senderName: z.string().min(1).max(200),
  isPremium: z.boolean().optional().default(false),
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

    const { receiverId, senderName, isPremium } = validationResult.data;

    // Get receiver's profile with language preference
    const { data: receiverProfile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, preferred_language")
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

    const t = getTranslation(receiverProfile.preferred_language);

    // Translated email content
    const emailContent = `
      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">${t.common.greeting} ${receiverProfile.full_name}!</h2>
      <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px;">
        <strong>${senderName}</strong> ${isPremium ? t.matchRequest.premiumMessage : t.matchRequest.message}
      </p>
      <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 14px;">
        ${isPremium ? 'Hai 48 ore per rispondere.' : 'Hai 48 ore per accettare o rifiutare.'}
      </p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://matchly.online/${isPremium ? 'premium-requests' : 'dashboard'}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
          ${t.matchRequest.cta}
        </a>
      </div>
    `;

    const emailSubject = isPremium ? t.matchRequest.premiumSubject : t.matchRequest.subject;
    const html = getEmailWrapper(emailContent, t);

    // Send email using Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Matchly <noreply@matchly.online>",
        to: [user.email],
        subject: emailSubject,
        html,
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

    if (oneSignalAppId && oneSignalRestApiKey) {
      try {
        const notificationTitle = isPremium ? t.matchRequest.premiumTitle : t.matchRequest.title;
        const notificationContent = `${senderName} ${isPremium ? t.matchRequest.premiumNotification : t.matchRequest.notification}`;
        const notificationUrl = isPremium 
          ? "https://matchly.online/premium-requests"
          : "https://matchly.online/dashboard";

        const notificationPayload = {
          app_id: oneSignalAppId,
          include_aliases: { external_id: [receiverId] },
          target_channel: "push",
          headings: { en: notificationTitle },
          contents: { en: notificationContent },
          url: notificationUrl,
        };
        
        console.log("Sending OneSignal notification");
        
        const notificationResponse = await fetch("https://onesignal.com/api/v1/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${oneSignalRestApiKey}`,
          },
          body: JSON.stringify(notificationPayload),
        });
        
        const notificationResult = await notificationResponse.json();
        console.log("OneSignal API response:", notificationResult);
      } catch (pushError) {
        console.error("Error sending push notification:", pushError);
      }
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
