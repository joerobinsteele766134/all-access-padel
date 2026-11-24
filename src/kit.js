// The Kit Shop: affiliate product picks (Amazon UK). No prices shown – Amazon prices change,
// so every button goes to Amazon for the live price. Each pick cites where it was recommended.
const amazon = (q, tag) => `https://www.amazon.co.uk/s?k=${encodeURIComponent(q)}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`;
const CS = ["Central Sports", "https://centralsports.co.uk/blogs/padel-1/best-padel-rackets-for-beginners-uk-2026-buyers-guide"];
const CSS = ["Central Sports", "https://centralsports.co.uk/pages/best-padel-shoes-uk-2026"];
const PS = ["PadelSpeak", "https://padelspeak.com/en/?p=58985"];
const PM = ["Padel Market", "https://padelmarket.com/en-eu/blogs/blog/best-padel-rackets-beginners"];
const PDH = ["PDH Sports", "https://pdhsports.com/en-ie/blogs/padel/top-padel-shoes-2026-tried-and-tested"];

export const KIT = [
  { id: "rackets", name: "Rackets", blurb: "Beginners: go round, light (about 355–370 g) and soft. Improvers can step up to a teardrop shape for more power.", items: [
    { n: "Adidas Match Light 2026", q: "Adidas Match Light padel racket", badge: "Best first racket", why: "Round, light and forgiving. A specialist UK shop's go-to for first-time buyers.", by: CS },
    { n: "Bullpadel Open Control", q: "Bullpadel Open Control padel racket", badge: "Beginner favourite", why: "A control-first round racket that's popular with new players.", by: CS },
    { n: "Babolat Air Origin", q: "Babolat Air Origin padel racket", badge: "Most forgiving", why: "Very light at around 345 g, with a big sweet spot.", by: PS },
    { n: "Adidas Match Blue 3.4", q: "Adidas Match Blue padel racket", badge: "Budget pick", why: "An affordable starter from a major brand.", by: PS },
    { n: "Starvie Nyra 2026", q: "Starvie Nyra padel racket", why: "Soft and round with a low-to-medium balance, built for easy control.", by: PM },
    { n: "Bullpadel Indiga Girl 2026", q: "Bullpadel Indiga Girl padel racket", why: "Light at 350–365 g with a low balance, designed for comfort.", by: PM },
    { n: "Head Coello Vibe 2026", q: "Head Coello Vibe padel racket", badge: "Grow into it", why: "A comfortable, forgiving 2026 racket you won't outgrow quickly.", by: ["Central Sports", "https://centralsports.co.uk/blogs/padel-1/how-to-choose-a-padel-racket-uk-buyers-guide-2026"] },
    { n: "Wilson Bela V3", q: "Wilson Bela V3 padel racket", badge: "For power players", why: "A power-focused racket for experienced players.", by: ["The Guardian", "https://www.inkl.com/news/the-best-padel-rackets-in-the-uk-for-every-player-from-beginner-to-pro"] },
  ]},
  { id: "balls", name: "Balls", blurb: "Padel balls are slightly lower pressure than tennis balls. Open a fresh tube of three for each match.", items: [
    { n: "adidas Speed RX", q: "adidas Speed RX padel balls", badge: "Best in test", why: "Reliable bounce and durability, also sold in bulk packs for clubs.", by: ["Testix", "https://testix.co.uk/test/best-padel-balls"] },
    { n: "Wilson X3 padel balls", q: "Wilson X3 padel balls", why: "Built for consistency, durability and playability.", by: ["Galaxus", "https://www.galaxus.ch/en/s3/producttype/toplist/rating/padelball-3842"] },
    { n: "Wilson Premier Padel Speed", q: "Wilson Premier Padel Speed balls", why: "A quicker ball that suits slower courts.", by: ["Galaxus", "https://www.galaxus.ch/en/s3/producttype/toplist/rating/padelball-3842"] },
    { n: "Nox Pro Titanium", q: "Nox Pro Titanium padel balls", why: "A top-rated tournament-style ball.", by: ["Galaxus", "https://www.galaxus.ch/en/s3/producttype/toplist/rating/padelball-3842"] },
    { n: "Babolat Court Padel", q: "Babolat Court Padel balls", why: "A dependable everyday ball from a big racket brand.", by: ["Galaxus", "https://www.galaxus.ch/en/s3/producttype/toplist/rating/padelball-3842"] },
    { n: "Tretorn Serie+ Tour", q: "Tretorn padel balls", why: "One of JustPadel's top five balls of the year.", by: ["JustPadel", "https://justpadel.com/en/blogs/blog/these-are-the-5-best-padel-balls-of-2026"] },
  ]},
  { id: "shoes", name: "Shoes", blurb: "Running shoes slip on padel turf. Look for a herringbone (\"clay\") or omni sole for UK indoor courts.", items: [
    { n: "Wilson Hurakn Lite", q: "Wilson Hurakn Lite padel shoes", badge: "Best for beginners", why: "Lightweight, well cushioned and a great entry option.", by: CSS },
    { n: "Bullpadel Ionic 26V", q: "Bullpadel Ionic padel shoes", badge: "Budget pick", why: "Bullpadel's entry-level shoe.", by: CSS },
    { n: "Bullpadel Neuron 26V", q: "Bullpadel Neuron padel shoes", badge: "Best for UK courts", why: "A herringbone sole that grips indoor turf well.", by: CSS },
    { n: "Wilson Hurakn Pro", q: "Wilson Hurakn Pro padel shoes", why: "A premium pick for UK indoor turf.", by: CSS },
    { n: "Babolat Premura", q: "Babolat Premura padel shoes", badge: "Customer favourite", why: "An all-round performer and one specialist shop's best seller.", by: ["PDH Sports", "https://pdhsports.com/en-si/blogs/padel/top-padel-shoes-tried-and-tested"] },
    { n: "Asics Sonicsmash", q: "Asics Sonicsmash padel shoes", why: "A responsive 2026 release with grip for indoor and outdoor courts.", by: PDH },
    { n: "Adidas Crazyquick LS", q: "Adidas Crazyquick padel shoes", badge: "Lightest", why: "For quick-footed players who want speed.", by: ["PDH Sports", "https://pdhsports.com/en-gg/blogs/padel/top-padel-shoes-tried-and-tested"] },
  ]},
  { id: "bags", name: "Bags & covers", blurb: "A cover or bag protects your racket's face from scratches and the cold.", items: [
    { n: "Padel racket bags", q: "padel racket bag", why: "Holds two or more rackets, shoes and balls." },
    { n: "Padel backpacks", q: "padel backpack", why: "A racket sleeve plus room for your kit." },
    { n: "Racket covers", q: "padel racket cover", why: "A simple sleeve to protect a single racket." },
  ]},
  { id: "accessories", name: "Accessories", blurb: "Small things that make a big difference on court.", items: [
    { n: "Overgrips", q: "padel overgrip", badge: "Must-have", why: "A fresh, tacky grip, and the cheapest upgrade you can make." },
    { n: "Frame protector tape", q: "padel racket protector tape", why: "Saves the edge of your racket from wall and floor scrapes." },
    { n: "Ball pressuriser", q: "padel ball pressuriser", why: "Keeps opened balls bouncy for longer." },
    { n: "Wristbands & headbands", q: "padel wristbands", why: "Keep sweat off your grip." },
    { n: "Sports socks", q: "padel sports socks", why: "Cushioned socks for all that lateral movement." },
  ]},
];

