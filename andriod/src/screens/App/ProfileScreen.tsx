/**
 * @fileoverview Profile Screen
 * Renders user profile details with editing capabilities, completeness progress,
 * and profile picture uploads using expo-image-picker.
 * 
 * @module screens/App/ProfileScreen
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import {
  fetchProfile,
  updateProfile,
  uploadProfilePhoto,
  fetchProfileCompleteness,
} from '../../services/profileService';
import { setIsEditing } from '../../redux/slices/profileSlice';
import * as ImagePicker from 'expo-image-picker';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const JOIN_BATCH_OPTIONS = Array.from({ length: 41 }, (_, i) => `${1986 + i}`);
const PASSOUT_BATCH_OPTIONS = Array.from({ length: 41 }, (_, i) => `${1993 + i}`);

export default function ProfileScreen({ route }: any) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { user } = useAppSelector((state) => state.auth);
  const { profile, loading, isEditing, completeness } = useAppSelector((state) => state.profile);

  // Picker States
  const [activePicker, setActivePicker] = useState<'joinBatch' | 'passoutBatch' | 'bloodGroup' | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    about: '',
    phone: '',
    joinBatch: '',
    passoutBatch: '',
    occupation: '',
    organization: '',
    sector: '',
    currentAddress: '',
    bloodGroup: '',
  });

  // Fetch profile and completeness on mount
  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(fetchProfileCompleteness());
    
    if (route?.params?.edit) {
      dispatch(setIsEditing(true));
    } else {
      dispatch(setIsEditing(false));
    }
  }, [dispatch, route?.params?.edit]);

  // Sync form state when profile data loads
  useEffect(() => {
    if (profile) {
      setFormData({
        about: profile.about || '',
        phone: profile.phone || '',
        joinBatch: profile.joinBatch || '',
        passoutBatch: profile.passoutBatch || '',
        occupation: profile.occupation || '',
        organization: profile.organization || '',
        sector: profile.sector || '',
        currentAddress: profile.currentAddress || '',
        bloodGroup: profile.bloodGroup || '',
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit - restore original values
      if (profile) {
        setFormData({
          about: profile.about || '',
          phone: profile.phone || '',
          joinBatch: profile.joinBatch || '',
          passoutBatch: profile.passoutBatch || '',
          occupation: profile.occupation || '',
          organization: profile.organization || '',
          sector: profile.sector || '',
          currentAddress: profile.currentAddress || '',
          bloodGroup: profile.bloodGroup || '',
        });
      }
    }
    dispatch(setIsEditing(!isEditing));
  };

  const handleSaveProfile = async () => {
    const resultAction = await dispatch(updateProfile(formData));
    if (updateProfile.fulfilled.match(resultAction)) {
      dispatch(fetchProfileCompleteness());
      toast.show('Profile updated successfully!', { type: 'success' });
      dispatch(setIsEditing(false));
    } else {
      const errorMsg = resultAction.payload || 'Failed to update profile';
      toast.show(errorMsg as string, { type: 'danger' });
    }
  };

  const handlePhotoUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      toast.show('Permission Denied: We need storage permission to upload your photo.', { type: 'danger' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const selectedUri = result.assets[0].uri;
      const filename = selectedUri.split('/').pop() || 'profile.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const fileType = match ? `image/${match[1]}` : `image`;

      const uploadData = new FormData();
      uploadData.append('profilePhoto', {
        uri: selectedUri,
        name: filename,
        type: fileType,
      } as any);

      const resultAction = await dispatch(uploadProfilePhoto(uploadData));
      if (uploadProfilePhoto.fulfilled.match(resultAction)) {
        dispatch(fetchProfile());
        dispatch(fetchProfileCompleteness());
        toast.show('Profile photo updated successfully!', { type: 'success' });
      } else {
        const errorMsg = resultAction.payload || 'Failed to upload photo';
        toast.show(errorMsg as string, { type: 'danger' });
      }
    }
  };

  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'User';
  const roleConfig: Record<string, { label: string; bgColor: string }> = {
    ADMIN: { label: 'Admin', bgColor: '#EF4444' },
    EVENT_LEAD: { label: 'Event Lead', bgColor: '#8B5CF6' },
    MEMBER: { label: 'Member', bgColor: '#3B82F6' },
    ALUMNI: { label: 'Alumni', bgColor: '#6B7280' },
  };
  const roleInfo = roleConfig[user?.role || 'ALUMNI'] || roleConfig.ALUMNI;

  const profileImage = profile?.profilePhoto || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=3b82f6&color=fff&size=128`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header Summary */}
        <View style={styles.profileHeaderBox}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: profileImage }} style={styles.avatar} />
            <TouchableOpacity style={styles.cameraBtn} onPress={handlePhotoUpload}>
              <Feather name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.nameText}>{fullName}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleInfo.bgColor }]}>
            <Text style={styles.roleBadgeText}>{roleInfo.label}</Text>
          </View>

          {/* Edit/Save Button */}
          <TouchableOpacity
            style={[styles.actionBtn, isEditing && styles.saveBtn]}
            onPress={isEditing ? handleSaveProfile : handleEditToggle}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather name={isEditing ? 'save' : 'edit-2'} size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.actionBtnText}>{isEditing ? 'Save Changes' : 'Edit Profile'}</Text>
              </>
            )}
          </TouchableOpacity>
          {isEditing && (
            <TouchableOpacity style={styles.cancelLink} onPress={handleEditToggle}>
              <Text style={styles.cancelLinkText}>Cancel</Text>
            </TouchableOpacity>
          )}

          {/* Completeness Bar */}
          <View style={styles.completenessBox}>
            <View style={styles.completenessHeader}>
              <Text style={styles.completenessTitle}>Profile Completeness</Text>
              <Text style={styles.completenessVal}>{completeness}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${completeness}%` }]} />
            </View>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          {isEditing ? (
            <TextInput
              style={styles.aboutInput}
              multiline
              numberOfLines={4}
              placeholder="Tell us about yourself..."
              placeholderTextColor="#94A3B8"
              value={formData.about}
              onChangeText={(txt) => handleInputChange('about', txt)}
            />
          ) : (
            <Text style={styles.aboutText}>
              {profile?.about || 'No bio added yet.'}
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal & Education</Text>
          
          {/* Phone */}
          {isEditing ? (
            <View style={styles.fieldRowEdit}>
              <Text style={styles.fieldLabelEdit}>Phone Number</Text>
              <TextInput
                style={styles.inputEdit}
                value={formData.phone}
                onChangeText={(txt) => handleInputChange('phone', txt)}
                placeholder="+91 XXXXX XXXXX"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
              />
            </View>
          ) : (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <Text style={styles.fieldVal}>{profile?.phone || 'Not set'}</Text>
            </View>
          )}

          {/* Blood Group */}
          {isEditing ? (
            <View style={styles.fieldRowEdit}>
              <Text style={styles.fieldLabelEdit}>Blood Group</Text>
              <TouchableOpacity
                style={styles.pickerSelectorEdit}
                onPress={() => setActivePicker('bloodGroup')}
              >
                <Text style={styles.pickerSelectorEditText}>
                  {formData.bloodGroup || 'Select Blood Group'}
                </Text>
                <Feather name="chevron-down" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Blood Group</Text>
              <Text style={styles.fieldVal}>{profile?.bloodGroup || 'Not set'}</Text>
            </View>
          )}

          {/* Join Batch */}
          {isEditing ? (
            <View style={styles.fieldRowEdit}>
              <Text style={styles.fieldLabelEdit}>Join Batch</Text>
              <TouchableOpacity
                style={styles.pickerSelectorEdit}
                onPress={() => setActivePicker('joinBatch')}
              >
                <Text style={styles.pickerSelectorEditText}>
                  {formData.joinBatch || 'Select Join Year'}
                </Text>
                <Feather name="chevron-down" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Join Batch</Text>
              <Text style={styles.fieldVal}>{profile?.joinBatch || 'Not set'}</Text>
            </View>
          )}

          {/* Passout Batch */}
          {isEditing ? (
            <View style={styles.fieldRowEdit}>
              <Text style={styles.fieldLabelEdit}>Passout Batch</Text>
              <TouchableOpacity
                style={styles.pickerSelectorEdit}
                onPress={() => setActivePicker('passoutBatch')}
              >
                <Text style={styles.pickerSelectorEditText}>
                  {formData.passoutBatch || 'Select Passout Year'}
                </Text>
                <Feather name="chevron-down" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Passout Batch</Text>
              <Text style={styles.fieldVal}>{profile?.passoutBatch || 'Not set'}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Information</Text>

          {/* Occupation */}
          {isEditing ? (
            <View style={styles.fieldRowEdit}>
              <Text style={styles.fieldLabelEdit}>Occupation</Text>
              <TextInput
                style={styles.inputEdit}
                value={formData.occupation}
                onChangeText={(txt) => handleInputChange('occupation', txt)}
                placeholder="e.g. Software Engineer"
                placeholderTextColor="#94A3B8"
              />
            </View>
          ) : (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Occupation</Text>
              <Text style={styles.fieldVal}>{profile?.occupation || 'Not set'}</Text>
            </View>
          )}

          {/* Organization */}
          {isEditing ? (
            <View style={styles.fieldRowEdit}>
              <Text style={styles.fieldLabelEdit}>Organization / Company</Text>
              <TextInput
                style={styles.inputEdit}
                value={formData.organization}
                onChangeText={(txt) => handleInputChange('organization', txt)}
                placeholder="Company, hospital, school..."
                placeholderTextColor="#94A3B8"
              />
            </View>
          ) : (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Organization</Text>
              <Text style={styles.fieldVal}>{profile?.organization || 'Not set'}</Text>
            </View>
          )}

          {/* Sector */}
          {isEditing ? (
            <View style={styles.fieldRowEdit}>
              <Text style={styles.fieldLabelEdit}>Sector</Text>
              <TextInput
                style={styles.inputEdit}
                value={formData.sector}
                onChangeText={(txt) => handleInputChange('sector', txt)}
                placeholder="e.g. Technology, Finance, Education"
                placeholderTextColor="#94A3B8"
              />
            </View>
          ) : (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Sector</Text>
              <Text style={styles.fieldVal}>{profile?.sector || 'Not set'}</Text>
            </View>
          )}

          {/* Current Address */}
          {isEditing ? (
            <View style={styles.fieldRowEdit}>
              <Text style={styles.fieldLabelEdit}>Location</Text>
              <TextInput
                style={styles.inputEdit}
                value={formData.currentAddress}
                onChangeText={(txt) => handleInputChange('currentAddress', txt)}
                placeholder="City, State, Country"
                placeholderTextColor="#94A3B8"
              />
            </View>
          ) : (
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Location</Text>
              <Text style={styles.fieldVal}>{profile?.currentAddress || 'Not set'}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Choice Modal Picker */}
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
              <TouchableOpacity
                style={styles.pickerOption}
                onPress={() => {
                  handleInputChange(activePicker as string, '');
                  setActivePicker(null);
                }}
              >
                <Text style={styles.pickerOptionText}>Clear Selection</Text>
              </TouchableOpacity>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  profileHeaderBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  emailText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
    marginBottom: 16,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionBtn: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    width: '100%',
  },
  saveBtn: {
    backgroundColor: '#10B981',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  cancelLink: {
    marginTop: 10,
  },
  cancelLinkText: {
    color: '#FF3B30',
    fontSize: 13,
    fontWeight: '600',
  },
  completenessBox: {
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 16,
    paddingTop: 16,
  },
  completenessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  completenessTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  completenessVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#007AFF',
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0D1527',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  aboutInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#334155',
    textAlignVertical: 'top',
    height: 96,
  },
  aboutText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  fieldLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  fieldVal: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  fieldRowEdit: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  fieldLabelEdit: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputEdit: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: '#334155',
    backgroundColor: '#FFFFFF',
  },
  pickerSelectorEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  pickerSelectorEditText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    width: '60%',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 36,
    fontSize: 13,
    color: '#334155',
    textAlign: 'right',
  },
  pickerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '60%',
    height: 36,
  },
  pickerSelectorText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#007AFF',
    marginRight: 6,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pickerBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '80%',
    maxHeight: '60%',
    padding: 16,
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  pickerScroll: {
    flexGrow: 1,
  },
  pickerOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  pickerOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
});
