const express = require("express");
const cors = require("cors");
const { searchItems, getItemStats } = require("./mockData");

const app = express();
app.use(cors());
app.use(express.json());

// Search for items by name
app.get("/api/search", (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.json({ results: [] });
  }
  const results = searchItems(q);
  res.json({ results });
});

// Get full price data for a specific item
app.get("/api/item/:key", (req, res) => {
  const item = getItemStats(req.params.key);
  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }
  res.json(item);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
