// GET /api/news?limit=6 – latest live news items for the homepage.
import { json, needDb } from "../../lib/shared.js";
import { latestNews } from "../news.js";

export async function onRequestGet({ request, env }) {
  const no = needDb(env); if (no) return no;
  const limit = Math.min(50, Math.max(1, parseInt(new URL(request.url).searchParams.get("limit") || "6", 10) || 6));
  const items = await latestNews(env, limit);
  return new Response(JSON.stringify(items), { headers: { "content-type": "application/json", "cache-control": "public, max-age=300" } });
}
