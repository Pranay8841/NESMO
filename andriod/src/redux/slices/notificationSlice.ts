/**
 * @fileoverview Notification Redux Slice
 * Manages global notification state including unread count.
 * Updated in real-time by the Firestore onSnapshot listener in AppNavigator.
 *
 * @module redux/slices/notificationSlice
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

/**
 * Notification state structure.
 */
interface NotificationState {
  /** Number of unread notifications */
  unreadCount: number;
}

const initialState: NotificationState = {
  unreadCount: 0,
};

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
  },
});

export const {
  setUnreadCount,
  incrementUnreadCount,
  decrementUnreadCount,
  resetUnreadCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;
