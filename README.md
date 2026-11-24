# All Access Padel

Padel courts, deals and a find-a-4th board for Witney and West Oxfordshire. Hosted on Cloudflare Pages with a D1 database.

## Quick setup (full guide is in the Claude doc)
1. Push this folder to a GitHub repo.
2. Cloudflare dashboard > Workers & Pages > Create > Pages > Connect to Git > pick the repo.
   Framework preset: None. Build command: leave empty. Build output directory: `public`.
3. Storage & Databases > D1 > Create database `aap-db`. Open its Console, paste `schema.sql`, run it.
4. Pages project > Settings > Bindings > Add > D1 database. Variable name `DB`, database `aap-db`.
5. Settings > Variables and Secrets > Add secret `ADMIN_KEY` (a long password only you know).
6. Deployments > latest > Retry deployment.

## Updating
- Courts and deals: edit `public/venues.json` on GitHub and commit. The site redeploys in about a minute.
- Admin page: `/admin.html` on your site, log in with your ADMIN_KEY.
