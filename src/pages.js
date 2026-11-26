// Static-ish pages: /about (with contact form), /privacy and /add (suggest a court, deal or fix).
const formCss = `<style>
form.box .row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}@media(max-width:600px){form.box .row2{grid-template-columns:1fr}}
.cards3{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:14px;margin:16px 0}
.card3{background:var(--card);border:2px solid var(--line);border-radius:4px;padding:14px 16px}.card3 h3{margin:0 0 6px;font:italic 800 22px/1.1 "Barlow Condensed",sans-serif}.card3 p{margin:0}
</style>`;
const postScript = (formId, statusId, url, fields, ok) => `<script>
{const $=x=>document.getElementById(x);$("${formId}").addEventListener("submit",async e=>{e.preventDefault();const s=$("${statusId}");s.textContent="Sending…";
try{const r=await fetch("${url}",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({${fields}})});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||"Something went wrong. Try again.");s.textContent=${JSON.stringify(ok)};e.target.reset()}
catch(err){s.textContent=err.message}})}
</script>`;

export function aboutPage({ origin, page, total }) {
  const body = `${formCss}<h1>About All Access Padel</h1>
<p class="lead">All Access Padel is a free, independent guide to every padel court in Britain: where they are, what they cost, and how to book.</p>
<h2>Who runs it</h2>
<p>I'm Joe Steele, and I live in Witney, Oxfordshire. I started All Access Padel because finding a court nearby, and working out what it would cost, meant checking a dozen club websites and booking apps. Now it's all in one place, with ${total} venues and counting.</p>
<h2>Where the information comes from</h2>
<div class="cards3">
<div class="card3"><h3>The LTA court finder</h3><p>Our venue list started from the LTA's padel court finder, the official list for Britain.</p></div>
<div class="card3"><h3>Clubs and players</h3><p>Clubs claim their listings to keep details up to date, and players send in new courts, prices and deals. We check everything before it goes live.</p></div>
<div class="card3"><h3>Weekly checks</h3><p>Every week we look for new clubs opening, planning decisions and padel news, and add new courts as they open.</p></div>
</div>
<p class="muted" style="font-size:14px">Some court locations come from <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap</a> © OpenStreetMap contributors, available under the Open Database Licence. We check each one against the club's own information before listing it.</p>
<p>Prices and offers change often, so always check with the venue before you go. Spotted a mistake? Use the form below or <a href="/add">tell us here</a>.</p>
<h2>How the site is paid for</h2>
<p>All Access Padel is free to use. It's paid for in two ways, and we're upfront about both:</p>
<ul>
<li><b>Kit shop links.</b> As an Amazon Associate, we earn from qualifying purchases made through our kit shop links, at no extra cost to you.</li>
<li><b>Featured listings.</b> Clubs can pay to be featured. Featured venues are always labelled "Featured", and it never changes the information we show about any club.</li>
</ul>
<p>We're not connected to the LTA, any booking app or any of the venues listed.</p>
<h2 id="contact">Get in touch</h2>
<form class="box" id="ctForm" style="position:relative">
  <div class="row2"><div><label for="ctn">Your name</label><input id="ctn" maxlength="80" required autocomplete="name"></div>
  <div><label for="cte">Your email</label><input id="cte" type="email" maxlength="120" required autocomplete="email"></div></div>
  <label for="ctt">What's it about?</label><select id="ctt"><option>General question</option><option>Something's wrong on the site</option><option>I run a padel club</option><option>Partnership or advertising</option><option>Press</option></select>
  <label for="ctm">Message</label><textarea id="ctm" maxlength="2000" required></textarea>
  <input class="hp" id="ctw" tabindex="-1" autocomplete="off" aria-hidden="true">
  <button class="btn y" type="submit">Send message</button>
  <p class="status" id="cts" role="status"></p>
  <p class="muted">We'll only use your details to reply. See our <a href="/privacy">privacy notice</a>.</p>
</form>
${postScript("ctForm", "cts", "/api/contact", 'name:$("ctn").value,email:$("cte").value,topic:$("ctt").value,message:$("ctm").value,website:$("ctw").value', "Thanks, your message has been sent. We'll get back to you soon.")}`;
  return page({ origin, path: "/about", title: "About All Access Padel: who we are and how it works", description: `All Access Padel is a free, independent guide to ${total} padel courts across Britain, run by Joe Steele in Witney, Oxfordshire. How it works, where the data comes from, and how to get in touch.`, body,
    jsonld: [{ "@context": "https://schema.org", "@type": "AboutPage", name: "About All Access Padel", url: `${origin}/about`,
      mainEntity: { "@type": "Organization", name: "All Access Padel", url: origin, founder: { "@type": "Person", name: "Joe Steele", homeLocation: { "@type": "Place", name: "Witney, Oxfordshire" } } } }] });
}

