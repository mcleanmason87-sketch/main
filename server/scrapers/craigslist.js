const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../db");

const TARGETS = [
  { code: "mca", category: "Motorcycles",    subcategory: "Street / Cruiser" },
  { code: "atv", category: "Motorcycles",    subcategory: "ATV / UTV / Dirt Bike" },
  { code: "boa", category: "Boats",          subcategory: "Powerboat" },
  { code: "jet", category: "Boats",          subcategory: "Jet Ski / PWC" },
  { code: "rvs", category: "RVs & Campers",  subcategory: "RV / Motorhome" },
  { code: "snw", category: "Powersports",    subcategory: "Snowmobile" },
];

const METROS = [
  "sfbay", "losangeles", "newyork", "chicago", "dallas",
  "houston", "phoenix", "miami", "seattle", "denver",
  "atlanta", "boston", "sandiego", "portland", "minneapolis",
  "detroit", "nashville", "austin", "tampa", "charlotte",
  "indianapolis", "columbus", "lasvegas", "saltlakecity", "kansascity",
];

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function parsePrice(text) {
  if (!text) return null;
  const m = text.replace(/,/g, "").match(/\$?([\d]+)/);
  return m ? parseFloat(m[1]) : null;
}

function inferCondition(title = "") {
  const t = title.toLowerCase();
  if (t.includes("new") || t.includes("brand new") || t.includes("never") || t.includes("0 miles")) return "New";
  if (t.includes("excellent") || t.includes("mint") || t.includes("perfect")) return "Excellent";
  if (t.includes("good") || t.includes("runs great") || t.includes("runs well") || t.includes("clean")) return "Good";
  if (t.includes("fair") || t.includes("project") || t.includes("needs") || t.includes("parts") || t.includes("damage")) return "Fair";
  return "Good";
}

async function scrapeMetroCategory(metro, target, offset = 0) {
  const url = `https://${metro}.craigslist.org/search/${target.code}?sort=date&s=${offset}`;
  const results = [];

  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 12000 });
    const $ = cheerio.load(data);
    let hasMore = false;

    $("li.cl-search-result, li.result-row").each((_, el) => {
      const $el = $(el);
      const title =
        $el.find(".cl-app-anchor .label, .result-title").first().text().trim() ||
        $el.find("a.cl-app-anchor").attr("title") || "";
      const priceText = $el.find(".priceinfo, .result-price").first().text().trim();
      const price = parsePrice(priceText);
      if (!price || price < 500 || price > 500000) return;

      const href = $el.find("a.cl-app-anchor, a.result-title").first().attr("href") || "";
      const sourceId = href.match(/(\d{10,})/)?.[1] || null;
      const location = $el.find(".meta .separator ~ span, .result-hood").first().text().replace(/[()]/g, "").trim() || metro;

      if (!title || title.length < 5) return;
      hasMore = true;

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

    return { results, hasMore: hasMore && results.length >= 25 };
  } catch {
    return { results: [], hasMore: false };
  }
}

const insert = db.prepare(`
  INSERT INTO listings (source, source_id, title, price, category, subcategory, condition, location, url, first_seen_at, scraped_at)
  VALUES (@source, @source_id, @title, @price, @category, @subcategory, @condition, @location, @url, datetime('now'), datetime('now'))
  ON CONFLICT(source, source_id) DO UPDATE SET
    price      = excluded.price,
    scraped_at = datetime('now')
    -- first_seen_at is intentionally NOT updated so the 1-year clock starts from first scrape
`);

const log = db.prepare(`
  INSERT INTO scrape_log (source, category, status, count, message)
  VALUES (?, ?, ?, ?, ?)
`);

async function scrape() {
  console.log("[craigslist] Starting scrape across 25 metros…");
  let total = 0;

  for (const target of TARGETS) {
    let categoryCount = 0;

    for (const metro of METROS) {
      let offset = 0;
      let pages = 0;

      while (pages < 3) { // up to 3 pages (75–120 results) per metro
        const { results, hasMore } = await scrapeMetroCategory(metro, target, offset);

        const insertMany = db.transaction((rows) => { for (const r of rows) insert.run(r); });
        insertMany(results);
        categoryCount += results.length;
        total += results.length;

        if (!hasMore) break;
        offset += 30;
        pages++;
        await sleep(200 + Math.random() * 150);
      }

      await sleep(250 + Math.random() * 150);
    }

    log.run("craigslist", target.category, "ok", categoryCount, null);
    console.log(`[craigslist] ${target.category} / ${target.subcategory}: ${categoryCount} listings`);
  }

  console.log(`[craigslist] Done. ${total} total listings saved.`);
  return total;
}

module.exports = { scrape };
