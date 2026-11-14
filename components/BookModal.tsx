"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Mail, CircleCheck, ArrowRight } from "lucide-react";
import { ease } from "./Motion";


export function BookModal({
  open,
  onClose,
  className,
  when,
}: {
  open: boolean;
  onClose: () => void;
  className: string;
  when: string;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    setSent(false);
    setError("");
    const t = window.setTimeout(() => input.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  const submit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address, for example you@example.com.");
      input.current?.focus();
      return;
    }
    setError("");
    setSent(true);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="bm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="bm__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bm-title"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4, ease }}
          >
            <span className="corner corner--tl" />
            <span className="corner corner--br" />
            <button className="bm__close" onClick={onClose} aria-label="Close booking">
              <X size={18} />
            </button>

            {sent ? (
              <div className="bm__done" role="status">
                <CircleCheck size={40} strokeWidth={1.4} aria-hidden />
                <h2 id="bm-title">Spot requested.</h2>
                <p>
                  We will email the joining details for <strong>{className}</strong> to <strong>{email.trim()}</strong>{" "}
                  within one working day.
                </p>
                <button className="sbtn sbtn--dark bm__btn" onClick={onClose}>
                  <span className="sbtn__label">Done</span>
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <span className="bm__eyebrow">Book a free spot</span>
                <h2 id="bm-title" className="bm__title">{className}</h2>
                <p className="bm__when">{when}</p>
                <label className={`bm__field${error ? " has-error" : ""}`}>
                  <span>Email address</span>
                  <span className="bm__input">
                    <Mail size={16} aria-hidden />
                    <input
                      ref={input}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={!!error}
                      aria-describedby={error ? "bm-error" : undefined}
                    />
                  </span>
                  {error && (
                    <em id="bm-error" role="alert">
                      {error}
                    </em>
                  )}
                </label>
                <button type="submit" className="sbtn sbtn--dark bm__btn">
                  <span className="sbtn__label">Request my spot</span>
                  <span className="sbtn__arrow" aria-hidden>
                    <ArrowRight size={18} strokeWidth={1.8} />
                  </span>
                </button>
                <p className="bm__fine">Free for members. We only use your email to send the session details.</p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
