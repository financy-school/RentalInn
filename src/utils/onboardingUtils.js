import AsyncStorage from '@react-native-async-storage/async-storage';
import { ONBOARDING_STORAGE_KEY } from '../screens/OnboardingScreen';

/**
 * Utility functions for onboarding management
 */

/**
 * Check if user has completed onboarding
 */
export const hasSeenOnboarding = async () => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

/**
 * Mark onboarding as completed
 */
export const setOnboardingComplete = async () => {
  try {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  } catch (error) {
    console.error('Error setting onboarding complete:', error);
  }
};

/**
 * Reset onboarding (for testing purposes)
 */
export const resetOnboarding = async () => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
    console.log('Onboarding reset successfully');
  } catch (error) {
    console.error('Error resetting onboarding:', error);
  }
};

/**
 * Clear all app data (for development/testing)
 */
export const clearAllAppData = async () => {
  try {
    await AsyncStorage.clear();
    console.log('All app data cleared');
  } catch (error) {
    console.error('Error clearing app data:', error);
  }
};

/**
 * Development helper to quickly reset app state
 * This function can be called from the Login screen or anywhere in dev mode
 */
export const devResetApp = async () => {
  if (__DEV__) {
    await clearAllAppData();
    // In a real app, you might want to restart the app or navigate to onboarding
    console.log(
      'App reset in development mode. Restart the app to see onboarding.',
    );
  }
};
