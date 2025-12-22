import express from "express";
import {
  bootstrapAdmin,
  updateUserRole,
  updateUserStatus,
  getAllUsers
} from "../controllers/admin.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

/**
 * One-time admin bootstrap (NO middleware on purpose)
 */
router.post("/bootstrap", bootstrapAdmin);

/**
 * Admin-only governance routes
 */
router.use(protect);
router.use(authorize("ADMIN"));

router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/status", updateUserStatus);

export default router;
