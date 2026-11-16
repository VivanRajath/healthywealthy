"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Footprints, Sprout, Sun, Mountain, TreeDeciduous } from "lucide-react";
import { Reveal } from "./Motion";

/*
  The 1% idea drawn without numbers: a curve that improves a little each step
  pulls away from one that stays flat and one that slips a little each step.
*/
const W = 1000;
const H = 460;
const N = 120;

function curve(rate: number) {
  const pts: [number, number][] = [];
  const lo = Math.pow(1 - 0.012, N);
  const hi = Math.pow(1.012, N);
  for (let i = 0; i <= N; i++) {
    const v = Math.pow(1 + rate, i);
    const t = (Math.log(v) - Math.log(lo)) / (Math.log(hi) - Math.log(lo));
    // Mix log and linear scales so the gap reads clearly without any axis.
    const lin = (v - lo) / (hi - lo);
    const y = H - 30 - (0.35 * t + 0.65 * lin) * (H - 80);
    pts.push([(i / N) * W, y]);
  }
  return pts;
}

const better = curve(0.012);
const flat = curve(0);
const worse = curve(-0.012);
const path = (p: [number, number][]) => p.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

const stages = [
  { at: 0.02, icon: Footprints, title: "Show up", text: "The first session feels like effort." },
  { at: 0.25, icon: Sprout, title: "A habit forms", text: "Mornings start to run themselves." },
  { at: 0.5, icon: Sun, title: "Energy builds", text: "Sleep, focus and mood begin to lift." },
  { at: 0.75, icon: Mountain, title: "Momentum", text: "Small gains start adding to each other." },
  { at: 0.98, icon: TreeDeciduous, title: "A different life", text: "The gap from where you began is hard to miss." },
];

function Stage({ s, progress }: { s: (typeof stages)[number]; progress: MotionValue<number> }) {
  const on = useTransform(progress, [s.at - 0.04, s.at + 0.02], [0, 1]);
  const y = useTransform(on, [0, 1], [16, 0]);
  const idx = Math.round(s.at * N);
  const [x, py] = better[Math.min(N, idx)];
  const Icon = s.icon;
  return (
    <motion.div className={`gstage${s.at > 0.9 ? " gstage--end" : s.at === 0.75 ? " gstage--below" : ""}`} style={{ left: `${(x / W) * 100}%`, top: `${(py / H) * 100}%`, opacity: on, y }}>
      <span className="gstage__dot">
        <Icon size={16} strokeWidth={1.8} aria-hidden />
      </span>
      <span className="gstage__copy">
        <strong>{s.title}</strong>
        <small>{s.text}</small>
      </span>
    </motion.div>
  );
}

export function Growth() {
  const ref = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // The scene is pinned. The line draws over most of the pin, then holds complete before it scrolls on.
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const draw = useTransform(scrollYProgress, [0.04, 0.78], reduce ? [1, 1] : [0, 1]);
  const [stage, setStage] = useState(0);
  useMotionValueEvent(draw, "change", (v) => {
    let i = 0;
    stages.forEach((s, k) => {
      if (v >= s.at - 0.02) i = k;
    });
    setStage(i);
  });
  const fill = useTransform(draw, [0.75, 1], [0, 1]);

  // Rocket at the head of the "better" line, nose along the slope.
  const area = useRef<HTMLDivElement>(null);
  const size = useRef({ w: 1100, h: 500 });
  useEffect(() => {
    const m = () => {
      if (area.current) size.current = { w: area.current.clientWidth, h: area.current.clientHeight };
    };
    m();
    window.addEventListener("resize", m);
    return () => window.removeEventListener("resize", m);
  }, []);
  const head = useTransform(draw, (v) => {
    const f = Math.max(0, Math.min(1, v)) * N;
    const i = Math.min(N - 1, Math.floor(f));
    const k = f - i;
    const [x0, y0] = better[i];
    const [x1, y1] = better[i + 1];
    const ang = (Math.atan2((y1 - y0) * (size.current.h / H), (x1 - x0) * (size.current.w / W)) * 180) / Math.PI + 90;
    return { x: x0 + (x1 - x0) * k, y: y0 + (y1 - y0) * k, ang };
  });
  const rLeft = useTransform(head, (h) => (h.x / W) * size.current.w);
  const rTop = useTransform(head, (h) => (h.y / H) * size.current.h);
  const revealOut = useTransform(draw, (v) => `${(Math.min(1, Math.max(0, v)) - 1) * 100}%`);
  const revealIn = useTransform(draw, (v) => `${(1 - Math.min(1, Math.max(0, v))) * 100}%`);
  const cur = stages[stage];
  const CurIcon = cur.icon;

  return (
    <section className="growth" id="growth">
      <div className="growth__track" ref={track}>
      <div className="growth__pin">
      <div className="growth__head">
        <Reveal>
          <span className="marker" />
          <h2 className="h2">Small steps, a very different place.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lead">
            Tiny daily gains look like nothing, then they add up.
          </p>
        </Reveal>
      </div>

      <div className="gchart" ref={ref}>
        <div className="gchart__area" ref={area}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="gFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => (
            <line key={g} x1={W * g} x2={W * g} y1="0" y2={H} className="gchart__grid" />
          ))}
        </svg>
        {/* The shaded area fades as its own layer, so the fade never repaints the chart. */}
        <motion.svg className="gfill" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ opacity: fill }} aria-hidden>
          <path d={`${path(better)} L${W} ${H} L0 ${H} Z`} fill="url(#gFill)" />
        </motion.svg>
        {/* Lines are painted once and revealed by a sliding window, so drawing never repaints the chart. */}
        <motion.div className="reveal" style={{ x: revealOut }}>
          <motion.div className="reveal__in" style={{ x: revealIn }}>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
              <path d={path(worse)} className="gline gline--worse" />
              <path d={path(flat)} className="gline gline--flat" />
              <path d={path(better)} className="gline gline--better" />
            </svg>
          </motion.div>
        </motion.div>

        {stages.map((s) => (
          <Stage key={s.title} s={s} progress={draw} />
        ))}
        <motion.span className="ghead" style={{ x: rLeft, y: rTop }} aria-hidden />
        </div>

        <div className="gchart__legend">
          <span className="is-better">
            <i />A little better every day
          </span>
          <span className="is-flat">
            <i />
            Staying the same
          </span>
          <span className="is-worse">
            <i />A little worse every day
          </span>
        </div>
      </div>

      {/* Phones show the milestone the line has reached, under the chart. */}
      <div className="gcaption" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stage}
            className="gcaption__inner"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <span className="gsteps__dot">
              <CurIcon size={15} strokeWidth={1.8} aria-hidden />
            </span>
            <span>
              <strong>{cur.title}</strong>
              <small>{cur.text}</small>
            </span>
          </motion.div>
        </AnimatePresence>
        <span className="gcaption__count">
          {stage + 1} of {stages.length}
        </span>
      </div>
      </div>
      </div>

      <div className="growth__pair">
        <div>
          <h3>In your body</h3>
          <p>Strength, mobility and calm, one session at a time.</p>
        </div>
        <div>
          <h3>In your money</h3>
          <p>Patience over any single day. Markets move both ways.</p>
        </div>
      </div>
    </section>
  );
}
