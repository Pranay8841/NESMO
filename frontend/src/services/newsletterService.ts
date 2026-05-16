/**
 * @fileoverview Newsletter Service
 * Handles newsletter subscription operations via Redux async thunks
 * 
 * @module services/newsletterService
 */

import { apiConnector } from '../utils/APIsConnector';
import { NEWSLETTER_API } from '../utils/api';
import toast from 'react-hot-toast';

/**
 * Subscribe email to newsletter
 * @async
 * @function subscribeToNewsletter
 * @param {string} email - Email address to subscribe
 * @returns {Promise<Object>} Response from API
 * 
 * @example
 * await subscribeToNewsletter('user@example.com');
 */
export const subscribeToNewsletter = async (email: string) => {
  try {
    if (!email || !email.trim()) {
      throw new Error('Email is required');
    }

    // Client-side email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }

    const toastId = toast.loading('Subscribing to newsletter...');

    const response = await apiConnector(
      'POST',
      NEWSLETTER_API.SUBSCRIBE,
      { email: email.trim() }
    );

    // Axios response structure: response.data contains the actual API response
    const data = response?.data;

    if (data?.success) {
      toast.success(data?.message || 'Successfully subscribed!', { id: toastId });
      return data;
    } else {
      toast.error(data?.message || 'Failed to subscribe', { id: toastId });
      throw new Error(data?.message || 'Subscription failed');
    }
  } catch (error: any) {
    // Don't show duplicate error toast as one was already shown in the if/else above
    if (error?.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error?.message && !error.message.includes('Subscription failed')) {
      toast.error(error.message);
    }
    throw error;
  }
};

/**
 * Unsubscribe email from newsletter
 * @async
 * @function unsubscribeFromNewsletter
 * @param {string} email - Email address to unsubscribe
 * @returns {Promise<Object>} Response from API
 * 
 * @example
 * await unsubscribeFromNewsletter('user@example.com');
 */
export const unsubscribeFromNewsletter = async (email: string) => {
  try {
    const toastId = toast.loading('Unsubscribing from newsletter...');

    const response = await apiConnector(
      'POST',
      NEWSLETTER_API.UNSUBSCRIBE,
      { email: email.trim() }
    );

    const data = response?.data;

    if (data?.success) {
      toast.success(data?.message || 'Successfully unsubscribed!', { id: toastId });
      return data;
    } else {
      toast.error(data?.message || 'Failed to unsubscribe', { id: toastId });
      throw new Error(data?.message || 'Unsubscription failed');
    }
  } catch (error: any) {
    if (error?.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error?.message && !error.message.includes('failed')) {
      toast.error(error.message);
    }
    throw error;
  }
};

/**
 * Get all newsletter subscribers (Admin only)
 * @async
 * @function getNewsletterSubscribers
 * @returns {Promise<Object>} List of subscribers
 */
export const getNewsletterSubscribers = async () => {
  try {
    const response = await apiConnector('GET', NEWSLETTER_API.GET_SUBSCRIBERS);
    return response?.data?.data;
  } catch (error: any) {
    console.error('Failed to fetch subscribers:', error);
    throw error;
  }
};

/**
 * Get newsletter statistics (Admin only)
 * @async
 * @function getNewsletterStats
 * @returns {Promise<Object>} Newsletter statistics
 */
export const getNewsletterStats = async () => {
  try {
    const response = await apiConnector('GET', NEWSLETTER_API.GET_STATS);
    return response?.data?.data;
  } catch (error: any) {
    console.error('Failed to fetch newsletter stats:', error);
    throw error;
  }
};
