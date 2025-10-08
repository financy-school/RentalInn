import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  TextInput,
  Chip,
  Button,
  Portal,
  Modal,
  FAB,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import StandardCard from '../components/StandardCard/StandardCard';
import AnimatedLoader from '../components/AnimatedLoader/AnimatedLoader';
import { CredentialsContext } from '../context/CredentialsContext';
import colors from '../theme/colors';
import { FONT_WEIGHT } from '../theme/layout';
import Gap from '../components/Gap/Gap';
import DatePicker from 'react-native-ui-datepicker';
import PropertySelector from '../components/PropertySelector/PropertySelector';
import ExpenseDetailModal from '../components/ExpenseDetailModal/ExpenseDetailModal';

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
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showExpenseDetail, setShowExpenseDetail] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // date, amount
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc

  // Theme variables
  const isDark = mode === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  const filterOptions = [
    { key: 'all', label: 'All', icon: 'filter-variant' },
    { key: 'maintenance', label: 'Maintenance', icon: 'wrench' },
    { key: 'utilities', label: 'Utilities', icon: 'flash' },
    { key: 'repair', label: 'Repairs', icon: 'hammer-wrench' },
    { key: 'cleaning', label: 'Cleaning', icon: 'broom' },
    { key: 'other', label: 'Other', icon: 'dots-horizontal' },
  ];

  const statusFilters = [
    { key: 'paid', label: 'Paid', icon: 'check-circle', color: colors.success },
    {
      key: 'pending',
      label: 'Pending',
      icon: 'clock-outline',
      color: colors.warning,
    },
    {
      key: 'overdue',
      label: 'Overdue',
      icon: 'alert-circle',
      color: colors.error,
    },
  ];

  // Fetch expense data
  const fetchExpenses = useCallback(async () => {
    if (!credentials?.accessToken) return;

    try {
      setLoading(true);

      // Mock data - replace with actual API call
      const mockExpenses = [
        {
          id: 1,
          title: 'Property Maintenance',
          vendor: 'ABC Maintenance Services',
          amount: 2500,
          category: 'maintenance',
          date: '2025-01-15',
          dueDate: '2025-01-10',
          description:
            'Monthly maintenance and general repairs for all properties',
          status: 'paid',
          paymentMethod: 'Bank Transfer',
          invoiceNumber: 'INV-2025-001',
          propertyName: 'Sunset Apartments',
        },
        {
          id: 2,
          title: 'Electricity Bill',
          vendor: 'Power Distribution Company',
          amount: 1800,
          category: 'utilities',
          date: '2025-01-10',
          dueDate: '2025-01-08',
          description: 'Monthly electricity consumption charges',
          status: 'paid',
          paymentMethod: 'Online Payment',
          invoiceNumber: 'ELEC-2025-001',
          propertyName: 'Sunset Apartments',
        },
        {
          id: 3,
          title: 'Water Supply',
          vendor: 'Municipal Water Board',
          amount: 1200,
          category: 'utilities',
          date: null,
          dueDate: '2025-01-20',
          description: 'Water supply and maintenance charges for January',
          status: 'pending',
          paymentMethod: 'Pending',
          invoiceNumber: 'WATER-2025-001',
          propertyName: 'Sunset Apartments',
        },
        {
          id: 4,
          title: 'Professional Cleaning',
          vendor: 'CleanPro Services',
          amount: 800,
          category: 'cleaning',
          date: '2025-01-05',
          dueDate: '2025-01-05',
          description: 'Deep cleaning service for common areas',
          status: 'paid',
          paymentMethod: 'Cash',
          invoiceNumber: 'CLN-2025-001',
          propertyName: 'Sunset Apartments',
        },
        {
          id: 5,
          title: 'Plumbing Repair',
          vendor: 'Quick Fix Plumbers',
          amount: 3500,
          category: 'repair',
          date: '2025-01-01',
          dueDate: '2025-01-01',
          description: 'Emergency plumbing repair for Room 103 - pipe leakage',
          status: 'paid',
          paymentMethod: 'UPI',
          invoiceNumber: 'PLB-2025-001',
          propertyName: 'Sunset Apartments - Room 103',
        },
        {
          id: 6,
          title: 'Internet Service',
          vendor: 'FiberNet ISP',
          amount: 1500,
          category: 'utilities',
          date: null,
          dueDate: '2024-12-25',
          description: 'High-speed internet connection - December bill',
          status: 'overdue',
          paymentMethod: 'Pending',
          invoiceNumber: 'NET-2024-012',
          propertyName: 'Sunset Apartments',
        },
      ];

      setTimeout(() => {
        setExpenses(mockExpenses);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      Alert.alert('Error', 'Failed to fetch expenses. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  }, [credentials]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchExpenses();
  }, [fetchExpenses]);

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter(expense => {
      const matchesSearch =
        searchQuery === '' ||
        expense.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        expense.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.invoiceNumber
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesFilter =
        selectedFilter === 'all' || expense.category === selectedFilter;

      const matchesDate =
        (!startDate ||
          (expense.date && new Date(expense.date) >= new Date(startDate))) &&
        (!endDate ||
          (expense.date && new Date(expense.date) <= new Date(endDate)));

      return matchesSearch && matchesFilter && matchesDate;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          const dateA = a.date ? new Date(a.date) : new Date(a.dueDate);
          const dateB = b.date ? new Date(b.date) : new Date(b.dueDate);
          comparison = dateA - dateB;
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        default:
          comparison =
            new Date(a.date || a.dueDate) - new Date(b.date || b.dueDate);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Calculate totals
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const paidExpenses = expenses
    .filter(expense => expense.status === 'paid')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const pendingExpenses = expenses
    .filter(expense => expense.status === 'pending')
    .reduce((sum, expense) => sum + expense.amount, 0);
  const overdueExpenses = expenses
    .filter(expense => expense.status === 'overdue')
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate this month expenses
  const thisMonthExpenses = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date || expense.dueDate);
      const now = new Date();
      return (
        expenseDate.getMonth() === now.getMonth() &&
        expenseDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  // Download expense report
  const downloadReport = useCallback(async () => {
    try {
      if (filteredExpenses.length === 0) {
        Alert.alert('No Data', 'There are no expenses to export.');
        return;
      }

      const headers = [
        'Invoice No',
        'Title',
        'Vendor',
        'Property',
        'Amount',
        'Category',
        'Status',
        'Payment Method',
        'Due Date',
        'Payment Date',
        'Description',
      ];

      const csvContent = [
        'Expense Tracking Report',
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        `Date Range: ${startDate || 'All'} to ${endDate || 'All'}`,
        '',
        'Expense Records',
        headers.join(','),
        ...filteredExpenses.map(expense =>
          [
            `"${expense.invoiceNumber}"`,
            `"${expense.title}"`,
            `"${expense.vendor}"`,
            `"${expense.propertyName}"`,
            expense.amount,
            expense.category,
            expense.status,
            expense.paymentMethod,
            expense.dueDate,
            expense.date || 'Not Paid',
            `"${expense.description || ''}"`,
          ].join(','),
        ),
        '',
        'Summary',
        `Total Expenses,${totalExpenses}`,
        `Paid Expenses,${paidExpenses}`,
        `Pending Expenses,${pendingExpenses}`,
        `Overdue Expenses,${overdueExpenses}`,
        `This Month,${thisMonthExpenses}`,
      ].join('\n');

      const date = new Date().toISOString().split('T')[0];
      const filename = `expense_report_${date}.csv`;
      const filePath = `${RNFS.CachesDirectoryPath}/${filename}`;

      await RNFS.writeFile(filePath, csvContent, 'utf8');

      await Share.open({
        title: 'Expense Report',
        message: 'Expense Report',
        urls: [`file://${filePath}`],
        filename: filename,
        type: 'text/csv',
      });
    } catch (error) {
      if (error.message !== 'User did not share') {
        console.error('Error downloading report:', error);
        Alert.alert(
          'Error',
          'Failed to download the report. Please try again.',
        );
      }
    }
  }, [
    filteredExpenses,
    totalExpenses,
    paidExpenses,
    pendingExpenses,
    overdueExpenses,
    thisMonthExpenses,
    startDate,
    endDate,
  ]);

  // Handle expense click
  const handleExpenseClick = expense => {
    setSelectedExpense(expense);
    setShowExpenseDetail(true);
  };

  // Toggle sort order
  const toggleSort = newSortBy => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StandardHeader
          navigation={navigation}
          title="Expense Tracking"
          subtitle="Monitor and manage expenses"
          showBackButton
        />
        <AnimatedLoader
          message="Loading expenses..."
          icon="receipt"
          fullScreen={false}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StandardHeader
        navigation={navigation}
        title="Expense Tracking"
        subtitle="Monitor and manage expenses"
        showBackButton
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <PropertySelector />

        <Gap size="lg" />

        {/* Summary Cards Row 1 */}
        <View style={styles.summaryContainer}>
          <StandardCard
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="cash-minus"
                size={24}
                color={colors.error}
              />
              <StandardText
                fontWeight="medium"
                size="sm"
                style={[styles.cardTitle, { color: textSecondary }]}
              >
                Total
              </StandardText>
            </View>
            <StandardText
              fontWeight="bold"
              size="xl"
              style={[styles.cardValue, { color: colors.error }]}
            >
              ₹{totalExpenses.toLocaleString()}
            </StandardText>
            <StandardText
              size="xs"
              style={[styles.cardSubtext, { color: textSecondary }]}
            >
              All expenses
            </StandardText>
          </StandardCard>

          <StandardCard
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="calendar-month"
                size={24}
                color={colors.warning}
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
              style={[styles.cardValue, { color: colors.warning }]}
            >
              ₹{thisMonthExpenses.toLocaleString()}
            </StandardText>
            <StandardText
              size="xs"
              style={[styles.cardSubtext, { color: textSecondary }]}
            >
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </StandardText>
          </StandardCard>
        </View>

        <Gap size="md" />

        {/* Summary Cards Row 2 */}
        <View style={styles.summaryContainer}>
          <StandardCard
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color={colors.success}
              />
              <StandardText
                fontWeight="medium"
                size="sm"
                style={[styles.cardTitle, { color: textSecondary }]}
              >
                Paid
              </StandardText>
            </View>
            <StandardText
              fontWeight="bold"
              size="xl"
              style={[styles.cardValue, { color: colors.success }]}
            >
              ₹{paidExpenses.toLocaleString()}
            </StandardText>
            <StandardText
              size="xs"
              style={[styles.cardSubtext, { color: textSecondary }]}
            >
              Completed
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
                Pending
              </StandardText>
            </View>
            <StandardText
              fontWeight="bold"
              size="xl"
              style={[styles.cardValue, { color: colors.warning }]}
            >
              ₹{pendingExpenses.toLocaleString()}
            </StandardText>
            <StandardText
              size="xs"
              style={[styles.cardSubtext, { color: textSecondary }]}
            >
              Awaiting payment
            </StandardText>
          </StandardCard>

          <StandardCard
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={24}
                color={colors.error}
              />
              <StandardText
                fontWeight="medium"
                size="sm"
                style={[styles.cardTitle, { color: textSecondary }]}
              >
                Overdue
              </StandardText>
            </View>
            <StandardText
              fontWeight="bold"
              size="xl"
              style={[styles.cardValue, { color: colors.error }]}
            >
              ₹{overdueExpenses.toLocaleString()}
            </StandardText>
            <StandardText
              size="xs"
              style={[styles.cardSubtext, { color: textSecondary }]}
            >
              Urgent
            </StandardText>
          </StandardCard>
        </View>

        <Gap size="lg" />

        {/* Download & Filter Section */}
        <StandardCard
          style={[styles.downloadCard, { backgroundColor: cardBackground }]}
        >
          <View style={styles.downloadHeader}>
            <View style={styles.downloadHeaderLeft}>
              <MaterialCommunityIcons
                name="file-download-outline"
                size={24}
                color={colors.error}
              />
              <View style={styles.downloadHeaderText}>
                <StandardText
                  fontWeight="bold"
                  size="lg"
                  style={{ color: textPrimary }}
                >
                  Export Report
                </StandardText>
                <StandardText size="sm" style={{ color: textSecondary }}>
                  Download expense records
                </StandardText>
              </View>
            </View>
          </View>

          <Gap size="md" />

          <View style={styles.dateRangeContainer}>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: colors.error }]}
              onPress={() => setShowStartDatePicker(true)}
            >
              <MaterialCommunityIcons
                name="calendar-start"
                size={20}
                color={colors.error}
              />
              <StandardText
                size="sm"
                style={{
                  color: startDate ? textPrimary : textSecondary,
                  marginLeft: 8,
                }}
              >
                {startDate || 'Start Date'}
              </StandardText>
            </TouchableOpacity>

            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color={textSecondary}
            />

            <TouchableOpacity
              style={[styles.dateButton, { borderColor: colors.error }]}
              onPress={() => setShowEndDatePicker(true)}
            >
              <MaterialCommunityIcons
                name="calendar-end"
                size={20}
                color={colors.error}
              />
              <StandardText
                size="sm"
                style={{
                  color: endDate ? textPrimary : textSecondary,
                  marginLeft: 8,
                }}
              >
                {endDate || 'End Date'}
              </StandardText>
            </TouchableOpacity>
          </View>

          <Gap size="md" />

          <View style={styles.downloadActions}>
            <Button
              mode="outlined"
              onPress={() => {
                setStartDate(null);
                setEndDate(null);
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              style={[styles.clearButton, { borderColor: colors.error }]}
              labelStyle={{ color: colors.error }}
              icon="filter-remove"
            >
              Clear
            </Button>

            <Button
              mode="contained"
              onPress={downloadReport}
              style={[styles.downloadButton, { backgroundColor: colors.error }]}
              disabled={filteredExpenses.length === 0}
              icon="download"
            >
              Export ({filteredExpenses.length})
            </Button>
          </View>
        </StandardCard>

        <Gap size="lg" />

        {/* Search Bar */}
        <TextInput
          placeholder="Search expenses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={[styles.searchBar, { backgroundColor: cardBackground }]}
          contentStyle={styles.searchInput}
          left={<TextInput.Icon icon="magnify" color={textSecondary} />}
          right={
            searchQuery ? (
              <TextInput.Icon
                icon="close"
                color={textSecondary}
                onPress={() => setSearchQuery('')}
              />
            ) : null
          }
        />

        <Gap size="md" />

        {/* Category Filters */}
        <View style={styles.filterSection}>
          <StandardText
            fontWeight="bold"
            size="sm"
            style={[styles.filterLabel, { color: textPrimary }]}
          >
            Category
          </StandardText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
          >
            {filterOptions.map(filter => (
              <Chip
                key={filter.key}
                selected={selectedFilter === filter.key}
                onPress={() => setSelectedFilter(filter.key)}
                style={[
                  styles.filterChip,
                  selectedFilter === filter.key && {
                    backgroundColor: colors.error,
                  },
                ]}
                textStyle={[
                  styles.filterChipText,
                  {
                    color:
                      selectedFilter === filter.key
                        ? colors.white
                        : textPrimary,
                  },
                ]}
                icon={() => (
                  <MaterialCommunityIcons
                    name={filter.icon}
                    size={16}
                    color={
                      selectedFilter === filter.key
                        ? colors.white
                        : textSecondary
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

        {/* Sort Options */}
        <View style={styles.sortContainer}>
          <StandardText
            fontWeight="bold"
            size="sm"
            style={[styles.filterLabel, { color: textPrimary }]}
          >
            Sort By
          </StandardText>
          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={[
                styles.sortButton,
                sortBy === 'date' && { backgroundColor: colors.error + '20' },
              ]}
              onPress={() => toggleSort('date')}
            >
              <StandardText
                size="sm"
                style={{
                  color: sortBy === 'date' ? colors.error : textSecondary,
                }}
              >
                Date
              </StandardText>
              {sortBy === 'date' && (
                <MaterialCommunityIcons
                  name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                  size={16}
                  color={colors.error}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sortButton,
                sortBy === 'amount' && { backgroundColor: colors.error + '20' },
              ]}
              onPress={() => toggleSort('amount')}
            >
              <StandardText
                size="sm"
                style={{
                  color: sortBy === 'amount' ? colors.error : textSecondary,
                }}
              >
                Amount
              </StandardText>
              {sortBy === 'amount' && (
                <MaterialCommunityIcons
                  name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                  size={16}
                  color={colors.error}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Gap size="lg" />

        {/* Expenses List Header */}
        <View style={styles.listHeader}>
          <StandardText
            fontWeight="bold"
            size="lg"
            style={{ color: textPrimary }}
          >
            Expense Records
          </StandardText>
          <View
            style={[
              styles.countBadge,
              { backgroundColor: colors.error + '20' },
            ]}
          >
            <StandardText
              fontWeight="bold"
              size="sm"
              style={{ color: colors.error }}
            >
              {filteredExpenses.length}
            </StandardText>
          </View>
        </View>

        <Gap size="md" />

        {/* Expenses List */}
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map(expense => (
            <TouchableOpacity
              key={expense.id}
              onPress={() => handleExpenseClick(expense)}
              activeOpacity={0.7}
            >
              <StandardCard
                style={[
                  styles.expenseCard,
                  { backgroundColor: cardBackground },
                ]}
              >
                <View style={styles.expenseHeader}>
                  <View style={styles.expenseInfo}>
                    <StandardText
                      fontWeight="bold"
                      size="lg"
                      style={{ color: textPrimary }}
                    >
                      {expense.title}
                    </StandardText>
                    <StandardText
                      size="sm"
                      style={{ color: textSecondary, marginTop: 2 }}
                    >
                      {expense.vendor}
                    </StandardText>
                    <View style={styles.expenseMetaRow}>
                      <View style={styles.expenseMeta}>
                        <MaterialCommunityIcons
                          name="file-document"
                          size={12}
                          color={textSecondary}
                        />
                        <StandardText
                          size="xs"
                          style={{ color: textSecondary, marginLeft: 4 }}
                        >
                          {expense.invoiceNumber}
                        </StandardText>
                      </View>
                      <View style={styles.expenseMeta}>
                        <MaterialCommunityIcons
                          name="calendar"
                          size={12}
                          color={textSecondary}
                        />
                        <StandardText
                          size="xs"
                          style={{ color: textSecondary, marginLeft: 4 }}
                        >
                          {expense.date
                            ? new Date(expense.date).toLocaleDateString(
                                'en-IN',
                                {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                },
                              )
                            : `Due: ${new Date(
                                expense.dueDate,
                              ).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })}`}
                        </StandardText>
                      </View>
                    </View>
                  </View>

                  <View style={styles.expenseAmount}>
                    <StandardText
                      fontWeight="bold"
                      size="xl"
                      style={{
                        color:
                          expense.status === 'paid'
                            ? colors.success
                            : expense.status === 'overdue'
                            ? colors.error
                            : colors.warning,
                      }}
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
                              : expense.status === 'overdue'
                              ? colors.error + '20'
                              : colors.warning + '20',
                        },
                      ]}
                      textStyle={[
                        styles.statusChipText,
                        {
                          color:
                            expense.status === 'paid'
                              ? colors.success
                              : expense.status === 'overdue'
                              ? colors.error
                              : colors.warning,
                        },
                      ]}
                    >
                      {expense.status.charAt(0).toUpperCase() +
                        expense.status.slice(1)}
                    </Chip>
                  </View>
                </View>

                <Gap size="sm" />

                <View style={styles.expenseFooter}>
                  <Chip
                    style={[
                      styles.categoryChip,
                      { backgroundColor: colors.secondary + '15' },
                    ]}
                    textStyle={[
                      styles.categoryChipText,
                      { color: colors.secondary },
                    ]}
                    icon={() => (
                      <MaterialCommunityIcons
                        name={
                          filterOptions.find(f => f.key === expense.category)
                            ?.icon || 'tag'
                        }
                        size={14}
                        color={colors.secondary}
                      />
                    )}
                  >
                    {expense.category.charAt(0).toUpperCase() +
                      expense.category.slice(1)}
                  </Chip>

                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={textSecondary}
                  />
                </View>
              </StandardCard>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="receipt-text-remove"
              size={64}
              color={textSecondary}
            />
            <Gap size="md" />
            <StandardText
              fontWeight="bold"
              size="lg"
              style={{ color: textPrimary, textAlign: 'center' }}
            >
              {searchQuery || selectedFilter !== 'all' || startDate || endDate
                ? 'No expenses found'
                : 'No expense records yet'}
            </StandardText>
            <Gap size="sm" />
            <StandardText
              size="sm"
              style={{
                color: textSecondary,
                textAlign: 'center',
                paddingHorizontal: 32,
              }}
            >
              {searchQuery || selectedFilter !== 'all' || startDate || endDate
                ? 'Try adjusting your search or filter criteria'
                : 'Expense records will appear here once expenses are added'}
            </StandardText>
          </View>
        )}

        <Gap size="xxl" />
      </ScrollView>

      {/* FAB for adding new expense */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: colors.error }]}
        color={colors.white}
        onPress={() => {
          Alert.alert(
            'Add Expense',
            'Add new expense functionality coming soon!',
          );
        }}
      />

      {/* Date Picker Modals */}
      <Portal>
        <Modal
          visible={showStartDatePicker}
          onDismiss={() => setShowStartDatePicker(false)}
          contentContainerStyle={styles.modalContainer}
        >
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
                style={{ color: textPrimary }}
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
        </Modal>

        <Modal
          visible={showEndDatePicker}
          onDismiss={() => setShowEndDatePicker(false)}
          contentContainerStyle={styles.modalContainer}
        >
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
                style={{ color: textPrimary }}
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
        </Modal>
      </Portal>

      {/* Expense Detail Modal */}
      {selectedExpense && (
        <ExpenseDetailModal
          visible={showExpenseDetail}
          expense={selectedExpense}
          onDismiss={() => {
            setShowExpenseDetail(false);
            setSelectedExpense(null);
          }}
          theme={mode}
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 18,
    borderRadius: 18,
    elevation: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(238, 123, 17, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 12,
  },
  cardValue: {
    fontSize: 18,
    marginTop: 4,
  },
  cardSubtext: {
    marginTop: 4,
    fontSize: 10,
  },
  downloadCard: {
    padding: 20,
    borderRadius: 18,
    elevation: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(238, 123, 17, 0.08)',
  },
  downloadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  downloadHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  downloadHeaderText: {
    flex: 1,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  downloadActions: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    borderWidth: 1,
  },
  downloadButton: {
    flex: 2,
  },
  searchBar: {
    borderRadius: 12,
    elevation: 2,
    fontFamily: 'Metropolis-Medium',
  },
  searchInput: {
    fontFamily: 'Metropolis-Medium',
  },
  filterSection: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: 'Metropolis-Medium',
  },
  sortContainer: {
    gap: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    gap: 4,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
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
  expenseMetaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  expenseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
  statusChip: {
    height: 24,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryChip: {
    height: 28,
    paddingHorizontal: 12,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    elevation: 8,
  },
  modalContainer: {
    padding: 20,
  },
  datePickerContainer: {
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
  closeButton: {
    padding: 8,
  },
});

export default ExpenseTracking;
