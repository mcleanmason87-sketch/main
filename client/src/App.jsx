import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const API = "/api";

const BRANDS = [
  { name: "Harley-Davidson", slug: "harley-davidson", icon: "🦅" },
  { name: "Honda",           slug: "honda",           icon: "🔴" },
  { name: "Yamaha",          slug: "yamaha",          icon: "🔵" },
  { name: "Kawasaki",        slug: "kawasaki",        icon: "🟢" },
  { name: "Suzuki",          slug: "suzuki",          icon: "🟡" },
  { name: "Ducati",          slug: "ducati",          icon: "🔴" },
  { name: "BMW",             slug: "bmw",             icon: "⚪" },
  { name: "Triumph",         slug: "triumph",         icon: "🇬🇧" },
  { name: "Indian",          slug: "indian",          icon: "🪶" },
  { name: "KTM",             slug: "ktm",             icon: "🟠" },
  { name: "Aprilia",         slug: "aprilia",         icon: "🇮🇹" },
  { name: "Royal Enfield",   slug: "royal-enfield",   icon: "🏺" },
  { name: "Zero",            slug: "zero",            icon: "⚡" },
  { name: "Moto Guzzi",      slug: "moto-guzzi",      icon: "🦅" },
  { name: "MV Agusta",       slug: "mv-agusta",       icon: "🇮🇹" },
  { name: "Norton",          slug: "norton",          icon: "🇬🇧" },
  { name: "Husqvarna",       slug: "husqvarna",       icon: "🟡" },
  { name: "Gas Gas",         slug: "gas-gas",         icon: "🔴" },
  { name: "Beta",            slug: "beta",            icon: "🏁" },
  { name: "Buell",           slug: "buell",           icon: "⚡" },
];

