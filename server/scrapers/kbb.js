const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../db");

const BASE = "https://www.kbb.com";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
};

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// Extract Next.js embedded JSON from page
function extractNextData(html) {
  try {
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (match) return JSON.parse(match[1]);
  } catch {}
  return null;
}

// Extract any JSON-LD structured data
function extractJsonLd(html) {
  try {
    const $ = cheerio.load(html);
    const results = [];
    $('script[type="application/ld+json"]').each((_, el) => {
      try { results.push(JSON.parse($(el).html())); } catch {}
    });
    return results;
  } catch {}
  return [];
}

// Parse price string like "$4,500" or "4500" → number
function parsePrice(val) {
  if (!val) return null;
  const n = parseFloat(String(val).replace(/[^0-9.]/g, ""));
  return isNaN(n) || n < 100 ? null : n;
}

// Dig through nested object for price-like keys
function findPrices(obj, depth = 0) {
  if (!obj || depth > 8) return {};
  const prices = {};
  if (typeof obj !== "object") return prices;

  const keys = Object.keys(obj);
  for (const key of keys) {
    const lk = key.toLowerCase();
    const val = obj[key];
    if (typeof val === "number" && val > 100 && val < 200000) {
      if (lk.includes("tradein") || lk.includes("trade_in") || lk.includes("tradeinlow"))  prices.trade_in_low  = val;
      if (lk.includes("tradeinhigh") || lk.includes("trade_in_high"))                       prices.trade_in_high = val;
      if (lk.includes("privatepartylow") || lk.includes("private_low") || lk.includes("privatelow")) prices.private_low = val;
      if (lk.includes("privatepartyhigh") || lk.includes("private_high"))                   prices.private_high  = val;
      if (lk.includes("retaillow") || lk.includes("retail_low"))                            prices.retail_low    = val;
      if (lk.includes("retailhigh") || lk.includes("retail_high"))                          prices.retail_high   = val;
      if (lk.includes("msrp") || lk.includes("baseprice"))                                  prices.msrp          = val;
    } else if (typeof val === "string") {
      const p = parsePrice(val);
      if (p) {
        if (lk.includes("tradein") && lk.includes("low"))    prices.trade_in_low  = p;
        if (lk.includes("tradein") && lk.includes("high"))   prices.trade_in_high = p;
        if (lk.includes("private") && lk.includes("low"))    prices.private_low   = p;
        if (lk.includes("private") && lk.includes("high"))   prices.private_high  = p;
        if (lk.includes("retail") && lk.includes("low"))     prices.retail_low    = p;
        if (lk.includes("retail") && lk.includes("high"))    prices.retail_high   = p;
        if (lk === "msrp" || lk === "baseprice")             prices.msrp          = p;
      }
    } else if (val && typeof val === "object") {
      Object.assign(prices, findPrices(val, depth + 1));
    }
  }
  return prices;
}

// Pull makes list from KBB motorcycles page
async function getMakes() {
  try {
    const { data } = await axios.get(`${BASE}/motorcycles/`, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(data);
    const makes = [];

    // KBB lists makes as links like /motorcycles/honda/
    $("a[href*='/motorcycles/']").each((_, el) => {
      const href = $(el).attr("href") || "";
      const m = href.match(/\/motorcycles\/([a-z0-9-]+)\/?$/i);
      if (m && m[1] !== "motorcycles") {
        const slug = m[1];
        if (!makes.find((x) => x.slug === slug)) {
          makes.push({ slug, name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) });
        }
      }
    });

    // Also try Next.js data
    const next = extractNextData(data);
    if (next) {
      const makesData = JSON.stringify(next).match(/"slug"\s*:\s*"([a-z0-9-]+)"/gi) || [];
      makesData.forEach((m) => {
        const slug = m.match(/"([a-z0-9-]+)"/)?.[1];
        if (slug && !makes.find((x) => x.slug === slug)) {
          makes.push({ slug, name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) });
        }
      });
    }

    return makes.filter((m) => m.slug.length > 1 && !["motorcycles", "used", "new", "reviews"].includes(m.slug));
  } catch (err) {
    console.error("[kbb] Error fetching makes:", err.message);
    return FALLBACK_MAKES;
  }
}

