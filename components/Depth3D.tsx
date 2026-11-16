"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/*
  3D depth for the big panels: anything marked data-depth starts tilted back in
  perspective, lower and slightly smaller, and swings up flat as it scrolls into view.
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
          { rotateX: 22, y: 80, scale: 0.94, transformPerspective: 1400, transformOrigin: "50% 100%" },
          {
            rotateX: 0,
            y: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top 100%", end: "top 45%", scrub: 0.6 },
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
