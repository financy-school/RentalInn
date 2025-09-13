const colors = {
  // Brand (from logo)
  primary: '#EE7B11', // Orange
  secondary: '#001C68', // Deep Navy
  accent: '#F9FAFB', // Light Gray / Off-white
  background: '#F9FAFB',

  // Backgrounds
  backgroundLight: '#001C68', // White-like
  backgroundDark: '#0B1220', // Dark navy-gray for dark mode

  // Text
  textPrimary: '#212529', // Neutral dark
  textSecondary: '#6C757D',

  // Feedback
  success: '#28A745',
  error: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  light_black: '#343A40',
  light_gray: '#A0A0A0',

  // Extras
  onPrimary: '#FFFFFF',
  onBackground: '#212529',
  onSurface: '#212529',
};

export default colors;

export const fadedColorOpacity = 0.5;

export const getNameForColor = ({ textColor }) => {
  if (textColor === thresholdColor?.red?.textColor) {
    return 'default_red';
  }
  if (textColor === thresholdColor?.green?.textColor) {
    return 'default_green';
  }
  if (textColor === thresholdColor?.orange?.textColor) {
    return 'default_orange';
  }
  return 'default_gray';
};

export function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (alpha >= 0) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return `rgb(${r}, ${g}, ${b})`;
}

export const typeThresholdText =
  'MODERATE' |
  'NEEDS ATTENTION' |
  'OPTIMAL' |
  'Needs Attention' |
  'Moderate' |
  'Optimal';

export const typedefault = 'default' | 'locked';

export const thresholdColor = {
  red: { color: '#FFCFCF', textColor: '#ad0000' },
  orange: { color: '#FFF6D1', textColor: '#F39E09' },
  green: { color: '#CFFFD4', textColor: '#00940F' },
  invalid: { color: '#fff', textColor: '#222' },
};

export const colorMap = {
  brand_primary: '#EE7B11',
  brand_secondary: '#001C68',
  brand_accent: '#F9FAFB',
  black: '#222222',
  white: '#ffffff',
  neutral_darker: '#c4c4c6',
  neutral: '#e6e5eb',
  neutral_faded: '#f3f2f8',
};
export const colorNames =
  'brand_primary' |
  'brand_secondary' |
  'brand_accent' |
  'black' |
  'white' |
  'neutral' |
  'neutral_faded' |
  'neutral_darker';
export const colorVals =
  '#EE7B11' |
  '#001C68' |
  '#F9FAFB' |
  '#222222' |
  '#ffffff' |
  '#f3f2f8' |
  '#e6e5eb' |
  '#c4c6';

export const getColor = color => {
  return colorMap[color];
};

export const typeThresholdColorKey = 'red' | 'orange' | 'green' | 'invalid';
