import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const userEmail = userData.user.email;
    console.log("Sending email to:", userEmail);

    let subject: string;
    let htmlContent: string;

    if (action === 'deduct_token_male') {
      subject = "SCOPAMI - Gettone scalato a seguito di revisione";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #e11d48; text-align: center;">SCOPAMI</h1>
          <h2 style="color: #333;">Notifica: Gettone Scalato</h2>
          <p>Gentile utente,</p>
          <p>Ti informiamo che a seguito di una revisione amministrativa della tua conversazione, ti è stato scalato <strong>1 gettone</strong> dal tuo saldo.</p>
          ${adminNotes ? `
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #666;"><strong>Motivazione:</strong></p>
              <p style="margin: 10px 0 0 0;">${adminNotes}</p>
            </div>
          ` : ''}
          <p>Se ritieni che questa decisione sia stata presa in errore, ti invitiamo a contattare il nostro supporto.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Questa email è stata inviata automaticamente. Non rispondere a questo messaggio.
          </p>
        </div>
      `;
    } else if (action === 'block_female') {
      subject = "SCOPAMI - Account bloccato a seguito di revisione";
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #e11d48; text-align: center;">SCOPAMI</h1>
          <h2 style="color: #333;">Notifica: Account Bloccato</h2>
          <p>Gentile utente,</p>
          <p>Ti informiamo che a seguito di una revisione amministrativa della tua conversazione, il tuo account è stato <strong>bloccato</strong>.</p>
          ${adminNotes ? `
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #666;"><strong>Motivazione:</strong></p>
              <p style="margin: 10px 0 0 0;">${adminNotes}</p>
            </div>
          ` : ''}
          <p>Se ritieni che questa decisione sia stata presa in errore, ti invitiamo a contattare il nostro supporto per richiedere una revisione del tuo caso.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Questa email è stata inviata automaticamente. Non rispondere a questo messaggio.
          </p>
        </div>
      `;
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
      from: "SCOPAMI <onboarding@resend.dev>",
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
