import { type JSX, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Navbar from "./LandingPage/Navbar";
import Sidebar, { MobileMenuButton } from "./Dashboard/Sidebar";
import SignupModal from "./Authentication/SignupModal";
import LoginModal from "./Authentication/LoginModal";
import { useAppSelector } from "../redux/hooks";

export default function DashboardLayout(): JSX.Element {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const { user } = useAppSelector((state) => state.auth);

  const openSignupModal = () => setIsSignupModalOpen(true);
  const closeSignupModal = () => setIsSignupModalOpen(false);
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const openMobileSidebar = () => setIsMobileSidebarOpen(true);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

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
          {/* Sidebar for desktop, controlled sidebar for mobile */}
          <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={closeMobileSidebar} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-0 overflow-y-auto">
            {/* Floating Action Button for mobile sidebar toggle */}
            <div className="lg:hidden fixed bottom-6 right-6 z-50">
              <MobileMenuButton onClick={openMobileSidebar} />
            </div>
            <Outlet />
          </main>
        </div>
        {/* Removed BottomNavBar for mobile, replaced with FAB */}
        {/* Bottom nav bar for mobile - removed */}
        {/* No footer for dashboard pages */}
      </div>
      <SignupModal isOpen={isSignupModalOpen} onClose={closeSignupModal} />
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
}
