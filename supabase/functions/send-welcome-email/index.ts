import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { getTranslation, getEmailWrapper, type SupportedLanguage } from "../_shared/translations.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name: string;
  gender: 'male' | 'female';
  language?: string;
}

const getMaleEmailHtml = (name: string, t: ReturnType<typeof getTranslation>): string => {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">${t.common.greeting} ${name}! 🎉</h2>
    <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px;">${t.welcome.intro}</p>
    
    <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
      <h3 style="margin: 0 0 10px 0; color: #667eea;">✅ ${t.welcome.steps.verify}</h3>
      <p style="margin: 0; color: #555;">Vai nella sezione Profilo e completa la verifica.</p>
    </div>
    
    <div style="background: #fff8e6; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
      <h3 style="margin: 0 0 10px 0; color: #d97706;">📬 ${t.welcome.steps.browse}</h3>
      <p style="margin: 0; color: #555;">Ricevi richieste di appuntamento direttamente.</p>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="https://scopami.online/profile" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
        ${t.welcome.cta}
      </a>
    </div>
  `;
  return getEmailWrapper(content, t);
};

const getFemaleEmailHtml = (name: string, t: ReturnType<typeof getTranslation>): string => {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">${t.common.greeting} ${name}! 🎉</h2>
    <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px;">${t.welcome.intro}</p>
    
    <div style="background: #fdf2f8; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ec4899;">
      <h3 style="margin: 0 0 10px 0; color: #db2777;">✅ ${t.welcome.steps.verify}</h3>
      <p style="margin: 0; color: #555;">Vai nella sezione Profilo e completa la verifica.</p>
    </div>
    
    <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #4caf50;">
      <h3 style="margin: 0 0 10px 0; color: #2e7d32;">💝 ${t.welcome.steps.sendRequest}</h3>
      <p style="margin: 0; color: #555;">Invia richieste di appuntamento gratuitamente.</p>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="https://scopami.online/profile" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
        ${t.welcome.cta}
      </a>
    </div>
  `;
  return getEmailWrapper(content, t);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, gender, language }: WelcomeEmailRequest = await req.json();

    console.log('Sending welcome email to:', { email, name, gender, language });

    if (!email || !name || !gender) {
      throw new Error('Missing required fields: email, name, or gender');
    }

    const t = getTranslation(language);
    const isMale = gender === 'male';
    const subject = t.welcome.subject;
    const html = isMale ? getMaleEmailHtml(name, t) : getFemaleEmailHtml(name, t);

    const emailResponse = await resend.emails.send({
      from: "SCOPAMI <noreply@scopami.online>",
      to: [email],
      subject,
      html,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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
