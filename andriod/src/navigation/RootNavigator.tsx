/**
 * @fileoverview Root Navigator
 * Top-level navigation that switches between Auth and App stacks
 * based on authentication state
 * 
 * @module navigation/RootNavigator
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import ProfileOnboardingScreen from '../screens/Auth/ProfileOnboardingScreen';

import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { restoreToken } from '../services/authService';

const Stack = createNativeStackNavigator();

/**
 * Root Navigator Component
 * Manages navigation between Auth and App stacks
 * Restores user session on app launch
 * 
 * @component
 * @returns {JSX.Element} Navigation container with appropriate stack
 */
export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  /**
   * On app mount, check if user has a valid token in AsyncStorage
   * This restores the session after app is closed/reopened
   */
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Check for stored token
        const storedToken = await AsyncStorage.getItem('authToken');

        if (storedToken) {
          // Dispatch thunk to restore token and verify with backend
          await dispatch(restoreToken());
        }
      } catch (error) {
        console.warn('Failed to restore token:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    bootstrapAsync();
  }, [dispatch]);

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token && user && user.isOnboarded === false ? (
          <Stack.Screen
            name="ProfileOnboarding"
            component={ProfileOnboardingScreen}
          />
        ) : (
          <>
            <Stack.Screen
              name="AppStack"
              component={AppNavigator}
            />
            <Stack.Screen
              name="AuthStack"
              component={AuthNavigator}
              options={{
                presentation: 'modal',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
