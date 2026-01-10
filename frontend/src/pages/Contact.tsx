import { type JSX } from "react";

export default function ContactPage(): JSX.Element {
  return (
    <section className="bg-gray-50 py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Contact Us</h1>
        <p className="text-lg text-gray-700 max-w-3xl">
          Get in touch with us. We'd love to hear from you.
        </p>
      </div>
    </section>
  );
}
