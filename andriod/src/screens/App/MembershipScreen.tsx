/**
 * @fileoverview Membership Screen
 * Enforces guest restriction and renders guest welcome CTA or membership placeholder.
 * 
 * @module screens/App/MembershipScreen
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppSelector } from '../../redux/hooks';
import GuestPlaceholder from '../../components/GuestPlaceholder';

export default function MembershipScreen() {
  const { token, user } = useAppSelector((state) => state.auth);

  if (!token || !user) {
    return (
      <GuestPlaceholder
        title="Membership Portal"
        description="Verify your membership, unlock special alumni privileges, pay dues, and support NESMO initiatives."
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Membership</Text>
      <Text style={styles.placeholder}>Membership plans coming soon</Text>
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
