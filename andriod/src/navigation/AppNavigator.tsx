/**
 * @fileoverview Main Application Navigation Stack
 * Navigation for authenticated users (home, profile, directory, etc.)
 * 
 * @module navigation/AppNavigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/App/HomeScreen';
import ProfileScreen from '../screens/App/ProfileScreen';
import DirectoryScreen from '../screens/App/DirectoryScreen';
import EventsScreen from '../screens/App/EventsScreen';
import MembershipScreen from '../screens/App/MembershipScreen';
import SettingsScreen from '../screens/App/SettingsScreen';
import UserModerationScreen from '../screens/App/UserModerationScreen';
import AdminDashboardScreen from '../screens/App/AdminDashboardScreen';

import { APP_CONSTANTS } from '../constants';
import { Ionicons } from '@expo/vector-icons';

/**
 * App Tab navigation parameter list
 * Defines tab-based screens
 */
export type AppTabParamList = {
  [APP_CONSTANTS.SCREENS.HOME]: undefined;
  [APP_CONSTANTS.SCREENS.DIRECTORY]: undefined;
  [APP_CONSTANTS.SCREENS.EVENTS]: undefined;
  [APP_CONSTANTS.SCREENS.MEMBERSHIP]: undefined;
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
  };
  [APP_CONSTANTS.SCREENS.USER_MODERATION]: undefined;
  [APP_CONSTANTS.SCREENS.ADMIN_DASHBOARD]: undefined;
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
            case APP_CONSTANTS.SCREENS.MEMBERSHIP:
              iconName = focused ? 'card' : 'card-outline';
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
        }}
      />
      <Tab.Screen
        name={APP_CONSTANTS.SCREENS.EVENTS}
        component={EventsScreen}
        options={{
          title: 'Events',
        }}
      />
      <Tab.Screen
        name={APP_CONSTANTS.SCREENS.MEMBERSHIP}
        component={MembershipScreen}
        options={{
          title: 'Membership',
        }}
      />
      <Tab.Screen
        name={APP_CONSTANTS.SCREENS.PROFILE}
        component={SettingsScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * App Stack Navigator
 * Main application navigation with tab-based main screens and modal screens
 * 
 * @component
 * @returns {JSX.Element} App stack navigator
 */
export default function AppNavigator() {
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
      </Stack.Group>
    </Stack.Navigator>
  );
}
