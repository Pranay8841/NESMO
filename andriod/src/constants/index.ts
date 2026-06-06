/**
 * @fileoverview Application Constants
 * Global constants for the app
 * 
 * @module constants
 */

export const APP_CONSTANTS = {
  // Screen names
  SCREENS: {
    // Auth Stack
    LOGIN: 'Login',
    SIGNUP: 'Signup',
    VERIFY_EMAIL: 'VerifyEmail',

    // App Stack
    HOME: 'Home',
    DIRECTORY: 'Directory',
    EVENTS: 'Events',
    MEMBERSHIP: 'Membership',
    PROFILE: 'Profile',
    USER_MODERATION: 'UserModeration',
    ADMIN_DASHBOARD: 'AdminDashboard',
    BATCH_DASHBOARD: 'BatchDashboard',
    COMMUNITY: 'Community',
    KNOWLEDGE_BASE: 'KnowledgeBase',
    NOTIFICATIONS: 'Notifications',
    PROFILE_ONBOARDING: 'ProfileOnboarding',
  },

  // Navigation names
  NAVIGATION: {
    AUTH_STACK: 'AuthStack',
    APP_STACK: 'AppStack',
    APP_TABS: 'AppTabs',
    ROOT: 'Root',
  },

  // Validation
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },

  // API
  API_TIMEOUT: 30000, // 30 seconds
};
