// Server-rendered pages for search engines and AI crawlers:
// /venues/:id, /padel-courts, /padel-courts/:area, /sitemap.xml, /llms.txt
import { GUIDES } from "./guides.js";
import { KIT, kitBody } from "./kit.js";
import { pricesIndex, cityPricePage, cityPages } from "./prices.js";
import { forClubsPage, badgeSvg } from "./forclubs.js";
import { aboutPage, privacyPage, addPage } from "./pages.js";
import { loadTowns, townPage, townsIndex, townsWithCourts, nearestTowns } from "./townpages.js";
import { latestNews, newsBody, newsRss, newsCard, NEWS_CSS, KINDS } from "./news.js";
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const slug = s => String(s || "").toLowerCase().normalize("NFKD").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const miles = (a, b, c, d) => { const R = 3959, r = x => x * Math.PI / 180, dl = r(c - a), dg = r(d - b), h = Math.sin(dl / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dg / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
const httpsUrl = u => { u = String(u || "").trim(); if (!u || /\s|@/.test(u) || !u.includes(".")) return ""; return /^https?:\/\//i.test(u) ? u.replace(/^http:/i, "https:") : "https://" + u; };
const appOf = u => { const h = (u || "").toLowerCase(); return h.includes("playtomic") ? "Playtomic" : h.includes("matchi") ? "MATCHi" : h.includes("nettla") ? "Nettla" : (h.includes("clubspark") || h.includes("lta.org.uk")) ? "ClubSpark" : "the booking page"; };
export const FAC = { parking: "Parking", changing: "Changing rooms", cafe: "Café", bar: "Bar", racket_hire: "Racket hire", floodlit: "Floodlit", open_late: "Open late", accessible: "Step-free access", shop: "Shop", coaching: "Coaching", singles: "Singles court", pay_play: "Pay and play" };
const facList = f => String(f || "").split(",").map(x => x.trim()).filter(x => FAC[x]);
const stars = n => "★★★★★".slice(0, Math.round(n)) + "☆☆☆☆☆".slice(0, 5 - Math.round(n));
const year = () => new Date().getFullYear();

async function allVenues(env) {
  const { results } = await env.DB.prepare(
    "SELECT id, name, postcode, lat, lng, district, country, courts, lta, url, email, tel, about, deal, price, price_note, book_url, updated, hours, facilities, claimed, CASE WHEN featured_until > strftime('%s','now')*1000 THEN 1 ELSE 0 END AS featured FROM venues ORDER BY name"
  ).all();
  return results;
}

const page = ({ origin, path, title, description, body, jsonld = [], robots = "" }) => `<!DOCTYPE html>
<html lang="en-GB"><head><meta charset="utf-8"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest"><meta name="theme-color" content="#0d1b3d"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">${robots ? `<meta name="robots" content="${robots}">` : ""}
<link rel="canonical" href="${origin}${path}"><link rel="alternate" type="application/rss+xml" title="UK padel news" href="/news.xml">
<meta property="og:type" content="website"><meta property="og:site_name" content="All Access Padel">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${origin}${path}">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@1,800;1,900&family=Barlow:wght@400;500;700&display=swap">
<style>
:root{color-scheme:light dark;--bg:light-dark(#f3f1ea,#0a1430);--ink:light-dark(#0d1b3d,#eef1f8);--muted:light-dark(#4d5673,#a3adc8);--card:light-dark(#fff,#111f45);--line:light-dark(#0d1b3d,#2b3d6e);--navy:#0d1b3d;--ball:#e4ff3a;--court:#2457d6}
*{box-sizing:border-box;min-width:0}body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.6 Barlow,system-ui,sans-serif}
header{background:var(--navy);padding:8px max(5vw,16px);display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:20}header .logo{color:#fff;text-decoration:none;font:italic 900 24px "Barlow Condensed",sans-serif;flex:none}header .logo i{color:var(--ball);font-style:inherit}
header nav{display:flex;gap:2px;overflow-x:auto;scrollbar-width:none;margin-left:auto;-webkit-mask-image:linear-gradient(90deg,#000 85%,transparent);mask-image:linear-gradient(90deg,#000 85%,transparent);padding-right:24px}header nav a{flex:none;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:10px 10px;border-radius:6px}header nav a:hover{background:rgba(255,255,255,.1)}header nav a.k{background:var(--ball);color:var(--navy);padding:6px 10px;align-self:center}
@media(min-width:900px){header nav{mask-image:none;-webkit-mask-image:none;padding-right:0}}
.status:empty{display:none}main .facts{grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr))}@media(max-width:700px){main .facts{grid-template-columns:1fr 1fr}header .logo{font-size:19px}}
.acts{display:flex;flex-wrap:wrap;gap:10px;margin:14px 0 18px}.acts .btn{min-height:48px}
.actbar{display:none}@media(max-width:700px){.actbar{display:flex;gap:8px;position:fixed;left:0;right:0;bottom:0;z-index:30;background:var(--navy);padding:10px 12px calc(10px + env(safe-area-inset-bottom))}.actbar .btn{flex:1;justify-content:center;min-height:46px;font-size:15px}body.hasbar{padding-bottom:76px}}
main{max-width:960px;margin:0 auto;padding:28px max(5vw,16px) 56px}
h1{font:italic 900 clamp(36px,6vw,56px)/1 "Barlow Condensed",sans-serif;text-transform:uppercase;margin:0 0 12px}
h2{font:italic 800 28px/1.1 "Barlow Condensed",sans-serif;margin:32px 0 10px}
p{max-width:68ch}.muted{color:var(--muted)}.crumbs{font-size:14px;color:var(--muted);margin-bottom:14px}.crumbs a{color:inherit}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:18px 0}
.fact{background:var(--card);border:2px solid var(--line);border-radius:4px;padding:12px 14px}.fact b{display:block;font-size:13px;color:var(--muted);font-weight:700}
.btns{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0}
.btn{display:inline-flex;align-items:center;min-height:46px;padding:0 18px;border-radius:6px;font-weight:700;text-decoration:none;border:2px solid var(--navy);color:inherit}
.btn.y{background:var(--ball);color:var(--navy)}.btn.b{background:var(--court);color:#fff;border-color:var(--court)}
.deal{background:var(--ball);color:var(--navy);padding:12px 14px;border-radius:4px;max-width:68ch}
ul.list{list-style:none;padding:0;margin:0;display:grid;gap:10px}
ul.list li{background:var(--card);border:2px solid var(--line);border-radius:4px;padding:12px 14px}
ul.list a{color:inherit;font-weight:700}
.cols{columns:3 220px;padding:0;list-style:none}.cols li{margin:0 0 6px;break-inside:avoid}.cols a{color:inherit}
table{border-collapse:collapse;width:100%;margin:12px 0;font-size:15px}th,td{border-bottom:1px solid var(--line);padding:8px;text-align:left;vertical-align:top}th{font-weight:700}
.lead{font-size:19px}
.picks{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:14px}.pick{background:var(--card);border:2px solid var(--line);border-radius:4px;padding:14px}.pick h3{margin:0 0 6px;font:italic 800 22px/1.1 "Barlow Condensed",sans-serif}
.stars{color:#f5a400;letter-spacing:1px}.rev{background:var(--card);border:2px solid var(--line);border-radius:4px;padding:12px 14px;margin-bottom:10px}.rev p{margin:4px 0}
form.box{background:var(--card);border:2px solid var(--line);border-radius:4px;padding:16px;display:grid;gap:10px;max-width:640px}
form.box label{font-weight:700;font-size:14px}form.box input,form.box textarea,form.box select{width:100%;font:16px Barlow,sans-serif;min-height:44px;padding:8px 10px;border:2px solid var(--line);border-radius:4px;background:var(--bg);color:var(--ink)}
form.box textarea{min-height:110px}.rate{display:flex;gap:6px}.rate button{font-size:26px;background:none;border:0;cursor:pointer;color:#c9c9c9;min-width:44px;min-height:44px}.rate button.on{color:#f5a400}
.hp{position:absolute;left:-9999px;width:1px;height:1px}.status{font-weight:700;min-height:1.4em}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.tag{font-size:14px;font-weight:700;padding:3px 10px;border-radius:3px;background:light-dark(#e7e4d8,#16285a)}
.featured{display:inline-block;background:var(--court);color:#fff;font-weight:700;font-size:13px;padding:2px 8px;border-radius:3px}
footer{background:var(--navy);color:#c9d1e6;padding:24px max(5vw,16px);font-size:14px}footer a{color:#fff}
</style>
${jsonld.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`).join("\n")}
</head><body>
<header><a class="logo" href="/">ALL ACCESS <i>PADEL</i></a><nav aria-label="Main"><a href="/#courts">Find courts</a><a href="/padel">Towns</a><a href="/padel-prices">Prices</a><a href="/guides">Guides</a><a href="/news">News</a><a class="k" href="/kit">Kit shop</a></nav></header>
<main>${body}</main>
<footer><p><a href="/">Find padel courts near you</a> · <a href="/padel">Padel by town</a> · <a href="/padel-prices">Padel prices</a> · <a href="/for-clubs">For clubs</a> · <a href="/about">About &amp; contact</a> · <a href="/privacy">Privacy</a> · <a href="/padel-courts">Padel courts by area</a> · <a href="/guides">Guides</a> · <a href="/kit">Kit shop</a> · <a href="/news">News</a></p>
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

function venuePage(origin, v, all, reviews = []) {
  const avg = reviews.length ? Math.round(reviews.reduce((a, r) => a + r.rating, 0) / reviews.length * 10) / 10 : 0;
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
    ...(v.hours ? { openingHours: v.hours } : {}),
    ...(facList(v.facilities).length ? { amenityFeature: facList(v.facilities).map(f => ({ "@type": "LocationFeatureSpecification", name: FAC[f], value: true })) } : {}),
    ...(reviews.length ? { aggregateRating: { "@type": "AggregateRating", ratingValue: avg, reviewCount: reviews.length, bestRating: 5, worstRating: 1 },
      review: reviews.slice(0, 10).map(r => ({ "@type": "Review", author: { "@type": "Person", name: r.name }, datePublished: new Date(r.created).toISOString().slice(0, 10), reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 }, ...(r.title ? { name: r.title } : {}), reviewBody: r.body })) } : {}),
  };
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Padel courts", item: `${origin}/padel-courts` },
    ...(area ? [{ "@type": "ListItem", position: 2, name: `Padel courts in ${area.name}`, item: `${origin}/padel-courts/${area.slug}` }] : []),
    { "@type": "ListItem", position: area ? 3 : 2, name: v.name, item: `${origin}/venues/${v.id}` }] };
  const body = `
<nav class="crumbs"><a href="/padel-courts">Padel courts</a>${area ? ` › <a href="/padel-courts/${area.slug}">${esc(area.name)}</a>` : ""} › ${esc(v.name)}</nav>
<h1>${esc(v.name)}</h1>
${v.featured ? `<p><span class="featured">Featured venue</span></p>` : ""}
${reviews.length ? `<p><span class="stars" aria-label="${avg} out of 5">${stars(avg)}</span> <b>${avg}</b> from ${reviews.length} review${reviews.length === 1 ? "" : "s"} · <a href="#reviews">Read reviews</a></p>` : ""}
${(() => { const dir = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([v.name, v.postcode].filter(Boolean).join(" "))}`;
  const tel = v.tel ? `tel:${String(v.tel).replace(/[^\d+]/g, "")}` : "";
  return `<div class="acts">${book ? `<a class="btn y" href="${esc(book)}" rel="nofollow noopener" target="_blank">Check availability on ${esc(appOf(book))}</a>` : site ? `<a class="btn y" href="${esc(site)}" rel="nofollow noopener" target="_blank">Book on the venue's website</a>` : ""}<a class="btn" href="${esc(dir)}" rel="noopener" target="_blank">Get directions</a>${site && book && site !== book ? `<a class="btn" href="${esc(site)}" rel="nofollow noopener" target="_blank">Website</a>` : ""}${tel ? `<a class="btn" href="${esc(tel)}">Call</a>` : ""}<button type="button" class="btn" id="saveV" aria-pressed="false" style="cursor:pointer;background:none;font:inherit;font-weight:700">♡ Save</button></div><script>{const id=${JSON.stringify(v.id).replace(/</g, "\\u003c")},b=document.getElementById("saveV");let S=[];try{S=JSON.parse(localStorage.getItem("aap-saved")||"[]")}catch(e){}const paint=()=>{const on=S.includes(id);b.setAttribute("aria-pressed",on);b.textContent=on?"♥ Saved":"♡ Save"};paint();b.onclick=()=>{S=S.includes(id)?S.filter(x=>x!==id):[...S,id];try{localStorage.setItem("aap-saved",JSON.stringify(S))}catch(e){}paint()}}</script>
