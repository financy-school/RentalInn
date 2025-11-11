import React, { useContext } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import StandardText from '../StandardText/StandardText';
import colors from '../../theme/colors';

const InvoiceTemplateCard = ({
  type,
  label,
  icon,
  amount,
  description,
  onPress,
  disabled = false,
}) => {
  const { theme: mode } = useContext(ThemeContext);
  const isDark = mode === 'dark';

  const getGradientColor = () => {
    switch (type) {
      case 'MONTHLY_RENT':
        return colors.primary;
      case 'MOVE_IN':
        return colors.success;
      case 'UTILITIES':
        return colors.info;
      default:
        return colors.primary;
    }
  };

  const gradientColor = getGradientColor();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.backgroundDark : colors.white,
          borderColor: gradientColor + '30',
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: gradientColor + '15' },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={32} color={gradientColor} />
      </View>

      <View style={styles.content}>
        <StandardText
          style={[
            styles.label,
            { color: isDark ? colors.white : colors.textPrimary },
          ]}
          fontWeight="bold"
        >
          {label}
        </StandardText>

        <StandardText
          style={[
            styles.description,
            { color: isDark ? colors.light_gray : colors.textSecondary },
          ]}
          numberOfLines={2}
        >
          {description}
        </StandardText>

        {amount > 0 && (
          <View
            style={[
              styles.amountBadge,
              { backgroundColor: gradientColor + '20' },
            ]}
          >
            <StandardText
              style={[styles.amount, { color: gradientColor }]}
              fontWeight="bold"
            >
              ₹{amount.toLocaleString()}
            </StandardText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    marginBottom: 6,
  },
  amountBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  amount: {
    fontSize: 14,
  },
});

export default InvoiceTemplateCard;
