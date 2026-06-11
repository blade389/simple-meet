import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { getTranslation, getEmailWrapper } from "../_shared/translations.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RequestSchema = z.object({
  recipientUserId: z.string().uuid(),
  schedulerName: z.string().min(1).max(200),
  appointmentDate: z.string(),
  location: z.string().min(1).max(500),
});

const handler = async (req: Request): Promise<Response> => {
  console.log("send-appointment-scheduled function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const requestBody = await req.json();
    const validationResult = RequestSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return new Response(
        JSON.stringify({ error: 'Invalid request data', details: validationResult.error.issues }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { recipientUserId, schedulerName, appointmentDate, location } = validationResult.data;

    // Get recipient's profile with language
    const { data: profile } = await supabase
      .from("profiles")
      .select("preferred_language")
      .eq("id", recipientUserId)
      .single();

    const t = getTranslation(profile?.preferred_language);

    // Get recipient's email
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(recipientUserId);
    if (userError || !user?.email) {
      throw userError || new Error("Recipient email not found");
    }

    // Format the date based on user's language
    const dateObj = new Date(appointmentDate);
    const locale = profile?.preferred_language || 'it';
    const formattedDate = dateObj.toLocaleDateString(locale === 'en' ? 'en-US' : `${locale}-${locale.toUpperCase()}`, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const formattedTime = dateObj.toLocaleTimeString(locale === 'en' ? 'en-US' : `${locale}-${locale.toUpperCase()}`, {
      hour: '2-digit',
      minute: '2-digit',
    });

    const emailContent = `
      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">${t.appointmentScheduled.title} 🎉</h2>
      <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px;">
        <strong>${schedulerName}</strong> ${t.appointmentScheduled.message}
      </p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>📅 ${t.appointmentScheduled.date}:</strong> ${formattedDate}</p>
        <p style="margin: 5px 0;"><strong>🕐</strong> ${formattedTime}</p>
        <p style="margin: 5px 0;"><strong>📍 ${t.appointmentScheduled.location}:</strong> ${location}</p>
      </div>
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://flashmatch.org/appointments" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
          ${t.appointmentScheduled.cta}
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
        from: "FlashMatch <noreply@flashmatch.org>",
        to: [user.email],
        subject: `📅 ${t.appointmentScheduled.subject}`,
        html: getEmailWrapper(emailContent, t),
      }),
    });

    // Push notification
    const oneSignalAppId = Deno.env.get("ONESIGNAL_APP_ID");
    const oneSignalRestApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");

    if (oneSignalAppId && oneSignalRestApiKey) {
      await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${oneSignalRestApiKey}`,
        },
        body: JSON.stringify({
          app_id: oneSignalAppId,
          include_aliases: { external_id: [recipientUserId] },
          target_channel: "push",
          headings: { en: `📅 ${t.appointmentScheduled.title}` },
          contents: { en: `${schedulerName} ${t.appointmentScheduled.notification}` },
          url: "https://flashmatch.org/appointments",
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-appointment-scheduled function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
