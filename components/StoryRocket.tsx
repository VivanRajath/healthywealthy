"use client";

import { useEffect, useRef, useState } from "react";
import { motion, motionValue, useMotionValueEvent, type MotionStyle } from "framer-motion";
import { Rocket, EXPLODED_BOX } from "./Rocket";

/*
  One rocket for the whole site.

  Sections place invisible <RocketAnchor> docks. Each frame the rocket finds the
  two docks either side of the middle of the screen and flies between them.
  A dock can "hold" the rocket for a range of scroll (pinned sections), follow
  a moving element (the hero graph), set a rotation, or open the rocket up.
*/

type AnchorDef = {
  el: HTMLElement;
  rotate: () => number;
  hold: () => [number, number] | null;
  explode: () => number;
  flame: boolean;
};

const anchors = new Map<string, AnchorDef>();
export const rocketActive = motionValue<number | null>(null);

const RATIO = EXPLODED_BOX.h / EXPLODED_BOX.w;

type AnchorProps = {
  id: string;
  width?: number | string;
  rotate?: number | (() => number);
  hold?: () => [number, number];
  explode?: () => number;
  flame?: boolean;
  className?: string;
  style?: MotionStyle;
  children?: React.ReactNode;
};

/* Invisible dock. Its box is the rocket's full exploded drawing box. */
export function RocketAnchor({ id, width, rotate = 0, hold, explode, flame = false, className = "", style, children }: AnchorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const latest = useRef({ rotate, hold, explode, flame });
  latest.current = { rotate, hold, explode, flame };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    anchors.set(id, {
      el,
      rotate: () => {
        const r = latest.current.rotate;
        return typeof r === "function" ? r() : r;
      },
      hold: () => (latest.current.hold ? latest.current.hold() : null),
      explode: () => (latest.current.explode ? latest.current.explode() : 0),
      get flame() {
        return latest.current.flame;
      },
    } as AnchorDef);
    return () => {
      anchors.delete(id);
    };
  }, [id]);

  return (
    <motion.div
      ref={ref}
      className={`ranchor ${className}`}
      style={{ width, aspectRatio: `${EXPLODED_BOX.w} / ${EXPLODED_BOX.h}`, ...style }}
      aria-hidden
    >
      {children}
    </motion.div>
  );
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function StoryRocket() {
  const wrap = useRef<HTMLDivElement>(null);
  const explode = useRef(motionValue(0)).current;
  const [active, setActive] = useState<number | null>(null);
  useMotionValueEvent(rocketActive, "change", (v) => setActive(v));

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cur = { x: 0, y: 0, w: 0, r: 0, ready: false };
    let raf = 0;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const node = wrap.current;
      if (!node) return;

      const list = [...anchors.values()].filter((a) => a.el.isConnected && a.el.offsetWidth > 0);
      if (!list.length) {
        node.style.opacity = "0";
        return;
      }
      list.sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));

      const vh = window.innerHeight;
      const mid = vh * 0.5;
      const sy = window.scrollY;

      const pts = list.map((a) => {
        const r = a.el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const h = a.hold();
        // Distance of this dock from "now", in pixels of scroll. Zero means docked.
        const k = h ? (sy < h[0] ? h[0] - sy : sy > h[1] ? h[1] - sy : 0) : cy - mid;
        return { cx, cy, w: a.el.offsetWidth, r: a.rotate(), e: a.explode(), flame: a.flame, k };
      });

      let j = pts.findIndex((p) => p.k > 0);
      let i: number;
      let t: number;
      if (j === -1) {
        i = j = pts.length - 1;
        t = 0;
      } else if (j === 0) {
        i = 0;
        t = 0;
      } else {
        i = j - 1;
        t = Math.min(1, Math.max(0, -pts[i].k / (pts[j].k - pts[i].k)));
      }

      const a = pts[i];
      const b = pts[j];
      const e = ease(t);
      const arc = Math.sin(Math.PI * t);
      const tilt = Math.max(-38, Math.min(38, ((b.cx - a.cx) / window.innerWidth) * 80)) * arc;

      const tx = lerp(a.cx, b.cx, e);
      const ty = lerp(a.cy, b.cy, e) - arc * vh * 0.06;
      const tw = lerp(a.w, b.w, e);
      const tr = lerp(a.r, b.r, e) + tilt;

      // Ease toward the target so flight feels physical. Docked follows tightly.
      const k = !cur.ready || reduce ? 1 : t > 0.02 && t < 0.98 ? 0.2 : 0.45;
      cur.x = lerp(cur.x, tx, k);
      cur.y = lerp(cur.y, ty, k);
      cur.w = lerp(cur.w, tw, k);
      cur.r = lerp(cur.r, tr, k);
      cur.ready = true;

      const h = cur.w * RATIO;
      node.style.opacity = "1";
      node.style.width = `${cur.w}px`;
      node.style.transform = `translate3d(${cur.x - cur.w / 2}px, ${cur.y - h / 2}px, 0) rotate(${cur.r}deg)`;
      node.classList.toggle("is-flying", (t > 0.02 && t < 0.98) || a.flame || b.flame);
      explode.set(lerp(a.e, b.e, e));
    };

    frame();
    return () => cancelAnimationFrame(raf);
  }, [explode]);

  return (
    <div className="story" aria-hidden>
      <div className="story__rocket" ref={wrap}>
        <Rocket explode={explode} active={active} exploded />
      </div>
    </div>
  );
}
