// Club outreach: one email per contact (listing all their clubs), sent through Brevo, 20 each weekday, nearest first.
// Contacts live in D1 table `outreach`. Every email has an opt-out link (/api/outreach?optout=<token>).
import { sendEmail } from "../lib/brevo.js";
const SITE = "https://allaccesspadel.co.uk";
const FROM = { email: "joe@allaccesspadel.com", name: "Joe Steele" };
const REPLY_TO = FROM;
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const PER_DAY = 20;

export async function ensureOutreach(db) {
  await db.prepare("CREATE TABLE IF NOT EXISTS outreach (email TEXT PRIMARY KEY, clubs TEXT NOT NULL, miles INTEGER, status TEXT DEFAULT 'queued', token TEXT, sent_at INTEGER, error TEXT)").run();
}

export function outreachEmail(clubs, optoutUrl) {
  const many = clubs.length > 1, names = clubs.map(c => c.name);
  const subject = many ? `Your ${clubs.length} clubs are listed on All Access Padel (free)` : `${clubs[0].name} is listed on All Access Padel (free)`;
  const list = clubs.map(c => `<li><a href="${SITE}/venues/${encodeURIComponent(c.id)}" style="color:#2457d6;font-weight:700">${esc(c.name)}</a>${c.missing && c.missing !== "nothing" ? ` <span style="color:#4d5673">(missing: ${esc(c.missing)})</span>` : ""}</li>`).join("");
  const html = `<!DOCTYPE html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#0d1b3d;font-size:15px;line-height:1.55;max-width:560px">
<p>Hi there,</p>
<p>I run <a href="${SITE}" style="color:#2457d6">All Access Padel</a>, a free, independent directory of every padel court in Britain. Players use it to find courts near them, compare prices and book.</p>
<p>${many ? "Your clubs are" : `${esc(names[0])} is`} already listed:</p><ul style="padding-left:18px">${list}</ul>
<p>Two quick things that bring you more bookings, both free:</p>
<ol style="padding-left:18px"><li><b>Claim your listing.</b> Tap "Claim this venue" on your page and you'll get a private link to add your prices, opening hours, facilities, offers and booking link. Players filter by these, so complete listings get far more clicks.</li>
<li><b>Add our badge to your website.</b> It takes a minute at <a href="${SITE}/for-clubs" style="color:#2457d6">allaccesspadel.co.uk/for-clubs</a>. It shows players your reviews and helps your page show up in Google.</li></ol>
<p style="background:#eef7e6;border-radius:8px;padding:10px 14px"><b>It's completely free for clubs.</b> No fees, no commission, no contract, and there's nothing to sign up for. Your listing stays up whether or not you claim it.</p>
<p>If anything on your listing is wrong, just reply and I'll fix it.</p>
<p>Thanks, and see you on court,<br>Joe Steele<br>All Access Padel, Witney, Oxfordshire<br><a href="${SITE}" style="color:#2457d6">allaccesspadel.co.uk</a></p>
<p style="font-size:12px;color:#4d5673;margin-top:24px">You're getting this one-off email because ${many ? "your clubs are" : "your club is"} listed on All Access Padel. If you'd rather not hear from us again, <a href="${optoutUrl}" style="color:#4d5673">click here</a> and we won't email you again.</p>
</body></html>`;
  const text = `Hi there,

I run All Access Padel (${SITE}), a free, independent directory of every padel court in Britain. Players use it to find courts near them, compare prices and book.

${many ? "Your clubs are" : `${names[0]} is`} already listed:
${clubs.map(c => `- ${c.name}: ${SITE}/venues/${c.id}${c.missing && c.missing !== "nothing" ? ` (missing: ${c.missing})` : ""}`).join("\n")}

Two quick things that bring you more bookings, both free:
1. Claim your listing. Tap "Claim this venue" on your page and you'll get a private link to add your prices, opening hours, facilities, offers and booking link.
2. Add our badge to your website: ${SITE}/for-clubs

It's completely free for clubs. No fees, no commission, no contract, and there's nothing to sign up for. Your listing stays up whether or not you claim it.

If anything on your listing is wrong, just reply and I'll fix it.

Thanks, and see you on court,
Joe Steele
All Access Padel, Witney, Oxfordshire

You're getting this one-off email because your club is listed on All Access Padel. To not hear from us again: ${optoutUrl}`;
  return { subject, html, text };
}

export async function runOutreach(env, limit = PER_DAY) {
  if (!env.DB || !env.BREVO_KEY) return { skipped: "no DB or BREVO_KEY" };
  await ensureOutreach(env.DB);
  // One batch a day at most: if a batch already went in the last 12 hours (e.g. sent early by hand), skip.
  const recent = await env.DB.prepare("SELECT COUNT(*) n FROM outreach WHERE sent_at > ?").bind(Date.now() - 12 * 3600e3).first();
  if (recent && recent.n >= limit) return { skipped: "batch already sent today" };
  const { results } = await env.DB.prepare("SELECT email, clubs, token FROM outreach WHERE status = 'queued' ORDER BY miles LIMIT ?").bind(limit).all();
  let sent = 0, failed = 0;
  for (const r of results) {
    const token = r.token || crypto.randomUUID().replace(/-/g, "");
    const optout = `${SITE}/api/outreach?optout=${token}`;
    try {
      const m = outreachEmail(JSON.parse(r.clubs), optout);
      await sendEmail(env, { to: r.email, ...m, unsubUrl: optout, replyTo: REPLY_TO, sender: FROM });
      await env.DB.prepare("UPDATE outreach SET status = 'sent', sent_at = ?, token = ? WHERE email = ?").bind(Date.now(), token, r.email).run(); sent++;
    } catch (e) {
      failed++; await env.DB.prepare("UPDATE outreach SET status = 'failed', error = ?, token = ? WHERE email = ?").bind(String(e.message).slice(0, 300), token, r.email).run();
    }
  }
  const left = (await env.DB.prepare("SELECT COUNT(*) AS n FROM outreach WHERE status = 'queued'").first()).n;
  return { sent, failed, left };
}
