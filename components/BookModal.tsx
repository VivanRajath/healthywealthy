"use client";

import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Mail, CircleCheck, ArrowRight } from "lucide-react";


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
  // The button that opened the dialog gets focus back when it closes.
  const opener = useRef<HTMLElement | null>(null);

  // Each opening starts a fresh form.
  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement | null;
    setSent(false);
    setError("");
  }, [open]);

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

  /*
    Radix Dialog keeps focus inside, closes on Escape or a click outside, locks page
    scroll and returns focus to the button that opened it.
  */
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="bm" />
        <Dialog.Content
          className="bm__panel"
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            input.current?.focus();
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            opener.current?.focus();
          }}
        >
          <span className="corner corner--tl" />
          <span className="corner corner--br" />
          <Dialog.Close className="bm__close" aria-label="Close booking">
            <X size={18} />
          </Dialog.Close>

          {sent ? (
            <div className="bm__done" role="status">
              <CircleCheck size={40} strokeWidth={1.4} aria-hidden />
              <Dialog.Title>Spot requested.</Dialog.Title>
              <p>
                We will email the joining details for <strong>{className}</strong> to <strong>{email.trim()}</strong>{" "}
                within one working day.
              </p>
              <Dialog.Close className="sbtn sbtn--dark bm__btn">
                <span className="sbtn__label">Done</span>
              </Dialog.Close>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <span className="bm__eyebrow">Book a free spot</span>
              <Dialog.Title className="bm__title">{className}</Dialog.Title>
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
