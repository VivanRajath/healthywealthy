/*
  Market data. Live quotes come from /api/quotes (worker/index.js) and replace these
  starting values as soon as they load. The values below are only a fallback for local
  preview, where there is no Worker.
*/

export type Quote = {
  sym: string;
  name: string;
  price: number;
  prevClose: number;
  kind: "index" | "stock" | "etf";
  // Today's intraday closes, when live data has loaded.
  spark?: number[];
};

export type Candle = { o: number; h: number; l: number; c: number; v: number };

export type Timeframe = "1D" | "1W" | "1M" | "1Y" | "5Y";

export const timeframes: { id: Timeframe; vol: number; labels: [string, string, string] }[] = [
  { id: "1D", vol: 0.0016, labels: ["9:15", "12:20", "15:30"] },
  { id: "1W", vol: 0.004, labels: ["Mon", "Wed", "Fri"] },
  { id: "1M", vol: 0.008, labels: ["4 weeks ago", "2 weeks ago", "Today"] },
  { id: "1Y", vol: 0.017, labels: ["Nov 2025", "May 2026", "Nov 2026"] },
  { id: "5Y", vol: 0.038, labels: ["2021", "2023", "2026"] },
];

export const initialIndices: Quote[] = [
  { sym: "NIFTY 50", name: "Nifty 50", price: 25186.4, prevClose: 25144.3, kind: "index" },
  { sym: "SENSEX", name: "BSE Sensex", price: 81864.04, prevClose: 81592.45, kind: "index" },
  { sym: "BANK NIFTY", name: "Nifty Bank", price: 61364.4, prevClose: 61034.1, kind: "index" },
  { sym: "NIFTY IT", name: "Nifty IT", price: 31725.3, prevClose: 31931.15, kind: "index" },
];

export const initialStocks: Quote[] = [
  { sym: "RELIANCE", name: "Reliance Industries", price: 1336.7, prevClose: 1339.7, kind: "stock" },
  { sym: "HDFCBANK", name: "HDFC Bank", price: 811.95, prevClose: 804, kind: "stock" },
  { sym: "TCS", name: "Tata Consultancy Services", price: 2390.1, prevClose: 2407.5, kind: "stock" },
  { sym: "INFY", name: "Infosys", price: 1138.9, prevClose: 1141.5, kind: "stock" },
  { sym: "ICICIBANK", name: "ICICI Bank", price: 1581.8, prevClose: 1583.6, kind: "stock" },
  { sym: "TMPV", name: "Tata Motors Passenger Vehicles", price: 262.4, prevClose: 287.4, kind: "stock" },
  { sym: "ITC", name: "ITC", price: 292.95, prevClose: 285, kind: "stock" },
  { sym: "GOLDBEES", name: "Nippon India Gold ETF", price: 110.29, prevClose: 111.91, kind: "etf" },
];

/* Heat map tiles. `key` is the symbol the live feed uses for that sector index. */
export type Sector = { name: string; key: string; span: string; change: number };

export const initialSectors: Sector[] = [
  { name: "Banks", key: "BANK NIFTY", span: "a", change: 0.54 },
  { name: "IT", key: "NIFTY IT", span: "b", change: -0.64 },
  { name: "Energy", key: "ENERGY", span: "c", change: -0.8 },
  { name: "Auto", key: "AUTO", span: "d", change: -1.69 },
  { name: "FMCG", key: "FMCG", span: "e", change: 1.16 },
  { name: "Pharma", key: "PHARMA", span: "f", change: -1.79 },
  { name: "Metals", key: "METAL", span: "g", change: -1.73 },
  { name: "Realty", key: "REALTY", span: "h", change: -1.99 },
  { name: "Media", key: "MEDIA", span: "i", change: -0.31 },
];

/* Candles from the live feed. `t` is a Unix time in seconds. */
export type LiveCandle = Candle & { t: number };

const ist = (t: number, o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...o }).format(new Date(t * 1000));

/* Three axis labels (first, middle, last) for a live series. */
export function axisLabels(c: LiveCandle[], tf: Timeframe): [string, string, string] {
  const o: Intl.DateTimeFormatOptions =
    tf === "1D" ? { hour: "numeric", minute: "2-digit" }
    : tf === "1W" ? { weekday: "short" }
    : tf === "1M" ? { day: "numeric", month: "short" }
    : tf === "1Y" ? { month: "short", year: "numeric" }
    : { year: "numeric" };
  const at = (i: number) => ist(c[i].t, o);
  return [at(0), at(Math.floor(c.length / 2)), at(c.length - 1)];
}

/* Small deterministic PRNG so server and client render the same first frame. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function gauss(r: () => number) {
  const u = Math.max(r(), 1e-9);
  const v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/* Candle series that ends exactly at `last`. */
export function makeCandles(sym: string, tf: Timeframe, last: number, n = 64): Candle[] {
  const conf = timeframes.find((t) => t.id === tf)!;
  const r = rng(hash(sym + tf));
  const closes: number[] = [];
  let p = 1;
  for (let i = 0; i < n; i++) {
    p *= 1 + gauss(r) * conf.vol + conf.vol * 0.12;
    closes.push(p);
  }
  const k = last / closes[n - 1];
  const out: Candle[] = [];
  let prev = closes[0] * k * (1 - conf.vol);
  for (let i = 0; i < n; i++) {
    const c = closes[i] * k;
    const o = prev;
    const h = Math.max(o, c) * (1 + Math.abs(gauss(r)) * conf.vol * 0.6);
    const l = Math.min(o, c) * (1 - Math.abs(gauss(r)) * conf.vol * 0.6);
    out.push({ o, h, l, c, v: 0.35 + r() * 0.65 });
    prev = c;
  }
  return out;
}

export const fmt = (v: number, d = 2) =>
  new Intl.NumberFormat("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);

export const pct = (q: Quote) => ((q.price - q.prevClose) / q.prevClose) * 100;
