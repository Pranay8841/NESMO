/**
 * @fileoverview Signup Screen
 * New user registration with email and password
 * 
 * @module screens/Auth/SignupScreen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { emailSignup } from '../../services/authService';
import { setError } from '../../redux/slices/authSlice';
import { APP_CONSTANTS } from '../../constants';
import type { AuthScreenProps } from '../../navigation/AuthNavigator';

type SignupScreenProps = AuthScreenProps<typeof APP_CONSTANTS.SCREENS.SIGNUP>;

/**
 * Signup Screen Component
 * Allows new users to create an account with email and password
 * 
 * @component
 * @param {Object} props - Navigation props
 * @param {Object} props.navigation - Navigation object
 * @returns {JSX.Element} Signup screen
 */
export default function SignupScreen({ navigation }: SignupScreenProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  /**
   * Validate email format
   */
  const isValidEmail = (emailToCheck: string) => {
    return APP_CONSTANTS.VALIDATION.EMAIL_REGEX.test(emailToCheck);
  };

  /**
   * Validate form inputs
   */
  const validateForm = () => {
    setValidationError('');

    if (!firstName.trim()) {
      setValidationError('First name is required');
      return false;
    }

    if (!lastName.trim()) {
      setValidationError('Last name is required');
      return false;
    }

    if (!email.trim()) {
      setValidationError('Email is required');
      return false;
    }

    if (!isValidEmail(email)) {
      setValidationError('Please enter a valid email');
      return false;
    }

    if (!password) {
      setValidationError('Password is required');
      return false;
    }

    if (password.length < APP_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH) {
      setValidationError(
        `Password must be at least ${APP_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH} characters`
      );
      return false;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }

    return true;
  };

  /**
   * Handle signup button press
   */
  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(
        emailSignup({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
        })
      ).unwrap();

      if (result) {
        // Signup successful - navigate to email verification
        navigation.navigate(APP_CONSTANTS.SCREENS.VERIFY_EMAIL, {
          email: email.trim(),
        });
      }
    } catch (err) {
      console.error('Signup error:', err);
    }
  };

  /**
   * Handle back to login
   */
  const handleBackToLogin = () => {
    dispatch(setError(null));
    setValidationError('');
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the NESMO community</Text>
        </View>

        {/* Error Messages */}
        {(error || validationError) && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error || validationError}
            </Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          {/* First Name Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter first name"
              placeholderTextColor="#999"
              autoCapitalize="words"
              editable={!loading}
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                setValidationError('');
              }}
            />
          </View>

          {/* Last Name Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter last name"
              placeholderTextColor="#999"
              autoCapitalize="words"
              editable={!loading}
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                setValidationError('');
              }}
            />
          </View>

          {/* Email Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setValidationError('');
              }}
            />
          </View>

          {/* Password Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setValidationError('');
              }}
            />
            <Text style={styles.hint}>
              Minimum {APP_CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH} characters
            </Text>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor="#999"
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setValidationError('');
              }}
            />
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            style={[styles.signupButton, loading && styles.signupButtonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signupButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    marginBottom: 15,
  },
  backButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderLeftColor: '#f00',
    borderLeftWidth: 4,
    padding: 12,
    borderRadius: 4,
    marginBottom: 20,
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
  },
  form: {
    marginBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fafafa',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  signupButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
