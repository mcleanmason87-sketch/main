const cron = require("node-cron");
const craigslist = require("./scrapers/craigslist");
const ebay = require("./scrapers/ebay");
const bringatrailer = require("./scrapers/bringatrailer");

async function runAll() {
  console.log(`\n[scheduler] Running scrape at ${new Date().toISOString()}`);
  try { await craigslist.scrape(); }    catch (e) { console.error("[scheduler] Craigslist:", e.message); }
  try { await bringatrailer.scrape(); } catch (e) { console.error("[scheduler] BaT:", e.message); }
  try { await ebay.scrape(); }          catch (e) { console.error("[scheduler] eBay:", e.message); }
  console.log("[scheduler] Scrape cycle complete.\n");
}

function start() {
  runAll();
  // Re-scrape every 4 hours; BaT historical data changes slowly so this is fine
  cron.schedule("0 */4 * * *", runAll);
  console.log("[scheduler] Scheduled: scraping every 4 hours.");
}

module.exports = { start, runAll };
