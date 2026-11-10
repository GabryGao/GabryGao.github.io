-- HMAC digests only. Never add raw IPs, cookies, user agents, URLs or client IDs here.
CREATE TABLE IF NOT EXISTS visitors (
  ip_hash TEXT PRIMARY KEY NOT NULL CHECK(length(ip_hash) = 64 AND ip_hash NOT GLOB '*[^0-9a-f]*'),
  first_seen TEXT NOT NULL,
  last_seen TEXT NOT NULL
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS daily_visitors (
  day TEXT NOT NULL CHECK(length(day) = 10 AND day GLOB '????-??-??'),
  ip_hash TEXT NOT NULL REFERENCES visitors(ip_hash),
  country TEXT NOT NULL CHECK(length(country) = 2 AND country GLOB '[A-Z][A-Z]'),
  last_seen TEXT NOT NULL,
  PRIMARY KEY(day, ip_hash)
) WITHOUT ROWID;

CREATE INDEX IF NOT EXISTS daily_visitor_last_seen ON daily_visitors(ip_hash, last_seen DESC);
