/**
 * @fileoverview Alumni Profile Modal
 * Bottom sheet/Modal display for detailed alumni profiles.
 * Includes messaging/calling shortcuts and professional details.
 * 
 * @module components/Directory/AlumniProfileModal
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { Feather, FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import type { AlumniMember } from '../../redux/slices/alumniSlice';

interface AlumniProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: AlumniMember | null;
}

const roleConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  ADMIN: { label: 'Admin', color: '#FFFFFF', bgColor: '#EF4444' },
  EVENT_LEAD: { label: 'Event Lead', color: '#FFFFFF', bgColor: '#8B5CF6' },
  MEMBER: { label: 'Member', color: '#FFFFFF', bgColor: '#3B82F6' },
  ALUMNI: { label: 'Alumni', color: '#4B5563', bgColor: '#F3F4F6' },
};

export default function AlumniProfileModal({ isOpen, onClose, member }: AlumniProfileModalProps) {
  if (!member) return null;

  const isPaidMember = member.role !== 'ALUMNI' || member.isMember;
  const roleInfo = roleConfig[member.role] || roleConfig.ALUMNI;

  const handleWhatsApp = () => {
    if (!member.phone) return;
    // Strip non-numeric characters except for leading plus
    const cleanPhone = member.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}`;
    
    // Bypassing canOpenURL check because on Android 11+ package visibility restrictions
    // cause canOpenURL to return false even when WhatsApp is installed.
    Linking.openURL(url).catch((err) => {
      console.error('An error occurred opening WhatsApp', err);
      Alert.alert('Error', 'Could not open WhatsApp on this device.');
    });
  };

  const handleCall = () => {
    if (!member.phone) return;
    const url = `tel:${member.phone}`;
    Linking.openURL(url).catch((err) => console.error('An error occurred', err));
  };

  const getAvatarInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.sheetContainer}>
          {/* Premium Header Banner (Deep Blue) */}
          <View style={styles.bannerHeader}>
            {/* Close Button - absolute top right */}
            <TouchableOpacity style={styles.closeButtonAbsolute} onPress={onClose}>
              <Feather name="x" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.bannerRow}>
              {/* Profile Picture */}
              <View style={styles.avatarContainer}>
                {member.photo ? (
                  <Image source={{ uri: member.photo }} style={styles.profileImage} />
                ) : (
                  <View
                    style={[
                      styles.profileImagePlaceholder,
                      {
                        backgroundColor: isPaidMember ? '#2563EB' : '#6B7280',
                      },
                    ]}
                  >
                    <Text style={styles.initialsText}>{getAvatarInitials(member.name)}</Text>
                  </View>
                )}
                {isPaidMember && (
                  <View style={styles.verifiedBadge}>
                    <FontAwesome name="check" size={10} color="#FFFFFF" />
                  </View>
                )}
              </View>

              {/* Profile Text Info */}
              <View style={styles.bannerInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.memberName} numberOfLines={1}>{member.name}</Text>
                  {isPaidMember && (
                    <FontAwesome name="check-circle" size={16} color="#F59E0B" style={{ marginLeft: 6 }} />
                  )}
                </View>
                {member.occupation && (
                  <Text style={styles.memberOccupation} numberOfLines={2}>
                    {member.occupation}{member.organization ? ` at ${member.organization}` : ''}
                  </Text>
                )}
                <View style={styles.badgeRow}>
                  <View style={[styles.roleBadge, { backgroundColor: roleInfo.bgColor }]}>
                    <Text style={[styles.roleBadgeText, { color: roleInfo.color }]}>
                      {roleInfo.label}
                    </Text>
                  </View>
                  {member.city && (
                    <View style={styles.locationBadge}>
                      <Feather name="map-pin" size={10} color="#E2E8F0" style={{ marginRight: 4 }} />
                      <Text style={styles.locationBadgeText}>{member.city}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* About Me Section */}
            {member.about && (
              <View style={styles.infoSection}>
                <View style={styles.sectionTitleRow}>
                  <Feather name="user" size={16} color="#2563EB" style={{ marginRight: 8 }} />
                  <Text style={styles.sectionTitle}>About Me</Text>
                </View>
                <Text style={styles.aboutText}>{member.about}</Text>
              </View>
            )}

            {/* Alumni & Education */}
            {(member.joinBatch || member.passoutBatch) && (
              <View style={styles.infoSection}>
                <View style={styles.sectionTitleRow}>
                  <FontAwesome5
                    name="user-graduate"
                    size={16}
                    color="#2563EB"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.sectionTitle}>Alumni & Education</Text>
                </View>
                <View style={styles.educationRow}>
                  <View style={styles.eduIconContainer}>
                    <Ionicons name="school-outline" size={20} color="#475569" />
                  </View>
                  <View style={styles.eduInfo}>
                    <Text style={styles.schoolName}>Jawahar Navodaya Vidyalaya, Gadchiroli</Text>
                    <Text style={styles.batchYears}>
                      Joined: {member.joinBatch || '?'} • Passout: {member.passoutBatch || '?'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Professional Details */}
            {(member.occupation || member.organization || member.sector) && (
              <View style={styles.infoSection}>
                <View style={styles.sectionTitleRow}>
                  <Feather name="briefcase" size={16} color="#2563EB" style={{ marginRight: 8 }} />
                  <Text style={styles.sectionTitle}>Professional Details</Text>
                </View>
                <View style={styles.detailsGrid}>
                  {member.occupation && (
                    <View style={styles.gridItem}>
                      <Text style={styles.gridLabel}>OCCUPATION</Text>
                      <Text style={styles.gridVal}>{member.occupation}</Text>
                    </View>
                  )}
                  {member.organization && (
                    <View style={styles.gridItem}>
                      <Text style={styles.gridLabel}>ORGANIZATION</Text>
                      <Text style={styles.gridVal}>{member.organization}</Text>
                    </View>
                  )}
                  {member.sector && (
                    <View style={styles.gridItem}>
                      <Text style={styles.gridLabel}>SECTOR / INDUSTRY</Text>
                      <Text style={styles.gridVal}>{member.sector}</Text>
                    </View>
                  )}
                  {member.city && (
                    <View style={styles.gridItem}>
                      <Text style={styles.gridLabel}>LOCATION</Text>
                      <Text style={styles.gridVal}>{member.city}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}



            {/* Action buttons */}
            {member.phone && (
              <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.whatsappBtn} onPress={handleWhatsApp}>
                  <FontAwesome name="whatsapp" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.whatsappBtnText}>WhatsApp Message</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
                  <Feather name="phone" size={16} color="#1E293B" style={{ marginRight: 8 }} />
                  <Text style={styles.callBtnText}>Call Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  bannerHeader: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    position: 'relative',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  closeButtonAbsolute: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  bannerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  avatarContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
  },
  profileImagePlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#10B981',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    flexShrink: 1,
  },
  memberOccupation: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DBEAFE',
    marginBottom: 8,
    lineHeight: 18,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 8,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  locationBadgeText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  aboutText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  educationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  eduIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eduInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  batchYears: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  gridItem: {
    width: '48%',
    marginBottom: 12,
  },
  gridLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
  },
  gridVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },

  buttonsContainer: {
    marginTop: 10,
  },
  whatsappBtn: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  whatsappBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  callBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callBtnText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '700',
  },
});
