/**
 * @fileoverview Admin Service for React Native
 * Redux async thunks for admin operations.
 * Handles dashboard stats, user management, payments, tickets, and news.
 * 
 * @module services/adminService
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiConnector } from '../utils/APIsConnector';
import { ADMIN_API } from '../utils/api';
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
 * Fetch admin dashboard statistics.
 */
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboardStats',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setDashboardLoading(true));
      const response = await apiConnector(
        'GET',
        ADMIN_API.GET_DASHBOARD_STATS
      );
      
      if (response.data.success) {
        dispatch(setDashboardStats(response.data.data));
      }
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch dashboard stats';
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setDashboardLoading(false));
    }
  }
);

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
        null,
        params as any
      );
      
      if (response.data.success) {
        dispatch(setUsers({
          users: response.data.users,
          total: response.data.pagination.total,
          page: response.data.pagination.page,
          pages: response.data.pagination.pages
        }));
      }
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch users';
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setUsersLoading(false));
    }
  }
);

/**
 * Block a user.
 */
export const blockUser = createAsyncThunk(
  'admin/blockUser',
  async ({ userId, reason }: { userId: string; reason: string }, { dispatch, rejectWithValue }) => {
    try {
      const url = ADMIN_API.BLOCK_USER.replace(':id', userId);
      const response = await apiConnector(
        'PUT',
        url,
        { reason }
      );
      
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
    try {
      const url = ADMIN_API.UNBLOCK_USER.replace(':id', userId);
      const response = await apiConnector(
        'PUT',
        url,
        null
      );
      
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
    try {
      const url = ADMIN_API.UPDATE_USER_ROLE.replace(':id', userId);
      const response = await apiConnector(
        'PATCH',
        url,
        { role }
      );
      
      dispatch(updateUserInList({ userId, updates: { role } }));
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update user role';
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
    try {
      const url = ADMIN_API.VERIFY_USER.replace(':id', userId);
      const response = await apiConnector(
        'PUT',
        url,
        null
      );
      
      dispatch(updateUserInList({ userId, updates: { isEmailVerified: true } }));
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to verify user';
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
        null,
        params as any
      );
      
      if (response.data.success) {
        dispatch(setPayments({
          payments: response.data.payments,
          total: response.data.total,
          page: params.page || 1
        }));
      }
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch payments';
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setPaymentsLoading(false));
    }
  }
);

/**
 * Manually verify a payment.
 */
export const verifyPayment = createAsyncThunk(
  'admin/verifyPayment',
  async (paymentId: string, { dispatch, rejectWithValue }) => {
    try {
      const url = ADMIN_API.MANUAL_VERIFY_PAYMENT.replace(':id', paymentId);
      const response = await apiConnector(
        'PUT',
        url,
        null
      );
      
      dispatch(fetchAllPayments({}));
      dispatch(fetchDashboardStats());
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to verify payment';
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
        null,
        params as any
      );
      
      if (response.data.success) {
        dispatch(setTickets({
          tickets: response.data.data,
          total: response.data.pagination.total,
          page: response.data.pagination.page
        }));
      }
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch tickets';
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setTicketsLoading(false));
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
        ADMIN_API.GET_ALL_NEWS_ADMIN
      );
      
      if (response.data.success) {
        dispatch(setNews({
          news: response.data.data,
          total: response.data.data.length
        }));
      }
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch news';
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setNewsLoading(false));
    }
  }
);

/**
 * Create news article.
 */
export const createNewsArticle = createAsyncThunk(
  'admin/createNews',
  async (newsData: { title: string; summary: string; content: string; coverImage?: string; audience?: string; cities?: string[] }, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiConnector(
        'POST',
        ADMIN_API.CREATE_NEWS,
        newsData
      );
      
      dispatch(fetchAllNews());
      dispatch(fetchDashboardStats());
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create article';
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
    try {
      const url = ADMIN_API.PUBLISH_NEWS.replace(':id', newsId);
      const response = await apiConnector(
        'PATCH',
        url,
        null
      );
      
      dispatch(fetchAllNews());
      dispatch(fetchDashboardStats());
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to publish article';
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
    try {
      const response = await apiConnector(
        'POST',
        ADMIN_API.BROADCAST_NOTIFICATION,
        data
      );
      
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send broadcast';
      return rejectWithValue(errorMessage);
    }
  }
);
