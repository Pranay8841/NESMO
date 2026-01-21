import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosRequestHeaders } from 'axios';
import toast from 'react-hot-toast';
import { setLoading, setToken, setUser, setPendingVerificationEmail, clearPendingVerification } from '../redux/slices/authSlice';

import { apiConnector } from '../utils/APIsConnector';
import { USER_API } from '../utils/api';

interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

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

// Verify email with token
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

// Resend verification email
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