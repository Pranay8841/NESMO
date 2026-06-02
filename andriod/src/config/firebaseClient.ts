/**
 * @fileoverview Firebase Configuration for React Native
 * Initializes Firebase using the JS SDK (Expo Go compatible)
 * Uses AsyncStorage for auth state persistence in React Native
 * 
 * @module config/firebaseClient
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
// @ts-ignore - getReactNativePersistence exists at runtime in firebase/auth but lacks type declarations
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Validate Firebase configuration
 * Ensures all required environment variables are set
 */
const validateFirebaseConfig = () => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missing = requiredKeys.filter(
    (key) => !firebaseConfig[key as keyof typeof firebaseConfig]
  );

  if (missing.length > 0) {
    console.error('❌ Missing Firebase configuration variables:', missing);
    console.error('Required environment variables:');
    console.error('  - EXPO_PUBLIC_FIREBASE_API_KEY');
    console.error('  - EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN');
    console.error('  - EXPO_PUBLIC_FIREBASE_PROJECT_ID');
    console.error('  - EXPO_PUBLIC_FIREBASE_APP_ID');
    console.error('Make sure your andriod/.env file has these variables');
    return false;
  }

  console.log('✅ Firebase configuration loaded successfully');
  console.log('   Project ID:', firebaseConfig.projectId);
  console.log('   Auth Domain:', firebaseConfig.authDomain);
  return true;
};

// Initialize Firebase
let app: any = null;
let auth: any = null;
let db: any = null;

try {
  if (!validateFirebaseConfig()) {
    throw new Error('Firebase configuration validation failed');
  }

  // Avoid re-initializing on hot reload
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  // Use initializeAuth with AsyncStorage persistence for React Native
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error: any) {
    // If auth was already initialized (e.g. hot reload), get existing instance
    auth = getAuth(app);
  }

  console.log('✅ Firebase initialized successfully (JS SDK)');
  db = getFirestore(app);
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}

export { app, auth, db };
