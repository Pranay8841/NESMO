/**
 * @fileoverview Home Screen (Main Feed)
 * Displays the main marketing feed (HeroSection, About, Testimonial, Spotlight)
 * for all authenticated users.
 * 
 * @module screens/App/HomeScreen
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logoutUser } from '../../services/authService';
import { fetchProfileCompleteness } from '../../services/profileService';
import { useNavigation } from '@react-navigation/native';

// Import LandingPage components
import HeroSection from '../../components/LandingPage/HeroSection';
import About from '../../components/LandingPage/About';
import Testimonial from '../../components/LandingPage/Testimonial';
import Spotlight from '../../components/LandingPage/Spotlight';
import Newsletter from '../../components/LandingPage/Newsletter';
import Footer from '../../components/LandingPage/Footer';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { user, token } = useAppSelector((state) => state.auth);

  // Fetch profile completeness on mount to ensure backend connection is healthy (only if logged in)
  useEffect(() => {
    if (token) {
      dispatch(fetchProfileCompleteness());
    }
  }, [dispatch, token]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/nesmo-logo-transperant.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>NESMO</Text>
        </View>
        {token && user ? (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={16} color="#FF3B30" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('AuthStack')}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <HeroSection />

        {/* About Section */}
        <About />

        {/* Testimonials */}
        <Testimonial />

        {/* Spotlights */}
        <Spotlight />

        {/* Newsletter Subscription */}
        <Newsletter />

        {/* Brand & Contact Footer */}
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 28,
    height: 28,
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2563EB',
    letterSpacing: 0.8,
  },
  logoutButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FFEAEA',
  },
  loginButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  loginButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 16,
  },
});
