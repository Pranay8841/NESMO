/**
 * @fileoverview Settings Screen
 * Redesigned Settings screen with Admin Dashboard redirection for administrators.
 * 
 * @module screens/App/SettingsScreen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { logoutUser } from '../../services/authService';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { APP_CONSTANTS } from '../../constants';
import GuestPlaceholder from '../../components/GuestPlaceholder';

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { user, token } = useAppSelector((state) => state.auth);

  if (!token || !user) {
    return (
      <GuestPlaceholder
        title="User Profile"
        description="View your profile completeness indicator, update details like JNV batch year, current occupation, location, and upload a profile photo."
      />
    );
  }

  const handleLogout = async () => {
    await dispatch(logoutUser());
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'EVENT_LEAD':
        return 'Event Lead';
      case 'MEMBER':
        return 'Member';
      case 'ALUMNI':
        return 'Alumni';
      default:
        return 'Alumni';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {user?.firstName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={[styles.roleBadge, user?.role === 'ADMIN' ? styles.adminBadge : styles.userBadge]}>
              <Text style={[styles.roleText, user?.role === 'ADMIN' ? styles.adminText : styles.userText]}>
                {getRoleLabel(user?.role || 'ALUMNI')}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Group: Admin Actions */}
        {user?.role === 'ADMIN' && (
          <View style={styles.groupContainer}>
            <Text style={styles.groupHeader}>Administrative</Text>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => navigation.navigate(APP_CONSTANTS.SCREENS.ADMIN_DASHBOARD)}
            >
              <View style={[styles.rowIconContainer, { backgroundColor: '#EEF2FF' }]}>
                <Feather name="shield" size={18} color="#4F46E5" />
              </View>
              <Text style={styles.rowLabel}>Admin Dashboard</Text>
              <Feather name="chevron-right" size={16} color="#94A3B8" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => navigation.navigate(APP_CONSTANTS.SCREENS.USER_MODERATION)}
            >
              <View style={[styles.rowIconContainer, { backgroundColor: '#EEF2FF' }]}>
                <Feather name="user-check" size={18} color="#4F46E5" />
              </View>
              <Text style={styles.rowLabel}>User Moderation</Text>
              <Feather name="chevron-right" size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        )}

        {/* Settings Group: Profile & Account */}
        <View style={styles.groupContainer}>
          <Text style={styles.groupHeader}>Account Settings</Text>
          
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate(APP_CONSTANTS.SCREENS.PROFILE)}
          >
            <View style={[styles.rowIconContainer, { backgroundColor: '#EFF6FF' }]}>
              <Feather name="user" size={18} color="#2563EB" />
            </View>
            <Text style={styles.rowLabel}>Edit Profile Details</Text>
            <Feather name="chevron-right" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate(APP_CONSTANTS.SCREENS.MEMBERSHIP)}
          >
            <View style={[styles.rowIconContainer, { backgroundColor: '#ECFDF5' }]}>
              <Feather name="credit-card" size={18} color="#059669" />
            </View>
            <Text style={styles.rowLabel}>Membership & Subscriptions</Text>
            <Feather name="chevron-right" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Settings Group: Actions */}
        <View style={styles.groupContainer}>
          <Text style={styles.groupHeader}>Actions</Text>
          
          <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
            <View style={[styles.rowIconContainer, { backgroundColor: '#FEE2E2' }]}>
              <Feather name="log-out" size={18} color="#DC2626" />
            </View>
            <Text style={[styles.rowLabel, { color: '#DC2626' }]}>Sign Out</Text>
            <Feather name="chevron-right" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>NESMO Portal App v1.0.0</Text>
          <Text style={styles.copyrightText}>© {new Date().getFullYear()} NESMO. All rights reserved.</Text>
        </View>
      </ScrollView>
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
    paddingBottom: 32,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarInitial: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 6,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  adminBadge: {
    backgroundColor: '#FEE2E2',
  },
  userBadge: {
    backgroundColor: '#EFF6FF',
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
  },
  adminText: {
    color: '#EF4444',
  },
  userText: {
    color: '#2563EB',
  },
  groupContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    marginBottom: 20,
  },
  groupHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  rowIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  copyrightText: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 4,
  },
});
