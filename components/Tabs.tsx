"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ModeSwitch } from "./ModeSwitch";
import { useMode } from "./ModeProvider";
import { ParallaxImage, Reveal, ease } from "./Motion";
import { Pillars } from "./Pillars";
import { ShieldAlert } from "lucide-react";
import { content } from "@/lib/content";

export function Tabs() {
  const { mode } = useMode();
  const c = content[mode];

  return (
    <section className="tabs" id="plans">
      <div className="tabs__head">
        <Reveal>
          <span className="marker" />
          <h2 className="h2">Two sides, one daily habit.</h2>
        </Reveal>
        <Reveal delay={0.1} className="tabs__switch">
          <ModeSwitch id="tabs" size="lg" />
        </Reveal>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease }}
        >
          <div className="banner">
            <span className="corner corner--tl" />
            <span className="corner corner--tr" />
            <ParallaxImage src={c.image} alt={c.imageAlt} strength={16} className="banner__img" />
            <div className="banner__scrim" aria-hidden />
            <div className="banner__copy">
              <span className="banner__tag">{c.label}</span>
              <h3 className="banner__title">{c.bannerTitle}</h3>
              <p className="banner__text">{c.bannerText}</p>
            </div>
          </div>

          <Pillars />
          {c.note && (
            <p className="risk">
              <ShieldAlert size={18} strokeWidth={1.6} aria-hidden />
              {c.note}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
