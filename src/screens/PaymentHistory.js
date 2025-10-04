import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { TextInput, Chip, Button, Card } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import StandardCard from '../components/StandardCard/StandardCard';
import { CredentialsContext } from '../context/CredentialsContext';
import colors from '../theme/color';
import Gap from '../components/Gap/Gap';
import DatePicker from 'react-native-ui-datepicker';
import PropertySelector from '../components/PropertySelector/PropertySelector';

const PaymentHistory = ({ navigation }) => {
  const { credentials } = useContext(CredentialsContext);
  const { theme: mode } = useContext(ThemeContext);

  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Theme variables
  const isDark = mode === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  const filterOptions = [
    { key: 'all', label: 'All Payments', icon: 'cash-multiple' },
    { key: 'rent', label: 'Rent', icon: 'home' },
    { key: 'deposit', label: 'Security Deposit', icon: 'shield-check' },
    { key: 'maintenance', label: 'Maintenance', icon: 'wrench' },
    { key: 'other', label: 'Other', icon: 'dots-horizontal' },
  ];

  // Calculate summary statistics
  const totalReceived = payments
    .filter(payment => payment.status === 'received')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pendingAmount = payments
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const thisMonthReceived = payments
    .filter(payment => {
      const paymentDate = new Date(payment.date);
      const now = new Date();
      return (
        payment.status === 'received' &&
        paymentDate.getMonth() === now.getMonth() &&
        paymentDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, payment) => sum + payment.amount, 0);

  // Filter payments based on search, filter, and date
  useEffect(() => {
    let filtered = payments;

    // Apply filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(
        payment => payment.category === selectedFilter,
      );
    }

    // Apply date filter
    if (startDate) {
      filtered = filtered.filter(
        payment => new Date(payment.date) >= startDate,
      );
    }
    if (endDate) {
      filtered = filtered.filter(payment => new Date(payment.date) <= endDate);
    }

    // Apply search
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        payment =>
          payment.tenantName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          payment.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          payment.propertyName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredPayments(filtered);
  }, [payments, selectedFilter, searchQuery, startDate, endDate]);

  // Fetch payment data
  const fetchPayments = useCallback(async () => {
    if (!credentials?.accessToken) return;

    try {
      setLoading(true);

      // Mock data for now - replace with actual API call
      const mockPayments = [
        {
          id: 1,
          tenantName: 'John Doe',
          propertyName: 'Sunset Apartments - Room 101',
          amount: 15000,
          category: 'rent',
          date: '2025-01-15',
          description: 'Monthly rent payment',
          status: 'received',
          paymentMethod: 'UPI',
        },
        {
          id: 2,
          tenantName: 'Jane Smith',
          propertyName: 'Sunset Apartments - Room 102',
          amount: 20000,
          category: 'deposit',
          date: '2025-01-10',
          description: 'Security deposit',
          status: 'received',
          paymentMethod: 'Bank Transfer',
        },
        {
          id: 3,
          tenantName: 'Mike Johnson',
          propertyName: 'Sunset Apartments - Room 103',
          amount: 12000,
          category: 'rent',
          date: '2025-01-08',
          description: 'Monthly rent payment',
          status: 'pending',
          paymentMethod: 'Cash',
        },
        {
          id: 4,
          tenantName: 'Sarah Wilson',
          propertyName: 'Sunset Apartments - Room 104',
          amount: 5000,
          category: 'maintenance',
          date: '2025-01-05',
          description: 'Maintenance fee',
          status: 'received',
          paymentMethod: 'UPI',
        },
        {
          id: 5,
          tenantName: 'David Brown',
          propertyName: 'Sunset Apartments - Room 105',
          amount: 18000,
          category: 'rent',
          date: '2025-01-01',
          description: 'Monthly rent payment',
          status: 'received',
          paymentMethod: 'Bank Transfer',
        },
      ];

      setTimeout(() => {
        setPayments(mockPayments);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setLoading(false);
      setRefreshing(false);
    }
  }, [credentials]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPayments();
  }, [fetchPayments]);

  // Download payment history report
  const downloadReport = useCallback(async () => {
    try {
      if (filteredPayments.length === 0) {
        Alert.alert('No Data', 'There are no payments to export.');
        return;
      }

      // Create CSV content
      const headers = [
        'Tenant Name',
        'Property',
        'Amount',
        'Category',
        'Payment Method',
        'Status',
        'Date',
        'Description',
      ];
      const csvContent = [
        headers.join(','),
        ...filteredPayments.map(payment =>
          [
            `"${payment.tenantName}"`,
            `"${payment.propertyName}"`,
            payment.amount,
            payment.category,
            payment.paymentMethod,
            payment.status,
            new Date(payment.date).toLocaleDateString(),
            `"${payment.description || ''}"`,
          ].join(','),
        ),
      ].join('\n');

      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      const filename = `payment_history_${date}.csv`;

      // Share the CSV file
      await Share.open({
        title: 'Payment History Report',
        message: 'Payment History Report',
        url: `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`,
        filename: filename,
        type: 'text/csv',
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      Alert.alert('Error', 'Failed to download the report. Please try again.');
    }
  }, [filteredPayments]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StandardHeader
          navigation={navigation}
          title="Payment History"
          subtitle="Track all payment transactions"
          showBackButton
        />
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons
            name="loading"
            size={48}
            color={colors.primary}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StandardHeader
        navigation={navigation}
        title="Payment History"
        subtitle="Track all payment transactions"
        showBackButton
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Property Selector */}
        <PropertySelector />

        <Gap size="lg" />

        {/* Download & Filter Section */}
        <StandardCard
          style={[styles.downloadCard, { backgroundColor: cardBackground }]}
        >
          <View style={styles.downloadHeader}>
            <MaterialCommunityIcons
              name="file-download-outline"
              size={24}
              color={colors.primary}
            />
            <StandardText
              fontWeight="bold"
              size="lg"
              style={[styles.downloadTitle, { color: textPrimary }]}
            >
              Export Report
            </StandardText>
          </View>

          <StandardText
            style={[styles.downloadSubtitle, { color: textSecondary }]}
          >
            Download payment history with custom date range
          </StandardText>

          <Gap size="md" />

          {/* Date Range Selection */}
          <View style={styles.dateRangeContainer}>
            <View style={styles.dateButtonContainer}>
              <Button
                mode="outlined"
                onPress={() => setShowStartDatePicker(true)}
                style={[styles.dateButton, { borderColor: colors.primary }]}
                labelStyle={{ color: colors.primary }}
                icon="calendar-start"
              >
                {startDate ? startDate : 'Start Date'}
              </Button>
            </View>

            <View style={styles.dateSeparator}>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color={textSecondary}
              />
            </View>

            <View style={styles.dateButtonContainer}>
              <Button
                mode="outlined"
                onPress={() => setShowEndDatePicker(true)}
                style={[styles.dateButton, { borderColor: colors.primary }]}
                labelStyle={{ color: colors.primary }}
                icon="calendar-end"
              >
                {endDate ? endDate : 'End Date'}
              </Button>
            </View>
          </View>

          <Gap size="md" />

          {/* Clear Filters & Download */}
          <View style={styles.downloadActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setStartDate(null);
                setEndDate(null);
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              style={styles.clearButton}
              labelStyle={{ color: colors.primary }}
            >
              Clear Filters
            </Button>

            <Button
              mode="contained"
              onPress={downloadReport}
              style={[
                styles.downloadButton,
                { backgroundColor: colors.primary },
              ]}
              disabled={filteredPayments.length === 0}
              icon="download"
            >
              Download CSV ({filteredPayments.length})
            </Button>
          </View>
        </StandardCard>

        <Gap size="lg" />

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <StandardCard
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="cash-multiple"
                size={24}
                color={colors.success}
              />
              <StandardText
                fontWeight="medium"
                size="sm"
                style={[styles.cardTitle, { color: textSecondary }]}
              >
                Total Received
              </StandardText>
            </View>
            <StandardText
              fontWeight="bold"
              size="xl"
              style={[styles.cardValue, { color: colors.success }]}
            >
              ₹{totalReceived.toLocaleString()}
            </StandardText>
          </StandardCard>

          <StandardCard
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={24}
                color={colors.warning}
              />
              <StandardText
                fontWeight="medium"
                size="sm"
                style={[styles.cardTitle, { color: textSecondary }]}
              >
                Pending Amount
              </StandardText>
            </View>
            <StandardText
              fontWeight="bold"
              size="xl"
              style={[styles.cardValue, { color: colors.warning }]}
            >
              ₹{pendingAmount.toLocaleString()}
            </StandardText>
          </StandardCard>

          <StandardCard
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="calendar-month"
                size={24}
                color={colors.primary}
              />
              <StandardText
                fontWeight="medium"
                size="sm"
                style={[styles.cardTitle, { color: textSecondary }]}
              >
                This Month
              </StandardText>
            </View>
            <StandardText
              fontWeight="bold"
              size="xl"
              style={[styles.cardValue, { color: colors.primary }]}
            >
              ₹{thisMonthReceived.toLocaleString()}
            </StandardText>
          </StandardCard>
        </View>

        {/* Search and Filters */}
        <View style={styles.controlsContainer}>
          <TextInput
            placeholder="Search payments..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
            contentStyle={styles.searchInput}
            left={<TextInput.Icon icon="magnify" color={textSecondary} />}
          />

          <Gap size="md" />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
          >
            {filterOptions.map(filter => (
              <Chip
                key={filter.key}
                selected={selectedFilter === filter.key}
                selectedColor="#fff"
                onPress={() => setSelectedFilter(filter.key)}
                style={[
                  styles.filterChip,
                  selectedFilter === filter.key && styles.selectedFilterChip,
                ]}
                textStyle={[
                  styles.filterChipText,
                  selectedFilter === filter.key &&
                    styles.selectedFilterChipText,
                ]}
                icon={() => (
                   
                  <MaterialCommunityIcons
                    name={filter.icon}
                    size={18}
                    color={
                      selectedFilter === filter.key ? '#fff' : textSecondary
                    }
                  />
                )}
              >
                {filter.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <Gap size="md" />

        {/* Payments List */}
        <StandardText
          fontWeight="bold"
          size="xl"
          style={[styles.sectionTitle, { color: textPrimary }]}
        >
          Payment Records ({filteredPayments.length})
        </StandardText>

        <Gap size="md" />

        {filteredPayments.length > 0 ? (
          filteredPayments.map(payment => (
            <StandardCard
              key={payment.id}
              style={[styles.paymentCard, { backgroundColor: cardBackground }]}
            >
              <View style={styles.paymentHeader}>
                <View style={styles.paymentInfo}>
                  <StandardText
                    fontWeight="bold"
                    size="lg"
                    style={[styles.paymentTitle, { color: textPrimary }]}
                  >
                    {payment.tenantName}
                  </StandardText>
                  <StandardText
                    style={[styles.paymentProperty, { color: textSecondary }]}
                  >
                    {payment.propertyName}
                  </StandardText>
                  <StandardText
                    style={[styles.paymentDate, { color: textSecondary }]}
                  >
                    {new Date(payment.date).toLocaleDateString()}
                  </StandardText>
                </View>
                <View style={styles.paymentAmount}>
                  <StandardText
                    fontWeight="bold"
                    size="lg"
                    style={[styles.amount, { color: colors.success }]}
                  >
                    +₹{payment.amount.toLocaleString()}
                  </StandardText>
                  <Chip
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor:
                          payment.status === 'received'
                            ? colors.success + '20'
                            : colors.warning + '20',
                      },
                    ]}
                    textStyle={[
                      styles.statusChipText,
                      {
                        color:
                          payment.status === 'received'
                            ? colors.success
                            : colors.warning,
                      },
                    ]}
                  >
                    {payment.status === 'received' ? 'Received' : 'Pending'}
                  </Chip>
                </View>
              </View>

              <Gap size="sm" />

              <StandardText
                style={[styles.paymentDescription, { color: textSecondary }]}
              >
                {payment.description}
              </StandardText>

              <Gap size="sm" />

              <View style={styles.paymentFooter}>
                <Chip
                  style={[
                    styles.categoryChip,
                    { backgroundColor: colors.primary + '20' },
                  ]}
                  textStyle={[
                    styles.categoryChipText,
                    { color: colors.primary },
                  ]}
                >
                  {payment.category}
                </Chip>
                <Chip
                  style={[
                    styles.methodChip,
                    { backgroundColor: colors.secondary + '20' },
                  ]}
                  textStyle={[
                    styles.methodChipText,
                    { color: colors.secondary },
                  ]}
                >
                  {payment.paymentMethod}
                </Chip>
              </View>
            </StandardCard>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="cash-multiple"
              size={64}
              color={textSecondary}
            />
            <StandardText
              fontWeight="bold"
              size="lg"
              style={[styles.emptyText, { color: textPrimary }]}
            >
              {searchQuery || selectedFilter !== 'all'
                ? 'No payments found'
                : 'No payment records yet'}
            </StandardText>
            <StandardText
              style={[styles.emptySubtext, { color: textSecondary }]}
            >
              {searchQuery || selectedFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Payment transactions will appear here once tenants make payments'}
            </StandardText>
          </View>
        )}
      </ScrollView>

      {/* Date Picker Modals */}
      {showStartDatePicker && (
        <View style={styles.datePickerOverlay}>
          <View
            style={[
              styles.datePickerContainer,
              { backgroundColor: cardBackground },
            ]}
          >
            <View style={styles.datePickerHeader}>
              <StandardText
                fontWeight="bold"
                size="lg"
                style={[styles.datePickerTitle, { color: textPrimary }]}
              >
                Select Start Date
              </StandardText>
              <TouchableOpacity
                onPress={() => setShowStartDatePicker(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={textSecondary}
                />
              </TouchableOpacity>
            </View>
            <DatePicker
              mode="single"
              date={startDate ? new Date(startDate) : new Date()}
              onChange={params => {
                setStartDate(params.date?.toISOString().split('T')[0]);
                setShowStartDatePicker(false);
              }}
              selectedItemColor={colors.primary}
              calendarTextStyle={{ color: textPrimary }}
              headerTextStyle={{ color: textPrimary }}
              weekDaysTextStyle={{ color: textSecondary }}
              headerButtonColor={colors.primary}
            />
          </View>
        </View>
      )}

      {showEndDatePicker && (
        <View style={styles.datePickerOverlay}>
          <View
            style={[
              styles.datePickerContainer,
              { backgroundColor: cardBackground },
            ]}
          >
            <View style={styles.datePickerHeader}>
              <StandardText
                fontWeight="bold"
                size="lg"
                style={[styles.datePickerTitle, { color: textPrimary }]}
              >
                Select End Date
              </StandardText>
              <TouchableOpacity
                onPress={() => setShowEndDatePicker(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={textSecondary}
                />
              </TouchableOpacity>
            </View>
            <DatePicker
              mode="single"
              date={endDate ? new Date(endDate) : new Date()}
              onChange={params => {
                setEndDate(params.date?.toISOString().split('T')[0]);
                setShowEndDatePicker(false);
              }}
              selectedItemColor={colors.primary}
              calendarTextStyle={{ color: textPrimary }}
              headerTextStyle={{ color: textPrimary }}
              weekDaysTextStyle={{ color: textSecondary }}
              headerButtonColor={colors.primary}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 14,
  },
  cardValue: {
    fontSize: 20,
    marginTop: 4,
  },
  controlsContainer: {
    gap: 12,
    marginTop: 30,
  },
  searchBar: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 25,
    elevation: 2,
    fontFamily: 'Metropolis-Medium',
  },
  searchInput: {
    fontFamily: 'Metropolis-Medium',
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  selectedFilterChip: {
    backgroundColor: colors.secondary,
  },
  filterChipText: {
    color: '#000',
    fontFamily: 'Metropolis-Medium',
    fontWeight: '400',
  },
  selectedFilterChipText: {
    color: '#fff',
    fontFamily: 'Metropolis-Medium',
    fontWeight: '600',
  },
  sectionTitle: {
    marginBottom: 8,
  },
  paymentCard: {
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    marginBottom: 4,
  },
  paymentProperty: {
    fontSize: 12,
    marginBottom: 2,
  },
  paymentDate: {
    fontSize: 12,
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    marginBottom: 4,
  },
  statusChip: {
    height: 24,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  paymentDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryChip: {
    height: 28,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  methodChip: {
    height: 28,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  methodChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButton: {
    flex: 2,
  },
  datePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  datePickerContainer: {
    margin: 20,
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerTitle: {
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButtonContainer: {
    flex: 1,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
  },
  dateSeparator: {
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PaymentHistory;
