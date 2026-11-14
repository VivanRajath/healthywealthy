"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import { SButton } from "./SButton";
import { useMode } from "./ModeProvider";
import { TickerTape } from "./TickerTape";
import type { Mode } from "@/lib/content";

const links: { href: string; label: string; mode?: Mode }[] = [
  { href: "/#about", label: "About" },
  { href: "/#inside", label: "Inside" },
  { href: "/#plans", label: "Health", mode: "health" },
  { href: "/#plans", label: "Wealth", mode: "wealth" },
  { href: "/#classes", label: "Classes", mode: "health" },
  { href: "/#challenge", label: "Challenge" },
  { href: "/#markets", label: "Markets" },
  { href: "/#faq", label: "FAQ" },
];

export function Nav() {
  const { setMode } = useMode();
  const [open, setOpen] = useState(false);
  const [onDark, setOnDark] = useState(true);
  // Shared scroll value, read once per frame by the animation loop. Reading window.scrollY
  // inside a scroll handler would force a full layout on every scroll event.
  const { scrollY } = useScroll();
  const limit = useRef(0);
  useMotionValueEvent(scrollY, "change", (v) => setOnDark(v < limit.current));

  useEffect(() => {
    // The nav sits on the photo only until the photo starts shrinking into its card.
    // The hero's height is read on resize only. Reading layout inside a scroll handler
    // forces the browser to recalculate the page on every scroll event.
    const measure = () => {
      // Any page can mark its photo hero with data-nav-dark="<fraction of its height>".
      const hero = document.querySelector("[data-nav-dark]") as HTMLElement | null;
      limit.current = hero ? hero.offsetTop + hero.offsetHeight * Number(hero.dataset.navDark || 0) : 0;
      setOnDark(scrollY.get() < limit.current);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [scrollY]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className={`nav${onDark ? " is-dark" : ""}`}>
      <div className="nav__inner">
        <Logo />
        <nav className="nav__tiles" aria-label="Primary">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="nav__tile" onClick={() => l.mode && setMode(l.mode)}>
              {l.label}
            </a>
          ))}
          <a href="/#enquiry" className="nav__tile nav__tile--cta">
            Book now
            <ArrowRight size={16} strokeWidth={1.8} aria-hidden />
          </a>
        </nav>
        <button
          className="nav__burger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <TickerTape />

      <div className={`drawer${open ? " is-open" : ""}`} aria-hidden={!open}>
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            onClick={() => {
              if (l.mode) setMode(l.mode);
              setOpen(false);
            }}
            tabIndex={open ? 0 : -1}
          >
            {l.label}
          </a>
        ))}
        <SButton href="/#enquiry" variant="dark" onClick={() => setOpen(false)}>
          Book now
        </SButton>
      </div>
    </header>
  );
}
