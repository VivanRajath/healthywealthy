import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { RocketServices } from "@/components/RocketServices";
import { StoryRocket } from "@/components/StoryRocket";
import { Tabs } from "@/components/Tabs";
import { Challenge } from "@/components/Challenge";
import { Markets } from "@/components/Markets";
import { Testimonials } from "@/components/Testimonials";
import { Faq } from "@/components/Faq";
import { Enquiry } from "@/components/Enquiry";
import { Footer } from "@/components/Sections";

export default function Home() {
  return (
    <>
      <Nav />
      <StoryRocket />
      <main>
        <Hero />
        <About />
        <RocketServices />
        <Tabs />
        <Challenge />
        <Markets />
        <Testimonials />
        <Faq />
        <Enquiry />
      </main>
      <Footer />
    </>
  );
}
