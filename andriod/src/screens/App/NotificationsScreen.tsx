/**
 * @fileoverview NotificationsScreen
 * Renders user notifications from Firestore in a premium, clean, mobile list.
 *
 * @module screens/App/NotificationsScreen
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getMyNotifications, markNotificationRead } from '../../services/notificationService';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  recipient: string;
  link?: string;
  isRead: boolean;
  createdAt: any;
}

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [error, setError] = useState<string | null>(null);

  const fetchNotifs = useCallback(async () => {
    try {
      setError(null);
      const res = await getMyNotifications();
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
      setError('Could not load notifications.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNotifs();
  };

  const handleMarkAsRead = async (id: string, alreadyRead: boolean) => {
    if (alreadyRead) return;
    
    // Optimistic UI update
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );

    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error('Failed to mark notification read:', err);
      // Revert optimism on error
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: false } : n))
      );
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;

    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    try {
      const promises = unread.map(n => markNotificationRead(n.id));
      await Promise.all(promises);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      fetchNotifs(); // Re-fetch on error
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEWS':
        return { name: 'newspaper-outline', color: '#10B981', bg: '#E6F4EA' };
      case 'EVENT':
        return { name: 'calendar-outline', color: '#8B5CF6', bg: '#F5F3FF' };
      case 'SUPPORT':
        return { name: 'help-circle-outline', color: '#EF4444', bg: '#FEF2F2' };
      case 'PAYMENT':
        return { name: 'wallet-outline', color: '#F59E0B', bg: '#FFFBEB' };
      case 'SYSTEM':
      default:
        return { name: 'notifications-outline', color: '#2563EB', bg: '#EFF6FF' };
    }
  };

  const formatNotifTime = (createdAt: any) => {
    if (!createdAt) return '';
    
    let date: Date;
    if (typeof createdAt === 'object') {
      const seconds = createdAt.seconds ?? createdAt._seconds;
      if (seconds !== undefined) {
        date = new Date(seconds * 1000);
      } else if (createdAt.toDate && typeof createdAt.toDate === 'function') {
        date = createdAt.toDate();
      } else {
        date = new Date(createdAt);
      }
    } else {
      date = new Date(createdAt);
    }

    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredData = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        
        {notifications.some(n => !n.isRead) && (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, filter === 'ALL' && styles.activeTab]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.tabText, filter === 'ALL' && styles.activeTabText]}>
            All ({notifications.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, filter === 'UNREAD' && styles.activeTab]}
          onPress={() => setFilter('UNREAD')}
        >
          <Text style={[styles.tabText, filter === 'UNREAD' && styles.activeTabText]}>
            Unread ({notifications.filter(n => !n.isRead).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.centerText}>Loading notifications…</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Feather name="alert-circle" size={36} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRefresh}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredData.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyTitle}>
            {filter === 'UNREAD' ? 'No unread notifications' : 'Your inbox is empty'}
          </Text>
          <Text style={styles.emptySub}>
            When someone tags you in Community or sends updates, you'll see them here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#2563EB"
              colors={['#2563EB']}
            />
          }
          renderItem={({ item }) => {
            const icon = getNotificationIcon(item.type);
            return (
              <TouchableOpacity
                style={[styles.notifItem, !item.isRead && styles.unreadNotif]}
                onPress={() => handleMarkAsRead(item.id, item.isRead)}
                activeOpacity={0.7}
              >
                {/* Type Icon */}
                <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
                  <Ionicons name={icon.name as any} size={20} color={icon.color} />
                </View>

                {/* Body */}
                <View style={styles.notifBody}>
                  <View style={styles.notifHeaderRow}>
                    <Text style={[styles.notifTitle, !item.isRead && styles.boldText]}>
                      {item.title}
                    </Text>
                    {!item.isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifMessage} numberOfLines={3}>
                    {item.message}
                  </Text>
                  <Text style={styles.notifTime}>{formatNotifTime(item.createdAt)}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
  },
  markAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  // Filter tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  activeTab: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#fff',
  },
  // List content
  listContent: {
    paddingBottom: 20,
  },
  notifItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  unreadNotif: {
    backgroundColor: '#F0F7FF',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  notifBody: {
    flex: 1,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
    color: '#111827',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginLeft: 8,
  },
  notifMessage: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 6,
  },
  notifTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  // Center states
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 8,
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
  },
  retryBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  emptySub: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 19,
  },
});
