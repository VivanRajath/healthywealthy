"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HeartPulse, Coins, ArrowUpRight } from "lucide-react";
import { useMode } from "./ModeProvider";
import type { Mode } from "@/lib/content";

// Each side wears its own brand colour, so the other side previews where it leads.
const options: { id: Mode; label: string; Icon: typeof HeartPulse; color: string }[] = [
  { id: "health", label: "Health", Icon: HeartPulse, color: "#1c8696" },
  { id: "wealth", label: "Wealth", Icon: Coins, color: "#22540e" },
];

/*
  The side you are not on is drawn as a button: solid face, its own colour, the same
  arrow box as the site's other buttons, and a light sweep across it until the switch
  has been used once.
*/
export function ModeSwitch({ size = "md", id }: { size?: "md" | "lg"; id: string }) {
  const { mode, setMode } = useMode();
  const [used, setUsed] = useState(false);

  return (
    <div className={`switch switch--${size}${used ? " is-used" : ""}`} role="tablist" aria-label="Choose a side of the club">
      {options.map(({ id: opt, label, Icon, color }) => {
        const active = mode === opt;
        return (
          <button
            key={opt}
            role="tab"
            aria-selected={active}
            className={`switch__btn${active ? " is-active" : " is-other"}`}
            style={{ "--opt": color } as React.CSSProperties}
            onClick={() => {
              setUsed(true);
              setMode(opt);
            }}
          >
            {active && (
              <motion.span
                layoutId={`switch-pill-${id}`}
                className="switch__pill"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            )}
            <Icon className="switch__icon" size={size === "lg" ? 20 : 16} strokeWidth={2} aria-hidden />
            <span>{label}</span>
            {!active && (
              <span className="switch__go" aria-hidden>
                <ArrowUpRight size={size === "lg" ? 18 : 15} strokeWidth={2} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
