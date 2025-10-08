import React, { useMemo, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Platform,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Screens
import Home from '../screens/Home';
import Rooms from '../screens/Rooms';
import Tenants from '../screens/Tenant';
import Tickets from '../screens/Tickets';

// Theme
import colors from '../theme/colors';
import { FONT_WEIGHT } from '../theme/layout';

// Constants
import { SCREEN_NAMES } from './constants';

const Tab = createBottomTabNavigator();
const { height: screenHeight } = Dimensions.get('window');

// Tab configuration for better maintainability
const TAB_CONFIG = [
  {
    name: SCREEN_NAMES.DASHBOARD,
    component: Home,
    label: 'Dashboard',
    iconLibrary: MaterialCommunityIcons,
    focusedIcon: 'view-dashboard',
    unfocusedIcon: 'view-dashboard-outline',
    gradient: ['#667eea', '#764ba2'],
  },
  {
    name: SCREEN_NAMES.ROOMS,
    component: Rooms,
    label: 'Rooms',
    iconLibrary: MaterialCommunityIcons,
    focusedIcon: 'door-open',
    unfocusedIcon: 'door-closed',
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    name: SCREEN_NAMES.TENANTS,
    component: Tenants,
    label: 'Tenants',
    iconLibrary: Ionicons,
    focusedIcon: 'people',
    unfocusedIcon: 'people-outline',
    gradient: ['#4facfe', '#00f2fe'],
  },
  {
    name: SCREEN_NAMES.TICKETS,
    component: Tickets,
    label: 'Tickets',
    iconLibrary: MaterialCommunityIcons,
    focusedIcon: 'ticket',
    unfocusedIcon: 'ticket-outline',
    gradient: ['#43e97b', '#38f9d7'],
  },
];

// Custom tab bar icon component moved outside render
const TabBarIcon = ({ focused, color, size, iconConfig }) => {
  const IconComponent = iconConfig.iconLibrary;
  const iconName = focused ? iconConfig.focusedIcon : iconConfig.unfocusedIcon;

  return (
    <IconComponent
      name={iconName}
      size={focused ? size + 2 : size}
      color={color}
      style={[styles.tabIcon, focused && styles.tabIconFocused]}
    />
  );
};

// Custom tab button component moved outside render
const CustomTabButton = props => (
  <TouchableOpacity
    {...props}
    activeOpacity={0.8}
    style={[
      props.style,
      styles.tabButton,
      props.accessibilityState?.selected && styles.tabButtonFocused,
    ]}
  />
);

const BottomNavigation = () => {
  // Memoize tab bar height for different screen sizes
  const tabBarHeight = useMemo(() => {
    const baseHeight = Platform.OS === 'ios' ? 85 : 65;

    // Adjust for different screen sizes
    if (screenHeight < 700) {
      return baseHeight - 10;
    } else if (screenHeight > 900) {
      return baseHeight + 5;
    }

    return baseHeight;
  }, []);

  // Memoize tab bar styles
  const tabBarStyles = useMemo(
    () => ({
      ...styles.tabBar,
      height: tabBarHeight,
      paddingBottom: Platform.OS === 'ios' ? 20 : 10,
      paddingTop: 10,
    }),
    [tabBarHeight],
  );

  // Memoize screen options for performance
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary || '#8E8E93',
      tabBarShowLabel: true,
      tabBarHideOnKeyboard: Platform.OS === 'android',

      tabBarStyle: tabBarStyles,

      tabBarLabelStyle: styles.tabLabel,
      tabBarIconStyle: styles.tabIconContainer,
      tabBarButton: CustomTabButton,

      // Accessibility improvements
      tabBarAccessibilityLabel: 'Main navigation tabs',
      tabBarRole: 'tablist',
    }),
    [tabBarStyles],
  );

  // Memoized tab screen renderer
  const renderTabScreen = useCallback(
    tab => (
      <Tab.Screen
        key={tab.name}
        name={tab.name}
        component={tab.component}
        options={{
          tabBarLabel: tab.label,
          tabBarIcon: props => <TabBarIcon {...props} iconConfig={tab} />,

          // Enhanced accessibility
          tabBarAccessibilityLabel: `${tab.label} tab`,
          tabBarTestID: `${tab.name.toLowerCase()}-tab`,

          // Badge styling
          tabBarBadgeStyle: styles.tabBadge,

          // Individual tab styling
          tabBarItemStyle: styles.tabItem,
        }}
      />
    ),
    [],
  );

  return (
    <Tab.Navigator
      initialRouteName={SCREEN_NAMES.DASHBOARD}
      screenOptions={screenOptions}
      backBehavior="history"
      screenListeners={{
        tabPress: e => {
          // Optional: Add haptic feedback on iOS
          if (Platform.OS === 'ios') {
            // You can add haptic feedback here if react-native-haptic-feedback is installed
            // HapticFeedback.impact(HapticFeedback.ImpactFeedbackStyle.Light);
          }

          if (__DEV__) {
            console.log('Tab pressed:', e.target?.split('-')[0]);
          }
        },
      }}
    >
      {TAB_CONFIG.map(renderTabScreen)}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 8,

    // Professional shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,

    // Moderate elevation for Android
    elevation: 4,
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 2,
  },

  tabButtonFocused: {
    backgroundColor: 'rgba(102, 126, 234, 0.08)',
  },

  tabLabel: {
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'Metropolis-Medium',
      default: 'System',
    }),
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },

  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabIcon: {
    marginBottom: Platform.OS === 'ios' ? 2 : 1,
  },

  tabIconFocused: {
    // Subtle shadow for focused icon
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },

  tabBadge: {
    backgroundColor: colors.error || '#FF3B30',
    color: colors.white,
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.white,
  },

  tabItem: {
    paddingVertical: 4,
    marginHorizontal: 2,
  },
});

export default BottomNavigation;
