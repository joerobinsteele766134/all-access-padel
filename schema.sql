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
  book_url TEXT
);
CREATE INDEX IF NOT EXISTS idx_venues_latlng ON venues (lat, lng);
CREATE TABLE IF NOT EXISTS import_tokens (token TEXT PRIMARY KEY, created INTEGER);
