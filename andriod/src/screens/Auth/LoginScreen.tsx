/**
 * @fileoverview Login Screen
 * Firebase Google Sign-In using @react-native-google-signin (Development Build)
 * Uses native Google Play Services for authentication
 * 
 * @module screens/Auth/LoginScreen
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { googleSignIn } from '../../services/authService';
import { setError } from '../../redux/slices/authSlice';
import type { AuthScreenProps } from '../../navigation/AuthNavigator';
import { APP_CONSTANTS } from '../../constants';

type LoginScreenProps = AuthScreenProps<typeof APP_CONSTANTS.SCREENS.LOGIN>;

// Configure Google Sign-In with the web client ID
// The web client ID is needed to get the idToken for Firebase authentication
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
});

/**
 * Login Screen Component
 * Native Google Sign-In using @react-native-google-signin
 * 
 * @component
 * @param {Object} props - Navigation props
 * @returns {JSX.Element} Login screen with Google Sign-In button
 */
export default function LoginScreen({ navigation }: LoginScreenProps) {
  const dispatch = useAppDispatch();
  const { loading, error, token, user } = useAppSelector((state) => state.auth);

  // Automatically close the login modal when authentication succeeds
  useEffect(() => {
    if (token && user) {
      // Retrieve parent navigator (RootNavigator) and navigate back to AppStack or close modal
      const parentNav = navigation.getParent();
      if (parentNav && parentNav.canGoBack()) {
        parentNav.goBack();
      } else {
        navigation.navigate('AppStack');
      }
    }
  }, [token, user, navigation]);

  /**
   * Handle Google Sign-In button press
   * Uses native Google Play Services for authentication
   */
  const handleGoogleSignIn = async () => {
    try {
      dispatch(setError(null));

      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // Trigger native Google Sign-In
      const response = await GoogleSignin.signIn();

      if (response.type === 'success' && response.data?.idToken) {
        console.log('🔐 Google Sign-In successful, sending to Firebase...');
        dispatch(googleSignIn({ idToken: response.data.idToken }));
      } else {
        dispatch(setError('No ID token received from Google'));
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);

      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled the sign-in flow
        console.log('User cancelled sign-in');
      } else if (err.code === statusCodes.IN_PROGRESS) {
        dispatch(setError('Sign-in is already in progress'));
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        dispatch(setError('Google Play Services not available. Please update.'));
      } else {
        dispatch(setError(err.message || 'Google Sign-In failed. Please try again.'));
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to NESMO</Text>
        <Text style={styles.subtitle}>Alumni Community Platform</Text>
      </View>

      {/* Logo/Icon Area */}
      <View style={styles.iconContainer}>
        <Ionicons name="people" size={80} color="#007AFF" />
      </View>

      {/* Error Messages */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#f00" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Google Sign-In Button */}
      <TouchableOpacity
        style={[styles.googleButton, loading && styles.googleButtonDisabled]}
        onPress={handleGoogleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="logo-google" size={20} color="#fff" />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Footer Text */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Sign in with your Google account associated with NESMO
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  iconContainer: {
    marginBottom: 60,
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderLeftColor: '#f00',
    borderLeftWidth: 4,
    padding: 12,
    borderRadius: 4,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  googleButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minWidth: '100%',
    marginBottom: 40,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
