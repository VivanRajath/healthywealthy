"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/*
  Parallax background for the whole site: three blueprint layers fixed behind the
  content, each sliding up at its own speed as the page scrolls.

  - far:  a faint drafting grid, almost still
  - mid:  scattered plus marks and small circles
  - near: orbit rings, dotted arcs and launch trails, in the side's own colour

  Each layer is a repeating tile, so it is moved by less than one tile with a transform
  and never repainted. One scroll read per frame drives all three.
*/

const svg = (w: number, h: number, body: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>${body}</svg>`)}")`;

const MID = { w: 520, h: 520 };
const NEAR = { w: 1100, h: 1300 };

// Plus marks, small rings and squares, scattered like notes on a drawing.
const midTile = svg(
  MID.w,
  MID.h,
  `<g fill='none' stroke='#000' stroke-width='1.2'>
    <path d='M60 52v16M52 60h16'/><path d='M330 118v16M322 126h16'/><path d='M150 300v16M142 308h16'/>
    <path d='M440 380v16M432 388h16'/><path d='M260 470v16M252 478h16'/>
    <circle cx='420' cy='60' r='6'/><circle cx='90' cy='420' r='4'/><circle cx='300' cy='250' r='3'/>
    <rect x='205' y='40' width='10' height='10'/><rect x='470' y='240' width='8' height='8'/><rect x='30' y='220' width='8' height='8'/>
  </g>`
);

// Big orbit rings, dotted arcs and a dashed launch trail with its little rocket.
const nearTile = svg(
  NEAR.w,
  NEAR.h,
  `<g fill='none' stroke='#000' stroke-width='1.4'>
    <circle cx='160' cy='240' r='120'/><circle cx='160' cy='240' r='170' stroke-dasharray='2 9'/>
    <circle cx='160' cy='70' r='5' fill='#000'/>
    <circle cx='930' cy='760' r='210' stroke-dasharray='2 9'/><circle cx='930' cy='760' r='150'/>
    <circle cx='1080' cy='700' r='5' fill='#000'/>
    <path d='M80 1200 C 260 1080, 360 980, 520 860' stroke-dasharray='6 10'/>
    <path d='M520 860 l-6 -18 l16 8 z' fill='#000'/>
    <path d='M640 220 h120 M700 160 v120' stroke-dasharray='3 7'/>
    <rect x='820' y='120' width='60' height='60' stroke-dasharray='3 6'/>
  </g>`
);

export function Backdrop() {
  const far = useRef<HTMLDivElement>(null);
  const mid = useRef<HTMLDivElement>(null);
  const near = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layers = [
      { el: far.current!, speed: 0.04, tile: 48 },
      { el: mid.current!, speed: 0.14, tile: MID.h },
      { el: near.current!, speed: 0.3, tile: NEAR.h },
    ];
    let last = -1;
    const tick = () => {
      const y = window.scrollY;
      if (y === last) return;
      last = y;
      for (const l of layers) {
        // Wrap within one tile so the layer never runs out.
        const off = (y * l.speed) % l.tile;
        l.el.style.transform = `translate3d(0, ${(-off).toFixed(1)}px, 0)`;
      }
    };
    gsap.ticker.add(tick);
    tick();
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <div className="backdrop" aria-hidden>
      <div ref={far} className="backdrop__layer backdrop__far" />
      <div ref={mid} className="backdrop__layer backdrop__mid" style={{ maskImage: midTile, WebkitMaskImage: midTile }} />
      <div ref={near} className="backdrop__layer backdrop__near" style={{ maskImage: nearTile, WebkitMaskImage: nearTile }} />
    </div>
  );
}
