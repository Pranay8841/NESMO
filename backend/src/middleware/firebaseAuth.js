/**
 * @fileoverview Firebase Authentication Middleware
 * Verifies Firebase ID tokens and implements role-based authorization
 * 
 * @module middleware/firebaseAuth
 */

import { getAuth, getDocument } from '../config/firestore.js';
import jwt from 'jsonwebtoken';

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
      console.log('✅ Firebase ID token verified for UID:', uid);
    } catch (idTokenError) {
      // Fallback: Try to verify as JWT session token (from OAuth or manual sign-in)
      try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-change-this');
        uid = decodedToken.uid;
        console.log('✅ JWT session token verified for UID:', uid);
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
      return res.status(403).json({ message: 'Account blocked' });
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
