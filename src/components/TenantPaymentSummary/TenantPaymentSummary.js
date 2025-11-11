import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import StandardText from '../StandardText/StandardText';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../../theme/colors';

const TenantPaymentSummary = ({
  paymentReliability,
  pendingAmount,
  lastPaymentDate,
  lastPaymentAmount,
}) => {
  const { theme: mode } = useContext(ThemeContext);
  const isDark = mode === 'dark';

  const getScoreColor = () => {
    if (paymentReliability.rating === 'EXCELLENT') return colors.success;
    if (paymentReliability.rating === 'GOOD') return colors.info;
    if (paymentReliability.rating === 'FAIR') return colors.warning;
    if (paymentReliability.rating === 'POOR') return colors.error;
    return colors.textSecondary;
  };

  const getScoreIcon = () => {
    if (paymentReliability.rating === 'EXCELLENT') return 'check-circle';
    if (paymentReliability.rating === 'GOOD') return 'check-circle-outline';
    if (paymentReliability.rating === 'FAIR') return 'alert-circle-outline';
    if (paymentReliability.rating === 'POOR') return 'close-circle';
    return 'help-circle-outline';
  };

  const scoreColor = getScoreColor();

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.backgroundDark : colors.white },
      ]}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="account-cash"
          size={20}
          color={isDark ? colors.white : colors.textPrimary}
        />
        <StandardText
          style={[
            styles.title,
            { color: isDark ? colors.white : colors.textPrimary },
          ]}
          fontWeight="bold"
        >
          Tenant Payment Overview
        </StandardText>
      </View>

      <View style={styles.grid}>
        {/* Payment Score */}
        <View
          style={[
            styles.gridItem,
            { borderRightWidth: 1, borderRightColor: colors.border },
          ]}
        >
          <View style={styles.scoreContainer}>
            <MaterialCommunityIcons
              name={getScoreIcon()}
              size={24}
              color={scoreColor}
            />
            <StandardText
              style={[styles.scoreLabel, { color: scoreColor }]}
              fontWeight="bold"
            >
              {paymentReliability.rating}
            </StandardText>
          </View>
          <StandardText
            style={[
              styles.subtitle,
              { color: isDark ? colors.light_gray : colors.textSecondary },
            ]}
          >
            Payment Score
          </StandardText>
          <StandardText
            style={[
              styles.detail,
              { color: isDark ? colors.light_gray : colors.textSecondary },
            ]}
          >
            {paymentReliability.score}% on-time
          </StandardText>
        </View>

        {/* Pending Dues */}
        <View style={styles.gridItem}>
          <StandardText
            style={[
              styles.value,
              { color: pendingAmount > 0 ? colors.error : colors.success },
            ]}
            fontWeight="bold"
          >
            ₹{pendingAmount.toLocaleString()}
          </StandardText>
          <StandardText
            style={[
              styles.subtitle,
              { color: isDark ? colors.light_gray : colors.textSecondary },
            ]}
          >
            Pending Dues
          </StandardText>
          {pendingAmount > 0 && (
            <View
              style={[styles.badge, { backgroundColor: colors.error + '20' }]}
            >
              <StandardText style={[styles.badgeText, { color: colors.error }]}>
                Action Required
              </StandardText>
            </View>
          )}
        </View>
      </View>

      {/* Last Payment Info */}
      {lastPaymentDate && (
        <View
          style={[
            styles.lastPayment,
            {
              backgroundColor: isDark
                ? colors.backgroundDark
                : colors.background,
            },
          ]}
        >
          <View style={styles.lastPaymentRow}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color={isDark ? colors.light_gray : colors.textSecondary}
            />
            <StandardText
              style={[
                styles.lastPaymentText,
                { color: isDark ? colors.light_gray : colors.textSecondary },
              ]}
            >
              Last payment: {formatDate(lastPaymentDate)}
            </StandardText>
          </View>
          {lastPaymentAmount > 0 && (
            <StandardText
              style={[styles.lastPaymentAmount, { color: colors.success }]}
              fontWeight="medium"
            >
              ₹{lastPaymentAmount.toLocaleString()}
            </StandardText>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    marginLeft: 8,
  },
  grid: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  gridItem: {
    flex: 1,
    paddingHorizontal: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 14,
    marginLeft: 6,
  },
  value: {
    fontSize: 20,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  detail: {
    fontSize: 11,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  lastPayment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lastPaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastPaymentText: {
    fontSize: 12,
    marginLeft: 6,
  },
  lastPaymentAmount: {
    fontSize: 14,
  },
});

export default TenantPaymentSummary;
