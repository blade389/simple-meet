import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (request) => {
  const signature = request.headers.get("Stripe-Signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  const body = await request.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }

  console.log("Received event:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const tokensToAdd = parseInt(session.metadata?.tokens || "0");

    if (!userId || tokensToAdd <= 0) {
      console.error("Invalid metadata:", session.metadata);
      return new Response("Invalid metadata", { status: 400 });
    }

    console.log(`Adding ${tokensToAdd} tokens to user ${userId}`);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    try {
      const { data: existingTokens, error: fetchError } = await supabaseClient
        .from("tokens")
        .select("amount")
        .eq("user_id", userId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (existingTokens) {
        const { error: updateError } = await supabaseClient
          .from("tokens")
          .update({ 
            amount: existingTokens.amount + tokensToAdd,
            last_updated: new Date().toISOString()
          })
          .eq("user_id", userId);

        if (updateError) throw updateError;
        console.log(`Updated tokens for user ${userId}: ${existingTokens.amount} + ${tokensToAdd}`);
      } else {
        const { error: insertError } = await supabaseClient
          .from("tokens")
          .insert({ 
            user_id: userId, 
            amount: tokensToAdd,
            last_updated: new Date().toISOString()
          });

        if (insertError) throw insertError;
        console.log(`Created tokens record for user ${userId}: ${tokensToAdd}`);
      }
    } catch (error: any) {
      console.error("Error updating tokens:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
