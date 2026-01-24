/**
 * @fileoverview Admin Protected Route Component
 * Wrapper component that restricts access to admin-only routes.
 * Redirects non-admin users to the dashboard.
 * 
 * @module components/AdminRoute
 */

import { type JSX, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import toast from "react-hot-toast";

interface AdminRouteProps {
    children: JSX.Element;
}

/**
 * AdminRoute Component
 * Protects routes that should only be accessible to admin users.
 * 
 * @param children - The component to render if user is an admin
 * @returns The children component if admin, otherwise redirects to dashboard
 */
export default function AdminRoute({ children }: AdminRouteProps): JSX.Element | null {
    const { token, user } = useAppSelector((state) => state.auth);
    const navigate = useNavigate();
    const hasShownToast = useRef(false);

    const isAuthenticated = token && user;
    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        // If not authenticated at all, redirect to home
        if (!isAuthenticated) {
            navigate('/', { replace: true });
            return;
        }

        // If authenticated but not admin, redirect to dashboard
        if (!isAdmin) {
            if (!hasShownToast.current) {
                toast.error('Access denied. Admin privileges required.');
                hasShownToast.current = true;
            }
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, isAdmin, navigate]);

    // If not admin, don't render anything (will redirect)
    if (!isAdmin) {
        return null;
    }

    return children;
}
