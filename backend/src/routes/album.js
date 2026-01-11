// routes/gallery.routes.js
import express from "express";
import { protect, authorize } from "../middleware/auth.js";

import {
    createAlbum,
    getAlbums,
    uploadMedia,
    getAlbumMedia,
    deleteMedia
} from "../controllers/album.js";

const router = express.Router();

router.get("/", protect, getAlbums);

router.post(
    "/create-album",
    protect,
    authorize("ADMIN", "EVENT_LEAD"),
    createAlbum
);

router.post(
    "/:albumId/media",
    protect,
    authorize("ADMIN", "EVENT_LEAD"),
    uploadMedia
);

router.get(
    "/:albumId/media",
    protect,
    getAlbumMedia
);

router.delete(
    "/:albumId/media/:mediaId",
    protect,
    authorize("ADMIN"),
    deleteMedia
);

export default router;
