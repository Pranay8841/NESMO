/**
 * @fileoverview KnowledgeBaseSheet Component
 * A modal bottom sheet accessible from the 📌 icon in the CommunityScreen header.
 * Displays curated knowledge entries with search, category pills, and "View Thread" action.
 *
 * @module components/Discussion/KnowledgeBaseSheet
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchKnowledgeEntries } from '../../services/communityService';

interface KnowledgeBaseSheetProps {
  visible: boolean;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  ALL: { label: 'All', emoji: '📚' },
  HEALTH: { label: 'Health', emoji: '🏥' },
  EDUCATION: { label: 'Education', emoji: '🎓' },
  CAREER: { label: 'Career', emoji: '💼' },
  GOVT_EXAMS: { label: 'Govt Exams', emoji: '📋' },
  MENTAL_SUPPORT: { label: 'Mental Health', emoji: '💚' },
  MIGRATION: { label: 'Migration/Abroad', emoji: '✈️' },
  NETWORKING: { label: 'Networking', emoji: '🤝' },
  DOCUMENTS: { label: 'Documents', emoji: '📄' },
  OPPORTUNITIES: { label: 'Opportunities', emoji: '🌟' },
  GENERAL: { label: 'General', emoji: '💬' },
};

function formatDate(ts: any): string {
  if (!ts) return '';
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function KnowledgeBaseSheet({ visible, onClose }: KnowledgeBaseSheetProps) {
  const dispatch = useAppDispatch();
  const { knowledgeEntries, isLoadingKnowledge } = useAppSelector((s) => s.community);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    if (visible && knowledgeEntries.length === 0) {
      dispatch(fetchKnowledgeEntries(undefined));
    }
  }, [visible]);

  const filtered = knowledgeEntries.filter((e) => {
    const matchCat = activeCategory === 'ALL' || e.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const categories = ['ALL', ...Object.keys(CATEGORY_LABELS).filter((k) => k !== 'ALL')];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {/* Handle */}
              <View style={styles.handle} />

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <Feather name="bookmark" size={18} color="#2563EB" />
                  <Text style={styles.headerTitle}>Knowledge Base</Text>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Feather name="x" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.subtitle}>
                Curated answers from experienced Navodayans. Browse or search.
              </Text>

              {/* Search */}
              <View style={styles.searchBar}>
                <Feather name="search" size={15} color="#9CA3AF" />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search knowledge…"
                  placeholderTextColor="#9CA3AF"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Feather name="x-circle" size={15} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Category pills */}
              <FlatList
                horizontal
                data={categories}
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
                renderItem={({ item }) => {
                  const meta = CATEGORY_LABELS[item] || { label: item, emoji: '📌' };
                  const active = activeCategory === item;
                  return (
                    <TouchableOpacity
                      style={[styles.categoryPill, active && styles.categoryPillActive]}
                      onPress={() => setActiveCategory(item)}
                    >
                      <Text style={styles.categoryEmoji}>{meta.emoji}</Text>
                      <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]}>
                        {meta.label}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />

              {/* Entries list */}
              {isLoadingKnowledge ? (
                <View style={styles.centerState}>
                  <ActivityIndicator color="#2563EB" />
                  <Text style={styles.centerText}>Loading knowledge base…</Text>
                </View>
              ) : filtered.length === 0 ? (
                <View style={styles.centerState}>
                  <Ionicons name="archive-outline" size={36} color="#D1D5DB" />
                  <Text style={styles.centerText}>
                    {searchQuery ? 'No results found' : 'No knowledge entries yet'}
                  </Text>
                  <Text style={styles.centerSub}>
                    {searchQuery ? 'Try a different search' : 'Admins can pin great Q&As from the community chat'}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={filtered}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 30 }}
                  renderItem={({ item }) => {
                    const catMeta = CATEGORY_LABELS[item.category] || { emoji: '📌', label: item.category };
                    return (
                      <View style={styles.entryCard}>
                        {/* Title row */}
                        <View style={styles.entryTitleRow}>
                          <Text style={styles.entryEmoji}>{catMeta.emoji}</Text>
                          <Text style={styles.entryTitle} numberOfLines={2}>{item.title}</Text>
                        </View>

                        {/* Summary */}
                        {item.summary ? (
                          <Text style={styles.entrySummary} numberOfLines={3}>{item.summary}</Text>
                        ) : null}

                        {/* Tags */}
                        {item.tags.length > 0 && (
                          <View style={styles.tagsRow}>
                            {item.tags.slice(0, 4).map((tag) => (
                              <View key={tag} style={styles.tag}>
                                <Text style={styles.tagText}>#{tag}</Text>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Footer */}
                        <View style={styles.entryFooter}>
                          <Text style={styles.entryDate}>{formatDate(item.createdAt)}</Text>
                          <View style={styles.entryStats}>
                            <Feather name="eye" size={12} color="#9CA3AF" />
                            <Text style={styles.entryStatText}>{item.viewCount}</Text>
                            <Feather name="thumbs-up" size={12} color="#9CA3AF" />
                            <Text style={styles.entryStatText}>{item.helpfulVotes}</Text>
                          </View>
                        </View>
                      </View>
                    );
                  }}
                  ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 10,
    paddingHorizontal: 16,
    height: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  categoryList: {
    paddingBottom: 10,
    gap: 6,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  categoryEmoji: {
    fontSize: 13,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryLabelActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 40,
  },
  centerText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  centerSub: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 18,
  },
  entryCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  entryTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  entryEmoji: {
    fontSize: 18,
    marginTop: 1,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    lineHeight: 20,
  },
  entrySummary: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  entryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  entryStatText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginRight: 6,
  },
});
