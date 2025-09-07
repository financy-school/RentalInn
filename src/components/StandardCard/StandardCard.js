import {View, StyleSheet} from 'react-native';
import React from 'react';
import {useTheme} from 'react-native-paper';
import {
  cardShadow,
  screenPadding,
  standardBorderRadius,
} from '../../theme/styleConstant';
import {getColor} from '../../theme/color';

const StandardCard = ({children, style}) => {
  const {colors} = useTheme(); // 🎨 Get active theme colors
  const shadow = cardShadow?.shadow;

  const baseStyle = StyleSheet.create({
    base: {
      padding: screenPadding,
      borderWidth: 0.8,
      borderColor: colors.outline || getColor('light_gray'), // theme-aware border
      borderRadius: standardBorderRadius,
      backgroundColor: colors.surface || getColor('white'), // theme-aware surface
      ...shadow,
    },
  });

  return <View style={[baseStyle.base, style ?? {}]}>{children}</View>;
};

export default StandardCard;
