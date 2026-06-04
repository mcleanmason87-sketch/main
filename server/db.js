const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "../data/pricepulse.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS listings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    source      TEXT NOT NULL,
    source_id   TEXT,
    title       TEXT NOT NULL,
    price       REAL NOT NULL,
    category    TEXT NOT NULL,
    subcategory TEXT,
    condition   TEXT DEFAULT 'Unknown',
    location    TEXT,
    url         TEXT,
    image_url   TEXT,
    sold        INTEGER DEFAULT 0,
    scraped_at  TEXT NOT NULL DEFAULT (datetime('now')),
    listed_at   TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_listings_category  ON listings(category);
  CREATE INDEX IF NOT EXISTS idx_listings_source    ON listings(source);
  CREATE INDEX IF NOT EXISTS idx_listings_scraped   ON listings(scraped_at);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_listings_source_id ON listings(source, source_id)
    WHERE source_id IS NOT NULL;

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
