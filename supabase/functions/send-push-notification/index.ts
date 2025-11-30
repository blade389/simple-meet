import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationRequest {
  userId: string;
  title: string;
  body: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  matchRequestId?: string;
  appointmentId?: string;
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

    const { userId, title, body, url, tag, requireInteraction, matchRequestId, appointmentId }: PushNotificationRequest = await req.json();

    console.log(`Sending push notification to user ${userId}`);

    // Get user's push subscriptions
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

    // Prepare notification payload
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

    // Send to all subscriptions
    for (const subscription of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        // Use web-push library (imported dynamically)
        const webPush = await import("https://esm.sh/web-push@3.6.7");
        
        webPush.setVapidDetails(
          vapidSubject,
          vapidPublicKey,
          vapidPrivateKey
        );

        await webPush.sendNotification(pushSubscription, payload);
        
        console.log(`Push notification sent successfully to endpoint: ${subscription.endpoint.substring(0, 50)}...`);
        results.push({ success: true, endpoint: subscription.endpoint });
      } catch (error: any) {
        console.error(`Failed to send push notification:`, error);
        
        // If subscription is invalid or expired, mark for deletion
        if (error.statusCode === 404 || error.statusCode === 410) {
          failedSubscriptions.push(subscription.id);
        }
        
        results.push({ 
          success: false, 
          endpoint: subscription.endpoint,
          error: error.message 
        });
      }
    }

    // Remove invalid subscriptions
    if (failedSubscriptions.length > 0) {
      console.log(`Removing ${failedSubscriptions.length} invalid subscriptions`);
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("id", failedSubscriptions);
    }

    return new Response(
      JSON.stringify({ 
        message: "Push notifications sent",
        results,
        failedCount: failedSubscriptions.length
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-push-notification function:", error);
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
