/**
 * @fileoverview Album Model
 * Defines the schema for photo albums/galleries.
 * 
 * @module models/album
 */
import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            maxlength: 500
        },

        /** Album category for filtering */
        category: {
            type: String,
            enum: ["ANNUAL_MEET", "REGIONAL_MEETUP", "CHARITY_DRIVE", "OTHER"],
            default: "OTHER"
        },

        /** Cover image URL for album thumbnail */
        coverImage: {
            type: String,
            trim: true
        },

        /** Location/city where the event took place */
        location: {
            type: String,
            trim: true
        },

        /** Date of the event/album */
        eventDate: {
            type: Date
        },

        /** Featured album flag */
        isFeatured: {
            type: Boolean,
            default: false
        },

        visibility: {
            type: String,
            enum: ["PUBLIC", "PRIVATE"],
            default: "PUBLIC"
        },

        /** Cached media count for performance */
        mediaCount: {
            type: Number,
            default: 0
        },

        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            default: null
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

albumSchema.index({ visibility: 1, createdAt: -1 });
albumSchema.index({ category: 1 });
albumSchema.index({ location: 1 });
albumSchema.index({ eventDate: -1 });
albumSchema.index({ isFeatured: 1 });

export default mongoose.model("Album", albumSchema);
