// Padel price comparison pages: /padel-prices (UK) and /padel-prices/<city> for cities with 3+ published prices.
import { courtPrice } from "./townpages.js";

const miles = (a, b, c, d) => { const R = 3959, r = x => x * Math.PI / 180, dl = r(c - a), dg = r(d - b), h = Math.sin(dl / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dg / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
export const PRICE_CITIES = ["london", "manchester", "birmingham", "leeds", "bristol", "glasgow", "edinburgh", "liverpool", "sheffield", "newcastle-upon-tyne", "nottingham", "leicester", "cardiff", "brighton", "oxford", "cambridge", "southampton", "reading", "york", "cheltenham"];
const MIN_PRICED = 3;
const gbp = n => `£${Number.isInteger(n) ? n : n.toFixed(2)}`;
const each = n => `£${(n / 4).toFixed(2).replace(/\.00$/, "")}`;

export function pricedVenues(venues) {
  return venues.map(v => ({ ...v, cp: courtPrice(v.price) })).filter(v => v.cp);
}

export function priceGroups(venues, towns) {
  const priced = pricedVenues(venues);
  const hubs = PRICE_CITIES.map(s => towns.find(t => t.slug === s)).filter(Boolean);
  const groups = hubs.map(h => ({ hub: h, R: h.slug === "london" ? 15 : 20, items: [] }));
  for (const v of priced) {
    let best = null;
    for (const g of groups) { const d = miles(g.hub.lat, g.hub.lng, v.lat, v.lng); if (d <= g.R && (!best || d < best.d)) best = { g, d }; }
    if (best) best.g.items.push({ ...v, d: best.d });
  }
  for (const g of groups) g.items.sort((a, b) => a.cp[0] - b.cp[0] || a.cp[1] - b.cp[1]);
  return { priced, groups: groups.filter(g => g.items.length) };
}
export const cityPages = (venues, towns) => priceGroups(venues, towns).groups.filter(g => g.items.length >= MIN_PRICED);

const stats = items => {
  const lo = Math.min(...items.map(v => v.cp[0])), hi = Math.max(...items.map(v => v.cp[1]));
  const mid = items.map(v => (v.cp[0] + v.cp[1]) / 2).sort((a, b) => a - b);
  const median = mid.length % 2 ? mid[(mid.length - 1) / 2] : (mid[mid.length / 2 - 1] + mid[mid.length / 2]) / 2;
  return { lo, hi, median: Math.round(median) };
};

const CSS = `<style>
.ptable{width:100%;border-collapse:collapse;font-size:15px;background:var(--card);border:2px solid var(--line)}
.ptable th{background:var(--navy);color:#fff;text-align:left;padding:10px}.ptable td{padding:10px;border-top:1px solid var(--line);vertical-align:top}
.ptable td.n{white-space:nowrap;font-weight:700}.ptable a{color:inherit;font-weight:700}.ptable small{display:block;color:var(--muted)}
.cheap{background:var(--ball);color:var(--navy);font-size:12px;font-weight:700;padding:2px 6px;border-radius:3px;margin-left:6px}
.scroll{overflow-x:auto}.cities{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
.city{display:block;background:var(--card);border:2px solid var(--line);border-radius:4px;padding:12px 14px;color:inherit;text-decoration:none}.city b{font:italic 800 24px/1 "Barlow Condensed",sans-serif;display:block}
.qa h3{font-size:18px;margin:16px 0 4px}.qa p{margin:0}
</style>`;

function table(items, esc, showArea) {
  return `<div class="scroll"><table class="ptable"><thead><tr><th>Venue</th><th>Court per hour</th><th>Each (4 players)</th>${showArea ? "<th>Area</th>" : ""}<th>Courts</th></tr></thead><tbody>
${items.map((v, i) => `<tr><td><a href="/venues/${esc(v.id)}">${esc(v.name)}</a>${i === 0 ? `<span class="cheap">Cheapest</span>` : ""}${v.price_note ? `<small>${esc(v.price_note)}</small>` : ""}</td>
<td class="n">${v.cp[0] === v.cp[1] ? gbp(v.cp[0]) : `${gbp(v.cp[0])}–${gbp(v.cp[1])}`}</td><td class="n">${v.cp[0] === v.cp[1] ? each(v.cp[0]) : `${each(v.cp[0])}–${each(v.cp[1])}`}</td>
${showArea ? `<td>${esc(v.district || "")}</td>` : ""}<td>${esc(v.courts || "")}</td></tr>`).join("\n")}
</tbody></table></div>`;
}

export function pricesIndex({ origin, venues, towns, esc, page, year }) {
  const { priced, groups } = priceGroups(venues, towns);
  const all = [...priced].sort((a, b) => a.cp[0] - b.cp[0]);
  const s = stats(all), pages = groups.filter(g => g.items.length >= MIN_PRICED);
  const cheapest = all[0];
  const title = `Padel prices UK (${year()}): court hire costs at ${priced.length} clubs compared | All Access Padel`;
  const description = `How much does padel cost? We compare published court prices at ${priced.length} UK padel clubs: from ${gbp(s.lo)} to ${gbp(s.hi)} per court per hour, typically about ${gbp(s.median)} (${each(s.median)} each for four).`;
  const qa = [
    ["How much does it cost to hire a padel court in the UK?", `Across the ${priced.length} clubs with published prices, court hire runs from ${gbp(s.lo)} to ${gbp(s.hi)} an hour, with a middle price of about ${gbp(s.median)}. Split between four players, that's around ${each(s.median)} each.`],
    ["Where is the cheapest padel in the UK?", `Of the prices we've collected, the lowest is at ${cheapest.name} (${cheapest.price}). Off-peak weekday daytime slots are the cheapest almost everywhere.`],
    ["Why is padel more expensive in London?", "Land and building costs are much higher, and demand at peak times is huge. Central London courts often cost £60 to £90 an hour at peak, while clubs outside the big cities often charge £20 to £40."],
    ["How can I play padel for less?", "Book off-peak (weekday mornings and early afternoons), look for council and leisure-centre courts, join a club's membership if you play weekly, and try free taster sessions. Racket hire is usually £2 to £5."],
  ];
  const body = `${CSS}<nav class="crumbs"><a href="/">Home</a> › Padel prices</nav>
<h1>Padel prices in the UK</h1>
<p class="lead">We compare the published court prices at <b>${priced.length} UK padel clubs</b>. A court costs from <b>${gbp(s.lo)}</b> to <b>${gbp(s.hi)}</b> an hour, and the typical price is about <b>${gbp(s.median)}</b>. A court is shared by four players, so that's roughly <b>${each(s.median)} each</b>.</p>
<p>Prices vary most by time: weekday mornings and early afternoons are off-peak and can be half the price of evenings and weekends. Members usually pay less. For the full picture, read <a href="/guides/how-much-does-padel-cost-uk">how much padel costs in the UK</a>.</p>
${pages.length ? `<h2>Padel prices by city</h2><div class="cities">${pages.map(g => { const t = stats(g.items); return `<a class="city" href="/padel-prices/${esc(g.hub.slug)}"><b>${esc(g.hub.name)}</b>${gbp(t.lo)}–${gbp(t.hi)} per court/hr<br><span class="muted">${g.items.length} clubs compared</span></a>`; }).join("")}</div>` : ""}
<h2>Every published padel price, cheapest first</h2>
${table(all, esc, true)}
<p class="muted">Prices are per court for one hour, as published by each club or reported by recent guides (collected November 2026). Ranges run from off-peak to peak for non-members. Prices change often, so always check when you book. Run a club? <a href="/for-clubs">Update your prices</a>.</p>
<h2>Padel prices: common questions</h2>
<div class="qa">${qa.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("")}</div>`;
  return page({ origin, path: "/padel-prices", title, description, body, jsonld: [
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: qa.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@context": "https://schema.org", "@type": "ItemList", name: "Padel court prices in the UK", itemListElement: all.slice(0, 50).map((v, i) => ({ "@type": "ListItem", position: i + 1, url: `${origin}/venues/${v.id}`, name: v.name })) }] });
}

export function cityPricePage({ origin, g, venues, esc, page, year }) {
  const { hub, R, items } = g, s = stats(items), cheapest = items[0];
  const dear = [...items].sort((a, b) => b.cp[1] - a.cp[1])[0];
  const unpriced = venues.filter(v => !courtPrice(v.price)).map(v => ({ ...v, d: miles(hub.lat, hub.lng, v.lat, v.lng) })).filter(v => v.d <= R).sort((a, b) => a.d - b.d);
  const title = `Padel prices in ${hub.name} (${year()}): ${items.length} clubs compared | All Access Padel`;
  const description = `Padel court hire in ${hub.name} costs ${gbp(s.lo)}–${gbp(s.hi)} an hour across ${items.length} clubs, typically about ${gbp(s.median)} (${each(s.median)} each). Cheapest: ${cheapest.name}.`;
  const qa = [
    [`How much does padel cost in ${hub.name}?`, `Across the ${items.length} clubs in and around ${hub.name} that publish prices, a court costs ${gbp(s.lo)} to ${gbp(s.hi)} an hour. The typical price is about ${gbp(s.median)}, or ${each(s.median)} each for four players.`],
    [`What is the cheapest padel court in ${hub.name}?`, `${cheapest.name}, from ${gbp(cheapest.cp[0])} a court per hour (${each(cheapest.cp[0])} each), usually off-peak.`],
    [`What is the most expensive padel in ${hub.name}?`, `${dear.name}, where peak court hire reaches ${gbp(dear.cp[1])} an hour.`],
    [`When is padel cheapest in ${hub.name}?`, "Weekday mornings and early afternoons. Evenings from about 5pm and weekends are peak and cost the most."],
  ];
  const body = `${CSS}<nav class="crumbs"><a href="/padel-prices">Padel prices</a> › ${esc(hub.name)}</nav>
<h1>Padel prices in ${esc(hub.name)}</h1>
<p class="lead">We compared published court prices at <b>${items.length} padel clubs</b> within ${R} miles of ${esc(hub.name)}. A court costs <b>${gbp(s.lo)} to ${gbp(s.hi)}</b> an hour, with a typical price of about <b>${gbp(s.median)}</b>, which is roughly <b>${each(s.median)} each</b> for four players.</p>
<p>The cheapest is <a href="/venues/${esc(cheapest.id)}">${esc(cheapest.name)}</a> from ${gbp(cheapest.cp[0])} an hour. ${dear.id !== cheapest.id ? `At the top end, <a href="/venues/${esc(dear.id)}">${esc(dear.name)}</a> charges up to ${gbp(dear.cp[1])} at peak.` : ""}</p>
<div class="btns"><a class="btn y" href="/padel/${esc(hub.slug)}">All padel courts near ${esc(hub.name)}</a><a class="btn" href="/padel-prices">UK price comparison</a></div>
<h2>${esc(hub.name)} padel prices, cheapest first</h2>
${table(items, esc, true)}
${unpriced.length ? `<h2>Other clubs near ${esc(hub.name)}</h2><p>These clubs don't publish prices online, so check when you book.</p><ul class="cols">${unpriced.slice(0, 24).map(v => `<li><a href="/venues/${esc(v.id)}">${esc(v.name)}</a> <span class="muted">(${Math.round(v.d)} mi)</span></li>`).join("")}</ul>` : ""}
<h2>Common questions</h2>
<div class="qa">${qa.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("")}</div>
<p class="muted">Prices are per court for one hour for non-members, from off-peak to peak, as published by each club or reported by recent guides (collected November 2026). They change often, so check when you book.</p>`;
  return page({ origin, path: `/padel-prices/${hub.slug}`, title, description, body, jsonld: [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Padel prices", item: `${origin}/padel-prices` }, { "@type": "ListItem", position: 2, name: hub.name, item: `${origin}/padel-prices/${hub.slug}` }] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: qa.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }] });
}
