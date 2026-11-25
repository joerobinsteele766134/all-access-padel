// Long-form guides for players (SEO + AI search). Static, hand-written content with sources.
const amazon = (q, tag) => `https://www.amazon.co.uk/s?k=${encodeURIComponent(q)}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`;
const src = (href, text) => `<a href="${href}" rel="noopener" target="_blank">${text}</a>`;

export const GUIDES = [
  {
    slug: "how-much-does-padel-cost-uk",
    title: "How much does padel cost in the UK?",
    description: "Typical UK padel court prices: around £27 an hour off-peak (about £7 each for four players), with peak and London prices higher. Real examples, plus ways to pay less.",
    updated: "2026-11-24",
    faq: [
      ["How much does it cost to play padel in the UK?", "The LTA's research puts the average off-peak court booking at £27 an hour, which is about £7 per person when four of you split it. Peak times and big-city indoor clubs cost more, with some London courts charging £80 or more an hour at peak."],
      ["Is padel cheaper than tennis?", "Per person it's often similar, because a padel court is always shared by four players. Splitting a £27 court four ways comes to about £7 each."],
      ["Do I need to buy a racket to play padel?", "No. Most venues hire rackets, usually for about £2 to £5, so you can try padel before buying your own."],
    ],
    body: (ctx) => `
<p class="lead"><b>Short answer:</b> expect to pay about <b>£27 an hour for a court off-peak</b>, which is around <b>£7 each</b> when four of you split it. Evenings, weekends and premium indoor clubs cost more, and London is the most expensive place to play.</p>

<p><b>Compare real prices:</b> see <a href="/padel-prices">published court prices at UK clubs, cheapest first</a>, with city-by-city comparisons.</p>
<h2>Average padel prices in the UK</h2>
<p>The LTA, which runs padel in Britain, says an average off-peak court booking costs ${src("https://www.ltapadel.org.uk/news/2026/march/860000-players-lta-unveils-latest-figures-on-growth-of-padel-in-britain/", "£7 per person per hour, or £27 an hour for a doubles booking")}.</p>
<p>Prices vary a lot by venue. Property adviser Savills found ${src("https://www.savills.co.uk/research_articles/166219/388810-0", "off-peak rates from £18.50 to £48.80 an hour, with peak rates up to £72.50")}.</p>

<table>
<thead><tr><th>Where</th><th>Typical court price per hour</th><th>Source</th></tr></thead>
<tbody>
<tr><td>UK average, off-peak</td><td>£27 (about £7 each)</td><td>${src("https://www.ltapadel.org.uk/news/2026/march/860000-players-lta-unveils-latest-figures-on-growth-of-padel-in-britain/", "LTA")}</td></tr>
<tr><td>UK range</td><td>£18.50–£48.80 off-peak, up to £72.50 peak</td><td>${src("https://www.savills.co.uk/research_articles/166219/388810-0", "Savills")}</td></tr>
<tr><td>Greater Manchester</td><td>£15–£60</td><td>${src("https://thepadelpaper.com/why-manchester-is-the-uks-padel-capital-and-where-to-play/", "The Padel Paper")}</td></tr>
<tr><td>London</td><td>£20 (cheapest) to £80 at peak</td><td>${src("https://www.timeout.com/london/news/a-comprehensive-map-of-londons-padel-courts-with-pricing-031925", "Time Out")}</td></tr>
</tbody></table>

<h2>Why London costs more</h2>
<p>Land is expensive, so many London clubs are premium indoor venues. Time Out found the cheapest London court at ${src("https://www.timeout.com/london/news/a-comprehensive-map-of-londons-padel-courts-with-pricing-031925", "£20 an hour in Kingston, £40 in Regent's Park and Hyde Park, and £80 at peak in Totteridge")}. City AM reported that many London rates for four people over an hour sit ${src("https://www.cityam.com/?p=2363295", "around £60, and some go over £95")}.</p>

${ctx.priced.length ? `<h2>Prices at venues on All Access Padel</h2>
<p>These are prices we've found published by the venues themselves. They change often, so check when you book.</p>
<table><thead><tr><th>Venue</th><th>Area</th><th>Price</th></tr></thead><tbody>
${ctx.priced.map(v => `<tr><td><a href="/venues/${ctx.esc(v.id)}">${ctx.esc(v.name)}</a></td><td>${ctx.esc(v.district || "")}</td><td>${ctx.esc(v.price)}</td></tr>`).join("")}
</tbody></table>` : ""}

<h2>Extra costs to expect</h2>
<ul>
<li><b>Racket hire:</b> usually about £2–£5. For example, Smash Padel Oxford charges £3 an hour.</li>
<li><b>Balls:</b> a tube of three costs around £5–£7 if the venue doesn't provide them.</li>
<li><b>Membership:</b> optional. It usually brings cheaper courts and earlier booking, which only pays off if you play every week.</li>
</ul>

<h2>Six ways to pay less for padel</h2>
<ol>
<li><b>Always play as four.</b> Courts are priced per court, so splitting four ways is the cheapest way to play.</li>
<li><b>Play off-peak.</b> Weekday daytime slots are often much cheaper than evenings and weekends.</li>
<li><b>Try outdoor or council courts.</b> Park and leisure-centre courts are usually cheaper than indoor clubs.</li>
<li><b>Start with a free intro session.</b> Many clubs run them, and they come with rackets. See our <a href="/#deals">deals board</a>.</li>
<li><b>Look for discounts.</b> Some clubs offer student or Blue Light Card discounts.</li>
<li><b>Join if you play weekly.</b> Do the maths on membership against what you'd pay per game.</li>
</ol>
<p><a class="btn y" href="/">Find padel courts near you</a></p>`,
  },
  {
    slug: "padel-rules",
    title: "Padel rules explained: a simple guide for beginners",
    description: "The rules of padel in plain English: the court, the underarm serve, how the walls work, scoring and the golden point.",
    updated: "2026-11-24",
    faq: [
      ["Can you hit the ball off the wall in padel?", "Yes. After the ball bounces once on your side, it can hit the glass walls and you can still return it. You can also hit it against your own walls to get it back over the net."],
      ["How do you serve in padel?", "Bounce the ball behind the service line, then hit it underarm at or below waist height, diagonally into your opponent's service box. You get two attempts."],
      ["How is padel scored?", "Scoring is the same as tennis: 15, 30, 40, game, with sets usually first to six games. Many clubs use a 'golden point' at deuce, where the next point wins the game."],
      ["Is padel always played in doubles?", "Almost always. Padel is designed for two against two, although some venues have narrower singles courts."],
    ],
    body: () => `
<p class="lead">Padel is a doubles racket sport played on a court about a third the size of a tennis court, with glass and mesh walls that stay in play. Scoring is the same as tennis. Here's everything you need for your first game.</p>
<h2>The court and kit</h2>
<ul>
<li>The court is <b>20 m long and 10 m wide</b>, enclosed by glass at each end and mesh along the sides.</li>
<li>It's split by a net with a service box on each side, just like tennis.</li>
<li>Rackets are solid with no strings, usually with holes in the face. Balls look like tennis balls but are slightly lower pressure.</li>
</ul>
<h2>Serving</h2>
<ol>
<li>Stand behind the service line and bounce the ball once.</li>
<li>Hit it <b>underarm</b>, at or below waist height.</li>
<li>Serve diagonally into your opponent's service box. It must bounce in the box before it touches anything else.</li>
<li>If it lands in the box and then hits the side mesh, it's a fault. If it hits the back glass after bouncing, it's in.</li>
<li>You get two serves, as in tennis. A serve that clips the net and lands in is a let and is replayed.</li>
</ol>
<h2>How the walls work</h2>
<ul>
<li>The ball must bounce <b>once on the floor</b> on your side before it touches any wall.</li>
<li>After that bounce it can hit the walls, as many as it likes, and you can still return it.</li>
<li>You can also hit the ball against your own walls to get it back over the net.</li>
<li>If the ball hits the wall on your opponent's side <b>before</b> bouncing, you lose the point.</li>
<li>You can volley (hit it before it bounces), except on the return of serve.</li>
</ul>
<h2>Scoring</h2>
<p>Scoring is the same as tennis: <b>15, 30, 40, game</b>. Sets are usually first to six games, and matches best of three sets. Many clubs play a <b>golden point</b> at 40–40: the receiving pair chooses who receives, and the next point wins the game.</p>
<h2>Etiquette</h2>
<ul>
<li>Wear court or tennis shoes with grippy, non-marking soles. Running shoes slip on the turf.</li>
<li>Wear the racket's wrist strap. Rackets are solid and can hurt if they fly.</li>
<li>Keep your feet on your own side, and don't reach over the net to hit the ball.</li>
</ul>
<p>Ready to try it? <a href="/guides/how-much-does-padel-cost-uk">See what padel costs</a>, or <a href="/">find a court near you</a>.</p>`,
  },
  {
    slug: "padel-vs-tennis",
    title: "Padel vs tennis: what's the difference?",
    description: "How padel compares with tennis: court size, walls, rackets, serving, scoring, cost and which is easier to learn.",
    updated: "2026-11-24",
    faq: [
      ["Is padel easier than tennis?", "Most beginners find padel easier to pick up: the court is smaller, the serve is underarm and the walls keep the ball in play. Many people manage proper rallies in their first hour."],
      ["Is padel scored like tennis?", "Yes. Padel uses the same 15, 30, 40, game scoring, and sets are usually first to six games."],
      ["Can tennis players play padel?", "Yes, and tennis skills transfer well. The main things to learn are the underarm serve and letting the ball come off the back glass."],
    ],
    body: () => `
<p class="lead">Padel borrows tennis scoring but plays very differently. The court is smaller and walled, the serve is underarm, and it's almost always doubles. That's why it's easier to pick up and so social.</p>
<table>
<thead><tr><th></th><th>Padel</th><th>Tennis</th></tr></thead>
<tbody>
<tr><td>Court</td><td>20 m × 10 m, walled with glass and mesh</td><td>23.77 m × 10.97 m (doubles), open</td></tr>
<tr><td>Players</td><td>Almost always doubles</td><td>Singles or doubles</td></tr>
<tr><td>Walls</td><td>In play after one bounce</td><td>None</td></tr>
<tr><td>Racket</td><td>Solid, stringless, shorter</td><td>Strung, longer</td></tr>
<tr><td>Serve</td><td>Underarm, at or below waist height</td><td>Overarm</td></tr>
<tr><td>Scoring</td><td>15, 30, 40, game (often with a golden point)</td><td>15, 30, 40, game with deuce and advantage</td></tr>
<tr><td>Learning curve</td><td>Rallies in the first session</td><td>Takes longer to rally consistently</td></tr>
</tbody></table>
<h2>Which is easier to learn?</h2>
<p>For most people, padel. The underarm serve removes the hardest shot in tennis, the shorter racket is easier to control, and the walls give you a second chance at the ball. That's a big reason padel has grown so fast in Britain.</p>
<h2>Which is more social?</h2>
<p>Padel. It's played two against two in a small space, so you're always close to the other players. Clubs run "Americanos" where you rotate partners, which makes it easy to turn up on your own and meet people.</p>
<h2>What does each cost?</h2>
<p>Per person, padel is often similar to tennis because the court is always split four ways. <a href="/guides/how-much-does-padel-cost-uk">See our full padel price guide</a>.</p>
<p><a class="btn y" href="/">Find a padel court near you</a></p>`,
  },
  {
    slug: "best-beginner-padel-rackets",
    title: "Best padel rackets for beginners (UK)",
    description: "How to choose your first padel racket: round shape, around 355–370 g, soft core, low balance and £55–£115. Beginner picks available in the UK.",
    updated: "2026-11-24",
    affiliate: true,
    faq: [
      ["What padel racket should a beginner buy?", "Choose a round racket weighing about 355–370 g, with a soft EVA core and a low (head-light) balance. These are the most forgiving and the easiest on your arm."],
      ["How much should I spend on my first padel racket?", "Beginner rackets in the UK generally cost about £55 to £130. Below around £60, quality can be inconsistent; above about £130 you're paying for features beginners won't use."],
      ["Should I hire or buy a padel racket?", "Hire for your first few sessions, usually about £2–£5, then buy once you know you'll keep playing."],
    ],
    body: (ctx) => {
      const p = [
        ["Adidas Match Light 2026", "Adidas Match Light 2026 padel racket", "Round, light and forgiving. A specialist UK retailer calls it the racket it hands to first-time buyers most often.", "Around £55", src("https://centralsports.co.uk/blogs/padel-1/best-padel-rackets-for-beginners-uk-2026-buyers-guide", "Central Sports")],
        ["Adidas Match Blue 3.4", "Adidas Match Blue 3.4 padel racket", "A budget first racket from a major brand.", "Under £60", src("https://padelspeak.com/en/?p=58985", "PadelSpeak")],
        ["Bullpadel Open Control", "Bullpadel Open Control padel racket", "A control-focused round racket that's popular with first-time buyers.", "Check price", src("https://centralsports.co.uk/blogs/padel-1/best-padel-rackets-for-beginners-uk-2026-buyers-guide", "Central Sports")],
        ["Babolat Air Origin", "Babolat Air Origin padel racket", "Very forgiving and light at around 345 g. A strong all-rounder for your first year.", "Under £90", src("https://padelspeak.com/en/?p=58985", "PadelSpeak")],
        ["Starvie Nyra 2026", "Starvie Nyra 2026 padel racket", "Round with a soft feel and a low-to-medium balance, built for control and easy ball striking.", "Check price", src("https://padelmarket.com/en-eu/blogs/blog/best-padel-rackets-beginners", "Padel Market")],
        ["Bullpadel Indiga Girl 2026", "Bullpadel Indiga Girl 2026 padel racket", "Round and light at 350–365 g with a low balance, designed for comfort and control.", "Check price", src("https://padelmarket.com/en-eu/blogs/blog/best-padel-rackets-beginners", "Padel Market")],
      ];
      return `
<p class="lead"><b>Short answer:</b> for your first racket, buy one that's <b>round, around 355–370 g, with a soft EVA core and a low balance</b>, and expect to pay about <b>£55–£115</b>. That's the advice of UK specialist ${src("https://centralsports.co.uk/blogs/padel-1/best-padel-rackets-for-beginners-uk-2026-buyers-guide", "Central Sports")}.</p>
<p class="muted">${ctx.amazonTag ? "As an Amazon Associate, All Access Padel earns from qualifying purchases. It doesn't change the price you pay." : ""} Prices change often, so check before you buy.</p>
<h2>What to look for</h2>
<table><thead><tr><th>Feature</th><th>Choose</th><th>Why</th></tr></thead><tbody>
<tr><td>Shape</td><td>Round</td><td>Biggest sweet spot, so mishits still go over</td></tr>
<tr><td>Weight</td><td>About 355–370 g</td><td>Easy to swing, less strain on your arm</td></tr>
<tr><td>Core</td><td>Soft EVA or foam</td><td>More forgiving and comfortable</td></tr>
<tr><td>Balance</td><td>Low (head-light)</td><td>More control at the net</td></tr>
<tr><td>Face</td><td>Fibreglass or soft carbon</td><td>Fibreglass is softer and more flexible; carbon is firmer and more powerful</td></tr>
<tr><td>Budget</td><td>About £55–£130</td><td>Below about £60, ${src("https://breakingthelines.com/@btl/what-makes-a-good-beginner-padel-racket-a-complete-buying-guide-for-new-players-in-the-uk", "quality can be inconsistent")}</td></tr>
</tbody></table>
<h2>Beginner padel rackets to consider</h2>
<p>These come up again and again in UK beginner guides. We haven't tested them ourselves, so we've linked each recommendation to its source.</p>
<div class="picks">
${p.map(([name, q, why, price, from]) => `<div class="pick"><h3>${name}</h3><p>${why}</p><p class="muted">${price} · Recommended by ${from}</p><a class="btn y" href="${amazon(q, ctx.amazonTag)}" rel="sponsored nofollow noopener" target="_blank">See it on Amazon</a></div>`).join("")}
</div>
<h2>Also worth buying</h2>
<ul>
<li><b>Padel shoes</b> with a herringbone ("clay") sole: <a href="${amazon("padel shoes", ctx.amazonTag)}" rel="sponsored nofollow noopener" target="_blank">browse on Amazon</a></li>
<li><b>Padel balls</b> (not tennis balls): <a href="${amazon("padel balls", ctx.amazonTag)}" rel="sponsored nofollow noopener" target="_blank">browse on Amazon</a></li>
<li><b>A racket cover or bag</b> to protect the face: <a href="${amazon("padel racket bag", ctx.amazonTag)}" rel="sponsored nofollow noopener" target="_blank">browse on Amazon</a></li>
</ul>
<p><a class="btn y" href="/kit">Browse the full kit shop</a></p>
<h2>Hire before you buy</h2>
<p>Most clubs hire rackets for about £2–£5. Play a few sessions first, then buy once you know you're hooked. <a href="/">Find a court near you</a>.</p>`;
    },
  },
];
