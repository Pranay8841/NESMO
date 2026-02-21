import { type JSX, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import toast from "react-hot-toast";
import LoginModal from "./Authentication/LoginModal";
import SignupModal from "./Authentication/SignupModal";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: JSX.Element;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
    const { token, user, loading } = useAppSelector((state) => state.auth);
    const navigate = useNavigate();
    const hasShownToast = useRef(false);
    const [showSignupModal, setShowSignupModal] = useState(false);

    const isAuthenticated = token && user;
    // Check if we're still loading user data (token exists but user not fetched yet)
    const isLoadingAuth = loading || (token && !user);

    // Show toast once when user lands on protected route without auth
    useEffect(() => {
        if (!isLoadingAuth && !isAuthenticated && !hasShownToast.current) {
            toast.error('Please login to access this page');
            hasShownToast.current = true;
        }
    }, [isLoadingAuth, isAuthenticated]);

    const handleCloseModal = () => {
        // Navigate back to home when user closes the modal without logging in
        navigate('/', { replace: true });
    };

    const handleLoginSuccess = () => {
        hasShownToast.current = false;
        // Stay on the current protected route after successful login
    };

    // Show loading spinner while fetching user data
    if (isLoadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // If not authenticated, show login modal
    if (!isAuthenticated) {
        return (
            <>
                <LoginModal 
                    isOpen={true} 
                    onClose={handleCloseModal}
                    onSuccess={handleLoginSuccess}
                    onOpenSignup={() => { setShowSignupModal(true); }}
                />
                <SignupModal 
                    isOpen={showSignupModal} 
                    onClose={() => { setShowSignupModal(false); navigate('/', { replace: true }); }}
                    onOpenLogin={() => { setShowSignupModal(false); }}
                />
            </>
        );
    }

    return children;
}
