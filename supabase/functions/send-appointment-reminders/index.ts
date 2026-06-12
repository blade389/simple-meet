import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { getTranslation, getEmailWrapper } from "../_shared/translations.ts";
import { sendAppEmail } from "../_shared/sendEmail.ts";

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
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const windowStart = new Date(twoHoursLater.getTime() - 15 * 60 * 1000);
    const windowEnd = new Date(twoHoursLater.getTime() + 15 * 60 * 1000);

    console.log('Checking for appointments in ~2 hours...');

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

    if (appointmentsError) throw appointmentsError;

    let remindersSent = 0;

    if (upcomingAppointments && upcomingAppointments.length > 0) {
      for (const appointment of upcomingAppointments) {
        try {
          // Get profiles with language preferences
          const { data: femaleProfile } = await supabase
            .from("profiles")
            .select("full_name, preferred_language")
            .eq("id", appointment.female_user_id)
            .single();

          const { data: maleProfile } = await supabase
            .from("profiles")
            .select("full_name, preferred_language")
            .eq("id", appointment.male_user_id)
            .single();

          const { data: { user: femaleUser } } = await supabase.auth.admin.getUserById(appointment.female_user_id);
          const { data: { user: maleUser } } = await supabase.auth.admin.getUserById(appointment.male_user_id);

          const femaleName = femaleProfile?.full_name || "Utente";
          const maleName = maleProfile?.full_name || "Utente";
          const femaleT = getTranslation(femaleProfile?.preferred_language);
          const maleT = getTranslation(maleProfile?.preferred_language);

          // Format dates per language
          const dateObj = new Date(appointment.appointment_date);
          
          const formatDateForLang = (lang: string) => {
            const locale = lang === 'en' ? 'en-US' : `${lang}-${lang.toUpperCase()}`;
            return {
              date: dateObj.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' }),
              time: dateObj.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
            };
          };

          // Email to female user
          if (femaleUser?.email) {
            const { date, time } = formatDateForLang(femaleProfile?.preferred_language || 'it');
            const content = `
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">⏰ ${femaleT.appointmentReminder.title}</h2>
              <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px;">
                ${femaleT.common.greeting} ${femaleName}! ${femaleT.appointmentReminder.message}
              </p>
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>👤</strong> ${maleName}</p>
                <p style="margin: 5px 0;"><strong>📅</strong> ${date}</p>
                <p style="margin: 5px 0;"><strong>🕐</strong> ${time}</p>
                <p style="margin: 5px 0;"><strong>📍</strong> ${appointment.location}</p>
              </div>
            `;

            await sendAppEmail(supabase, {
              to: femaleUser.email,
              subject: `⏰ ${femaleT.appointmentReminder.subject}`,
              html: getEmailWrapper(content, femaleT),
              label: "appointment-reminder",
              idempotencyKey: `appt-reminder-${appointment.id}-f`,
            });
          }

          // Email to male user
          if (maleUser?.email) {
            const { date, time } = formatDateForLang(maleProfile?.preferred_language || 'it');
            const content = `
              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">⏰ ${maleT.appointmentReminder.title}</h2>
              <p style="margin: 0 0 15px 0; color: #4b5563; font-size: 16px;">
                ${maleT.common.greeting} ${maleName}! ${maleT.appointmentReminder.message}
              </p>
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>👤</strong> ${femaleName}</p>
                <p style="margin: 5px 0;"><strong>📅</strong> ${date}</p>
                <p style="margin: 5px 0;"><strong>🕐</strong> ${time}</p>
                <p style="margin: 5px 0;"><strong>📍</strong> ${appointment.location}</p>
              </div>
            `;

            await sendAppEmail(supabase, {
              to: maleUser.email,
              subject: `⏰ ${maleT.appointmentReminder.subject}`,
              html: getEmailWrapper(content, maleT),
              label: "appointment-reminder",
              idempotencyKey: `appt-reminder-${appointment.id}-m`,
            });
          }

          // Push notifications
          const oneSignalAppId = Deno.env.get("ONESIGNAL_APP_ID");
          const oneSignalRestApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");

          if (oneSignalAppId && oneSignalRestApiKey) {
            const { time: femaleTime } = formatDateForLang(femaleProfile?.preferred_language || 'it');
            const { time: maleTime } = formatDateForLang(maleProfile?.preferred_language || 'it');

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
                headings: { en: `⏰ ${femaleT.appointmentReminder.title}` },
                contents: { en: `${maleName} - ${femaleTime} - ${appointment.location}` },
                url: "https://flashmatch.org/appointments",
              }),
            });

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
                headings: { en: `⏰ ${maleT.appointmentReminder.title}` },
                contents: { en: `${femaleName} - ${maleTime} - ${appointment.location}` },
                url: "https://flashmatch.org/appointments",
              }),
            });
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
      JSON.stringify({ success: true, appointmentsChecked: upcomingAppointments?.length || 0, remindersSent }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-appointment-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
