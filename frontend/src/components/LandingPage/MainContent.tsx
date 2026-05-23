import HeroSection from "./HeroSection";
import ImpactStats from "./ImpactStat";
import About from "./About";
import Testimonial from "./Testimonial";
import Spotlight from "./Spotlight";

/**
 * Shared main content component used by both LandingPage and Home
 * Contains all the core sections to avoid duplication
 */
export default function MainContent() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-purple-100/30 py-6 sm:py-8 lg:py-12">
        <HeroSection />
      </section>

      {/* Section Divider */}
      <div className="section-gradient-divider max-w-5xl mx-auto" />

      {/* Impact Stats Section */}
      <section className="bg-white py-6 sm:py-8 lg:py-12">
        <ImpactStats />
      </section>

      {/* Section Divider */}
      <div className="section-gradient-divider max-w-5xl mx-auto" />

      {/* About Section */}
      <section className="bg-gray-50 py-6 sm:py-8 lg:py-12">
        <About />
      </section>

      {/* Section Divider */}
      <div className="section-gradient-divider max-w-5xl mx-auto" />

      {/* Testimonial Section */}
      <section className="bg-gray-50 py-6 sm:py-8 lg:py-12">
        <Testimonial />
      </section>

      {/* Section Divider */}
      <div className="section-gradient-divider max-w-5xl mx-auto" />

      {/* Spotlight Section */}
      <section className="bg-gray-50 py-6 sm:py-8 lg:py-12">
        <Spotlight />
      </section>
    </>
  );
}
