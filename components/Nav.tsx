"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import { SButton } from "./SButton";
import { useMode } from "./ModeProvider";
import { TickerTape } from "./TickerTape";
import type { Mode } from "@/lib/content";

const links: { href: string; label: string; mode?: Mode }[] = [
  { href: "/#about", label: "About" },
  { href: "/#plans", label: "Health", mode: "health" },
  { href: "/#plans", label: "Wealth", mode: "wealth" },
  { href: "/#classes", label: "Classes", mode: "health" },
  { href: "/#markets", label: "Markets" },
  { href: "/#faq", label: "FAQ" },
];

// Class pages are about health only, so they leave the market ticker out.
export function Nav({ ticker = true }: { ticker?: boolean }) {
  const { setMode } = useMode();
  const [open, setOpen] = useState(false);
  const [onDark, setOnDark] = useState(true);
  // The ticker tucks away while you read down the page and returns when you scroll back up.
  const [tucked, setTucked] = useState(false);
  // Shared scroll value, read once per frame by the animation loop. Reading window.scrollY
  // inside a scroll handler would force a full layout on every scroll event.
  const { scrollY } = useScroll();
  const limit = useRef(0);
  const last = useRef(0);
  useMotionValueEvent(scrollY, "change", (v) => {
    setOnDark(v < limit.current);
    const d = v - last.current;
    if (Math.abs(d) > 6) {
      setTucked(d > 0 && v > 240);
      last.current = v;
    }
  });

  useEffect(() => {
    // The nav sits on the photo only until the photo starts shrinking into its card.
    // The hero's height is read on resize only.
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

  const go = (l: (typeof links)[number]) => {
    if (l.mode) setMode(l.mode);
    setOpen(false);
  };

  return (
    <header className={`nav${onDark ? " is-dark" : ""}${tucked ? " is-tucked" : ""}`}>
      <div className="nav__inner">
        <Logo />
        <nav className="nav__tiles" aria-label="Primary">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="nav__tile" data-side={l.mode && l.label !== "Classes" ? l.mode : undefined} onClick={() => go(l)}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="/#enquiry" className="nav__cta">
          <span>Book now</span>
          <span className="nav__cta-arrow" aria-hidden>
            <ArrowRight size={16} strokeWidth={1.8} />
          </span>
        </a>

        {/* Phone and tablet: a full-screen menu with focus kept inside it. */}
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger className="nav__burger" aria-label="Open menu">
            <Menu size={20} />
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Content className="menu" aria-describedby={undefined}>
              <div className="menu__bar">
                <Logo />
                <Dialog.Close className="menu__close" aria-label="Close menu">
                  <X size={20} />
                </Dialog.Close>
              </div>
              <Dialog.Title className="menu__label">Menu</Dialog.Title>
              <nav className="menu__links" aria-label="Menu">
                {links.map((l, i) => (
                  <a key={l.label} href={l.href} onClick={() => go(l)} style={{ "--i": i } as React.CSSProperties}>
                    <span className="menu__num">{String(i + 1).padStart(2, "0")}</span>
                    {l.label}
                    <ArrowRight className="menu__go" size={20} strokeWidth={1.6} aria-hidden />
                  </a>
                ))}
              </nav>
              <SButton href="/#enquiry" variant="dark" className="menu__cta" onClick={() => setOpen(false)}>
                Book now
              </SButton>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
      {ticker && (
        <div className="nav__tape">
          <div>
            <TickerTape />
          </div>
        </div>
      )}
    </header>
  );
}
