/*
  Illustrative market data for the design preview.
  Prices are simulated in the browser and are not live quotes.
*/

export type Quote = {
  sym: string;
  name: string;
  price: number;
  prevClose: number;
  kind: "index" | "stock" | "etf";
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
  { sym: "NIFTY 50", name: "Nifty 50", price: 24318.4, prevClose: 24168.55, kind: "index" },
  { sym: "SENSEX", name: "BSE Sensex", price: 80112.95, prevClose: 79730.6, kind: "index" },
  { sym: "BANK NIFTY", name: "Nifty Bank", price: 52140.25, prevClose: 51902.1, kind: "index" },
  { sym: "NIFTY IT", name: "Nifty IT", price: 41882.6, prevClose: 42061.3, kind: "index" },
];

export const initialStocks: Quote[] = [
  { sym: "RELIANCE", name: "Reliance Industries", price: 2948.6, prevClose: 2921.15, kind: "stock" },
  { sym: "HDFCBANK", name: "HDFC Bank", price: 1684.2, prevClose: 1671.9, kind: "stock" },
  { sym: "TCS", name: "Tata Consultancy Services", price: 4112.35, prevClose: 4140.8, kind: "stock" },
  { sym: "INFY", name: "Infosys", price: 1872.9, prevClose: 1881.45, kind: "stock" },
  { sym: "ICICIBANK", name: "ICICI Bank", price: 1268.45, prevClose: 1252.3, kind: "stock" },
  { sym: "TATAMOTORS", name: "Tata Motors", price: 978.4, prevClose: 951.2, kind: "stock" },
  { sym: "ITC", name: "ITC", price: 486.15, prevClose: 487.9, kind: "stock" },
  { sym: "GOLDBEES", name: "Nippon India Gold ETF", price: 62.48, prevClose: 61.79, kind: "etf" },
];

export const sectors = [
  { name: "Banks", change: 1.24, span: "a" },
  { name: "IT", change: -0.62, span: "b" },
  { name: "Energy", change: 0.41, span: "c" },
  { name: "Auto", change: 2.08, span: "d" },
  { name: "FMCG", change: -0.31, span: "e" },
  { name: "Pharma", change: 0.88, span: "f" },
  { name: "Metals", change: -1.42, span: "g" },
  { name: "Realty", change: 2.76, span: "h" },
  { name: "Telecom", change: 0.18, span: "i" },
];

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
