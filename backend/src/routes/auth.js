/**
 * @fileoverview Authentication Routes
 * Defines authentication API endpoints for Firebase Google Sign-In only
 * 
 * @module routes/auth
 */

import express from 'express';
import { googleSignIn, logout, getCurrentUser, updateProfile } from "../controllers/auth-firestore.js";
import { protect } from '../middleware/firebaseAuth.js';

const router = express.Router();

/* ==================== Public Routes ==================== */

// Google Sign-In: Frontend sends Firebase ID token
router.post('/google-signin', googleSignIn);

/* ==================== Protected Routes ==================== */

router.post('/logout', protect, logout);
router.get('/me', protect, getCurrentUser);
router.put('/update-profile', protect, updateProfile);

export default router;