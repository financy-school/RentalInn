import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { useAuth } from '../context/CredentialsContext';
import StandardText from '../components/StandardText/StandardText';
import { SCREEN_NAMES } from '../navigation/constants';
import colors from '../theme/colors';
import { FONT_WEIGHT } from '../theme/layout';

/**
 * Enhanced HOC for protecting components with authentication
 * @param {React.Component} WrappedComponent - The component to protect
 * @param {Object} options - Configuration options
 * @returns {React.Component} - Protected component
 */
export const withAuthProtection = (WrappedComponent, options = {}) => {
  const {
    requiredPermissions = [],
    showLoader = true,
    redirectOnFail = true,
    fallbackComponent: CustomFallback = null,
    allowUnauthenticated = false,
    onAuthFail = null,
  } = options;

  const WithAuthProtection = props => {
    const auth = useAuth();
    const navigationRef = useRef(props.navigation);
    const hasAttemptedRedirect = useRef(false);

    // Update navigation ref
    useEffect(() => {
      navigationRef.current = props.navigation;
    }, [props.navigation]);

    // Handle authentication failures
    const handleAuthFailure = React.useCallback(
      (reason = 'authentication_required') => {
        // Custom failure handler
        if (onAuthFail) {
          onAuthFail(reason, auth, props);
          return;
        }

        // Default behavior - redirect to login
        if (
          redirectOnFail &&
          navigationRef.current &&
          !hasAttemptedRedirect.current
        ) {
          hasAttemptedRedirect.current = true;

          // Reset navigation stack to login screen
          navigationRef.current.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: SCREEN_NAMES.LOGIN }],
            }),
          );
        }
      },
      [auth, props],
    );

    // Monitor authentication state changes
    useEffect(() => {
      // Reset redirect flag when auth state changes
      hasAttemptedRedirect.current = false;

      // Handle different auth states
      switch (auth.authState) {
        case 'loading':
          // Still loading, wait
          break;

        case 'authenticated':
          // Check permissions if required
          if (requiredPermissions.length > 0) {
            const hasAllPermissions = requiredPermissions.every(permission =>
              auth.hasPermission(permission),
            );

            if (!hasAllPermissions) {
              console.warn('Insufficient permissions:', {
                required: requiredPermissions,
                user: auth.userProfile?.permissions || [],
              });
              handleAuthFailure('insufficient_permissions');
              return;
            }
          }
          break;

        case 'unauthenticated':
          if (!allowUnauthenticated) {
            console.log('User not authenticated, redirecting to login');
            handleAuthFailure('not_authenticated');
            return;
          }
          break;

        case 'error':
          if (!allowUnauthenticated) {
            console.error('Authentication error:', auth.error);
            handleAuthFailure('auth_error');
            return;
          }
          break;

        default:
          console.warn('Unknown auth state:', auth.authState);
          break;
      }
    }, [
      auth.authState,
      auth.isAuthenticated,
      auth.credentials,
      auth.error,
      auth.hasPermission,
      auth.userProfile?.permissions,
      handleAuthFailure,
      auth,
    ]);

    // Show loading state
    if (auth.loading && showLoader) {
      return <LoadingFallback message="Authenticating..." error={auth.error} />;
    }

    // Show custom fallback if provided
    if (CustomFallback && !auth.isAuthenticated && !allowUnauthenticated) {
      return <CustomFallback auth={auth} {...props} />;
    }

    // Don't render if not authenticated and fallback is disabled
    if (!auth.isAuthenticated && !allowUnauthenticated && !CustomFallback) {
      return null;
    }

    // Permission check failed
    if (auth.isAuthenticated && requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission =>
        auth.hasPermission(permission),
      );

      if (!hasAllPermissions) {
        return (
          <PermissionDeniedFallback
            required={requiredPermissions}
            current={auth.userProfile?.permissions || []}
          />
        );
      }
    }

    // Render the protected component
    return <WrappedComponent {...props} auth={auth} />;
  };

  // Set display name for debugging
  WithAuthProtection.displayName = `withAuthProtection(${getDisplayName(
    WrappedComponent,
  )})`;

  return WithAuthProtection;
};

/**
 * Default loading fallback component
 */
const LoadingFallback = ({ message = 'Loading...', error }) => (
  <View style={styles.centered}>
    <ActivityIndicator size="large" color={colors.primary} />
    <StandardText style={styles.loadingText}>{message}</StandardText>
    {error && <StandardText style={styles.errorText}>{error}</StandardText>}
  </View>
);

/**
 * Permission denied fallback component
 */
const PermissionDeniedFallback = ({ required, current }) => (
  <View style={styles.centered}>
    <StandardText style={styles.errorTitle}>Access Denied</StandardText>
    <StandardText style={styles.errorMessage}>
      You don't have the required permissions to access this screen.
    </StandardText>
    {__DEV__ && (
      <View style={styles.debugInfo}>
        <StandardText style={styles.debugText}>
          Required: {required.join(', ')}
        </StandardText>
        <StandardText style={styles.debugText}>
          Current: {current.join(', ') || 'None'}
        </StandardText>
      </View>
    )}
  </View>
);

/**
 * Helper function to get component display name
 */
const getDisplayName = WrappedComponent => {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
};

/**
 * Hook for using authentication protection in functional components
 * @param {Object} options - Protection options
 * @returns {Object} - Auth protection utilities
 */
export const useAuthProtection = (options = {}) => {
  const auth = useAuth();
  const {
    requiredPermissions = [],
    onAuthFail = null,
    strict = true,
  } = options;

  const isAuthorized = React.useMemo(() => {
    if (!auth.isAuthenticated && strict) {
      return false;
    }

    if (requiredPermissions.length > 0) {
      return requiredPermissions.every(permission =>
        auth.hasPermission(permission),
      );
    }

    return true;
  }, [auth, strict, requiredPermissions]);

  const checkAuth = React.useCallback(() => {
    if (!isAuthorized && onAuthFail) {
      onAuthFail('unauthorized', auth);
    }
    return isAuthorized;
  }, [isAuthorized, onAuthFail, auth]);

  return {
    isAuthorized,
    checkAuth,
    auth,
  };
};

const styles = {
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.background || '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary || '#666',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.error || '#e53e3e',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: FONT_WEIGHT.bold,
    color: colors.error || '#e53e3e',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: colors.textSecondary || '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  debugInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: colors.gray100 || '#f7f7f7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray300 || '#d3d3d3',
  },
  debugText: {
    fontSize: 12,
    color: colors.textPrimary || '#333',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
};

export default withAuthProtection;
