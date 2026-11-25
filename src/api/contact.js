// About page contact form. Messages are emailed to Joe and kept in D1 (table `messages`).
import { json, clean, newId, ipHash, tooMany, needDb } from "../../lib/shared.js";
import { mailJoe, background } from "../../lib/mail.js";

export async function onRequestPost({ request, env, ctx }) {
  const no = needDb(env); if (no) return no;
  let b; try { b = await request.json(); } catch { return json({ error: "That didn't look right. Try again." }, 400); }
  if (b.website) return json({ ok: true }); // honeypot
  const m = { name: clean(b.name, 80), email: clean(b.email, 120), topic: clean(b.topic, 60), message: clean(b.message, 2000) };
  if (m.name.length < 2) return json({ error: "Add your name." }, 400);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m.email)) return json({ error: "Add an email address so we can reply." }, 400);
  if (m.message.length < 10) return json({ error: "Add a short message." }, 400);
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, name TEXT, email TEXT, topic TEXT, message TEXT, ip TEXT, created INTEGER)").run();
  const ip = await ipHash(request);
  if (await tooMany(env.DB, "messages", ip, 4)) return json({ error: "You've sent a few messages recently. Try again later." }, 429);
  const id = newId();
  await env.DB.prepare("INSERT INTO messages (id, name, email, topic, message, ip, created) VALUES (?,?,?,?,?,?,?)").bind(id, m.name, m.email, m.topic, m.message, ip, Date.now()).run();
  await background(ctx, mailJoe(env, `Contact form: ${m.topic || "message"} from ${m.name}`, [
    `New message from the All Access Padel contact form.`, "",
    `Name:  ${m.name}`, `Email: ${m.email}  (reply to this address)`, `Topic: ${m.topic || "(none)"}`, "", m.message, "", `Reference: ${id}`,
  ], id));
  return json({ ok: true }, 201);
}
