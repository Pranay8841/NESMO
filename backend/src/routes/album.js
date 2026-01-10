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

router.get("/albums", protect, getAlbums);

router.post(
    "/albums",
    protect,
    authorize("ADMIN", "EVENT_LEAD"),
    createAlbum
);

router.post(
    "/albums/:albumId/media",
    protect,
    authorize("ADMIN", "EVENT_LEAD"),
    uploadMedia
);

router.get(
    "/albums/:albumId/media",
    protect,
    getAlbumMedia
);

router.delete(
    "/media/:id",
    protect,
    authorize("ADMIN"),
    deleteMedia
);

export default router;
