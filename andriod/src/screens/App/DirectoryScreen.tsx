/**
 * @fileoverview Alumni Directory Screen
 * Renders a list of alumni with filtering options, search capability, and detailed profile modal.
 * 
 * @module screens/App/DirectoryScreen
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import {
  setFilters,
  applyFilters,
  clearFilters,
  removeFilter,
  setSearchQuery,
  setPage,
} from '../../redux/slices/alumniSlice';
import type { AlumniMember, AlumniFilters } from '../../redux/slices/alumniSlice';
import { fetchAlumniDirectory } from '../../services/alumniService';
import AlumniProfileModal from '../../components/Directory/AlumniProfileModal';
import { Feather, Ionicons, FontAwesome } from '@expo/vector-icons';
import GuestPlaceholder from '../../components/GuestPlaceholder';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const JOIN_BATCH_OPTIONS = Array.from({ length: 41 }, (_, i) => `${1986 + i}`);
const PASSOUT_BATCH_OPTIONS = Array.from({ length: 41 }, (_, i) => `${1993 + i}`);
const LIMIT = 12;

const roleConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
  ADMIN: { label: 'Admin', bgColor: '#EF4444', textColor: '#FFFFFF' },
  BATCH_REP: { label: 'Batch Rep', bgColor: '#8B5CF6', textColor: '#FFFFFF' },
  MEMBER: { label: 'Member', bgColor: '#3B82F6', textColor: '#FFFFFF' },
};

export default function DirectoryScreen() {
  const dispatch = useAppDispatch();
  const [selectedMember, setSelectedMember] = useState<AlumniMember | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Dropdown Picker state
  const [pickerType, setPickerType] = useState<'joinBatch' | 'passoutBatch' | null>(null);

  const flatListRef = useRef<FlatList<AlumniMember>>(null);

  const {
    alumni,
    loading,
    page,
    totalCount,
    filters,
    appliedFilters,
    searchQuery,
  } = useAppSelector((state) => state.alumni);
  const { token, user } = useAppSelector((state) => state.auth);

  // Load directory on page/filters/search change
  const loadDirectory = useCallback(() => {
    // Only fetch if authenticated to prevent API errors
    if (token && user) {
      dispatch(
        fetchAlumniDirectory({
          page,
          limit: LIMIT,
          filters: appliedFilters,
          search: searchQuery,
        })
      );
    }
  }, [dispatch, page, appliedFilters, searchQuery, token, user]);

  useEffect(() => {
    loadDirectory();
  }, [loadDirectory]);

  // Scroll to top on page changes
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [page]);

  // If guest (not logged in), show Sign In CTA placeholder
  if (!token || !user) {
    return (
      <GuestPlaceholder
        title="Alumni Directory"
        description="Search, discover, and connect with fellow Navodayans globally by batch, JNV branch, blood group, and profession."
      />
    );
  }

  const handleApplyFilters = () => {
    dispatch(applyFilters());
    setShowFilterModal(false);
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setShowFilterModal(false);
  };

  const handleRemoveFilter = (key: keyof AlumniFilters) => {
    dispatch(removeFilter(key));
  };

  const handleBloodGroupSelect = (bg: string) => {
    dispatch(
      setFilters({
        bloodGroup: filters.bloodGroup === bg ? '' : bg,
      })
    );
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleViewProfile = (member: AlumniMember) => {
    setSelectedMember(member);
    setIsProfileModalOpen(true);
  };

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;
  const totalPages = Math.ceil(totalCount / LIMIT) || 1;

  const getAvatarInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Directory Title & Stats Header */}
      <View style={styles.directoryHeader}>
        <Text style={styles.directoryTitle}>Directory</Text>
        <Text style={styles.directorySubtitle}>
          Search and connect with fellow Navodayans globally.
        </Text>
      </View>

      {/* Search Header */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchInputWrapper}>
          <Feather name="search" size={16} color="#64748B" style={styles.searchIcon} />
          <TextInput
            placeholder="Search by name, city..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={(txt) => dispatch(setSearchQuery(txt))}
            placeholderTextColor="#94A3B8"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => dispatch(setSearchQuery(''))}>
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

      {/* Applied Filter Chips */}
      {activeFilterCount > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsContainer}
          contentContainerStyle={styles.chipsContent}
        >
          {appliedFilters.joinBatch && (
            <View style={styles.chip}>
              <Text style={styles.chipText} numberOfLines={1}>Joined {appliedFilters.joinBatch}</Text>
              <TouchableOpacity onPress={() => handleRemoveFilter('joinBatch')} style={styles.chipClose}>
                <Feather name="x" size={10} color="#2563EB" />
              </TouchableOpacity>
            </View>
          )}
          {appliedFilters.passoutBatch && (
            <View style={styles.chip}>
              <Text style={styles.chipText} numberOfLines={1}>Passout {appliedFilters.passoutBatch}</Text>
              <TouchableOpacity onPress={() => handleRemoveFilter('passoutBatch')} style={styles.chipClose}>
                <Feather name="x" size={10} color="#2563EB" />
              </TouchableOpacity>
            </View>
          )}
          {appliedFilters.city && (
            <View style={styles.chip}>
              <Text style={styles.chipText} numberOfLines={1}>{appliedFilters.city}</Text>
              <TouchableOpacity onPress={() => handleRemoveFilter('city')} style={styles.chipClose}>
                <Feather name="x" size={10} color="#2563EB" />
              </TouchableOpacity>
            </View>
          )}
          {appliedFilters.organization && (
            <View style={styles.chip}>
              <Text style={styles.chipText} numberOfLines={1}>{appliedFilters.organization}</Text>
              <TouchableOpacity onPress={() => handleRemoveFilter('organization')} style={styles.chipClose}>
                <Feather name="x" size={10} color="#2563EB" />
              </TouchableOpacity>
            </View>
          )}
          {appliedFilters.bloodGroup && (
            <View style={[styles.chip, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
              <Text style={[styles.chipText, { color: '#EF4444' }]} numberOfLines={1}>Blood: {appliedFilters.bloodGroup}</Text>
              <TouchableOpacity onPress={() => handleRemoveFilter('bloodGroup')} style={styles.chipClose}>
                <Feather name="x" size={10} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Stats Count Label */}
      {!loading && totalCount > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Found {totalCount} Navodaya Ex-Students
          </Text>
        </View>
      )}

      {/* Grid of Alumni */}
      {loading && alumni.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : alumni.length === 0 ? (
        <View style={styles.centerContainer}>
          <Feather name="search" size={40} color="#94A3B8" />
          <Text style={styles.emptyText}>No alumni found</Text>
          <Text style={styles.emptySubtext}>Try adjusting search or filters</Text>
          {activeFilterCount > 0 && (
            <TouchableOpacity style={styles.resetBtn} onPress={handleClearFilters}>
              <Text style={styles.resetBtnText}>Clear All Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={alumni}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          refreshing={loading && alumni.length > 0}
          onRefresh={loadDirectory}
          renderItem={({ item }) => {
            const isPaid = item.role === 'ADMIN' || item.role === 'BATCH_REP' || item.isMember;
            const rInfo = roleConfig[item.role] || roleConfig.MEMBER;

            return (
              <TouchableOpacity style={styles.card} onPress={() => handleViewProfile(item)}>
                {/* Role Tag */}
                <View style={[styles.roleTag, { backgroundColor: rInfo.bgColor }]}>
                  <Text style={[styles.roleTagText, { color: rInfo.textColor }]}>
                    {(item.role === 'ADMIN' || item.role === 'BATCH_REP') && '✓ '}{rInfo.label}
                  </Text>
                </View>

                {/* Avatar */}
                <View style={styles.cardAvatarWrapper}>
                  {item.photo ? (
                    <Image
                      source={{ uri: item.photo }}
                      style={[styles.cardAvatar, isPaid && styles.cardAvatarPaid]}
                    />
                  ) : (
                    <View
                      style={[
                        styles.cardAvatarPlaceholder,
                        isPaid ? styles.cardAvatarPaid : { backgroundColor: '#94A3B8' },
                      ]}
                    >
                      <Text style={styles.cardInitials}>{getAvatarInitials(item.name)}</Text>
                    </View>
                  )}
                </View>

                {/* Info */}
                <Text style={styles.cardName} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.occupation ? (
                  <Text style={styles.cardOccupation} numberOfLines={1}>
                    {item.occupation}
                  </Text>
                ) : (
                  <View style={{ height: 16 }} />
                )}

                {/* Batch and Blood */}
                <View style={styles.cardMeta}>
                  {(item.joinBatch || item.passoutBatch) && (
                    <Text style={styles.cardBatch}>
                      {item.joinBatch || '?'}-{item.passoutBatch || '?'}
                    </Text>
                  )}
                  {item.bloodGroup && (
                    <View style={styles.bloodTag}>
                      <Text style={styles.bloodTagText}>🩸 {item.bloodGroup}</Text>
                    </View>
                  )}
                </View>

                {/* Location */}
                {item.city && (
                  <View style={styles.cardLocation}>
                    <Feather name="map-pin" size={10} color="#64748B" style={{ marginRight: 4 }} />
                    <Text style={styles.cardLocationText} numberOfLines={1}>
                      {item.city}
                    </Text>
                  </View>
                )}

                {/* View Profile Button */}
                <TouchableOpacity style={styles.viewBtn} onPress={() => handleViewProfile(item)}>
                  <Text style={styles.viewBtnText}>View Profile</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={() =>
            totalPages > 1 ? (
              <View style={styles.paginationRow}>
                <TouchableOpacity
                  style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                  onPress={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  <Feather name="chevron-left" size={18} color="#2563EB" />
                </TouchableOpacity>
                <Text style={styles.pageIndicator}>
                  Page {page} of {totalPages}
                </Text>
                <TouchableOpacity
                  style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
                  onPress={() => handlePageChange(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  <Feather name="chevron-right" size={18} color="#2563EB" />
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
              <Text style={styles.sheetTitle}>Filter Directory</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Feather name="x" size={22} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetScrollContent}>
              {/* Join Batch Dropdown Trigger */}
              <Text style={styles.sheetFieldLabel}>Join Batch</Text>
              <TouchableOpacity
                style={styles.sheetPicker}
                onPress={() => setPickerType('joinBatch')}
              >
                <Text style={styles.sheetPickerText}>
                  {filters.joinBatch || 'Select Join Year'}
                </Text>
                <Feather name="chevron-down" size={16} color="#64748B" />
              </TouchableOpacity>

              {/* Passout Batch Dropdown Trigger */}
              <Text style={styles.sheetFieldLabel}>Passout Batch</Text>
              <TouchableOpacity
                style={styles.sheetPicker}
                onPress={() => setPickerType('passoutBatch')}
              >
                <Text style={styles.sheetPickerText}>
                  {filters.passoutBatch || 'Select Passout Year'}
                </Text>
                <Feather name="chevron-down" size={16} color="#64748B" />
              </TouchableOpacity>

              {/* City Input */}
              <Text style={styles.sheetFieldLabel}>City</Text>
              <TextInput
                placeholder="e.g. Bangalore"
                placeholderTextColor="#94A3B8"
                style={styles.sheetInput}
                value={filters.city}
                onChangeText={(val) => dispatch(setFilters({ city: val }))}
              />

              {/* Organization/College Input */}
              <Text style={styles.sheetFieldLabel}>Organization / College</Text>
              <TextInput
                placeholder="e.g. Google, AIIMS, IIT..."
                placeholderTextColor="#94A3B8"
                style={styles.sheetInput}
                value={filters.organization}
                onChangeText={(val) => dispatch(setFilters({ organization: val }))}
              />

              {/* Blood Group Grid */}
              <Text style={styles.sheetFieldLabel}>Blood Group</Text>
              <View style={styles.bloodGrid}>
                {BLOOD_GROUPS.map((bg) => (
                  <TouchableOpacity
                    key={bg}
                    style={[
                      styles.bloodGroupBtn,
                      filters.bloodGroup === bg && styles.bloodGroupBtnSelected,
                    ]}
                    onPress={() => handleBloodGroupSelect(bg)}
                  >
                    <Text
                      style={[
                        styles.bloodGroupText,
                        filters.bloodGroup === bg && styles.bloodGroupTextSelected,
                      ]}
                    >
                      {bg}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Actions */}
              <View style={styles.sheetActionRow}>
                <TouchableOpacity style={styles.sheetResetBtn} onPress={handleClearFilters}>
                  <Text style={styles.sheetResetText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sheetApplyBtn} onPress={handleApplyFilters}>
                  <Text style={styles.sheetApplyText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Custom Picker Modal */}
      <Modal visible={pickerType !== null} transparent animationType="fade">
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setPickerType(null)}
        >
          <View style={styles.pickerBox}>
            <Text style={styles.pickerTitle}>
              Select {pickerType === 'joinBatch' ? 'Join Batch' : 'Passout Batch'}
            </Text>
            <ScrollView style={styles.pickerScroll}>
              <TouchableOpacity
                style={styles.pickerOption}
                onPress={() => {
                  dispatch(setFilters({ [pickerType as string]: '' }));
                  setPickerType(null);
                }}
              >
                <Text style={styles.pickerOptionText}>All Years</Text>
              </TouchableOpacity>
              {(pickerType === 'joinBatch' ? JOIN_BATCH_OPTIONS : PASSOUT_BATCH_OPTIONS).map(
                (yr) => (
                  <TouchableOpacity
                    key={yr}
                    style={styles.pickerOption}
                    onPress={() => {
                      dispatch(setFilters({ [pickerType as string]: yr }));
                      setPickerType(null);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{yr}</Text>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Profile Detail Sheet */}
      <AlumniProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  directoryHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  directoryTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
  },
  directorySubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '400',
    lineHeight: 20,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  statsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
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
  chipsContainer: {
    maxHeight: 46,
    marginBottom: 8,
  },
  chipsContent: {
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 32,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  chipClose: {
    marginLeft: 6,
  },
  centerContainer: {
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
  resetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  gridContainer: {
    padding: 12,
  },
  card: {
    width: '46%',
    margin: '2%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 2,
  },
  roleTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomLeftRadius: 6,
    borderTopRightRadius: 10,
  },
  roleTagText: {
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardAvatarWrapper: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 10,
  },
  cardAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2E8F0',
  },
  cardAvatarPaid: {
    borderWidth: 2,
    borderColor: '#60A5FA',
  },
  cardAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInitials: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 2,
  },
  cardOccupation: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 6,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardBatch: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  bloodTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginLeft: 6,
  },
  bloodTagText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#EF4444',
  },
  cardLocation: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLocationText: {
    fontSize: 10,
    color: '#64748B',
    maxWidth: 90,
  },
  viewBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  viewBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
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
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '75%',
    paddingTop: 16,
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
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetScroll: {
    flex: 1,
  },
  sheetScrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  sheetFieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 12,
  },
  sheetPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  sheetPickerText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  sheetInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: '#334155',
  },
  bloodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  bloodGroupBtn: {
    width: '22%',
    margin: '1.5%',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  bloodGroupBtnSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  bloodGroupText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  bloodGroupTextSelected: {
    color: '#FFFFFF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  sheetActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  sheetResetBtn: {
    width: '45%',
    height: 42,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetResetText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  sheetApplyBtn: {
    width: '48%',
    height: 42,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetApplyText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
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
