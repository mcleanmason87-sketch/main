const express = require("express");
const cors = require("cors");
const db = require("./db");
const scheduler = require("./scheduler");

const app = express();
app.use(cors());
app.use(express.json());

// ── Search listings by keyword ────────────────────────────────────────────────
app.get("/api/search", (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json({ results: [] });

  const term = `%${q.trim()}%`;

  const rows = db.prepare(`
    SELECT category, subcategory,
           COUNT(*) as count,
           ROUND(AVG(price), 0) as avg_price,
           MIN(price) as min_price,
           MAX(price) as max_price
    FROM listings
    WHERE title LIKE ? OR category LIKE ? OR subcategory LIKE ?
    GROUP BY category, subcategory
    ORDER BY count DESC
    LIMIT 12
  `).all(term, term, term);

  const results = rows.map((r) => ({
    key: `${r.category}__${r.subcategory || ""}`,
    name: r.subcategory ? `${r.category} — ${r.subcategory}` : r.category,
    category: r.category,
    subcategory: r.subcategory,
    count: r.count,
    avgPrice: r.avg_price,
    image: categoryIcon(r.category),
  }));

  res.json({ results });
});

// ── Full price stats for a category/subcategory ───────────────────────────────
app.get("/api/category", (req, res) => {
  const { category, subcategory, q } = req.query;

  let rows;
  if (q) {
    const term = `%${q.trim()}%`;
    rows = db.prepare(`
      SELECT * FROM listings
      WHERE (title LIKE ? OR category LIKE ?)
        AND scraped_at >= datetime('now', '-30 days')
      ORDER BY scraped_at DESC
      LIMIT 200
    `).all(term, term);
  } else if (subcategory) {
    rows = db.prepare(`
      SELECT * FROM listings
      WHERE category = ? AND subcategory = ?
        AND scraped_at >= datetime('now', '-30 days')
      ORDER BY scraped_at DESC
      LIMIT 200
    `).all(category, subcategory);
  } else {
    rows = db.prepare(`
      SELECT * FROM listings
      WHERE category = ?
        AND scraped_at >= datetime('now', '-30 days')
      ORDER BY scraped_at DESC
      LIMIT 200
    `).all(category);
  }

  if (!rows.length) return res.status(404).json({ error: "No listings found" });

  const prices = rows.map((r) => r.price).sort((a, b) => a - b);
  const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const median = prices[Math.floor(prices.length / 2)];
  const low = prices[0];
  const high = prices[prices.length - 1];

  // Use median ± 15% as fair range (more robust than avg for vehicles)
  const fairLow = Math.round(median * 0.85);
  const fairHigh = Math.round(median * 1.15);

  const recentSales = rows.slice(0, 20).map((r) => ({
    date: r.scraped_at.split(" ")[0],
    price: r.price,
    title: r.title,
    condition: r.condition,
    location: r.location,
    source: r.source,
    url: r.url,
  }));

  res.json({
    name: subcategory ? `${category} — ${subcategory}` : category,
    category,
    subcategory,
    image: categoryIcon(category),
    stats: { avg, median, low, high, fairLow, fairHigh, count: prices.length },
    sales: recentSales,
  });
});

// ── Browse by category ────────────────────────────────────────────────────────
app.get("/api/browse", (req, res) => {
  const rows = db.prepare(`
    SELECT category, subcategory,
           COUNT(*) as count,
           ROUND(AVG(price), 0) as avg_price,
           MIN(price) as min_price,
           MAX(price) as max_price,
           MAX(scraped_at) as last_seen
    FROM listings
    WHERE scraped_at >= datetime('now', '-30 days')
    GROUP BY category, subcategory
    ORDER BY category, subcategory
  `).all();

  // Group by category
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

// ── Scrape status / log ───────────────────────────────────────────────────────
app.get("/api/status", (req, res) => {
  const log = db.prepare(`
    SELECT * FROM scrape_log ORDER BY ran_at DESC LIMIT 20
  `).all();

  const counts = db.prepare(`
    SELECT source, COUNT(*) as total FROM listings GROUP BY source
  `).all();

  res.json({ log, counts });
});

// ── Trigger a manual scrape ───────────────────────────────────────────────────
app.post("/api/scrape", async (req, res) => {
  res.json({ message: "Scrape started in background" });
  scheduler.runAll();
});

function categoryIcon(cat = "") {
  const map = {
    "Motorcycles": "🏍️",
    "Boats": "⛵",
    "RVs & Campers": "🚐",
    "Powersports": "🛷",
  };
  return map[cat] || "🏷️";
}

// Start the scrape scheduler
scheduler.start();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
