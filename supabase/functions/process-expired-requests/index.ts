import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const handler = async (_req: Request): Promise<Response> => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log("Processing expired match requests...");

    // Find all pending requests that have expired
    const { data: expiredRequests, error: fetchError } = await supabase
      .from("match_requests")
      .select("id, receiver_id")
      .eq("status", "pending")
      .lt("expires_at", new Date().toISOString());

    if (fetchError) {
      console.error("Error fetching expired requests:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredRequests?.length || 0} expired requests`);

    if (!expiredRequests || expiredRequests.length === 0) {
      return new Response(
        JSON.stringify({ message: "No expired requests found" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Process each expired request
    for (const request of expiredRequests) {
      // Update request status to rejected
      const { error: updateError } = await supabase
        .from("match_requests")
        .update({ status: "rejected" })
        .eq("id", request.id);

      if (updateError) {
        console.error(`Error updating request ${request.id}:`, updateError);
        continue;
      }

      // Deduct 1 token from the receiver
      const { data: currentTokens, error: tokenFetchError } = await supabase
        .from("tokens")
        .select("amount")
        .eq("user_id", request.receiver_id)
        .single();

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
        console.log(`Successfully processed expired request ${request.id}, deducted 1 token from user ${request.receiver_id}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${expiredRequests.length} expired requests`,
        processed: expiredRequests.length 
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in process-expired-requests function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
