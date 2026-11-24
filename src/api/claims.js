// "Claim this venue" requests from clubs. Joe checks and approves them on the admin page.
import { json, clean, newId, ipHash, tooMany, needDb } from "../../lib/shared.js";
import { mailJoe, background, ADMIN_URL } from "../../lib/mail.js";

export async function onRequestPost({ request, env, ctx }) {
  const no = needDb(env); if (no) return no;
  let b; try { b = await request.json(); } catch { return json({ error: "That didn't look right. Try again." }, 400); }
  if (b.website) return json({ ok: true });
  const c = { venue_id: clean(b.venue_id, 80), name: clean(b.name, 80), role: clean(b.role, 80), email: clean(b.email, 120), phone: clean(b.phone, 40), message: clean(b.message, 800), featured: b.featured ? "Yes" : "No" };
  if (c.name.length < 2) return json({ error: "Add your name." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) return json({ error: "Add a valid email address." }, 400);
  const v = await env.DB.prepare("SELECT id, name, url FROM venues WHERE id = ?").bind(c.venue_id).first();
  if (!v) return json({ error: "We couldn't find that venue." }, 404);
  const ip = await ipHash(request);
  if (await tooMany(env.DB, "claims", ip, 3)) return json({ error: "Too many requests. Try again later." }, 429);
  const id = newId();
  await env.DB.prepare("INSERT INTO claims (id, venue_id, name, role, email, phone, message, status, ip, created) VALUES (?,?,?,?,?,?,?, 'pending', ?, ?)")
    .bind(id, c.venue_id, c.name, c.role, c.email, c.phone, c.message, ip, Date.now()).run();
  await background(ctx, mailJoe(env, `Venue claim: ${v.name}`, [
    `${c.name} wants to manage the listing for ${v.name}.`, "",
    `Role:    ${c.role || "(not given)"}`, `Email:   ${c.email}`, `Phone:   ${c.phone || "(not given)"}`,
    `Venue website: ${v.url || "(none on file)"}`, `Interested in a Featured listing: ${c.featured}`, "", "Message:", c.message || "(none)", "",
    "Before approving, check they really work there (e.g. their email matches the club's website domain, or call the venue).",
    `Approve it here and you'll get a private edit link to send them: ${ADMIN_URL}`, "", `Reference: ${id}`,
  ], id));
  return json({ ok: true }, 201);
}
