/**
 * @fileoverview Community Routes
 * All routes for the Community Knowledge & Guidance System.
 *
 * @module routes/community
 */

import express from "express";
import { protect, authorize } from "../middleware/firebaseAuth.js";
import {
  getMessages,
  postMessage,
  editMessage,
  deleteMessage,
  reactToMessage,
  reportMessage,
  smartMatchAlumni,
  getKnowledgeEntries,
  createKnowledgeEntry,
  getMentionableUsers,
  requestMentorship,
} from "../controllers/community.js";

const router = express.Router();

// All community routes require authentication
router.use(protect);

/* ─── Users for tagging ─── */
router.get("/users", getMentionableUsers);

/* ─── Messages ─── */

/** GET  /api/community/messages — Initial load (last 50) */
router.get("/messages", getMessages);

/** POST /api/community/messages — Post a new message */
router.post("/messages", postMessage);

/** PATCH /api/community/messages/:id — Edit own message */
router.patch("/messages/:id", editMessage);

/** DELETE /api/community/messages/:id — Soft-delete (own or admin) */
router.delete("/messages/:id", deleteMessage);

/** POST /api/community/messages/:id/react — Toggle emoji reaction */
router.post("/messages/:id/react", reactToMessage);

/** POST /api/community/messages/:id/report — Report message */
router.post("/messages/:id/report", reportMessage);

/* ─── Smart Match ─── */

/** GET /api/community/smart-match?q= — Alumni profile matcher */
router.get("/smart-match", smartMatchAlumni);

/** POST /api/community/mentorship/request — Send mentorship request notification & get WhatsApp details */
router.post("/mentorship/request", requestMentorship);

/* ─── Knowledge Base ─── */

/** GET /api/community/knowledge — List knowledge entries */
router.get("/knowledge", getKnowledgeEntries);

/** POST /api/community/knowledge — Admin: create knowledge entry from thread */
router.post(
  "/knowledge",
  authorize("ADMIN"),
  createKnowledgeEntry
);

export default router;
