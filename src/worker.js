// Worker entry: serves /api/* and hands everything else to the static site in /public.
import * as submissions from "./api/submissions.js";
import * as admin from "./api/admin.js";
import * as venues from "./api/venues.js";
import * as importer from "./api/import.js";
import { json } from "../lib/shared.js";
import { seoRoute } from "./seo.js";

const routes = { "/api/submissions": submissions, "/api/admin": admin, "/api/venues": venues, "/api/import": importer };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // One canonical address: send www, other TLDs and workers.dev to allaccesspadel.co.uk
    const CANON = "allaccesspadel.co.uk";
    const host = url.hostname.toLowerCase();
    const redirectHosts = /^(www\.)?allaccesspadel\.(com|net|club|co\.uk)$|\.workers\.dev$/;
    if (host !== CANON && redirectHosts.test(host)) {
      if (!url.pathname.startsWith("/api/")) return Response.redirect(`https://${CANON}${url.pathname}${url.search}`, 301);
    }
    const mod = routes[url.pathname];
    if (mod) {
      const name = "onRequest" + request.method.charAt(0) + request.method.slice(1).toLowerCase();
      const handler = mod[name];
      if (!handler) return json({ error: "Method not allowed" }, 405);
      try { return await handler({ request, env, ctx }); }
      catch (e) { console.error(e); return json({ error: "Something went wrong. Try again in a minute." }, 500); }
    }
    if (url.pathname.startsWith("/api/")) return json({ error: "Not found" }, 404);
    try { const r = await seoRoute(request, env); if (r) return r; } catch (e) { console.error(e); }
    return env.ASSETS.fetch(request);
  },
};
