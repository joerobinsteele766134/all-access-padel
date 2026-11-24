// Original illustrations for the Kit Shop. Drawn in code so we never copy brand or Amazon photos.
// Shapes and colours give each product its own look; no logos or wordmarks are drawn.
const NAVY = "#0d1b3d", LIME = "#e4ff3a";

const HEAD = {
  round: "M60 6C82 6 96 24 96 44C96 66 80 82 60 82C40 82 24 66 24 44C24 24 38 6 60 6Z",
  teardrop: "M60 5C90 5 98 30 95 50C92 68 76 82 60 84C44 82 28 68 25 50C22 30 30 5 60 5Z",
  diamond: "M60 4C84 4 97 18 97 32C97 50 80 74 60 86C40 74 23 50 23 32C23 18 36 4 60 4Z",
};
const HOLES = [];
for (let y = 22; y <= 68; y += 9) for (let x = 36 + ((y / 9) % 2) * 4.5; x <= 84; x += 9) HOLES.push([x, y]);

// shape: round | teardrop | diamond; frame/face/acc colours; deco: stripe | chevron | split | dots | ring
export function racket(id, { shape = "round", frame = NAVY, face = "#2457d6", acc = LIME, grip = acc, deco = "stripe" }) {
  const d = HEAD[shape], cid = `h${id}`;
  const decos = {
    stripe: `<path d="M10 70L110 20v14L10 84z" fill="${acc}"/>`,
    chevron: `<path d="M20 30L60 54L100 30v12L60 66L20 42z" fill="${acc}"/>`,
    split: `<path d="M60 0H120V100H60z" fill="${acc}" opacity=".85"/>`,
    dots: `<g fill="${acc}">${[[44,30,10],[78,40,14],[52,62,8]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>`,
    ring: `<circle cx="60" cy="46" r="22" fill="none" stroke="${acc}" stroke-width="7"/>`,
  };
  return `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><clipPath id="${cid}"><path d="${d}" transform="translate(60 45) scale(.84) translate(-60 -45)"/></clipPath></defs>
<path d="M50 78L54 92H66L70 78z" fill="${frame}"/><rect x="53" y="88" width="14" height="28" rx="5" fill="${frame}"/><rect x="53" y="96" width="14" height="20" rx="5" fill="${grip}"/>
<path d="M54 99l12 4M54 105l12 4M54 111l12 4" stroke="${NAVY}" stroke-width="1.5" opacity=".35"/>
<path d="${d}" fill="${frame}"/><g clip-path="url(#${cid})"><rect width="120" height="100" fill="${face}"/>${decos[deco] || ""}
<g fill="${NAVY}" opacity=".4">${HOLES.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6"/>`).join("")}</g></g></svg>`;
}

// A tube of three balls. body/cap colours, ball colour, band = a stripe round the tube
export function tube(id, { body = NAVY, cap = LIME, ball = LIME, band = "#fff" }) {
  return `<svg viewBox="0 0 120 120" aria-hidden="true"><rect x="34" y="14" width="40" height="98" rx="12" fill="${body}"/><rect x="32" y="8" width="44" height="12" rx="5" fill="${cap}"/>
<rect x="34" y="70" width="40" height="8" fill="${band}" opacity=".9"/><rect x="42" y="26" width="24" height="38" rx="10" fill="#fff" opacity=".18"/>
<circle cx="88" cy="96" r="16" fill="${ball}"/><path d="M76 86q12 10 0 20M100 86q-12 10 0 20" stroke="#fff" stroke-width="3" fill="none" opacity=".85"/></svg>`;
}

// A side-on court shoe. upper/sole/acc colours; sole: herringbone | omni; high = taller collar
export function shoe(id, { upper = "#2457d6", sole = "#fff", acc = LIME, tread = "herringbone", high = false }) {
  const collar = high ? "M18 74q4-34 24-38l14 12" : "M14 74q6-24 26-28l14 10";
  const treadPat = tread === "omni"
    ? Array.from({ length: 14 }, (_, i) => `<circle cx="${18 + i * 7}" cy="100" r="1.6"/>`).join("")
    : Array.from({ length: 13 }, (_, i) => `<path d="M${17 + i * 7.5} 98l3 3l3-3"/>`).join("");
  return `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="${collar}q14 8 34 10t26 16v10H14z" fill="${upper}"/>
