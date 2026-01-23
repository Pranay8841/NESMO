/**
 * @fileoverview API Connector Utility
 * Provides a centralized axios instance and connector function for API calls.
 * 
 * @module utils/APIsConnector
 */

import axios from "axios"
import type { Method, AxiosRequestHeaders } from "axios";

/** Configured axios instance for API requests */
export const axiosInstance = axios.create({});

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
        method:`${method}`,
        url:`${url}`,
        data: bodyData || undefined,
        headers: headers || undefined,
        params: params || undefined,
    });
}