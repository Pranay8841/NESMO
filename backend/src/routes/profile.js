/**
 * @fileoverview Profile & Alumni Directory Routes
 * Defines API endpoints for profile management and alumni directory.
 * 
 * @module routes/profile
 * 
 * @routes
 * GET    /api/profile/me                 - Get current user's profile
 * PUT    /api/profile/update             - Update profile information
 * PUT    /api/profile/profilePhoto       - Upload profile photo
 * GET    /api/profile/profileCompleteness - Get profile completion percentage
 * GET    /api/profile/alumni             - Get alumni directory (with filters)
 * 
 * @requires protect middleware - All routes require authentication
 */

import express from "express";
import {
  updateProfile,
  getMyProfile,
  uploadProfilePhoto,
  getProfileCompleteness
} from "../controllers/profile.js";
import { getAlumniDirectory } from "../controllers/alumniDirectory.js";
import { protect } from "../middleware/firebaseAuth.js";

const router = express.Router();

/* ==================== Profile Routes ==================== */

/** Get current user's profile with populated data */
router.get("/me", protect, getMyProfile);

/** Update profile fields (bio, contact, education, work) */
router.put("/update", protect, updateProfile);

/** Upload/update profile photo to Cloudinary */
router.put("/profilePhoto", protect, uploadProfilePhoto);

/** Get profile completion percentage (0-100) */
router.get("/profileCompleteness", protect, getProfileCompleteness);

/* ==================== Alumni Directory Routes ==================== */

/** Get paginated alumni directory with filters */
router.get("/alumni", protect, getAlumniDirectory);

export default router;
