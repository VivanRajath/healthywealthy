"use client";

import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import { SButton } from "./SButton";
import { useMode } from "./ModeProvider";
import { TickerTape } from "./TickerTape";
import type { Mode } from "@/lib/content";

const links: { href: string; label: string; mode?: Mode }[] = [
  { href: "#about", label: "About" },
  { href: "#inside", label: "Inside" },
  { href: "#plans", label: "Health", mode: "health" },
  { href: "#plans", label: "Wealth", mode: "wealth" },
  { href: "#challenge", label: "Challenge" },
  { href: "#markets", label: "Markets" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const { setMode } = useMode();
  const [open, setOpen] = useState(false);
  const [onDark, setOnDark] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.querySelector(".hero__sticky") as HTMLElement | null;
      const frame = document.querySelector(".hero") as HTMLElement | null;
      if (!hero || !frame) return setOnDark(false);
      // The nav sits on the photo only until the photo starts shrinking into its card.
      setOnDark(window.scrollY < frame.offsetHeight * 0.22);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
          <a href="#enquiry" className="nav__tile nav__tile--cta">
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
        <SButton href="#enquiry" variant="dark" onClick={() => setOpen(false)}>
          Book now
        </SButton>
      </div>
    </header>
  );
}
