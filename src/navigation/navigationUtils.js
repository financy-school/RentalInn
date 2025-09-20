import { SCREEN_NAMES } from './constants';
import NavigationService from './NavigationService';

// Route type definitions
const ROUTE_TYPES = {
  BOTTOM_TAB: 'bottom_tab',
  STACK: 'stack',
  MODAL: 'modal',
  DRAWER: 'drawer',
};

// Route configuration mapping
const ROUTE_CONFIG = {
  [SCREEN_NAMES.DASHBOARD]: {
    type: ROUTE_TYPES.BOTTOM_TAB,
    parent: SCREEN_NAMES.BOTTOM_NAVIGATION,
    requiresAuth: true,
  },
  [SCREEN_NAMES.ROOMS]: {
    type: ROUTE_TYPES.BOTTOM_TAB,
    parent: SCREEN_NAMES.BOTTOM_NAVIGATION,
    requiresAuth: true,
  },
  [SCREEN_NAMES.TENANTS]: {
    type: ROUTE_TYPES.BOTTOM_TAB,
    parent: SCREEN_NAMES.BOTTOM_NAVIGATION,
    requiresAuth: true,
  },
  [SCREEN_NAMES.TICKETS]: {
    type: ROUTE_TYPES.BOTTOM_TAB,
    parent: SCREEN_NAMES.BOTTOM_NAVIGATION,
    requiresAuth: true,
  },
  [SCREEN_NAMES.ROOM_DETAILS]: {
    type: ROUTE_TYPES.STACK,
    requiresAuth: true,
  },
  [SCREEN_NAMES.TENANT_DETAILS]: {
    type: ROUTE_TYPES.STACK,
    requiresAuth: true,
  },
  [SCREEN_NAMES.ADD_ROOM]: {
    type: ROUTE_TYPES.MODAL,
    requiresAuth: true,
  },
  [SCREEN_NAMES.ADD_TENANT]: {
    type: ROUTE_TYPES.MODAL,
    requiresAuth: true,
  },
  [SCREEN_NAMES.ADD_TICKET]: {
    type: ROUTE_TYPES.MODAL,
    requiresAuth: true,
  },
  [SCREEN_NAMES.RECORD_PAYMENT]: {
    type: ROUTE_TYPES.MODAL,
    requiresAuth: true,
  },
  [SCREEN_NAMES.NOTICES]: {
    type: ROUTE_TYPES.STACK,
    requiresAuth: true,
  },
  [SCREEN_NAMES.FAQ]: {
    type: ROUTE_TYPES.STACK,
    requiresAuth: true,
  },
  [SCREEN_NAMES.CONTACT_SUPPORT]: {
    type: ROUTE_TYPES.STACK,
    requiresAuth: true,
  },
  [SCREEN_NAMES.APP_TUTORIAL]: {
    type: ROUTE_TYPES.STACK,
    requiresAuth: true,
  },
  [SCREEN_NAMES.LOGIN]: {
    type: ROUTE_TYPES.STACK,
    requiresAuth: false,
  },
  [SCREEN_NAMES.SIGNUP]: {
    type: ROUTE_TYPES.STACK,
    requiresAuth: false,
  },
  [SCREEN_NAMES.ONBOARDING]: {
    type: ROUTE_TYPES.STACK,
    requiresAuth: false,
  },
};

/**
 * Enhanced navigation utilities with better error handling and validation
 */
class NavigationUtils {
  /**
   * Get route configuration
   * @param {string} route - Route name
   * @returns {Object|null} - Route configuration
   */
  static getRouteConfig(route) {
    return ROUTE_CONFIG[route] || null;
  }

  /**
   * Check if route is a bottom tab route
   * @param {string} route - Route name to check
   * @returns {boolean} - True if it's a bottom tab route
   */
  static isBottomTabRoute(route) {
    const config = this.getRouteConfig(route);
    return config?.type === ROUTE_TYPES.BOTTOM_TAB;
  }

