import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AIResponseBubbleProps {
  text: string;
  replyToPreview: string | null;
  createdAt: any;
}

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

function renderFormattedText(text: string) {
  if (!text) return null;

  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    // Check if line is a bullet point (starts with •, *, - followed by space)
    const isBullet = /^[•\*\-]\s+/.test(line);
    const cleanLine = isBullet ? line.replace(/^[•\*\-]\s+/, '') : line;

    // Split line by bold parts (**text**)
    const parts = cleanLine.split(/(\*\*[^*]+\*\*)/g);

    const renderedLine = (
      <Text key={lineIdx} style={isBullet ? styles.bulletText : styles.normalText}>
        {parts.map((part, partIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <Text key={partIdx} style={styles.boldText}>
                {part.slice(2, -2)}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );

    if (isBullet) {
      return (
        <View key={lineIdx} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <View style={styles.bulletContent}>
            {renderedLine}
          </View>
        </View>
      );
    }

    return (
      <View key={lineIdx} style={styles.lineRow}>
        {renderedLine}
      </View>
    );
  });
}

export default function AIResponseBubble({ text, replyToPreview, createdAt }: AIResponseBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldCollapse = text.length > 300;
  const displayedText = shouldCollapse && !isExpanded ? text.slice(0, 300) + '...' : text;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.sparklesBg}>
            <Ionicons name="sparkles" size={14} color="#7C3AED" />
          </View>
          <Text style={styles.headerTitle}>NESMO AI</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>AI Assistant</Text>
        </View>
      </View>

      {/* Reply to preview */}
      {replyToPreview && (
        <View style={styles.replyPreview}>
          <View style={styles.replyBorder} />
          <View style={styles.replyContent}>
            <Text style={styles.replyTitle}>Question</Text>
            <Text style={styles.replyText} numberOfLines={2}>
              {replyToPreview}
            </Text>
          </View>
        </View>
      )}

      {/* Response content */}
      <View style={styles.content}>
        {renderFormattedText(displayedText)}
      </View>

      {/* Expand/Collapse Button */}
      {shouldCollapse && (
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          style={styles.showMoreButton}
          activeOpacity={0.7}
        >
          <Text style={styles.showMoreText}>
            {isExpanded ? 'Show Less' : 'Read More'}
          </Text>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={14}
            color="#7C3AED"
          />
        </TouchableOpacity>
      )}

      {/* Footer Timestamp */}
      <View style={styles.footer}>
        <Text style={styles.timestamp}>{formatTime(createdAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAF5FF', // Soft purple background
    borderWidth: 1,
    borderColor: '#E9D5FF', // Purple-200 border
    borderRadius: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 14,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sparklesBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5B21B6', // Deep purple
  },
  badge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    color: '#7C3AED',
    fontWeight: '600',
  },
  replyPreview: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  replyBorder: {
    width: 4,
    backgroundColor: '#D1D5DB',
  },
  replyContent: {
    padding: 8,
    flex: 1,
  },
  replyTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 12,
    color: '#4B5563',
    fontStyle: 'italic',
  },
  content: {
    gap: 6,
  },
  lineRow: {
    marginVertical: 1,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 2,
    paddingLeft: 4,
  },
  bulletDot: {
    fontSize: 13,
    color: '#4B5563',
    marginRight: 6,
    lineHeight: 18,
  },
  bulletContent: {
    flex: 1,
  },
  normalText: {
    fontSize: 13.5,
    color: '#1F2937',
    lineHeight: 19,
  },
  bulletText: {
    fontSize: 13.5,
    color: '#1F2937',
    lineHeight: 19,
  },
  boldText: {
    fontWeight: '700',
    color: '#111827',
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 10,
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  showMoreText: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  timestamp: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});
