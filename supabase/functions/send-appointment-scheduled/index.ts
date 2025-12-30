import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RequestSchema = z.object({
  recipientUserId: z.string().uuid(),
  schedulerName: z.string().min(1).max(200),
  appointmentDate: z.string(),
  location: z.string().min(1).max(500),
});

const handler = async (req: Request): Promise<Response> => {
  console.log("send-appointment-scheduled function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate input
    const requestBody = await req.json();
    console.log("Request body received:", JSON.stringify(requestBody));
    
    const validationResult = RequestSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return new Response(
        JSON.stringify({ error: 'Invalid request data', details: validationResult.error.issues }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { recipientUserId, schedulerName, appointmentDate, location } = validationResult.data;
    console.log(`Sending appointment notification to ${recipientUserId} from ${schedulerName}`);

    // Get recipient's email from auth.users
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(recipientUserId);

    if (userError || !user?.email) {
      console.error("Error fetching recipient email:", userError);
      throw userError || new Error("Recipient email not found");
    }

    // Format the date for display
    const dateObj = new Date(appointmentDate);
    const formattedDate = dateObj.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const formattedTime = dateObj.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Send email using Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Match App <noreply@scopami.online>",
        to: [user.email],
        subject: "📅 Appuntamento fissato!",
        html: `
          <h1>Appuntamento confermato! 🎉</h1>
          <p><strong>${schedulerName}</strong> ha fissato un appuntamento con te!</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${formattedDate}</p>
            <p style="margin: 5px 0;"><strong>🕐 Ora:</strong> ${formattedTime}</p>
            <p style="margin: 5px 0;"><strong>📍 Luogo:</strong> ${location}</p>
          </div>
          <p>Accedi all'app per vedere i dettagli e chattare.</p>
          <p>Buon divertimento!</p>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error("Resend API error:", error);
    } else {
      console.log("Appointment email sent successfully to:", user.email);
    }

    // Send push notification
    const oneSignalAppId = Deno.env.get("ONESIGNAL_APP_ID");
    const oneSignalRestApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");

    if (oneSignalAppId && oneSignalRestApiKey) {
      try {
        const notificationResponse = await fetch("https://onesignal.com/api/v1/notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${oneSignalRestApiKey}`,
          },
          body: JSON.stringify({
            app_id: oneSignalAppId,
            include_aliases: { external_id: [recipientUserId] },
            target_channel: "push",
            headings: { en: "📅 Appuntamento fissato!", it: "📅 Appuntamento fissato!" },
            contents: { 
              en: `${schedulerName} ha fissato un appuntamento il ${formattedDate} alle ${formattedTime}`, 
              it: `${schedulerName} ha fissato un appuntamento il ${formattedDate} alle ${formattedTime}` 
            },
            url: "https://scopami.online/appointments",
          }),
        });
        
        const notificationResult = await notificationResponse.json();
        console.log("Push notification sent:", notificationResult);
      } catch (pushError) {
        console.error("Failed to send push notification:", pushError);
      }
    } else {
      console.log("OneSignal credentials not configured, skipping push notification");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-appointment-scheduled function:", error);
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
