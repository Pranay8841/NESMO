/**
 * @fileoverview Firestore Database Configuration
 * Central wrapper for all Firestore operations with helper functions
 * 
 * @module config/firestore
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let db;
let auth;
let initialized = false;

/**
 * Initialize Firebase Admin SDK and Firestore
 * @async
 * @returns {Promise<void>}
 */
export const initializeFirebase = async () => {
  try {
    if (initialized) {
      console.log('Firebase already initialized');
      return;
    }

    const serviceAccountPath = path.join(process.cwd(), 'src/config/firebase-key.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      const errorMsg = `
╔═══════════════════════════════════════════════════════════════════╗
║ 🔑 Firebase Service Account Key Missing                           ║
╚═══════════════════════════════════════════════════════════════════╝

To set up Firebase, follow these steps:

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: "nesmo-eea87"
3. Go to Project Settings (gear icon) → Service Accounts
4. Click "Generate New Private Key"
5. Save the JSON file as: backend/src/config/firebase-key.json
6. DO NOT commit this file to Git (already in .gitignore)

For development, you can also use environment-based configuration.

Error: Service account key not found at ${serviceAccountPath}
      `;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });

    db = admin.firestore();
    auth = admin.auth();
    initialized = true;

    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    throw error;
  }
};

/**
 * Get Firestore instance
 * @returns {admin.firestore.Firestore}
 */
export const getFirestore = () => {
  if (!db) throw new Error('Firestore not initialized');
  return db;
};

/**
 * Get Firebase Auth instance
 * @returns {admin.auth.Auth}
 */
export const getAuth = () => {
  if (!auth) {
    console.error('❌ Firebase Auth not initialized!');
    throw new Error('Firebase Auth not initialized');
  }
  console.log('✅ Firebase Auth instance retrieved successfully');
  return auth;
};

/**
 * Add a document to a collection
 * @async
 * @param {string} collection - Collection name
 * @param {Object} data - Document data
 * @param {string} [docId] - Optional document ID
 * @returns {Promise<string>} Document ID
 */
export const addDocument = async (collection, data, docId = null) => {
  try {
    const docRef = docId 
      ? await db.collection(collection).doc(docId).set(data)
      : await db.collection(collection).add(data);
    return docId || docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collection}:`, error);
    throw error;
  }
};

/**
 * Get a single document
 * @async
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 * @returns {Promise<Object|null>} Document data or null
 */
export const getDocument = async (collection, docId) => {
  try {
    const doc = await db.collection(collection).doc(docId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  } catch (error) {
    console.error(`Error getting document from ${collection}:`, error);
    throw error;
  }
};

/**
 * Query documents with filters
 * @async
 * @param {string} collection - Collection name
 * @param {Array} filters - Array of {field, operator, value} objects
 * @param {Object} [options] - Query options {orderBy, limit, offset}
 * @returns {Promise<Array>} Array of documents
 */
export const getDocuments = async (collection, filters = [], options = {}) => {
  try {
    let query = db.collection(collection);

    // Apply filters
    for (const filter of filters) {
      query = query.where(filter.field, filter.operator, filter.value);
    }

    // Apply ordering
    if (options.orderBy) {
      query = query.orderBy(options.orderBy.field, options.orderBy.direction || 'asc');
    }

    // Apply limit
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error querying ${collection}:`, error);
    throw error;
  }
};

/**
 * Update a document
 * @async
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 * @param {Object} data - Data to update
 * @returns {Promise<void>}
 */
export const updateDocument = async (collection, docId, data) => {
  try {
    await db.collection(collection).doc(docId).update(data);
  } catch (error) {
    console.error(`Error updating document in ${collection}:`, error);
    throw error;
  }
};

/**
 * Delete a document
 * @async
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 * @returns {Promise<void>}
 */
export const deleteDocument = async (collection, docId) => {
  try {
    await db.collection(collection).doc(docId).delete();
  } catch (error) {
    console.error(`Error deleting document from ${collection}:`, error);
    throw error;
  }
};

/**
 * Batch write operations
 * @async
 * @param {Array} operations - Array of {type, collection, docId, data}
 * @returns {Promise<void>}
 */
export const batchWrite = async (operations) => {
  try {
    const batch = db.batch();
    for (const op of operations) {
      const ref = db.collection(op.collection).doc(op.docId);
      if (op.type === 'set') {
        batch.set(ref, op.data);
      } else if (op.type === 'update') {
        batch.update(ref, op.data);
      } else if (op.type === 'delete') {
        batch.delete(ref);
      }
    }
    await batch.commit();
  } catch (error) {
    console.error('Error in batch write:', error);
    throw error;
  }
};

/**
 * User Management - Create user
 * @async
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User record
 */
export const createUser = async (email, password) => {
  try {
    const userRecord = await auth.createUser({
      email,
      password
    });
    return userRecord;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Get user by UID
 * @async
 * @param {string} uid - Firebase UID
 * @returns {Promise<Object|null>} User data or null
 */
export const getUserByUID = async (uid) => {
  try {
    const userRecord = await auth.getUser(uid);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    console.error('Error getting user by UID:', error);
    throw error;
  }
};

/**
 * Get user by email
 * @async
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User data or null
 */
export const getUserByEmail = async (email) => {
  try {
    const userRecord = await auth.getUserByEmail(email);
    return userRecord;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    console.error('Error getting user by email:', error);
    throw error;
  }
};

/**
 * Update user
 * @async
 * @param {string} uid - Firebase UID
 * @param {Object} updates - User updates
 * @returns {Promise<Object>} Updated user record
 */
export const updateUser = async (uid, updates) => {
  try {
    const userRecord = await auth.updateUser(uid, updates);
    return userRecord;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Delete user
 * @async
 * @param {string} uid - Firebase UID
 * @returns {Promise<void>}
 */
export const deleteUser = async (uid) => {
  try {
    await auth.deleteUser(uid);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export default initializeFirebase;
