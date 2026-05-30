/**
 * @fileoverview Notification Service
 * Axios calls for notification endpoints.
 *
 * @module services/notificationService
 */

import { apiConnector } from '../utils/APIsConnector';
import { NOTIFICATION_API } from '../utils/api';

/**
 * Fetch all notifications for the current authenticated user.
 */
export const getMyNotifications = async () => {
  const response = await apiConnector('GET', NOTIFICATION_API.GET_NOTIFICATIONS);
  return response.data;
};

/**
 * Mark a specific notification as read.
 */
export const markNotificationRead = async (id: string) => {
  const response = await apiConnector('PATCH', NOTIFICATION_API.MARK_AS_READ.replace(':id', id));
  return response.data;
};
