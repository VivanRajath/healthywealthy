import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope, IBM_Plex_Mono } from "next/font/google";
import { ModeProvider } from "@/components/ModeProvider";
import { MarketProvider } from "@/components/MarketProvider";
import { Depth3D } from "@/components/Depth3D";
import { Backdrop } from "@/components/Backdrop";
import { Prewarm } from "@/components/Prewarm";
import "./globals.css";
import "./markets.css";
import "./sections.css";
import "./rocket.css";
import "./inside.css";
import "./classes.css";
import "./about.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

// Prices, changes and chart scales only, so the trading side reads like a terminal.
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "1% Daily Healthy Wealthy | 1% better, every day",
  description:
    "Free daily live yoga on Google Meet, copy-trading you stay in control of, and a 30 day challenge. Get a little healthier and wealthier every day.",
  metadataBase: new URL("https://healthywealthy.club"),
};

export const viewport: Viewport = {
  themeColor: "#F2F4EF",
};

const boot = `try{var m=localStorage.getItem('hw-mode');if(m==='wealth'||m==='health'){document.documentElement.dataset.mode=m}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="health" className={`${display.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      {/* Browser extensions (ColorZilla, Grammarly and others) add attributes to <body> before React loads. */}
      <body suppressHydrationWarning>
        <ModeProvider>
          <MarketProvider>
            <Depth3D />
            <Backdrop />
            <Prewarm />
            {children}
          </MarketProvider>
        </ModeProvider>
      </body>
    </html>
  );
}
