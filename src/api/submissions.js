// "Add a court or a deal" form. Only the admin page can read these.
import { json, clean, newId, ipHash, tooMany, needDb } from "../../lib/shared.js";

export async function onRequestPost({ request, env, ctx }) {
  const no = needDb(env); if (no) return no;
  let b; try { b = await request.json(); } catch { return json({ error: "That didn't look right. Try again." }, 400); }
  if (b.website) return json({ ok: true }); // honeypot
  const s = { type: clean(b.type, 40), venue: clean(b.venue, 100), details: clean(b.details, 800), contact: clean(b.contact, 120) };
  if (s.venue.length < 2 || s.details.length < 5) return json({ error: "Add the venue name and a few details." }, 400);
  const ip = await ipHash(request);
  if (await tooMany(env.DB, "submissions", ip, 5)) return json({ error: "You've sent a lot in the last hour. Try again later." }, 429);
  const id = newId();
  await env.DB.prepare(
    "INSERT INTO submissions (id, type, venue, details, contact, ip, created, status) VALUES (?,?,?,?,?,?,?,'pending')"
  ).bind(id, s.type, s.venue, s.details, s.contact, ip, Date.now()).run();
  const send = notify(env, s, id).catch(e => console.error("email failed", e));
  if (ctx && ctx.waitUntil) ctx.waitUntil(send); else await send;
  return json({ ok: true }, 201);
}

// Email each submission to Joe for approval before anything goes on the site.
const oneLine = v => String(v || "").replace(/[\r\n]+/g, " ").trim();
const b64 = str => { const b = new TextEncoder().encode(str); let s = ""; for (const x of b) s += String.fromCharCode(x); return btoa(s); };
async function notify(env, s, id) {
  if (!env.MAILER) return;
  const { EmailMessage } = await import("cloudflare:email");
  const from = "submissions@allaccesspadel.co.uk", to = "joe@robinsteele.co.uk";
  const subject = `New ${oneLine(s.type).toLowerCase() || "submission"}: ${oneLine(s.venue)}`.slice(0, 150);
  const body = [
    "Someone sent this through the Add a court or a deal form on allaccesspadel.co.uk.",
    "It is NOT on the site yet. It waits as pending until you approve it.",
    "",
    `Type:    ${oneLine(s.type)}`,
    `Venue:   ${oneLine(s.venue)}`,
    `Contact: ${oneLine(s.contact) || "(none given)"}`,
    "",
    "Details:",
    s.details,
    "",
    "Approve or reject it here: https://allaccesspadel.co.uk/admin.html",
    "Approved items are added in the weekly update, or ask Claude to add them straight away.",
    "",
    `Reference: ${id}`,
  ].join("\r\n");
  const raw = [
    `From: All Access Padel <${from}>`, `To: ${to}`,
    `Subject: =?UTF-8?B?${b64(subject)}?=`,
    `Message-ID: <${id}@allaccesspadel.co.uk>`, `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0", "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64", "",
    b64(body).replace(/.{1,76}/g, "$&\r\n"),
  ].join("\r\n");
  await env.MAILER.send(new EmailMessage(from, to, raw));
}
