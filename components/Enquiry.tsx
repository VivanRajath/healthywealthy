"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, CircleCheck, Mail, MessageCircle, Phone, Camera, Play, Briefcase, AtSign } from "lucide-react";
import { ParallaxImage, Reveal, ease } from "./Motion";
import { img } from "@/lib/content";

const interests = ["Daily yoga sessions", "Copy-trading", "30 day challenge", "Both health and wealth"];

/* Replace the hrefs with the client's real handles. */
const socials = [
  { label: "Instagram", icon: Camera, href: "#" },
  { label: "YouTube", icon: Play, href: "#" },
  { label: "WhatsApp", icon: MessageCircle, href: "#" },
  { label: "LinkedIn", icon: Briefcase, href: "#" },
  { label: "X", icon: AtSign, href: "#" },
];

type Errors = Partial<Record<"name" | "phone" | "email" | "consent", string>>;

export function Enquiry() {
  const [picked, setPicked] = useState<string[]>([interests[0]]);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState<string | null>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const phone = String(f.get("phone") || "").replace(/\D/g, "");
    const email = String(f.get("email") || "").trim();
    const next: Errors = {};
    if (!name) next.name = "Enter your name so we know who to reply to.";
    if (phone.length < 10) next.phone = "Enter a 10 digit mobile number.";
    if (email && !/^\S+@\S+\.\S+$/.test(email)) next.email = "Check the email address, it looks incomplete.";
    if (!f.get("consent")) next.consent = "Tick the box so we can contact you.";
    setErrors(next);
    if (Object.keys(next).length) return;
    // No backend yet: connect this to the client's form service or CRM.
    setSent(name.split(" ")[0]);
  }

  const toggle = (v: string) => setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));

  return (
    <section className="enquiry" id="enquiry">
      <ParallaxImage className="enquiry__bg" src={img("1470252649378-9c29740c9fa8")} alt="" strength={14} />
      <div className="enquiry__scrim" aria-hidden />
      <span className="corner corner--tl" />
      <span className="corner corner--tr" />
      <span className="corner corner--bl" />
      <span className="corner corner--br" />

      <div className="enquiry__inner">
        <div className="enquiry__copy">
          <Reveal>
            <h2 className="enquiry__title">Start your first 1% tomorrow morning.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="enquiry__sub">
              We reply within one working day.
            </p>
          </Reveal>

          <ul className="contact">
            <li>
              <Phone size={16} aria-hidden />
              +91 80000 00000
            </li>
            <li>
              <Mail size={16} aria-hidden />
              hello@onepercentdaily.in
            </li>
          </ul>

          <div className="socials">
            {socials.map((s) => {
              const Icon = s.icon;
              return (
                <a key={s.label} href={s.href} className="social" aria-label={s.label}>
                  <Icon size={16} strokeWidth={1.8} aria-hidden />
                  <span>{s.label}</span>
                  <ArrowUpRight size={14} className="social__arrow" aria-hidden />
                </a>
              );
            })}
          </div>
        </div>

        <div className="form-wrap">
          <AnimatePresence mode="wait" initial={false}>
            {sent ? (
              <motion.div
                key="done"
                className="form-done"
                role="status"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease }}
              >
                <CircleCheck size={36} strokeWidth={1.4} aria-hidden />
                <h3>Thanks, {sent}. Enquiry sent.</h3>
                <p>We will call or message you within one working day with the session link and next steps.</p>
                <button className="form-link" onClick={() => setSent(null)}>
                  Send another enquiry
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                className="form"
                noValidate
                onSubmit={submit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="form__row">
                  <label className={`field${errors.name ? " has-error" : ""}`}>
                    <span>Full name</span>
                    <input name="name" autoComplete="name" placeholder="Your name" />
                    {errors.name && <em>{errors.name}</em>}
                  </label>
                  <label className={`field${errors.phone ? " has-error" : ""}`}>
                    <span>Mobile number</span>
                    <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="10 digit number" />
                    {errors.phone && <em>{errors.phone}</em>}
                  </label>
                </div>
                <label className={`field${errors.email ? " has-error" : ""}`}>
                  <span>Email (optional)</span>
                  <input name="email" type="email" autoComplete="email" placeholder="you@example.com" />
                  {errors.email && <em>{errors.email}</em>}
                </label>

                <fieldset className="chips">
                  <legend>I am interested in</legend>
                  {interests.map((v) => (
                    <button
                      type="button"
                      key={v}
                      aria-pressed={picked.includes(v)}
                      className={picked.includes(v) ? "is-on" : ""}
                      onClick={() => toggle(v)}
                    >
                      {v}
                    </button>
                  ))}
                </fieldset>

                <label className="field">
                  <span>Message (optional)</span>
                  <textarea name="message" rows={3} placeholder="Preferred session time, questions, anything else" />
                </label>

                <label className={`check${errors.consent ? " has-error" : ""}`}>
                  <input type="checkbox" name="consent" />
                  <span>I agree to be contacted by phone, WhatsApp or email about my enquiry.</span>
                </label>
                {errors.consent && <em className="check__err">{errors.consent}</em>}

                <button type="submit" className="sbtn sbtn--light form__submit">
                  <span className="sbtn__label">Send enquiry</span>
                  <span className="sbtn__arrow" aria-hidden>
                    <ArrowRight size={18} strokeWidth={1.8} />
                  </span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
