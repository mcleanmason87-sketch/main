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

  // ── Motorcycles ──────────────────────────────────────────────
  "harley davidson road glide": {
    name: "Harley-Davidson Road Glide Special",
    category: "Motorcycles",
    image: "🏍️",
    sales: [
      { date: "2024-05-20", price: 22500, condition: "Excellent", source: "eBay" },
      { date: "2024-05-17", price: 21000, condition: "Good", source: "eBay" },
      { date: "2024-05-14", price: 23800, condition: "Excellent", source: "eBay" },
      { date: "2024-05-11", price: 19500, condition: "Fair", source: "eBay" },
      { date: "2024-05-08", price: 22000, condition: "Good", source: "eBay" },
      { date: "2024-05-05", price: 24500, condition: "Excellent", source: "eBay" },
      { date: "2024-05-02", price: 20500, condition: "Good", source: "eBay" },
    ],
  },
  "harley davidson street glide": {
    name: "Harley-Davidson Street Glide",
    category: "Motorcycles",
    image: "🏍️",
    sales: [
      { date: "2024-05-21", price: 19800, condition: "Good", source: "eBay" },
      { date: "2024-05-18", price: 18500, condition: "Fair", source: "eBay" },
      { date: "2024-05-15", price: 21000, condition: "Excellent", source: "eBay" },
      { date: "2024-05-12", price: 17900, condition: "Fair", source: "eBay" },
      { date: "2024-05-09", price: 20200, condition: "Good", source: "eBay" },
    ],
  },
  "ducati panigale v4": {
    name: "Ducati Panigale V4",
    category: "Motorcycles",
    image: "🏍️",
    sales: [
      { date: "2024-05-20", price: 28500, condition: "Excellent", source: "eBay" },
      { date: "2024-05-17", price: 26000, condition: "Good", source: "eBay" },
      { date: "2024-05-14", price: 30000, condition: "Excellent", source: "eBay" },
      { date: "2024-05-11", price: 24500, condition: "Good", source: "eBay" },
      { date: "2024-05-08", price: 27800, condition: "Excellent", source: "eBay" },
      { date: "2024-05-05", price: 25500, condition: "Good", source: "eBay" },
    ],
  },
  "kawasaki ninja zx10r": {
    name: "Kawasaki Ninja ZX-10R",
    category: "Motorcycles",
    image: "🏍️",
    sales: [
      { date: "2024-05-21", price: 14500, condition: "Good", source: "eBay" },
      { date: "2024-05-18", price: 13200, condition: "Fair", source: "eBay" },
      { date: "2024-05-15", price: 15800, condition: "Excellent", source: "eBay" },
      { date: "2024-05-12", price: 12900, condition: "Fair", source: "eBay" },
      { date: "2024-05-09", price: 14900, condition: "Good", source: "eBay" },
    ],
  },
  "indian chief": {
    name: "Indian Chief Dark Horse",
    category: "Motorcycles",
    image: "🏍️",
    sales: [
      { date: "2024-05-20", price: 18500, condition: "Excellent", source: "eBay" },
      { date: "2024-05-17", price: 17000, condition: "Good", source: "eBay" },
      { date: "2024-05-14", price: 19200, condition: "Excellent", source: "eBay" },
      { date: "2024-05-11", price: 15800, condition: "Fair", source: "eBay" },
      { date: "2024-05-08", price: 18000, condition: "Good", source: "eBay" },
    ],
  },
  "bmw r1250gs": {
    name: "BMW R 1250 GS Adventure",
    category: "Motorcycles",
    image: "🏍️",
    sales: [
      { date: "2024-05-21", price: 17500, condition: "Good", source: "eBay" },
      { date: "2024-05-18", price: 16200, condition: "Good", source: "eBay" },
      { date: "2024-05-15", price: 19000, condition: "Excellent", source: "eBay" },
      { date: "2024-05-12", price: 15500, condition: "Fair", source: "eBay" },
      { date: "2024-05-09", price: 17800, condition: "Good", source: "eBay" },
    ],
  },

  // ── Boats ─────────────────────────────────────────────────────
  "sea ray sundancer": {
    name: "Sea Ray Sundancer 320",
    category: "Boats",
    image: "⛵",
    sales: [
      { date: "2024-05-20", price: 68000, condition: "Good", source: "eBay" },
      { date: "2024-05-16", price: 62000, condition: "Fair", source: "eBay" },
      { date: "2024-05-13", price: 74000, condition: "Excellent", source: "eBay" },
      { date: "2024-05-10", price: 59000, condition: "Fair", source: "eBay" },
      { date: "2024-05-07", price: 70000, condition: "Good", source: "eBay" },
      { date: "2024-05-04", price: 65000, condition: "Good", source: "eBay" },
    ],
  },
  "boston whaler outrage": {
    name: "Boston Whaler Outrage 270",
    category: "Boats",
    image: "⛵",
    sales: [
      { date: "2024-05-21", price: 82000, condition: "Excellent", source: "eBay" },
      { date: "2024-05-18", price: 75000, condition: "Good", source: "eBay" },
      { date: "2024-05-15", price: 88000, condition: "Excellent", source: "eBay" },
      { date: "2024-05-12", price: 70000, condition: "Good", source: "eBay" },
      { date: "2024-05-09", price: 79000, condition: "Good", source: "eBay" },
    ],
  },
  "malibu wakesetter": {
    name: "Malibu Wakesetter 23 LSV",
    category: "Boats",
    image: "⛵",
    sales: [
      { date: "2024-05-20", price: 95000, condition: "Excellent", source: "eBay" },
      { date: "2024-05-17", price: 87000, condition: "Good", source: "eBay" },
      { date: "2024-05-14", price: 102000, condition: "Excellent", source: "eBay" },
      { date: "2024-05-11", price: 83000, condition: "Good", source: "eBay" },
      { date: "2024-05-08", price: 91000, condition: "Good", source: "eBay" },
    ],
  },
  "mastercraft x26": {
    name: "MasterCraft X26",
    category: "Boats",
    image: "⛵",
    sales: [
      { date: "2024-05-21", price: 115000, condition: "Excellent", source: "eBay" },
      { date: "2024-05-18", price: 105000, condition: "Good", source: "eBay" },
      { date: "2024-05-15", price: 122000, condition: "Excellent", source: "eBay" },
      { date: "2024-05-12", price: 98000, condition: "Good", source: "eBay" },
      { date: "2024-05-09", price: 110000, condition: "Good", source: "eBay" },
    ],
  },
  "jet ski sea doo": {
    name: "Sea-Doo RXP-X 325",
    category: "Boats",
    image: "⛵",
    sales: [
      { date: "2024-05-20", price: 14500, condition: "Good", source: "eBay" },
      { date: "2024-05-17", price: 13200, condition: "Fair", source: "eBay" },
      { date: "2024-05-14", price: 15800, condition: "Excellent", source: "eBay" },
      { date: "2024-05-11", price: 12500, condition: "Fair", source: "eBay" },
      { date: "2024-05-08", price: 14900, condition: "Good", source: "eBay" },
    ],
  },
  "yamaha waverunner": {
    name: "Yamaha WaveRunner FX SVHO",
    category: "Boats",
    image: "⛵",
    sales: [
      { date: "2024-05-21", price: 13800, condition: "Good", source: "eBay" },
      { date: "2024-05-18", price: 12500, condition: "Fair", source: "eBay" },
      { date: "2024-05-15", price: 15200, condition: "Excellent", source: "eBay" },
      { date: "2024-05-12", price: 11900, condition: "Fair", source: "eBay" },
      { date: "2024-05-09", price: 14100, condition: "Good", source: "eBay" },
    ],
  },

  // ── Luxury Watches ────────────────────────────────────────────
  "rolex daytona": {
    name: "Rolex Daytona Cosmograph",
    category: "Watches",
    image: "⌚",
    sales: [
      { date: "2024-05-21", price: 38000, condition: "Excellent", source: "eBay" },
      { date: "2024-05-18", price: 35000, condition: "Good", source: "eBay" },
      { date: "2024-05-15", price: 42000, condition: "Excellent", source: "eBay" },
      { date: "2024-05-12", price: 33000, condition: "Good", source: "eBay" },
      { date: "2024-05-09", price: 39500, condition: "Excellent", source: "eBay" },
    ],
  },
  "patek philippe nautilus": {
    name: "Patek Philippe Nautilus 5711",
    category: "Watches",
    image: "⌚",
    sales: [
      { date: "2024-05-20", price: 145000, condition: "Excellent", source: "eBay" },
      { date: "2024-05-17", price: 132000, condition: "Good", source: "eBay" },
      { date: "2024-05-14", price: 158000, condition: "Excellent", source: "eBay" },
      { date: "2024-05-11", price: 128000, condition: "Good", source: "eBay" },
      { date: "2024-05-08", price: 150000, condition: "Excellent", source: "eBay" },
    ],
  },
  "ap royal oak": {
    name: "Audemars Piguet Royal Oak 15500",
    category: "Watches",
    image: "⌚",
    sales: [
      { date: "2024-05-21", price: 68000, condition: "Excellent", source: "eBay" },
      { date: "2024-05-18", price: 62000, condition: "Good", source: "eBay" },
      { date: "2024-05-15", price: 74000, condition: "Excellent", source: "eBay" },
      { date: "2024-05-12", price: 59000, condition: "Good", source: "eBay" },
      { date: "2024-05-09", price: 70000, condition: "Excellent", source: "eBay" },
    ],
  },

  // ── Luxury Handbags ───────────────────────────────────────────
  "hermes birkin": {
    name: "Hermès Birkin 30",
    category: "Luxury Bags",
    image: "👜",
    sales: [
      { date: "2024-05-21", price: 28000, condition: "Excellent", source: "eBay" },
      { date: "2024-05-18", price: 24500, condition: "Good", source: "eBay" },
      { date: "2024-05-15", price: 32000, condition: "Excellent", source: "eBay" },
      { date: "2024-05-12", price: 22000, condition: "Good", source: "eBay" },
      { date: "2024-05-09", price: 29500, condition: "Excellent", source: "eBay" },
      { date: "2024-05-06", price: 26000, condition: "Good", source: "eBay" },
    ],
  },
  "chanel classic flap": {
    name: "Chanel Classic Flap Medium",
    category: "Luxury Bags",
    image: "👜",
    sales: [
      { date: "2024-05-20", price: 9800, condition: "Excellent", source: "eBay" },
      { date: "2024-05-17", price: 8500, condition: "Good", source: "eBay" },
      { date: "2024-05-14", price: 10500, condition: "Excellent", source: "eBay" },
      { date: "2024-05-11", price: 7900, condition: "Fair", source: "eBay" },
      { date: "2024-05-08", price: 9200, condition: "Good", source: "eBay" },
    ],
  },
  "louis vuitton neverfull": {
    name: "Louis Vuitton Neverfull MM",
    category: "Luxury Bags",
    image: "👜",
    sales: [
      { date: "2024-05-21", price: 1650, condition: "Good", source: "eBay" },
      { date: "2024-05-18", price: 1450, condition: "Fair", source: "eBay" },
      { date: "2024-05-15", price: 1850, condition: "Excellent", source: "eBay" },
      { date: "2024-05-12", price: 1380, condition: "Fair", source: "eBay" },
      { date: "2024-05-09", price: 1700, condition: "Good", source: "eBay" },
    ],
  },

  // ── High-End Audio ────────────────────────────────────────────
  "focal utopia headphones": {
    name: "Focal Utopia Headphones",
    category: "Audio",
    image: "🎧",
    sales: [
      { date: "2024-05-20", price: 2800, condition: "Excellent", source: "eBay" },
      { date: "2024-05-17", price: 2500, condition: "Good", source: "eBay" },
      { date: "2024-05-14", price: 3100, condition: "Excellent", source: "eBay" },
      { date: "2024-05-11", price: 2350, condition: "Good", source: "eBay" },
      { date: "2024-05-08", price: 2900, condition: "Excellent", source: "eBay" },
    ],
  },
  "mcintosh amplifier": {
    name: "McIntosh MC462 Stereo Amplifier",
    category: "Audio",
    image: "🔊",
    sales: [
      { date: "2024-05-21", price: 6800, condition: "Excellent", source: "eBay" },
      { date: "2024-05-18", price: 6200, condition: "Good", source: "eBay" },
      { date: "2024-05-15", price: 7400, condition: "Excellent", source: "eBay" },
      { date: "2024-05-12", price: 5900, condition: "Good", source: "eBay" },
      { date: "2024-05-09", price: 7000, condition: "Excellent", source: "eBay" },
    ],
  },

  // ── Photography ───────────────────────────────────────────────
  "leica m11": {
    name: "Leica M11 Rangefinder Camera",
    category: "Photography",
    image: "📷",
    sales: [
      { date: "2024-05-20", price: 7800, condition: "Excellent", source: "eBay" },
      { date: "2024-05-17", price: 7200, condition: "Good", source: "eBay" },
      { date: "2024-05-14", price: 8400, condition: "Excellent", source: "eBay" },
      { date: "2024-05-11", price: 6900, condition: "Good", source: "eBay" },
      { date: "2024-05-08", price: 8000, condition: "Excellent", source: "eBay" },
    ],
  },
  "sony a7r v": {
    name: "Sony A7R V Mirrorless Camera",
    category: "Photography",
    image: "📷",
    sales: [
      { date: "2024-05-21", price: 2900, condition: "Excellent", source: "eBay" },
      { date: "2024-05-18", price: 2650, condition: "Good", source: "eBay" },
      { date: "2024-05-15", price: 3100, condition: "Excellent", source: "eBay" },
      { date: "2024-05-12", price: 2500, condition: "Good", source: "eBay" },
      { date: "2024-05-09", price: 2800, condition: "Good", source: "eBay" },
    ],
  },

  // ── Musical Instruments ───────────────────────────────────────
  "gibson les paul": {
    name: "Gibson Les Paul Standard '60s",
    category: "Instruments",
    image: "🎸",
    sales: [
      { date: "2024-05-20", price: 2200, condition: "Excellent", source: "eBay" },
      { date: "2024-05-17", price: 1950, condition: "Good", source: "eBay" },
      { date: "2024-05-14", price: 2450, condition: "Excellent", source: "eBay" },
      { date: "2024-05-11", price: 1800, condition: "Fair", source: "eBay" },
      { date: "2024-05-08", price: 2100, condition: "Good", source: "eBay" },
    ],
  },
  "fender stratocaster": {
    name: "Fender American Professional II Stratocaster",
    category: "Instruments",
    image: "🎸",
    sales: [
      { date: "2024-05-21", price: 1350, condition: "Excellent", source: "eBay" },
      { date: "2024-05-18", price: 1200, condition: "Good", source: "eBay" },
      { date: "2024-05-15", price: 1500, condition: "Excellent", source: "eBay" },
      { date: "2024-05-12", price: 1100, condition: "Fair", source: "eBay" },
      { date: "2024-05-09", price: 1400, condition: "Good", source: "eBay" },
    ],
  },

  // ── Sports Memorabilia ────────────────────────────────────────
  "michael jordan rookie card": {
    name: "Michael Jordan 1986 Fleer Rookie Card",
    category: "Sports Cards",
    image: "🏀",
    sales: [
      { date: "2024-05-20", price: 8500, condition: "Good", source: "eBay" },
      { date: "2024-05-17", price: 7200, condition: "Fair", source: "eBay" },
      { date: "2024-05-14", price: 12000, condition: "Excellent", source: "eBay" },
      { date: "2024-05-11", price: 6800, condition: "Fair", source: "eBay" },
      { date: "2024-05-08", price: 9500, condition: "Good", source: "eBay" },
    ],
  },
  "tom brady rookie card": {
    name: "Tom Brady 2000 Bowman Chrome Rookie",
    category: "Sports Cards",
    image: "🏈",
    sales: [
      { date: "2024-05-21", price: 4200, condition: "Good", source: "eBay" },
      { date: "2024-05-18", price: 3800, condition: "Fair", source: "eBay" },
      { date: "2024-05-15", price: 5500, condition: "Excellent", source: "eBay" },
      { date: "2024-05-12", price: 3500, condition: "Fair", source: "eBay" },
      { date: "2024-05-09", price: 4600, condition: "Good", source: "eBay" },
    ],
  },

  // ── Power Tools & Equipment ───────────────────────────────────
  "dewalt tool set": {
    name: "DeWalt 20V MAX 10-Tool Combo Kit",
    category: "Tools",
    image: "🔧",
    sales: [
      { date: "2024-05-20", price: 580, condition: "Good", source: "eBay" },
      { date: "2024-05-17", price: 520, condition: "Good", source: "eBay" },
      { date: "2024-05-14", price: 640, condition: "Excellent", source: "eBay" },
      { date: "2024-05-11", price: 490, condition: "Fair", source: "eBay" },
      { date: "2024-05-08", price: 600, condition: "Good", source: "eBay" },
    ],
  },
  "milwaukee m18 fuel": {
    name: "Milwaukee M18 FUEL Drill/Driver Kit",
    category: "Tools",
    image: "🔧",
    sales: [
      { date: "2024-05-21", price: 280, condition: "Good", source: "eBay" },
      { date: "2024-05-18", price: 250, condition: "Fair", source: "eBay" },
      { date: "2024-05-15", price: 320, condition: "Excellent", source: "eBay" },
      { date: "2024-05-12", price: 235, condition: "Fair", source: "eBay" },
      { date: "2024-05-09", price: 290, condition: "Good", source: "eBay" },
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
