"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, HeartPulse, Layers, CalendarCheck } from "lucide-react";
import { ease } from "./Motion";
import { SButton } from "./SButton";
import { NiftyRocket } from "./NiftyRocket";
import { RocketAnchor } from "./StoryRocket";
import { img } from "@/lib/content";

/* Final card position as insets of the viewport (top, right, bottom, left in %). */
const DESKTOP = [18, 34, 5, 34];
const MOBILE = [18, 6, 38, 6];

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(max-width: 900px)");
    const on = () => setM(q.matches);
    on();
    q.addEventListener("change", on);
    return () => q.removeEventListener("change", on);
  }, []);
  return m;
}

const tiles = [
  { icon: HeartPulse, title: "Free daily yoga on Google Meet" },
  { icon: Layers, title: "Copy-trading from a master account" },
  { icon: CalendarCheck, title: "30 day challenge and leaderboard" },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const end = mobile ? MOBILE : DESKTOP;
  const endRef = useRef(end);
  endRef.current = end;
  /*
    The photo shrinks into the card by scaling its frame and counter-scaling the content
    inside it. The GPU only moves and crops layers, so nothing is repainted while scrolling.
    (A clip-path here repainted the full-screen photo on every frame.)
  */
  const crop = (v: number) => {
    const t = Math.min(1, Math.max(0, (v - 0.22) / 0.4));
    const e = 1 - Math.pow(1 - t, 3);
    const [top, right, bottom, left] = endRef.current.map((n) => (n * e) / 100);
    return { top, left, sx: 1 - left - right, sy: 1 - top - bottom };
  };
  const frameT = useTransform(p, (v) => {
    const c = crop(v);
    return `translate(${c.left * 100}%, ${c.top * 100}%) scale(${c.sx}, ${c.sy})`;
  });
  const innerT = useTransform(p, (v) => {
    const c = crop(v);
    return `scale(${1 / c.sx}, ${1 / c.sy}) translate(${-c.left * 100}%, ${-c.top * 100}%)`;
  });
  const imgY = useTransform(p, [0, 1], reduce ? ["0%", "0%"] : ["0%", "10%"]);
  const imgScale = useTransform(p, [0, 0.62], reduce ? [1, 1] : [1.04, 1.18]);

  const introOpacity = useTransform(p, [0.05, 0.24], [1, 0]);
  const introY = useTransform(p, [0, 0.24], reduce ? [0, 0] : [0, -90]);
  const ride = useTransform(p, [0, 0.17], [0, 1]);
  const exit = useTransform(p, [0, 1], [0, 0]);

  // The story rocket rides the graph first, then docks on the card once the photo has shrunk.
  const range = () => {
    const el = ref.current;
    return el ? { top: el.offsetTop, span: el.offsetHeight - window.innerHeight } : { top: 0, span: 1 };
  };
  const graphHold = (): [number, number] => {
    const r = range();
    return [-1e9, r.top + r.span * 0.17];
  };
  const cardHold = (): [number, number] => {
    const r = range();
    return [r.top + r.span * 0.64, r.top + r.span];
  };
  const graphOpacity = useTransform(p, [0.22, 0.32], [1, 0]);
  const scrim = useTransform(p, [0.3, 0.62], [0, 1]);
  const after = useTransform(p, [0.58, 0.74], [0, 1]);
  const afterY = useTransform(p, [0.58, 0.74], reduce ? [0, 0] : [40, 0]);
  const chart = useTransform(p, [0.64, 0.9], [0, 1]);

  return (
    <section className="hero" ref={ref} id="top" data-nav-dark="0.22">
      <div className="hero__sticky">
        <div className="blueprint" aria-hidden>
          <span className="blueprint__h" style={{ top: `${end[0]}%` }} />
          <span className="blueprint__h" style={{ bottom: `${end[2]}%` }} />
          <span className="blueprint__v" style={{ left: `${end[3]}%` }} />
          <span className="blueprint__v" style={{ right: `${end[1]}%` }} />
        </div>

        <motion.div className="hero__frame" style={{ transform: frameT }}>
          <motion.div className="hero__frame-in" style={{ transform: innerT }}>
          <motion.div className="hero__media" style={{ y: imgY, scale: imgScale }}>
            <motion.img
              src={img("1506905925346-21bda4d32df4")}
              alt="Mountain peaks rising above a sea of clouds at dawn"
              initial={reduce ? false : { opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.8, ease }}
            />
          </motion.div>
          <div className="hero__shade" />
          <motion.div className="hero__tint" style={{ opacity: scrim }} />
          <motion.div className="hero__graph" style={{ opacity: graphOpacity }}>
            <NiftyRocket progress={ride} exit={exit} hold={graphHold} />
          </motion.div>
          </motion.div>
        </motion.div>

        {/* Data card that the photo becomes */}
        <motion.div
          className="hero__card"
          style={{ opacity: after, top: `${end[0]}%`, right: `${end[1]}%`, bottom: `${end[2]}%`, left: `${end[3]}%` }}
        >
          <span className="corner corner--tl" />
          <RocketAnchor id="hero-card" className="ra-card" rotate={38} hold={cardHold} />
          <div className="hero__card-row">
            <span>Joined today's session</span>
            <strong>1,240</strong>
          </div>
          <div className="hero__card-row">
            <span>Longest streak</span>
            <strong>212 days</strong>
          </div>
          <svg className="hero__chart" viewBox="0 0 300 160" preserveAspectRatio="none" aria-hidden>
            {Array.from({ length: 16 }).map((_, i) => (
              <line key={i} x1={i * 20} x2={i * 20} y1="0" y2="160" className="hero__chart-grid" />
            ))}
            <motion.path
              d="M0 150 C 40 150, 50 140, 80 128 S 150 96, 190 74 S 260 30, 300 14"
              className="hero__chart-line"
              style={{ pathLength: chart }}
            />
          </svg>
          <SButton href="#challenge" variant="glass" className="hero__card-btn">
            Join the challenge
          </SButton>
        </motion.div>

        {/* Intro copy over the full photo */}
        <motion.div className="hero__intro" style={{ opacity: introOpacity, y: introY }}>
          <h1 className="hero__title">
            {["1% better,", "every day."].map((l, i) => (
              <span className="hero__mask" key={l}>
                <motion.span
                  className="hero__line"
                  initial={reduce ? false : { y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.1, delay: 0.4 + i * 0.12, ease }}
                >
                  {l}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.div
            className="hero__ctas"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease }}
          >
            <SButton href="#about" variant="light">
              Explore now
            </SButton>
            <SButton href="#enquiry" variant="glass" arrow={false}>
              Book now
            </SButton>
          </motion.div>
        </motion.div>

        <motion.div className="hero__bottom" style={{ opacity: introOpacity }}>
          <span aria-hidden />
          <p className="hero__desc">
            A little healthier and wealthier, every day.
          </p>
          <motion.a
            href="#challenge"
            className="news"
            initial={reduce ? false : { opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 1.3, ease }}
          >
            <span className="news__top">
              <span>December challenge</span>
              <span>Starts 1 Dec</span>
            </span>
            <span className="news__body">
              <span>Core and posture month.</span>
              <span className="news__arrow">
                <ArrowRight size={18} strokeWidth={1.8} />
              </span>
            </span>
          </motion.a>
        </motion.div>

        {/* What surrounds the card once it settles */}
        <motion.div className="hero__after" style={{ opacity: after, y: afterY }}>
          <div className="hero__after-left">
            <span className="marker" />
            <h2 className="hero__after-title">Small gains, added daily</h2>
            <p className="hero__after-text">Free live sessions for your body. Copy-trading for your money.</p>
          </div>
          <ul className="hero__tiles">
            {tiles.map((t) => {
              const Icon = t.icon;
              return (
                <li key={t.title} className="htile">
                  <span className="htile__chip">
                    <Icon size={14} strokeWidth={2} aria-hidden />
                  </span>
                  <span className="htile__title">{t.title}</span>
                  <Icon className="htile__art" size={120} strokeWidth={0.6} aria-hidden />
                </li>
              );
            })}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
