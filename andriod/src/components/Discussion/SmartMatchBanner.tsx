/**
 * @fileoverview SmartMatchBanner Component
 * A system-generated card that appears inside the community feed when the backend
 * detects that alumni in the network match the topic + location of a message.
 *
 * Example: "👨‍⚕️ 3 doctors from Nagpur in your network may be able to help!"
 *
 * @module components/Discussion/SmartMatchBanner
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import type { MatchedAlumni } from '../../redux/slices/communitySlice';

interface SmartMatchBannerProps {
  text: string;
  matchedAlumni: MatchedAlumni[];
}

function AlumniCard({ alumni }: { alumni: MatchedAlumni }) {
  const initials = alumni.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const colors = ['#2563EB', '#7C3AED', '#059669', '#DC2626', '#D97706'];
  const bgColor = colors[alumni.name.charCodeAt(0) % colors.length];

  return (
    <View style={styles.alumniCard}>
      {alumni.profilePhoto ? (
        <Image
          source={{ uri: alumni.profilePhoto }}
          style={styles.alumniAvatar}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.alumniAvatar, styles.alumniAvatarFallback, { backgroundColor: bgColor }]}>
          <Text style={styles.alumniInitials}>{initials}</Text>
        </View>
      )}
      <View style={styles.alumniInfo}>
        <Text style={styles.alumniName}>{alumni.name}</Text>
        {alumni.batch ? (
          <Text style={styles.alumniBatch}>'{alumni.batch.slice(-2)} batch</Text>
        ) : null}
        <Text style={styles.alumniOccupation} numberOfLines={1}>
          {alumni.occupation}
          {alumni.location ? ` · ${alumni.location}` : ''}
        </Text>
      </View>
    </View>
  );
}

export default function SmartMatchBanner({ text, matchedAlumni }: SmartMatchBannerProps) {
  const [sheetVisible, setSheetVisible] = useState(false);

  const sectorIcon = (() => {
    const lower = text.toLowerCase();
    if (lower.includes('doctor') || lower.includes('health') || lower.includes('medical')) return '👨‍⚕️';
    if (lower.includes('engineer') || lower.includes('tech')) return '👨‍💻';
    if (lower.includes('teacher') || lower.includes('professor')) return '👨‍🏫';
    if (lower.includes('lawyer')) return '⚖️';
    return '🤝';
  })();

  return (
    <>
      <TouchableOpacity
        style={styles.banner}
        onPress={() => matchedAlumni.length > 0 && setSheetVisible(true)}
        activeOpacity={0.85}
      >
        <View style={styles.bannerIconWrapper}>
          <Text style={styles.bannerEmoji}>{sectorIcon}</Text>
        </View>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerText}>{text}</Text>
          {matchedAlumni.length > 0 && (
            <Text style={styles.bannerTap}>Tap to see them →</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={16} color="#2563EB" />
      </TouchableOpacity>

      {/* Bottom sheet showing matched alumni */}
      <Modal
        visible={sheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSheetVisible(false)}>
          <View style={styles.sheetOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                {/* Handle bar */}
                <View style={styles.sheetHandle} />

                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>
                    {sectorIcon} Members who can help
                  </Text>
                  <TouchableOpacity onPress={() => setSheetVisible(false)}>
                    <Feather name="x" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.sheetSubtitle}>
                  These NESMO members match your query. Reach out to them in the community!
                </Text>

                <FlatList
                  data={matchedAlumni}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <AlumniCard alumni={item} />}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 12,
    gap: 10,
  },
  bannerIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerEmoji: {
    fontSize: 18,
  },
  bannerContent: {
    flex: 1,
  },
  bannerText: {
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '500',
    lineHeight: 18,
  },
  bannerTap: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 2,
    fontWeight: '600',
  },
  // Bottom sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 16,
    maxHeight: '70%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  sheetSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 14,
    lineHeight: 18,
  },
  alumniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  alumniAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
  },
  alumniAvatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  alumniInitials: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  alumniInfo: {
    flex: 1,
  },
  alumniName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  alumniBatch: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
  },
  alumniOccupation: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
});
