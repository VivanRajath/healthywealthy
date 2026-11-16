"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { initialIndices, initialStocks, initialSectors, rng, gauss, type Quote, type Sector } from "@/lib/market";

type Ctx = {
  indices: Quote[];
  stocks: Quote[];
  sectors: Sector[];
  // True once real prices have loaded from /api/quotes.
  live: boolean;
  // True while NSE is in its regular session.
  open: boolean;
};
const MarketContext = createContext<Ctx | null>(null);

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be used inside MarketProvider");
  return ctx;
}

type Feed = { open: boolean; quotes: Record<string, { price: number; prevClose: number; spark: number[] }> };

const merge = (list: Quote[], f: Feed) =>
  list.map((q) => {
    const n = f.quotes[q.sym];
    return n ? { ...q, price: n.price, prevClose: n.prevClose, spark: n.spark } : q;
  });

/* Random walk, used only when the live feed cannot be reached (local preview). */
function step(list: Quote[], r: () => number, vol: number): Quote[] {
  return list.map((q) => {
    if (r() > 0.55) return q;
    const next = q.price * (1 + gauss(r) * vol);
    return { ...q, price: Math.max(0.05, Math.round(next * 20) / 20) };
  });
}

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [indices, setIndices] = useState(initialIndices);
  const [stocks, setStocks] = useState(initialStocks);
  const [sectors, setSectors] = useState(initialSectors);
  const [live, setLive] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    let isLive = false;
    let timer = 0;

    const pull = async () => {
      if (document.hidden) return;
      try {
        const r = await fetch("/api/quotes");
        if (!r.ok) throw new Error(String(r.status));
        const f: Feed = await r.json();
        if (!alive) return;
        isLive = true;
        setLive(true);
        setOpen(f.open);
        setIndices((l) => merge(l, f));
        setStocks((l) => merge(l, f));
        setSectors((l) =>
          l.map((s) => {
            const n = f.quotes[s.key];
            return n ? { ...s, change: ((n.price - n.prevClose) / n.prevClose) * 100 } : s;
          })
        );
        // Refresh often while the market is open, rarely when it is closed.
        window.clearTimeout(timer);
        timer = window.setTimeout(pull, f.open ? 15000 : 120000);
      } catch {
        if (!alive || !isLive) return;
        window.clearTimeout(timer);
        timer = window.setTimeout(pull, 30000);
      }
    };
    pull();
    const onShow = () => !document.hidden && pull();
    document.addEventListener("visibilitychange", onShow);

    // Until live data arrives (or if it never does), keep the preview moving.
    const r = rng(Date.now() % 100000);
    const sim = window.setInterval(() => {
      if (document.hidden || isLive) return;
      setIndices((l) => step(l, r, 0.00035));
      setStocks((l) => step(l, r, 0.0009));
    }, 1600);

    return () => {
      alive = false;
      window.clearTimeout(timer);
      window.clearInterval(sim);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, []);

  return <MarketContext.Provider value={{ indices, stocks, sectors, live, open }}>{children}</MarketContext.Provider>;
}
