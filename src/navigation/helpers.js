// navigation/helpers.js
import { CommonActions, StackActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { STORAGE_KEYS, ERROR_MESSAGES } from './constants';
import { getOwnerDetails } from '../services/NetworkUtils';

/**
 * Enhanced Navigation helper functions with better error handling and state management
 */
export class NavigationHelper {
  static navigationRef = null;
  static routeHistory = [];
  static maxHistoryLength = 50;
  static listeners = new Set();
  static isInitialized = false;

  /**
   * Initialize navigation helper
   * @param {Object} ref - Navigation reference
   */
  static initialize(ref) {
    NavigationHelper.navigationRef = ref;
    NavigationHelper.isInitialized = true;
    NavigationHelper.routeHistory = [];

    if (__DEV__) {
      console.log('NavigationHelper initialized');
    }
  }

  /**
   * Set navigation reference with validation
   * @param {Object} ref - Navigation reference
   */
  static setNavigationRef(ref) {
    if (!ref) {
      console.warn('Invalid navigation reference provided');
      return false;
    }

    NavigationHelper.navigationRef = ref;
    NavigationHelper.isInitialized = true;
    return true;
  }

  /**
   * Check if navigation is ready and available
   * @returns {boolean} - True if navigation is ready
   */
  static isReady() {
    try {
      return (
        NavigationHelper.navigationRef &&
        NavigationHelper.navigationRef.isReady &&
        NavigationHelper.navigationRef.isReady()
      );
    } catch (error) {
      console.error('Error checking navigation readiness:', error);
      return false;
    }
  }

  /**
   * Get current route with error handling
   * @returns {Object|null} - Current route object
   */
  static getCurrentRoute() {
    if (!NavigationHelper.isReady()) {
      console.warn('Navigation not ready - cannot get current route');
      return null;
    }

    try {
      return NavigationHelper.navigationRef.getCurrentRoute();
    } catch (error) {
      console.error('Error getting current route:', error);
      return null;
    }
  }

  /**
   * Get current route name safely
   * @returns {string|null} - Current route name
   */
  static getCurrentRouteName() {
    const route = NavigationHelper.getCurrentRoute();
    return route?.name ?? null;
  }

  /**
   * Navigate with comprehensive validation and error handling
   * @param {string} name - Route name
   * @param {Object} params - Navigation parameters
   * @param {Object} options - Navigation options
   * @returns {Promise<boolean>} - Success status
   */
  static async navigate(name, params = {}, options = {}) {
    if (!name) {
      console.error('Navigation route name is required');
      return false;
    }

    if (!NavigationHelper.isReady()) {
      console.warn('Navigation is not ready, queuing navigation action');

      // Queue the navigation for when it becomes ready
      return NavigationHelper._queueNavigation(() =>
        NavigationHelper.navigate(name, params, options),
      );
    }

    try {
      const { replace = false, reset = false } = options;

      NavigationHelper.addToHistory({ name, params, action: 'navigate' });

      if (reset) {
        NavigationHelper.navigationRef.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name, params }],
          }),
        );
      } else if (replace) {
        NavigationHelper.navigationRef.dispatch(
          StackActions.replace(name, params),
        );
      } else {
        NavigationHelper.navigationRef.navigate(name, params);
      }

      NavigationHelper._notifyListeners('navigate', { name, params });
      return true;
    } catch (error) {
      console.error('Navigation error:', error);
      ErrorHelper.logError(error, 'NavigationHelper.navigate', {
        name,
        params,
      });
      return false;
    }
  }

  /**
   * Queue navigation action for when navigation becomes ready
   * @private
   */
  static async _queueNavigation(actionFn, timeout = 5000) {
    const startTime = Date.now();

    return new Promise(resolve => {
      const checkReady = () => {
        if (NavigationHelper.isReady()) {
          resolve(actionFn());
        } else if (Date.now() - startTime > timeout) {
          console.warn('Navigation queue timeout reached');
          resolve(false);
        } else {
          setTimeout(checkReady, 100);
        }
      };

      checkReady();
    });
  }

  /**
   * Go back with validation
   * @returns {boolean} - Success status
   */
  static goBack() {
    if (!NavigationHelper.isReady()) {
      console.warn('Navigation not ready - cannot go back');
      return false;
    }

    try {
      if (NavigationHelper.navigationRef.canGoBack()) {
        NavigationHelper.navigationRef.goBack();
        NavigationHelper.addToHistory({ action: 'goBack' });
        NavigationHelper._notifyListeners('goBack');
        return true;
      } else {
        console.log('Cannot go back - no previous route');
        return false;
      }
    } catch (error) {
      console.error('Go back error:', error);
      ErrorHelper.logError(error, 'NavigationHelper.goBack');
      return false;
    }
  }

  /**
   * Reset navigation stack with enhanced error handling
   * @param {string} routeName - Route to reset to
   * @param {Object} params - Route parameters
   * @param {number} index - Stack index
   * @returns {boolean} - Success status
   */
  static reset(routeName, params = {}, index = 0) {
    if (!routeName) {
      console.error('Route name is required for reset');
      return false;
    }

    if (!NavigationHelper.isReady()) {
      console.warn('Navigation not ready - queueing reset');
      return NavigationHelper._queueNavigation(() =>
        NavigationHelper.reset(routeName, params, index),
      );
    }

    try {
      NavigationHelper.navigationRef.dispatch(
        CommonActions.reset({
          index,
          routes: [{ name: routeName, params }],
        }),
      );

      NavigationHelper.routeHistory = [];
      NavigationHelper.addToHistory({
        name: routeName,
        params,
        action: 'reset',
      });
      NavigationHelper._notifyListeners('reset', { routeName, params });

      return true;
    } catch (error) {
      console.error('Reset error:', error);
      ErrorHelper.logError(error, 'NavigationHelper.reset', {
        routeName,
        params,
      });
      return false;
    }
  }

  /**
   * Replace current route
   * @param {string} routeName - Route to replace with
   * @param {Object} params - Route parameters
   * @returns {boolean} - Success status
   */
  static replace(routeName, params = {}) {
    if (!routeName) {
      console.error('Route name is required for replace');
      return false;
    }

    if (!NavigationHelper.isReady()) {
      console.warn('Navigation not ready - queueing replace');
      return NavigationHelper._queueNavigation(() =>
        NavigationHelper.replace(routeName, params),
      );
    }

    try {
      NavigationHelper.navigationRef.dispatch(
        StackActions.replace(routeName, params),
      );

      NavigationHelper.addToHistory({
        name: routeName,
        params,
        action: 'replace',
      });
      NavigationHelper._notifyListeners('replace', { routeName, params });

      return true;
    } catch (error) {
      console.error('Replace error:', error);
      ErrorHelper.logError(error, 'NavigationHelper.replace', {
        routeName,
        params,
      });
      return false;
    }
  }

  /**
   * Pop to top of stack
   * @returns {boolean} - Success status
   */
  static popToTop() {
    if (!NavigationHelper.isReady()) {
      console.warn('Navigation not ready - cannot pop to top');
      return false;
    }

    try {
      NavigationHelper.navigationRef.dispatch(StackActions.popToTop());
      NavigationHelper.addToHistory({ action: 'popToTop' });
      NavigationHelper._notifyListeners('popToTop');
      return true;
    } catch (error) {
      console.error('PopToTop error:', error);
      ErrorHelper.logError(error, 'NavigationHelper.popToTop');
      return false;
    }
  }

  /**
   * Add route to history with size management
   * @param {Object} route - Route information
   */
  static addToHistory(route) {
    const historyEntry = {
      ...route,
      timestamp: Date.now(),
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    NavigationHelper.routeHistory.push(historyEntry);

    // Manage history size
    if (
      NavigationHelper.routeHistory.length > NavigationHelper.maxHistoryLength
    ) {
      NavigationHelper.routeHistory = NavigationHelper.routeHistory.slice(
        NavigationHelper.routeHistory.length -
          NavigationHelper.maxHistoryLength,
      );
    }
  }

  /**
   * Get navigation history
   * @param {number} limit - Number of entries to return
   * @returns {Array} - Navigation history
   */
  static getHistory(limit = null) {
    const history = [...NavigationHelper.routeHistory];
    return limit ? history.slice(-limit) : history;
  }

  /**
   * Clear navigation history
   */
  static clearHistory() {
    NavigationHelper.routeHistory = [];
    NavigationHelper._notifyListeners('historyCleared');
  }

  /**
   * Add navigation listener
   * @param {Function} callback - Listener callback
   * @returns {Function} - Unsubscribe function
   */
  static addListener(callback) {
    if (typeof callback !== 'function') {
      console.error('Navigation listener must be a function');
      return () => {};
    }

    NavigationHelper.listeners.add(callback);

    return () => {
      NavigationHelper.listeners.delete(callback);
    };
  }

  /**
   * Notify all listeners of navigation events
   * @private
   */
  static _notifyListeners(action, data = {}) {
    NavigationHelper.listeners.forEach(callback => {
      try {
        callback({ action, data, timestamp: Date.now() });
      } catch (error) {
        console.error('Navigation listener error:', error);
      }
    });
  }

  /**
   * Get debug information
   * @returns {Object} - Debug information
   */
  static getDebugInfo() {
    return {
      isInitialized: NavigationHelper.isInitialized,
      isReady: NavigationHelper.isReady(),
      currentRoute: NavigationHelper.getCurrentRouteName(),
      historyCount: NavigationHelper.routeHistory.length,
      listenersCount: NavigationHelper.listeners.size,
    };
  }
}

