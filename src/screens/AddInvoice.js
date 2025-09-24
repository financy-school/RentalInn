import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Button, Checkbox } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import Gap from '../components/Gap/Gap';
import { createInvoice, getTenantInvoiceData } from '../services/NetworkUtils';
import { CredentialsContext } from '../context/CredentialsContext';
import colors from '../theme/color';

const AddInvoice = ({ navigation, route }) => {
  const { theme: mode } = useContext(ThemeContext);
  const { credentials } = useContext(CredentialsContext);
  const { tenant } = route.params;

  // Theme variables
  const isDark = mode === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  // Invoice data state
  const [invoiceData, setInvoiceData] = useState({
    totalDues: 0,
    totalCollection: 0,
    securityDeposit: 0,
    bills: [],
  });

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tenantInvoiceData, setTenantInvoiceData] = useState(null);

  // Debug: Log tenant data
  useEffect(() => {
    console.log('Tenant data received:', JSON.stringify(tenant, null, 2));
    fetchTenantInvoiceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant]);

  // Helper function to create fixed bill structure
  const createFixedBills = () => [
    {
      id: 'rent',
      category: 'Rent',
      existingDues: 0,
      existingDueDate: '',
      addDueAmount: 0,
      dueDate: new Date(),
      dueDescription: '',
      selected: false,
    },
    {
      id: 'security',
      category: 'Security Deposit',
      existingDues: 0,
      existingDueDate: '',
      addDueAmount: 0,
      dueDate: new Date(),
      dueDescription: '',
      selected: false,
    },
    {
      id: 'joining',
      category: 'Joining Fee',
      existingDues: 0,
      existingDueDate: '',
      addDueAmount: 0,
      dueDate: new Date(),
      dueDescription: '',
      selected: false,
    },
    {
      id: 'electricity',
      category: 'Electricity',
      existingDues: 0,
      existingDueDate: '',
      addDueAmount: 0,
      dueDate: new Date(),
      dueDescription: '',
      selected: false,
    },
    {
      id: 'water',
      category: 'Water',
      existingDues: 0,
      existingDueDate: '',
      addDueAmount: 0,
      dueDate: new Date(),
      dueDescription: '',
      selected: false,
    },
  ];

  // Fetch tenant invoice data from API
  const fetchTenantInvoiceData = async () => {
    try {
      setInitialLoading(true);
      setError(null);

      const tenantId = getTenantId();
      if (!tenantId) {
        setError('Tenant ID is missing. Unable to fetch invoice data.');
        setInitialLoading(false);
        return;
      }

      console.log('Fetching invoice data for tenant ID:', tenantId);

      const response = await getTenantInvoiceData(
        credentials.accessToken,
        tenantId,
      );

      if (response.success && response.data) {
        const data = response.data;
        setTenantInvoiceData(data);

        // Create fixed bill categories
        const fixedBills = createFixedBills();

        // Map API categories to fixed categories
        const categoryMapping = {
          RENT: 'rent',
          SECURITY_DEPOSIT: 'security',
          SECURITY: 'security',
          JOINING_FEE: 'joining',
          JOINING: 'joining',
          ELECTRICITY: 'electricity',
          WATER: 'water',
          MAINTENANCE: 'electricity', // Map maintenance to electricity if needed
        };

        // Populate existing dues from pending items
        if (data.pendingItems?.items?.length > 0) {
          data.pendingItems.items.forEach(item => {
            const apiCategory = item.category?.toUpperCase();
            const mappedId = categoryMapping[apiCategory];

            if (mappedId) {
              const bill = fixedBills.find(b => b.id === mappedId);
              if (bill) {
                bill.existingDues = item.pendingAmount || 0;
                bill.existingDueDate = item.dueDate
                  ? formatExistingDueDate(new Date(item.dueDate))
                  : '';
                bill.dueDescription = item.description || '';
              }
            }
          });
        }

        // Populate suggested amounts from suggested items
        if (data.suggestedItems?.length > 0) {
          data.suggestedItems.forEach(item => {
            const apiCategory = item.category?.toUpperCase();
            const mappedId = categoryMapping[apiCategory];

            if (mappedId) {
              const bill = fixedBills.find(b => b.id === mappedId);
              if (bill) {
                bill.addDueAmount = item.amount || 0;
                bill.dueDate = item.dueDate
                  ? new Date(item.dueDate)
                  : new Date();
                bill.dueDescription =
                  bill.dueDescription || item.description || '';
                bill.selected = item.category?.toUpperCase() === 'RENT'; // Auto-select rent
              }
            }
          });
        }

        // Update invoice data with fixed bills
        setInvoiceData({
          totalDues: data.pendingItems?.totalPendingAmount || 0,
          totalCollection: data.paymentHistory?.summary?.totalAmountPaid || 0,
          securityDeposit: 0, // This might need to be calculated or provided by API
          bills: fixedBills,
        });
      } else {
        // Even if API fails, show fixed bill structure with empty values
        const emptyBills = createFixedBills();
        setInvoiceData({
          totalDues: 0,
          totalCollection: 0,
          securityDeposit: 0,
          bills: emptyBills,
        });
        setError(
          response.error || 'Failed to fetch invoice data. Please try again.',
        );
      }
    } catch (fetchError) {
      console.error('Error fetching tenant invoice data:', fetchError);
      // Even if API fails, show fixed bill structure with empty values
      const emptyBills = createFixedBills();
      setInvoiceData({
        totalDues: 0,
        totalCollection: 0,
        securityDeposit: 0,
        bills: emptyBills,
      });
      setError('An unexpected error occurred while fetching invoice data.');
    } finally {
      setInitialLoading(false);
    }
  };

  // Helper function to format existing due dates
  const formatExistingDueDate = date => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Helper function to safely extract tenant ID
  const getTenantId = () => {
    // Try different possible property names for tenant ID
    return tenant?.id || tenant?.tenant_id || tenant?.tenantId;
  };

  // Helper function to safely extract rental/room ID
  const getRentalId = () => {
    return (
      tenant?.rental_id ||
      tenant?.rentalId ||
      tenant?.room?.id ||
      tenant?.roomId ||
      tenant?.room_id
    );
  };

  // Invoice functions
  const toggleBillSelection = billId => {
    setInvoiceData(prev => ({
      ...prev,
      bills: prev.bills.map(bill =>
        bill.id === billId ? { ...bill, selected: !bill.selected } : bill,
      ),
    }));
  };

  const updateBillAmount = (billId, amount) => {
    setInvoiceData(prev => ({
      ...prev,
      bills: prev.bills.map(bill =>
        bill.id === billId ? { ...bill, addDueAmount: amount } : bill,
      ),
    }));
  };

  const updateBillDate = (billId, date) => {
    setInvoiceData(prev => ({
      ...prev,
      bills: prev.bills.map(bill =>
        bill.id === billId ? { ...bill, dueDate: date } : bill,
      ),
    }));
  };

  const calculateTotalDueAmount = () => {
    return invoiceData.bills
      .filter(bill => bill.selected)
      .reduce((total, bill) => total + (bill.addDueAmount || 0), 0);
  };

  // Date picker functions
  const openDatePicker = billId => {
    setSelectedBillId(billId);
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate && selectedBillId) {
      updateBillDate(selectedBillId, selectedDate);
    }
    setSelectedBillId(null);
  };

  const handleAddInvoice = async () => {
    const selectedBills = invoiceData.bills.filter(
      bill => bill.selected && bill.addDueAmount > 0,
    );
    const totalAmount = calculateTotalDueAmount();

    if (selectedBills.length === 0) {
      Alert.alert(
        'Error',
        'Please select at least one bill category with amount',
      );
      return;
    }

    if (totalAmount === 0) {
      Alert.alert('Error', 'Please enter amount for selected bills');
      return;
    }

    // Validate tenant data
    const tenantId = getTenantId();
    if (!tenantId) {
      Alert.alert('Error', 'Tenant information is missing. Please try again.');
      return;
    }

    try {
      setLoading(true);

      // Ensure tenantId is a valid number
      const parsedTenantId = tenantId;
      const rentalId = getRentalId();
      const parsedRentalId = rentalId ? parseInt(rentalId, 10) : null;

      // Prepare invoice data according to API format - only send new amounts
      const invoicePayload = {
        tenantId: parsedTenantId,
        rentalId: parsedRentalId,
        dueDate:
          tenantInvoiceData?.invoiceGeneration?.suggestedDueDate ||
          new Date().toISOString(),
        description: `Invoice for ${tenant?.name || 'tenant'}`,
        isRecurring: false,
        recurringFrequency: null,
        items: selectedBills.map(bill => ({
          category: bill.category.toUpperCase().replace(/\s+/g, '_'), // Convert spaces to underscores
          description: bill.dueDescription || `${bill.category} charges`,
          amount: parseFloat(bill.addDueAmount) || 0,
          existingDues: 0, // Don't include existing dues in new invoice
          dueDate: bill.dueDate.toISOString(),
          quantity: 1,
          metadata: bill.metadata || {},
        })),
      };

      console.log('Invoice payload:', JSON.stringify(invoicePayload, null, 2));

      const response = await createInvoice(
        credentials.accessToken,
        invoicePayload,
      );

      if (response.success) {
        Alert.alert(
          'Invoice Created',
          `Invoice created successfully for ₹${totalAmount.toLocaleString()}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      } else {
        Alert.alert(
          'Error',
          response.error || 'Failed to create invoice. Please try again.',
        );
      }
    } catch (apiError) {
      console.error('Error creating invoice:', apiError);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StandardHeader
        navigation={navigation}
        title="Add Invoice"
        loading={loading}
      />

      {initialLoading ? (
        <View style={styles.loadingContainer}>
          <StandardText style={{ color: textPrimary }}>
            Loading invoice data...
          </StandardText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={48}
            color={colors.error}
            style={styles.errorIcon}
          />
          <StandardText
            style={[styles.errorTitle, { color: textPrimary }]}
            fontWeight="bold"
          >
            Unable to Load Invoice Data
          </StandardText>
          <StandardText style={[styles.errorMessage, { color: textSecondary }]}>
            {error}
          </StandardText>
          <Button
            mode="contained"
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            labelStyle={{ color: colors.white }}
            onPress={fetchTenantInvoiceData}
          >
            Retry
          </Button>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Tenant Info Header */}
          <View
            style={[styles.tenantHeader, { backgroundColor: cardBackground }]}
          >
            <View style={styles.tenantInfo}>
              <StandardText
                style={[styles.tenantName, { color: textPrimary }]}
                fontWeight="bold"
              >
                {tenant?.name || 'Unknown Tenant'}
              </StandardText>
              <StandardText
                style={[styles.tenantRoom, { color: textSecondary }]}
              >
                Room: {tenant?.room_number || 'N/A'}
              </StandardText>
            </View>
          </View>

          <Gap size="lg" />

          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, styles.summaryCardError]}>
                <StandardText
                  style={[styles.summaryAmount, { color: colors.error }]}
                  fontWeight="bold"
                >
                  ₹{invoiceData.totalDues.toLocaleString()}
                </StandardText>
                <StandardText
                  style={[styles.summaryLabel, { color: textSecondary }]}
                >
                  Total Dues
                </StandardText>
              </View>
              <View style={[styles.summaryCard, styles.summaryCardSuccess]}>
                <StandardText
                  style={[styles.summaryAmount, { color: colors.success }]}
                  fontWeight="bold"
                >
                  ₹{invoiceData.totalCollection.toLocaleString()}
                </StandardText>
                <StandardText
                  style={[styles.summaryLabel, { color: textSecondary }]}
                >
                  Total Collection
                </StandardText>
              </View>
              <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
                <StandardText
                  style={[styles.summaryAmount, { color: colors.primary }]}
                  fontWeight="bold"
                >
                  ₹{invoiceData.securityDeposit.toLocaleString()}
                </StandardText>
                <StandardText
                  style={[styles.summaryLabel, { color: textSecondary }]}
                >
                  Security Deposit
                </StandardText>
              </View>
            </View>
          </View>

          <Gap size="lg" />

          {/* Add Dues Button */}
          {/* <TouchableOpacity style={styles.addDuesButton}>
          <StandardText
            style={[styles.addDuesText, { color: colors.primary }]}
            fontWeight="bold"
          >
            Add Dues
          </StandardText>
        </TouchableOpacity> */}

          {/* <Gap size="lg" /> */}

          {/* Bill Categories Table */}
          <View style={[styles.billTable, { backgroundColor: cardBackground }]}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <StandardText
                style={[
                  styles.tableHeaderText,
                  styles.tableHeaderSelect,
                  { color: textSecondary },
                ]}
              >
                SELECT DUES
              </StandardText>
              <StandardText
                style={[
                  styles.tableHeaderText,
                  styles.tableHeaderCategory,
                  { color: textSecondary },
                ]}
              >
                BILL CATEGORY
              </StandardText>
              <StandardText
                style={[
                  styles.tableHeaderText,
                  styles.tableHeaderExisting,
                  { color: textSecondary },
                ]}
              >
                EXISTING DUES
              </StandardText>
              <StandardText
                style={[
                  styles.tableHeaderText,
                  styles.tableHeaderAmount,
                  { color: textSecondary },
                ]}
              >
                ADD DUE AMOUNT
              </StandardText>
              <StandardText
                style={[
                  styles.tableHeaderText,
                  styles.tableHeaderDate,
                  { color: textSecondary },
                ]}
              >
                DUE DATE
              </StandardText>
            </View>

            {/* Table Rows */}
            {invoiceData.bills.map((bill, index) => (
              <View
                key={bill.id}
                style={[
                  styles.tableRow,
                  index % 2 === 0 ? styles.evenRow : styles.oddRow,
                ]}
              >
                {/* Checkbox */}
                <View style={styles.checkboxContainer}>
                  <Checkbox
                    status={bill.selected ? 'checked' : 'unchecked'}
                    onPress={() => toggleBillSelection(bill.id)}
                    color={colors.primary}
                  />
                </View>

                {/* Bill Category */}
                <View style={styles.categoryContainer}>
                  <StandardText
                    style={[styles.categoryText, { color: textPrimary }]}
                    fontWeight="medium"
                  >
                    {bill.category}
                  </StandardText>
                </View>

                {/* Existing Dues */}
                <View style={styles.existingDuesContainer}>
                  {bill.existingDues > 0 ? (
                    <View>
                      <StandardText
                        style={[styles.existingAmount, { color: colors.error }]}
                        fontWeight="bold"
                      >
                        ₹{bill.existingDues.toLocaleString()}
                      </StandardText>
                      <StandardText
                        style={[styles.existingDate, { color: textSecondary }]}
                      >
                        {bill.existingDueDate}
                      </StandardText>
                    </View>
                  ) : (
                    <StandardText
                      style={[styles.notFixedText, { color: textSecondary }]}
                    >
                      Not fixed
                    </StandardText>
                  )}
                </View>

                {/* Add Due Amount */}
                <View style={styles.addAmountContainer}>
                  {bill.selected ? (
                    <TextInput
                      style={[
                        styles.amountInput,
                        {
                          color: textPrimary,
                          borderColor: colors.border,
                          backgroundColor: isDark
                            ? colors.backgroundDark
                            : colors.white,
                        },
                      ]}
                      value={
                        bill.addDueAmount ? bill.addDueAmount.toString() : ''
                      }
                      onChangeText={text =>
                        updateBillAmount(bill.id, parseInt(text, 10) || 0)
                      }
                      placeholder="Enter amount"
                      placeholderTextColor={textSecondary}
                      keyboardType="numeric"
                    />
                  ) : (
                    <StandardText
                      style={[styles.dashText, { color: textSecondary }]}
                    >
                      -
                    </StandardText>
                  )}
                </View>

                {/* Due Date */}
                <View style={styles.dueDateContainer}>
                  <TouchableOpacity
                    style={[styles.dateButton, { borderColor: colors.border }]}
                    disabled={!bill.selected}
                    onPress={() => bill.selected && openDatePicker(bill.id)}
                  >
                    <View style={styles.dateContent}>
                      <StandardText
                        style={[
                          styles.dateText,
                          {
                            color: bill.selected ? textPrimary : textSecondary,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {bill.dueDate.getDate().toString().padStart(2, '0')}-
                        {(bill.dueDate.getMonth() + 1)
                          .toString()
                          .padStart(2, '0')}
                        -{bill.dueDate.getFullYear().toString().slice(-2)}
                      </StandardText>
                      {bill.selected && (
                        <MaterialCommunityIcons
                          name="calendar"
                          size={12}
                          color={colors.primary}
                          style={styles.calendarIcon}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          <Gap size="xl" />

          {/* Add Invoice Button */}
          <Button
            mode="contained"
            style={[
              styles.addInvoiceButton,
              { backgroundColor: colors.primary },
            ]}
            labelStyle={[styles.addInvoiceButtonText, { color: colors.white }]}
            onPress={handleAddInvoice}
            loading={loading}
            disabled={loading}
          >
            Add ₹{calculateTotalDueAmount().toLocaleString()} Dues now
          </Button>

          <Gap size="xxl" />
        </ScrollView>
      )}

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={
            selectedBillId
              ? invoiceData.bills.find(bill => bill.id === selectedBillId)
                  ?.dueDate || new Date()
              : new Date()
          }
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  tenantHeader: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    marginTop: 16,
  },
  tenantInfo: {
    alignItems: 'center',
  },
  tenantName: {
    fontSize: 20,
    marginBottom: 4,
  },
  tenantRoom: {
    fontSize: 14,
  },
  summaryContainer: {
    paddingVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowRadius: 4,
  },
  summaryCardError: {
    backgroundColor: 'rgba(220, 53, 69, 0.2)',
  },
  summaryCardSuccess: {
    backgroundColor: 'rgba(40, 167, 69, 0.2)',
  },
  summaryCardPrimary: {
    backgroundColor: 'rgba(238, 123, 17, 0.2)',
  },
  summaryAmount: {
    fontSize: 18,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  addDuesButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(238, 123, 17, 0.2)',
  },
  addDuesText: {
    fontSize: 16,
  },
  billTable: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  tableHeaderSelect: {
    flex: 0.8,
  },
  tableHeaderCategory: {
    flex: 1,
  },
  tableHeaderExisting: {
    flex: 0.8,
  },
  tableHeaderAmount: {
    flex: 0.8,
  },
  tableHeaderDate: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 60,
  },
  evenRow: {
    backgroundColor: colors.background + '50',
  },
  oddRow: {
    backgroundColor: 'transparent',
  },
  checkboxContainer: {
    flex: 0.8,
    alignItems: 'center',
  },
  categoryContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  categoryText: {
    fontSize: 14,
  },
  existingDuesContainer: {
    flex: 0.8,
    alignItems: 'center',
  },
  existingAmount: {
    fontSize: 14,
    textAlign: 'center',
  },
  existingDate: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  notFixedText: {
    fontSize: 12,
    textAlign: 'center',
  },
  addAmountContainer: {
    flex: 0.8,
    paddingHorizontal: 4,
  },
  amountInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  dashText: {
    textAlign: 'center',
    fontSize: 16,
  },
  dueDateContainer: {
    flex: 1,
    paddingHorizontal: 4,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 80,
    width: '100%',
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  dateText: {
    fontSize: 11,
    textAlign: 'center',
    flexShrink: 0,
    minWidth: 60,
  },
  calendarIcon: {
    marginLeft: 4,
  },
  addInvoiceButton: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  addInvoiceButtonText: {
    fontSize: 16,
    fontFamily: 'Metropolis-Bold',
  },
});

export default AddInvoice;
