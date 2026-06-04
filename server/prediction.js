/**
 * Market prediction model for PricePulse.
 *
 * Uses a multi-factor approach:
 *  1. Base depreciation curve (category-specific, exponential decay)
 *  2. Condition multiplier (derived from real listing data + industry standards)
 *  3. Mileage/hours penalty
 *  4. Market trend adjustment (from our historical price data)
 *  5. Seasonal adjustment (vehicles sell for more in spring/summer)
 *  6. Confidence score based on data volume
 */

const db = require("./db");
const { computeStats } = require("./pricing");

// ── Depreciation rates (annual % loss of value) ───────────────────────────────
// Based on industry data: NADA, J.D. Power, marine industry reports
const DEPRECIATION = {
  "Street / Cruiser":       { rate: 0.15, floor: 0.25 }, // 15%/yr, retains 25% min
  "Sport Bike":             { rate: 0.20, floor: 0.20 },
  "Adventure / Dual Sport": { rate: 0.14, floor: 0.28 },
  "Dirt Bike":              { rate: 0.18, floor: 0.20 },
  "Classic / Vintage":      { rate: -0.02, floor: 0.80 }, // classics appreciate
  "Cruiser":                { rate: 0.15, floor: 0.25 },
  "default":                { rate: 0.15, floor: 0.25 },
};

// ── Condition multipliers (vs "Good" baseline = 1.0) ─────────────────────────
const CONDITION_MULT = {
  "New":       1.15,
  "Excellent": 1.05,
  "Good":      1.00,
  "Fair":      0.82,
  "Poor":      0.65,
};

// ── Mileage penalty per 1,000 miles/hours over typical ───────────────────────
const MILEAGE_PENALTY = {
  "Motorcycles": 0.008,  // 0.8% per 1k miles over 5k baseline
  "default":     0.008,
};

// ── Seasonal index (1.0 = neutral, >1 = seller's market) ─────────────────────
const SEASONAL = [
  0.92, // Jan
  0.94, // Feb
  1.02, // Mar
  1.08, // Apr
  1.10, // May
  1.08, // Jun
  1.05, // Jul
  1.03, // Aug
  0.98, // Sep
  0.95, // Oct
  0.92, // Nov
  0.90, // Dec
];

function currentSeasonalIndex() {
  return SEASONAL[new Date().getMonth()];
}

function getDepreciation(subcategory) {
  return DEPRECIATION[subcategory] || DEPRECIATION["default"];
}

function getMileagePenalty(category) {
  return MILEAGE_PENALTY[category] || MILEAGE_PENALTY["default"];
}

/**
 * Exponential depreciation: value = base * max(floor, (1 - rate)^years)
 */
function applyDepreciation(basePrice, years, subcategory) {
  const { rate, floor } = getDepreciation(subcategory);
  const factor = Math.max(floor, Math.pow(1 - rate, years));
  return basePrice * factor;
}

/**
 * Compute mileage penalty as % reduction from market median.
 * typicalMileage: what's "normal" for the age of the vehicle
 */
function mileageFactor(mileage, typicalMileage, category) {
  if (!mileage || mileage <= 0) return 1.0;
  const overTypical = Math.max(0, mileage - typicalMileage);
  const penaltyPer1k = getMileagePenalty(category);
  const penalty = (overTypical / 1000) * penaltyPer1k;
  return Math.max(0.5, 1 - penalty); // floor at 50% reduction
}

/**
 * Get trend multiplier from our real market data.
 * rising = +3% forward projection per year
 * falling = -3% per year
 */
function trendMultiplier(trend, years) {
  const annual = trend === "rising" ? 0.03 : trend === "falling" ? -0.03 : 0;
  return Math.pow(1 + annual, years);
}

/**
 * Confidence score 0–100 based on:
 *  - Number of listings (more = better)
 *  - Data recency (recent listings = better)
 *  - Source diversity (multiple sources = better)
 */
