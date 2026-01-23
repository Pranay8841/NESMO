/**
 * @fileoverview Authentication Redux Slice
 * Manages global authentication state including user data, tokens, and verification status.
 * 
 * @module redux/slices/authSlice
 */

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

/** Authentication provider type */
type AuthProvider = "LOCAL" | "GOOGLE";

/** User role hierarchy: VISITOR < MEMBER < EVENT_LEAD < ADMIN */
type UserRole = "VISITOR" | "MEMBER" | "EVENT_LEAD" | "ADMIN";

/** Account status */
type UserStatus = "ACTIVE" | "BLOCKED";

/**
 * User data structure matching backend User model.
 */
export interface User {
    /** MongoDB ObjectId */
    _id: string;
    /** User's first name */
    firstName: string;
    /** User's last name */
    lastName: string;
    /** User's email address */
    email: string;
    /** Authentication method used */
    authProvider: AuthProvider;
    /** Google OAuth ID (if Google auth) */
    googleId?: string;
    /** User's role in the system */
    role: UserRole;
    /** NESMO paid membership status */
    isMember: boolean;
    /** Account status */
    status: UserStatus;
    /** Reference to Profile document */
    profile: string;
    /** Email verification status */
    isEmailVerified: boolean;
    /** Reason for account block (if blocked) */
    blockedReason?: string;
    /** Timestamp when account was blocked */
    blockedAt?: string;
    /** Account creation timestamp */
    createdAt: string;
    /** Last update timestamp */
    updatedAt: string;
}

/**
 * Authentication state structure.
 */
interface AuthState {
    /** Current authenticated user or null */
    user: User | null;
    /** Loading state for auth operations */
    loading: boolean;
    /** JWT token for API authentication */
    token: string | null;
    /** Email pending verification (shown after registration) */
    pendingVerificationEmail: string | null;
}

const initialState: AuthState = {
    user: null,
    loading: false,
    token: localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token") as string) : null,
    pendingVerificationEmail: null,
};

export const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setToken: (state, action: PayloadAction<string | null>) => {
            state.token = action.payload;
        },
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
        },
        setPendingVerificationEmail: (state, action: PayloadAction<string | null>) => {
            state.pendingVerificationEmail = action.payload;
        },
        clearPendingVerification: (state) => {
            state.pendingVerificationEmail = null;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.pendingVerificationEmail = null;
            localStorage.removeItem('token');
        }
    },
});

export const { setLoading, setToken, setUser, setPendingVerificationEmail, clearPendingVerification, logout } = authSlice.actions;

export default authSlice.reducer;