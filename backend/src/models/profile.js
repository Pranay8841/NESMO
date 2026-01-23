/**
 * @fileoverview Profile Model
 * Defines the Profile schema for storing user's personal and professional details.
 * 
 * @module models/profile
 * 
 * @description
 * Profile document stores extended user information like contact details,
 * education batch info, occupation, and profile photo.
 * Linked 1:1 with User model.
 * 
 * @indexes
 * - currentAddress, occupation, organization, joinBatch, passoutBatch, bloodGroup
 *   for optimized alumni directory queries
 */

import mongoose from "mongoose";

/**
 * Profile Schema Definition
 * 
 * @typedef {Object} Profile
 * @property {string} about - User bio/description (max 500 chars)
 * @property {string} phone - Contact phone number
 * @property {string} joinBatch - Year of joining JNV
 * @property {string} passoutBatch - Year of passing out from JNV
 * @property {string} occupation - Current occupation/profession
 * @property {string} organization - Company/School/Hospital name
 * @property {string} sector - Work sector (e.g., IT, Education, Healthcare)
 * @property {string} currentAddress - Current city/location
 * @property {string} bloodGroup - Blood group (enum: A+, A-, B+, B-, AB+, AB-, O+, O-)
 * @property {string} profilePhoto - Cloudinary URL of profile photo
 * @property {Date} createdAt - Document creation timestamp
 * @property {Date} updatedAt - Document update timestamp
 */
const profileSchema = new mongoose.Schema(
    {
        about: {
            type: String,
            maxlength: 500
        },

        phone: {
            type: String
        },

        joinBatch: {
            type: String
        },

        passoutBatch: {
            type: String
        },

        occupation: {
            type: String
        },

        organization: {
            type: String  // Company/School/Hospital name
        },

        sector: {
            type: String
        },

        currentAddress: {
            type: String
        },

        bloodGroup: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
        },

        profilePhoto: {
            type: String,
            default: "" // uploaded later
        }
    },
    { timestamps: true }
);

profileSchema.index({ currentAddress: 1 });
profileSchema.index({ occupation: 1 });
profileSchema.index({ organization: 1 });
profileSchema.index({ joinBatch: 1 });
profileSchema.index({ passoutBatch: 1 });
profileSchema.index({ bloodGroup: 1 });

export default mongoose.model("Profile", profileSchema);