const BROWSE_CHIPS = [
  { label: "🏍️ Street & Cruiser",     category: "Motorcycles", subcategory: "Street / Cruiser" },
  { label: "🏁 Sport Bikes",           category: "Motorcycles", subcategory: "Sport Bike" },
  { label: "🌍 Adventure / Dual Sport",category: "Motorcycles", subcategory: "Adventure / Dual Sport" },
  { label: "🏚️ Dirt Bikes",           category: "Motorcycles", subcategory: "Dirt Bike" },
  { label: "🕰️ Classic & Vintage",    category: "Motorcycles", subcategory: "Classic / Vintage" },
];

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
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
  const pct = (v) => `${Math.max(0, Math.min(100, ((v - low) / range) * 100))}%`;
  return (
    <div className="price-bar-wrap">
      <div className="price-bar-labels">
        <span>${low.toLocaleString()}</span>
        <span>${high.toLocaleString()}</span>
      </div>
      <div className="price-bar-track">
        <div className="price-bar-iqr"  style={{ left: pct(p25), width: pct(p75 - p25 + low) }} />
        <div className="price-bar-fair" style={{ left: pct(fairLow), width: pct(fairHigh - fairLow + low) }} />
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

function KbbCard({ kbbRef }) {
  if (!kbbRef) return null;
  return (
    <div className="kbb-card">
      <div className="kbb-header">
        <span className="kbb-logo">KBB</span>
        <span className="kbb-title">Kelley Blue Book — Avg Across All Models & Years</span>
      </div>
      <div className="kbb-values">
        {kbbRef.avg_kbb_low && (
          <div className="kbb-val">
            <span className="kbb-val-label">Private Party</span>
            <span className="kbb-val-num">
              ${kbbRef.avg_kbb_low.toLocaleString()} – ${kbbRef.avg_kbb_high.toLocaleString()}
            </span>
          </div>
        )}
        {kbbRef.trade_in_low && (
          <div className="kbb-val">
            <span className="kbb-val-label">Trade-In</span>
            <span className="kbb-val-num">
              ${kbbRef.trade_in_low.toLocaleString()} – ${kbbRef.trade_in_high.toLocaleString()}
            </span>
          </div>
        )}
        {kbbRef.retail_low && (
          <div className="kbb-val">
            <span className="kbb-val-label">Dealer Retail</span>
            <span className="kbb-val-num">
              ${kbbRef.retail_low.toLocaleString()} – ${kbbRef.retail_high.toLocaleString()}
            </span>
          </div>
        )}
      </div>
      <p className="kbb-note">{kbbRef.kbb_count} model/year combos · Private party = what you'd pay person-to-person</p>
    </div>
  );
}

function ModelsTable({ models }) {
  const [filter, setFilter] = React.useState("");
  if (!models || models.length === 0) return null;
  const grouped = {};
  for (const m of models) {
    if (!grouped[m.model]) grouped[m.model] = [];
    grouped[m.model].push(m);
  }
  const filtered = Object.entries(grouped).filter(([name]) =>
    !filter || name.toLowerCase().includes(filter.toLowerCase())
  );
  return (
    <div className="card">
      <h3>Model Prices by Year</h3>
      <input
        className="model-search"
        type="text"
        placeholder="Filter models…"
        value={filter}
        onChange={e => setFilter(e.target.value)}
      />
      {filtered.map(([model, rows]) => (
        <div key={model} className="model-group">
          <div className="model-group-name">{model}</div>
          <table className="sales-table">
            <thead>
              <tr><th>Year</th><th>Trade-In</th><th>Private Party</th><th>Dealer Retail</th><th>MSRP</th></tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={{fontWeight:700, color:"#f0f4e8"}}>{r.year}</td>
                  <td>{r.trade_in_low ? `$${r.trade_in_low.toLocaleString()} – $${r.trade_in_high.toLocaleString()}` : "—"}</td>
                  <td style={{color:"var(--accent-light)", fontWeight:600}}>
                    {r.private_low ? `$${r.private_low.toLocaleString()} – $${r.private_high.toLocaleString()}` : "—"}
                  </td>
                  <td>{r.retail_low ? `$${r.retail_low.toLocaleString()} – $${r.retail_high.toLocaleString()}` : "—"}</td>
                  <td style={{color:"var(--text-muted)"}}>{r.msrp ? `$${r.msrp.toLocaleString()}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
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

  return (
    <div className="card prediction-card">
      <h3>Market Value Predictor</h3>
      <p className="card-sub">Enter the bike details to get a depreciation-adjusted value and future projections.</p>

      <div className="predict-form">
        <div className="predict-field">
          <label>Age (years)</label>
          <input className="predict-input" type="number" min="0" max="60" placeholder="e.g. 3" value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
        <div className="predict-field">
          <label>Miles <span className="optional">(optional)</span></label>
          <input className="predict-input" type="number" min="0" placeholder="e.g. 12,000" value={mileage} onChange={(e) => setMileage(e.target.value)} />
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
            <div className="predict-meta">Based on {result.basedOn} listings · {result.confidence}% confidence</div>
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
            <div className="pstat"><span className="pstat-label">Annual depreciation</span><span className="pstat-val neg">−${result.annualLoss.toLocaleString()} ({result.annualLossPct}%/yr)</span></div>
            <div className="pstat"><span className="pstat-label">Category rate</span><span className="pstat-val">{result.depreciationRate}%/yr</span></div>
            <div className="pstat"><span className="pstat-label">Seasonal index</span><span className="pstat-val">{result.seasonalIndex}%</span></div>
            <div className="pstat"><span className="pstat-label">Market trend</span><span className="pstat-val">{result.trend}</span></div>
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

function ResultsView({ itemData, asking, setAsking }) {
  const s = itemData.stats;
  return (
    <div className="results">
      <div className="item-header">
        <div className="item-icon-wrap">{itemData.image || "🏍️"}</div>
        <div className="item-header-text">
          <h2>{itemData.name || itemData.brand}</h2>
          <div className="item-meta">
            <span className="cat-pill">{s.count.toLocaleString()} listings · 1 yr</span>
            <TrendBadge trend={s.trend} />
          </div>
        </div>
      </div>

      {itemData.kbbReference && <KbbCard kbbRef={itemData.kbbReference} />}

      <ModelsTable models={itemData.models} />

      {s.sources && (
        <div className="source-bar">
          {Object.entries(s.sources).map(([src, cnt]) => (
            <span key={src} className={`source-tag source-${src}`}>
              {{ bringatrailer: "Bring a Trailer", ebay: "eBay", cycletrader: "Cycle Trader", craigslist: "Craigslist", kbb: "KBB" }[src] || src} — {cnt}
            </span>
          ))}
          {s.outliersRemoved > 0 && <span className="outlier-note">{s.outliersRemoved} outliers removed</span>}
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

      <PredictionPanel category={itemData.category || "Motorcycles"} subcategory={itemData.subcategory} />

      <div className="card">
        <h3>Recent Listings</h3>
        <table className="sales-table">
          <thead>
            <tr><th>Title</th><th>Price</th><th>Condition</th><th>Location</th><th>Source</th></tr>
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
}

export default function App() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [asking, setAsking] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);
  const [activeBrand, setActiveBrand] = useState(null);
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
    setActiveBrand(null);
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

  function loadBrand(brand) {
    setActiveBrand(brand.slug);
    setQuery("");
    setItemData(null);
    setSuggestions([]);
    setAsking("");
    setLoading(true);
    fetch(`${API}/brand/${encodeURIComponent(brand.name)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setLoading(false); return; }
        setItemData({ ...d, name: brand.name, image: brand.icon, category: "Motorcycles" });
        setLoading(false);
      })
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
            🏍️ MotoValue
            {totalListings > 0 && <span className="listing-count">{totalListings.toLocaleString()} listings</span>}
          </div>
          <h1>Know Your <span>Ride's Worth</span></h1>
          <p className="subtitle">
            Real motorcycle resale data from Craigslist, Cycle Trader, Bring a Trailer &amp; KBB — so you never overpay or undersell.
          </p>
          <div className="search-wrap">
            <div className="search-box">
              <span className="search-icon">⌕</span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search Harley, Ducati, Honda, sport bikes…"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); if (!e.target.value) { setItemData(null); setActiveBrand(null); } }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                autoComplete="off"
              />
              {query && <button className="clear-btn" onClick={() => { setQuery(""); setItemData(null); setActiveBrand(null); inputRef.current?.focus(); }}>✕</button>}
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

      <div className="layout">
        {/* ── Brand Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">Browse by Type</div>
            {BROWSE_CHIPS.map((c) => (
              <button
                key={c.label}
                className={`sidebar-item ${!activeBrand && itemData?.subcategory === c.subcategory ? "active" : ""}`}
                onClick={() => loadCategory(c.category, c.subcategory, c.label.split(" ").slice(1).join(" "))}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Brands</div>
            {BRANDS.map((b) => (
              <button
                key={b.slug}
                className={`sidebar-item ${activeBrand === b.slug ? "active" : ""}`}
                onClick={() => loadBrand(b)}
              >
                <span className="sidebar-brand-icon">{b.icon}</span>
                {b.name}
              </button>
            ))}
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="main">
          {loading && (
            <div className="loading">
              <div className="spinner" />
              <p>Fetching real listings…</p>
            </div>
          )}

          {!loading && itemData && (
            <ResultsView itemData={itemData} asking={asking} setAsking={setAsking} />
          )}

          {!loading && !itemData && (
            <div className="empty-state">
              {totalListings === 0 && (
                <div className="scraping-notice">
                  <div className="scraping-spinner" />
                  <p className="scraping-title">Scraping live data…</p>
                  <p className="scraping-sub">First run pulls listings from Craigslist, Cycle Trader across the US. Takes 1–2 minutes.</p>
                </div>
              )}
              <p className="empty-heading">Select a brand or type from the sidebar</p>
              <p className="empty-label">or search above for any motorcycle</p>
            </div>
          )}
        </main>
      </div>

      <footer className="footer">
        Data from Craigslist, Cycle Trader, Bring a Trailer &amp; Kelley Blue Book · Updated every 4 hours
      </footer>
    </div>
  );
}