/**
 * Enhanced Authentication helper functions with better error handling and validation
 */
export class AuthHelper {
  static validationCache = new Map();
  static cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Validate token with caching and comprehensive error handling
   * @param {string} token - Token to validate
   * @param {boolean} useCache - Whether to use cache
   * @returns {Promise<Object>} - Validation result
   */
  static async validateToken(token, useCache = true) {
    if (!token) {
      return {
        isValid: false,
        userData: null,
        validationError: 'NO_TOKEN',
        message: 'Token is required for validation',
      };
    }

    // Check cache first
    if (useCache) {
      const cached = AuthHelper.validationCache.get(token);
      if (cached && Date.now() - cached.timestamp < AuthHelper.cacheTimeout) {
        return cached.result;
      }
    }

    try {
      // Check network connectivity
      const isConnected = await NetworkHelper.checkConnectivity();
      if (!isConnected) {
        return {
          isValid: false,
          userData: null,
          validationError: 'NETWORK_ERROR',
          message: 'No internet connection available',
        };
      }

      const userDetails = await getOwnerDetails({ token });

      if (!userDetails) {
        const result = {
          isValid: false,
          userData: null,
          validationError: 'INVALID_TOKEN',
          message: 'Token is invalid or expired',
        };

        // Cache negative results for shorter time
        if (useCache) {
          AuthHelper.validationCache.set(token, {
            result,
            timestamp: Date.now() - AuthHelper.cacheTimeout * 0.7, // Cache for less time
          });
        }

        return result;
      }

      const result = {
        isValid: true,
        userData: userDetails,
        validationError: null,
        message: 'Token is valid',
      };

      // Cache positive results
      if (useCache) {
        AuthHelper.validationCache.set(token, {
          result,
          timestamp: Date.now(),
        });
      }

      return result;
    } catch (error) {
      console.error('Token validation error:', error);
      ErrorHelper.logError(error, 'AuthHelper.validateToken', {
        tokenLength: token?.length,
      });

      const result = {
        isValid: false,
        userData: null,
        validationError: 'VALIDATION_ERROR',
        message: error.message || 'Token validation failed',
      };

      return result;
    }
  }

