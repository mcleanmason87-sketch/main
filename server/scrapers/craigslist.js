const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../db");

const TARGETS = [
  { code: "mca", category: "Motorcycles", subcategory: "Street / Cruiser" },
  { code: "atv", category: "Motorcycles", subcategory: "Dirt Bike" },
];

// Top 10 metros only — fast first run, still broad coverage
const METROS = [
  "losangeles", "newyork", "chicago", "dallas", "houston",
  "miami", "seattle", "phoenix", "atlanta", "denver",
];

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

function parsePrice(text) {
  if (!text) return null;
  const m = text.replace(/,/g, "").match(/\$?([\d]+)/);
  return m ? parseFloat(m[1]) : null;
}

function inferCondition(title = "") {
  const t = title.toLowerCase();
  if (t.includes("new") || t.includes("brand new") || t.includes("never")) return "New";
  if (t.includes("excellent") || t.includes("mint")) return "Excellent";
  if (t.includes("fair") || t.includes("project") || t.includes("needs") || t.includes("parts")) return "Fair";
  return "Good";
}

async function scrapeMetro(metro, target) {
  const url = `https://${metro}.craigslist.org/search/${target.code}?sort=date`;
  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 10000 });
    const $ = cheerio.load(data);
    const results = [];

    $("li.cl-search-result, li.result-row").each((_, el) => {
      const $el = $(el);
      const title =
        $el.find(".cl-app-anchor .label, .result-title").first().text().trim() ||
        $el.find("a.cl-app-anchor").attr("title") || "";
      const priceText = $el.find(".priceinfo, .result-price").first().text().trim();
      const price = parsePrice(priceText);
      if (!price || price < 500 || price > 500000 || !title || title.length < 5) return;

      const href = $el.find("a.cl-app-anchor, a.result-title").first().attr("href") || "";
      const sourceId = href.match(/(\d{10,})/)?.[1] || `cl-${metro}-${title.slice(0,20)}-${price}`.replace(/\s+/g, "-");
      const location = $el.find(".meta .separator ~ span, .result-hood").first().text().replace(/[()]/g, "").trim() || metro;

      results.push({
        source: "craigslist",
        source_id: sourceId,
        title, price,
        category: target.category,
        subcategory: target.subcategory,
        condition: inferCondition(title),
        location,
        url: href.startsWith("http") ? href : `https://${metro}.craigslist.org${href}`,
      });
    });
    return results;
  } catch {
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
  console.log("[craigslist] Starting scrape…");
  let total = 0;

  for (const target of TARGETS) {
    // Scrape all metros in parallel — much faster
    const results = await Promise.all(METROS.map((m) => scrapeMetro(m, target)));
    const all = results.flat();

    const insertMany = db.transaction((rows) => { for (const r of rows) insert.run(r); });
    insertMany(all);
    total += all.length;
    log.run("craigslist", target.category, "ok", all.length, null);
    console.log(`[craigslist] ${target.subcategory}: ${all.length} listings`);
  }

  console.log(`[craigslist] Done. ${total} listings saved.`);
  return total;
}

module.exports = { scrape };
