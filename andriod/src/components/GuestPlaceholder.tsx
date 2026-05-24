import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface GuestPlaceholderProps {
  title: string;
  description: string;
}

export default function GuestPlaceholder({ title, description }: GuestPlaceholderProps) {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* Shield Icon Card */}
        <View style={styles.iconCard}>
          <Feather name="shield" size={36} color="#2563EB" />
        </View>

        {/* Text Details */}
        <Text style={styles.heading}>Sign In Required</Text>
        <Text style={styles.subheading}>
          Access to the {title} is restricted to JNV alumni network members.
        </Text>
        <Text style={styles.description}>
          {description} Please sign in or register below to unlock access.
        </Text>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => navigation.navigate('AuthStack')}
        >
          <Feather name="log-in" size={16} color="#FFFFFF" style={styles.btnIcon} />
          <Text style={styles.signInText}>Sign In / Register</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCard: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  heading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B82F6',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 10,
  },
  description: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  btnIcon: {
    marginRight: 8,
  },
  signInText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
