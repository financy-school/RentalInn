import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavigationService from './NavigationService';

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
import RecordPayment from '../screens/RecordPayment';
import OnboardingScreen, {
  ONBOARDING_STORAGE_KEY,
} from '../screens/OnboardingScreen';
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

const Stack = createNativeStackNavigator();

const RootStack = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { isAuthenticated } = useContext(CredentialsContext);
  const navigationRef = React.useRef(null);

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
        // Check if user has seen onboarding
        const hasSeenOnboarding = await AsyncStorage.getItem(
          ONBOARDING_STORAGE_KEY,
        );

        // Set onboarding status first
        setShowOnboarding(!hasSeenOnboarding);
      } catch (error) {
        console.error('App initialization error:', error);
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
  }, []);

  useEffect(() => {
    const handleNavigation = async () => {
      if (isLoading) {
        return;
      }

      try {
        if (showOnboarding) {
          NavigationService.resetRoot(SCREEN_NAMES.ONBOARDING);
          return;
        }

        if (isAuthenticated) {
          await new Promise(resolve => setTimeout(resolve, 300));
          NavigationService.resetRoot(SCREEN_NAMES.DRAWER_STACK);
        } else {
          NavigationService.resetRoot(SCREEN_NAMES.LOGIN);
        }
      } catch (error) {
        NavigationService.resetRoot(SCREEN_NAMES.LOGIN);
      }
    };

    handleNavigation();
  }, [isAuthenticated, isLoading, showOnboarding]);

  // Show splash screen while loading
  if (isLoading) {
    return <SplashScreen />;
  }

  // Return the navigation structure
  return (
    <NavigationContainer
      ref={navigatorRef => {
        navigationRef.current = navigatorRef;
        NavigationService.setNavigator(navigatorRef);
      }}
      onStateChange={state => {
        if (__DEV__) {
          console.log('Navigation state changed:', state);
        }

        if (
          showOnboarding &&
          state?.routes?.[state.index]?.name !== SCREEN_NAMES.ONBOARDING
        ) {
          setShowOnboarding(false);
        }
      }}
      onReady={() => {
        if (__DEV__) {
          console.log('Navigation container ready');
        }
      }}
    >
      <Stack.Navigator
        screenOptions={defaultScreenOptions}
        initialRouteName={
          showOnboarding
            ? SCREEN_NAMES.ONBOARDING
            : isAuthenticated
            ? SCREEN_NAMES.DRAWER_STACK
            : SCREEN_NAMES.LOGIN
        }
      >
        {/* Onboarding Screen */}
        <Stack.Screen
          name={SCREEN_NAMES.ONBOARDING}
          component={OnboardingScreen}
          options={{
            ...defaultScreenOptions,
            gestureEnabled: false,
          }}
        />

        {/* Auth screens */}
        <Stack.Screen
          name={SCREEN_NAMES.LOGIN}
          component={Login}
          options={{
            ...defaultScreenOptions,
            gestureEnabled: false,
            animation: 'fade',
            animationTypeForReplace: isAuthenticated ? 'pop' : 'push',
          }}
        />
        <Stack.Screen
          name={SCREEN_NAMES.SIGNUP}
          component={SignUp}
          options={{
            ...defaultScreenOptions,
            gestureEnabled: false,
            animation: 'slide_from_right',
          }}
        />

        {/* Protected screens */}
        <Stack.Screen
          name={SCREEN_NAMES.DRAWER_STACK}
          component={DrawerStack}
          options={{
            ...defaultScreenOptions,
            gestureEnabled: false,
          }}
          listeners={{
            beforeRemove: e => {
              if (isAuthenticated) {
                e.preventDefault();
              }
            },
          }}
        />

        {/* Details Screens */}
        <Stack.Screen
          name={SCREEN_NAMES.ROOM_DETAILS}
          component={RoomDetails}
          options={{
            ...authenticatedScreenOptions,
            headerTitle: 'Room Details',
            headerTintColor: colors.black,
            headerTitleStyle: {
              fontFamily: 'Metropolis-Medium',
              fontSize: 18,
              fontWeight: '600',
            },
          }}
        />

        <Stack.Screen
          name={SCREEN_NAMES.TENANT_DETAILS}
          component={TenantDetails}
          options={{
            ...authenticatedScreenOptions,
            headerTitle: 'Tenant Details',
            headerTintColor: colors.black,
            headerTitleStyle: {
              fontFamily: 'Metropolis-Medium',
              fontSize: 18,
              fontWeight: '600',
            },
          }}
        />

        <Stack.Screen
          name={SCREEN_NAMES.NOTICES}
          component={Notices}
          options={{
            ...authenticatedScreenOptions,
            headerTitle: 'Notices',
            headerTintColor: colors.black,
            headerTitleStyle: {
              fontFamily: 'Metropolis-Medium',
              fontSize: 18,
              fontWeight: '600',
            },
          }}
        />

        <Stack.Screen
          name={SCREEN_NAMES.FAQ}
          component={FAQ}
          options={{
            ...authenticatedScreenOptions,
            headerTitle: 'FAQ',
            headerTintColor: colors.black,
            headerTitleStyle: {
              fontFamily: 'Metropolis-Medium',
              fontSize: 18,
              fontWeight: '600',
            },
          }}
        />

        <Stack.Screen
          name={SCREEN_NAMES.CONTACT_SUPPORT}
          component={ContactSupport}
          options={{
            ...authenticatedScreenOptions,
            headerTitle: 'Contact Support',
            headerTintColor: colors.black,
            headerTitleStyle: {
              fontFamily: 'Metropolis-Medium',
              fontSize: 18,
              fontWeight: '600',
            },
          }}
        />

        <Stack.Screen
          name={SCREEN_NAMES.APP_TUTORIAL}
          component={AppTutorial}
          options={{
            ...authenticatedScreenOptions,
            headerTitle: 'App Tutorial',
            headerTintColor: colors.black,
            headerTitleStyle: {
              fontFamily: 'Metropolis-Medium',
              fontSize: 18,
              fontWeight: '600',
            },
          }}
        />

        <Stack.Screen
          name={SCREEN_NAMES.RECORD_PAYMENT}
          component={RecordPayment}
          options={{
            ...authenticatedScreenOptions,
            headerTitle: 'Record Payment',
            headerTintColor: colors.black,
            presentation: 'modal',
            animation: 'slide_from_bottom',
            headerTitleStyle: {
              fontFamily: 'Metropolis-Medium',
              fontSize: 18,
              fontWeight: '600',
            },
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
              headerLeft: () => null,
              headerShown: false,
              headerTitleStyle: {
                fontFamily: 'Metropolis-Medium',
                fontSize: 18,
                fontWeight: '600',
              },
            }}
          />

          <Stack.Screen
            name={SCREEN_NAMES.ADD_TENANT}
            component={AddTenant}
            options={{
              headerLeft: () => null,
              headerTitleStyle: {
                fontFamily: 'Metropolis-Medium',
                fontSize: 18,
                fontWeight: '600',
              },
            }}
          />

          <Stack.Screen
            name={SCREEN_NAMES.ADD_TICKET}
            component={AddTicket}
            options={{
              headerTitle: 'Add Ticket',
              headerLeft: () => null,
              headerTitleStyle: {
                fontFamily: 'Metropolis-Medium',
                fontSize: 18,
                fontWeight: '600',
              },
            }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootStack;
