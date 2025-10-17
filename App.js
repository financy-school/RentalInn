import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { AppRegistry, LogBox, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Context Providers
import { ThemeProvider } from './src/context/ThemeContext';
import { CredentialsProvider } from './src/context/CredentialsContext';
import { PropertyProvider } from './src/context/PropertyContext';
import { ToastProvider, useToast } from './src/context/ToastContext';

// Navigation
import RootStack from './src/navigation/RootStack';

// Components
import AppThemeWrapper from './src/context/AppThemeWrapper';
import ErrorBoundary from './src/components/ErrorBoundary';

// Utilities
import helpers from './src/navigation/helpers';

// Notification Service
import NotificationService from './src/services/NotificationService';

const { ErrorHelper, NetworkHelper } = helpers;

// Debug log to ensure helpers are imported correctly
if (__DEV__) {
  console.log('App: Helpers imported:', {
    ErrorHelper: !!ErrorHelper,
    NetworkHelper: !!NetworkHelper,
  });
}

// App metadata
import { name as appName } from './app.json';

// Ignore specific warnings in development
if (__DEV__) {
  LogBox.ignoreLogs([
    'Animated: `useNativeDriver`',
    'Setting a timer',
    'source.uri should not be an empty string',
  ]);
}

const AppContent = () => {
  const { showToast } = useToast();

  useEffect(() => {
    ErrorHelper.setToastFunction(showToast);

    // Initialize app lifecycle logging
    ErrorHelper.logInfo('App Started', 'APP_LIFECYCLE');

    // Initialize Firebase Notifications
    NotificationService.initializeNotifications();

    // Setup network monitoring
    const unsubscribeNetwork = NetworkHelper.subscribeToNetworkChanges(
      state => {
        if (__DEV__) {
          console.log('Network state changed:', state);
        }
      },
    );

    // Cleanup on unmount
    return () => {
      unsubscribeNetwork();
      NetworkHelper.unsubscribeAll();
    };
  }, [showToast]);

  return (
    <ThemeProvider>
      <CredentialsProvider>
        <PropertyProvider>
          <AppThemeWrapper>
            <StatusBar
              barStyle="dark-content"
              backgroundColor="transparent"
              translucent
            />
            <RootStack />
          </AppThemeWrapper>
        </PropertyProvider>
      </CredentialsProvider>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.safeArea}>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </SafeAreaView>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});

AppRegistry.registerComponent(appName, () => App);
export default App;
