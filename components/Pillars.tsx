"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronRight } from "lucide-react";
import { useMode } from "./ModeProvider";
import { content } from "@/lib/content";

function spark(points: number[], w = 260, h = 110) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const step = w / (points.length - 1);
  const xy = points.map((p, i) => [i * step, h - ((p - min) / (max - min || 1)) * (h - 12) - 6]);
  const line = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return { line, area: `${line} L${w} ${h} L0 ${h} Z`, last: xy[xy.length - 1] };
}

export function Pillars() {
  const { mode } = useMode();
  const c = content[mode];
  const [active, setActive] = useState(0);

  useEffect(() => setActive(0), [mode]);

  const p = c.pillars[active];
  const s = spark(p.screen.points);

  return (
    <section className="section pillars">
      <div className="pillars__list">
        <h2 className="h2">{c.pillarsHeading}</h2>
        <p className="lead">{c.pillarsSub}</p>

        <ul className="plist" role="tablist" aria-orientation="vertical">
          {c.pillars.map((item, i) => {
            const Icon = item.icon;
            const on = i === active;
            return (
              <li key={item.title}>
                <button
                  role="tab"
                  aria-selected={on}
                  className={`plist__btn${on ? " is-active" : ""}`}
                  onClick={() => setActive(i)}
                >
                  <span className="plist__icon">
                    <Icon size={22} strokeWidth={1.8} aria-hidden />
                  </span>
                  <span className="plist__text">
                    <span className="plist__title">{item.title}</span>
                    <span className="plist__line">{item.line}</span>
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.span
                          className="plist__detail"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <span>{item.detail}</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                  <ChevronRight className="plist__chev" size={20} aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pillars__device">
        <div className="phone">
          <div className="phone__notch" />
          <AnimatePresence mode="wait">
            <motion.div
              key={`${mode}-${active}`}
              className="phone__screen"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <div className="phone__top">
                <span>{p.screen.title}</span>
                <Bell size={16} aria-hidden />
              </div>
              <div className="phone__metric">
                {p.screen.metric}
                <small>{p.screen.unit}</small>
              </div>
              <div className="phone__delta">{p.screen.delta}</div>

              <svg className="phone__chart" viewBox="0 0 260 110" aria-hidden>
                <defs>
                  <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={s.area} fill="url(#sparkFill)" />
                <motion.path
                  d={s.line}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
                <circle cx={s.last[0] - 2} cy={s.last[1]} r="5" fill="var(--accent)" />
              </svg>

              <dl className="phone__rows">
                {p.screen.rows.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="phone__btn">{p.screen.cta}</div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="pillars__halo" aria-hidden />
      </div>
    </section>
  );
}
