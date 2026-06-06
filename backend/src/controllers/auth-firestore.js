/**
 * @fileoverview Authentication Controller - Firebase Google Only
 * Handles Firebase Google Sign-In authentication and user management
 * 
 * @module controllers/auth-firestore
 */

import { getAuth, getFirestore, addDocument, getDocument, updateDocument, getDocuments } from '../config/firestore.js';
import { getAvatarUrl, getProfilePhotoUrl } from '../utils/avatarHelper.js';
import admin from 'firebase-admin';

/**
 * Handle Firebase Google Sign-In
 * Frontend user is already authenticated with Firebase, send idToken to backend
 * Backend verifies token and creates/updates user in Firestore
 * 
 * @async
 * @param {Object} req - Express request
 * @param {Object} req.body.idToken - Firebase ID token from client
 * @param {Object} res - Express response
 * @returns {Object} User data and session
 */
export const googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required' });
    }

    // Verify Firebase ID token
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({ message: 'Email is required for Google sign-in' });
    }

    // Check if user exists in Firestore
    let userDoc = await getDocument('users', uid);

    if (!userDoc) {
      // New user - create profile and user document
      const [firstName, ...lastNameParts] = (name || 'User').trim().split(/\s+/);
      const lastName = lastNameParts.join(' ') || '';

      // Create profile document first
      const profileId = await addDocument('profiles', {
        firstName: firstName || 'User',
        lastName: lastName || '',
        bio: '',
        profilePhoto: picture || getAvatarUrl(firstName, lastName),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Create user document
      await addDocument('users', {
        uid,
        firstName: firstName || 'User',
        lastName: lastName || '',
        email,
        profile: profileId,
        authProvider: 'GOOGLE',
        role: 'ALUMNI',
        isMember: false,
        status: 'ACTIVE',
        isEmailVerified: true, // Google users are pre-verified
        isOnboarded: false, // New users must complete profile onboarding
        createdAt: new Date(),
        updatedAt: new Date()
      }, uid);

      userDoc = {
        uid,
        firstName: firstName || 'User',
        lastName: lastName || '',
        email,
        role: 'ALUMNI',
        isMember: false,
        status: 'ACTIVE',
        profile: profileId,
        isEmailVerified: true,
        isOnboarded: false,
        authProvider: 'GOOGLE'
      };
    }

    // Check if user is blocked
    if (userDoc.status === 'BLOCKED') {
      return res.status(403).json({ message: 'Account blocked' });
    }

    // Get profile with photo
    let profileData = {};
    if (userDoc.profile) {
      profileData = await getDocument('profiles', userDoc.profile) || {};
    }

    res.status(200).json({
      message: 'Sign-in successful',
      user: {
        id: uid,
        email: userDoc.email,
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        role: userDoc.role,
        isMember: userDoc.isMember || false,
        status: userDoc.status,
        isEmailVerified: true,
        isOnboarded: userDoc.isOnboarded ?? true, // Existing users without flag default to true
        profile: profileData,
        createdAt: userDoc.createdAt
      },
      token: idToken // Return Firebase token for frontend storage
    });

  } catch (error) {
    console.error('Google sign-in error:', error);
    res.status(500).json({ message: 'Sign-in failed' });
  }
};

/**
 * Get Current User
 * Verify Firebase token and return user data
 * 
 * @async
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userDoc = await getDocument('users', userId);
    if (!userDoc) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if blocked
    if (userDoc.status === 'BLOCKED') {
      return res.status(403).json({ message: 'Account blocked' });
    }

    // Fetch profile
    let profile = {};
    if (userDoc.profile) {
      profile = await getDocument('profiles', userDoc.profile) || {};
    }

    res.json({
      message: 'User retrieved successfully',
      user: {
        id: userDoc.uid || userId,
        email: userDoc.email,
        firstName: userDoc.firstName,
        lastName: userDoc.lastName,
        role: userDoc.role,
        isMember: userDoc.isMember || false,
        status: userDoc.status,
        isEmailVerified: true,
        isOnboarded: userDoc.isOnboarded ?? true, // Existing users without flag default to true
        profile: profile,
        createdAt: userDoc.createdAt
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
};

/**
 * Update Profile
 * 
 * @async
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { firstName, lastName, bio, education, work } = req.body;

    // Update user document
    await updateDocument('users', userId, {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      updatedAt: new Date()
    });

    // Update profile
    const userDoc = await getDocument('users', userId);
    if (userDoc && userDoc.profile) {
      await updateDocument('profiles', userDoc.profile, {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(bio !== undefined && { bio }),
        ...(education !== undefined && { education }),
        ...(work !== undefined && { work }),
        updatedAt: new Date()
      });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

/**
 * Logout User
 * Frontend handles token cleanup, backend just confirms
 * 
 * @async
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export const logout = async (req, res) => {
  try {
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};

export default {
  googleSignIn,
  logout,
  getCurrentUser,
  updateProfile
};