export function privacyPage({ origin, page }) {
  const body = `<h1>Privacy notice</h1>
<p class="lead">We collect as little as we can. This page explains what we keep, why, and how to ask us to delete it.</p>
<p class="muted">Last updated 25 November 2026. All Access Padel is run by Joe Steele. To contact us about your data, use the <a href="/about#contact">contact form</a>.</p>
<h2>Your location</h2>
<p>When you enter a postcode or town, it's looked up with <a href="https://postcodes.io" rel="noopener">postcodes.io</a>, a free UK postcode service, to find its rough location. If you tap "Use my location", your browser shares your position with the page. Either way, your location stays in your own browser and isn't sent to us.</p>
<h2>Things saved in your browser</h2>
<p>We save your location, your filter choices and any courts you've saved in your browser's local storage, so the site remembers them next time. You can clear them at any time in your browser settings. We don't use advertising or tracking cookies.</p>
<h2>Things you send us</h2>
<ul>
<li><b>Court, deal and correction suggestions:</b> what you write, plus your email or phone if you choose to give it, so we can ask questions.</li>
<li><b>Reviews:</b> your rating, review and first name. Only your first name is shown.</li>
<li><b>Club claims:</b> your name, role, work email and phone, so we can check you're from the club.</li>
<li><b>Contact form:</b> your name, email and message, so we can reply.</li>
<li><b>New court alerts:</b> your email and the rough area you chose, with a record of when you agreed. We'll only email you about new courts and local padel news, and every email will have an unsubscribe link.</li>
</ul>
<p>To stop abuse, we also keep a scrambled (one-way hashed) version of your internet address with each form you send. It can't be turned back into the address.</p>
<p>We keep this information while it's needed for the reason you gave it, and we never sell it.</p>
<h2>Other services we use</h2>
<ul>
<li><b>Cloudflare</b> hosts the site and keeps standard security logs.</li>
<li><b>OpenStreetMap</b> supplies the map pictures. Your browser loads them directly.</li>
<li><b>Amazon:</b> if you click a kit shop link, Amazon may set its own cookies on its site, under its own privacy policy.</li>
<li>Booking apps and club websites we link to have their own privacy policies.</li>
</ul>
<h2>Your rights</h2>
<p>You can ask to see, correct or delete anything we hold about you, or to stop getting emails, using the <a href="/about#contact">contact form</a>. If you're unhappy with how we've handled your data, you can complain to the <a href="https://ico.org.uk/make-a-complaint/" rel="noopener">Information Commissioner's Office</a>.</p>`;
  return page({ origin, path: "/privacy", title: "Privacy notice | All Access Padel", description: "What All Access Padel collects, why, and how to ask us to delete it.", body, jsonld: [] });
}

export function addPage({ origin, page }) {
  const body = `${formCss}<nav class="crumbs"><a href="/">Home</a> › Add a court or deal</nav>
<h1>Add a court or a deal</h1>
<p class="lead">Know a court we've missed, spotted an offer or found something wrong? Tell us here. We check everything before it goes on the site.</p>
<form class="box" id="sForm" style="position:relative">
  <label for="sType">What is it?</label><select id="sType"><option>A court we've missed</option><option>A deal or offer</option><option>A price</option><option>Something's wrong</option><option>Other</option></select>
  <label for="sVenue">Venue name</label><input id="sVenue" maxlength="100" required>
  <label for="sDetails">Details</label><textarea id="sDetails" maxlength="800" required placeholder="Where it is, prices, how to book, dates of the offer…"></textarea>
  <label for="sContact">Your email or phone (optional)</label><input id="sContact" maxlength="120">
  <input class="hp" id="sHp" tabindex="-1" autocomplete="off" aria-hidden="true">
  <button class="btn y" type="submit">Send it in</button>
  <p class="status" id="sStatus" role="status"></p>
  <p class="muted">Only the site owner sees what you send. See our <a href="/privacy">privacy notice</a>.</p>
</form>
<h2>Run a padel club?</h2>
<p>Claim your listing to update your details, prices, hours and offers yourself, get our "Find us on All Access Padel" badge, and ask about a Featured spot.</p>
<p><a class="btn b" href="/for-clubs">Club owners: start here</a></p>
${postScript("sForm", "sStatus", "/api/submissions", 'type:$("sType").value,venue:$("sVenue").value,details:$("sDetails").value,contact:$("sContact").value,website:$("sHp").value', "Thanks, got it. We'll check it before it goes on the site.")}`;
  return page({ origin, path: "/add", title: "Add a padel court, price or deal | All Access Padel", description: "Know a padel court we've missed, a price or a deal? Tell us and we'll add it to All Access Padel.", body, jsonld: [] });
}
