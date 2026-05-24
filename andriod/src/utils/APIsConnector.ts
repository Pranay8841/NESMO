/**
 * @fileoverview API Connector Utility for React Native
 * Provides a centralized axios instance and connector function for API calls.
 * Automatically injects Bearer token from Redux state.
 * 
 * @module utils/APIsConnector
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { Method, AxiosRequestHeaders } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

let store: any = null;

/**
 * Initialize the API connector with Redux store
 * Must be called from App.tsx after store creation
 * 
 * @param {Object} reduxStore - Redux store instance
 */
export const initializeApiConnector = (reduxStore: any) => {
  store = reduxStore;
};

/** Configured axios instance for API requests */
export const axiosInstance: AxiosInstance = axios.create({});

/**
 * Add token to request headers
 * Retrieves token from Redux store or AsyncStorage
 */
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      let token = null;

      // Try to get token from Redux store first
      if (store) {
        const state = store.getState();
        token = state.auth?.token;
      }

      // Fallback to AsyncStorage
      if (!token) {
        const storedToken = await AsyncStorage.getItem('authToken');
        token = storedToken ? JSON.parse(storedToken) : null;
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.error('Error adding token to request:', error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

/**
 * Handle response errors globally
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth state
      if (store) {
        store.dispatch({ type: 'auth/logout' });
      }
      await AsyncStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

/**
 * Make an API request using the configured axios instance.
 * Provides a unified interface for all HTTP methods.
 * 
 * @function apiConnector
 * @param {Method} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {string} url - Full API endpoint URL
 * @param {Object|null} [bodyData] - Request body for POST/PUT requests
 * @param {AxiosRequestHeaders|null} [headers] - Custom request headers
 * @param {Object|null} [params] - URL query parameters
 * @returns {Promise} Axios response promise
 * 
 * @example
 * // GET request with params
 * apiConnector('GET', '/api/users', null, headers, { page: 1, limit: 10 });
 * 
 * // POST request with body
 * apiConnector('POST', '/api/auth/login', { email, password }, null, null);
 */
export const apiConnector = (
  method: Method,
  url: string,
  bodyData?: Record<string, any> | null,
  headers?: AxiosRequestHeaders | null,
  params?: Record<string, unknown> | null
) => {
  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData || undefined,
    headers: headers || undefined,
    params: params || undefined,
  });
};
