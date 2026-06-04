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

// ── Manual scrape trigger ─────────────────────────────────────────────────────
app.post("/api/scrape", (req, res) => {
  res.json({ message: "Scrape started" });
  scheduler.runAll();
});

scheduler.start();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
