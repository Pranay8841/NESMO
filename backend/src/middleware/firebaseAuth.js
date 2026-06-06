/**
 * @fileoverview Firebase Authentication Middleware
 * Verifies Firebase ID tokens and implements role-based authorization
 * 
 * @module middleware/firebaseAuth
 */

import { getAuth, getDocument } from '../config/firestore.js';
import jwt from 'jsonwebtoken';

/**
 * Constructs a detailed error message for blocked users
 * @param {Object} userDoc - The blocked user document
 * @returns {string} Formatted error message
 */
export const getBlockedMessage = (userDoc) => {
  const reason = (userDoc.blockedReason || 'No reason specified').trim();
  const cleanReason = reason.endsWith('.') ? reason.slice(0, -1) : reason;
  
  const blockerName = userDoc.blockedByName;
  const blockerRole = userDoc.blockedByRole;
  const blockerBatch = userDoc.blockedByBatch;

  if (blockerRole === 'BATCH_REP' && blockerName) {
    return `Your account has been blocked by your JNV Batch Representative, ${blockerName}${blockerBatch ? ` (Batch of ${blockerBatch})` : ''}.\n\nReason: ${cleanReason}.\n\nPlease reach out to them to resolve this issue.`;
  } else if (blockerRole === 'ADMIN') {
    return `Your account has been blocked by an Admin${blockerName ? ` (${blockerName})` : ''}.\n\nReason: ${cleanReason}.\n\nPlease reach out to support to resolve this issue.`;
  } else {
    return `Your account has been blocked.\n\nReason: ${cleanReason}.\n\nPlease contact support for assistance.`;
  }
};

/**
 * Middleware to verify Firebase ID token or custom token
 * Attaches user data to req.user
 * Blocks access for blocked users
 */
export const protect = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token provided' });
    }

    const auth = getAuth();
    let decodedToken;
    let uid;

    // Try to verify as Firebase ID token first
    try {
      decodedToken = await auth.verifyIdToken(token);
      uid = decodedToken.uid;
    } catch (idTokenError) {
      // Fallback: Try to verify as JWT session token (from OAuth or manual sign-in)
      try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-change-this');
        uid = decodedToken.uid;
      } catch (jwtError) {
        console.error('❌ Token verification failed (neither Firebase ID nor JWT)');
        console.error('   Firebase error:', idTokenError.message);
        console.error('   JWT error:', jwtError.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
    }

    // Get user document from Firestore
    const userDoc = await getDocument('users', uid);
    
    if (!userDoc) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user is blocked
    if (userDoc.status === 'BLOCKED') {
      return res.status(403).json({ message: getBlockedMessage(userDoc) });
    }

    // Attach user to request
    req.user = {
      id: uid,
      email: decodedToken.email || userDoc.email,
      role: userDoc.role,
      ...userDoc
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * Middleware to check user roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    next();
  };
};

export default protect;
