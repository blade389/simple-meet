import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  senderId: string;
  receiverName: string;
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

    const { senderId, receiverName }: EmailRequest = await req.json();

    // Get sender's email from auth.users
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(senderId);

    if (userError || !user?.email) {
      console.error("Error fetching sender email:", userError);
      throw userError || new Error("Sender email not found");
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
        subject: "La tua richiesta è stata accettata!",
        html: `
          <h1>Buone notizie!</h1>
          <p><strong>${receiverName}</strong> ha accettato la tua richiesta di match!</p>
          <p>Ora puoi chattare e fissare un appuntamento.</p>
          <p>Hai <strong>48 ore</strong> per fissare l'appuntamento, altrimenti la conversazione verrà chiusa.</p>
          <p>Accedi all'app per iniziare a chattare.</p>
          <p>Buon divertimento!</p>
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

    // Send push notification
    try {
      await supabase.functions.invoke("send-push-notification", {
        body: {
          userId: senderId,
          title: "Match confermato! 🎉",
          body: `${receiverName} ha accettato la tua richiesta`,
          url: "/appointments",
          tag: "match-accepted",
          requireInteraction: true,
        },
      });
      console.log("Push notification sent for accepted match");
    } catch (pushError) {
      console.error("Failed to send push notification:", pushError);
      // Don't fail the whole request if push fails
    }

    return new Response(JSON.stringify(emailResult), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-request-accepted-email function:", error);
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
