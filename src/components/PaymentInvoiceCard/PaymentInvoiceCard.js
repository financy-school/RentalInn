import React, { useContext } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Checkbox } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import StandardText from '../StandardText/StandardText';
import colors from '../../theme/colors';

const PaymentInvoiceCard = ({
  invoice,
  isSelected = false,
  onSelect,
  selectable = false,
  onPress,
}) => {
  const { theme: mode } = useContext(ThemeContext);
  const isDark = mode === 'dark';

  const getStatusColor = () => {
    switch (invoice.status) {
      case 'OVERDUE':
        return colors.error;
      case 'PARTIALLY_PAID':
        return colors.warning;
      case 'SENT':
        return colors.info;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusBadgeColor = () => {
    switch (invoice.status) {
      case 'OVERDUE':
        return colors.error + '15';
      case 'PARTIALLY_PAID':
        return colors.warning + '15';
      case 'SENT':
        return colors.info + '15';
      default:
        return colors.textSecondary + '15';
    }
  };

  const formatDate = date => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handlePress = () => {
    if (selectable && onSelect) {
      onSelect();
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.backgroundDark : colors.white,
          borderColor: isSelected
            ? colors.primary
            : isDark
            ? colors.light_gray + '30'
            : '#E0E0E0',
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {selectable && (
            <Checkbox
              status={isSelected ? 'checked' : 'unchecked'}
              onPress={onSelect}
              color={colors.primary}
            />
          )}
          <View style={styles.invoiceInfo}>
            <StandardText
              style={[
                styles.invoiceNumber,
                { color: isDark ? colors.white : colors.textPrimary },
              ]}
              fontWeight="bold"
            >
              #{invoice.invoice_number}
            </StandardText>
            <StandardText
              style={[
                styles.dueDate,
                { color: isDark ? colors.light_gray : colors.textSecondary },
              ]}
            >
              Due: {formatDate(invoice.due_date)}
            </StandardText>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusBadgeColor() },
          ]}
        >
          <StandardText
            style={[styles.statusText, { color: getStatusColor() }]}
            fontWeight="600"
          >
            {invoice.status}
          </StandardText>
        </View>
      </View>

      {/* Amount Section */}
      <View style={styles.amountSection}>
        <View style={styles.amountRow}>
          <StandardText
            style={[
              styles.amountLabel,
              { color: isDark ? colors.light_gray : colors.textSecondary },
            ]}
          >
            Total Amount:
          </StandardText>
          <StandardText
            style={[
              styles.amountValue,
              { color: isDark ? colors.white : colors.textPrimary },
            ]}
            fontWeight="600"
          >
            ₹
            {parseFloat(invoice.total_amount).toLocaleString('en-IN', {
              maximumFractionDigits: 2,
              minimumFractionDigits: 0,
            })}
          </StandardText>
        </View>

        {invoice.paid_amount > 0 && (
          <View style={styles.amountRow}>
            <StandardText
              style={[
                styles.amountLabel,
                { color: isDark ? colors.light_gray : colors.textSecondary },
              ]}
            >
              Paid:
            </StandardText>
            <StandardText
              style={[styles.paidAmount, { color: colors.success }]}
              fontWeight="600"
            >
              ₹
              {parseFloat(invoice.paid_amount).toLocaleString('en-IN', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 0,
              })}
            </StandardText>
          </View>
        )}

        <View style={[styles.amountRow, styles.outstandingRow]}>
          <StandardText
            style={[styles.outstandingLabel, { color: colors.error }]}
            fontWeight="bold"
          >
            Outstanding:
          </StandardText>
          <StandardText
            style={[styles.outstandingValue, { color: colors.error }]}
            fontWeight="bold"
          >
            ₹
            {parseFloat(invoice.outstanding_amount).toLocaleString('en-IN', {
              maximumFractionDigits: 2,
              minimumFractionDigits: 0,
            })}
          </StandardText>
        </View>
      </View>

      {/* Items Preview */}
      {invoice.items && invoice.items.length > 0 && (
        <View style={styles.itemsSection}>
          <StandardText
            style={[
              styles.itemsLabel,
              { color: isDark ? colors.light_gray : colors.textSecondary },
            ]}
          >
            Items:
          </StandardText>
          {invoice.items.slice(0, 2).map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <MaterialCommunityIcons
                name="circle-small"
                size={16}
                color={isDark ? colors.light_gray : colors.textSecondary}
              />
              <StandardText
                style={[
                  styles.itemText,
                  { color: isDark ? colors.white : colors.textPrimary },
                ]}
              >
                {item.description || item.category}
              </StandardText>
            </View>
          ))}
          {invoice.items.length > 2 && (
            <StandardText style={[styles.moreItems, { color: colors.primary }]}>
              +{invoice.items.length - 2} more
            </StandardText>
          )}
        </View>
      )}

      {/* Overdue Warning */}
      {invoice.daysOverdue > 0 && (
        <View
          style={[
            styles.overdueWarning,
            { backgroundColor: colors.error + '15' },
          ]}
        >
          <MaterialCommunityIcons
            name="alert-circle"
            size={16}
            color={colors.error}
          />
          <StandardText
            style={[styles.overdueText, { color: colors.error }]}
            fontWeight="600"
          >
            {invoice.daysOverdue} days overdue
          </StandardText>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 16,
    marginBottom: 2,
  },
  dueDate: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    textTransform: 'uppercase',
  },
  amountSection: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.light_gray + '30',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  amountLabel: {
    fontSize: 13,
  },
  amountValue: {
    fontSize: 14,
  },
  paidAmount: {
    fontSize: 14,
  },
  outstandingRow: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.light_gray + '30',
  },
  outstandingLabel: {
    fontSize: 15,
  },
  outstandingValue: {
    fontSize: 16,
  },
  itemsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.light_gray + '30',
  },
  itemsLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -4,
  },
  itemText: {
    fontSize: 12,
    flex: 1,
  },
  moreItems: {
    fontSize: 12,
    marginLeft: 12,
    marginTop: 2,
  },
  overdueWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    borderRadius: 6,
    gap: 6,
  },
  overdueText: {
    fontSize: 12,
  },
});

export default PaymentInvoiceCard;
