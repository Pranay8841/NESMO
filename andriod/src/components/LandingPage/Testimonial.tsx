import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const TESTIMONIAL_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTFHag87rEOde_g06PnTlfiInVFBGw0f1WWHPHZHxiHGqI_HOfaX9-joVftMLWsZNO9xIwiBBIlDW1ycJtm49p4-cymxAuEmHpGGj9tRjnRnX4b-rF5V7_dvc1Z6KxOyWYjRTxvgS2uzqM83AI0WkkYkZMMkLXZeDrma0cgq9So6EhlwBQ0KzYyg7ivMN9qZXpUsbsGi6KMr2pRRzSke1XS1KZXdl3_Z_6ufNMqedoPfgn07BmMNCZUCBrXAaLPaSMVFurOtDTFLK3';
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

export default function Testimonial() {
  const testimonials = [
    {
      quote: "NESMO provided me with the mentorship I desperately needed during my early career. The network is incredibly supportive and truly feels like an extended family.",
      name: "Priya Sharma",
      batch: "JNV Pune, 2012",
      position: "Senior Analyst, Deloitte",
      avatar: TESTIMONIAL_IMAGE,
    },
    {
      quote: "The medical helpline was a lifesaver for my parents during the pandemic. Knowing that the alumni community stood behind us gave me immense strength.",
      name: "Rajesh Kumar",
      batch: "JNV Patna, 2008",
      position: "Civil Servant, IAS",
      avatar: TESTIMONIAL_IMAGE,
    },
    {
      quote: "Giving back to the school that made me who I am is a privilege. NESMO's scholarship program ensures that no talented student is left behind due to finances.",
      name: "Anita Desai",
      batch: "JNV Shimla, 2006",
      position: "Founder, EdTech Global",
      avatar: TESTIMONIAL_IMAGE,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.yellowBar} />
        <Text style={styles.subtitle}>TESTIMONIALS</Text>
      </View>
      <Text style={styles.title}>
        Voices of Our <Text style={styles.highlightText}>Alumni</Text>
      </Text>

      {/* Horizontal Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
      >
        {testimonials.map((item, idx) => (
          <View key={idx} style={styles.card}>
            {/* Quote Icon */}
            <View style={styles.quoteIconBox}>
              <FontAwesome name="quote-left" size={16} color="#3B82F6" />
            </View>

            {/* Testimonial Text */}
            <Text style={styles.quoteText}>
              "{item.quote}"
            </Text>

            {/* Author Footer */}
            <View style={styles.footerRow}>
              <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>{item.name}</Text>
                <Text style={styles.authorBatch}>{item.batch}</Text>
                <Text style={styles.authorRole}>{item.position}</Text>
              </View>
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
    marginBottom: 16,
  },
  highlightText: {
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
    padding: 18,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 2,
  },
  quoteIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingTop: 14,
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E2E8F0',
    marginRight: 10,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  authorBatch: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 1,
  },
  authorRole: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
});