// Get models for a make
async function getModels(makeSlug) {
  try {
    const { data } = await axios.get(`${BASE}/motorcycles/${makeSlug}/`, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(data);
    const models = [];

    $(`a[href*='/motorcycles/${makeSlug}/']`).each((_, el) => {
      const href = $(el).attr("href") || "";
      const m = href.match(new RegExp(`/motorcycles/${makeSlug}/([a-z0-9-]+)/?$`, "i"));
      if (m) {
        const slug = m[1];
        if (!models.find((x) => x.slug === slug)) {
          models.push({ slug, name: $(el).text().trim() || slug });
        }
      }
    });

    return models;
  } catch {
    return [];
  }
}

// Get available years for a make/model
async function getYears(makeSlug, modelSlug) {
  try {
    const { data } = await axios.get(`${BASE}/motorcycles/${makeSlug}/${modelSlug}/`, { headers: HEADERS, timeout: 15000 });
    const $ = cheerio.load(data);
    const years = new Set();

    // Look for year links
    $(`a[href*='/motorcycles/${makeSlug}/${modelSlug}/']`).each((_, el) => {
      const href = $(el).attr("href") || "";
      const m = href.match(/\/(\d{4})\/?/);
      if (m) years.add(parseInt(m[1]));
    });

    // Also check Next.js data for years
    const next = extractNextData(data);
    if (next) {
      const yearMatches = JSON.stringify(next).match(/"year"\s*:\s*(\d{4})/g) || [];
      yearMatches.forEach((ym) => {
        const y = parseInt(ym.match(/\d{4}/)?.[0]);
        if (y >= 1970 && y <= new Date().getFullYear() + 1) years.add(y);
      });
    }

    return [...years].filter((y) => y >= 1970 && y <= new Date().getFullYear() + 1).sort((a, b) => b - a);
  } catch {
    return [];
  }
}

// Scrape KBB value for a specific make/model/year
async function getValues(makeSlug, modelSlug, year) {
  const url = `${BASE}/motorcycles/${makeSlug}/${modelSlug}/${year}/`;
  try {
    const { data } = await axios.get(url, { headers: HEADERS, timeout: 15000 });

    // Try Next.js embedded data first
    const next = extractNextData(data);
    if (next) {
      const prices = findPrices(next);
      if (Object.keys(prices).length >= 2) {
        return { prices, url };
      }
    }

    // Try JSON-LD
    const jsonLds = extractJsonLd(data);
    for (const ld of jsonLds) {
      const prices = findPrices(ld);
      if (Object.keys(prices).length >= 2) return { prices, url };
    }

    // Try parsing visible price text from HTML
    const $ = cheerio.load(data);
    const prices = {};
    const priceText = $("body").text();

    // KBB shows prices in a table — look for patterns
    const tradeMatch = priceText.match(/[Tt]rade.?[Ii]n[^$]*\$([0-9,]+)[^$]*\$([0-9,]+)/);
    if (tradeMatch) {
      prices.trade_in_low  = parsePrice(tradeMatch[1]);
      prices.trade_in_high = parsePrice(tradeMatch[2]);
    }

    const privateMatch = priceText.match(/[Pp]rivate [Pp]arty[^$]*\$([0-9,]+)[^$]*\$([0-9,]+)/);
    if (privateMatch) {
      prices.private_low  = parsePrice(privateMatch[1]);
      prices.private_high = parsePrice(privateMatch[2]);
    }

    const retailMatch = priceText.match(/[Rr]etail[^$]*\$([0-9,]+)[^$]*\$([0-9,]+)/);
    if (retailMatch) {
      prices.retail_low  = parsePrice(retailMatch[1]);
      prices.retail_high = parsePrice(retailMatch[2]);
    }

    const msrpMatch = priceText.match(/MSRP[^$]*\$([0-9,]+)/);
    if (msrpMatch) prices.msrp = parsePrice(msrpMatch[1]);

    return { prices, url };
  } catch (err) {
    return { prices: {}, url };
  }
}

const upsertKbb = db.prepare(`
  INSERT INTO kbb_values (make, model, year, trim, trade_in_low, trade_in_high, private_low, private_high, retail_low, retail_high, msrp, kbb_url, scraped_at)
  VALUES (@make, @model, @year, @trim, @trade_in_low, @trade_in_high, @private_low, @private_high, @retail_low, @retail_high, @msrp, @kbb_url, datetime('now'))
  ON CONFLICT(make, model, year, trim) DO UPDATE SET
    trade_in_low  = excluded.trade_in_low,
    trade_in_high = excluded.trade_in_high,
    private_low   = excluded.private_low,
    private_high  = excluded.private_high,
    retail_low    = excluded.retail_low,
    retail_high   = excluded.retail_high,
    msrp          = excluded.msrp,
    scraped_at    = datetime('now')
`);

const log = db.prepare(`INSERT INTO scrape_log (source, category, status, count, message) VALUES (?, ?, ?, ?, ?)`);

// Comprehensive fallback makes list in case the page can't be scraped
const FALLBACK_MAKES = [
  "honda", "yamaha", "kawasaki", "suzuki", "harley-davidson",
  "ducati", "bmw", "triumph", "indian", "ktm", "aprilia",
  "royal-enfield", "husqvarna", "zero-motorcycles", "can-am",
  "moto-guzzi", "buell", "victory", "norton", "mv-agusta",
  "benelli", "cf-moto", "beta", "gas-gas", "sherco",
].map((slug) => ({ slug, name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) }));

