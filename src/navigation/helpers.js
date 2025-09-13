// navigation/helpers.js
import { CommonActions, StackActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { STORAGE_KEYS, ERROR_MESSAGES } from './constants';
import { getOwnerDetails } from '../services/NetworkUtils';

/**
 * Navigation helper functions for consistent navigation throughout the app
 */
export class NavigationHelper {
  static navigationRef = null;
  static routeHistory = [];
  static maxHistoryLength = 10;

  static setNavigationRef(ref) {
    NavigationHelper.navigationRef = ref;
  }

  static isReady() {
    return NavigationHelper.navigationRef?.isReady() ?? false;
  }

  static getCurrentRoute() {
    if (!NavigationHelper.isReady()) return null;
    return NavigationHelper.navigationRef.getCurrentRoute();
  }

  static getCurrentRouteName() {
    const route = NavigationHelper.getCurrentRoute();
    return route?.name ?? null;
  }

  static navigate(name, params = {}) {
    if (!NavigationHelper.isReady()) {
      console.warn('Navigation is not ready');
      return false;
    }

    try {
      NavigationHelper.addToHistory({ name, params });
      NavigationHelper.navigationRef.navigate(name, params);
      return true;
    } catch (error) {
      console.error('Navigation error:', error);
      return false;
    }
  }

  static goBack() {
    if (!NavigationHelper.isReady()) return false;

    try {
      if (NavigationHelper.navigationRef.canGoBack()) {
        NavigationHelper.navigationRef.goBack();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Go back error:', error);
      return false;
    }
  }

  static reset(routeName, params = {}, index = 0) {
    if (!NavigationHelper.isReady()) return false;

    try {
      NavigationHelper.navigationRef.dispatch(
        CommonActions.reset({
          index,
          routes: [{ name: routeName, params }],
        }),
      );

      NavigationHelper.routeHistory = [];
      return true;
    } catch (error) {
      console.error('Reset error:', error);
      return false;
    }
  }

  static replace(routeName, params = {}) {
    if (!NavigationHelper.isReady()) return false;

    try {
      NavigationHelper.navigationRef.dispatch(
        StackActions.replace(routeName, params),
      );
      return true;
    } catch (error) {
      console.error('Replace error:', error);
      return false;
    }
  }

  static popToTop() {
    if (!NavigationHelper.isReady()) return false;

    try {
      NavigationHelper.navigationRef.dispatch(StackActions.popToTop());
      return true;
    } catch (error) {
      console.error('PopToTop error:', error);
      return false;
    }
  }

  static addToHistory(route) {
    NavigationHelper.routeHistory.push({
      ...route,
      timestamp: Date.now(),
    });

    if (
      NavigationHelper.routeHistory.length > NavigationHelper.maxHistoryLength
    ) {
      NavigationHelper.routeHistory.shift();
    }
  }

  static getHistory() {
    return [...NavigationHelper.routeHistory];
  }

  static clearHistory() {
    NavigationHelper.routeHistory = [];
  }
}

/**
 * Authentication helper functions
 */
export class AuthHelper {
  static async validateToken(token) {
    try {
      if (!token) {
        return { isValid: false, userData: null, error: 'NO_TOKEN' };
      }

      const user_details = await getOwnerDetails(token);
      if (!user_details) {
        return { isValid: false, userData: null, error: 'INVALID_TOKEN' };
      }

      // Simple validation - replace with actual API call in production
      return { isValid: true, userData: user_details, error: null };
    } catch (error) {
      console.error('Token validation error:', error);
      return { isValid: false, userData: null, error: 'VALIDATION_ERROR' };
    }
  }

  static async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        return { success: false, tokens: null, error: 'NO_REFRESH_TOKEN' };
      }

      // Mock refresh - replace with actual API call
      return {
        success: true,
        tokens: { accessToken: refreshToken },
        error: null,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, tokens: null, error: 'REFRESH_ERROR' };
    }
  }

  static async logout(token, clearAllData = true) {
    try {
      const keysToRemove = [
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.USER_CREDENTIALS,
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
      return { success: true, error: null };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }
}

/**
 * Storage helper functions
 */
export class StorageHelper {
  static async storeUserData(userData, token, refreshToken = null) {
    try {
      const dataToStore = [
        [STORAGE_KEYS.USER_TOKEN, token],
        [STORAGE_KEYS.USER_DATA, JSON.stringify(userData)],
        [STORAGE_KEYS.LAST_LOGIN, new Date().toISOString()],
      ];

      if (refreshToken) {
        dataToStore.push([STORAGE_KEYS.REFRESH_TOKEN, refreshToken]);
      }

      await AsyncStorage.multiSet(dataToStore);
      return { success: true, error: null };
    } catch (error) {
      console.error('Failed to store user data:', error);
      return { success: false, error: error.message };
    }
  }

  static async getUserData() {
    try {
      const [token, userDataString, refreshToken] = await AsyncStorage.multiGet(
        [
          STORAGE_KEYS.USER_TOKEN,
          STORAGE_KEYS.USER_DATA,
          STORAGE_KEYS.REFRESH_TOKEN,
        ],
      );

      const userData = userDataString[1] ? JSON.parse(userDataString[1]) : null;

      return {
        token: token[1],
        userData,
        refreshToken: refreshToken[1],
      };
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return { token: null, userData: null, refreshToken: null };
    }
  }

  static async getPreferences() {
    try {
      const preferences = await AsyncStorage.getItem(
        STORAGE_KEYS.USER_PREFERENCES,
      );
      return preferences ? JSON.parse(preferences) : {};
    } catch (error) {
      console.error('Failed to get preferences:', error);
      return {};
    }
  }

  static async clearCache() {
    try {
      const cacheKeys = [
        STORAGE_KEYS.ROOMS_CACHE,
        STORAGE_KEYS.TENANTS_CACHE,
        STORAGE_KEYS.TICKETS_CACHE,
      ];

      await AsyncStorage.multiRemove(cacheKeys);
      return { success: true };
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return { success: false, error: error.message };
    }
  }

  static async clearUserData() {
    try {
      const keysToRemove = [
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.USER_CREDENTIALS,
        STORAGE_KEYS.LAST_LOGIN,
        STORAGE_KEYS.USER_PREFERENCES,
      ];

      await AsyncStorage.multiRemove(keysToRemove);
      await StorageHelper.clearCache(); // Also clear the cache
      return { success: true, error: null };
    } catch (error) {
      console.error('Failed to clear user data:', error);
      return { success: false, error: error.message };
    }
  }
}

/**
 * Network helper functions
 */
export class NetworkHelper {
  static connectionInfo = null;
  static listeners = [];

  static async checkConnectivity() {
    try {
      const state = await NetInfo.fetch();
      NetworkHelper.connectionInfo = state;
      return state.isConnected && state.isInternetReachable;
    } catch (error) {
      console.error('Connectivity check failed:', error);
      return false;
    }
  }

  static subscribeToNetworkChanges(callback) {
    const unsubscribe = NetInfo.addEventListener(state => {
      NetworkHelper.connectionInfo = state;
      callback(state);
    });

    NetworkHelper.listeners.push(unsubscribe);
    return unsubscribe;
  }

  static unsubscribeAll() {
    NetworkHelper.listeners.forEach(unsubscribe => unsubscribe());
    NetworkHelper.listeners = [];
  }
}

/**
 * Error handling helper functions
 */
export class ErrorHelper {
  static errorLog = [];
  static maxLogSize = 100;

  static getErrorMessage(errorType, customMessage = null) {
    if (customMessage) return customMessage;
    return ERROR_MESSAGES[errorType] || ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  static logError(error, context = '', userId = null) {
    const errorEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context,
      userId,
    };

    ErrorHelper.errorLog.push(errorEntry);

    if (ErrorHelper.errorLog.length > ErrorHelper.maxLogSize) {
      ErrorHelper.errorLog.shift();
    }

    if (__DEV__) {
      console.error('Error logged:', errorEntry);
    }
  }

  static logInfo(message, context = '', data = null) {
    if (__DEV__) {
      console.log(`[${context}] ${message}`, data ? data : '');
    }
  }

  static getErrorLog() {
    return [...ErrorHelper.errorLog];
  }

  static clearErrorLog() {
    ErrorHelper.errorLog = [];
  }

  static showErrorAlert(title, message, actions = []) {
    const defaultActions = [{ text: 'OK', style: 'default' }];

    Alert.alert(
      title || 'Error',
      message || ERROR_MESSAGES.UNKNOWN_ERROR,
      actions.length > 0 ? actions : defaultActions,
    );
  }
}

/**
 * Performance optimization helpers
 */
export class PerformanceHelper {
  static debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };

      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) func(...args);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    let lastResult;

    return function (...args) {
      if (!inThrottle) {
        lastResult = func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
      return lastResult;
    };
  }

  static memoize(fn, getKey = (...args) => JSON.stringify(args)) {
    const cache = new Map();

    return function (...args) {
      const key = getKey(...args);

      if (cache.has(key)) {
        return cache.get(key);
      }

      const result = fn.apply(this, args);
      cache.set(key, result);

      if (cache.size > 1000) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }

      return result;
    };
  }
}

