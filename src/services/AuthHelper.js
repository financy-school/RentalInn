import {
  handleUserLogin,
  handleUserSignup,
  handleUserLogout,
} from './NetworkUtils';

const AuthHelpers = {
  login: async (email, password) => {
    try {
      console.log('AuthHelper login called with:', email, password);
      const response = await handleUserLogin({ email, password });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed',
      };
    }
  },

  signup: async userData => {
    try {
      const response = await handleUserSignup(userData);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Signup failed',
      };
    }
  },

  logout: async token => {
    try {
      await handleUserLogout(token);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Logout failed',
      };
    }
  },

  validateToken: async token => {
    // Implement token validation logic here
    // This could be an API call to verify the token
    return {
      isValid: true,
      userData: null, // Add user data if available from token validation
    };
  },
};

export default AuthHelpers;
