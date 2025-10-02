import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Card, TextInput, Chip, Button } from 'react-native-paper';
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

const ExpenseTracking = ({ navigation }) => {
  const { credentials } = useContext(CredentialsContext);
  const { theme: mode } = useContext(ThemeContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Theme variables
  const isDark = mode === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  // Fetch expense data
  const fetchExpenses = useCallback(async () => {
    if (!credentials?.accessToken) return;

    try {
      setLoading(true);

      // Mock data for now - replace with actual API call
      const mockExpenses = [
        {
          id: 1,
          title: 'Property Maintenance',
          amount: 2500,
          category: 'maintenance',
          date: '2025-01-15',
          description: 'Monthly maintenance and repairs',
          status: 'paid',
        },
        {
          id: 2,
          title: 'Electricity Bill',
          amount: 1800,
          category: 'utilities',
          date: '2025-01-10',
          description: 'Monthly electricity bill for all rooms',
          status: 'paid',
        },
        {
          id: 3,
          title: 'Water Supply',
          amount: 1200,
          category: 'utilities',
          date: '2025-01-08',
          description: 'Water supply and maintenance',
          status: 'pending',
        },
        {
          id: 4,
          title: 'Cleaning Services',
          amount: 800,
          category: 'maintenance',
          date: '2025-01-05',
          description: 'Professional cleaning service',
          status: 'paid',
        },
        {
          id: 5,
          title: 'Internet Connection',
          amount: 1500,
          category: 'utilities',
          date: '2025-01-01',
          description: 'High-speed internet for tenants',
          status: 'paid',
        },
      ];

      setTimeout(() => {
        setExpenses(mockExpenses);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setLoading(false);
      setRefreshing(false);
    }
  }, [credentials]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchExpenses();
  }, [fetchExpenses]);

  // Download expense report
  const downloadReport = useCallback(async () => {
    try {
      if (filteredExpenses.length === 0) {
        Alert.alert('No Data', 'There are no expenses to export.');
        return;
      }

      // Create CSV content
      const headers = [
        'Title',
        'Amount',
        'Category',
        'Status',
        'Date',
        'Description',
      ];
      const csvContent = [
        headers.join(','),
        ...filteredExpenses.map(expense =>
          [
            `"${expense.title}"`,
            expense.amount,
            expense.category,
            expense.status,
            new Date(expense.date).toLocaleDateString(),
            `"${expense.description || ''}"`,
          ].join(','),
        ),
      ].join('\n');

      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      const filename = `expense_report_${date}.csv`;

      // Share the CSV file
      await Share.open({
        title: 'Expense Report',
        message: 'Expense Report',
        url: `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`,
        filename: filename,
        type: 'text/csv',
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      Alert.alert('Error', 'Failed to download the report. Please try again.');
    }
  }, [filteredExpenses]);

  // Filter expenses based on search, filter, and date
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch =
      searchQuery === '' ||
      expense.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'maintenance' &&
        expense.category === 'maintenance') ||
      (selectedFilter === 'utilities' && expense.category === 'utilities') ||
      (selectedFilter === 'paid' && expense.status === 'paid') ||
      (selectedFilter === 'pending' && expense.status === 'pending');

    const matchesDate =
      (!startDate || new Date(expense.date) >= startDate) &&
      (!endDate || new Date(expense.date) <= endDate);

    return matchesSearch && matchesFilter && matchesDate;
  });

  // Calculate totals
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const pendingExpenses = expenses
    .filter(expense => expense.status === 'pending')
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Loading state
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
        <StandardHeader navigation={navigation} title="Expense Tracking" />
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons
            name="receipt"
            size={64}
            color={isDark ? colors.light_gray : colors.secondary}
          />
          <StandardText
            style={[styles.loadingText, { color: textPrimary }]}
            fontWeight="medium"
          >
            Loading expenses...
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
          backgroundColor: colors.background,
        },
      ]}
    >
      <StandardHeader navigation={navigation} title="Expense Tracking" />

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
            color={colors.error}
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
          Download expense records with custom date range
        </StandardText>

        <Gap size="md" />

        {/* Date Range Selection */}
        <View style={styles.dateRangeContainer}>
          <View style={styles.dateButtonContainer}>
            <Button
              mode="outlined"
              onPress={() => setShowStartDatePicker(true)}
              style={[styles.dateButton, { borderColor: colors.error }]}
              labelStyle={{ color: colors.error }}
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
              style={[styles.dateButton, { borderColor: colors.error }]}
              labelStyle={{ color: colors.error }}
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
            labelStyle={{ color: colors.error }}
          >
            Clear Filters
          </Button>

          <Button
            mode="contained"
            onPress={downloadReport}
            style={[styles.downloadButton, { backgroundColor: colors.error }]}
            disabled={filteredExpenses.length === 0}
            icon="download"
          >
            Download CSV ({filteredExpenses.length})
          </Button>
        </View>
      </StandardCard>

      <Gap size="lg" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <Card
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="cash-minus"
                size={24}
                color={colors.error}
              />
              <StandardText
                style={[styles.cardTitle, { color: textPrimary }]}
                fontWeight="bold"
                size="md"
              >
                Total Expenses
              </StandardText>
            </View>
            <StandardText
              style={[styles.cardValue, { color: colors.error }]}
              fontWeight="bold"
              size="xl"
            >
              ₹{totalExpenses.toLocaleString()}
            </StandardText>
          </Card>

          <Card
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={24}
                color={colors.warning}
              />
              <StandardText
                style={[styles.cardTitle, { color: textPrimary }]}
                fontWeight="bold"
                size="md"
              >
                Pending
              </StandardText>
            </View>
            <StandardText
              style={[styles.cardValue, { color: colors.warning }]}
              fontWeight="bold"
              size="xl"
            >
              ₹{pendingExpenses.toLocaleString()}
            </StandardText>
          </Card>
        </View>

        <Gap size="lg" />

        {/* Search and Filter */}
        <View style={styles.controlsContainer}>
          <TextInput
            placeholder="Search expenses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
            contentStyle={styles.searchInput}
            left={
              <TextInput.Icon icon="magnify" color={colors.textSecondary} />
            }
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
          >
            {[
              { key: 'all', label: 'All', icon: 'filter-variant' },
              { key: 'maintenance', label: 'Maintenance', icon: 'wrench' },
              { key: 'utilities', label: 'Utilities', icon: 'flash' },
              { key: 'paid', label: 'Paid', icon: 'check-circle' },
              { key: 'pending', label: 'Pending', icon: 'clock-outline' },
            ].map(filter => (
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
                  // eslint-disable-line react/no-unstable-nested-components
                  <MaterialCommunityIcons
                    name={filter.icon}
                    size={18}
                    color={selectedFilter === filter.key ? '#fff' : '#000'}
                  />
                )}
              >
                {filter.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <Gap size="md" />

        {/* Expenses List */}
        <StandardText
          fontWeight="bold"
          size="xl"
          style={[styles.sectionTitle, { color: textPrimary }]}
        >
          Expense History ({filteredExpenses.length})
        </StandardText>

        <Gap size="md" />

        {filteredExpenses.length > 0 ? (
          filteredExpenses.map(expense => (
            <StandardCard
              key={expense.id}
              style={[styles.expenseCard, { backgroundColor: cardBackground }]}
            >
              <View style={styles.expenseHeader}>
                <View style={styles.expenseInfo}>
                  <StandardText
                    fontWeight="bold"
                    size="lg"
                    style={[styles.expenseTitle, { color: textPrimary }]}
                  >
                    {expense.title}
                  </StandardText>
                  <StandardText
                    style={[styles.expenseDate, { color: textSecondary }]}
                  >
                    {new Date(expense.date).toLocaleDateString()}
                  </StandardText>
                </View>
                <View style={styles.expenseAmount}>
                  <StandardText
                    fontWeight="bold"
                    size="lg"
                    style={[styles.amount, { color: colors.error }]}
                  >
                    -₹{expense.amount.toLocaleString()}
                  </StandardText>
                  <Chip
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor:
                          expense.status === 'paid'
                            ? colors.success + '20'
                            : colors.warning + '20',
                      },
                    ]}
                    textStyle={[
                      styles.statusChipText,
                      {
                        color:
                          expense.status === 'paid'
                            ? colors.success
                            : colors.warning,
                      },
                    ]}
                  >
                    {expense.status === 'paid' ? 'Paid' : 'Pending'}
                  </Chip>
                </View>
              </View>

              <Gap size="sm" />

              <StandardText
                style={[styles.expenseDescription, { color: textSecondary }]}
              >
                {expense.description}
              </StandardText>

              <Gap size="sm" />

              <View style={styles.expenseFooter}>
                <Chip
                  style={[
                    styles.categoryChip,
                    { backgroundColor: colors.secondary + '20' },
                  ]}
                  textStyle={[
                    styles.categoryChipText,
                    { color: colors.secondary },
                  ]}
                >
                  {expense.category}
                </Chip>
              </View>
            </StandardCard>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="receipt"
              size={64}
              color={isDark ? colors.light_gray : colors.secondary}
            />
            <StandardText
              style={[styles.emptyText, { color: textPrimary }]}
              fontWeight="medium"
            >
              No expenses found
            </StandardText>
            <StandardText
              style={[styles.emptySubtext, { color: textSecondary }]}
            >
              {searchQuery || selectedFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Expense records will appear here once expenses are added'}
            </StandardText>
          </View>
        )}

        <Gap size="xxl" />
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
              selectedItemColor={colors.error}
              calendarTextStyle={{ color: textPrimary }}
              headerTextStyle={{ color: textPrimary }}
              weekDaysTextStyle={{ color: textSecondary }}
              headerButtonColor={colors.error}
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
              selectedItemColor={colors.error}
              calendarTextStyle={{ color: textPrimary }}
              headerTextStyle={{ color: textPrimary }}
              weekDaysTextStyle={{ color: textSecondary }}
              headerButtonColor={colors.error}
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
  },
  searchBar: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 25,
    elevation: 2,
    fontFamily: 'Metropolis-Medium',
  },
  filterContainer: {
    marginBottom: 8,
  },
  chip: { marginRight: 10, borderRadius: 20, elevation: 1 },
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
  expenseCard: {
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTitle: {
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 12,
  },
  expenseAmount: {
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
  expenseDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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
  downloadCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  downloadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  downloadTitle: {
    marginLeft: 12,
  },
  downloadSubtitle: {
    fontSize: 14,
    lineHeight: 20,
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
  dateButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  downloadActions: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    borderColor: colors.error,
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
});

export default ExpenseTracking;
