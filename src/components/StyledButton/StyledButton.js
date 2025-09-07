import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import StandardText from '../StandardText/StandardText';

const StyledButton = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outlined, ghost
  size = 'medium', // small, medium, large
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  ...props
}) => {
  const theme = useTheme();

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: variant === 'primary' ? 3 : variant === 'outlined' ? 0 : 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: variant === 'primary' ? 0.15 : 0.05,
      shadowRadius: 3,
    };

    const sizeStyles = {
      small: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 36 },
      medium: { paddingHorizontal: 20, paddingVertical: 12, minHeight: 44 },
      large: { paddingHorizontal: 24, paddingVertical: 16, minHeight: 52 },
    };

    const variantStyles = {
      primary: {
        backgroundColor: theme.colors.primary,
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.outline,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
    };

    if (disabled) {
      return {
        ...baseStyle,
        ...sizeStyles[size],
        backgroundColor: theme.colors.surfaceDisabled,
        elevation: 0,
        shadowOpacity: 0,
      };
    }

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      width: fullWidth ? '100%' : 'auto',
    };
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.onSurfaceDisabled;

    switch (variant) {
      case 'primary':
        return theme.colors.onPrimary;
      case 'outlined':
      case 'ghost':
        return theme.colors.primary;
      default:
        return theme.colors.onSurface;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'sm';
      case 'large':
        return 'lg';
      default:
        return 'md';
    }
  };

  const renderContent = () => (
    <>
      {icon && iconPosition === 'left' && (
        <Icon
          name={icon}
          size={size === 'small' ? 16 : size === 'large' ? 20 : 18}
          color={getTextColor()}
          style={{ marginRight: 8 }}
        />
      )}
      {loading ? (
        <Icon
          name="loading"
          size={size === 'small' ? 16 : size === 'large' ? 20 : 18}
          color={getTextColor()}
        />
      ) : (
        <StandardText
          size={getTextSize()}
          fontWeight="600"
          style={{ color: getTextColor() }}
        >
          {title}
        </StandardText>
      )}
      {icon && iconPosition === 'right' && (
        <Icon
          name={icon}
          size={size === 'small' ? 16 : size === 'large' ? 20 : 18}
          color={getTextColor()}
          style={{ marginLeft: 8 }}
        />
      )}
    </>
  );

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

export default StyledButton;
