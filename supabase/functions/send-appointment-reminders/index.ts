import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date();
    // Check for appointments happening in approximately 2 hours (between 1h45m and 2h15m from now)
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const windowStart = new Date(twoHoursLater.getTime() - 15 * 60 * 1000); // 1h45m from now
    const windowEnd = new Date(twoHoursLater.getTime() + 15 * 60 * 1000); // 2h15m from now

    console.log('Checking for appointments in ~2 hours...');
    console.log(`Window: ${windowStart.toISOString()} to ${windowEnd.toISOString()}`);

    // Find scheduled appointments happening in ~2 hours that haven't been reminded yet
    const { data: upcomingAppointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        location,
        female_user_id,
        male_user_id,
        reminder_sent
      `)
      .eq("status", "scheduled")
      .is("reminder_sent", null)
      .gte("appointment_date", windowStart.toISOString())
      .lte("appointment_date", windowEnd.toISOString());

    if (appointmentsError) {
      console.error("Error fetching upcoming appointments:", appointmentsError);
      throw appointmentsError;
    }

    console.log(`Found ${upcomingAppointments?.length || 0} appointments needing reminders`);

    let remindersSent = 0;

    if (upcomingAppointments && upcomingAppointments.length > 0) {
      for (const appointment of upcomingAppointments) {
        try {
          // Get both users' emails and names
          const { data: { user: femaleUser } } = await supabase.auth.admin.getUserById(appointment.female_user_id);
          const { data: { user: maleUser } } = await supabase.auth.admin.getUserById(appointment.male_user_id);

          const { data: femaleProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", appointment.female_user_id)
            .single();

          const { data: maleProfile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", appointment.male_user_id)
            .single();

          const femaleName = femaleProfile?.full_name || "Utente";
          const maleName = maleProfile?.full_name || "Utente";

          // Format the date for display
          const dateObj = new Date(appointment.appointment_date);
          const formattedDate = dateObj.toLocaleDateString('it-IT', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          });
          const formattedTime = dateObj.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
          });

          // Send email to female user
          if (femaleUser?.email) {
            const emailResponse = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
              },
              body: JSON.stringify({
                from: "Match App <noreply@scopami.online>",
                to: [femaleUser.email],
                subject: "⏰ Promemoria: appuntamento tra 2 ore!",
                html: `
                  <h1>Promemoria appuntamento! ⏰</h1>
                  <p>Ciao ${femaleName}!</p>
                  <p>Ti ricordiamo che hai un appuntamento con <strong>${maleName}</strong> tra circa 2 ore.</p>
                  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${formattedDate}</p>
                    <p style="margin: 5px 0;"><strong>🕐 Ora:</strong> ${formattedTime}</p>
                    <p style="margin: 5px 0;"><strong>📍 Luogo:</strong> ${appointment.location}</p>
                  </div>
                  <p>Buon appuntamento!</p>
                `,
              }),
            });

            if (!emailResponse.ok) {
              console.error(`Failed to send reminder to female user:`, await emailResponse.text());
            } else {
              console.log(`Reminder sent to female user for appointment ${appointment.id}`);
            }
          }

          // Send email to male user
          if (maleUser?.email) {
            const emailResponse = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
              },
              body: JSON.stringify({
                from: "Match App <noreply@scopami.online>",
                to: [maleUser.email],
                subject: "⏰ Promemoria: appuntamento tra 2 ore!",
                html: `
                  <h1>Promemoria appuntamento! ⏰</h1>
                  <p>Ciao ${maleName}!</p>
                  <p>Ti ricordiamo che hai un appuntamento con <strong>${femaleName}</strong> tra circa 2 ore.</p>
                  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>📅 Data:</strong> ${formattedDate}</p>
                    <p style="margin: 5px 0;"><strong>🕐 Ora:</strong> ${formattedTime}</p>
                    <p style="margin: 5px 0;"><strong>📍 Luogo:</strong> ${appointment.location}</p>
                  </div>
                  <p>Buon appuntamento!</p>
                `,
              }),
            });

            if (!emailResponse.ok) {
              console.error(`Failed to send reminder to male user:`, await emailResponse.text());
            } else {
              console.log(`Reminder sent to male user for appointment ${appointment.id}`);
            }
          }

          // Send push notifications to both users
          const oneSignalAppId = Deno.env.get("ONESIGNAL_APP_ID");
          const oneSignalRestApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");

          if (oneSignalAppId && oneSignalRestApiKey) {
            // Push to female user
            try {
              await fetch("https://onesignal.com/api/v1/notifications", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Basic ${oneSignalRestApiKey}`,
                },
                body: JSON.stringify({
                  app_id: oneSignalAppId,
                  include_aliases: { external_id: [appointment.female_user_id] },
                  target_channel: "push",
                  headings: { en: "⏰ Appuntamento tra 2 ore!", it: "⏰ Appuntamento tra 2 ore!" },
                  contents: { 
                    en: `Appuntamento con ${maleName} alle ${formattedTime} - ${appointment.location}`, 
                    it: `Appuntamento con ${maleName} alle ${formattedTime} - ${appointment.location}` 
                  },
                  url: "https://scopami.online/appointments",
                }),
              });
              console.log(`Push sent to female user for appointment ${appointment.id}`);
            } catch (pushError) {
              console.error("Failed to send push to female user:", pushError);
            }

            // Push to male user
            try {
              await fetch("https://onesignal.com/api/v1/notifications", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Basic ${oneSignalRestApiKey}`,
                },
                body: JSON.stringify({
                  app_id: oneSignalAppId,
                  include_aliases: { external_id: [appointment.male_user_id] },
                  target_channel: "push",
                  headings: { en: "⏰ Appuntamento tra 2 ore!", it: "⏰ Appuntamento tra 2 ore!" },
                  contents: { 
                    en: `Appuntamento con ${femaleName} alle ${formattedTime} - ${appointment.location}`, 
                    it: `Appuntamento con ${femaleName} alle ${formattedTime} - ${appointment.location}` 
                  },
                  url: "https://scopami.online/appointments",
                }),
              });
              console.log(`Push sent to male user for appointment ${appointment.id}`);
            } catch (pushError) {
              console.error("Failed to send push to male user:", pushError);
            }
          }

          // Mark reminder as sent
          await supabase
            .from("appointments")
            .update({ reminder_sent: true })
            .eq("id", appointment.id);

          remindersSent++;
        } catch (error) {
          console.error(`Error processing appointment ${appointment.id}:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        appointmentsChecked: upcomingAppointments?.length || 0,
        remindersSent
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-appointment-reminders function:", error);
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
