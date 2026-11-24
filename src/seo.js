// Server-rendered pages for search engines and AI crawlers:
// /venues/:id, /padel-courts, /padel-courts/:area, /sitemap.xml, /llms.txt
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const slug = s => String(s || "").toLowerCase().normalize("NFKD").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const miles = (a, b, c, d) => { const R = 3959, r = x => x * Math.PI / 180, dl = r(c - a), dg = r(d - b), h = Math.sin(dl / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dg / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
const httpsUrl = u => { u = String(u || "").trim(); if (!u || /\s|@/.test(u) || !u.includes(".")) return ""; return /^https?:\/\//i.test(u) ? u.replace(/^http:/i, "https:") : "https://" + u; };
const appOf = u => { const h = (u || "").toLowerCase(); return h.includes("playtomic") ? "Playtomic" : h.includes("matchi") ? "MATCHi" : h.includes("nettla") ? "Nettla" : (h.includes("clubspark") || h.includes("lta.org.uk")) ? "ClubSpark" : "the booking page"; };
const year = () => new Date().getFullYear();

async function allVenues(env) {
  const { results } = await env.DB.prepare(
    "SELECT id, name, postcode, lat, lng, district, country, courts, lta, url, email, tel, about, deal, price, price_note, book_url, updated FROM venues ORDER BY name"
  ).all();
  return results;
}

const page = ({ origin, path, title, description, body, jsonld = [] }) => `<!DOCTYPE html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${origin}${path}">
<meta property="og:type" content="website"><meta property="og:site_name" content="All Access Padel">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${origin}${path}">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@1,800;1,900&family=Barlow:wght@400;500;700&display=swap">
<style>
:root{color-scheme:light dark;--bg:light-dark(#f3f1ea,#0a1430);--ink:light-dark(#0d1b3d,#eef1f8);--muted:light-dark(#4d5673,#a3adc8);--card:light-dark(#fff,#111f45);--line:light-dark(#0d1b3d,#2b3d6e);--navy:#0d1b3d;--ball:#e4ff3a;--court:#2457d6}
*{box-sizing:border-box;min-width:0}body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.6 Barlow,system-ui,sans-serif}
header{background:var(--navy);padding:12px max(5vw,16px)}header a{color:#fff;text-decoration:none;font:italic 900 24px "Barlow Condensed",sans-serif}header a i{color:var(--ball);font-style:inherit}
main{max-width:960px;margin:0 auto;padding:28px max(5vw,16px) 56px}
h1{font:italic 900 clamp(36px,6vw,56px)/1 "Barlow Condensed",sans-serif;text-transform:uppercase;margin:0 0 12px}
h2{font:italic 800 28px/1.1 "Barlow Condensed",sans-serif;margin:32px 0 10px}
p{max-width:68ch}.muted{color:var(--muted)}.crumbs{font-size:14px;color:var(--muted);margin-bottom:14px}.crumbs a{color:inherit}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:18px 0}
.fact{background:var(--card);border:2px solid var(--line);border-radius:4px;padding:12px 14px}.fact b{display:block;font-size:13px;color:var(--muted);font-weight:700}
.btns{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0}
.btn{display:inline-flex;align-items:center;min-height:46px;padding:0 18px;border-radius:6px;font-weight:700;text-decoration:none;border:2px solid var(--navy)}
.btn.y{background:var(--ball);color:var(--navy)}.btn.b{background:var(--court);color:#fff;border-color:var(--court)}
.deal{background:var(--ball);color:var(--navy);padding:12px 14px;border-radius:4px;max-width:68ch}
ul.list{list-style:none;padding:0;margin:0;display:grid;gap:10px}
ul.list li{background:var(--card);border:2px solid var(--line);border-radius:4px;padding:12px 14px}
ul.list a{color:inherit;font-weight:700}
.cols{columns:3 220px;padding:0;list-style:none}.cols li{margin:0 0 6px;break-inside:avoid}.cols a{color:inherit}
footer{background:var(--navy);color:#c9d1e6;padding:24px max(5vw,16px);font-size:14px}footer a{color:#fff}
</style>
${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`).join("\n")}
</head><body>
<header><a href="/">ALL ACCESS <i>PADEL</i></a></header>
<main>${body}</main>
<footer><p><a href="/">Find padel courts near you</a> · <a href="/padel-courts">Padel courts by area</a></p>
<p>Venue list built from the LTA's padel court finder plus our own research. Prices change often, so check with the venue before you go. All Access Padel is independent and not connected to the venues listed.</p></footer>
</body></html>`;

const html = (s, maxAge = 3600) => new Response(s, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": `public, max-age=${maxAge}` } });

function areaGroups(venues) {
  const m = new Map();
  for (const v of venues) {
    const d = v.district || "";
    if (!d) continue;
    const k = slug(d);
    if (!m.has(k)) m.set(k, { slug: k, name: d, country: v.country || "", venues: [] });
    m.get(k).venues.push(v);
  }
  return [...m.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function describeVenue(v) {
  const bits = [`${v.name} is a padel venue in ${v.district || "the UK"}${v.postcode ? ` (${v.postcode})` : ""}`];
  if (v.courts) bits[0] += ` with ${v.courts.toLowerCase()} courts`;
  return bits[0] + ".";
}

function venuePage(origin, v, all) {
  const near = all.filter(x => x.id !== v.id).map(x => ({ ...x, d: miles(v.lat, v.lng, x.lat, x.lng) })).sort((a, b) => a.d - b.d).slice(0, 8);
  const site = httpsUrl(v.url), book = httpsUrl(v.book_url);
  const area = v.district ? { name: v.district, slug: slug(v.district) } : null;
  const title = `${v.name} padel courts${v.district ? `, ${v.district}` : ""} | All Access Padel`;
  const description = `${describeVenue(v)}${v.price ? ` Prices from ${v.price}.` : ""}${book ? ` Check availability and book on ${appOf(book)}.` : ""} Plus ${near.length} more padel courts nearby.`.slice(0, 300);
  const ld = {
    "@context": "https://schema.org", "@type": "SportsActivityLocation", name: v.name, sport: "Padel",
    url: `${origin}/venues/${v.id}`, ...(site ? { sameAs: [site] } : {}),
    address: { "@type": "PostalAddress", ...(v.postcode ? { postalCode: v.postcode } : {}), ...(v.district ? { addressLocality: v.district } : {}), addressRegion: v.country || undefined, addressCountry: "GB" },
    geo: { "@type": "GeoCoordinates", latitude: v.lat, longitude: v.lng },
    ...(v.tel ? { telephone: v.tel } : {}),
    ...(v.price ? { priceRange: v.price } : {}),
    ...(v.about ? { description: v.about } : {}),
    ...(book ? { potentialAction: { "@type": "ReserveAction", target: book, name: "Book a padel court" } } : {}),
  };
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Padel courts", item: `${origin}/padel-courts` },
    ...(area ? [{ "@type": "ListItem", position: 2, name: `Padel courts in ${area.name}`, item: `${origin}/padel-courts/${area.slug}` }] : []),
    { "@type": "ListItem", position: area ? 3 : 2, name: v.name, item: `${origin}/venues/${v.id}` }] };
  const body = `
<nav class="crumbs"><a href="/padel-courts">Padel courts</a>${area ? ` › <a href="/padel-courts/${area.slug}">${esc(area.name)}</a>` : ""} › ${esc(v.name)}</nav>
<h1>${esc(v.name)}</h1>
<p>${esc(describeVenue(v))}${v.lta ? " It's an LTA registered venue." : ""}</p>
${v.about ? `<p>${esc(v.about)}</p>` : ""}
<div class="facts">
  <div class="fact"><b>Courts</b>${esc(v.courts || "Not listed")}</div>
  <div class="fact"><b>Location</b>${esc([v.district, v.postcode].filter(Boolean).join(", ") || "UK")}</div>
  <div class="fact"><b>Price</b>${v.price ? esc(v.price) + (v.price_note ? `<br><span class="muted">${esc(v.price_note)}</span>` : "") : "Check when booking"}</div>
  <div class="fact"><b>How to book</b>${book ? esc(appOf(book)) : site ? "Venue website" : v.email || v.tel ? "Contact the venue" : "Contact the venue"}</div>
</div>
${v.deal ? `<p class="deal"><b>Deal:</b> ${esc(v.deal)}</p>` : ""}
<div class="btns">${book ? `<a class="btn y" href="${esc(book)}" rel="nofollow noopener" target="_blank">Check availability on ${esc(appOf(book))}</a>` : ""}${site && site !== book ? `<a class="btn b" href="${esc(site)}" rel="nofollow noopener" target="_blank">Venue website</a>` : ""}</div>
${v.email || v.tel ? `<p class="muted">Contact: ${esc([v.tel, v.email].filter(Boolean).join(" · "))}</p>` : ""}
<h2>Padel courts near ${esc(v.name)}</h2>
<ul class="list">${near.map(n => `<li><a href="/venues/${esc(n.id)}">${esc(n.name)}</a> <span class="muted">· ${n.d.toFixed(1)} miles · ${esc(n.district || "")}${n.courts ? " · " + esc(n.courts) : ""}</span></li>`).join("")}</ul>
<p class="muted" style="margin-top:24px">Distances are in a straight line. <a href="/">Find courts near your postcode</a>.</p>`;
  return page({ origin, path: `/venues/${v.id}`, title, description, body, jsonld: [ld, crumbs] });
}

function areaPage(origin, a, all) {
  const c = a.venues.reduce((s, v) => ({ lat: s.lat + v.lat / a.venues.length, lng: s.lng + v.lng / a.venues.length }), { lat: 0, lng: 0 });
  const others = all.filter(v => slug(v.district) !== a.slug).map(v => ({ ...v, d: miles(c.lat, c.lng, v.lat, v.lng) })).sort((x, y) => x.d - y.d).slice(0, 8);
  const priced = a.venues.filter(v => v.price).length, indoor = a.venues.filter(v => /indoor|covered/i.test(v.courts || "")).length;
  const n = a.venues.length;
  const title = `Padel courts in ${a.name} (${n} venue${n === 1 ? "" : "s"}, ${year()}) | All Access Padel`;
  const description = `There ${n === 1 ? "is 1 padel venue" : `are ${n} padel venues`} in ${a.name}${indoor ? `, ${indoor} with indoor or covered courts` : ""}. See locations, court types, prices and booking links.`;
  const faq = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [
    { "@type": "Question", name: `How many padel courts are there in ${a.name}?`, acceptedAnswer: { "@type": "Answer", text: `We list ${n} padel venue${n === 1 ? "" : "s"} in ${a.name}: ${a.venues.map(v => v.name).join(", ")}.` } },
    { "@type": "Question", name: `Are there indoor padel courts in ${a.name}?`, acceptedAnswer: { "@type": "Answer", text: indoor ? `Yes. ${a.venues.filter(v => /indoor|covered/i.test(v.courts || "")).map(v => v.name).join(", ")} ${indoor === 1 ? "has" : "have"} indoor or covered courts.` : `None of the ${a.name} venues we list have indoor or covered courts. The nearest alternatives are listed on this page.` } },
  ] };
  const list = { "@context": "https://schema.org", "@type": "ItemList", name: `Padel courts in ${a.name}`, numberOfItems: n,
    itemListElement: a.venues.map((v, i) => ({ "@type": "ListItem", position: i + 1, url: `${origin}/venues/${v.id}`, name: v.name })) };
  const body = `
<nav class="crumbs"><a href="/padel-courts">Padel courts</a> › ${esc(a.name)}</nav>
<h1>Padel courts in ${esc(a.name)}</h1>
<p>There ${n === 1 ? "is <b>1 padel venue</b>" : `are <b>${n} padel venues</b>`} in ${esc(a.name)}${a.country ? `, ${esc(a.country)}` : ""}${indoor ? `, and ${indoor} of them ${indoor === 1 ? "has" : "have"} indoor or covered courts for wet weather` : ""}.${priced ? ` We have prices for ${priced}.` : ""} Tap a venue for court details, prices and a link to check availability.</p>
<ul class="list">${a.venues.map(v => `<li><a href="/venues/${esc(v.id)}">${esc(v.name)}</a><br><span class="muted">${esc([v.postcode, v.courts].filter(Boolean).join(" · "))}${v.price ? " · " + esc(v.price) : ""}${v.book_url ? " · Book on " + esc(appOf(v.book_url)) : ""}</span></li>`).join("")}</ul>
<h2>More padel near ${esc(a.name)}</h2>
<ul class="list">${others.map(v => `<li><a href="/venues/${esc(v.id)}">${esc(v.name)}</a> <span class="muted">· ${esc(v.district || "")} · about ${Math.round(v.d)} miles</span></li>`).join("")}</ul>`;
  return page({ origin, path: `/padel-courts/${a.slug}`, title, description, body, jsonld: [list, faq] });
}

function indexPage(origin, areas, total) {
  const byCountry = {};
  for (const a of areas) (byCountry[a.country || "Other"] ||= []).push(a);
  const title = `Padel courts in the UK: all ${total} venues by area | All Access Padel`;
  const description = `Find a padel court anywhere in Britain. ${total} padel venues across ${areas.length} areas of England, Scotland and Wales, with court types, prices and booking links.`;
  const body = `<h1>Padel courts by area</h1>
<p>We list <b>${total} padel venues</b> across ${areas.length} areas of Great Britain. Pick an area to see its courts, or <a href="/">search by your postcode</a> to see the nearest courts on a map.</p>
${Object.keys(byCountry).sort().map(k => `<h2>${esc(k)}</h2><ul class="cols">${byCountry[k].map(a => `<li><a href="/padel-courts/${a.slug}">${esc(a.name)}</a> <span class="muted">(${a.venues.length})</span></li>`).join("")}</ul>`).join("")}`;
  return page({ origin, path: "/padel-courts", title, description, body, jsonld: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Padel courts by area", url: `${origin}/padel-courts` }] });
}

export async function seoRoute(request, env) {
  const url = new URL(request.url), p = url.pathname.replace(/\/+$/, "") || "/", origin = url.origin;
  if (!(p === "/padel-courts" || p.startsWith("/padel-courts/") || p.startsWith("/venues/") || p === "/sitemap.xml" || p === "/llms.txt" || p === "/robots.txt")) return null;
  if (p === "/robots.txt") return new Response(`# All Access Padel welcomes search engines and AI assistants.
User-agent: *
Allow: /
Disallow: /admin.html
Disallow: /api/

User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: Claude-User
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /

Sitemap: ${origin}/sitemap.xml
`, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=86400" } });
  if (!env.DB) return null;
  const all = await allVenues(env);
  const areas = areaGroups(all);

  if (p === "/sitemap.xml") {
    const urls = [`${origin}/`, `${origin}/padel-courts`, ...areas.map(a => `${origin}/padel-courts/${a.slug}`), ...all.map(v => `${origin}/venues/${v.id}`)];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${esc(u)}</loc></url>`).join("\n")}\n</urlset>`;
    return new Response(body, { headers: { "content-type": "application/xml", "cache-control": "public, max-age=3600" } });
  }
  if (p === "/llms.txt") {
    const body = `# All Access Padel

