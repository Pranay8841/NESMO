/**
 * @fileoverview Events Screen
 * Events listing and registration
 * 
 * @module screens/App/EventsScreen
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Events Screen Component
 * 
 * @component
 * @returns {JSX.Element} Events screen
 */
export default function EventsScreen() {
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
