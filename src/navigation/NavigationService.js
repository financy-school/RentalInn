import { CommonActions, StackActions } from '@react-navigation/native';
import { SCREEN_NAMES } from './constants';

class NavigationService {
  constructor() {
    this._navigator = null;
    this._isReady = false;
    this._pendingActions = [];
    this._currentRoute = null;
    this._navigationHistory = [];
    this._maxHistorySize = 50;
  }

  /**
   * Set the navigator reference
   * @param {Object} navigatorRef - React Navigation navigator reference
   */
  setNavigator = navigatorRef => {
    this._navigator = navigatorRef;
    this._isReady = !!navigatorRef;

    // Process any pending actions
    if (this._isReady && this._pendingActions.length > 0) {
      console.log(
        'Processing pending navigation actions:',
        this._pendingActions.length,
      );

      this._pendingActions.forEach(action => {
        try {
          action();
        } catch (error) {
          console.error('Failed to execute pending navigation action:', error);
        }
      });

      this._pendingActions = [];
    }
  };

  /**
   * Check if navigation is ready
   * @returns {boolean} - True if navigator is ready
   */
  isReady = () => {
    return this._isReady && this._navigator;
  };

  /**
   * Get current route information
   * @returns {Object|null} - Current route info
   */
  getCurrentRoute = () => {
    if (!this.isReady()) return null;

    try {
      const state = this._navigator.getRootState();
      return this._getActiveRoute(state);
    } catch (error) {
      console.error('Failed to get current route:', error);
      return null;
    }
  };

  /**
   * Get active route from navigation state
   * @private
   */
  _getActiveRoute = state => {
    if (!state) return null;

    const route = state.routes[state.index];

    if (route.state) {
      return this._getActiveRoute(route.state);
    }

    return route;
  };

  /**
   * Update navigation history
   * @private
   */
  _updateHistory = (action, route) => {
    const historyEntry = {
      timestamp: Date.now(),
      action,
      route,
    };

    this._navigationHistory.unshift(historyEntry);

    // Limit history size
    if (this._navigationHistory.length > this._maxHistorySize) {
      this._navigationHistory = this._navigationHistory.slice(
        0,
        this._maxHistorySize,
      );
    }

    this._currentRoute = route;
  };

  /**
   * Execute navigation action with error handling
   * @private
   */
  _executeNavigation = (actionFn, actionName, params = {}) => {
    if (!this.isReady()) {
      console.warn(`Navigation not ready, queuing action: ${actionName}`);
      this._pendingActions.push(() =>
        this._executeNavigation(actionFn, actionName, params),
      );
      return false;
    }

    try {
      const result = actionFn();
      this._updateHistory(actionName, params);

      if (__DEV__) {
        console.log(`Navigation executed: ${actionName}`, params);
      }

      return true;
    } catch (error) {
      console.error(`Navigation failed: ${actionName}`, error, params);
      return false;
    }
  };

  /**
   * Navigate to a specific route
   * @param {string} routeName - Route name to navigate to
   * @param {Object} params - Route parameters
   * @returns {boolean} - Success status
   */
  navigate = (routeName, params = {}) => {
    return this._executeNavigation(
      () =>
        this._navigator.dispatch(
          CommonActions.navigate({
            name: routeName,
            params,
          }),
        ),
      'navigate',
      { routeName, params },
    );
  };

