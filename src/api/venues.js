// Public list of venues for the site.
import { json, needDb } from "../../lib/shared.js";

export async function onRequestGet({ env }) {
  const no = needDb(env); if (no) return no;
  const { results } = await env.DB.prepare(
    `SELECT v.id, v.name, v.postcode, v.lat, v.lng, v.district, v.country, v.courts, v.lta, v.url, v.email, v.tel, v.about, v.deal, v.price, v.price_note,
            v.tags, v.pick, v.flag, v.book_url, v.hours, v.facilities, v.claimed,
            CASE WHEN v.featured_until > strftime('%s','now')*1000 THEN 1 ELSE 0 END AS featured,
            r.avg AS rating, r.n AS reviews
     FROM venues v LEFT JOIN (SELECT venue_id, ROUND(AVG(rating),1) AS avg, COUNT(*) AS n FROM reviews WHERE status='approved' GROUP BY venue_id) r ON r.venue_id = v.id
     ORDER BY v.name`
  ).all();
  return new Response(JSON.stringify(results), {
    headers: { "content-type": "application/json", "cache-control": "public, max-age=60" },
  });
}
