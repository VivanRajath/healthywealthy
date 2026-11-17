"use client";

import { useRef } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { ModeSwitch } from "./ModeSwitch";
import { useMode } from "./ModeProvider";
import { ease } from "./Motion";
import { Pillars } from "./Pillars";
import { ClassStrip } from "./ClassStrip";
import { RocketAnchor } from "./StoryRocket";
import { content, srcset } from "@/lib/content";

/*
  The rocket's last scene: it lifts off and hauls the Health and Wealth panel up
  the screen behind it, then leaves through the top and does not return.
  Everything moves by transform only.
*/
export function Tabs() {
  const { mode } = useMode();
  const c = content[mode];
  const reduce = useReducedMotion();

  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: track, offset: ["start start", "end end"] });

  /*
    The Health and Wealth panel hangs below the rocket on two cables, its top edge
    peeking up from the bottom of the screen. Lift-off hauls the panel up until it
    fills the screen; by then the rocket has gone out of the top.
    The rocket's dock sits inside the panel, so one transform moves all of it.
  */
  const haul = useTransform(p, [0.14, 0.64], reduce ? ["0vh", "0vh"] : ["86vh", "0vh"], {
    // Slow to leave the pad, then faster and faster, like a real launch.
    ease: (t) => t * t * (1.6 - 0.6 * t),
  });
  const shake = useTransform(p, [0.06, 0.09, 0.11, 0.13, 0.15], reduce ? [0, 0, 0, 0, 0] : [0, -2.5, 2.5, -1.5, 0]);
  const waiting = useTransform(p, [0.08, 0.22], [1, 0]);
  const cables = useTransform(p, [0.5, 0.6], [1, 0]);
  // Near the top the rocket lets go of the cables and shoots off on its own.
  const release = useTransform(p, [0.5, 0.66], reduce ? ["0vh", "0vh"] : ["0vh", "-90vh"], { ease: (t) => t * t });
  const revealCopy = useTransform(p, [0.62, 0.82], [0, 1]);
  const revealY = useTransform(p, [0.62, 0.82], reduce ? [0, 0] : [40, 0]);
  const photoScale = useTransform(p, [0.14, 0.8], reduce ? [1, 1] : [1.2, 1]);

  // The rocket holds this dock for the whole scene, then follows it off the top of the screen.
  const hold = (): [number, number] => {
    const el = track.current;
    if (!el) return [0, 0];
    const top = el.getBoundingClientRect().top + window.scrollY;
    return [top + (el.offsetHeight - window.innerHeight) * 0.04, top + el.offsetHeight - window.innerHeight];
  };

  return (
    <section className="tabs">
      <div className="launch" ref={track}>
        {/* Links to Health and Wealth land on the finished scene, not the launch pad. */}
        <span id="plans" className="launch__anchor" aria-hidden />
        <div className="launch__stage">
          {/* Behind the panel: what is coming next. */}
          <motion.div className="launch__wait" style={{ opacity: waiting }} aria-hidden>
            <span className="launch__next">Next stop</span>
            <span className="launch__word launch__word--l">Health</span>
            <span className="launch__word launch__word--r">Wealth</span>
          </motion.div>

          {/* The panel the rocket pulls up. Its dock rides on top of it. */}
          <motion.div className="haul" style={{ y: haul }}>
            <motion.div className="tow" style={{ opacity: cables }} aria-hidden>
              <svg viewBox="0 0 100 50" preserveAspectRatio="none">
                <line x1="20" y1="0" x2="2" y2="50" />
                <line x1="80" y1="0" x2="98" y2="50" />
              </svg>
              <span className="tow__tab">Health and Wealth</span>
            </motion.div>
            <motion.div className="ra-launch-wrap" style={{ x: shake, y: release }}>
              <RocketAnchor id="launch" className="ra-launch" hold={hold} flame />
            </motion.div>

            <div className="launch__reveal">
              <AnimatePresence initial={false}>
                <motion.div
                  key={mode}
                  className="launch__photo"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.img
                    src={c.image}
                    srcSet={srcset(c.image)}
                    sizes="100vw"
                    decoding="async"
                    alt={c.imageAlt}
                    style={{ scale: photoScale }}
                  />
                </motion.div>
              </AnimatePresence>
              <div className="launch__scrim" aria-hidden />
              <motion.div className="launch__copy" style={{ opacity: revealCopy, y: revealY }}>
                <span className="marker" />
                <h2 className="launch__title">Two sides, one daily habit.</h2>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease }}
                  >
                    <span className="banner__tag">{c.label}</span>
                    <p className="launch__lead">{c.bannerTitle}</p>
                    <p className="launch__text">{c.bannerText}</p>
                  </motion.div>
                </AnimatePresence>
                <ModeSwitch id="tabs" size="lg" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease }}
        >
          <Pillars />
          {mode === "health" && <ClassStrip />}
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
