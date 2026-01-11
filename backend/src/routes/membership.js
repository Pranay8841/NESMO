// src/routes/membership.routes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createMembershipOrder,
  verifyMembershipPayment
} from "../controllers/membership.js";

const router = express.Router();

router.post("/createMembershipOrder", protect, createMembershipOrder);
router.post("/verifyMembershipPayment", protect, verifyMembershipPayment);

export default router;
