"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Footprints, Sprout, Sun, Mountain, TreeDeciduous } from "lucide-react";
import { Reveal } from "./Motion";
import { RocketAnchor } from "./StoryRocket";

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
    <motion.div className="gstage" style={{ left: `${(x / W) * 100}%`, top: `${(py / H) * 100}%`, opacity: on, y }}>
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
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const draw = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0, 1]);
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
  const rLeft = useTransform(head, (h) => `${(h.x / W) * 100}%`);
  const rTop = useTransform(head, (h) => `${(h.y / H) * 100}%`);
  const rRot = useTransform(head, (h) => h.ang);
  // Same window as the line drawing, so the rocket stays with the curve while it is drawn.
  const growthHold = (): [number, number] => {
    const el = ref.current;
    if (!el) return [0, 0];
    const top = el.getBoundingClientRect().top + window.scrollY;
    const vh = window.innerHeight;
    return [top - vh * 0.75, top + el.offsetHeight - vh * 0.6];
  };

  return (
    <section className="growth" id="growth">
      <div className="growth__head">
        <Reveal>
          <span className="marker" />
          <h2 className="h2">Small steps, a very different place.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lead">
            Getting a little better every day looks like nothing at first. Keep going and it pulls away from standing
            still, and further still from slipping a little each day.
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
          <motion.path d={`${path(better)} L${W} ${H} L0 ${H} Z`} fill="url(#gFill)" style={{ opacity: fill }} />
          <motion.path d={path(worse)} className="gline gline--worse" style={{ pathLength: draw }} />
          <motion.path d={path(flat)} className="gline gline--flat" style={{ pathLength: draw }} />
          <motion.path d={path(better)} className="gline gline--better" style={{ pathLength: draw }} />
        </svg>

        {stages.map((s) => (
          <Stage key={s.title} s={s} progress={draw} />
        ))}
        <RocketAnchor
          id="growth"
          className="grocket"
          style={{ left: rLeft, top: rTop, rotate: rRot }}
          rotate={() => rRot.get()}
          hold={growthHold}
          flame
        />
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

      <div className="growth__pair">
        <div>
          <h3>In your body</h3>
          <p>One morning session at a time builds strength, mobility and calm that compound into how you feel every day.</p>
        </div>
        <div>
          <h3>In your habits with money</h3>
          <p>Consistency and patience matter more than any single day. Markets move both ways, so we look at the long run.</p>
        </div>
      </div>
    </section>
  );
}
