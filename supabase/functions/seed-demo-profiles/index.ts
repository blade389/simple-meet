import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_drive/drive/v3";

const FEMALE_NAMES = [
  "Giulia","Sofia","Aurora","Alice","Ginevra","Emma","Giorgia","Greta","Martina","Chiara",
  "Sara","Anna","Beatrice","Vittoria","Noemi","Camilla","Elena","Francesca","Gaia","Ludovica",
  "Matilde","Bianca","Viola","Rebecca","Adele","Carlotta","Arianna","Eleonora","Marta","Nicole",
];

const CITIES = [
  { name: "Roma",     lat: 41.9028, lon: 12.4964 },
  { name: "Milano",   lat: 45.4642, lon: 9.1900  },
  { name: "Napoli",   lat: 40.8518, lon: 14.2681 },
  { name: "Torino",   lat: 45.0703, lon: 7.6869  },
  { name: "Firenze",  lat: 43.7696, lon: 11.2558 },
  { name: "Bologna",  lat: 44.4949, lon: 11.3426 },
  { name: "Venezia",  lat: 45.4408, lon: 12.3155 },
  { name: "Palermo",  lat: 38.1157, lon: 13.3615 },
  { name: "Bari",     lat: 41.1171, lon: 16.8719 },
  { name: "Genova",   lat: 44.4056, lon: 8.9463  },
  { name: "Verona",   lat: 45.4384, lon: 10.9916 },
  { name: "Padova",   lat: 45.4064, lon: 11.8768 },
  { name: "Catania",  lat: 37.5079, lon: 15.0830 },
  { name: "Cagliari", lat: 39.2238, lon: 9.1217  },
  { name: "Trieste",  lat: 45.6495, lon: 13.7768 },
];

const BIOS = [
  "Amo viaggiare, leggere e cenare in posti nuovi 🌍",
  "Sportiva, sorridente e curiosa. Cerco persone genuine.",
  "Caffè al mattino, vino la sera. Niente complicazioni.",
  "Mi piacciono le serate tranquille e le risate sincere.",
  "Studentessa universitaria, amante dell'arte e della musica.",
  "Cane, palestra, montagna. Le mie tre passioni.",
  "Cerco qualcuno con cui condividere bei momenti.",
  "Estroversa ma selettiva. Apparenze zero, sostanza sì.",
  "Foodie e cinefila. Sushi e horror il mio mix preferito.",
  "Yoga, mare e libri. Vivo la vita con leggerezza.",
];

function rnd<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rndAge() { return 20 + Math.floor(Math.random() * 21); }
function rndOffset() { return (Math.random() - 0.5) * 0.05; }
function birthDateFor(age: number) {
  const y = new Date().getFullYear() - age - 1;
  const m = 1 + Math.floor(Math.random() * 12);
  const d = 1 + Math.floor(Math.random() * 28);
  return `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}
function uuid() { return crypto.randomUUID(); }
function demoCode(i: number) {
  return "DEMO" + Date.now().toString(36).toUpperCase().slice(-4) + String(i).padStart(3,"0");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GD = Deno.env.get("GOOGLE_DRIVE_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (!LOVABLE_API_KEY || !GD) return new Response(JSON.stringify({ error: "missing connector keys" }), { status: 500, headers: corsHeaders });

  const url = new URL(req.url);
  const folderName = url.searchParams.get("folder") ?? "a";
  const limit = parseInt(url.searchParams.get("limit") ?? "100", 10);

  const gdHeaders = { Authorization: `Bearer ${LOVABLE_API_KEY}`, "X-Connection-Api-Key": GD };
  const admin = createClient(SUPABASE_URL, SERVICE);

  const fq = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const fr = await fetch(`${GATEWAY}/files?q=${encodeURIComponent(fq)}&fields=files(id,name)`, { headers: gdHeaders });
  const fj = await fr.json();
  if (!fr.ok || !fj.files?.length) return new Response(JSON.stringify({ error: "folder not found", fj }), { status: 404, headers: corsHeaders });
  const folderId = fj.files[0].id;

  const lq = `'${folderId}' in parents and trashed=false and mimeType contains 'image/'`;
  const lr = await fetch(`${GATEWAY}/files?q=${encodeURIComponent(lq)}&fields=files(id,name,mimeType)&pageSize=200`, { headers: gdHeaders });
  const lj = await lr.json();
  const files = (lj.files ?? []).slice(0, limit);

  const created: any[] = [];
  const errors: any[] = [];

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    try {
      const dr = await fetch(`${GATEWAY}/files/${f.id}?alt=media`, { headers: gdHeaders });
      if (!dr.ok) throw new Error(`drive download ${dr.status}: ${await dr.text()}`);
      const bytes = new Uint8Array(await dr.arrayBuffer());
      const ext = f.mimeType === "image/png" ? "png" : f.mimeType === "image/jpeg" ? "jpg" : "img";
      const userId = uuid();
      const path = `${userId}/profile-${Date.now()}.${ext}`;

      const up = await admin.storage.from("profile-photos").upload(path, bytes, { contentType: f.mimeType, upsert: true });
      if (up.error) throw up.error;
      const photoUrl = admin.storage.from("profile-photos").getPublicUrl(path).data.publicUrl;

      const city = rnd(CITIES);
      const age = rndAge();
      const name = rnd(FEMALE_NAMES);
      const bio = rnd(BIOS);

      const { error: pErr } = await admin.from("profiles").insert({
        id: userId,
        full_name: name,
        gender: "female",
        birth_date: birthDateFor(age),
        bio,
        location_city: city.name,
        location_lat: city.lat + rndOffset(),
        location_lon: city.lon + rndOffset(),
        profile_photo_url: photoUrl,
        photo_verification_status: "verified",
        is_verified: "verified",
        is_blocked: false,
        is_paused: false,
        preferred_language: "it",
        referral_code: demoCode(i),
      });
      if (pErr) throw pErr;

      const { error: vErr } = await admin.from("profile_photo_verifications").insert({
        user_id: userId,
        photo_url: photoUrl,
        status: "verified",
        is_primary: true,
        reviewed_at: new Date().toISOString(),
      });
      if (vErr) throw vErr;

      created.push({ userId, name, age, city: city.name, photo: f.name });
    } catch (e: any) {
      errors.push({ file: f.name, error: e?.message ?? JSON.stringify(e) });
    }
  }

  return new Response(JSON.stringify({ folderId, totalFiles: files.length, created: created.length, errors, sample: created.slice(0, 5) }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
