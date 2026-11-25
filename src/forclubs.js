// /for-clubs page (claim, update, badge) and the /badge.svg image clubs put on their own websites.
export function badgeSvg(style = "light") {
  const dark = style === "dark";
  const bg = dark ? "#0d1b3d" : "#ffffff", ink = dark ? "#ffffff" : "#0d1b3d", ring = dark ? "#e4ff3a" : "#0d1b3d";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="64" viewBox="0 0 220 64" role="img" aria-label="Find us on All Access Padel">
<rect x="1.5" y="1.5" width="217" height="61" rx="10" fill="${bg}" stroke="${ring}" stroke-width="3"/>
<circle cx="34" cy="32" r="18" fill="#e4ff3a" stroke="#0d1b3d" stroke-width="2"/><path d="M22 19q9 13 0 26M46 19q-9 13 0 26" stroke="#fff" stroke-width="2.5" fill="none"/>
<text x="62" y="26" font-family="Arial,Helvetica,sans-serif" font-size="11" font-weight="700" fill="${ink}" opacity=".8">FIND US ON</text>
<text x="62" y="45" font-family="Arial Black,Arial,Helvetica,sans-serif" font-size="14" font-weight="900" font-style="italic" fill="${ink}">ALL ACCESS <tspan fill="${dark ? "#e4ff3a" : "#2457d6"}">PADEL</tspan></text>
</svg>`;
}

export function forClubsPage({ origin, page, total }) {
  const body = `<style>
.steps3{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:14px;margin:18px 0}
.step3{background:var(--card);border:2px solid var(--line);border-radius:4px;padding:14px 16px}.step3 b{font:italic 900 30px/1 "Barlow Condensed",sans-serif;color:var(--court)}
.bgen{background:var(--card);border:2px solid var(--line);border-radius:6px;padding:16px;display:grid;gap:12px}
.bgen input,.bgen select{font:16px Barlow,sans-serif;min-height:44px;padding:6px 10px;border:2px solid var(--line);border-radius:4px;background:var(--bg);color:var(--ink);width:100%}
.bgen textarea{width:100%;min-height:96px;font:13px ui-monospace,Menlo,monospace;padding:10px;border:2px solid var(--line);border-radius:4px;background:var(--bg);color:var(--ink)}
.matches{display:grid;gap:6px}.matches button{text-align:left;font:15px Barlow,sans-serif;padding:8px 10px;border:2px solid var(--line);border-radius:4px;background:var(--bg);color:var(--ink);cursor:pointer}
.prev{display:flex;gap:16px;flex-wrap:wrap;align-items:center}.prev .dk{background:#0d1b3d;padding:10px;border-radius:6px}
</style>
<h1>For padel clubs</h1>
<p class="lead">All Access Padel lists <b>${total} padel venues</b> across Britain, and players use it to find courts near them. Your listing is free. Here's how to make the most of it.</p>
<div class="steps3">
<div class="step3"><b>1</b><h3>Claim your listing</h3><p>Open your club's page and tap <b>Claim this venue</b>. Once we've checked you're from the club, you'll get a private link to update your details.</p></div>
<div class="step3"><b>2</b><h3>Add prices and photos of your offer</h3><p>Clubs with prices, opening hours, facilities and a booking link get far more clicks. Players filter by these.</p></div>
<div class="step3"><b>3</b><h3>Add our badge to your site</h3><p>Link to your listing with the badge below, so players can read reviews and find you, and your page climbs in Google.</p></div>
</div>
<h2 id="badge">Get your "Find us on All Access Padel" badge</h2>
<div class="bgen">
<label for="clubq"><b>Find your club</b></label>
<input id="clubq" type="search" placeholder="Start typing your club's name" autocomplete="off">
<div class="matches" id="matches"></div>
<div id="out" hidden>
<p><b id="chosen"></b></p>
<div class="prev"><img src="/badge.svg" width="220" height="64" alt="Find us on All Access Padel"><span class="dk"><img src="/badge.svg?style=dark" width="220" height="64" alt="Find us on All Access Padel"></span></div>
<label for="style"><b>Style</b></label><select id="style"><option value="light">Light (for white or light websites)</option><option value="dark">Dark (for dark websites)</option></select>
<label for="code"><b>Copy this code into your website</b> (most website builders have an "embed HTML" or "code" block)</label>
<textarea id="code" readonly></textarea>
<button class="btn y" type="button" id="copy">Copy code</button> <span id="copied" class="muted"></span>
</div>
</div>
<h2>Get featured</h2>
<p>Featured clubs appear first for players searching nearby and at the top of their area and town pages. To ask about a featured spot, claim your listing and tick <b>"I'm interested in a featured listing"</b>, and we'll be in touch.</p>
<h2>Spotted something wrong?</h2>
<p>Use the <a href="/#add">add a court or deal</a> form, or claim your listing to fix it yourself. Every change is checked before it goes live.</p>
<script>
const $=id=>document.getElementById(id);let V=[],cur=null;
const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
fetch("/api/venues").then(r=>r.json()).then(d=>{V=Array.isArray(d)?d:[];const id=new URLSearchParams(location.search).get("venue");if(id){const v=V.find(x=>x.id===id);if(v)pick(v)}});
$("clubq").addEventListener("input",e=>{const q=e.target.value.trim().toLowerCase();if(q.length<2){$("matches").innerHTML="";return}
$("matches").innerHTML=V.filter(v=>(v.name+" "+(v.postcode||"")).toLowerCase().includes(q)).slice(0,8).map(v=>'<button type="button" data-id="'+esc(v.id)+'">'+esc(v.name)+' <span class="muted">'+esc(v.postcode||"")+'</span></button>').join("")||'<p class="muted">No match. Try a shorter name, or <a href="/#add">add your club</a>.</p>'});
$("matches").addEventListener("click",e=>{const b=e.target.closest("button");if(b)pick(V.find(v=>v.id===b.dataset.id))});
function pick(v){cur=v;$("out").hidden=false;$("matches").innerHTML="";$("clubq").value=v.name;$("chosen").textContent="Badge for "+v.name;code()}
function code(){if(!cur)return;const s=$("style").value;$("code").value='<a href="${origin}/venues/'+encodeURIComponent(cur.id)+'" title="'+esc(cur.name)+' on All Access Padel"><img src="${origin}/badge.svg'+(s==="dark"?"?style=dark":"")+'" width="220" height="64" alt="Find us on All Access Padel"></a>'}
$("style").addEventListener("change",code);
$("copy").addEventListener("click",async()=>{try{await navigator.clipboard.writeText($("code").value);$("copied").textContent="Copied."}catch(e){$("code").select();$("copied").textContent="Press Ctrl+C (or Cmd+C) to copy."}});
</script>`;
  return page({ origin, path: "/for-clubs", title: "For padel clubs: claim your free listing and get our badge | All Access Padel",
    description: "Run a padel club? Claim your free All Access Padel listing, add prices and booking links, and add a 'Find us on All Access Padel' badge to your website.", body,
    jsonld: [{ "@context": "https://schema.org", "@type": "WebPage", name: "For padel clubs", url: `${origin}/for-clubs` }] });
}
