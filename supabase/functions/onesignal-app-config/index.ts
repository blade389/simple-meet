import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Temporary admin helper: reads / updates the OneSignal app configuration
// (site URL) so web push works on the current domain.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const appId = Deno.env.get("ONESIGNAL_APP_ID");
  const restKey = Deno.env.get("ONESIGNAL_REST_API_KEY");
  const orgKey = Deno.env.get("ONESIGNAL_ORG_API_KEY") || restKey;

  if (!appId || !restKey) {
    return new Response(JSON.stringify({ error: "Missing OneSignal secrets" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const siteUrl = body.site_url as string | undefined;

    if (siteUrl) {
      const res = await fetch(`https://onesignal.com/api/v1/apps/${appId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${orgKey}`,
        },
        body: JSON.stringify({
          chrome_web_origin: siteUrl,
          site_name: "FlashMatch",
        }),
      });
      const json = await res.json().catch(() => ({}));
      return new Response(JSON.stringify({ status: res.status, result: json }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const res = await fetch(`https://onesignal.com/api/v1/apps/${appId}`, {
      headers: { Authorization: `Basic ${orgKey}` },
    });
    const json = await res.json().catch(() => ({}));
    return new Response(
      JSON.stringify({
        status: res.status,
        chrome_web_origin: (json as any)?.chrome_web_origin,
        site_name: (json as any)?.site_name,
        error: (json as any)?.errors,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
