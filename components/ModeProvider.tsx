"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Mode } from "@/lib/content";

type Ctx = {
  mode: Mode;
  setMode: (next: Mode) => void;
};

const ModeContext = createContext<Ctx | null>(null);

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used inside ModeProvider");
  return ctx;
}

function apply(next: Mode) {
  document.documentElement.dataset.mode = next;
  try {
    localStorage.setItem("hw-mode", next);
  } catch {}
}

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setState] = useState<Mode>("health");

  useEffect(() => {
    const stored = document.documentElement.dataset.mode;
    if (stored === "wealth") setState("wealth");
  }, []);

  const setMode = useCallback((next: Mode) => {
    apply(next);
    setState(next);
  }, []);

  return <ModeContext.Provider value={{ mode, setMode }}>{children}</ModeContext.Provider>;
}
