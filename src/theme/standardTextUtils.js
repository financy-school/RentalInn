import {getColor} from './color';

// Font sizes
export const fontSizeMap = {
  xs: 10,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
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

// Numeric font weights (for RN)
export const createFontWeight = fontWeight => {
  switch (fontWeight) {
    case 'semibold':
      return '500';
    case 'bold':
      return '600';
    case 'medium':
      return '400';
    default:
      return '300';
  }
};

// Theme-aware font colors
export const getFontColor = (fontColor, themeColors) => {
  switch (fontColor) {
    case 'default_red':
      return getColor('error');
    case 'default_green':
      return getColor('success');
    case 'default_orange':
      return getColor('warning');
    case 'faded_gray':
      return getColor('textSecondary');
    case 'default_white':
      return getColor('white');
    case 'textSecondary':
      return themeColors.textSecondary;
    case 'textPrimary':
    case 'default_gray':
    default:
      return themeColors.textPrimary;
  }
};
