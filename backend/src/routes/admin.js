import express from "express";
import {
  bootstrapAdmin,
  getDashboardStats,
  updateUserRole,
  updateUserStatus,
  getAllUsers,
  blockUser,
  unblockUser,
  verifyUser,
  getAllPayments,
  manualVerifyPayment,
  getAllSupportTickets,
  getAllEventRequests,
  createNews,
  publishNews,
  getAllNewsAdmin,
  broadcastNotification,
  migrateApprovedRequests
} from "../controllers/admin.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

/**
 * One-time admin bootstrap (NO middleware on purpose)
 */
router.post("/bootstrap", bootstrapAdmin);

/**
 * One-time migration for approved event requests (NO middleware)
 */
router.post("/events/migrate-approved", migrateApprovedRequests);

/**
 * Admin-only governance routes
 */
router.use(protect);
router.use(authorize("ADMIN"));

// Dashboard Stats
router.get("/dashboard/stats", getDashboardStats);

router.patch("/user/:id/role", updateUserRole);
router.patch("/user/:id/status", updateUserStatus);

router.get("/users", getAllUsers);
router.put("/user/:id/block", blockUser);
router.put("/user/:id/unblock", unblockUser);
router.put("/user/:id/verify", verifyUser);

router.get("/payments", getAllPayments);
router.put("/payment/:id/verify", manualVerifyPayment);

router.get("/support/tickets", protect, getAllSupportTickets);

// Event Requests
router.get("/events/requests", getAllEventRequests);

router.post(
  "/news/create",
  protect,
  createNews
);
router.patch(
  "/news/:id/publish",
  protect,
  publishNews
);
router.get(
  "/news/all",
  protect,
  getAllNewsAdmin
);

router.post(
  "/notifications/broadcast",
  protect,
  broadcastNotification
);

export default router;
