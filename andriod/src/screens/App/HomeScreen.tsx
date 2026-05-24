/**
 * @fileoverview Home Screen (Dashboard Router)
 * Dynamically switches between the Admin Dashboard and the User Dashboard
 * based on the authenticated user's role.
 * 
 * @module screens/App/HomeScreen
 */

import React, { useEffect } from 'react';
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
import { fetchProfileCompleteness } from '../../services/profileService';
import AdminDashboardScreen from './AdminDashboardScreen';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { APP_CONSTANTS } from '../../constants';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { user } = useAppSelector((state) => state.auth);
  const { completeness } = useAppSelector((state) => state.profile);

  // Fetch profile completeness on mount
  useEffect(() => {
    dispatch(fetchProfileCompleteness());
  }, [dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
  };

  // If user is Admin, render the Admin Dashboard
  if (user?.role === 'ADMIN') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AdminDashboardScreen />
      </SafeAreaView>
    );
  }

  // Derive user info
  const firstName = user?.firstName || 'User';
  const roleConfig: Record<string, { label: string; bgColor: string }> = {
    ADMIN: { label: 'Admin', bgColor: '#EF4444' },
    EVENT_LEAD: { label: 'Event Lead', bgColor: '#8B5CF6' },
    MEMBER: { label: 'Member', bgColor: '#3B82F6' },
    ALUMNI: { label: 'Alumni', bgColor: '#6B7280' },
  };
  const roleInfo = roleConfig[user?.role || 'ALUMNI'] || roleConfig.ALUMNI;
  const profileCompleteness = completeness || 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <Text style={styles.appName}>NESMO Alumni</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <View style={styles.badgeContainer}>
            <View style={[styles.roleBadge, { backgroundColor: roleInfo.bgColor }]}>
              <Text style={styles.roleText}>{roleInfo.label}</Text>
            </View>
          </View>
          <Text style={styles.welcomeTitle}>Welcome back, {firstName}!</Text>
          <Text style={styles.welcomeSubtitle}>
            Great to see you again. Here's what's happening in your network.
          </Text>

          {/* Profile Completeness */}
          <View style={styles.completenessSection}>
            <View style={styles.completenessHeader}>
              <View>
                <Text style={styles.completenessTitle}>Profile Completeness</Text>
                <Text style={styles.completenessSubtitle}>
                  Complete your profile to unlock all features
                </Text>
              </View>
              <Text style={styles.completenessPercent}>{profileCompleteness}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${profileCompleteness}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Quick Action Cards */}
        <Text style={styles.sectionHeader}>Quick Actions</Text>
        <View style={styles.actionCardsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate(APP_CONSTANTS.SCREENS.PROFILE)}
          >
            <View style={[styles.cardIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Feather name="edit-3" size={22} color="#0284C7" />
            </View>
            <Text style={styles.cardTitle}>Update Profile</Text>
            <Text style={styles.cardDesc}>
              Complete your profile details to be visible in the alumni directory.
            </Text>
            <View style={styles.cardActionLabel}>
              <Text style={styles.cardActionText}>Edit Profile</Text>
              <Feather name="chevron-right" size={14} color="#007AFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate(APP_CONSTANTS.SCREENS.DIRECTORY)}
          >
            <View style={[styles.cardIconBox, { backgroundColor: '#DCFCE7' }]}>
              <Feather name="users" size={22} color="#15803D" />
            </View>
            <Text style={styles.cardTitle}>Alumni Directory</Text>
            <Text style={styles.cardDesc}>
              Discover and connect with fellow Navodayans from across the network.
            </Text>
            <View style={styles.cardActionLabel}>
              <Text style={styles.cardActionText}>View Directory</Text>
              <Feather name="chevron-right" size={14} color="#007AFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIconBox}>
            <Ionicons name="information-circle" size={24} color="#0284C7" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Welcome to NESMO Network!</Text>
            <Text style={styles.infoText}>
              This is the first release of our platform. More features like events, membership
              benefits, and mentorship programs are coming soon. For now, update your profile and
              explore the directory!
            </Text>
          </View>
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
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  logoutButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FFEAEA',
  },
  welcomeBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  completenessSection: {
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingTop: 16,
  },
  completenessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  completenessTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  completenessSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  completenessPercent: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2563EB',
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 99,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 2,
  },
  cardIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 15,
    height: 45, // Keep uniform height
    marginBottom: 12,
  },
  cardActionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007AFF',
    marginRight: 4,
  },
  infoBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoIconBox: {
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 11,
    color: '#1E40AF',
    lineHeight: 16,
  },
});
