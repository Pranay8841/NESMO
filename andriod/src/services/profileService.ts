import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../utils/APIsConnector';
import { PROFILE_API } from '../utils/api';
import { updateUserProfilePhoto } from '../redux/slices/authSlice';

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
      // Support various response schemas: data.profile, profile, or the payload itself
      return response.data.data?.profile || response.data.profile || response.data.data;
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
  async (formData: FormData, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiConnector(
        'PUT',
        PROFILE_API.UPLOAD_PROFILE_PHOTO,
        formData as any,
        {
          'Content-Type': 'multipart/form-data',
        } as any
      );

      const photoUrl = response.data.profilePhoto || response.data.profile?.profilePhoto;
      
      // Update global auth user profile photo as well for real-time header/settings sync
      if (photoUrl) {
        dispatch(updateUserProfilePhoto(photoUrl));
      }

      return photoUrl;
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
