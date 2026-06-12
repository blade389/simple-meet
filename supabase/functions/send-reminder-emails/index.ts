import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { translations, SupportedLanguage, getEmailWrapper } from "../_shared/translations.ts";
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

    const pushSecret = Deno.env.get("PUSH_NOTIFICATION_SECRET")!;

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    console.log('Checking for expiring requests and appointments...');

    // 1. Check for pending match requests expiring in ~1 hour
    const { data: expiringRequests, error: requestsError } = await supabase
      .from("match_requests")
      .select(`
        id,
        expires_at,
        receiver_id,
        sender_id,
        is_premium,
        sender:profiles!match_requests_sender_id_fkey(full_name),
        receiver:profiles!match_requests_receiver_id_fkey(full_name, preferred_language)
      `)
      .eq("status", "pending")
      .gte("expires_at", now.toISOString())
      .lte("expires_at", oneHourLater.toISOString());

    if (requestsError) {
      console.error("Error fetching expiring requests:", requestsError);
    } else if (expiringRequests && expiringRequests.length > 0) {
      console.log(`Found ${expiringRequests.length} expiring requests`);

      for (const request of expiringRequests) {
        try {
          // Get receiver's email
          const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(request.receiver_id);

          if (userError || !user?.email) {
            console.error(`Error fetching receiver email for request ${request.id}:`, userError);
            continue;
          }

          const senderName = (request.sender as any)?.full_name || "User";
          const receiverName = (request.receiver as any)?.full_name || "User";
          const receiverLang = ((request.receiver as any)?.preferred_language || 'it') as SupportedLanguage;
          const isPremium = (request as any).is_premium === true;
          const t = translations[receiverLang] || translations.it;

          const emailSubject = isPremium 
            ? t.matchRequest.premiumSubject
            : t.requestExpiringReminder.subject;
          
          const emailHtml = getEmailWrapper(`
            <h2 style="color: #333; margin-bottom: 20px;">${isPremium ? t.matchRequest.premiumTitle : t.requestExpiringReminder.title}</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              ${t.common.greeting} ${receiverName}!
            </p>
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              <strong>${senderName}</strong> ${isPremium ? t.matchRequest.premiumMessage : t.requestExpiringReminder.message}
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://flashmatch.org${isPremium ? '/premium-requests' : '/dashboard'}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                ${t.requestExpiringReminder.cta}
              </a>
            </div>
          `, t);

          // Send reminder email via Lovable Emails
          const sendResult = await sendAppEmail(supabase, {
            to: user.email,
            subject: emailSubject,
            html: emailHtml,
            label: isPremium ? "request-expiring-premium" : "request-expiring",
            idempotencyKey: `req-expiring-${request.id}`,
          });

          if (!sendResult.success && sendResult.reason !== "suppressed") {
            console.error(`Failed to send reminder for request ${request.id}:`, sendResult.reason);
          } else {
            console.log(`Reminder sent for request ${request.id} in language ${receiverLang}`);
            
            // Send push notification
            const pushUrl = isPremium ? "/premium-requests" : "/dashboard";
            
            try {
              await supabase.functions.invoke("send-push-notification", {
                body: {
                  userId: request.receiver_id,
                  title: isPremium ? `⏰ ${t.matchRequest.premiumTitle}` : `⏰ ${t.requestExpiringReminder.title}`,
                  body: `${senderName} - ${t.requestExpiringReminder.notification}`,
                  url: pushUrl,
                  tag: "request-expiring",
                  requireInteraction: true,
                },
                headers: {
                  'x-internal-secret': pushSecret,
                },
              });
            } catch (pushError) {
              console.error("Failed to send push notification:", pushError);
            }
          }
        } catch (error) {
          console.error(`Error processing request ${request.id}:`, error);
        }
      }
    }

    // 2. Check for accepted matches with appointment deadline expiring in ~1 hour
    const { data: expiringAppointments, error: appointmentsError } = await supabase
      .from("match_requests")
      .select(`
        id,
        appointment_deadline,
        sender_id,
        receiver_id,
        sender:profiles!match_requests_sender_id_fkey(full_name, preferred_language),
        receiver:profiles!match_requests_receiver_id_fkey(full_name, preferred_language)
      `)
      .eq("status", "accepted")
      .eq("chat_status", "active")
      .gte("appointment_deadline", now.toISOString())
      .lte("appointment_deadline", oneHourLater.toISOString());

    if (appointmentsError) {
      console.error("Error fetching expiring appointments:", appointmentsError);
    } else if (expiringAppointments && expiringAppointments.length > 0) {
      console.log(`Found ${expiringAppointments.length} expiring appointment deadlines`);

      for (const match of expiringAppointments) {
        try {
          // Check if appointment already exists
          const { data: existingAppointment } = await supabase
            .from("appointments")
            .select("id")
            .eq("match_request_id", match.id)
            .maybeSingle();

          if (existingAppointment) {
            console.log(`Appointment already exists for match ${match.id}, skipping reminder`);
            continue;
          }

          // Get both users' emails
          const { data: { user: senderUser } } = await supabase.auth.admin.getUserById(match.sender_id);
          const { data: { user: receiverUser } } = await supabase.auth.admin.getUserById(match.receiver_id);

          const senderLang = ((match.sender as any)?.preferred_language || 'it') as SupportedLanguage;
          const receiverLang = ((match.receiver as any)?.preferred_language || 'it') as SupportedLanguage;
          const senderT = translations[senderLang] || translations.it;
          const receiverT = translations[receiverLang] || translations.it;

          // Send email to sender
          if (senderUser?.email) {
            const emailHtml = getEmailWrapper(`
              <h2 style="color: #333; margin-bottom: 20px;">${senderT.appointmentDeadlineReminder.title}</h2>
              <p style="color: #555; font-size: 16px; line-height: 1.6;">${senderT.appointmentDeadlineReminder.message}</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://flashmatch.org/appointments" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  ${senderT.appointmentDeadlineReminder.cta}
                </a>
              </div>
            `, senderT);

            await sendAppEmail(supabase, {
              to: senderUser.email,
              subject: senderT.appointmentDeadlineReminder.subject,
              html: emailHtml,
              label: "appointment-deadline-reminder",
              idempotencyKey: `appt-deadline-${match.id}-s`,
            });
          }

          // Send email to receiver
          if (receiverUser?.email) {
            const emailHtml = getEmailWrapper(`
              <h2 style="color: #333; margin-bottom: 20px;">${receiverT.appointmentDeadlineReminder.title}</h2>
              <p style="color: #555; font-size: 16px; line-height: 1.6;">${receiverT.appointmentDeadlineReminder.message}</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://flashmatch.org/appointments" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                  ${receiverT.appointmentDeadlineReminder.cta}
                </a>
              </div>
            `, receiverT);

            await sendAppEmail(supabase, {
              to: receiverUser.email,
              subject: receiverT.appointmentDeadlineReminder.subject,
              html: emailHtml,
              label: "appointment-deadline-reminder",
              idempotencyKey: `appt-deadline-${match.id}-r`,
            });
          }

          console.log(`Appointment deadline reminder sent for match ${match.id}`);
          
          // Send push notification only to receiver (female user who needs to schedule)
          try {
            await supabase.functions.invoke("send-push-notification", {
              body: {
                userId: match.receiver_id,
                title: `📅 ${receiverT.appointmentDeadlineReminder.title}`,
                body: receiverT.appointmentDeadlineReminder.notification,
                url: "/appointments",
                tag: "appointment-deadline",
                requireInteraction: true,
              },
              headers: {
                'x-internal-secret': pushSecret,
              },
            });
          } catch (pushError) {
            console.error("Failed to send push notification:", pushError);
          }
        } catch (error) {
          console.error(`Error processing appointment deadline ${match.id}:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        expiringRequests: expiringRequests?.length || 0,
        expiringAppointments: expiringAppointments?.length || 0
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
    console.error("Error in send-reminder-emails function:", error);
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
