/**
 * @fileoverview Admin Redux Slice
 * Manages global admin state including dashboard stats, users, payments, tickets, and news.
 * 
 * @module redux/slices/adminSlice
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

/** Activity item from recent activity feed */
export interface ActivityItem {
  id: string;
  timestamp: string;
  eventType: string;
  userEntity: string;
  status: 'Verified' | 'Success' | 'Emergency' | 'Active' | 'Suspended' | 'Pending' | 'Failed';
}

/** Dashboard statistics structure */
export interface DashboardStats {
  users: {
    total: number;
    byRole: Record<string, number>;
    blocked: number;
    unverified: number;
  };
  payments: {
    total: number;
    byStatus: Record<string, { count: number; total: number }>;
    totalAmount: number;
  };
  tickets: {
    total: number;
    open: number;
    emergency: number;
    byPriority: Record<string, number>;
  };
  news: {
    total: number;
    published: number;
    draft: number;
  };
  recentActivity: ActivityItem[];
}

/** Admin user in list */
export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'MEMBER' | 'BATCH_REP' | 'ADMIN';
  isMember: boolean;
  status: 'ACTIVE' | 'BLOCKED';
  isEmailVerified: boolean;
  blockedReason?: string;
  blockedAt?: string;
  createdAt: string;
  profile?: {
    profilePhoto?: string;
    city?: string;
    currentCompany?: string;
  };
}

/** Payment record */
export interface Payment {
  id: string;
  user: { id: string; firstName: string; lastName: string; email: string };
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  currency: string;
  status: 'CREATED' | 'SUCCESS' | 'FAILED';
  verifiedAt?: string;
  createdAt: string;
}

/** Support ticket */
export interface SupportTicket {
  id: string;
  createdBy: { id: string; firstName: string; lastName: string; email: string };
  category: 'MEDICAL' | 'FINANCIAL' | 'CAREER' | 'GENERAL';
  subject: string;
  description: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'EMERGENCY';
  cities: string[];
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
}

/** News article */
export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImage?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  audience: 'ALL' | 'ALUMNI';
  cities: string[];
  createdBy: { id: string; firstName: string; lastName: string };
  publishedAt?: string;
  createdAt: string;
}

/** Admin state structure */
interface AdminState {
  dashboardStats: DashboardStats | null;
  dashboardLoading: boolean;
  users: {
    data: AdminUser[];
    total: number;
    page: number;
    pages: number;
    loading: boolean;
  };
  payments: {
    data: Payment[];
    total: number;
    page: number;
    loading: boolean;
  };
  tickets: {
    data: SupportTicket[];
    total: number;
    page: number;
    loading: boolean;
  };
  news: {
    data: NewsArticle[];
    total: number;
    loading: boolean;
  };
}

const initialState: AdminState = {
  dashboardStats: null,
  dashboardLoading: false,
  users: { data: [], total: 0, page: 1, pages: 1, loading: false },
  payments: { data: [], total: 0, page: 1, loading: false },
  tickets: { data: [], total: 0, page: 1, loading: false },
  news: { data: [], total: 0, loading: false },
};

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setDashboardLoading: (state, action: PayloadAction<boolean>) => {
      state.dashboardLoading = action.payload;
    },
    setDashboardStats: (state, action: PayloadAction<DashboardStats>) => {
      state.dashboardStats = action.payload;
    },
    setUsersLoading: (state, action: PayloadAction<boolean>) => {
      state.users.loading = action.payload;
    },
    setUsers: (
      state,
      action: PayloadAction<{ users: AdminUser[]; total: number; page: number; pages: number }>
    ) => {
      state.users.data = action.payload.users;
      state.users.total = action.payload.total;
      state.users.page = action.payload.page;
      state.users.pages = action.payload.pages;
    },
    updateUserInList: (
      state,
      action: PayloadAction<{ userId: string; updates: Partial<AdminUser> }>
    ) => {
      const index = state.users.data.findIndex((u) => u.id === action.payload.userId);
      if (index !== -1) {
        state.users.data[index] = { ...state.users.data[index], ...action.payload.updates };
      }
    },
    removeUserFromList: (state, action: PayloadAction<string>) => {
      state.users.data = state.users.data.filter((u) => u.id !== action.payload);
      state.users.total -= 1;
    },
    setPaymentsLoading: (state, action: PayloadAction<boolean>) => {
      state.payments.loading = action.payload;
    },
    setPayments: (state, action: PayloadAction<{ payments: Payment[]; total: number; page: number }>) => {
      state.payments.data = action.payload.payments;
      state.payments.total = action.payload.total;
      state.payments.page = action.payload.page;
    },
    setTicketsLoading: (state, action: PayloadAction<boolean>) => {
      state.tickets.loading = action.payload;
    },
    setTickets: (
      state,
      action: PayloadAction<{ tickets: SupportTicket[]; total: number; page: number }>
    ) => {
      state.tickets.data = action.payload.tickets;
      state.tickets.total = action.payload.total;
      state.tickets.page = action.payload.page;
    },
    setNewsLoading: (state, action: PayloadAction<boolean>) => {
      state.news.loading = action.payload;
    },
    setNews: (state, action: PayloadAction<{ news: NewsArticle[]; total: number }>) => {
      state.news.data = action.payload.news;
      state.news.total = action.payload.total;
    },
    clearAdminState: (state) => {
      state.dashboardStats = null;
      state.users = { data: [], total: 0, page: 1, pages: 1, loading: false };
      state.payments = { data: [], total: 0, page: 1, loading: false };
      state.tickets = { data: [], total: 0, page: 1, loading: false };
      state.news = { data: [], total: 0, loading: false };
    },
  },
});

export const {
  setDashboardLoading,
  setDashboardStats,
  setUsersLoading,
  setUsers,
  updateUserInList,
  removeUserFromList,
  setPaymentsLoading,
  setPayments,
  setTicketsLoading,
  setTickets,
  setNewsLoading,
  setNews,
  clearAdminState,
} = adminSlice.actions;

export default adminSlice.reducer;
