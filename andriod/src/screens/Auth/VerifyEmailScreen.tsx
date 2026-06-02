/**
 * @fileoverview Email Verification Screen
 * OTP based email verification after signup
 * 
 * @module screens/Auth/VerifyEmailScreen
 */

import React, { useState, useRef } from 'react';
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
import { verifyEmail, resendVerificationEmail } from '../../services/authService';
import { setError } from '../../redux/slices/authSlice';
import { APP_CONSTANTS } from '../../constants';
import type { AuthScreenProps } from '../../navigation/AuthNavigator';

type VerifyEmailScreenProps = AuthScreenProps<
  typeof APP_CONSTANTS.SCREENS.VERIFY_EMAIL
>;

/**
 * Email Verification Screen Component
 * Allows users to verify their email with OTP
 * 
 * @component
 * @param {Object} props - Navigation props
 * @param {string} props.route.params.email - Email to verify
 * @param {Object} props.navigation - Navigation object
 * @returns {JSX.Element} Email verification screen
 */
export default function VerifyEmailScreen({ route, navigation }: VerifyEmailScreenProps) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const email = route.params?.email || '';

  const [otp, setOtp] = useState('');
  const [validationError, setValidationError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const otpInputRef = useRef<TextInput>(null);

  /**
   * Validate OTP format
   */
  const isValidOtp = (otpToCheck: string) => {
    return otpToCheck.trim().length > 0;
  };

  /**
   * Validate form
   */
  const validateForm = () => {
    setValidationError('');

    if (!isValidOtp(otp)) {
      setValidationError('Please enter the OTP');
      return false;
    }

    return true;
  };

  /**
   * Handle verify button press
   */
  const handleVerify = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(
        verifyEmail({ email, otp: otp.trim() })
      ).unwrap();

      if (result) {
        // Verification successful - navigation will be handled by RootNavigator
        // when it detects token and user in Redux state
      }
    } catch (err) {
      console.error('Verification error:', err);
    }
  };

  /**
   * Handle resend OTP
   */
  const handleResendOtp = async () => {
    setResendLoading(true);
    setResendMessage('');

    try {
      await dispatch(resendVerificationEmail(email)).unwrap();
      setResendMessage('OTP sent to your email');
      setOtp('');
      otpInputRef.current?.focus();
    } catch (err) {
      console.error('Resend error:', err);
    } finally {
      setResendLoading(false);
    }
  };

  /**
   * Handle back to signup
   */
  const handleBackToSignup = () => {
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
          <TouchableOpacity onPress={handleBackToSignup} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>
            We've sent a verification code to {'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>
        </View>

        {/* Error Messages */}
        {(error || validationError) && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {error || validationError}
            </Text>
          </View>
        )}

        {/* Success Message */}
        {resendMessage && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{resendMessage}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          {/* OTP Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              ref={otpInputRef}
              style={styles.input}
              placeholder="Enter 6-digit code"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={6}
              editable={!loading}
              value={otp}
              onChangeText={(text) => {
                setOtp(text);
                setValidationError('');
              }}
            />
            <Text style={styles.hint}>
              Check your email for the verification code
            </Text>
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Resend Link */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity
            onPress={handleResendOtp}
            disabled={loading || resendLoading}
          >
            <Text style={[styles.resendLink, (loading || resendLoading) && styles.resendLinkDisabled]}>
              {resendLoading ? 'Sending...' : 'Resend'}
            </Text>
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
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
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
    lineHeight: 24,
  },
  email: {
    fontWeight: '600',
    color: '#000',
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
  successContainer: {
    backgroundColor: '#efe',
    borderLeftColor: '#0f0',
    borderLeftWidth: 4,
    padding: 12,
    borderRadius: 4,
    marginBottom: 20,
  },
  successText: {
    color: '#0a0',
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
    letterSpacing: 4,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  verifyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  resendLinkDisabled: {
    opacity: 0.5,
  },
});
