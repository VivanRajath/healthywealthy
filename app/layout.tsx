import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { ModeProvider } from "@/components/ModeProvider";
import { MarketProvider } from "@/components/MarketProvider";
import "./globals.css";
import "./markets.css";
import "./sections.css";
import "./rocket.css";
import "./classes.css";
import "./about.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT"],
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
    <html lang="en" data-mode="health" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      {/* Browser extensions (ColorZilla, Grammarly and others) add attributes to <body> before React loads. */}
      <body suppressHydrationWarning>
        <ModeProvider>
          <MarketProvider>{children}</MarketProvider>
        </ModeProvider>
      </body>
    </html>
  );
}
