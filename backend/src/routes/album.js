// routes/gallery.routes.js
import express from "express";
import { protect, authorize } from "../middleware/firebaseAuth.js";

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
    authorize("ADMIN", "BATCH_REP"),
    createAlbum
);

router.post(
    "/:albumId/media",
    protect,
    authorize("ADMIN", "BATCH_REP"),
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
