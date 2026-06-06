/**
 * @fileoverview Main Application Navigation Stack
 * Navigation for authenticated users (home, profile, directory, etc.)
 * 
 * @module navigation/AppNavigator
 */

import React, { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useToast } from 'react-native-toast-notifications';
import * as Notifications from 'expo-notifications';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

import HomeScreen from '../screens/App/HomeScreen';
import ProfileScreen from '../screens/App/ProfileScreen';
import DirectoryScreen from '../screens/App/DirectoryScreen';
import EventsScreen from '../screens/App/EventsScreen';
import CommunityScreen from '../screens/App/CommunityScreen';
import SettingsScreen from '../screens/App/SettingsScreen';
import UserModerationScreen from '../screens/App/UserModerationScreen';
import AdminDashboardScreen from '../screens/App/AdminDashboardScreen';
import NotificationsScreen from '../screens/App/NotificationsScreen';
import BatchDashboardScreen from '../screens/App/BatchDashboardScreen';

import { APP_CONSTANTS } from '../constants';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { setUnreadCount } from '../redux/slices/notificationSlice';
import { db, auth } from '../config/firebaseClient';

/**
 * App Tab navigation parameter list
 * Defines tab-based screens
 */
export type AppTabParamList = {
  [APP_CONSTANTS.SCREENS.HOME]: undefined;
  [APP_CONSTANTS.SCREENS.DIRECTORY]: undefined;
  [APP_CONSTANTS.SCREENS.EVENTS]: undefined;
  [APP_CONSTANTS.SCREENS.COMMUNITY]: undefined;
  [APP_CONSTANTS.SCREENS.PROFILE]: undefined;
};

/**
 * App Stack navigation parameter list
 * Defines modal/stack screens
 */
export type AppStackParamList = {
  [APP_CONSTANTS.NAVIGATION.APP_TABS]: undefined;
  [APP_CONSTANTS.SCREENS.PROFILE]: {
    userId?: string;
    edit?: boolean;
  };
  [APP_CONSTANTS.SCREENS.USER_MODERATION]: undefined;
  [APP_CONSTANTS.SCREENS.ADMIN_DASHBOARD]: undefined;
  [APP_CONSTANTS.SCREENS.BATCH_DASHBOARD]: undefined;
  [APP_CONSTANTS.SCREENS.NOTIFICATIONS]: undefined;
};

/**
 * Navigation props type for app tab screens
 */
export type AppTabScreenProps<T extends keyof AppTabParamList> = BottomTabScreenProps<
  AppTabParamList,
  T
>;

/**
 * Navigation props type for app stack screens
 */
export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>;

