const axios = require("axios");
const db = require("../db");

// ── Config ────────────────────────────────────────────────────────────────────
// Get a free key at: https://developer.ebay.com
// Set EBAY_APP_ID in your environment or a .env file
const APP_ID = process.env.EBAY_APP_ID || null;

const SEARCH_TERMS = [
  { query: "motorcycle",          category: "Motorcycles",   subcategory: "Street / Cruiser" },
  { query: "harley davidson",     category: "Motorcycles",   subcategory: "Street / Cruiser" },
  { query: "ducati",              category: "Motorcycles",   subcategory: "Sport Bike" },
  { query: "kawasaki ninja",      category: "Motorcycles",   subcategory: "Sport Bike" },
  { query: "indian motorcycle",   category: "Motorcycles",   subcategory: "Street / Cruiser" },
  { query: "bmw motorcycle",      category: "Motorcycles",   subcategory: "Adventure" },
  { query: "atv four wheeler",    category: "Motorcycles",   subcategory: "ATV / UTV" },
  { query: "jet ski sea-doo",     category: "Boats",         subcategory: "Jet Ski / PWC" },
  { query: "yamaha waverunner",   category: "Boats",         subcategory: "Jet Ski / PWC" },
  { query: "boston whaler",       category: "Boats",         subcategory: "Powerboat" },
  { query: "sea ray boat",        category: "Boats",         subcategory: "Powerboat" },
  { query: "malibu boat",        category: "Boats",         subcategory: "Wakeboard Boat" },
];

function inferCondition(conditionText = "") {
  const t = conditionText.toLowerCase();
  if (t.includes("new"))                 return "New";
  if (t.includes("excellent") || t.includes("like new")) return "Excellent";
  if (t.includes("good"))               return "Good";
  if (t.includes("acceptable") || t.includes("fair")) return "Fair";
  return "Good";
}

async function getToken() {
  if (!APP_ID) throw new Error("EBAY_APP_ID not set");

  const clientId = APP_ID;
  const clientSecret = process.env.EBAY_SECRET || "";
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const { data } = await axios.post(
    "https://api.ebay.com/identity/v1/oauth2/token",
    "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope",
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return data.access_token;
}

async function searchSoldListings(token, query, limit = 50) {
  const { data } = await axios.get("https://api.ebay.com/buy/browse/v1/item_summary/search", {
    params: {
      q: query,
      filter: "buyingOptions:{FIXED_PRICE}",
      limit,
      sort: "newlyListed",
    },
    headers: {
      Authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
    },
  });
  return data.itemSummaries || [];
}

const insert = db.prepare(`
  INSERT INTO listings (source, source_id, title, price, category, subcategory, condition, location, url, image_url, first_seen_at, scraped_at)
  VALUES (@source, @source_id, @title, @price, @category, @subcategory, @condition, @location, @url, @image_url, datetime('now'), datetime('now'))
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
  if (!APP_ID) {
    console.log("[ebay] Skipping — EBAY_APP_ID not set. See server/scrapers/ebay.js for setup.");
    return 0;
  }

  console.log("[ebay] Starting scrape…");
  let total = 0;

  const token = await getToken();

  for (const target of SEARCH_TERMS) {
    try {
      const items = await searchSoldListings(token, target.query);
      const rows = items
        .filter((item) => item.price?.value)
        .map((item) => ({
          source: "ebay",
          source_id: item.itemId,
          title: item.title,
          price: parseFloat(item.price.value),
          category: target.category,
          subcategory: target.subcategory,
          condition: inferCondition(item.condition || ""),
          location: item.itemLocation?.city || "Unknown",
          url: item.itemWebUrl || null,
          image_url: item.image?.imageUrl || null,
        }));

      const insertMany = db.transaction((r) => { for (const row of r) insert.run(row); });
      insertMany(rows);
      total += rows.length;
      log.run("ebay", target.category, "ok", rows.length, null);
      console.log(`[ebay] "${target.query}": ${rows.length} listings`);
    } catch (err) {
      log.run("ebay", target.category, "error", 0, err.message);
      console.error(`[ebay] Error on "${target.query}":`, err.message);
    }
  }

  console.log(`[ebay] Done. ${total} total listings saved.`);
  return total;
}

module.exports = { scrape };
