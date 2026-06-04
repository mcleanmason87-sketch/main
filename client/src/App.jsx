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
        <div
          className="price-bar-fair"
          style={{ left: `${fairLowPct}%`, width: `${fairWidthPct}%` }}
        />
      </div>
      <div className="price-bar-legend">
        <span className="legend-dot fair" /> Fair price range
      </div>
    </div>
  );
}

function ConditionBadge({ condition }) {
  const map = {
    Excellent: "badge-excellent",
    New: "badge-excellent",
    Good: "badge-good",
    Fair: "badge-fair",
    Used: "badge-fair",
  };
  return <span className={`badge ${map[condition] || "badge-good"}`}>{condition}</span>;
}

function VerdictBox({ fairLow, fairHigh, asking }) {
  if (!asking) return null;
  const price = parseFloat(asking);
  if (isNaN(price) || price <= 0) return null;

  let verdict, cls, icon, msg;
  if (price <= fairLow) {
    verdict = "Great Deal";
    cls = "verdict-great";
    icon = "🟢";
    msg = `$${(fairLow - price).toLocaleString()} below the fair range — solid buy.`;
  } else if (price <= fairHigh) {
    verdict = "Fair Price";
    cls = "verdict-fair";
    icon = "🟡";
    msg = "Right in the fair range. Reasonable deal.";
  } else {
    verdict = "Overpriced";
    cls = "verdict-over";
    icon = "🔴";
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

const FEATURED = [
  { label: "🏍️ Harley Road Glide",  key: "harley davidson road glide" },
  { label: "⛵ Sea Ray Sundancer",   key: "sea ray sundancer" },
  { label: "⌚ Rolex Daytona",       key: "rolex daytona" },
  { label: "👜 Hermès Birkin",       key: "hermes birkin" },
  { label: "🏀 Jordan Rookie Card",  key: "michael jordan rookie card" },
  { label: "🎸 Gibson Les Paul",     key: "gibson les paul" },
  { label: "🏍️ Ducati Panigale V4", key: "ducati panigale v4" },
  { label: "⛵ MasterCraft X26",     key: "mastercraft x26" },
  { label: "⌚ Patek Nautilus",      key: "patek philippe nautilus" },
  { label: "📷 Leica M11",           key: "leica m11" },
  { label: "🎮 PS5",                 key: "ps5" },
  { label: "👟 Jordan 1 Chicago",    key: "jordan 1 chicago" },
];

export default function App() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [asking, setAsking] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, 220);

  useEffect(() => {
    if (debouncedQuery.length < 2) { setSuggestions([]); return; }
    fetch(`${API}/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((d) => setSuggestions(d.results || []))
      .catch(() => setSuggestions([]));
  }, [debouncedQuery]);

  function loadItem(key, name) {
    setQuery(name);
    setSuggestions([]);
    setShowSuggestions(false);
    setAsking("");
    setLoading(true);
    fetch(`${API}/item/${encodeURIComponent(key)}`)
      .then((r) => r.json())
      .then((d) => { setItemData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }

  function handleInputChange(e) {
    setQuery(e.target.value);
    setShowSuggestions(true);
    if (!e.target.value) { setItemData(null); }
  }

  function clearSearch() {
    setQuery("");
    setItemData(null);
    setSuggestions([]);
    inputRef.current?.focus();
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
            Search any item to see real sold prices, market trends,
            and whether a listing is a deal or a rip-off.
          </p>

          <div className="search-wrap">
            <div className="search-box">
              <span className="search-icon">⌕</span>
              <input
                ref={inputRef}
                type="text"
                placeholder="Try: Harley Road Glide, Rolex Daytona, PS5…"
                value={query}
                onChange={handleInputChange}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                autoComplete="off"
              />
              {query && (
                <button className="clear-btn" onClick={clearSearch}>✕</button>
              )}
            </div>

            {showDrop && (
              <ul className="suggestions">
                {suggestions.map((s) => (
                  <li key={s.key} onMouseDown={() => loadItem(s.key, s.name)}>
                    <span className="sug-icon">{s.image}</span>
                    <span className="sug-name">{s.name}</span>
                    <span className="sug-cat">{s.category}</span>
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
            <p>Looking up prices…</p>
          </div>
        )}

        {!loading && itemData && (
          <div className="results">
            <div className="item-header">
              <div className="item-icon-wrap">{itemData.image}</div>
              <div>
                <h2>{itemData.name}</h2>
                <span className="cat-pill">{itemData.category}</span>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card highlight">
                <div className="stat-label">Avg Sold Price</div>
                <div className="stat-value">${itemData.stats.avg.toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Lowest Sold</div>
                <div className="stat-value low">${itemData.stats.low.toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Highest Sold</div>
                <div className="stat-value high">${itemData.stats.high.toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Sales Tracked</div>
                <div className="stat-value">{itemData.stats.count}</div>
              </div>
            </div>

            <div className="card">
              <h3>Fair Price Range</h3>
              <div className="fair-range-display">
                <span className="fair-price">${itemData.stats.fairLow.toLocaleString()}</span>
                <span className="fair-dash">–</span>
                <span className="fair-price">${itemData.stats.fairHigh.toLocaleString()}</span>
              </div>
              <PriceBar
                low={itemData.stats.low}
                fairLow={itemData.stats.fairLow}
                fairHigh={itemData.stats.fairHigh}
                high={itemData.stats.high}
              />
            </div>

            <div className="card">
              <h3>Check a Listing Price</h3>
              <p className="card-sub">Paste a price you're seeing — we'll tell you if it's worth it.</p>
              <div className="price-check-row">
                <span className="dollar">$</span>
                <input
                  className="price-input"
                  type="number"
                  placeholder="Enter asking price"
                  value={asking}
                  onChange={(e) => setAsking(e.target.value)}
                />
              </div>
              <VerdictBox
                fairLow={itemData.stats.fairLow}
                fairHigh={itemData.stats.fairHigh}
                asking={asking}
              />
            </div>

            <div className="card">
              <h3>Recent Sales</h3>
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Price</th>
                    <th>Condition</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {itemData.sales.map((sale, i) => (
                    <tr key={i}>
                      <td>{new Date(sale.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                      <td className="sale-price">${sale.price.toLocaleString()}</td>
                      <td><ConditionBadge condition={sale.condition} /></td>
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
            <p className="empty-heading">Popular searches</p>
            <p className="empty-label">Click any item below or type to search</p>
            <div className="category-chips">
              {FEATURED.map((c) => (
                <button
                  key={c.key}
                  className="chip"
                  onClick={() => loadItem(c.key, c.label.split(" ").slice(1).join(" "))}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        Prices based on recent sold listings · Data is for reference only
      </footer>
    </div>
  );
}