const Tab = createBottomTabNavigator<AppTabParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * Tab Navigator
 * Bottom tab navigation for main app screens
 * 
 * @component
 * @returns {JSX.Element} Tab navigator
 */
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitleAlign: 'center',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case APP_CONSTANTS.SCREENS.HOME:
              iconName = focused ? 'home' : 'home-outline';
              break;
            case APP_CONSTANTS.SCREENS.DIRECTORY:
              iconName = focused ? 'people' : 'people-outline';
              break;
            case APP_CONSTANTS.SCREENS.EVENTS:
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case APP_CONSTANTS.SCREENS.COMMUNITY:
              iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
              break;
            case APP_CONSTANTS.SCREENS.PROFILE:
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarTranslucent: false,
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name={APP_CONSTANTS.SCREENS.HOME}
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={APP_CONSTANTS.SCREENS.DIRECTORY}
        component={DirectoryScreen}
        options={{
          title: 'Directory',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={APP_CONSTANTS.SCREENS.COMMUNITY}
        component={CommunityScreen}
        options={{
          title: 'Community',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={APP_CONSTANTS.SCREENS.EVENTS}
        component={EventsScreen}
        options={{
          title: 'Events',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name={APP_CONSTANTS.SCREENS.PROFILE}
        component={SettingsScreen}
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

// Configure default foreground/background behaviors
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * App Stack Navigator
 * Main application navigation with tab-based main screens and modal screens
 * 
 * @component
 * @returns {JSX.Element} App stack navigator
 */
export default function AppNavigator() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const toast = useToast();
  const appState = useRef(AppState.currentState);

  // Request notifications permissions and set up Android channels on mount
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
      }

      if (Platform.OS === 'android') {
        // Default channel for community mentions
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2563EB',
        });

        // Dedicated channel for NESMO notifications (news, events, system, etc.)
        await Notifications.setNotificationChannelAsync('nesmo-notifications', {
          name: 'NESMO Notifications',
          description: 'News, events, payments, support, and system notifications from NESMO',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2563EB',
          sound: 'default',
        });
      }
    };
    requestPermissions();
  }, []);

  // Listen to AppState changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, []);

  // ─── Listener 1: Community mentions (existing) ───────────────────────
  // Listens to `community_messages` collection for @mentions and @everyone tags
  useEffect(() => {
    if (!db || !auth) {
      return;
    }
    const userId = user?._id || user?.id;
    if (!userId) {
      return;
    }

    let unsubscribeFirestore: (() => void) | null = null;

    const setupListener = (firebaseUser: any) => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      if (!firebaseUser) {
        return;
      }

      const mountTime = Date.now();
      const seenIds = new Set<string>();

      const q = query(
        collection(db, 'community_messages'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const msg = { id: change.doc.id, ...change.doc.data() } as any;

            if (seenIds.has(msg.id)) return;
            seenIds.add(msg.id);

            // Convert firestore timestamp or date
            const createdAt = msg.createdAt?.toDate
              ? msg.createdAt.toDate().getTime()
              : new Date(msg.createdAt).getTime();

            // Only notify if it was created AFTER the component mounted, and not by the current user
            if (createdAt >= mountTime - 2000 && msg.authorId !== userId) {
              const mentions = Array.isArray(msg.mentions) ? msg.mentions : [];
              const isUserMentioned = mentions.includes(userId) || mentions.includes('everyone');

              if (isUserMentioned) {
                const title = mentions.includes('everyone') ? "NESMO Community Broadcast" : "Tagged in Community";
                const messageText = `${msg.authorName}: ${msg.text}`;

                try {
                  // Trigger native Android system notification
                  await Notifications.scheduleNotificationAsync({
                    content: {
                      title: title,
                      body: messageText,
                      sound: true,
                      priority: Notifications.AndroidNotificationPriority.HIGH,
                    },
                    trigger: {
                      channelId: 'default',
                    },
                  });
                } catch (err) {
                  console.error("Failed to schedule community mention notification:", err);
                }

                // Also show toast notification if the app is currently in the foreground (active)
                if (appState.current === 'active') {
                  toast.show(title, {
                    type: 'normal',
                    data: {
                      title: title,
                      message: messageText,
                    },
                    duration: 4000,
                    style: { backgroundColor: '#2563EB', borderRadius: 10, padding: 12, marginTop: 40 },
                    textStyle: { color: '#ffffff', fontWeight: 'bold' },
                  });
                }
              }
            }
          }
        });
      }, (error) => {
        console.error("Firestore community mention listener error:", error);
      });
    };

    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser: any) => {
      setupListener(firebaseUser);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [user?._id, user?.id]);

  // ─── Listener 2: Notifications collection (NEW) ───────────────────────
  // Listens to `notifications` collection for all notification types
  // (NEWS, EVENT, SUPPORT, PAYMENT, SYSTEM) targeted at this user.
  // Fires both system notification + foreground toast.
  // Also updates the global unread count in Redux.
  useEffect(() => {
    if (!db || !auth) {
      return;
    }

    // We need the user object to know they're logged in,
    // but we use the Firebase UID for the Firestore query since
    // the backend stores `recipient` as the Firebase UID.
    if (!user) {
      dispatch(setUnreadCount(0));
      return;
    }

    let unsubscribeFirestore: (() => void) | null = null;

    const setupNotificationsListener = (firebaseUser: any) => {
      // Clean up previous listener
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      if (!firebaseUser) {
        return;
      }

      const firebaseUid = firebaseUser.uid;

      const mountTime = Date.now();
      const seenNotifIds = new Set<string>();

      // Query notifications for this user, ordered by newest first
      const notifQuery = query(
        collection(db, 'notifications'),
        where('recipient', '==', firebaseUid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      unsubscribeFirestore = onSnapshot(notifQuery, (snapshot) => {
        // ── Update unread count from full snapshot ──
        let unread = 0;
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (!data.isRead) {
            unread++;
          }
        });
        dispatch(setUnreadCount(unread));

        // ── Fire notifications for newly added documents ──
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const notif = { id: change.doc.id, ...change.doc.data() } as any;

            // Skip if we've already processed this notification
            if (seenNotifIds.has(notif.id)) return;
            seenNotifIds.add(notif.id);

            // Convert Firestore timestamp to epoch ms
            const createdAt = notif.createdAt?.toDate
              ? notif.createdAt.toDate().getTime()
              : (notif.createdAt instanceof Date
                ? notif.createdAt.getTime()
                : new Date(notif.createdAt).getTime());

            // Only fire notification for documents created AFTER mount
            // (avoid replaying all existing notifications on app start)
            if (createdAt < mountTime - 2000) return;

            // Skip if already read
            if (notif.isRead) return;

            const title = notif.title || 'NESMO Notification';
            const body = notif.message || '';

            // ── Always fire Android system notification ──
            // This works both in foreground and background (when app is minimized)
            try {
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: title,
                  body: body,
                  sound: true,
                  priority: Notifications.AndroidNotificationPriority.HIGH,
                  data: {
                    notificationId: notif.id,
                    type: notif.type,
                    link: notif.link || '',
                  },
                },
                trigger: {
                  channelId: 'nesmo-notifications',
                },
              });
            } catch (err) {
              console.error("Failed to schedule system notification:", err);
            }

            // ── Show toast if app is in foreground ──
            if (appState.current === 'active') {
              // Choose toast color based on notification type
              const toastColors: Record<string, string> = {
                NEWS: '#10B981',
                EVENT: '#8B5CF6',
                SUPPORT: '#EF4444',
                PAYMENT: '#F59E0B',
                SYSTEM: '#2563EB',
              };
              const bgColor = toastColors[notif.type] || '#2563EB';

              toast.show(title, {
                type: 'normal',
                data: {
                  title: title,
                  message: body,
                },
                duration: 4000,
                style: {
                  backgroundColor: bgColor,
                  borderRadius: 10,
                  padding: 12,
                  marginTop: 40,
                },
                textStyle: { color: '#ffffff', fontWeight: 'bold' },
              });
            }
          }
        });
      }, (error) => {
        console.error("Firestore notifications listener error:", error);
      });
    };

    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser: any) => {
      setupNotificationsListener(firebaseUser);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [user?._id, user?.id]);

  return (
    <Stack.Navigator
      screenOptions={{}}
    >
      <Stack.Screen
        name={APP_CONSTANTS.NAVIGATION.APP_TABS}
        component={TabNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name={APP_CONSTANTS.SCREENS.PROFILE}
          component={ProfileScreen}
          options={{
            title: 'Profile',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name={APP_CONSTANTS.SCREENS.NOTIFICATIONS}
          component={NotificationsScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Group>
      <Stack.Group screenOptions={{ presentation: 'card' }}>
        <Stack.Screen
          name={APP_CONSTANTS.SCREENS.USER_MODERATION}
          component={UserModerationScreen}
          options={{
            title: 'User Moderation',
            headerShown: true,
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name={APP_CONSTANTS.SCREENS.ADMIN_DASHBOARD}
          component={AdminDashboardScreen}
          options={{
            title: 'Admin Dashboard',
            headerShown: true,
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name={APP_CONSTANTS.SCREENS.BATCH_DASHBOARD}
          component={BatchDashboardScreen}
          options={{
            title: 'Batch Dashboard',
            headerShown: false,
            headerTitleAlign: 'center',
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}
