import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PhotoApprovedRequest {
  user_id: string;
  user_name: string;
  is_primary: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-photo-approved: Function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, user_name, is_primary }: PhotoApprovedRequest = await req.json();
    
    console.log(`Processing photo approval for user: ${user_id}, is_primary: ${is_primary}`);

    if (!user_id) {
      throw new Error("Missing required field: user_id");
    }

    // Create Supabase client with service role to get user email
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user email from auth
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(user_id);

    if (userError || !user?.email) {
      console.error("Error fetching user email:", userError);
      throw userError || new Error("User email not found");
    }

    const userEmail = user.email;
    console.log(`Sending photo approval notifications to: ${userEmail}`);

    const photoTypeText = is_primary ? "principale" : "";
    const emailSubject = is_primary 
      ? "📸 La tua foto principale è stata approvata!" 
      : "📸 La tua foto è stata approvata!";

    // Send email notification via Resend API
    console.log("Sending email notification...");
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "SCOPAMI <noreply@scopami.online>",
        to: [userEmail],
        subject: emailSubject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #ec4899, #f97316); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; font-size: 28px; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .success-icon { font-size: 48px; text-align: center; margin-bottom: 20px; }
              .tip-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #ec4899, #f97316); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>❤️ SCOPAMI</h1>
              </div>
              <div class="content">
                <div class="success-icon">📸</div>
                <h2>Ciao ${user_name || 'Utente'}!</h2>
                <p>Ottime notizie! <strong>La tua foto ${photoTypeText} è stata approvata!</strong></p>
                ${is_primary ? '<p>La tua foto principale è ora visibile agli altri utenti. Ottimo lavoro!</p>' : '<p>La foto è stata aggiunta al tuo profilo.</p>'}
                
                <div class="tip-box">
                  <strong>💡 Suggerimento:</strong> Dal tuo profilo puoi selezionare la <strong>fascia d'età</strong> degli utenti a cui vuoi essere visibile. Imposta le tue preferenze per ricevere richieste più mirate!
                </div>
                
                <p>Cosa puoi fare ora:</p>
                <ul>
                  <li>🎯 <strong>Imposta la fascia d'età</strong> per cui vuoi essere visibile</li>
                  <li>📝 Completa la tua bio per attirare più attenzione</li>
                  <li>📸 Carica altre foto per un profilo più completo</li>
                </ul>
                
                <p style="text-align: center;">
                  <a href="https://scopami.online/profile" class="cta-button">Vai al tuo profilo →</a>
                </p>
              </div>
              <div class="footer">
                <p>Hai domande? Rispondi a questa email.</p>
                <p>© 2024 SCOPAMI. Tutti i diritti riservati.</p>
              </div>
            </div>
          </body>
          </html>
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

    // Send push notification via OneSignal
    console.log("Sending push notification...");
    const oneSignalAppId = Deno.env.get("ONESIGNAL_APP_ID");
    const oneSignalApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");

    if (oneSignalAppId && oneSignalApiKey) {
      try {
        const pushTitle = is_primary 
          ? "📸 Foto principale approvata!" 
          : "📸 Foto approvata!";
        const pushContent = is_primary
          ? "La tua foto principale è online! Imposta la fascia d'età dal profilo."
          : "La tua foto è stata approvata! Imposta le preferenze d'età dal profilo.";

        const notificationPayload = {
          app_id: oneSignalAppId,
          include_aliases: { external_id: [user_id] },
          target_channel: "push",
          headings: { 
            en: pushTitle, 
            it: pushTitle 
          },
          contents: { 
            en: pushContent,
            it: pushContent
          },
          url: "https://scopami.online/profile",
        };
        
        console.log("Sending OneSignal notification:", JSON.stringify(notificationPayload));

        const pushResponse = await fetch("https://onesignal.com/api/v1/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${oneSignalApiKey}`,
          },
          body: JSON.stringify(notificationPayload),
        });

        const pushResult = await pushResponse.json();
        console.log("OneSignal API response:", pushResult);
        
        if (!pushResponse.ok) {
          console.error("OneSignal API error:", pushResult);
        }
      } catch (pushError) {
        console.error("Error sending push notification:", pushError);
      }
    } else {
      console.log("OneSignal credentials not configured, skipping push notification");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        email: emailResult,
        message: "Photo approval notifications sent successfully" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-photo-approved function:", error);
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
