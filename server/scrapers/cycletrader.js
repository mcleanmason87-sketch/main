const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../db");

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

const TARGETS = [
  { path: "motorcycles-for-sale",           category: "Motorcycles", subcategory: "Street / Cruiser" },
  { path: "sport-motorcycles-for-sale",     category: "Motorcycles", subcategory: "Sport Bike" },
  { path: "cruiser-motorcycles-for-sale",   category: "Motorcycles", subcategory: "Street / Cruiser" },
  { path: "adventure-motorcycles-for-sale", category: "Motorcycles", subcategory: "Adventure / Dual Sport" },
  { path: "dirt-bikes-for-sale",            category: "Motorcycles", subcategory: "Dirt Bike" },
  { path: "classic-motorcycles-for-sale",   category: "Motorcycles", subcategory: "Classic / Vintage" },
];

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function parsePrice(text) {
  if (!text) return null;
  const m = text.replace(/,/g, "").match(/\$?([\d]+)/);
  return m ? parseFloat(m[1]) : null;
}

function inferCondition(text = "") {
  const t = text.toLowerCase();
  if (t.includes("new"))       return "New";
  if (t.includes("excellent")) return "Excellent";
  if (t.includes("fair") || t.includes("project")) return "Fair";
  return "Good";
}

async function scrapePage(target, page = 1) {
  const url = `https://www.cycletrader.com/${target.path}/?page=${page}&ad-type=used`;
  const results = [];

  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 12000 });
    const $ = cheerio.load(data);

    // CycleTrader listing cards
    $("[class*='listing-card'], [data-testid*='listing'], .listing-item, article").each((_, el) => {
      const $el = $(el);

      const title =
        $el.find("h2, h3, [class*='title'], [class*='heading']").first().text().trim();

      const priceText =
        $el.find("[class*='price'], [data-testid*='price']").first().text().trim();

      const price = parsePrice(priceText);
      if (!price || price < 500 || price > 300000) return;
      if (!title || title.length < 5) return;

      const href = $el.find("a").first().attr("href") || "";
      const fullUrl = href.startsWith("http") ? href : `https://www.cycletrader.com${href}`;
      const sourceId = href.match(/\/(\d+)\/?/)?.[1] || `ct-${title.slice(0,20)}-${price}`.replace(/\s+/g, "-");

      const location =
        $el.find("[class*='location'], [class*='city']").first().text().trim() || "USA";

      const conditionText =
        $el.find("[class*='condition']").first().text().trim();

      const mileageText =
        $el.find("[class*='mileage'], [class*='miles']").first().text().trim();

      results.push({
        source: "cycletrader",
        source_id: sourceId,
        title,
        price,
        category: target.category,
        subcategory: target.subcategory,
        condition: inferCondition(conditionText || title),
        location,
        url: fullUrl,
        mileage: mileageText || null,
      });
    });

    return results;
  } catch (err) {
    return [];
  }
}

const insert = db.prepare(`
  INSERT INTO listings (source, source_id, title, price, category, subcategory, condition, location, url, first_seen_at, scraped_at)
  VALUES (@source, @source_id, @title, @price, @category, @subcategory, @condition, @location, @url, datetime('now'), datetime('now'))
  ON CONFLICT(source, source_id) DO UPDATE SET
    price = excluded.price,
    scraped_at = datetime('now')
`);

const log = db.prepare(`INSERT INTO scrape_log (source, category, status, count, message) VALUES (?, ?, ?, ?, ?)`);

async function scrape() {
  console.log("[cycletrader] Starting scrape…");
  let total = 0;

  for (const target of TARGETS) {
    let categoryCount = 0;

    // Scrape first 5 pages per category in parallel
    const pages = [1, 2, 3, 4, 5];
    const results = await Promise.all(pages.map((p) => scrapePage(target, p)));
    const all = results.flat();

    const insertMany = db.transaction((rows) => { for (const r of rows) insert.run(r); });
    insertMany(all);
    categoryCount += all.length;
    total += all.length;

    log.run("cycletrader", target.category, "ok", categoryCount, null);
    console.log(`[cycletrader] ${target.subcategory}: ${categoryCount} listings`);
    await sleep(500 + Math.random() * 300);
  }

  console.log(`[cycletrader] Done. ${total} listings saved.`);
  return total;
}

module.exports = { scrape };
