/*
  Scroll stops: the positions one wheel or trackpad gesture moves between.

  The hero scrolls freely, like any page. Stepping starts where the hero ends
  (freeUntil): from there each gesture glides to the next stop.

  - Each section's top is a stop.
  - A pinned scene (the hero, the lift-off) is one move: a stop at its start and one at
    its end, nothing between, so one gesture plays the whole scene.
  - Each rocket part in "Inside the rocket" is a stop, placed as the part list does.
  - Anything taller than a screen gets a stop about every screen, so long sections
    are read a screen at a time and never skipped.
*/

const top = (el: Element) => el.getBoundingClientRect().top + window.scrollY;

export function computeStops(): { stops: number[]; freeUntil: number } {
  const vh = window.innerHeight;
  const max = document.documentElement.scrollHeight - vh;
  const stops: number[] = [0];
  // Ranges played by a single gesture: no stops are filled in between.
  const pinned: [number, number][] = [];

  const hero = document.querySelector<HTMLElement>(".hero");
  let freeUntil = 0;
  if (hero) {
    const end = top(hero) + hero.offsetHeight - vh;
    stops.push(end);
    pinned.push([top(hero), end]);
    freeUntil = end;
  }

  for (const sel of ["#about", "#inside", ".tabs > :not(.launch)", "#classes", "#challenge", "#markets", "#stories", "#faq", "#enquiry", "footer"]) {
    const el = document.querySelector(sel);
    if (el) stops.push(top(el));
  }

  // One stop per rocket part, with the part a third of the way down the screen.
  document.querySelectorAll<HTMLElement>(".rpart").forEach((el) => stops.push(top(el) - vh * 0.3));

  const launch = document.querySelector<HTMLElement>(".launch");
  if (launch) {
    const span = launch.offsetHeight - vh;
    const start = top(launch) + span * 0.04; // on the pad
    const end = top(launch) + span; // panel up, copy in
    stops.push(start, end);
    pinned.push([start, end]);
  }

  stops.push(max);
  const sorted = [...new Set(stops.map((s) => Math.round(Math.min(max, Math.max(0, s)))))].sort((a, b) => a - b);

  // Fill long gaps with a stop about every screen, except inside pinned scenes.
  const out: number[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const a = sorted[i];
    out.push(a);
    const b = sorted[i + 1];
    if (b === undefined) break;
    const inPin = pinned.some(([s, e]) => a >= s - 2 && b <= e + 2);
    if (inPin) continue;
    const gap = b - a;
    if (gap > vh * 1.15) {
      const n = Math.ceil(gap / (vh * 0.9));
      for (let k = 1; k < n; k++) out.push(Math.round(a + (gap * k) / n));
    }
  }
  // Drop stops that are too close to be worth a move of their own.
  return { stops: out.filter((s, i) => i === 0 || s - out[i - 1] > vh * 0.2), freeUntil };
}
