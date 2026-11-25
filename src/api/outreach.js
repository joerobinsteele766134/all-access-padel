// GET /api/outreach?optout=<token> – a club opts out of outreach emails. (POST does the same, for one-click unsubscribe.)
import { ensureOutreach } from "../outreach.js";
const page = msg => new Response(`<!DOCTYPE html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>All Access Padel</title></head><body style="font-family:Arial,sans-serif;background:#f3f1ea;color:#0d1b3d;padding:40px 20px"><div style="max-width:520px;margin:0 auto;background:#fff;border:2px solid #0d1b3d;border-radius:6px;padding:20px"><h1 style="font-size:22px;margin:0 0 10px">${msg}</h1><p><a href="/">All Access Padel</a></p></div></body></html>`, { headers: { "content-type": "text/html; charset=utf-8" } });
async function optout(request, env) {
  const t = new URL(request.url).searchParams.get("optout") || "";
  if (!env.DB || !/^[a-f0-9]{32}$/.test(t)) return page("That link doesn't look right.");
  await ensureOutreach(env.DB);
  await env.DB.prepare("UPDATE outreach SET status = 'optout' WHERE token = ?").bind(t).run();
  return page("Done. We won't email you again. Your club's listing stays on the site; reply to our email if you'd like it changed or removed.");
}
export const onRequestGet = ({ request, env }) => optout(request, env);
export const onRequestPost = ({ request, env }) => optout(request, env);
