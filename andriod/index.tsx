/**
 * @fileoverview Entry Point for Expo
 * Registers the main App component for native platforms (Android/iOS)
 */

import { registerRootComponent } from 'expo';
import App from './src/App';

registerRootComponent(App);
