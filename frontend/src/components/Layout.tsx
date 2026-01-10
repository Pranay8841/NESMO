import { type JSX } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./LandingPage/Navbar";
import Footer from "./LandingPage/Footer";

export default function Layout(): JSX.Element {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-gray-100 py-6 sm:py-8 lg:py-12">
        <Footer />
      </footer>
    </div>
  );
}