  /**
   * Check if route is a modal route
   * @param {string} route - Route name to check
   * @returns {boolean} - True if it's a modal route
   */
  static isModalRoute(route) {
    const config = this.getRouteConfig(route);
    return config?.type === ROUTE_TYPES.MODAL;
  }

  /**
   * Check if route requires authentication
   * @param {string} route - Route name to check
   * @returns {boolean} - True if authentication is required
   */
  static requiresAuth(route) {
    const config = this.getRouteConfig(route);
    return config?.requiresAuth !== false; // Default to true if not specified
  }

  /**
   * Validate if a route exists
   * @param {string} route - Route name to validate
   * @returns {boolean} - True if the route exists
   */
  static isValidRoute(route) {
    return Object.values(SCREEN_NAMES).includes(route);
  }

  /**
   * Enhanced navigation function with validation and error handling
   * @param {Object} navigation - React Navigation navigation object (optional)
   * @param {string} route - Route name to navigate to
   * @param {Object} params - Navigation parameters
   * @param {Object} options - Navigation options
   * @returns {Promise<boolean>} - Success status
   */
  static async navigateToRoute(
    navigation = null,
    route,
    params = {},
    options = {},
  ) {
    // Validation
    if (!this.isValidRoute(route)) {
      console.error(`Invalid route: ${route}`);
      return false;
    }

    const config = this.getRouteConfig(route);
    const {
      replace = false,
      reset = false,
      useNavigationService = true,
      fallbackRoute = null,
    } = options;

    try {
      // Use NavigationService if available and requested
      if (useNavigationService && NavigationService.isReady()) {
        return await this._navigateWithService(route, params, config, {
          replace,
          reset,
          fallbackRoute,
        });
      }

      // Use provided navigation object
      if (navigation) {
        return this._navigateWithObject(navigation, route, params, config, {
          replace,
          reset,
        });
      }

      console.error('No navigation method available');
      return false;
    } catch (error) {
      console.error('Navigation failed:', error);

      // Try fallback route if provided
      if (fallbackRoute && fallbackRoute !== route) {
        console.log(`Trying fallback route: ${fallbackRoute}`);
        return this.navigateToRoute(navigation, fallbackRoute, params, {
          ...options,
          fallbackRoute: null, // Prevent infinite recursion
        });
      }

      return false;
    }
  }

  /**
   * Navigate using NavigationService
   * @private
   */
  static async _navigateWithService(route, params, config, options) {
    const { replace, reset, fallbackRoute } = options;

    if (reset) {
      return NavigationService.resetRoot(route, params);
    }

    if (replace) {
      return NavigationService.replace(route, params);
    }

    // Handle different route types
    switch (config?.type) {
      case ROUTE_TYPES.BOTTOM_TAB:
        return NavigationService.navigateToTab(route, params);

      case ROUTE_TYPES.MODAL:
        return NavigationService.push(route, params);

      default:
        return NavigationService.navigate(route, params);
    }
  }

  /**
   * Navigate using navigation object
   * @private
   */
  static _navigateWithObject(navigation, route, params, config, options) {
    const { replace, reset } = options;

    if (reset) {
      navigation.reset({
        index: 0,
        routes: [{ name: route, params }],
      });
      return true;
    }

    if (replace) {
      navigation.replace(route, params);
      return true;
    }

    // Handle different route types
    switch (config?.type) {
      case ROUTE_TYPES.BOTTOM_TAB:
        navigation.navigate(SCREEN_NAMES.DRAWER_STACK, {
          screen: SCREEN_NAMES.BOTTOM_NAVIGATION,
          params: { screen: route, params },
        });
        break;

      default:
        navigation.navigate(route, params);
        break;
    }

    return true;
  }

  /**
   * Get proper navigation parameters for nested navigators
   * @param {string} route - Route name
   * @param {Object} params - Route parameters
   * @returns {Object} - Navigation parameters
   */
  static getNavigationParams(route, params = {}) {
    const config = this.getRouteConfig(route);

    if (config?.type === ROUTE_TYPES.BOTTOM_TAB) {
      return {
        screen: SCREEN_NAMES.DRAWER_STACK,
        params: {
          screen: SCREEN_NAMES.BOTTOM_NAVIGATION,
          params: { screen: route, params },
        },
      };
    }

    return { screen: route, params };
  }

