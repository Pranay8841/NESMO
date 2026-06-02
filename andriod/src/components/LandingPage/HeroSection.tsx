import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { apiConnector } from '../../utils/APIsConnector';
import { ALUMNI_API } from '../../utils/api';
import { APP_CONSTANTS } from '../../constants';

interface RecentMember {
  id: string;
  name: string;
  photo?: string;
}

export default function HeroSection() {
  const navigation = useNavigation<any>();
  const [recentMembers, setRecentMembers] = useState<RecentMember[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loading, setLoading] = useState(true);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.05,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const VerticalBlueGlow = () => (
    <View style={styles.glowContainer}>
      <View style={[styles.glowLine, { opacity: 0.05, height: 6 }]} />
      <View style={[styles.glowLine, { opacity: 0.12, height: 6 }]} />
      <View style={[styles.glowLine, { opacity: 0.22, height: 8 }]} />
      <View style={[styles.glowLine, { opacity: 0.35, height: 10 }]} />
      <View style={[styles.glowLine, { opacity: 0.55, height: 16 }]} />
    </View>
  );

  useEffect(() => {
    const fetchRecentMembers = async () => {
      try {
        const response = await apiConnector(
          'GET',
          ALUMNI_API.GET_ALUMNI_DIRECTORY,
          null,
          null,
          { page: 1, limit: 10 } as any
        );

        if (response.data?.success) {
          setRecentMembers(response.data.data || []);
          setTotalMembers(response.data.totalCount || 0);
        }
      } catch (error) {
        console.warn('Failed to fetch recent members in HeroSection:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentMembers();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map((p) => p.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const formatCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k+`;
    return count.toString();
  };

  return (
    <View style={styles.container}>
      {/* Badge Tagline */}
      <View style={styles.taglineBadgeContainer}>
        <View style={styles.taglineBadge}>
          <Text style={styles.taglineText}>Official Alumni Network</Text>
        </View>
      </View>

      {/* Main Headline */}
      <Text style={styles.headline}>
        Where Navodayans{'\n'}
        <Text style={styles.highlightText}>Stay Connected</Text>{'\n'}
        For Life
      </Text>

      {/* Description */}
      <Text style={styles.description}>
        From mentorship and career opportunities to social initiatives and alumni support, NESMO empowers Navodayans to stay connected, strengthen lifelong bonds, and grow together beyond JNV.
      </Text>

      {/* Tag Badges */}
      <View style={styles.badgesRow}>
        <View style={[styles.tagBadge, { backgroundColor: '#DBEAFE' }]}>
          <Text style={[styles.badgeText, { color: '#1E40AF' }]}>Connect</Text>
        </View>
        <View style={[styles.tagBadge, { backgroundColor: '#D1FAE5' }]}>
          <Text style={[styles.badgeText, { color: '#065F46' }]}>Support</Text>
        </View>
        <View style={[styles.tagBadge, { backgroundColor: '#FEE2E2' }]}>
          <Text style={[styles.badgeText, { color: '#991B1B' }]}>Grow</Text>
        </View>
        <View style={[styles.tagBadge, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.badgeText, { color: '#92400E' }]}>Give Back</Text>
        </View>
      </View>

      {/* Call to Actions */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => navigation.navigate(APP_CONSTANTS.SCREENS.COMMUNITY)}
        >
          <Feather name="message-square" size={16} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.joinButtonText}>Community Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate(APP_CONSTANTS.SCREENS.DIRECTORY)}
        >
          <Feather name="search" size={16} color="#2563EB" style={styles.buttonIcon} />
          <Text style={styles.exploreButtonText}>Explore Directory</Text>
        </TouchableOpacity>
      </View>

      {/* Image Banner with Hover Scale Simulation and Glow */}
      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.bannerContainer}>
          <Animated.Image
            source={require('../../../assets/images/Banner.jpeg')}
            style={[
              styles.bannerImage,
              { transform: [{ scale: scaleAnim }] }
            ]}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
          {/* Bottom Blue Glow */}
          <VerticalBlueGlow />
        </View>
      </TouchableWithoutFeedback>

      {/* Recent Joiners */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={styles.loadingText}>Loading recent members...</Text>
        </View>
      ) : (
        <View style={styles.joinersSection}>
          <View style={styles.avatarOverlapContainer}>
            {recentMembers.slice(0, 4).map((member, index) => (
              <View
                key={member.id || index}
                style={[
                  styles.avatarWrapper,
                  { marginLeft: index === 0 ? 0 : -12 },
                ]}
              >
                {member.photo ? (
                  <Image source={{ uri: member.photo }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>
                      {getInitials(member.name)}
                    </Text>
                  </View>
                )}
              </View>
            ))}
            {totalMembers > 4 && (
              <View style={[styles.avatarWrapper, styles.avatarCountBadge, { marginLeft: -12 }]}>
                <Text style={styles.countBadgeText}>
                  +{formatCount(totalMembers - 4)}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.joinersText}>
            {formatCount(totalMembers)} members joined
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(238, 242, 255, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  taglineBadgeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  taglineBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  taglineText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  headline: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 34,
    marginBottom: 12,
  },
  highlightText: {
    color: '#2563EB',
  },
  description: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 24,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F97316',
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 14,
  },
  buttonIcon: {
    marginRight: 6,
  },
  bannerContainer: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#0F172A',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
  },
  glowContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'column',
  },
  glowLine: {
    backgroundColor: '#3B82F6',
    width: '100%',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 8,
  },
  joinersSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarOverlapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 1,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  avatarCountBadge: {
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#475569',
  },
  joinersText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
});
