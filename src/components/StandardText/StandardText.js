import { StyleSheet, Text } from 'react-native';
import React from 'react';
import { useTheme } from 'react-native-paper';
import {
  getFontColor,
  getFontSize,
  handleFontWeight,
} from '../../theme/standardTextUtils';

const StandardText = ({
  size = 'md',
  children,
  color = 'textPrimary', // <-- default now comes from theme system
  italic = false,
  fontWeight = 'regular',
  textAlign = 'left',
  ...props
}) => {
  const { colors } = useTheme(); // 🎨 gets active theme colors

  const fontSize = getFontSize(size);
  const LINE_HEIGHT_RATIO = 1.5;
  const lineHeight = fontSize * LINE_HEIGHT_RATIO;
  const paddingTop = fontSize - lineHeight;

  const baseStyle = StyleSheet.create({
    base: {
      fontFamily: handleFontWeight(fontWeight),
      color: getFontColor(color, colors), // <-- uses theme-aware function
      fontStyle: italic ? 'italic' : 'normal',
      fontSize: fontSize,
      lineHeight: lineHeight,
      letterSpacing: -0.2,
      paddingTop: paddingTop,
      textAlign: textAlign,
    },
  });

  return (
    <Text {...props} style={[baseStyle.base, props.style]}>
      {children}
    </Text>
  );
};

export default StandardText;
