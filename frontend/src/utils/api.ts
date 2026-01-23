/**
 * @fileoverview API Endpoints Configuration
 * Centralized API endpoint definitions for all backend routes.
 * All endpoints are constructed from VITE_API_URL environment variable.
 * 
 * @module utils/api
 * 
 * @usage
 * import { USER_API, PROFILE_API } from './api';
 * apiConnector('POST', USER_API.LOGIN, credentials);
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ==================== Authentication Endpoints ==================== */

/**
 * User authentication API endpoints.
 */
export const USER_API = {
  /** POST - Login with email/password */
  LOGIN: `${BASE_URL}/auth/login`,
  /** POST - Register new user account */
  REGISTER: `${BASE_URL}/auth/register`,
  /** GET - Verify email (append /:token) */
  VERIFY_EMAIL: `${BASE_URL}/auth/verify-email`,
  /** POST - Resend verification email */
  RESEND_VERIFICATION: `${BASE_URL}/auth/resend-verification`,
  /** GET - Initiate Google OAuth flow */
  GOOGLE_AUTH: `${BASE_URL}/auth/google`,
  /** GET - Google OAuth callback (handled by backend) */
  GOOGLE_CALLBACK: `${BASE_URL}/auth/google/callback`,
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
  /** GET - Get profile completeness percentage */
  GET_PROFILE_COMPLETENESS: `${BASE_URL}/profile/profileCompleteness`,
};

/* ==================== Future Feature Endpoints ==================== */

/**
 * Membership payment API endpoints.
 * @future Not part of first release
 */
export const MEMBERSHIP_API = {
  CREATE_MEMBERSHIP_ORDER: `${BASE_URL}/membership/createMembershipOrder`,
  VERIFY_MEMBERSHIP_PAYMENT: `${BASE_URL}/membership/verifyMembershipPayment`,
};

/**
 * Helpline/support API endpoints.
 * @future Not part of first release
 */
export const HELPLINE_API = {
  CREATE_TICKET: `${BASE_URL}/helpline/createTicket`,
  SEARCH_HELPERS: `${BASE_URL}/helpline/searchHelpers`,
  RESPOND_TO_TICKET: `${BASE_URL}/helpline/tickets/:ticketId/respond`,
};

/**
 * Events management API endpoints.
 * @future Not part of first release
 */
export const EVENTS_API = {
  REQUEST_EVENT_CREATION: `${BASE_URL}/events/request`,
  REVIEW_EVENT_REQUEST: `${BASE_URL}/events/admin/request/:id`,
  CREATE_EVENT: `${BASE_URL}/events/create`,
  GET_EVENTS: `${BASE_URL}/events`,
  REGISTER_FOR_EVENT: `${BASE_URL}/events/:id/register`,
  EVENTS_DASHBOARD: `${BASE_URL}/events/:id/dashboard`,
  CREATE_EVENT_PAYMENT_ORDER: `${BASE_URL}/events/:id/payment/createEventOrder`,
  VERIFY_EVENT_PAYMENT: `${BASE_URL}/events/payment/verifyEventPayment`,
};

/**
 * Photo album API endpoints.
 * @future Not part of first release
 */
export const ALBUM_API = {
  GET_ALBUMS: `${BASE_URL}/albums`,
  CREATE_ALBUM: `${BASE_URL}/create-album`,
  UPLOAD_MEDIA:`${BASE_URL}/:albumId/media`,
  GET_ALBUM_MEDIA:`${BASE_URL}/:albumId/media`,
  Delete_ALBUM_MEDIA:`${BASE_URL}/:albumId/media/:mediaId`,
}

/**
 * Notifications API endpoints.
 * @future Not part of first release
 */
export const NOTIFICATIONS_API = {
  GET_NOTIFICATIONS: `${BASE_URL}/notifications`,
  MARK_AS_READ: `${BASE_URL}/notifications/:id/mark-as-read`,
};

/**
 * Admin panel API endpoints.
 * @future Not part of first release
 */
export const ADMIN_API = {
  UPDATE_USER_ROLE: `${BASE_URL}/admin/user/:id/role`,
  UPDATE_USER_STATUS: `${BASE_URL}/admin/user/:id/status`,
  GET_ALL_USERS: `${BASE_URL}/admin/users`,
  BLOCK_USER: `${BASE_URL}/admin/user/:id/block`,
  UNBLOCK_USER: `${BASE_URL}/admin/user/:id/unblock`,
  VERIFY_USER: `${BASE_URL}/admin/user/:id/verify`,
  GET_ALL_PAYMENTS: `${BASE_URL}/admin/payments`,
  MANUAL_VERIFY_PAYMENT: `${BASE_URL}/admin/payment/:id/verify`,
  GET_ALL_SUPPORT_TICKETS: `${BASE_URL}/admin/support/tickets`,
  CREATE_NEWS: `${BASE_URL}/admin/news/create`,
  PUBLISH_NEWS: `${BASE_URL}/admin/news/:id/publish`,
  GET_ALL_NEWS_ADMIN: `${BASE_URL}/admin/news/all`,
  BROADCAST_NOTIFICATION: `${BASE_URL}/admin/notifications/broadcast`,
};