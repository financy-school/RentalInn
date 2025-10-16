import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Card, TextInput, Chip, Button, FAB } from 'react-native-paper';
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
import { RADIUS, SHADOW } from '../theme/layout';
import Gap from '../components/Gap/Gap';
import BeautifulDatePicker from '../components/BeautifulDatePicker';
import PropertySelector from '../components/PropertySelector/PropertySelector';
import ExpenseDetailModal from '../components/ExpenseDetailModal/ExpenseDetailModal';
import * as NetworkUtils from '../services/NetworkUtils';
import helpers from '../navigation/helpers';

const { ErrorHelper } = helpers;

// Constants
const FILTER_OPTIONS = [
  { key: 'all', label: 'All', icon: 'filter-variant' },
  { key: 'maintenance_repairs', label: 'Maintenance', icon: 'wrench' },
  { key: 'utilities', label: 'Utilities', icon: 'flash' },
  { key: 'repair', label: 'Repairs', icon: 'hammer-wrench' },
  { key: 'cleaning', label: 'Cleaning', icon: 'broom' },
  { key: 'other', label: 'Other', icon: 'dots-horizontal' },
];

const SORT_OPTIONS = {
  DATE: 'date',
  AMOUNT: 'amount',
};

const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
};

// Helper functions
const getStatusColor = status => {
  switch (status) {
    case 'paid':
      return colors.success;
    case 'overdue':
      return colors.error;
    case 'pending':
    default:
      return colors.warning;
  }
};

const formatCategory = category => {
  if (!category) return 'Uncategorized';
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const transformCategoryFromAPI = category => {
  if (!category?.name) return 'other';
  return category.name
    .toLowerCase()
    .replace(/\s+&\s+/g, '_')
    .replace(/\s+/g, '_');
};

const formatDate = (date, options = {}) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
};

const isCurrentMonth = date => {
  if (!date) return false;
  const expenseDate = new Date(date);
  const now = new Date();
  return (
    expenseDate.getMonth() === now.getMonth() &&
    expenseDate.getFullYear() === now.getFullYear()
  );
};

// Memoized Expense Card Component for performance
const ExpenseCard = React.memo(
  ({ expense, onPress, filterOptions, isDark }) => {
    const textPrimary = isDark ? colors.white : colors.textPrimary;
    const textSecondary = isDark ? colors.light_gray : colors.textSecondary;
    const cardBackground = isDark ? colors.backgroundDark : colors.white;

    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <StandardCard
          style={[styles.expenseCard, { backgroundColor: cardBackground }]}
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
                      ? formatDate(expense.date)
                      : `Due: ${formatDate(expense.dueDate, {
                          year: undefined,
                        })}`}
                  </StandardText>
                </View>
              </View>
            </View>

            <View style={styles.expenseAmount}>
              <StandardText
                fontWeight="bold"
                size="xl"
                style={{ color: getStatusColor(expense.status) }}
              >
                -₹{expense.amount.toLocaleString()}
              </StandardText>
              <View
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(expense.status) + '20' },
                ]}
              >
                <StandardText
                  fontWeight="bold"
                  size="sm"
                  style={{ color: getStatusColor(expense.status) }}
                >
                  {expense.status.charAt(0).toUpperCase() +
                    expense.status.slice(1)}
                </StandardText>
              </View>
            </View>
          </View>

          <Gap size="sm" />

          <View style={styles.expenseFooter}>
            <View
              style={[
                styles.categoryChip,
                { backgroundColor: colors.primary + '15' },
              ]}
            >
              <MaterialCommunityIcons
                name={
                  (expense.category &&
                    filterOptions.find(f => f.key === expense.category)
                      ?.icon) ||
                  'tag'
                }
                size={14}
                color={colors.primary}
              />
              <StandardText
                fontWeight="semibold"
                size="sm"
                style={{ color: colors.primary }}
              >
                {formatCategory(expense.category)}
              </StandardText>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={textSecondary}
            />
          </View>
        </StandardCard>
      </TouchableOpacity>
    );
  },
);

ExpenseCard.displayName = 'ExpenseCard';

