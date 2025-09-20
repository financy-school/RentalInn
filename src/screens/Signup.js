import React, { useState, useContext, useCallback } from 'react';
import {
  StatusBar,
  Dimensions,
  View,
  TouchableOpacity,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Button, TextInput, Snackbar, Card } from 'react-native-paper';
import { Image } from 'react-native';

// Contexts
import { CredentialsContext } from '../context/CredentialsContext';
import { ThemeContext } from '../context/ThemeContext';

// Components
import KeyBoardAvoidingWrapper from '../components/KeyBoardAvoidingWrapper';
import StandardText from '../components/StandardText/StandardText';

// Services and utilities
import { handleUserSignup } from '../services/NetworkUtils';
import helpers from '../navigation/helpers';

const { StorageHelper, PerformanceHelper } = helpers;

import {
  ERROR_MESSAGES,
  STORAGE_KEYS,
  SCREEN_NAMES,
} from '../navigation/constants';

// Theme
import colors from '../theme/color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthHelpers from '../services/AuthHelper';

const SignUp = ({ navigation }) => {
  // State management
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Contexts
  const { setCredentials } = useContext(CredentialsContext);
  const { theme: mode } = useContext(ThemeContext);

  // Theme variables
  const isDark = mode === 'dark';

  const backgroundColor = isDark
    ? colors.backgroundDark
    : colors.backgroundLight;
  const primary = colors.primary;
  const onPrimary = colors.onPrimary;
  const cardBackground = isDark ? colors.light_black : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  // Clear error message after 5 seconds

  const clearErrorMessage = PerformanceHelper.debounce(
    () => setErrorMessage(''),
    5000,
  );

  // Form validation
  const validateForm = useCallback(() => {
    if (!firstName.trim()) {
      setErrorMessage('First name is required');
      clearErrorMessage();
      return false;
    }
    if (!lastName.trim()) {
      setErrorMessage('Last name is required');
      clearErrorMessage();
      return false;
    }
    if (!email.trim()) {
      setErrorMessage('Email is required');
      clearErrorMessage();
      return false;
    }
    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      clearErrorMessage();
      return false;
    }
    if (!phone.trim()) {
      setErrorMessage('Phone number is required');
      clearErrorMessage();
      return false;
    }
    if (!password.trim()) {
      setErrorMessage('Password is required');
      clearErrorMessage();
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      clearErrorMessage();
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      clearErrorMessage();
      return false;
    }
    return true;
  }, [
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    clearErrorMessage,
  ]);

  // Handle signup process
  const handleSignup = useCallback(async () => {
    try {
      // Validate form first
      const isValid = validateForm();
      if (!isValid) return;

      setLoading(true);
      setErrorMessage('');

      // Prepare user data
      const userData = {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        postalCode,
        country,
        password,
      };

      // Call signup API
      const response = await AuthHelpers.signup(userData);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Signup failed');
      }

      // Store credentials
      const credentials = {
        ...response.data,
        ...userData,
        password: undefined, // Don't store password
      };

      await setCredentials(credentials);

      // Navigation will be handled by RootStack based on auth state
    } catch (error) {
      console.error('Signup error:', error);
      setErrorMessage(error.message || 'An error occurred during signup');
      clearErrorMessage();
    } finally {
      setLoading(false);
    }
  }, [
    validateForm,
    firstName,
    lastName,
    email,
    phone,
    address,
    city,
    state,
    postalCode,
    country,
    password,
    setCredentials,
    clearErrorMessage,
  ]);

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
              height: Dimensions.get('window').height * 0.35,
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
            Create Account
          </StandardText>
          <StandardText style={[styles.headerSubtitle, { color: onPrimary }]}>
            Join RentalInn to manage your properties
          </StandardText>
        </View>

        {/* Signup Form Section */}
        <ScrollView
          style={styles.formContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={[styles.card, { backgroundColor: cardBackground }]}>
            {/* First Name */}
            <TextInput
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              autoCorrect={false}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
              returnKeyType="next"
              theme={{
                colors: {
                  text: textPrimary,
                  placeholder: textSecondary,
                  primary: primary,
                  background: cardBackground,
                  outline: textSecondary,
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

            {/* Last Name */}
            <TextInput
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              autoCorrect={false}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
              returnKeyType="next"
              theme={{
                colors: {
                  text: textPrimary,
                  placeholder: textSecondary,
                  primary: primary,
                  background: cardBackground,
                  outline: textSecondary,
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

            {/* Email */}
            <TextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              mode="outlined"
              left={<TextInput.Icon icon="email" />}
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

            {/* Phone */}
            <TextInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              mode="outlined"
              left={<TextInput.Icon icon="phone" />}
              returnKeyType="next"
              theme={{
                colors: {
                  text: textPrimary,
                  placeholder: textSecondary,
                  primary: primary,
                  background: cardBackground,
                  outline: textSecondary,
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

            {/* Address */}
            <TextInput
              label="Address"
              value={address}
              onChangeText={setAddress}
              autoCapitalize="words"
              mode="outlined"
              left={<TextInput.Icon icon="map-marker" />}
              returnKeyType="next"
              theme={{
                colors: {
                  text: textPrimary,
                  placeholder: textSecondary,
                  primary: primary,
                  background: cardBackground,
                  outline: textSecondary,
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

            {/* City */}
            <TextInput
              label="City"
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
              mode="outlined"
              left={<TextInput.Icon icon="city" />}
              returnKeyType="next"
              theme={{
                colors: {
                  text: textPrimary,
                  placeholder: textSecondary,
                  primary: primary,
                  background: cardBackground,
                  outline: textSecondary,
                },
                fonts: {
                  regular: 'Metropolis-Regular',
                  medium: 'Metropolis-Medium',
                },
              }}
              style={styles.input}
              contentStyle={styles.inputContent}
            />

            {/* State */}
            <TextInput
              label="State"
              value={state}
              onChangeText={setState}
              autoCapitalize="words"
              mode="outlined"
              left={<TextInput.Icon icon="map" />}
              returnKeyType="next"
              theme={{
                colors: {
                  text: textPrimary,
                  placeholder: textSecondary,
                  primary: primary,
                  background: cardBackground,
                  outline: textSecondary,
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

            {/* Postal Code */}
            <TextInput
              label="Postal Code"
              value={postalCode}
              onChangeText={setPostalCode}
              keyboardType="numeric"
              mode="outlined"
              left={<TextInput.Icon icon="code-brackets" />}
              returnKeyType="next"
              theme={{
                colors: {
                  text: textPrimary,
                  placeholder: textSecondary,
                  primary: primary,
                  background: cardBackground,
                  outline: textSecondary,
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

            {/* Country */}
            <TextInput
              label="Country"
              value={country}
              onChangeText={setCountry}
              autoCapitalize="words"
              mode="outlined"
              left={<TextInput.Icon icon="flag" />}
              returnKeyType="next"
              theme={{
                colors: {
                  text: textPrimary,
                  placeholder: textSecondary,
                  primary: primary,
                  background: cardBackground,
                  outline: textSecondary,
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

            {/* Password */}
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
              returnKeyType="next"
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

            {/* Confirm Password */}
            <TextInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={hideConfirmPassword}
              mode="outlined"
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={hideConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setHideConfirmPassword(!hideConfirmPassword)}
                />
              }
              returnKeyType="done"
              onSubmitEditing={handleSignup}
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

            {/* Signup Button */}
            <Button
              mode="contained"
              onPress={handleSignup}
              loading={loading}
              disabled={loading}
              style={[styles.signupButton, { backgroundColor: primary }]}
              labelStyle={[styles.buttonLabel, { color: onPrimary }]}
            >
              Create Account
            </Button>

            {/* Login Link */}

            <TouchableOpacity
              style={styles.loginContainer}
              onPress={() => navigation.navigate('Login')}
            >
              <StandardText
                style={[styles.loginText, { color: textSecondary }]}
              >
                Already have an account?{' '}
              </StandardText>

              <StandardText style={[styles.loginLink, { color: primary }]}>
                Sign In
              </StandardText>
            </TouchableOpacity>
          </Card>
        </ScrollView>

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
              backgroundColor: colors.error,
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
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
  },
  logoImage: {
    width: 150,
    height: 150,
    borderRadius: 50,
  },
  headerTitle: {
    fontSize: 28,
    marginTop: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
    paddingBottom: 20,
    flex: 1,
  },
  card: {
    padding: 24,
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
    marginBottom: 16,
    fontFamily: 'Metropolis-Medium',
  },
  inputContent: {
    fontFamily: 'Metropolis-Regular',
  },
  signupButton: {
    marginTop: 8,
    marginBottom: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  buttonLabel: {
    fontFamily: 'Metropolis-Bold',
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    fontFamily: 'Metropolis-Regular',
  },
  loginLink: {
    fontSize: 14,
    fontFamily: 'Metropolis-Bold',
    textDecorationLine: 'underline',
  },
  snackbar: {
    borderRadius: 8,
    margin: 16,
  },
  snackbarText: {
    color: 'white',
    fontSize: 14,
  },
});

export default SignUp;
