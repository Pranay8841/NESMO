/**
 * @fileoverview Newsletter Service for React Native
 * Handles newsletter subscription API calls.
 * 
 * @module services/newsletterService
 */

import { apiConnector } from '../utils/APIsConnector';
import { NEWSLETTER_API } from '../utils/api';

/**
 * Subscribe email address to the newsletter
 * 
 * @async
 * @function subscribeToNewsletter
 * @param {string} email - Email address to subscribe
 * @returns {Promise<Object>} Response data from API
 */
export const subscribeToNewsletter = async (email: string) => {
  if (!email || !email.trim()) {
    throw new Error('Email is required');
  }

  // Client-side email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new Error('Please enter a valid email address');
  }

  const response = await apiConnector(
    'POST',
    NEWSLETTER_API.SUBSCRIBE,
    { email: email.trim() }
  );

  return response.data;
};
