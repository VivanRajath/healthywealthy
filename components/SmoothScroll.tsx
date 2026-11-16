"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { smooth } from "@/lib/smooth";
import { computeStops } from "@/lib/stops";

/*
  Momentum scrolling for the whole site (Lenis), driven by GSAP's ticker so
  ScrollTrigger and the scroll-linked scenes read the same position every frame.

  The hero scrolls freely and smoothly. After it, on a mouse wheel or trackpad, one
  gesture glides to the next stop (lib/stops.ts): the next section, the next rocket
  part, the next screen of a long section, or the whole lift-off. Touch screens keep
  their own natural scrolling.
  Everything here is off for people who ask for reduced motion.
*/
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let stops: number[] = [];
    let freeUntil = 0;
    const measure = () => {
      ({ stops, freeUntil } = computeStops());
    };

    let moving = false;
    let lastWheel = 0;
    // A gesture is a run of wheel events; a new one starts after a short silence.
    // Trackpads keep sending fading events after the fingers lift, so those are
    // swallowed while moving and until the wheel goes quiet.
    const QUIET = 220;

    const lenis: Lenis = new Lenis({
      // A lower lerp glides longer and softer after each wheel turn; slightly lighter wheel steps.
      lerp: 0.075,
      wheelMultiplier: 0.9,
      anchors: { duration: 1.2 },
      autoRaf: false,
      virtualScroll: ({ deltaY, event }) => {
        if (event.type !== "wheel") return true; // touch: natural scrolling
        const w = event as WheelEvent;
        if (w.ctrlKey) return true; // pinch zoom
        if (!stops.length) measure();
        const y = lenis.scroll;
        const dir = Math.sign(deltaY);

        // Inside the hero: ordinary smooth scrolling, in both directions.
        if (!moving && (y < freeUntil - 4 || (dir < 0 && y <= freeUntil + 4))) {
          lastWheel = performance.now();
          return true;
        }

        const now = performance.now();
        const fresh = now - lastWheel > QUIET;
        lastWheel = now;
        if (moving || !fresh || Math.abs(deltaY) < 2) return false;

        const next = dir > 0 ? stops.find((s) => s > y + 4) : [...stops].reverse().find((s) => s < y - 4);
        if (next === undefined) return false;

        moving = true;
        const dist = Math.abs(next - y);
        lenis.scrollTo(next, {
          // Starts at once and settles softly, the same glide Lenis uses for links.
          duration: Math.min(1.5, Math.max(1, 0.85 + dist / 3000)),
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          lock: true,
          onComplete: () => {
            moving = false;
          },
        });
        return false;
      },
    });
    smooth.set(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Stops depend on layout: measure after load, on resize and whenever ScrollTrigger re-measures.
    measure();
    const t = window.setTimeout(measure, 1200);
    let rt = 0;
    const onResize = () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(measure, 200);
    };
    window.addEventListener("resize", onResize);
    ScrollTrigger.addEventListener("refresh", measure);
    // Switching Health and Wealth changes the content height below the lift-off.
    const mo = new MutationObserver(() => window.setTimeout(measure, 700));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });

    return () => {
      window.clearTimeout(t);
      window.clearTimeout(rt);
      window.removeEventListener("resize", onResize);
      ScrollTrigger.removeEventListener("refresh", measure);
      mo.disconnect();
      gsap.ticker.remove(tick);
      lenis.destroy();
      smooth.set(null);
    };
  }, []);
  return null;
}
