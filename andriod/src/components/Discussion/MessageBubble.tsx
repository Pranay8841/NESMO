/**
 * @fileoverview MessageBubble Component
 * Renders a single community message in WhatsApp group-chat style.
 * All messages are left-aligned (group chat, not personal chat).
 *
 * @module components/Discussion/MessageBubble
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { setReplyingTo } from '../../redux/slices/communitySlice';
import { reactToMessage, deleteMessage, reportMessage } from '../../services/communityService';

/* ─── Types ─── */

export interface Reaction {
  emoji: string;
  userIds: string[];
}

export interface CommunityMessage {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  authorBatch: string;
  authorOccupation: string;
  authorLocation: string;
  mentions: string[];
  attachments: string[];
  reactions: Reaction[];
  replyTo: string | null;
  replyToPreview: string | null;
  isPinned: boolean;
  isKnowledgeEntry: boolean;
  isDeleted: boolean;
  isSystemMessage: boolean;
  isAIResponse?: boolean;
  editedAt: any;
  createdAt: any;
}

interface MessageBubbleProps {
  message: CommunityMessage;
  onRefresh: () => void;
}

/* ─── Helpers ─── */

function formatTime(createdAt: any): string {
  if (!createdAt) return '';
  const date = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/** Renders text with @mentions highlighted in blue */
function HighlightedText({ text, style }: { text: string; style?: any }) {
  const parts = text.split(/(@everyone|@[A-Z][a-zA-Z]*(?:\s[A-Z][a-zA-Z]*)?)/gi);
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        part.startsWith('@') ? (
          <Text key={i} style={styles.mention}>{part}</Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      )}
    </Text>
  );
}

/** Avatar circle — photo if available, else colored initials */
export function Avatar({ name, photoUrl, size = 38 }: { name: string; photoUrl: string; size?: number }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Deterministic color from name
  const colors = ['#2563EB', '#7C3AED', '#059669', '#DC2626', '#D97706', '#0891B2'];
  const colorIdx = name.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIdx];

  if (photoUrl) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
        contentFit="cover"
      />
    );
  }
  return (
    <View style={[styles.avatar, styles.avatarFallback, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.37 }]}>{initials}</Text>
    </View>
  );
}

/* ─── Main Component ─── */