  /**
   * Refresh token with retry mechanism
   * @param {string} refreshToken - Refresh token
   * @param {number} retries - Number of retries
   * @returns {Promise<Object>} - Refresh result
   */
  static async refreshToken(refreshToken, retries = 2) {
    if (!refreshToken) {
      return {
        success: false,
        tokens: null,
        error: 'NO_REFRESH_TOKEN',
        message: 'Refresh token is required',
      };
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Check connectivity before attempting refresh
        const isConnected = await NetworkHelper.checkConnectivity();
        if (!isConnected) {
          return {
            success: false,
            tokens: null,
            error: 'NETWORK_ERROR',
            message: 'No internet connection',
          };
        }

        // TODO: Replace with actual API call
        // For now, return mock success
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

        const result = {
          success: true,
          tokens: {
            accessToken: `refreshed_${Date.now()}`,
            refreshToken: refreshToken,
            expiresIn: 3600,
          },
          error: null,
          message: 'Token refreshed successfully',
        };

        // Clear validation cache since we have new tokens
        AuthHelper.validationCache.clear();

        return result;
      } catch (error) {
        console.error(`Token refresh attempt ${attempt + 1} failed:`, error);

        if (attempt === retries) {
          ErrorHelper.logError(error, 'AuthHelper.refreshToken', {
            attempt: attempt + 1,
          });

          return {
            success: false,
            tokens: null,
            error: 'REFRESH_ERROR',
            message: `Token refresh failed after ${retries + 1} attempts`,
          };
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  /**
   * Logout with comprehensive cleanup
   * @param {string} token - User token
   * @param {boolean} clearAllData - Whether to clear all stored data
   * @param {boolean} serverLogout - Whether to logout from server
   * @returns {Promise<Object>} - Logout result
   */
  static async logout(token, clearAllData = true, serverLogout = true) {
    const results = {
      localStorage: false,
      serverLogout: false,
      cacheCleared: false,
    };

    try {
      // Server logout if requested and token is available
      if (serverLogout && token) {
        try {
          // TODO: Implement actual server logout API call
          await new Promise(resolve => setTimeout(resolve, 500)); // Mock API call
          results.serverLogout = true;
        } catch (serverError) {
          console.warn('Server logout failed:', serverError);
          // Continue with local logout even if server logout fails
        }
      }

      // Clear local storage
      try {
        const keysToRemove = [
          STORAGE_KEYS.USER_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA,
          STORAGE_KEYS.USER_CREDENTIALS,
          STORAGE_KEYS.LAST_LOGIN,
        ];

        if (clearAllData) {
          keysToRemove.push(
            STORAGE_KEYS.USER_PREFERENCES,
            STORAGE_KEYS.ROOMS_CACHE,
            STORAGE_KEYS.TENANTS_CACHE,
            STORAGE_KEYS.TICKETS_CACHE,
          );
        }

        await AsyncStorage.multiRemove(keysToRemove);
        results.localStorage = true;
      } catch (storageError) {
        console.error('Local storage cleanup failed:', storageError);
        ErrorHelper.logError(storageError, 'AuthHelper.logout.localStorage');
      }

      // Clear validation cache
      try {
        AuthHelper.validationCache.clear();
        results.cacheCleared = true;
      } catch (cacheError) {
        console.error('Cache cleanup failed:', cacheError);
      }

      const success = results.localStorage; // Local storage is critical
      return {
        success,
        error: success ? null : 'Local storage cleanup failed',
        details: results,
      };
    } catch (error) {
      console.error('Logout error:', error);
      ErrorHelper.logError(error, 'AuthHelper.logout');
      return {
        success: false,
        error: error.message,
        details: results,
      };
    }
  }

  /**
   * Clear validation cache
   * @param {string} token - Specific token to clear, or all if not provided
   */
  static clearValidationCache(token = null) {
    if (token) {
      AuthHelper.validationCache.delete(token);
    } else {
      AuthHelper.validationCache.clear();
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  static getCacheStats() {
    return {
      size: AuthHelper.validationCache.size,
      timeout: AuthHelper.cacheTimeout,
      entries: Array.from(AuthHelper.validationCache.keys()).map(key => ({
        key: key.substring(0, 10) + '...',
        age: Date.now() - AuthHelper.validationCache.get(key).timestamp,
      })),
    };
  }
}

/**
 * Enhanced Storage helper with better error handling and data integrity
 */
export class StorageHelper {
  static compressionThreshold = 1024; // Compress data larger than 1KB

  /**
   * Store user data with validation and error handling
   * @param {Object} userData - User data to store
   * @param {string} token - User token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} - Storage result
   */
  static async storeUserData(userData, token, refreshToken = null) {
    try {
      // Validate inputs
      if (!userData || typeof userData !== 'object') {
        throw new Error('Invalid user data provided');
      }

      if (!token || typeof token !== 'string') {
        throw new Error('Invalid token provided');
      }

      // Prepare data for storage
      const timestamp = new Date().toISOString();
      const dataToStore = [
        [STORAGE_KEYS.USER_TOKEN, token],
        [STORAGE_KEYS.USER_DATA, JSON.stringify(userData)],
        [STORAGE_KEYS.LAST_LOGIN, timestamp],
        [STORAGE_KEYS.DATA_VERSION, '1.0'], // For future migrations
      ];

      if (refreshToken) {
        dataToStore.push([STORAGE_KEYS.REFRESH_TOKEN, refreshToken]);
      }

      console.log('Storing user data:', dataToStore, {
        userDataSize: JSON.stringify(userData).length,
        tokenLength: token.length,
        hasRefreshToken: !!refreshToken,
      });

      // Store data atomically
      await AsyncStorage.multiSet(dataToStore);

      // Verify storage
      const verification = await AsyncStorage.multiGet([
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);

      const storedToken = verification[0][1];
      const storedData = verification[1][1];

      if (!storedToken || !storedData) {
        throw new Error('Data verification failed after storage');
      }

      return {
        success: true,
        error: null,
        timestamp,
        dataSize: JSON.stringify(userData).length,
      };
    } catch (error) {
      console.error('Failed to store user data:', error);
      ErrorHelper.logError(error, 'StorageHelper.storeUserData');
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get user data with validation and fallback
   * @returns {Promise<Object>} - User data
   */
  static async getUserData() {
    try {
      const keys = [
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.LAST_LOGIN,
      ];

      const [tokenResult, userDataResult, refreshTokenResult, lastLoginResult] =
        await AsyncStorage.multiGet(keys);

      // Parse and validate user data
      let userData = null;
      if (userDataResult[1]) {
        try {
          userData = JSON.parse(userDataResult[1]);
        } catch (parseError) {
          console.error('Failed to parse stored user data:', parseError);
          ErrorHelper.logError(parseError, 'StorageHelper.getUserData.parse');
          // Clear corrupted data
          await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
        }
      }

      return {
        token: tokenResult[1],
        userData,
        refreshToken: refreshTokenResult[1],
        lastLogin: lastLoginResult[1],
        isComplete: !!(tokenResult[1] && userData),
      };
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      ErrorHelper.logError(error, 'StorageHelper.getUserData');
      return {
        token: null,
        userData: null,
        refreshToken: null,
        lastLogin: null,
        isComplete: false,
        error: error.message,
      };
    }
  }

  /**
   * Get user preferences with defaults
   * @param {Object} defaults - Default preferences
   * @returns {Promise<Object>} - User preferences
   */
  static async getPreferences(defaults = {}) {
    try {
      const preferences = await AsyncStorage.getItem(
        STORAGE_KEYS.USER_PREFERENCES,
      );

      if (!preferences) {
        return defaults;
      }

      const parsed = JSON.parse(preferences);
      return { ...defaults, ...parsed };
    } catch (error) {
      console.error('Failed to get preferences:', error);
      ErrorHelper.logError(error, 'StorageHelper.getPreferences');
      return defaults;
    }
  }

  /**
   * Set user preferences with validation
   * @param {Object} preferences - Preferences to set
   * @returns {Promise<Object>} - Operation result
   */
  static async setPreferences(preferences) {
    try {
      if (!preferences || typeof preferences !== 'object') {
        throw new Error('Invalid preferences object');
      }

      // Get current preferences and merge
      const current = await StorageHelper.getPreferences();
      const merged = { ...current, ...preferences };

      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(merged),
      );

      return { success: true, preferences: merged };
    } catch (error) {
      console.error('Failed to set preferences:', error);
      ErrorHelper.logError(error, 'StorageHelper.setPreferences');
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear cache with selective clearing
   * @param {Array} specificKeys - Specific keys to clear
   * @returns {Promise<Object>} - Clear result
   */
  static async clearCache(specificKeys = null) {
    try {
      const defaultCacheKeys = [
        STORAGE_KEYS.ROOMS_CACHE,
        STORAGE_KEYS.TENANTS_CACHE,
        STORAGE_KEYS.TICKETS_CACHE,
      ];

      const keysToRemove = specificKeys || defaultCacheKeys;
      await AsyncStorage.multiRemove(keysToRemove);

      return {
        success: true,
        clearedKeys: keysToRemove.length,
        keys: keysToRemove,
      };
    } catch (error) {
      console.error('Failed to clear cache:', error);
      ErrorHelper.logError(error, 'StorageHelper.clearCache');
      return {
        success: false,
        error: error.message,
        clearedKeys: 0,
      };
    }
  }

  /**
   * Clear all user data with comprehensive cleanup
   * @returns {Promise<Object>} - Clear result
   */
  static async clearUserData() {
    const results = {
      userDataCleared: false,
      cacheCleared: false,
      totalKeysRemoved: 0,
    };

    try {
      // Clear user-specific data
      const userDataKeys = [
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.USER_CREDENTIALS,
        STORAGE_KEYS.LAST_LOGIN,
        STORAGE_KEYS.USER_PREFERENCES,
      ];

      await AsyncStorage.multiRemove(userDataKeys);
      results.userDataCleared = true;
      results.totalKeysRemoved += userDataKeys.length;

      // Clear cache
      const cacheResult = await StorageHelper.clearCache();
      results.cacheCleared = cacheResult.success;
      results.totalKeysRemoved += cacheResult.clearedKeys || 0;

      return {
        success: true,
        error: null,
        details: results,
      };
    } catch (error) {
      console.error('Failed to clear user data:', error);
      ErrorHelper.logError(error, 'StorageHelper.clearUserData');
      return {
        success: false,
        error: error.message,
        details: results,
      };
    }
  }

  /**
   * Get storage usage statistics
   * @returns {Promise<Object>} - Storage statistics
   */
  static async getStorageStats() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const data = await AsyncStorage.multiGet(keys);

      let totalSize = 0;
      const keyStats = data.map(([key, value]) => {
        const size = (value || '').length;
        totalSize += size;
        return { key, size };
      });

      return {
        totalKeys: keys.length,
        totalSize,
        averageSize: Math.round(totalSize / keys.length),
        keyStats: keyStats.sort((a, b) => b.size - a.size),
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return { error: error.message };
    }
  }
}

/**
 * Enhanced Network helper with connection monitoring and retry logic
 */
export class NetworkHelper {
  static connectionInfo = null;
  static listeners = new Set();
  static isMonitoring = false;
  static retryDelays = [1000, 2000, 4000, 8000]; // Exponential backoff

  /**
   * Initialize network monitoring
   */
  static initialize() {
    if (NetworkHelper.isMonitoring) return;

    NetworkHelper.isMonitoring = true;
    NetworkHelper.subscribeToNetworkChanges(state => {
      NetworkHelper.connectionInfo = state;
    });
  }

  /**
   * Check connectivity with caching
   * @param {boolean} useCache - Whether to use cached result
   * @returns {Promise<boolean>} - Connection status
   */
  static async checkConnectivity(useCache = true) {
    try {
      // Use cached result if available and recent
      if (useCache && NetworkHelper.connectionInfo) {
        const age = Date.now() - (NetworkHelper.connectionInfo.timestamp || 0);
        if (age < 30000) {
          // Use cache for 30 seconds
          return (
            NetworkHelper.connectionInfo.isConnected &&
            NetworkHelper.connectionInfo.isInternetReachable
          );
        }
      }

      const state = await NetInfo.fetch();
      NetworkHelper.connectionInfo = {
        ...state,
        timestamp: Date.now(),
      };

      return state.isConnected && state.isInternetReachable;
    } catch (error) {
      console.error('Connectivity check failed:', error);
      ErrorHelper.logError(error, 'NetworkHelper.checkConnectivity');
      return false;
    }
  }

  /**
   * Subscribe to network changes with error handling
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  static subscribeToNetworkChanges(callback) {
    if (typeof callback !== 'function') {
      console.error('Network callback must be a function');
      return () => {};
    }

    try {
      const unsubscribe = NetInfo.addEventListener(state => {
        const enhancedState = {
          ...state,
          timestamp: Date.now(),
        };

        NetworkHelper.connectionInfo = enhancedState;

        try {
          callback(enhancedState);
        } catch (error) {
          console.error('Network callback error:', error);
        }
      });

      NetworkHelper.listeners.add({ callback, unsubscribe });

      return () => {
        NetworkHelper.listeners.forEach(listener => {
          if (listener.callback === callback) {
            listener.unsubscribe();
            NetworkHelper.listeners.delete(listener);
          }
        });
      };
    } catch (error) {
      console.error('Failed to subscribe to network changes:', error);
      return () => {};
    }
  }

  /**
   * Execute function with network retry logic
   * @param {Function} fn - Function to execute
   * @param {number} maxRetries - Maximum retry attempts
   * @returns {Promise<any>} - Function result
   */
  static async executeWithRetry(fn, maxRetries = 3) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const isConnected = await NetworkHelper.checkConnectivity(false);

        if (!isConnected) {
          throw new Error('No network connection');
        }

        return await fn();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        const delay =
          NetworkHelper.retryDelays[
            Math.min(attempt, NetworkHelper.retryDelays.length - 1)
          ];
        console.log(`Network retry attempt ${attempt + 1} after ${delay}ms`);

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Wait for network connection
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<boolean>} - True if connected within timeout
   */
  static async waitForConnection(timeout = 30000) {
    const startTime = Date.now();

    return new Promise(resolve => {
      const checkConnection = async () => {
        try {
          const isConnected = await NetworkHelper.checkConnectivity(false);

          if (isConnected) {
            resolve(true);
            return;
          }

          if (Date.now() - startTime > timeout) {
            resolve(false);
            return;
          }

          setTimeout(checkConnection, 1000);
        } catch (error) {
          console.error('Error checking connection:', error);
          setTimeout(checkConnection, 1000);
        }
      };

      checkConnection();
    });
  }

  /**
   * Unsubscribe all listeners
   */
  static unsubscribeAll() {
    NetworkHelper.listeners.forEach(listener => {
      try {
        listener.unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing network listener:', error);
      }
    });

    NetworkHelper.listeners.clear();
    NetworkHelper.isMonitoring = false;
  }

  /**
   * Get network statistics
   * @returns {Object} - Network statistics
   */
  static getNetworkStats() {
    return {
      isMonitoring: NetworkHelper.isMonitoring,
      listenersCount: NetworkHelper.listeners.size,
      connectionInfo: NetworkHelper.connectionInfo,
      lastCheck: NetworkHelper.connectionInfo?.timestamp || null,
    };
  }
}

/**
 * Enhanced Error handling helper with structured logging and analytics
 */
export class ErrorHelper {
  static errorLog = [];
  static maxLogSize = 500;
  static toastFunction = null;
  static errorCategories = {
    NETWORK: 'network',
    AUTH: 'authentication',
    STORAGE: 'storage',
    NAVIGATION: 'navigation',
    VALIDATION: 'validation',
    UI: 'user_interface',
    API: 'api',
    UNKNOWN: 'unknown',
  };

  /**
   * Get error message with enhanced context
   * @param {string} errorType - Error type
   * @param {string} customMessage - Custom message
   * @returns {string} - Error message
   */
  static getErrorMessage(errorType, customMessage = null) {
    if (customMessage) return customMessage;

    const message = ERROR_MESSAGES[errorType] || ERROR_MESSAGES.UNKNOWN_ERROR;
    return typeof message === 'string'
      ? message
      : message.default || 'An error occurred';
  }

  /**
   * Enhanced error logging with categorization and context
   * @param {Error|string} error - Error object or message
   * @param {string} context - Error context
   * @param {Object} metadata - Additional metadata
   * @param {string} category - Error category
   */
  static logError(error, context = '', metadata = {}, category = null) {
    const errorEntry = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      category: category || ErrorHelper._categorizeError(error, context),
      error: ErrorHelper._serializeError(error),
      context,
      metadata: ErrorHelper._sanitizeMetadata(metadata),
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location?.href : 'Unknown',
    };

    ErrorHelper.errorLog.push(errorEntry);

    // Manage log size
    if (ErrorHelper.errorLog.length > ErrorHelper.maxLogSize) {
      ErrorHelper.errorLog = ErrorHelper.errorLog.slice(
        -ErrorHelper.maxLogSize,
      );
    }

    // Console logging in development
    if (__DEV__) {
      console.group(`🚨 Error: ${context}`);
      console.error('Error:', error);
      console.log('Category:', errorEntry.category);
      console.log('Metadata:', metadata);
      console.groupEnd();
    }

    // Send to analytics service in production
    if (!__DEV__ && ErrorHelper._shouldReport(errorEntry)) {
      ErrorHelper._reportToAnalytics(errorEntry);
    }
  }

  /**
   * Log informational messages with context
   * @param {string} message - Log message
   * @param {string} context - Log context
   * @param {Object} data - Additional data
   * @param {string} level - Log level
   */
  static logInfo(message, context = '', data = null, level = 'info') {
    const logEntry = {
      level,
      message,
      context,
      data: ErrorHelper._sanitizeMetadata(data),
      timestamp: new Date().toISOString(),
    };

    if (__DEV__) {
      const emoji = level === 'warn' ? '⚠️' : level === 'error' ? '❌' : 'ℹ️';
      console.log(`${emoji} [${context}] ${message}`, data || '');
    }

    // Could store info logs as well if needed
    return logEntry;
  }

  /**
   * Serialize error for logging
   * @private
   */
  static _serializeError(error) {
    if (typeof error === 'string') {
      return { message: error, type: 'string' };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
        name: error.name,
        type: 'Error',
      };
    }

    return { message: String(error), type: typeof error };
  }

  /**
   * Categorize error based on content and context
   * @private
   */
  static _categorizeError(error, context) {
    const contextLower = context.toLowerCase();
    const errorMessage = (error?.message || error || '').toLowerCase();

    if (
      contextLower.includes('network') ||
      contextLower.includes('connectivity')
    ) {
      return ErrorHelper.errorCategories.NETWORK;
    }

    if (
      contextLower.includes('auth') ||
      contextLower.includes('login') ||
      contextLower.includes('token')
    ) {
      return ErrorHelper.errorCategories.AUTH;
    }

    if (
      contextLower.includes('storage') ||
      contextLower.includes('asyncstorage')
    ) {
      return ErrorHelper.errorCategories.STORAGE;
    }

    if (contextLower.includes('navigation') || contextLower.includes('route')) {
      return ErrorHelper.errorCategories.NAVIGATION;
    }

    if (
      errorMessage.includes('validation') ||
      errorMessage.includes('invalid')
    ) {
      return ErrorHelper.errorCategories.VALIDATION;
    }

    if (errorMessage.includes('fetch') || errorMessage.includes('api')) {
      return ErrorHelper.errorCategories.API;
    }

    return ErrorHelper.errorCategories.UNKNOWN;
  }

  /**
   * Sanitize metadata to remove sensitive information
   * @private
   */
  static _sanitizeMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object') return metadata;

    const sanitized = { ...metadata };
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'credential'];

    Object.keys(sanitized).forEach(key => {
      if (
        sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))
      ) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Determine if error should be reported to analytics
   * @private
   */
  static _shouldReport(errorEntry) {
    // Don't report validation errors or user-input errors
    if (errorEntry.category === ErrorHelper.errorCategories.VALIDATION) {
      return false;
    }

    // Don't report network errors too frequently
    if (errorEntry.category === ErrorHelper.errorCategories.NETWORK) {
      const recentNetworkErrors = ErrorHelper.errorLog.filter(
        log =>
          log.category === ErrorHelper.errorCategories.NETWORK &&
          Date.now() - new Date(log.timestamp).getTime() < 60000, // Last minute
      );
      return recentNetworkErrors.length < 3;
    }

    return true;
  }

  /**
   * Report error to analytics service
   * @private
   */
  static _reportToAnalytics(errorEntry) {
    try {
      // Integrate with your analytics service
      AnalyticsHelper.trackEvent('error_occurred', {
        error_id: errorEntry.id,
        error_category: errorEntry.category,
        error_context: errorEntry.context,
        error_message: errorEntry.error.message,
      });
    } catch (reportingError) {
      console.error('Failed to report error to analytics:', reportingError);
    }
  }

  /**
   * Get filtered error log
   * @param {Object} filters - Filters to apply
   * @returns {Array} - Filtered error log
   */
  static getErrorLog(filters = {}) {
    let filteredLog = [...ErrorHelper.errorLog];

    if (filters.category) {
      filteredLog = filteredLog.filter(
        log => log.category === filters.category,
      );
    }

    if (filters.context) {
      filteredLog = filteredLog.filter(log =>
        log.context.toLowerCase().includes(filters.context.toLowerCase()),
      );
    }

    if (filters.since) {
      const sinceTime = new Date(filters.since).getTime();
      filteredLog = filteredLog.filter(
        log => new Date(log.timestamp).getTime() >= sinceTime,
      );
    }

    if (filters.limit) {
      filteredLog = filteredLog.slice(-filters.limit);
    }

    return filteredLog;
  }

  /**
   * Clear error log with optional filters
   * @param {Object} filters - Filters for selective clearing
   */
  static clearErrorLog(filters = {}) {
    if (Object.keys(filters).length === 0) {
      ErrorHelper.errorLog = [];
      return;
    }

    const toKeep = ErrorHelper.errorLog.filter(log => {
      if (filters.category && log.category === filters.category) return false;
      if (
        filters.olderThan &&
        new Date(log.timestamp) < new Date(filters.olderThan)
      )
        return false;
      return true;
    });

    ErrorHelper.errorLog = toKeep;
  }

  /**
   * Show enhanced error alert with actions
   * @param {string} title - Alert title
   * @param {string} message - Alert message
   * @param {Array} actions - Alert actions
   * @param {Object} options - Additional options
   */
  static showErrorAlert(title, message, actions = [], options = {}) {
    const defaultActions = [{ text: 'OK', style: 'default' }];
    const alertActions = actions.length > 0 ? actions : defaultActions;

    // Add retry action for network errors
    if (options.category === ErrorHelper.errorCategories.NETWORK) {
      alertActions.unshift({
        text: 'Retry',
        style: 'default',
        onPress: options.onRetry || (() => {}),
      });
    }

    Alert.alert(
      title || 'Error',
      message || ErrorHelper.getErrorMessage('UNKNOWN_ERROR'),
      alertActions,
      { cancelable: options.cancelable !== false },
    );
  }

  /**
   * Show toast notification using ToastContext
   * @param {string} message - Toast message
   * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duration in milliseconds
   */
  static showToast(message, type = 'info', duration = 3000) {
    if (__DEV__) {
      console.log(`[Toast ${type.toUpperCase()}]: ${message}`);
    }

    // Use the global toast function if available
    if (ErrorHelper.toastFunction) {
      ErrorHelper.toastFunction(message, type, duration);
    } else {
      // Fallback to Alert if toast context is not available
      console.warn('Toast context not initialized, using Alert as fallback');
      Alert.alert(
        type === 'error'
          ? 'Error'
          : type === 'success'
          ? 'Success'
          : type === 'warning'
          ? 'Warning'
          : 'Info',
        message,
        [{ text: 'OK', style: type === 'error' ? 'destructive' : 'default' }],
        { cancelable: true },
      );
    }
  }

  /**
   * Set the toast function from ToastContext
   * This should be called when the app initializes with ToastProvider
   * @param {Function} toastFunction - The showToast function from ToastContext
   */
  static setToastFunction(toastFunction) {
    ErrorHelper.toastFunction = toastFunction;
  }

  /**
   * Get error statistics
   * @returns {Object} - Error statistics
   */
  static getErrorStats() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const recentErrors = ErrorHelper.errorLog.filter(
      log => new Date(log.timestamp).getTime() > oneHourAgo,
    );

    const dailyErrors = ErrorHelper.errorLog.filter(
      log => new Date(log.timestamp).getTime() > oneDayAgo,
    );

    const categoryCounts = {};
    ErrorHelper.errorLog.forEach(log => {
      categoryCounts[log.category] = (categoryCounts[log.category] || 0) + 1;
    });

    return {
      total: ErrorHelper.errorLog.length,
      recentHour: recentErrors.length,
      dailyTotal: dailyErrors.length,
      categories: categoryCounts,
      topCategory: Object.keys(categoryCounts).reduce(
        (a, b) => (categoryCounts[a] > categoryCounts[b] ? a : b),
        'none',
      ),
    };
  }
}

/**
 * Enhanced Performance optimization helpers
 */
export class PerformanceHelper {
  static performanceMarks = new Map();
  static performanceMetrics = [];

  /**
   * Enhanced debounce with immediate execution option
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @param {boolean} immediate - Execute immediately on first call
   * @returns {Function} - Debounced function
   */
  static debounce(func, wait, immediate = false) {
    let timeout;
    let result;

    const debounced = function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) {
          result = func.apply(this, args);
        }
      };

      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) {
        result = func.apply(this, args);
      }

      return result;
    };

