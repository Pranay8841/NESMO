/**
 * @fileoverview API Endpoints Configuration for Web Frontend
 * Centralized API endpoint definitions for all backend routes.
 * All endpoints are constructed from VITE_API_URL environment variable.
 * 
 * @module utils/api
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ==================== Authentication Endpoints ==================== */

/**
 * User authentication API endpoints.
 */
export const USER_API = {
  /** Base auth endpoint */
  AUTH: `${BASE_URL}/auth`,
  /** GET - Get current authenticated user */
  CURRENT_USER: `${BASE_URL}/auth/me`,
  /** POST - Logout user */
  LOGOUT: `${BASE_URL}/auth/logout`,
};

/* ==================== Profile & Directory Endpoints ==================== */

/**
 * Alumni directory API endpoints.
 */
export const ALUMNI_API = {
  /** GET - Fetch paginated alumni directory with filters */
  GET_ALUMNI_DIRECTORY: `${BASE_URL}/profile/alumni`,
};

/**
 * User profile management API endpoints.
 */
export const PROFILE_API = {
  /** GET - Fetch current user's profile */
  GET_PROFILE: `${BASE_URL}/profile/me`,
  /** PUT - Update profile information */
  UPDATE_PROFILE: `${BASE_URL}/profile/update`,
  /** PUT - Upload/update profile photo */
  UPLOAD_PROFILE_PHOTO: `${BASE_URL}/profile/profilePhoto`,
  /** DELETE - Remove profile photo */
  DELETE_PROFILE_PHOTO: `${BASE_URL}/profile/profilePhoto`,
  /** GET - Get profile completeness percentage */
  GET_PROFILE_COMPLETENESS: `${BASE_URL}/profile/profileCompleteness`,
  /** POST - Add a new education entry */
  ADD_EDUCATION: `${BASE_URL}/profile/education`,
  /** PUT - Update an education entry */
  UPDATE_EDUCATION: `${BASE_URL}/profile/education`,
  /** DELETE - Delete an education entry */
  DELETE_EDUCATION: `${BASE_URL}/profile/education`,
  /** POST - Complete mandatory profile onboarding */
  COMPLETE_ONBOARDING: `${BASE_URL}/profile/onboarding`,
  /** GET - Get batch representative dashboard statistics */
  GET_BATCH_DASHBOARD: `${BASE_URL}/profile/batch-dashboard`,
  /** PUT - Block a user in the representative's batch */
  BLOCK_BATCH_USER: `${BASE_URL}/profile/batch/user/:id/block`,
  /** PUT - Unblock a user in the representative's batch */
  UNBLOCK_BATCH_USER: `${BASE_URL}/profile/batch/user/:id/unblock`,
};

/* ==================== Membership Endpoints ==================== */

/**
 * Membership payment API endpoints.
 */
export const MEMBERSHIP_API = {
  CREATE_MEMBERSHIP_ORDER: `${BASE_URL}/membership/createMembershipOrder`,
  VERIFY_MEMBERSHIP_PAYMENT: `${BASE_URL}/membership/verifyMembershipPayment`,
};

/* ==================== Events Endpoints ==================== */

/**
 * Events management API endpoints.
 */
export const EVENTS_API = {
  GET_EVENTS: `${BASE_URL}/events`,
  REGISTER_FOR_EVENT: `${BASE_URL}/events/:id/register`,
  CREATE_EVENT_PAYMENT_ORDER: `${BASE_URL}/events/:id/payment/createEventOrder`,
  VERIFY_EVENT_PAYMENT: `${BASE_URL}/events/payment/verifyEventPayment`,
};

/* ==================== Notification Endpoints ==================== */

/**
 * Notification API endpoints.
 */
export const NOTIFICATION_API = {
  GET_NOTIFICATIONS: `${BASE_URL}/notifications`,
  MARK_AS_READ: `${BASE_URL}/notifications/:id/read`,
};

/* ==================== Admin Panel Endpoints ==================== */

/**
 * Admin panel API endpoints.
 */
