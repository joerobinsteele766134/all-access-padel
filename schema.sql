CREATE TABLE IF NOT EXISTS fourths (
  id TEXT PRIMARY KEY,
  venue TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  level TEXT,
  need TEXT,
  contact TEXT NOT NULL,
  token TEXT NOT NULL,
  ip TEXT,
  created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_fourths_date ON fourths (date);
CREATE INDEX IF NOT EXISTS idx_fourths_ip ON fourths (ip, created);
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  type TEXT,
  venue TEXT NOT NULL,
  details TEXT NOT NULL,
  contact TEXT,
  ip TEXT,
  created INTEGER NOT NULL,
  status TEXT DEFAULT 'pending'
);
CREATE INDEX IF NOT EXISTS idx_submissions_ip ON submissions (ip, created);
CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  postcode TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  district TEXT,
  country TEXT,
  courts TEXT,
  lta INTEGER DEFAULT 0,
  url TEXT,
  email TEXT,
  tel TEXT,
  about TEXT,
  deal TEXT,
  price TEXT,
  price_note TEXT,
  price_source TEXT,
  tags TEXT,
  pick INTEGER DEFAULT 0,
  flag TEXT,
  source TEXT,
  updated INTEGER,
  book_url TEXT,
  hours TEXT,
  facilities TEXT,
  featured_until INTEGER,
  claimed INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_venues_latlng ON venues (lat, lng);
CREATE TABLE IF NOT EXISTS import_tokens (token TEXT PRIMARY KEY, created INTEGER);
CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, venue_id TEXT NOT NULL, rating INTEGER NOT NULL, title TEXT, body TEXT NOT NULL, name TEXT NOT NULL, status TEXT DEFAULT 'pending', ip TEXT, created INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_reviews_venue ON reviews (venue_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_ip ON reviews (ip, created);
CREATE TABLE IF NOT EXISTS claims (id TEXT PRIMARY KEY, venue_id TEXT NOT NULL, name TEXT NOT NULL, role TEXT, email TEXT NOT NULL, phone TEXT, message TEXT, status TEXT DEFAULT 'pending', token TEXT, ip TEXT, created INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_claims_token ON claims (token);
CREATE INDEX IF NOT EXISTS idx_claims_ip ON claims (ip, created);
CREATE TABLE IF NOT EXISTS venue_edits (id TEXT PRIMARY KEY, venue_id TEXT NOT NULL, claim_id TEXT, data TEXT NOT NULL, status TEXT DEFAULT 'pending', created INTEGER NOT NULL);

-- UK padel news: our own short summaries linking to the original story
CREATE TABLE IF NOT EXISTS news (id TEXT PRIMARY KEY, title TEXT NOT NULL, summary TEXT NOT NULL, url TEXT NOT NULL, source TEXT NOT NULL, published TEXT NOT NULL, kind TEXT DEFAULT 'news', area TEXT, venue_id TEXT, status TEXT DEFAULT 'live', created INTEGER);
CREATE INDEX IF NOT EXISTS news_pub ON news(status, published);