    debounced.cancel = () => {
      clearTimeout(timeout);
      timeout = null;
    };

    debounced.flush = function (...args) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
        return func.apply(this, args);
      }
      return result;
    };

    return debounced;
  }

  /**
   * Enhanced throttle with leading and trailing options
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @param {Object} options - Throttle options
   * @returns {Function} - Throttled function
   */
  static throttle(func, limit, options = {}) {
    const { leading = true, trailing = true } = options;
    let inThrottle;
    let lastResult;
    let lastArgs;
    let lastCallTime;
    let timeout;

    const throttled = function (...args) {
      const now = Date.now();

      if (!lastCallTime && !leading) {
        lastCallTime = now;
      }

      const remaining = limit - (now - (lastCallTime || 0));
      lastArgs = args;

      if (remaining <= 0 || remaining > limit) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }

        lastCallTime = now;
        lastResult = func.apply(this, args);

        if (!timeout) {
          lastArgs = null;
        }
      } else if (!timeout && trailing) {
        timeout = setTimeout(() => {
          lastCallTime = !leading ? 0 : Date.now();
          timeout = null;
          lastResult = func.apply(this, lastArgs);
          lastArgs = null;
        }, remaining);
      }

      return lastResult;
    };

    throttled.cancel = () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastCallTime = 0;
      lastArgs = null;
    };

    return throttled;
  }

  /**
   * Enhanced memoization with TTL and size limits
   * @param {Function} fn - Function to memoize
   * @param {Object} options - Memoization options
   * @returns {Function} - Memoized function
   */
  static memoize(fn, options = {}) {
    const {
      getKey = (...args) => JSON.stringify(args),
      maxSize = 1000,
      ttl = null, // Time to live in milliseconds
    } = options;

    const cache = new Map();

    const memoized = function (...args) {
      const key = getKey(...args);
      const now = Date.now();

      // Check if cached result exists and is valid
      if (cache.has(key)) {
        const cached = cache.get(key);

        if (!ttl || now - cached.timestamp < ttl) {
          return cached.value;
        } else {
          cache.delete(key);
        }
      }

      // Compute new result
      const result = fn.apply(this, args);

      // Store in cache
      cache.set(key, {
        value: result,
        timestamp: now,
      });

      // Manage cache size (LRU)
      if (cache.size > maxSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }

      return result;
    };

    memoized.cache = cache;
    memoized.clear = () => cache.clear();
    memoized.delete = key => cache.delete(key);
    memoized.has = key => cache.has(key);

    return memoized;
  }

  /**
   * Performance measurement utilities
   * @param {string} markName - Performance mark name
   */
  static mark(markName) {
    const timestamp = Date.now();
    PerformanceHelper.performanceMarks.set(markName, timestamp);

    if (__DEV__) {
      console.log(`⏱️ Performance mark: ${markName}`);
    }
  }

  /**
   * Measure time between marks
   * @param {string} name - Measurement name
   * @param {string} startMark - Start mark name
   * @param {string} endMark - End mark name (optional, uses current time if not provided)
   * @returns {number} - Duration in milliseconds
   */
  static measure(name, startMark, endMark = null) {
    const startTime = PerformanceHelper.performanceMarks.get(startMark);
    const endTime = endMark
      ? PerformanceHelper.performanceMarks.get(endMark)
      : Date.now();

    if (!startTime) {
      console.warn(`Start mark '${startMark}' not found`);
      return 0;
    }

    const duration = endTime - startTime;

    const metric = {
      name,
      startMark,
      endMark,
      duration,
      timestamp: Date.now(),
    };

    PerformanceHelper.performanceMetrics.push(metric);

    // Limit metrics array size
    if (PerformanceHelper.performanceMetrics.length > 100) {
      PerformanceHelper.performanceMetrics.shift();
    }

    if (__DEV__) {
      console.log(`⏱️ Performance measure: ${name} = ${duration}ms`);
    }

    return duration;
  }

  /**
   * Get performance statistics
   * @returns {Object} - Performance statistics
   */
  static getPerformanceStats() {
    const metrics = PerformanceHelper.performanceMetrics;

    if (metrics.length === 0) {
      return { count: 0 };
    }

    const durations = metrics.map(m => m.duration);
    const total = durations.reduce((sum, duration) => sum + duration, 0);
    const average = total / durations.length;
    const sorted = durations.sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    return {
      count: metrics.length,
      total,
      average: Math.round(average),
      median,
      min: Math.min(...durations),
      max: Math.max(...durations),
      recent: metrics.slice(-10),
    };
  }

  /**
   * Clear performance data
   */
  static clearPerformanceData() {
    PerformanceHelper.performanceMarks.clear();
    PerformanceHelper.performanceMetrics = [];
  }
}