export default function MessageBubble({ message, onRefresh }: MessageBubbleProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [menuVisible, setMenuVisible] = useState(false);

  const isOwnMessage = user?._id === message.authorId;
  const isAdmin = user?.role === 'ADMIN';

  const handleReply = () => {
    dispatch(setReplyingTo({
      id: message.id,
      text: message.text,
      authorName: message.authorName,
    }));
  };

  const handleReact = async (emoji: string) => {
    try {
      await reactToMessage(message.id, emoji);
      onRefresh();
    } catch {
      // silent fail — reactions are non-critical
    }
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMessage(message.id);
              onRefresh();
            } catch {
              Alert.alert('Error', 'Could not delete message. Try again.');
            }
          },
        },
      ]
    );
  };

  const handleReport = () => {
    setMenuVisible(false);
    Alert.alert('Report Message', 'Why are you reporting this message?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Spam',
        onPress: () => reportMessage(message.id, 'Spam').catch(() => {}),
      },
      {
        text: 'Inappropriate',
        onPress: () => reportMessage(message.id, 'Inappropriate content').catch(() => {}),
      },
    ]);
  };

  // Deleted message placeholder
  if (message.isDeleted) {
    return (
      <View style={styles.deletedRow}>
        <Feather name="slash" size={12} color="#9CA3AF" />
        <Text style={styles.deletedText}> This message was deleted</Text>
      </View>
    );
  }

  const quickEmojis = ['👍', '❤️', '😊', '🙏'];
  const myReactions = message.reactions
    .filter((r) => r.userIds.includes(user?._id || ''))
    .map((r) => r.emoji);

  return (
    <>
      <TouchableWithoutFeedback onLongPress={() => setMenuVisible(true)}>
        <View style={styles.row}>
          {/* Avatar */}
          <View style={styles.avatarWrapper}>
            <Avatar name={message.authorName} photoUrl={message.authorPhoto} />
          </View>

          {/* Message content */}
          <View style={styles.bubble}>
            {/* Author info row */}
            <View style={styles.authorRow}>
              <Text style={styles.authorName} numberOfLines={1}>
                {message.authorName}
              </Text>
              {message.authorBatch ? (
                <Text style={styles.badge}>'{message.authorBatch.slice(-2)}</Text>
              ) : null}
              {message.authorOccupation ? (
                <Text style={styles.occupation} numberOfLines={1}>
                  · {message.authorOccupation}
                  {message.authorLocation ? `, ${message.authorLocation}` : ''}
                </Text>
              ) : null}
            </View>

            {/* Reply preview */}
            {message.replyToPreview ? (
              <View style={styles.replyPreview}>
                <View style={styles.replyBar} />
                <Text style={styles.replyText} numberOfLines={1}>
                  {message.replyToPreview}
                </Text>
              </View>
            ) : null}

            {/* Message text */}
            <HighlightedText text={message.text} style={styles.messageText} />

            {/* Footer: time + edited + reply button */}
            <View style={styles.footer}>
              <Text style={styles.timestamp}>
                {formatTime(message.createdAt)}
                {message.editedAt ? '  · edited' : ''}
              </Text>
              {message.isKnowledgeEntry && (
                <View style={styles.pinBadge}>
                  <Feather name="bookmark" size={10} color="#2563EB" />
                  <Text style={styles.pinText}>Knowledge</Text>
                </View>
              )}
              <TouchableOpacity onPress={handleReply} style={styles.replyBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="corner-up-left" size={13} color="#6B7280" />
                <Text style={styles.replyBtnText}>Reply</Text>
              </TouchableOpacity>
            </View>

            {/* Reactions */}
            {message.reactions.filter((r) => r.userIds.length > 0).length > 0 ? (
              <View style={styles.reactionsRow}>
                {message.reactions
                  .filter((r) => r.userIds.length > 0)
                  .map((r) => (
                    <TouchableOpacity
                      key={r.emoji}
                      style={[
                        styles.reactionPill,
                        myReactions.includes(r.emoji) && styles.reactionPillActive,
                      ]}
                      onPress={() => handleReact(r.emoji)}
                    >
                      <Text style={styles.reactionEmoji}>{r.emoji}</Text>
                      <Text style={styles.reactionCount}>{r.userIds.length}</Text>
                    </TouchableOpacity>
                  ))}
                {/* Quick add reactions */}
                {quickEmojis.map((emoji) =>
                  !message.reactions.find((r) => r.emoji === emoji) ? (
                    <TouchableOpacity
                      key={emoji}
                      style={styles.reactionAdd}
                      onPress={() => handleReact(emoji)}
                    >
                      <Text style={styles.reactionEmoji}>{emoji}</Text>
                    </TouchableOpacity>
                  ) : null
                )}
              </View>
            ) : null}
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* Long-press action menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.menuOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuCard}>
                <Text style={styles.menuTitle} numberOfLines={2}>
                  "{message.text.slice(0, 60)}{message.text.length > 60 ? '…' : ''}"
                </Text>

                {/* Quick emoji row */}
                <View style={styles.menuEmojiRow}>
                  {['👍', '❤️', '😊', '🙏', '🎉', '💯'].map((e) => (
                    <TouchableOpacity
                      key={e}
                      onPress={() => { setMenuVisible(false); handleReact(e); }}
                      style={styles.menuEmoji}
                    >
                      <Text style={{ fontSize: 22 }}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.menuDivider} />

                <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); handleReply(); }}>
                  <Feather name="corner-up-left" size={16} color="#374151" />
                  <Text style={styles.menuItemText}>Reply</Text>
                </TouchableOpacity>

                {(isOwnMessage || isAdmin) && (
                  <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                    <Feather name="trash-2" size={16} color="#EF4444" />
                    <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Delete</Text>
                  </TouchableOpacity>
                )}

                {!isOwnMessage && (
                  <TouchableOpacity style={styles.menuItem} onPress={handleReport}>
                    <Feather name="flag" size={16} color="#F59E0B" />
                    <Text style={[styles.menuItemText, { color: '#F59E0B' }]}>Report</Text>
                  </TouchableOpacity>
                )}

                {isAdmin && (
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setMenuVisible(false);
                      Alert.alert('Knowledge Entry', 'Use the admin panel to pin this as a knowledge entry.');
                    }}
                  >
                    <Feather name="bookmark" size={16} color="#2563EB" />
                    <Text style={[styles.menuItemText, { color: '#2563EB' }]}>Pin as Knowledge</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={[styles.menuItem, styles.menuCancel]} onPress={() => setMenuVisible(false)}>
                  <Text style={styles.menuCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'flex-start',
  },
  avatarWrapper: {
    marginRight: 10,
    marginTop: 2,
  },
  avatar: {
    backgroundColor: '#E5E7EB',
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
  },
  bubble: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderTopLeftRadius: 2,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 3,
    gap: 4,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    maxWidth: 130,
  },
  badge: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  occupation: {
    fontSize: 11,
    color: '#6B7280',
    flex: 1,
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    padding: 6,
    marginBottom: 5,
  },
  replyBar: {
    width: 3,
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 2,
    marginRight: 6,
  },
  replyText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
    fontStyle: 'italic',
  },
  messageText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  mention: {
    color: '#2563EB',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    flex: 1,
  },
  pinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pinText: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '600',
  },
  replyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  replyBtnText: {
    fontSize: 12,
    color: '#6B7280',
  },
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 4,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reactionPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  reactionAdd: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  deletedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  deletedText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  // Menu modal
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  menuCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 34,
    paddingHorizontal: 16,
  },
  menuTitle: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 12,
    textAlign: 'center',
  },
  menuEmojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  menuEmoji: {
    padding: 6,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  menuItemText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  menuCancel: {
    justifyContent: 'center',
    borderBottomWidth: 0,
    marginTop: 4,
  },
  menuCancelText: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    flex: 1,
  },
});
