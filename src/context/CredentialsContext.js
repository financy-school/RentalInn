import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useReducer,
  useRef,
} from 'react';

import { getOwnerDetails } from '../services/NetworkUtils';
import helpers from '../navigation/helpers';
import { STORAGE_KEYS } from '../navigation/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { AuthHelper, StorageHelper, ErrorHelper } = helpers;

// Authentication states
export const AUTH_STATES = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  ERROR: 'error',
  REFRESHING: 'refreshing',
};

// Action types for reducer
const ACTION_TYPES = {
  SET_LOADING: 'SET_LOADING',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  SET_UNAUTHENTICATED: 'SET_UNAUTHENTICATED',
  SET_ERROR: 'SET_ERROR',
  SET_REFRESHING: 'SET_REFRESHING',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_STATE: 'RESET_STATE',
};

// Initial state
const initialState = {
  credentials: null,
  authState: AUTH_STATES.LOADING,
  loading: true,
  error: null,
  userProfile: null,
};

// Auth reducer for better state management
const authReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: action.clearError ? null : state.error,
      };

    case ACTION_TYPES.SET_AUTHENTICATED:
      return {
        ...state,
        credentials: action.payload.credentials,
        userProfile: action.payload.userProfile || action.payload.credentials,
        authState: AUTH_STATES.AUTHENTICATED,
        loading: false,
        error: null,
      };

    case ACTION_TYPES.SET_UNAUTHENTICATED:
      return {
        ...initialState,
        authState: AUTH_STATES.UNAUTHENTICATED,
        loading: false,
      };

    case ACTION_TYPES.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        authState: AUTH_STATES.ERROR,
        loading: false,
      };

    case ACTION_TYPES.SET_REFRESHING:
      return {
        ...state,
        authState: AUTH_STATES.REFRESHING,
        loading: action.payload,
      };

    case ACTION_TYPES.UPDATE_PROFILE:
      return {
        ...state,
        userProfile: { ...state.userProfile, ...action.payload },
        credentials: { ...state.credentials, ...action.payload },
      };

    case ACTION_TYPES.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case ACTION_TYPES.RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

// Create credentials context with default values
const CredentialsContext = createContext({
  credentials: null,
  authState: AUTH_STATES.LOADING,
  loading: true,
  error: null,
  userProfile: null,
  setCredentials: () => {},
  clearCredentials: () => {},
  updateProfile: () => {},
  refreshCredentials: () => {},
  validateSession: () => {},
  isAuthenticated: false,
  hasPermission: () => false,
  clearError: () => {},
});

