import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify cron secret for security
    const cronSecret = req.headers.get('x-cron-secret');
    if (cronSecret !== Deno.env.get('CRON_SECRET')) {
      console.error('Unauthorized: Invalid cron secret');
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const pushSecret = Deno.env.get("PUSH_NOTIFICATION_SECRET")!;

    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

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
        receiver:profiles!match_requests_receiver_id_fkey(full_name)
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

          const senderName = (request.sender as any)?.full_name || "Un utente";
          const receiverName = (request.receiver as any)?.full_name || "Utente";
          const isPremium = (request as any).is_premium === true;

          // Different email content for premium vs normal requests
          const emailSubject = isPremium 
            ? "Promemoria: richiesta premium in scadenza!"
            : "Promemoria: richiesta di match in scadenza!";
          
          const emailHtml = isPremium
            ? `
              <h1>Ciao ${receiverName}!</h1>
              <p>Ti ricordiamo che hai una <strong>richiesta premium</strong> da <strong>${senderName}</strong> che scadrà tra circa 1 ora.</p>
              <p>Se non risponderai in tempo, la richiesta sarà automaticamente rifiutata.</p>
              <p>Accedi all'app per accettare o rifiutare la richiesta.</p>
            `
            : `
              <h1>Ciao ${receiverName}!</h1>
              <p>Ti ricordiamo che hai una richiesta di match da <strong>${senderName}</strong> che scadrà tra circa 1 ora.</p>
              <p>Se non risponderai in tempo, la richiesta sarà automaticamente rifiutata e ti verrà scalato 1 gettone.</p>
              <p>Accedi all'app per accettare o rifiutare la richiesta.</p>
            `;

          // Send reminder email
          const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
            },
            body: JSON.stringify({
              from: "Match App <noreply@scopami.online>",
              to: [user.email],
              subject: emailSubject,
              html: emailHtml,
            }),
          });

          if (!resendResponse.ok) {
            const error = await resendResponse.text();
            console.error(`Failed to send reminder for request ${request.id}:`, error);
          } else {
            console.log(`Reminder sent for request ${request.id}`);
            
            // Send push notification
            const pushUrl = isPremium ? "/premium-requests" : "/dashboard";
            const pushTitle = isPremium ? "⏰ Richiesta premium in scadenza" : "⏰ Richiesta in scadenza";
            
            try {
              await supabase.functions.invoke("send-push-notification", {
                body: {
                  userId: request.receiver_id,
                  title: pushTitle,
                  body: `La richiesta di ${senderName} scade tra 1 ora`,
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
        sender:profiles!match_requests_sender_id_fkey(full_name),
        receiver:profiles!match_requests_receiver_id_fkey(full_name)
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
            .single();

          if (existingAppointment) {
            console.log(`Appointment already exists for match ${match.id}, skipping reminder`);
            continue;
          }

          // Get both users' emails
          const { data: { user: senderUser } } = await supabase.auth.admin.getUserById(match.sender_id);
          const { data: { user: receiverUser } } = await supabase.auth.admin.getUserById(match.receiver_id);

          // Send reminder to both users
          const emails = [];
          if (senderUser?.email) emails.push(senderUser.email);
          if (receiverUser?.email) emails.push(receiverUser.email);

          if (emails.length > 0) {
            const resendResponse = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
              },
              body: JSON.stringify({
                from: "Match App <noreply@scopami.online>",
                to: emails,
                subject: "Promemoria: fissa l'appuntamento entro 1 ora!",
                html: `
                  <h1>Promemoria importante!</h1>
                  <p>Il tempo per fissare l'appuntamento sta per scadere (circa 1 ora rimanente).</p>
                  <p>Se non fisserete un appuntamento in tempo, la conversazione verrà chiusa e sottoposta a revisione.</p>
                  <p>Accedi all'app e fissa l'appuntamento ora!</p>
                `,
              }),
            });

            if (!resendResponse.ok) {
              const error = await resendResponse.text();
              console.error(`Failed to send appointment reminder for match ${match.id}:`, error);
            } else {
              console.log(`Appointment reminder sent for match ${match.id}`);
              
              // Send push notification only to receiver (female user who needs to schedule)
              try {
                await supabase.functions.invoke("send-push-notification", {
                  body: {
                    userId: match.receiver_id,
                    title: "📅 Fissa l'appuntamento",
                    body: "Il tempo sta per scadere! Hai ancora 1 ora per fissare l'appuntamento",
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
            }
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
