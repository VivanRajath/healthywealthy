"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Video, Copy, Flame } from "lucide-react";
import { ParallaxImage, Reveal, SplitHeading, ease } from "./Motion";
import { SButton } from "./SButton";
import { RocketAnchor } from "./StoryRocket";
import { useMode } from "./ModeProvider";
import { img, type Mode } from "@/lib/content";

const services: { icon: typeof Video; title: string; text: string; href: string; mode?: Mode }[] = [
  { icon: Video, title: "Live sessions", text: "Free yoga and exercise on Google Meet, every morning.", href: "#classes", mode: "health" },
  { icon: Copy, title: "Copy-trading", text: "Master account trades copied into your own account.", href: "#markets" },
  { icon: Flame, title: "30 day challenge", text: "Daily streaks, a leaderboard and monthly winners.", href: "#challenge" },
];

const figures = [
  { to: 6, prefix: "", suffix: "", label: "live classes" },
  { to: 0, prefix: "₹", suffix: "", label: "joining fee" },
  { to: 50, prefix: "", suffix: "%", label: "profit share, nothing else" },
];

/* Number that counts up once when it comes into view. */
function Count({ to, prefix, suffix }: { to: number; prefix: string; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(0, to, { duration: 1.4, ease, onUpdate: (n) => setV(Math.round(n)) });
    return () => c.stop();
  }, [inView, reduce, to]);
  return (
    <span ref={ref}>
      {prefix}
      {v}
      {suffix}
    </span>
  );
}

/* Photo uncovered by a brand-coloured panel that slides away. Transform only. */
function Wipe({ src, alt, label, tone, delay, className }: { src: string; alt: string; label: string; tone: Mode; delay: number; className: string }) {
  const reduce = useReducedMotion();
  return (
    <figure className={`aframe aframe--${tone} ${className}`}>
      <ParallaxImage src={src} alt={alt} strength={10} className="aframe__img" />
      <motion.span
        className="aframe__cover"
        aria-hidden
        initial={reduce ? false : { scaleY: 1 }}
        whileInView={{ scaleY: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 1.1, delay, ease }}
      />
      <figcaption className="aframe__tag">{label}</figcaption>
    </figure>
  );
}

export function About() {
  const { setMode } = useMode();

  return (
    <section className="about2" id="about">
      <div className="about2__inner">
        <div className="about2__rule">
          <span className="marker" />
          <span className="about2__label">About us</span>
          <span className="about2__index">01</span>
        </div>

        <div className="about2__top">
          <div className="about2__copy">
            <RocketAnchor id="about" className="ra-about" rotate={18} />
            <SplitHeading text="One club for your body and your money." className="about2__title" />
            <Reveal delay={0.2}>
              <p className="about2__lead">Small daily steps, done together. Get a little fitter and grow your money, 1% at a time.</p>
            </Reveal>
            <Reveal delay={0.3}>
              <SButton href="#inside" variant="dark">
                See how it works
              </SButton>
            </Reveal>
          </div>

          <div className="about2__media">
            <Wipe
              className="aframe--a"
              src={img("1518611012118-696072aa579a", 1400)}
              alt="A group exercising together on mats in a bright studio"
              label="Health"
              tone="health"
              delay={0}
            />
            <Wipe
              className="aframe--b"
              src={img("1559526324-4b87b5e36e44", 1400)}
              alt="A laptop showing a trading dashboard on a desk"
              label="Wealth"
              tone="wealth"
              delay={0.15}
            />
          </div>
        </div>

        <ul className="about2__list">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal as="li" key={s.title} delay={i * 0.1}>
                <a href={s.href} className="aitem" onClick={() => s.mode && setMode(s.mode)}>
                  <span className="aitem__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="aitem__icon">
                    <Icon size={20} strokeWidth={1.7} aria-hidden />
                  </span>
                  <span className="aitem__title">{s.title}</span>
                  <span className="aitem__text">{s.text}</span>
                  <span className="aitem__go" aria-hidden>
                    <ArrowUpRight size={18} strokeWidth={1.8} />
                  </span>
                </a>
              </Reveal>
            );
          })}
        </ul>

        <dl className="about2__figures">
          {figures.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>
                <Count to={f.to} prefix={f.prefix} suffix={f.suffix} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