/**
 * Enhanced Analytics and tracking helper
 */
export class AnalyticsHelper {
  static isEnabled = !__DEV__;
  static eventQueue = [];
  static maxQueueSize = 100;
  static flushInterval = 30000; // 30 seconds
  static flushTimer = null;

  /**
   * Initialize analytics
   * @param {Object} config - Analytics configuration
   */
  static initialize(config = {}) {
    AnalyticsHelper.isEnabled = config.enabled !== false;

    if (AnalyticsHelper.isEnabled) {
      AnalyticsHelper._startAutoFlush();
    }
  }

  /**
   * Track screen view with enhanced data
   * @param {string} screenName - Screen name
   * @param {Object} params - Additional parameters
   */
  static trackScreenView(screenName, params = {}) {
    if (!AnalyticsHelper.isEnabled) {
      if (__DEV__) {
        console.log('📊 Screen View:', screenName, params);
      }
      return;
    }

    const event = {
      type: 'screen_view',
      screen_name: screenName,
      timestamp: Date.now(),
      session_id: AnalyticsHelper._getSessionId(),
      ...params,
    };

    AnalyticsHelper._queueEvent(event);
  }

  /**
   * Track custom event with validation
   * @param {string} eventName - Event name
   * @param {Object} properties - Event properties
   */
  static trackEvent(eventName, properties = {}) {
    if (!eventName || typeof eventName !== 'string') {
      console.warn('Invalid event name for analytics');
      return;
    }

    if (!AnalyticsHelper.isEnabled) {
      if (__DEV__) {
        console.log('📊 Event:', eventName, properties);
      }
      return;
    }

    const event = {
      type: 'custom_event',
      event_name: eventName,
      properties: AnalyticsHelper._sanitizeProperties(properties),
      timestamp: Date.now(),
      session_id: AnalyticsHelper._getSessionId(),
    };

    AnalyticsHelper._queueEvent(event);
  }

