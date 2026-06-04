const cron = require("node-cron");
const craigslist = require("./scrapers/craigslist");
const ebay = require("./scrapers/ebay");

async function runAll() {
  console.log(`\n[scheduler] Running scrape at ${new Date().toISOString()}`);
  try {
    await craigslist.scrape();
  } catch (err) {
    console.error("[scheduler] Craigslist error:", err.message);
  }
  try {
    await ebay.scrape();
  } catch (err) {
    console.error("[scheduler] eBay error:", err.message);
  }
  console.log("[scheduler] Scrape cycle complete.\n");
}

function start() {
  // Run once immediately on startup
  runAll();

  // Then every 4 hours
  cron.schedule("0 */4 * * *", runAll);
  console.log("[scheduler] Scheduled: scraping every 4 hours.");
}

module.exports = { start, runAll };
