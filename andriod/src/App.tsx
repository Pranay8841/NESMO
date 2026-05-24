/**
 * @fileoverview Root App Component
 * Wraps the entire app with Redux Provider and Navigation
 * Initializes API connector with store reference
 * 
 * @module App
 */

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastProvider } from 'react-native-toast-notifications';

import { store } from './redux/store';
import { initializeApiConnector } from './utils/APIsConnector';
import RootNavigator from './navigation/RootNavigator';

/**
 * Initialize API connector with Redux store reference
 * This allows the API connector to access Redux state and dispatch actions
 */
initializeApiConnector(store);

/**
 * Root App Component
 * Provides Redux store and navigation to the entire app
 * 
 * @component
 * @returns {JSX.Element} App with providers
 */
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <ToastProvider placement="top" offsetTop={60} duration={3000}>
          <RootNavigator />
        </ToastProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
