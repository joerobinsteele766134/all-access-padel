// Public list of venues for the site.
import { json, needDb } from "../../lib/shared.js";

export async function onRequestGet({ env }) {
  const no = needDb(env); if (no) return no;
  const { results } = await env.DB.prepare(
    "SELECT id, name, postcode, lat, lng, district, country, courts, lta, url, email, tel, about, deal, price, price_note, price_source, tags, pick, flag FROM venues ORDER BY name"
  ).all();
  return new Response(JSON.stringify(results), {
    headers: { "content-type": "application/json", "cache-control": "public, max-age=300" },
  });
}
