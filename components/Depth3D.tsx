"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/*
  Depth for the photo panels: anything marked data-depth rises a little slower than the
  page as it comes up the screen and settles before it is read. Kept off the data panels
  (the terminal, the challenge board), which are read as they arrive.
  Scrubbed by ScrollTrigger, transform only, and switched off for reduced motion.
*/
export function Depth3D() {
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const els = gsap.utils.toArray<HTMLElement>("[data-depth]");
      els.forEach((el) => {
        gsap.fromTo(
          el,
          // A plain lift: no 3D tilt, which cost the browser a stall the first time it drew one.
          { y: 48 },
          {
            y: 0,
            ease: "none",
            // Flat well before the panel reaches reading height.
            scrollTrigger: { trigger: el, start: "top 100%", end: "top 75%", scrub: 0.4 },
          }
        );
      });
      // Parallax: anything with data-speed drifts against the scroll while its section passes.
      gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
        const d = Number(el.dataset.speed || 0.3) * 240;
        gsap.fromTo(
          el,
          { y: d },
          {
            y: -d,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });

      // Measure once fonts and images have settled.
      const t = window.setTimeout(() => ScrollTrigger.refresh(), 600);
      return () => window.clearTimeout(t);
    });
    return () => mm.revert();
  }, []);
  return null;
}
