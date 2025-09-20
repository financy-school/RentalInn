// GradientCard.js - Enhanced Card Component
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

const GradientCard = ({
  children,
  gradient = false,
  gradientColors,
  style,
  ...props
}) => {
  const theme = useTheme();

  const defaultGradientColors = [
    theme.colors.surface,
    theme.colors.surfaceVariant,
  ];

  const cardStyle = {
    paddingHorizontal: 12,
    backgroundColor: theme.colors.surface,
  };

  if (gradient) {
    return (
      <LinearGradient
        colors={gradientColors || defaultGradientColors}
        style={[cardStyle, style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        {...props}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[cardStyle, style]} {...props}>
      {children}
    </View>
  );
};

export default GradientCard;
