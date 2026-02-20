/**
 * @fileoverview Discussion Forum Routes
 * API routes for discussion rooms, posts, comments, and trending features.
 * 
 * @module routes/discussion
 */

import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
    // Discussion Rooms
    getRooms,
    createRoom,
    seedRooms,
    // Posts
    getPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    toggleLikePost,
    votePoll,
    sharePost,
    // Comments
    getComments,
    getReplies,
    createComment,
    deleteComment,
    toggleLikeComment,
    // Trending & Suggestions
    getTrending,
    getPostsByHashtag,
    getAlumniSuggestions,
    seedHashtags
} from "../controllers/discussion.js";

const router = express.Router();

/* ==================== Public Routes (still need auth for some features) ==================== */

// Discussion Rooms
router.get("/rooms", getRooms);

// Trending - accessible to all
router.get("/trending", getTrending);

/* ==================== Protected Routes (require authentication) ==================== */

// Apply protect middleware to all routes below
router.use(protect);

// Posts - Read
router.get("/posts", getPosts);
router.get("/posts/:id", getPostById);
router.get("/hashtag/:tag", getPostsByHashtag);

// Posts - Create/Update/Delete
router.post("/posts", createPost);
router.put("/posts/:id", updatePost);
router.delete("/posts/:id", deletePost);

// Post Interactions
router.post("/posts/:id/like", toggleLikePost);
router.post("/posts/:id/vote", votePoll);
router.post("/posts/:id/share", sharePost);

// Comments
router.get("/posts/:postId/comments", getComments);
router.post("/posts/:postId/comments", createComment);
router.get("/comments/:commentId/replies", getReplies);
router.delete("/comments/:id", deleteComment);
router.post("/comments/:id/like", toggleLikeComment);

// Suggestions
router.get("/suggestions", getAlumniSuggestions);

/* ==================== Admin Routes ==================== */

router.use(authorize("ADMIN"));

// Admin - Room Management
router.post("/rooms", createRoom);
router.post("/rooms/seed", seedRooms);

// Admin - Seed Data
router.post("/hashtags/seed", seedHashtags);

export default router;
