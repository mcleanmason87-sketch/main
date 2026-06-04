const express = require("express");
const cors = require("cors");
const db = require("./db");
const { computeStats } = require("./pricing");
const { predict } = require("./prediction");
const scheduler = require("./scheduler");

const app = express();
app.use(cors());
app.use(express.json());

function categoryIcon(cat = "", sub = "") {
  if (cat === "Motorcycles") return "🏍️";
  return "🏷️";
}

// ── Search ────────────────────────────────────────────────────────────────────
app.get("/api/search", (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json({ results: [] });
  const term = `%${q.trim()}%`;

  const rows = db.prepare(`
    SELECT category, subcategory,
           COUNT(*) as count,
           ROUND(AVG(price), 0) as avg_price
    FROM listings
    WHERE (title LIKE ? OR category LIKE ? OR subcategory LIKE ?)
      AND first_seen_at >= datetime('now', '-365 days')
    GROUP BY category, subcategory
    ORDER BY count DESC
    LIMIT 12
  `).all(term, term, term);

  res.json({
    results: rows.map((r) => ({
      key: `${r.category}__${r.subcategory || ""}`,
      name: r.subcategory ? `${r.category} — ${r.subcategory}` : r.category,
      category: r.category,
      subcategory: r.subcategory,
      count: r.count,
      avgPrice: r.avg_price,
      image: categoryIcon(r.category),
    })),
  });
});

// ── Category price data ───────────────────────────────────────────────────────
app.get("/api/category", (req, res) => {
  const { category, subcategory } = req.query;
  if (!category) return res.status(400).json({ error: "category required" });

  // Pull 1 year of data
  const listings = subcategory
    ? db.prepare(`
        SELECT * FROM listings
        WHERE category = ? AND subcategory = ?
          AND first_seen_at >= datetime('now', '-365 days')
        ORDER BY scraped_at DESC
        LIMIT 500
      `).all(category, subcategory)
    : db.prepare(`
        SELECT * FROM listings
        WHERE category = ?
          AND first_seen_at >= datetime('now', '-365 days')
        ORDER BY scraped_at DESC
        LIMIT 500
      `).all(category);

  if (!listings.length) return res.status(404).json({ error: "No listings found yet — scrape may still be running." });

  const stats = computeStats(listings);

  // Trend buckets for sparkline: weekly avg over last 24 weeks
  const buckets = db.prepare(`
    SELECT
      strftime('%Y-W%W', scraped_at) as week,
      ROUND(AVG(price), 0) as avg_price,
      COUNT(*) as count
    FROM listings
    WHERE category = ?
      ${subcategory ? "AND subcategory = ?" : ""}
      AND first_seen_at >= datetime('now', '-365 days')
    GROUP BY week
    ORDER BY week ASC
  `).all(...(subcategory ? [category, subcategory] : [category]));

  const recentSales = listings.slice(0, 25).map((l) => ({
    date: (l.listed_at || l.scraped_at || "").split(" ")[0],
    price: l.price,
    title: l.title,
    condition: l.condition,
    location: l.location,
    source: l.source,
    url: l.url,
    sold: !!l.sold,
  }));

  res.json({
    name: subcategory ? `${category} — ${subcategory}` : category,
    category,
    subcategory,
    image: categoryIcon(category),
    stats,
    trendBuckets: buckets,
    sales: recentSales,
  });
});

// ── Browse ────────────────────────────────────────────────────────────────────
app.get("/api/browse", (req, res) => {
  const rows = db.prepare(`
    SELECT category, subcategory,
           COUNT(*) as count,
           ROUND(AVG(price), 0) as avg_price,
           MIN(price) as min_price,
           MAX(price) as max_price
    FROM listings
    WHERE scraped_at >= datetime('now', '-365 days')
    GROUP BY category, subcategory
    ORDER BY category, subcategory
  `).all();

  const grouped = {};
  for (const row of rows) {
    if (!grouped[row.category]) {
      grouped[row.category] = { name: row.category, image: categoryIcon(row.category), subcategories: [] };
    }
    grouped[row.category].subcategories.push({
      name: row.subcategory,
      count: row.count,
      avgPrice: row.avg_price,
      minPrice: row.min_price,
      maxPrice: row.max_price,
    });
  }

  res.json({ categories: Object.values(grouped) });
});

