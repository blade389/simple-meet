import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
// @deno-types="npm:@types/web-push"
import webpush from "npm:web-push";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

const RequestSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  url: z.string().optional(),
  tag: z.string().optional(),
  requireInteraction: z.boolean().optional(),
  matchRequestId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const internalSecret = req.headers.get('x-internal-secret');
    if (internalSecret !== Deno.env.get('PUSH_NOTIFICATION_SECRET')) {
      console.error('Unauthorized: Invalid internal secret');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const requestBody = await req.json();
    const validationResult = RequestSchema.safeParse(requestBody);

    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
      return new Response(
        JSON.stringify({ error: 'Invalid request data', details: validationResult.error.issues }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { userId, title, body, url, tag, requireInteraction, matchRequestId, appointmentId } = validationResult.data;
    console.log(`Sending push notification to user ${userId}`);

    const { data: subscriptions, error: subsError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", userId);

    if (subsError) {
      console.error("Error fetching subscriptions:", subsError);
      throw subsError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No push subscriptions found for user ${userId}`);
      return new Response(
        JSON.stringify({ message: "No subscriptions found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject = Deno.env.get("VAPID_SUBJECT");

    if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
      throw new Error("VAPID keys not configured");
    }

    webpush.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey
    );

    const payload = JSON.stringify({
      title,
      body,
      url: url || "/",
      tag: tag || "default",
      requireInteraction: requireInteraction || false,
      matchRequestId,
      appointmentId,
    });

    const results = [];
    const failedSubscriptions = [];

    for (const subscription of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        };

        await webpush.sendNotification(pushSubscription, payload);
        console.log(`Push sent to: ${subscription.endpoint.substring(0, 50)}...`);
        results.push({ success: true, endpoint: subscription.endpoint.substring(0, 50) });
      } catch (error: any) {
        console.error(`Failed to send push:`, error);

        if (error.statusCode === 404 || error.statusCode === 410) {
          failedSubscriptions.push(subscription.id);
        }

        results.push({
          success: false,
          endpoint: subscription.endpoint.substring(0, 50),
          error: error.message
        });
      }
    }

    if (failedSubscriptions.length > 0) {
      console.log(`Removing ${failedSubscriptions.length} invalid subscriptions`);
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("id", failedSubscriptions);
    }

    return new Response(
      JSON.stringify({
        message: "Push notifications processed",
        results,
        failedCount: failedSubscriptions.length
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-push-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
