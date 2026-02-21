/**
 * @fileoverview Album Controller
 * Handles album CRUD operations, media uploads, and gallery queries.
 * 
 * @module controllers/album
 */
import Album from "../models/album.js";
import Media from "../models/media.js";
import uploadImageToCloudinary from "../utils/imageUploader.js";
import { v2 as cloudinary } from "cloudinary";

/**
 * Create a new album.
 * @route POST /api/albums/create-album
 * @access Private (Admin, Event Lead)
 */
export const createAlbum = async (req, res) => {
    try {
        const { title, description, category, location, eventDate, visibility, event, isFeatured } = req.body;

        let coverImageUrl = null;

        // Handle cover image upload if provided
        if (req.files && req.files.coverImage) {
            const result = await uploadImageToCloudinary(
                req.files.coverImage,
                process.env.FOLDER_NAME + "/albums",
                800,
                600
            );
            coverImageUrl = result.secure_url;
        }

        const album = await Album.create({
            title,
            description,
            category: category || "OTHER",
            location,
            eventDate: eventDate || new Date(),
            coverImage: coverImageUrl,
            visibility: visibility || "PUBLIC",
            event: event || null,
            isFeatured: isFeatured || false,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            data: album
        });
    } catch (error) {
        console.error("Create album error:", error);
        res.status(500).json({ message: "Failed to create album" });
    }
};

/**
 * Get all public albums with filtering and pagination.
 * @route GET /api/albums
 * @access Private
 */
export const getAlbums = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            year,
            city,
            search,
            featured
        } = req.query;

        const query = { visibility: "PUBLIC" };

        // Category filter
        if (category && category !== "ALL") {
            query.category = category;
        }

        // Year filter
        if (year) {
            const startDate = new Date(`${year}-01-01`);
            const endDate = new Date(`${year}-12-31`);
            query.eventDate = { $gte: startDate, $lte: endDate };
        }

        // City/location filter
        if (city) {
            query.location = { $regex: city, $options: "i" };
        }

        // Search filter
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } }
            ];
        }

        // Featured filter
        if (featured === "true") {
            query.isFeatured = true;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [albums, total] = await Promise.all([
            Album.find(query)
                .populate("createdBy", "firstName lastName")
                .sort({ isFeatured: -1, eventDate: -1, createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Album.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: albums,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalAlbums: total,
                hasMore: skip + albums.length < total
            }
        });
    } catch (error) {
        console.error("Get albums error:", error);
        res.status(500).json({ message: "Failed to fetch albums" });
    }
};

/**
 * Get single album by ID.
 * @route GET /api/albums/:albumId
 * @access Private
 */
export const getAlbumById = async (req, res) => {
    try {
        const album = await Album.findById(req.params.albumId)
            .populate("createdBy", "firstName lastName")
            .populate("event", "title eventDate venue");

        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }

        res.json({
            success: true,
            data: album
        });
    } catch (error) {
        console.error("Get album error:", error);
        res.status(500).json({ message: "Failed to fetch album" });
    }
};

/**
 * Update album details.
 * @route PUT /api/albums/:albumId
 * @access Private (Admin, Event Lead)
 */
export const updateAlbum = async (req, res) => {
    try {
        const { title, description, category, location, eventDate, visibility, isFeatured } = req.body;
        
        const album = await Album.findById(req.params.albumId);
        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }

        // Check authorization
        if (album.createdBy.toString() !== req.user.id && req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Not authorized to update this album" });
        }

        const updateData = {};
        if (title) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (category) updateData.category = category;
        if (location !== undefined) updateData.location = location;
        if (eventDate) updateData.eventDate = eventDate;
        if (visibility) updateData.visibility = visibility;
        if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

        // Handle cover image update
        if (req.files && req.files.coverImage) {
            const result = await uploadImageToCloudinary(
                req.files.coverImage,
                process.env.FOLDER_NAME + "/albums",
                800,
                600
            );
            updateData.coverImage = result.secure_url;
        }

        const updatedAlbum = await Album.findByIdAndUpdate(
            req.params.albumId,
            updateData,
            { new: true }
        ).populate("createdBy", "firstName lastName");

        res.json({
            success: true,
            data: updatedAlbum
        });
    } catch (error) {
        console.error("Update album error:", error);
        res.status(500).json({ message: "Failed to update album" });
    }
};

/**
 * Delete an album and all associated media.
 * @route DELETE /api/albums/:albumId
 * @access Private (Admin)
 */
export const deleteAlbum = async (req, res) => {
    try {
        const album = await Album.findById(req.params.albumId);
        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }

        // Delete all associated media from Cloudinary
        const mediaItems = await Media.find({ album: req.params.albumId });
        for (const media of mediaItems) {
            if (media.publicId) {
                await cloudinary.uploader.destroy(media.publicId);
            }
        }

        // Delete all media records
        await Media.deleteMany({ album: req.params.albumId });

        // Delete the album
        await album.deleteOne();

        res.json({
            success: true,
            message: "Album and all media deleted successfully"
        });
    } catch (error) {
        console.error("Delete album error:", error);
        res.status(500).json({ message: "Failed to delete album" });
    }
};

