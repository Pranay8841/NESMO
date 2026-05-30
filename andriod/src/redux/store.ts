/**
 * @fileoverview Redux Store Configuration
 * Combines all slices and exports a single store instance.
 * 
 * @module redux/store
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import profileReducer from './slices/profileSlice';
import alumniReducer from './slices/alumniSlice';
import adminReducer from './slices/adminSlice';
import communityReducer from './slices/communitySlice';
import notificationReducer from './slices/notificationSlice';

/**
 * Redux store instance
 * Combines all feature slices
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    alumni: alumniReducer,
    admin: adminReducer,
    community: communityReducer,
    notification: notificationReducer,
  },
});

/**
 * RootState type for use throughout the app
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * AppDispatch type for use with dispatch
 */
export type AppDispatch = typeof store.dispatch;