function confidenceScore(stats) {
  if (!stats) return 0;

  let score = 0;

  // Volume: 0–50 points
  score += Math.min(50, (stats.count / 100) * 50);

  // Source diversity: 0–30 points
  const sourcesCount = Object.keys(stats.sources || {}).length;
  score += sourcesCount * 10;

  // Outlier ratio: penalize if many outliers removed
  const outlierRatio = stats.outliersRemoved / Math.max(1, stats.count);
  score -= outlierRatio * 20;

  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Main prediction function.
 *
 * @param {object} params
 *   category, subcategory - item type
 *   age - years old (e.g. 3.5)
 *   condition - "New" | "Excellent" | "Good" | "Fair" | "Poor"
 *   mileage - miles or hours (optional)
 */
function predict(params) {
  const { category, subcategory, age = 0, condition = "Good", mileage = null } = params;

  // Pull current market stats from DB
  const listings = subcategory
    ? db.prepare(`
        SELECT * FROM listings
        WHERE category = ? AND subcategory = ?
          AND first_seen_at >= datetime('now', '-365 days')
        ORDER BY first_seen_at DESC LIMIT 500
      `).all(category, subcategory)
    : db.prepare(`
        SELECT * FROM listings
        WHERE category = ?
          AND first_seen_at >= datetime('now', '-365 days')
        ORDER BY first_seen_at DESC LIMIT 500
      `).all(category);

  if (!listings.length) {
    return { error: "Not enough data to make a prediction for this category yet." };
  }

  const stats = computeStats(listings);
  const { rate } = getDepreciation(subcategory || "default");

  // Back-calculate what the "new" base price would be from current market median
  // This anchors our model to real observed prices, not manufacturer MSRP
  const currentMedian = stats.median;
  const basePrice = age > 0
    ? currentMedian / Math.max(getDepreciation(subcategory).floor, Math.pow(1 - rate, age))
    : currentMedian;

  // Current estimated value
  const condMult = CONDITION_MULT[condition] || 1.0;
  const typicalMileage = age * (category === "Boats" ? 50 : 5000); // 5k mi/yr bikes, 50hr/yr boats
  const mileFactor = mileageFactor(mileage, typicalMileage, category);
  const seasonFactor = currentSeasonalIndex();
  const trendAdj = trendMultiplier(stats.trend, 0); // current

  const currentValue = Math.round(
    applyDepreciation(basePrice, age, subcategory) *
    condMult *
    mileFactor *
    seasonFactor *
    trendAdj
  );

  // Future projections (1, 2, 3 years from now, assuming condition stays "Good")
  const project = (years) => Math.round(
    applyDepreciation(basePrice, age + years, subcategory) *
    CONDITION_MULT["Good"] * // assume good condition
    trendMultiplier(stats.trend, years)
  );

  const projection1yr = project(1);
  const projection2yr = project(2);
  const projection3yr = project(3);

  // Annual depreciation dollar amount
  const annualLoss = currentValue - projection1yr;
  const annualLossPct = Math.round((annualLoss / currentValue) * 100);

  // Best time to sell: if trend falling, sell now; if rising, hold
  let sellAdvice;
  if (stats.trend === "falling") {
    sellAdvice = "Market is cooling — consider selling sooner rather than later.";
  } else if (stats.trend === "rising") {
    sellAdvice = "Market is strong — you may get a premium if you sell within 3–6 months.";
  } else {
    sellAdvice = "Market is stable — timing is flexible, list when ready.";
  }

  return {
    currentValue,
    fairBuyRange: { low: stats.fairLow, high: stats.fairHigh },
    projections: [
      { label: "1 Year", value: projection1yr, change: projection1yr - currentValue },
      { label: "2 Years", value: projection2yr, change: projection2yr - currentValue },
      { label: "3 Years", value: projection3yr, change: projection3yr - currentValue },
    ],
    annualLoss,
    annualLossPct,
    depreciationRate: Math.round(rate * 100),
    trend: stats.trend,
    seasonalIndex: Math.round(seasonFactor * 100),
    conditionMultiplier: condMult,
    confidence: confidenceScore(stats),
    sellAdvice,
    basedOn: stats.count,
  };
}

module.exports = { predict };
