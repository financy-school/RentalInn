import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOwnerDetails } from '../services/NetworkUtils';
import helpers from '../navigation/helpers';
import { STORAGE_KEYS } from '../navigation/constants';

const { AuthHelper, StorageHelper, ErrorHelper } = helpers;

// Authentication states
export const AUTH_STATES = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
  ERROR: 'error',
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
});

export const CredentialsProvider = ({ children }) => {
  const [credentials, setCredentialsState] = useState(null);
  const [authState, setAuthState] = useState(AUTH_STATES.LOADING);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [sessionTimeout, setSessionTimeout] = useState(null);

  // Computed values
  const isAuthenticated = useMemo(() => {
    return authState === AUTH_STATES.AUTHENTICATED && credentials !== null;
  }, [authState, credentials]);

  // Clear error after timeout
  const clearError = useCallback(() => {
    if (error) {
      setTimeout(() => setError(null), 5000);
    }
  }, [error]);

  // Handle authentication error
  const handleAuthError = useCallback(
    (errorType, customMessage = null) => {
      const errorMessage = ErrorHelper.getErrorMessage(
        errorType,
        customMessage,
      );
      setError(errorMessage);
      setAuthState(AUTH_STATES.ERROR);

      if (errorType === 'TOKEN_EXPIRED') {
        clearCredentials();
      }

      clearError();
    },
    [clearError, clearCredentials],
  );

  // Validate user session
  const validateSession = useCallback(async () => {
    try {
      if (!credentials?.token) {
        setAuthState(AUTH_STATES.UNAUTHENTICATED);
        return false;
      }

      const { isValid, userData, validationError } =
        await AuthHelper.validateToken(credentials.token);

      if (isValid && userData) {
        setUserProfile(userData);
        setAuthState(AUTH_STATES.AUTHENTICATED);
        return true;
      } else {
        handleAuthError(validationError || 'TOKEN_EXPIRED');
        return false;
      }
    } catch (sessionError) {
      console.error('Session validation error:', sessionError);
      handleAuthError('NETWORK_ERROR');
      return false;
    }
  }, [credentials, handleAuthError]);

  // Load stored credentials
  const checkLoginCredentials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { token, userData } = await StorageHelper.getUserData();

      if (token && userData) {
        const credentialsData = {
          ...userData,
          token,
          accessToken: token, // For compatibility with API calls
        };
        setCredentialsState(credentialsData);
        setAuthState(AUTH_STATES.AUTHENTICATED);

        // Fetch fresh user details
        try {
          const ownerDetails = await getOwnerDetails(credentialsData);
          if (ownerDetails) {
            setUserProfile(ownerDetails);
          }
        } catch (detailsError) {
          console.warn('Failed to fetch owner details:', detailsError);
          //temp : fail authentication if details fetch fails
          setAuthState(AUTH_STATES.UNAUTHENTICATED);
        }
      } else {
        setAuthState(AUTH_STATES.UNAUTHENTICATED);
      }
    } catch (credentialsError) {
      console.error('Credentials check error:', credentialsError);
      handleAuthError('SERVER_ERROR');
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  // Save credentials securely
  const setCredentials = useCallback(
    async newCredentials => {
      try {
        setLoading(true);
        setError(null);

        // Allow null/undefined for clearing credentials during logout
        if (newCredentials === null || newCredentials === undefined) {
          setCredentialsState(null);
          setUserProfile(null);
          setAuthState(AUTH_STATES.UNAUTHENTICATED);
          return { success: true };
        }

        if (typeof newCredentials !== 'object') {
          throw new Error('Invalid credentials format');
        }

        // Validate required fields
        const requiredFields = ['email'];
        const missingFields = requiredFields.filter(
          field => !newCredentials[field],
        );

        if (missingFields.length > 0) {
          throw new Error(
            `Missing required fields: ${missingFields.join(', ')}`,
          );
        }

        // Ensure both token formats are available for compatibility
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

        if (storageResult.success) {
          // Set state in the correct order
          await Promise.all([
            new Promise(resolve => setCredentialsState(credentialsWithTokens)),
            new Promise(resolve => setUserProfile(credentialsWithTokens)),
          ]);

          // Set auth state last to trigger navigation updates
          setAuthState(AUTH_STATES.AUTHENTICATED);

          // Set up session timeout if token expires
          if (credentialsWithTokens.tokenExpiry) {
            const timeout = setTimeout(() => {
              handleAuthError('TOKEN_EXPIRED');
            }, new Date(credentialsWithTokens.tokenExpiry).getTime() - Date.now());

            setSessionTimeout(timeout);
          }

          if (__DEV__) {
            console.log('Credentials saved successfully');
          }
        } else {
          throw new Error('Failed to store credentials');
        }
      } catch (saveError) {
        console.error('Save credentials error:', saveError);
        handleAuthError('SERVER_ERROR', saveError.message);
      } finally {
        setLoading(false);
      }
    },
    [handleAuthError],
  );

  // Clear credentials and logout
  const clearCredentials = useCallback(async () => {
    try {
      setLoading(true);

      // Clear session timeout
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
        setSessionTimeout(null);
      }

      // Save the token before clearing state
      const token = credentials?.token;

      // First clear all storage
      try {
        console.log('Clearing storage...');
        await Promise.all([
          StorageHelper.clearUserData(),
          AsyncStorage.multiRemove([
            STORAGE_KEYS.ACCESS_TOKEN,
            STORAGE_KEYS.REFRESH_TOKEN,
            STORAGE_KEYS.USER_DATA,
            'savedEmail',
            'rememberMe',
          ]),
        ]);
      } catch (storageError) {
        console.warn('Failed to clear storage:', storageError);
      }

      try {
        if (token) {
          await AuthHelper.logout(token);
        }
      } catch (apiError) {
        console.warn('Logout API call failed:', apiError);
      }

      setCredentialsState(null);
      setUserProfile(null);
      setError(null);

      // Set auth state last to trigger navigation
      setAuthState(AUTH_STATES.UNAUTHENTICATED);

      if (__DEV__) {
        console.log('Credentials cleared successfully');
      }
    } catch (logoutError) {
      console.error('Clear credentials error:', logoutError);
      // Ensure state is cleared even if there's an error
      setCredentialsState(null);
      setUserProfile(null);
      setAuthState(AUTH_STATES.UNAUTHENTICATED);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [credentials, sessionTimeout]);

  // Update user profile
  const updateProfile = useCallback(
    async profileData => {
      try {
        if (!credentials?.token) {
          throw new Error('User not authenticated');
        }

        // Optimistic update
        const updatedProfile = { ...userProfile, ...profileData };
        setUserProfile(updatedProfile);

        // Update stored credentials
        const updatedCredentials = { ...credentials, ...profileData };
        await StorageHelper.storeUserData(
          updatedCredentials,
          credentials.token,
        );
        setCredentialsState(updatedCredentials);

        return { success: true, message: 'Profile updated successfully' };
      } catch (profileError) {
        console.error('Profile update error:', profileError);
        // Revert optimistic update
        setUserProfile(userProfile);
        return { success: false, message: profileError.message };
      }
    },
    [credentials, userProfile],
  );

  // Refresh credentials
  const refreshCredentials = useCallback(async () => {
    if (credentials?.token) {
      await checkLoginCredentials();
    }
  }, [credentials, checkLoginCredentials]);

  // Check user permissions
  const hasPermission = useCallback(
    permission => {
      if (!userProfile?.permissions) {
        return false;
      }

      return (
        userProfile.permissions.includes(permission) ||
        userProfile.permissions.includes('admin')
      );
    },
    [userProfile],
  );

  // Auto-refresh token before expiry
  useEffect(() => {
    if (credentials?.tokenExpiry) {
      const timeUntilExpiry =
        new Date(credentials.tokenExpiry).getTime() - Date.now();
      const refreshTime = timeUntilExpiry - 5 * 60 * 1000; // Refresh 5 minutes before expiry

      if (refreshTime > 0) {
        const timeout = setTimeout(async () => {
          try {
            const { success, tokens } = await AuthHelper.refreshToken(
              credentials.refreshToken,
            );
            if (success && tokens) {
              await setCredentials({ ...credentials, ...tokens });
            } else {
              handleAuthError('TOKEN_EXPIRED');
            }
          } catch (refreshError) {
            handleAuthError('TOKEN_EXPIRED');
          }
        }, refreshTime);

        setSessionTimeout(timeout);
      }
    }

    return () => {
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
    };
  }, [credentials, handleAuthError, setCredentials, sessionTimeout]);

  // Initialize credentials on mount
  useEffect(() => {
    checkLoginCredentials();
  }, [checkLoginCredentials]);

  // Context value with memoization for performance
  const contextValue = useMemo(
    () => ({
      credentials,
      authState,
      loading,
      error,
      userProfile,
      isAuthenticated,
      setCredentials,
      clearCredentials,
      updateProfile,
      refreshCredentials,
      validateSession,
      hasPermission,
      // Additional utilities
      isLoading: loading,
      isError: authState === AUTH_STATES.ERROR,
      errorMessage: error,
    }),
    [
      credentials,
      authState,
      loading,
      error,
      userProfile,
      isAuthenticated,
      setCredentials,
      clearCredentials,
      updateProfile,
      refreshCredentials,
      validateSession,
      hasPermission,
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

// HOC for protected components
export const withAuth = Component => {
  const AuthenticatedComponent = props => {
    const auth = useAuth();

    if (!auth.isAuthenticated) {
      return null; // or redirect to login
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
