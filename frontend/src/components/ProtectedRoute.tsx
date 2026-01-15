import { type JSX, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import toast from "react-hot-toast";
import LoginModal from "./Authentication/LoginModal";

interface ProtectedRouteProps {
    children: JSX.Element;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
    const { token, user } = useAppSelector((state) => state.auth);
    const navigate = useNavigate();
    const hasShownToast = useRef(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    const isAuthenticated = token && user;

    useEffect(() => {
        if (!isAuthenticated) {
            setShowLoginModal(true);
            if (!hasShownToast.current) {
                toast.error('Please login to access this page');
                hasShownToast.current = true;
            }
        } else {
            setShowLoginModal(false);
            hasShownToast.current = false;
        }
    }, [isAuthenticated]);

    const handleCloseModal = () => {
        setShowLoginModal(false);
        // Navigate back to home when user closes the modal without logging in
        navigate('/', { replace: true });
    };

    const handleLoginSuccess = () => {
        setShowLoginModal(false);
        hasShownToast.current = false;
        // Stay on the current protected route after successful login
    };

    // If not authenticated, show login modal
    if (!isAuthenticated) {
        return (
            <LoginModal 
                isOpen={showLoginModal} 
                onClose={handleCloseModal}
                onSuccess={handleLoginSuccess}
            />
        );
    }

    return children;
}
