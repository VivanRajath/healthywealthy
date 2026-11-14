"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

export const ease = [0.22, 1, 0.36, 1] as const;

/** Image that drifts inside its frame while the frame scrolls through the viewport. */
export function ParallaxImage({
  src,
  alt,
  strength = 12,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  strength?: number;
  className?: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : [`-${strength}%`, `${strength}%`]);

  return (
    <div ref={ref} className={`pimg ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        style={{ y, height: `${100 + strength * 2}%`, top: `-${strength}%` }}
      />
    </div>
  );
}

/** Fades and lifts content in once when it enters the viewport. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "p";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </Comp>
  );
}

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className="word">
      {word}{" "}
    </motion.span>
  );
}

/** Paragraph whose words light up one by one as it scrolls past. */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");

  if (reduce) return <p className={className}>{text}</p>;

  return (
    <p ref={ref} className={className} aria-label={text}>
      <span aria-hidden>
        {words.map((w, i) => (
          <Word key={i} word={w} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />
        ))}
      </span>
    </p>
  );
}

/** Heading whose words rise out of a mask when it enters the viewport. */
export function SplitHeading({ text, className = "h2", as = "h2" }: { text: string; className?: string; as?: "h2" | "h3" }) {
  const reduce = useReducedMotion();
  const Tag = as;
  const words = text.split(" ");
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden>
          <span className="sw">
            <motion.span
              className="sw__i"
              initial={reduce ? false : { y: "115%", rotate: 4 }}
              whileInView={{ y: "0%", rotate: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 1, delay: i * 0.06, ease }}
            >
              {w}
            </motion.span>
          </span>{" "}
        </span>
      ))}
    </Tag>
  );
}

type Floater = { shape: "ring" | "plus" | "square" | "dots"; x: string; y: string; size: number; speed: number };

function FloatShape({ f, progress }: { f: Floater; progress: MotionValue<number> }) {
  const y = useTransform(progress, [0, 1], [f.speed * 160, f.speed * -160]);
  const rotate = useTransform(progress, [0, 1], [0, f.speed * 90]);
  const s = f.size;
  return (
    <motion.svg className="floater" width={s} height={s} viewBox="0 0 100 100" style={{ left: f.x, top: f.y, y, rotate }} aria-hidden>
      {f.shape === "ring" && <circle cx="50" cy="50" r="46" />}
      {f.shape === "square" && <rect x="6" y="6" width="88" height="88" />}
      {f.shape === "plus" && <path d="M50 8 V92 M8 50 H92" />}
      {f.shape === "dots" &&
        Array.from({ length: 16 }).map((_, i) => <circle key={i} className="floater__dot" cx={14 + (i % 4) * 24} cy={14 + Math.floor(i / 4) * 24} r="3" />)}
    </motion.svg>
  );
}

/** Dotted shapes that drift at different speeds behind a section. */
export function Floaters({ items }: { items: Floater[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  if (reduce) return null;
  return (
    <div ref={ref} className="floaters" aria-hidden>
      {items.map((f, i) => (
        <FloatShape key={i} f={f} progress={scrollYProgress} />
      ))}
    </div>
  );
}
