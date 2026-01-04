import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { translations, SupportedLanguage, getEmailWrapper } from "../_shared/translations.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReviewActionEmailRequest {
  action: 'deduct_token_male' | 'block_female' | 'no_action';
  userId: string;
  adminNotes: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-review-action-email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, userId, adminNotes }: ReviewActionEmailRequest = await req.json();

    console.log("Request data:", { action, userId, adminNotes });

    // No email for no_action
    if (action === 'no_action') {
      console.log("No action taken, skipping email");
      return new Response(
        JSON.stringify({ message: "No email sent for no_action" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create Supabase client to get user email
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user email from auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !userData?.user?.email) {
      console.error("Error fetching user:", userError);
      return new Response(
        JSON.stringify({ error: "User not found or no email" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get user's preferred language
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferred_language')
      .eq('id', userId)
      .single();

    const lang = (profile?.preferred_language || 'it') as SupportedLanguage;
    const t = translations[lang] || translations.it;

    const userEmail = userData.user.email;
    console.log("Sending email to:", userEmail, "in language:", lang);

    let subject: string;
    let htmlContent: string;

    const reasonLabel = lang === 'it' ? 'Motivazione' : lang === 'en' ? 'Reason' : lang === 'fr' ? 'Raison' : lang === 'de' ? 'Grund' : lang === 'es' ? 'Motivo' : lang === 'pt' ? 'Motivo' : lang === 'nl' ? 'Reden' : 'Powód';

    if (action === 'deduct_token_male') {
      subject = t.reviewAction.tokenDeductedSubject;
      htmlContent = getEmailWrapper(`
        <h2 style="color: #333; margin-bottom: 20px;">${t.reviewAction.tokenDeductedTitle}</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">${t.reviewAction.tokenDeductedMessage}</p>
        ${adminNotes ? `
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #666;"><strong>${reasonLabel}:</strong></p>
            <p style="margin: 10px 0 0 0; color: #555;">${adminNotes}</p>
          </div>
        ` : ''}
      `, t);
    } else if (action === 'block_female') {
      subject = t.reviewAction.blockedSubject;
      htmlContent = getEmailWrapper(`
        <h2 style="color: #333; margin-bottom: 20px;">${t.reviewAction.blockedTitle}</h2>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">${t.reviewAction.blockedMessage}</p>
        ${adminNotes ? `
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #666;"><strong>${reasonLabel}:</strong></p>
            <p style="margin: 10px 0 0 0; color: #555;">${adminNotes}</p>
          </div>
        ` : ''}
      `, t);
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const emailResponse = await resend.emails.send({
      from: "SCOPAMI <noreply@scopami.online>",
      to: [userEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-review-action-email function:", error);
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
