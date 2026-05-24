/**
 * @fileoverview Profile Service
 * Redux async thunks for profile management.
 * Handles fetching and updating user profiles.
 * 
 * @module services/profileService
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../utils/APIsConnector';
import { PROFILE_API } from '../utils/api';
import {
  setProfile,
  setLoading,
  setError,
  setCompleteness,
  updateProfile as updateProfileAction,
} from '../redux/slices/profileSlice';

/**
 * Fetch current user's profile
 * 
 * @async
 * @returns {Promise<Object>} User profile data
 * 
 * @example
 * dispatch(fetchProfile())
 */
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await apiConnector('GET', PROFILE_API.GET_PROFILE);
      dispatch(setProfile(response.data.profile));

      return response.data.profile;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch profile';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

/**
 * Update user profile
 * 
 * @async
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated profile
 * 
 * @example
 * dispatch(updateProfile({ phoneNumber: '+1234567890', company: 'Acme Inc' }))
 */
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (
    profileData: Record<string, any>,
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const backendData = {
        ...profileData,
        city: profileData.currentAddress,
      };

      const response = await apiConnector(
        'PUT',
        PROFILE_API.UPDATE_PROFILE,
        backendData
      );

      dispatch(updateProfileAction(response.data.profile));

      return response.data.profile;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

/**
 * Upload profile photo
 * 
 * @async
 * @param {Object} data - FormData containing image file
 * @returns {Promise<Object>} Updated profile with new photo URL
 * 
 * @example
 * const formData = new FormData();
 * formData.append('image', imageFile);
 * dispatch(uploadProfilePhoto(formData))
 */
export const uploadProfilePhoto = createAsyncThunk(
  'profile/uploadProfilePhoto',
  async (formData: FormData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await apiConnector(
        'PUT',
        PROFILE_API.UPLOAD_PROFILE_PHOTO,
        formData as any,
        null
      );

      dispatch(updateProfileAction(response.data.profile));

      return response.data.profile;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to upload profile photo';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

/**
 * Fetch profile completeness percentage
 * 
 * @async
 * @returns {Promise<number>} Profile completeness percentage (0-100)
 * 
 * @example
 * dispatch(fetchProfileCompleteness())
 */
export const fetchProfileCompleteness = createAsyncThunk(
  'profile/fetchProfileCompleteness',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiConnector(
        'GET',
        PROFILE_API.GET_PROFILE_COMPLETENESS
      );

      dispatch(setCompleteness(response.data.completeness || 0));

      return response.data.completeness;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch profile completeness';
      dispatch(setError(message));
      return rejectWithValue(message);
    }
  }
);
