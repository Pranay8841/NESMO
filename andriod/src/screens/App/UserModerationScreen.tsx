/**
 * @fileoverview User Moderation Screen
 * Admin panel for managing users: view, filter, block/unblock, change roles, verify emails.
 * 
 * @module screens/App/UserModerationScreen
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  fetchAllUsers,
  blockUser,
  unblockUser,
  updateUserRole,
  verifyUserEmail,
  type UserFilterParams,
} from '../../services/adminService';
import type { AdminUser } from '../../redux/slices/adminSlice';
import { Feather, Ionicons } from '@expo/vector-icons';

/** Role display configuration */
const roleConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  ALUMNI: { label: 'Alumni', color: '#1E40AF', bgColor: '#DBEAFE' },
  MEMBER: { label: 'Member', color: '#065F46', bgColor: '#D1FAE5' },
  EVENT_LEAD: { label: 'Event Lead', color: '#5B21B6', bgColor: '#EDE9FE' },
  ADMIN: { label: 'Admin', color: '#991B1B', bgColor: '#FEE2E2' },
};

/** Status display configuration */
const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  ACTIVE: { label: 'Active', color: '#065F46', bgColor: '#D1FAE5' },
  BLOCKED: { label: 'Blocked', color: '#991B1B', bgColor: '#FEE2E2' },
};

