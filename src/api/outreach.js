// /api/outreach?optout=<token>: GET shows a confirm button; POST (the button, or one-click List-Unsubscribe) opts the club out.
import { ensureOutreach } from "../outreach.js";
const page = (msg, extra = "") => new Response(`<!DOCTYPE html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>All Access Padel</title></head><body style="font-family:Arial,sans-serif;background:#f3f1ea;color:#0d1b3d;padding:40px 20px"><div style="max-width:520px;margin:0 auto;background:#fff;border:2px solid #0d1b3d;border-radius:6px;padding:20px"><h1 style="font-size:22px;margin:0 0 10px">${msg}</h1>${extra}<p><a href="/">All Access Padel</a></p></div></body></html>`, { headers: { "content-type": "text/html; charset=utf-8" } });
async function optout(request, env) {
  const t = new URL(request.url).searchParams.get("optout") || "";
  if (!env.DB || !/^[a-f0-9]{32}$/.test(t)) return page("That link doesn't look right.");
  await ensureOutreach(env.DB);
  await env.DB.prepare("UPDATE outreach SET status = 'optout' WHERE token = ?").bind(t).run();
  return page("Done. We won't email you again. Your club's listing stays on the site; reply to our email if you'd like it changed or removed.");
}
// GET only shows a confirm button: email security scanners open links automatically, so GET must not opt anyone out.
export function onRequestGet({ request }) {
  const t = new URL(request.url).searchParams.get("optout") || "";
  if (!/^[a-f0-9]{32}$/.test(t)) return page("That link doesn't look right.");
  return page("Stop emails from All Access Padel?", `<form method="post" action="/api/outreach?optout=${t}"><button style="font:inherit;font-weight:700;background:#0d1b3d;color:#fff;border:0;border-radius:6px;padding:10px 18px;cursor:pointer">Yes, don't email me again</button></form>`);
}
export const onRequestPost = ({ request, env }) => optout(request, env);
