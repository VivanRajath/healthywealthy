"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { initialIndices, initialStocks, rng, gauss, type Quote } from "@/lib/market";

type Ctx = { indices: Quote[]; stocks: Quote[] };
const MarketContext = createContext<Ctx | null>(null);

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be used inside MarketProvider");
  return ctx;
}

/* Random walk on each quote, rounded to the exchange tick of 0.05. */
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

  useEffect(() => {
    const r = rng(Date.now() % 100000);
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setIndices((l) => step(l, r, 0.00035));
      setStocks((l) => step(l, r, 0.0009));
    }, 1600);
    return () => window.clearInterval(id);
  }, []);

  return <MarketContext.Provider value={{ indices, stocks }}>{children}</MarketContext.Provider>;
}
