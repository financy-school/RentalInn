import React, { useMemo } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Platform, Dimensions } from 'react-native';

// Components
import BottomNavigation from './BottomNavigation';
import DrawerContent from '../screens/pages/Drawer';

// Theme
import colors from '../theme/colors';

const Drawer = createDrawerNavigator();
const { width: screenWidth } = Dimensions.get('window');

const DrawerStack = () => {
  // Memoize drawer width for performance
  const drawerWidth = useMemo(() => {
    // Responsive drawer width based on screen size
    if (Platform.OS === 'web') {
      return Math.min(400, screenWidth * 0.8);
    }

    // For mobile devices
    if (screenWidth < 375) {
      return screenWidth * 0.85; // Smaller phones
    } else if (screenWidth < 414) {
      return screenWidth * 0.82; // Medium phones
    } else {
      return screenWidth * 0.8; // Larger phones and tablets
    }
  }, []);

  // Memoize screen options for performance
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      drawerPosition: 'left',
      drawerType: Platform.OS === 'ios' ? 'slide' : 'front',
      drawerHideStatusBarOnOpen: Platform.OS === 'ios',
      drawerStatusBarAnimation: 'fade',
      drawerStyle: {
        backgroundColor: colors.white,
        width: drawerWidth,
        borderTopRightRadius: Platform.OS === 'android' ? 20 : 0,
        borderBottomRightRadius: Platform.OS === 'android' ? 20 : 0,
        shadowColor: colors.black,
        shadowOffset: {
          width: 2,
          height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 10,
      },
      drawerActiveBackgroundColor: colors.primaryLight || '#e3f2fd',
      drawerActiveTintColor: colors.primary,
      drawerInactiveTintColor: colors.textSecondary || '#666',
      drawerLabelStyle: {
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
        fontSize: 16,
        marginLeft: -10,
      },
      drawerItemStyle: {
        marginVertical: 4,
        marginHorizontal: 12,
        borderRadius: 12,
        paddingVertical: 2,
      },
      // Overlay configuration
      overlayColor: 'rgba(0, 0, 0, 0.5)',

      // Gesture configuration for better UX
      swipeEnabled: true,
      swipeEdgeWidth: 50,
      swipeMinDistance: 3,

      // Animation configuration
      drawerContentContainerStyle: {
        flex: 1,
      },

      // Accessibility
      drawerContentOptions: {
        accessibilityRole: 'navigation',
        accessibilityLabel: 'Main navigation menu',
      },
    }),
    [drawerWidth],
  );

  return (
    <Drawer.Navigator
      screenOptions={screenOptions}
      drawerContent={props => (
        <DrawerContent
          {...props}
          drawerWidth={drawerWidth}
          screenWidth={screenWidth}
        />
      )}
      // Initial route
      initialRouteName="BottomNavigation"
      // Back behavior
      backBehavior="history"
      // Default status for drawer
      defaultStatus="closed"
    >
      <Drawer.Screen
        name="BottomNavigation"
        component={BottomNavigation}
        options={{
          drawerLabel: 'Home',
          drawerItemStyle: { display: 'none' }, // Hide from drawer menu
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerStack;
