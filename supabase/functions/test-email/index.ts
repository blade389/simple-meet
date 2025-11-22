import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      throw new Error("Email address is required");
    }

    console.log(`Testing Resend API with email to: ${email}`);

    // Send email using Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Match App Test <onboarding@resend.dev>",
        to: [email],
        subject: "Test Email - Resend API",
        html: `
          <h1>Test Email Successful!</h1>
          <p>This is a test email to verify that the Resend API key is working correctly.</p>
          <p>If you're reading this, the email was sent successfully! 🎉</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      console.error("Resend API error:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const emailResult = await resendResponse.json();
    console.log("Test email sent successfully:", emailResult);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email sent successfully",
      result: emailResult 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in test-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
