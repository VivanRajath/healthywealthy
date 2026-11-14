"use client";

import { ScrollWords } from "./Motion";
import { RocketAnchor } from "./StoryRocket";

export function About() {
  return (
    <section className="about about--short" id="about">
      <div className="about__intro">
        <span className="marker" />
        <RocketAnchor id="about" className="ra-about" rotate={18} />
        <h2 className="about__label">About us</h2>
        <ScrollWords
          className="about__statement"
          text="1% Daily Healthy Wealthy started with a simple idea. You do not need a big change to transform your life. You need a small one, made every day, for your body and for your money. Think of it as a rocket: every part matters, and together they lift you a little higher each day."
        />
      </div>
    </section>
  );
}
