import { type JSX, useState, useEffect } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import Navbar from "./LandingPage/Navbar";
import Footer from "./LandingPage/Footer";
import SignupModal from "./Authentication/SignupModal";
import LoginModal from "./Authentication/LoginModal";

export default function Layout(): JSX.Element {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const openSignupModal = () => setIsSignupModalOpen(true);
  const closeSignupModal = () => {
    setIsSignupModalOpen(false);
    // Clear the query param when modal is closed
    if (searchParams.has('openSignup')) {
      searchParams.delete('openSignup');
      setSearchParams(searchParams);
    }
  };
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    // Clear the query param when modal is closed
    if (searchParams.has('openLogin')) {
      searchParams.delete('openLogin');
      setSearchParams(searchParams);
    }
  };

  // Check for openLogin/openSignup query param to auto-open modals
  useEffect(() => {
    if (searchParams.get('openLogin') === 'true') {
      setIsLoginModalOpen(true);
    }
    if (searchParams.get('openSignup') === 'true') {
      setIsSignupModalOpen(true);
    }
  }, [searchParams]);

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
      <SignupModal isOpen={isSignupModalOpen} onClose={closeSignupModal} onOpenLogin={() => { closeSignupModal(); openLoginModal(); }} />
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
}
