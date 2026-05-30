/**
 * @fileoverview MessageInput Component
 * WhatsApp-style bottom input bar for the community chat.
 * - Auto-growing text input (up to 4 lines)
 * - Smart suggestion strip (debounced search after 15+ chars)
 * - Reply preview strip (when replyingTo is set in Redux)
 * - No category dropdown — category is detected silently on the backend
 *
 * @module components/Discussion/MessageInput
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Animated,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearReplyingTo, clearSearchSuggestions } from '../../redux/slices/communitySlice';
import { postMessage, searchCommunity, getMentionableUsers } from '../../services/communityService';
import { Avatar } from './MessageBubble';

interface MentionableUser {
  id: string;
  name: string;
  email: string;
  photo?: string;
  batch?: string;
}

interface MessageInputProps {
  onMessageSent: () => void;
}

export default function MessageInput({ onMessageSent }: MessageInputProps) {
  const dispatch = useAppDispatch();
  const { replyingTo, searchSuggestions, isSearching } = useAppSelector(
    (state) => state.community
  );

  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionAnim = useRef(new Animated.Value(0)).current;

  // Mentions autocomplete state
  const [allUsers, setAllUsers] = useState<MentionableUser[]>([]);
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  // Fetch registered users once on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getMentionableUsers();
        if (res.success && Array.isArray(res.data)) {
          setAllUsers(res.data);
        }
      } catch (err) {
        console.error('Failed to load mentionable users:', err);
      }
    };
    fetchUsers();
  }, []);

  // Parse if we are actively typing a mention
  const getActiveMentionQuery = useCallback((txt: string, cursorPosition: number) => {
    const textBeforeCursor = txt.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    if (lastAtIndex === -1) return null;

    const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
    if (textAfterAt.includes(' ') || textAfterAt.includes('\n')) {
      return null;
    }

    if (lastAtIndex > 0) {
      const charBeforeAt = textBeforeCursor[lastAtIndex - 1];
      if (charBeforeAt !== ' ' && charBeforeAt !== '\n') {
        return null;
      }
    }

    return {
      query: textAfterAt.toLowerCase(),
      startIndex: lastAtIndex,
    };
  }, []);

  const mentionInfo = getActiveMentionQuery(text, selection.start);
  const mentionQuery = mentionInfo ? mentionInfo.query : '';

  const filteredUsers = mentionInfo
    ? [
        { id: 'everyone', name: 'Everyone', email: 'Notify all members in the group', photo: '', batch: '' },
        ...allUsers,
      ].filter(
        (u) =>
          u.name.toLowerCase().includes(mentionQuery) ||
          u.email.toLowerCase().includes(mentionQuery)
      )
    : [];

  const handleSelectUser = useCallback(
    (selectedUser: MentionableUser) => {
      const activeMention = getActiveMentionQuery(text, selection.start);
      if (!activeMention) return;

      const { startIndex } = activeMention;
      const nameToInsert = selectedUser.id === 'everyone' ? '@Everyone' : `@${selectedUser.name}`;

      const newText =
        text.slice(0, startIndex) +
        nameToInsert +
        ' ' +
        text.slice(selection.start);

      setText(newText);

      // Add to selected mentions list if not everyone
      if (selectedUser.id !== 'everyone') {
        if (!selectedMentions.includes(selectedUser.id)) {
          setSelectedMentions((prev) => [...prev, selectedUser.id]);
        }
      }

      // Position cursor after the inserted name + space
      const newCursorPos = startIndex + nameToInsert.length + 1;
      setSelection({ start: newCursorPos, end: newCursorPos });
    },
    [text, selection.start, selectedMentions, getActiveMentionQuery]
  );

  // Debounced search for suggestion strip
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (text.length >= 15) {
      searchTimeout.current = setTimeout(() => {
        dispatch(searchCommunity(text));
        setShowSuggestions(true);
      }, 600);
    } else {
      setShowSuggestions(false);
      dispatch(clearSearchSuggestions());
    }

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [text]);

  // Animate suggestion strip in/out
  useEffect(() => {
    Animated.timing(suggestionAnim, {
      toValue: showSuggestions && searchSuggestions.length > 0 ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showSuggestions, searchSuggestions.length]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);

    // Keep only mentions that are actually present in the text
    const finalMentions = selectedMentions.filter((uid) => {
      const u = allUsers.find((user) => user.id === uid);
      return u && text.includes(`@${u.name}`);
    });

    try {
      await postMessage({
        text: trimmed,
        replyTo: replyingTo?.id || null,
        mentions: finalMentions,
      });
      setText('');
      setSelectedMentions([]);
      dispatch(clearReplyingTo());
      dispatch(clearSearchSuggestions());
      setShowSuggestions(false);
      onMessageSent();
    } catch {
      // The message might still have gone through even if the response failed
      // — Firestore onSnapshot will catch it. Silently clear.
    } finally {
      setIsSending(false);
    }
  }, [text, isSending, replyingTo, dispatch, onMessageSent, selectedMentions, allUsers]);

  const handleDismissSuggestions = () => {
    setShowSuggestions(false);
  };

  return (
    <View style={styles.container}>
      {/* Mentions autocomplete overlay */}
      {mentionInfo && filteredUsers.length > 0 && (
        <View style={styles.autocompleteOverlay}>
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="always"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.autocompleteItem}
                onPress={() => handleSelectUser(item)}
              >
                {item.id === 'everyone' ? (
                  <View style={[styles.avatar, styles.everyoneAvatar]}>
                    <Ionicons name="megaphone-outline" size={16} color="#fff" />
                  </View>
                ) : (
                  <Avatar name={item.name} photoUrl={item.photo || ''} size={32} />
                )}
                <View style={styles.autocompleteTextContainer}>
                  <View style={styles.autocompleteNameRow}>
                    <Text style={styles.autocompleteName}>
                      {item.id === 'everyone' ? '@Everyone' : item.name}
                    </Text>
                    {item.batch ? (
                      <Text style={styles.autocompleteBatch}>'{item.batch.slice(-2)}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.autocompleteEmail} numberOfLines={1}>
                    {item.email}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.autocompleteSeparator} />}
            style={{ maxHeight: 200 }}
          />
        </View>
      )}

      {/* Smart suggestion strip */}
      {showSuggestions && searchSuggestions.length > 0 && (
        <Animated.View style={[styles.suggestionStrip, { opacity: suggestionAnim }]}>
          <View style={styles.suggestionHeader}>
            <Ionicons name="bulb-outline" size={14} color="#2563EB" />
            <Text style={styles.suggestionTitle}>Similar past discussions</Text>
            <TouchableOpacity onPress={handleDismissSuggestions} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={14} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={searchSuggestions.slice(0, 3)}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.suggestionItem}>
                <Feather name="message-circle" size={12} color="#6B7280" style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.suggestionText} numberOfLines={2}>{item.text}</Text>
                  <Text style={styles.suggestionAuthor}>{item.authorName}</Text>
                </View>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#F3F4F6' }} />}
          />
        </Animated.View>
      )}

      {/* Searching indicator */}
      {isSearching && text.length >= 15 && (
        <View style={styles.searchingRow}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={styles.searchingText}>Finding similar discussions…</Text>
        </View>
      )}

      {/* Reply preview strip */}
      {replyingTo && (
        <View style={styles.replyStrip}>
          <Feather name="corner-up-left" size={13} color="#2563EB" />
          <View style={styles.replyStripContent}>
            <Text style={styles.replyStripAuthor}>{replyingTo.authorName}</Text>
            <Text style={styles.replyStripText} numberOfLines={1}>
              {replyingTo.text}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => dispatch(clearReplyingTo())}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="x" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Main input row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          selection={selection}
          onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
          placeholder="Type a message…"
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={2000}
          returnKeyType="default"
          blurOnSubmit={false}
        />

        {/* Send button */}
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || isSending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || isSending}
          activeOpacity={0.8}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingBottom: 8,
  },
  // Suggestion strip
  suggestionStrip: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginHorizontal: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  suggestionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  suggestionText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 17,
  },
  suggestionAuthor: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  // Searching indicator
  searchingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginHorizontal: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Reply strip
  replyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderRadius: 12,
    marginHorizontal: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  replyStripContent: {
    flex: 1,
  },
  replyStripAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  replyStripText: {
    fontSize: 12,
    color: '#374151',
  },
  // Input row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    color: '#111827',
    maxHeight: 120,
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  sendBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  autocompleteOverlay: {
    position: 'absolute',
    bottom: '100%',
    left: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 1000,
    overflow: 'hidden',
    marginBottom: 6,
  },
  autocompleteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  autocompleteTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  autocompleteNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  autocompleteName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  autocompleteBatch: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '600',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  autocompleteEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  autocompleteSeparator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  everyoneAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
