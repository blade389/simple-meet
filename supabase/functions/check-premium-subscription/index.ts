import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-PREMIUM-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    
    // Decode JWT to get user ID without relying on session validity
    let userId: string;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
      if (!userId) throw new Error("No user ID in token");
    } catch (e) {
      throw new Error("Invalid token format");
    }
    
    logStep("User authenticated", { userId });

    // First check database for manual premium activations
    logStep("Checking database for premium status");
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("is_premium, subscription_status, subscription_end, stripe_product_id, email")
      .eq("id", userId)
      .single();

    if (!profileError && profile?.is_premium && profile?.subscription_status === "active") {
      logStep("Found active premium in database", { 
        subscriptionEnd: profile.subscription_end,
        productId: profile.stripe_product_id 
      });
      return new Response(
        JSON.stringify({
          isPremium: true,
          subscriptionEnd: profile.subscription_end,
          productId: profile.stripe_product_id,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Get email from auth.users since it's not in profiles
    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
    if (userError || !user?.email) {
      logStep("Could not get user email", { error: userError?.message });
      return new Response(JSON.stringify({ isPremium: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If not manually activated, check Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found and no manual activation");
      return new Response(JSON.stringify({ isPremium: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    
    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      const productId = subscription.items.data[0].price.product;
      
      logStep("Active subscription found", { subscriptionId: subscription.id });
      
      await supabaseClient.from('profiles').update({
        is_premium: true,
        subscription_status: 'active',
        subscription_end: subscriptionEnd,
        stripe_subscription_id: subscription.id,
        stripe_product_id: productId
      }).eq('id', userId);

      return new Response(JSON.stringify({
        isPremium: true,
        subscriptionEnd,
        productId
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      logStep("No active subscription");
      await supabaseClient.from('profiles').update({
        is_premium: false,
        subscription_status: null,
        subscription_end: null,
        stripe_subscription_id: null,
        stripe_product_id: null
      }).eq('id', userId);

      return new Response(JSON.stringify({ isPremium: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
