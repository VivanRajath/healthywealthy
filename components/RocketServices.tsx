"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { Target, Video, Copy, KeyRound, Flame, Users, Check } from "lucide-react";
import { PARTS, OFFSETS, CENTERS, EXPLODED_BOX, type Part } from "./Rocket";
import { RocketAnchor, rocketActive } from "./StoryRocket";
import { SButton } from "./SButton";
import { SplitHeading } from "./Motion";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { smooth } from "@/lib/smooth";
import { riskLine } from "@/lib/content";

const services: { part: Part; name: string; icon: typeof Target; title: string; text: string; points: string[]; risk?: boolean }[] = [
  {
    part: "nose",
    name: "Nose cone",
    icon: Target,
    title: "The 1% habit",
    text: "Be 1% better than yesterday. No crash plans.",
    points: ["One small step a day", "Built to last"],
  },
  {
    part: "capsule",
    name: "Crew capsule",
    icon: Video,
    title: "Live morning sessions",
    text: "Free yoga and exercise on Google Meet, every morning.",
    points: ["30 to 60 minutes", "Same link every day"],
  },
  {
    part: "payload",
    name: "Payload",
    icon: Copy,
    title: "Copy-trading",
    text: "Link your account. Master trades copy into it automatically.",
    points: ["Sized to your balance", "50% profit share, no other fees"],
    risk: true,
  },
  {
    part: "tank",
    name: "Fuel tank",
    icon: KeyRound,
    title: "You stay in control",
    text: "Your money stays in your own account.",
    points: ["Withdraw any time", "Change password to stop"],
  },
  {
    part: "fins",
    name: "Fins",
    icon: Flame,
    title: "The 30 day challenge",
    text: "A monthly theme, daily streaks and a leaderboard.",
    points: ["Streaks and rankings", "Monthly winners"],
  },
  {
    part: "engine",
    name: "Engine",
    icon: Users,
    title: "The community",
    text: "Hundreds of members, every morning, together.",
    points: ["Members across India", "Families join together"],
  },
];


const num = (i: number) => String(i + 1).padStart(2, "0");

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
      <span className="rlabel__num">{num(i)}</span>
      <span className="rlabel__line" />
    </motion.button>
  );
}

/*
  Inside the rocket, laid out like a service index:
  left, a sticky index of the six parts; middle, the rocket on a sticky blueprint frame
  beside a ruler; right, one article per part that scrolls past normally. The article
  crossing the middle of the screen is the open one: its row in the index lights, its
  part lights on the rocket and the frame's caption changes.
*/
export function RocketServices() {
  const body = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // How far through the parts we are: opens the rocket at the start, closes it at the end.
  const p = useMotionValue(0);
  const explode = useTransform(p, [0, 0.08, 0.95, 1], [0, 1, 1, 0]);
  const fill = useTransform(p, (v) => v);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: body.current,
        start: "top 60%",
        end: "bottom bottom",
        onUpdate: (self) => p.set(self.progress),
        onRefresh: (self) => p.set(self.progress),
      });
      // Each article is the open one while it covers the middle of the screen.
      body.current!.querySelectorAll<HTMLElement>(".rpart").forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
    },
    { scope: body }
  );

  useMotionValueEvent(p, "change", (v) => {
    // Parts stop dimming as the rocket closes, so it leaves whole and fully lit.
    rocketActive.set(v > 0.04 && v < 0.95 ? active : null);
  });

  // A new open part lights on the rocket straight away, not only on the next scroll.
  useEffect(() => {
    const v = p.get();
    rocketActive.set(v > 0.04 && v < 0.95 ? active : null);
  }, [active, p]);

  const pick = (i: number) => {
    const el = body.current?.querySelectorAll<HTMLElement>(".rpart")[i];
    if (el) smooth.to(el, -window.innerHeight * 0.3);
  };

  // The rocket stays docked in the frame for the whole run of articles.
  const servicesHold = (): [number, number] => {
    const el = body.current;
    if (!el) return [0, 0];
    const top = el.getBoundingClientRect().top + window.scrollY;
    return [top - window.innerHeight * 0.4, top + el.offsetHeight - window.innerHeight];
  };

  return (
    <section className="rs" id="inside">
      <div className="rs__intro">
        <span className="rs__label">
          <span className="marker" />
          Inside the rocket
        </span>
        <SplitHeading text="Six parts, one daily habit." className="rs__heading" />
      </div>

      <div className="rs__body" ref={body}>
        {/* Sticky index of the parts. */}
        <aside className="rs__left">
          <nav className="rs__index" aria-label="Rocket parts">
            <span className="rs__group">The rocket</span>
            {services.map((sv, i) => (
              <button key={sv.part} className={i === active ? "is-active" : ""} onClick={() => pick(i)}>
                <span>{sv.name}</span>
                <span>{num(i)}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Sticky blueprint frame with the rocket, beside a ruler that fills as you go. */}
        <div className="rs__media">
          <span className="rs__ruler" aria-hidden>
            <motion.i style={{ scaleY: fill }} />
          </span>
          <div className="rs__frame">
            <span className="corner corner--tl" />
            <span className="corner corner--tr" />
            <span className="corner corner--bl" />
            <span className="corner corner--br" />
            <RocketAnchor id="services" className="rs__rocket" hold={servicesHold} explode={() => explode.get()}>
              {services.map((_, i) => (
                <Label key={i} i={i} explode={explode} active={active} onPick={pick} />
              ))}
            </RocketAnchor>
            <span className="rs__meta">
              <span>
                {num(active)} / {num(services.length - 1)}
              </span>
              {services[active].name}
            </span>
          </div>
        </div>

        {/* One article per part; these scroll normally. */}
        <div className="rs__content">
          {services.map((sv, i) => {
            const Icon = sv.icon;
            return (
              <article key={sv.part} className={`rpart${i === active ? " is-active" : ""}`} id={`part-${sv.part}`}>
                <div className="rpart__head">
                  <div>
                    <span className="rpart__num">{num(i)}</span>
                    <h3 className="rpart__title">{sv.title}</h3>
                    <p className="rpart__tag">{sv.name}</p>
                  </div>
                  <span className="rpart__icon" aria-hidden>
                    <Icon size={22} strokeWidth={1.5} />
                  </span>
                </div>
                <div className="rpart__body">
                  <p className="rpart__text">{sv.text}</p>
                  <ul className="rpart__points">
                    {sv.points.map((pt) => (
                      <li key={pt}>
                        <Check size={14} aria-hidden />
                        {pt}
                      </li>
                    ))}
                  </ul>
                  {sv.risk && <p className="rpart__risk">{riskLine}</p>}
                  {i === services.length - 1 && (
                    <SButton href="#enquiry" variant="dark">
                      Board the rocket
                    </SButton>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
