import { type JSX } from "react";

export default function MembershipPage(): JSX.Element {
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Membership</h1>
        <p className="text-lg text-gray-700 max-w-3xl">
          Join our community and become a member today.
        </p>
      </div>
    </section>
  );
}
