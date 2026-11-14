"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Target, Video, Copy, KeyRound, Flame, Users, Check } from "lucide-react";
import { PARTS, OFFSETS, CENTERS, EXPLODED_BOX, type Part } from "./Rocket";
import { RocketAnchor, rocketActive } from "./StoryRocket";
import { SButton } from "./SButton";
import { ease } from "./Motion";
import { riskLine } from "@/lib/content";

const services: { part: Part; name: string; icon: typeof Target; title: string; text: string; points: string[]; risk?: boolean }[] = [
  {
    part: "nose",
    name: "Nose cone",
    icon: Target,
    title: "The 1% habit",
    text: "Everything here starts with one small promise: be 1% better today than you were yesterday. No overhauls, no crash plans.",
    points: ["One small step a day", "Progress you can feel", "Built to last for years"],
  },
  {
    part: "capsule",
    name: "Crew capsule",
    icon: Video,
    title: "Live morning sessions",
    text: "Yoga and exercise for 30 to 60 minutes on Google Meet at a fixed morning time. Free for every member.",
    points: ["Same link every morning", "Camera on or off", "Adjust your own routine"],
  },
  {
    part: "payload",
    name: "Payload",
    icon: Copy,
    title: "Copy-trading",
    text: "Link your own trading account to our master account. Every master trade is placed in your account automatically, sized to your balance.",
    points: ["Trades mirrored automatically", "See every trade as it happens", "50% profit share, no other fees"],
    risk: true,
  },
  {
    part: "tank",
    name: "Fuel tank",
    icon: KeyRound,
    title: "You stay in control",
    text: "Your money never leaves your own account. Withdraw whenever you like, and change your password to stop copying instantly.",
    points: ["Funds stay in your name", "Full withdrawal rights", "Password change disconnects"],
    risk: true,
  },
  {
    part: "fins",
    name: "Fins",
    icon: Flame,
    title: "The 30 day challenge",
    text: "Monthly themes, daily streaks and a consistency leaderboard keep you on course when motivation dips.",
    points: ["A new theme every month", "Streaks and rankings", "Monthly winners"],
  },
  {
    part: "engine",
    name: "Engine",
    icon: Users,
    title: "The community",
    text: "Hundreds of members showing up at the same time every morning. That shared energy is what keeps the whole thing moving.",
    points: ["Members across India", "Families joining together", "Encouragement every day"],
  },
];

const ASSEMBLE = 0.12;

function Label({ i, explode, active, onPick }: { i: number; explode: MotionValue<number>; active: number; onPick: (i: number) => void }) {
  const part = PARTS[i];
  const top = useTransform(explode, (e) => `${((CENTERS[part] + OFFSETS[part] * e - EXPLODED_BOX.y) / EXPLODED_BOX.h) * 100}%`);
  const opacity = useTransform(explode, [0.5, 1], [0, 1]);
  return (
    <motion.button
      className={`rlabel${i === active ? " is-active" : ""}`}
      style={{ top, opacity }}
      onClick={() => onPick(i)}
      aria-label={`Show ${services[i].title}`}
    >
      <span className="rlabel__num">{String(i + 1).padStart(2, "0")}</span>
      <span className="rlabel__name">{services[i].name}</span>
      <span className="rlabel__line" />
    </motion.button>
  );
}

export function RocketServices() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const explode = useTransform(p, [0, ASSEMBLE], [0, 1]);
  const lift = useTransform(p, [0, 1], reduce ? [0, 0] : [40, -40]);
  const tilt = useTransform(p, [0, 0.5, 1], reduce ? [0, 0, 0] : [-4, 0, 4]);
  const [active, setActive] = useState(0);

  useMotionValueEvent(p, "change", (v) => {
    const t = (v - ASSEMBLE) / (1 - ASSEMBLE);
    const i = Math.min(services.length - 1, Math.max(0, Math.floor(t * services.length)));
    setActive(i);
    rocketActive.set(v > 0.02 && v < 0.995 ? i : null);
  });

  // Clicking a label scrolls to that part's slot in the pinned section.
  const pick = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const span = el.offsetHeight - window.innerHeight;
    const at = ASSEMBLE + ((i + 0.5) / services.length) * (1 - ASSEMBLE);
    window.scrollTo({ top: el.offsetTop + span * at, behavior: "smooth" });
  };

  const servicesHold = (): [number, number] => {
    const el = ref.current;
    if (!el) return [0, 0];
    return [el.offsetTop, el.offsetTop + el.offsetHeight - window.innerHeight];
  };

  const s = services[active];
  const Icon = s.icon;

  return (
    <section className="rs" id="inside" ref={ref}>
      <div className="rs__sticky">
        <div className="rs__grid" aria-hidden>
          <span />
          <span />
        </div>

        <div className="rs__copy">
          <span className="marker" />
          <p className="rs__eyebrow">Inside the rocket</p>

          <ol className="rs__steps" aria-label="Rocket parts">
            {services.map((sv, i) => (
              <li key={sv.part} className={i === active ? "is-active" : i < active ? "is-done" : ""}>
                <button onClick={() => pick(i)}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {sv.title}
                </button>
              </li>
            ))}
          </ol>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              className="rs__panel"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease }}
            >
              <span className="rs__chip">
                <Icon size={16} strokeWidth={1.8} aria-hidden />
                Part {active + 1} of {services.length}, {s.name}
              </span>
              <h2 className="rs__title">{s.title}</h2>
              <p className="rs__text">{s.text}</p>
              <ul className="rs__points">
                {s.points.map((pt) => (
                  <li key={pt}>
                    <Check size={15} aria-hidden />
                    {pt}
                  </li>
                ))}
              </ul>
              {s.risk && <p className="rs__risk">{riskLine}</p>}
              {active === services.length - 1 && (
                <SButton href="#enquiry" variant="dark">
                  Board the rocket
                </SButton>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div className="rs__stage" style={{ y: lift, rotate: tilt }}>
          <RocketAnchor
            id="services"
            className="rs__rocket"
            hold={servicesHold}
            explode={() => explode.get()}
            rotate={() => tilt.get()}
          >
            {services.map((_, i) => (
              <Label key={i} i={i} explode={explode} active={active} onPick={pick} />
            ))}
          </RocketAnchor>
        </motion.div>
      </div>
    </section>
  );
}
