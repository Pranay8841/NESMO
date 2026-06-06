/**
 * @fileoverview Batch Representative Dashboard Screen
 * Shows batch statistics, member list, and profile onboarding statuses in React Native.
 * 
 * @module screens/App/BatchDashboardScreen
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useAppSelector } from '../../redux/hooks';
import { apiConnector } from '../../utils/APIsConnector';
import { PROFILE_API } from '../../utils/api';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BatchMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  occupation: string;
  profilePhoto: string;
  completeness: number;
  isOnboarded: boolean;
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
}

interface BatchStats {
  passoutBatch: string;
  totalMembers: number;
  pendingProfileCount: number;
  completedProfileCount: number;
  members: BatchMember[];
}

export default function BatchDashboardScreen() {
  const navigation = useNavigation();
  const { token } = useAppSelector((state) => state.auth);
  
  const [stats, setStats] = useState<BatchStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');

  // Block User Modal states
  const [selectedUser, setSelectedUser] = useState<BatchMember | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  const fetchBatchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await apiConnector(
        'GET',
        PROFILE_API.GET_BATCH_DASHBOARD,
        null,
        token ? { Authorization: `Bearer ${token}` } as any : undefined
      );

      if (response.data.success) {
        setStats(response.data.data);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to fetch batch data');
      }
    } catch (error: any) {
      console.error('Fetch batch stats error:', error);
      const errMsg = error.response?.data?.message || 'Error connecting to server';
      Alert.alert('Error', errMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    fetchBatchStats();
  }, [fetchBatchStats]);

  const handleRefresh = () => {
    fetchBatchStats(true);
  };

  const handleBlockUser = (member: BatchMember) => {
    setSelectedUser(member);
    setBlockReason('');
    setShowBlockModal(true);
  };

  const submitBlockUser = async () => {
    if (!selectedUser || !blockReason.trim()) return;
    const name = `${selectedUser.firstName} ${selectedUser.lastName}`;
    try {
      const url = PROFILE_API.BLOCK_BATCH_USER.replace(':id', selectedUser.id);
      const response = await apiConnector(
        'PUT',
        url,
        { reason: blockReason },
        token ? { Authorization: `Bearer ${token}` } as any : undefined
      );
      if (response.data.success) {
        Alert.alert('Success', `${name} has been blocked.`);
        setShowBlockModal(false);
        setSelectedUser(null);
        setBlockReason('');
        fetchBatchStats();
      } else {
        Alert.alert('Error', response.data.message || 'Failed to block user');
      }
    } catch (error: any) {
      console.error('Block user error:', error);
      const errMsg = error.response?.data?.message || 'Failed to block user';
      Alert.alert('Error', errMsg);
    }
  };

  const handleUnblockUser = (userId: string, name: string) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Unblock', 
          onPress: async () => {
            try {
              const url = PROFILE_API.UNBLOCK_BATCH_USER.replace(':id', userId);
              const response = await apiConnector(
                'PUT',
                url,
                null,
                token ? { Authorization: `Bearer ${token}` } as any : undefined
              );
              if (response.data.success) {
                Alert.alert('Success', `${name} has been unblocked.`);
                fetchBatchStats();
              } else {
                Alert.alert('Error', response.data.message || 'Failed to unblock user');
              }
            } catch (error: any) {
              console.error('Unblock user error:', error);
              const errMsg = error.response?.data?.message || 'Failed to unblock user';
              Alert.alert('Error', errMsg);
            }
          }
        }
      ]
    );
  };

  const getAvatarInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase().slice(0, 2);
  };

  // Filtered members list
  const filteredMembers = stats?.members.filter((member) => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const email = member.email.toLowerCase();
    const city = (member.city || '').toLowerCase();
    const occupation = (member.occupation || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    // Search match
    const matchesSearch =
      fullName.includes(search) ||
      email.includes(search) ||
      city.includes(search) ||
      occupation.includes(search);

    // Status match
    const isCompleted = member.isOnboarded && member.completeness >= 80;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'completed' && isCompleted) ||
      (statusFilter === 'pending' && !isCompleted);

    return matchesSearch && matchesStatus;
  }) || [];

  if (loading && !stats) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading batch statistics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render FlatList Header
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Subtitle / Passout batch indicator */}
      <View style={styles.batchInfoRow}>
        <View style={styles.batchBadge}>
          <Text style={styles.batchBadgeText}>Batch of {stats?.passoutBatch || 'N/A'}</Text>
        </View>
        <Text style={styles.totalJoinedText}>{stats?.totalMembers || 0} Classmates Joined</Text>
      </View>

      {/* Stats Cards Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: '#3B82F6' }]}>
          <Text style={styles.statLabel}>Total joined</Text>
          <Text style={[styles.statValue, { color: '#1E293B' }]}>{stats?.totalMembers || 0}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
          <Text style={styles.statLabel}>Onboarded</Text>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{stats?.completedProfileCount || 0}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats?.pendingProfileCount || 0}</Text>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Feather name="search" size={16} color="#64748B" style={styles.searchIcon} />
          <TextInput
            placeholder="Search classmates..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Feather name="x" size={16} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsRow}>
        <TouchableOpacity
          style={[styles.filterTab, statusFilter === 'all' && styles.filterTabActive]}
          onPress={() => setStatusFilter('all')}
        >
          <Text style={[styles.filterTabText, statusFilter === 'all' && styles.filterTabTextActive]}>
            All ({stats?.members.length || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, statusFilter === 'completed' && styles.filterTabActive]}
          onPress={() => setStatusFilter('completed')}
        >
          <Text style={[styles.filterTabText, statusFilter === 'completed' && styles.filterTabTextActive]}>
            Onboarded ({stats?.completedProfileCount || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, statusFilter === 'pending' && styles.filterTabActive]}
          onPress={() => setStatusFilter('pending')}
        >
          <Text style={[styles.filterTabText, statusFilter === 'pending' && styles.filterTabTextActive]}>
            Pending ({stats?.pendingProfileCount || 0})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Custom Header Bar */}
      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.customHeaderTitle}>Batch Portal</Text>
        <TouchableOpacity style={styles.syncButton} onPress={handleRefresh} disabled={refreshing}>
          <Feather name="refresh-cw" size={18} color="#007AFF" style={refreshing ? styles.spinIcon : null} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        style={styles.listStyle}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => {
          const isCompleted = item.isOnboarded && item.completeness >= 80;
          return (
            <View style={styles.memberCard}>
              <View style={styles.cardHeader}>
                {item.profilePhoto ? (
                  <Image source={{ uri: item.profilePhoto }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {getAvatarInitials(item.firstName, item.lastName)}
                    </Text>
                  </View>
                )}
                
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>
                    {item.firstName} {item.lastName}
                  </Text>
                  <Text style={styles.memberEmail} numberOfLines={1}>
                    {item.email}
                  </Text>
                  
                  {/* Phone & City */}
                  <View style={styles.metaInfoRow}>
                    {item.phone ? (
                      <Text style={styles.metaInfoText}>📞 {item.phone}</Text>
                    ) : null}
                    {item.city ? (
                      <Text style={styles.metaInfoText}>📍 {item.city}</Text>
                    ) : null}
                  </View>

                  {/* Occupation */}
                  {item.occupation ? (
                    <Text style={styles.occupationText} numberOfLines={1}>
                      💼 {item.occupation}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Progress Bar & Status */}
              <View style={styles.cardFooter}>
                <View style={styles.completenessWrapper}>
                  <View style={styles.completenessTextRow}>
                    <Text style={styles.completenessLabel}>Completeness</Text>
                    <Text style={[styles.completenessValue, { color: isCompleted ? '#10B981' : '#F59E0B' }]}>
                      {item.completeness}%
                    </Text>
                  </View>
                  <View style={styles.progressBarTrack}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { 
                          width: `${item.completeness}%`, 
                          backgroundColor: isCompleted ? '#10B981' : '#F59E0B' 
                        }
                      ]} 
                    />
                  </View>
                </View>

                {item.status === 'BLOCKED' ? (
                  <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
                    <Text style={[styles.statusBadgeText, { color: '#991B1B' }]}>
                      Blocked
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.statusBadge, { backgroundColor: isCompleted ? '#E6F4EA' : '#FFF3CD' }]}>
                    <Text style={[styles.statusBadgeText, { color: isCompleted ? '#137333' : '#B06000' }]}>
                      {isCompleted ? 'Onboarded' : 'Pending'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                {item.status === 'BLOCKED' ? (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.unblockButton]} 
                    onPress={() => handleUnblockUser(item.id, `${item.firstName} ${item.lastName}`)}
                  >
                    <Feather name="unlock" size={12} color="#10B981" />
                    <Text style={styles.unblockButtonText}>Unblock Member</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.blockButton]} 
                    onPress={() => handleBlockUser(item)}
                  >
                    <Feather name="slash" size={12} color="#EF4444" />
                    <Text style={styles.blockButtonText}>Block Member</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Feather name="users" size={32} color="#94A3B8" />
            <Text style={styles.emptyText}>No batch members found</Text>
            <Text style={styles.emptySubtext}>Try adjusting search or status filters</Text>
          </View>
        )}
      />

      {/* Block User Dialog */}
      <Modal visible={showBlockModal} transparent animationType="fade">
        <View style={styles.modalOverlayCenter}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogTitle}>Block User</Text>
            <Text style={styles.dialogText}>
              Please state a reason for blocking {selectedUser?.firstName}{' '}
              {selectedUser?.lastName}. This will prevent them from accessing the app.
            </Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Reason for blocking..."
              placeholderTextColor="#94A3B8"
              value={blockReason}
              onChangeText={setBlockReason}
              multiline
              numberOfLines={3}
            />
            <View style={styles.dialogBtnRow}>
              <TouchableOpacity
                style={styles.dialogCancelBtn}
                onPress={() => setShowBlockModal(false)}
              >
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogConfirmBtn, !blockReason.trim() && styles.dialogConfirmBtnDisabled]}
                disabled={!blockReason.trim()}
                onPress={submitBlockUser}
              >
                <Text style={styles.dialogConfirmText}>Block</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  listStyle: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 4,
  },
  customHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  syncButton: {
    padding: 6,
  },
  spinIcon: {
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 32,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  batchInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  batchBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  batchBadgeText: {
    color: '#4F46E5',
    fontWeight: '700',
    fontSize: 12,
  },
  totalJoinedText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    padding: 0,
  },
  filterTabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  filterTab: {
    paddingVertical: 10,
    marginRight: 20,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: '#007AFF',
  },
  filterTabText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: '#007AFF',
    fontWeight: '700',
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E2E8F0',
  },
  avatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#1E40AF',
    fontWeight: '800',
    fontSize: 16,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  memberEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  metaInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  metaInfoText: {
    fontSize: 10,
    color: '#475569',
    marginRight: 12,
    marginTop: 2,
  },
  occupationText: {
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingTop: 10,
    marginTop: 12,
  },
  completenessWrapper: {
    flex: 1,
    marginRight: 16,
  },
  completenessTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  completenessLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
  },
  completenessValue: {
    fontSize: 10,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  actionRow: {
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingTop: 10,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  blockButton: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  unblockButton: {
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
  },
  blockButtonText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  unblockButtonText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  dialogText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    height: 72,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  dialogBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  dialogCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
  },
  dialogCancelText: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 13,
  },
  dialogConfirmBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dialogConfirmBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
  dialogConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
