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
// No slice actions are manually dispatched, extraReducers handles the state flow

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
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiConnector('GET', PROFILE_API.GET_PROFILE);
      return response.data.profile;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch profile';
      return rejectWithValue(message);
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
    { rejectWithValue }
  ) => {
    try {
      const backendData = {
        ...profileData,
        city: profileData.currentAddress,
      };

      const response = await apiConnector(
        'PUT',
        PROFILE_API.UPDATE_PROFILE,
        backendData
      );

      return response.data.profile;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      return rejectWithValue(message);
    }
  }
);

/**
 * Upload profile photo
 * 
 * @async
 * @param {Object} data - FormData containing image file
 * @returns {Promise<string>} Updated profile photo URL
 * 
 * @example
 * const formData = new FormData();
 * formData.append('image', imageFile);
 * dispatch(uploadProfilePhoto(formData))
 */
export const uploadProfilePhoto = createAsyncThunk(
  'profile/uploadProfilePhoto',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await apiConnector(
        'PUT',
        PROFILE_API.UPLOAD_PROFILE_PHOTO,
        formData as any,
        null
      );

      return response.data.profile.profilePhoto;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to upload profile photo';
      return rejectWithValue(message);
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
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiConnector(
        'GET',
        PROFILE_API.GET_PROFILE_COMPLETENESS
      );

      return response.data.completeness;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch profile completeness';
      return rejectWithValue(message);
    }
  }
);
