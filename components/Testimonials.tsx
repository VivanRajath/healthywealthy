"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Reveal, ease, ParallaxImage } from "./Motion";
import { img } from "@/lib/content";
import { RocketAnchor } from "./StoryRocket";

/*
  Placeholder testimonials for the design. Replace with real member quotes,
  collected with written consent, before launch. Avoid quotes about returns.
*/
const quotes = [
  {
    text: "I have tried every fitness app there is. What finally worked was a real person on Google Meet at 6:30 every morning, and forty other people showing up with me.",
    name: "Priya S.",
    meta: "Member for 8 months, Pune",
    tag: "Health",
    image: img("1506126613408-eca07ce68773", 900),
  },
  {
    text: "The 30 day challenge got me. I did not want to break the streak, and by day twenty I did not need the leaderboard to get out of bed.",
    name: "Vikram T.",
    meta: "Member for 4 months, Bengaluru",
    tag: "Challenge",
    image: img("1571019613454-1cb2f99b2d8b", 900),
  },
  {
    text: "What I liked was that my money stayed in my own account. I can see every trade, and I know I can stop it by changing my password.",
    name: "Nisha K.",
    meta: "Member for 6 months, Mumbai",
    tag: "Wealth",
    image: img("1559526324-4b87b5e36e44", 900),
  },
  {
    text: "My parents and I join the same session from two different cities. It has become the one thing we do together every day.",
    name: "Aditya and family",
    meta: "Members for 1 year, Delhi and Lucknow",
    tag: "Community",
    image: img("1545205597-3d9d02c29597", 900),
  },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = (d: number) => setI((v) => (v + d + quotes.length) % quotes.length);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % quotes.length), 7000);
    return () => window.clearInterval(id);
  }, [paused]);

  const q = quotes[i];

  return (
    <section className="testi" id="stories" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <Reveal>
        <span className="marker" />
        <h2 className="h2">Members, in their words.</h2>
      </Reveal>

      <div className="testi__body">
        <div className="testi__media">
          <span className="corner corner--tl" />
          <span className="corner corner--br" />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={i}
              className="testi__img"
              initial={{ clipPath: "inset(0% 100% 0% 0%)" }}
              animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease }}
            >
              <ParallaxImage src={q.image} alt="" strength={8} />
            </motion.div>
          </AnimatePresence>
          <span className="testi__tag">{q.tag}</span>
        </div>

        <div className="testi__quote" aria-live="polite">
          <Quote className="testi__mark" size={40} strokeWidth={1.2} aria-hidden />
          <RocketAnchor id="stories" className="ra-stories" rotate={-16} />
          <AnimatePresence mode="wait" initial={false}>
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease }}
            >
              <blockquote>{q.text}</blockquote>
              <figcaption>
                <strong>{q.name}</strong>
                <span>{q.meta}</span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>

          <div className="testi__nav">
            <div className="testi__dots" role="tablist" aria-label="Choose a story">
              {quotes.map((_, d) => (
                <button key={d} role="tab" aria-selected={d === i} aria-label={`Story ${d + 1}`} className={d === i ? "is-active" : ""} onClick={() => setI(d)}>
                  <i>
                    <b style={{ animationPlayState: paused ? "paused" : "running" }} />
                  </i>
                </button>
              ))}
            </div>
            <div className="testi__arrows">
              <button aria-label="Previous story" onClick={() => go(-1)}>
                <ChevronLeft size={18} />
              </button>
              <button aria-label="Next story" onClick={() => go(1)}>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
