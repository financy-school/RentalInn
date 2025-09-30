import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
  StatusBar,
  Dimensions,
  View,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Button, TextInput, Snackbar, Card } from 'react-native-paper';
import { Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Contexts
import { CredentialsContext } from '../context/CredentialsContext';
import { ThemeContext } from '../context/ThemeContext';

// Components
import KeyBoardAvoidingWrapper from '../components/KeyBoardAvoidingWrapper';
import StandardText from '../components/StandardText/StandardText';

// Services and utilities
import helpers from '../navigation/helpers';

const { PerformanceHelper } = helpers;

import { ERROR_MESSAGES } from '../navigation/constants';

// Theme
import colors from '../theme/color';
import AuthHelpers from '../services/AuthHelper';

const Login = ({ navigation }) => {
  // State management
  const [hidePassword, setHidePassword] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Contexts
  const { setCredentials } = useContext(CredentialsContext);
  const { theme: mode } = useContext(ThemeContext);

  // Theme variables
  const isDark = mode === 'dark';
  const backgroundColor = isDark
    ? colors.backgroundDark
    : colors.backgroundLight;
  const cardBackground = isDark ? colors.light_black : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;
  const onPrimary = colors.white;
  const primary = colors.primary;

  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('savedEmail');
        const savedRememberMe = await AsyncStorage.getItem('rememberMe');

        if (savedEmail && savedRememberMe === 'true') {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Error loading saved credentials:', error);
      }
    };

    loadSavedCredentials();
  }, []);

  // Validate email format
  const validateEmail = useCallback(emailToValidate => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToValidate);
  }, []);

  // Debounced error clearing
  const clearErrorMessage = PerformanceHelper.debounce(
    () => setErrorMessage(''),
    5000,
  );

  // Handle form validation
  const validateForm = useCallback(() => {
    if (!email || !password) {
      setErrorMessage(
        ERROR_MESSAGES.VALIDATION_ERROR ||
          'Please enter both email and password.',
      );
      clearErrorMessage();
      return false;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      clearErrorMessage();
      return false;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      clearErrorMessage();
      return false;
    }

    return true;
  }, [email, password, validateEmail, clearErrorMessage]);

  // Handle login process
  const handleLogin = useCallback(async () => {
    try {
      // Validate form first
      const isValid = validateForm();
      if (!isValid) return;

      setLoading(true);
      setErrorMessage('');

      // Call authentication API
      const response = await AuthHelpers.login(email, password);

      if (!response.success || (response.data && !response.data.success)) {
        // Handle specific error cases
        const errorMsg = response.data?.error || response.message;

        // Check for common error patterns and provide user-friendly messages
        if (
          errorMsg &&
          (errorMsg.includes('Invalid email or password') ||
            errorMsg.includes('credentials') ||
            errorMsg.includes('authentication'))
        ) {
          setErrorMessage(
            'Invalid email or password. Please check your credentials and try again.',
          );
        } else if (
          errorMsg &&
          (errorMsg.includes('network') ||
            errorMsg.includes('connection') ||
            errorMsg.includes('timeout'))
        ) {
          setErrorMessage(
            'Network error. Please check your internet connection and try again.',
          );
        } else if (
          errorMsg &&
          errorMsg.includes('account') &&
          errorMsg.includes('locked')
        ) {
          setErrorMessage(
            'Your account has been temporarily locked. Please contact support.',
          );
        } else if (errorMsg && errorMsg.includes('too many')) {
          setErrorMessage('Too many login attempts. Please try again later.');
        } else if (
          errorMsg &&
          (errorMsg.includes('server') || errorMsg.includes('maintenance'))
        ) {
          setErrorMessage(
            'Server is temporarily unavailable. Please try again later.',
          );
        } else {
          // Use the API error message if it's user-friendly, otherwise use a generic message
          setErrorMessage(
            errorMsg && errorMsg.length < 100
              ? errorMsg
              : 'Login failed. Please try again.',
          );
        }

        clearErrorMessage();
        return;
      }

      if (!response.data) {
        setErrorMessage('Login failed. Please try again.');
        clearErrorMessage();
        return;
      }

      // Store remember me preference
      if (rememberMe) {
        await AsyncStorage.setItem('savedEmail', email);
        await AsyncStorage.setItem('rememberMe', 'true');
      } else {
        await AsyncStorage.removeItem('savedEmail');
        await AsyncStorage.removeItem('rememberMe');
      }

      // Store credentials
      const credentials = {
        ...response.data.data.user,
        token: response.data.data.accessToken, // Make sure token is included
        accessToken: response.data.data.accessToken, // Include both token formats
        rememberMe,
      };

      console.log('Storing credentials:', credentials);

      // Set credentials and wait for it to complete
      const credentialResult = await setCredentials(credentials);

      if (!credentialResult || !credentialResult.success) {
        setErrorMessage('Failed to save login session. Please try again.');
        clearErrorMessage();
        return;
      }

      // Clear loading state immediately after successful credential storage
      setLoading(false);
    } catch (error) {
      console.error('Login error:', error);

      // Handle unexpected errors
      if (error.message?.includes('network')) {
        setErrorMessage(
          'Network error. Please check your internet connection and try again.',
        );
      } else if (error.message?.includes('timeout')) {
        setErrorMessage('Request timed out. Please try again.');
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }

      clearErrorMessage();
    } finally {
      setLoading(false);
    }
  }, [
    email,
    password,
    rememberMe,
    validateForm,
    setCredentials,
    clearErrorMessage,
  ]);
  const handleSignUpNavigation = useCallback(() => {
    navigation.navigate('SignUp');
  }, [navigation]);

  // Handle forgot password (if you have this feature)
  const handleForgotPassword = useCallback(() => {
    // Navigate to forgot password screen or show modal
    Alert.alert(
      'Forgot Password',
      'Please contact support to reset your password.',
      [{ text: 'OK' }],
    );
  }, []);

  // Keyboard event handlers
  const handleEmailSubmit = useCallback(() => {
    // Focus password field when email is submitted
  }, []);

  const handlePasswordSubmit = useCallback(() => {
    if (!loading) {
      handleLogin();
    }
  }, [handleLogin, loading]);

  return (
    <KeyBoardAvoidingWrapper>
      <View style={[styles.container, { backgroundColor }]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundColor}
          translucent={Platform.OS === 'android'}
        />

        {/* Header Section */}
        <View
          style={[
            styles.headerSection,
            {
              backgroundColor: backgroundColor,
              height: Dimensions.get('window').height * 0.3,
            },
          ]}
        >
          <Image
            source={require('../assets/rentalinn-without-bg.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <StandardText
            fontWeight="bold"
            style={styles.headerTitle}
            color="default_white"
          >
            Welcome Back
          </StandardText>
          <StandardText style={[styles.headerSubtitle, { color: onPrimary }]}>
            Enter your credentials to access your account
          </StandardText>
        </View>

        {/* Login Form Section */}
        <View style={styles.formContainer}>
          <Card style={[styles.card, { backgroundColor: cardBackground }]}>
            {/* Email Input */}
            <TextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              mode="outlined"
              left={<TextInput.Icon icon="email" />}
              onSubmitEditing={handleEmailSubmit}
              returnKeyType="next"
              error={errorMessage.includes('email')}
              theme={{
                colors: {
                  text: textPrimary,
                  placeholder: textSecondary,
                  primary: primary,
                  background: cardBackground,
                  outline: errorMessage.includes('email')
                    ? colors.error
                    : textSecondary,
                },
                fonts: {
                  regular: 'Metropolis-Regular',
                  medium: 'Metropolis-Medium',
                  labelLarge: 'Metropolis-Regular',
                },
              }}
              style={styles.input}
              contentStyle={styles.inputContent}
            />

            {/* Password Input */}
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={hidePassword}
              mode="outlined"
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={hidePassword ? 'eye-off' : 'eye'}
                  onPress={() => setHidePassword(!hidePassword)}
                />
              }
              onSubmitEditing={handlePasswordSubmit}
              returnKeyType="go"
              error={errorMessage.includes('password')}
              theme={{
                colors: {
                  text: textPrimary,
                  placeholder: textSecondary,
                  primary: primary,
                  background: cardBackground,
                  outline: errorMessage.includes('password')
                    ? colors.error
                    : textSecondary,
                },
                fonts: {
                  regular: 'Metropolis-Regular',
                  medium: 'Metropolis-Medium',
                  labelLarge: 'Metropolis-Regular',
                },
              }}
              style={styles.input}
              contentStyle={styles.inputContent}
            />

            {/* Remember Me Checkbox */}
            <View style={styles.rememberMeContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: rememberMe ? primary : 'transparent',
                      borderColor: primary,
                    },
                  ]}
                >
                  {rememberMe && (
                    <StandardText style={styles.checkmark}>✓</StandardText>
                  )}
                </View>
                <StandardText
                  style={[styles.rememberMeText, { color: textPrimary }]}
                >
                  Remember me
                </StandardText>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleForgotPassword}>
                <StandardText
                  style={[styles.forgotPasswordText, { color: primary }]}
                >
                  Forgot Password?
                </StandardText>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={[styles.loginButton, { opacity: loading ? 0.7 : 1 }]}
              buttonColor={primary}
              labelStyle={styles.buttonLabel}
              textColor={onPrimary}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Sign Up Link */}
            <TouchableOpacity
              onPress={handleSignUpNavigation}
              style={styles.signUpContainer}
              activeOpacity={0.7}
            >
              <StandardText
                style={[styles.signUpText, { color: textSecondary }]}
              >
                Don't have an account?{' '}
              </StandardText>
              <StandardText style={[styles.signUpLink, { color: primary }]}>
                Sign Up
              </StandardText>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Error Snackbar */}
        <Snackbar
          visible={!!errorMessage}
          onDismiss={() => setErrorMessage('')}
          duration={5000}
          action={{
            label: 'Dismiss',
            onPress: () => setErrorMessage(''),
            textColor: colors.white,
          }}
          style={[
            styles.snackbar,
            {
              backgroundColor: colors.error || '#f44336',
            },
          ]}
        >
          <StandardText style={styles.snackbarText}>
            {errorMessage}
          </StandardText>
        </Snackbar>
      </View>
    </KeyBoardAvoidingWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  headerTitle: {
    fontSize: 28,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    flex: 1,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  input: {
    marginBottom: 12,
    fontFamily: 'Metropolis-Medium',
  },
  inputContent: {
    fontFamily: 'Metropolis-Regular',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberMeText: {
    fontSize: 14,
    fontFamily: 'Metropolis-Regular',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Metropolis-Medium',
  },
  loginButton: {
    marginBottom: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  buttonLabel: {
    fontFamily: 'Metropolis-Bold',
    fontSize: 16,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    fontFamily: 'Metropolis-Regular',
  },
  signUpLink: {
    fontSize: 14,
    fontFamily: 'Metropolis-Bold',
    textDecorationLine: 'underline',
  },
  snackbar: {
    borderRadius: 8,
    margin: 16,
    fontFamily: 'Metropolis-Medium',
  },
  snackbarText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Metropolis-Medium',
  },
});

export default Login;
