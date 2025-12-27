import express from "express";
import {
  updateProfile,
  getMyProfile,
  uploadProfilePhoto,
  getProfileCompleteness
} from "../controllers/profile.js";
import { getAlumniDirectory } from "../controllers/alumniDirectory.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/update", protect, updateProfile);
router.put("/profilePhoto", protect, uploadProfilePhoto);
router.get("/profileCompleteness", protect, getProfileCompleteness);

// Alumni Directory Route
router.get("/", protect, getAlumniDirectory);

export default router;