<div class="actbar">${book || site ? `<a class="btn y" href="${esc(book || site)}" rel="nofollow noopener" target="_blank">${book ? "Check availability" : "Book"}</a>` : tel ? `<a class="btn y" href="${esc(tel)}">Call</a>` : ""}<a class="btn" style="background:#fff;color:#0d1b3d" href="${esc(dir)}" rel="noopener" target="_blank">Directions</a></div><script>document.body.classList.add("hasbar")</script>`; })()}
<p>${esc(describeVenue(v))}${v.lta ? " It's an LTA registered venue." : ""}</p>
${v.about ? `<p>${esc(v.about)}</p>` : ""}
<div class="facts">
  <div class="fact"><b>Courts</b>${esc(v.courts || "Not listed")}</div>
  <div class="fact"><b>Location</b>${esc([v.district, v.postcode].filter(Boolean).join(", ") || "UK")}</div>
  <div class="fact"><b>Price</b>${v.price ? esc(v.price) + (v.price_note ? `<br><span class="muted">${esc(v.price_note)}</span>` : "") : "Check when booking"}</div>
  <div class="fact"><b>Opening hours</b>${v.hours ? esc(v.hours) : "Check with the venue"}</div>
  <div class="fact"><b>How to book</b>${book ? esc(appOf(book)) : site ? "Venue website" : v.email || v.tel ? "Contact the venue" : "Contact the venue"}</div>
</div>
${facList(v.facilities).length ? `<div class="tags">${facList(v.facilities).map(f => `<span class="tag">${FAC[f]}</span>`).join("")}</div>` : ""}
${v.deal ? `<p class="deal"><b>Deal:</b> ${esc(v.deal)}</p>` : ""}
${v.email || v.tel ? `<p class="muted">Contact: ${esc([v.tel, v.email].filter(Boolean).join(" · "))}</p>` : ""}
<h2 id="reviews">Reviews${reviews.length ? ` (${reviews.length})` : ""}</h2>
${reviews.length ? reviews.map(r => `<div class="rev"><p><span class="stars">${stars(r.rating)}</span> <b>${esc(r.title || "")}</b></p><p>${esc(r.body)}</p><p class="muted">${esc(r.name)} · ${new Date(r.created).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p></div>`).join("") : `<p>No reviews yet. Played here? Be the first.</p>`}
<h2>Review ${esc(v.name)}</h2>
<form class="box" id="revForm" style="position:relative">
  <label>Your rating</label><div class="rate" id="rate">${[1,2,3,4,5].map(n => `<button type="button" data-n="${n}" aria-label="${n} star${n > 1 ? "s" : ""}">★</button>`).join("")}</div>
  <label for="rt">Headline (optional)</label><input id="rt" maxlength="100">
  <label for="rb">Your review</label><textarea id="rb" maxlength="1500" required placeholder="Courts, atmosphere, parking, booking, value…"></textarea>
  <label for="rn">First name</label><input id="rn" maxlength="40" required>
  <input class="hp" id="rw" tabindex="-1" autocomplete="off" aria-hidden="true">
  <button class="btn y" type="submit">Send review</button>
  <p class="status" id="rs" role="status"></p>
  <p class="muted">Reviews are checked before they appear. Only your first name is shown.</p>
</form>
<h2>Run ${esc(v.name)}?</h2>
${v.claimed ? `<p>This listing is managed by the venue.</p>` : `<p>Claim this listing to keep your details, prices, hours and offers up to date, and ask about a Featured spot.</p>`}
<details><summary class="btn b" style="cursor:pointer;display:inline-flex">${v.claimed ? "Request access" : "Claim this venue"}</summary>
<form class="box" id="clForm" style="position:relative;margin-top:12px">
  <label for="cn">Your name</label><input id="cn" maxlength="80" required>
  <label for="cr">Your role at the venue</label><input id="cr" maxlength="80" placeholder="e.g. Club manager">
  <label for="ce">Work email</label><input id="ce" type="email" maxlength="120" required>
  <label for="cp">Phone (optional)</label><input id="cp" maxlength="40">
  <label for="cm">Anything else? (optional)</label><textarea id="cm" maxlength="800"></textarea>
  <label style="font-weight:500"><input type="checkbox" id="cf" style="width:auto;min-height:0"> I'm interested in a Featured listing</label>
  <input class="hp" id="cw" tabindex="-1" autocomplete="off" aria-hidden="true">
  <button class="btn y" type="submit">Send claim</button>
  <p class="status" id="cs" role="status"></p>
  <p class="muted">We check every claim with the venue before giving access.</p>
</form></details>
<script>
{const id=${JSON.stringify(v.id).replace(/</g, "\\u003c")};let n=0;const $=x=>document.getElementById(x);
const paint=()=>[...$("rate").children].forEach(b=>b.classList.toggle("on",+b.dataset.n<=n));
$("rate").addEventListener("click",e=>{const b=e.target.closest("button");if(b){n=+b.dataset.n;paint()}});
const post=async(u,d)=>{const r=await fetch(u,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(d)});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||"Something went wrong");};
$("revForm").addEventListener("submit",async e=>{e.preventDefault();$("rs").textContent="Sending…";try{await post("/api/reviews",{venue_id:id,rating:n,title:$("rt").value,body:$("rb").value,name:$("rn").value,website:$("rw").value});$("rs").textContent="Thanks! Your review will appear once it's been checked.";e.target.reset();n=0;paint()}catch(err){$("rs").textContent=err.message}});
$("clForm").addEventListener("submit",async e=>{e.preventDefault();$("cs").textContent="Sending…";try{await post("/api/claims",{venue_id:id,name:$("cn").value,role:$("cr").value,email:$("ce").value,phone:$("cp").value,message:$("cm").value,featured:$("cf").checked,website:$("cw").value});$("cs").textContent="Thanks! We'll check with the venue and email you a private link to manage the listing.";e.target.reset()}catch(err){$("cs").textContent=err.message}});}
</script>
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
<ul class="list">${[...a.venues].sort((x, y) => (y.featured || 0) - (x.featured || 0)).map(v => `<li>${v.featured ? `<span class="featured">Featured</span> ` : ""}<a href="/venues/${esc(v.id)}">${esc(v.name)}</a><br><span class="muted">${esc([v.postcode, v.courts].filter(Boolean).join(" · "))}${v.price ? " · " + esc(v.price) : ""}${v.book_url ? " · Book on " + esc(appOf(v.book_url)) : ""}</span></li>`).join("")}</ul>
<h2>More padel near ${esc(a.name)}</h2>
<ul class="list">${others.map(v => `<li><a href="/venues/${esc(v.id)}">${esc(v.name)}</a> <span class="muted">· ${esc(v.district || "")} · about ${Math.round(v.d)} miles</span></li>`).join("")}</ul>`;
  return page({ origin, path: `/padel-courts/${a.slug}`, title, description, body, jsonld: [list, faq] });
}

