import React, { useContext } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Checkbox } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import StandardText from '../StandardText/StandardText';
import StyledTextInput from '../StyledTextInput/StyledTextInput';
import colors from '../../theme/colors';

const BillCategoryCard = ({
  category,
  icon,
  amount,
  existingDues,
  existingDueDate,
  description,
  isSelected,
  onToggle,
  onAmountChange,
  onDatePress,
  dueDate,
}) => {
  const { theme: mode } = useContext(ThemeContext);
  const isDark = mode === 'dark';

  const getCategoryColor = () => {
    switch (category) {
      case 'Rent':
        return colors.primary;
      case 'Security Deposit':
        return colors.info;
      case 'Electricity':
      case 'Water':
        return colors.warning;
      default:
        return colors.success;
    }
  };

  const categoryColor = getCategoryColor();

  const formatDate = date => {
    if (!date) return 'Select date';
    const d = new Date(date);
    return `${d.getDate()}-${d.getMonth() + 1}-${d
      .getFullYear()
      .toString()
      .slice(-2)}`;
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.backgroundDark : colors.white,
          borderColor: isSelected ? categoryColor : colors.border,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: categoryColor + '15' },
            ]}
          >
            <MaterialCommunityIcons
              name={icon}
              size={24}
              color={categoryColor}
            />
          </View>
          <View style={styles.headerText}>
            <StandardText
              style={[
                styles.category,
                { color: isDark ? colors.white : colors.textPrimary },
              ]}
              fontWeight="bold"
            >
              {category}
            </StandardText>
            {description && (
              <StandardText
                style={[
                  styles.description,
                  { color: isDark ? colors.light_gray : colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {description}
              </StandardText>
            )}
          </View>
        </View>
        <Checkbox
          status={isSelected ? 'checked' : 'unchecked'}
          onPress={onToggle}
          color={categoryColor}
        />
      </View>

      {/* Existing Dues Warning */}
      {existingDues > 0 && (
        <View
          style={[
            styles.existingDues,
            { backgroundColor: colors.error + '10' },
          ]}
        >
          <MaterialCommunityIcons
            name="alert-circle"
            size={16}
            color={colors.error}
          />
          <StandardText
            style={[styles.existingDuesText, { color: colors.error }]}
          >
            Pending: ₹{existingDues.toLocaleString()}
            {existingDueDate && ` (${existingDueDate})`}
          </StandardText>
        </View>
      )}

      {/* Amount Input */}
      {isSelected && (
        <View style={styles.inputSection}>
          <View style={styles.amountInputContainer}>
            <StandardText
              style={[
                styles.inputLabel,
                { color: isDark ? colors.light_gray : colors.textSecondary },
              ]}
            >
              Amount
            </StandardText>
            <View style={styles.amountInputWrapper}>
              <StandardText
                style={[
                  styles.currencySymbol,
                  { color: isDark ? colors.white : colors.textPrimary },
                ]}
                fontWeight="medium"
              >
                ₹
              </StandardText>
              <StyledTextInput
                style={[
                  styles.amountInput,
                  {
                    color: isDark ? colors.white : colors.textPrimary,
                    backgroundColor: isDark
                      ? colors.backgroundDark
                      : colors.background,
                  },
                ]}
                value={amount ? amount.toString() : ''}
                onChangeText={text => onAmountChange(parseInt(text, 10) || 0)}
                placeholder="Enter amount"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Due Date */}
          <View style={styles.dateInputContainer}>
            <StandardText
              style={[
                styles.inputLabel,
                { color: isDark ? colors.light_gray : colors.textSecondary },
              ]}
            >
              Due Date
            </StandardText>
            <TouchableOpacity
              style={[
                styles.dateButton,
                {
                  backgroundColor: isDark
                    ? colors.backgroundDark
                    : colors.background,
                  borderColor: colors.border,
                },
              ]}
              onPress={onDatePress}
            >
              <MaterialCommunityIcons
                name="calendar"
                size={18}
                color={categoryColor}
              />
              <StandardText
                style={[
                  styles.dateText,
                  { color: isDark ? colors.white : colors.textPrimary },
                ]}
              >
                {formatDate(dueDate)}
              </StandardText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
  },
  existingDues: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  existingDuesText: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
  inputSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  amountInputContainer: {
    flex: 1,
  },
  dateInputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '500',
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 18,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 14,
    marginLeft: 8,
  },
});

export default BillCategoryCard;
