/**
 * @fileoverview Authentication Redux Slice
 * Manages global authentication state including user data and tokens.
 * 
 * @module redux/slices/authSlice
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

/** User role hierarchy: MEMBER < BATCH_REP < ADMIN */
export type UserRole = 'MEMBER' | 'BATCH_REP' | 'ADMIN';

/** Account status */
export type UserStatus = 'ACTIVE' | 'BLOCKED';

/**
 * User data structure matching backend User model.
 */
export interface User {
  /** MongoDB ObjectId */
  _id?: string;
  /** Firebase UID */
  id?: string;
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
  /** Email is verified */
  isEmailVerified: boolean;
  /** Whether user has completed profile onboarding */
  isOnboarded?: boolean;
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
  /** Email pending verification (for email verification flow) */
  pendingVerificationEmail: string | null;
  /** Error message if any */
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  token: null,
  pendingVerificationEmail: null,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
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
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.pendingVerificationEmail = null;
      state.error = null;
    },
    updateUserProfilePhoto: (state, action: PayloadAction<string>) => {
      if (state.user && typeof state.user.profile === 'object') {
        state.user.profile.profilePhoto = action.payload;
      } else if (state.user) {
        state.user.profile = { profilePhoto: action.payload };
      }
    },
    setOnboarded: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.isOnboarded = action.payload;
      }
    },
  },
});

export const {
  setLoading,
  setToken,
  setUser,
  setPendingVerificationEmail,
  clearPendingVerification,
  setError,
  logout,
  updateUserProfilePhoto,
  setOnboarded,
} = authSlice.actions;

export default authSlice.reducer;
