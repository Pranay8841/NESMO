import { type JSX } from "react";

export default function AboutPage(): JSX.Element {
  return (
    <section className="bg-gray-50 py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">About Us</h1>
        <p className="text-lg text-gray-700 max-w-3xl">
          Learn more about our organization and mission.
        </p>
      </div>
    </section>
  );
}
