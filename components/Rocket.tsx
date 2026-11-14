"use client";

import { useId } from "react";
import { motion, useTransform, motionValue, type MotionValue } from "framer-motion";

/*
  The story rocket. Drawn in parts so it can fly whole or come apart.
  Parts from top to bottom: nose, capsule, payload, tank, fins, engine.
*/

export const PARTS = ["nose", "capsule", "payload", "tank", "fins", "engine"] as const;
export type Part = (typeof PARTS)[number];

/* Vertical travel of each part when fully exploded, in rocket units. */
export const OFFSETS: Record<Part, number> = {
  nose: -150,
  capsule: -88,
  payload: -26,
  tank: 36,
  fins: 98,
  engine: 160,
};

/* Centre line of each part when assembled, used to place labels. */
export const CENTERS: Record<Part, number> = {
  nose: 70,
  capsule: 180,
  payload: 290,
  tank: 395,
  fins: 455,
  engine: 465,
};

/* Exploded drawings need room above and below the assembled rocket. */
export const EXPLODED_BOX = { x: -60, y: -170, w: 320, h: 920 };
const COMPACT_BOX = { x: 0, y: 0, w: 200, h: 580 };

const still = motionValue(0);

function PartGroup({
  part,
  explode,
  active,
  children,
  dx = 0,
}: {
  part: Part;
  explode: MotionValue<number>;
  active: number | null;
  children: React.ReactNode;
  dx?: number;
}) {
  const y = useTransform(explode, [0, 1], [0, OFFSETS[part]]);
  const x = useTransform(explode, [0, 1], [0, dx]);
  const dim = active !== null && PARTS[active] !== part;
  return (
    <motion.g style={{ x, y }} className={`rk__part${dim ? " is-dim" : ""}`} data-part={part}>
      {children}
    </motion.g>
  );
}

export function Rocket({
  explode = still,
  active = null,
  flame = true,
  exploded = false,
  className = "",
  title,
}: {
  explode?: MotionValue<number>;
  active?: number | null;
  flame?: boolean;
  exploded?: boolean;
  className?: string;
  title?: string;
}) {
  const id = useId().replace(/:/g, "");
  const box = exploded ? EXPLODED_BOX : COMPACT_BOX;
  const flameOpacity = useTransform(explode, [0, 0.4], [1, 0]);
  const finL = useTransform(explode, [0, 1], [0, -34]);
  const finR = useTransform(explode, [0, 1], [0, 34]);

  return (
    <svg
      className={`rk ${className}`}
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={`body${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#f1f4f0" />
          <stop offset="1" stopColor="#c9d3cc" />
        </linearGradient>
        <linearGradient id={`tank${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#e7ece6" />
          <stop offset="1" stopColor="#b9c4bd" />
        </linearGradient>
        <linearGradient id={`fin${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--accent-deep)" />
        </linearGradient>
        <linearGradient id={`flame${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset="0.35" stopColor="#ffb547" />
          <stop offset="1" stopColor="#ff5a2a" stopOpacity="0" />
        </linearGradient>
      </defs>

      {flame && (
        <g className="rk__flamewrap">
        <motion.g style={{ opacity: flameOpacity }} className="rk__flame">
          <path d="M64 490 Q100 640 136 490 Z" fill={`url(#flame${id})`} />
          <path d="M82 490 Q100 580 118 490 Z" fill="#fff6d6" opacity="0.9" />
        </motion.g>
        </g>
      )}

      <PartGroup part="engine" explode={explode} active={active}>
        <path d="M70 438 L130 438 L142 486 L58 486 Z" fill="#26302c" />
        <rect x="56" y="484" width="88" height="7" fill="#151b18" />
        <path d="M84 446 L116 446" stroke="rgba(255,255,255,0.18)" strokeWidth="3" />
      </PartGroup>

      <PartGroup part="fins" explode={explode} active={active}>
        <motion.path d="M58 388 L14 466 L14 494 L58 452 Z" fill={`url(#fin${id})`} style={{ x: finL }} />
        <motion.path d="M142 388 L186 466 L186 494 L142 452 Z" fill={`url(#fin${id})`} style={{ x: finR }} />
        <rect x="95" y="426" width="10" height="66" fill="var(--accent-deep)" />
      </PartGroup>

      <PartGroup part="tank" explode={explode} active={active}>
        <rect x="58" y="348" width="84" height="92" fill={`url(#tank${id})`} />
        {[370, 394, 418].map((y) => (
          <line key={y} x1="64" x2="136" y1={y} y2={y} stroke="rgba(15,28,22,0.22)" strokeDasharray="3 4" />
        ))}
      </PartGroup>

      <PartGroup part="payload" explode={explode} active={active}>
        <rect x="58" y="230" width="84" height="120" fill={`url(#body${id})`} />
        <rect x="58" y="248" width="84" height="10" fill="var(--accent)" />
        <text x="100" y="314" textAnchor="middle" className="rk__mark">
          1%
        </text>
        <rect x="58" y="332" width="84" height="5" fill="var(--accent)" />
      </PartGroup>

      <PartGroup part="capsule" explode={explode} active={active}>
        <rect x="58" y="128" width="84" height="104" fill={`url(#body${id})`} />
        <circle cx="100" cy="180" r="27" fill="#0f1c16" stroke="var(--accent)" strokeWidth="6" />
        <path d="M86 168 A 18 18 0 0 1 108 160" stroke="rgba(255,255,255,0.7)" strokeWidth="4" fill="none" strokeLinecap="round" />
        {[140, 220].map((y) => (
          <g key={y}>
            <circle cx="66" cy={y} r="2.2" fill="rgba(15,28,22,0.35)" />
            <circle cx="134" cy={y} r="2.2" fill="rgba(15,28,22,0.35)" />
          </g>
        ))}
      </PartGroup>

      <PartGroup part="nose" explode={explode} active={active}>
        <path d="M100 6 C 128 32 142 82 142 130 L 58 130 C 58 82 72 32 100 6 Z" fill={`url(#body${id})`} />
        <path d="M100 6 C 110 16 117 28 121 44 L 79 44 C 83 28 90 16 100 6 Z" fill="var(--accent)" />
      </PartGroup>
    </svg>
  );
}