const ICON = {
  rackets: `<svg viewBox="0 0 120 120" aria-hidden="true"><rect x="52" y="78" width="16" height="36" rx="5" fill="#0d1b3d"/><rect x="52" y="98" width="16" height="16" rx="5" fill="#e4ff3a"/><ellipse cx="60" cy="48" rx="38" ry="42" fill="#0d1b3d"/><ellipse cx="60" cy="48" rx="31" ry="35" fill="#2457d6"/><g fill="#0d1b3d" opacity=".45">${[[46,32],[60,28],[74,32],[42,48],[56,46],[70,46],[78,50],[48,62],[62,62],[74,64]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.5"/>`).join("")}</g></svg>`,
  balls: `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="40" cy="74" r="24" fill="#e4ff3a"/><circle cx="80" cy="74" r="24" fill="#d6f02e"/><circle cx="60" cy="40" r="24" fill="#e4ff3a"/><path d="M42 26q18 14 0 28M78 26q-18 14 0 28" stroke="#fff" stroke-width="4" fill="none" opacity=".8"/></svg>`,
  shoes: `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M14 72q6-26 26-30l14 10q14 8 34 10t26 16v10H14z" fill="#2457d6"/><path d="M14 88h100v10H14z" fill="#0d1b3d"/><path d="M20 96h8M34 96h8M48 96h8M62 96h8M76 96h8M90 96h8" stroke="#e4ff3a" stroke-width="4"/><path d="M50 50l10 8M58 46l10 8M66 44l10 8" stroke="#fff" stroke-width="3"/></svg>`,
  bags: `<svg viewBox="0 0 120 120" aria-hidden="true"><rect x="16" y="40" width="88" height="56" rx="18" fill="#0d1b3d"/><rect x="24" y="48" width="72" height="12" rx="6" fill="#2457d6"/><path d="M40 40q0-16 20-16t20 16" stroke="#0d1b3d" stroke-width="7" fill="none"/><circle cx="92" cy="80" r="8" fill="#e4ff3a"/></svg>`,
  accessories: `<svg viewBox="0 0 120 120" aria-hidden="true"><rect x="28" y="20" width="22" height="80" rx="11" fill="#2457d6"/><path d="M28 34l22 10M28 50l22 10M28 66l22 10M28 82l22 10" stroke="#e4ff3a" stroke-width="5"/><rect x="62" y="40" width="34" height="56" rx="8" fill="#0d1b3d"/><rect x="70" y="30" width="18" height="12" rx="3" fill="#e4ff3a"/></svg>`,
};