  /**
   * Reset navigation stack to a specific route
   * @param {string} routeName - Route name to reset to
   * @param {Object} params - Route parameters
   * @returns {boolean} - Success status
   */
  resetRoot = (routeName, params = {}) => {
    return this._executeNavigation(
      () =>
        this._navigator.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: routeName, params }],
          }),
        ),
      'resetRoot',
      { routeName, params },
    );
  };

  /**
   * Go back to previous screen
   * @returns {boolean} - Success status
   */
  goBack = () => {
    return this._executeNavigation(
      () => this._navigator.dispatch(CommonActions.goBack()),
      'goBack',
    );
  };

  /**
   * Pop screens from stack
   * @param {number} count - Number of screens to pop
   * @returns {boolean} - Success status
   */
  pop = (count = 1) => {
    return this._executeNavigation(
      () => this._navigator.dispatch(StackActions.pop(count)),
      'pop',
      { count },
    );
  };

  /**
   * Pop to top of stack
   * @returns {boolean} - Success status
   */
  popToTop = () => {
    return this._executeNavigation(
      () => this._navigator.dispatch(StackActions.popToTop()),
      'popToTop',
    );
  };

  /**
   * Replace current screen with new one
   * @param {string} routeName - Route name to replace with
   * @param {Object} params - Route parameters
   * @returns {boolean} - Success status
   */
  replace = (routeName, params = {}) => {
    return this._executeNavigation(
      () => this._navigator.dispatch(StackActions.replace(routeName, params)),
      'replace',
      { routeName, params },
    );
  };

  /**
   * Push new screen onto stack
   * @param {string} routeName - Route name to push
   * @param {Object} params - Route parameters
   * @returns {boolean} - Success status
   */
  push = (routeName, params = {}) => {
    return this._executeNavigation(
      () => this._navigator.dispatch(StackActions.push(routeName, params)),
      'push',
      { routeName, params },
    );
  };

  /**
   * Navigate with specific navigation structure (for nested navigators)
   * @param {string} navigator - Navigator name
   * @param {string} screen - Screen name
   * @param {Object} params - Screen parameters
   * @returns {boolean} - Success status
   */
  navigateNested = (navigator, screen, params = {}) => {
    return this._executeNavigation(
      () =>
        this._navigator.dispatch(
          CommonActions.navigate({
            name: navigator,
            params: {
              screen,
              params,
            },
          }),
        ),
      'navigateNested',
      { navigator, screen, params },
    );
  };

  /**
   * Navigate to bottom tab screen
   * @param {string} tabScreen - Tab screen name
   * @param {Object} params - Screen parameters
   * @returns {boolean} - Success status
   */
  navigateToTab = (tabScreen, params = {}) => {
    return this.navigateNested(
      SCREEN_NAMES.DRAWER_STACK,
      SCREEN_NAMES.BOTTOM_NAVIGATION,
      { screen: tabScreen, params },
    );
  };

  /**
   * Check if we can go back
   * @returns {boolean} - True if can go back
   */
  canGoBack = () => {
    if (!this.isReady()) return false;

    try {
      return this._navigator.canGoBack();
    } catch (error) {
      console.error('Failed to check canGoBack:', error);
      return false;
    }
  };

  /**
   * Get navigation history
   * @param {number} limit - Number of entries to return
   * @returns {Array} - Navigation history
   */
  getHistory = (limit = 10) => {
    return this._navigationHistory.slice(0, limit);
  };

  /**
   * Clear navigation history
   */
  clearHistory = () => {
    this._navigationHistory = [];
  };

  /**
   * Get current screen name
   * @returns {string|null} - Current screen name
   */
  getCurrentScreenName = () => {
    const currentRoute = this.getCurrentRoute();
    return currentRoute?.name || null;
  };

  /**
   * Check if current screen matches
   * @param {string} screenName - Screen name to check
   * @returns {boolean} - True if matches current screen
   */
  isCurrentScreen = screenName => {
    return this.getCurrentScreenName() === screenName;
  };

  /**
   * Wait for navigator to be ready
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<boolean>} - Promise that resolves when ready
   */
  waitForReady = (timeout = 5000) => {
    return new Promise(resolve => {
      if (this.isReady()) {
        resolve(true);
        return;
      }

      const startTime = Date.now();
      const checkReady = () => {
        if (this.isReady()) {
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          console.warn('Navigation service ready timeout');
          resolve(false);
        } else {
          setTimeout(checkReady, 100);
        }
      };

      checkReady();
    });
  };

  /**
   * Execute navigation action after ensuring readiness
   * @param {Function} action - Navigation action to execute
   * @param {number} timeout - Timeout for readiness check
   * @returns {Promise<boolean>} - Success status
   */
  executeWhenReady = async (action, timeout = 5000) => {
    const isReady = await this.waitForReady(timeout);

    if (!isReady) {
      console.error('Navigation service not ready after timeout');
      return false;
    }

    try {
      return action();
    } catch (error) {
      console.error('Failed to execute navigation action:', error);
      return false;
    }
  };

  /**
   * Debug information about navigation state
   * @returns {Object} - Debug info
   */
  getDebugInfo = () => {
    return {
      isReady: this.isReady(),
      currentRoute: this.getCurrentRoute(),
      historyCount: this._navigationHistory.length,
      pendingActions: this._pendingActions.length,
      canGoBack: this.canGoBack(),
    };
  };
}

// Create singleton instance
const navigationService = new NavigationService();

export default navigationService;
