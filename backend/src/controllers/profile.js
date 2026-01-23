/**
 * @fileoverview Profile Controller
 * Handles user profile management including viewing, updating, and photo uploads.
 * 
 * @module controllers/profile
 */

import User from "../models/user.js";
import Profile from "../models/profile.js";
import uploadImageToCloudinary from "../utils/imageUploader.js";

/**
 * Update user's profile information.
 * Updates profile fields like bio, contact info, education, and work details.
 * 
 * @async
 * @function updateProfile
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user from middleware
 * @param {string} req.user.id - User's ID
 * @param {Object} req.body - Profile data to update
 * @param {string} [req.body.about] - User's bio/about section (max 500 chars)
 * @param {string} [req.body.phone] - Contact phone number
 * @param {string} [req.body.city] - Current city/address
 * @param {string} [req.body.occupation] - Current occupation
 * @param {string} [req.body.organization] - Company/organization name
 * @param {string} [req.body.sector] - Work sector
 * @param {string} [req.body.joinBatch] - JNV joining batch year
 * @param {string} [req.body.passoutBatch] - JNV passout batch year
 * @param {string} [req.body.bloodGroup] - Blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated profile
 * 
 * @requires protect middleware
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      about,
      phone,
      city,
      occupation,
      organization,
      sector,
      joinBatch,
      passoutBatch,
      bloodGroup
    } = req.body;

    const user = await User.findById(userId).populate("profile");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const profile = await Profile.findByIdAndUpdate(
      user.profile._id,
      {
        about,
        phone,
        currentAddress: city,
        occupation,
        organization,
        sector,
        joinBatch,
        passoutBatch,
        bloodGroup
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update profile"
    });
  }
};

/**
 * Get current user's complete profile.
 * Returns user data with populated profile information.
 * 
 * @async
 * @function getMyProfile
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user from middleware
 * @param {string} req.user.id - User's ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user and profile data
 * 
 * @requires protect middleware
 */
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("profile")
      .select("-password");

    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/**
 * Calculate profile completeness percentage.
 * Counts filled profile fields and returns percentage (10 fields = 100%).
 * 
 * @async
 * @function getProfileCompleteness
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user from middleware
 * @param {string} req.user.id - User's ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with completeness percentage (0-100)
 * 
 * @requires protect middleware
 * 
 * @example
 * // Response
 * { "success": true, "completeness": 70 }
 */
export const getProfileCompleteness = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("profile");

    let filledFields = 0;
    const profile = user.profile;
    
    // Count filled fields (10 total fields in profile)
    if (profile.profilePhoto) filledFields++;
    if (profile.phone) filledFields++;
    if (profile.currentAddress) filledFields++;
    if (profile.occupation) filledFields++;
    if (profile.organization) filledFields++;
    if (profile.sector) filledFields++;
    if (profile.about) filledFields++;
    if (profile.joinBatch) filledFields++;
    if (profile.passoutBatch) filledFields++;
    if (profile.bloodGroup) filledFields++;
    
    // Calculate percentage (10 fields = 100%)
    const completeness = Math.round((filledFields / 10) * 100);

    res.status(200).json({
      success: true,
      completeness: completeness
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to calculate profile completeness"
    });
  }
};

/**
 * Upload and update user's profile photo.
 * Uploads image to Cloudinary and updates profile with secure URL.
 * 
 * @async
 * @function uploadProfilePhoto
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user from middleware
 * @param {string} req.user.id - User's ID
 * @param {Object} req.files - Uploaded files from express-fileupload
 * @param {Object} req.files.profilePhoto - The profile photo file
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with new photo URL and updated profile
 * 
 * @requires protect middleware
 * @requires express-fileupload middleware
 */
export const uploadProfilePhoto = async (req, res) => {
  try {
    const displayPicture = req.files.profilePhoto;
    const userId = req.user.id;
    
    // Upload image to Cloudinary
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    );
    
    // Get user to find their profile ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Update the Profile model's profilePhoto field
    const updatedProfile = await Profile.findByIdAndUpdate(
      user.profile,
      { profilePhoto: image.secure_url },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: "Profile photo updated successfully",
      profilePhoto: image.secure_url,
      profile: updatedProfile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


