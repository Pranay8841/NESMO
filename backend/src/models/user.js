/**
 * @fileoverview User Model
 * Defines the User schema for authentication and user management.
 * 
 * @module models/user
 * 
 * @description
 * User document stores authentication info, role, membership status,
 * and references the Profile model for additional user data.
 * 
 * @relationship
 * - User 1:1 Profile (via profile ObjectId reference)
 */

import mongoose from "mongoose";

/**
 * User Schema Definition
 * 
 * @typedef {Object} User
 * @property {string} firstName - User's first name (required, trimmed)
 * @property {string} lastName - User's last name (required, trimmed)
 * @property {string} email - Unique email address (required, lowercase)
 * @property {string} password - Hashed password (select: false for security)
 * @property {string} authProvider - Authentication method: "LOCAL" | "GOOGLE"
 * @property {string} googleId - Google OAuth ID (unique, sparse index)
 * @property {string} role - User role: "VISITOR" | "MEMBER" | "EVENT_LEAD" | "ADMIN"
 * @property {boolean} isMember - NESMO paid membership status
 * @property {string} status - Account status: "ACTIVE" | "BLOCKED"
 * @property {ObjectId} profile - Reference to Profile document
 * @property {boolean} isEmailVerified - Email verification status
 * @property {string} emailVerificationToken - Token for email verification (select: false)
 * @property {Date} emailVerificationExpires - Token expiry time (select: false)
 * @property {string} blockedReason - Reason for account block (if blocked)
 * @property {Date} blockedAt - Timestamp when account was blocked
 * @property {Date} createdAt - Document creation timestamp
 * @property {Date} updatedAt - Document update timestamp
 */
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      select: false
    },

    authProvider: {
      type: String,
      enum: ["LOCAL", "GOOGLE"],
      default: "LOCAL"
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true
    },

    role: {
      type: String,
      enum: ["VISITOR", "MEMBER", "EVENT_LEAD", "ADMIN"],
      default: "VISITOR"
    },

    isMember: {
      type: Boolean,
      default: false
    },

    status: {
      type: String,
      enum: ["ACTIVE", "BLOCKED"],
      default: "ACTIVE"
    },

    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true
    },

    // Email verification fields
    isEmailVerified: {
      type: Boolean,
      default: false
    },

    emailVerificationToken: {
      type: String,
      select: false
    },

    emailVerificationExpires: {
      type: Date,
      select: false
    },

    // Password reset fields
    passwordResetToken: {
      type: String,
      select: false
    },

    passwordResetExpires: {
      type: Date,
      select: false
    },

    blockedReason: {
      type: String
    },
    
    blockedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

userSchema.index({ status: 1, isMember: 1 });

export default mongoose.model("User", userSchema);