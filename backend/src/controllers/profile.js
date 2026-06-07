/**
 * @fileoverview Profile Controller
 * Handles user profile management including viewing, updating, photo uploads,
 * and education history CRUD.
 * 
 * @module controllers/profile
 */

import crypto from "crypto";
import uploadImageToCloudinary from "../utils/imageUploader.js";
import { getDocument, updateDocument, getDocuments } from "../config/firestore.js";

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

    // Get user doc from Firestore
    const user = await getDocument('users', userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const profileId = user.profile;
    if (!profileId) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const updates = {
      about,
      phone,
      currentAddress: city,
      occupation,
      organization,
      sector,
      joinBatch,
      passoutBatch,
      bloodGroup,
      updatedAt: new Date()
    };

    await updateDocument('profiles', profileId, updates);
    const updatedProfile = await getDocument('profiles', profileId);

    res.status(200).json({ success: true, message: 'Profile updated successfully', profile: updatedProfile });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Unable to update profile' });
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
    const user = await getDocument('users', req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const profile = user.profile ? await getDocument('profiles', user.profile) : null;

    // Remove sensitive fields if any
    const response = { ...user, profile };
    delete response.password;

    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error('Get my profile error:', error);
    return res.status(500).json({ message: 'Failed to fetch profile' });
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
    const user = await getDocument('users', req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const profile = user.profile ? await getDocument('profiles', user.profile) : {};

    let filledFields = 0;
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
    if (Array.isArray(profile.educationHistory) && profile.educationHistory.length > 0) filledFields++;

    const completeness = Math.round((filledFields / 11) * 100);

    res.status(200).json({ success: true, completeness });
  } catch (error) {
    console.error('Get profile completeness error:', error);
    res.status(500).json({ success: false, message: 'Unable to calculate profile completeness' });
  }
};

/**
 * Complete profile onboarding after signup.
 * Requires all mandatory fields to be filled before allowing app access.
 * Sets isOnboarded = true on the user document upon successful completion.
 * 
 * @async
 * @function completeOnboarding
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user from middleware
 * @param {string} req.user.id - User's ID
 * @param {Object} req.body - Onboarding profile data
 * @param {string} req.body.phone - Contact phone number (required)
 * @param {string} req.body.joinBatch - JNV joining batch year (required)
 * @param {string} req.body.passoutBatch - JNV passout batch year (required)
 * @param {string} req.body.occupation - Current occupation (required)
 * @param {string} req.body.currentAddress - Current city/location (required)
 * @param {string} req.body.bloodGroup - Blood group (required)
 * @param {string} [req.body.organization] - Company/organization name
 * @param {string} [req.body.sector] - Work sector
 * @param {string} [req.body.about] - User bio
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated profile
 * 
 * @requires protect middleware
 */
export const completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      phone, joinBatch, passoutBatch,
      occupation, currentAddress, bloodGroup,
      organization, sector, about
    } = req.body;

    // Validate mandatory onboarding fields
    const missing = [];
    if (!phone) missing.push('Phone Number');
    if (!joinBatch) missing.push('Join Batch');
    if (!passoutBatch) missing.push('Passout Batch');
    if (!occupation) missing.push('Occupation');
    if (!organization) missing.push('Organization');
    if (!currentAddress) missing.push('Current City');
    if (!bloodGroup) missing.push('Blood Group');

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Please fill all required fields: ${missing.join(', ')}`
      });
    }

    // Validate blood group enum
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(bloodGroup)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blood group. Must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-'
      });
    }

    const user = await getDocument('users', userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const profileId = user.profile;
    if (!profileId) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Update profile with onboarding data
    await updateDocument('profiles', profileId, {
      phone,
      joinBatch,
      passoutBatch,
      occupation,
      currentAddress,
      bloodGroup,
      organization: organization || '',
      sector: sector || '',
      about: about || '',
      updatedAt: new Date()
    });

    // Mark user as onboarded — this flips the flag so the app stops showing onboarding
    await updateDocument('users', userId, {
      isOnboarded: true,
      updatedAt: new Date()
    });

    const updatedProfile = await getDocument('profiles', profileId);

    res.status(200).json({
      success: true,
      message: 'Welcome to NESMO! Your profile is now set up.',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({ success: false, message: 'Onboarding failed. Please try again.' });
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
    const image = await uploadImageToCloudinary(displayPicture, process.env.FOLDER_NAME, 1000, 1000);

    // Get user to find their profile ID
    const user = await getDocument('users', userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const profileId = user.profile;
    if (!profileId) return res.status(404).json({ success: false, message: 'Profile not found' });

    await updateDocument('profiles', profileId, { profilePhoto: image.secure_url, updatedAt: new Date() });
    const updatedProfile = await getDocument('profiles', profileId);

    res.status(200).json({ success: true, message: 'Profile photo updated successfully', profilePhoto: image.secure_url, profile: updatedProfile });
  } catch (error) {
    console.error('Upload profile photo error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Remove/delete user's profile photo.
 * Resets profilePhoto field to empty string in Firestore.
 * 
 * @async
 * @function deleteProfilePhoto
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user from middleware
 * @param {string} req.user.id - User's ID
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated profile
 * 
 * @requires protect middleware
 */
export const deleteProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user to find their profile ID
    const user = await getDocument('users', userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const profileId = user.profile;
    if (!profileId) return res.status(404).json({ success: false, message: 'Profile not found' });

    await updateDocument('profiles', profileId, { profilePhoto: '', updatedAt: new Date() });
    const updatedProfile = await getDocument('profiles', profileId);

    res.status(200).json({ success: true, message: 'Profile photo removed successfully', profilePhoto: '', profile: updatedProfile });
  } catch (error) {
    console.error('Delete profile photo error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Add a new education entry to user's profile.
 * Appends to the educationHistory array on the profile document.
 *
 * @async
 * @function addEducation
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user from middleware
 * @param {Object} req.body - Education entry data
 * @param {string} req.body.level - Education level (UG, PG, PhD, Diploma, Other)
 * @param {string} req.body.degree - Degree name (e.g. B.Tech, MBA)
 * @param {string} req.body.field - Field of study
 * @param {string} req.body.institution - College/University name
 * @param {string} req.body.startYear - Start year
 * @param {string} [req.body.endYear] - End year (empty if ongoing)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated educationHistory
 */
export const addEducation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { level, degree, field, institution, startYear, endYear } = req.body;

    if (!level || !degree || !institution || !startYear) {
      return res.status(400).json({ success: false, message: 'Level, degree, institution, and start year are required' });
    }

    const user = await getDocument('users', userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const profileId = user.profile;
    if (!profileId) return res.status(404).json({ success: false, message: 'Profile not found' });

    const profile = await getDocument('profiles', profileId);
    const existingHistory = Array.isArray(profile?.educationHistory) ? profile.educationHistory : [];

    const newEntry = {
      id: crypto.randomUUID(),
      level,
      degree,
      field: field || '',
      institution,
      startYear,
      endYear: endYear || '',
    };

    const updatedHistory = [...existingHistory, newEntry];
    await updateDocument('profiles', profileId, { educationHistory: updatedHistory, updatedAt: new Date() });

    res.status(201).json({ success: true, message: 'Education entry added', educationHistory: updatedHistory });
  } catch (error) {
    console.error('Add education error:', error);
    res.status(500).json({ success: false, message: 'Unable to add education entry' });
  }
};

/**
 * Update an existing education entry.
 * Finds the entry by id in the educationHistory array and replaces it.
 *
 * @async
 * @function updateEducation
 * @param {Object} req - Express request object
 * @param {string} req.params.eduId - Education entry ID
 * @param {Object} req.body - Updated education data
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated educationHistory
 */
export const updateEducation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eduId } = req.params;
    const { level, degree, field, institution, startYear, endYear } = req.body;

    const user = await getDocument('users', userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const profileId = user.profile;
    if (!profileId) return res.status(404).json({ success: false, message: 'Profile not found' });

    const profile = await getDocument('profiles', profileId);
    const existingHistory = Array.isArray(profile?.educationHistory) ? profile.educationHistory : [];

    const entryIndex = existingHistory.findIndex(e => e.id === eduId);
    if (entryIndex === -1) {
      return res.status(404).json({ success: false, message: 'Education entry not found' });
    }

    existingHistory[entryIndex] = {
      ...existingHistory[entryIndex],
      level: level || existingHistory[entryIndex].level,
      degree: degree || existingHistory[entryIndex].degree,
      field: field !== undefined ? field : existingHistory[entryIndex].field,
      institution: institution || existingHistory[entryIndex].institution,
      startYear: startYear || existingHistory[entryIndex].startYear,
      endYear: endYear !== undefined ? endYear : existingHistory[entryIndex].endYear,
    };

    await updateDocument('profiles', profileId, { educationHistory: existingHistory, updatedAt: new Date() });

    res.status(200).json({ success: true, message: 'Education entry updated', educationHistory: existingHistory });
  } catch (error) {
    console.error('Update education error:', error);
    res.status(500).json({ success: false, message: 'Unable to update education entry' });
  }
};

/**
 * Delete an education entry from user's profile.
 * Removes the entry by id from the educationHistory array.
 *
 * @async
 * @function deleteEducation
 * @param {Object} req - Express request object
 * @param {string} req.params.eduId - Education entry ID to delete
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated educationHistory
 */
export const deleteEducation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { eduId } = req.params;

    const user = await getDocument('users', userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const profileId = user.profile;
    if (!profileId) return res.status(404).json({ success: false, message: 'Profile not found' });

    const profile = await getDocument('profiles', profileId);
    const existingHistory = Array.isArray(profile?.educationHistory) ? profile.educationHistory : [];

    const updatedHistory = existingHistory.filter(e => e.id !== eduId);

    if (updatedHistory.length === existingHistory.length) {
      return res.status(404).json({ success: false, message: 'Education entry not found' });
    }

    await updateDocument('profiles', profileId, { educationHistory: updatedHistory, updatedAt: new Date() });

    res.status(200).json({ success: true, message: 'Education entry deleted', educationHistory: updatedHistory });
  } catch (error) {
    console.error('Delete education error:', error);
    res.status(500).json({ success: false, message: 'Unable to delete education entry' });
  }
};

/**
 * Get Batch Representative Dashboard Statistics
 * Returns metrics and lists users within the same batch.
 */
export const getBatchDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await getDocument('users', userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'BATCH_REP' && user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied: Batch Representatives only' });
    }

    const profileId = user.profile;
    if (!profileId) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const profile = await getDocument('profiles', profileId);
    const joinBatch = profile?.joinBatch;

    if (!joinBatch) {
      return res.status(400).json({ success: false, message: 'Your profile does not specify a joining batch' });
    }

    // Fetch all users to filter by batch
    const allUsers = await getDocuments('users', []);
    
    let batchUsers = [];
    for (const u of allUsers) {
      if (u.profile) {
        try {
          const up = await getDocument('profiles', u.profile);
          if (up && up.joinBatch === joinBatch) {
            // Calculate completeness
            let filledFields = 0;
            if (up.profilePhoto) filledFields++;
            if (up.phone) filledFields++;
            if (up.currentAddress) filledFields++;
            if (up.occupation) filledFields++;
            if (up.organization) filledFields++;
            if (up.sector) filledFields++;
            if (up.about) filledFields++;
            if (up.joinBatch) filledFields++;
            if (up.passoutBatch) filledFields++;
            if (up.bloodGroup) filledFields++;
            if (Array.isArray(up.educationHistory) && up.educationHistory.length > 0) filledFields++;

            const completeness = Math.round((filledFields / 11) * 100);
            
            batchUsers.push({
              id: u.uid || u.id,
              firstName: u.firstName,
              lastName: u.lastName,
              email: u.email,
              phone: up.phone || '',
              city: up.currentAddress || '',
              occupation: up.occupation || '',
              profilePhoto: up.profilePhoto || '',
              completeness,
              isOnboarded: (u.isOnboarded !== undefined && u.isOnboarded !== null) ? u.isOnboarded : (completeness >= 80),
              status: u.status || 'ACTIVE',
              createdAt: u.createdAt
            });
          }
        } catch (e) {
          console.error(`Error loading profile for batch user ${u.uid}:`, e);
        }
      }
    }

    const totalMembers = batchUsers.length;
    const pendingProfileCount = batchUsers.filter(bu => !bu.isOnboarded || bu.completeness < 80).length;
    const completedProfileCount = totalMembers - pendingProfileCount;

    res.status(200).json({
      success: true,
      data: {
        passoutBatch: joinBatch, // Set joinBatch to passoutBatch key for frontend compatibility
        totalMembers,
        pendingProfileCount,
        completedProfileCount,
        members: batchUsers
      }
    });
  } catch (error) {
    console.error('Get batch dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Unable to fetch batch dashboard statistics' });
  }
};

/**
 * Block a batch member (Batch Representative action)
 * Restricts blocking to users within the representative's own joining batch.
 */
export const blockBatchUser = async (req, res) => {
  try {
    const repId = req.user.id;
    const targetUserId = req.params.id;
    const { reason } = req.body;

    const rep = await getDocument('users', repId);
    if (!rep || (rep.role !== 'BATCH_REP' && rep.role !== 'ADMIN')) {
      return res.status(403).json({ success: false, message: 'Access denied: Batch Representatives only' });
    }

    if (repId === targetUserId) {
      return res.status(400).json({ success: false, message: 'Cannot block yourself' });
    }

    const repProfile = await getDocument('profiles', rep.profile);
    const repJoinBatch = repProfile?.joinBatch;
    if (!repJoinBatch) {
      return res.status(400).json({ success: false, message: 'Your profile does not specify a joining batch' });
    }

    const targetUser = await getDocument('users', targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found' });
    }

    if (targetUser.role === 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Cannot block an admin user' });
    }

    const targetProfile = await getDocument('profiles', targetUser.profile);
    if (!targetProfile || targetProfile.joinBatch !== repJoinBatch) {
      return res.status(403).json({ success: false, message: 'You can only block members of your own joining batch' });
    }

    await updateDocument('users', targetUserId, {
      status: 'BLOCKED',
      blockedReason: reason || 'Blocked by Batch Representative',
      blockedAt: new Date(),
      blockedBy: repId,
      blockedByRole: rep.role,
      blockedByName: `${rep.firstName} ${rep.lastName}`.trim(),
      blockedByBatch: repJoinBatch,
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'User blocked successfully'
    });
  } catch (error) {
    console.error('Block batch user error:', error);
    res.status(500).json({ success: false, message: 'Failed to block user' });
  }
};

/**
 * Unblock a batch member (Batch Representative action)
 * Restricts unblocking to users within the representative's own joining batch.
 */
export const unblockBatchUser = async (req, res) => {
  try {
    const repId = req.user.id;
    const targetUserId = req.params.id;

    const rep = await getDocument('users', repId);
    if (!rep || (rep.role !== 'BATCH_REP' && rep.role !== 'ADMIN')) {
      return res.status(403).json({ success: false, message: 'Access denied: Batch Representatives only' });
    }

    const repProfile = await getDocument('profiles', rep.profile);
    const repJoinBatch = repProfile?.joinBatch;
    if (!repJoinBatch) {
      return res.status(400).json({ success: false, message: 'Your profile does not specify a joining batch' });
    }

    const targetUser = await getDocument('users', targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found' });
    }

    const targetProfile = await getDocument('profiles', targetUser.profile);
    if (!targetProfile || targetProfile.joinBatch !== repJoinBatch) {
      return res.status(403).json({ success: false, message: 'You can only unblock members of your own joining batch' });
    }

    await updateDocument('users', targetUserId, {
      status: 'ACTIVE',
      blockedReason: null,
      blockedAt: null,
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (error) {
    console.error('Unblock batch user error:', error);
    res.status(500).json({ success: false, message: 'Failed to unblock user' });
  }
};
