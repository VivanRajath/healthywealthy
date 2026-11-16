"use client";

import type { Rocket3D } from "@/lib/rocket3d";

import { useEffect, useRef, useState } from "react";
import { cancelFrame, frame, motion, motionValue, useMotionValueEvent, type MotionStyle } from "framer-motion";
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
let sorted: AnchorDef[] | null = null;
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
    sorted = null;
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
      sorted = null;
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
  const canvas = useRef<HTMLCanvasElement>(null);
  const explode = useRef(motionValue(0)).current;
  const [active, setActive] = useState<number | null>(null);
  useMotionValueEvent(rocketActive, "change", (v) => setActive(v));

  /*
    The 3D rocket loads after the page is up. Until it is ready, or if the device has no
    WebGL, the flat drawing is shown in its place.
  */
  const r3d = useRef<Rocket3D | null>(null);
  useEffect(() => {
    let gone = false;
    import("@/lib/rocket3d").then(({ createRocket3D }) => {
      if (gone || !canvas.current || !wrap.current) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const r = createRocket3D(canvas.current, { reduce });
      if (!r) return;
      r3d.current = r;
      const w = wrap.current.offsetWidth || 200;
      r.resize(w, w * RATIO);
      r.setExplode(explode.get());
      r.setActive(rocketActive.get());
      wrap.current.classList.add("is-3d");
    });
    return () => {
      gone = true;
      r3d.current?.destroy();
      r3d.current = null;
    };
  }, [explode]);
  useEffect(() => {
    r3d.current?.setActive(active);
  }, [active]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Drawn at the size of the largest dock and scaled down on the GPU. Only re-sized when docks change size.
    let BASE = 0;

    const cur = { x: 0, y: 0, w: 0, r: 0, ready: false };
    let running = false;
    let last = performance.now();
    let flying = false;
    let lastSy = -1;
    let still = 0;
    let lastE = -1;
    let lastT = "";
    let lastW = "";

    // Values worked out in the read step, applied in the render step.
    const out = { tf: "", width: "", fly: false, ex: 0, show: false, seen: true };
    let lastSeen = true;

    /*
      Runs in the animation library's own frame loop: every measurement happens in the
      read step, before any styles are written that frame, so the browser never has to
      stop and recalculate layout mid-frame.
    */
    const read = () => {
      const node = wrap.current;
      if (!node) return;
      const now = performance.now();
      // Frame-rate independent smoothing: same feel on 60Hz, 120Hz and slow phones.
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!sorted) {
        sorted = [...anchors.values()].sort((a, b) =>
          a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
        );
      }
      const list = sorted.filter((a) => a.el.isConnected && a.el.offsetWidth > 0);
      if (!list.length) {
        out.show = false;
        frame.render(write);
        return;
      }

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mid = vh * 0.5;
      const sy = window.scrollY;

      const pts = list.map((a) => {
        const r = a.el.getBoundingClientRect();
        const h = a.hold();
        // Distance of this dock from "now", in pixels of scroll. Zero means docked.
        const cy = r.top + r.height / 2;
        const k = h ? (sy < h[0] ? h[0] - sy : sy > h[1] ? h[1] - sy : 0) : cy - mid;
        return { cx: r.left + r.width / 2, cy, w: a.el.offsetWidth, r: a.rotate(), e: a.explode(), flame: a.flame, k };
      });

      let j = pts.findIndex((q) => q.k > 0);
      let i: number;
      let t: number;
      const past = j === -1;
      if (past) {
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
      const small = vw < 720;

      let tx = lerp(a.cx, b.cx, e);
      let ty = lerp(a.cy, b.cy, e) - arc * vh * (small ? 0.03 : 0.06);
      const tw = lerp(a.w, b.w, e) * (small ? 1 - arc * 0.25 : 1);

      // Between docks the next stop is often far off screen. Keep the rocket inside the
      // viewport while it travels so it never vanishes and pops back in.
      if (!past) {
        const keep = Math.min(1, arc * 3);
        const padX = Math.min(vw * 0.18, 90);
        const cx = Math.min(vw - padX, Math.max(padX, tx));
        const cy = Math.min(vh * 0.82, Math.max(vh * 0.22, ty));
        tx = lerp(tx, cx, keep);
        ty = lerp(ty, cy, keep);
      }

      // Lean into the direction of travel, measured on screen.
      const tilt = Math.max(-34, Math.min(34, ((b.cx - a.cx) / vw) * 70)) * arc;
      const tr = lerp(a.r, b.r, e) + tilt;

      const inFlight = t > 0.02 && t < 0.98;
      const rate = !cur.ready || reduce ? 1e3 : inFlight ? 7 : 18;
      const f = 1 - Math.exp(-rate * dt);
      cur.x = lerp(cur.x, tx, f);
      cur.y = lerp(cur.y, ty, f);
      cur.w = lerp(cur.w, tw, f);
      // Shortest way round for the angle.
      const dr = ((tr - cur.r + 540) % 360) - 180;
      cur.r = cur.r + dr * f;
      cur.ready = true;

      // Drawn at the size of the largest dock and scaled down on the GPU.
      const maxW = Math.max(...pts.map((q) => q.w));
      if (Math.abs(maxW - BASE) > 4) BASE = Math.ceil(maxW);
      const scale = cur.w / BASE;

      out.show = true;
      out.width = `${BASE}px`;
      out.tf = `translate3d(${(cur.x - BASE / 2).toFixed(1)}px, ${(cur.y - (BASE * RATIO) / 2).toFixed(1)}px, 0) rotate(${cur.r.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      out.fly = inFlight || a.flame || b.flame;
      out.ex = lerp(a.e, b.e, e);
      // Whether any of the rocket is on screen, so the 3D view can stop drawing when it is not.
      const hh = (BASE * RATIO * scale) / 2;
      out.seen = cur.y + hh > 0 && cur.y - hh < vh;
      frame.render(write);

      // Settled: same scroll position and the rocket has caught up with its target.
      const settled = sy === lastSy && Math.abs(tx - cur.x) < 0.3 && Math.abs(ty - cur.y) < 0.3 && Math.abs(tw - cur.w) < 0.3 && Math.abs(dr) < 0.05;
      lastSy = sy;
      still = settled ? still + 1 : 0;
      if (still > 45) sleep();
    };

    const write = () => {
      const node = wrap.current;
      if (!node) return;
      if (!out.show) {
        node.style.opacity = "0";
        r3d.current?.setVisible(false);
        return;
      }
      node.style.opacity = "1";
      if (out.seen !== lastSeen) {
        r3d.current?.setVisible(out.seen);
        lastSeen = out.seen;
      }
      if (out.width !== lastW) {
        node.style.width = out.width;
        lastW = out.width;
        const w = parseFloat(out.width);
        r3d.current?.resize(w, w * RATIO);
      }
      if (out.tf !== lastT) {
        node.style.transform = out.tf;
        lastT = out.tf;
      }
      if (out.fly !== flying) {
        node.classList.toggle("is-flying", out.fly);
        flying = out.fly;
        r3d.current?.setFlying(out.fly);
      }
      if (Math.abs(out.ex - lastE) > 0.0005) {
        explode.set(out.ex);
        lastE = out.ex;
        r3d.current?.setExplode(out.ex);
      }
    };

    // The loop sleeps once the rocket has settled and nothing is scrolling, and wakes on any movement.
    const sleep = () => {
      running = false;
      cancelFrame(read);
    };
    const wake = () => {
      still = 0;
      if (running) return;
      running = true;
      last = performance.now();
      frame.read(read, true);
    };

    wake();
    const opts = { passive: true } as const;
    window.addEventListener("scroll", wake, opts);
    window.addEventListener("resize", wake, opts);
    window.addEventListener("pointerdown", wake, opts);
    // Layout changes without scrolling (tab switches, images loading) also move the docks.
    const ro = new ResizeObserver(wake);
    ro.observe(document.body);
    return () => {
      sleep();
      cancelFrame(write);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
      window.removeEventListener("pointerdown", wake);
      ro.disconnect();
    };
  }, [explode]);

  return (
    <div className="story" aria-hidden>
      <div className="story__rocket" ref={wrap}>
        <Rocket explode={explode} active={active} exploded />
        <canvas ref={canvas} className="story__gl" />
      </div>
    </div>
  );
}
