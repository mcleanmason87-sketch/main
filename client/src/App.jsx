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

function PriceBar({ low, fairLow, fairHigh, high }) {
  const range = high - low || 1;
  const fairLowPct = ((fairLow - low) / range) * 100;
  const fairWidthPct = ((fairHigh - fairLow) / range) * 100;
  return (
    <div className="price-bar-wrap">
      <div className="price-bar-labels">
        <span>${low.toLocaleString()}</span>
        <span>${high.toLocaleString()}</span>
      </div>
      <div className="price-bar-track">
        <div className="price-bar-fair" style={{ left: `${fairLowPct}%`, width: `${fairWidthPct}%` }} />
      </div>
      <div className="price-bar-legend">
        <span className="legend-dot fair" /> Fair price range (±15% of median)
      </div>
    </div>
  );
}

function ConditionBadge({ condition }) {
  const map = { Excellent: "badge-excellent", New: "badge-excellent", Good: "badge-good", Fair: "badge-fair", Used: "badge-fair" };
  return <span className={`badge ${map[condition] || "badge-good"}`}>{condition}</span>;
}

function VerdictBox({ fairLow, fairHigh, asking }) {
  if (!asking) return null;
  const price = parseFloat(asking);
  if (isNaN(price) || price <= 0) return null;
  let verdict, cls, icon, msg;
  if (price <= fairLow) {
    verdict = "Great Deal"; cls = "verdict-great"; icon = "🟢";
    msg = `$${(fairLow - price).toLocaleString()} below the fair range — solid buy.`;
  } else if (price <= fairHigh) {
    verdict = "Fair Price"; cls = "verdict-fair"; icon = "🟡";
    msg = "Right in the fair range. Reasonable deal.";
  } else {
    verdict = "Overpriced"; cls = "verdict-over"; icon = "🔴";
    msg = `$${(price - fairHigh).toLocaleString()} above fair range. Try negotiating down.`;
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
  { label: "🏍️ Motorcycles",      category: "Motorcycles",  subcategory: "Street / Cruiser" },
  { label: "🏍️ Sport Bikes",      category: "Motorcycles",  subcategory: "Sport Bike" },
  { label: "🏍️ ATVs & UTVs",      category: "Motorcycles",  subcategory: "ATV / UTV / Dirt Bike" },
  { label: "⛵ Powerboats",        category: "Boats",        subcategory: "Powerboat" },
  { label: "⛵ Jet Skis",          category: "Boats",        subcategory: "Jet Ski / PWC" },
  { label: "⛵ Wake Boats",        category: "Boats",        subcategory: "Wakeboard Boat" },
  { label: "🚐 RVs & Campers",    category: "RVs & Campers", subcategory: null },
];

export default function App() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [asking, setAsking] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dbReady, setDbReady] = useState(null); // null=checking, true/false
  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, 250);

  // Check if DB has data yet
  useEffect(() => {
    fetch(`${API}/status`)
      .then((r) => r.json())
      .then((d) => {
        const total = d.counts?.reduce((s, c) => s + c.total, 0) || 0;
        setDbReady(total > 0);
      })
      .catch(() => setDbReady(false));
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

  function handleInputChange(e) {
    setQuery(e.target.value);
    setShowSuggestions(true);
    if (!e.target.value) { setItemData(null); }
  }

  const showDrop = showSuggestions && suggestions.length > 0;

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-inner">
          <div className="logo-badge">
            <span className="logo-dot" />
            PricePulse
          </div>
          <h1>What's it <span>worth?</span></h1>
          <p className="subtitle">
            Real-time resale prices scraped from Craigslist and eBay — motorcycles,
            boats, powersports, and more.
          </p>

          <div className="search-wrap">
            <div className="search-box">
              <span className="search-icon">⌕</span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search motorcycles, boats, jet skis…"
                value={query}
                onChange={handleInputChange}
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
                    <span className="sug-count">{s.count} listings</span>
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

        {!loading && itemData && (
          <div className="results">
            <div className="item-header">
              <div className="item-icon-wrap">{itemData.image}</div>
              <div>
                <h2>{itemData.name}</h2>
                <span className="cat-pill">{itemData.stats.count} listings tracked</span>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card highlight">
                <div className="stat-label">Avg Price</div>
                <div className="stat-value">${itemData.stats.avg.toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Median</div>
                <div className="stat-value">${itemData.stats.median.toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Lowest</div>
                <div className="stat-value low">${itemData.stats.low.toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Highest</div>
                <div className="stat-value high">${itemData.stats.high.toLocaleString()}</div>
              </div>
            </div>

            <div className="card">
              <h3>Fair Price Range</h3>
              <div className="fair-range-display">
                <span className="fair-price">${itemData.stats.fairLow.toLocaleString()}</span>
                <span className="fair-dash">–</span>
                <span className="fair-price">${itemData.stats.fairHigh.toLocaleString()}</span>
              </div>
              <PriceBar low={itemData.stats.low} fairLow={itemData.stats.fairLow} fairHigh={itemData.stats.fairHigh} high={itemData.stats.high} />
            </div>

            <div className="card">
              <h3>Check a Listing Price</h3>
              <p className="card-sub">Found a listing? Enter the asking price to see if it's a deal.</p>
              <div className="price-check-row">
                <span className="dollar">$</span>
                <input className="price-input" type="number" placeholder="Enter asking price" value={asking} onChange={(e) => setAsking(e.target.value)} />
              </div>
              <VerdictBox fairLow={itemData.stats.fairLow} fairHigh={itemData.stats.fairHigh} asking={asking} />
            </div>

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
                    <tr key={i}>
                      <td>
                        {sale.url
                          ? <a className="listing-link" href={sale.url} target="_blank" rel="noopener noreferrer">{sale.title}</a>
                          : <span className="listing-title">{sale.title}</span>
                        }
                      </td>
                      <td className="sale-price">${sale.price.toLocaleString()}</td>
                      <td><ConditionBadge condition={sale.condition} /></td>
                      <td className="location-cell">{sale.location}</td>
                      <td className="source">{sale.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && !itemData && (
          <div className="empty-state">
            {dbReady === false && (
              <div className="scraping-notice">
                <div className="scraping-spinner" />
                <p className="scraping-title">Scraping live data…</p>
                <p className="scraping-sub">First run pulls listings from Craigslist across 15 metro areas. Takes 3–5 minutes. Browse a category below to check back.</p>
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
        Data scraped from Craigslist &amp; eBay · Updated every 4 hours · For reference only
      </footer>
    </div>
  );
}
