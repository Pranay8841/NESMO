import express from "express";
import { protect, authorize } from "../middleware/firebaseAuth.js";
import { createSupportTicket ,searchHelpers, respondToTicket } from "../controllers/helpline.js";

const router = express.Router();

router.use(authorize("ADMIN", "MEMBER"));

/** 
 * Create a support ticket
 */
router.post("/createTicket", protect, createSupportTicket);
/**
 * SEARCH HELPERS
 */
router.get("/searchHelpers", protect, searchHelpers);

/**
 * Helper respond to ticket
 */
router.post("/tickets/:ticketId/respond", protect, respondToTicket);

export default router;
