// Admin: see submissions and game posts, and delete either. Needs the ADMIN_KEY secret.
import { json, needDb } from "../../lib/shared.js";

async function authorised(request, env) {
  const key = request.headers.get("x-admin-key") || "";
  if (!env.ADMIN_KEY || env.ADMIN_KEY.length < 12) return false;
  const a = new TextEncoder().encode(key), b = new TextEncoder().encode(env.ADMIN_KEY);
  if (a.length !== b.length) return false;
  let diff = 0; for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function onRequestGet({ request, env }) {
  const no = needDb(env); if (no) return no;
  if (!(await authorised(request, env))) return json({ error: "Wrong admin key." }, 401);
  const subs = await env.DB.prepare("SELECT id, type, venue, details, contact, created, COALESCE(status, 'pending') AS status FROM submissions ORDER BY (COALESCE(status,'pending')='pending') DESC, created DESC LIMIT 200").all();
  return json({ submissions: subs.results });
}

export async function onRequestDelete({ request, env }) {
  const no = needDb(env); if (no) return no;
  if (!(await authorised(request, env))) return json({ error: "Wrong admin key." }, 401);
  const u = new URL(request.url);
  const kind = u.searchParams.get("kind"), id = u.searchParams.get("id") || "";
  const table = kind === "submission" ? "submissions" : null;
  if (!table || !id) return json({ error: "Missing details." }, 400);
  await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
  return json({ ok: true });
}

export async function onRequestPatch({ request, env }) {
  const no = needDb(env); if (no) return no;
  if (!(await authorised(request, env))) return json({ error: "Wrong admin key." }, 401);
  const u = new URL(request.url);
  const id = u.searchParams.get("id") || "", status = u.searchParams.get("status") || "";
  if (!id || !["approved", "rejected", "pending"].includes(status)) return json({ error: "Missing details." }, 400);
  await env.DB.prepare("UPDATE submissions SET status = ? WHERE id = ?").bind(status, id).run();
  return json({ ok: true });
}
