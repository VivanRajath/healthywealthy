"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { smooth } from "@/lib/smooth";

/*
  Momentum scrolling for the whole site (Lenis), driven by GSAP's ticker so
  ScrollTrigger and the scroll-linked scenes read the same position every frame.
  Off for people who ask for reduced motion.
*/
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, anchors: true, autoRaf: false });
    smooth.set(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      smooth.set(null);
    };
  }, []);
  return null;
}
