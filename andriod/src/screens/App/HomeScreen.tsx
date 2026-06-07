import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logoutUser } from '../../services/authService';
import { fetchProfileCompleteness } from '../../services/profileService';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { APP_CONSTANTS } from '../../constants';

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
  const isFocused = useIsFocused();
  const { user, token } = useAppSelector((state) => state.auth);
  const unreadCount = useAppSelector((state) => state.notification.unreadCount);

  // Fetch profile completeness on mount to ensure backend connection is healthy (only if logged in)
  useEffect(() => {
    if (token) {
      dispatch(fetchProfileCompleteness());
    }
  }, [dispatch, token]);

  const handleReportBug = async () => {
    const email = 'pranaybhandekar8841@gmail.com';
    const subject = encodeURIComponent('NESMO App - Bug Report');
    const body = encodeURIComponent(
      'Hi NESMO Support Team,\n\nI would like to report the following bug:\n\n[Describe the issue here]\n\nDevice Details:\n- App: NESMO Android App\n- User: ' +
      (user?.firstName ? `${user.firstName} ${user.lastName}` : 'Anonymous')
    );
    const url = `mailto:${email}?subject=${subject}&body=${body}`;
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.warn('Failed to open mail client:', error);
    }
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
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.bellButton}
              onPress={() => navigation.navigate(APP_CONSTANTS.SCREENS.NOTIFICATIONS)}
              activeOpacity={0.7}
            >
              <Feather name="bell" size={18} color="#2563EB" />
              {unreadCount > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.bugButton} onPress={handleReportBug}>
              <Feather name="alert-circle" size={18} color="#ff0703ff" />
            </TouchableOpacity>
          </View>
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
        {/* <Testimonial /> */}

        {/* Spotlights */}
        {/* <Spotlight /> */}

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
  bugButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
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
