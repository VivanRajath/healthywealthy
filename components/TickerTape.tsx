"use client";

import { useEffect, useRef } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useMarket } from "./MarketProvider";
import { fmt, pct, type Quote } from "@/lib/market";

/* Price that flashes green or red when it moves. */
export function Tick({ q, decimals = 2, className = "" }: { q: Quote; decimals?: number; className?: string }) {
  const prev = useRef(q.price);
  const dir = q.price > prev.current ? "up" : q.price < prev.current ? "down" : "";
  useEffect(() => {
    prev.current = q.price;
  }, [q.price]);
  return (
    <span key={q.price} className={`tick ${dir ? `tick--${dir}` : ""} ${className}`}>
      {fmt(q.price, decimals)}
    </span>
  );
}

export function Change({ q, showIcon = true }: { q: Quote; showIcon?: boolean }) {
  const c = pct(q);
  const up = c >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`chg ${up ? "is-up" : "is-down"}`}>
      {showIcon && <Icon size={13} strokeWidth={2} aria-hidden />}
      {up ? "+" : ""}
      {c.toFixed(2)}%
    </span>
  );
}

export function TickerTape() {
  const { indices, stocks } = useMarket();
  const items = [...indices, ...stocks];

  return (
    <div className="tape" aria-label="Illustrative market prices">
      <span className="tape__status">
        <span className="pulse" aria-hidden />
        Markets
      </span>
      <div className="tape__viewport">
        <div className="tape__track">
          {[0, 1].map((copy) =>
            items.map((q) => (
              <span className="tape__item" key={`${copy}-${q.sym}`} aria-hidden={copy === 1}>
                <span className="tape__sym">{q.sym}</span>
                <Tick q={q} />
                <Change q={q} />
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
