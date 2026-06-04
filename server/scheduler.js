const cron = require("node-cron");
const db = require("./db");
const craigslist = require("./scrapers/craigslist");
const ebay = require("./scrapers/ebay");
const bringatrailer = require("./scrapers/bringatrailer");

function pruneOldListings() {
  const result = db.prepare(`
    DELETE FROM listings
    WHERE first_seen_at < datetime('now', '-180 days')
  `).run();

  if (result.changes > 0) {
    console.log(`[cleanup] Removed ${result.changes} listings older than 6 months.`);
    db.prepare(`INSERT INTO scrape_log (source, category, status, count, message) VALUES (?, ?, ?, ?, ?)`)
      .run("system", "cleanup", "ok", result.changes, "Pruned listings older than 6 months");
  }
}

async function runAll() {
  console.log(`\n[scheduler] Running scrape at ${new Date().toISOString()}`);
  try { await craigslist.scrape(); }    catch (e) { console.error("[scheduler] Craigslist:", e.message); }
  try { await bringatrailer.scrape(); } catch (e) { console.error("[scheduler] BaT:", e.message); }
  try { await ebay.scrape(); }          catch (e) { console.error("[scheduler] eBay:", e.message); }
  console.log("[scheduler] Scrape cycle complete.\n");
}

function start() {
  // Run scraper immediately on startup, then every 4 hours
  runAll();
  cron.schedule("0 */4 * * *", runAll);

  // Prune listings older than 6 months once daily at 3am
  cron.schedule("0 3 * * *", pruneOldListings);

  console.log("[scheduler] Ready — scraping every 4 hours, cleanup daily at 3am.");
}

module.exports = { start, runAll };