  /**
   * Get all routes by category
   * @param {string} category - Category to filter by
   * @returns {Array} - Array of route names
   */
  static getRoutesByCategory(category) {
    const routes = Object.keys(ROUTE_CONFIG);

    switch (category) {
      case 'auth':
        return routes.filter(route => !this.requiresAuth(route));

      case 'protected':
        return routes.filter(route => this.requiresAuth(route));

      case 'bottomTab':
        return routes.filter(route => this.isBottomTabRoute(route));

      case 'modal':
        return routes.filter(route => this.isModalRoute(route));

      case 'stack':
        return routes.filter(route => {
          const config = this.getRouteConfig(route);
          return config?.type === ROUTE_TYPES.STACK;
        });

      default:
        return routes;
    }
  }

  /**
   * Get route breadcrumbs for navigation hierarchy
   * @param {string} route - Current route
   * @returns {Array} - Array of route breadcrumbs
   */
  static getRouteBreadcrumbs(route) {
    const config = this.getRouteConfig(route);
    const breadcrumbs = [route];

    if (config?.parent) {
      breadcrumbs.unshift(...this.getRouteBreadcrumbs(config.parent));
    }

    return breadcrumbs;
  }

  /**
   * Check if navigation to route is allowed based on current state
   * @param {string} route - Target route
   * @param {Object} authState - Current authentication state
   * @returns {Object} - Validation result
   */
  static validateNavigation(route, authState = {}) {
    const { isAuthenticated = false, permissions = [] } = authState;

    if (!this.isValidRoute(route)) {
      return {
        allowed: false,
        reason: 'invalid_route',
        message: `Route '${route}' does not exist`,
      };
    }

    if (this.requiresAuth(route) && !isAuthenticated) {
      return {
        allowed: false,
        reason: 'authentication_required',
        message: 'Authentication is required to access this route',
        fallback: SCREEN_NAMES.LOGIN,
      };
    }

    return {
      allowed: true,
      reason: 'valid',
      message: 'Navigation is allowed',
    };
  }

  /**
   * Safe navigation with validation
   * @param {Object} navigation - Navigation object
   * @param {string} route - Target route
   * @param {Object} params - Navigation parameters
   * @param {Object} authState - Current authentication state
   * @param {Object} options - Navigation options
   * @returns {Promise<boolean>} - Success status
   */
  static async safeNavigate(
    navigation,
    route,
    params = {},
    authState = {},
    options = {},
  ) {
    const validation = this.validateNavigation(route, authState);

    if (!validation.allowed) {
      console.warn('Navigation blocked:', validation);

      if (validation.fallback) {
        return this.navigateToRoute(
          navigation,
          validation.fallback,
          {},
          options,
        );
      }

      return false;
    }

    return this.navigateToRoute(navigation, route, params, options);
  }

  /**
   * Get debug information about routes
   * @returns {Object} - Debug information
   */
  static getDebugInfo() {
    return {
      totalRoutes: Object.keys(ROUTE_CONFIG).length,
      routeTypes: Object.values(ROUTE_TYPES),
      protectedRoutes: this.getRoutesByCategory('protected').length,
      publicRoutes: this.getRoutesByCategory('auth').length,
      bottomTabRoutes: this.getRoutesByCategory('bottomTab').length,
      modalRoutes: this.getRoutesByCategory('modal').length,
    };
  }
}

// Legacy function exports for backward compatibility
export const isBottomTabRoute =
  NavigationUtils.isBottomTabRoute.bind(NavigationUtils);
export const navigateToRoute =
  NavigationUtils.navigateToRoute.bind(NavigationUtils);
export const getNavigationParams =
  NavigationUtils.getNavigationParams.bind(NavigationUtils);
export const isValidRoute = NavigationUtils.isValidRoute.bind(NavigationUtils);

// Main export
export default NavigationUtils;
