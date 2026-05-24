/**
 * @fileoverview Profile Redux Slice
 * Manages user profile state with async thunk handlers.
 * 
 * @module redux/slices/profileSlice
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  fetchProfile,
  updateProfile,
  uploadProfilePhoto,
  fetchProfileCompleteness,
} from '../../services/profileService';

/**
 * User profile data structure.
 * Represents the Profile document from MongoDB.
 */
export interface UserProfile {
  /** MongoDB ObjectId */
  _id?: string;
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
  createdAt?: string;
  /** Document update timestamp */
  updatedAt?: string;
}

/**
 * Profile state structure.
 */
interface ProfileState {
  /** User's profile data or null if not loaded */
  profile: UserProfile | null;
  /** Loading state for profile operations */
  loading: boolean;
  /** Error message from failed operations */
  error: string | null;
  /** Profile completeness percentage (0-100) */
  completeness: number;
  /** Whether profile edit mode is active */
  isEditing: boolean;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
  completeness: 0,
  isEditing: false,
};

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.profile = action.payload;
    },
    setIsEditing: (state, action: PayloadAction<boolean>) => {
      state.isEditing = action.payload;
    },
    clearProfileError: (state) => {
      state.error = null;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.completeness = 0;
      state.error = null;
      state.isEditing = false;
    },
  },
  extraReducers: (builder) => {
    // Fetch profile
    builder.addCase(fetchProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = action.payload;
    });
    builder.addCase(fetchProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update profile
    builder.addCase(updateProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.profile = action.payload;
      state.isEditing = false;
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Upload profile photo
    builder.addCase(uploadProfilePhoto.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(uploadProfilePhoto.fulfilled, (state, action) => {
      state.loading = false;
      if (state.profile) {
        state.profile.profilePhoto = action.payload;
      }
    });
    builder.addCase(uploadProfilePhoto.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch profile completeness
    builder.addCase(fetchProfileCompleteness.fulfilled, (state, action) => {
      state.completeness = action.payload;
    });
  },
});

export const {
  setProfile,
  setIsEditing,
  clearProfileError,
  clearProfile,
} = profileSlice.actions;

export default profileSlice.reducer;
