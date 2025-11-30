import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

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

// Helper to convert base64url to Uint8Array
function base64UrlDecode(base64url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/') + padding;
  const rawData = atob(base64);
  return Uint8Array.from(rawData, c => c.charCodeAt(0));
}

// Helper to convert Uint8Array to base64url
function base64UrlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Create VAPID JWT token
async function createVapidToken(audience: string, subject: string, privateKeyPem: string): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + (12 * 60 * 60),
    sub: subject
  };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import the private key
  const pemContents = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const keyData = base64UrlDecode(pemContents.replace(/\+/g, '-').replace(/\//g, '_'));
  
  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData.slice(0).buffer as ArrayBuffer,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureB64 = base64UrlEncode(new Uint8Array(signature));
  return `${unsignedToken}.${signatureB64}`;
}

// Encrypt payload using Web Push encryption
async function encryptPayload(
  payload: string,
  p256dh: string,
  auth: string
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; publicKey: Uint8Array }> {
  const payloadBuffer = new TextEncoder().encode(payload);
  const userPublicKey = base64UrlDecode(p256dh);
  const userAuth = base64UrlDecode(auth);

  // Generate local key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  const localPublicKeyRaw = await crypto.subtle.exportKey("raw", localKeyPair.publicKey);
  const localPublicKeyArray = new Uint8Array(localPublicKeyRaw);

  // Import user's public key
  const importedUserPublicKey = await crypto.subtle.importKey(
    "raw",
    userPublicKey.slice(0).buffer as ArrayBuffer,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );

  // Derive shared secret
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: "ECDH", public: importedUserPublicKey },
    localKeyPair.privateKey,
    256
  );

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive encryption key using HKDF
  const prk = await crypto.subtle.importKey(
    "raw",
    userAuth.slice(0).buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const authInfo = new TextEncoder().encode("Content-Encoding: auth\0");
  const prkData = await crypto.subtle.sign("HMAC", prk, new Uint8Array([
    ...new Uint8Array(sharedSecret),
    ...authInfo
  ]));

  // Create content encryption key
  const context = new Uint8Array([
    ...new TextEncoder().encode("P-256\0"),
    0, 65, ...userPublicKey,
    0, 65, ...localPublicKeyArray
  ]);

  const hkdfKey = await crypto.subtle.importKey(
    "raw",
    new Uint8Array(prkData),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const cekInfo = new Uint8Array([
    ...new TextEncoder().encode("Content-Encoding: aesgcm\0"),
    ...context
  ]);

  const cekData = await crypto.subtle.sign("HMAC", hkdfKey, new Uint8Array([
    ...salt,
    ...cekInfo,
    1
  ]));

  const cek = await crypto.subtle.importKey(
    "raw",
    new Uint8Array(cekData).slice(0, 16),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );

  // Create nonce
  const nonceInfo = new Uint8Array([
    ...new TextEncoder().encode("Content-Encoding: nonce\0"),
    ...context
  ]);

  const nonceData = await crypto.subtle.sign("HMAC", hkdfKey, new Uint8Array([
    ...salt,
    ...nonceInfo,
    1
  ]));

  const nonce = new Uint8Array(nonceData).slice(0, 12);

  // Add padding
  const paddedPayload = new Uint8Array(payloadBuffer.length + 2);
  paddedPayload.set([0, 0], 0);
  paddedPayload.set(payloadBuffer, 2);

  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    cek,
    paddedPayload
  );

  return {
    ciphertext: new Uint8Array(encrypted),
    salt,
    publicKey: localPublicKeyArray
  };
}

const handler = async (req: Request): Promise<Response> => {
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
        const endpointUrl = new URL(subscription.endpoint);
        const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;

        // Create VAPID token
        const vapidToken = await createVapidToken(audience, vapidSubject, vapidPrivateKey);

        // Encrypt payload
        const { ciphertext, salt, publicKey } = await encryptPayload(
          payload,
          subscription.p256dh,
          subscription.auth
        );

        // Send push notification
        const response = await fetch(subscription.endpoint, {
          method: "POST",
          headers: {
            "TTL": "3600",
            "Content-Encoding": "aesgcm",
            "Encryption": `salt=${base64UrlEncode(salt)}`,
            "Crypto-Key": `dh=${base64UrlEncode(publicKey)};p256ecdsa=${vapidPublicKey}`,
            "Authorization": `vapid t=${vapidToken}, k=${vapidPublicKey}`,
            "Content-Type": "application/octet-stream",
          },
          body: ciphertext.slice(0).buffer as ArrayBuffer,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Push failed (${response.status}): ${errorText}`);
          
          if (response.status === 404 || response.status === 410) {
            failedSubscriptions.push(subscription.id);
          }
          
          results.push({ 
            success: false, 
            endpoint: subscription.endpoint.substring(0, 50),
            error: `HTTP ${response.status}` 
          });
        } else {
          console.log(`Push sent to: ${subscription.endpoint.substring(0, 50)}...`);
          results.push({ success: true, endpoint: subscription.endpoint.substring(0, 50) });
        }
      } catch (error: any) {
        console.error(`Failed to send push:`, error);
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
};

serve(handler);