  /**
   * Set user property
   * @param {string} property - Property name
   * @param {any} value - Property value
   */
  static trackUserProperty(property, value) {
    if (!AnalyticsHelper.isEnabled) {
      if (__DEV__) {
        console.log('📊 User Property:', property, value);
      }
      return;
    }

    const event = {
      type: 'user_property',
      property,
      value,
      timestamp: Date.now(),
    };

    AnalyticsHelper._queueEvent(event);
  }

  /**
   * Set user ID
   * @param {string} userId - User ID
   */
  static setUserId(userId) {
    if (!AnalyticsHelper.isEnabled) {
      if (__DEV__) {
        console.log('📊 User ID:', userId);
      }
      return;
    }

    const event = {
      type: 'set_user_id',
      user_id: userId,
      timestamp: Date.now(),
    };

    AnalyticsHelper._queueEvent(event);
  }

  /**
   * Queue event for batch processing
   * @private
   */
  static _queueEvent(event) {
    AnalyticsHelper.eventQueue.push(event);

    // Limit queue size
    if (AnalyticsHelper.eventQueue.length > AnalyticsHelper.maxQueueSize) {
      AnalyticsHelper.eventQueue.shift();
    }

    // Flush if queue is getting full
    if (
      AnalyticsHelper.eventQueue.length >=
      AnalyticsHelper.maxQueueSize * 0.8
    ) {
      AnalyticsHelper.flush();
    }
  }

