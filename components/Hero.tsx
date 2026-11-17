"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Video, ChartCandlestick, CalendarCheck } from "lucide-react";
import { ease } from "./Motion";
import { SButton } from "./SButton";
import { NiftyRocket } from "./NiftyRocket";
import { RocketAnchor } from "./StoryRocket";
import { useMarket } from "./MarketProvider";
import { useMode } from "./ModeProvider";
import { fmt, pct } from "@/lib/market";
import { img, srcset } from "@/lib/content";

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

/* What is on today, beside the card: the next session, the market and this month's challenge. */
function Today() {
  const { indices, live, open } = useMarket();
  const { setMode } = useMode();
  const nifty = indices[0];
  const c = pct(nifty);
  const tiles = [
    { icon: Video, label: "Next session", value: "6:30 am", line: "Live on Google Meet", href: "#classes", mode: "health" as const },
    {
      icon: ChartCandlestick,
      label: live ? (open ? "NIFTY 50, live" : "NIFTY 50, at close") : "NIFTY 50",
      value: fmt(nifty.price),
      line: `${c >= 0 ? "+" : ""}${c.toFixed(2)}% today`,
      href: "#markets",
      tone: c >= 0 ? "is-up" : "is-down",
      mono: true,
    },
    { icon: CalendarCheck, label: "December challenge", value: "Core and posture", line: "Starts 1 December", href: "#challenge" },
  ];
  return (
    <ul className="hero__tiles">
      {tiles.map((t) => {
        const Icon = t.icon;
        return (
          <li key={t.label}>
            <a href={t.href} className="htile" onClick={() => t.mode && setMode(t.mode)}>
              <span className="htile__top">
                <span className="htile__chip">
                  <Icon size={16} strokeWidth={1.8} aria-hidden />
                </span>
                {t.label}
                <ArrowUpRight className="htile__go" size={16} strokeWidth={1.8} aria-hidden />
              </span>
              <strong className={`htile__value${t.mono ? " is-mono" : ""}`}>{t.value}</strong>
              <span className={`htile__line ${t.tone ?? ""}`}>{t.line}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const mobile = useIsMobile();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const end = mobile ? MOBILE : DESKTOP;
  /*
    The photo is framed down to the card by four paper panels that slide in from the
    edges. Only the panels move; the photo is never scaled, so the browser never has to
    redraw it while scrolling. (Scaling the photo layer made it re-render at every size,
    which caught and flickered; a clip-path repainted the full-screen photo every frame.)
  */
  // How far the panels have closed in, 0 to 1, eased the same way the card appears.
  const closed = useTransform(p, (v) => {
    const t = Math.min(1, Math.max(0, (v - 0.22) / 0.4));
    return 1 - Math.pow(1 - t, 3);
  });
  const veilTop = useTransform(closed, (e) => `translateY(${(-(1 - e) * 100).toFixed(2)}%)`);
  const veilBottom = useTransform(closed, (e) => `translateY(${((1 - e) * 100).toFixed(2)}%)`);
  const veilLeft = useTransform(closed, (e) => `translateX(${(-(1 - e) * 100).toFixed(2)}%)`);
  const veilRight = useTransform(closed, (e) => `translateX(${((1 - e) * 100).toFixed(2)}%)`);
  const imgY = useTransform(p, [0, 1], reduce ? ["0%", "0%"] : ["0%", "10%"]);

  const introOpacity = useTransform(p, [0.05, 0.24], [1, 0]);
  const introY = useTransform(p, [0, 0.24], reduce ? [0, 0] : [0, -90]);

  /*
    The buttons stay in full view while the rocket rides the graph to the right. When it
    arrives (the ride ends at 0.17) they light up, and the next stretch of scroll carries
    them down and out as the photo frames down to the card.
  */
  const ctaOpacity = useTransform(p, [0.24, 0.34], [1, 0]);
  const ctaY = useTransform(p, [0.24, 0.34], reduce ? [0, 0] : [0, 140]);
  const [lit, setLit] = useState(false);
  useMotionValueEvent(p, "change", (v) => setLit(v >= 0.16 && v < 0.3));
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

        <motion.div className="hero__frame">
          <motion.div className="hero__frame-in">
          <motion.div className="hero__media" style={{ y: imgY }}>
            <motion.img
              src={img("1506905925346-21bda4d32df4")}
              srcSet={srcset(img("1506905925346-21bda4d32df4"))}
              sizes="100vw"
              decoding="async"
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

        {/* Paper panels that frame the photo down to the card. */}
        <div className="hero__veil" aria-hidden>
          <motion.span className="hero__veil-t" style={{ height: `${end[0]}%`, transform: veilTop }} />
          <motion.span className="hero__veil-b" style={{ height: `${end[2]}%`, transform: veilBottom }} />
          <motion.span className="hero__veil-l" style={{ width: `${end[3]}%`, transform: veilLeft }} />
          <motion.span className="hero__veil-r" style={{ width: `${end[1]}%`, transform: veilRight }} />
        </div>

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
        <div className="hero__intro">
          <motion.h1 className="hero__title" style={{ opacity: introOpacity, y: introY }}>
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
          </motion.h1>
          <motion.div className={`hero__cta-wrap${lit ? " is-lit" : ""}`} style={{ opacity: ctaOpacity, y: ctaY }}>
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
        </div>

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
          <Today />
        </motion.div>
      </div>
    </section>
  );
}
