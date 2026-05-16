// controllers/gallery.controller.js - Firestore Version
import uploadImageToCloudinary from "../utils/imageUploader.js";
import { v2 as cloudinary } from "cloudinary";
import { addDocument, getDocuments, getDocument, deleteDocument, updateDocument } from "../config/firestore.js";

export const createAlbum = async (req, res) => {
    const { title, description, visibility, event } = req.body;

    const albumId = await addDocument('albums', {
        title,
        description,
        visibility,
        event: event || null,
        createdBy: req.user.id,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    res.status(201).json({
        success: true,
        data: { id: albumId, title, description, visibility, event, createdBy: req.user.id }
    });
};

export const getAlbums = async (req, res) => {
    const albums = await getDocuments('albums', [
        { field: 'visibility', operator: '==', value: 'PUBLIC' }
    ]);

    // Enrich with creator info
    let enrichedAlbums = [];
    for (const album of albums) {
        try {
            const creator = await getDocument('users', album.createdBy);
            enrichedAlbums.push({
                ...album,
                creator: {
                    firstName: creator.firstName,
                    lastName: creator.lastName
                }
            });
        } catch (err) {
            console.warn(`Failed to load creator for album ${album.id}`, err);
            enrichedAlbums.push(album);
        }
    }

    res.json({
        success: true,
        data: enrichedAlbums.sort((a, b) => b.createdAt - a.createdAt)
    });
};

export const uploadMedia = async (req, res) => {
    try {
        const { albumId } = req.params;

        if (!req.files || !req.files.picture) {
            return res.status(400).json({ message: "File required" });
        }

        const picture = req.files.picture;
        const image = await uploadImageToCloudinary(
            picture,
            process.env.FOLDER_NAME || 'nesmo-albums',
            1000,
            1000
        );

        const mediaId = await addDocument('media', {
            album: albumId,
            url: image.secure_url,
            publicId: image.public_id,
            type: image.resource_type === "video" ? "VIDEO" : "IMAGE",
            uploadedBy: req.user.id,
            isApproved: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.status(201).json({
            success: true,
            data: { id: mediaId, url: image.secure_url, type: image.resource_type === "video" ? "VIDEO" : "IMAGE" }
        });
    } catch (error) {
        console.error("Upload Media Error:", error);
        res.status(500).json({ message: "Media upload failed" });
    }
};

export const getAlbumMedia = async (req, res) => {
    try {
        const media = await getDocuments('media', [
            { field: 'album', operator: '==', value: req.params.albumId },
            { field: 'isApproved', operator: '==', value: true }
        ]);

        res.json({
            success: true,
            data: media.sort((a, b) => b.createdAt - a.createdAt)
        });
    } catch (error) {
        console.error("Get Album Media Error:", error);
        res.status(500).json({ message: "Failed to fetch media" });
    }
};

export const deleteMedia = async (req, res) => {
    try {
        const media = await getDocument('media', req.params.id);

        if (!media) {
            return res.status(404).json({ message: "Media not found" });
        }

        // Delete from Cloudinary
        if (media.publicId) {
            await cloudinary.uploader.destroy(media.publicId);
        }

        // Delete from Firestore
        await deleteDocument('media', req.params.id);

        res.json({
            success: true,
            message: "Media removed"
        });
    } catch (error) {
        console.error("Delete Media Error:", error);
        res.status(500).json({ message: "Failed to delete media" });
    }
};