import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Screens
import Login from '../screens/Login';
import SignUp from '../screens/Signup';
import SplashScreen from '../components/SplashScreen';
import DrawerStack from './DrawerNavigation';
import RoomDetails from '../screens/RoomDetails';
import TenantDetails from '../screens/TenantDetails';
import AddRoom from '../screens/AddRoom';
import AddTenant from '../screens/AddTenant';
import AddTicket from '../screens/AddTicket';
import Notices from '../screens/Notices';
import FAQ from '../screens/FAQ';
import ContactSupport from '../screens/ContactSupport';
import AppTutorial from '../screens/AppTutorial';

// Context
import { CredentialsContext } from '../context/CredentialsContext';

// Theme
import colors from '../theme/color';

// Constants
import { SCREEN_NAMES } from './constants';

// Constants
const SPLASH_SCREEN_DURATION = 2000;
const TOKEN_STORAGE_KEY = 'pgOwnerCredentials';

const Stack = createNativeStackNavigator();

const RootStack = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { credentials, setCredentials, isAuthenticated } =
    useContext(CredentialsContext);

  // Default screen options for better consistency
  const defaultScreenOptions = {
    headerShown: false,
    headerStyle: {
      backgroundColor: colors.white,
    },
    headerTintColor: colors.primary,
    headerTransparent: false,
    headerLeftContainerStyle: {
      paddingLeft: 16,
    },
    headerRightContainerStyle: {
      paddingRight: 16,
    },
    headerTitleStyle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
    },
    headerShadowVisible: false,
    headerBackTitleVisible: false,
    animation: 'slide_from_right',
  };

  // Enhanced header options for authenticated screens
  const authenticatedScreenOptions = {
    ...defaultScreenOptions,
    headerShown: true,
    headerTitleAlign: 'center',
    headerBackButtonMenuEnabled: false,
    headerBackTitle: '',
    headerBackButtonVisible: true,
    headerPressColor: colors.primary,
    headerPressOpacity: 0.8,
  };

  // App initialization effect
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);

        if (storedToken) {
          // Parse and set the stored credentials
          const storedCredentials = JSON.parse(storedToken);
          // Validate the stored credentials before setting
          if (
            storedCredentials &&
            typeof storedCredentials === 'object' &&
            storedCredentials.email
          ) {
            setCredentials(storedCredentials);
          } else {
            console.warn('Invalid stored credentials format, clearing...');
            await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('App initialization error:', error);
        // Clear potentially corrupted storage
        try {
          await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
        } catch (clearError) {
          console.error('Failed to clear corrupted storage:', clearError);
        }

        // Optional: Show error alert in development
        if (__DEV__) {
          Alert.alert(
            'Initialization Error',
            'Failed to initialize app. Please restart.',
          );
        }
      }
    };

    const initApp = async () => {
      await initializeApp();

      // Ensure minimum splash screen duration for better UX
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, SPLASH_SCREEN_DURATION);

      return () => clearTimeout(timer);
    };

    initApp();
  }, [setCredentials]);

  // Show splash screen while loading
  if (isLoading) {
    return <SplashScreen />;
  }

  // Determine initial route based on authentication status from CredentialsContext
  const initialRouteName = isAuthenticated
    ? SCREEN_NAMES.DRAWER_STACK
    : SCREEN_NAMES.LOGIN;

  return (
    <NavigationContainer
      onStateChange={state => {
        // Optional: Log navigation state changes in development
        if (__DEV__) {
          console.log('Navigation state changed:', state);
        }
      }}
      onReady={() => {
        // Optional: Analytics or crash reporting initialization
        if (__DEV__) {
          console.log('Navigation container ready');
        }
      }}
    >
      <Stack.Navigator
        screenOptions={defaultScreenOptions}
        initialRouteName={initialRouteName}
      >
        {isAuthenticated ? (
          // Authenticated user screens
          <>
            <Stack.Screen
              name={SCREEN_NAMES.DRAWER_STACK}
              component={DrawerStack}
              options={{
                ...defaultScreenOptions,
                gestureEnabled: false, // Prevent swipe back on main screen
              }}
            />

            <Stack.Screen
              name={SCREEN_NAMES.ROOM_DETAILS}
              component={RoomDetails}
              options={{
                ...authenticatedScreenOptions,
                headerTitle: 'Room Details',
                headerTintColor: colors.black,
              }}
            />

            <Stack.Screen
              name={SCREEN_NAMES.TENANT_DETAILS}
              component={TenantDetails}
              options={{
                ...authenticatedScreenOptions,
                headerTitle: 'Tenant Details',
                headerTintColor: colors.black,
              }}
            />

            <Stack.Screen
              name={SCREEN_NAMES.NOTICES}
              component={Notices}
              options={{
                ...authenticatedScreenOptions,
                headerTitle: 'Notices',
                headerTintColor: colors.black,
              }}
            />

            <Stack.Screen
              name={SCREEN_NAMES.FAQ}
              component={FAQ}
              options={{
                ...authenticatedScreenOptions,
                headerTitle: 'FAQ',
                headerTintColor: colors.black,
              }}
            />

            <Stack.Screen
              name={SCREEN_NAMES.CONTACT_SUPPORT}
              component={ContactSupport}
              options={{
                ...authenticatedScreenOptions,
                headerTitle: 'Contact Support',
                headerTintColor: colors.black,
              }}
            />

            <Stack.Screen
              name={SCREEN_NAMES.APP_TUTORIAL}
              component={AppTutorial}
              options={{
                ...authenticatedScreenOptions,
                headerTitle: 'App Tutorial',
                headerTintColor: colors.black,
              }}
            />

            <Stack.Group
              screenOptions={{
                ...authenticatedScreenOptions,
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            >
              <Stack.Screen
                name={SCREEN_NAMES.ADD_ROOM}
                component={AddRoom}
                options={{
                  headerTitle: 'Add Room',
                  headerLeft: () => null, // Remove back button for modal
                }}
              />

              <Stack.Screen
                name={SCREEN_NAMES.ADD_TENANT}
                component={AddTenant}
                options={{
                  headerTitle: 'Add Tenant',
                  headerLeft: () => null,
                }}
              />

              <Stack.Screen
                name={SCREEN_NAMES.ADD_TICKET}
                component={AddTicket}
                options={{
                  headerTitle: 'Add Ticket',
                  headerLeft: () => null,
                }}
              />
            </Stack.Group>
          </>
        ) : (
          // Unauthenticated user screens
          <Stack.Group
            screenOptions={{
              ...defaultScreenOptions,
              gestureEnabled: false, // Prevent swipe back on auth screens
              animation: 'fade',
            }}
          >
            <Stack.Screen
              name={SCREEN_NAMES.LOGIN}
              component={Login}
              options={{
                animationTypeForReplace: credentials ? 'pop' : 'push',
              }}
            />
            <Stack.Screen
              name={SCREEN_NAMES.SIGNUP}
              component={SignUp}
              options={{
                animation: 'slide_from_right',
              }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootStack;
