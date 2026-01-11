import { type JSX, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./LandingPage/Navbar";
import Footer from "./LandingPage/Footer";
import SignupModal from "./Authentication/SignupModal";
import LoginModal from "./Authentication/LoginModal";

export default function Layout(): JSX.Element {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openSignupModal = () => setIsSignupModalOpen(true);
  const closeSignupModal = () => setIsSignupModalOpen(false);
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const isAnyModalOpen = isSignupModalOpen || isLoginModalOpen;

  return (
    <>
      <div className={`bg-white min-h-screen flex flex-col transition-all duration-300 ${isAnyModalOpen ? 'blur-sm' : ''}`}>
        <Navbar onSignupClick={openSignupModal} onLoginClick={openLoginModal} />
        <main className="flex-grow">
          <Outlet />
        </main>
        <footer className="bg-gray-100 py-6 sm:py-8 lg:py-12">
          <Footer />
        </footer>
      </div>
      <SignupModal isOpen={isSignupModalOpen} onClose={closeSignupModal} />
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
}
