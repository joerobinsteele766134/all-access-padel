// Admin: moderate submissions, reviews, venue claims and club edits; feature venues.
import { json, needDb } from "../../lib/shared.js";
import { EDITABLE } from "./club.js";
import { sendClaimLink } from "../claimemail.js";

async function authorised(request, env) {
  const key = request.headers.get("x-admin-key") || "";
  if (!env.ADMIN_KEY || env.ADMIN_KEY.length < 12) return false;
  const a = new TextEncoder().encode(key), b = new TextEncoder().encode(env.ADMIN_KEY);
  if (a.length !== b.length) return false;
  let diff = 0; for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function onRequestGet({ request, env }) {
  const no = needDb(env); if (no) return no;
  if (!(await authorised(request, env))) return json({ error: "Wrong admin key." }, 401);
  const q = sql => env.DB.prepare(sql).all().then(r => r.results);
  const [submissions, reviews, claims, edits, featured, news, messages, alertCount, outreachStats] = await Promise.all([
    q("SELECT id, type, venue, details, contact, created, COALESCE(status,'pending') AS status FROM submissions ORDER BY (COALESCE(status,'pending')='pending') DESC, created DESC LIMIT 200"),
    q("SELECT r.id, r.venue_id, v.name AS venue, r.rating, r.title, r.body, r.name, r.status, r.created FROM reviews r LEFT JOIN venues v ON v.id = r.venue_id ORDER BY (r.status='pending') DESC, r.created DESC LIMIT 200"),
    q("SELECT c.id, c.venue_id, v.name AS venue, v.url AS venue_url, c.name, c.role, c.email, c.phone, c.message, c.status, c.token, c.created, c.link_sent, c.link_error FROM claims c LEFT JOIN venues v ON v.id = c.venue_id ORDER BY (c.status='pending') DESC, c.created DESC LIMIT 200"),
    q("SELECT e.id, e.venue_id, v.name AS venue, e.data, e.status, e.created FROM venue_edits e LEFT JOIN venues v ON v.id = e.venue_id ORDER BY (e.status='pending') DESC, e.created DESC LIMIT 200"),
    q("SELECT id, name, featured_until FROM venues WHERE featured_until > strftime('%s','now')*1000 ORDER BY featured_until"),
    q("SELECT id, title, source, url, published, kind, venue_id FROM news ORDER BY published DESC LIMIT 100").catch(() => []),
    q("SELECT id, name, email, topic, message, created FROM messages ORDER BY created DESC LIMIT 100").catch(() => []),
    env.DB.prepare("SELECT COUNT(*) AS n FROM alerts WHERE status = 'active'").first().catch(() => ({ n: 0 })),
    q("SELECT status, COUNT(*) AS n FROM outreach GROUP BY status").catch(() => []),
  ]);
  return json({ submissions, reviews, claims, edits, featured, news, messages, alerts: alertCount.n, outreach: outreachStats });
}

export async function onRequestPatch({ request, env }) {
  const no = needDb(env); if (no) return no;
  if (!(await authorised(request, env))) return json({ error: "Wrong admin key." }, 401);
  const u = new URL(request.url);
  const kind = u.searchParams.get("kind") || "submission", id = u.searchParams.get("id") || "", status = u.searchParams.get("status") || "";
  if (!id) return json({ error: "Missing details." }, 400);
  const ok = ["approved", "rejected", "pending"].includes(status);

  if (kind === "submission" || kind === "review") {
    if (!ok) return json({ error: "Bad status." }, 400);
    await env.DB.prepare(`UPDATE ${kind === "review" ? "reviews" : "submissions"} SET status = ? WHERE id = ?`).bind(status, id).run();
    return json({ ok: true });
  }
  if (kind === "claim") {
    if (!ok) return json({ error: "Bad status." }, 400);
    const c = await env.DB.prepare("SELECT venue_id, token FROM claims WHERE id = ?").bind(id).first();
    if (!c) return json({ error: "Not found." }, 404);
    if (status === "approved") {
      const token = c.token || (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "");
      await env.DB.batch([
        env.DB.prepare("UPDATE claims SET status = 'approved', token = ? WHERE id = ?").bind(token, id),
        env.DB.prepare("UPDATE venues SET claimed = 1 WHERE id = ?").bind(c.venue_id),
      ]);
      const mail = await sendClaimLink(env, id); // emails the club its private link
      return json({ ok: true, link: `https://allaccesspadel.co.uk/club.html#${token}`, emailed: !!mail.sent, emailError: mail.error || null });
    }
    await env.DB.prepare("UPDATE claims SET status = ?, token = NULL WHERE id = ?").bind(status, id).run();
    return json({ ok: true });
  }
  if (kind === "edit") {
    if (!ok) return json({ error: "Bad status." }, 400);
    const e = await env.DB.prepare("SELECT venue_id, data, status FROM venue_edits WHERE id = ?").bind(id).first();
    if (!e) return json({ error: "Not found." }, 404);
    if (status === "approved" && e.status !== "approved") {
      const data = JSON.parse(e.data || "{}");
      const keys = Object.keys(data).filter(k => EDITABLE.includes(k));
      const stmts = [env.DB.prepare("UPDATE venue_edits SET status = 'approved' WHERE id = ?").bind(id)];
      if (keys.length) stmts.push(env.DB.prepare(`UPDATE venues SET ${keys.map(k => `${k} = ?`).join(", ")}, updated = ? WHERE id = ?`)
        .bind(...keys.map(k => data[k] || null), Date.now(), e.venue_id));
      await env.DB.batch(stmts);
      return json({ ok: true });
    }
    await env.DB.prepare("UPDATE venue_edits SET status = ? WHERE id = ?").bind(status, id).run();
    return json({ ok: true });
  }
  if (kind === "venue") {
    const days = Math.max(0, Math.min(366, parseInt(u.searchParams.get("featured_days") || "0", 10) || 0));
    await env.DB.prepare("UPDATE venues SET featured_until = ? WHERE id = ?").bind(days ? Date.now() + days * 86400000 : null, id).run();
    return json({ ok: true });
  }
  return json({ error: "Unknown kind." }, 400);
}

export async function onRequestDelete({ request, env }) {
  const no = needDb(env); if (no) return no;
  if (!(await authorised(request, env))) return json({ error: "Wrong admin key." }, 401);
  const u = new URL(request.url);
  const kind = u.searchParams.get("kind"), id = u.searchParams.get("id") || "";
  const table = { submission: "submissions", review: "reviews", news: "news" }[kind];
  if (!table || !id) return json({ error: "Missing details." }, 400);
  await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
  return json({ ok: true });
}
