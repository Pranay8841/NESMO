import express from "express";
import {
  updateProfile,
  getMyProfile
} from "../controllers/profile.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/update", protect, updateProfile);

export default router;
