/**
 * @fileoverview Authentication Service - Firebase Google Sign-In Only
 * Redux async thunks for Firebase Google authentication and user session management.
 * 
 * @module services/authService
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosRequestHeaders } from 'axios';
import toast from 'react-hot-toast';
import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../config/firebaseClient';
import { setLoading, setToken, setUser } from '../redux/slices/authSlice';

import { apiConnector } from '../utils/APIsConnector';
import { getProfilePhotoUrl } from '../utils/avatarHelper';
import { USER_API } from '../utils/api';

/**
 * Sign in with Google using Firebase
 * User authenticates with Google via Firebase, then backend verifies the token
 * 
 * @async
 * @function googleSignIn
 * @returns {Promise<Object>} User data and authentication token
 * 
 * @dispatches setLoading, setToken, setUser
 * 
 * @example
 * dispatch(googleSignIn())
 */
export const googleSignIn = createAsyncThunk(
    'auth/googleSignIn',
    async (_, { dispatch, rejectWithValue }) => {
        const toastId = toast.loading('Signing in with Google...');
        try {
            dispatch(setLoading(true));

            if (!auth) {
                throw new Error('Firebase authentication is not initialized. Check your configuration.');
            }

            // Sign in with Google via Firebase
            const provider = new GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');

            console.log('🔐 Initiating Google Sign-In with Firebase...');
            const result = await signInWithPopup(auth, provider);
            
            console.log('✅ Google Sign-In successful:', result.user.email);

            // Get Firebase ID token
            const idToken = await result.user.getIdToken();

            // Send token to backend for verification and user creation/update
            const response = await apiConnector(
                'POST',
                `${USER_API.AUTH}/google-signin`,
                { idToken }
            );

            console.log('✅ Backend verification successful');

            // Store token
            const token = response.data.token || idToken;
            localStorage.setItem('token', JSON.stringify(token));
            dispatch(setToken(token));

            // Set user data
            if (response.data.user) {
                const user = response.data.user;
                const userImage = getProfilePhotoUrl(
                    user.profile?.profilePhoto,
                    user.firstName,
                    user.lastName
                );

                dispatch(setUser({
                    ...user,
                    profile: { ...user.profile, profilePhoto: userImage }
                }));
            }

            dispatch(setLoading(false));
            toast.success(`Welcome, ${response.data.user?.firstName}!`, { id: toastId });
            return response.data;

        } catch (error: any) {
            dispatch(setLoading(false));
            
            console.error('❌ Google Sign-In error:', error);

            // Firebase error handling
            if (error.code === 'auth/popup-closed-by-user') {
                toast.dismiss(toastId);
                return rejectWithValue('Sign-in cancelled');
            }

            if (error.code === 'auth/popup-blocked') {
                toast.error('Popup blocked. Please allow popups for this site.', { id: toastId });
                return rejectWithValue('Popup blocked');
            }

            if (error.code === 'auth/cancelled-popup-request') {
                toast.dismiss(toastId);
                return rejectWithValue('Sign-in cancelled');
            }

            if (error.code === 'auth/network-request-failed') {
                toast.error('Network error. Please check your connection.', { id: toastId });
                return rejectWithValue('Network error');
            }

            // Backend error handling
            const errorMessage = error.response?.data?.message || error.message || 'Sign-in failed';
            
            if (error.response?.status === 403) {
                toast.error('Your account has been blocked', { id: toastId });
            } else {
                toast.error(errorMessage, { id: toastId });
            }

            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Log out current user
 * Signs out from Firebase and clears local session
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
                        `${USER_API.AUTH}/logout`,
                        null,
                        { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
                    );
                } catch {
                    // Ignore backend errors - we still want to clear local state
                }
            }

            // Sign out from Firebase
            if (auth) {
                await firebaseSignOut(auth);
            }

            // Clear local state
            dispatch(setUser(null));
            dispatch(setToken(null));
            localStorage.removeItem('token');

            toast.success('Logged out successfully');
            return { success: true };
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Logout failed';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Fetch current authenticated user's data
 * Retrieves user info from backend using stored Firebase token
 * Used for session restoration on app load
 * 
 * @async
 * @function fetchCurrentUser
 * @returns {Promise<Object>} Current user data
 * 
 * @dispatches setLoading, setUser, setToken
 */
export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setLoading(true));
            const tokenStr = localStorage.getItem('token');
            const token = tokenStr ? JSON.parse(tokenStr) : null;
            
            if (!token) {
                dispatch(setLoading(false));
                return rejectWithValue('No token found');
            }

            const response = await apiConnector(
                'GET',
                `${USER_API.AUTH}/me`,
                null,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );

            if (response.data.user) {
                const user = response.data.user;
                const userImage = getProfilePhotoUrl(
                    user.profile?.profilePhoto,
                    user.firstName,
                    user.lastName
                );

                dispatch(setUser({
                    ...user,
                    profile: { ...user.profile, profilePhoto: userImage }
                }));
            }

            dispatch(setLoading(false));
            return response.data.user;
        } catch (error: any) {
            dispatch(setLoading(false));
            // Clear invalid token
            localStorage.removeItem('token');
            dispatch(setToken(null));
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
        }
    }
);


/**
 * Update user profile information
 * 
 * @async
 * @function updateUserProfile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated user data
 */
export const updateUserProfile = createAsyncThunk(
    'auth/updateUserProfile',
    async (profileData: Record<string, any>, { dispatch, rejectWithValue }) => {
        const toastId = toast.loading('Updating profile...');
        try {
            dispatch(setLoading(true));
            const tokenStr = localStorage.getItem('token');
            const token = tokenStr ? JSON.parse(tokenStr) : null;

            const response = await apiConnector(
                'PUT',
                `${USER_API.AUTH}/update-profile`,
                profileData,
                { Authorization: `Bearer ${token}` } as AxiosRequestHeaders
            );

            dispatch(setLoading(false));
            toast.success('Profile updated successfully', { id: toastId });
            return response.data;
        } catch (error: any) {
            dispatch(setLoading(false));
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);