import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';

export default function Footer() {
  const handleOpenURL = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.warn('Failed to open URL:', url, error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Brand & Description */}
      <View style={styles.brandRow}>
        <Image
          source={require('../../../assets/images/nesmo-logo-transperant.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.brandText}>NESMO</Text>
      </View>
      <Text style={styles.description}>
        Connecting Navodaya alumni for a lifetime of support, growth, and giving back. Together we build a legacy that transcends generations.
      </Text>

      {/* NGO Status */}
      <View style={styles.ngoRow}>
        <Ionicons name="checkmark-circle" size={14} color="#EAB308" style={styles.ngoIcon} />
        <Text style={styles.ngoText}>
          Authorized NGO Reg. No. 12345/GOI
        </Text>
      </View>

      {/* Contact Details (Clickable) */}
      <View style={styles.contactContainer}>
        <Text style={styles.sectionTitle}>Contact Us</Text>

        <TouchableOpacity
          style={styles.contactRow}
          onPress={() => handleOpenURL('tel:+919876543210')}
        >
          <Feather name="phone" size={13} color="#64748B" style={styles.contactIcon} />
          <Text style={styles.contactValue}>+91 98765 43210</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactRow}
          onPress={() => handleOpenURL('mailto:contact@nesmo.org')}
        >
          <Feather name="mail" size={13} color="#64748B" style={styles.contactIcon} />
          <Text style={styles.contactValue}>contact@nesmo.org</Text>
        </TouchableOpacity>

        <View style={styles.contactRow}>
          <Feather name="map-pin" size={13} color="#64748B" style={styles.contactIcon} />
          <Text style={styles.addressText}>
            123 Alumni Road, Connaught Place, New Delhi, India 110001
          </Text>
        </View>
      </View>

      {/* Social Media Row */}
      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialBtn} onPress={() => handleOpenURL('https://twitter.com')}>
          <FontAwesome name="twitter" size={15} color="#475569" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn} onPress={() => handleOpenURL('https://github.com')}>
          <FontAwesome name="github" size={15} color="#475569" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn} onPress={() => handleOpenURL('https://linkedin.com')}>
          <FontAwesome name="linkedin" size={15} color="#475569" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn} onPress={() => handleOpenURL('https://instagram.com')}>
          <FontAwesome name="instagram" size={15} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Copyright */}
      <Text style={styles.copyrightText}>
        © {new Date().getFullYear()} NESMO. All rights reserved.
      </Text>
      <Text style={styles.taglineText}>
        Empowering Alumni Since 1988
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 4,
    marginTop: 14,
    marginBottom: 0,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoImage: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 12,
  },
  ngoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 18,
    alignSelf: 'flex-start',
  },
  ngoIcon: {
    marginRight: 6,
  },
  ngoText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.2,
  },
  contactContainer: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
    paddingRight: 12,
  },
  contactIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  contactValue: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  addressText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  socialBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  copyrightText: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
  },
  taglineText: {
    fontSize: 9,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '600',
  },
});
