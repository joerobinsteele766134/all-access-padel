// "Padel courts in <town>" pages: one per UK town, built from the venue data.
// Towns live in D1 (table `towns`); coordinates come from the postcodes.io places API the first time
// a town is needed, then stay cached in D1.
import { TOWN_LIST } from "./towns.js";

const miles = (a, b, c, d) => { const R = 3959, r = x => x * Math.PI / 180, dl = r(c - a), dg = r(d - b), h = Math.sin(dl / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dg / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
const RANK = { City: 0, Town: 1, "Other Settlement": 2, "Suburban Area": 3, Village: 4, Hamlet: 5 };
const norm = s => String(s || "").toLowerCase().replace(/[^a-z]/g, "");

// Price text like "£24–£38 per court/hr" or "£7–£8 per player/hr" → court-per-hour [min, max] in £.
export function courtPrice(p) {
  const s = String(p || ""); if (!s.includes("£")) return null;
  const nums = [...s.matchAll(/£\s*(\d+(?:\.\d+)?)/g)].map(m => +m[1]); if (!nums.length) return null;
  const k = /per\s+(player|person)|each/i.test(s) ? 4 : 1;
  return [Math.min(...nums) * k, Math.max(...nums) * k];
}

export async function loadTowns(env) {
  try { return (await env.DB.prepare("SELECT slug, name, region, lat, lng FROM towns WHERE lat IS NOT NULL").all()).results; }
  catch { return []; }
}

// Geocode up to `limit` towns that don't have coordinates yet. Safe to call repeatedly.
export async function resolveTowns(env, limit = 25) {
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS towns (slug TEXT PRIMARY KEY, name TEXT NOT NULL, region TEXT, lat REAL, lng REAL, tries INTEGER DEFAULT 0, note TEXT)").run();
  await env.DB.batch(TOWN_LIST.map(t => env.DB.prepare("INSERT OR IGNORE INTO towns (slug, name, region) VALUES (?, ?, ?)").bind(t.slug, t.name, t.region)));
  const { results } = await env.DB.prepare("SELECT slug, name, region FROM towns WHERE lat IS NULL AND tries < 3 LIMIT ?").bind(limit).all();
  const done = [];
  for (const t of results) {
    let hit = null, note = "";
    try {
      const r = await fetch(`https://api.postcodes.io/places?q=${encodeURIComponent(t.name)}&limit=25`);
      const j = await r.json();
      const cands = (j.result || []).filter(p => RANK[p.local_type] !== undefined && (p.region === t.region || p.country === t.region || (t.region === "London" && p.region === "London")));
      const exact = cands.filter(p => norm(p.name_1) === norm(t.name));
      hit = (exact.length ? exact : cands).sort((a, b) => RANK[a.local_type] - RANK[b.local_type])[0] || null;
      note = hit ? `${hit.name_1} (${hit.local_type}, ${hit.county_unitary || hit.district_borough || hit.region || hit.country})` : "no match";
    } catch (e) { note = "lookup failed"; }
    await env.DB.prepare("UPDATE towns SET lat = ?, lng = ?, tries = tries + 1, note = ? WHERE slug = ?").bind(hit ? hit.latitude : null, hit ? hit.longitude : null, note, t.slug).run();
    done.push({ slug: t.slug, note });
  }
  const left = (await env.DB.prepare("SELECT COUNT(*) AS n FROM towns WHERE lat IS NULL AND tries < 3").first()).n;
  return { resolved: done, remaining: left };
}

const radiusFor = t => (t.region === "London" ? 4 : 15);
export function townData(t, venues) {
  const R = radiusFor(t);
  const near = venues.map(v => ({ ...v, d: miles(t.lat, t.lng, v.lat, v.lng) })).sort((a, b) => a.d - b.d);
  const within = near.filter(v => v.d <= R);
  return { R, near, within };
}

export function nearestTowns(lat, lng, towns, n = 3, exclude = "") {
  return towns.filter(t => t.slug !== exclude).map(t => ({ ...t, d: miles(lat, lng, t.lat, t.lng) })).sort((a, b) => a.d - b.d).slice(0, n);
}

const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;
const list = names => names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
const isIndoor = v => /indoor|covered/i.test(v.courts || "");

export function townPage({ origin, t, venues, towns, esc, page, year, appOf, area }) {
  const { R, near, within } = townData(t, venues);
  const shown = within.length ? within.slice(0, 30) : near.slice(0, 8);
  const n = within.length, close = within.filter(v => v.d <= 5).length;
  const indoor = within.filter(isIndoor), deals = within.filter(v => v.deal), book = within.filter(v => v.book_url);
  const prices = within.map(v => ({ v, p: courtPrice(v.price) })).filter(x => x.p);
  const cheapest = prices.sort((a, b) => a.p[0] - b.p[0])[0];
  const first = near[0];
  const nearby = nearestTowns(t.lat, t.lng, towns, 12, t.slug).filter(o => townData(o, venues).within.length).slice(0, 8);
  const where = t.region === "London" ? `${t.name}, London` : t.name;
  const title = n
    ? `Padel courts in ${t.name} (${year()}): ${plural(n, "venue", "venues")} within ${R} miles | All Access Padel`
    : `Padel near ${t.name} (${year()}): nearest courts | All Access Padel`;
  const description = n
    ? `${plural(n, "padel venue", "padel venues")} within ${R} miles of ${t.name}${indoor.length ? `, ${indoor.length} with indoor or covered courts` : ""}. Nearest is ${first.name} (${first.d < 1 ? "under a mile" : `${first.d.toFixed(1)} miles`}). Prices, deals and booking links.`
    : `There are no padel courts within ${R} miles of ${t.name} yet. The nearest is ${first.name}, about ${Math.round(first.d)} miles away. See every option nearby.`;

  const intro = n
    ? `<p class="lead">There ${n === 1 ? "is <b>1 padel venue</b>" : `are <b>${n} padel venues</b>`} within ${R} miles of ${esc(where)}${close && R > 5 ? `, and ${close} of them ${close === 1 ? "is" : "are"} within 5 miles` : ""}. The nearest is <a href="/venues/${esc(first.id)}">${esc(first.name)}</a>, ${first.d < 1 ? "less than a mile" : `about ${first.d.toFixed(1)} miles`} away.</p>
<p>${indoor.length ? `${indoor.length === n ? "All of them have" : `${plural(indoor.length, "venue has", "venues have")}`} indoor or covered courts, so you can still play when it rains.` : `They're all outdoor courts, so check the forecast. The nearest indoor court is ${(() => { const i = near.find(isIndoor); return i ? `<a href="/venues/${esc(i.id)}">${esc(i.name)}</a>, about ${Math.round(i.d)} miles away` : "further afield"; })()}.`} ${book.length ? `${plural(book.length, "venue lets", "venues let")} you check availability and book online.` : ""} ${cheapest ? `The lowest published price nearby is ${esc(cheapest.v.price)} at ${esc(cheapest.v.name)}.` : `Most clubs near ${esc(t.name)} show their prices when you book. Across the UK a court usually costs £20 to £48 an hour off-peak, split between four players (<a href="/guides/how-much-does-padel-cost-uk">see our cost guide</a>).`}</p>`
    : `<p class="lead">We don't know of any padel courts within ${R} miles of ${esc(where)} yet. The nearest is <a href="/venues/${esc(first.id)}">${esc(first.name)}</a>, about ${Math.round(first.d)} miles away. Here are the closest options.</p><p>Know of a court near ${esc(t.name)}? <a href="/#add">Tell us</a> and we'll add it.</p>`;

  const rows = shown.map(v => {
    const facts = [v.courts, v.price, v.lta ? "LTA registered" : ""].filter(Boolean).map(esc).join(" · ");
    return `<li><div class="trow"><div class="tmi"><b>${v.d < 1 ? "<1" : Math.round(v.d)}</b><small>miles</small></div><div class="tbody">
<a class="tname" href="/venues/${esc(v.id)}">${esc(v.name)}</a>${v.featured ? ` <span class="featured">Featured</span>` : ""}
<span class="muted">${esc([v.postcode, v.district].filter(Boolean).join(" · "))}</span>
${facts ? `<span>${facts}</span>` : ""}${v.deal ? `<span class="tdeal"><b>Deal:</b> ${esc(v.deal)}</span>` : ""}
<span class="tlinks"><a href="/venues/${esc(v.id)}">Details &amp; reviews</a>${/^https:\/\//.test(v.book_url || "") ? ` · <a href="${esc(v.book_url)}" rel="noopener" target="_blank">Book on ${esc(appOf(v.book_url))}</a>` : ""}</span></div></div></li>`;
  }).join("");

  const qa = [
    [`Where can I play padel in ${t.name}?`, n ? `There ${n === 1 ? "is 1 padel venue" : `are ${n} padel venues`} within ${R} miles of ${t.name}. The closest are ${list(within.slice(0, 3).map(v => `${v.name} (${v.d < 1 ? "under a mile" : `${Math.round(v.d)} miles`})`))}.` : `There are no padel courts within ${R} miles of ${t.name} yet. The nearest is ${first.name}, about ${Math.round(first.d)} miles away.`],
    [`Is there indoor padel near ${t.name}?`, indoor.length ? `Yes. ${list(indoor.slice(0, 4).map(v => v.name))} ${indoor.length === 1 ? "has" : "have"} indoor or covered courts within ${R} miles${indoor.length > 4 ? `, plus ${indoor.length - 4} more` : ""}.` : (() => { const i = near.find(isIndoor); return i ? `Not within ${R} miles. The nearest indoor or covered courts are at ${i.name}, about ${Math.round(i.d)} miles away.` : `We don't know of indoor courts nearby yet.`; })()],
    [`How much does padel cost in ${t.name}?`, prices.length ? `Published prices within ${R} miles range from £${Math.round(Math.min(...prices.map(x => x.p[0])))} to £${Math.round(Math.max(...prices.map(x => x.p[1])))} per court per hour, split between four players. Peak times (evenings and weekends) cost more.` : `Most venues near ${t.name} show prices when you book. Across the UK, a court typically costs £20 to £48 an hour off-peak and more at peak times, which works out at £5 to £12 each for four players.`],
    [`Can I book padel online near ${t.name}?`, book.length ? `Yes. ${list(book.slice(0, 4).map(v => `${v.name} (${appOf(v.book_url)})`))} ${book.length === 1 ? "takes" : "take"} online bookings.` : `Most venues near ${t.name} take bookings by phone or through their own website. Each listing has the contact details.`],
    [`Are there any padel deals near ${t.name}?`, deals.length ? `Yes: ${deals.slice(0, 3).map(v => `${v.name}: ${v.deal}`).join(" ")}` : `We haven't found any current offers near ${t.name}. Many clubs run free or cheap beginner sessions, so it's worth asking.`],
  ];
  const faq = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: qa.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Padel courts", item: `${origin}/padel` },
    { "@type": "ListItem", position: 2, name: t.name, item: `${origin}/padel/${t.slug}` }] };
  const itemList = { "@context": "https://schema.org", "@type": "ItemList", name: `Padel courts near ${t.name}`, numberOfItems: shown.length,
    itemListElement: shown.map((v, i) => ({ "@type": "ListItem", position: i + 1, url: `${origin}/venues/${v.id}`, name: v.name })) };

  const body = `<style>
ul.tl{list-style:none;padding:0;margin:0;display:grid;gap:10px}.trow{display:flex;background:var(--card);border:2px solid var(--line);border-radius:4px;overflow:hidden}
.tmi{flex:none;width:70px;background:var(--navy);color:var(--ball);display:flex;flex-direction:column;align-items:center;justify-content:center}.tmi b{font:italic 900 30px/1 "Barlow Condensed",sans-serif}.tmi small{color:#fff;font-size:12px}
.tbody{padding:10px 14px;display:flex;flex-direction:column;gap:2px;font-size:15px}.tname{font-weight:700;font-size:18px;color:inherit}.tdeal{background:var(--ball);color:var(--navy);padding:4px 8px;border-radius:3px;margin-top:4px}.tlinks a{color:inherit;font-weight:700}
.btns .btn:not(.y){color:inherit}.qa h3{font-size:18px;margin:16px 0 4px}.qa p{margin:0}.kitband{background:var(--navy);color:#fff;border-radius:6px;padding:16px 18px;margin:28px 0}.kitband a{color:var(--ball);font-weight:700}
</style>
<nav class="crumbs"><a href="/padel">Padel courts</a> › ${esc(t.name)}</nav>
<h1>Padel courts ${n ? "in" : "near"} ${esc(t.name)}</h1>
${intro}
${n ? `<div class="facts"><div class="fact"><b>Within ${R} miles</b>${plural(n, "venue", "venues")}</div><div class="fact"><b>Indoor or covered</b>${indoor.length}</div><div class="fact"><b>Book online</b>${book.length}</div><div class="fact"><b>Deals</b>${deals.length}</div></div>` : ""}
<div class="btns"><a class="btn y" href="/?loc=${encodeURIComponent(t.name)}#courts">Filter &amp; map these courts</a>${area ? `<a class="btn" href="/padel-courts/${esc(area.slug)}">All courts in ${esc(area.name)}</a>` : ""}</div>
<h2>${n ? `Padel venues near ${esc(t.name)}, nearest first` : `Nearest padel courts to ${esc(t.name)}`}</h2>
<ul class="tl">${rows}</ul>
${n > shown.length ? `<p class="muted">Showing the nearest ${shown.length}. <a href="/?loc=${encodeURIComponent(t.name)}#courts">See all ${n}</a>.</p>` : ""}
<div class="kitband">New to padel? You don't need your own racket to start, as most clubs hire them out. When you're ready, see <a href="/guides/best-beginner-padel-rackets">the best beginner rackets</a> or browse <a href="/kit">the kit shop</a>.</div>
<h2>Padel in ${esc(t.name)}: common questions</h2>
<div class="qa">${qa.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("")}</div>
${nearby.length ? `<h2>Padel in nearby towns</h2><ul class="cols">${nearby.map(o => `<li><a href="/padel/${esc(o.slug)}">Padel in ${esc(o.name)}</a> <span class="muted">(${Math.round(o.d)} miles)</span></li>`).join("")}</ul>` : ""}
<p class="muted">Distances are in a straight line from the centre of ${esc(t.name)}. Prices and offers change, so check with the venue before you go.</p>`;
  return page({ origin, path: `/padel/${t.slug}`, title, description, body, jsonld: [crumbs, itemList, faq], robots: n ? "" : "noindex,follow" });
}

