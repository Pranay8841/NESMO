/**
 * @fileoverview Authentication Redux Slice - Firebase Google Only
 * Manages global authentication state including user data and tokens.
 * 
 * @module redux/slices/authSlice
 */

import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

/** User role hierarchy: ALUMNI < MEMBER < EVENT_LEAD < ADMIN */
type UserRole = "ALUMNI" | "MEMBER" | "EVENT_LEAD" | "ADMIN";

/** Account status */
type UserStatus = "ACTIVE" | "BLOCKED";

/**
 * User data structure matching backend User model.
 */
export interface User {
    /** Firebase UID */
    id: string;
    /** User's first name */
    firstName: string;
    /** User's last name */
    lastName: string;
    /** User's email address */
    email: string;
    /** User's role in the system */
    role: UserRole;
    /** NESMO paid membership status */
    isMember: boolean;
    /** Account status */
    status: UserStatus;
    /** Reference to Profile document */
    profile: string | { id?: string; profilePhoto?: string; [key: string]: any };
    /** Email is always verified for Google users */
    isEmailVerified: boolean;
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
    /** Firebase ID token for API authentication */
    token: string | null;
}

const initialState: AuthState = {
    user: null,
    loading: false,
    token: localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token") as string) : null,
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
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.removeItem('token');
        },
        updateUserProfilePhoto: (state, action: PayloadAction<string>) => {
            if (state.user && typeof state.user.profile === 'object') {
                state.user.profile.profilePhoto = action.payload;
            } else if (state.user) {
                // If profile is a string, convert it to an object with profilePhoto
                state.user.profile = { profilePhoto: action.payload };
            }
        }
    },
});

export const { setLoading, setToken, setUser, logout, updateUserProfilePhoto } = authSlice.actions;

export default authSlice.reducer;