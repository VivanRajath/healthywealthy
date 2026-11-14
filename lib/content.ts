import type { LucideIcon } from "lucide-react";
import {
  Video,
  Flower2,
  Dumbbell,
  SlidersHorizontal,
  Link2,
  Copy,
  KeyRound,
  Percent,
} from "lucide-react";

export type Mode = "health" | "wealth";

export const img = (id: string, w = 2400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const brand = {
  name: "1% Daily",
  full: "1% Daily Healthy Wealthy",
  tagline: "1% better, every day.",
};

/* One place for the risk line so every wealth surface says the same thing. */
export const riskLine =
  "Trading involves risk and losses can occur. Profit targets are goals, not guarantees, and past results do not predict future results.";

export type Pillar = {
  icon: LucideIcon;
  title: string;
  line: string;
  detail: string;
  screen: {
    title: string;
    metric: string;
    unit: string;
    delta: string;
    points: number[];
    rows: [string, string][];
    cta: string;
  };
};

type ModeContent = {
  label: string;
  image: string;
  imageAlt: string;
  bannerTitle: string;
  bannerText: string;
  pillarsHeading: string;
  pillarsSub: string;
  pillars: Pillar[];
  note?: string;
};

export const content: Record<Mode, ModeContent> = {
  health: {
    label: "Health",
    image: img("1544367567-0f2fcb009e0b"),
    imageAlt: "A woman holding a yoga pose by the sea at dusk",
    bannerTitle: "A live yoga and movement session every morning, free for members.",
    bannerText:
      "30 to 60 minutes on Google Meet at the same time every day. Join from anywhere and shape the routine around your own body.",
    pillarsHeading: "Show up for one session a day.",
    pillarsSub: "That is the whole commitment. The routine, the coach and the community take care of the rest.",
    pillars: [
      {
        icon: Video,
        title: "Live on Google Meet",
        line: "A fixed morning time, the same link every day.",
        detail: "Sessions run 30 to 60 minutes. Join with your camera on or off, from your living room, a hotel or a park.",
        screen: {
          title: "Today's session",
          metric: "6:30",
          unit: "am, Google Meet",
          delta: "Starts in 12 min",
          points: [30, 34, 33, 40, 44, 42, 50, 55, 58],
          rows: [
            ["Session", "Morning flow"],
            ["Length", "45 min"],
            ["Joined today", "Live count"],
          ],
          cta: "Join session",
        },
      },
      {
        icon: Flower2,
        title: "Yoga and breathwork",
        line: "Mobility, balance and calm to start the day.",
        detail: "Guided flows for every level, with breathwork to settle the mind before the day gets busy.",
        screen: {
          title: "This week",
          metric: "5 of 7",
          unit: "mornings attended",
          delta: "Streak growing",
          points: [20, 28, 26, 34, 40, 38, 46, 52, 60],
          rows: [
            ["Mon", "Sun salutations"],
            ["Wed", "Hip mobility"],
            ["Fri", "Breath and balance"],
          ],
          cta: "See the week",
        },
      },
      {
        icon: Dumbbell,
        title: "Strength and movement",
        line: "Bodyweight strength and cardio, no equipment needed.",
        detail: "Short strength blocks build into the flow on alternate days so you get stronger, not just more flexible.",
        screen: {
          title: "Movement",
          metric: "Day 14",
          unit: "of the challenge",
          delta: "Consistency rising",
          points: [22, 26, 30, 29, 36, 42, 41, 50, 56],
          rows: [
            ["Strength", "Tue, Thu, Sat"],
            ["Cardio", "Mon, Fri"],
            ["Equipment", "None"],
          ],
          cta: "Log today",
        },
      },
      {
        icon: SlidersHorizontal,
        title: "Your routine, your pace",
        line: "Adjust the routine to find your own best day.",
        detail: "Swap poses, shorten a session or add a second one. The best routine is the one you keep.",
        screen: {
          title: "My routine",
          metric: "35",
          unit: "minutes a day",
          delta: "Adjusted by you",
          points: [30, 30, 34, 34, 38, 38, 42, 42, 46],
          rows: [
            ["Focus", "Back and hips"],
            ["Intensity", "Moderate"],
            ["Rest day", "Sunday"],
          ],
          cta: "Edit routine",
        },
      },
    ],
  },
  wealth: {
    label: "Wealth",
    image: img("1559526324-4b87b5e36e44"),
    imageAlt: "Hands on a laptop showing a trading dashboard on a wooden desk",
    bannerTitle: "Link your trading account and copy a master account, trade by trade.",
    bannerText:
      "Your money never leaves your own account. You can withdraw any time, and you can stop copying whenever you choose.",
    pillarsHeading: "Copy-trading, with you in control.",
    pillarsSub: "Four things to know before you link an account.",
    pillars: [
      {
        icon: Link2,
        title: "Link your own account",
        line: "Connect the trading account you already hold.",
        detail: "Your funds stay in your name with your broker. We never hold your money.",
        screen: {
          title: "Linked account",
          metric: "Active",
          unit: "copying the master",
          delta: "Account in your name",
          points: [30, 32, 31, 36, 38, 37, 42, 44, 46],
          rows: [
            ["Broker", "Your broker"],
            ["Account", "Ending 4821"],
            ["Status", "Connected"],
          ],
          cta: "Manage link",
        },
      },
      {
        icon: Copy,
        title: "Trades copied automatically",
        line: "Every master trade is mirrored in your account.",
        detail: "When the master account places a trade, the same trade is placed in your linked account, sized to your balance.",
        screen: {
          title: "Master trades",
          metric: "Live",
          unit: "mirroring on",
          delta: "Sized to your balance",
          points: [28, 34, 30, 38, 35, 42, 40, 47, 45],
          rows: [
            ["10:02", "Buy RELIANCE"],
            ["11:47", "Sell TCS"],
            ["14:15", "Buy GOLDBEES"],
          ],
          cta: "View trades",
        },
      },
      {
        icon: KeyRound,
        title: "Full control, always",
        line: "Withdraw any time. Change your password to stop.",
        detail: "You keep full withdrawal rights. If you change your trading account password, copying disconnects automatically.",
        screen: {
          title: "Your controls",
          metric: "Yours",
          unit: "funds and access",
          delta: "Withdraw any time",
          points: [40, 40, 40, 40, 40, 40, 40, 40, 40],
          rows: [
            ["Withdrawals", "Any time"],
            ["Password change", "Stops copying"],
            ["Reconnect", "Any time"],
          ],
          cta: "Pause copying",
        },
      },
      {
        icon: Percent,
        title: "Profit share only",
        line: "We share in profits. No other fees.",
        detail: "The company keeps 50% of the profit on copied trades. There is no subscription, no joining fee and no other charge.",
        screen: {
          title: "Fees",
          metric: "50%",
          unit: "of profit, nothing else",
          delta: "No subscription",
          points: [20, 20, 20, 20, 20, 20, 20, 20, 20],
          rows: [
            ["Joining fee", "None"],
            ["Monthly fee", "None"],
            ["Profit share", "50%"],
          ],
          cta: "Read the terms",
        },
      },
    ],
    note: riskLine,
  },
};
