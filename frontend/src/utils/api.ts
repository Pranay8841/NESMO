const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// USER ENDPOINTS
export const USER_API = {
  LOGIN: `${BASE_URL}/auth/login`,
  REGISTER: `${BASE_URL}/auth/register`,
  VERIFY_EMAIL: `${BASE_URL}/auth/verify-email`, // Token appended as path param
  RESEND_VERIFICATION: `${BASE_URL}/auth/resend-verification`,
  GOOGLE_AUTH: `${BASE_URL}/auth/google`,
  GOOGLE_CALLBACK: `${BASE_URL}/auth/google/callback`,
  CURRENT_USER: `${BASE_URL}/auth/me`,
  LOGOUT: `${BASE_URL}/auth/logout`,
  GET_PUBLISHED_NEWS: `${BASE_URL}/auth/news/published`,
};

// ALUMNI DIRECTORY ENDPOINTS
export const ALUMNI_API = {
  GET_ALUMNI_DIRECTORY: `${BASE_URL}/profile/alumni`,
};

// PROFILE ENDPOINTS
export const PROFILE_API = {
  GET_PROFILE:`${BASE_URL}/profile/me`,
  UPDATE_PROFILE: `${BASE_URL}/profile/update`,
  UPLOAD_PROFILE_PHOTO:`${BASE_URL}/profile/profilePhoto`,
  GET_PROFILE_COMPLETENESS:`${BASE_URL}/profile/profileCompleteness`,
};

// MEMBERSHIP ENDPOINTS
export const MEMBERSHIP_API = {
  CREATE_MEMBERSHIP_ORDER: `${BASE_URL}/membership/createMembershipOrder`,
  VERIFY_MEMBERSHIP_PAYMENT: `${BASE_URL}/membership/verifyMembershipPayment`,
};

// HELPLINE ENDPOINTS
export const HELPLINE_API = {
  CREATE_TICKET: `${BASE_URL}/helpline/createTicket`,
  SEARCH_HELPERS: `${BASE_URL}/helpline/searchHelpers`,
  RESPOND_TO_TICKET: `${BASE_URL}/helpline/tickets/:ticketId/respond`,
};

// EVENTS ENDPOINTS
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

// ALBUM ENDPOINTS
export const ALBUM_API = {
  GET_ALBUMS: `${BASE_URL}/albums`,
  CREATE_ALBUM: `${BASE_URL}/create-album`,
  UPLOAD_MEDIA:`${BASE_URL}/:albumId/media`,
  GET_ALBUM_MEDIA:`${BASE_URL}/:albumId/media`,
  Delete_ALBUM_MEDIA:`${BASE_URL}/:albumId/media/:mediaId`,
}

// NOTIFICATIONS ENDPOINTS
export const NOTIFICATIONS_API = {
  GET_NOTIFICATIONS: `${BASE_URL}/notifications`,
  MARK_AS_READ: `${BASE_URL}/notifications/:id/mark-as-read`,
};

// ADMIN ENDPOINTS
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