// Find a 4th: list, create and remove game posts.
import { json, clean, newId, ipHash, tooMany, needDb } from "../../lib/shared.js";

const today = () => new Date().toISOString().slice(0, 10);

export async function onRequestGet({ env }) {
  const no = needDb(env); if (no) return no;
  // Tidy up: remove games whose date has passed.
  await env.DB.prepare("DELETE FROM fourths WHERE date < ?").bind(today()).run();
  const { results } = await env.DB
    .prepare("SELECT id, venue, date, time, level, need, contact FROM fourths ORDER BY date, time LIMIT 100")
    .all();
  return json(results);
}

export async function onRequestPost({ request, env }) {
  const no = needDb(env); if (no) return no;
  let b; try { b = await request.json(); } catch { return json({ error: "That didn't look right. Try again." }, 400); }
  if (b.website) return json({ id: "ok", token: "" }); // honeypot: bots fill hidden fields
  const post = {
    venue: clean(b.venue, 40), date: clean(b.date, 10), time: clean(b.time, 5),
    level: clean(b.level, 20), need: clean(b.need, 1), contact: clean(b.contact, 120),
  };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date) || post.date < today()) return json({ error: "Pick a date from today onwards." }, 400);
  if (!/^\d{2}:\d{2}$/.test(post.time)) return json({ error: "Pick a time." }, 400);
  if (!["1", "2", "3"].includes(post.need)) post.need = "1";
  if (post.contact.length < 3) return json({ error: "Add a way for people to reach you." }, 400);
  const ip = await ipHash(request);
  if (await tooMany(env.DB, "fourths", ip, 5)) return json({ error: "You've posted a lot in the last hour. Try again later." }, 429);
  const id = newId(), token = newId();
  await env.DB.prepare(
    "INSERT INTO fourths (id, venue, date, time, level, need, contact, token, ip, created) VALUES (?,?,?,?,?,?,?,?,?,?)"
  ).bind(id, post.venue, post.date, post.time, post.level, post.need, post.contact, token, ip, Date.now()).run();
  return json({ id, token }, 201);
}

export async function onRequestDelete({ request, env }) {
  const no = needDb(env); if (no) return no;
  const u = new URL(request.url);
  const id = u.searchParams.get("id") || "", token = u.searchParams.get("token") || "";
  if (!id || !token) return json({ error: "Missing details." }, 400);
  const r = await env.DB.prepare("DELETE FROM fourths WHERE id = ? AND token = ?").bind(id, token).run();
  return r.meta?.changes ? json({ ok: true }) : json({ error: "Couldn't find that post." }, 404);
}