export default function UserModerationScreen() {
  const dispatch = useAppDispatch();
  const { users } = useAppSelector((state) => state.admin);
  const currentUser = useAppSelector((state) => state.auth.user);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'blocked' | ''>('');
  const [roleFilter, setRoleFilter] = useState<'ALUMNI' | 'MEMBER' | 'EVENT_LEAD' | 'ADMIN' | ''>('');
  const [verifiedFilter, setVerifiedFilter] = useState<'true' | 'false' | ''>('');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [newRole, setNewRole] = useState<'ALUMNI' | 'MEMBER' | 'EVENT_LEAD' | 'ADMIN'>('ALUMNI');

  // Build filter parameters
  const buildFilterParams = useCallback((): UserFilterParams => {
    const params: UserFilterParams = { page: users.page, limit: 20 };
    if (searchTerm) params.search = searchTerm;
    if (statusFilter) params.status = statusFilter;
    if (roleFilter) params.role = roleFilter;
    if (verifiedFilter) params.verified = verifiedFilter;
    return params;
  }, [searchTerm, statusFilter, roleFilter, verifiedFilter, users.page]);

  // Load users from API
  const loadUsers = useCallback(
    (page = 1) => {
      const params = buildFilterParams();
      params.page = page;
      dispatch(fetchAllUsers(params));
    },
    [dispatch, buildFilterParams]
  );

  // Initial load
  useEffect(() => {
    loadUsers(1);
  }, []);

  // Reload on filter/search change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(1);
    }, searchTerm ? 500 : 0);
    return () => clearTimeout(timer);
  }, [statusFilter, roleFilter, verifiedFilter, searchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= users.pages) {
      loadUsers(newPage);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUser || !blockReason.trim()) return;
    await dispatch(blockUser({ userId: selectedUser._id, reason: blockReason }));
    setShowBlockModal(false);
    setSelectedUser(null);
    setBlockReason('');
  };

  const handleUnblockUser = async (user: AdminUser) => {
    await dispatch(unblockUser(user._id));
    setShowOptionsModal(false);
  };

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    await dispatch(updateUserRole({ userId: selectedUser._id, role: newRole }));
    setShowRoleModal(false);
    setSelectedUser(null);
  };

  const handleVerifyEmail = async (user: AdminUser) => {
    await dispatch(verifyUserEmail(user._id));
    setShowOptionsModal(false);
  };

  const openOptions = (user: AdminUser) => {
    setSelectedUser(user);
    setShowOptionsModal(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setRoleFilter('');
    setVerifiedFilter('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getAvatarInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase().slice(0, 2);
  };

  const activeFilterCount = [statusFilter, roleFilter, verifiedFilter].filter(Boolean).length;

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchInputWrapper}>
          <Feather name="search" size={16} color="#64748B" style={styles.searchIcon} />
          <TextInput
            placeholder="Search by name or email..."
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#94A3B8"
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Feather name="x" size={16} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilterModal(true)}
        >
          <Feather name="filter" size={16} color={activeFilterCount > 0 ? '#FFFFFF' : '#475569'} />
          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Users List */}
      {users.loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : users.data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="users" size={40} color="#94A3B8" />
          <Text style={styles.emptyText}>No users found</Text>
          <Text style={styles.emptySubtext}>Try adjusting search or filters</Text>
          {activeFilterCount > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
              <Text style={styles.clearBtnText}>Reset Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={users.data}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const rConfig = roleConfig[item.role] || roleConfig.ALUMNI;
            const sConfig = statusConfig[item.status] || statusConfig.ACTIVE;
            const photoUrl = item.profile?.profilePhoto;

            return (
              <View style={styles.userCard}>
                <View style={styles.cardHeader}>
                  {photoUrl ? (
                    <Image source={{ uri: photoUrl }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitials}>
                        {getAvatarInitials(item.firstName, item.lastName)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {item.firstName} {item.lastName}
                    </Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <View style={styles.badgesRow}>
                      <View style={[styles.badgeItem, { backgroundColor: rConfig.bgColor }]}>
                        <Text style={[styles.badgeLabel, { color: rConfig.color }]}>
                          {rConfig.label}
                        </Text>
                      </View>
                      <View style={[styles.badgeItem, { backgroundColor: sConfig.bgColor }]}>
                        <Text style={[styles.badgeLabel, { color: sConfig.color }]}>
                          {sConfig.label}
                        </Text>
                      </View>
                      {item.isEmailVerified && (
                        <View style={[styles.badgeItem, { backgroundColor: '#D1FAE5' }]}>
                          <Text style={[styles.badgeLabel, { color: '#065F46' }]}>Verified</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity style={styles.optionsButton} onPress={() => openOptions(item)}>
                    <Feather name="more-vertical" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListFooterComponent={() =>
            users.pages > 1 ? (
              <View style={styles.paginationRow}>
                <TouchableOpacity
                  style={[styles.pageBtn, users.page === 1 && styles.pageBtnDisabled]}
                  onPress={() => handlePageChange(users.page - 1)}
                  disabled={users.page === 1}
                >
                  <Feather name="chevron-left" size={18} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.pageIndicator}>
                  Page {users.page} of {users.pages}
                </Text>
                <TouchableOpacity
                  style={[styles.pageBtn, users.page === users.pages && styles.pageBtnDisabled]}
                  onPress={() => handlePageChange(users.page + 1)}
                  disabled={users.page === users.pages}
                >
                  <Feather name="chevron-right" size={18} color="#007AFF" />
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}

      {/* Filter Modal */}
      <Modal visible={showFilterModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Feather name="x" size={22} color="#475569" />
              </TouchableOpacity>
            </View>
            <View style={styles.sheetContent}>
              {/* Status Filter */}
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.optionRow}>
                {['', 'active', 'blocked'].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.optionTag, statusFilter === opt && styles.optionTagSelected]}
                    onPress={() => setStatusFilter(opt as any)}
                  >
                    <Text
                      style={[
                        styles.optionTagText,
                        statusFilter === opt && styles.optionTagTextSelected,
                      ]}
                    >
                      {opt === '' ? 'All' : opt.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Role Filter */}
              <Text style={styles.filterLabel}>Role</Text>
              <View style={styles.optionRow}>
                {['', 'ALUMNI', 'MEMBER', 'EVENT_LEAD', 'ADMIN'].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.optionTag, roleFilter === opt && styles.optionTagSelected]}
                    onPress={() => setRoleFilter(opt as any)}
                  >
                    <Text
                      style={[
                        styles.optionTagText,
                        roleFilter === opt && styles.optionTagTextSelected,
                      ]}
                    >
                      {opt === '' ? 'All' : opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Verified Filter */}
              <Text style={styles.filterLabel}>Email Verification</Text>
              <View style={styles.optionRow}>
                {['', 'true', 'false'].map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.optionTag, verifiedFilter === opt && styles.optionTagSelected]}
                    onPress={() => setVerifiedFilter(opt as any)}
                  >
                    <Text
                      style={[
                        styles.optionTagText,
                        verifiedFilter === opt && styles.optionTagTextSelected,
                      ]}
                    >
                      {opt === '' ? 'All' : opt === 'true' ? 'Verified' : 'Unverified'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Action Options Modal */}
      <Modal visible={showOptionsModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={styles.optionsMenu}>
            <Text style={styles.menuHeader}>Actions</Text>
            {selectedUser && (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setShowOptionsModal(false);
                    setShowDetailModal(true);
                  }}
                >
                  <Feather name="eye" size={16} color="#475569" style={styles.menuIcon} />
                  <Text style={styles.menuItemText}>View Details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  disabled={selectedUser._id === currentUser?._id}
                  onPress={() => {
                    setShowOptionsModal(false);
                    setNewRole(selectedUser.role);
                    setShowRoleModal(true);
                  }}
                >
                  <Feather name="settings" size={16} color="#475569" style={styles.menuIcon} />
                  <Text style={styles.menuItemText}>Change Role</Text>
                </TouchableOpacity>

                {!selectedUser.isEmailVerified && (
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleVerifyEmail(selectedUser)}
                  >
                    <Feather name="check-circle" size={16} color="#475569" style={styles.menuIcon} />
                    <Text style={styles.menuItemText}>Verify Email</Text>
                  </TouchableOpacity>
                )}

                {selectedUser.status === 'ACTIVE' ? (
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      (selectedUser.role === 'ADMIN' || selectedUser._id === currentUser?._id) &&
                        styles.menuItemDisabled,
                    ]}
                    disabled={selectedUser.role === 'ADMIN' || selectedUser._id === currentUser?._id}
                    onPress={() => {
                      setShowOptionsModal(false);
                      setBlockReason('');
                      setShowBlockModal(true);
                    }}
                  >
                    <Feather name="slash" size={16} color="#EF4444" style={styles.menuIcon} />
                    <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Block User</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleUnblockUser(selectedUser)}
                  >
                    <Feather name="unlock" size={16} color="#10B981" style={styles.menuIcon} />
                    <Text style={[styles.menuItemText, { color: '#10B981' }]}>Unblock User</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

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
                onPress={handleBlockUser}
              >
                <Text style={styles.dialogConfirmText}>Block</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Role Dialog */}
      <Modal visible={showRoleModal} transparent animationType="fade">
        <View style={styles.modalOverlayCenter}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogTitle}>Change User Role</Text>
            <Text style={styles.dialogText}>
              Select new role for {selectedUser?.firstName} {selectedUser?.lastName}:
            </Text>
            <View style={styles.rolePickerBox}>
              {['ALUMNI', 'MEMBER', 'EVENT_LEAD', 'ADMIN'].map((roleOpt) => (
                <TouchableOpacity
                  key={roleOpt}
                  style={[styles.roleOptRow, newRole === roleOpt && styles.roleOptRowSelected]}
                  onPress={() => setNewRole(roleOpt as any)}
                >
                  <Text
                    style={[
                      styles.roleOptText,
                      newRole === roleOpt && styles.roleOptTextSelected,
                    ]}
                  >
                    {roleOpt}
                  </Text>
                  {newRole === roleOpt && (
                    <Feather name="check" size={16} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.dialogBtnRow}>
              <TouchableOpacity
                style={styles.dialogCancelBtn}
                onPress={() => setShowRoleModal(false)}
              >
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogConfirmBtn, newRole === selectedUser?.role && styles.dialogConfirmBtnDisabled]}
                disabled={newRole === selectedUser?.role}
                onPress={handleRoleChange}
              >
                <Text style={styles.dialogConfirmText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* User Details Modal */}
      <Modal visible={showDetailModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.detailSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>User Details</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Feather name="x" size={22} color="#475569" />
              </TouchableOpacity>
            </View>
            {selectedUser && (
              <ScrollView contentContainerStyle={styles.detailScrollContent}>
                <View style={styles.detailHeader}>
                  {selectedUser.profile?.profilePhoto ? (
                    <Image
                      source={{ uri: selectedUser.profile.profilePhoto }}
                      style={styles.detailAvatar}
                    />
                  ) : (
                    <View style={styles.detailAvatarPlaceholder}>
                      <Text style={styles.detailAvatarInitials}>
                        {getAvatarInitials(selectedUser.firstName, selectedUser.lastName)}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.detailName}>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </Text>
                  <Text style={styles.detailEmail}>{selectedUser.email}</Text>
                </View>

                <View style={styles.detailStats}>
                  <View style={styles.detailStatBox}>
                    <Text style={styles.detailStatLabel}>Role</Text>
                    <Text style={styles.detailStatVal}>{selectedUser.role}</Text>
                  </View>
                  <View style={styles.detailStatBox}>
                    <Text style={styles.detailStatLabel}>Status</Text>
                    <Text style={styles.detailStatVal}>{selectedUser.status}</Text>
                  </View>
                </View>

                <View style={styles.detailInfoGroup}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email Verification</Text>
                    <Text
                      style={[
                        styles.detailVal,
                        { color: selectedUser.isEmailVerified ? '#10B981' : '#EF4444' },
                      ]}
                    >
                      {selectedUser.isEmailVerified ? 'Verified' : 'Pending'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Membership Type</Text>
                    <Text style={styles.detailVal}>
                      {selectedUser.isMember ? 'Paid Member' : 'Free Account'}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Joined Date</Text>
                    <Text style={styles.detailVal}>{formatDate(selectedUser.createdAt)}</Text>
                  </View>

                  {selectedUser.profile?.city && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>City</Text>
                      <Text style={styles.detailVal}>{selectedUser.profile.city}</Text>
                    </View>
                  )}

                  {selectedUser.profile?.currentCompany && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Company</Text>
                      <Text style={styles.detailVal}>{selectedUser.profile.currentCompany}</Text>
                    </View>
                  )}

                  {selectedUser.status === 'BLOCKED' && selectedUser.blockedReason && (
                    <View style={[styles.detailRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                      <Text style={[styles.detailLabel, { color: '#EF4444' }]}>Blocking Reason</Text>
                      <Text style={styles.detailReasonText}>{selectedUser.blockedReason}</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
  },
  searchInputWrapper: {
    flex: 1,
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
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 16,
  },
  clearBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  clearBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#1E40AF',
    fontWeight: '800',
    fontSize: 15,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  badgeItem: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  badgeLabel: {
    fontSize: 9,
    fontWeight: '700',
  },
  optionsButton: {
    padding: 4,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  pageBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageIndicator: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  sheetContent: {
    marginTop: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    marginTop: 12,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    marginBottom: 8,
  },
  optionTagSelected: {
    backgroundColor: '#007AFF',
  },
  optionTagText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  optionTagTextSelected: {
    color: '#FFFFFF',
  },
  applyBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  optionsMenu: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  menuHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuItemDisabled: {
    opacity: 0.3,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
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
  rolePickerBox: {
    marginVertical: 12,
  },
  roleOptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  roleOptRowSelected: {
    borderColor: '#3B82F6',
  },
  roleOptText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  roleOptTextSelected: {
    color: '#007AFF',
    fontWeight: '700',
  },
  detailSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  detailScrollContent: {
    paddingBottom: 32,
  },
  detailHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  detailAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E2E8F0',
  },
  detailAvatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailAvatarInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E40AF',
  },
  detailName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
  },
  detailEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  detailStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  detailStatBox: {
    width: '48%',
    alignItems: 'center',
  },
  detailStatLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  detailStatVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
  },
  detailInfoGroup: {
    backgroundColor: '#FFFFFF',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  detailVal: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  detailReasonText: {
    fontSize: 12,
    color: '#EF4444',
    lineHeight: 18,
    marginTop: 4,
  },
});
