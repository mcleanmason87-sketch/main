import { useState, useEffect, useCallback } from "react";

interface BrandPrice {
  fairLow: number;
  fairHigh: number;
  weightedAvg: number;
  count: number;
}

interface ModelRow {
  model: string;
  year: number;
  trim: string | null;
  private_low: number | null;
  private_high: number | null;
  trade_in_low: number | null;
  trade_in_high: number | null;
  retail_low: number | null;
  retail_high: number | null;
  msrp: number | null;
  kbb_url: string | null;
}

interface BrandDetail {
  brand: string;
  stats: BrandPrice;
  kbbReference: {
    avg_kbb_low: number;
    avg_kbb_high: number;
    trade_in_low: number | null;
    trade_in_high: number | null;
    retail_low: number | null;
    retail_high: number | null;
  } | null;
  models: ModelRow[];
}

const BRANDS = [
  { name: "Harley-Davidson", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80" },
  { name: "Honda", img: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&q=80" },
  { name: "Yamaha", img: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80" },
  { name: "Kawasaki", img: "https://images.unsplash.com/photo-1615172282427-9a57ef2d142e?w=600&q=80" },
  { name: "Suzuki", img: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600&q=80" },
  { name: "Ducati", img: "https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?w=600&q=80" },
  { name: "BMW", img: "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=600&q=80" },
  { name: "Triumph", img: "https://images.unsplash.com/photo-1631117822699-8e67064f4c5a?w=600&q=80" },
  { name: "Indian", img: "https://images.unsplash.com/photo-1609778740066-5e2e7c5cc9f0?w=600&q=80" },
  { name: "KTM", img: "https://images.unsplash.com/photo-1630450202872-7408f1a49a9c?w=600&q=80" },
  { name: "Aprilia", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80" },
  { name: "Royal Enfield", img: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600&q=80" },
  { name: "Zero", img: "https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?w=600&q=80" },
  { name: "Moto Guzzi", img: "https://images.unsplash.com/photo-1631117822699-8e67064f4c5a?w=600&q=80" },
  { name: "MV Agusta", img: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&q=80" },
  { name: "Norton", img: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&q=80" },
  { name: "Husqvarna", img: "https://images.unsplash.com/photo-1630450202872-7408f1a49a9c?w=600&q=80" },
  { name: "Beta", img: "https://images.unsplash.com/photo-1615172282427-9a57ef2d142e?w=600&q=80" },
  { name: "Gas Gas", img: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600&q=80" },
  { name: "Buell", img: "https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?w=600&q=80" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

function ModelTable({ models }: { models: ModelRow[] }) {
  const [filter, setFilter] = useState("");
  const filtered = models.filter(
    (m) =>
      m.model.toLowerCase().includes(filter.toLowerCase()) ||
      String(m.year).includes(filter)
  );

  return (
    <div className="mt-6">
      <input
        type="text"
        placeholder="Filter model or year..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted text-muted-foreground uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3">Private Party</th>
              <th className="px-4 py-3">Trade-In</th>
              <th className="px-4 py-3">Retail</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr
                key={i}
                className="border-t border-border hover:bg-secondary/50 transition-colors"
              >
                <td className="px-4 py-3 text-foreground font-medium">{m.model}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.year}</td>
                <td className="px-4 py-3 text-primary font-semibold">
                  {m.private_low && m.private_high
                    ? `${fmt(m.private_low)} – ${fmt(m.private_high)}`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {m.trade_in_low && m.trade_in_high
                    ? `${fmt(m.trade_in_low)} – ${fmt(m.trade_in_high)}`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {m.retail_low && m.retail_high
                    ? `${fmt(m.retail_low)} – ${fmt(m.retail_high)}`
                    : "—"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  No models match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BrandCard({
  brand,
  price,
  selected,
  onClick,
}: {
  brand: (typeof BRANDS)[0];
  price: BrandPrice | null;
  selected: boolean;
  onClick: () => void;
}) {
  if (!price) return null;

  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl text-left transition-all duration-300 border ${
        selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50"
      } focus:outline-none`}
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={brand.img}
          alt={brand.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-foreground font-semibold text-base leading-tight mb-1">
          {brand.name}
        </p>
        <p className="text-primary text-sm font-bold tabular-nums">
          {fmt(price.fairLow)} – {fmt(price.fairHigh)}
        </p>
        <p className="text-muted-foreground/70 text-xs mt-0.5">
          Private Party Avg &bull; {price.count} models
        </p>
      </div>

      {selected && (
        <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded">
          OPEN
        </div>
      )}
    </button>
  );
}

export default function BrandsSection() {
  const [prices, setPrices] = useState<Record<string, BrandPrice>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<BrandDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    Promise.all(
      BRANDS.map((b) =>
        fetch(`/api/brand/${encodeURIComponent(b.name)}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null)
      )
    ).then((results) => {
      const map: Record<string, BrandPrice> = {};
      results.forEach((data, i) => {
        if (data?.stats?.fairLow) {
          map[BRANDS[i].name] = {
            fairLow: data.stats.fairLow,
            fairHigh: data.stats.fairHigh,
            weightedAvg: data.stats.weightedAvg,
            count: data.stats.count,
          };
        }
      });
      setPrices(map);
    });
  }, []);

  const handleSelect = useCallback(
    async (name: string) => {
      if (selected === name) {
        setSelected(null);
        setDetail(null);
        return;
      }
      setSelected(name);
      setLoadingDetail(true);
      try {
        const res = await fetch(`/api/brand/${encodeURIComponent(name)}`);
        const data = await res.json();
        setDetail(data);
      } catch {
        setDetail(null);
      } finally {
        setLoadingDetail(false);
      }
    },
    [selected]
  );

  const brandsWithData = BRANDS.filter((b) => prices[b.name]);

  return (
    <section id="brands" className="bg-background py-16 px-6 md:px-12 lg:px-20">
      {/* Header */}
      <div className="mb-10">
        <p className="text-primary uppercase tracking-[0.2em] text-xs font-semibold mb-2">
          Market Intelligence
        </p>
        <h2 className="text-foreground text-3xl md:text-4xl font-bold tracking-tight">
          KBB Price Reference
        </h2>
        <p className="text-muted-foreground mt-2 max-w-xl">
          Private party fair market values across {brandsWithData.length} major brands. Click any
          card to see full model breakdowns.
        </p>
      </div>

      {/* Brand grid */}
      {brandsWithData.length === 0 ? (
        <div className="text-muted-foreground text-sm">Loading price data…</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {brandsWithData.map((b) => (
            <BrandCard
              key={b.name}
              brand={b}
              price={prices[b.name] ?? null}
              selected={selected === b.name}
              onClick={() => handleSelect(b.name)}
            />
          ))}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="mt-10 rounded-xl border border-border bg-secondary/30 p-6 md:p-8">
          {loadingDetail ? (
            <div className="text-muted-foreground text-sm animate-pulse">Loading…</div>
          ) : detail ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-foreground text-2xl font-bold">{detail.brand}</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    KBB private party range for all available models
                  </p>
                </div>
                {detail.kbbReference && (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {[
                      {
                        label: "Trade-In",
                        low: detail.kbbReference.trade_in_low,
                        high: detail.kbbReference.trade_in_high,
                      },
                      {
                        label: "Private Party",
                        low: detail.kbbReference.avg_kbb_low,
                        high: detail.kbbReference.avg_kbb_high,
                      },
                      {
                        label: "Dealer Retail",
                        low: detail.kbbReference.retail_low,
                        high: detail.kbbReference.retail_high,
                      },
                    ].map((col) => (
                      <div key={col.label} className="bg-muted rounded-lg p-3">
                        <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                          {col.label}
                        </p>
                        <p className="text-primary font-bold text-sm tabular-nums">
                          {col.low && col.high ? `${fmt(col.low)}–${fmt(col.high)}` : "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <ModelTable models={detail.models} />
            </>
          ) : (
            <p className="text-muted-foreground text-sm">No data available.</p>
          )}
        </div>
      )}
    </section>
  );
}
