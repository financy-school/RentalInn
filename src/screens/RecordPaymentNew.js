import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import Gap from '../components/Gap/Gap';
import BeautifulDatePicker from '../components/BeautifulDatePicker';
import PaymentMethodPicker from '../components/PaymentMethodPicker';
import { ThemeContext } from '../context/ThemeContext';
import { CredentialsContext } from '../context/CredentialsContext';
import helpers from '../navigation/helpers';
import colors from '../theme/colors';
import {
  getTenantPaymentData,
  createQuickFullPayment,
  createQuickPartialPayment,
  createQuickAdvancePayment,
} from '../services/NetworkUtils';
import PaymentInvoiceCard from '../components/PaymentInvoiceCard/PaymentInvoiceCard';
import QuickPaymentCard from '../components/QuickPaymentCard/QuickPaymentCard';

const { ErrorHelper } = helpers;

const RecordPaymentNew = ({ route, navigation }) => {
  const { theme: mode } = useContext(ThemeContext);
  const { credentials } = useContext(CredentialsContext);
  const { tenant_id, tenant_name } = route.params;

  // Theme variables
  const isDark = mode === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  // Mode state
  const [viewMode, setViewMode] = useState('quick'); // 'quick' or 'custom'

  // Data state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Form state
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [showMethodMenu, setShowMethodMenu] = useState(false);

  // Process state
  const [processing, setProcessing] = useState(false);

  // Load payment data
  const loadPaymentData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await getTenantPaymentData(
        credentials.accessToken,
        tenant_id,
      );
      setPaymentData(response.data);
    } catch (error) {
      ErrorHelper.showToast(
        error.message || 'Error loading payment data',
        'error',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPaymentData();
  }, []);

  // Refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    loadPaymentData(true);
  };

  // Quick payment handlers
  const handleQuickPayment = async suggestion => {
    if (processing) return;

    try {
      setProcessing(true);

      let response;
      const action = suggestion.type || suggestion.action;

      switch (action) {
        case 'PAY_ALL':
          // Pay all outstanding invoices - use first invoice ID
          if (!paymentData?.outstandingInvoices?.length) {
            throw new Error('No outstanding invoices found');
          }
          response = await createQuickFullPayment(
            credentials.accessToken,
            paymentData.outstandingInvoices[0].invoice_id,
            paymentMethod,
            paymentDate.toISOString().split('T')[0],
            notes || `Paid all ${suggestion.invoiceCount} invoice(s)`,
          );
          break;

        case 'PAY_OVERDUE':
        case 'PAY_FULL':
          // Pay specific invoice in full
          response = await createQuickFullPayment(
            credentials.accessToken,
            suggestion.invoice_id,
            paymentMethod,
            paymentDate.toISOString().split('T')[0],
            notes || `Payment for invoice ${suggestion.invoice_number}`,
          );
          break;

        case 'PAY_ADVANCE':
          // Make advance payment
          response = await createQuickAdvancePayment(
            credentials.accessToken,
            tenant_id,
            suggestion.amount,
            paymentMethod,
            paymentDate.toISOString().split('T')[0],
            notes || 'Advance payment',
          );
          break;

        default:
          throw new Error('Invalid payment action');
      }

      ErrorHelper.showToast(
        `Payment of ₹${(
          suggestion.suggestedAmount || suggestion.amount
        ).toLocaleString('en-IN')} recorded successfully!`,
        'success',
      );

      // Refresh and go back
      await loadPaymentData(true);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      ErrorHelper.showToast(
        error.message || 'Payment failed. Please try again',
        'error',
      );
    } finally {
      setProcessing(false);
    }
  };

  // Custom payment handler
  const handleCustomPayment = async () => {
    if (processing) return;

    // Validation
    if (!selectedInvoice) {
      ErrorHelper.showToast(
        'Please select an invoice to record payment',
        'warning',
      );
      return;
    }

    if (!customAmount || parseFloat(customAmount) <= 0) {
      ErrorHelper.showToast('Please enter a valid payment amount', 'warning');
      return;
    }

    const amount = parseFloat(customAmount);
    const outstanding = selectedInvoice.outstanding_amount;

    // Only allow full payment - no partial payments
    // Use a small tolerance for floating-point comparison
    const tolerance = 0.01; // 1 paisa tolerance
    if (Math.abs(amount - outstanding) > tolerance) {
      ErrorHelper.showToast(
        `Please pay the full outstanding amount of ₹${outstanding.toLocaleString(
          'en-IN',
        )}. Partial payments are not allowed.`,
        'warning',
      );
      return;
    }

    try {
      setProcessing(true);

      // Always use full payment since partial payments are disabled
      const response = await createQuickFullPayment(
        credentials.accessToken,
        selectedInvoice.invoice_id,
        paymentMethod,
        paymentDate.toISOString().split('T')[0],
        notes,
      );

      ErrorHelper.showToast(
        `Payment of ₹${amount.toLocaleString('en-IN')} recorded successfully!`,
        'success',
      );

      // Refresh and go back
      await loadPaymentData(true);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      ErrorHelper.showToast(
        error.message || 'Payment failed. Please try again',
        'error',
      );
    } finally {
      setProcessing(false);
    }
  };

  // Date picker handlers
  const handleDateSelect = date => {
    setPaymentDate(date);
    setShowDatePicker(false);
  };

  const formatDate = date => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Payment method options
  const paymentMethods = [
    {
      label: 'Cash',
      value: 'Cash',
      icon: 'cash',
      description: 'Pay with cash',
    },
    {
      label: 'GPay',
      value: 'GPay',
      icon: 'google',
      description: 'Google Pay',
    },
    {
      label: 'PhonePe',
      value: 'PhonePe',
      icon: 'cellphone',
      description: 'PhonePe payment',
    },
    {
      label: 'Paytm',
      value: 'Paytm',
      icon: 'wallet',
      description: 'Paytm wallet',
    },
    {
      label: 'UPI',
      value: 'UPI',
      icon: 'bank-transfer',
      description: 'Other UPI apps',
    },
    {
      label: 'Other',
      value: 'Other',
      icon: 'credit-card',
      description: 'Other payment methods',
    },
  ];

  const getMethodLabel = method => {
    const found = paymentMethods.find(m => m.value === method);
    return found ? found.label : method;
  };

  const getMethodIcon = method => {
    const found = paymentMethods.find(m => m.value === method);
    return found ? found.icon : 'cash';
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? colors.backgroundDark
              : colors.backgroundLight,
          },
        ]}
      >
        <StandardHeader title="Record Payment" navigation={navigation} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Gap size="md" />
          <StandardText style={{ color: textSecondary }}>
            Loading payment data...
          </StandardText>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? colors.backgroundDark
            : colors.backgroundLight,
        },
      ]}
    >
      <StandardHeader title="Record Payment" navigation={navigation} />

      {/* Tenant Summary Card */}
      <View style={[styles.tenantCard, { backgroundColor: cardBackground }]}>
        <View style={styles.tenantHeader}>
          <View
            style={[
              styles.tenantAvatar,
              { backgroundColor: colors.primary + '15' },
            ]}
          >
            <Icon name="account" size={32} color={colors.primary} />
          </View>
          <View style={styles.tenantInfo}>
            <StandardText
              style={[styles.tenantName, { color: textPrimary }]}
              fontWeight="bold"
            >
              {tenant_name || paymentData?.tenant?.name || 'Tenant'}
            </StandardText>
            <View style={styles.tenantDetails}>
              <View style={styles.tenantDetailRow}>
                <Icon name="home" size={14} color={textSecondary} />
                <StandardText
                  style={[styles.tenantDetailText, { color: textSecondary }]}
                >
                  {paymentData?.tenant?.room || 'Room'}{' '}
                  {paymentData?.tenant?.room && '| '}
                  Rent: ₹
                  {paymentData?.tenant?.rent_amount?.toLocaleString('en-IN') ||
                    '0'}
                </StandardText>
              </View>
            </View>
            {/* Removed conditional rendering - always show basic info */}
          </View>
        </View>

        {/* Mode Toggle */}
        <Gap size="md" />
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              {
                backgroundColor:
                  viewMode === 'quick' ? colors.primary : cardBackground,
              },
              viewMode === 'quick' && styles.modeButtonActive,
            ]}
            onPress={() => setViewMode('quick')}
          >
            <Icon
              name="lightning-bolt"
              size={18}
              color={viewMode === 'quick' ? colors.white : textSecondary}
            />
            <StandardText
              style={[
                styles.modeButtonText,
                { color: viewMode === 'quick' ? colors.white : textSecondary },
              ]}
              fontWeight={viewMode === 'quick' ? 'bold' : 'normal'}
            >
              Quick Payments
            </StandardText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              {
                backgroundColor:
                  viewMode === 'custom' ? colors.primary : cardBackground,
              },
              viewMode === 'custom' && styles.modeButtonActive,
            ]}
            onPress={() => setViewMode('custom')}
          >
            <Icon
              name="pencil"
              size={18}
              color={viewMode === 'custom' ? colors.white : textSecondary}
            />
            <StandardText
              style={[
                styles.modeButtonText,
                { color: viewMode === 'custom' ? colors.white : textSecondary },
              ]}
              fontWeight={viewMode === 'custom' ? 'bold' : 'normal'}
            >
              Custom Payment
            </StandardText>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {viewMode === 'quick' ? (
          /* Quick Mode */
          <View>
            {/* Summary Stats */}
            {paymentData?.summary && (
              <View
                style={[
                  styles.summaryCard,
                  { backgroundColor: cardBackground },
                ]}
              >
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <StandardText
                      style={[styles.summaryLabel, { color: textSecondary }]}
                    >
                      Total Outstanding
                    </StandardText>
                    <StandardText
                      style={[styles.summaryValue, { color: colors.warning }]}
                      fontWeight="bold"
                    >
                      ₹
                      {paymentData.summary.totalOutstanding.toLocaleString(
                        'en-IN',
                      )}
                    </StandardText>
                  </View>
                  {paymentData.summary.overdueCount > 0 && (
                    <View style={styles.summaryItem}>
                      <StandardText
                        style={[styles.summaryLabel, { color: textSecondary }]}
                      >
                        Overdue
                      </StandardText>
                      <StandardText
                        style={[styles.summaryValue, { color: colors.error }]}
                        fontWeight="bold"
                      >
                        ₹
                        {paymentData.summary.totalOverdue.toLocaleString(
                          'en-IN',
                        )}
                      </StandardText>
                    </View>
                  )}
                </View>
              </View>
            )}

            <Gap size="md" />

            {/* Payment Settings - NOW AT TOP */}
            <View
              style={[styles.settingsCard, { backgroundColor: cardBackground }]}
            >
              <StandardText
                style={[styles.cardTitle, { color: textPrimary }]}
                fontWeight="bold"
              >
                Payment Settings
              </StandardText>
              <StandardText
                style={[styles.sectionSubtitle, { color: textSecondary }]}
              >
                Configure method and date for quick actions below
              </StandardText>
              <Gap size="md" />

              {/* Payment Method */}
              <View>
                <StandardText
                  style={[styles.label, { color: textPrimary }]}
                  fontWeight="600"
                >
                  Payment Method
                </StandardText>
                <Gap size="xs" />
                <TouchableOpacity
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: cardBackground,
                      borderColor: isDark
                        ? colors.borderDark
                        : colors.borderLight,
                    },
                  ]}
                  onPress={() => setShowMethodMenu(true)}
                >
                  <Icon
                    name={getMethodIcon(paymentMethod)}
                    size={20}
                    color={textPrimary}
                  />
                  <StandardText
                    style={[styles.inputText, { color: textPrimary }]}
                  >
                    {getMethodLabel(paymentMethod)}
                  </StandardText>
                  <Icon name="chevron-down" size={20} color={textSecondary} />
                </TouchableOpacity>
              </View>

              <Gap size="md" />

              {/* Payment Date */}
              <View>
                <StandardText
                  style={[styles.label, { color: textPrimary }]}
                  fontWeight="600"
                >
                  Payment Date
                </StandardText>
                <Gap size="xs" />
                <TouchableOpacity
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: cardBackground,
                      borderColor: isDark
                        ? colors.borderDark
                        : colors.borderLight,
                    },
                  ]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Icon name="calendar" size={20} color={textPrimary} />
                  <StandardText
                    style={[styles.inputText, { color: textPrimary }]}
                  >
                    {formatDate(paymentDate)}
                  </StandardText>
                </TouchableOpacity>
              </View>
            </View>

            <Gap size="lg" />

            {/* Quick Actions - NOW BELOW SETTINGS */}
            {paymentData?.quickPaymentSuggestions &&
              paymentData.quickPaymentSuggestions.length > 0 && (
                <View>
                  <StandardText
                    style={[styles.sectionTitle, { color: textPrimary }]}
                    fontWeight="bold"
                  >
                    Quick Actions
                  </StandardText>
                  <StandardText
                    style={[styles.sectionSubtitle, { color: textSecondary }]}
                  >
                    Tap an action to record payment instantly
                  </StandardText>
                  <Gap size="sm" />
                  {paymentData.quickPaymentSuggestions.map(
                    (suggestion, index) => (
                      <QuickPaymentCard
                        key={index}
                        type={suggestion.type}
                        label={suggestion.label}
                        icon={suggestion.icon}
                        amount={suggestion.amount}
                        description={suggestion.description}
                        priority={suggestion.priority}
                        onPress={() => handleQuickPayment(suggestion)}
                        disabled={processing}
                      />
                    ),
                  )}
                </View>
              )}
          </View>
        ) : (
          /* Custom Mode */
          <View>
            {/* Outstanding Invoices */}
            <View>
              <StandardText
                style={[styles.sectionTitle, { color: textPrimary }]}
                fontWeight="bold"
              >
                Outstanding Invoices
              </StandardText>
              <Gap size="sm" />
              {paymentData?.outstandingInvoices &&
              paymentData.outstandingInvoices.length > 0 ? (
                paymentData.outstandingInvoices.map(invoice => (
                  <PaymentInvoiceCard
                    key={invoice.invoice_id}
                    invoice={invoice}
                    isSelected={
                      selectedInvoice?.invoice_id === invoice.invoice_id
                    }
                    onSelect={() => {
                      if (selectedInvoice?.invoice_id === invoice.invoice_id) {
                        setSelectedInvoice(null);
                        setCustomAmount('');
                      } else {
                        setSelectedInvoice(invoice);
                        setCustomAmount(invoice.outstanding_amount.toString());
                      }
                    }}
                    selectable
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="check-circle" size={64} color={colors.success} />
                  <Gap size="sm" />
                  <StandardText
                    style={[styles.emptyStateText, { color: textSecondary }]}
                    fontWeight="600"
                  >
                    No outstanding invoices
                  </StandardText>
                  <StandardText
                    style={{
                      color: textSecondary,
                      fontSize: 12,
                      textAlign: 'center',
                    }}
                  >
                    All invoices have been paid
                  </StandardText>
                </View>
              )}
            </View>

            <Gap size="lg" />

            {/* Payment Form */}
            {selectedInvoice && (
              <View
                style={[
                  styles.settingsCard,
                  { backgroundColor: cardBackground },
                ]}
              >
                <StandardText
                  style={[styles.cardTitle, { color: textPrimary }]}
                  fontWeight="bold"
                >
                  Payment Details
                </StandardText>
                <Gap size="md" />

                {/* Amount Input - Read Only (Full Payment Required) */}
                <View>
                  <StandardText
                    style={[styles.label, { color: textPrimary }]}
                    fontWeight="600"
                  >
                    Payment Amount (₹)
                  </StandardText>
                  <Gap size="xs" />
                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: isDark
                          ? colors.borderDark + '30'
                          : colors.backgroundLight,
                        borderColor: isDark
                          ? colors.borderDark
                          : colors.borderLight,
                      },
                    ]}
                  >
                    <Icon name="currency-inr" size={20} color={textPrimary} />
                    <StandardText
                      style={[styles.textInput, { color: textPrimary }]}
                      fontWeight="bold"
                    >
                      {selectedInvoice.outstanding_amount.toLocaleString(
                        'en-IN',
                      )}
                    </StandardText>
                    <View
                      style={[
                        styles.fullPaymentBadge,
                        { backgroundColor: colors.success + '20' },
                      ]}
                    >
                      <StandardText
                        style={[
                          styles.fullPaymentText,
                          { color: colors.success },
                        ]}
                        fontWeight="600"
                      >
                        Full Payment
                      </StandardText>
                    </View>
                  </View>
                  <Gap size="xs" />
                  <StandardText
                    style={[styles.helperText, { color: colors.primary }]}
                  >
                    💡 Only full invoice payment is allowed. Partial payments
                    are not supported.
                  </StandardText>
                </View>

                <Gap size="md" />

                {/* Payment Method */}
                <View>
                  <StandardText
                    style={[styles.label, { color: textPrimary }]}
                    fontWeight="600"
                  >
                    Payment Method
                  </StandardText>
                  <Gap size="xs" />
                  <TouchableOpacity
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: cardBackground,
                        borderColor: isDark
                          ? colors.borderDark
                          : colors.borderLight,
                      },
                    ]}
                    onPress={() => setShowMethodMenu(true)}
                    disabled={processing}
                  >
                    <Icon
                      name={getMethodIcon(paymentMethod)}
                      size={20}
                      color={textPrimary}
                    />
                    <StandardText
                      style={[styles.inputText, { color: textPrimary }]}
                    >
                      {getMethodLabel(paymentMethod)}
                    </StandardText>
                    <Icon name="chevron-down" size={20} color={textSecondary} />
                  </TouchableOpacity>
                </View>

                <Gap size="md" />

                {/* Payment Date */}
                <View>
                  <StandardText
                    style={[styles.label, { color: textPrimary }]}
                    fontWeight="600"
                  >
                    Payment Date
                  </StandardText>
                  <Gap size="xs" />
                  <TouchableOpacity
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: cardBackground,
                        borderColor: isDark
                          ? colors.borderDark
                          : colors.borderLight,
                      },
                    ]}
                    onPress={() => setShowDatePicker(true)}
                    disabled={processing}
                  >
                    <Icon name="calendar" size={20} color={textPrimary} />
                    <StandardText
                      style={[styles.inputText, { color: textPrimary }]}
                    >
                      {formatDate(paymentDate)}
                    </StandardText>
                  </TouchableOpacity>
                </View>

                <Gap size="md" />

                {/* Notes */}
                <View>
                  <StandardText
                    style={[styles.label, { color: textPrimary }]}
                    fontWeight="600"
                  >
                    Notes (Optional)
                  </StandardText>
                  <Gap size="xs" />
                  <TextInput
                    style={[
                      styles.notesInput,
                      {
                        backgroundColor: cardBackground,
                        borderColor: isDark
                          ? colors.borderDark
                          : colors.borderLight,
                        color: textPrimary,
                      },
                    ]}
                    placeholder="Add payment notes..."
                    placeholderTextColor={textSecondary}
                    multiline
                    numberOfLines={3}
                    value={notes}
                    onChangeText={setNotes}
                    editable={!processing}
                  />
                </View>

                <Gap size="lg" />

                {/* Submit Button */}
                <Button
                  mode="contained"
                  onPress={handleCustomPayment}
                  loading={processing}
                  disabled={processing}
                  style={[
                    styles.submitButton,
                    { backgroundColor: colors.primary },
                  ]}
                  labelStyle={styles.submitButtonText}
                >
                  Record Payment - ₹
                  {parseFloat(customAmount || 0).toLocaleString('en-IN')}
                </Button>
              </View>
            )}
          </View>
        )}
        <Gap size="xxl" />
      </ScrollView>

      {/* Payment Method Picker Modal */}
      <PaymentMethodPicker
        visible={showMethodMenu}
        onDismiss={() => setShowMethodMenu(false)}
        onSelect={setPaymentMethod}
        selectedMethod={paymentMethod}
        methods={paymentMethods}
      />

      {/* Date Picker Modal */}
      <BeautifulDatePicker
        visible={showDatePicker}
        onDismiss={() => setShowDatePicker(false)}
        onDateSelect={handleDateSelect}
        title="Select Payment Date"
        initialDate={paymentDate}
        maxDate={new Date()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tenantCard: {
    borderRadius: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tenantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tenantAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 20,
    marginBottom: 4,
  },
  tenantDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tenantDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tenantDetailText: {
    fontSize: 12,
  },
  modeToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  modeButtonActive: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modeButtonText: {
    fontSize: 14,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 8,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
  },
  settingsCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
  },
  label: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
  },
  inputText: {
    flex: 1,
    fontSize: 14,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  helperText: {
    fontSize: 12,
  },
  fullPaymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fullPaymentText: {
    fontSize: 11,
  },
  notesInput: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Metropolis-Bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default RecordPaymentNew;