export const CredentialsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const timeoutRef = useRef(null);
  const errorTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // Computed values
  const isAuthenticated = useMemo(() => {
    return (
      state.authState === AUTH_STATES.AUTHENTICATED &&
      state.credentials !== null
    );
  }, [state.authState, state.credentials]);

  // Clear error after timeout
  const clearError = useCallback(() => {
    dispatch({ type: ACTION_TYPES.CLEAR_ERROR });

    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
  }, []);

  // Auto-clear error after delay
  useEffect(() => {
    if (state.error && !errorTimeoutRef.current) {
      errorTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          clearError();
        }
      }, 5000);
    }
  }, [state.error, clearError]);

  // Handle authentication error
  const handleAuthError = useCallback(
    async (errorType, customMessage = null) => {
      if (!isMountedRef.current) return;

      const errorMessage = ErrorHelper.getErrorMessage(
        errorType,
        customMessage,
      );

      dispatch({
        type: ACTION_TYPES.SET_ERROR,
        payload: errorMessage,
      });

      // Auto-logout on token expiration
      if (errorType === 'TOKEN_EXPIRED') {
        try {
          await clearCredentialsInternal();
        } catch (error) {
          console.error('Error during auto-logout:', error);
        }
      }
    },
    [],
  );

  // Internal function to clear credentials without circular dependency
  const clearCredentialsInternal = useCallback(async () => {
    if (!isMountedRef.current) return { success: false };

    try {
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Save token for server logout
      const token = state.credentials?.token;

      // Clear storage first
      await StorageHelper.clearUserData();
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        'savedEmail',
        'rememberMe',
        'userData',
        'userToken',
      ]);

      // Server logout (don't wait for it)
      if (token) {
        AuthHelper.logout(token).catch(error => {
          console.warn('Server logout failed:', error);
        });
      }

      // Update state
      dispatch({ type: ACTION_TYPES.SET_UNAUTHENTICATED });

      return { success: true };
    } catch (error) {
      console.error('Clear credentials error:', error);
      // Force clear state even on error
      dispatch({ type: ACTION_TYPES.SET_UNAUTHENTICATED });
      throw error;
    }
  }, [state.credentials?.token]);

  // Validate user session
  const validateSession = useCallback(async () => {
    if (!isMountedRef.current) return false;

    try {
      if (!state.credentials?.token) {
        dispatch({ type: ACTION_TYPES.SET_UNAUTHENTICATED });
        return false;
      }

      const { isValid, userData, validationError } =
        await AuthHelper.validateToken(state.credentials.token);

      if (!isMountedRef.current) return false;

      if (isValid && userData) {
        dispatch({
          type: ACTION_TYPES.SET_AUTHENTICATED,
          payload: {
            credentials: state.credentials,
            userProfile: userData,
          },
        });
        return true;
      } else {
        await handleAuthError(validationError || 'TOKEN_EXPIRED');
        return false;
      }
    } catch (sessionError) {
      console.error('Session validation error:', sessionError);
      if (isMountedRef.current) {
        await handleAuthError('NETWORK_ERROR');
      }
      return false;
    }
  }, [state.credentials, handleAuthError]);

  // Load stored credentials
  const checkLoginCredentials = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      dispatch({
        type: ACTION_TYPES.SET_LOADING,
        payload: true,
        clearError: true,
      });

      const { token, userData } = await StorageHelper.getUserData();

      if (!isMountedRef.current) return;

      if (token && userData) {
        const credentialsData = {
          ...userData,
          token,
          accessToken: token,
        };

        // Fetch fresh user details
        try {
          const ownerDetails = await getOwnerDetails(credentialsData);

          if (!isMountedRef.current) return;

          if (ownerDetails) {
            dispatch({
              type: ACTION_TYPES.SET_AUTHENTICATED,
              payload: {
                credentials: credentialsData,
                userProfile: ownerDetails,
              },
            });
          } else {
            throw new Error('Failed to fetch user details');
          }
        } catch (detailsError) {
          console.warn('Failed to fetch owner details:', detailsError);

          if (isMountedRef.current) {
            // Use stored data as fallback
            dispatch({
              type: ACTION_TYPES.SET_AUTHENTICATED,
              payload: {
                credentials: credentialsData,
                userProfile: credentialsData,
              },
            });
          }
        }
      } else {
        dispatch({ type: ACTION_TYPES.SET_UNAUTHENTICATED });
      }
    } catch (credentialsError) {
      console.error('Credentials check error:', credentialsError);
      if (isMountedRef.current) {
        await handleAuthError('SERVER_ERROR');
      }
    }
  }, [handleAuthError]);

  // Save credentials securely
  const setCredentials = useCallback(
    async newCredentials => {
      if (!isMountedRef.current) return { success: false };

      try {
        dispatch({
          type: ACTION_TYPES.SET_LOADING,
          payload: true,
          clearError: true,
        });

        // Handle null/undefined for logout
        if (newCredentials === null || newCredentials === undefined) {
          await clearCredentialsInternal();
          return { success: true };
        }

        // Validate input
        if (typeof newCredentials !== 'object') {
          throw new Error('Invalid credentials format');
        }

        const requiredFields = ['email'];
        const missingFields = requiredFields.filter(
          field => !newCredentials[field],
        );

        if (missingFields.length > 0) {
          throw new Error(
            `Missing required fields: ${missingFields.join(', ')}`,
          );
        }

        // Prepare credentials with token compatibility
        const credentialsWithTokens = {
          ...newCredentials,
          token: newCredentials.token || newCredentials.accessToken,
          accessToken: newCredentials.accessToken || newCredentials.token,
        };

        // Store credentials
        const storageResult = await StorageHelper.storeUserData(
          credentialsWithTokens,
          credentialsWithTokens.token || '',
        );

        if (!isMountedRef.current) return { success: false };

        if (storageResult.success) {
          dispatch({
            type: ACTION_TYPES.SET_AUTHENTICATED,
            payload: {
              credentials: credentialsWithTokens,
              userProfile: credentialsWithTokens,
            },
          });

          return { success: true };
        } else {
          throw new Error('Failed to store credentials');
        }
      } catch (saveError) {
        console.error('Save credentials error:', saveError);
        if (isMountedRef.current) {
          await handleAuthError('SERVER_ERROR', saveError.message);
        }
        return { success: false, error: saveError.message };
      }
    },
    [clearCredentialsInternal, handleAuthError],
  );

  // Public clear credentials function
  const clearCredentials = useCallback(async () => {
    return await clearCredentialsInternal();
  }, [clearCredentialsInternal]);

  // Update user profile
  const updateProfile = useCallback(
    async profileData => {
      if (!isMountedRef.current) return { success: false };

      try {
        if (!state.credentials?.token) {
          throw new Error('User not authenticated');
        }

        // Optimistic update
        dispatch({
          type: ACTION_TYPES.UPDATE_PROFILE,
          payload: profileData,
        });

        // Update stored credentials
        const updatedCredentials = { ...state.credentials, ...profileData };
        await StorageHelper.storeUserData(
          updatedCredentials,
          state.credentials.token,
        );

        return { success: true, message: 'Profile updated successfully' };
      } catch (profileError) {
        console.error('Profile update error:', profileError);
        // Revert optimistic update by re-fetching
        await checkLoginCredentials();
        return { success: false, message: profileError.message };
      }
    },
    [state.credentials, checkLoginCredentials],
  );

  // Refresh credentials
  const refreshCredentials = useCallback(async () => {
    if (state.credentials?.token && isMountedRef.current) {
      dispatch({ type: ACTION_TYPES.SET_REFRESHING, payload: true });
      await checkLoginCredentials();
    }
  }, [state.credentials, checkLoginCredentials]);

  // Check user permissions
  const hasPermission = useCallback(
    permission => {
      if (!state.userProfile?.permissions) {
        return false;
      }

      return (
        state.userProfile.permissions.includes(permission) ||
        state.userProfile.permissions.includes('admin')
      );
    },
    [state.userProfile],
  );

  // Auto-refresh token before expiry
  useEffect(() => {
    if (state.credentials?.tokenExpiry && isAuthenticated) {
      const timeUntilExpiry =
        new Date(state.credentials.tokenExpiry).getTime() - Date.now();
      const refreshTime = timeUntilExpiry - 5 * 60 * 1000; // 5 minutes before

      if (refreshTime > 0) {
        timeoutRef.current = setTimeout(async () => {
          if (!isMountedRef.current) return;

          try {
            const { success, tokens } = await AuthHelper.refreshToken(
              state.credentials.refreshToken,
            );

            if (success && tokens && isMountedRef.current) {
              await setCredentials({ ...state.credentials, ...tokens });
            } else if (isMountedRef.current) {
              await handleAuthError('TOKEN_EXPIRED');
            }
          } catch (refreshError) {
            if (isMountedRef.current) {
              await handleAuthError('TOKEN_EXPIRED');
            }
          }
        }, refreshTime);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [state.credentials, isAuthenticated, setCredentials, handleAuthError]);

  // Initialize credentials on mount
  useEffect(() => {
    checkLoginCredentials();
  }, [checkLoginCredentials]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  // Context value with memoization for performance
  const contextValue = useMemo(
    () => ({
      credentials: state.credentials,
      authState: state.authState,
      loading: state.loading,
      error: state.error,
      userProfile: state.userProfile,
      isAuthenticated,
      setCredentials,
      clearCredentials,
      updateProfile,
      refreshCredentials,
      validateSession,
      hasPermission,
      clearError,
      // Additional utilities
      isLoading: state.loading,
      isError: state.authState === AUTH_STATES.ERROR,
      isRefreshing: state.authState === AUTH_STATES.REFRESHING,
      errorMessage: state.error,
    }),
    [
      state,
      isAuthenticated,
      setCredentials,
      clearCredentials,
      updateProfile,
      refreshCredentials,
      validateSession,
      hasPermission,
      clearError,
    ],
  );

  return (
    <CredentialsContext.Provider value={contextValue}>
      {children}
    </CredentialsContext.Provider>
  );
};

// Custom hook for using credentials context
export const useAuth = () => {
  const context = useContext(CredentialsContext);

  if (!context) {
    throw new Error('useAuth must be used within a CredentialsProvider');
  }

  return context;
};

// Enhanced HOC for protected components
export const withAuth = (Component, options = {}) => {
  const {
    requiredPermissions = [],
    redirectOnFail = true,
    fallbackComponent = null,
  } = options;

  const AuthenticatedComponent = props => {
    const auth = useAuth();

    // Check authentication
    if (!auth.isAuthenticated) {
      if (fallbackComponent) {
        return fallbackComponent;
      }
      return redirectOnFail ? null : <Component {...props} auth={auth} />;
    }

    // Check permissions if required
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission =>
        auth.hasPermission(permission),
      );

      if (!hasAllPermissions) {
        if (fallbackComponent) {
          return fallbackComponent;
        }
        return null;
      }
    }

    return <Component {...props} auth={auth} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${
    Component.displayName || Component.name
  })`;

  return AuthenticatedComponent;
};

export { CredentialsContext };
export default CredentialsProvider;
