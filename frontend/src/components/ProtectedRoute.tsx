import { type JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";

interface ProtectedRouteProps {
    children: JSX.Element;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
    const { token, user } = useAppSelector((state) => state.auth);
    const location = useLocation();

    // If not authenticated, redirect to home page
    // You can also redirect to a login page or show a login modal
    if (!token || !user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
}
