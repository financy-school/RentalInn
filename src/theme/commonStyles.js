/**
 * RentalInn Common Styles
 * Reusable style presets for consistent UI
 */

import {
  PRIMARY,
  CARD_BACKGROUND,
  BORDER_STANDARD,
  BORDER_LIGHT,
  BACKGROUND,
} from './colors';
import { RADIUS, SHADOW, PADDING, BORDER_WIDTH } from './layout';

// ============================================
// CONTAINER STYLES
// ============================================
export const containerStyle = {
  flex: 1,
  backgroundColor: BACKGROUND,
};

export const scrollContainerStyle = {
  flex: 1,
  paddingHorizontal: PADDING.medium,
};

// ============================================
// CARD STYLES
// ============================================
export const cardStyle = {
  borderRadius: RADIUS.large,
  padding: PADDING.large,
  backgroundColor: CARD_BACKGROUND,
  borderWidth: BORDER_WIDTH.thin,
  borderColor: BORDER_STANDARD,
  ...SHADOW.strong,
  shadowColor: PRIMARY,
};

export const smallCardStyle = {
  borderRadius: RADIUS.medium,
  padding: PADDING.medium,
  backgroundColor: CARD_BACKGROUND,
  borderWidth: BORDER_WIDTH.thin,
  borderColor: BORDER_LIGHT,
  ...SHADOW.medium,
  shadowColor: PRIMARY,
};

// ============================================
// LIST ITEM STYLES
// ============================================
export const listItemStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 14,
  paddingHorizontal: PADDING.large,
  marginBottom: 10,
  backgroundColor: CARD_BACKGROUND,
  borderRadius: RADIUS.medium,
  borderWidth: BORDER_WIDTH.thin,
  borderColor: BORDER_LIGHT,
  ...SHADOW.medium,
  shadowColor: PRIMARY,
};

export const listItemWithAccentStyle = {
  ...listItemStyle,
  borderLeftWidth: BORDER_WIDTH.accent,
  borderLeftColor: PRIMARY,
};

// ============================================
// SEARCH BAR STYLES
// ============================================
export const searchBarStyle = {
  backgroundColor: CARD_BACKGROUND,
  borderRadius: RADIUS.round,
  borderWidth: BORDER_WIDTH.thin,
  borderColor: BORDER_STANDARD,
  ...SHADOW.medium,
  shadowColor: PRIMARY,
  marginBottom: 10,
};

// ============================================
// CHIP STYLES
// ============================================
export const chipStyle = {
  marginRight: 10,
  borderRadius: RADIUS.xlarge,
  ...SHADOW.light,
  shadowColor: PRIMARY,
};

// ============================================
// BUTTON STYLES
// ============================================
export const buttonStyle = {
  borderRadius: RADIUS.medium,
  paddingVertical: 12,
  paddingHorizontal: PADDING.medium,
  backgroundColor: CARD_BACKGROUND,
  borderWidth: BORDER_WIDTH.thin,
  borderColor: BORDER_STANDARD,
  ...SHADOW.light,
  shadowColor: PRIMARY,
};

// ============================================
// MODAL STYLES
// ============================================
export const modalContainerStyle = {
  borderRadius: RADIUS.medium,
  padding: PADDING.xlarge,
  backgroundColor: CARD_BACKGROUND,
  borderWidth: BORDER_WIDTH.thin,
  borderColor: BORDER_STANDARD,
  ...SHADOW.prominent,
  shadowColor: PRIMARY,
};

// ============================================
// EMPTY STATE STYLES
// ============================================
export const emptyContainerStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingVertical: 40,
  paddingHorizontal: PADDING.xl,
};

// ============================================
// HEADER STYLES
// ============================================
export const headerStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: PADDING.medium,
  paddingHorizontal: PADDING.medium,
};

export default {
  containerStyle,
  scrollContainerStyle,
  cardStyle,
  smallCardStyle,
  listItemStyle,
  listItemWithAccentStyle,
  searchBarStyle,
  chipStyle,
  buttonStyle,
  modalContainerStyle,
  emptyContainerStyle,
  headerStyle,
};