async function scrape() {
  console.log("[kbb] Starting motorcycle value scrape…");
  let total = 0;
  let failed = 0;

  const makes = await getMakes();
  const makeList = makes.length > 5 ? makes : FALLBACK_MAKES;
  console.log(`[kbb] Found ${makeList.length} makes to scrape`);

  for (const make of makeList) {
    console.log(`[kbb] Scraping ${make.name}…`);
    let makeCount = 0;

    const models = await getModels(make.slug);
    await sleep(400 + Math.random() * 300);

    for (const model of models) {
      const years = await getYears(make.slug, model.slug);
      await sleep(300 + Math.random() * 200);

      // Scrape years in small parallel batches of 3
      for (let i = 0; i < years.length; i += 3) {
        const batch = years.slice(i, i + 3);
        const results = await Promise.all(
          batch.map((year) => getValues(make.slug, model.slug, year))
        );

        for (let j = 0; j < batch.length; j++) {
          const year = batch[j];
          const { prices, url } = results[j];

          if (Object.keys(prices).length === 0) { failed++; continue; }

          try {
            upsertKbb.run({
              make: make.name,
              model: model.name || model.slug,
              year,
              trim: "Base",
              trade_in_low:  prices.trade_in_low  || null,
              trade_in_high: prices.trade_in_high || null,
              private_low:   prices.private_low   || null,
              private_high:  prices.private_high  || null,
              retail_low:    prices.retail_low    || null,
              retail_high:   prices.retail_high   || null,
              msrp:          prices.msrp          || null,
              kbb_url: url,
            });
            makeCount++;
            total++;
          } catch {}
        }

        await sleep(500 + Math.random() * 300);
      }
    }

    log.run("kbb", make.name, "ok", makeCount, null);
    console.log(`[kbb] ${make.name}: ${makeCount} year/model combos saved`);
    await sleep(800 + Math.random() * 400);
  }

  console.log(`[kbb] Done. ${total} KBB values saved, ${failed} pages had no data.`);
  return total;
}

module.exports = { scrape };
