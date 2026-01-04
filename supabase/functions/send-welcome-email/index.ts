import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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
}

const getMaleEmailHtml = (name: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Benvenuto su SCOPAMI</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Benvenuto su SCOPAMI!</h1>
    <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">Ciao ${name} 🎉</p>
  </div>
  
  <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 25px;">Per iniziare a ricevere richieste di appuntamento, segui questi semplici passi:</p>
    
    <div style="background: #f0f4ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
      <h3 style="margin: 0 0 10px 0; color: #667eea; display: flex; align-items: center;">
        ✅ 1. Verifica il tuo account
      </h3>
      <p style="margin: 0; color: #555;">
        Vai nella sezione <strong>Profilo</strong> e completa la verifica inviando:
      </p>
      <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #555;">
        <li>Un <strong>documento d'identità</strong> valido</li>
        <li>Una <strong>foto profilo</strong> chiara</li>
      </ul>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #888;">Questo garantisce la sicurezza di tutti gli utenti.</p>
    </div>
    
    <div style="background: #fff8e6; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
      <h3 style="margin: 0 0 10px 0; color: #d97706;">
        📬 2. Come funziona per te
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #555;">
        <li><strong>Ricevi richieste</strong> di appuntamento direttamente dalle donne</li>
        <li><strong>Accettare</strong> è gratuito e ti mette in contatto per organizzare l'incontro</li>
        <li><strong>Rifiutare</strong> costa 1 gettone</li>
      </ul>
      <div style="background: #fef3c7; padding: 10px; border-radius: 6px; margin-top: 15px;">
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          ⚠️ <strong>Importante:</strong> Per ricevere richieste, il tuo saldo gettoni deve essere maggiore di 0.
        </p>
      </div>
    </div>
    
    <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #4caf50;">
      <h3 style="margin: 0 0 10px 0; color: #2e7d32;">
        🎯 3. Imposta le tue preferenze
      </h3>
      <p style="margin: 0; color: #555;">
        Puoi impostare <strong>età personalizzate</strong> delle donne da cui vuoi ricevere richieste al costo di <strong>2 gettoni</strong>. 
        Così non dovrai rifiutare richieste e spendere gettoni in futuro!
      </p>
    </div>
    
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
      <h3 style="margin: 0 0 10px 0; color: #b45309;">
        👑 Richieste Premium
      </h3>
      <p style="margin: 0 0 10px 0; color: #555;">Puoi anche inviare richieste a profili Premium per incontri professionali:</p>
      <ul style="margin: 0; padding-left: 20px; color: #555;">
        <li>Ogni richiesta costa <strong>1 gettone</strong></li>
        <li>Se non viene accettata, il gettone viene <strong>rimborsato</strong></li>
        <li>La tariffa viene pagata direttamente di persona</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="https://scopami.online/profile" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
        Verifica il tuo Profilo
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

const getFemaleEmailHtml = (name: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Benvenuta su SCOPAMI</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
  <div style="background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Benvenuta su SCOPAMI!</h1>
    <p style="color: rgba(255,255,255,0.9); margin-top: 10px;">Ciao ${name} 🎉</p>
  </div>
  
  <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <p style="font-size: 16px; margin-bottom: 25px;">Per iniziare a inviare richieste di appuntamento, segui questi semplici passi:</p>
    
    <div style="background: #fdf2f8; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ec4899;">
      <h3 style="margin: 0 0 10px 0; color: #db2777; display: flex; align-items: center;">
        ✅ 1. Verifica il tuo account
      </h3>
      <p style="margin: 0; color: #555;">
        Vai nella sezione <strong>Profilo</strong> e completa la verifica inviando:
      </p>
      <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #555;">
        <li>Un <strong>documento d'identità</strong> valido</li>
        <li>Una <strong>foto profilo</strong> chiara</li>
      </ul>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #888;">Questo garantisce la sicurezza di tutti gli utenti.</p>
    </div>
    
    <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #4caf50;">
      <h3 style="margin: 0 0 10px 0; color: #2e7d32;">
        💝 2. Incontri Gratuiti
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #555;">
        <li><strong>Scopri profili</strong> nella sezione Browse e trova utenti di tuo gradimento</li>
        <li><strong>Invia richieste</strong> di appuntamento gratuitamente</li>
        <li>Se accettate, verrai messa in contatto per organizzare l'incontro</li>
      </ul>
      <p style="margin: 15px 0 0 0; font-weight: bold; color: #2e7d32;">
        ✨ Tutto completamente gratuito!
      </p>
    </div>
    
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
      <h3 style="margin: 0 0 10px 0; color: #b45309;">
        👑 Vuoi offrire servizi Premium?
      </h3>
      <p style="margin: 0 0 10px 0; color: #555;">Attiva l'abbonamento Premium per:</p>
      <ul style="margin: 0; padding-left: 20px; color: #555;">
        <li>Impostare le tue <strong>tariffe personalizzate</strong></li>
        <li>Ricevere richieste di appuntamento a pagamento</li>
        <li>Mantenere il <strong>controllo totale</strong> su chi accettare</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="https://scopami.online/profile" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
        Verifica il tuo Profilo
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, gender }: WelcomeEmailRequest = await req.json();

    console.log('Sending welcome email to:', { email, name, gender });

    if (!email || !name || !gender) {
      throw new Error('Missing required fields: email, name, or gender');
    }

    const isMale = gender === 'male';
    const subject = isMale ? 'Benvenuto su SCOPAMI! Ecco come iniziare' : 'Benvenuta su SCOPAMI! Ecco come iniziare';
    const html = isMale ? getMaleEmailHtml(name) : getFemaleEmailHtml(name);

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
