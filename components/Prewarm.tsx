"use client";

import { useEffect } from "react";

/*
  The first time a part of the page scrolls into view, the browser has to download and
  decode its photos, and scrolling stalls for a moment. Once the page is up and the
  visitor is idle, this loads and decodes the photos further down, one at a time,
  so they are ready before anyone scrolls to them.
*/
export function Prewarm() {
  useEffect(() => {
    let stop = false;
    const idle = (fn: () => void) => {
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(fn, { timeout: 1500 });
      else setTimeout(fn, 200);
    };

    const run = async () => {
      // Skip on slow or metered connections; there the browser's own lazy loading is kinder.
      const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
      if (conn?.saveData || /2g/.test(conn?.effectiveType || "")) return;
      const imgs = [...document.querySelectorAll<HTMLImageElement>("img")];
      for (const im of imgs) {
        if (stop) return;
        if (im.loading === "lazy") im.loading = "eager";
        await new Promise<void>((r) => idle(() => r()));
        try {
          await im.decode();
        } catch {
          // Not loaded yet or failed: the browser will handle it when it is reached.
        }
      }
    };

    const start = () => window.setTimeout(() => idle(run), 1500);
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      stop = true;
      window.removeEventListener("load", start);
    };
  }, []);
  return null;
}