// ── Status ────────────────────────────────────────────────────────────────────
app.get("/api/status", (req, res) => {
  const log = db.prepare("SELECT * FROM scrape_log ORDER BY ran_at DESC LIMIT 30").all();
  const counts = db.prepare("SELECT source, COUNT(*) as total FROM listings GROUP BY source").all();
  const total = counts.reduce((s, c) => s + c.total, 0);
  const byCategory = db.prepare("SELECT category, COUNT(*) as total FROM listings GROUP BY category").all();
  res.json({ log, counts, total, byCategory });
});

// ── Market prediction ─────────────────────────────────────────────────────────
app.get("/api/predict", (req, res) => {
  const { category, subcategory, age, condition, mileage } = req.query;
  if (!category) return res.status(400).json({ error: "category required" });

  const result = predict({
    category,
    subcategory: subcategory || null,
    age: parseFloat(age) || 0,
    condition: condition || "Good",
    mileage: mileage ? parseFloat(mileage) : null,
  });

  res.json(result);
});

// ── KBB values for a brand ───────────────────────────────────────────────────
app.get("/api/kbb/brand/:make", (req, res) => {
  const make = decodeURIComponent(req.params.make);
  const rows = db.prepare(`
    SELECT make, model, year, trim, trade_in_low, trade_in_high,
           private_low, private_high, retail_low, retail_high, msrp, kbb_url
    FROM kbb_values
    WHERE make LIKE ?
    ORDER BY model, year DESC
  `).all(`%${make}%`);

  if (!rows.length) return res.json({ make, models: [] });

  // Group by model
  const models = {};
  for (const r of rows) {
    if (!models[r.model]) models[r.model] = { name: r.model, years: [] };
    models[r.model].years.push(r);
  }

  res.json({ make, models: Object.values(models) });
});

// ── KBB lookup for a specific bike ────────────────────────────────────────────
app.get("/api/kbb/lookup", (req, res) => {
  const { make, model, year } = req.query;
  if (!make || !model || !year) return res.status(400).json({ error: "make, model, year required" });

  const row = db.prepare(`
    SELECT * FROM kbb_values
    WHERE make LIKE ? AND model LIKE ? AND year = ?
    LIMIT 1
  `).get(`%${make}%`, `%${model}%`, parseInt(year));

  res.json(row || { error: "No KBB data found for this bike" });
});

// ── KBB brand summary list ────────────────────────────────────────────────────
app.get("/api/kbb/brands", (req, res) => {
  const rows = db.prepare(`
    SELECT make, COUNT(DISTINCT model) as models, COUNT(*) as total,
           MIN(year) as oldest, MAX(year) as newest,
           ROUND(AVG(private_low), 0) as avg_low,
           ROUND(AVG(private_high), 0) as avg_high
    FROM kbb_values
    GROUP BY make
    ORDER BY make ASC
  `).all();
  res.json({ brands: rows });
});

// ── Trigger KBB scrape manually ───────────────────────────────────────────────
app.post("/api/kbb/scrape", (req, res) => {
  res.json({ message: "KBB scrape started" });
  const kbb = require("./scrapers/kbb");
  kbb.scrape().catch(console.error);
});

