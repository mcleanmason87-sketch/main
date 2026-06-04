const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "../data/pricepulse.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS listings (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    source       TEXT NOT NULL,
    source_id    TEXT,
    title        TEXT NOT NULL,
    price        REAL NOT NULL,
    category     TEXT NOT NULL,
    subcategory  TEXT,
    condition    TEXT DEFAULT 'Unknown',
    location     TEXT,
    url          TEXT,
    image_url    TEXT,
    sold         INTEGER DEFAULT 0,
    first_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
    scraped_at   TEXT NOT NULL DEFAULT (datetime('now')),
    listed_at    TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_listings_category   ON listings(category);
  CREATE INDEX IF NOT EXISTS idx_listings_source     ON listings(source);
  CREATE INDEX IF NOT EXISTS idx_listings_first_seen ON listings(first_seen_at);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_listings_source_id ON listings(source, source_id);

  CREATE TABLE IF NOT EXISTS kbb_values (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    make          TEXT NOT NULL,
    model         TEXT NOT NULL,
    year          INTEGER NOT NULL,
    trim          TEXT,
    trade_in_low  REAL,
    trade_in_high REAL,
    private_low   REAL,
    private_high  REAL,
    retail_low    REAL,
    retail_high   REAL,
    msrp          REAL,
    kbb_url       TEXT,
    scraped_at    TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(make, model, year, trim)
  );

  CREATE INDEX IF NOT EXISTS idx_kbb_make  ON kbb_values(make);
  CREATE INDEX IF NOT EXISTS idx_kbb_year  ON kbb_values(year);
  CREATE INDEX IF NOT EXISTS idx_kbb_model ON kbb_values(make, model);

  CREATE TABLE IF NOT EXISTS scrape_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    source     TEXT NOT NULL,
    category   TEXT,
    status     TEXT NOT NULL,
    count      INTEGER DEFAULT 0,
    message    TEXT,
    ran_at     TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

module.exports = db;
