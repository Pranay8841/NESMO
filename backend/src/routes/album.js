/**
 * @fileoverview Album Routes
 * Routes for photo gallery/album management.
 * 
 * @module routes/album
 */
import express from "express";
import { protect, authorize } from "../middleware/firebaseAuth.js";

import {
    createAlbum,
    getAlbums,
    getAlbumById,
    updateAlbum,
    deleteAlbum,
    uploadMedia,
    getAlbumMedia,
    deleteMedia,
    getLocations,
    getYears
} from "../controllers/album.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Filter data routes
router.get("/locations", getLocations);
router.get("/years", getYears);

// Album CRUD routes
router.get("/", getAlbums);
router.get("/:albumId", getAlbumById);

router.post(
    "/create-album",
    authorize("ADMIN", "EVENT_LEAD"),
    createAlbum
);

router.put(
    "/:albumId",
    authorize("ADMIN", "EVENT_LEAD"),
    updateAlbum
);

router.delete(
    "/:albumId",
    authorize("ADMIN"),
    deleteAlbum
);

// Media routes
router.post(
    "/:albumId/media",
    authorize("ADMIN", "EVENT_LEAD"),
    uploadMedia
);

router.get(
    "/:albumId/media",
    getAlbumMedia
);

router.delete(
    "/:albumId/media/:mediaId",
    deleteMedia
);

export default router;
