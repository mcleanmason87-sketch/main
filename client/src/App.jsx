import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const API = "/api";

// Each brand has a name, a color for gradient fallback, and an Unsplash image
const BRANDS = [
  { name: "Harley-Davidson", slug: "harley-davidson", color: "#b84a00", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80" },
  { name: "Honda",           slug: "honda",           color: "#aa0000", img: "https://images.unsplash.com/photo-1568772585407-9b185bce74c4?auto=format&fit=crop&w=1200&q=80" },
  { name: "Yamaha",          slug: "yamaha",          color: "#003b8e", img: "https://images.unsplash.com/photo-1449426468522-d06d5c44f2f7?auto=format&fit=crop&w=1200&q=80" },
  { name: "Kawasaki",        slug: "kawasaki",        color: "#1a6b1a", img: "https://images.unsplash.com/photo-1615197819604-f0d8b4b1c8d4?auto=format&fit=crop&w=1200&q=80" },
  { name: "Suzuki",          slug: "suzuki",          color: "#0050a0", img: "https://images.unsplash.com/photo-1611566026373-c6c8da0ea861?auto=format&fit=crop&w=1200&q=80" },
  { name: "Ducati",          slug: "ducati",          color: "#c8000a", img: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=1200&q=80" },
  { name: "BMW",             slug: "bmw",             color: "#004b87", img: "https://images.unsplash.com/photo-1609783880015-a8e1b65c8ab7?auto=format&fit=crop&w=1200&q=80" },
  { name: "Triumph",         slug: "triumph",         color: "#1c1c1c", img: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=1200&q=80" },
  { name: "Indian",          slug: "indian",          color: "#7a1414", img: "https://images.unsplash.com/photo-1559034750-cdab70a66b8e?auto=format&fit=crop&w=1200&q=80" },
  { name: "KTM",             slug: "ktm",             color: "#d45200", img: "https://images.unsplash.com/photo-1622185135505-2d795003994a?auto=format&fit=crop&w=1200&q=80" },
  { name: "Aprilia",         slug: "aprilia",         color: "#8b0000", img: "https://images.unsplash.com/photo-1599820862073-8a2d94e44f02?auto=format&fit=crop&w=1200&q=80" },
  { name: "Royal Enfield",   slug: "royal-enfield",   color: "#4a2800", img: "https://images.unsplash.com/photo-1600950207944-0d63e8edbc3f?auto=format&fit=crop&w=1200&q=80" },
  { name: "Zero",            slug: "zero",            color: "#0a0a0a", img: "https://images.unsplash.com/photo-1588528402605-1f1a9de4d321?auto=format&fit=crop&w=1200&q=80" },
  { name: "Moto Guzzi",      slug: "moto-guzzi",      color: "#5a3000", img: "https://images.unsplash.com/photo-1567180350598-fac9f85b1a7d?auto=format&fit=crop&w=1200&q=80" },
  { name: "MV Agusta",       slug: "mv-agusta",       color: "#c8a000", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80" },
  { name: "Norton",          slug: "norton",          color: "#1a1a3a", img: "https://images.unsplash.com/photo-1449426468522-d06d5c44f2f7?auto=format&fit=crop&w=1200&q=80" },
  { name: "Husqvarna",       slug: "husqvarna",       color: "#003366", img: "https://images.unsplash.com/photo-1568010434378-01e0e93a7fd5?auto=format&fit=crop&w=1200&q=80" },
  { name: "Gas Gas",         slug: "gas-gas",         color: "#cc0000", img: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1200&q=80" },
  { name: "Beta",            slug: "beta",            color: "#8b0000", img: "https://images.unsplash.com/photo-1571008887538-b36bb32f4571?auto=format&fit=crop&w=1200&q=80" },
  { name: "Buell",           slug: "buell",           color: "#1a1a1a", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80" },
];

const BROWSE_CHIPS = [
  { label: "Street & Cruiser",      category: "Motorcycles", subcategory: "Street / Cruiser" },
  { label: "Sport Bikes",           category: "Motorcycles", subcategory: "Sport Bike" },
  { label: "Adventure / Dual Sport",category: "Motorcycles", subcategory: "Adventure / Dual Sport" },
  { label: "Dirt Bikes",            category: "Motorcycles", subcategory: "Dirt Bike" },
  { label: "Classic & Vintage",     category: "Motorcycles", subcategory: "Classic / Vintage" },
];

function useDebounce(value, delay) {
  const [dv, setDv] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDv(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return dv;
}

function TrendBadge({ trend }) {
  const map = { rising: { label: "Rising", cls: "trend-rising" }, falling: { label: "Falling", cls: "trend-falling" }, stable: { label: "Stable", cls: "trend-stable" } };
  const t = map[trend] || map.stable;
  return <span className={`trend-badge ${t.cls}`}>{t.label}</span>;
}

function Sparkline({ buckets }) {
  if (!buckets || buckets.length < 2) return null;
  const prices = buckets.map(b => b.avg_price);
  const min = Math.min(...prices), max = Math.max(...prices), range = max - min || 1;
  const W = 200, H = 48, pad = 4;
  const pts = prices.map((p, i) => `${pad + (i / (prices.length - 1)) * (W - pad * 2)},${H - pad - ((p - min) / range) * (H - pad * 2)}`).join(" ");
  return (
    <svg className="sparkline" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--green)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="var(--green-bright)" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke="url(#sg)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function PriceBar({ low, p25, p75, fairLow, fairHigh, high }) {
  const range = high - low || 1;
  const pct = v => `${Math.max(0, Math.min(100, ((v - low) / range) * 100))}%`;
  return (
    <div className="price-bar-wrap">
      <div className="price-bar-labels"><span>${low.toLocaleString()}</span><span>${high.toLocaleString()}</span></div>
      <div className="price-bar-track">
        <div className="price-bar-iqr" style={{ left: pct(p25), width: pct(p75 - p25 + low) }} />
        <div className="price-bar-fair" style={{ left: pct(fairLow), width: pct(fairHigh - fairLow + low) }} />
      </div>
      <div className="price-bar-legend">
        <span className="legend-dot fair" /> Fair range &nbsp;
        <span className="legend-dot iqr" /> Middle 50%
      </div>
    </div>
  );
}

function ConditionBadge({ condition }) {
  const map = { Excellent: "badge-excellent", New: "badge-excellent", Good: "badge-good", Fair: "badge-fair", Used: "badge-fair" };
  return <span className={`badge ${map[condition] || "badge-good"}`}>{condition}</span>;
}

function SourceTag({ source, sold }) {
  const labels = { bringatrailer: "Bring a Trailer", ebay: "eBay", craigslist: "Craigslist", cycletrader: "Cycle Trader", kbb: "KBB" };
  return <span className={`source-tag source-${source}`}>{labels[source] || source}{sold ? " SOLD" : ""}</span>;
}

function VerdictBox({ fairLow, fairHigh, asking }) {
  if (!asking) return null;
  const price = parseFloat(asking);
  if (isNaN(price) || price <= 0) return null;
  let verdict, cls, icon, msg;
  if (price <= fairLow) { verdict = "Great Deal"; cls = "verdict-great"; icon = ""; msg = `$${(fairLow - price).toLocaleString()} below fair range — solid buy.`; }
  else if (price <= fairHigh) { verdict = "Fair Price"; cls = "verdict-fair"; icon = ""; msg = "Right in the fair range. Reasonable deal."; }
  else { verdict = "Overpriced"; cls = "verdict-over"; icon = ""; msg = `$${(price - fairHigh).toLocaleString()} above fair range. Negotiate to $${fairHigh.toLocaleString()}.`; }
  return (
    <div className={`verdict-box ${cls}`}>
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
        {kbbRef.avg_kbb_low && <div className="kbb-val"><div className="kbb-val-label">Private Party</div><div className="kbb-val-num">${kbbRef.avg_kbb_low.toLocaleString()} – ${kbbRef.avg_kbb_high.toLocaleString()}</div></div>}
        {kbbRef.trade_in_low && <div className="kbb-val"><div className="kbb-val-label">Trade-In</div><div className="kbb-val-num">${kbbRef.trade_in_low.toLocaleString()} – ${kbbRef.trade_in_high.toLocaleString()}</div></div>}
        {kbbRef.retail_low && <div className="kbb-val"><div className="kbb-val-label">Dealer Retail</div><div className="kbb-val-num">${kbbRef.retail_low.toLocaleString()} – ${kbbRef.retail_high.toLocaleString()}</div></div>}
      </div>
      <p className="kbb-note">{kbbRef.kbb_count} model/year combos · Private party = person-to-person resale value</p>
    </div>
  );
}

function ModelsTable({ models }) {
  const [filter, setFilter] = React.useState("");
  if (!models || models.length === 0) return null;
  const grouped = {};
  for (const m of models) { if (!grouped[m.model]) grouped[m.model] = []; grouped[m.model].push(m); }
  const filtered = Object.entries(grouped).filter(([name]) => !filter || name.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className="card">
      <h3>Model Prices by Year</h3>
      <input className="model-search" type="text" placeholder="Filter models..." value={filter} onChange={e => setFilter(e.target.value)} />
      {filtered.map(([model, rows]) => (
        <div key={model} className="model-group">
          <div className="model-group-name">{model}</div>
          <table className="sales-table">
            <thead><tr><th>Year</th><th>Trade-In</th><th>Private Party</th><th>Dealer Retail</th><th>MSRP</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={{fontWeight:800,color:"#f0f4e8",fontFamily:"'Barlow Condensed',sans-serif"}}>{r.year}</td>
                  <td>{r.trade_in_low ? `$${r.trade_in_low.toLocaleString()} – $${r.trade_in_high.toLocaleString()}` : "—"}</td>
                  <td style={{color:"var(--green-bright)",fontWeight:700}}>{r.private_low ? `$${r.private_low.toLocaleString()} – $${r.private_high.toLocaleString()}` : "—"}</td>
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
  const [err, setErr] = useState("");

  function run() {
    if (!age) return;
    setLoading(true); setErr(""); setResult(null);
    const p = new URLSearchParams({ category: category || "Motorcycles", age, condition });
    if (subcategory) p.set("subcategory", subcategory);
    if (mileage) p.set("mileage", mileage);
    fetch(`${API}/predict?${p}`)
      .then(r => r.json())
      .then(d => { if (d.error) { setErr(d.error); setLoading(false); return; } setResult(d); setLoading(false); })
      .catch(() => { setErr("Request failed."); setLoading(false); });
  }

  return (
    <div className="card prediction-card">
      <h3>Market Prediction</h3>
      <p className="card-sub">Enter the bike's age and condition to see current value and future projections.</p>
      <div className="predict-form">
        <div className="predict-field"><label>Age (years)</label><input className="predict-input" type="number" min="0" max="50" placeholder="e.g. 3" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div className="predict-field"><label>Condition</label>
          <select className="predict-select" value={condition} onChange={e => setCondition(e.target.value)}>
            {["Excellent","Good","Fair","Poor"].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="predict-field"><label>Mileage <span className="optional">(optional)</span></label><input className="predict-input" type="number" placeholder="e.g. 12000" value={mileage} onChange={e => setMileage(e.target.value)} /></div>
        <button className="predict-btn" onClick={run} disabled={loading || !age}>{loading ? "..." : "Predict"}</button>
      </div>
      {err && <p className="predict-error">{err}</p>}
      {result && (
        <div className="predict-results">
          <div className="predict-current">
            <div className="predict-value-label">Current Market Value</div>
            <div className="predict-value">${result.currentValue?.toLocaleString()}</div>
            <div className="predict-meta">{result.subcategory || result.category} · {result.condition} condition · {result.age}yr old</div>
          </div>
          {result.projections && (
            <div className="predict-projections">
              {result.projections.map((p, i) => (
                <div key={i} className="projection-card">
                  <div className="proj-label">+{p.years}yr</div>
                  <div className="proj-value">${p.value?.toLocaleString()}</div>
                  <div className={`proj-change ${p.pctChange < 0 ? "neg" : "pos"}`}>{p.pctChange > 0 ? "+" : ""}{p.pctChange}%</div>
                </div>
              ))}
            </div>
          )}
          {result.sellAdvice && <div className={`sell-advice advice-${result.sellAdvice.type}`}>{result.sellAdvice.message}</div>}
        </div>
      )}
    </div>
  );
}

function ResultsView({ itemData, asking, setAsking }) {
  const s = itemData.stats;
  if (!s) return null;
  return (
    <div className="results">
      {/* Brand banner */}
      <div className="brand-banner">
        {itemData._brand?.img && (
          <img className="brand-banner-img" src={itemData._brand.img} alt={itemData.name} onError={e => { e.target.style.display="none"; }} />
        )}
        <div className="brand-banner-overlay" style={itemData._brand ? { background: `linear-gradient(0deg, rgba(5,8,4,0.95) 0%, rgba(5,8,4,0.5) 50%, ${itemData._brand.color}22 100%)` } : undefined} />
        <div className="brand-banner-content">
          <div>
            <div className="brand-banner-title">{itemData.name}</div>
            <div className="item-meta" style={{marginTop:"0.5rem"}}>
              <span className="cat-pill">{s.count.toLocaleString()} entries</span>
              <TrendBadge trend={s.trend} />
            </div>
          </div>
          <div className="brand-banner-meta">
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"2rem",fontWeight:900,color:"var(--green-bright)",lineHeight:1,textShadow:"0 0 20px var(--green-glow)"}}>
              ${s.fairLow?.toLocaleString()} – ${s.fairHigh?.toLocaleString()}
            </div>
            <div style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:"'Barlow Condensed',sans-serif"}}>Private Party Range</div>
          </div>
        </div>
      </div>

      {itemData.kbbReference && <KbbCard kbbRef={itemData.kbbReference} />}

      {s.sources && (
        <div className="source-bar">
          {Object.entries(s.sources).map(([src, cnt]) => (
            <span key={src} className={`source-tag source-${src}`}>
              {{ bringatrailer:"Bring a Trailer", ebay:"eBay", cycletrader:"Cycle Trader", craigslist:"Craigslist", kbb:"KBB" }[src] || src} — {cnt}
            </span>
          ))}
          {s.outliersRemoved > 0 && <span className="outlier-note">{s.outliersRemoved} outliers removed</span>}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card highlight"><div className="stat-label">Weighted Avg</div><div className="stat-value">${s.weightedAvg?.toLocaleString()}</div><div className="stat-sub">Recent sales weighted more</div></div>
        <div className="stat-card"><div className="stat-label">Median</div><div className="stat-value">${s.median?.toLocaleString()}</div></div>
        <div className="stat-card"><div className="stat-label">Lowest</div><div className="stat-value low">${s.low?.toLocaleString()}</div></div>
        <div className="stat-card"><div className="stat-label">Highest</div><div className="stat-value high">${s.high?.toLocaleString()}</div></div>
      </div>

      <div className="card">
        <h3>Fair Price Range</h3>
        <div className="fair-range-header">
          <div className="fair-range-display">
            <span className="fair-price">${s.fairLow?.toLocaleString()}</span>
            <span className="fair-dash">–</span>
            <span className="fair-price">${s.fairHigh?.toLocaleString()}</span>
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
          <input className="price-input" type="number" placeholder="Enter asking price" value={asking} onChange={e => setAsking(e.target.value)} />
        </div>
        <VerdictBox fairLow={s.fairLow} fairHigh={s.fairHigh} asking={asking} />
      </div>

      <PredictionPanel category={itemData.category || "Motorcycles"} subcategory={itemData.subcategory} />

      <ModelsTable models={itemData.models} />

      {itemData.sales?.length > 0 && (
        <div className="card">
          <h3>Recent Listings</h3>
          <table className="sales-table">
            <thead><tr><th>Title</th><th>Price</th><th>Condition</th><th>Location</th><th>Source</th></tr></thead>
            <tbody>
              {itemData.sales.map((sale, i) => (
                <tr key={i} className={sale.sold ? "row-sold" : ""}>
                  <td>{sale.url ? <a className="listing-link" href={sale.url} target="_blank" rel="noopener noreferrer">{sale.title}</a> : <span className="listing-title">{sale.title}</span>}</td>
                  <td className="sale-price">${sale.price?.toLocaleString()}</td>
                  <td><ConditionBadge condition={sale.condition} /></td>
                  <td className="location-cell">{sale.location}</td>
                  <td><SourceTag source={sale.source} sold={sale.sold} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Brand Showcase ─────────────────────────────────────────────────────────
function BrandShowcase({ onSelect, activeBrand, brandPrices }) {
  return (
    <section className="showcase">
      {BRANDS.map((brand) => {
        const prices = brandPrices[brand.slug];
        return (
          <div
            key={brand.slug}
            className={`showcase-slide ${activeBrand === brand.slug ? "showcase-slide--active" : ""}`}
            onClick={() => onSelect(brand)}
          >
            <img
              className="showcase-img"
              src={brand.img}
              alt={brand.name}
              onError={e => { e.target.style.display = "none"; }}
            />
            <div className="showcase-overlay" style={{ background: `linear-gradient(160deg, ${brand.color}bb 0%, rgba(5,8,4,0.92) 100%)` }} />
            <div className="showcase-content">
              <div className="showcase-brand">{brand.name}</div>
              {prices ? (
                <div className="showcase-prices">
                  <div className="showcase-price-range">${prices.low} – ${prices.high}</div>
                  <div className="showcase-price-label">Private Party Range</div>
                </div>
              ) : (
                <div className="showcase-cta">Tap to View Prices</div>
              )}
            </div>
            {activeBrand === brand.slug && <div className="showcase-active-bar" />}
          </div>
        );
      })}
    </section>
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
  const [view, setView] = useState("home"); // "home" | "results"
  const [brandPrices, setBrandPrices] = useState({});
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    fetch(`${API}/status`).then(r => r.json()).then(setDbStatus).catch(() => setDbStatus({ total: 0 }));
  }, []);

  // Load KBB price summaries for all brands upfront
  useEffect(() => {
    const prices = {};
    Promise.all(
      BRANDS.map(brand =>
        fetch(`${API}/brand/${encodeURIComponent(brand.name)}`)
          .then(r => r.json())
          .then(d => {
            if (d.stats && d.stats.fairLow) {
              prices[brand.slug] = {
                low: d.stats.fairLow.toLocaleString(),
                high: d.stats.fairHigh.toLocaleString(),
              };
            }
          })
          .catch(() => {})
      )
    ).then(() => setBrandPrices({ ...prices }));
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2) { setSuggestions([]); return; }
    fetch(`${API}/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then(r => r.json()).then(d => setSuggestions(d.results || [])).catch(() => setSuggestions([]));
  }, [debouncedQuery]);

  function loadCategory(category, subcategory, label) {
    setQuery(label || category);
    setActiveBrand(null);
    setSuggestions([]); setShowSuggestions(false); setAsking("");
    setLoading(true); setView("results");
    const params = new URLSearchParams({ category });
    if (subcategory) params.set("subcategory", subcategory);
    fetch(`${API}/category?${params}`)
      .then(r => r.json())
      .then(d => { setItemData(d.error ? null : d); setLoading(false); })
      .catch(() => setLoading(false));
  }

  function loadBrand(brand) {
    setActiveBrand(brand.slug);
    setQuery(""); setItemData(null); setSuggestions([]); setAsking("");
    setLoading(true); setView("results");
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    fetch(`${API}/brand/${encodeURIComponent(brand.name)}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setLoading(false); return; }
        setItemData({ ...d, name: brand.name, category: "Motorcycles", _brand: brand });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  const showDrop = showSuggestions && suggestions.length > 0;
  const totalListings = dbStatus?.total || 0;

  return (
    <div className="app">

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="nav-logo" onClick={() => { setView("home"); setItemData(null); setActiveBrand(null); setQuery(""); }} style={{cursor:"pointer"}}>
          <span className="nav-logo-icon">M</span>
          <span>oto<em style={{fontStyle:"normal",color:"var(--green-bright)"}}>Value</em></span>
          <span className="nav-pill">Beta</span>
        </div>
        <div className="search-wrap nav-search">
          <div className="search-box">
            <span className="search-icon">&#9906;</span>
            <input
              ref={inputRef} type="text"
              placeholder="Search brand, model, type..."
              value={query}
              onChange={e => { setQuery(e.target.value); setShowSuggestions(true); if (!e.target.value) { setItemData(null); setActiveBrand(null); setView("home"); } }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              autoComplete="off"
            />
            {query && <button className="clear-btn" onClick={() => { setQuery(""); setItemData(null); setActiveBrand(null); setView("home"); inputRef.current?.focus(); }}>x</button>}
          </div>
          {showDrop && (
            <ul className="suggestions">
              {suggestions.map(s => (
                <li key={s.key} onMouseDown={() => loadCategory(s.category, s.subcategory, s.name)}>
                  <span className="sug-name">{s.name}</span>
                  <span className="sug-count">{s.count.toLocaleString()} listings</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {totalListings > 0 && <div className="nav-count">{totalListings.toLocaleString()} listings indexed</div>}
      </nav>

      {/* ── Hero ── */}
      <header className="hero">
        <div className="hero-bg" />
        <div className="hero-stripes" />
        <div className="hero-grid" />
        <img
          className="hero-photo"
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1920&q=80"
          alt=""
          onError={e => { e.target.style.display = "none"; }}
        />
        <div className="hero-photo-overlay" />
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <span className="eyebrow-dot" />
            Motorcycle Resale Intelligence
          </div>
          <h1>
            Know Your
            <em>Ride's Worth</em>
          </h1>
          <p className="hero-sub">
            Real KBB values, private party ranges, and dealer retail — for every major brand, every year.
          </p>
          <a href="#brands" className="hero-scroll-cta">Browse All Brands</a>
        </div>
      </header>

      {/* ── Type chips ── */}
      <div className="type-strip" id="brands">
        <div className="type-strip-inner">
          {BROWSE_CHIPS.map(c => (
            <button key={c.label} className="chip" onClick={() => loadCategory(c.category, c.subcategory, c.label)}>{c.label}</button>
          ))}
        </div>
      </div>

      {/* ── Brand Showcase ── */}
      <BrandShowcase onSelect={loadBrand} activeBrand={activeBrand} brandPrices={brandPrices} />

      {/* ── Results Panel ── */}
      <div ref={resultsRef} className={`results-panel ${view === "results" || loading ? "results-panel--visible" : ""}`}>
        <div className="main">
          {loading && (
            <div className="loading">
              <div className="spinner" />
              <p>Loading price data...</p>
            </div>
          )}
          {!loading && itemData && <ResultsView itemData={itemData} asking={asking} setAsking={setAsking} />}
          {!loading && !itemData && view === "results" && (
            <div className="empty-state">
              <div className="empty-heading">No data found</div>
              <p className="empty-label">Try a different brand or search term.</p>
            </div>
          )}
        </div>
      </div>

      <footer className="footer">
        Data sourced from KBB market values · Updated regularly · MotoValue is not affiliated with Kelley Blue Book
      </footer>
    </div>
  );
}
