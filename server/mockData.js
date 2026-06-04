const salesDatabase = {
  "iphone 14 pro": {
    name: "iPhone 14 Pro",
    category: "Electronics",
    image: "📱",
    sales: [
      { date: "2024-05-20", price: 720, condition: "Good", source: "eBay" },
      { date: "2024-05-18", price: 699, condition: "Good", source: "eBay" },
      { date: "2024-05-15", price: 750, condition: "Excellent", source: "eBay" },
      { date: "2024-05-12", price: 680, condition: "Fair", source: "eBay" },
      { date: "2024-05-10", price: 710, condition: "Good", source: "eBay" },
      { date: "2024-05-08", price: 740, condition: "Excellent", source: "eBay" },
      { date: "2024-05-05", price: 665, condition: "Fair", source: "eBay" },
      { date: "2024-05-01", price: 725, condition: "Good", source: "eBay" },
    ],
  },
  "iphone 13": {
    name: "iPhone 13",
    category: "Electronics",
    image: "📱",
    sales: [
      { date: "2024-05-21", price: 450, condition: "Good", source: "eBay" },
      { date: "2024-05-19", price: 420, condition: "Fair", source: "eBay" },
      { date: "2024-05-16", price: 480, condition: "Excellent", source: "eBay" },
      { date: "2024-05-13", price: 440, condition: "Good", source: "eBay" },
      { date: "2024-05-09", price: 410, condition: "Fair", source: "eBay" },
      { date: "2024-05-06", price: 465, condition: "Good", source: "eBay" },
    ],
  },
  "airpods pro": {
    name: "AirPods Pro (2nd Gen)",
    category: "Electronics",
    image: "🎧",
    sales: [
      { date: "2024-05-20", price: 185, condition: "Good", source: "eBay" },
      { date: "2024-05-18", price: 175, condition: "Fair", source: "eBay" },
      { date: "2024-05-15", price: 200, condition: "Excellent", source: "eBay" },
      { date: "2024-05-12", price: 170, condition: "Fair", source: "eBay" },
      { date: "2024-05-08", price: 190, condition: "Good", source: "eBay" },
    ],
  },
  "macbook pro": {
    name: "MacBook Pro 14\" M3",
    category: "Electronics",
    image: "💻",
    sales: [
      { date: "2024-05-21", price: 1650, condition: "Excellent", source: "eBay" },
      { date: "2024-05-19", price: 1580, condition: "Good", source: "eBay" },
      { date: "2024-05-16", price: 1700, condition: "Excellent", source: "eBay" },
      { date: "2024-05-13", price: 1520, condition: "Good", source: "eBay" },
      { date: "2024-05-10", price: 1490, condition: "Fair", source: "eBay" },
      { date: "2024-05-07", price: 1620, condition: "Good", source: "eBay" },
    ],
  },
  "ps5": {
    name: "PlayStation 5",
    category: "Gaming",
    image: "🎮",
    sales: [
      { date: "2024-05-21", price: 395, condition: "Good", source: "eBay" },
      { date: "2024-05-20", price: 380, condition: "Good", source: "eBay" },
      { date: "2024-05-18", price: 410, condition: "Excellent", source: "eBay" },
      { date: "2024-05-15", price: 370, condition: "Fair", source: "eBay" },
      { date: "2024-05-12", price: 400, condition: "Good", source: "eBay" },
      { date: "2024-05-09", price: 385, condition: "Good", source: "eBay" },
      { date: "2024-05-05", price: 360, condition: "Fair", source: "eBay" },
    ],
  },
  "xbox series x": {
    name: "Xbox Series X",
    category: "Gaming",
    image: "🎮",
    sales: [
      { date: "2024-05-20", price: 350, condition: "Good", source: "eBay" },
      { date: "2024-05-17", price: 335, condition: "Good", source: "eBay" },
      { date: "2024-05-14", price: 365, condition: "Excellent", source: "eBay" },
      { date: "2024-05-11", price: 320, condition: "Fair", source: "eBay" },
      { date: "2024-05-08", price: 345, condition: "Good", source: "eBay" },
    ],
  },
  "pokemon charizard": {
    name: "Pokémon Charizard Base Set",
    category: "Trading Cards",
    image: "🃏",
    sales: [
      { date: "2024-05-21", price: 320, condition: "Good", source: "eBay" },
      { date: "2024-05-19", price: 290, condition: "Fair", source: "eBay" },
      { date: "2024-05-17", price: 380, condition: "Excellent", source: "eBay" },
      { date: "2024-05-14", price: 310, condition: "Good", source: "eBay" },
      { date: "2024-05-11", price: 270, condition: "Fair", source: "eBay" },
      { date: "2024-05-08", price: 340, condition: "Good", source: "eBay" },
      { date: "2024-05-04", price: 295, condition: "Fair", source: "eBay" },
    ],
  },
  "jordan 1 chicago": {
    name: "Air Jordan 1 Retro High OG Chicago",
    category: "Sneakers",
    image: "👟",
    sales: [
      { date: "2024-05-21", price: 380, condition: "New", source: "eBay" },
      { date: "2024-05-19", price: 350, condition: "New", source: "eBay" },
      { date: "2024-05-16", price: 410, condition: "New", source: "eBay" },
      { date: "2024-05-13", price: 365, condition: "New", source: "eBay" },
      { date: "2024-05-10", price: 340, condition: "New", source: "eBay" },
      { date: "2024-05-07", price: 390, condition: "New", source: "eBay" },
    ],
  },
  "yeezy 350": {
    name: "Adidas Yeezy Boost 350 V2",
    category: "Sneakers",
    image: "👟",
    sales: [
      { date: "2024-05-20", price: 230, condition: "New", source: "eBay" },
      { date: "2024-05-17", price: 215, condition: "New", source: "eBay" },
      { date: "2024-05-14", price: 245, condition: "New", source: "eBay" },
      { date: "2024-05-11", price: 220, condition: "New", source: "eBay" },
      { date: "2024-05-08", price: 210, condition: "New", source: "eBay" },
    ],
  },
  "nintendo switch": {
    name: "Nintendo Switch OLED",
    category: "Gaming",
    image: "🎮",
    sales: [
      { date: "2024-05-21", price: 260, condition: "Good", source: "eBay" },
      { date: "2024-05-18", price: 245, condition: "Good", source: "eBay" },
      { date: "2024-05-15", price: 275, condition: "Excellent", source: "eBay" },
      { date: "2024-05-12", price: 235, condition: "Fair", source: "eBay" },
      { date: "2024-05-09", price: 255, condition: "Good", source: "eBay" },
    ],
  },
  "lego star wars millennium falcon": {
    name: "LEGO Star Wars Millennium Falcon (75192)",
    category: "Collectibles",
    image: "🧱",
    sales: [
      { date: "2024-05-20", price: 680, condition: "New", source: "eBay" },
      { date: "2024-05-17", price: 650, condition: "New", source: "eBay" },
      { date: "2024-05-14", price: 720, condition: "New", source: "eBay" },
      { date: "2024-05-11", price: 490, condition: "Used", source: "eBay" },
      { date: "2024-05-08", price: 695, condition: "New", source: "eBay" },
    ],
  },
  "rolex submariner": {
    name: "Rolex Submariner Date",
    category: "Watches",
    image: "⌚",
    sales: [
      { date: "2024-05-21", price: 14200, condition: "Excellent", source: "eBay" },
      { date: "2024-05-18", price: 13800, condition: "Good", source: "eBay" },
      { date: "2024-05-15", price: 15000, condition: "Excellent", source: "eBay" },
      { date: "2024-05-12", price: 13500, condition: "Good", source: "eBay" },
      { date: "2024-05-09", price: 14600, condition: "Excellent", source: "eBay" },
    ],
  },
};

function searchItems(query) {
  const q = query.toLowerCase().trim();
  const results = [];

  for (const [key, item] of Object.entries(salesDatabase)) {
    if (key.includes(q) || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)) {
      results.push({ key, name: item.name, category: item.category, image: item.image });
    }
  }

  return results;
}

function getItemStats(key) {
  const item = salesDatabase[key];
  if (!item) return null;

  const prices = item.sales.map((s) => s.price).sort((a, b) => a - b);
  const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const median = prices[Math.floor(prices.length / 2)];
  const low = prices[0];
  const high = prices[prices.length - 1];
  const fairLow = Math.round(avg * 0.9);
  const fairHigh = Math.round(avg * 1.1);

  return {
    ...item,
    stats: { avg, median, low, high, fairLow, fairHigh, count: prices.length },
  };
}

module.exports = { searchItems, getItemStats };
