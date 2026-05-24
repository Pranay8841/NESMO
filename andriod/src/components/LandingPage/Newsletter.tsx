import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';
import { subscribeToNewsletter } from '../../services/newsletterService';

export default function Newsletter() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email.trim()) {
      toast.show('Please enter your email address', { type: 'danger' });
      return;
    }

    setLoading(true);
    try {
      const data = await subscribeToNewsletter(email);
      if (data?.success) {
        toast.show(data?.message || 'Successfully subscribed!', { type: 'success' });
        setEmail(''); // Clear input on success
      } else {
        toast.show(data?.message || 'Subscription failed', { type: 'danger' });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Subscription failed';
      toast.show(message, { type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Icon Header */}
      <View style={styles.iconContainer}>
        <Feather name="mail" size={22} color="#2563EB" />
      </View>

      {/* Heading & description */}
      <Text style={styles.title}>Stay Connected with NESMO</Text>
      <Text style={styles.description}>
        Subscribe to our newsletter for the latest alumni success stories, upcoming reunions, and community updates.
      </Text>

      {/* Input Form */}
      <View style={styles.formContainer}>
        <View style={styles.inputWrapper}>
          <Feather name="mail" size={16} color="#94A3B8" style={styles.inputIcon} />
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            style={styles.textInput}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Subscribe</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
    marginVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  formContainer: {
    width: '100%',
    flexDirection: 'column',
    gap: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    height: 44,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
    padding: 0, // Remove native padding
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
