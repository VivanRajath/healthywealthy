"use client";

import type Lenis from "lenis";

/*
  The page's smooth scroller, shared so dialogs can pause it and links can glide with it.
  Null when smooth scrolling is off (reduced motion) and the browser scrolls natively.
*/
let current: Lenis | null = null;

export const smooth = {
  set(l: Lenis | null) {
    current = l;
  },
  get() {
    return current;
  },
  stop() {
    current?.stop();
  },
  start() {
    current?.start();
  },
  // Glide to a y position or element, or jump natively when smooth scrolling is off.
  to(target: number | HTMLElement, offset = 0) {
    if (current) return current.scrollTo(target, { offset, duration: 1.2 });
    const y = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: y + offset, behavior: "smooth" });
  },
};
