const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../db");

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

// BaT search terms mapped to our categories
const TARGETS = [
  { query: "motorcycle",      category: "Motorcycles",   subcategory: "Street / Cruiser" },
  { query: "harley-davidson", category: "Motorcycles",   subcategory: "Street / Cruiser" },
  { query: "ducati",          category: "Motorcycles",   subcategory: "Sport Bike" },
  { query: "kawasaki",        category: "Motorcycles",   subcategory: "Sport Bike" },
  { query: "bmw-motorcycle",  category: "Motorcycles",   subcategory: "Adventure" },
  { query: "indian",          category: "Motorcycles",   subcategory: "Street / Cruiser" },
  { query: "triumph",         category: "Motorcycles",   subcategory: "Street / Cruiser" },
  { query: "honda-motorcycle",category: "Motorcycles",   subcategory: "Street / Cruiser" },
  { query: "yamaha-motorcycle",category:"Motorcycles",   subcategory: "Street / Cruiser" },
  { query: "powerboat",       category: "Boats",         subcategory: "Powerboat" },
  { query: "center-console",  category: "Boats",         subcategory: "Powerboat" },
  { query: "bowrider",        category: "Boats",         subcategory: "Powerboat" },
  { query: "wake-boat",       category: "Boats",         subcategory: "Wakeboard Boat" },
  { query: "jet-ski",         category: "Boats",         subcategory: "Jet Ski / PWC" },
  { query: "atv",             category: "Motorcycles",   subcategory: "ATV / UTV / Dirt Bike" },
  { query: "side-by-side",    category: "Motorcycles",   subcategory: "ATV / UTV / Dirt Bike" },
  { query: "rv-motorhome",    category: "RVs & Campers", subcategory: "RV / Motorhome" },
];

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function parseBaTDate(text) {
  // BaT dates appear like "Sold on January 15, 2024"
  try {
    const match = text.match(/(\w+ \d+,\s*\d{4})/);
    if (match) return new Date(match[1]).toISOString().split("T")[0];
  } catch {}
  return null;
}

function parsePrice(text) {
  if (!text) return null;
  const m = text.replace(/,/g, "").match(/\$?([\d]+)/);
  return m ? parseFloat(m[1]) : null;
}

// Six months ago cutoff
function sixMonthsAgo() {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d;
}

async function scrapeResultsPage(query, page = 1) {
  const url = `https://bringatrailer.com/search/?s=${encodeURIComponent(query)}&sold=1&page=${page}`;
  const results = [];

  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(data);
    const cutoff = sixMonthsAgo();
    let hitCutoff = false;

    // BaT listing cards
    $(".listing-card, article.listing").each((_, el) => {
      const $el = $(el);

      const title = $el.find(".listing-card-title, h3.title, .title").first().text().trim();
      const priceText = $el.find(".listing-card-bid-value, .bid-value, .sold-price").first().text().trim();
      const dateText = $el.find(".listing-card-timestamp, .timestamp, time").first().text().trim();
      const href = $el.find("a").first().attr("href") || "";
      const imgSrc = $el.find("img").first().attr("src") || $el.find("img").first().attr("data-src") || null;

      const price = parsePrice(priceText);
      const date = parseBaTDate(dateText) || new Date().toISOString().split("T")[0];

      if (!price || price < 500) return;

      // Stop if older than 6 months
      const listingDate = new Date(date);
      if (listingDate < cutoff) { hitCutoff = true; return; }

      if (!title) return;

      results.push({ title, price, date, href, imgSrc });
    });

    return { results, hitCutoff };
  } catch (err) {
    return { results: [], hitCutoff: false };
  }
}

const insert = db.prepare(`
  INSERT INTO listings (source, source_id, title, price, category, subcategory, condition, location, url, image_url, sold, listed_at, first_seen_at, scraped_at)
  VALUES (@source, @source_id, @title, @price, @category, @subcategory, @condition, @location, @url, @image_url, 1, @listed_at, datetime('now'), datetime('now'))
  ON CONFLICT(source, source_id) DO UPDATE SET
    price      = excluded.price,
    scraped_at = datetime('now')
    -- first_seen_at preserved so 6-month expiry counts from when we first recorded it
`);

const log = db.prepare(`
  INSERT INTO scrape_log (source, category, status, count, message)
  VALUES (?, ?, ?, ?, ?)
`);

async function scrape() {
  console.log("[bringatrailer] Starting historical scrape (6 months)…");
  let total = 0;

  for (const target of TARGETS) {
    let categoryCount = 0;
    let page = 1;

    while (page <= 10) { // max 10 pages per term = ~200 results
      const { results, hitCutoff } = await scrapeResultsPage(target.query, page);

      const rows = results.map((r) => ({
        source: "bringatrailer",
        source_id: r.href.match(/\/(\d+)\/?$/)?.[1] || `bat-${r.title.slice(0,20)}-${r.price}`.replace(/\s+/g, "-"),
        title: r.title,
        price: r.price,
        category: target.category,
        subcategory: target.subcategory,
        condition: "Good", // BaT listings are typically well-maintained
        location: "USA",
        url: r.href.startsWith("http") ? r.href : `https://bringatrailer.com${r.href}`,
        image_url: r.imgSrc,
        listed_at: r.date,
      }));

      const insertMany = db.transaction((r) => { for (const row of r) insert.run(row); });
      insertMany(rows);
      categoryCount += rows.length;
      total += rows.length;

      if (hitCutoff || results.length === 0) break;
      page++;
      await sleep(1200 + Math.random() * 800);
    }

    log.run("bringatrailer", target.category, "ok", categoryCount, null);
    console.log(`[bringatrailer] "${target.query}": ${categoryCount} historical sales`);
    await sleep(1000 + Math.random() * 500);
  }

  console.log(`[bringatrailer] Done. ${total} historical sales saved.`);
  return total;
}

module.exports = { scrape };
