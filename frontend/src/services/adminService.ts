/**
 * @fileoverview Admin Service
 * Redux async thunks for admin operations.
 * Handles dashboard stats, user management, payments, tickets, and news.
 * 
 * @module services/adminService
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AxiosRequestHeaders } from 'axios';
import toast from 'react-hot-toast';
import { 
    setDashboardLoading, 
    setDashboardStats,
    setUsersLoading,
    setUsers,
    updateUserInList,
    setPaymentsLoading,
    setPayments,
    setTicketsLoading,
    setTickets,
    setNewsLoading,
    setNews
} from '../redux/slices/adminSlice';
import { apiConnector } from '../utils/APIsConnector';
import { ADMIN_API } from '../utils/api';

/**
 * Get auth headers with JWT token
 */
const getAuthHeaders = (): AxiosRequestHeaders => {
    const token = localStorage.getItem('token');
    const parsedToken = token ? JSON.parse(token) : null;
    return {
        Authorization: `Bearer ${parsedToken}`,
    } as AxiosRequestHeaders;
};

/**
 * Fetch admin dashboard statistics.
 * Retrieves aggregated data for users, payments, tickets, and news.
 */
export const fetchDashboardStats = createAsyncThunk(
    'admin/fetchDashboardStats',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setDashboardLoading(true));
            const response = await apiConnector(
                'GET',
                ADMIN_API.GET_DASHBOARD_STATS,
                null,
                getAuthHeaders()
            );
            
            if (response.data.success) {
                dispatch(setDashboardStats(response.data.data));
            }
            dispatch(setDashboardLoading(false));
            return response.data;
        } catch (error: any) {
            dispatch(setDashboardLoading(false));
            const errorMessage = error.response?.data?.message || 'Failed to fetch dashboard stats';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

/** User filter params interface */
export interface UserFilterParams {
    page?: number;
    limit?: number;
    status?: 'active' | 'blocked';
    role?: 'MEMBER' | 'BATCH_REP' | 'ADMIN';
    verified?: 'true' | 'false';
    search?: string;
    [key: string]: string | number | undefined;
}

/**
 * Fetch all users (paginated with filters).
 */
export const fetchAllUsers = createAsyncThunk(
    'admin/fetchAllUsers',
    async (params: UserFilterParams = {}, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setUsersLoading(true));
            const response = await apiConnector(
                'GET',
                ADMIN_API.GET_ALL_USERS,
                null,
                getAuthHeaders(),
                params
            );
            
            if (response.data.success) {
                dispatch(setUsers({
                    users: response.data.users,
                    total: response.data.pagination.total,
                    page: response.data.pagination.page,
                    pages: response.data.pagination.pages
                }));
            }
            dispatch(setUsersLoading(false));
            return response.data;
        } catch (error: any) {
            dispatch(setUsersLoading(false));
            const errorMessage = error.response?.data?.message || 'Failed to fetch users';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Block a user.
 */
export const blockUser = createAsyncThunk(
    'admin/blockUser',
    async ({ userId, reason }: { userId: string; reason: string }, { dispatch, rejectWithValue }) => {
        const toastId = toast.loading('Blocking user...');
        try {
            const url = ADMIN_API.BLOCK_USER.replace(':id', userId);
            const response = await apiConnector(
                'PUT',
                url,
                { reason },
                getAuthHeaders()
            );
            
            toast.success('User blocked successfully', { id: toastId });
            // Update the user in the list locally for immediate feedback
            dispatch(updateUserInList({ 
                userId, 
                updates: { 
                    status: 'BLOCKED', 
                    blockedReason: reason,
                    blockedAt: new Date().toISOString()
                } 
            }));
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to block user';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Unblock a user.
 */
export const unblockUser = createAsyncThunk(
    'admin/unblockUser',
    async (userId: string, { dispatch, rejectWithValue }) => {
        const toastId = toast.loading('Unblocking user...');
        try {
            const url = ADMIN_API.UNBLOCK_USER.replace(':id', userId);
            const response = await apiConnector(
                'PUT',
                url,
                null,
                getAuthHeaders()
            );
            
            toast.success('User unblocked successfully', { id: toastId });
            dispatch(updateUserInList({ 
                userId, 
                updates: { 
                    status: 'ACTIVE', 
                    blockedReason: undefined,
                    blockedAt: undefined
                } 
            }));
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to unblock user';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Update user role.
 */
export const updateUserRole = createAsyncThunk(
    'admin/updateUserRole',
    async ({ userId, role }: { userId: string; role: 'MEMBER' | 'BATCH_REP' | 'ADMIN' }, { dispatch, rejectWithValue }) => {
        const toastId = toast.loading('Updating user role...');
        try {
            const url = ADMIN_API.UPDATE_USER_ROLE.replace(':id', userId);
            const response = await apiConnector(
                'PATCH',
                url,
                { role },
                getAuthHeaders()
            );
            
            toast.success('User role updated successfully', { id: toastId });
            dispatch(updateUserInList({ userId, updates: { role } }));
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update user role';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Verify user email manually.
 */
export const verifyUserEmail = createAsyncThunk(
    'admin/verifyUserEmail',
    async (userId: string, { dispatch, rejectWithValue }) => {
        const toastId = toast.loading('Verifying user...');
        try {
            const url = ADMIN_API.VERIFY_USER.replace(':id', userId);
            const response = await apiConnector(
                'PUT',
                url,
                null,
                getAuthHeaders()
            );
            
            toast.success('User verified successfully', { id: toastId });
            dispatch(updateUserInList({ userId, updates: { isEmailVerified: true } }));
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to verify user';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Fetch all payments (paginated).
 */
export const fetchAllPayments = createAsyncThunk(
    'admin/fetchAllPayments',
    async (params: { page?: number; status?: string } = {}, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setPaymentsLoading(true));
            const response = await apiConnector(
                'GET',
                ADMIN_API.GET_ALL_PAYMENTS,
                null,
                getAuthHeaders(),
                params
            );
            
            if (response.data.success) {
                dispatch(setPayments({
                    payments: response.data.payments,
                    total: response.data.total,
                    page: params.page || 1
                }));
            }
            dispatch(setPaymentsLoading(false));
            return response.data;
        } catch (error: any) {
            dispatch(setPaymentsLoading(false));
            const errorMessage = error.response?.data?.message || 'Failed to fetch payments';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Manually verify a payment.
 */
export const verifyPayment = createAsyncThunk(
    'admin/verifyPayment',
    async (paymentId: string, { dispatch, rejectWithValue }) => {
        const toastId = toast.loading('Verifying payment...');
        try {
            const url = ADMIN_API.MANUAL_VERIFY_PAYMENT.replace(':id', paymentId);
            const response = await apiConnector(
                'PUT',
                url,
                null,
                getAuthHeaders()
            );
            
            toast.success('Payment verified successfully', { id: toastId });
            dispatch(fetchAllPayments({}));
            dispatch(fetchDashboardStats());
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to verify payment';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Fetch all support tickets (paginated).
 */
export const fetchAllTickets = createAsyncThunk(
    'admin/fetchAllTickets',
    async (params: { page?: number; category?: string; priority?: string; status?: string } = {}, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setTicketsLoading(true));
            const response = await apiConnector(
                'GET',
                ADMIN_API.GET_ALL_SUPPORT_TICKETS,
                null,
                getAuthHeaders(),
                params
            );
            
            if (response.data.success) {
                dispatch(setTickets({
                    tickets: response.data.data,
                    total: response.data.pagination.total,
                    page: response.data.pagination.page
                }));
            }
            dispatch(setTicketsLoading(false));
            return response.data;
        } catch (error: any) {
            dispatch(setTicketsLoading(false));
            const errorMessage = error.response?.data?.message || 'Failed to fetch tickets';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Fetch all news articles.
 */
export const fetchAllNews = createAsyncThunk(
    'admin/fetchAllNews',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            dispatch(setNewsLoading(true));
            const response = await apiConnector(
                'GET',
                ADMIN_API.GET_ALL_NEWS_ADMIN,
                null,
                getAuthHeaders()
            );
            
            if (response.data.success) {
                dispatch(setNews({
                    news: response.data.data,
                    total: response.data.data.length
                }));
            }
            dispatch(setNewsLoading(false));
            return response.data;
        } catch (error: any) {
            dispatch(setNewsLoading(false));
            const errorMessage = error.response?.data?.message || 'Failed to fetch news';
            toast.error(errorMessage);
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Create news article.
 */
export const createNewsArticle = createAsyncThunk(
    'admin/createNews',
    async (newsData: { title: string; summary: string; content: string; coverImage?: string; audience?: string; cities?: string[] }, { dispatch, rejectWithValue }) => {
        const toastId = toast.loading('Creating article...');
        try {
            const response = await apiConnector(
                'POST',
                ADMIN_API.CREATE_NEWS,
                newsData,
                getAuthHeaders()
            );
            
            toast.success('Article created successfully', { id: toastId });
            dispatch(fetchAllNews());
            dispatch(fetchDashboardStats());
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to create article';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Publish news article.
 */
export const publishNewsArticle = createAsyncThunk(
    'admin/publishNews',
    async (newsId: string, { dispatch, rejectWithValue }) => {
        const toastId = toast.loading('Publishing article...');
        try {
            const url = ADMIN_API.PUBLISH_NEWS.replace(':id', newsId);
            const response = await apiConnector(
                'PATCH',
                url,
                null,
                getAuthHeaders()
            );
            
            toast.success('Article published successfully', { id: toastId });
            dispatch(fetchAllNews());
            dispatch(fetchDashboardStats());
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to publish article';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);

/**
 * Broadcast notification to users.
 */
export const broadcastNotification = createAsyncThunk(
    'admin/broadcastNotification',
    async (data: { title: string; message: string; role?: string }, { rejectWithValue }) => {
        const toastId = toast.loading('Sending broadcast...');
        try {
            const response = await apiConnector(
                'POST',
                ADMIN_API.BROADCAST_NOTIFICATION,
                data,
                getAuthHeaders()
            );
            
            toast.success('Broadcast sent successfully', { id: toastId });
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to send broadcast';
            toast.error(errorMessage, { id: toastId });
            return rejectWithValue(errorMessage);
        }
    }
);