export function townsIndex({ origin, towns, venues, esc, page }) {
  const groups = {};
  const withN = towns.map(t => ({ ...t, n: townData(t, venues).within.length })).filter(t => t.n);
  for (const t of withN) (groups[t.region] ||= []).push(t);
  const order = ["London", "South East", "South West", "East of England", "West Midlands", "East Midlands", "North West", "North East", "Yorkshire and The Humber", "Wales", "Scotland", "Northern Ireland"];
  const body = `<h1>Padel courts by town</h1>
<p class="lead">Pick your town to see every padel court nearby, nearest first, with indoor options, prices, deals and booking links. Or <a href="/">search by postcode</a>.</p>
${order.filter(r => groups[r]).map(r => `<h2>${esc(r)}</h2><ul class="cols">${groups[r].sort((a, b) => a.name.localeCompare(b.name)).map(t => `<li><a href="/padel/${esc(t.slug)}">Padel in ${esc(t.name)}</a> <span class="muted">(${t.n})</span></li>`).join("")}</ul>`).join("")}
<p>Looking by council area instead? See <a href="/padel-courts">padel courts by area</a>.</p>`;
  return page({ origin, path: "/padel", title: "Padel courts near you: every UK town | All Access Padel",
    description: `Find padel courts near ${withN.length} UK towns and cities, from London and Manchester to Witney and St Andrews. Nearest courts, indoor options, prices and booking links.`,
    body, jsonld: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Padel courts by town", url: `${origin}/padel` }] });
}

export const townsWithCourts = (towns, venues) => towns.filter(t => townData(t, venues).within.length);
