/**
 * @fileoverview Application Constants
 * Global constants for the app
 * 
 * @module constants
 */

export const APP_CONSTANTS = {
  // Screen names
  SCREENS: {
    // Auth Stack (Firebase only)
    LOGIN: 'Login',
    
    // App Stack
    HOME: 'Home',
    PROFILE: 'Profile',
    DIRECTORY: 'Directory',
    EVENTS: 'Events',
    MEMBERSHIP: 'Membership',
    SETTINGS: 'Settings',
    USER_MODERATION: 'UserModeration',
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
