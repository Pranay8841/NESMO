/**
 * @fileoverview Profile Onboarding Screen
 * Mandatory multi-step profile builder screen shown after signup
 * 
 * @module screens/Auth/ProfileOnboardingScreen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { completeOnboarding } from '../../services/profileService';
import { logoutUser } from '../../services/authService';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const JOIN_BATCH_OPTIONS = Array.from({ length: 41 }, (_, i) => `${1986 + i}`);
const PASSOUT_BATCH_OPTIONS = Array.from({ length: 41 }, (_, i) => `${1993 + i}`);

export default function ProfileOnboardingScreen() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { user } = useAppSelector((state) => state.auth);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    joinBatch: '',
    passoutBatch: '',
    phone: '',
    bloodGroup: '',
    occupation: '',
    organization: '',
    currentAddress: '',
  });

  // Active Picker Modal State
  const [activePicker, setActivePicker] = useState<'joinBatch' | 'passoutBatch' | 'bloodGroup' | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.joinBatch || !formData.passoutBatch) {
        toast.show('Please select both join and passout batches.', { type: 'warning' });
        return;
      }
      const joinYear = parseInt(formData.joinBatch);
      const passoutYear = parseInt(formData.passoutBatch);
      if (passoutYear <= joinYear) {
        toast.show('Passout batch must be later than join batch.', { type: 'warning' });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.phone || !formData.bloodGroup) {
        toast.show('Please provide a phone number and blood group.', { type: 'warning' });
        return;
      }
      if (formData.phone.length < 8) {
        toast.show('Please enter a valid phone number.', { type: 'warning' });
        return;
      }
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.occupation || !formData.organization || !formData.currentAddress) {
      toast.show('Please fill in your current occupation, organization, and location.', { type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const resultAction = await dispatch(completeOnboarding(formData));
      if (completeOnboarding.fulfilled.match(resultAction)) {
        toast.show('Profile completed! Welcome to NESMO.', { type: 'success' });
      } else {
        const errorMsg = resultAction.payload || 'Failed to update profile onboarding';
        toast.show(errorMsg as string, { type: 'danger' });
      }
    } catch (err: any) {
      toast.show(err.message || 'An error occurred during onboarding', { type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out and return to the main guest screen?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            dispatch(logoutUser());
          },
        },
      ]
    );
  };

  const renderStepIndicator = () => {
    return (
      <View style={styles.indicatorContainer}>
        {[1, 2, 3].map((step) => (
          <View key={step} style={styles.stepIndicatorWrapper}>
            <View
              style={[
                styles.stepLine,
                step > 1 && {
                  backgroundColor: currentStep >= step ? '#2563EB' : '#E2E8F0',
                },
              ]}
            />
            <View
              style={[
                styles.stepCircle,
                currentStep === step && styles.stepCircleActive,
                currentStep > step && styles.stepCircleCompleted,
              ]}
            >
              {currentStep > step ? (
                <Feather name="check" size={12} color="#FFF" />
              ) : (
                <Text
                  style={[
                    styles.stepText,
                    currentStep === step && styles.stepTextActive,
                  ]}
                >
                  {step}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome, {user?.firstName}!</Text>
          <Text style={styles.headerSubtitle}>Let's complete your JNV Profile to get started</Text>
        </View>

        {renderStepIndicator()}

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 1 && (
            <View style={styles.stepContent}>
              <View style={styles.iconWrapper}>
                <Ionicons name="school" size={50} color="#2563EB" />
              </View>
              <Text style={styles.stepTitle}>Your JNV Identity</Text>
              <Text style={styles.stepDesc}>
                Help your classmates find you by selecting your JNV entry and exit batches.
              </Text>

              {/* Join Batch */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Join Batch (Year you entered JNV) *</Text>
                <TouchableOpacity
                  style={styles.pickerSelector}
                  onPress={() => setActivePicker('joinBatch')}
                >
                  <Text style={[styles.pickerText, !formData.joinBatch && { color: '#94A3B8' }]}>
                    {formData.joinBatch || 'Select Join Year'}
                  </Text>
                  <Feather name="chevron-down" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Passout Batch */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Passout Batch (Year you left JNV) *</Text>
                <TouchableOpacity
                  style={styles.pickerSelector}
                  onPress={() => setActivePicker('passoutBatch')}
                >
                  <Text style={[styles.pickerText, !formData.passoutBatch && { color: '#94A3B8' }]}>
                    {formData.passoutBatch || 'Select Passout Year'}
                  </Text>
                  <Feather name="chevron-down" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {currentStep === 2 && (
            <View style={styles.stepContent}>
              <View style={styles.iconWrapper}>
                <Ionicons name="person" size={50} color="#2563EB" />
              </View>
              <Text style={styles.stepTitle}>Personal Details</Text>
              <Text style={styles.stepDesc}>
                Add your contact information and blood group. Blood groups are extremely helpful during emergencies in the JNV network.
              </Text>

              {/* Phone */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(txt) => handleInputChange('phone', txt)}
                  placeholder="+91 XXXXX XXXXX"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Blood Group */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Blood Group *</Text>
                <TouchableOpacity
                  style={styles.pickerSelector}
                  onPress={() => setActivePicker('bloodGroup')}
                >
                  <Text style={[styles.pickerText, !formData.bloodGroup && { color: '#94A3B8' }]}>
                    {formData.bloodGroup || 'Select Blood Group'}
                  </Text>
                  <Feather name="chevron-down" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {currentStep === 3 && (
            <View style={styles.stepContent}>
              <View style={styles.iconWrapper}>
                <Ionicons name="briefcase" size={50} color="#2563EB" />
              </View>
              <Text style={styles.stepTitle}>Current Status</Text>
              <Text style={styles.stepDesc}>
                What do you currently do, and where are you located? This helps in professional networking and local meetups.
              </Text>

              {/* Occupation */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Occupation / Designation *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.occupation}
                  onChangeText={(txt) => handleInputChange('occupation', txt)}
                  placeholder="e.g. Software Engineer, Medical Student, IAS"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Organization */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Organization / Company / School *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.organization}
                  onChangeText={(txt) => handleInputChange('organization', txt)}
                  placeholder="e.g. Google, AIIMS, JNV Delhi, Self-Employed"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Location */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Current City / Location *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.currentAddress}
                  onChangeText={(txt) => handleInputChange('currentAddress', txt)}
                  placeholder="City, State, Country"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer Navigation Buttons */}
        <View style={styles.footer}>
          {currentStep > 1 ? (
            <TouchableOpacity style={styles.backButton} onPress={handleBack} disabled={loading}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.backButton} onPress={handleLogout} disabled={loading}>
              <Text style={[styles.backButtonText, { color: '#EF4444' }]}>Sign Out</Text>
            </TouchableOpacity>
          )}

          {currentStep < 3 ? (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Next</Text>
              <Feather name="arrow-right" size={16} color="#FFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Let's Start</Text>
                  <Feather name="check-circle" size={16} color="#FFF" style={{ marginLeft: 6 }} />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Dropdown Options Picker Modal */}
        <Modal visible={activePicker !== null} transparent animationType="fade">
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => setActivePicker(null)}
          >
            <View style={styles.pickerBox}>
              <Text style={styles.pickerTitle}>
                Select{' '}
                {activePicker === 'bloodGroup'
                  ? 'Blood Group'
                  : activePicker === 'joinBatch'
                  ? 'Join Batch'
                  : 'Passout Batch'}
              </Text>
              <ScrollView style={styles.pickerScroll}>
                {(activePicker === 'bloodGroup'
                  ? BLOOD_GROUPS
                  : activePicker === 'joinBatch'
                  ? JOIN_BATCH_OPTIONS
                  : PASSOUT_BATCH_OPTIONS
                ).map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.pickerOption}
                    onPress={() => {
                      handleInputChange(activePicker as string, opt);
                      setActivePicker(null);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  stepIndicatorWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepLine: {
    width: 60,
    height: 3,
    backgroundColor: '#E2E8F0',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepCircleActive: {
    borderColor: '#2563EB',
    backgroundColor: '#FFF',
  },
  stepCircleCompleted: {
    borderColor: '#2563EB',
    backgroundColor: '#2563EB',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  stepTextActive: {
    color: '#2563EB',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  contentContainer: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  stepContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  pickerSelector: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: 15,
    color: '#0F172A',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFF',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  nextButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  pickerBox: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '50%',
    padding: 24,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerScroll: {
    marginBottom: 16,
  },
  pickerOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#334155',
  },
});