<path d="M56 62q20 4 32 12" stroke="${acc}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M50 52l8 6M57 49l8 6M64 47l8 6" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
<path d="M12 86h104v8q0 8-8 8H18q-6 0-6-6z" fill="${sole}"/><path d="M12 86h104" stroke="${NAVY}" stroke-width="2" opacity=".25"/>
<g fill="${NAVY}" stroke="${NAVY}" stroke-width="1.6" opacity=".55">${treadPat}</g></svg>`;
}

// One-off drawings for bags and accessories, keyed by product name
export const SINGLES = {
  "Padel racket bags": `<svg viewBox="0 0 120 120" aria-hidden="true"><rect x="8" y="44" width="104" height="48" rx="24" fill="${NAVY}"/><rect x="20" y="54" width="80" height="10" rx="5" fill="#2457d6"/><path d="M36 44q0-14 24-14t24 14" stroke="${NAVY}" stroke-width="7" fill="none"/><circle cx="98" cy="78" r="6" fill="${LIME}"/><path d="M14 80h56" stroke="${LIME}" stroke-width="4"/></svg>`,
  "Padel backpacks": `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M44 30q0-14 16-14t16 14" stroke="${NAVY}" stroke-width="6" fill="none"/><rect x="28" y="28" width="64" height="82" rx="16" fill="#2457d6"/><rect x="38" y="66" width="44" height="32" rx="8" fill="${NAVY}"/><path d="M38 78h44" stroke="${LIME}" stroke-width="4"/><ellipse cx="60" cy="44" rx="18" ry="12" fill="${NAVY}" opacity=".35"/></svg>`,
  "Racket covers": `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="${HEAD.round}" fill="#e03a5f"/><path d="M50 78L54 92H66L70 78z" fill="#e03a5f"/><rect x="53" y="90" width="14" height="26" rx="5" fill="${NAVY}"/><path d="M30 30q30-22 60 0" stroke="${LIME}" stroke-width="5" fill="none"/><path d="M60 8v74" stroke="#fff" stroke-width="2" stroke-dasharray="4 4" opacity=".7"/></svg>`,
  "Overgrips": `<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="46" cy="60" r="30" fill="#f4f6fb"/><circle cx="46" cy="60" r="22" fill="none" stroke="#dfe4ef" stroke-width="4"/><circle cx="46" cy="60" r="10" fill="${NAVY}"/><path d="M70 74q20 6 40 30" stroke="#f4f6fb" stroke-width="12" fill="none" stroke-linecap="round"/><circle cx="84" cy="34" r="12" fill="${LIME}"/><circle cx="96" cy="50" r="9" fill="#2457d6"/></svg>`,
  "Frame protector tape": `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="${HEAD.round}" fill="none" stroke="${NAVY}" stroke-width="8"/><path d="M28 58A34 36 0 0 0 92 58" fill="none" stroke="${LIME}" stroke-width="10" opacity=".8"/><circle cx="88" cy="96" r="18" fill="${LIME}"/><circle cx="88" cy="96" r="8" fill="#fff"/></svg>`,
  "Ball pressuriser": `<svg viewBox="0 0 120 120" aria-hidden="true"><rect x="34" y="34" width="52" height="78" rx="14" fill="#9aa6bf"/><rect x="40" y="40" width="40" height="66" rx="10" fill="#fff" opacity=".25"/><rect x="56" y="10" width="8" height="26" fill="${NAVY}"/><rect x="40" y="6" width="40" height="10" rx="5" fill="${NAVY}"/><circle cx="60" cy="56" r="11" fill="${LIME}"/><circle cx="60" cy="82" r="11" fill="${LIME}"/></svg>`,
  "Wristbands & headbands": `<svg viewBox="0 0 120 120" aria-hidden="true"><ellipse cx="60" cy="34" rx="44" ry="14" fill="none" stroke="#2457d6" stroke-width="12"/><rect x="18" y="62" width="38" height="40" rx="12" fill="${LIME}"/><rect x="64" y="62" width="38" height="40" rx="12" fill="${NAVY}"/><path d="M18 82h38M64 82h38" stroke="#fff" stroke-width="3" opacity=".6"/></svg>`,
  "Sports socks": `<svg viewBox="0 0 120 120" aria-hidden="true"><path d="M30 10h28v58q0 8 6 12l18 12q8 6 2 16t-16 4L36 92q-6-4-6-12z" fill="#f4f6fb" stroke="#dfe4ef" stroke-width="2"/><path d="M30 18h28M30 26h28" stroke="#2457d6" stroke-width="5"/><path d="M62 92q6 12 20 10" stroke="${LIME}" stroke-width="6" fill="none"/></svg>`,
};

export function artFor(cat, item, i) {
  const id = `${cat}${i}`;
  if (cat === "rackets" && item.art) return racket(id, item.art);
  if (cat === "balls" && item.art) return tube(id, item.art);
  if (cat === "shoes" && item.art) return shoe(id, item.art);
  return SINGLES[item.n] || "";
}
