"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Star, Info, ShieldCheck, ChartCandlestick, Link2, Wallet, KeyRound, Percent } from "lucide-react";
import { useMarket } from "./MarketProvider";
import { Tick, Change } from "./TickerTape";
import { Reveal } from "./Motion";
import { SButton } from "./SButton";
import { riskLine } from "@/lib/content";
import { fmt, makeCandles, axisLabels, timeframes, initialStocks, initialIndices, type Timeframe, type Quote, type Candle, type LiveCandle } from "@/lib/market";

/* History is anchored to the opening quote so live ticks continue it smoothly. */
const anchor = (q: Quote) => [...initialStocks, ...initialIndices].find((x) => x.sym === q.sym)?.price ?? q.price;

/* ---------- Mini sparkline ---------- */
function Spark({ q, w = 96, h = 30, stretch = false }: { q: Quote; w?: number; h?: number; stretch?: boolean }) {
  // Today's real intraday line when live data has loaded, a generated one otherwise.
  const sim = useMemo(() => makeCandles(q.sym, "1D", anchor(q), 32).map((c) => c.c), [q.sym]); // eslint-disable-line react-hooks/exhaustive-deps
  const pts = q.spark && q.spark.length > 2 ? q.spark : sim;
  const all = [...pts, q.price];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const d = all
    .map((v, i) => `${i ? "L" : "M"}${((i / (all.length - 1)) * w).toFixed(1)} ${(h - ((v - min) / (max - min || 1)) * (h - 4) - 2).toFixed(1)}`)
    .join(" ");
  return (
    <svg
      className={`spark ${q.price >= q.prevClose ? "is-up" : "is-down"}`}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio={stretch ? "none" : undefined}
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

/* ---------- Candlestick chart ---------- */
const W = 800;
const PH = 300;
const VH = 70;

function useNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(max-width: 640px)");
    const on = () => setNarrow(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return narrow;
}

/* Real candles from /api/chart, kept per symbol and timeframe. Null until loaded or if unavailable. */
const chartCache = new Map<string, LiveCandle[]>();

function useLiveCandles(sym: string, tf: Timeframe) {
  const key = `${sym}|${tf}`;
  const [data, setData] = useState<{ key: string; c: LiveCandle[] } | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch(`/api/chart?sym=${encodeURIComponent(sym)}&tf=${tf}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((j: { candles: LiveCandle[] }) => {
          if (!alive || !j.candles || j.candles.length < 2) return;
          chartCache.set(key, j.candles);
          setData({ key, c: j.candles });
        })
        .catch(() => {});
    };
    const hit = chartCache.get(key);
    if (hit) setData({ key, c: hit });
    load();
    // Keep the intraday chart fresh while it is on screen.
    const id = tf === "1D" ? window.setInterval(() => !document.hidden && load(), 60000) : 0;
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [key, sym, tf]);
  return data && data.key === key ? data.c : null;
}

function CandleChart({ q, tf }: { q: Quote; tf: Timeframe }) {
  // A phone gets fewer, wider candles so each one is still readable.
  const narrow = useNarrow();
  const live = useLiveCandles(q.sym, tf);
  const base = useMemo<Candle[]>(() => {
    if (!live) return makeCandles(q.sym, tf, anchor(q), narrow ? 34 : 64);
    const n = narrow ? 34 : 64;
    // Show the most recent candles, and scale volume to the busiest one (indices report none).
    const c = live.slice(-n);
    const top = Math.max(...c.map((x) => x.v));
    return c.map((x) => ({ ...x, v: top ? 0.12 + (x.v / top) * 0.88 : 0 }));
  }, [live, q.sym, tf, narrow]); // eslint-disable-line react-hooks/exhaustive-deps
  // Last candle follows the live price.
  const candles = useMemo(() => {
    const out = base.slice();
    const last = { ...out[out.length - 1] };
    last.c = q.price;
    last.h = Math.max(last.h, q.price);
    last.l = Math.min(last.l, q.price);
    out[out.length - 1] = last;
    return out;
  }, [base, q.price]);

  const [hover, setHover] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const hi = Math.max(...candles.map((c) => c.h));
  const lo = Math.min(...candles.map((c) => c.l));
  const pad = (hi - lo) * 0.08;
  const top = hi + pad;
  const bot = lo - pad;
  const y = (v: number) => ((top - v) / (top - bot)) * PH;
  const cw = W / candles.length;

  const ma = candles.map((_, i) => {
    const s = candles.slice(Math.max(0, i - 9), i + 1);
    return s.reduce((a, c) => a + c.c, 0) / s.length;
  });
  const maPath = ma.map((v, i) => `${i ? "L" : "M"}${(i * cw + cw / 2).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

  const idx = hover ?? candles.length - 1;
  const sel = candles[idx];
  const levels = [0.15, 0.4, 0.65, 0.9].map((t) => top - (top - bot) * t);
  const labels = live ? axisLabels(live.slice(-(narrow ? 34 : 64)), tf) : timeframes.find((t) => t.id === tf)!.labels;

  return (
    <div className="cchart">
      <div className="cchart__ohlc">
        {(["o", "h", "l", "c"] as const).map((k) => (
          <span key={k}>
            <em>{k.toUpperCase()}</em>
            {fmt(sel[k])}
          </span>
        ))}
        <span className="cchart__ma">
          <i />
          MA 10
        </span>
      </div>

      <div
        className="cchart__plot"
        ref={ref}
        onPointerMove={(e) => {
          const r = ref.current!.getBoundingClientRect();
          const i = Math.floor(((e.clientX - r.left) / r.width) * candles.length);
          setHover(Math.min(candles.length - 1, Math.max(0, i)));
        }}
        onPointerLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${PH + VH}`} preserveAspectRatio="none" role="img" aria-label={`${q.sym} ${tf} price chart`}>
          {levels.map((l) => (
            <line key={l} x1="0" x2={W} y1={y(l)} y2={y(l)} className="cchart__grid" />
          ))}
          {candles.map((c, i) => {
            const up = c.c >= c.o;
            const x = i * cw + cw / 2;
            const bodyTop = y(Math.max(c.o, c.c));
            const bodyH = Math.max(1, Math.abs(y(c.o) - y(c.c)));
            return (
              <g key={i} className={up ? "cnd is-up" : "cnd is-down"} opacity={hover !== null && hover !== i ? 0.55 : 1}>
                <line x1={x} x2={x} y1={y(c.h)} y2={y(c.l)} />
                <rect x={x - cw * 0.32} width={cw * 0.64} y={bodyTop} height={bodyH} />
                <rect className="vol" x={x - cw * 0.32} width={cw * 0.64} y={PH + VH - c.v * (VH - 8)} height={c.v * (VH - 8)} />
              </g>
            );
          })}
          <path d={maPath} className="cchart__ma-line" />
          <line x1="0" x2={W} y1={y(q.price)} y2={y(q.price)} className="cchart__last" />
          {hover !== null && (
            <>
              <line x1={hover * cw + cw / 2} x2={hover * cw + cw / 2} y1="0" y2={PH + VH} className="cchart__cross" />
              <line x1="0" x2={W} y1={y(sel.c)} y2={y(sel.c)} className="cchart__cross" />
            </>
          )}
        </svg>

        <div className="cchart__axis-y" aria-hidden>
          {levels.map((l) => (
            <span key={l} style={{ top: `${(y(l) / (PH + VH)) * 100}%` }}>
              {fmt(l)}
            </span>
          ))}
          <span className={`cchart__last-tag ${q.price >= q.prevClose ? "is-up" : "is-down"}`} style={{ top: `${(y(q.price) / (PH + VH)) * 100}%` }}>
            {fmt(q.price)}
          </span>
        </div>
      </div>

      <div className="cchart__axis-x" aria-hidden>
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

/* ---------- Copy-trading panel ---------- */
const masterTrades = [
  { time: "09:42", side: "Buy", sym: "RELIANCE" },
  { time: "10:18", side: "Buy", sym: "ICICIBANK" },
  { time: "11:05", side: "Sell", sym: "TCS" },
  { time: "13:27", side: "Buy", sym: "GOLDBEES" },
  { time: "14:51", side: "Sell", sym: "INFY" },
];

function CopyPanel() {
  const [on, setOn] = useState(true);
  return (
    <div className="copy">
      <div className="copy__status">
        <span className={`copy__state${on ? " is-on" : ""}`}>
          <span className="pulse" aria-hidden />
          {on ? "Copying the master account" : "Copying paused"}
        </span>
        <button
          className={`toggle${on ? " is-on" : ""}`}
          role="switch"
          aria-checked={on}
          aria-label="Copy trades from the master account"
          onClick={() => setOn((v) => !v)}
        >
          <i />
        </button>
      </div>

      <dl className="copy__facts">
        <div>
          <dt>
            <Link2 size={14} aria-hidden />
            Linked account
          </dt>
          <dd>Your broker, ending 4821</dd>
        </div>
        <div>
          <dt>
            <Wallet size={14} aria-hidden />
            Withdrawals
          </dt>
          <dd>Any time, from your account</dd>
        </div>
        <div>
          <dt>
            <KeyRound size={14} aria-hidden />
            Password change
          </dt>
          <dd>Stops copying instantly</dd>
        </div>
        <div>
          <dt>
            <Percent size={14} aria-hidden />
            Fees
          </dt>
          <dd>50% of profit, nothing else</dd>
        </div>
      </dl>

      <div className="copy__feed">
        <span className="ticket__label">Today in the master account</span>
        <ul>
          {masterTrades.map((t) => (
            <li key={t.time}>
              <span className="copy__time">{t.time}</span>
              <span className={`copy__side ${t.side === "Buy" ? "is-buy" : "is-sell"}`}>{t.side}</span>
              <span className="copy__sym">{t.sym}</span>
              <span className="copy__mirrored">{on ? "Mirrored" : "Skipped"}</span>
            </li>
          ))}
        </ul>
      </div>

      <SButton href="#enquiry" variant="light" className="copy__cta">
        Link your account
      </SButton>
    </div>
  );
}

/* ---------- Section ---------- */
export function Markets() {
  const { indices, stocks, sectors, live, open } = useMarket();
  const [sym, setSym] = useState("RELIANCE");
  const [tf, setTf] = useState<Timeframe>("1D");
  const [watch, setWatch] = useState<string[]>(["RELIANCE", "GOLDBEES"]);
  const q = stocks.find((s) => s.sym === sym)!;

  return (
    <section className="markets" id="markets">
      <span className="ghost" data-speed="0.35" aria-hidden>
        {"NSE"}
      </span>
      <div className="markets__head">
        <Reveal>
          <span className="marker" />
          <h2 className="h2">Watch the master account, trade by trade.</h2>
        </Reveal>
        <Reveal delay={0.1} className="markets__intro">
          <p className="lead">Live NSE and BSE prices, right here.</p>
          <span className={`status${live && !open ? " is-closed" : ""}`}>
            <span className="pulse" aria-hidden />
            {!live ? "Connecting to NSE and BSE" : open ? "Market open, closes 3:30 pm" : "Market closed, last prices"}
          </span>
        </Reveal>
      </div>

      <div className="indices">
        {indices.map((ix) => (
          <div key={ix.sym} className="indices__item">
            <span className="indices__name">{ix.sym}</span>
            <span className="indices__row">
              <Tick q={ix} className="indices__value" />
              <Change q={ix} />
            </span>
            <span className="indices__abs">
              {ix.price >= ix.prevClose ? "+" : ""}
              {fmt(ix.price - ix.prevClose)} today
            </span>
            <Spark q={ix} w={140} h={36} stretch />
          </div>
        ))}
      </div>

      <div className="terminal" data-depth>
        <span className="corner corner--tl" />
        <span className="corner corner--tr" />
        <span className="corner corner--bl" />
        <span className="corner corner--br" />

        <div className="terminal__chart">
          <div className="terminal__bar">
            <div className="terminal__title">
              <ChartCandlestick size={18} strokeWidth={1.6} aria-hidden />
              <span>
                <strong>{q.sym}</strong>
                <small>{q.name}, NSE</small>
              </span>
            </div>
            <div className="terminal__quote">
              <Tick q={q} className="terminal__ltp" />
              <Change q={q} />
            </div>
            <div className="tf" role="tablist" aria-label="Timeframe">
              {timeframes.map((t) => (
                <button key={t.id} role="tab" aria-selected={tf === t.id} className={tf === t.id ? "is-active" : ""} onClick={() => setTf(t.id)}>
                  {t.id}
                </button>
              ))}
            </div>
          </div>
          <CandleChart q={q} tf={tf} />
        </div>

        <CopyPanel />

        <div className="watch">
          <div className="terminal__sub">
            <span>Watchlist</span>
            <span>LTP</span>
          </div>
          <ul>
            {stocks.map((s) => {
              const fav = watch.includes(s.sym);
              return (
                <li key={s.sym} className={s.sym === sym ? "is-active" : ""}>
                  <button className="watch__row" onClick={() => setSym(s.sym)}>
                    <span className="watch__sym">
                      <strong>{s.sym}</strong>
                      <small>{s.name}</small>
                    </span>
                    <Spark q={s} />
                    <span className="watch__px">
                      <Tick q={s} />
                      <Change q={s} showIcon={false} />
                    </span>
                  </button>
                  <button
                    className={`watch__fav${fav ? " is-on" : ""}`}
                    aria-label={fav ? `Remove ${s.sym} from favourites` : `Add ${s.sym} to favourites`}
                    aria-pressed={fav}
                    onClick={() => setWatch((w) => (fav ? w.filter((x) => x !== s.sym) : [...w, s.sym]))}
                  >
                    <Star size={15} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="heat">
          <div className="terminal__sub">
            <span>Sectors today</span>
            <span>NSE</span>
          </div>
          <div className="heat__grid">
            {sectors.map((s) => {
              const up = s.change >= 0;
              const strength = Math.min(1, Math.abs(s.change) / 3);
              return (
                <div
                  key={s.name}
                  className={`heat__cell heat__cell--${s.span} ${up ? "is-up" : "is-down"}`}
                  style={{ "--heat": `${Math.round(25 + strength * 60)}%` } as React.CSSProperties}
                >
                  <span>{s.name}</span>
                  <strong>
                    {up ? "+" : ""}
                    {s.change.toFixed(2)}%
                  </strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="markets__notes">
        <p>
          <ShieldCheck size={16} aria-hidden />
          Your funds stay in your own trading account.
        </p>
        <p>
          <Info size={16} aria-hidden />
          {live ? "Live prices from NSE and BSE, may be delayed." : "Sample prices shown while live data loads."} Master account trades shown are examples. {riskLine}
        </p>
      </div>
    </section>
  );
}

