// "Tell me when a new court opens near me" sign-ups. Stored in D1 (table `alerts`) with the consent text and time.
// Emails are sent later through a mailing provider; until then this only collects sign-ups.
import { json, clean, newId, ipHash, tooMany, needDb } from "../../lib/shared.js";

export const CONSENT = "Email me when a new padel court opens near me, plus occasional local padel news. I can unsubscribe at any time.";
export async function onRequestPost({ request, env }) {
  const no = needDb(env); if (no) return no;
  let b; try { b = await request.json(); } catch { return json({ error: "That didn't look right. Try again." }, 400); }
  if (b.website) return json({ ok: true }); // honeypot
  const email = clean(b.email, 120).toLowerCase(), place = clean(b.place, 80);
  const lat = Number(b.lat), lng = Number(b.lng);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "That email address doesn't look right." }, 400);
  if (b.consent !== true) return json({ error: "Tick the box to say it's OK to email you." }, 400);
  if (!(lat > 49 && lat < 61 && lng > -9 && lng < 3)) return json({ error: "Set your location first, using your postcode or town." }, 400);
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS alerts (id TEXT PRIMARY KEY, email TEXT NOT NULL, place TEXT, lat REAL, lng REAL, radius INTEGER DEFAULT 15, consent TEXT, status TEXT DEFAULT 'active', ip TEXT, created INTEGER, UNIQUE(email, place))").run();
  const ip = await ipHash(request);
  if (await tooMany(env.DB, "alerts", ip, 5)) return json({ error: "Too many sign-ups from here. Try again later." }, 429);
  await env.DB.prepare("INSERT INTO alerts (id, email, place, lat, lng, consent, ip, created) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(email, place) DO UPDATE SET status = 'active', lat = excluded.lat, lng = excluded.lng")
    .bind(newId(), email, place, Math.round(lat * 1000) / 1000, Math.round(lng * 1000) / 1000, CONSENT, ip, Date.now()).run();
  return json({ ok: true }, 201);
}
