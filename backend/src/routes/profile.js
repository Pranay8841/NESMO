import express from "express";
import {
  updateProfile,
  getMyProfile
} from "../controllers/profile.js";
import { getAlumniDirectory } from "../controllers/alumniDirectory.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/update", protect, updateProfile);

// Alumni Directory Route
router.get("/", protect, getAlumniDirectory);

export default router;
