// Send a plain-text email to Joe through Cloudflare Email Routing (send_email binding "MAILER").
const oneLine = v => String(v ?? "").replace(/[\r\n]+/g, " ").trim();
const b64 = str => { const b = new TextEncoder().encode(str); let s = ""; for (const x of b) s += String.fromCharCode(x); return btoa(s); };
export async function mailJoe(env, subject, lines, ref) {
  if (!env.MAILER) return;
  const { EmailMessage } = await import("cloudflare:email");
  const from = "submissions@allaccesspadel.co.uk", to = "joe@robinsteele.co.uk";
  const body = lines.join("\r\n");
  const raw = [
    `From: All Access Padel <${from}>`, `To: ${to}`,
    `Subject: =?UTF-8?B?${b64(oneLine(subject).slice(0, 150))}?=`,
    `Message-ID: <${oneLine(ref) || crypto.randomUUID()}@allaccesspadel.co.uk>`, `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0", "Content-Type: text/plain; charset=UTF-8", "Content-Transfer-Encoding: base64", "",
    b64(body).replace(/.{1,76}/g, "$&\r\n"),
  ].join("\r\n");
  await env.MAILER.send(new EmailMessage(from, to, raw));
}
export function background(ctx, p) {
  const safe = p.catch(e => console.error("email failed", e));
  if (ctx && ctx.waitUntil) ctx.waitUntil(safe); else return safe;
}
export const ADMIN_URL = "https://allaccesspadel.co.uk/admin.html";