export function kitBody(esc, tag) {
  return `
<style>
.shop-hero{background:#0d1b3d;color:#fff;border-radius:6px;padding:22px;margin:0 0 18px;display:grid;grid-template-columns:minmax(0,1fr) 120px;gap:16px;align-items:center}
.shop-hero h1{color:#fff;margin:0}.shop-hero h1 i{color:#e4ff3a;font-style:inherit}.shop-hero p{color:#dfe8ff;margin:8px 0 0}
.shop-hero svg{width:120px;height:120px}
.cats{display:flex;gap:8px;overflow-x:auto;padding:4px 0 12px;position:sticky;top:0;background:var(--bg);z-index:2}
.cats a{flex:none;font-weight:700;text-decoration:none;color:var(--ink);border:2px solid var(--line);border-radius:999px;padding:8px 14px;min-height:44px;display:inline-flex;align-items:center}
.cats a:hover{background:#e4ff3a;color:#0d1b3d}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,210px),1fr));gap:14px;margin:12px 0 8px}
.prod{background:var(--card);border:2px solid var(--line);border-radius:8px;overflow:hidden;display:flex;flex-direction:column;transition:transform .15s}
.prod:hover{transform:translateY(-3px)}
.prod .img{background:light-dark(#eef3ff,#16285a);aspect-ratio:4/3;display:grid;place-items:center;position:relative}
.prod .img svg{width:58%;height:auto}
.prod .badge{position:absolute;top:10px;left:10px;background:#e4ff3a;color:#0d1b3d;font-weight:700;font-size:12px;padding:3px 8px;border-radius:999px}
.prod .info{padding:12px 14px 14px;display:flex;flex-direction:column;gap:6px;flex:1}
.prod h3{margin:0;font:italic 800 20px/1.1 "Barlow Condensed",sans-serif}
.prod p{margin:0;font-size:14px}.prod .src{font-size:12px;color:var(--muted)}.prod .src a{color:inherit}
.prod .buy{margin-top:auto;display:flex;align-items:center;justify-content:center;gap:6px;min-height:44px;border-radius:6px;background:#ffd814;color:#0f1111;font-weight:700;text-decoration:none;border:1px solid #fcd200}
.prod .buy:hover{background:#f7ca00}
.cat h2{margin-top:30px}.disclose{font-size:13px;color:var(--muted);border-left:4px solid #e4ff3a;padding:6px 10px;margin:6px 0 14px}
@media(max-width:560px){.shop-hero{grid-template-columns:1fr}.shop-hero svg{display:none}}
</style>
<div class="shop-hero"><div><h1>THE KIT <i>SHOP</i></h1><p>The padel rackets, balls, shoes and gear UK experts recommend, all in one place. Tap any item to see the live price on Amazon.</p></div>${ICON.rackets}</div>
<p class="disclose">${tag ? "As an Amazon Associate, All Access Padel earns from qualifying purchases. It costs you nothing extra. " : ""}We don't sell anything ourselves. Every pick shows who recommended it, and prices and stock are on Amazon.</p>
<nav class="cats" aria-label="Shop categories">${KIT.map(c => `<a href="#${c.id}">${c.name}</a>`).join("")}<a href="/guides/best-beginner-padel-rackets">Racket buying guide</a></nav>
${KIT.map(c => `<section class="cat" id="${c.id}"><h2>${c.name}</h2><p>${esc(c.blurb)}</p>
<div class="grid">${c.items.map(i => `<article class="prod"><div class="img">${i.badge ? `<span class="badge">${esc(i.badge)}</span>` : ""}${ICON[c.id]}</div>
<div class="info"><h3>${esc(i.n)}</h3><p>${esc(i.why)}</p>${i.by ? `<p class="src">Recommended by <a href="${i.by[1]}" rel="noopener" target="_blank">${esc(i.by[0])}</a></p>` : ""}
<a class="buy" href="${amazon(i.q, tag)}" rel="sponsored nofollow noopener" target="_blank">Shop on Amazon →</a></div></article>`).join("")}</div></section>`).join("")}
<h2>Not sure where to start?</h2>
<p>Hire a racket for your first few sessions (usually £2–£5), then read our <a href="/guides/best-beginner-padel-rackets">beginner racket guide</a>. When you're ready to play, <a href="/">find a court near you</a>.</p>`;
}
