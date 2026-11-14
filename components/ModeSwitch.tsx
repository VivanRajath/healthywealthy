"use client";

import { motion } from "framer-motion";
import { HeartPulse, Coins } from "lucide-react";
import { useMode } from "./ModeProvider";
import type { Mode } from "@/lib/content";

const options: { id: Mode; label: string; Icon: typeof HeartPulse }[] = [
  { id: "health", label: "Health", Icon: HeartPulse },
  { id: "wealth", label: "Wealth", Icon: Coins },
];

export function ModeSwitch({ size = "md", id }: { size?: "md" | "lg"; id: string }) {
  const { mode, setMode } = useMode();

  return (
    <div className={`switch switch--${size}`} role="tablist" aria-label="Choose a side of the club">
      {options.map(({ id: opt, label, Icon }) => {
        const active = mode === opt;
        return (
          <button
            key={opt}
            role="tab"
            aria-selected={active}
            className={`switch__btn${active ? " is-active" : ""}`}
            onClick={() => setMode(opt)}
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
          </button>
        );
      })}
    </div>
  );
}
