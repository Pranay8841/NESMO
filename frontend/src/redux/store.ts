import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import alumniReducer from './slices/alumniSlice';
import profileReducer from './slices/profileSlice';
import adminReducer from './slices/adminSlice';
import eventsReducer from './slices/eventsSlice';
import discussionReducer from './slices/discussionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    alumni: alumniReducer,
    profile: profileReducer,
    admin: adminReducer,
    events: eventsReducer,
    discussion: discussionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/setUser'],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Typed dispatch that supports thunks
export type AppDispatch = typeof store.dispatch;