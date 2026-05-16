/**
 * @fileoverview Authentication Service
 * Redux async thunks for user authentication operations.
 * Handles registration, login, logout, email verification, and session management.
 * 
 * @module services/authService
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosRequestHeaders } from 'axios';
import toast from 'react-hot-toast';
import { setLoading, setToken, setUser, setPendingVerificationEmail, clearPendingVerification } from '../redux/slices/authSlice';

import { apiConnector } from '../utils/APIsConnector';
import { USER_API } from '../utils/api';

/** Registration data structure */
interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

/**
 * Register a new user account.
 * Creates account, triggers verification email, and updates Redux state.
 * 
 * @async
 * @function registerUser
 * @param {RegisterData} userData - User registration data
 * @returns {Promise<Object>} Registration response with email verification status
 * 
 * @dispatches setLoading, setPendingVerificationEmail, setUser, setToken
 * 
 * @example
 * dispatch(registerUser({ firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: 'secret123' }))
 */
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData: RegisterData, { dispatch, rejectWithValue }) => {
        const toastId = toast.loading('Creating your account...');
        try {
            dispatch(setLoading(true));
            const response = await apiConnector(
                'POST',
                USER_API.REGISTER,
                userData,
            );

            // Registration now requires email verification
            // Don't auto-login - set pending verification email instead
            if (response.data.requiresEmailVerification) {
                dispatch(setPendingVerificationEmail(response.data.email));
                dispatch(setLoading(false));
                toast.success('Please check your email to verify your account.', { id: toastId });
                return { ...response.data, requiresEmailVerification: true };
            }

            // Fallback for backwards compatibility (shouldn't happen with new flow)
            if (response.data.user) {
                const userImage = response.data.user.profile?.profilePhoto ||
                    `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`;

                dispatch(setUser({ ...response.data.user, profile: { ...response.data.user.profile, profilePhoto: userImage } }));
            }

            if (response.data.token) {
                dispatch(setToken(response.data.token));
                localStorage.setItem('token', JSON.stringify(response.data.token));
            }

            dispatch(setLoading(false));
            toast.success('Account created successfully!', { id: toastId });
            return response.data;
        } catch (error: any) {
            dispatch(setLoading(false));
            const errorMessage = error.response?.data?.message || 'Registration failed';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Authenticate user with email and password.
 * Validates credentials, stores JWT token, and updates Redux state.
 * Handles email verification errors gracefully.
 * 
 * @async
 * @function loginUser
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User's email address
 * @param {string} credentials.password - User's password
 * @returns {Promise<Object>} Login response with user data and token
 * 
 * @dispatches setLoading, setUser, setToken, clearPendingVerification, setPendingVerificationEmail
 * 
 * @example
 * dispatch(loginUser({ email: 'john@example.com', password: 'secret123' }))
 */
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (credentials: { email: string; password: string }, { dispatch, rejectWithValue }) => {
        const toastId = toast.loading('Signing you in...');
        try {
            dispatch(setLoading(true));
            const response = await apiConnector(
                'POST',
                USER_API.LOGIN,
                credentials,
            );

            const userImage = response.data?.user?.profile?.profilePhoto ||
                `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`;

            dispatch(setUser({ ...response.data.user, profile: { ...response.data.user.profile, profilePhoto: userImage } }));
            dispatch(setToken(response.data.token));
            dispatch(clearPendingVerification());
            dispatch(setLoading(false));

            // Save token to localStorage
            localStorage.setItem('token', JSON.stringify(response.data.token));

            toast.success('Welcome back!', { id: toastId });
            return response.data;
        } catch (error: any) {
            dispatch(setLoading(false));
            
            // Check if error is due to unverified email
            if (error.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
                const email = error.response?.data?.email;
                dispatch(setPendingVerificationEmail(email));
                toast.error('Please verify your email before logging in.', { id: toastId });
                return rejectWithValue({ 
                    message: 'Email not verified', 
                    code: 'EMAIL_NOT_VERIFIED',
                    email 
                });
            }
            
            const errorMessage = error.response?.data?.message || 'Login failed';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Log out current user.
 * Clears JWT token from localStorage and resets Redux state.
 * Optionally notifies backend for logging/analytics.
 * 
 * @async
 * @function logoutUser
 * @returns {Promise<Object>} Logout confirmation
 * 
 * @dispatches setUser(null), setToken(null)
 * @clears localStorage token
 */
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { dispatch, getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: { token: string | null } };
            const token = state.auth.token;

            // Call backend logout endpoint (optional, for logging/analytics)
            if (token) {
                try {
                    await apiConnector(
                        'POST',
                        USER_API.LOGOUT,
                        null,
                        { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
                    );
                } catch {
                    // Ignore backend errors - we still want to clear local state
                }
            }

            // Clear local state
            dispatch(setUser(null));
            dispatch(setToken(null));
            localStorage.removeItem('token');

            toast.success('Logged out successfully');
            return { success: true };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Logout failed';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Fetch current authenticated user's data.
 * Retrieves user info from backend using stored JWT token.
 * Used for session restoration on app load.
 * 
 * @async
 * @function fetchCurrentUser
 * @returns {Promise<Object>} Current user data
 * 
 * @dispatches setLoading, setUser
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const tokenStr = localStorage.getItem('token');
      const token = tokenStr ? JSON.parse(tokenStr) : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const response = await apiConnector('GET', USER_API.CURRENT_USER, null, headers as AxiosRequestHeaders);
      dispatch(setUser(response.data.user));
      dispatch(setLoading(false));
      return response.data.user;
    } catch (error: any) {
      dispatch(setLoading(false));
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

/**
 * Verify user's email address with token from verification link.
 * Called when user clicks email verification link.
 * 
 * @async
 * @function verifyEmail
 * @param {string} token - Email verification token from URL
 * @returns {Promise<Object>} Verification status
 * 
 * @dispatches setLoading, clearPendingVerification
 */
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string, { dispatch, rejectWithValue }) => {
    const toastId = toast.loading('Verifying your email...');
    try {
      dispatch(setLoading(true));
      const response = await apiConnector(
        'GET',
        `${USER_API.VERIFY_EMAIL}/${token}`,
      );
      
      dispatch(clearPendingVerification());
      dispatch(setLoading(false));
      toast.success('Email verified successfully! You can now log in.', { id: toastId });
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      const errorMessage = error.response?.data?.message || 'Email verification failed';
      const errorCode = error.response?.data?.code;
      
      // Check if this is an "already used" case - show info toast instead of error
      if (errorMessage?.includes('already been used') || errorMessage?.includes('already verified')) {
        toast.dismiss(toastId);
        // Don't show any toast - the UI will handle this gracefully
      } else {
        toast.error(errorMessage, { id: toastId });
      }
      
      return rejectWithValue({ message: errorMessage, code: errorCode });
    }
  }
);

/**
 * Resend email verification link.
 * Generates new verification token and sends email.
 * 
 * @async
 * @function resendVerificationEmail
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Send status
 * 
 * @dispatches setLoading
 */
export const resendVerificationEmail = createAsyncThunk(
  'auth/resendVerificationEmail',
  async (email: string, { dispatch, rejectWithValue }) => {
    const toastId = toast.loading('Sending verification email...');
    try {
      dispatch(setLoading(true));
      const response = await apiConnector(
        'POST',
        USER_API.RESEND_VERIFICATION,
        { email },
      );
      
      dispatch(setLoading(false));
      toast.success('Verification email sent! Please check your inbox.', { id: toastId });
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      const errorMessage = error.response?.data?.message || 'Failed to send verification email';
      toast.error(errorMessage, { id: toastId });
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Request password reset email.
 * Sends password reset link to user's email.
 * 
 * @async
 * @function forgotPassword
 * @param {string} email - User's email address
 * @returns {Promise<Object>} Send status
 * 
 * @dispatches setLoading
 */
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { dispatch, rejectWithValue }) => {
    const toastId = toast.loading('Sending password reset email...');
    try {
      dispatch(setLoading(true));
      const response = await apiConnector(
        'POST',
        USER_API.FORGOT_PASSWORD,
        { email },
      );
      
      dispatch(setLoading(false));
      toast.success('Password reset email sent! Please check your inbox.', { id: toastId });
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      const errorMessage = error.response?.data?.message || 'Failed to send password reset email';
      toast.error(errorMessage, { id: toastId });
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Reset password with token from reset link.
 * Updates user's password using the reset token.
 * 
 * @async
 * @function resetPassword
 * @param {Object} data - Reset password data
 * @param {string} data.token - Password reset token from URL
 * @param {string} data.password - New password
 * @returns {Promise<Object>} Reset status
 * 
 * @dispatches setLoading
 */
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }: { token: string; password: string }, { dispatch, rejectWithValue }) => {
    const toastId = toast.loading('Resetting your password...');
    try {
      dispatch(setLoading(true));
      const response = await apiConnector(
        'POST',
        `${USER_API.RESET_PASSWORD}/${token}`,
        { password },
      );
      
      dispatch(setLoading(false));
      toast.success('Password reset successfully! You can now log in.', { id: toastId });
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      const errorCode = error.response?.data?.code;
      toast.error(errorMessage, { id: toastId });
      return rejectWithValue({ message: errorMessage, code: errorCode });
    }
  }
);