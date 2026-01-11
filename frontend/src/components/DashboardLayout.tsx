import { type JSX, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Navbar from "./LandingPage/Navbar";
import Sidebar from "./Dashboard/Sidebar";
import SignupModal from "./Authentication/SignupModal";
import LoginModal from "./Authentication/LoginModal";
import { useAppSelector } from "../redux/hooks";

export default function DashboardLayout(): JSX.Element {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  const { user } = useAppSelector((state) => state.auth);

  const openSignupModal = () => setIsSignupModalOpen(true);
  const closeSignupModal = () => setIsSignupModalOpen(false);
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const isAnyModalOpen = isSignupModalOpen || isLoginModalOpen;

  // Redirect to home if not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <div className={`bg-gray-50 min-h-screen flex flex-col transition-all duration-300 ${isAnyModalOpen ? 'blur-sm' : ''}`}>
        <Navbar onSignupClick={openSignupModal} onLoginClick={openLoginModal} />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
        {/* No footer for dashboard pages */}
      </div>
      <SignupModal isOpen={isSignupModalOpen} onClose={closeSignupModal} />
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
}
