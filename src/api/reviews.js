// Player reviews. New reviews are pending until Joe approves them on the admin page.
import { json, clean, newId, ipHash, tooMany, needDb } from "../../lib/shared.js";
import { mailJoe, background, ADMIN_URL } from "../../lib/mail.js";

export async function onRequestPost({ request, env, ctx }) {
  const no = needDb(env); if (no) return no;
  let b; try { b = await request.json(); } catch { return json({ error: "That didn't look right. Try again." }, 400); }
  if (b.website) return json({ ok: true }); // honeypot
  const r = { venue_id: clean(b.venue_id, 80), rating: parseInt(b.rating, 10), title: clean(b.title, 100), body: clean(b.body, 1500), name: clean(b.name, 40) };
  if (!(r.rating >= 1 && r.rating <= 5)) return json({ error: "Pick a star rating from 1 to 5." }, 400);
  if (r.body.length < 20) return json({ error: "Tell us a bit more – at least a couple of sentences." }, 400);
  if (r.name.length < 2) return json({ error: "Add your first name." }, 400);
  const v = await env.DB.prepare("SELECT id, name FROM venues WHERE id = ?").bind(r.venue_id).first();
  if (!v) return json({ error: "We couldn't find that venue." }, 404);
  const ip = await ipHash(request);
  if (await tooMany(env.DB, "reviews", ip, 3)) return json({ error: "You've sent a few reviews recently. Try again later." }, 429);
  const id = newId();
  await env.DB.prepare("INSERT INTO reviews (id, venue_id, rating, title, body, name, status, ip, created) VALUES (?,?,?,?,?,?, 'pending', ?, ?)")
    .bind(id, r.venue_id, r.rating, r.title, r.body, r.name, ip, Date.now()).run();
  await background(ctx, mailJoe(env, `New review (${r.rating}★): ${v.name}`, [
    `New ${r.rating}-star review of ${v.name}, waiting for your approval.`, "",
    `From:  ${r.name}`, `Title: ${r.title || "(none)"}`, "", r.body, "",
    `Approve or reject it here: ${ADMIN_URL}`, "", `Reference: ${id}`,
  ], id));
  return json({ ok: true }, 201);
}
