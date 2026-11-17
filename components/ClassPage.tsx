"use client";

import { useCallback, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock, CalendarDays, MapPin, Gauge, Dumbbell, Users, Check, Info } from "lucide-react";
import { classes, getClass } from "@/lib/classes";
import { srcset } from "@/lib/content";
import { ParallaxImage, Reveal, SplitHeading, ease } from "./Motion";
import { BookModal } from "./BookModal";
import { useMode } from "./ModeProvider";

function BookButton({ onClick, variant = "light", label = "Book now" }: { onClick: () => void; variant?: "light" | "dark"; label?: string }) {
  return (
    <button className={`sbtn sbtn--${variant}`} onClick={onClick}>
      <span className="sbtn__label">{label}</span>
      <span className="sbtn__arrow" aria-hidden>
        <ArrowRight size={18} strokeWidth={1.8} />
      </span>
    </button>
  );
}

export function ClassPage({ slug }: { slug: string }) {
  const c = getClass(slug)!;
  const [open, setOpen] = useState(false);
  const book = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const reduce = useReducedMotion();
  const { setMode } = useMode();

  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const imgY = useTransform(p, [0, 1], reduce ? ["0%", "0%"] : ["0%", "24%"]);
  const imgScale = useTransform(p, [0, 1], reduce ? [1, 1] : [1.04, 1.16]);
  const copyY = useTransform(p, [0, 1], reduce ? [0, 0] : [0, -120]);
  const copyOpacity = useTransform(p, [0.1, 0.7], [1, 0]);

  const others = classes.filter((x) => x.slug !== c.slug);
  const when = `${c.facts.schedule}, ${c.facts.where}`;

  const facts = [
    { icon: Clock, label: "Duration", value: c.facts.duration },
    { icon: CalendarDays, label: "When", value: c.facts.schedule },
    { icon: MapPin, label: "Where", value: c.facts.where },
    { icon: Users, label: "Level", value: c.facts.level },
    { icon: Dumbbell, label: "You need", value: c.facts.equipment },
  ];

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="ch" ref={hero} data-nav-dark="0.8" id="top">
        <motion.div className="ch__media" style={{ y: imgY, scale: imgScale }}>
          <motion.img
            src={c.hero}
            srcSet={srcset(c.hero)}
            sizes="100vw"
            decoding="async"
            alt={c.heroAlt}
            initial={reduce ? false : { opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, ease }}
          />
        </motion.div>
        <div className="ch__shade" aria-hidden />

        <motion.div className="ch__copy" style={{ y: copyY, opacity: copyOpacity }}>
          <a href="/#classes" className="ch__back" onClick={() => setMode("health")}>
            <ArrowLeft size={16} aria-hidden />
            All classes
          </a>
          <h1 className="ch__title">
            <span className="hero__mask">
              <motion.span
                className="hero__line"
                initial={reduce ? false : { y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.1, delay: 0.2, ease }}
              >
                {c.name}
              </motion.span>
            </span>
          </h1>
          <motion.p
            className="ch__tagline"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease }}
          >
            {c.tagline}
          </motion.p>
          <motion.div
            className="ch__ctas"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease }}
          >
            <BookButton onClick={book} />
            <span className="ch__free">Free for members</span>
          </motion.div>
        </motion.div>

        <dl className="ch__facts">
          {facts.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label}>
                <dt>
                  <Icon size={15} aria-hidden />
                  {f.label}
                </dt>
                <dd>{f.value}</dd>
              </div>
            );
          })}
          <div>
            <dt>
              <Gauge size={15} aria-hidden />
              Intensity
            </dt>
            <dd>
              <span className="meter" aria-label={`Intensity ${c.facts.intensity} of 5`}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <i key={n} className={n <= c.facts.intensity ? "is-on" : ""} />
                ))}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      {/* ---------- About the class ---------- */}
      <section className="cabout">
        <div className="cabout__copy">
          <Reveal>
            <span className="marker" />
            <SplitHeading text={c.summary} className="cabout__lead" as="h2" />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="cabout__p">{c.about[0]}</p>
          </Reveal>
          <Reveal delay={0.25}>
            <BookButton onClick={book} variant="dark" label={`Book ${c.name}`} />
          </Reveal>
        </div>
        <div className="cabout__media">
          <ParallaxImage className="cabout__img cabout__img--a" src={c.gallery[0].src} alt={c.gallery[0].alt} strength={14} />
          <ParallaxImage className="cabout__img cabout__img--b" src={c.gallery[1].src} alt={c.gallery[1].alt} strength={10} />
        </div>
      </section>

      {/* ---------- A session, minute by minute ---------- */}
      <section className="cflow">
        <div className="cflow__head">
          <Reveal>
            <span className="marker" />
            <h2 className="h2">Inside a session.</h2>
          </Reveal>
        </div>
        <ol className="cflow__list">
          {c.flow.map((f, i) => (
            <Reveal as="li" key={f.title} delay={i * 0.08} className="cflow__step">
              <span className="cflow__num">{String(i + 1).padStart(2, "0")}</span>
              <span className="cflow__time">{f.minutes}</span>
              <h3>{f.title}</h3>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ---------- Benefits ---------- */}
      <section className="cben">
        <ParallaxImage className="cben__bg" src={c.gallery[2].src} alt="" strength={16} />
        <div className="cben__scrim" aria-hidden />
        <div className="cben__inner">
          <Reveal>
            <h2 className="cben__title">What it does for you.</h2>
          </Reveal>
          <ul className="cben__list">
            {c.benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <Reveal as="li" key={b.title} delay={i * 0.08} className="cben__item">
                  <span className="cben__icon">
                    <Icon size={20} strokeWidth={1.7} aria-hidden />
                  </span>
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------- Who it suits, and booking ---------- */}
      <section className="cfit">
        <div className="cfit__who">
          <Reveal>
            <span className="marker" />
            <h2 className="h2">Who it suits.</h2>
          </Reveal>
          <ul>
            {c.goodFor.map((g, i) => (
              <Reveal as="li" key={g} delay={i * 0.06}>
                <Check size={16} aria-hidden />
                {g}
              </Reveal>
            ))}
          </ul>
          {c.note && (
            <p className="cfit__note">
              <Info size={16} aria-hidden />
              {c.note}
            </p>
          )}
        </div>

        <Reveal className="cbook">
          <span className="corner corner--tl" />
          <span className="corner corner--br" />
          <span className="cbook__eyebrow">Next session</span>
          <h3 className="cbook__title">{c.name}</h3>
          <p className="cbook__when">
            <CalendarDays size={16} aria-hidden />
            {c.facts.schedule}
          </p>
          <p className="cbook__where">
            <MapPin size={16} aria-hidden />
            {c.facts.where}
          </p>
          <BookButton onClick={book} label="Book now" variant="light" />
        </Reveal>
      </section>

      {/* ---------- More classes ---------- */}
      <section className="cmore">
        <Reveal>
          <h2 className="h2">More classes.</h2>
        </Reveal>
        <div className="cmore__row">
          {others.map((o, i) => (
            <Reveal key={o.slug} delay={i * 0.05} className="cmore__item">
              <a href={`/classes/${o.slug}/`} className="ctile">
                <span className="ctile__img">
                  <img src={o.hero.replace("w=2400", "w=900")} alt="" loading="lazy" />
                </span>
                <span className="ctile__body">
                  <strong>{o.name}</strong>
                  <small>{o.facts.duration}</small>
                </span>
                <ArrowUpRight className="ctile__arrow" size={18} aria-hidden />
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      <BookModal open={open} onClose={close} className={c.name} when={when} />
    </>
  );
}
