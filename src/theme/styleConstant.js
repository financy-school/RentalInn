import {Platform, StyleSheet} from 'react-native';
import {getColor} from './color';

export const screenPadding = 16;
export const totalHorizontalPadding = screenPadding * 2;
export const cardPadding = 16;

export const roundnessToSizeMap = {
  full: 100,
  xl: 32,
  lg: 24,
  md: 16,
  sm: 12,
  xs: 8,
};

export const standardBorderRadius = 8;

/**
 * cardShadow
 * Dynamically adapts based on theme mode (light/dark).
 * @param {boolean} isDark - true if dark mode
 */
export const cardShadow = (isDark = false) =>
  StyleSheet.create({
    shadow: {
      ...Platform.select({
        ios: {
          shadowColor: isDark ? getColor('white') : getColor('black'),
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: isDark ? 0.15 : 0.2,
          shadowRadius: isDark ? 6 : 4,
          zIndex: 0,
        },
        android: {
          shadowColor: isDark ? getColor('white') : getColor('black'),
          elevation: isDark ? 2 : 6,
          shadowOffset: {width: 0, height: isDark ? 4 : 10},
          zIndex: 0,
        },
      }),
    },
  });
