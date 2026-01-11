import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type AuthProvider = "LOCAL" | "GOOGLE";
type UserRole = "VISITOR" | "MEMBER" | "EVENT_LEAD" | "ADMIN";
type UserStatus = "ACTIVE" | "BLOCKED";

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    authProvider: AuthProvider;
    googleId?: string;
    role: UserRole;
    isMember: boolean;
    status: UserStatus;
    profile: string; // ObjectId reference to Profile
    isBlocked: boolean;
    isVerified: boolean;
    blockedReason?: string;
    blockedAt?: string;
    createdAt: string;
    updatedAt: string;
}

interface AuthState {
    user: User | null;
    loading: boolean;
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
        }
    },
});

export const { setLoading, setToken, setUser, logout } = authSlice.actions;

export default authSlice.reducer;