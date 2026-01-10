// controllers/gallery.controller.js
import Album from "../models/album.js";
import Media from "../models/media.js";
import { uploadImageToCloudinary } from "../utils/imageUploader.js";
import { v2 as cloudinary } from "cloudinary";

export const createAlbum = async (req, res) => {
    const { title, description, visibility, event } = req.body;

    const album = await Album.create({
        title,
        description,
        visibility,
        event: event || null,
        createdBy: req.user.id
    });

    res.status(201).json({
        success: true,
        data: album
    });
};

export const getAlbums = async (req, res) => {
    const query = { visibility: "PUBLIC" };

    const albums = await Album.find(query)
        .populate("createdBy", "firstName lastName")
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        data: albums
    });
};

export const uploadMedia = async (req, res) => {
    const { albumId } = req.params;

    if (!req.file) {
        return res.status(400).json({ message: "File required" });
    }

    const picture = req.files.picture
    const image = await uploadImageToCloudinary(
        picture,
        process.env.FOLDER_NAME,
        1000,
        1000
    )

    const media = await Media.create({
        album: albumId,
        url: image.secure_url,
        publicId: image.public_id,
        type: image.resource_type === "video" ? "VIDEO" : "IMAGE",
        uploadedBy: req.user.id
    });

    res.status(201).json({
        success: true,
        data: media
    });
};

export const getAlbumMedia = async (req, res) => {
    const media = await Media.find({
        album: req.params.albumId,
        isApproved: true
    }).sort({ createdAt: -1 });

    res.json({
        success: true,
        data: media
    });
};

export const deleteMedia = async (req, res) => {
    const media = await Media.findById(req.params.id);

    if (!media) {
        return res.status(404).json({ message: "Media not found" });
    }

    await cloudinary.v2.uploader.destroy(media.publicId);
    await media.deleteOne();

    res.json({
        success: true,
        message: "Media removed"
    });
};