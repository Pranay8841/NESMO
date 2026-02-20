/**
 * @fileoverview Comment Model
 * Defines the schema for comments on discussion posts.
 * 
 * @module models/comment
 * 
 * @description
 * Comments can be nested (replies to comments) via parentComment reference.
 * Users can like comments similar to posts.
 */

import mongoose from "mongoose";

/**
 * Comment Schema Definition
 * 
 * @typedef {Object} Comment
 * @property {ObjectId} post - Reference to parent Post
 * @property {ObjectId} author - Reference to User who created the comment
 * @property {ObjectId} parentComment - Reference to parent Comment (for replies)
 * @property {string} content - Comment text content
 * @property {ObjectId[]} likes - Users who liked the comment
 * @property {number} replyCount - Number of replies to this comment
 * @property {boolean} isActive - Whether comment is visible (soft delete)
 */
const commentSchema = new mongoose.Schema(
    {
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        /** Parent comment for nested replies */
        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null
        },

        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },

        /** Users who liked this comment */
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],

        /** Cached reply count for performance */
        replyCount: {
            type: Number,
            default: 0
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
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ author: 1 });

// Virtual for like count
commentSchema.virtual("likeCount").get(function() {
    return this.likes ? this.likes.length : 0;
});

// Ensure virtuals are included in JSON
commentSchema.set("toJSON", { virtuals: true });
commentSchema.set("toObject", { virtuals: true });

export default mongoose.model("Comment", commentSchema);
