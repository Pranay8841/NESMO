import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import alumniReducer from './slices/alumniSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    alumni: alumniReducer,
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