// ── Brand search — KBB-first, falls back to listings ─────────────────────────
app.get("/api/brand/:brand", (req, res) => {
  const brand = decodeURIComponent(req.params.brand);
  const term = `%${brand}%`;

  // Pull all KBB entries for this brand
  const kbbRows = db.prepare(`
    SELECT * FROM kbb_values
    WHERE make LIKE ?
    ORDER BY year DESC
  `).all(term);

  // Also check live listings
  const listings = db.prepare(`
    SELECT * FROM listings
    WHERE title LIKE ?
      AND category = 'Motorcycles'
      AND first_seen_at >= datetime('now', '-365 days')
    ORDER BY scraped_at DESC
    LIMIT 500
  `).all(term);

  // Need at least KBB data or live listings
  if (!kbbRows.length && !listings.length) {
    return res.status(404).json({ error: `No data found for ${brand}` });
  }

  // Build stats from KBB private-party values (most accurate for resale)
  let stats;
  if (kbbRows.length > 0) {
    const prices = kbbRows
      .flatMap(r => [r.private_low, r.private_high].filter(Boolean));
    prices.sort((a, b) => a - b);
    const mid = Math.floor(prices.length / 2);
    const median = prices.length % 2 === 0
      ? (prices[mid - 1] + prices[mid]) / 2
      : prices[mid];
    const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
    const p25 = prices[Math.floor(prices.length * 0.25)] || prices[0];
    const p75 = prices[Math.floor(prices.length * 0.75)] || prices[prices.length - 1];
    // Fair range = average of all private_low to average of all private_high
    const avgLow  = Math.round(kbbRows.filter(r => r.private_low).reduce((s, r) => s + r.private_low,  0) / kbbRows.filter(r => r.private_low).length);
    const avgHigh = Math.round(kbbRows.filter(r => r.private_high).reduce((s, r) => s + r.private_high, 0) / kbbRows.filter(r => r.private_high).length);

    stats = {
      count: kbbRows.length,
      weightedAvg: Math.round(avg),
      median: Math.round(median),
      low: prices[0],
      high: prices[prices.length - 1],
      p25: Math.round(p25),
      p75: Math.round(p75),
      fairLow: avgLow,
      fairHigh: avgHigh,
      trend: "stable",
      outliersRemoved: 0,
      sources: { kbb: kbbRows.length },
    };
  } else {
    stats = computeStats(listings);
  }

  // KBB summary card
  const kbbRows_valid = kbbRows.filter(r => r.private_low && r.private_high);
  const kbbReference = kbbRows_valid.length > 0 ? {
    avg_kbb_low:  Math.round(kbbRows_valid.reduce((s, r) => s + r.private_low,  0) / kbbRows_valid.length),
    avg_kbb_high: Math.round(kbbRows_valid.reduce((s, r) => s + r.private_high, 0) / kbbRows_valid.length),
    trade_in_low:  kbbRows.find(r => r.trade_in_low)  ? Math.round(kbbRows.filter(r => r.trade_in_low).reduce((s, r) => s + r.trade_in_low,  0) / kbbRows.filter(r => r.trade_in_low).length)  : null,
    trade_in_high: kbbRows.find(r => r.trade_in_high) ? Math.round(kbbRows.filter(r => r.trade_in_high).reduce((s, r) => s + r.trade_in_high, 0) / kbbRows.filter(r => r.trade_in_high).length) : null,
    retail_low:  kbbRows.find(r => r.retail_low)  ? Math.round(kbbRows.filter(r => r.retail_low).reduce((s, r) => s + r.retail_low,  0) / kbbRows.filter(r => r.retail_low).length)  : null,
    retail_high: kbbRows.find(r => r.retail_high) ? Math.round(kbbRows.filter(r => r.retail_high).reduce((s, r) => s + r.retail_high, 0) / kbbRows.filter(r => r.retail_high).length) : null,
    kbb_count: kbbRows.length,
  } : null;

  // Model breakdown for this brand
  const models = db.prepare(`
    SELECT model, year, trim, private_low, private_high, trade_in_low, trade_in_high, retail_low, retail_high, msrp, kbb_url
    FROM kbb_values WHERE make LIKE ?
    ORDER BY model ASC, year DESC
  `).all(term);

  // Recent live sales if any
  const recentSales = listings.slice(0, 30).map((l) => ({
    date: (l.listed_at || l.scraped_at || "").split(" ")[0],
    price: l.price, title: l.title, condition: l.condition,
    location: l.location, source: l.source, url: l.url, sold: !!l.sold,
  }));

  res.json({
    brand,
    image: "🏍️",
    stats,
    kbbReference,
    models,
    sales: recentSales,
  });
});

// ── Manual scrape trigger ─────────────────────────────────────────────────────
app.post("/api/scrape", (req, res) => {
  res.json({ message: "Scrape started" });
  scheduler.runAll();
});

scheduler.start();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
