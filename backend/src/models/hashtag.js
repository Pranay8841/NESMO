/**
 * @fileoverview Hashtag Model
 * Tracks trending hashtags and their usage statistics.
 * 
 * @module models/hashtag
 * 
 * @description
 * Stores aggregate data about hashtag usage for trending calculations.
 * Categories: CAREER, NETWORK, CULTURE, GENERAL
 */

import mongoose from "mongoose";

/**
 * Hashtag Schema Definition
 * 
 * @typedef {Object} Hashtag
 * @property {string} tag - Hashtag text (without #, lowercase)
 * @property {string} category - Category for grouping trends
 * @property {number} useCount - Total times the hashtag has been used
 * @property {number} weeklyCount - Usage count in the last 7 days
 * @property {Date} lastUsed - When the hashtag was last used
 */
const hashtagSchema = new mongoose.Schema(
    {
        tag: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        category: {
            type: String,
            enum: ["CAREER", "NETWORK", "CULTURE", "GENERAL"],
            default: "GENERAL"
        },

        /** Total usage count (all time) */
        useCount: {
            type: Number,
            default: 0
        },

        /** Weekly usage count (for trending calculation) */
        weeklyCount: {
            type: Number,
            default: 0
        },

        /** Last time this hashtag was used */
        lastUsed: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// Index for trending queries
hashtagSchema.index({ weeklyCount: -1 });
hashtagSchema.index({ category: 1, weeklyCount: -1 });

export default mongoose.model("Hashtag", hashtagSchema);
