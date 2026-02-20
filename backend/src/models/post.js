/**
 * @fileoverview Post Model
 * Defines the schema for discussion forum posts.
 * 
 * @module models/post
 * 
 * @description
 * Posts can contain text, images, and polls. Users can like, comment, and share posts.
 * Each post belongs to a discussion room and has associated hashtags for trending.
 */

import mongoose from "mongoose";

/**
 * Poll Option Schema (embedded)
 */
const pollOptionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    votes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, { _id: true });

/**
 * Post Schema Definition
 * 
 * @typedef {Object} Post
 * @property {ObjectId} author - Reference to User who created the post
 * @property {ObjectId} room - Reference to DiscussionRoom
 * @property {string} content - Post text content
 * @property {string[]} images - Array of image URLs
 * @property {Object} poll - Optional poll with question and options
 * @property {string[]} hashtags - Associated hashtags (without #)
 * @property {ObjectId[]} likes - Users who liked the post
 * @property {number} commentCount - Number of comments
 * @property {number} shareCount - Number of shares
 * @property {boolean} isPinned - Whether post is pinned to top
 * @property {boolean} isActive - Whether post is visible
 */
const postSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DiscussionRoom",
            required: true
        },

        content: {
            type: String,
            trim: true,
            maxlength: 5000
        },

        images: [{
            type: String,
            trim: true
        }],

        /** Poll structure for poll-type posts */
        poll: {
            question: {
                type: String,
                trim: true
            },
            options: [pollOptionSchema],
            /** Poll expiry date */
            expiresAt: Date,
            /** Allow multiple selections */
            allowMultiple: {
                type: Boolean,
                default: false
            }
        },

        /** Hashtags for categorization and trending */
        hashtags: [{
            type: String,
            lowercase: true,
            trim: true
        }],

        /** Users who liked this post */
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],

        /** Cached comment count for performance */
        commentCount: {
            type: Number,
            default: 0
        },

        /** Share count */
        shareCount: {
            type: Number,
            default: 0
        },

        /** Pinned posts appear at top */
        isPinned: {
            type: Boolean,
            default: false
        },

        /** Soft delete flag */
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

// Indexes for efficient queries
postSchema.index({ room: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ "likes": 1 });

// Virtual for like count
postSchema.virtual("likeCount").get(function() {
    return this.likes ? this.likes.length : 0;
});

// Ensure virtuals are included in JSON
postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

export default mongoose.model("Post", postSchema);
