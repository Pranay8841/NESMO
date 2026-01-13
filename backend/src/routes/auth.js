import express from 'express';
import passport from 'passport';
import { register, login, googleAuthCallback, getCurrentUser } from "../controllers/auth.js";
import { protect } from '../middleware/auth.js';

const router = express.Router();

// User Registration
router.post('/register', register);

// User Login
router.post('/login', login);

// Get Current User (protected)
router.get('/me', protect, getCurrentUser);

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