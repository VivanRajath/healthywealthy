"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

/* The story, chapter by chapter. Scrolling down makes the rocket climb, so Launch sits at the bottom. */
const chapters = [
  { id: "top", label: "Launch" },
  { id: "about", label: "Mission" },
  { id: "inside", label: "Inside the rocket" },
  { id: "plans", label: "Health and wealth" },
  { id: "challenge", label: "Training" },
  { id: "growth", label: "Trajectory" },
  { id: "markets", label: "Markets" },
  { id: "stories", label: "Crew" },
  { id: "faq", label: "Questions" },
  { id: "enquiry", label: "Orbit" },
];

export function FlightRail() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const fill = smooth;
  const [stops, setStops] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setStops(
        chapters.map((c) => {
          const el = document.getElementById(c.id);
          return el && max > 0 ? Math.min(1, el.offsetTop / max) : 0;
        })
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, []);

  useEffect(
    () =>
      scrollYProgress.on("change", (v) => {
        let i = 0;
        stops.forEach((s, k) => {
          if (v + 0.002 >= s) i = k;
        });
        setCurrent(i);
      }),
    [scrollYProgress, stops]
  );

  return (
    <nav className="rail" aria-label="Story chapters">
      <div className="rail__track">
        <motion.span className="rail__fill" style={{ scaleY: fill }} />
        {stops.map((s, i) => (
          <a
            key={chapters[i].id}
            href={`#${chapters[i].id}`}
            className={`rail__stop${i <= current ? " is-past" : ""}${i === current ? " is-current" : ""}`}
            style={{ top: `${(1 - s) * 100}%` }}
          >
            <span className="rail__label">{chapters[i].label}</span>
          </a>
        ))}
      </div>
      <span className="rail__now" aria-live="polite">
        {chapters[current].label}
      </span>
    </nav>
  );
}
