import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Marquee from "@/components/landing/Marquee";
import Tools from "@/components/landing/Tools";
import HowItWorks from "@/components/landing/HowItWorks";
import CommunitySection from "@/components/landing/Community";
import Pricing from "@/components/landing/Pricing";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Tools />
        <HowItWorks />
        <CommunitySection />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
