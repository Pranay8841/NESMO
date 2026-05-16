/**
 * @fileoverview Avatar generation helper utility
 * Provides consistent DiceBear avatar URL generation across the application
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
export const getAvatarUrl = (firstName: string, lastName?: string): string => {
  if (!firstName) {
    firstName = 'User';
  }

  // Combine first and last name for seed
  const seedName = lastName?.trim() ? `${firstName} ${lastName}` : firstName;
  
  // Properly encode the seed for URL
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
export const getProfilePhotoUrl = (
  profilePhoto: string | undefined,
  firstName: string,
  lastName?: string
): string => {
  if (profilePhoto && profilePhoto.trim()) {
    return profilePhoto;
  }
  return getAvatarUrl(firstName, lastName);
};