/**
 * Upload media to an album.
 * @route POST /api/albums/:albumId/media
 * @access Private (Admin, Event Lead)
 */
export const uploadMedia = async (req, res) => {
    try {
        const { albumId } = req.params;

        const album = await Album.findById(albumId);
        if (!album) {
            return res.status(404).json({ message: "Album not found" });
        }

        if (!req.files || !req.files.media) {
            return res.status(400).json({ message: "File required" });
        }

        const files = Array.isArray(req.files.media) ? req.files.media : [req.files.media];
        const uploadedMedia = [];

        for (const file of files) {
            const image = await uploadImageToCloudinary(
                file,
                process.env.FOLDER_NAME + "/gallery",
                1200,
                1200
            );

            const media = await Media.create({
                album: albumId,
                url: image.secure_url,
                publicId: image.public_id,
                type: image.resource_type === "video" ? "VIDEO" : "IMAGE",
                uploadedBy: req.user.id
            });

            uploadedMedia.push(media);
        }

        // Update media count
        const mediaCount = await Media.countDocuments({ album: albumId, isApproved: true });
        await Album.findByIdAndUpdate(albumId, { mediaCount });

        // Set cover image if none exists
        if (!album.coverImage && uploadedMedia.length > 0) {
            await Album.findByIdAndUpdate(albumId, { coverImage: uploadedMedia[0].url });
        }

        res.status(201).json({
            success: true,
            data: uploadedMedia,
            message: `${uploadedMedia.length} file(s) uploaded successfully`
        });
    } catch (error) {
        console.error("Upload media error:", error);
        res.status(500).json({ message: "Failed to upload media" });
    }
};

/**
 * Get all media for an album.
 * @route GET /api/albums/:albumId/media
 * @access Private
 */
export const getAlbumMedia = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [media, total] = await Promise.all([
            Media.find({
                album: req.params.albumId,
                isApproved: true
            })
                .populate("uploadedBy", "firstName lastName")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Media.countDocuments({ album: req.params.albumId, isApproved: true })
        ]);

        res.json({
            success: true,
            data: media,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalMedia: total
            }
        });
    } catch (error) {
        console.error("Get album media error:", error);
        res.status(500).json({ message: "Failed to fetch media" });
    }
};

/**
 * Delete a single media item.
 * @route DELETE /api/albums/:albumId/media/:mediaId
 * @access Private (Admin or uploader)
 */
export const deleteMedia = async (req, res) => {
    try {
        const media = await Media.findById(req.params.mediaId);

        if (!media) {
            return res.status(404).json({ message: "Media not found" });
        }

        // Check authorization: must be Admin or the original uploader
        const uploaderId = typeof media.uploadedBy === 'object' ? media.uploadedBy._id : media.uploadedBy;
        const isAdmin = req.user.role === "ADMIN";
        const isUploader = uploaderId && uploaderId.toString() === req.user.id.toString();

        if (!isAdmin && !isUploader) {
            return res.status(403).json({ message: "Not authorized to delete this photo" });
        }

        // Delete from Cloudinary
        if (media.publicId) {
            await cloudinary.uploader.destroy(media.publicId);
        }

        await media.deleteOne();

        // Update media count
        const mediaCount = await Media.countDocuments({ album: req.params.albumId, isApproved: true });
        await Album.findByIdAndUpdate(req.params.albumId, { mediaCount });

        res.json({
            success: true,
            message: "Media removed"
        });
    } catch (error) {
        console.error("Delete media error:", error);
        res.status(500).json({ message: "Failed to delete media" });
    }
};

/**
 * Get distinct locations for filter dropdown.
 * @route GET /api/albums/locations
 * @access Private
 */
export const getLocations = async (req, res) => {
    try {
        const locations = await Album.distinct("location", {
            visibility: "PUBLIC",
            location: { $ne: null, $ne: "" }
        });

        res.json({
            success: true,
            data: locations.filter(Boolean).sort()
        });
    } catch (error) {
        console.error("Get locations error:", error);
        res.status(500).json({ message: "Failed to fetch locations" });
    }
};

/**
 * Get distinct years for filter dropdown.
 * @route GET /api/albums/years
 * @access Private
 */
export const getYears = async (req, res) => {
    try {
        const albums = await Album.find({ visibility: "PUBLIC", eventDate: { $ne: null } })
            .select("eventDate")
            .sort({ eventDate: -1 });

        const years = [...new Set(albums.map(a => new Date(a.eventDate).getFullYear()))];

        res.json({
            success: true,
            data: years
        });
    } catch (error) {
        console.error("Get years error:", error);
        res.status(500).json({ message: "Failed to fetch years" });
    }
};