/*
  Live market data for the site.
  Everything except /api/* is served straight from the static build (see wrangler.jsonc).
  Quotes come from Yahoo Finance's public chart endpoint and are cached at the edge,
  so visitors never call Yahoo themselves and the page stays fast.
*/

// Site symbol -> Yahoo symbol. Only these are served, so the API cannot be used as an open proxy.
const SYMBOLS = {
  "NIFTY 50": "^NSEI",
  SENSEX: "^BSESN",
  "BANK NIFTY": "^NSEBANK",
  "NIFTY IT": "^CNXIT",
  RELIANCE: "RELIANCE.NS",
  HDFCBANK: "HDFCBANK.NS",
  TCS: "TCS.NS",
  INFY: "INFY.NS",
  ICICIBANK: "ICICIBANK.NS",
  TMPV: "TMPV.NS",
  ITC: "ITC.NS",
  GOLDBEES: "GOLDBEES.NS",
  // Sector indices for the heat map.
  ENERGY: "^CNXENERGY",
  AUTO: "^CNXAUTO",
  FMCG: "^CNXFMCG",
  PHARMA: "^CNXPHARMA",
  METAL: "^CNXMETAL",
  REALTY: "^CNXREALTY",
  MEDIA: "^CNXMEDIA",
};

const RANGES = {
  "1D": ["1d", "5m"],
  "1W": ["5d", "30m"],
  "1M": ["1mo", "1d"],
  "1Y": ["1y", "1wk"],
  "5Y": ["5y", "1mo"],
};

async function chart(yahoo, range, interval) {
  const path = `/v8/finance/chart/${encodeURIComponent(yahoo)}?range=${range}&interval=${interval}`;
  for (const host of ["query1", "query2"]) {
    const r = await fetch(`https://${host}.finance.yahoo.com${path}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; site-market-widget)", Accept: "application/json" },
    });
    if (r.ok) {
      const j = await r.json();
      const res = j && j.chart && j.chart.result && j.chart.result[0];
      if (res) return res;
    }
  }
  throw new Error("quote unavailable: " + yahoo);
}

const round = (v) => Math.round(v * 100) / 100;

function isOpen(meta) {
  const p = meta.currentTradingPeriod && meta.currentTradingPeriod.regular;
  const now = Date.now() / 1000;
  return !!p && now >= p.start && now < p.end && meta.regularMarketTime >= p.start;
}

async function quotes() {
  const entries = await Promise.all(
    Object.entries(SYMBOLS).map(async ([sym, y]) => {
      try {
        const res = await chart(y, "1d", "5m");
        const closes = ((res.indicators.quote[0] || {}).close || []).filter((v) => v != null);
        // About 40 points is plenty for a sparkline.
        const step = Math.max(1, Math.ceil(closes.length / 40));
        const spark = closes.filter((_, i) => i % step === 0 || i === closes.length - 1).map(round);
        const m = res.meta;
        return [sym, { price: m.regularMarketPrice, prevClose: m.chartPreviousClose ?? m.previousClose, spark, open: isOpen(m), time: m.regularMarketTime }];
      } catch {
        return [sym, null];
      }
    })
  );
  const list = Object.fromEntries(entries.filter(([, v]) => v));
  if (!Object.keys(list).length) throw new Error("no quotes");
  const nifty = list["NIFTY 50"];
  return { open: nifty ? nifty.open : false, time: nifty ? nifty.time : null, quotes: list };
}

async function candles(sym, tf) {
  const [range, interval] = RANGES[tf];
  const res = await chart(SYMBOLS[sym], range, interval);
  const q = res.indicators.quote[0] || {};
  const out = [];
  (res.timestamp || []).forEach((t, i) => {
    const o = q.open[i], h = q.high[i], l = q.low[i], c = q.close[i];
    if (o == null || h == null || l == null || c == null) return;
    out.push({ t, o: round(o), h: round(h), l: round(l), c: round(c), v: q.volume ? q.volume[i] || 0 : 0 });
  });
  return { open: isOpen(res.meta), candles: out };
}

const json = (body, maxAge, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${maxAge}` },
  });

async function api(url) {
  if (url.pathname === "/api/quotes") {
    const q = await quotes();
    return json(q, q.open ? 15 : 300);
  }
  if (url.pathname === "/api/chart") {
    const sym = url.searchParams.get("sym");
    const tf = url.searchParams.get("tf");
    if (!SYMBOLS[sym] || !RANGES[tf]) return json({ error: "unknown symbol or timeframe" }, 3600, 400);
    const c = await candles(sym, tf);
    return json(c, tf === "1D" && c.open ? 30 : tf === "1D" || tf === "1W" ? 300 : 3600);
  }
  return json({ error: "not found" }, 60, 404);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return env.ASSETS.fetch(request);

    // Edge cache: one Yahoo round trip serves every visitor for the cache lifetime.
    const cache = typeof caches !== "undefined" ? caches.default : null;
    const key = new Request(url.toString(), { method: "GET" });
    if (cache) {
      const hit = await cache.match(key);
      if (hit) return hit;
    }
    try {
      const res = await api(url);
      if (cache && res.status === 200) ctx.waitUntil(cache.put(key, res.clone()));
      return res;
    } catch (e) {
      return new Response(JSON.stringify({ error: "market data unavailable" }), {
        status: 502,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }
  },
};
