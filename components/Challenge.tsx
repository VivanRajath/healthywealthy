"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Flame, Trophy, Crown, CalendarDays, Medal, Rocket as RocketIcon } from "lucide-react";
import { Reveal, ease } from "./Motion";
import { SButton } from "./SButton";
import { RocketAnchor } from "./StoryRocket";

/* Placeholder leaderboard. Replace with real member data from the backend. */
const month = [
  { name: "Ananya R.", city: "Pune", streak: 14, consistency: 100, side: "Both" },
  { name: "Rohit M.", city: "Bengaluru", streak: 14, consistency: 100, side: "Health" },
  { name: "Fatima S.", city: "Hyderabad", streak: 13, consistency: 96, side: "Health" },
  { name: "Karan V.", city: "Delhi", streak: 12, consistency: 93, side: "Both" },
  { name: "Meera I.", city: "Chennai", streak: 12, consistency: 89, side: "Health" },
  { name: "Arjun P.", city: "Mumbai", streak: 11, consistency: 86, side: "Both" },
];

const allTime = [
  { name: "Rohit M.", city: "Bengaluru", streak: 212, consistency: 97, side: "Health" },
  { name: "Ananya R.", city: "Pune", streak: 188, consistency: 95, side: "Both" },
  { name: "Sanjay K.", city: "Jaipur", streak: 160, consistency: 92, side: "Health" },
  { name: "Fatima S.", city: "Hyderabad", streak: 141, consistency: 90, side: "Health" },
  { name: "Leela N.", city: "Kochi", streak: 133, consistency: 88, side: "Both" },
  { name: "Karan V.", city: "Delhi", streak: 120, consistency: 86, side: "Both" },
];

const winners = [
  { month: "November", theme: "Mobility month", name: "Leela N." },
  { month: "October", theme: "Breath and focus", name: "Sanjay K." },
  { month: "September", theme: "Strength month", name: "Rohit M." },
];

/* Days 1 to 30 of the current challenge. Today is day 14, two days missed. */
const TODAY = 14;
const MISSED = new Set([5, 9]);

const initials = (n: string) =>
  n
    .split(" ")
    .map((p) => p[0])
    .join("")
    .replace(".", "");

export function Challenge() {
  const [board, setBoard] = useState<"month" | "all">("month");
  const reduce = useReducedMotion();
  const rows = board === "month" ? month : allTime;

  return (
    <section className="challenge" id="challenge">
      <div className="challenge__head">
        <Reveal>
          <span className="marker" />
          <h2 className="h2">The 30 day challenge.</h2>
        </Reveal>
        <Reveal delay={0.1} className="challenge__intro">
          <p className="lead">
            Show up every day for 30 days. Every session you attend adds to your streak, and the most consistent members
            top the board at the end of the month.
          </p>
          <SButton href="#enquiry" variant="dark">
            Join the challenge
          </SButton>
        </Reveal>
      </div>

      <div className="challenge__grid">
        <div className="streak">
          <RocketAnchor id="challenge" className="ra-challenge" rotate={14} />
          <div className="streak__theme">
            <CalendarDays size={18} strokeWidth={1.6} aria-hidden />
            <span>
              <small>December theme</small>
              <strong>Core and posture</strong>
            </span>
          </div>

          <div className="streak__stats">
            <div>
              <Flame size={18} strokeWidth={1.6} aria-hidden />
              <strong>12</strong>
              <small>Current streak</small>
            </div>
            <div>
              <Trophy size={18} strokeWidth={1.6} aria-hidden />
              <strong>21</strong>
              <small>Best streak</small>
            </div>
            <div>
              <Medal size={18} strokeWidth={1.6} aria-hidden />
              <strong>86%</strong>
              <small>Consistency</small>
            </div>
          </div>

          <ol className="days" aria-label={`Day ${TODAY} of 30, ${MISSED.size} days missed`}>
            {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
              const state = d > TODAY ? "ahead" : d === TODAY ? "today" : MISSED.has(d) ? "missed" : "done";
              return (
                <motion.li
                  key={d}
                  className={`day day--${state}`}
                  initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ duration: 0.4, delay: d * 0.025, ease }}
                >
                  {state === "today" ? <RocketIcon size={16} strokeWidth={1.8} aria-label={`Day ${d}, today`} /> : d}
                </motion.li>
              );
            })}
          </ol>
          <div className="days__legend">
            <span>
              <i className="day--done" />
              Attended
            </span>
            <span>
              <i className="day--missed" />
              Missed
            </span>
            <span>
              <i className="day--today" />
              Today
            </span>
          </div>
        </div>

        <div className="board">
          <div className="board__bar">
            <h3>Leaderboard</h3>
            <div className="seg seg--light" role="tablist" aria-label="Leaderboard period">
              <button role="tab" aria-selected={board === "month"} className={board === "month" ? "is-active" : ""} onClick={() => setBoard("month")}>
                This month
              </button>
              <button role="tab" aria-selected={board === "all"} className={board === "all" ? "is-active" : ""} onClick={() => setBoard("all")}>
                All time
              </button>
            </div>
          </div>
          <div className="board__cols" aria-hidden>
            <span>Member</span>
            <span>Streak</span>
            <span>Consistency</span>
          </div>
          <ol className="board__list">
            {rows.map((r, i) => (
              <motion.li
                key={board + r.name}
                className={`brow${i === 0 ? " brow--top" : ""}`}
                initial={reduce ? false : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease }}
              >
                <span className="brow__rank">{i === 0 ? <Crown size={16} strokeWidth={1.8} aria-label="First" /> : i + 1}</span>
                <span className="brow__who">
                  <span className="brow__avatar" aria-hidden>
                    {initials(r.name)}
                  </span>
                  <span>
                    <strong>{r.name}</strong>
                    <small>
                      {r.city}, {r.side}
                    </small>
                  </span>
                </span>
                <span className="brow__streak">
                  <Flame size={14} aria-hidden />
                  {r.streak}
                </span>
                <span className="brow__cons">
                  <span className="bar" aria-hidden>
                    <motion.i
                      initial={reduce ? false : { width: 0 }}
                      animate={{ width: `${r.consistency}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease }}
                    />
                  </span>
                  {r.consistency}%
                </span>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>

      <div className="winners">
        <span className="winners__label">Past monthly winners</span>
        {winners.map((w) => (
          <div key={w.month} className="winners__item">
            <Trophy size={18} strokeWidth={1.6} aria-hidden />
            <span>
              <strong>{w.name}</strong>
              <small>
                {w.month}, {w.theme}
              </small>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
