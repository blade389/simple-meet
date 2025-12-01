import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import webpush from "https://esm.sh/web-push@3.6.7";

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
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { userId, title, body, url, tag, requireInteraction, matchRequestId, appointmentId } = validationResult.data;

    // Authorization check
    const internalSecret = req.headers.get('x-internal-secret');
    const authHeader = req.headers.get('Authorization');
    let isAuthorized = false;
    let authErrorDetail = '';

    console.log('Auth check:', { 
      hasInternalSecret: !!internalSecret, 
      hasAuthHeader: !!authHeader,
      targetUserId: userId 
    });

    if (internalSecret && internalSecret === Deno.env.get('PUSH_NOTIFICATION_SECRET')) {
      isAuthorized = true;
      console.log('Authorized via internal secret');
    } else if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error) {
        console.error('Auth error:', error);
        authErrorDetail = `Auth error: ${error.message}`;
      } else if (!user) {
        console.error('Auth failed: No user found from token');
        authErrorDetail = 'No user found from token';
      } else if (user.id !== userId) {
        console.error('Auth failed: User ID mismatch', { tokenUserId: user.id, targetUserId: userId });
        authErrorDetail = `User ID mismatch: token=${user.id}, target=${userId}`;
      } else {
        isAuthorized = true;
        console.log('Authorized via user token');
      }
    } else {
      console.error('Auth failed: No credentials provided');
      authErrorDetail = 'No credentials provided';
    }

    if (!isAuthorized) {
      console.error('Unauthorized request');
      return new Response(
        JSON.stringify({ error: 'Unauthorized', detail: authErrorDetail }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    console.log(`Sending push notification to user ${userId}`);

    const { data: subscriptions, error: subsError } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", userId);

    if (subsError) {
      console.error("Error fetching subscriptions:", subsError);
      return new Response(
        JSON.stringify({ error: 'Database error', details: subsError }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
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
      return new Response(
        JSON.stringify({ error: 'Configuration error', details: 'VAPID keys not configured' }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
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
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
