// Helpers shared by the API endpoints.
export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

export const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);

export const newId = () => crypto.randomUUID();

// Hash the visitor's IP so we can rate-limit without storing it.
export async function ipHash(request) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("aap:" + ip));
  return [...new Uint8Array(buf)].slice(0, 12).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function tooMany(db, table, ip, limit) {
  const since = Date.now() - 60 * 60 * 1000;
  const row = await db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE ip = ? AND created > ?`).bind(ip, since).first();
  return (row?.n || 0) >= limit;
}

export const needDb = env => env.DB ? null : json({ error: "The database isn't connected yet. See step 4 of the guide." }, 500);
