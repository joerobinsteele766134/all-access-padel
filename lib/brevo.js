// Sending email to subscribers through Brevo's API. Needs the Worker secret BREVO_KEY.
// The sender address must be on a domain verified in Brevo (allaccesspadel.co.uk).
export const SENDER = { name: "All Access Padel", email: "alerts@allaccesspadel.co.uk" };
const SITE = "https://allaccesspadel.co.uk";
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export async function sendEmail(env, { to, subject, html, text, unsubUrl, replyTo, senderName, sender }) {
  if (!env.BREVO_KEY) return { skipped: "no BREVO_KEY" };
  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": env.BREVO_KEY, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ sender: sender || (senderName ? { ...SENDER, name: senderName } : SENDER), to: [{ email: to }], subject, htmlContent: html, textContent: text, ...(replyTo ? { replyTo } : {}),
      headers: unsubUrl ? { "List-Unsubscribe": `<${unsubUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } : undefined }),
  });
  if (!r.ok) throw new Error(`Brevo ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return { ok: true };
}

const shell = (body, unsubUrl) => `<!DOCTYPE html><html><body style="margin:0;background:#f3f1ea;font-family:Arial,Helvetica,sans-serif;color:#0d1b3d">
<div style="max-width:560px;margin:0 auto;padding:20px">
<div style="background:#0d1b3d;padding:14px 18px;border-radius:6px 6px 0 0"><a href="${SITE}" style="color:#fff;text-decoration:none;font-weight:900;font-style:italic;font-size:20px">ALL ACCESS <span style="color:#e4ff3a">PADEL</span></a></div>
<div style="background:#fff;padding:20px 18px;border-radius:0 0 6px 6px;font-size:16px;line-height:1.5">${body}</div>
<p style="font-size:12px;color:#4d5673;margin-top:14px">You're getting this because you asked All Access Padel to tell you about new padel courts near you. <a href="${unsubUrl}" style="color:#4d5673">Unsubscribe</a> · <a href="${SITE}/privacy" style="color:#4d5673">Privacy</a></p>
</div></body></html>`;

export function welcomeEmail(place, unsubUrl) {
  return {
    subject: `You're signed up: new padel courts near ${place}`,
    html: shell(`<h1 style="font-size:22px;margin:0 0 10px">You're on the list</h1><p>We'll email you when a new padel court opens within about 15 miles of <b>${esc(place)}</b>. It won't be often, just when there's something new.</p><p><a href="${SITE}/" style="display:inline-block;background:#e4ff3a;color:#0d1b3d;padding:10px 16px;border-radius:6px;font-weight:700;text-decoration:none">See courts near you</a></p>`, unsubUrl),
    text: `You're on the list. We'll email you when a new padel court opens within about 15 miles of ${place}.\n\nSee courts near you: ${SITE}/\n\nUnsubscribe: ${unsubUrl}`,
  };
}

export function newCourtsEmail(place, venues, unsubUrl) {
  const one = venues.length === 1;
  const items = venues.map(v => `<div style="border:2px solid #0d1b3d;border-radius:6px;padding:12px 14px;margin:0 0 10px"><div style="font-weight:700;font-size:18px">${esc(v.name)}</div><div style="color:#4d5673;font-size:14px">${Math.round(v.d)} miles away · ${esc([v.courts, v.postcode].filter(Boolean).join(" · "))}</div>${v.about ? `<p style="margin:6px 0 0;font-size:14px">${esc(v.about)}</p>` : ""}<p style="margin:8px 0 0"><a href="${SITE}/venues/${encodeURIComponent(v.id)}" style="color:#2457d6;font-weight:700">See the club</a></p></div>`).join("");
  return {
    subject: one ? `New padel court near ${place}: ${venues[0].name}` : `${venues.length} new padel courts near ${place}`,
    html: shell(`<h1 style="font-size:22px;margin:0 0 12px">${one ? "A new padel court" : `${venues.length} new padel courts`} near ${esc(place)}</h1>${items}<p style="font-size:14px">Prices and opening dates can change, so check with the club before you go.</p>`, unsubUrl),
    text: `${one ? "A new padel court" : `${venues.length} new padel courts`} near ${place}:\n\n${venues.map(v => `${v.name} (${Math.round(v.d)} miles): ${SITE}/venues/${v.id}`).join("\n")}\n\nUnsubscribe: ${unsubUrl}`,
  };
}
