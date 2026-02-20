/**
 * @fileoverview Discussion Room Model
 * Defines the schema for forum discussion rooms/categories.
 * 
 * @module models/discussionRoom
 * 
 * @description
 * Discussion rooms are categories where users can create posts.
 * Examples: Career Advice, JNV Memories, Medical Help, Professional, Alumni News
 */

import mongoose from "mongoose";

/**
 * Discussion Room Schema Definition
 * 
 * @typedef {Object} DiscussionRoom
 * @property {string} name - Room name (e.g., "Career Advice")
 * @property {string} slug - URL-friendly slug
 * @property {string} description - Room description
 * @property {string} icon - Icon identifier (emoji or icon name)
 * @property {string} color - Theme color for the room
 * @property {number} postCount - Number of posts in this room
 * @property {boolean} isActive - Whether room is active
 * @property {number} order - Display order
 */
const discussionRoomSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },

        description: {
            type: String,
            trim: true
        },

        icon: {
            type: String,
            default: "💬"
        },

        color: {
            type: String,
            default: "#3B82F6" // Blue-600
        },

        postCount: {
            type: Number,
            default: 0
        },

        isActive: {
            type: Boolean,
            default: true
        },

        order: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

// Pre-save hook to generate slug from name
discussionRoomSchema.pre("save", function(next) {
    if (this.isModified("name")) {
        this.slug = this.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    }
    next();
});

export default mongoose.model("DiscussionRoom", discussionRoomSchema);
