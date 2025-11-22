import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  receiverId: string;
  senderName: string;
  senderEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { receiverId, senderName, senderEmail }: EmailRequest = await req.json();

    // Get receiver's profile and email
    const { data: receiverProfile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name")
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

    // Send email using Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Match App <noreply@scopami.online>",
        to: [user.email],
        subject: "Hai ricevuto una nuova richiesta di match!",
        html: `
          <h1>Ciao ${receiverProfile.full_name}!</h1>
          <p><strong>${senderName}</strong> ti ha inviato una richiesta di match.</p>
          <p>Hai <strong>48 ore</strong> per accettare o rifiutare questa richiesta.</p>
          <p>Se non risponderai entro 48 ore, la richiesta sarà automaticamente rifiutata e ti verrà scalato 1 gettone.</p>
          <p>Accedi all'app per visualizzare la richiesta e decidere.</p>
          <p>Buona fortuna!</p>
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
