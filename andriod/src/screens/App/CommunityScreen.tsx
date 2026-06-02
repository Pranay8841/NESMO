/**
 * @fileoverview CommunityScreen
 * WhatsApp-group-style real-time community chat screen.
 *
 * Layout:
 *  ┌──────────────────────────────────────┐
 *  │  NESMO Community          🔍  📌     │  ← Header
 *  ├──────────────────────────────────────┤
 *  │  FlatList (inverted) — messages      │  ← Real-time via Firestore onSnapshot
 *  ├──────────────────────────────────────┤
 *  │  [Reply strip — conditional]         │
 *  │  [Suggestion strip — conditional]    │
 *  │  📝  Type a message…         ➤      │  ← MessageInput
 *  └──────────────────────────────────────┘
 *
 * Real-time: Firestore onSnapshot on 'community_messages' collection.
 * All writes go through the backend REST API (not direct Firestore writes).
 *
 * @module screens/App/CommunityScreen
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Feather } from '@expo/vector-icons';

import { db, auth } from '../../config/firebaseClient';
import MessageBubble, { type CommunityMessage } from '../../components/Discussion/MessageBubble';
import SmartMatchBanner from '../../components/Discussion/SmartMatchBanner';
import AIResponseBubble from '../../components/Discussion/AIResponseBubble';
import MessageInput from '../../components/Discussion/MessageInput';
import KnowledgeBaseSheet from '../../components/Discussion/KnowledgeBaseSheet';
import { useAppSelector } from '../../redux/hooks';
import GuestPlaceholder from '../../components/GuestPlaceholder';

const MESSAGE_LOAD_LIMIT = 50;

export default function CommunityScreen() {
  const { user, token } = useAppSelector((state) => state.auth);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [knowledgeSheetOpen, setKnowledgeSheetOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const unsubscribeAuthRef = useRef<(() => void) | null>(null);

  /* ────────────────────────────────────
     Firestore onSnapshot listener
     Subscribes to last 50 messages,
     ordered newest-first for FlatList inverted.
  ──────────────────────────────────── */
  const startListener = useCallback(() => {
    if (!db || !auth) {
      setError('Firebase not initialized. Check your config.');
      setIsLoading(false);
      return;
    }

    const runListener = () => {
      // Clean up previous Firestore listener if any
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      const q = query(
        collection(db, 'community_messages'),
        orderBy('createdAt', 'desc'),
        limit(MESSAGE_LOAD_LIMIT)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const docs: CommunityMessage[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as CommunityMessage[];

          setMessages(docs);
          setIsLoading(false);
          setIsRefreshing(false);
        },
        (err) => {
          console.error('Firestore listener error:', err);
          setError('Could not load messages. Check your connection.');
          setIsLoading(false);
          setIsRefreshing(false);
        }
      );

      unsubscribeRef.current = unsubscribe;
    };

    if (auth.currentUser) {
      runListener();
    } else {
      // Clean up previous auth listener if any
      if (unsubscribeAuthRef.current) {
        unsubscribeAuthRef.current();
        unsubscribeAuthRef.current = null;
      }

      const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser: any) => {
        if (firebaseUser) {
          runListener();
          if (unsubscribeAuthRef.current) {
            unsubscribeAuthRef.current();
            unsubscribeAuthRef.current = null;
          }
        }
      });
      unsubscribeAuthRef.current = unsubscribeAuth;
    }
  }, []);

  useEffect(() => {
    if (token && user) {
      startListener();
    }
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (unsubscribeAuthRef.current) {
        unsubscribeAuthRef.current();
        unsubscribeAuthRef.current = null;
      }
    };
  }, [startListener, token, user]);

  /* ────────────────────────────────────
     Pull-to-refresh (re-attaches listener)
  ──────────────────────────────────── */
  const handleRefresh = () => {
    if (!token || !user) return;
    setIsRefreshing(true);
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (unsubscribeAuthRef.current) {
      unsubscribeAuthRef.current();
      unsubscribeAuthRef.current = null;
    }
    startListener();
  };

  /* ────────────────────────────────────
     After message sent — scroll to top
     (FlatList is inverted, so top = newest)
  ──────────────────────────────────── */
  const handleMessageSent = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  /* ────────────────────────────────────
     Render each item
  ──────────────────────────────────── */
  const renderItem = useCallback(
    ({ item }: { item: CommunityMessage }) => {
      if (item.isSystemMessage) {
        if ((item as any).isAIResponse) {
          return (
            <AIResponseBubble
              text={item.text}
              replyToPreview={item.replyToPreview}
              createdAt={item.createdAt}
            />
          );
        }
        return (
          <SmartMatchBanner
            text={item.text}
            matchedAlumni={(item as any).matchedAlumni || []}
          />
        );
      }
      return (
        <MessageBubble
          message={item}
          onRefresh={handleRefresh}
        />
      );
    },
    [handleRefresh]
  );

  const keyExtractor = useCallback((item: CommunityMessage) => item.id, []);

  // If guest (not logged in), show Sign In CTA placeholder
  if (!token || !user) {
    return (
      <GuestPlaceholder
        title="NESMO Community"
        description="Connect and chat with fellow Navodayans globally in real-time."
      />
    );
  }

  /* ────────────────────────────────────
     Active member count (from loaded messages)
  ──────────────────────────────────── */
  const uniqueAuthors = new Set(
    messages
      .filter((m) => !m.isSystemMessage && !m.isDeleted)
      .map((m) => m.authorId)
  ).size;

  /* ────────────────────────────────────
     UI
  ──────────────────────────────────── */
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconWrapper}>
            <Text style={styles.headerIcon}>💬</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>NESMO Community</Text>
            <Text style={styles.headerSub}>
              {isLoading
                ? 'Connecting…'
                : `${uniqueAuthors} member${uniqueAuthors !== 1 ? 's' : ''} active`}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.knowledgeBtn}
          onPress={() => setKnowledgeSheetOpen(true)}
          activeOpacity={0.8}
        >
          <Feather name="bookmark" size={18} color="#2563EB" />
          <Text style={styles.knowledgeBtnText}>Knowledge</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: '#f0f2f5' }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* ── Feed ── */}
        {isLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.centerText}>Loading community…</Text>
          </View>
        ) : error ? (
          <View style={styles.centerState}>
            <Feather name="wifi-off" size={36} color="#D1D5DB" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleRefresh}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.centerState}>
            <Text style={styles.emptyEmoji}>👋</Text>
            <Text style={styles.emptyTitle}>Be the first to post!</Text>
            <Text style={styles.emptySub}>
              Ask a question, share an opportunity, or say hello to your fellow Navodayans.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            inverted                      // Newest at bottom, like WhatsApp
            showsVerticalScrollIndicator={false}
            style={{ backgroundColor: '#f0f2f5' }}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#2563EB"
                colors={['#2563EB']}
              />
            }
            // Performance
            removeClippedSubviews
            maxToRenderPerBatch={15}
            windowSize={10}
            initialNumToRender={20}
          />
        )}

        {/* ── Input ── */}
        <MessageInput onMessageSent={handleMessageSent} />
      </KeyboardAvoidingView>

      {/* ── Knowledge Base Sheet ── */}
      <KnowledgeBaseSheet
        visible={knowledgeSheetOpen}
        onClose={() => setKnowledgeSheetOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  headerSub: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  knowledgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  knowledgeBtnText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
  },
  // Feed content
  listContent: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  // States
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 30,
  },
  centerText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  emptySub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
