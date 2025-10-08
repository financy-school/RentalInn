import { View, StyleSheet } from 'react-native';
import React from 'react';
import { useTheme } from 'react-native-paper';
import { CARD_BACKGROUND, BORDER_STANDARD } from '../../theme/colors';
import { RADIUS, PADDING, SHADOW } from '../../theme/layout';

const StandardCard = ({ children, style }) => {
  const { colors } = useTheme(); // 🎨 Get active theme colors

  const baseStyle = StyleSheet.create({
    base: {
      padding: PADDING.large,
      borderWidth: 1,
      borderColor: colors.outline || BORDER_STANDARD,
      borderRadius: RADIUS.large,
      backgroundColor: colors.surface || CARD_BACKGROUND,
      ...SHADOW.strong,
    },
  });

  return <View style={[baseStyle.base, style ?? {}]}>{children}</View>;
};

export default StandardCard;
