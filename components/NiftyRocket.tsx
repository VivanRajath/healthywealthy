 "use client";

import { useEffect, useMemo, useRef } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { RocketAnchor } from "./StoryRocket";
import { rng, gauss, fmt } from "@/lib/market";

/* Graph in a 1000 x 600 box that stretches with the hero. */
const W = 1000;
const H = 600;
const START = 21480;
const END = 24318.4;

function buildPoints() {
  const r = rng(1729);
  const n = 64;
  const pts: [number, number][] = [];
  let noise = 0;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    noise = noise * 0.7 + gauss(r) * 9;
    // Rises faster towards the end, with small pullbacks along the way.
    const base = 560 - Math.pow(t, 1.35) * 420;
    pts.push([30 + t * 880, Math.min(585, base + noise)]);
  }
  return pts;
}

function lengths(pts: [number, number][]) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  return cum;
}

/* Point and heading at fraction t of the polyline. */
function at(pts: [number, number][], cum: number[], t: number) {
  const target = Math.max(0, Math.min(1, t)) * cum[cum.length - 1];
  let i = 1;
  while (i < cum.length - 1 && cum[i] < target) i++;
  const seg = cum[i] - cum[i - 1] || 1;
  const k = (target - cum[i - 1]) / seg;
  const [x0, y0] = pts[i - 1];
  const [x1, y1] = pts[i];
  return { x: x0 + (x1 - x0) * k, y: y0 + (y1 - y0) * k, dx: x1 - x0, dy: y1 - y0 };
}

const EXIT: [number, number] = [1080, -160];

export function NiftyRocket({
  progress,
  exit,
  hold,
}: {
  progress: MotionValue<number>;
  exit: MotionValue<number>;
  hold: () => [number, number];
}) {
  const reduce = useReducedMotion();
  const pts = useMemo(buildPoints, []);
  const cum = useMemo(() => lengths(pts), [pts]);
  const d = useMemo(() => pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" "), [pts]);
  const box = useRef({ w: 1440, h: 900 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const m = () => {
      if (ref.current) box.current = { w: ref.current.clientWidth, h: ref.current.clientHeight };
    };
    m();
    window.addEventListener("resize", m);
    return () => window.removeEventListener("resize", m);
  }, []);

  // A short draw on load, then scroll carries the rest of the line.
  const load = useMotionValue(reduce ? 1 : 0);
  useEffect(() => {
    if (reduce) return;
    const c = animate(load, 1, { duration: 2.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [load, reduce]);

  const g = useTransform([progress, load] as MotionValue<number>[], ([pv, lv]: number[]) => 0.14 * lv + 0.86 * Math.min(1, Math.max(0, pv)));
  // The drawn line sits in a window that slides open, so the line is painted once and only moved.
  const revealOut = useTransform(g, (v) => `${(v - 1) * 100}%`);
  const revealIn = useTransform(g, (v) => `${(1 - v) * 100}%`);

  const pos = useTransform([g, exit] as MotionValue<number>[], ([gv, ev]: number[]) => {
    const a = at(pts, cum, gv);
    const e = ev * ev;
    const x = a.x + (EXIT[0] - a.x) * e;
    const y = a.y + (EXIT[1] - a.y) * e;
    // Heading in screen pixels, so the nose follows the line at any aspect ratio.
    const sx = box.current.w / W;
    const sy = box.current.h / H;
    // Heading from a wider window of the line, so small wiggles do not spin the rocket.
    const back = at(pts, cum, gv - 0.06);
    const fwd = at(pts, cum, gv + 0.06);
    const lx = (fwd.x - back.x) * (1 - e) + (EXIT[0] - a.x) * e;
    const ly = (fwd.y - back.y) * (1 - e) + (EXIT[1] - a.y) * e;
    const hx = lx * sx;
    const hy = ly * sy;
    const ang = (Math.atan2(hy, hx) * 180) / Math.PI + 90;
    return { x, y, ang };
  });

  // Pixel transforms rather than left/top, so moving the rocket never triggers layout.
  const left = useTransform(pos, (p) => (p.x / W) * box.current.w);
  const top = useTransform(pos, (p) => (p.y / H) * box.current.h);
  const rotate = useTransform(pos, (p) => p.ang);
  const price = useTransform(g, (v) => fmt(START + (END - START) * Math.pow(v, 1.2)));
  const tagOpacity = useTransform(exit, [0, 0.4], [1, 0]);

  return (
    <div className="nifty" ref={ref} aria-hidden>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="niftyFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[150, 270, 390, 510].map((y) => (
          <line key={y} x1="0" x2={W} y1={y} y2={y} className="nifty__grid" />
        ))}
        <path d={d} className="nifty__ghost" />
      </svg>
      <motion.div className="reveal" style={{ x: revealOut }}>
        <motion.div className="reveal__in" style={{ x: revealIn }}>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            <path d={`${d} L${pts[pts.length - 1][0]} ${H} L${pts[0][0]} ${H} Z`} fill="url(#niftyFill)" />
            <path d={d} className="nifty__line" />
          </svg>
        </motion.div>
      </motion.div>

      <span className="nifty__label" style={{ left: `${(pts[0][0] / W) * 100}%`, top: `${(pts[0][1] / H) * 100}%` }}>
        NIFTY 50
      </span>

      <RocketAnchor id="hero-graph" className="nifty__rocket" style={{ x: left, y: top, rotate }} rotate={() => rotate.get()} hold={hold} flame />
      <motion.span className="nifty__price" style={{ x: left, y: top, opacity: tagOpacity }}>
        {price}
      </motion.span>
    </div>
  );
}
