import React, { useContext, useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../context/ThemeContext';
import { CredentialsContext } from '../context/CredentialsContext';
import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import StandardCard from '../components/StandardCard/StandardCard';
import StyledTextInput from '../components/StyledTextInput/StyledTextInput';
import Gap from '../components/Gap/Gap';
import BeautifulDatePicker from '../components/BeautifulDatePicker';
import SearchableDropdown from '../components/SearchableDropdown/SearchableDropdown';
import colors from '../theme/colors';
import helpers from '../navigation/helpers';
import {
  recordExpensePayment,
  getExpensePayments,
} from '../services/NetworkUtils';

const { ErrorHelper } = helpers;

const RecordExpensePayment = ({ navigation, route }) => {
  const { theme: mode } = useContext(ThemeContext);
  const { credentials } = useContext(CredentialsContext);
  const { expense, onPaymentRecorded } = route.params || {};

  // Theme variables
  const isDark = mode === 'dark';
  const backgroundColor = isDark
    ? colors.backgroundDark
    : colors.backgroundLight;
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  // Form state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const paymentMethods = [
    { label: 'Cash', value: 'CASH' },
    { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
    { label: 'UPI', value: 'UPI' },
    { label: 'Cheque', value: 'CHEQUE' },
    { label: 'Card', value: 'CARD' },
  ];

  // Calculate payment info
  const [totalPaid, setTotalPaid] = useState(0);
  const remainingAmount = parseFloat(expense?.amount || 0) - totalPaid;

  // Fetch payment history to calculate remaining
  React.useEffect(() => {
    const fetchPayments = async () => {
      if (!expense?.id) return;

      try {
        const response = await getExpensePayments(
          credentials.accessToken,
          expense.id,
        );
        if (response.success && response.data) {
          const paid = response.data.reduce(
            (sum, payment) => sum + parseFloat(payment.amount || 0),
            0,
          );
          setTotalPaid(paid);
          setPaymentAmount((parseFloat(expense.amount) - paid).toString());
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    };

    fetchPayments();
  }, [expense, credentials]);

  const handleSubmit = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      ErrorHelper.showToast('Please enter a valid amount', 'warning');
      return;
    }

    if (!paymentMethod) {
      ErrorHelper.showToast('Please select a payment method', 'warning');
      return;
    }

    if (parseFloat(paymentAmount) > remainingAmount) {
      ErrorHelper.showToast(
        'Payment amount cannot exceed remaining balance',
        'warning',
      );
      return;
    }

    try {
      setSubmitting(true);

      const paymentData = {
        amount: parseFloat(paymentAmount),
        payment_date: paymentDate,
        payment_method: paymentMethod,
        transaction_id: transactionId.trim(),
        notes: paymentNotes.trim(),
      };

      const response = await recordExpensePayment(
        credentials.accessToken,
        expense.id,
        paymentData,
      );

      if (response.success) {
        ErrorHelper.showToast('Payment recorded successfully', 'success');

        // Notify parent to refresh
        if (onPaymentRecorded) {
          onPaymentRecorded();
        }

        navigation.goBack();
      } else {
        ErrorHelper.showToast(
          response.error || 'Failed to record payment',
          'error',
        );
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      ErrorHelper.logError(error, 'RECORD_EXPENSE_PAYMENT');
      ErrorHelper.showToast('Failed to record payment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = status => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'paid':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'overdue':
      case 'draft':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StandardHeader
        navigation={navigation}
        title="Record Payment"
        loading={submitting}
      />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Expense Info Card */}
        <StandardCard
          style={[styles.infoCard, { backgroundColor: cardBackground }]}
        >
          <View style={styles.expenseHeader}>
            <View style={styles.expenseInfo}>
              <StandardText
                fontWeight="bold"
                size="lg"
                style={{ color: textPrimary }}
              >
                {expense?.title || 'N/A'}
              </StandardText>
              <StandardText size="sm" style={{ color: textSecondary }}>
                {expense?.vendor || expense?.vendor_name || 'N/A'}
              </StandardText>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(expense?.status) + '20' },
              ]}
            >
              <StandardText
                fontWeight="bold"
                size="xs"
                style={{ color: getStatusColor(expense?.status) }}
              >
                {expense?.status?.toUpperCase()}
              </StandardText>
            </View>
          </View>

          <Gap size="md" />

          <View style={styles.paymentSummary}>
            <View style={styles.summaryRow}>
              <StandardText size="sm" style={{ color: textSecondary }}>
                Total Amount
              </StandardText>
              <StandardText
                fontWeight="bold"
                size="md"
                style={{ color: textPrimary }}
              >
                ₹{parseFloat(expense?.amount || 0).toLocaleString()}
              </StandardText>
            </View>
            <View style={styles.summaryRow}>
              <StandardText size="sm" style={{ color: textSecondary }}>
                Paid
              </StandardText>
              <StandardText
                fontWeight="medium"
                size="md"
                style={{ color: colors.success }}
              >
                ₹{totalPaid.toLocaleString()}
              </StandardText>
            </View>
            <View style={[styles.summaryRow, styles.summaryRowHighlight]}>
              <StandardText
                fontWeight="medium"
                size="md"
                style={{ color: textPrimary }}
              >
                Remaining
              </StandardText>
              <StandardText
                fontWeight="bold"
                size="lg"
                style={{ color: colors.error }}
              >
                ₹{remainingAmount.toLocaleString()}
              </StandardText>
            </View>
          </View>
        </StandardCard>

        <Gap size="lg" />

        {/* Payment Form */}
        <StandardCard
          style={[styles.formCard, { backgroundColor: cardBackground }]}
        >
          <StandardText
            fontWeight="bold"
            size="md"
            style={{ color: textPrimary, marginBottom: 16 }}
          >
            Payment Details
          </StandardText>

          {/* Payment Amount */}
          <View style={styles.inputContainer}>
            <StandardText
              size="sm"
              fontWeight="medium"
              style={{ color: textPrimary, marginBottom: 8 }}
            >
              Payment Amount *
            </StandardText>
            <StyledTextInput
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="decimal-pad"
              placeholder="Enter amount"
              leftIcon="currency-inr"
            />
          </View>

          <Gap size="md" />

          {/* Payment Method */}
          <View style={styles.inputContainer}>
            <StandardText
              size="sm"
              fontWeight="medium"
              style={{ color: textPrimary, marginBottom: 8 }}
            >
              Payment Method *
            </StandardText>
            <SearchableDropdown
              items={paymentMethods}
              selectedItem={paymentMethod}
              onValueChange={setPaymentMethod}
              placeholder="Select payment method"
              searchPlaceholder="Search..."
            />
          </View>

          <Gap size="md" />

          {/* Payment Date */}
          <View style={styles.inputContainer}>
            <StandardText
              size="sm"
              fontWeight="medium"
              style={{ color: textPrimary, marginBottom: 8 }}
            >
              Payment Date *
            </StandardText>
            <TouchableOpacity
              style={[
                styles.dateButton,
                {
                  backgroundColor: cardBackground,
                  borderColor: isDark
                    ? colors.light_gray
                    : colors.textSecondary,
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color={colors.primary}
              />
              <StandardText
                size="md"
                style={{ color: textPrimary, marginLeft: 8 }}
              >
                {paymentDate
                  ? new Date(paymentDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Select date'}
              </StandardText>
            </TouchableOpacity>
          </View>

          <Gap size="md" />

          {/* Transaction ID */}
          <View style={styles.inputContainer}>
            <StandardText
              size="sm"
              fontWeight="medium"
              style={{ color: textPrimary, marginBottom: 8 }}
            >
              Transaction ID (Optional)
            </StandardText>
            <StyledTextInput
              value={transactionId}
              onChangeText={setTransactionId}
              placeholder="Reference/Transaction ID"
            />
          </View>

          <Gap size="md" />

          {/* Notes */}
          <View style={styles.inputContainer}>
            <StandardText
              size="sm"
              fontWeight="medium"
              style={{ color: textPrimary, marginBottom: 8 }}
            >
              Notes (Optional)
            </StandardText>
            <StyledTextInput
              value={paymentNotes}
              onChangeText={setPaymentNotes}
              placeholder="Additional notes..."
              multiline
              numberOfLines={3}
              style={{ minHeight: 80 }}
            />
          </View>
        </StandardCard>

        <Gap size="xl" />

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          labelStyle={styles.submitButtonText}
        >
          Record Payment
        </Button>

        <Gap size="xxl" />
      </ScrollView>

      {/* Date Picker */}
      <BeautifulDatePicker
        visible={showDatePicker}
        onDismiss={() => setShowDatePicker(false)}
        onDateSelect={date => {
          setPaymentDate(date.toISOString().split('T')[0]);
        }}
        title="Select Payment Date"
        initialDate={paymentDate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseInfo: {
    flex: 1,
    gap: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  paymentSummary: {
    backgroundColor: colors.primary + '08',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryRowHighlight: {
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.primary + '20',
  },
  formCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputContainer: {
    width: '100%',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 4,
    elevation: 2,
  },
  submitButtonText: {
    fontFamily: 'Metropolis-Bold',
    fontSize: 16,
  },
});

export default RecordExpensePayment;
