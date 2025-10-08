import {
  SUCCESS,
  WARNING,
  TEXT_SECONDARY,
  TEXT_LIGHT,
  TEXT_PRIMARY,
  ERROR,
} from './colors';
import { FONT_SIZE, FONT_WEIGHT } from './layout';

// Font sizes - use centralized constants
export const fontSizeMap = {
  xs: FONT_SIZE.xs,
  sm: FONT_SIZE.sm,
  md: FONT_SIZE.md,
  lg: FONT_SIZE.lg,
  xl: FONT_SIZE.xl,
  '2xl': FONT_SIZE.xxl,
};

export const getFontSize = fontSize => fontSizeMap[fontSize] || fontSizeMap.md;

// Font weights (map to custom font family names)
export const handleFontWeight = fontWeight => {
  switch (fontWeight) {
    case 'semibold':
      return 'Metropolis-SemiBold';
    case 'bold':
      return 'Metropolis-Bold';
    case 'regular':
      return 'Metropolis-Regular';
    case 'medium':
      return 'Metropolis-Medium';
    case 'thin':
      return 'Metropolis-Thin';
    default:
      return 'Metropolis-Regular';
  }
};

// Numeric font weights (for RN) - use centralized constants
export const createFontWeight = fontWeight => {
  switch (fontWeight) {
    case 'semibold':
      return FONT_WEIGHT.semibold;
    case 'bold':
      return FONT_WEIGHT.bold;
    case 'medium':
      return FONT_WEIGHT.medium;
    case 'regular':
      return FONT_WEIGHT.regular;
    default:
      return FONT_WEIGHT.regular;
  }
};

// Theme-aware font colors - use centralized color constants
export const getFontColor = (fontColor, themeColors) => {
  switch (fontColor) {
    case 'default_red':
      return ERROR;
    case 'default_green':
      return SUCCESS;
    case 'default_orange':
      return WARNING;
    case 'faded_gray':
      return TEXT_SECONDARY;
    case 'default_white':
      return TEXT_LIGHT;
    case 'textSecondary':
      return themeColors?.textSecondary || TEXT_SECONDARY;
    case 'textPrimary':
    case 'default_gray':
    default:
      return themeColors?.textPrimary || TEXT_PRIMARY;
  }
};
