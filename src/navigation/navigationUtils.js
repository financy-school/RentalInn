// Navigation utility functions
import { SCREEN_NAMES } from './constants';

/**
 * Determines if a route is a bottom tab route
 * @param {string} route - The route name to check
 * @returns {boolean} - True if it's a bottom tab route
 */
export const isBottomTabRoute = route => {
  const bottomTabRoutes = [
    SCREEN_NAMES.DASHBOARD,
    SCREEN_NAMES.ROOMS,
    SCREEN_NAMES.TENANTS,
    SCREEN_NAMES.TICKETS,
  ];

  return bottomTabRoutes.includes(route);
};

/**
 * Navigates to the appropriate screen based on route type
 * @param {object} navigation - React Navigation navigation object
 * @param {string} route - The route name to navigate to
 * @param {object} params - Optional parameters to pass
 */
export const navigateToRoute = (navigation, route, params = {}) => {
  try {
    if (isBottomTabRoute(route)) {
      // Navigate to bottom tab screens
      navigation.navigate(SCREEN_NAMES.DRAWER_STACK, {
        screen: SCREEN_NAMES.BOTTOM_NAVIGATION,
        params: { screen: route, ...params },
      });
    } else {
      // Navigate to stack screens (like Notices, Settings, etc.)
      navigation.navigate(route, params);
    }

    // Optional: Track navigation analytics
    if (__DEV__) {
      console.log('Navigation:', { route, params });
    }
  } catch (error) {
    console.error('Navigation error:', error);
  }
};

/**
 * Gets the proper navigation parameters for a route
 * @param {string} route - The route name
 * @param {object} params - Additional parameters
 * @returns {object} - Navigation parameters
 */
export const getNavigationParams = (route, params = {}) => {
  if (isBottomTabRoute(route)) {
    return {
      screen: SCREEN_NAMES.DRAWER_STACK,
      params: {
        screen: SCREEN_NAMES.BOTTOM_NAVIGATION,
        params: { screen: route, ...params },
      },
    };
  }

  return { screen: route, params };
};

/**
 * Validates if a route exists in the screen names
 * @param {string} route - The route name to validate
 * @returns {boolean} - True if the route exists
 */
export const isValidRoute = route => {
  return Object.values(SCREEN_NAMES).includes(route);
};

/**
 * Gets all available routes
 * @returns {array} - Array of all screen names
 */
export const getAllRoutes = () => {
  return Object.values(SCREEN_NAMES);
};

/**
 * Gets routes by category
 * @param {string} category - The category to filter by
 * @returns {array} - Array of routes in the category
 */
export const getRoutesByCategory = category => {
  const categories = {
    auth: [SCREEN_NAMES.LOGIN, SCREEN_NAMES.SIGNUP],
    main: [SCREEN_NAMES.DRAWER_STACK, SCREEN_NAMES.BOTTOM_NAVIGATION],
    bottomTab: [
      SCREEN_NAMES.DASHBOARD,
      SCREEN_NAMES.ROOMS,
      SCREEN_NAMES.TENANTS,
      SCREEN_NAMES.TICKETS,
    ],
    details: [
      SCREEN_NAMES.ROOM_DETAILS,
      SCREEN_NAMES.TENANT_DETAILS,
      SCREEN_NAMES.TICKET_DETAILS,
    ],
    modal: [
      SCREEN_NAMES.ADD_ROOM,
      SCREEN_NAMES.ADD_TENANT,
      SCREEN_NAMES.ADD_TICKET,
    ],
    additional: [
      SCREEN_NAMES.NOTICES,
      SCREEN_NAMES.SETTINGS,
      SCREEN_NAMES.PAYMENTS,
      SCREEN_NAMES.KYC,
      SCREEN_NAMES.STAFF,
      SCREEN_NAMES.UTILITIES,
      SCREEN_NAMES.INVENTORY,
      SCREEN_NAMES.SUPPORT,
    ],
  };

  return categories[category] || [];
};

export default {
  isBottomTabRoute,
  navigateToRoute,
  getNavigationParams,
  isValidRoute,
  getAllRoutes,
  getRoutesByCategory,
};