export const ADMIN_API = {
  /** GET - Dashboard stats for admin overview */
  GET_DASHBOARD_STATS: `${BASE_URL}/admin/dashboard/stats`,
  /** PATCH - Update user role */
  UPDATE_USER_ROLE: `${BASE_URL}/admin/user/:id/role`,
  /** PATCH - Update user status */
  UPDATE_USER_STATUS: `${BASE_URL}/admin/user/:id/status`,
  /** GET - Get all users (paginated) */
  GET_ALL_USERS: `${BASE_URL}/admin/users`,
  /** PUT - Block a user */
  BLOCK_USER: `${BASE_URL}/admin/user/:id/block`,
  /** PUT - Unblock a user */
  UNBLOCK_USER: `${BASE_URL}/admin/user/:id/unblock`,
  /** PUT - Verify a user's email */
  VERIFY_USER: `${BASE_URL}/admin/user/:id/verify`,
  /** GET - Get all payments */
  GET_ALL_PAYMENTS: `${BASE_URL}/admin/payments`,
  /** PUT - Manually verify payment */
  MANUAL_VERIFY_PAYMENT: `${BASE_URL}/admin/payment/:id/verify`,
  /** GET - Get all support tickets */
  GET_ALL_SUPPORT_TICKETS: `${BASE_URL}/admin/support/tickets`,
  /** POST - Create news article */
  CREATE_NEWS: `${BASE_URL}/admin/news/create`,
  /** PATCH - Publish news article */
  PUBLISH_NEWS: `${BASE_URL}/admin/news/:id/publish`,
  /** GET - Get all news (admin view) */
  GET_ALL_NEWS_ADMIN: `${BASE_URL}/admin/news/all`,
  /** POST - Broadcast notification to users */
  BROADCAST_NOTIFICATION: `${BASE_URL}/admin/notifications/broadcast`,
};

/* ==================== Newsletter Endpoints ==================== */

/**
 * Newsletter API endpoints.
 */
export const NEWSLETTER_API = {
  /** POST - Subscribe email to newsletter */
  SUBSCRIBE: `${BASE_URL}/newsletter/subscribe`,
  /** POST - Unsubscribe email from newsletter */
  UNSUBSCRIBE: `${BASE_URL}/newsletter/unsubscribe`,
  /** GET - Get all active subscribers (admin only) */
  GET_SUBSCRIBERS: `${BASE_URL}/newsletter/subscribers`,
  /** GET - Get newsletter statistics (admin only) */
  GET_STATS: `${BASE_URL}/newsletter/stats`,
};

/* ==================== Community Endpoints ==================== */

/**
 * Community Knowledge & Guidance System API endpoints.
 */
export const COMMUNITY_API = {
  /** GET - Initial load of last 50 messages */
  GET_MESSAGES: `${BASE_URL}/community/messages`,
  /** POST - Post a new message */
  POST_MESSAGE: `${BASE_URL}/community/messages`,
  /** PATCH - Edit own message (within 15 min) */
  EDIT_MESSAGE: (id: string) => `${BASE_URL}/community/messages/${id}`,
  /** DELETE - Soft-delete a message */
  DELETE_MESSAGE: (id: string) => `${BASE_URL}/community/messages/${id}`,
  /** POST - Toggle emoji reaction */
  REACT_TO_MESSAGE: (id: string) => `${BASE_URL}/community/messages/${id}/react`,
  /** POST - Report a message */
  REPORT_MESSAGE: (id: string) => `${BASE_URL}/community/messages/${id}/report`,
  /** GET - Smart alumni match for a query */
  SMART_MATCH: `${BASE_URL}/community/smart-match`,
  /** GET - List curated knowledge entries */
  GET_KNOWLEDGE: `${BASE_URL}/community/knowledge`,
  /** POST - Admin: create knowledge entry */
  CREATE_KNOWLEDGE: `${BASE_URL}/community/knowledge`,
  /** GET - Fetch mentionable users */
  GET_MENTIONABLE_USERS: `${BASE_URL}/community/users`,
  /** POST - Request mentorship (sends notification & returns WhatsApp credentials) */
  REQUEST_MENTORSHIP: `${BASE_URL}/community/mentorship/request`,
};
