import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
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

    console.log("Processing expired match requests...");

    // Find all pending non-premium requests that have expired (donna→uomo)
    const { data: expiredRequests, error: fetchError } = await supabase
      .from("match_requests")
      .select("id, receiver_id, is_premium")
      .eq("status", "pending")
      .eq("is_premium", false)
      .lt("expires_at", new Date().toISOString());

    if (fetchError) {
      console.error("Error fetching expired requests:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredRequests?.length || 0} expired requests`);

    if (!expiredRequests || expiredRequests.length === 0) {
      return new Response(
        JSON.stringify({ message: "No expired requests found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Process each expired non-premium request (donna→uomo)
    for (const request of expiredRequests) {
      // Update request status to rejected (trigger will NOT refund premium tokens)
      const { error: updateError } = await supabase
        .from("match_requests")
        .update({ status: "rejected" })
        .eq("id", request.id);

      if (updateError) {
        console.error(`Error updating request ${request.id}:`, updateError);
        continue;
      }

      // Deduct 1 token from the male receiver (since this is donna→uomo)
      const { data: currentTokens, error: tokenFetchError } = await supabase
        .from("tokens")
        .select("amount")
        .eq("user_id", request.receiver_id)
        .maybeSingle();

      if (tokenFetchError) {
        console.error(`Error fetching tokens for user ${request.receiver_id}:`, tokenFetchError);
        continue;
      }

      const newAmount = Math.max(0, (currentTokens?.amount || 0) - 1);

      const { error: tokenUpdateError } = await supabase
        .from("tokens")
        .update({ amount: newAmount, last_updated: new Date().toISOString() })
        .eq("user_id", request.receiver_id);

      if (tokenUpdateError) {
        console.error(`Error updating tokens for user ${request.receiver_id}:`, tokenUpdateError);
      } else {
        console.log(`Successfully processed expired non-premium request ${request.id}, deducted 1 token from male user ${request.receiver_id}`);
      }
    }

    // Process expired premium requests (uomo→donna) - just reject, trigger will refund
    const { data: expiredPremiumRequests } = await supabase
      .from("match_requests")
      .select("id")
      .eq("status", "pending")
      .eq("is_premium", true)
      .lt("expires_at", new Date().toISOString());

    for (const request of expiredPremiumRequests || []) {
      await supabase
        .from("match_requests")
        .update({ status: "rejected" })
        .eq("id", request.id);
      
      console.log(`Rejected expired premium request ${request.id}, trigger will refund token`);
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${expiredRequests.length} expired requests`,
        processed: expiredRequests.length 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in process-expired-requests function:", error);
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
