// Daily job (Cloudflare cron): email subscribers about venues added since the last run, within their radius.
// Does nothing until the BREVO_KEY secret is set. Also gives any subscriber without a token one, and welcomes
// people who signed up before email sending was switched on.
import { sendEmail, newCourtsEmail, welcomeEmail } from "../lib/brevo.js";
import { ensureAlerts } from "./api/alerts.js";
const ORIGIN = "https://allaccesspadel.co.uk";
const miles = (a, b, c, d) => { const R = 3959, r = x => x * Math.PI / 180, dl = r(c - a), dg = r(d - b), h = Math.sin(dl / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dg / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };

export async function runAlerts(env) {
  if (!env.DB) return { skipped: "no DB" };
  await ensureAlerts(env.DB);
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS settings (k TEXT PRIMARY KEY, v TEXT)").run();
  try { await env.DB.prepare("ALTER TABLE venues ADD COLUMN added INTEGER").run(); } catch {}
  await env.DB.prepare("CREATE TRIGGER IF NOT EXISTS venues_added AFTER INSERT ON venues WHEN NEW.added IS NULL BEGIN UPDATE venues SET added = CAST(strftime('%s','now') AS INTEGER) * 1000 WHERE id = NEW.id; END").run();
  const subs = (await env.DB.prepare("SELECT id, email, place, lat, lng, radius, token, welcomed FROM alerts WHERE status = 'active'").all()).results;
  for (const s of subs.filter(s => !s.token)) { s.token = crypto.randomUUID().replace(/-/g, ""); await env.DB.prepare("UPDATE alerts SET token = ? WHERE id = ?").bind(s.token, s.id).run(); }
  if (!env.BREVO_KEY) return { skipped: "no BREVO_KEY", subscribers: subs.length };

  const last = Number((await env.DB.prepare("SELECT v FROM settings WHERE k = 'alerts_last_run'").first())?.v || Date.now());
  const now = Date.now();
  const fresh = (await env.DB.prepare("SELECT id, name, postcode, lat, lng, courts, about FROM venues WHERE added > ? AND added <= ?").bind(last, now).all()).results;
  let sent = 0, welcomed = 0, failed = 0;
  for (const s of subs) {
    const u = `${ORIGIN}/api/alerts?unsub=${s.token}`;
    try {
      if (!s.welcomed) { await sendEmail(env, { to: s.email, ...welcomeEmail(s.place, u), unsubUrl: u }); await env.DB.prepare("UPDATE alerts SET welcomed = 1 WHERE id = ?").bind(s.id).run(); welcomed++; }
      const near = fresh.map(v => ({ ...v, d: miles(s.lat, s.lng, v.lat, v.lng) })).filter(v => v.d <= (s.radius || 15)).sort((a, b) => a.d - b.d).slice(0, 10);
      if (near.length) { await sendEmail(env, { to: s.email, ...newCourtsEmail(s.place, near, u), unsubUrl: u }); sent++; }
    } catch (e) { failed++; console.error("alert email failed", s.id, e.message); }
  }
  await env.DB.prepare("INSERT INTO settings (k, v) VALUES ('alerts_last_run', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").bind(String(now)).run();
  return { newVenues: fresh.length, subscribers: subs.length, sent, welcomed, failed };
}
