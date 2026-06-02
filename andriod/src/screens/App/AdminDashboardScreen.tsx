/**
 * @fileoverview Admin Dashboard Screen
 * Overview dashboard for administrator users showing system statistics, recent activity, and actions.
 * 
 * @module screens/App/AdminDashboardScreen
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { fetchDashboardStats } from '../../services/adminService';
import { Feather, Ionicons } from '@expo/vector-icons';
import { APP_CONSTANTS } from '../../constants';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

/** Format timestamp to readable time */
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/** Format currency */
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/** Get status color for activities */
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Verified':
    case 'Success':
    case 'Active':
      return { text: '#10B981', bg: '#D1FAE5' };
    case 'Emergency':
    case 'Failed':
      return { text: '#EF4444', bg: '#FEE2E2' };
    case 'Suspended':
      return { text: '#F59E0B', bg: '#FEF3C7' };
    case 'Pending':
      return { text: '#6366F1', bg: '#EEF2FF' };
    default:
      return { text: '#6B7280', bg: '#F3F4F6' };
  }
};

export default function AdminDashboardScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavigationProp>();
  const { dashboardStats, dashboardLoading } = useAppSelector((state) => state.admin);
  const [lastSync, setLastSync] = useState('Just now');

  const loadData = useCallback(() => {
    dispatch(fetchDashboardStats());
    setLastSync('Just now');
  }, [dispatch]);

  // Fetch dashboard stats on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update last sync text
  useEffect(() => {
    if (!dashboardLoading && dashboardStats) {
      setLastSync('Just now');
      const interval = setInterval(() => {
        setLastSync((prev) => {
          if (prev === 'Just now') return '1m ago';
          const mins = parseInt(prev) || 0;
          return `${mins + 1}m ago`;
        });
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [dashboardLoading, dashboardStats]);

  if (dashboardLoading && !dashboardStats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
      </View>
    );
  }

  const statItems = dashboardStats
    ? [
        {
          title: 'Total Users',
          value: String(dashboardStats.users.total),
          icon: 'users',
          color: '#3B82F6',
          bg: '#DBEAFE',
          subtitle: `${dashboardStats.users.byRole?.ALUMNI || 0} Alumni, ${dashboardStats.users.byRole?.MEMBER || 0} Members`,
        },
        {
          title: 'Payment Volume',
          value: formatCurrency(dashboardStats.payments.totalAmount),
          icon: 'credit-card',
          color: '#10B981',
          bg: '#D1FAE5',
          subtitle: `${dashboardStats.payments.total} transactions`,
        },
        {
          title: 'Support Tickets',
          value: String(dashboardStats.tickets.open),
          icon: 'help-circle',
          color: '#F59E0B',
          bg: '#FEF3C7',
          subtitle: `${dashboardStats.tickets.emergency || 0} emergency tickets`,
        },
        {
          title: 'Published News',
          value: String(dashboardStats.news.published),
          icon: 'book-open',
          color: '#8B5CF6',
          bg: '#EDE9FE',
          subtitle: `${dashboardStats.news.total} total articles`,
        },
      ]
    : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Overview Dashboard</Text>
          <Text style={styles.headerSubtitle}>Portal activity & administrative tools</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
          <Feather name="refresh-cw" size={16} color="#007AFF" />
          <Text style={styles.refreshText}>Sync</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {statItems.map((item, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>{item.title}</Text>
              <View style={[styles.iconContainer, { backgroundColor: item.bg }]}>
                <Feather name={item.icon as any} size={16} color={item.color} />
              </View>
            </View>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statSubtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flash-outline" size={18} color="#007AFF" />
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#EEF2FF' }]}
            onPress={() => navigation.navigate(APP_CONSTANTS.SCREENS.USER_MODERATION as any)}
          >
            <Feather name="user-check" size={20} color="#4F46E5" />
            <Text style={[styles.actionLabel, { color: '#4F46E5' }]}>Moderate Users</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#ECFDF5' }]}>
            <Feather name="bell" size={20} color="#059669" />
            <Text style={[styles.actionLabel, { color: '#059669' }]}>Send Broadcast</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#FFFBEB' }]}>
            <Feather name="download" size={20} color="#D97706" />
            <Text style={[styles.actionLabel, { color: '#D97706' }]}>Export Audits</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#FDF2F8' }]}>
            <Feather name="mail" size={20} color="#DB2777" />
            <Text style={[styles.actionLabel, { color: '#DB2777' }]}>Email Members</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {dashboardStats?.recentActivity && dashboardStats.recentActivity.length > 0 ? (
          <View style={styles.activityList}>
            {dashboardStats.recentActivity.map((item) => {
              const colors = getStatusColor(item.status);
              return (
                <View key={item.id} style={styles.activityRow}>
                  <View style={styles.activityMain}>
                    <Text style={styles.activityType}>{item.eventType}</Text>
                    <Text style={styles.activityEntity} numberOfLines={1}>
                      {item.userEntity}
                    </Text>
                    <Text style={styles.activityTime}>{formatTime(item.timestamp)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recent activity found</Text>
          </View>
        )}
      </View>

      {/* System Status */}
      <View style={styles.statusBox}>
        <View style={styles.statusHeader}>
          <View style={styles.pulseDot} />
          <Text style={styles.statusBoxTitle}>SYSTEM STATUS</Text>
        </View>
        <Text style={styles.statusBoxText}>
          All systems are operational. Last sync: {lastSync}.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  statTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    flex: 1,
    marginRight: 4,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 6,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  activityMain: {
    flex: 1,
    marginRight: 12,
  },
  activityType: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  activityEntity: {
    fontSize: 11,
    color: '#475569',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
  },
  statusBox: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusBoxTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  statusBoxText: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
