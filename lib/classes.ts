import type { LucideIcon } from "lucide-react";
import {
  Brain,
  Wind,
  HeartPulse,
  Flame,
  Smile,
  Music,
  Moon,
  Sparkles,
  Waves,
  ShieldCheck,
  Droplets,
  Target,
  PersonStanding,
  Feather,
  Zap,
  Dumbbell,
  BatteryCharging,
  Bone,
} from "lucide-react";
import { img } from "./content";

/*
  Health classes. Times, places and levels are placeholder copy for the design.
  Confirm the real schedule with the client before launch.
*/

export type HealthClass = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  hero: string;
  heroAlt: string;
  gallery: { src: string; alt: string }[];
  facts: { duration: string; schedule: string; where: string; level: string; equipment: string; intensity: number };
  about: string[];
  flow: { minutes: string; title: string; text: string }[];
  benefits: { icon: LucideIcon; title: string; text: string }[];
  goodFor: string[];
  note?: string;
};

export const classes: HealthClass[] = [
  {
    slug: "yoga",
    name: "Yoga",
    tagline: "Strength, balance and calm, one breath at a time.",
    summary: "A steady morning flow that builds strength and mobility and leaves your mind quieter than it found it.",
    hero: img("1575052814086-f385e2e2ad1b"),
    heroAlt: "A woman holding a yoga pose on a mat in a bright room",
    gallery: [
      { src: img("1588286840104-8957b019727f", 1400), alt: "A group holding a warrior pose together in a studio" },
      { src: img("1545389336-cf090694435e", 1400), alt: "A person in tree pose on a misty mountain" },
      { src: img("1544367567-0f2fcb009e0b", 1400), alt: "A yoga pose silhouetted against the sea at dusk" },
    ],
    facts: { duration: "45 to 60 min", schedule: "Mon to Sat, 6:30 am", where: "Live on Google Meet", level: "All levels", equipment: "A mat", intensity: 2 },
    about: [
      "Every session moves through the same shape: arrive and breathe, warm the spine, build heat with standing poses, then slow right down. The coach offers an easier and a harder option for every pose, so beginners and regulars share the same class.",
      "Over a few weeks you will notice it first in small places. Getting out of bed, carrying the shopping, sitting at a desk all afternoon. That is the 1% at work.",
    ],
    flow: [
      { minutes: "5 min", title: "Arrive and breathe", text: "Settle in, check in with your body, slow breathing to start." },
      { minutes: "10 min", title: "Warm up", text: "Spine rolls, sun salutations and gentle mobility." },
      { minutes: "25 min", title: "Main flow", text: "Standing poses, balance and strength, building gently." },
      { minutes: "10 min", title: "Cool down", text: "Hips, hamstrings and twists to release the work." },
      { minutes: "5 min", title: "Rest", text: "A few quiet minutes before the day begins." },
    ],
    benefits: [
      { icon: PersonStanding, title: "Better posture", text: "A stronger back and core make long days at a desk easier." },
      { icon: Feather, title: "Mobility", text: "Hips, shoulders and spine that move freely again." },
      { icon: Brain, title: "Calmer mind", text: "Breath-led movement brings your stress down before the day starts." },
      { icon: Moon, title: "Better sleep", text: "Members often say they sleep more deeply within a few weeks." },
    ],
    goodFor: ["Complete beginners", "Desk workers with stiff backs", "Runners and lifters who need mobility", "Anyone who wants a calmer start to the day"],
  },
  {
    slug: "zumba",
    name: "Zumba",
    tagline: "Dance cardio that feels like a party, not a workout.",
    summary: "Latin and Bollywood rhythms, simple steps and a lot of energy. You will sweat, and you will probably laugh.",
    hero: img("1524594152303-9fd13543fe6e"),
    heroAlt: "A dance fitness class moving together in a bright studio",
    gallery: [
      { src: img("1518310383802-640c2de311b2", 1400), alt: "A group class mid-move in a sunlit studio" },
      { src: img("1547153760-18fc86324498", 1400), alt: "A dancer moving with flowing fabric" },
      { src: img("1535525153412-5a42439a210d", 1400), alt: "A dancer leaping on a city street at night" },
    ],
    facts: { duration: "45 min", schedule: "Tue, Thu and Sat, 7:15 am", where: "Live on Google Meet", level: "All levels", equipment: "Trainers and water", intensity: 4 },
    about: [
      "Each class strings together short songs, each with a few easy steps the coach builds on. You never need to know the routine. Follow along, get it wrong, keep moving.",
      "It is the class members bring friends and family to. Kitchen, living room, terrace: anywhere with a little floor space works.",
    ],
    flow: [
      { minutes: "5 min", title: "Warm up", text: "Easy steps and arm swings to get the heart going." },
      { minutes: "30 min", title: "Dance blocks", text: "Song by song, alternating high and lower energy tracks." },
      { minutes: "5 min", title: "Floor finisher", text: "A short core and leg burner to close the dance." },
      { minutes: "5 min", title: "Cool down", text: "Slow music, stretches and steady breathing." },
    ],
    benefits: [
      { icon: HeartPulse, title: "Heart health", text: "Sustained cardio that strengthens your heart and lungs." },
      { icon: Flame, title: "Calorie burn", text: "One of the most active sessions of the week." },
      { icon: Smile, title: "Mood lift", text: "Music and movement together are a reliable pick-me-up." },
      { icon: Music, title: "Coordination", text: "Rhythm and footwork that sharpen balance and timing." },
    ],
    goodFor: ["People who find gym workouts boring", "Families and friends joining together", "Building cardio fitness", "Anyone who loves music"],
    note: "Wear supportive trainers and clear a little space around you.",
  },
  {
    slug: "meditation",
    name: "Meditation",
    tagline: "Twenty minutes that make the other 23 hours easier.",
    summary: "Guided meditation and breathwork to steady your attention and quieten a busy mind. No experience needed.",
    hero: img("1508672019048-805c876b67e2"),
    heroAlt: "A person meditating at the end of a wooden dock on a still mountain lake",
    gallery: [
      { src: img("1510894347713-fc3ed6fdf539", 1400), alt: "A woman meditating on a mat at home" },
      { src: img("1506126613408-eca07ce68773", 1400), alt: "A person meditating on a wooden deck in morning light" },
      { src: img("1552196563-55cd4e45efb3", 1400), alt: "A woman sitting cross-legged on a mat in a quiet studio" },
    ],
    facts: { duration: "20 to 30 min", schedule: "Daily, 6:00 am and 9:30 pm", where: "Live on Google Meet", level: "All levels", equipment: "A cushion or chair", intensity: 1 },
    about: [
      "Each session pairs one breathing technique with one guided practice: body scan, focused attention or loving kindness. The coach talks you through every minute, so there is nothing to get right.",
      "The evening session is gentler and built to help you wind down for sleep. Many members do the morning one on weekdays and the evening one when work runs late.",
    ],
    flow: [
      { minutes: "3 min", title: "Settle", text: "Find a comfortable seat and let the day go for a moment." },
      { minutes: "7 min", title: "Breathwork", text: "A simple, timed breathing pattern to slow the body down." },
      { minutes: "12 min", title: "Guided practice", text: "Body scan, focused attention or a visualisation." },
      { minutes: "3 min", title: "Close", text: "A short reflection to carry into the rest of the day." },
    ],
    benefits: [
      { icon: Brain, title: "Focus", text: "Training attention makes it easier to stay with one task." },
      { icon: Wind, title: "Less stress", text: "Slow breathing calms the body's stress response." },
      { icon: Moon, title: "Deeper sleep", text: "The evening practice is designed as a bridge into sleep." },
      { icon: Sparkles, title: "Clarity", text: "A pause that helps you respond rather than react." },
    ],
    goodFor: ["Busy minds and racing thoughts", "Anyone struggling to switch off at night", "Complete beginners", "Pairing with yoga or strength days"],
  },
  {
    slug: "water-aerobics",
    name: "Water Aerobics",
    tagline: "Full-body fitness that is kind to your joints.",
    summary: "Cardio and strength in the pool. The water supports your body and adds gentle resistance to every move.",
    hero: img("1519315901367-f34ff9154487"),
    heroAlt: "A swimmer moving through a bright blue lane pool",
    gallery: [
      { src: img("1600965962361-9035dbfd1c50", 1400), alt: "A person exercising in a clear pool" },
      { src: img("1576013551627-0cc20b96c2a7", 1400), alt: "An outdoor pool surrounded by trees" },
      { src: img("1530549387789-4c1017266635", 1400), alt: "A swimmer mid-stroke in a lane" },
    ],
    facts: { duration: "45 min", schedule: "Wed and Sun, 7:00 am", where: "Partner pools in select cities", level: "All levels, no swimming needed", equipment: "Swimwear and a towel", intensity: 3 },
    about: [
      "Classes take place in the shallow end, at chest height, so you do not need to be a swimmer. The coach leads from the side of the pool with simple moves that use the water for both support and resistance.",
      "Because the water carries most of your weight, it is a favourite for members returning from injury, those with sore knees or backs, and anyone who wants a hard workout without the pounding.",
    ],
    flow: [
      { minutes: "5 min", title: "Water walk", text: "Walking and arm sweeps to get used to the water." },
      { minutes: "15 min", title: "Cardio intervals", text: "Jogs, jumping jacks and kicks against the water." },
      { minutes: "15 min", title: "Strength", text: "Pushes, pulls and lunges using the water's resistance." },
      { minutes: "10 min", title: "Stretch and float", text: "Gentle stretches and a calm finish." },
    ],
    benefits: [
      { icon: ShieldCheck, title: "Low impact", text: "Easy on knees, hips and back while still working hard." },
      { icon: Waves, title: "Full body", text: "Water resists every movement, in every direction." },
      { icon: HeartPulse, title: "Heart health", text: "Steady cardio without overheating." },
      { icon: Droplets, title: "Recovery", text: "A good active-recovery day between harder sessions." },
    ],
    goodFor: ["Joint pain or returning from injury", "Older members", "Non-swimmers", "Anyone wanting a gentler cardio day"],
    note: "Pool locations and timings are shared when you book. Confirm with your doctor if you are recovering from an injury.",
  },
  {
    slug: "pilates",
    name: "Pilates",
    tagline: "A strong centre makes everything else easier.",
    summary: "Slow, precise mat work that builds deep core strength, protects your back and improves posture.",
    hero: img("1518611012118-696072aa579a"),
    heroAlt: "A group doing mat exercises in a bright brick studio",
    gallery: [
      { src: img("1600881333168-2ef49b341f30", 1400), alt: "A woman in a downward dog stretch on a mat" },
      { src: img("1599901860904-17e6ed7083a0", 1400), alt: "A black and white photo of a mat exercise" },
      { src: img("1552196563-55cd4e45efb3", 1400), alt: "A woman seated on a mat preparing to stretch" },
    ],
    facts: { duration: "40 min", schedule: "Mon, Wed and Fri, 7:15 am", where: "Live on Google Meet", level: "Beginner to intermediate", equipment: "A mat, a towel for support", intensity: 3 },
    about: [
      "Pilates is about control rather than speed. Each exercise is done slowly and with attention, so small muscles that support your spine finally get some work.",
      "The coach breaks every movement down and watches form closely, which makes it a good class for anyone who has been told to strengthen their core.",
    ],
    flow: [
      { minutes: "5 min", title: "Breath and set-up", text: "Finding neutral spine and connecting breath to the core." },
      { minutes: "25 min", title: "Mat sequence", text: "Core, glutes and back in slow, controlled sets." },
      { minutes: "5 min", title: "Challenge", text: "A harder progression for those who want it." },
      { minutes: "5 min", title: "Release", text: "Stretching the back, hips and shoulders." },
    ],
    benefits: [
      { icon: Target, title: "Core strength", text: "Deep abdominal and back muscles that support your spine." },
      { icon: PersonStanding, title: "Posture", text: "Standing and sitting taller without thinking about it." },
      { icon: Bone, title: "Back care", text: "A stronger centre often means fewer aches." },
      { icon: Feather, title: "Control", text: "Better balance and body awareness in everyday movement." },
    ],
    goodFor: ["Back pain from long hours sitting", "New parents rebuilding core strength", "Runners and cyclists", "Pairing with yoga"],
  },
  {
    slug: "strength-hiit",
    name: "Strength & HIIT",
    tagline: "Short, hard and done before breakfast.",
    summary: "Bodyweight strength and high-intensity intervals that build fitness fast, with options for every level.",
    hero: img("1536922246289-88c42f957773"),
    heroAlt: "Two people doing box jumps in a gym",
    gallery: [
      { src: img("1599058917212-d750089bc07e", 1400), alt: "A person training with battle ropes" },
      { src: img("1574680096145-d05b474e2155", 1400), alt: "A woman lifting a barbell in a dark gym" },
      { src: img("1517130038641-a774d04afb3c", 1400), alt: "A group training with resistance bands" },
    ],
    facts: { duration: "30 min", schedule: "Tue, Thu and Sat, 6:00 am", where: "Live on Google Meet", level: "Intermediate, with easier options", equipment: "None, bands optional", intensity: 5 },
    about: [
      "Each session alternates strength circuits with short bursts of high-intensity work and planned rest. Everything is bodyweight, so you need nothing more than a little floor space.",
      "The coach shows a lower-impact version of every exercise. Start there, and move up as the weeks go by. Your consistency score cares that you showed up, not how fast you went.",
    ],
    flow: [
      { minutes: "5 min", title: "Warm up", text: "Dynamic mobility and a gradual build in pace." },
      { minutes: "10 min", title: "Strength circuit", text: "Squats, push-ups, lunges and holds." },
      { minutes: "10 min", title: "Intervals", text: "Work and rest blocks that push your heart rate up." },
      { minutes: "5 min", title: "Cool down", text: "Stretching and breathing to bring everything back down." },
    ],
    benefits: [
      { icon: Dumbbell, title: "Strength", text: "Muscle that protects joints and keeps you capable as you age." },
      { icon: Zap, title: "Fitness, fast", text: "Big gains in stamina from short sessions." },
      { icon: Flame, title: "Metabolism", text: "Intervals keep your body working after the class ends." },
      { icon: BatteryCharging, title: "Energy", text: "A hard start that carries you through the day." },
    ],
    goodFor: ["Short on time", "Building strength at home", "People who like a challenge", "Pairing with yoga or Pilates for balance"],
    note: "High intensity. Check with your doctor first if you have a heart condition or are new to exercise.",
  },
];

export const getClass = (slug: string) => classes.find((c) => c.slug === slug);
