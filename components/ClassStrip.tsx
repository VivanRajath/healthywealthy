"use client";

import { ArrowUpRight, Clock, Gauge } from "lucide-react";
import { classes } from "@/lib/classes";
import { Reveal } from "./Motion";

/* The health classes, shown in the Health tab. Each opens its own page. */
export function ClassStrip() {
  return (
    <section className="cstrip" id="classes">
      <div className="cstrip__head">
        <Reveal>
          <span className="marker" />
          <h2 className="h2">Pick your class.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lead">Six live classes, free for members.</p>
        </Reveal>
      </div>
      <div className="cstrip__grid" data-depth>
        {classes.map((c, i) => (
          <Reveal key={c.slug} delay={(i % 3) * 0.08} className="cstrip__cell">
            <a href={`/classes/${c.slug}/`} className="ctile ctile--big">
              <span className="ctile__img">
                <img src={c.hero.replace("w=2400", "w=1100")} alt={c.heroAlt} loading="lazy" />
              </span>
              <span className="ctile__body">
                <strong>{c.name}</strong>
                <small>{c.tagline}</small>
                <span className="ctile__meta">
                  <span>
                    <Clock size={13} aria-hidden />
                    {c.facts.duration}
                  </span>
                  <span>
                    <Gauge size={13} aria-hidden />
                    Intensity {c.facts.intensity} of 5
                  </span>
                </span>
              </span>
              <ArrowUpRight className="ctile__arrow" size={20} aria-hidden />
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
