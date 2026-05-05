import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY = "https://connector-gateway.lovable.dev/google_drive/drive/v3";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const GD = Deno.env.get("GOOGLE_DRIVE_API_KEY");
  if (!LOVABLE_API_KEY || !GD) {
    return new Response(JSON.stringify({ error: "missing keys" }), { status: 500, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const folderName = url.searchParams.get("folder") ?? "a";
  const folderId = url.searchParams.get("folderId");
  const download = url.searchParams.get("download");

  const headers = {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "X-Connection-Api-Key": GD,
  };

  // Download mode: fetch raw bytes and return as base64
  if (download) {
    const r = await fetch(`${GATEWAY}/files/${download}?alt=media`, { headers });
    if (!r.ok) {
      return new Response(JSON.stringify({ error: await r.text() }), { status: r.status, headers: corsHeaders });
    }
    const buf = new Uint8Array(await r.arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
    const b64 = btoa(bin);
    return new Response(JSON.stringify({ data: b64, contentType: r.headers.get("content-type") }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let fid = folderId;
  if (!fid) {
    const q = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const r = await fetch(`${GATEWAY}/files?q=${encodeURIComponent(q)}&fields=files(id,name,parents)`, { headers });
    const j = await r.json();
    if (!r.ok) return new Response(JSON.stringify(j), { status: r.status, headers: corsHeaders });
    if (!j.files?.length) return new Response(JSON.stringify({ error: "folder not found", folderName }), { status: 404, headers: corsHeaders });
    fid = j.files[0].id;
  }

  const q2 = `'${fid}' in parents and trashed=false and mimeType contains 'image/'`;
  const r2 = await fetch(`${GATEWAY}/files?q=${encodeURIComponent(q2)}&fields=files(id,name,mimeType,size)&pageSize=200`, { headers });
  const j2 = await r2.json();
  return new Response(JSON.stringify({ folderId: fid, ...j2 }), {
    status: r2.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
