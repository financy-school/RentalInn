import React, { useState, useContext, useCallback, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Portal, Modal, Button, Divider, TextInput } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';
import { CredentialsContext } from '../../context/CredentialsContext';
import StandardText from '../StandardText/StandardText';
import StandardCard from '../StandardCard/StandardCard';
import Gap from '../Gap/Gap';
import BeautifulDatePicker from '../BeautifulDatePicker';
import SearchableDropdown from '../SearchableDropdown/SearchableDropdown';
import AnimatedLoader from '../AnimatedLoader/AnimatedLoader';
import colors from '../../theme/colors';
import * as NetworkUtils from '../../services/NetworkUtils';
import helpers from '../../navigation/helpers';

const { ErrorHelper } = helpers;

const ExpenseDetailModal = ({
  visible,
  expense,
  onDismiss,
  onUpdate,
  onDelete,
  navigation,
  theme,
}) => {
  const { credentials } = useContext(CredentialsContext);
  const [loading, setLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPaymentDatePicker, setShowPaymentDatePicker] = useState(false);

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const isDark = theme === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;
  const modalBackground = isDark ? colors.backgroundDark : colors.white;

  const paymentMethods = [
    { label: 'Cash', value: 'CASH' },
    { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
    { label: 'UPI', value: 'UPI' },
    { label: 'Cheque', value: 'CHEQUE' },
    { label: 'Card', value: 'CARD' },
  ];

  // Fetch payment history when modal opens
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!visible || !expense?.expense_id || !credentials?.accessToken) return;

      try {
        setLoading(true);
        const response = await NetworkUtils.getExpensePayments(
          credentials.accessToken,
          expense.expense_id,
        );

        if (response.success && response.data) {
          setPaymentHistory(response.data);
        }
      } catch (error) {
        console.error('Error fetching payment history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [visible, expense, credentials]);

  if (!expense) return null;

  // Calculate remaining amount
  const totalPaid = paymentHistory.reduce(
    (sum, payment) => sum + parseFloat(payment.amount || 0),
    0,
  );
  const remainingAmount = parseFloat(expense?.amount || 0) - totalPaid;

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

  const getCategoryIcon = category => {
    switch (category?.toLowerCase()) {
      case 'maintenance':
        return 'wrench';
      case 'utilities':
        return 'flash';
      case 'repair':
        return 'hammer-wrench';
      case 'cleaning':
        return 'broom';
      default:
        return 'cash';
    }
  };

  const handleShareInvoice = async () => {
    try {
      const invoiceText = `
EXPENSE INVOICE
${expense.invoice_number || 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Vendor: ${expense.vendor_name || 'N/A'}
Property: ${expense.property?.name || 'N/A'}

Expense: ${expense.title}
Category: ${expense.category?.name || 'N/A'}
Amount: ₹${parseFloat(expense.amount).toLocaleString()}

Due Date: ${
        expense.due_date
          ? new Date(expense.due_date).toLocaleDateString()
          : 'N/A'
      }
Status: ${expense.status?.toUpperCase()}

Description: ${expense.description || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Property Management System
      `.trim();

      await Share.open({
        title: 'Share Invoice',
        message: invoiceText,
      });
    } catch (error) {
      if (error.message !== 'User did not share') {
        console.error('Error sharing invoice:', error);
        ErrorHelper.showToast('Failed to share invoice', 'error');
      }
    }
  };

  const handleRecordPayment = async () => {
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
      setSubmittingPayment(true);

      const paymentData = {
        amount: parseFloat(paymentAmount),
        payment_date: paymentDate,
        payment_method: paymentMethod,
        transaction_id: transactionId.trim(),
        notes: paymentNotes.trim(),
      };

      const response = await NetworkUtils.recordExpensePayment(
        credentials.accessToken,
        expense.expense_id,
        paymentData,
      );

      if (response.success) {
        ErrorHelper.showToast('Payment recorded successfully', 'success');

        // Reset form
        setPaymentAmount('');
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod('');
        setTransactionId('');
        setPaymentNotes('');
        setShowPaymentForm(false);

        // Refresh payment history
        const historyResponse = await NetworkUtils.getExpensePayments(
          credentials.accessToken,
          expense.expense_id,
        );
        if (historyResponse.success && historyResponse.data) {
          setPaymentHistory(historyResponse.data);
        }

        // Notify parent to refresh
        if (onUpdate) {
          onUpdate();
        }
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
      setSubmittingPayment(false);
    }
  };

  const handleEditExpense = () => {
    onDismiss();
    navigation.navigate('AddExpense', { expense });
  };

  const handleDeleteExpense = async () => {
    try {
      const response = await NetworkUtils.deleteExpense(
        credentials.accessToken,
        expense.expense_id,
      );

      if (response.success) {
        ErrorHelper.showToast('Expense deleted successfully', 'success');
        if (onDelete) {
          onDelete(expense.expense_id);
        }
        onDismiss();
      } else {
        ErrorHelper.showToast(
          response.error || 'Failed to delete expense',
          'error',
        );
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      ErrorHelper.logError(error, 'DELETE_EXPENSE');
      ErrorHelper.showToast('Failed to delete expense', 'error');
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View
          style={[styles.modalContent, { backgroundColor: modalBackground }]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.statusIcon,
                  { backgroundColor: getStatusColor(expense.status) + '20' },
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    expense.status === 'paid'
                      ? 'check-circle'
                      : expense.status === 'overdue'
                      ? 'alert-circle'
                      : 'clock-outline'
                  }
                  size={32}
                  color={getStatusColor(expense.status)}
                />
              </View>
              <View style={styles.headerText}>
                <StandardText
                  fontWeight="bold"
                  size="xl"
                  style={{ color: textPrimary }}
                >
                  Expense Details
                </StandardText>
                <StandardText size="sm" style={{ color: textSecondary }}>
                  {expense.invoiceNumber}
                </StandardText>
              </View>
            </View>
            <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={textSecondary}
              />
            </TouchableOpacity>
          </View>

          <Divider style={styles.divider} />

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Amount Section */}
            <StandardCard
              style={[styles.amountCard, { backgroundColor: cardBackground }]}
            >
              <View style={styles.amountSection}>
                <StandardText size="sm" style={{ color: textSecondary }}>
                  Expense Amount
                </StandardText>
                <StandardText
                  fontWeight="bold"
                  style={[
                    styles.amount,
                    { color: getStatusColor(expense.status) },
                  ]}
                >
                  ₹{expense.amount.toLocaleString()}
                </StandardText>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(expense.status) + '20' },
                  ]}
                >
                  <StandardText
                    fontWeight="bold"
                    size="sm"
                    style={{ color: getStatusColor(expense.status) }}
                  >
                    {expense.status.toUpperCase()}
                  </StandardText>
                </View>
              </View>
            </StandardCard>

            <Gap size="lg" />

            {/* Expense Information */}
            <StandardText
              fontWeight="bold"
              size="md"
              style={[styles.sectionTitle, { color: textPrimary }]}
            >
              Expense Information
            </StandardText>
            <Gap size="sm" />
            <StandardCard
              style={[styles.infoCard, { backgroundColor: cardBackground }]}
            >
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="receipt-text"
                  size={20}
                  color={colors.error}
                />
                <View style={styles.infoContent}>
                  <StandardText size="xs" style={{ color: textSecondary }}>
                    Expense Title
                  </StandardText>
                  <StandardText
                    fontWeight="medium"
                    size="md"
                    style={{ color: textPrimary }}
                  >
                    {expense.title}
                  </StandardText>
                </View>
              </View>

              <Divider style={styles.rowDivider} />
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="store"
                  size={20}
                  color={colors.error}
                />
                <View style={styles.infoContent}>
                  <StandardText size="xs" style={{ color: textSecondary }}>
                    Vendor
                  </StandardText>
                  <StandardText
                    fontWeight="medium"
                    size="md"
                    style={{ color: textPrimary }}
                  >
                    {expense.vendor}
                  </StandardText>
                </View>
              </View>

              <Divider style={styles.rowDivider} />
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="home"
                  size={20}
                  color={colors.error}
                />
                <View style={styles.infoContent}>
                  <StandardText size="xs" style={{ color: textSecondary }}>
                    Property
                  </StandardText>
                  <StandardText
                    fontWeight="medium"
                    size="md"
                    style={{ color: textPrimary }}
                  >
                    {expense.propertyName}
                  </StandardText>
                </View>
              </View>

              <Divider style={styles.rowDivider} />
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name={getCategoryIcon(expense.category)}
                  size={20}
                  color={colors.error}
                />
                <View style={styles.infoContent}>
                  <StandardText size="xs" style={{ color: textSecondary }}>
                    Category
                  </StandardText>
                  <StandardText
                    fontWeight="medium"
                    size="md"
                    style={{ color: textPrimary }}
                  >
                    {expense.category.charAt(0).toUpperCase() +
                      expense.category.slice(1)}
                  </StandardText>
                </View>
              </View>
            </StandardCard>

            <Gap size="lg" />

            {/* Payment Information */}
            <StandardText
              fontWeight="bold"
              size="md"
              style={[styles.sectionTitle, { color: textPrimary }]}
            >
              Payment Information
            </StandardText>
            <Gap size="sm" />
            <StandardCard
              style={[styles.infoCard, { backgroundColor: cardBackground }]}
            >
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="wallet"
                  size={20}
                  color={colors.primary}
                />
                <View style={styles.infoContent}>
                  <StandardText size="xs" style={{ color: textSecondary }}>
                    Payment Method
                  </StandardText>
                  <StandardText
                    fontWeight="medium"
                    size="md"
                    style={{ color: textPrimary }}
                  >
                    {expense.paymentMethod}
                  </StandardText>
                </View>
              </View>

              <Divider style={styles.rowDivider} />
              <View style={styles.infoRow}>
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={20}
                  color={colors.primary}
                />
                <View style={styles.infoContent}>
                  <StandardText size="xs" style={{ color: textSecondary }}>
                    Due Date
                  </StandardText>
                  <StandardText
                    fontWeight="medium"
                    size="md"
                    style={{ color: textPrimary }}
                  >
                    {new Date(expense.dueDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </StandardText>
                </View>
              </View>

              {expense.date && (
                <>
                  <Divider style={styles.rowDivider} />
                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons
                      name="calendar-check"
                      size={20}
                      color={colors.primary}
                    />
                    <View style={styles.infoContent}>
                      <StandardText size="xs" style={{ color: textSecondary }}>
                        Payment Date
                      </StandardText>
                      <StandardText
                        fontWeight="medium"
                        size="md"
                        style={{ color: textPrimary }}
                      >
                        {new Date(expense.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </StandardText>
                    </View>
                  </View>
                </>
              )}
            </StandardCard>

            {/* Description */}
            {expense.description && (
              <>
                <Gap size="lg" />
                <StandardText
                  fontWeight="bold"
                  size="md"
                  style={[styles.sectionTitle, { color: textPrimary }]}
                >
                  Description
                </StandardText>
                <Gap size="sm" />
                <StandardCard
                  style={[
                    styles.descriptionCard,
                    { backgroundColor: cardBackground },
                  ]}
                >
                  <StandardText
                    size="sm"
                    style={{ color: textPrimary, lineHeight: 20 }}
                  >
                    {expense.description}
                  </StandardText>
                </StandardCard>
              </>
            )}

            <Gap size="xl" />
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={handleShareInvoice}
              style={[styles.actionButton, { borderColor: colors.primary }]}
              labelStyle={{ color: colors.primary }}
              icon="share-variant"
            >
              Share
            </Button>

            {expense.status?.toLowerCase() !== 'paid' ? (
              <Button
                mode="contained"
                onPress={() => {
                  setShowPaymentForm(true);
                  setPaymentAmount(remainingAmount.toString());
                }}
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.success },
                ]}
                labelStyle={{ color: colors.white }}
                icon="cash-plus"
              >
                Record Payment
              </Button>
            ) : (
              <Button
                mode="outlined"
                onPress={handleEditExpense}
                style={[styles.actionButton, { borderColor: colors.primary }]}
                labelStyle={{ color: colors.primary }}
                icon="pencil"
              >
                Edit
              </Button>
            )}

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteExpense}
            >
              <MaterialCommunityIcons
                name="delete"
                size={20}
                color={colors.error}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Form Modal */}
        <Modal
          visible={showPaymentForm}
          onDismiss={() => setShowPaymentForm(false)}
          contentContainerStyle={styles.paymentModalContainer}
        >
          <View
            style={[
              styles.paymentModalContent,
              { backgroundColor: modalBackground },
            ]}
          >
            <View style={styles.paymentModalHeader}>
              <StandardText
                fontWeight="bold"
                size="lg"
                style={{ color: textPrimary }}
              >
                Record Payment
              </StandardText>
              <TouchableOpacity onPress={() => setShowPaymentForm(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Divider style={styles.divider} />

            <ScrollView style={styles.paymentFormScroll}>
              <View style={styles.paymentAmountInfo}>
                <View style={styles.paymentInfoRow}>
                  <StandardText size="sm" style={{ color: textSecondary }}>
                    Total Amount
                  </StandardText>
                  <StandardText
                    fontWeight="bold"
                    size="md"
                    style={{ color: textPrimary }}
                  >
                    ₹{parseFloat(expense.amount).toLocaleString()}
                  </StandardText>
                </View>
                <View style={styles.paymentInfoRow}>
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
                <View style={styles.paymentInfoRow}>
                  <StandardText size="sm" style={{ color: textSecondary }}>
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

              <Gap size="md" />

              <View style={styles.inputContainer}>
                <StandardText
                  size="sm"
                  fontWeight="medium"
                  style={{ color: textPrimary, marginBottom: 8 }}
                >
                  Payment Amount *
                </StandardText>
                <TextInput
                  mode="outlined"
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  keyboardType="decimal-pad"
                  placeholder="Enter amount"
                  left={<TextInput.Icon icon="currency-inr" />}
                  style={{ backgroundColor: cardBackground }}
                  outlineColor={colors.primary}
                  activeOutlineColor={colors.primary}
                />
              </View>

              <Gap size="sm" />

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
                  onItemSelect={setPaymentMethod}
                  placeholder="Select payment method"
                  searchPlaceholder="Search..."
                />
              </View>

              <Gap size="sm" />

              <View style={styles.inputContainer}>
                <StandardText
                  size="sm"
                  fontWeight="medium"
                  style={{ color: textPrimary, marginBottom: 8 }}
                >
                  Payment Date *
                </StandardText>
                <TouchableOpacity
                  style={[styles.dateButton, { borderColor: colors.primary }]}
                  onPress={() => setShowPaymentDatePicker(true)}
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

              <Gap size="sm" />

              <View style={styles.inputContainer}>
                <StandardText
                  size="sm"
                  fontWeight="medium"
                  style={{ color: textPrimary, marginBottom: 8 }}
                >
                  Transaction ID (Optional)
                </StandardText>
                <TextInput
                  mode="outlined"
                  value={transactionId}
                  onChangeText={setTransactionId}
                  placeholder="Reference/Transaction ID"
                  style={{ backgroundColor: cardBackground }}
                  outlineColor={colors.primary}
                  activeOutlineColor={colors.primary}
                />
              </View>

              <Gap size="sm" />

              <View style={styles.inputContainer}>
                <StandardText
                  size="sm"
                  fontWeight="medium"
                  style={{ color: textPrimary, marginBottom: 8 }}
                >
                  Notes (Optional)
                </StandardText>
                <TextInput
                  mode="outlined"
                  value={paymentNotes}
                  onChangeText={setPaymentNotes}
                  placeholder="Additional notes..."
                  multiline
                  numberOfLines={3}
                  style={{ backgroundColor: cardBackground }}
                  outlineColor={colors.primary}
                  activeOutlineColor={colors.primary}
                />
              </View>

              <Gap size="lg" />
            </ScrollView>

            <View style={styles.paymentFormActions}>
              <Button
                mode="outlined"
                onPress={() => setShowPaymentForm(false)}
                style={{ flex: 1, borderColor: colors.error }}
                labelStyle={{ color: colors.error }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleRecordPayment}
                loading={submittingPayment}
                disabled={submittingPayment}
                style={{ flex: 1, backgroundColor: colors.success }}
                labelStyle={{ color: colors.white }}
              >
                Record
              </Button>
            </View>
          </View>
        </Modal>

        <BeautifulDatePicker
          visible={showPaymentDatePicker}
          onDismiss={() => setShowPaymentDatePicker(false)}
          onDateSelect={date => {
            setPaymentDate(date.toISOString().split('T')[0]);
          }}
          title="Select Payment Date"
          initialDate={paymentDate}
        />
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
  },
  modalContent: {
    borderRadius: 16,
    maxHeight: '90%',
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  divider: {
    marginHorizontal: 20,
  },
  scrollContent: {
    padding: 20,
    maxHeight: 500,
  },
  amountCard: {
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  amountSection: {
    alignItems: 'center',
  },
  amount: {
    fontSize: 36,
    marginVertical: 8,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  rowDivider: {
    marginVertical: 8,
  },
  descriptionCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentModalContainer: {
    margin: 20,
  },
  paymentModalContent: {
    borderRadius: 16,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  paymentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  paymentFormScroll: {
    padding: 20,
    maxHeight: 400,
  },
  paymentAmountInfo: {
    backgroundColor: colors.primary + '08',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  paymentFormActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});

export default ExpenseDetailModal;