> A free, independent directory of padel courts across Great Britain (England, Scotland and Wales). It lists ${all.length} padel venues with location, court type (indoor, outdoor, covered), prices where published, deals, and links to check availability and book on each venue's booking system (Playtomic, MATCHi, ClubSpark, Nettla).

The venue list is built from the LTA's padel court finder plus our own research. Prices and offers change often; always confirm with the venue.

## Key pages
- [Find padel courts near a postcode](${origin}/): interactive search, map and filters
- [Padel courts by area](${origin}/padel-courts): every area with a padel venue, grouped by country
- [Sitemap](${origin}/sitemap.xml): every venue and area page

## Areas
${areas.map(a => `- [Padel courts in ${a.name}](${origin}/padel-courts/${a.slug}): ${a.venues.length} venue${a.venues.length === 1 ? "" : "s"}`).join("\n")}
`;
    return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
  }
  if (p === "/padel-courts") return html(indexPage(origin, areas, all.length));
  if (p.startsWith("/padel-courts/")) {
    const a = areas.find(x => x.slug === p.slice(14));
    return a ? html(areaPage(origin, a, all)) : null;
  }
  if (p.startsWith("/venues/")) {
    const v = all.find(x => x.id === decodeURIComponent(p.slice(8)));
    return v ? html(venuePage(origin, v, all)) : null;
  }
  return null;
}
