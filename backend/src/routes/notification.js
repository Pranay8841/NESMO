import express from "express";
import { protect } from "../middleware/firebaseAuth.js";
import {
  getMyNotifications,
  markNotificationRead,
} from "../controllers/notification.js";

const router = express.Router();

router.get("/", protect, getMyNotifications);
router.patch("/:id/read", protect, markNotificationRead);