/**
 * @fileoverview Authentication Navigation Stack
 * Navigation for unauthenticated users (login only - Firebase Sign-In handles signup)
 * 
 * @module navigation/AuthNavigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';
import VerifyEmailScreen from '../screens/Auth/VerifyEmailScreen';
import { APP_CONSTANTS } from '../constants';

/**
 * Auth navigation parameter list
 */
export type AuthParamList = {
  [APP_CONSTANTS.SCREENS.LOGIN]: undefined;
  [APP_CONSTANTS.SCREENS.SIGNUP]: undefined;
  [APP_CONSTANTS.SCREENS.VERIFY_EMAIL]: { email: string };
};

/**
 * Navigation props type for auth screens
 */
export type AuthScreenProps<T extends keyof AuthParamList> = NativeStackScreenProps<
  AuthParamList,
  T
>;

const Stack = createNativeStackNavigator<AuthParamList>();

/**
 * Authentication Navigator
 * Shows Firebase Google Sign-In screen
 * 
 * @component
 * @returns {JSX.Element} Auth stack navigator
 */
export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name={APP_CONSTANTS.SCREENS.LOGIN}
        component={LoginScreen}
        options={{
          animationTypeForReplace: 'pop',
        }}
      />
      <Stack.Screen
        name={APP_CONSTANTS.SCREENS.SIGNUP}
        component={SignupScreen}
      />
      <Stack.Screen
        name={APP_CONSTANTS.SCREENS.VERIFY_EMAIL}
        component={VerifyEmailScreen}
      />
    </Stack.Navigator>
  );
}
