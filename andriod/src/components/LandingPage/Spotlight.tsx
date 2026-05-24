import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const SPOTLIGHT_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnGHYESDMJmE7VDrfuXLSTQVy6FCXQj8wAuCCzXnT9v1KK4A5ex6JEINLn5fad7ZDXDZTgP-BjlIhrLeTK9pF42MaSZdOExn9eXr4TLkL6-jytWLiup_KIVBpCDyPtzKkjmiJFObBAxMjRKqgxefrPl117-GiA18UJqE9lRjtP6cR1DbHZgEzQ-J0VjxjXRv-JB8nrx14n8_XUrG_Y6rtZPhsOdRDlVGWoOucGbYmgAZpn0UZ-4z7p4GEEUMe5x7Bok7YWZjOtCLFe';
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72;

export default function Spotlight() {
  const alumni = [
    {
      name: "Vikram Singh",
      position: "Pvt. TechStream",
      location: "JNV JAIPUR, 2010",
      description: "Vikram has pioneered AI solutions in renewable energy, securing 3 patents and leading a team of 50+ engineers.",
      image: SPOTLIGHT_IMAGE,
    },
    {
      name: "Dr. Meera Reddy",
      position: "Cardiothoracic Surgeon",
      location: "JNV HYDERABAD, 2006",
      description: "A celebrated surgeon known for her volunteer work in rural India, organizing over 50 free health camps.",
      image: SPOTLIGHT_IMAGE,
    },
    {
      name: "Arjun Mehta",
      position: "Entrepreneur",
      location: "JNV BHOPAL, 2011",
      description: "Founder of 'GreenEarth', a startup focusing on sustainable packaging solutions adopted by major FMCG brands.",
      image: SPOTLIGHT_IMAGE,
    },
    {
      name: "Sneha Gupta",
      position: "Author & Poet",
      location: "JNV LUCKNOW, 2009",
      description: "Award-winning author of 'The Village Road', her literary works have been translated into 10 languages.",
      image: SPOTLIGHT_IMAGE,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <View style={styles.header}>
            <View style={styles.yellowBar} />
            <Text style={styles.subtitle}>SPOTLIGHTS</Text>
          </View>
          <Text style={styles.title}>
            Featured <Text style={styles.highlightText}>Alumni</Text>
          </Text>
        </View>

        <TouchableOpacity style={styles.viewAllBtn}>
          <Text style={styles.viewAllText}>View All</Text>
          <Feather name="arrow-right" size={12} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Horizontal Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
      >
        {alumni.map((person, idx) => (
          <View key={idx} style={styles.card}>
            {/* Image Header with Warm Tint Overlay */}
            <View style={styles.imageHeader}>
              <Image source={{ uri: person.image }} style={styles.cardImage} />
              <View style={styles.imageOverlay} />
              <View style={styles.nameOverlay}>
                <Text style={styles.cardName}>{person.name}</Text>
                <Text style={styles.cardRole}>{person.position}</Text>
              </View>
            </View>

            {/* Card Info */}
            <View style={styles.cardBody}>
              <Text style={styles.cardLocation}>{person.location}</Text>
              <Text style={styles.cardDesc} numberOfLines={3}>
                {person.description}
              </Text>
              <TouchableOpacity style={styles.profileBtn}>
                <Text style={styles.profileBtnText}>View Full Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
    paddingRight: 4,
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
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  highlightText: {
    color: '#2563EB',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 4,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  carouselContainer: {
    paddingLeft: 4,
    paddingRight: 20,
    paddingBottom: 8,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 2,
  },
  imageHeader: {
    height: 120,
    position: 'relative',
    backgroundColor: '#FEF3C7',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(245, 158, 11, 0.15)', // warm amber tint
  },
  nameOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardRole: {
    fontSize: 10,
    fontWeight: '600',
    color: '#E2E8F0',
    marginTop: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardBody: {
    padding: 14,
  },
  cardLocation: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 14,
  },
  profileBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2563EB',
    paddingVertical: 8,
    borderRadius: 8,
  },
  profileBtnText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 11,
  },
});
