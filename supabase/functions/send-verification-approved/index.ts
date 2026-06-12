import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { getTranslation, getEmailWrapper } from "../_shared/translations.ts";
import { sendAppEmail } from "../_shared/sendEmail.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationApprovedRequest {
  user_id: string;
  user_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-verification-approved: Function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, user_name }: VerificationApprovedRequest = await req.json();
    
    if (!user_id) {
      throw new Error("Missing required field: user_id");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user profile with language preference
    const { data: profile } = await supabase
      .from("profiles")
      .select("preferred_language")
      .eq("id", user_id)
      .single();

    const t = getTranslation(profile?.preferred_language);

    // Get user email
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(user_id);
    if (userError || !user?.email) {
      throw userError || new Error("User email not found");
    }

    const emailContent = `
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 48px;">✅</span>
      </div>
      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">${t.common.greeting} ${user_name || 'Utente'}!</h2>
      <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px;">
        ${t.verificationApproved.message}
      </p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://flashmatch.org/profile" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
          ${t.verificationApproved.cta}
        </a>
      </div>
    `;

    await sendAppEmail(supabase, {
      to: user.email,
      subject: `🎉 ${t.verificationApproved.subject}`,
      html: getEmailWrapper(emailContent, t),
      label: "verification-approved",
    });

    // Push notification
    const oneSignalAppId = Deno.env.get("ONESIGNAL_APP_ID");
    const oneSignalApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");

    if (oneSignalAppId && oneSignalApiKey) {
      await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${oneSignalApiKey}`,
        },
        body: JSON.stringify({
          app_id: oneSignalAppId,
          include_aliases: { external_id: [user_id] },
          target_channel: "push",
          headings: { en: `🎉 ${t.verificationApproved.title}` },
          contents: { en: t.verificationApproved.notification },
          url: "https://flashmatch.org/profile",
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notifications sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-verification-approved function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
