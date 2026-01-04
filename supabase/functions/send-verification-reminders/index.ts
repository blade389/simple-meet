import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const getMaleReminderHtml = (name: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Completa la verifica su SCOPAMI</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Non dimenticare di verificare il tuo profilo!</h1>
    <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">Ciao ${name} 👋</p>
  </div>
  
  <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Abbiamo notato che non hai ancora completato la verifica del tuo account. 
      <strong>Senza la verifica non potrai ricevere richieste di appuntamento!</strong>
    </p>
    
    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
      <p style="margin: 0; color: #856404;">
        ⚠️ <strong>Ricorda:</strong> Per ricevere richieste, devi avere un profilo verificato e un saldo gettoni maggiore di 0.
      </p>
    </div>
    
    <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 15px 0; color: #667eea;">Come verificare il tuo account:</h3>
      <ol style="margin: 0; padding-left: 20px; color: #555;">
        <li style="margin-bottom: 10px;">Accedi al tuo <strong>Profilo</strong></li>
        <li style="margin-bottom: 10px;">Carica un <strong>documento d'identità</strong> valido</li>
        <li style="margin-bottom: 10px;">Carica una <strong>foto profilo</strong> chiara</li>
        <li>Attendi l'approvazione (di solito entro 24 ore)</li>
      </ol>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="https://scopami.online/profile" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
        Verifica Ora
      </a>
    </div>
    
    <p style="text-align: center; margin-top: 30px; color: #888; font-size: 14px;">
      A presto,<br>
      <strong>Il Team SCOPAMI</strong>
    </p>
  </div>
  
  <p style="text-align: center; margin-top: 20px; color: #aaa; font-size: 12px;">
    © 2025 SCOPAMI. Tutti i diritti riservati.
  </p>
</body>
</html>
`;

const getFemaleReminderHtml = (name: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Completa la verifica su SCOPAMI</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
  <div style="background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Non dimenticare di verificare il tuo profilo!</h1>
    <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">Ciao ${name} 👋</p>
  </div>
  
  <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Abbiamo notato che non hai ancora completato la verifica del tuo account. 
      <strong>Senza la verifica non potrai inviare richieste di appuntamento!</strong>
    </p>
    
    <div style="background: #fdf2f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 15px 0; color: #db2777;">Come verificare il tuo account:</h3>
      <ol style="margin: 0; padding-left: 20px; color: #555;">
        <li style="margin-bottom: 10px;">Accedi al tuo <strong>Profilo</strong></li>
        <li style="margin-bottom: 10px;">Carica un <strong>documento d'identità</strong> valido</li>
        <li style="margin-bottom: 10px;">Carica una <strong>foto profilo</strong> chiara</li>
        <li>Attendi l'approvazione (di solito entro 24 ore)</li>
      </ol>
    </div>
    
    <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #4caf50;">
      <p style="margin: 0; color: #2e7d32;">
        ✨ <strong>Ricorda:</strong> Su SCOPAMI puoi inviare richieste di appuntamento completamente gratis!
      </p>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="https://scopami.online/profile" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
        Verifica Ora
      </a>
    </div>
    
    <p style="text-align: center; margin-top: 30px; color: #888; font-size: 14px;">
      A presto,<br>
      <strong>Il Team SCOPAMI</strong>
    </p>
  </div>
  
  <p style="text-align: center; margin-top: 20px; color: #aaa; font-size: 12px;">
    © 2025 SCOPAMI. Tutti i diritti riservati.
  </p>
</body>
</html>
`;

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
      .select('id, full_name, gender, created_at, verification_reminder_sent')
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
        const name = profile.full_name || 'Utente';
        const isMale = profile.gender === 'male';

        const subject = 'Completa la verifica del tuo profilo SCOPAMI';
        const html = isMale ? getMaleReminderHtml(name) : getFemaleReminderHtml(name);

        console.log(`Sending verification reminder to ${email} (${profile.gender})`);

        const emailResponse = await resend.emails.send({
          from: "SCOPAMI <noreply@scopami.online>",
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
