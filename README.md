# 1% Daily Healthy Wealthy

Next.js 16 static site for Cloudflare Pages. Health side uses teal `#1c8696`, Wealth side uses green `#22540e`. Fonts: Fraunces (headings) and Manrope (body).

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
npm start          # serves ./out
```

## Page structure (from the client brief)

1. Hero: "1% better, every day." with Explore now and Book now. Scroll morphs the photo into a data card.
2. About: statement plus a sticky scroll list, then the Health and Wealth tabs (`components/Tabs.tsx`, copy in `lib/content.ts`).
3. 30 day challenge: monthly theme, streak calendar, leaderboard (month and all time), past winners (`components/Challenge.tsx`).
4. Growth infographic with no numbers (`components/Growth.tsx`).
5. Markets: ticker tape and copy-trading terminal (`components/Markets.tsx`, `components/TickerTape.tsx`).
6. Testimonials slider (`components/Testimonials.tsx`).
7. FAQ accordion with filters (`components/Faq.tsx`).
8. Enquiry form and social links (`components/Enquiry.tsx`).
9. Footer with full risk disclosure (`components/Sections.tsx`).

## The story rocket

There is one rocket for the whole site (`components/StoryRocket.tsx`), drawn as an original six part SVG in `components/Rocket.tsx`.

Sections place invisible docks with `<RocketAnchor id=... />`. As you scroll, the rocket flies between the docks on either side of the middle of the screen, easing in size and angle and tilting into the direction of travel. A dock can:

- `hold` the rocket for a scroll range (pinned sections),
- follow a moving element (the hero graph, the growth curve, the lift off),
- set a `rotate` angle, show the `flame`, or `explode` the rocket into parts.

Current docks, in order: hero graph, hero card, About, Inside the rocket (opens part by part), Health and Wealth phone, challenge panel, growth curve, markets chart, testimonials, FAQ, enquiry lift off. To add a stop, drop a `RocketAnchor` into any section and size it with CSS (the box is the rocket's full drawing box, ratio 320 by 920). Styles live in `app/rocket.css`.

## Placeholders to replace before launch

- Website name, logo and final tagline (working name: 1% Daily Healthy Wealthy).
- Leaderboard names, streaks and winners: wire to real member data.
- Testimonials: real quotes with written consent. Avoid quotes about returns.
- Contact details and social links in `components/Enquiry.tsx` and `components/Sections.tsx`.
- Enquiry form has client side validation only. Connect it to a form service, CRM or a Cloudflare Worker.
- Market prices are simulated in `components/MarketProvider.tsx`. Replace with a licensed data feed.
- Photos are Unsplash placeholders.

## Compliance

The risk line lives in one place: `riskLine` in `lib/content.ts`. It appears under the Wealth tab, in the Markets notes, in the FAQ and in the footer. The 1% daily target appears only in the FAQ, as a target. Have the client confirm SEBI requirements (registration, advertising of returns, profit sharing) before launch.

## Deploy on Cloudflare Pages

1. Push this folder to a GitHub repo.
2. Cloudflare dashboard, Workers and Pages, Create, Pages, Connect to Git.
3. Framework preset: Next.js (Static HTML Export). Build command `npm run build`, output directory `out`.
4. Custom domains, add the GoDaddy domain.

## Point the GoDaddy domain to Cloudflare

1. Add the domain in Cloudflare (free plan). Cloudflare shows two nameservers.
2. GoDaddy, My Products, the domain, DNS, Nameservers, Change, "I'll use my own nameservers", paste the two Cloudflare nameservers.
3. Wait for propagation, then attach the domain to the Pages project.
