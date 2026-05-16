import { type JSX } from "react";
import HeroSection from "../components/LandingPage/HeroSection";
import ImpactStats from "../components/LandingPage/ImpactStat";
import About from "../components/LandingPage/About";
import Testimonial from "../components/LandingPage/Testimonial";
import Spotlight from "../components/LandingPage/Spotlight";

export default function Home(): JSX.Element {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-purple-100/30 py-6 sm:py-8 lg:py-12">
        <HeroSection />
      </section>

      {/* Impact Stats Section */}
      <section className="bg-white py-6 sm:py-8 lg:py-12">
        <ImpactStats />
      </section>

      {/* About Section */}
      <section className="bg-gray-50 py-6 sm:py-8 lg:py-12">
        <About />
      </section>

      {/* Testimonial Section */}
      <section className="bg-gray-50 py-6 sm:py-8 lg:py-12">
        <Testimonial />
      </section>

      {/* Spotlight Section */}
      <section className="bg-gray-50 py-6 sm:py-8 lg:py-12">
        <Spotlight />
      </section>
    </div>
  );
}