  /**
   * Flush events to analytics service
   */
  static async flush() {
    if (AnalyticsHelper.eventQueue.length === 0) return;

    const eventsToSend = [...AnalyticsHelper.eventQueue];
    AnalyticsHelper.eventQueue = [];

    try {
      // Send to your analytics service
      await AnalyticsHelper._sendEvents(eventsToSend);
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-queue failed events (up to a limit)
      AnalyticsHelper.eventQueue.unshift(...eventsToSend.slice(-10));
    }
  }

  /**
   * Send events to analytics service
   * @private
   */
  static async _sendEvents(events) {
    // Implement your analytics service integration here
    // Example: Firebase Analytics, Mixpanel, etc.

    if (__DEV__) {
      console.log('📊 Sending analytics events:', events.length);
    }

    // Mock implementation
    return Promise.resolve();
  }

  /**
   * Start automatic flushing
   * @private
   */
  static _startAutoFlush() {
    if (AnalyticsHelper.flushTimer) return;

    AnalyticsHelper.flushTimer = setInterval(() => {
      AnalyticsHelper.flush();
    }, AnalyticsHelper.flushInterval);
  }

  /**
   * Stop automatic flushing
   */
  static stopAutoFlush() {
    if (AnalyticsHelper.flushTimer) {
      clearInterval(AnalyticsHelper.flushTimer);
      AnalyticsHelper.flushTimer = null;
    }
  }

  /**
   * Sanitize properties to remove sensitive data
   * @private
   */
  static _sanitizeProperties(properties) {
    const sanitized = { ...properties };
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'key',
      'credential',
      'email',
    ];

    Object.keys(sanitized).forEach(key => {
      if (
        sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))
      ) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Get or generate session ID
   * @private
   */
  static _getSessionId() {
    if (!AnalyticsHelper.sessionId) {
      AnalyticsHelper.sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }
    return AnalyticsHelper.sessionId;
  }

  /**
   * Get analytics statistics
   * @returns {Object} - Analytics statistics
   */
  static getAnalyticsStats() {
    return {
      enabled: AnalyticsHelper.isEnabled,
      queueSize: AnalyticsHelper.eventQueue.length,
      sessionId: AnalyticsHelper._getSessionId(),
      autoFlushEnabled: !!AnalyticsHelper.flushTimer,
    };
  }
}

// Export all helpers
export default {
  NavigationHelper,
  AuthHelper,
  StorageHelper,
  NetworkHelper,
  ErrorHelper,
  PerformanceHelper,
  AnalyticsHelper,
};
