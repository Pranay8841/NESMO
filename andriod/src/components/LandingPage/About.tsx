import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Feather, FontAwesome5, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { apiConnector } from '../../utils/APIsConnector';
import { ALUMNI_API, EVENTS_API } from '../../utils/api';
import { APP_CONSTANTS } from '../../constants';

const ABOUT_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk9mlifc_Z2mUTedPuqK_1HlkASNMT1AdtbHeOv92RSt-nsH0ExK4qqw6owWjAvUMWccLRlHvj_PtxbzKmkZw_5E3tlEyevZjxmppmna9RYj43qe7U5uOVrYeIWUwDEBfL6Xp2Sa8rM3vC5J5DLeZv2bH8n8BSP1Qe7fKWTOETh0pZz7M6K6zzWkpScOCxiW4ZwLdj0MNJeGnoihEwZBHad_xvK84ElBxVzKNfU6hBvxxWb0QAPTXEHUYDOzPKZgccy7_06u7PQN4V';
const FOUNDED_YEAR = 1987;

export default function About() {
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState({
    members: '10k+',
    events: '10+',
    years: String(new Date().getFullYear() - FOUNDED_YEAR),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch alumni count
        const alumniResponse = await apiConnector(
          'GET',
          ALUMNI_API.GET_ALUMNI_DIRECTORY,
          null,
          null,
          { page: 1, limit: 1 } as any
        );
        const memberCount = alumniResponse?.data?.totalCount || 10000;

        // Fetch events count
        const eventsResponse = await apiConnector('GET', EVENTS_API.GET_EVENTS);
        const eventCount = Array.isArray(eventsResponse?.data)
          ? eventsResponse.data.length
          : 10;

        const formatNumber = (num: number): string => {
          if (num >= 1000) return `${Math.floor(num / 1000)}k+`;
          return `${num}+`;
        };

        setStats({
          members: formatNumber(memberCount),
          events: formatNumber(eventCount),
          years: String(new Date().getFullYear() - FOUNDED_YEAR),
        });
      } catch (error) {
        console.warn('Failed to fetch stats in About:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      title: 'Alumni Directory',
      desc: 'Connect with batchmates and seniors globally through our secure database.',
      icon: 'graduation-cap',
      iconSet: 'FontAwesome5',
      color: '#2563EB',
      screen: APP_CONSTANTS.SCREENS.DIRECTORY,
    },
    {
      title: 'Community Chat',
      desc: 'Connect and chat in real-time with JNV alumni globally.',
      icon: 'message-square',
      iconSet: 'Feather',
      color: '#16A34A',
      screen: APP_CONSTANTS.SCREENS.COMMUNITY,
    },
    {
      title: 'Events',
      desc: 'Annual reunions, regional meets, and skill-building workshops.',
      icon: 'calendar',
      iconSet: 'Feather',
      color: '#2563EB',
      screen: APP_CONSTANTS.SCREENS.EVENTS,
    },
    {
      title: 'Medical Helpline',
      desc: '24/7 emergency support and professional health consultations.',
      icon: 'stethoscope',
      iconSet: 'FontAwesome5',
      color: '#DC2626',
    },
    {
      title: 'Career Guidance',
      desc: 'Mentorship programs, resume reviews, and direct job placements.',
      icon: 'briefcase',
      iconSet: 'Feather',
      color: '#9333EA',
    },
    {
      title: 'Financial Aid',
      desc: 'Scholarships for students and crisis relief funds for alumni.',
      icon: 'heartbeat',
      iconSet: 'FontAwesome',
      color: '#EA580C',
    },
  ];

  const renderIcon = (feature: typeof features[0]) => {
    const size = 18;
    const color = feature.color;

    if (feature.iconSet === 'FontAwesome5') {
      return <FontAwesome5 name={feature.icon as any} size={size} color={color} />;
    }
    if (feature.iconSet === 'FontAwesome') {
      return <FontAwesome name={feature.icon as any} size={size} color={color} />;
    }
    return <Feather name={feature.icon as any} size={size} color={color} />;
  };

  return (
    <View style={styles.container}>
      {/* About NESMO Details Card */}
      <View style={styles.aboutCard}>
        {/* Banner with overlay */}
        <View style={styles.aboutImageContainer}>
          <Image source={{ uri: ABOUT_IMAGE }} style={styles.aboutImage} />
          <View style={styles.aboutOverlay} />
          <View style={styles.aboutTitleContainer}>
            <Text style={styles.aboutLabel}>WHO WE ARE</Text>
            <Text style={styles.aboutHeading}>About NESMO</Text>
          </View>
        </View>

        {/* Story Text */}
        <View style={styles.aboutContent}>
          <Text style={styles.storyText}>
            NESMO (Navodaya Ex-Student Multipurpose Organization) is a lifelong alumni network built to connect, support, and empower Navodayans beyond JNV.
          </Text>
          <Text style={styles.storyText}>
            Rooted in the values of unity, service, and lifelong brotherhood, NESMO brings together students, alumni, professionals, and changemakers to strengthen connections across generations.
          </Text>
          <Text style={styles.storyText}>
            Through mentorship, career support, networking, social initiatives, and community-driven efforts, we create a platform where Navodayans grow together, support one another, and continue the spirit of JNV beyond school life.
          </Text>

          {/* Stats Row */}
          {loading ? (
            <ActivityIndicator size="small" color="#2563EB" style={styles.loader} />
          ) : (
            <View style={styles.statsRow}>
              <View style={styles.statCell}>
                <Text style={styles.statValue}>{stats.members}</Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statValue}>{stats.events}</Text>
                <Text style={styles.statLabel}>Events</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statValue}>{stats.years}</Text>
                <Text style={styles.statLabel}>Years</Text>
              </View>
            </View>
          )}

          {/* Full Story Button
          <TouchableOpacity style={styles.storyButton}>
            <Text style={styles.storyButtonText}>Read Full Story</Text>
            <Feather name="arrow-right" size={14} color="#FFFFFF" style={styles.buttonArrow} />
          </TouchableOpacity> */}
        </View>
      </View>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.yellowBar} />
        <Text style={styles.subtitle}>WHAT WE DO</Text>
      </View>
      <Text style={styles.title}>
        Connects, Supports, and <Text style={styles.highlightText}>Grow</Text>
      </Text>
      <Text style={styles.description}>
        We bring together alumni, students, and professionals to foster mentorship, opportunities, social impact, and a strong support network beyond school life.
      </Text>

      {/* Feature Grid */}
      <View style={styles.grid}>
        {features.map((feature, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.card}
            onPress={() => feature.screen && navigation.navigate(feature.screen)}
            disabled={!feature.screen}
          >
            <View style={[styles.iconBox, { backgroundColor: `${feature.color}15` }]}>
              {renderIcon(feature)}
            </View>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {feature.title}
            </Text>
            <Text style={styles.cardDesc} numberOfLines={3}>
              {feature.desc}
            </Text>
            {feature.screen && (
              <View style={styles.learnMoreRow}>
                <Text style={styles.learnMoreText}>Learn More</Text>
                <Feather name="arrow-right" size={10} color="#2563EB" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  yellowBar: {
    width: 24,
    height: 3,
    backgroundColor: '#EAB308',
    marginRight: 8,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  highlightText: {
    color: '#2563EB',
  },
  description: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 1,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
    marginBottom: 10,
  },
  learnMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  learnMoreText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 32,
  },
  aboutImageContainer: {
    height: 140,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  aboutImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  aboutOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  aboutTitleContainer: {
    position: 'absolute',
    bottom: 12,
    left: 16,
  },
  aboutLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#E2E8F0',
    letterSpacing: 1,
  },
  aboutHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  aboutContent: {
    padding: 16,
  },
  storyText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  loader: {
    marginVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 14,
    marginVertical: 12,
  },
  statCell: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2563EB',
  },
  statLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  storyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  storyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  buttonArrow: {
    marginLeft: 6,
  },
});
