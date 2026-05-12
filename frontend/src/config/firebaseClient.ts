/**
 * @fileoverview Firebase Configuration for Frontend
 * Initializes Firebase SDK for client-side use
 * 
 * @module config/firebaseClient
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Firebase configuration - must be loaded from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missing = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);
  
  if (missing.length > 0) {
    console.error('❌ Missing Firebase configuration variables:', missing);
    console.error('Required environment variables:');
    console.error('  - VITE_FIREBASE_API_KEY');
    console.error('  - VITE_FIREBASE_AUTH_DOMAIN');
    console.error('  - VITE_FIREBASE_PROJECT_ID');
    console.error('  - VITE_FIREBASE_APP_ID');
    console.error('Make sure your frontend/.env file has these VITE_FIREBASE_* variables');
    return false;
  }
  
  console.log('✅ Firebase configuration loaded successfully');
  console.log('   Project ID:', firebaseConfig.projectId);
  console.log('   Auth Domain:', firebaseConfig.authDomain);
  return true;
};

// Initialize Firebase with error handling
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  if (!validateFirebaseConfig()) {
    throw new Error('Firebase configuration is incomplete');
  }

  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');

  // Get Firebase services
  auth = getAuth(app);
  console.log('✅ Firebase Auth initialized');

  db = getFirestore(app);
  console.log('✅ Firebase Firestore initialized');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw new Error('Failed to initialize Firebase. Check your environment variables.');
}

export { app, auth, db };
export default app;
