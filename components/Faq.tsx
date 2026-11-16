"use client";

import { useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { Plus, Minus } from "lucide-react";
import { Reveal } from "./Motion";
import { riskLine } from "@/lib/content";

type Cat = "All" | "Health" | "Wealth" | "Challenge";

const faqs: { cat: Exclude<Cat, "All">; q: string; a: string }[] = [
  {
    cat: "Health",
    q: "Are the daily yoga and exercise sessions really free?",
    a: "Yes, free for every member.",
  },
  {
    cat: "Health",
    q: "When are the sessions and how do I join?",
    a: "Every morning on Google Meet, 30 to 60 minutes. Book once and use the same link daily.",
  },
  {
    cat: "Health",
    q: "Can I change the routine to suit me?",
    a: "Yes. Shorten it, change the focus or take a rest day.",
  },
  {
    cat: "Wealth",
    q: "How does copy-trading work?",
    a: "You link your trading account. Every master account trade is placed in yours, sized to your balance.",
  },
  {
    cat: "Wealth",
    q: "Who holds my money?",
    a: "You do. Funds stay with your broker and you can withdraw any time.",
  },
  {
    cat: "Wealth",
    q: "How do I stop copying trades?",
    a: "Change your trading account password. Copying stops automatically.",
  },
  {
    cat: "Wealth",
    q: "What does it cost?",
    a: "No joining or monthly fee. We keep 50% of profit on copied trades, nothing else.",
  },
  {
    cat: "Wealth",
    q: "Is profit guaranteed?",
    a: `No. We target about 1% on trading days, but some days end in a loss. ${riskLine}`,
  },
  {
    cat: "Wealth",
    q: "Is the trading institute part of this?",
    a: "No. It is a separate entity.",
  },
  {
    cat: "Challenge",
    q: "How does the 30 day challenge work?",
    a: "Each month has a theme. Sessions build your streak and the most consistent members win.",
  },
  {
    cat: "Challenge",
    q: "What if I miss a day?",
    a: "Your streak resets, but your monthly score stays.",
  },
];

const cats: Cat[] = ["All", "Health", "Wealth", "Challenge"];

export function Faq() {
  const [cat, setCat] = useState<Cat>("All");
  const [open, setOpen] = useState<string>(faqs[0].q);
  const list = faqs.filter((f) => cat === "All" || f.cat === cat);

  return (
    <section className="faq" id="faq">
      <span className="ghost" data-speed="0.35" aria-hidden>
        {"Ask"}
      </span>
      <div className="faq__side">
        <Reveal>
          <span className="marker" />
          <h2 className="h2">Questions, answered.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lead">Ask us anything below.</p>
        </Reveal>
        <div className="faq__cats" role="tablist" aria-label="Filter questions">
          {cats.map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} className={cat === c ? "is-active" : ""} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Radix Accordion: arrow keys, Home and End move between questions; state is announced. */}
      <Accordion.Root
        type="single"
        collapsible
        value={open}
        onValueChange={setOpen}
        className="faq__list"
      >
        {list.map((f) => (
          <Accordion.Item key={f.q} value={f.q} className="faq__item">
            <Accordion.Header asChild>
              <h3 className="faq__h">
                <Accordion.Trigger className="faq__trigger">
                  <span className="faq__cat">{f.cat}</span>
                  <span className="faq__q">{f.q}</span>
                  <span className="faq__icon" aria-hidden>
                    <Plus className="faq__plus" size={18} />
                    <Minus className="faq__minus" size={18} />
                  </span>
                </Accordion.Trigger>
              </h3>
            </Accordion.Header>
            <Accordion.Content className="faq__a">
              <p>{f.a}</p>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  );
}
