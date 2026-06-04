import { useState, useEffect, useRef } from "react";
import "./App.css";

const API = "/api";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function PredictionPanel({ category, subcategory }) {
  const [age, setAge] = useState("");
  const [condition, setCondition] = useState("Good");
  const [mileage, setMileage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function runPrediction() {
    if (!age) return;
    setLoading(true);
    const params = new URLSearchParams({ category, age, condition });
    if (subcategory) params.set("subcategory", subcategory);
    if (mileage) params.set("mileage", mileage);
    fetch(`${API}/predict?${params}`)
      .then((r) => r.json())
      .then((d) => { setResult(d); setLoading(false); })
      .catch(() => setLoading(false));
  }

  const isBoat = category === "Boats";

  return (
    <div className="card prediction-card">
      <h3>Market Value Predictor</h3>
      <p className="card-sub">Enter the vehicle details to get a depreciation-adjusted value estimate and future projections.</p>

      <div className="predict-form">
        <div className="predict-field">
          <label>Age (years)</label>
          <input className="predict-input" type="number" min="0" max="30" placeholder="e.g. 3" value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
        <div className="predict-field">
          <label>{isBoat ? "Hours" : "Miles"} <span className="optional">(optional)</span></label>
          <input className="predict-input" type="number" min="0" placeholder={isBoat ? "e.g. 150" : "e.g. 12000"} value={mileage} onChange={(e) => setMileage(e.target.value)} />
        </div>
        <div className="predict-field">
          <label>Condition</label>
          <select className="predict-select" value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option>New</option>
            <option>Excellent</option>
            <option>Good</option>
            <option>Fair</option>
            <option>Poor</option>
          </select>
        </div>
        <button className="predict-btn" onClick={runPrediction} disabled={!age || loading}>
          {loading ? "Calculating…" : "Predict Value"}
        </button>
      </div>

      {result && !result.error && (
        <div className="predict-results">
          <div className="predict-current">
            <div className="predict-value-label">Estimated Current Value</div>
            <div className="predict-value">${result.currentValue.toLocaleString()}</div>
            <div className="predict-meta">
              Based on {result.basedOn} real listings · {result.confidence}% confidence
            </div>
          </div>

          <div className="predict-projections">
            {result.projections.map((p) => (
              <div key={p.label} className="projection-card">
                <div className="proj-label">{p.label}</div>
                <div className="proj-value">${p.value.toLocaleString()}</div>
                <div className={`proj-change ${p.change < 0 ? "neg" : "pos"}`}>
                  {p.change < 0 ? "▼" : "▲"} ${Math.abs(p.change).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="predict-stats">
            <div className="pstat">
              <span className="pstat-label">Annual depreciation</span>
              <span className="pstat-val neg">−${result.annualLoss.toLocaleString()} ({result.annualLossPct}%/yr)</span>
            </div>
            <div className="pstat">
              <span className="pstat-label">Category depreciation rate</span>
              <span className="pstat-val">{result.depreciationRate}% per year</span>
            </div>
            <div className="pstat">
              <span className="pstat-label">Seasonal market index</span>
              <span className="pstat-val">{result.seasonalIndex > 100 ? "↑" : result.seasonalIndex < 100 ? "↓" : "→"} {result.seasonalIndex}%</span>
            </div>
            <div className="pstat">
              <span className="pstat-label">Market trend</span>
              <span className="pstat-val">{result.trend}</span>
            </div>
          </div>

          <div className={`sell-advice ${result.trend === "falling" ? "advice-warn" : result.trend === "rising" ? "advice-good" : "advice-neutral"}`}>
            💡 {result.sellAdvice}
          </div>
        </div>
      )}

      {result?.error && <p className="predict-error">{result.error}</p>}
    </div>
  );
}

function TrendBadge({ trend }) {
  const map = {
    rising:  { label: "↑ Rising",  cls: "trend-rising" },
    falling: { label: "↓ Falling", cls: "trend-falling" },
    stable:  { label: "→ Stable",  cls: "trend-stable" },
  };
  const t = map[trend] || map.stable;
  return <span className={`trend-badge ${t.cls}`}>{t.label}</span>;
}

function Sparkline({ buckets }) {
  if (!buckets || buckets.length < 2) return null;
  const prices = buckets.map((b) => b.avg_price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const W = 200, H = 48, pad = 4;

  const pts = prices.map((p, i) => {
    const x = pad + (i / (prices.length - 1)) * (W - pad * 2);
    const y = H - pad - ((p - min) / range) * (H - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg className="sparkline" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="var(--accent-light)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function PriceBar({ low, p25, p75, fairLow, fairHigh, high }) {
  const range = high - low || 1;
  const pct = (v) => `${((v - low) / range) * 100}%`;
  return (
    <div className="price-bar-wrap">
      <div className="price-bar-labels">
        <span>${low.toLocaleString()}</span>
        <span>${high.toLocaleString()}</span>
      </div>
      <div className="price-bar-track">
        <div className="price-bar-iqr"  style={{ left: pct(p25),    width: pct(p75 - p25 + low) }} title="25th–75th percentile" />
        <div className="price-bar-fair" style={{ left: pct(fairLow), width: pct(fairHigh - fairLow + low) }} title={`Fair: $${fairLow.toLocaleString()}–$${fairHigh.toLocaleString()}`} />
      </div>
      <div className="price-bar-legend">
        <span className="legend-dot fair" /> Fair range &nbsp;
        <span className="legend-dot iqr"  /> Middle 50%
      </div>
    </div>
  );
}

function ConditionBadge({ condition }) {
  const map = { Excellent: "badge-excellent", New: "badge-excellent", Good: "badge-good", Fair: "badge-fair", Used: "badge-fair" };
  return <span className={`badge ${map[condition] || "badge-good"}`}>{condition}</span>;
}

function SourceTag({ source, sold }) {
  const labels = { bringatrailer: "Bring a Trailer", ebay: "eBay", craigslist: "Craigslist", cycletrader: "Cycle Trader" };
  return (
    <span className={`source-tag source-${source}`}>
      {labels[source] || source}{sold ? " ✓" : ""}
    </span>
  );
}

function VerdictBox({ fairLow, fairHigh, asking }) {
  if (!asking) return null;
  const price = parseFloat(asking);
  if (isNaN(price) || price <= 0) return null;
  let verdict, cls, icon, msg;
  if (price <= fairLow) {
    verdict = "Great Deal"; cls = "verdict-great"; icon = "🟢";
    msg = `$${(fairLow - price).toLocaleString()} below fair range — solid buy.`;
  } else if (price <= fairHigh) {
    verdict = "Fair Price"; cls = "verdict-fair"; icon = "🟡";
    msg = "Right in the fair range. Reasonable deal.";
  } else {
    verdict = "Overpriced"; cls = "verdict-over"; icon = "🔴";
    msg = `$${(price - fairHigh).toLocaleString()} above fair range. Try negotiating down to $${fairHigh.toLocaleString()}.`;
  }
  return (
    <div className={`verdict-box ${cls}`}>
      <span className="verdict-icon">{icon}</span>
      <div className="verdict-text">
        <span className="verdict-label">{verdict}</span>
        <p>{msg}</p>
      </div>
    </div>
  );
}

const BROWSE_CHIPS = [
  { label: "🏍️ Street & Cruiser",      category: "Motorcycles", subcategory: "Street / Cruiser" },
  { label: "🏁 Sport Bikes",            category: "Motorcycles", subcategory: "Sport Bike" },
  { label: "🌍 Adventure / Dual Sport", category: "Motorcycles", subcategory: "Adventure / Dual Sport" },
  { label: "🏚️ Dirt Bikes",            category: "Motorcycles", subcategory: "Dirt Bike" },
  { label: "🕰️ Classic & Vintage",     category: "Motorcycles", subcategory: "Classic / Vintage" },
  { label: "🏍️ Harley-Davidson",       category: "Motorcycles", subcategory: null },
];

export default function App() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [asking, setAsking] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);
  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    fetch(`${API}/status`)
      .then((r) => r.json())
      .then((d) => setDbStatus(d))
      .catch(() => setDbStatus({ total: 0 }));
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2) { setSuggestions([]); return; }
    fetch(`${API}/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((d) => setSuggestions(d.results || []))
      .catch(() => setSuggestions([]));
  }, [debouncedQuery]);

  function loadCategory(category, subcategory, label) {
    setQuery(label || category);
    setSuggestions([]);
    setShowSuggestions(false);
    setAsking("");
    setLoading(true);
    const params = new URLSearchParams({ category });
    if (subcategory) params.set("subcategory", subcategory);
    fetch(`${API}/category?${params}`)
      .then((r) => r.json())
      .then((d) => { setItemData(d.error ? null : d); setLoading(false); })
      .catch(() => setLoading(false));
  }

  const showDrop = showSuggestions && suggestions.length > 0;
  const totalListings = dbStatus?.total || 0;

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-inner">
          <div className="logo-badge">
            <span className="logo-dot" />
            PricePulse
            {totalListings > 0 && <span className="listing-count">{totalListings.toLocaleString()} listings</span>}
          </div>
          <h1>What's it <span>worth?</span></h1>
          <p className="subtitle">
            Real resale prices for motorcycles — powered by Craigslist, Cycle Trader &amp; Bring a Trailer.
          </p>

          <div className="search-wrap">
            <div className="search-box">
              <span className="search-icon">⌕</span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search Harley, Ducati, Honda, sport bikes…"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); if (!e.target.value) setItemData(null); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                autoComplete="off"
              />
              {query && <button className="clear-btn" onClick={() => { setQuery(""); setItemData(null); inputRef.current?.focus(); }}>✕</button>}
            </div>
            {showDrop && (
              <ul className="suggestions">
                {suggestions.map((s) => (
                  <li key={s.key} onMouseDown={() => loadCategory(s.category, s.subcategory, s.name)}>
                    <span className="sug-icon">{s.image}</span>
                    <span className="sug-name">{s.name}</span>
                    <span className="sug-count">{s.count.toLocaleString()} listings</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        {loading && (
          <div className="loading">
            <div className="spinner" />
            <p>Fetching real listings…</p>
          </div>
        )}

        {!loading && itemData && (() => {
          const s = itemData.stats;
          return (
            <div className="results">
              <div className="item-header">
                <div className="item-icon-wrap">{itemData.image}</div>
                <div className="item-header-text">
                  <h2>{itemData.name}</h2>
                  <div className="item-meta">
                    <span className="cat-pill">{s.count.toLocaleString()} listings · 6 mo</span>
                    <TrendBadge trend={s.trend} />
                  </div>
                </div>
              </div>

              {/* Source breakdown */}
              {s.sources && (
                <div className="source-bar">
                  {Object.entries(s.sources).map(([src, cnt]) => (
                    <span key={src} className={`source-tag source-${src}`}>
                      {src === "bringatrailer" ? "Bring a Trailer" : src === "ebay" ? "eBay" : src === "cycletrader" ? "Cycle Trader" : "Craigslist"} — {cnt}
                    </span>
                  ))}
                  {s.outliersRemoved > 0 && (
                    <span className="outlier-note">{s.outliersRemoved} outliers removed</span>
                  )}
                </div>
              )}

              <div className="stats-grid">
                <div className="stat-card highlight">
                  <div className="stat-label">Weighted Avg</div>
                  <div className="stat-value">${s.weightedAvg.toLocaleString()}</div>
                  <div className="stat-sub">Recent sales weighted more</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Median</div>
                  <div className="stat-value">${s.median.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Lowest</div>
                  <div className="stat-value low">${s.low.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Highest</div>
                  <div className="stat-value high">${s.high.toLocaleString()}</div>
                </div>
              </div>

              <div className="card">
                <h3>Fair Price Range</h3>
                <div className="fair-range-header">
                  <div className="fair-range-display">
                    <span className="fair-price">${s.fairLow.toLocaleString()}</span>
                    <span className="fair-dash">–</span>
                    <span className="fair-price">${s.fairHigh.toLocaleString()}</span>
                  </div>
                  <Sparkline buckets={itemData.trendBuckets} />
                </div>
                <PriceBar low={s.low} p25={s.p25} p75={s.p75} fairLow={s.fairLow} fairHigh={s.fairHigh} high={s.high} />
              </div>

              <div className="card">
                <h3>Check a Listing Price</h3>
                <p className="card-sub">Paste a price you're seeing — we'll tell you if it's worth it.</p>
                <div className="price-check-row">
                  <span className="dollar">$</span>
                  <input className="price-input" type="number" placeholder="Enter asking price" value={asking} onChange={(e) => setAsking(e.target.value)} />
                </div>
                <VerdictBox fairLow={s.fairLow} fairHigh={s.fairHigh} asking={asking} />
              </div>

              <PredictionPanel category={itemData.category} subcategory={itemData.subcategory} />

              <div className="card">
                <h3>Recent Listings</h3>
                <table className="sales-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Price</th>
                      <th>Condition</th>
                      <th>Location</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemData.sales.map((sale, i) => (
                      <tr key={i} className={sale.sold ? "row-sold" : ""}>
                        <td>
                          {sale.url
                            ? <a className="listing-link" href={sale.url} target="_blank" rel="noopener noreferrer">{sale.title}</a>
                            : <span className="listing-title">{sale.title}</span>}
                        </td>
                        <td className="sale-price">${sale.price.toLocaleString()}</td>
                        <td><ConditionBadge condition={sale.condition} /></td>
                        <td className="location-cell">{sale.location}</td>
                        <td><SourceTag source={sale.source} sold={sale.sold} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}

        {!loading && !itemData && (
          <div className="empty-state">
            {totalListings === 0 && (
              <div className="scraping-notice">
                <div className="scraping-spinner" />
                <p className="scraping-title">Scraping live data…</p>
                <p className="scraping-sub">First run pulls listings from Craigslist across 25 metros + Bring a Trailer historical sales. Takes 5–10 minutes.</p>
              </div>
            )}
            <p className="empty-heading">Browse by category</p>
            <p className="empty-label">Click any category to see real market prices</p>
            <div className="category-chips">
              {BROWSE_CHIPS.map((c) => (
                <button key={c.label} className="chip" onClick={() => loadCategory(c.category, c.subcategory, c.label.split(" ").slice(1).join(" "))}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        Data from Craigslist &amp; Bring a Trailer · 1-year window · Weighted by recency · Updated every 4 hours
      </footer>
    </div>
  );
}
