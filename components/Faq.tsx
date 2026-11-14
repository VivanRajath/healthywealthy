"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Reveal, ease } from "./Motion";
import { riskLine } from "@/lib/content";
import { RocketAnchor } from "./StoryRocket";

type Cat = "All" | "Health" | "Wealth" | "Challenge";

const faqs: { cat: Exclude<Cat, "All">; q: string; a: string }[] = [
  {
    cat: "Health",
    q: "Are the daily yoga and exercise sessions really free?",
    a: "Yes. The live morning sessions are included for every member with no separate charge.",
  },
  {
    cat: "Health",
    q: "When are the sessions and how do I join?",
    a: "Sessions run every morning at a fixed time on Google Meet and last 30 to 60 minutes. Once you book, you receive the link, and it stays the same every day.",
  },
  {
    cat: "Health",
    q: "Can I change the routine to suit me?",
    a: "Yes. You can adjust the routine to find your own best day, whether that means a shorter session, a different focus or an extra rest day.",
  },
  {
    cat: "Wealth",
    q: "How does copy-trading work?",
    a: "We run a master trading account. You link your own trading account, and every trade placed in the master account is placed automatically in yours, sized to your balance.",
  },
  {
    cat: "Wealth",
    q: "Who holds my money?",
    a: "You do. Your funds stay in your own trading account with your broker, and you keep full rights to withdraw at any time.",
  },
  {
    cat: "Wealth",
    q: "How do I stop copying trades?",
    a: "Change your trading account password. Copying disconnects automatically, and you can link again whenever you want.",
  },
  {
    cat: "Wealth",
    q: "What does it cost?",
    a: "There is no joining fee and no monthly fee. The company keeps 50% of the profit made on copied trades, and there are no other charges.",
  },
  {
    cat: "Wealth",
    q: "Is profit guaranteed?",
    a: `No. Our target is about 1% on trading days, but it is a target and not a promise. Results vary from day to day, and some days and months will end in a loss. ${riskLine}`,
  },
  {
    cat: "Wealth",
    q: "Is the trading institute part of this?",
    a: "No. The trading institute is a separate entity and is not linked to this programme.",
  },
  {
    cat: "Challenge",
    q: "How does the 30 day challenge work?",
    a: "Each month has a theme. Every session you attend adds to your streak, and the leaderboard ranks members by consistency. The most consistent members are named monthly winners.",
  },
  {
    cat: "Challenge",
    q: "What if I miss a day?",
    a: "Your current streak resets, but your consistency score keeps everything you have done that month. Missing one day never undoes the habit.",
  },
];

const cats: Cat[] = ["All", "Health", "Wealth", "Challenge"];

export function Faq() {
  const [cat, setCat] = useState<Cat>("All");
  const [open, setOpen] = useState<string | null>(faqs[0].q);
  const list = faqs.filter((f) => cat === "All" || f.cat === cat);

  return (
    <section className="faq" id="faq">
      <div className="faq__side">
        <Reveal>
          <span className="marker" />
          <h2 className="h2">Questions, answered.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="lead">Still unsure about something? Send us a message below and we will reply within a day.</p>
        </Reveal>
        <div className="faq__cats" role="tablist" aria-label="Filter questions">
          {cats.map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} className={cat === c ? "is-active" : ""} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
        <RocketAnchor id="faq" className="ra-faq" rotate={8} />
      </div>

      <ul className="faq__list">
        {list.map((f) => {
          const isOpen = open === f.q;
          const id = `faq-${faqs.indexOf(f)}`;
          return (
            <li key={f.q} className={isOpen ? "is-open" : ""}>
              <button aria-expanded={isOpen} aria-controls={id} onClick={() => setOpen(isOpen ? null : f.q)}>
                <span className="faq__cat">{f.cat}</span>
                <span className="faq__q">{f.q}</span>
                <span className="faq__icon" aria-hidden>
                  <Plus size={18} />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={id}
                    className="faq__a"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease }}
                  >
                    <p>{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
