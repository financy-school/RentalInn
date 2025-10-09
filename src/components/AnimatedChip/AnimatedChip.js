import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import StandardText from '../StandardText/StandardText';

const AnimatedChip = ({
  label,
  selected = false,
  onPress,
  onClose,
  icon,
  variant = 'default', // default, outlined, filled
  size = 'medium',
  style,
  textStyle,
  ...props
}) => {
  const theme = useTheme();

  const getChipStyle = () => {
    const baseStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 20,
      elevation: selected ? 2 : 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    };

    const sizeStyles = {
      small: { paddingHorizontal: 12, paddingVertical: 6, minHeight: 28 },
      medium: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 32 },
      large: { paddingHorizontal: 20, paddingVertical: 10, minHeight: 36 },
    };

    const backgroundColor = selected
      ? theme.colors.primary
      : variant === 'filled'
      ? theme.colors.surface
      : theme.colors.surfaceVariant;

    return {
      ...baseStyle,
      ...sizeStyles[size],
      backgroundColor,
      borderWidth: variant === 'outlined' || selected ? 2 : 0,
      borderColor: selected ? theme.colors.primary : theme.colors.outline,
    };
  };

  const getTextColor = () => {
    return selected ? '#ffffff' : theme.colors.onSurface;
  };

  return (
    <TouchableOpacity
      style={[getChipStyle(), style]}
      onPress={onPress}
      activeOpacity={0.8}
      {...props}
    >
      {icon && (
        <Icon
          name={icon}
          size={size === 'small' ? 14 : size === 'large' ? 18 : 16}
          color={textStyle?.color || getTextColor()}
          style={{ marginRight: 6 }}
        />
      )}
      <StandardText
        size={size === 'small' ? 'xs' : 'sm'}
        fontWeight="500"
        style={[{ color: getTextColor() }, textStyle]}
      >
        {label}
      </StandardText>
      {onClose && (
        <TouchableOpacity onPress={onClose} style={{ marginLeft: 6 }}>
          <Icon
            name="close"
            size={size === 'small' ? 14 : size === 'large' ? 18 : 16}
            color={getTextColor()}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default AnimatedChip;
