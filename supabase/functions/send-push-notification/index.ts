import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

interface PushNotificationRequest {
  userId: string;
  title: string;
  body: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify internal secret for security (only other edge functions can call this)
    const internalSecret = req.headers.get('x-internal-secret');
    if (internalSecret !== Deno.env.get('PUSH_NOTIFICATION_SECRET')) {
      console.error('Unauthorized: Invalid internal secret');
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const { userId, title, body, url, tag, requireInteraction }: PushNotificationRequest = await req.json();

    if (!userId || !title || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: userId, title, body" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const oneSignalAppId = Deno.env.get("ONESIGNAL_APP_ID");
    const oneSignalApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");

    if (!oneSignalAppId || !oneSignalApiKey) {
      console.error("OneSignal credentials not configured");
      return new Response(
        JSON.stringify({ error: "Push notification service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending push notification to user ${userId}: ${title}`);

    const pushResponse = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${oneSignalApiKey}`,
      },
      body: JSON.stringify({
        app_id: oneSignalAppId,
        include_external_user_ids: [userId],
        headings: { en: title },
        contents: { en: body },
        url: url || undefined,
        web_push_topic: tag || undefined,
        priority: requireInteraction ? 10 : 5,
        ttl: 86400, // 24 hours
      }),
    });

    const pushResult = await pushResponse.json();

    if (!pushResponse.ok) {
      console.error("OneSignal error:", pushResult);
      return new Response(
        JSON.stringify({ error: "Failed to send push notification", details: pushResult }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Push notification sent successfully:", pushResult);

    return new Response(
      JSON.stringify({ success: true, result: pushResult }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-push-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
