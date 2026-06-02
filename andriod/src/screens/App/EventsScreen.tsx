/**
 * @fileoverview Events Screen
 * Enforces guest restriction and renders guest welcome CTA or events placeholder.
 * 
 * @module screens/App/EventsScreen
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppSelector } from '../../redux/hooks';
import GuestPlaceholder from '../../components/GuestPlaceholder';

export default function EventsScreen() {
  const { token, user } = useAppSelector((state) => state.auth);

  if (!token || !user) {
    return (
      <GuestPlaceholder
        title="NESMO Events"
        description="Stay updated with upcoming chapter meetings, local JNV get-togethers, webinars, and annual reunions."
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Events</Text>
      <Text style={styles.placeholder}>Events listing coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
  },
});
