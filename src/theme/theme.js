import {
  MD3LightTheme,
  MD3DarkTheme,
  configureFonts,
} from 'react-native-paper';
import colors from './color';

// Light Theme
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: '#FFFFFF',
    secondary: colors.secondary,
    onSecondary: '#FFFFFF',
    accent: colors.accent,
    background: colors.backgroundLight,
    onBackground: colors.textPrimary,
    surface: '#FFFFFF',
    onSurface: colors.textPrimary,
    error: colors.error,
    onError: '#FFFFFF',
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    white: colors.white,
    black: colors.black,
    light_black: colors.light_black,
    light_gray: colors.light_gray,
  },
  fonts: configureFonts({
    default: {
      regular: { fontFamily: 'Poppins-Regular', fontWeight: 'normal' },
      medium: { fontFamily: 'Poppins-Medium', fontWeight: 'normal' },
      light: { fontFamily: 'Poppins-Light', fontWeight: 'normal' },
      thin: { fontFamily: 'Poppins-Thin', fontWeight: 'normal' },
    },
  }),
  roundness: 6,
  animation: { scale: 1.0 },
  dark: false,
  mode: 'adaptive',
};

// Dark Theme
const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    onPrimary: '#FFFFFF',
    secondary: '#3352A0', // softened version of brand navy for contrast
    onSecondary: '#FFFFFF',
    accent: colors.accent,
    background: colors.backgroundDark,
    onBackground: '#FFFFFF',
    surface: '#1A1F2B',
    onSurface: '#FFFFFF',
    error: colors.error,
    onError: '#FFFFFF',
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B6C2',
    white: colors.white,
    black: colors.black,
    light_black: colors.light_black,
    light_gray: colors.light_gray,
  },
  fonts: configureFonts({
    default: {
      regular: { fontFamily: 'Poppins-Regular', fontWeight: 'normal' },
      medium: { fontFamily: 'Poppins-Medium', fontWeight: 'normal' },
      light: { fontFamily: 'Poppins-Light', fontWeight: 'normal' },
      thin: { fontFamily: 'Poppins-Thin', fontWeight: 'normal' },
    },
  }),
  roundness: 6,
  animation: { scale: 1.0 },
  dark: true,
  mode: 'adaptive',
};

export { lightTheme, darkTheme };
