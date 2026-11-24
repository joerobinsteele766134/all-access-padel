// Club self-service: a club with an approved claim token can propose edits to its listing.
// Edits are saved as pending and only go live when Joe approves them.
import { json, clean, newId, needDb } from "../../lib/shared.js";
import { mailJoe, background, ADMIN_URL } from "../../lib/mail.js";

export const EDITABLE = ["about", "deal", "price", "price_note", "hours", "facilities", "url", "book_url", "tel", "email", "courts"];
export const FACILITIES = ["parking", "changing", "cafe", "bar", "racket_hire", "floodlit", "open_late", "accessible", "shop", "coaching"];
const httpsOnly = u => { u = clean(u, 300); return !u || /^https:\/\/[^\s]+\.[^\s]+$/i.test(u) ? u : null; };

async function claimFor(request, env) {
  const token = clean(request.headers.get("x-club-token"), 100);
  if (token.length < 30) return null;
  return env.DB.prepare("SELECT id, venue_id, name FROM claims WHERE token = ? AND status = 'approved'").bind(token).first();
}

export async function onRequestGet({ request, env }) {
  const no = needDb(env); if (no) return no;
  const c = await claimFor(request, env);
  if (!c) return json({ error: "This link isn't valid. Ask All Access Padel for a new one." }, 401);
  const v = await env.DB.prepare(`SELECT id, name, postcode, district, ${EDITABLE.join(", ")} FROM venues WHERE id = ?`).bind(c.venue_id).first();
  const pending = await env.DB.prepare("SELECT COUNT(*) AS n FROM venue_edits WHERE venue_id = ? AND status = 'pending'").bind(c.venue_id).first();
  return json({ venue: v, contact: c.name, pending: pending?.n || 0, facilities: FACILITIES });
}

export async function onRequestPost({ request, env, ctx }) {
  const no = needDb(env); if (no) return no;
  const c = await claimFor(request, env);
  if (!c) return json({ error: "This link isn't valid. Ask All Access Padel for a new one." }, 401);
  let b; try { b = await request.json(); } catch { return json({ error: "That didn't look right. Try again." }, 400); }
  const d = {
    about: clean(b.about, 600), deal: clean(b.deal, 300), price: clean(b.price, 80), price_note: clean(b.price_note, 200),
    hours: clean(b.hours, 120), courts: clean(b.courts, 60), tel: clean(b.tel, 40), email: clean(b.email, 120),
    facilities: (Array.isArray(b.facilities) ? b.facilities : []).filter(f => FACILITIES.includes(f)).join(","),
    url: httpsOnly(b.url), book_url: httpsOnly(b.book_url),
  };
  if (d.url === null || d.book_url === null) return json({ error: "Website and booking links must start with https://" }, 400);
  const v = await env.DB.prepare(`SELECT name, ${EDITABLE.join(", ")} FROM venues WHERE id = ?`).bind(c.venue_id).first();
  const changes = {};
  for (const k of EDITABLE) if ((d[k] || "") !== (v[k] || "")) changes[k] = d[k];
  if (!Object.keys(changes).length) return json({ error: "Nothing has changed." }, 400);
  const id = newId();
  await env.DB.prepare("INSERT INTO venue_edits (id, venue_id, claim_id, data, status, created) VALUES (?,?,?,?, 'pending', ?)")
    .bind(id, c.venue_id, c.id, JSON.stringify(changes), Date.now()).run();
  await background(ctx, mailJoe(env, `Listing update: ${v.name}`, [
    `${c.name} has proposed changes to ${v.name}. They're not live until you approve them.`, "",
    ...Object.entries(changes).map(([k, val]) => `${k}:\r\n  was: ${v[k] || "(empty)"}\r\n  now: ${val || "(empty)"}`), "",
    `Approve or reject here: ${ADMIN_URL}`, "", `Reference: ${id}`,
  ], id));
  return json({ ok: true }, 201);
}
