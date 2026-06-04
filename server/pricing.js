/**
 * Pricing algorithm for PricePulse.
 *
 * Uses a weighted approach:
 *  - Recent sales (< 30 days) get full weight
 *  - 30–90 days: 0.75 weight
 *  - 90–180 days: 0.50 weight
 *  - Sold/auction results (BaT) get a 1.2x trust multiplier over asking prices
 *  - Outliers removed via IQR method before stats are calculated
 */

function daysSince(dateStr) {
  if (!dateStr) return 30; // assume recent if unknown
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function recencyWeight(days) {
  if (days <= 30)  return 1.0;
  if (days <= 90)  return 0.80;
  if (days <= 180) return 0.60;
  if (days <= 270) return 0.40;
  return 0.25; // 270–365 days
}

function sourceMultiplier(source) {
  // Confirmed sold prices are more trustworthy than asking prices
  if (source === "bringatrailer") return 1.2;
  if (source === "ebay")          return 1.1;
  return 1.0; // craigslist = asking price, slight discount
}

function removeOutliers(values) {
  if (values.length < 4) return values;
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const lo = q1 - 1.5 * iqr;
  const hi = q3 + 1.5 * iqr;
  return sorted.filter((v) => v >= lo && v <= hi);
}

function weightedMean(items) {
  const totalWeight = items.reduce((s, i) => s + i.weight, 0);
  if (!totalWeight) return 0;
  return items.reduce((s, i) => s + i.price * i.weight, 0) / totalWeight;
}

function percentile(sorted, p) {
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/**
 * Detect trend by comparing avg price of the last 60 days
 * vs the 60–180 day window. Returns "rising", "falling", or "stable".
 */
function detectTrend(listings) {
  const recent = listings.filter((l) => daysSince(l.scraped_at) <= 90).map((l) => l.price);
  const older  = listings.filter((l) => {
    const d = daysSince(l.scraped_at);
    return d > 90 && d <= 365;
  }).map((l) => l.price);

  if (recent.length < 3 || older.length < 3) return "stable";

  const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
  const avgOlder  = older.reduce((a, b) => a + b, 0) / older.length;
  const pctChange = ((avgRecent - avgOlder) / avgOlder) * 100;

  if (pctChange > 5)  return "rising";
  if (pctChange < -5) return "falling";
  return "stable";
}

function computeStats(listings) {
  if (!listings.length) return null;

  // Build weighted items
  const weighted = listings.map((l) => ({
    price: l.price,
    weight: recencyWeight(daysSince(l.scraped_at || l.listed_at)) * sourceMultiplier(l.source),
    source: l.source,
    days: daysSince(l.scraped_at || l.listed_at),
  }));

  // Raw prices for IQR outlier removal
  const cleanPrices = removeOutliers(listings.map((l) => l.price));
  const cleanWeighted = weighted.filter((w) => cleanPrices.includes(w.price));

  const sorted = [...cleanPrices].sort((a, b) => a - b);
  const wAvg   = Math.round(weightedMean(cleanWeighted));
  const median = Math.round(percentile(sorted, 50));
  const p25    = Math.round(percentile(sorted, 25));
  const p75    = Math.round(percentile(sorted, 75));
  const low    = sorted[0];
  const high   = sorted[sorted.length - 1];

  // Fair range: 25th–75th percentile, anchored to weighted avg
  // Blend p25/p75 with ±12% of wAvg for stability
  const fairLow  = Math.round((p25 + wAvg * 0.88) / 2);
  const fairHigh = Math.round((p75 + wAvg * 1.12) / 2);

  const trend = detectTrend(listings);

  // Source breakdown
  const sources = {};
  for (const l of listings) {
    sources[l.source] = (sources[l.source] || 0) + 1;
  }

  return {
    count: listings.length,
    cleanCount: cleanPrices.length,
    outliersRemoved: listings.length - cleanPrices.length,
    weightedAvg: wAvg,
    median,
    low,
    high,
    p25,
    p75,
    fairLow,
    fairHigh,
    trend,
    sources,
  };
}

module.exports = { computeStats };
