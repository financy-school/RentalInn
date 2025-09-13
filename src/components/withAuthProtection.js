import React, { useEffect, useContext } from 'react';
import { CredentialsContext } from '../context/CredentialsContext';

export const withAuthProtection = WrappedComponent => {
  const WithAuthProtection = props => {
    const { credentials, isAuthenticated } = useContext(CredentialsContext);

    useEffect(() => {
      if (!isAuthenticated || !credentials) {
        console.log('No credentials or not authenticated, navigating to login');
        props.navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }, [isAuthenticated, credentials, props.navigation]);

    // Don't render the protected component if not authenticated
    if (!isAuthenticated || !credentials) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  // Set display name for debugging
  WithAuthProtection.displayName = `WithAuthProtection(${getDisplayName(
    WrappedComponent,
  )})`;
  return WithAuthProtection;
};

// Helper function to get component display name
function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withAuthProtection;
