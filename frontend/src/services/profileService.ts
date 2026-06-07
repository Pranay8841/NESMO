/**
 * @fileoverview Profile Service
 * Redux async thunks for user profile management.
 * Handles fetching, updating, and photo upload operations.
 * 
 * @module services/profileService
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosRequestHeaders } from 'axios';
import toast from 'react-hot-toast';
import { apiConnector } from '../utils/APIsConnector';
import { PROFILE_API } from '../utils/api';
import { updateUserProfilePhoto } from '../redux/slices/authSlice';

/**
 * User profile data structure.
 * Represents the Profile document from MongoDB.
 */
export interface Profile {
    /** MongoDB ObjectId */
    _id: string;
    /** User bio/description (max 500 chars) */
    about?: string;
    /** Contact phone number */
    phone?: string;
    /** Year of joining JNV */
    joinBatch?: string;
    /** Year of passing out from JNV */
    passoutBatch?: string;
    /** Current occupation/profession */
    occupation?: string;
    /** Company/organization name */
    organization?: string;
    /** Work sector */
    sector?: string;
    /** Current city/location */
    currentAddress?: string;
    /** Blood group (A+, A-, B+, B-, AB+, AB-, O+, O-) */
    bloodGroup?: string;
    /** Cloudinary URL of profile photo */
    profilePhoto?: string;
    /** Document creation timestamp */
    createdAt: string;
    /** Document update timestamp */
    updatedAt: string;
}

/**
 * Data structure for profile updates.
 * All fields are optional - only send fields to update.
 */
export interface ProfileUpdateData {
    about?: string;
    phone?: string;
    joinBatch?: string;
    passoutBatch?: string;
    occupation?: string;
    organization?: string;
    sector?: string;
    currentAddress?: string;
    bloodGroup?: string;
}

/**
 * Helper to get authorization headers from localStorage.
 * @returns {AxiosRequestHeaders | undefined} Headers with Bearer token or undefined
 */
const getAuthHeaders = (): AxiosRequestHeaders | undefined => {
    const tokenStr = localStorage.getItem('token');
    const token = tokenStr ? JSON.parse(tokenStr) : null;
    return token ? { Authorization: `Bearer ${token}` } as AxiosRequestHeaders : undefined;
};

/**
 * Fetch current user's profile data.
 * Retrieves profile from backend and handles different response formats.
 * 
 * @async
 * @function fetchProfile
 * @returns {Promise<Profile>} User's profile data
 */
export const fetchProfile = createAsyncThunk(
    'profile/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const headers = getAuthHeaders();
            const response = await apiConnector('GET', PROFILE_API.GET_PROFILE, null, headers);
            // Backend returns { data: { profile: {...} } } or { data: user } with populated profile
            return response.data.data?.profile || response.data.profile || response.data.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch profile';
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Update user's profile information.
 * Sends partial update - only changed fields need to be included.
 * 
 * @async
 * @function updateProfile
 * @param {ProfileUpdateData} profileData - Profile fields to update
 * @returns {Promise<Profile>} Updated profile data
 * 
 * @example
 * dispatch(updateProfile({ occupation: 'Software Engineer', city: 'Mumbai' }))
 */
export const updateProfile = createAsyncThunk(
    'profile/updateProfile',
    async (profileData: ProfileUpdateData, { rejectWithValue }) => {
        const toastId = toast.loading('Updating profile...');
        try {
            const headers = getAuthHeaders();
            // Map currentAddress to city for backend compatibility
            const backendData = {
                ...profileData,
                city: profileData.currentAddress,
            };
            const response = await apiConnector('PUT', PROFILE_API.UPDATE_PROFILE, backendData, headers);
            toast.success('Profile updated successfully!', { id: toastId });
            return response.data.profile;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Upload new profile photo.
 * Uploads image file to Cloudinary via backend and updates profile.
 * 
 * @async
 * @function uploadProfilePhoto
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} New profile photo URL
 * 
 * @example
 * const file = event.target.files[0];
 * dispatch(uploadProfilePhoto(file));
 */
export const uploadProfilePhoto = createAsyncThunk(
    'profile/uploadProfilePhoto',
    async (file: File, { dispatch, rejectWithValue }) => {
        const toastId = toast.loading('Uploading photo...');
        try {
            const headers = getAuthHeaders();
            const formData = new FormData();
            formData.append('profilePhoto', file);
            
            const response = await apiConnector(
                'PUT',  // Backend uses PUT for profile photo
                PROFILE_API.UPLOAD_PROFILE_PHOTO, 
                formData, 
                { ...headers, 'Content-Type': 'multipart/form-data' } as AxiosRequestHeaders
            );
            toast.success('Profile photo updated!', { id: toastId });
            console.log('Upload response:', response.data);
            const photoUrl = response.data.data?.image || response.data.profilePhoto;
            
            // Also update the user's profile photo in authSlice for navbar display
            dispatch(updateUserProfilePhoto(photoUrl));
            
            return photoUrl;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to upload photo';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Delete profile photo.
 * Resets profilePhoto URL to empty string on backend and updates state.
 * 
 * @async
 * @function deleteProfilePhoto
 * @returns {Promise<string>} Empty string
 * 
 * @example
 * dispatch(deleteProfilePhoto());
 */
export const deleteProfilePhoto = createAsyncThunk(
    'profile/deleteProfilePhoto',
    async (_, { dispatch, rejectWithValue }) => {
        const toastId = toast.loading('Removing photo...');
        try {
            const headers = getAuthHeaders();
            await apiConnector('DELETE', PROFILE_API.DELETE_PROFILE_PHOTO, null, headers);
            toast.success('Profile photo removed!', { id: toastId });
            
            // Also update the user's profile photo in authSlice for navbar display
            dispatch(updateUserProfilePhoto(''));
            
            return '';
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to remove photo';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Fetch profile completeness percentage.
 * Returns 0-100 based on filled profile fields.
 * 
 * @async
 * @function fetchProfileCompleteness
 * @returns {Promise<number>} Completeness percentage (0-100)
 */
export const fetchProfileCompleteness = createAsyncThunk(
    'profile/fetchProfileCompleteness',
    async (_, { rejectWithValue }) => {
        try {
            const headers = getAuthHeaders();
            const response = await apiConnector('GET', PROFILE_API.GET_PROFILE_COMPLETENESS, null, headers);
            return response.data.completeness;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch profile completeness';
            return rejectWithValue(errorMessage);
        }
    }
);
