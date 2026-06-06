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
 * POST   /api/profile/onboarding         - Complete profile onboarding (mandatory)
 * POST   /api/profile/education          - Add education entry
 * PUT    /api/profile/education/:eduId   - Update education entry
 * DELETE /api/profile/education/:eduId   - Delete education entry
 * GET    /api/profile/alumni             - Get alumni directory (with filters)
 * 
 * @requires protect middleware - All routes require authentication
 */

import express from "express";
import {
  updateProfile,
  getMyProfile,
  uploadProfilePhoto,
  getProfileCompleteness,
  completeOnboarding,
  addEducation,
  updateEducation,
  deleteEducation,
  getBatchDashboardStats,
  blockBatchUser,
  unblockBatchUser
} from "../controllers/profile.js";
import { getAlumniDirectory } from "../controllers/alumniDirectory.js";
import { protect } from "../middleware/firebaseAuth.js";

const router = express.Router();

/* ==================== Profile Routes ==================== */

/** Get current user's profile with populated data */
router.get("/me", protect, getMyProfile);

/** Get Batch Rep dashboard stats and members */
router.get("/batch-dashboard", protect, getBatchDashboardStats);

/** Block/unblock a member of the representative's batch */
router.put("/batch/user/:id/block", protect, blockBatchUser);
router.put("/batch/user/:id/unblock", protect, unblockBatchUser);

/** Update profile fields (bio, contact, education, work) */
router.put("/update", protect, updateProfile);

/** Upload/update profile photo to Cloudinary */
router.put("/profilePhoto", protect, uploadProfilePhoto);

/** Get profile completion percentage (0-100) */
router.get("/profileCompleteness", protect, getProfileCompleteness);

/** Complete profile onboarding (mandatory fields after signup) */
router.post("/onboarding", protect, completeOnboarding);

/* ==================== Education History Routes ==================== */

/** Add a new education entry */
router.post("/education", protect, addEducation);

/** Update an existing education entry */
router.put("/education/:eduId", protect, updateEducation);

/** Delete an education entry */
router.delete("/education/:eduId", protect, deleteEducation);

/* ==================== Alumni Directory Routes ==================== */

/** Get paginated alumni directory with filters (PUBLIC - no auth required) */
router.get("/alumni", getAlumniDirectory);

export default router;
