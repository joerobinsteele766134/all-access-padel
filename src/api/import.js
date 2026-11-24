// One-off bulk import of venues. Needs a token that exists in the import_tokens table.
// Tokens are added and removed directly in the database, never stored in this repo.
import { clean } from "../../lib/shared.js";

const cors = { "access-control-allow-origin": "*", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type" };
const out = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json", ...cors } });

export async function onRequestOptions() { return new Response(null, { headers: cors }); }

export async function onRequestPost({ request, env }) {
  if (!env.DB) return out({ error: "no db" }, 500);
  let b; try { b = await request.json(); } catch { return out({ error: "bad json" }, 400); }
  const tok = clean(b.token, 100);
  if (tok.length < 24) return out({ error: "unauthorised" }, 401);
  const ok = await env.DB.prepare("SELECT token FROM import_tokens WHERE token = ?").bind(tok).first();
  if (!ok) return out({ error: "unauthorised" }, 401);
  const rows = Array.isArray(b.rows) ? b.rows.slice(0, 200) : [];
  const now = Date.now();
  const stmts = [];
  for (const r of rows) {
    const lat = +r.lat, lng = +r.lng;
    if (!r.name || !isFinite(lat) || !isFinite(lng) || lat < 49 || lat > 61 || lng < -9 || lng > 2.5) continue;
    const id = clean(r.id, 80);
    stmts.push(env.DB.prepare(
      `INSERT INTO venues (id, name, postcode, lat, lng, district, country, courts, lta, url, email, source, updated)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT(id) DO UPDATE SET name=excluded.name, postcode=excluded.postcode, lat=excluded.lat, lng=excluded.lng,
         district=excluded.district, country=excluded.country, courts=excluded.courts, lta=excluded.lta,
         url=COALESCE(NULLIF(venues.url,''), excluded.url), email=excluded.email, source=excluded.source, updated=excluded.updated`
    ).bind(id, clean(r.name, 120), clean(r.postcode, 10), lat, lng, clean(r.district, 60), clean(r.country, 20),
      clean(r.courts, 60), r.lta ? 1 : 0, clean(r.url, 200), clean(r.email, 120), "lta", now));
  }
  if (stmts.length) await env.DB.batch(stmts);
  return out({ imported: stmts.length });
}
