/**
 * @fileoverview Authentication Service - Firebase Google Sign-In (Expo Go compatible)
 * Redux async thunks for Firebase Google authentication using the JS SDK
 * Uses expo-auth-session for Google OAuth flow (works in Expo Go)
 * 
 * @module services/authService
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { auth } from '../config/firebaseClient';
import { apiConnector } from '../utils/APIsConnector';
import { USER_API } from '../utils/api';
import { setToken, setUser, setLoading, setError } from '../redux/slices/authSlice';

/**
 * Sign in with Google using Firebase (Expo Go compatible)
 * Receives the idToken from expo-auth-session (handled in the component)
 * and completes the Firebase + backend authentication flow
 * 
 * @async
 * @function googleSignIn
 * @param {Object} payload - The authentication payload
 * @param {string} payload.idToken - Google ID token from expo-auth-session
 * @returns {Promise<Object>} User data and authentication token
 * 
 * @example
 * dispatch(googleSignIn({ idToken: '...' }))
 */
export const googleSignIn = createAsyncThunk(
  'auth/googleSignIn',
  async ({ idToken }: { idToken: string }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      console.log('🔐 Signing in with Firebase using Google credential...');

      // Create Firebase credential with the ID token from expo-auth-session
      const credential = GoogleAuthProvider.credential(idToken);

      // Sign in to Firebase with the credential
      const userCredential = await signInWithCredential(auth, credential);

      console.log('✅ Firebase authentication successful:', userCredential.user.email);

      // Get Firebase ID token
      const firebaseIdToken = await userCredential.user.getIdToken();

      // Send to backend for verification and user creation/update
      const response = await apiConnector(
        'POST',
        `${USER_API.AUTH}/google-signin`,
        { idToken: firebaseIdToken }
      );

      console.log('✅ Backend verification successful');

      // Store token in AsyncStorage
      const token = response.data.token || firebaseIdToken;
      await AsyncStorage.setItem('authToken', JSON.stringify(token));
      dispatch(setToken(token));

      // Set user data
      if (response.data.user) {
        dispatch(setUser(response.data.user));
      }

      console.log(`✅ Welcome, ${response.data.user?.firstName}!`);

      dispatch(setLoading(false));
      return response.data;
    } catch (error: any) {
      dispatch(setLoading(false));

      console.error('❌ Google Sign-In error:', error);

      let errorMessage = 'Sign-in failed';

      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid Google credential. Please try again.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with a different sign-in method.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Fetch current authenticated user
 * Verifies token with backend
 * 
 * @async
 * @returns {Promise<Object>} User data
 * 
 * @example
 * dispatch(fetchCurrentUser())
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiConnector('GET', USER_API.CURRENT_USER);
      dispatch(setUser(response.data.user));
      return response.data.user;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch user';
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  }
);

/**
 * Logout user
 * Clears Firebase session and local auth state
 * 
 * @async
 * @returns {Promise<void>}
 * 
 * @example
 * dispatch(logoutUser())
 */
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));

      // Sign out from Firebase (JS SDK)
      await signOut(auth);

      // Call logout endpoint (optional)
      try {
        await apiConnector('POST', USER_API.LOGOUT, {});
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }

      // Clear local auth state
      await AsyncStorage.removeItem('authToken');
      dispatch(setToken(null));
      dispatch(setUser(null));

      console.log('✅ Logged out successfully');

      dispatch(setLoading(false));
      return { message: 'Logged out successfully' };
    } catch (error: any) {
      console.error('Logout error:', error);
      dispatch(setLoading(false));
      dispatch(setError('Logout failed'));
      return rejectWithValue('Logout failed');
    }
  }
);

/**
 * Restore session from AsyncStorage on app launch
 * Checks if user had a valid token and is still authenticated
 * 
 * @async
 * @returns {Promise<void>}
 */
export const restoreToken = createAsyncThunk(
  'auth/restoreToken',
  async (_, { dispatch }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      if (token) {
        dispatch(setToken(JSON.parse(token)));

        // Verify token is still valid by fetching current user
        try {
          await dispatch(fetchCurrentUser()).unwrap();
        } catch (error) {
          console.warn('Session token invalid, clearing auth');
          await AsyncStorage.removeItem('authToken');
          dispatch(setToken(null));
          dispatch(setUser(null));
        }
      }
    } catch (error) {
      console.warn('Failed to restore token:', error);
      await AsyncStorage.removeItem('authToken');
    }
  }
);

/**
 * Mock email signup (legacy - googleSignIn is used)
 */
export const emailSignup = createAsyncThunk(
  'auth/emailSignup',
  async (payload: any, { rejectWithValue }) => {
    return rejectWithValue('Email signup is not implemented');
  }
);

/**
 * Mock verify email (legacy)
 */
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (payload: any, { rejectWithValue }) => {
    return rejectWithValue('Email verification is not implemented');
  }
);

/**
 * Mock resend verification email (legacy)
 */
export const resendVerificationEmail = createAsyncThunk(
  'auth/resendVerificationEmail',
  async (email: string, { rejectWithValue }) => {
    return rejectWithValue('Resend verification email is not implemented');
  }
);
