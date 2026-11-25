// "Tell me when a new court opens near me" sign-ups, stored in D1 (table `alerts`) with the consent text and time.
// POST signs up (and sends a welcome email once BREVO_KEY is set). GET ?unsub=<token> unsubscribes.
import { json, clean, newId, ipHash, tooMany, needDb } from "../../lib/shared.js";
import { sendEmail, welcomeEmail } from "../../lib/brevo.js";
import { background } from "../../lib/mail.js";

export const CONSENT = "Email me when a new padel court opens near me, plus occasional local padel news. I can unsubscribe at any time.";
export async function ensureAlerts(db) {
  await db.prepare("CREATE TABLE IF NOT EXISTS alerts (id TEXT PRIMARY KEY, email TEXT NOT NULL, place TEXT, lat REAL, lng REAL, radius INTEGER DEFAULT 15, consent TEXT, status TEXT DEFAULT 'active', ip TEXT, created INTEGER, UNIQUE(email, place))").run();
  try { await db.prepare("ALTER TABLE alerts ADD COLUMN token TEXT").run(); } catch {}
  try { await db.prepare("ALTER TABLE alerts ADD COLUMN welcomed INTEGER DEFAULT 0").run(); } catch {}
}
const unsubLink = (origin, token) => `${origin}/api/alerts?unsub=${encodeURIComponent(token)}`;

export async function onRequestPost({ request, env, ctx }) {
  const no = needDb(env); if (no) return no;
  const unsub = new URL(request.url).searchParams.get("unsub");
  if (unsub) { if (/^[a-f0-9]{32}$/.test(unsub)) { await ensureAlerts(env.DB); await env.DB.prepare("UPDATE alerts SET status = 'unsubscribed' WHERE token = ?").bind(unsub).run(); } return json({ ok: true }); }
  let b; try { b = await request.json(); } catch { return json({ error: "That didn't look right. Try again." }, 400); }
  if (b.website) return json({ ok: true }); // honeypot
  const email = clean(b.email, 120).toLowerCase(), place = clean(b.place, 80) || "you";
  const lat = Number(b.lat), lng = Number(b.lng);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: "That email address doesn't look right." }, 400);
  if (b.consent !== true) return json({ error: "Tick the box to say it's OK to email you." }, 400);
  if (!(lat > 49 && lat < 61 && lng > -9 && lng < 3)) return json({ error: "Set your location first, using your postcode or town." }, 400);
  await ensureAlerts(env.DB);
  const ip = await ipHash(request);
  if (await tooMany(env.DB, "alerts", ip, 5)) return json({ error: "Too many sign-ups from here. Try again later." }, 429);
  const token = crypto.randomUUID().replace(/-/g, "");
  await env.DB.prepare("INSERT INTO alerts (id, email, place, lat, lng, consent, ip, created, token) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(email, place) DO UPDATE SET status = 'active', lat = excluded.lat, lng = excluded.lng")
    .bind(newId(), email, place, Math.round(lat * 1000) / 1000, Math.round(lng * 1000) / 1000, CONSENT, ip, Date.now(), token).run();
  const row = await env.DB.prepare("SELECT token, welcomed FROM alerts WHERE email = ? AND place = ?").bind(email, place).first();
  if (env.BREVO_KEY && row && !row.welcomed) {
    const t = row.token || token;
    if (!row.token) await env.DB.prepare("UPDATE alerts SET token = ? WHERE email = ? AND place = ?").bind(t, email, place).run();
    const origin = new URL(request.url).origin, u = unsubLink(origin, t), m = welcomeEmail(place, u);
    await background(ctx, sendEmail(env, { to: email, ...m, unsubUrl: u }).then(() => env.DB.prepare("UPDATE alerts SET welcomed = 1 WHERE email = ? AND place = ?").bind(email, place).run()));
  }
  return json({ ok: true }, 201);
}

export async function onRequestGet({ request, env }) {
  const t = new URL(request.url).searchParams.get("unsub") || "";
  const page = msg => new Response(`<!DOCTYPE html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>All Access Padel</title></head><body style="font-family:Arial,sans-serif;background:#f3f1ea;color:#0d1b3d;padding:40px 20px"><div style="max-width:520px;margin:0 auto;background:#fff;border:2px solid #0d1b3d;border-radius:6px;padding:20px"><h1 style="font-size:24px;margin:0 0 10px">${msg}</h1><p><a href="/">Back to All Access Padel</a></p></div></body></html>`, { headers: { "content-type": "text/html; charset=utf-8" } });
  if (!env.DB || !/^[a-f0-9]{32}$/.test(t)) return page("That unsubscribe link doesn't look right.");
  await ensureAlerts(env.DB);
  const r = await env.DB.prepare("UPDATE alerts SET status = 'unsubscribed' WHERE token = ?").bind(t).run();
  return page(r.meta && r.meta.changes ? "You're unsubscribed. We won't email you again." : "You're already unsubscribed.");
}
