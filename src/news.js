// UK padel news. Each item is our own short summary that links to the original story.
// We never copy article text: one or two sentences in our words, plus the source.
export const KINDS = { opening: "New club", planning: "Planning", news: "News", event: "Event" };

export async function latestNews(env, limit = 100, venueId = "") {
  try {
    const sql = `SELECT id, title, summary, url, source, published, kind, area, venue_id FROM news WHERE status = 'live'${venueId ? " AND venue_id = ?" : ""} ORDER BY published DESC, created DESC LIMIT ?`;
    const st = env.DB.prepare(sql);
    return (await (venueId ? st.bind(venueId, limit) : st.bind(limit)).all()).results;
  } catch { return []; }
}

const fmt = d => { try { return new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); } catch { return d; } };

export function newsCard(n, esc) {
  return `<article class="news-item"><p class="news-meta"><span class="news-kind k-${esc(n.kind)}">${esc(KINDS[n.kind] || "News")}</span> <time datetime="${esc(n.published)}">${esc(fmt(n.published))}</time>${n.area ? ` · ${esc(n.area)}` : ""}</p>
<h3>${n.venue_id ? `<a href="/venues/${esc(n.venue_id)}">${esc(n.title)}</a>` : esc(n.title)}</h3><p>${esc(n.summary)}</p>
<p class="news-src">Source: <a href="${esc(n.url)}" rel="noopener" target="_blank">${esc(n.source)}</a>${n.venue_id ? ` · <a href="/venues/${esc(n.venue_id)}">See the club</a>` : ""}</p></article>`;
}

export const NEWS_CSS = `<style>
.news-item{border:2px solid var(--line);border-radius:8px;padding:14px 16px;margin:0 0 12px;background:var(--card)}
.news-item h3{margin:4px 0 6px;font:italic 800 22px/1.15 "Barlow Condensed",sans-serif}.news-item h3 a{color:inherit}
.news-item p{margin:0 0 6px}.news-meta{font-size:13px;color:var(--muted)}.news-src{font-size:13px;color:var(--muted)}.news-src a{color:inherit}
.news-kind{display:inline-block;font-weight:700;font-size:12px;padding:2px 8px;border-radius:999px;background:#e4ff3a;color:#0d1b3d}
.news-kind.k-planning{background:#dbe6ff}.news-kind.k-news{background:#0d1b3d;color:#fff}.news-kind.k-event{background:#ffd6e0}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 16px}.chips a{font-weight:700;text-decoration:none;color:var(--ink);border:2px solid var(--line);border-radius:999px;padding:6px 12px}.chips a.on{background:#e4ff3a;color:#0d1b3d;border-color:#e4ff3a}
</style>`;

export function newsBody(items, esc, kind = "") {
  const list = kind ? items.filter(n => n.kind === kind) : items;
  return `${NEWS_CSS}<h1>UK padel news</h1>
<p>New clubs opening, planning decisions and the biggest padel stories from around Britain. Each story is our quick summary, with a link to the full report.</p>
<nav class="chips" aria-label="Filter news"><a href="/news"${kind ? "" : ' class="on"'}>All</a>${Object.entries(KINDS).map(([k, l]) => `<a href="/news?type=${k}"${kind === k ? ' class="on"' : ""}>${l}</a>`).join("")}</nav>
${list.length ? list.map(n => newsCard(n, esc)).join("") : "<p>No stories here yet. Check back soon.</p>"}
<p class="muted">Know about a new club or court? <a href="/add">Tell us</a> and we'll add it. <a href="/news.xml">RSS feed</a></p>`;
}

export function newsRss(origin, items, esc) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>All Access Padel: UK padel news</title><link>${origin}/news</link>
<atom:link href="${origin}/news.xml" rel="self" type="application/rss+xml"/><description>New padel clubs, planning decisions and padel news from around the UK.</description><language>en-gb</language>
${items.slice(0, 50).map(n => `<item><title>${esc(n.title)}</title><link>${esc(n.venue_id ? `${origin}/venues/${n.venue_id}` : n.url)}</link><guid isPermaLink="false">${esc(n.id)}</guid><pubDate>${new Date(n.published + "T09:00:00Z").toUTCString()}</pubDate><description>${esc(n.summary)} (Source: ${esc(n.source)})</description></item>`).join("\n")}
</channel></rss>`;
}
