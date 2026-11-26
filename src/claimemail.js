// Email a club its private edit link once Joe approves their claim. Sent through Brevo from Joe.
import { sendEmail } from "../lib/brevo.js";
const SITE = "https://allaccesspadel.co.uk";
const FROM = { email: "joe@allaccesspadel.com", name: "Joe Steele" };
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const first = n => String(n || "").trim().split(/\s+/)[0] || "there";

export function claimLinkEmail({ name, venue, venueId, link }) {
  const subject = `Your private link to update ${venue} on All Access Padel`;
  const page = `${SITE}/venues/${encodeURIComponent(venueId)}`;
  const html = `<!DOCTYPE html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#0d1b3d;font-size:15px;line-height:1.55;max-width:560px">
<p>Hi ${esc(first(name))},</p>
<p>Thanks for claiming <a href="${page}" style="color:#2457d6;font-weight:700">${esc(venue)}</a> on All Access Padel. I've approved it, so you can now update your listing yourself.</p>
<p style="margin:22px 0"><a href="${link}" style="background:#0d1b3d;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:6px;display:inline-block">Update your listing</a></p>
<p>From there you can add or change your prices, opening hours, facilities, offers, booking link and contact details. Players filter by these, so a complete listing gets far more clicks. I check changes quickly before they go live.</p>
<p><b>Keep this link private.</b> Anyone with it can suggest changes to your listing. Bookmark it to come back any time. If you lose it or it gets shared, just reply and I'll send a new one.</p>
<p>One more free thing: add our badge to your website at <a href="${SITE}/for-clubs" style="color:#2457d6">allaccesspadel.co.uk/for-clubs</a>. It shows players your reviews and helps your page show up in Google.</p>
<p>Any questions, just reply to this email.</p>
<p>Thanks,<br>Joe Steele<br>All Access Padel, Witney, Oxfordshire<br><a href="${SITE}" style="color:#2457d6">allaccesspadel.co.uk</a></p>
<p style="font-size:12px;color:#4d5673;margin-top:24px">If the button doesn't work, copy this link into your browser: ${esc(link)}</p>
</body></html>`;
  const text = `Hi ${first(name)},

Thanks for claiming ${venue} on All Access Padel (${page}). I've approved it, so you can now update your listing yourself.

Your private link: ${link}

From there you can add or change your prices, opening hours, facilities, offers, booking link and contact details. Players filter by these, so a complete listing gets far more clicks. I check changes quickly before they go live.

Keep this link private. Anyone with it can suggest changes to your listing. Bookmark it to come back any time. If you lose it or it gets shared, just reply and I'll send a new one.

One more free thing: add our badge to your website at ${SITE}/for-clubs

Any questions, just reply to this email.

Thanks,
Joe Steele
All Access Padel, Witney, Oxfordshire
${SITE}`;
  return { subject, html, text };
}

export async function sendClaimLink(env, claimId) {
  const c = await env.DB.prepare("SELECT c.id, c.name, c.email, c.token, c.venue_id, v.name AS venue FROM claims c LEFT JOIN venues v ON v.id = c.venue_id WHERE c.id = ? AND c.status = 'approved'").bind(claimId).first();
  if (!c || !c.token || !c.email) return { error: "No approved claim with an email." };
  const link = `${SITE}/club.html#${c.token}`;
  try {
    const r = await sendEmail(env, { to: c.email, ...claimLinkEmail({ name: c.name, venue: c.venue || "your club", venueId: c.venue_id, link }), replyTo: FROM, sender: FROM });
    if (r.skipped) throw new Error(r.skipped);
    await env.DB.prepare("UPDATE claims SET link_sent = ?, link_error = NULL WHERE id = ?").bind(Date.now(), claimId).run();
    return { sent: true, link };
  } catch (e) {
    await env.DB.prepare("UPDATE claims SET link_error = ? WHERE id = ?").bind(String(e.message).slice(0, 300), claimId).run();
    return { sent: false, error: String(e.message), link };
  }
}
