const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../db");

// Craigslist category codes for resale vehicles/powersports
const TARGETS = [
  { code: "mca", category: "Motorcycles",    subcategory: "Street / Cruiser" },
  { code: "atv", category: "Motorcycles",    subcategory: "ATV / UTV / Dirt Bike" },
  { code: "boa", category: "Boats",          subcategory: "Powerboat" },
  { code: "jet", category: "Boats",          subcategory: "Jet Ski / PWC" },
  { code: "rvs", category: "RVs & Campers",  subcategory: "RV / Motorhome" },
  { code: "snw", category: "Powersports",    subcategory: "Snowmobile" },
];

// Major metro areas to scrape — covers most of the US market
const METROS = [
  "sfbay", "losangeles", "newyork", "chicago", "dallas",
  "houston", "phoenix", "miami", "seattle", "denver",
  "atlanta", "boston", "sandiego", "portland", "minneapolis",
];

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parsePrice(text) {
  if (!text) return null;
  const match = text.replace(/,/g, "").match(/\$?([\d]+)/);
  return match ? parseFloat(match[1]) : null;
}

function inferCondition(title = "") {
  const t = title.toLowerCase();
  if (t.includes("new") || t.includes("brand new") || t.includes("0 miles") || t.includes("never")) return "New";
  if (t.includes("excellent") || t.includes("mint") || t.includes("perfect")) return "Excellent";
  if (t.includes("good") || t.includes("runs great") || t.includes("runs well")) return "Good";
  if (t.includes("fair") || t.includes("project") || t.includes("needs") || t.includes("parts")) return "Fair";
  return "Good";
}

async function scrapeMetroCategory(metro, target) {
  const url = `https://${metro}.craigslist.org/search/${target.code}?sort=date&limit=30`;
  const results = [];

  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 12000 });
    const $ = cheerio.load(data);

    $("li.cl-search-result, li.result-row").each((_, el) => {
      const $el = $(el);

      // Support both old and new Craigslist markup
      const title =
        $el.find(".cl-app-anchor .label, .result-title").first().text().trim() ||
        $el.find("a.cl-app-anchor").attr("title") || "";

      const priceText =
        $el.find(".priceinfo, .result-price").first().text().trim();

      const price = parsePrice(priceText);
      if (!price || price < 500 || price > 500000) return; // filter junk

      const href =
        $el.find("a.cl-app-anchor, a.result-title").first().attr("href") || "";

      const sourceId = href.match(/(\d{10,})/)?.[1] || null;
      const location =
        $el.find(".meta .separator ~ span, .result-hood").first().text().replace(/[()]/g, "").trim() || metro;

      if (!title || title.length < 5) return;

      results.push({
        source: "craigslist",
        source_id: sourceId,
        title,
        price,
        category: target.category,
        subcategory: target.subcategory,
        condition: inferCondition(title),
        location,
        url: href.startsWith("http") ? href : `https://${metro}.craigslist.org${href}`,
      });
    });
  } catch (err) {
    // Network errors per metro are expected — just skip
  }

  return results;
}

const insert = db.prepare(`
  INSERT INTO listings (source, source_id, title, price, category, subcategory, condition, location, url, scraped_at)
  VALUES (@source, @source_id, @title, @price, @category, @subcategory, @condition, @location, @url, datetime('now'))
  ON CONFLICT(source, source_id) DO UPDATE SET
    price = excluded.price,
    scraped_at = excluded.scraped_at
`);

const log = db.prepare(`
  INSERT INTO scrape_log (source, category, status, count, message)
  VALUES (?, ?, ?, ?, ?)
`);

async function scrape() {
  console.log("[craigslist] Starting scrape…");
  let total = 0;

  for (const target of TARGETS) {
    let categoryCount = 0;

    for (const metro of METROS) {
      const listings = await scrapeMetroCategory(metro, target);

      const insertMany = db.transaction((rows) => {
        for (const row of rows) insert.run(row);
      });
      insertMany(listings);
      categoryCount += listings.length;
      total += listings.length;

      await sleep(800 + Math.random() * 600); // polite delay between requests
    }

    log.run("craigslist", target.category, "ok", categoryCount, null);
    console.log(`[craigslist] ${target.category} (${target.subcategory}): ${categoryCount} listings`);
  }

  console.log(`[craigslist] Done. ${total} total listings saved.`);
  return total;
}

module.exports = { scrape };
