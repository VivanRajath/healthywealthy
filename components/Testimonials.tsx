"use client";

import { Quote } from "lucide-react";
import { Reveal, ParallaxImage } from "./Motion";
import { img } from "@/lib/content";

/*
  Placeholder testimonials for the design. Replace with real member quotes,
  collected with written consent, before launch. Avoid quotes about returns.
*/
const quotes = [
  {
    text: "What finally worked was a real coach at 6:30 every morning.",
    name: "Priya S.",
    meta: "Member for 8 months, Pune",
    tag: "Health",
    image: img("1506126613408-eca07ce68773", 900),
  },
  {
    text: "By day twenty I did not need the leaderboard to get out of bed.",
    name: "Vikram T.",
    meta: "Member for 4 months, Bengaluru",
    tag: "Challenge",
    image: img("1571019613454-1cb2f99b2d8b", 900),
  },
  {
    text: "My money stays in my own account, and I can see every trade.",
    name: "Nisha K.",
    meta: "Member for 6 months, Mumbai",
    tag: "Wealth",
    image: img("1559526324-4b87b5e36e44", 900),
  },
  {
    text: "My parents and I join from two cities. It is our daily thing.",
    name: "Aditya and family",
    meta: "Members for 1 year, Delhi and Lucknow",
    tag: "Community",
    image: img("1545205597-3d9d02c29597", 900),
  },
];

/*
  One featured story beside its photograph, then the other three in ruled columns.
  Everything is on screen at once: no carousel, no timer.
*/
export function Testimonials() {
  const featured = quotes[3];
  const rest = quotes.slice(0, 3);

  return (
    <section className="voices" id="stories">
      <span className="ghost" data-speed="0.35" aria-hidden>
        {"Together"}
      </span>
      <div className="voices__head">
        <Reveal>
          <span className="marker" />
          <h2 className="h2">Members, in their words.</h2>
        </Reveal>
      </div>

      <figure className="voices__feature" data-depth>
        <div className="voices__photo">
          <ParallaxImage src={featured.image} alt="" strength={8} sizes="(max-width: 900px) 100vw, 42vw" />
          <span className="voices__tag">{featured.tag}</span>
        </div>
        <div className="voices__body">
          <Quote className="voices__mark" size={36} strokeWidth={1.2} aria-hidden />
          <blockquote className="voices__big">{featured.text}</blockquote>
          <figcaption className="voices__who">
            <strong>{featured.name}</strong>
            <span>{featured.meta}</span>
          </figcaption>
        </div>
      </figure>

      <ul className="voices__list">
        {rest.map((q) => (
          <li key={q.name}>
            <figure>
              <span className="voices__tagline">{q.tag}</span>
              <blockquote>{q.text}</blockquote>
              <figcaption className="voices__who">
                <img src={q.image.replace("w=900", "w=160")} alt="" loading="lazy" />
                <span>
                  <strong>{q.name}</strong>
                  <span>{q.meta}</span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
