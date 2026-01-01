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
    // Check for appointments with review deadline in approximately 6 hours (5h45m to 6h15m from now)
    const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const windowStart = new Date(sixHoursLater.getTime() - 15 * 60 * 1000); // 5h45m from now
    const windowEnd = new Date(sixHoursLater.getTime() + 15 * 60 * 1000); // 6h15m from now

    console.log('Checking for appointments with review deadline in ~6 hours...');
    console.log(`Window: ${windowStart.toISOString()} to ${windowEnd.toISOString()}`);

    // Find completed appointments with review deadline in ~6 hours that haven't been reminded
    const { data: upcomingDeadlines, error: appointmentsError } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        review_deadline,
        female_user_id,
        male_user_id,
        review_reminder_sent,
        location
      `)
      .eq("status", "completed")
      .eq("review_reminder_sent", false)
      .gte("review_deadline", windowStart.toISOString())
      .lte("review_deadline", windowEnd.toISOString());

    if (appointmentsError) {
      console.error("Error fetching appointments:", appointmentsError);
      throw appointmentsError;
    }

    console.log(`Found ${upcomingDeadlines?.length || 0} appointments needing review reminders`);

    let remindersSent = 0;

    if (upcomingDeadlines && upcomingDeadlines.length > 0) {
      for (const appointment of upcomingDeadlines) {
        try {
          // Get both users' profiles and emails
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

          // Check which users already left reviews
          const { data: existingReviews } = await supabase
            .from("reviews")
            .select("reviewer_id")
            .eq("appointment_id", appointment.id);

          const femaleReviewed = existingReviews?.some(r => r.reviewer_id === appointment.female_user_id);
          const maleReviewed = existingReviews?.some(r => r.reviewer_id === appointment.male_user_id);

          // Format deadline for display
          const deadlineDate = new Date(appointment.review_deadline);
          const formattedDeadline = deadlineDate.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
          });
          const formattedDeadlineDate = deadlineDate.toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'long',
          });

          // Send email to female user if they haven't reviewed yet
          if (!femaleReviewed && femaleUser?.email) {
            const emailResponse = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
              },
              body: JSON.stringify({
                from: "Match App <noreply@scopami.online>",
                to: [femaleUser.email],
                subject: "⏰ Scadenza recensione: mancano 6 ore!",
                html: `
                  <h1>Non dimenticare di lasciare la tua recensione! ⏰</h1>
                  <p>Ciao ${femaleName}!</p>
                  <p>Ti ricordiamo che hai ancora <strong>6 ore</strong> per lasciare una recensione sul tuo appuntamento con <strong>${maleName}</strong>.</p>
                  <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffc107;">
                    <p style="margin: 5px 0;"><strong>⏰ Scadenza:</strong> ${formattedDeadlineDate} alle ${formattedDeadline}</p>
                  </div>
                  <p>Dopo la scadenza, non potrai più lasciare una recensione e la chat verrà chiusa definitivamente.</p>
                  <p><a href="https://scopami.online/appointments" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Lascia la tua recensione</a></p>
                `,
              }),
            });

            if (!emailResponse.ok) {
              console.error(`Failed to send review reminder to female user:`, await emailResponse.text());
            } else {
              console.log(`Review reminder sent to female user for appointment ${appointment.id}`);
            }
          }

          // Send email to male user if they haven't reviewed yet
          if (!maleReviewed && maleUser?.email) {
            const emailResponse = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
              },
              body: JSON.stringify({
                from: "Match App <noreply@scopami.online>",
                to: [maleUser.email],
                subject: "⏰ Scadenza recensione: mancano 6 ore!",
                html: `
                  <h1>Non dimenticare di lasciare la tua recensione! ⏰</h1>
                  <p>Ciao ${maleName}!</p>
                  <p>Ti ricordiamo che hai ancora <strong>6 ore</strong> per lasciare una recensione sul tuo appuntamento con <strong>${femaleName}</strong>.</p>
                  <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffc107;">
                    <p style="margin: 5px 0;"><strong>⏰ Scadenza:</strong> ${formattedDeadlineDate} alle ${formattedDeadline}</p>
                  </div>
                  <p>Dopo la scadenza, non potrai più lasciare una recensione e la chat verrà chiusa definitivamente.</p>
                  <p><a href="https://scopami.online/appointments" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Lascia la tua recensione</a></p>
                `,
              }),
            });

            if (!emailResponse.ok) {
              console.error(`Failed to send review reminder to male user:`, await emailResponse.text());
            } else {
              console.log(`Review reminder sent to male user for appointment ${appointment.id}`);
            }
          }

          // Send push notifications to users who haven't reviewed
          const oneSignalAppId = Deno.env.get("ONESIGNAL_APP_ID");
          const oneSignalRestApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");

          if (oneSignalAppId && oneSignalRestApiKey) {
            // Push to female user if not reviewed
            if (!femaleReviewed) {
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
                    headings: { en: "⏰ Scadenza recensione!", it: "⏰ Scadenza recensione!" },
                    contents: { 
                      en: `Hai 6 ore per lasciare la recensione su ${maleName}`, 
                      it: `Hai 6 ore per lasciare la recensione su ${maleName}` 
                    },
                    url: "https://scopami.online/appointments",
                  }),
                });
                console.log(`Push sent to female user for review reminder ${appointment.id}`);
              } catch (pushError) {
                console.error("Failed to send push to female user:", pushError);
              }
            }

            // Push to male user if not reviewed
            if (!maleReviewed) {
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
                    headings: { en: "⏰ Scadenza recensione!", it: "⏰ Scadenza recensione!" },
                    contents: { 
                      en: `Hai 6 ore per lasciare la recensione su ${femaleName}`, 
                      it: `Hai 6 ore per lasciare la recensione su ${femaleName}` 
                    },
                    url: "https://scopami.online/appointments",
                  }),
                });
                console.log(`Push sent to male user for review reminder ${appointment.id}`);
              } catch (pushError) {
                console.error("Failed to send push to male user:", pushError);
              }
            }
          }

          // Mark reminder as sent
          await supabase
            .from("appointments")
            .update({ review_reminder_sent: true })
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
        appointmentsChecked: upcomingDeadlines?.length || 0,
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
    console.error("Error in send-review-reminders function:", error);
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