const ExpenseTracking = ({ navigation }) => {
  const { credentials } = useContext(CredentialsContext);
  const { theme: mode } = useContext(ThemeContext);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showExpenseDetail, setShowExpenseDetail] = useState(false);
  const [sort_by, setSortBy] = useState(SORT_OPTIONS.DATE);
  const [sort_order, setSortOrder] = useState(SORT_ORDER.DESC);

  // Theme variables
  const isDark = mode === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  // Fetch expense data
  const fetchExpenses = useCallback(async () => {
    if (!credentials?.accessToken) {
      console.warn('No access token available for fetching expenses');
      return;
    }

    try {
      setLoading(true);

      // Build query parameters
      const queryParams = {
        sort_by: sort_by === 'date' ? 'date' : sort_by,
        sort_order: sort_order,
      };

      // Add property filter if not 'all'
      if (
        credentials?.selectedProperty &&
        credentials?.selectedProperty !== 'all'
      ) {
        queryParams.property_id = credentials?.selectedProperty;
      }

      // Add search query if present
      if (searchQuery.trim()) {
        queryParams.search = searchQuery.trim();
      }

      // Add category filter if not 'all'
      if (selectedFilter !== 'all') {
        queryParams.category_id = selectedFilter;
      }

      // Add date range if provided
      if (startDate) {
        queryParams.start_date = startDate;
      }
      if (endDate) {
        queryParams.end_date = endDate;
      }

      // Fetch expenses from API
      const response = await NetworkUtils.getExpenses(
        credentials.accessToken,
        queryParams,
      );

      if (response.success && response.data) {
        // Transform API response to match UI expectations
        const transformedExpenses = (response.data || []).map(expense => ({
          id: expense.expense_id,
          title: expense.title,
          amount: parseFloat(expense.amount || expense.outstanding_amount || 0),
          vendor: expense.vendor_name || 'Unknown Vendor',
          category: transformCategoryFromAPI(expense.category),
          status: expense.status?.toLowerCase() || 'pending',
          invoiceNumber: expense.invoice_number,
          date: expense.payment_date || expense.expense_date,
          dueDate: expense.due_date,
          paymentMethod: expense.payment_method || 'N/A',
          propertyName: expense.property?.name || 'N/A',
          description: expense.description || '',
          attachments: expense.attachments,
          receiptUrl: expense.receipt_url,
          invoiceUrl: expense.invoice_url,
          notes: expense.notes,
        }));

        setExpenses(transformedExpenses);
      } else {
        // Handle error case
        ErrorHelper.showToast(
          response.error || 'Failed to fetch expenses',
          'error',
        );
        setExpenses([]);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      ErrorHelper.logError(error, 'FETCH_EXPENSES');
      ErrorHelper.showToast('Failed to load expenses', 'error');
      setExpenses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    credentials,
    searchQuery,
    selectedFilter,
    startDate,
    endDate,
    sort_by,
    sort_order,
  ]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchExpenses();
  }, [fetchExpenses]);

  // Update filtered expenses when expenses change
  useEffect(() => {
    setFilteredExpenses(expenses);
  }, [expenses]);

  // Calculate totals with useMemo for performance optimization
  const expenseMetrics = useMemo(() => {
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
    const thisMonthExpenses = expenses
      .filter(expense => isCurrentMonth(expense.date || expense.dueDate))
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      totalExpenses,
      paidExpenses,
      pendingExpenses,
      overdueExpenses,
      thisMonthExpenses,
    };
  }, [expenses]);

  const {
    totalExpenses,
    paidExpenses,
    pendingExpenses,
    overdueExpenses,
    thisMonthExpenses,
  } = expenseMetrics;

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      selectedFilter !== 'all' ||
      startDate ||
      endDate
    );
  }, [searchQuery, selectedFilter, startDate, endDate]);

  // Download expense report
  const downloadReport = useCallback(async () => {
    if (filteredExpenses.length === 0) {
      ErrorHelper.showToast('There are no expenses to export.', 'warning');
      return;
    }

    try {
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
            `"${expense.invoiceNumber || ''}"`,
            `"${expense.title || ''}"`,
            `"${expense.vendor || ''}"`,
            `"${expense.propertyName || ''}"`,
            expense.amount || 0,
            `"${formatCategory(expense.category) || 'N/A'}"`,
            `"${
              expense.status
                ? expense.status.charAt(0).toUpperCase() +
                  expense.status.slice(1)
                : 'N/A'
            }"`,
            expense.paymentMethod || 'N/A',
            expense.dueDate || 'N/A',
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

      try {
        await RNFS.unlink(filePath);
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file:', cleanupError);
      }
    } catch (error) {
      if (error?.message !== 'User did not share') {
        console.error('Error downloading report:', error);
        ErrorHelper.logError(error, 'DOWNLOAD_REPORT');
        ErrorHelper.showToast(
          'Failed to download the report. Please try again.',
          'error',
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
  const handleExpenseClick = useCallback(expense => {
    setSelectedExpense(expense);
    setShowExpenseDetail(true);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    setSearchQuery('');
    setSelectedFilter('all');
  }, []);

  // Toggle sort order
  const toggleSort = useCallback(
    newSortBy => {
      if (sort_by === newSortBy) {
        setSortOrder(prevOrder =>
          prevOrder === SORT_ORDER.ASC ? SORT_ORDER.DESC : SORT_ORDER.ASC,
        );
      } else {
        setSortBy(newSortBy);
        setSortOrder(SORT_ORDER.DESC);
      }
    },
    [sort_by],
  );

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
        style={styles.content}
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
              onPress={clearFilters}
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
            {FILTER_OPTIONS.map(filter => (
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
                sort_by === SORT_OPTIONS.DATE && {
                  backgroundColor: colors.error + '20',
                },
              ]}
              onPress={() => toggleSort(SORT_OPTIONS.DATE)}
            >
              <StandardText
                size="sm"
                style={{
                  color:
                    sort_by === SORT_OPTIONS.DATE
                      ? colors.error
                      : textSecondary,
                }}
              >
                Date
              </StandardText>
              {sort_by === SORT_OPTIONS.DATE && (
                <MaterialCommunityIcons
                  name={
                    sort_order === SORT_ORDER.ASC ? 'arrow-up' : 'arrow-down'
                  }
                  size={16}
                  color={colors.error}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sortButton,
                sort_by === SORT_OPTIONS.AMOUNT && {
                  backgroundColor: colors.error + '20',
                },
              ]}
              onPress={() => toggleSort(SORT_OPTIONS.AMOUNT)}
            >
              <StandardText
                size="sm"
                style={{
                  color:
                    sort_by === SORT_OPTIONS.AMOUNT
                      ? colors.error
                      : textSecondary,
                }}
              >
                Amount
              </StandardText>
              {sort_by === SORT_OPTIONS.AMOUNT && (
                <MaterialCommunityIcons
                  name={
                    sort_order === SORT_ORDER.ASC ? 'arrow-up' : 'arrow-down'
                  }
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
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onPress={() => handleExpenseClick(expense)}
              filterOptions={FILTER_OPTIONS}
              isDark={isDark}
            />
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
              {hasActiveFilters
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
              {hasActiveFilters
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
          navigation.navigate('AddExpense');
        }}
      />

      {/* Beautiful Date Pickers */}
      <BeautifulDatePicker
        visible={showStartDatePicker}
        onDismiss={() => setShowStartDatePicker(false)}
        onDateSelect={date => {
          setStartDate(date.toISOString().split('T')[0]);
        }}
        title="Select Start Date"
        initialDate={startDate}
      />

      <BeautifulDatePicker
        visible={showEndDatePicker}
        onDismiss={() => setShowEndDatePicker(false)}
        onDateSelect={date => {
          setEndDate(date.toISOString().split('T')[0]);
        }}
        title="Select End Date"
        initialDate={endDate}
      />

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
  content: {
    flex: 1,
    padding: 20,
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
    borderRadius: RADIUS.medium,
    ...SHADOW.medium,
    shadowColor: colors.error,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.08)',
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
    minWidth: 120,
  },
  statusChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
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
});

export default ExpenseTracking;
