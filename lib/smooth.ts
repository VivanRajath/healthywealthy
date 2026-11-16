"use client";

/* Glide to an element or y position with the browser's own smooth scrolling. */
export const smooth = {
  to(target: number | HTMLElement, offset = 0) {
    const y = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: y + offset, behavior: "smooth" });
  },
};
