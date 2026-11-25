// Regenerates the Kit Shop strip on the homepage from src/kit.js. Run: node scripts/build-home-shop.mjs
import fs from "node:fs";
import { KIT } from "../src/kit.js";
import { artFor } from "../src/art.js";
const TAG = "allaccesspadel-21";
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pick = [["rackets", "Adidas Match Light 2026"], ["rackets", "Head Coello Vibe 2026"], ["balls", "adidas Speed RX"], ["shoes", "Bullpadel Neuron 26V"]];
const cards = pick.map(([c, n]) => {
  const cat = KIT.find(k => k.id === c), i = cat.items.findIndex(x => x.n === n), it = cat.items[i];
  const svg = artFor(c, it, i).replace(/id="h/g, 'id="hp').replace(/url\(#h/g, "url(#hp");
  const url = `https://www.amazon.co.uk/s?k=${encodeURIComponent(it.q)}&tag=${TAG}`;
  return `<article class="kp"><a class="kpimg" href="/kit#${c}" aria-label="${esc(it.n)} in the kit shop">${it.badge ? `<span>${esc(it.badge)}</span>` : ""}${svg}</a><div class="kpinfo"><p class="kpcat">${esc(cat.name)}</p><h3>${esc(it.n)}</h3><p>${esc(it.why)}</p><a class="kpbuy" href="${url}" rel="sponsored nofollow noopener" target="_blank">Shop on Amazon →</a></div></article>`;
}).join("\n      ");
const block = `<!--SHOP:START-->
<section class="band shopband" id="shop" aria-labelledby="sh">
  <div class="wrap">
    <div class="shophead">
      <div><p class="kicker">The Kit Shop</p><h2 class="disp" id="sh">Kit up for <span>padel</span></h2>
      <p class="sub">The rackets, balls and shoes UK experts recommend, picked for beginners through to club players.</p></div>
      <a class="btn y big" href="/kit">Browse the kit shop</a>
    </div>
    <nav class="shopcats" aria-label="Kit shop categories">${KIT.map(c => `<a href="/kit#${c.id}">${esc(c.name)}</a>`).join("")}<a href="/guides/best-beginner-padel-rackets">Racket buying guide</a></nav>
    <div class="kpgrid">
      ${cards}
    </div>
    <p class="disc">As an Amazon Associate, All Access Padel earns from qualifying purchases, at no extra cost to you. Pictures are our own illustrations.</p>
  </div>
</section>
<!--SHOP:END-->`;
const p = "public/index.html"; let s = fs.readFileSync(p, "utf8");
s = /<!--SHOP:START-->[\s\S]*<!--SHOP:END-->/.test(s) ? s.replace(/<!--SHOP:START-->[\s\S]*<!--SHOP:END-->/, block) : s.replace('<section class="band alt" id="map">', block + "\n\n<section class=\"band alt\" id=\"map\">");
fs.writeFileSync(p, s); console.log("homepage shop strip updated");
