import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosRequestHeaders } from 'axios';
import toast from 'react-hot-toast';
import { apiConnector } from '../utils/APIsConnector';
import { PROFILE_API } from '../utils/api';

export interface Profile {
    _id: string;
    about?: string;
    phone?: string;
    joinBatch?: string;
    passoutBatch?: string;
    occupation?: string;
    organization?: string;
    sector?: string;
    currentAddress?: string;
    bloodGroup?: string;
    profilePhoto?: string;
    createdAt: string;
    updatedAt: string;
}

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

// Helper to get auth headers
const getAuthHeaders = (): AxiosRequestHeaders | undefined => {
    const tokenStr = localStorage.getItem('token');
    const token = tokenStr ? JSON.parse(tokenStr) : null;
    return token ? { Authorization: `Bearer ${token}` } as AxiosRequestHeaders : undefined;
};

// Fetch user's profile
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

// Update user's profile
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

// Upload profile photo
export const uploadProfilePhoto = createAsyncThunk(
    'profile/uploadProfilePhoto',
    async (file: File, { rejectWithValue }) => {
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
            return response.data.data?.image || response.data.profilePhoto;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to upload photo';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

// Fetch profile completeness
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
