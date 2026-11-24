// "Add a court or a deal" form. Only the admin page can read these.
import { json, clean, newId, ipHash, tooMany, needDb } from "../../lib/shared.js";

export async function onRequestPost({ request, env }) {
  const no = needDb(env); if (no) return no;
  let b; try { b = await request.json(); } catch { return json({ error: "That didn't look right. Try again." }, 400); }
  if (b.website) return json({ ok: true }); // honeypot
  const s = { type: clean(b.type, 40), venue: clean(b.venue, 100), details: clean(b.details, 800), contact: clean(b.contact, 120) };
  if (s.venue.length < 2 || s.details.length < 5) return json({ error: "Add the venue name and a few details." }, 400);
  const ip = await ipHash(request);
  if (await tooMany(env.DB, "submissions", ip, 5)) return json({ error: "You've sent a lot in the last hour. Try again later." }, 429);
  await env.DB.prepare(
    "INSERT INTO submissions (id, type, venue, details, contact, ip, created) VALUES (?,?,?,?,?,?,?)"
  ).bind(newId(), s.type, s.venue, s.details, s.contact, ip, Date.now()).run();
  return json({ ok: true }, 201);
}
