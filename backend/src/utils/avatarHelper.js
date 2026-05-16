/**
 * @fileoverview Avatar generation helper utility for backend
 * Provides consistent DiceBear avatar URL generation
 * 
 * @module utils/avatarHelper
 */

/**
 * Generate DiceBear avatar URL with proper encoding
 * @param {string} firstName - User's first name
 * @param {string} [lastName] - User's last name (optional)
 * @returns {string} DiceBear API URL for avatar generation
 * 
 * @example
 * getAvatarUrl('Pranay', 'Bhandekar') 
 * // Returns: https://api.dicebear.com/5.x/initials/svg?seed=Pranay%20Bhandekar
 */
export const getAvatarUrl = (firstName, lastName = '') => {
  if (!firstName) {
    firstName = 'User';
  }

  // Combine first and last name for seed
  const seedName = lastName?.trim() ? `${firstName} ${lastName}` : firstName;
  
  // Use encodeURIComponent for proper URL encoding
  const encodedSeed = encodeURIComponent(seedName);
  
  return `https://api.dicebear.com/5.x/initials/svg?seed=${encodedSeed}`;
};

/**
 * Get profile photo URL, falling back to generated avatar if not available
 * @param {string} profilePhoto - Existing profile photo URL (optional)
 * @param {string} firstName - User's first name
 * @param {string} [lastName] - User's last name (optional)
 * @returns {string} Profile photo URL or generated avatar URL
 */
export const getProfilePhotoUrl = (profilePhoto, firstName, lastName = '') => {
  if (profilePhoto && typeof profilePhoto === 'string' && profilePhoto.trim()) {
    return profilePhoto;
  }
  return getAvatarUrl(firstName, lastName);
};
