# All Access Padel

Padel courts, deals and a find-a-4th board for Witney and West Oxfordshire. Hosted on Cloudflare Pages with a D1 database.

## Quick setup (full guide is in the Claude doc)
1. Push this folder to a GitHub repo.
2. Cloudflare dashboard > Workers & Pages > Create > Import a repository > pick the repo. It deploys with wrangler.jsonc (static site in public/, API in src/worker.js).

3. Storage & Databases > D1 > Create database `aap-db`. Open its Console, paste `schema.sql`, run it.
4. The D1 binding is set in wrangler.jsonc (DB -> aap-db).
5. Settings > Variables and Secrets > Add secret `ADMIN_KEY` (a long password only you know).
6. Push to main to redeploy.

## Updating
- Courts and deals: edit `public/venues.json` on GitHub and commit. The site redeploys in about a minute.
- Admin page: `/admin.html` on your site, log in with your ADMIN_KEY.
