import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { logoutUser } from '../../services/authService';
import { fetchProfileCompleteness, fetchProfile } from '../../services/profileService';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { APP_CONSTANTS } from '../../constants';
import GuestPlaceholder from '../../components/GuestPlaceholder';

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { user, token } = useAppSelector((state) => state.auth);
  const { completeness, profile } = useAppSelector((state) => state.profile);

  // Fetch completeness and profile from database on mount if authenticated
  useEffect(() => {
    if (token) {
      dispatch(fetchProfileCompleteness());
      dispatch(fetchProfile());
    }
  }, [dispatch, token]);

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

  const firstName = user?.firstName || 'User';
  const role = user?.role || 'MEMBER';

  // Role styling configuration matching our high premium design guidelines
  const roleStyles: Record<string, { label: string; bgColor: string; textColor: string; icon: string }> = {
    ADMIN: { label: 'Admin', bgColor: '#FEE2E2', textColor: '#EF4444', icon: 'shield-outline' },
    BATCH_REP: { label: 'Batch Rep', bgColor: '#F5F3FF', textColor: '#8B5CF6', icon: 'ribbon-outline' },
    MEMBER: { label: 'Member', bgColor: '#EFF6FF', textColor: '#3B82F6', icon: 'card-outline' },
  };

  const roleInfo = roleStyles[role] || roleStyles.MEMBER;
  const completenessVal = completeness || 0;
  const profileImage = profile?.profilePhoto || (user && typeof user.profile === 'object' ? user.profile.profilePhoto : null);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Text style={styles.profileTitle}>Profile</Text>
        <Text style={styles.profileSubtitle}>
          Manage your account details, view completeness, and configure settings.
        </Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeRow}>
            <View style={styles.welcomeTextGroup}>
              <View style={[styles.roleBadge, { backgroundColor: roleInfo.bgColor }]}>
                <Ionicons name={roleInfo.icon as any} size={10} color={roleInfo.textColor} style={{ marginRight: 4 }} />
                <Text style={[styles.roleBadgeText, { color: roleInfo.textColor }]}>{roleInfo.label}</Text>
              </View>
              <Text style={styles.welcomeTitle}>Welcome back,</Text>
              <Text style={styles.welcomeName}>{firstName}!</Text>
            </View>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.welcomeAvatarImage} />
            ) : (
              <View style={styles.welcomeAvatar}>
                <Text style={styles.welcomeInitials}>
                  {user?.firstName?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Render JNV Batch and Job Details in Welcome Card from database profile */}
          {profile && (profile.joinBatch || profile.passoutBatch || profile.occupation) && (
            <View style={styles.profileDetailsRow}>
              {profile.occupation && (
                <Text style={styles.profileMetaText} numberOfLines={1}>
                  💼 {profile.occupation}{profile.organization ? ` at ${profile.organization}` : ''}
                </Text>
              )}
              {(profile.joinBatch || profile.passoutBatch) && (
                <Text style={styles.profileMetaText}>
                  🎓 JNV Batch: {profile.joinBatch || '?'}-{profile.passoutBatch || '?'}
                </Text>
              )}
            </View>
          )}

          <Text style={styles.welcomeSub}>
            Great to see you again. Here's what's happening in your network.
          </Text>
        </View>

        {/* Profile Completeness Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.cardTitle}>Profile Completeness</Text>
              <Text style={styles.cardSub}>Complete your details to stand out in the directory</Text>
            </View>
            <Text style={styles.completenessPercentage}>{completenessVal}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${completenessVal}%` }]} />
          </View>
        </View>

        {/* Quick Actions Title */}
        <Text style={styles.sectionHeading}>Quick Actions</Text>

        {/* Quick Actions Grid */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionTile, { borderColor: '#DBEAFE' }]}
            activeOpacity={0.75}
            onPress={() => navigation.getParent()?.navigate(APP_CONSTANTS.SCREENS.PROFILE, { edit: true })}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#EFF6FF' }]}>
              <Feather name="edit-2" size={20} color="#2563EB" />
            </View>
            <Text style={styles.actionTileTitle}>Update Profile</Text>
            <Text style={styles.actionTileDesc}>Keep your contact details up to date</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, { borderColor: '#D1FAE5' }]}
            activeOpacity={0.75}
            onPress={() => navigation.navigate(APP_CONSTANTS.SCREENS.DIRECTORY)}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#ECFDF5' }]}>
              <Feather name="users" size={20} color="#059669" />
            </View>
            <Text style={styles.actionTileTitle}>Alumni Directory</Text>
            <Text style={styles.actionTileDesc}>Find and connect with old batchmates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, { borderColor: '#EFF6FF' }]}
            activeOpacity={0.75}
            onPress={() => navigation.navigate(APP_CONSTANTS.SCREENS.COMMUNITY)}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#EFF6FF' }]}>
              <Feather name="message-square" size={20} color="#2563EB" />
            </View>
            <Text style={styles.actionTileTitle}>Community</Text>
            <Text style={styles.actionTileDesc}>Connect and chat with JNV alumni</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionTile, { borderColor: '#CBD5E1' }]}
            activeOpacity={0.75}
            onPress={handleLogout}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#F1F5F9' }]}>
              <Feather name="log-out" size={20} color="#64748B" />
            </View>
            <Text style={styles.actionTileTitle}>Sign Out</Text>
            <Text style={styles.actionTileDesc}>Log out of your current session securely</Text>
          </TouchableOpacity>
        </View>

        {/* Admin Section (Admins Only) */}
        {role === 'ADMIN' && (
          <>
            <Text style={styles.sectionHeading}>Administrative Portal</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={[styles.actionTile, { borderColor: '#F5D0FE' }]}
                activeOpacity={0.75}
                onPress={() => navigation.navigate(APP_CONSTANTS.SCREENS.ADMIN_DASHBOARD)}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: '#FDF4FF' }]}>
                  <Feather name="shield" size={20} color="#8B5CF6" />
                </View>
                <Text style={styles.actionTileTitle}>Admin Dashboard</Text>
                <Text style={styles.actionTileDesc}>System metrics and network statistics</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionTile, { borderColor: '#FECACA' }]}
                activeOpacity={0.75}
                onPress={() => navigation.navigate(APP_CONSTANTS.SCREENS.USER_MODERATION)}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: '#FEE2E2' }]}>
                  <Feather name="user-check" size={20} color="#EF4444" />
                </View>
                <Text style={styles.actionTileTitle}>User Moderation</Text>
                <Text style={styles.actionTileDesc}>Approve, verify, role update or block users</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Batch Portal Section (Batch Reps Only) */}
        {role === 'BATCH_REP' && (
          <>
            <Text style={styles.sectionHeading}>Batch Portal</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={[styles.actionTile, { borderColor: '#F5D0FE', width: '100%' }]}
                activeOpacity={0.75}
                onPress={() => navigation.navigate(APP_CONSTANTS.SCREENS.BATCH_DASHBOARD)}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: '#FDF4FF' }]}>
                  <Feather name="users" size={20} color="#8B5CF6" />
                </View>
                <Text style={styles.actionTileTitle}>Batch Dashboard</Text>
                <Text style={styles.actionTileDesc}>View and manage members of your passout batch</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Announcement Info Alert */}
        <View style={styles.infoAlert}>
          <View style={styles.infoAlertHeader}>
            <Ionicons name="information-circle-sharp" size={20} color="#2563EB" style={{ marginRight: 8 }} />
            <Text style={styles.infoAlertTitle}>Platform Release Announcement</Text>
          </View>
          <Text style={styles.infoAlertText}>
            Welcome to the first release of the NESMO Alumni Network! We are building a cohesive global JNV alumni database.
            {"\n\n"}
            Additional modules such as Events, Mentorship Programs, and Payment/Membership subscriptions are undergoing internal testing and will launch soon. For now, please verify/update your profile and search the directory to connect!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  profileHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  profileTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '400',
    lineHeight: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeTextGroup: {
    flex: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  welcomeTitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  welcomeName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  welcomeAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  welcomeAvatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginLeft: 16,
    backgroundColor: '#E2E8F0',
  },
  welcomeInitials: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  welcomeSub: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  profileDetailsRow: {
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingTop: 10,
    marginBottom: 10,
  },
  profileMetaText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  completenessPercentage: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2563EB',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  actionTile: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 1,
  },
  actionIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTileTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  actionTileDesc: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
  },
  infoAlert: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 16,
    marginTop: 8,
  },
  infoAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoAlertTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
  },
  infoAlertText: {
    fontSize: 11,
    color: '#1E3A8A',
    lineHeight: 16,
  },
});
