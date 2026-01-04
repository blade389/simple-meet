import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { getTranslation } from "../_shared/translations.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ChatNotificationRequest {
  matchRequestId: string;
  senderId: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader || '' } } }
    );
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (!user || authError) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { matchRequestId, senderId, message }: ChatNotificationRequest = await req.json();

    if (!matchRequestId || !senderId || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get match request with profiles
    const { data: matchRequest, error: matchError } = await supabase
      .from("match_requests")
      .select(`
        sender_id,
        receiver_id,
        sender:profiles!fk_match_requests_sender(full_name, preferred_language),
        receiver:profiles!fk_match_requests_receiver(full_name, preferred_language)
      `)
      .eq("id", matchRequestId)
      .single();

    if (matchError || !matchRequest) {
      return new Response(
        JSON.stringify({ error: "Match request not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Determine recipient
    const recipientId = senderId === matchRequest.sender_id 
      ? matchRequest.receiver_id 
      : matchRequest.sender_id;

    const senderName = senderId === matchRequest.sender_id
      ? (matchRequest.sender as any)?.full_name || "Utente"
      : (matchRequest.receiver as any)?.full_name || "Utente";

    const recipientLang = senderId === matchRequest.sender_id
      ? (matchRequest.receiver as any)?.preferred_language
      : (matchRequest.sender as any)?.preferred_language;

    const t = getTranslation(recipientLang);

    const truncatedMessage = message.length > 50 
      ? message.substring(0, 50) + "..." 
      : message;

    const oneSignalAppId = Deno.env.get("ONESIGNAL_APP_ID");
    const oneSignalApiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");

    if (oneSignalAppId && oneSignalApiKey) {
      await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${oneSignalApiKey}`,
        },
        body: JSON.stringify({
          app_id: oneSignalAppId,
          include_external_user_ids: [recipientId],
          headings: { en: `💬 ${senderName}` },
          contents: { en: truncatedMessage },
          url: "/appointments",
          web_push_topic: `chat-${matchRequestId}`,
          ttl: 3600,
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-chat-message-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
