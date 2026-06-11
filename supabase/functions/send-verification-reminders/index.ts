import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { translations, SupportedLanguage, getEmailWrapper } from "../_shared/translations.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get profiles that:
    // 1. Were created more than 3 days ago
    // 2. Are not verified (verification_status is 'unverified' or 'pending')
    // 3. Haven't received a reminder yet (we'll track this with a field or just send once)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    // Also get profiles created less than 7 days ago to avoid spamming old accounts
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    console.log('Looking for unverified profiles created between', sevenDaysAgo.toISOString(), 'and', threeDaysAgo.toISOString());

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, gender, created_at, verification_reminder_sent, preferred_language')
      .in('verification_status', ['unverified', 'pending'])
      .lt('created_at', threeDaysAgo.toISOString())
      .gt('created_at', sevenDaysAgo.toISOString())
      .or('verification_reminder_sent.is.null,verification_reminder_sent.eq.false');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} profiles needing verification reminders`);

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No profiles need reminders', sent: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sentCount = 0;
    const errors: string[] = [];

    for (const profile of profiles) {
      try {
        // Get user email from auth.users
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(profile.id);
        
        if (userError || !userData.user?.email) {
          console.error(`Could not get email for user ${profile.id}:`, userError);
          continue;
        }

        const email = userData.user.email;
        const name = profile.full_name || 'User';
        const isMale = profile.gender === 'male';
        const lang = (profile.preferred_language || 'it') as SupportedLanguage;
        const t = translations[lang] || translations.it;

        const subject = t.verificationReminder.subject;
        const message = isMale ? t.verificationReminder.maleMessage : t.verificationReminder.femaleMessage;
        
        const howToVerifyLabel = lang === 'it' ? 'Come verificare il tuo account:' : 
          lang === 'en' ? 'How to verify your account:' : 
          lang === 'fr' ? 'Comment vérifier votre compte:' : 
          lang === 'de' ? 'So verifizieren Sie Ihr Konto:' : 
          lang === 'es' ? 'Cómo verificar tu cuenta:' : 
          lang === 'pt' ? 'Como verificar sua conta:' : 
          lang === 'nl' ? 'Hoe je account te verifiëren:' : 
          'Jak zweryfikować swoje konto:';

        const html = getEmailWrapper(`
          <h2 style="color: #333; margin-bottom: 20px;">${t.verificationReminder.title}</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            ${t.common.greeting} ${name}!
          </p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            ${message}
          </p>
          <div style="background: ${isMale ? '#f0f4ff' : '#fdf2f8'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: ${isMale ? '#667eea' : '#db2777'}; margin: 0 0 15px 0;">
              ${howToVerifyLabel}
            </h3>
            <ol style="margin: 0; padding-left: 20px; color: #555;">
              <li style="margin-bottom: 10px;">${t.welcome.steps.verify}</li>
              <li style="margin-bottom: 10px;">${t.welcome.steps.uploadPhoto}</li>
              <li>${t.welcome.steps.browse}</li>
            </ol>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://flashmatch.org/profile" style="display: inline-block; background: linear-gradient(135deg, ${isMale ? '#667eea 0%, #764ba2' : '#ec4899 0%, #f43f5e'} 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              ${t.verificationReminder.cta}
            </a>
          </div>
        `, t);

        console.log(`Sending verification reminder to ${email} (${profile.gender}) in ${lang}`);

        const emailResponse = await resend.emails.send({
          from: "FlashMatch <noreply@flashmatch.org>",
          to: [email],
          subject,
          html,
        });

        console.log(`Email sent to ${email}:`, emailResponse);

        // Mark reminder as sent
        await supabase
          .from('profiles')
          .update({ verification_reminder_sent: true })
          .eq('id', profile.id);

        sentCount++;
      } catch (emailError: any) {
        console.error(`Error sending reminder to ${profile.id}:`, emailError);
        errors.push(`${profile.id}: ${emailError.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Sent ${sentCount} verification reminders`,
        sent: sentCount,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-verification-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