/**
 * Analytics and tracking helper functions
 */
export class AnalyticsHelper {
  static trackScreenView(screenName, params = {}) {
    if (__DEV__) {
      console.log('Screen View:', screenName, params);
      return;
    }

    // Integrate with your analytics service
    // Firebase Analytics, Mixpanel, etc.
    try {
      // analytics().logScreenView({
      //   screen_name: screenName,
      //   screen_class: screenName,
      //   ...params
      // });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  static trackEvent(eventName, properties = {}) {
    if (__DEV__) {
      console.log('Event:', eventName, properties);
      return;
    }

    try {
      // analytics().logEvent(eventName, properties);
    } catch (error) {
      console.error('Analytics event error:', error);
    }
  }

  static trackUserProperty(property, value) {
    if (__DEV__) {
      console.log('User Property:', property, value);
      return;
    }

    try {
      // analytics().setUserProperty(property, value);
    } catch (error) {
      console.error('Analytics user property error:', error);
    }
  }

  static setUserId(userId) {
    if (__DEV__) {
      console.log('User ID:', userId);
      return;
    }

    try {
      // analytics().setUserId(userId);
    } catch (error) {
      console.error('Analytics user ID error:', error);
    }
  }
}

export default {
  NavigationHelper,
  AuthHelper,
  StorageHelper,
  NetworkHelper,
  ErrorHelper,
  PerformanceHelper,
  AnalyticsHelper,
};
