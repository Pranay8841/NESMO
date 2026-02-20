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
  /** POST - Request password reset email */
  FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
  /** POST - Reset password with token (append /:token) */
  RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
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
 */
export const EVENTS_API = {
  /** GET - Get all public events */
  GET_EVENTS: `${BASE_URL}/events`,
  /** GET - Get single event by ID */
  GET_EVENT_BY_ID: `${BASE_URL}/events`, // Append /:id
  /** POST - Request to create an event */
  REQUEST_EVENT_CREATION: `${BASE_URL}/events/request`,
  /** GET - Get user's own event requests */
  GET_MY_EVENT_REQUESTS: `${BASE_URL}/events/user/my-requests`,
  /** GET - Get user's event registrations */
  GET_MY_REGISTRATIONS: `${BASE_URL}/events/user/my-registrations`,
  /** GET - Check registration status for an event */
  GET_REGISTRATION_STATUS: `${BASE_URL}/events`, // Append /:id/registration-status
  /** POST - Register for an event */
  REGISTER_FOR_EVENT: `${BASE_URL}/events`, // Append /:id/register
  /** DELETE - Unregister from an event */
  UNREGISTER_FROM_EVENT: `${BASE_URL}/events`, // Append /:id/unregister
  /** POST - Create payment order for paid event */
  CREATE_EVENT_PAYMENT_ORDER: `${BASE_URL}/events`, // Append /:id/payment/create-order
  /** POST - Verify event payment */
  VERIFY_EVENT_PAYMENT: `${BASE_URL}/events/payment/verifyEventPayment`,
  /** GET - Get events created by user (Event Lead) */
  GET_MY_EVENTS: `${BASE_URL}/events/lead/my-events`,
  /** POST - Create a new event (Event Lead) */
  CREATE_EVENT: `${BASE_URL}/events/create`,
  /** PUT - Update an event (Event Lead) */
  UPDATE_EVENT: `${BASE_URL}/events`, // Append /:id
  /** DELETE - Delete an event (Event Lead) */
  DELETE_EVENT: `${BASE_URL}/events`, // Append /:id
  /** GET - Get event dashboard/registrations (Event Lead) */
  GET_EVENT_DASHBOARD: `${BASE_URL}/events`, // Append /:id/dashboard
  /** POST - Send reminder to event registrants (Event Lead) */
  SEND_REMINDER: `${BASE_URL}/events`, // Append /:id/send-reminder
  /** PUT - Admin review event request */
  REVIEW_EVENT_REQUEST: `${BASE_URL}/events/admin/request`, // Append /:id
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
  /** GET - Get all event requests */
  GET_ALL_EVENT_REQUESTS: `${BASE_URL}/admin/events/requests`,
  /** POST - Create news article */
  CREATE_NEWS: `${BASE_URL}/admin/news/create`,
  /** PATCH - Publish news article */
  PUBLISH_NEWS: `${BASE_URL}/admin/news/:id/publish`,
  /** GET - Get all news (admin view) */
  GET_ALL_NEWS_ADMIN: `${BASE_URL}/admin/news/all`,
  /** POST - Broadcast notification to users */
  BROADCAST_NOTIFICATION: `${BASE_URL}/admin/notifications/broadcast`,
};

/* ==================== Discussion Forum Endpoints ==================== */

/**
 * Discussion Forum API endpoints.
 */
export const DISCUSSION_API = {
  /** GET - Get all discussion rooms */
  GET_ROOMS: `${BASE_URL}/discussions/rooms`,
  /** POST - Create a discussion room (Admin) */
  CREATE_ROOM: `${BASE_URL}/discussions/rooms`,
  /** POST - Seed default rooms (Admin) */
  SEED_ROOMS: `${BASE_URL}/discussions/rooms/seed`,
  
  /** GET - Get posts feed */
  GET_POSTS: `${BASE_URL}/discussions/posts`,
  /** GET - Get single post */
  GET_POST_BY_ID: `${BASE_URL}/discussions/posts`, // Append /:id
  /** POST - Create a new post */
  CREATE_POST: `${BASE_URL}/discussions/posts`,
  /** PUT - Update a post */
  UPDATE_POST: `${BASE_URL}/discussions/posts`, // Append /:id
  /** DELETE - Delete a post */
  DELETE_POST: `${BASE_URL}/discussions/posts`, // Append /:id
  
  /** POST - Like/unlike a post */
  TOGGLE_LIKE_POST: `${BASE_URL}/discussions/posts`, // Append /:id/like
  /** POST - Vote on a poll */
  VOTE_POLL: `${BASE_URL}/discussions/posts`, // Append /:id/vote
  /** POST - Share a post */
  SHARE_POST: `${BASE_URL}/discussions/posts`, // Append /:id/share
  
  /** GET - Get comments for a post */
  GET_COMMENTS: `${BASE_URL}/discussions/posts`, // Append /:postId/comments
  /** POST - Create a comment */
  CREATE_COMMENT: `${BASE_URL}/discussions/posts`, // Append /:postId/comments
  /** GET - Get replies for a comment */
  GET_REPLIES: `${BASE_URL}/discussions/comments`, // Append /:commentId/replies
  /** DELETE - Delete a comment */
  DELETE_COMMENT: `${BASE_URL}/discussions/comments`, // Append /:id
  /** POST - Like/unlike a comment */
  TOGGLE_LIKE_COMMENT: `${BASE_URL}/discussions/comments`, // Append /:id/like
  
  /** GET - Get trending hashtags */
  GET_TRENDING: `${BASE_URL}/discussions/trending`,
  /** GET - Get posts by hashtag */
  GET_POSTS_BY_HASHTAG: `${BASE_URL}/discussions/hashtag`, // Append /:tag
  /** GET - Get alumni suggestions */
  GET_SUGGESTIONS: `${BASE_URL}/discussions/suggestions`,
  
  /** POST - Seed default hashtags (Admin) */
  SEED_HASHTAGS: `${BASE_URL}/discussions/hashtags/seed`,
};