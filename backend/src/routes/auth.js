/**
 * @fileoverview Authentication Routes
 * Defines all authentication-related API endpoints.
 * 
 * @module routes/auth
 * 
 * @routes
 * POST   /api/auth/register          - Register new user
 * POST   /api/auth/login             - Login with email/password
 * GET    /api/auth/verify-email/:token - Verify email address
 * POST   /api/auth/resend-verification - Resend verification email
 * POST   /api/auth/logout            - Logout user (protected)
 * GET    /api/auth/me                - Get current user (protected)
 * GET    /api/auth/google            - Initiate Google OAuth
 * GET    /api/auth/google/callback   - Google OAuth callback
 */

import express from 'express';
import passport from 'passport';
import { register, login, googleAuthCallback, getCurrentUser, logoutUser, verifyEmail, resendVerificationEmail } from "../controllers/auth.js";
import { protect } from '../middleware/auth.js';

const router = express.Router();

/* ==================== Public Routes ==================== */

// User Registration
router.post('/register', register);

// User Login
router.post('/login', login);

// Email Verification
router.get('/verify-email/:token', verifyEmail);

// Resend Verification Email
router.post('/resend-verification', resendVerificationEmail);

/* ==================== Protected Routes ==================== */

// User Logout (protected)
router.post('/logout', protect, logoutUser);

// Get Current User (protected)
router.get('/me', protect, getCurrentUser);

/* ==================== Google OAuth Routes ==================== */

// Google OAuth Login
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth Callback
router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { 
      session: false, 
      failureRedirect: `${process.env.CLIENT_URL}/oauth-error?message=Google authentication failed` 
    }, (err, user, info) => {
      if (err) {
        console.error("Google OAuth error:", err);
        return res.redirect(`${process.env.CLIENT_URL}/oauth-error?message=${encodeURIComponent(err.message || 'Authentication error')}`);
      }
      if (!user) {
        console.error("Google OAuth failed - no user:", info);
        return res.redirect(`${process.env.CLIENT_URL}/oauth-error?message=Google authentication failed`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  googleAuthCallback
);

export default router;