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
  created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_submissions_ip ON submissions (ip, created);