function guidePage(origin, g, ctx) {
  const ld = [
    { "@context": "https://schema.org", "@type": "Article", headline: g.title, description: g.description, dateModified: g.updated, author: { "@type": "Organization", name: "All Access Padel" }, publisher: { "@type": "Organization", name: "All Access Padel" }, mainEntityOfPage: `${origin}/guides/${g.slug}` },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: g.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Guides", item: `${origin}/guides` }, { "@type": "ListItem", position: 2, name: g.title, item: `${origin}/guides/${g.slug}` }] },
  ];
  const body = `<nav class="crumbs"><a href="/guides">Guides</a> › ${esc(g.title)}</nav>
<h1>${esc(g.title)}</h1><p class="muted">Updated ${new Date(g.updated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
${g.body(ctx)}
<h2>Frequently asked questions</h2>
${g.faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("")}
<h2>More guides</h2><ul class="list">${GUIDES.filter(x => x.slug !== g.slug).map(x => `<li><a href="/guides/${x.slug}">${esc(x.title)}</a></li>`).join("")}</ul>`;
  return page({ origin, path: `/guides/${g.slug}`, title: `${g.title} | All Access Padel`, description: g.description, body, jsonld: ld });
}

function guidesIndex(origin) {
  const body = `<h1>Padel guides</h1><p>Straight answers for UK padel players, from what it costs to choosing your first racket.</p>
<ul class="list">${GUIDES.map(g => `<li><a href="/guides/${g.slug}">${esc(g.title)}</a><br><span class="muted">${esc(g.description)}</span></li>`).join("")}</ul>`;
  return page({ origin, path: "/guides", title: "Padel guides for UK players | All Access Padel", description: "Plain-English padel guides: UK court prices, the rules, padel vs tennis and the best beginner rackets.", body,
    jsonld: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Padel guides", url: `${origin}/guides` }] });
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
  if (p === "/rules" || p === "/padel-rules") return Response.redirect(`${origin}/guides/padel-rules`, 301);
  if (p === "/shop") return Response.redirect(`${origin}/kit`, 301);
  if (p === "/badge.svg") return new Response(badgeSvg(url.searchParams.get("style") === "dark" ? "dark" : "light"), { headers: { "content-type": "image/svg+xml", "cache-control": "public, max-age=86400", "access-control-allow-origin": "*" } });
  if (!(p === "/about" || p === "/privacy" || p === "/add" || p === "/for-clubs" || p === "/padel-prices" || p.startsWith("/padel-prices/") || p === "/padel" || p.startsWith("/padel/") || p === "/padel-courts" || p.startsWith("/padel-courts/") || p.startsWith("/venues/") || p === "/guides" || p.startsWith("/guides/") || p === "/kit" || p === "/news" || p === "/news.xml" || p === "/sitemap.xml" || p === "/llms.txt" || p === "/robots.txt")) return null;
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
  const towns = await loadTowns(env);

  if (p === "/sitemap.xml") {
    const urls = [`${origin}/`, `${origin}/padel-courts`, `${origin}/guides`, `${origin}/kit`, `${origin}/news`, `${origin}/padel`, `${origin}/padel-prices`, `${origin}/for-clubs`, `${origin}/about`, `${origin}/add`, ...cityPages(all, towns).map(g => `${origin}/padel-prices/${g.hub.slug}`), ...GUIDES.map(g => `${origin}/guides/${g.slug}`), ...townsWithCourts(towns, all).map(t => `${origin}/padel/${t.slug}`), ...areas.map(a => `${origin}/padel-courts/${a.slug}`), ...all.map(v => `${origin}/venues/${v.id}`)];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${esc(u)}</loc></url>`).join("\n")}\n</urlset>`;
    return new Response(body, { headers: { "content-type": "application/xml", "cache-control": "public, max-age=3600" } });
  }
  if (p === "/llms.txt") {
    const body = `# All Access Padel

> A free, independent directory of padel courts across Great Britain (England, Scotland and Wales). It lists ${all.length} padel venues with location, court type (indoor, outdoor, covered), prices where published, deals, and links to check availability and book on each venue's booking system (Playtomic, MATCHi, ClubSpark, Nettla).

The venue list is built from the LTA's padel court finder plus our own research. Prices and offers change often; always confirm with the venue.

## Key pages
- [Find padel courts near a postcode](${origin}/): interactive search, map and filters
- [Padel courts by town](${origin}/padel): a page for every UK town and city, listing the nearest padel courts with indoor options, prices and booking links
- [Padel prices compared](${origin}/padel-prices): published court hire prices at UK padel clubs, cheapest first, with city comparisons
- [Padel courts by area](${origin}/padel-courts): every area with a padel venue, grouped by country
- [Sitemap](${origin}/sitemap.xml): every venue and area page

## Kit shop
- [UK padel news](${origin}/news): new padel clubs opening, planning decisions and padel news, summarised with links to the source
- [Padel kit shop](${origin}/kit): recommended rackets, balls, shoes, bags and accessories, with links to Amazon UK

## Guides
${GUIDES.map(g => `- [${g.title}](${origin}/guides/${g.slug}): ${g.description}`).join("\n")}

## Areas
${areas.map(a => `- [Padel courts in ${a.name}](${origin}/padel-courts/${a.slug}): ${a.venues.length} venue${a.venues.length === 1 ? "" : "s"}`).join("\n")}
`;
    return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
  }
  if (p === "/padel-courts") return html(indexPage(origin, areas, all.length));
  if (p === "/about") return html(aboutPage({ origin, page, total: all.length }));
  if (p === "/privacy") return html(privacyPage({ origin, page }));
  if (p === "/add") return html(addPage({ origin, page }));
  if (p === "/for-clubs") return html(forClubsPage({ origin, page, total: all.length }));
  if (p === "/padel-prices") return html(pricesIndex({ origin, venues: all, towns, esc, page, year }));
  if (p.startsWith("/padel-prices/")) {
    const g = cityPages(all, towns).find(x => x.hub.slug === p.slice(14));
    return g ? html(cityPricePage({ origin, g, venues: all, esc, page, year })) : null;
  }
  if (p === "/padel") return html(townsIndex({ origin, towns, venues: all, esc, page }));
  if (p.startsWith("/padel/")) {
    const t = towns.find(x => x.slug === p.slice(7));
    if (!t) return null;
    const near = all.map(v => ({ v, d: miles(t.lat, t.lng, v.lat, v.lng) })).sort((a, b) => a.d - b.d)[0];
    const area = near && near.d < 15 ? areas.find(a => a.slug === slug(near.v.district)) : null;
    const pc = cityPages(all, towns).find(g => g.hub.slug === t.slug);
    let out = townPage({ origin, t, venues: all, towns, esc, page, year, appOf, area });
    if (pc) out = out.replace("<h2>Padel in ", `<p><a class="btn y" href="/padel-prices/${esc(t.slug)}">Compare padel prices in ${esc(t.name)}</a></p><h2>Padel in `);
    return html(out);
  }
  if (p === "/guides") return html(guidesIndex(origin));
  if (p === "/news" || p === "/news.xml") {
    const items = await latestNews(env, 200);
    if (p === "/news.xml") return new Response(newsRss(origin, items, esc), { headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=900" } });
    const kind = new URL(request.url).searchParams.get("type") || "";
    return html(page({ origin, path: "/news", title: "UK padel news: new clubs, openings and planning | All Access Padel",
      description: "The latest UK padel news: new padel clubs opening, courts approved in planning and the biggest stories from around Britain.",
      body: newsBody(items, esc, KINDS[kind] ? kind : ""),
      jsonld: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "UK padel news", url: `${origin}/news` },
        { "@context": "https://schema.org", "@type": "ItemList", itemListElement: items.slice(0, 30).map((n, i) => ({ "@type": "ListItem", position: i + 1, name: n.title, url: n.venue_id ? `${origin}/venues/${n.venue_id}` : n.url })) }] }), 900);
  }
  if (p === "/kit") return html(page({ origin, path: "/kit", title: "Padel kit shop: best rackets, balls & shoes (UK) | All Access Padel",
    description: "The padel rackets, balls, shoes, bags and accessories UK experts recommend, from beginner to advanced. See live prices on Amazon UK.",
    body: kitBody(esc, env.AMAZON_TAG || ""),
    jsonld: [{ "@context": "https://schema.org", "@type": "ItemList", name: "Padel kit picks", itemListElement: KIT.flatMap(c => c.items).map((i, n) => ({ "@type": "ListItem", position: n + 1, name: i.n })) }] }));
  if (p.startsWith("/guides/")) {
    const g = GUIDES.find(x => x.slug === p.slice(8));
    return g ? html(guidePage(origin, g, { esc, amazonTag: env.AMAZON_TAG || "", priced: all.filter(v => v.price).slice(0, 25) })) : null;
  }
  if (p.startsWith("/padel-courts/")) {
    const a = areas.find(x => x.slug === p.slice(14));
    if (!a) return null;
    const c = a.venues.reduce((s, v) => ({ lat: s.lat + v.lat / a.venues.length, lng: s.lng + v.lng / a.venues.length }), { lat: 0, lng: 0 });
    const nt = nearestTowns(c.lat, c.lng, towns, 6);
    let out = areaPage(origin, a, all);
    if (nt.length) out = out.replace("</main>", `<h2>Padel by town near ${esc(a.name)}</h2><ul class="cols">${nt.map(t => `<li><a href="/padel/${esc(t.slug)}">Padel in ${esc(t.name)}</a></li>`).join("")}</ul></main>`);
    return html(out);
  }
  if (p.startsWith("/venues/")) {
    const v = all.find(x => x.id === decodeURIComponent(p.slice(8)));
    if (!v) return null;
    const { results: reviews } = await env.DB.prepare("SELECT rating, title, body, name, created FROM reviews WHERE venue_id = ? AND status = 'approved' ORDER BY created DESC LIMIT 50").bind(v.id).all();
    const vnews = await latestNews(env, 5, v.id);
    const nt = nearestTowns(v.lat, v.lng, towns, 4);
    let out = venuePage(origin, v, all, reviews);
    out = out.replace("</main>", `<p class="muted">Run ${esc(v.name)}? <a href="/for-clubs?venue=${encodeURIComponent(v.id)}#badge">Get a "Find us on All Access Padel" badge for your website</a>.</p></main>`);
    if (nt.length) out = out.replace("</main>", `<h2>Padel in nearby towns</h2><ul class="cols">${nt.map(t => `<li><a href="/padel/${esc(t.slug)}">Padel in ${esc(t.name)}</a> <span class="muted">(${Math.round(t.d)} miles)</span></li>`).join("")}</ul></main>`);
    return html(vnews.length ? out.replace("</main>", `${NEWS_CSS}<h2>In the news</h2>${vnews.map(n => newsCard(n, esc)).join("")}</main>`) : out, 300);
  }
  return null;
}
