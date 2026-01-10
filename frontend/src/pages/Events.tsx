import { type JSX } from "react";

export default function EventsPage(): JSX.Element {
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Events</h1>
        <p className="text-lg text-gray-700 max-w-3xl">
          Explore our upcoming events and activities.
        </p>
      </div>
    </section>
  );
}
