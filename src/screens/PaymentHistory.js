import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { TextInput, Chip, Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import StandardCard from '../components/StandardCard/StandardCard';
import AnimatedLoader from '../components/AnimatedLoader/AnimatedLoader';
import BeautifulDatePicker from '../components/BeautifulDatePicker';
import { CredentialsContext } from '../context/CredentialsContext';
import colors from '../theme/colors';
import { FONT_WEIGHT, RADIUS, SHADOW } from '../theme/layout';
import Gap from '../components/Gap/Gap';
import PropertySelector from '../components/PropertySelector/PropertySelector';
import PaymentDetailModal from '../components/PaymentDetailModal/PaymentDetailModal';

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
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentDetail, setShowPaymentDetail] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  const isDark = mode === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  const filterOptions = [
    { key: 'all', label: 'All Payments', icon: 'cash-multiple' },
    { key: 'rent', label: 'Rent', icon: 'home' },
    { key: 'deposit', label: 'Security Deposit', icon: 'shield-check' },
    { key: 'maintenance', label: 'Maintenance', icon: 'wrench' },
    { key: 'utility', label: 'Utilities', icon: 'flash' },
    { key: 'other', label: 'Other', icon: 'dots-horizontal' },
  ];

  const totalReceived = payments
    .filter(payment => payment.status === 'received')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pendingAmount = payments
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const overdueAmount = payments
    .filter(payment => payment.status === 'overdue')
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

  useEffect(() => {
    let filtered = payments;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(
        payment => payment.category === selectedFilter,
      );
    }

    if (startDate) {
      filtered = filtered.filter(
        payment => new Date(payment.date) >= new Date(startDate),
      );
    }
    if (endDate) {
      filtered = filtered.filter(
        payment => new Date(payment.date) <= new Date(endDate),
      );
    }

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
            .includes(searchQuery.toLowerCase()) ||
          payment.receiptNumber
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'tenant':
          comparison = a.tenantName.localeCompare(b.tenantName);
          break;
        default:
          comparison = new Date(a.date) - new Date(b.date);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredPayments(filtered);
  }, [
    payments,
    selectedFilter,
    searchQuery,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  ]);

  const getStatusColor = status => {
    switch (status) {
      case 'received':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'overdue':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const fetchPayments = useCallback(async () => {
    if (!credentials?.accessToken) return;

    try {
      setLoading(true);

      const mockPayments = [
        {
          id: 1,
          tenantName: 'John Doe',
          tenantPhone: '+91 98765 43210',
          propertyName: 'Sunset Apartments - Room 101',
          amount: 15000,
          category: 'rent',
          date: '2025-01-15',
          dueDate: '2025-01-10',
          description: 'Monthly rent payment for January 2025',
          status: 'received',
          paymentMethod: 'UPI',
          transactionId: 'UPI2025011512345',
          receiptNumber: 'RCP-2025-001',
        },
        {
          id: 2,
          tenantName: 'Jane Smith',
          tenantPhone: '+91 98765 43211',
          propertyName: 'Sunset Apartments - Room 102',
          amount: 20000,
          category: 'deposit',
          date: '2025-01-10',
          dueDate: '2025-01-10',
          description: 'Security deposit - New tenant onboarding',
          status: 'received',
          paymentMethod: 'Bank Transfer',
          transactionId: 'NEFT202501101234567',
          receiptNumber: 'RCP-2025-002',
        },
        {
          id: 3,
          tenantName: 'Mike Johnson',
          tenantPhone: '+91 98765 43212',
          propertyName: 'Sunset Apartments - Room 103',
          amount: 12000,
          category: 'rent',
          date: '2025-01-25',
          dueDate: '2025-01-10',
          description: 'Monthly rent payment - Delayed',
          status: 'pending',
          paymentMethod: 'Cash',
          receiptNumber: 'RCP-2025-003',
        },
        {
          id: 4,
          tenantName: 'Sarah Wilson',
          tenantPhone: '+91 98765 43213',
          propertyName: 'Sunset Apartments - Room 104',
          amount: 5000,
          category: 'maintenance',
          date: '2025-01-05',
          dueDate: '2025-01-05',
          description: 'AC repair and servicing charges',
          status: 'received',
          paymentMethod: 'UPI',
          transactionId: 'UPI2025010512345',
          receiptNumber: 'RCP-2025-004',
        },
        {
          id: 5,
          tenantName: 'David Brown',
          tenantPhone: '+91 98765 43214',
          propertyName: 'Sunset Apartments - Room 105',
          amount: 18000,
          category: 'rent',
          date: '2025-01-01',
          dueDate: '2024-12-10',
          description: 'Monthly rent payment - January 2025',
          status: 'received',
          paymentMethod: 'Bank Transfer',
          transactionId: 'IMPS202501011234567',
          receiptNumber: 'RCP-2025-005',
        },
        {
          id: 6,
          tenantName: 'Emily Davis',
          tenantPhone: '+91 98765 43215',
          propertyName: 'Sunset Apartments - Room 106',
          amount: 15000,
          category: 'rent',
          date: null,
          dueDate: '2024-12-20',
          description: 'December rent - Overdue',
          status: 'overdue',
          paymentMethod: 'Pending',
          receiptNumber: 'RCP-2025-006',
        },
      ];

      setTimeout(() => {
        setPayments(mockPayments);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching payments:', error);
      Alert.alert('Error', 'Failed to fetch payments. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  }, [credentials]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPayments();
  }, [fetchPayments]);

  const downloadReport = useCallback(async () => {
    try {
      if (filteredPayments.length === 0) {
        Alert.alert('No Data', 'There are no payments to export.');
        return;
      }

      const headers = [
        'Receipt No',
        'Tenant Name',
        'Property',
        'Amount',
        'Category',
        'Payment Method',
        'Transaction ID',
        'Status',
        'Due Date',
        'Payment Date',
        'Description',
      ];

      const csvContent = [
        headers.join(','),
        ...filteredPayments.map(payment =>
          [
            `"${payment.receiptNumber}"`,
            `"${payment.tenantName}"`,
            `"${payment.propertyName}"`,
            payment.amount,
            payment.category,
            payment.paymentMethod,
            `"${payment.transactionId || 'N/A'}"`,
            payment.status,
            payment.dueDate,
            payment.date || 'Not Paid',
            `"${payment.description || ''}"`,
          ].join(','),
        ),
        '',
        'Summary',
        `Total Received,${totalReceived}`,
        `Pending Amount,${pendingAmount}`,
        `Overdue Amount,${overdueAmount}`,
        `This Month Received,${thisMonthReceived}`,
      ].join('\n');

      const date = new Date().toISOString().split('T')[0];
      const filename = `payment_history_${date}.csv`;
      const filePath = `${RNFS.CachesDirectoryPath}/${filename}`;

      await RNFS.writeFile(filePath, csvContent, 'utf8');

      await Share.open({
        title: 'Payment History Report',
        message: 'Payment History Report',
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
    filteredPayments,
    totalReceived,
    pendingAmount,
    overdueAmount,
    thisMonthReceived,
  ]);

  const handlePaymentClick = payment => {
    setSelectedPayment(payment);
    setShowPaymentDetail(true);
  };

  const toggleSort = newSortBy => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

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
        <AnimatedLoader
          message="Loading payment history..."
          icon="history"
          fullScreen={false}
        />
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
            <StandardText
              size="xs"
              style={[styles.cardSubtext, { color: textSecondary }]}
            >
              All time
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
              ₹{pendingAmount.toLocaleString()}
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
              ₹{overdueAmount.toLocaleString()}
            </StandardText>
            <StandardText
              size="xs"
              style={[styles.cardSubtext, { color: textSecondary }]}
            >
              Requires attention
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
                color={colors.primary}
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
                  Download detailed payment history
                </StandardText>
              </View>
            </View>
          </View>

          <Gap size="md" />

          <View style={styles.dateRangeContainer}>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: colors.primary }]}
              onPress={() => setShowStartDatePicker(true)}
            >
              <MaterialCommunityIcons
                name="calendar-start"
                size={20}
                color={colors.primary}
              />
              <StandardText
                size="sm"
                style={[
                  styles.dateButtonText,
                  { color: startDate ? textPrimary : textSecondary },
                ]}
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
              style={[styles.dateButton, { borderColor: colors.primary }]}
              onPress={() => setShowEndDatePicker(true)}
            >
              <MaterialCommunityIcons
                name="calendar-end"
                size={20}
                color={colors.primary}
              />
              <StandardText
                size="sm"
                style={[
                  styles.dateButtonText,
                  { color: endDate ? textPrimary : textSecondary },
                ]}
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
              style={[styles.clearButton, { borderColor: colors.primary }]}
              labelStyle={{ color: colors.primary }}
              icon="filter-remove"
            >
              Clear
            </Button>

            <Button
              mode="contained"
              onPress={downloadReport}
              style={[
                styles.downloadButton,
                { backgroundColor: colors.primary },
              ]}
              labelStyle={{ color: colors.white }}
              disabled={filteredPayments.length === 0}
              icon="download"
            >
              Export ({filteredPayments.length})
            </Button>
          </View>
        </StandardCard>

        <Gap size="lg" />

        {/* Search Bar */}
        <TextInput
          placeholder="Search by tenant, property, or receipt..."
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
                    backgroundColor: colors.primary,
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
                sortBy === 'date' && { backgroundColor: colors.primary + '20' },
              ]}
              onPress={() => toggleSort('date')}
            >
              <StandardText
                size="sm"
                style={{
                  color: sortBy === 'date' ? colors.primary : textSecondary,
                }}
              >
                Date
              </StandardText>
              {sortBy === 'date' && (
                <MaterialCommunityIcons
                  name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                  size={16}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sortButton,
                sortBy === 'amount' && {
                  backgroundColor: colors.primary + '20',
                },
              ]}
              onPress={() => toggleSort('amount')}
            >
              <StandardText
                size="sm"
                style={{
                  color: sortBy === 'amount' ? colors.primary : textSecondary,
                }}
              >
                Amount
              </StandardText>
              {sortBy === 'amount' && (
                <MaterialCommunityIcons
                  name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                  size={16}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sortButton,
                sortBy === 'tenant' && {
                  backgroundColor: colors.primary + '20',
                },
              ]}
              onPress={() => toggleSort('tenant')}
            >
              <StandardText
                size="sm"
                style={{
                  color: sortBy === 'tenant' ? colors.primary : textSecondary,
                }}
              >
                Tenant
              </StandardText>
              {sortBy === 'tenant' && (
                <MaterialCommunityIcons
                  name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                  size={16}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Gap size="lg" />

        {/* Payments List Header */}
        <View style={styles.listHeader}>
          <StandardText
            fontWeight="bold"
            size="lg"
            style={{ color: textPrimary }}
          >
            Payment Records
          </StandardText>
          <View style={styles.countBadge}>
            <StandardText
              fontWeight="bold"
              size="sm"
              style={{ color: colors.primary }}
            >
              {filteredPayments.length}
            </StandardText>
          </View>
        </View>

        <Gap size="md" />

        {/* Payments List */}
        {filteredPayments.length > 0 ? (
          filteredPayments.map(payment => (
            <TouchableOpacity
              key={payment.id}
              onPress={() => handlePaymentClick(payment)}
              activeOpacity={0.7}
            >
              <StandardCard
                style={[
                  styles.paymentCard,
                  { backgroundColor: cardBackground },
                ]}
              >
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentInfo}>
                    <StandardText
                      fontWeight="bold"
                      size="lg"
                      style={{ color: textPrimary }}
                    >
                      {payment.tenantName}
                    </StandardText>
                    <StandardText
                      size="sm"
                      style={{ color: textSecondary, marginTop: 2 }}
                    >
                      {payment.propertyName}
                    </StandardText>
                    <View style={styles.paymentMetaRow}>
                      <View style={styles.paymentMeta}>
                        <MaterialCommunityIcons
                          name="receipt"
                          size={12}
                          color={textSecondary}
                        />
                        <StandardText
                          size="xs"
                          style={{ color: textSecondary, marginLeft: 4 }}
                        >
                          {payment.receiptNumber}
                        </StandardText>
                      </View>
                      <View style={styles.paymentMeta}>
                        <MaterialCommunityIcons
                          name="calendar"
                          size={12}
                          color={textSecondary}
                        />
                        <StandardText
                          size="xs"
                          style={{ color: textSecondary, marginLeft: 4 }}
                        >
                          {payment.date
                            ? new Date(payment.date).toLocaleDateString(
                                'en-IN',
                                {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                },
                              )
                            : 'Not Paid'}
                        </StandardText>
                      </View>
                    </View>
                  </View>

                  <View style={styles.paymentAmount}>
                    <StandardText
                      fontWeight="bold"
                      size="xl"
                      style={{
                        color:
                          payment.status === 'received'
                            ? colors.success
                            : payment.status === 'overdue'
                            ? colors.error
                            : colors.warning,
                      }}
                    >
                      ₹{payment.amount.toLocaleString()}
                    </StandardText>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            getStatusColor(payment.status) + '20',
                        },
                      ]}
                    >
                      <StandardText
                        fontWeight="bold"
                        size="sm"
                        style={{ color: getStatusColor(payment.status) }}
                      >
                        {payment.status.toUpperCase()}
                      </StandardText>
                    </View>
                  </View>
                </View>

                <Gap size="sm" />

                <View style={styles.paymentFooter}>
                  <View
                    style={[
                      styles.categoryChip,
                      { backgroundColor: colors.primary + '15' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        filterOptions.find(f => f.key === payment.category)
                          ?.icon || 'cash'
                      }
                      size={14}
                      color={colors.primary}
                    />
                    <StandardText
                      fontWeight="semibold"
                      size="sm"
                      style={{ color: colors.primary }}
                    >
                      {payment.category.charAt(0).toUpperCase() +
                        payment.category.slice(1)}
                    </StandardText>
                  </View>

                  <View
                    style={[
                      styles.methodChip,
                      { backgroundColor: colors.primary + '15' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        payment.paymentMethod === 'UPI'
                          ? 'bank-transfer'
                          : payment.paymentMethod === 'Cash'
                          ? 'cash'
                          : 'bank'
                      }
                      size={14}
                      color={colors.primary}
                    />
                    <StandardText
                      fontWeight="semibold"
                      size="sm"
                      style={{ color: colors.primary }}
                    >
                      {payment.paymentMethod}
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
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="cash-remove"
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
                ? 'No payments found'
                : 'No payment records yet'}
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
                : 'Payment transactions will appear here once tenants make payments'}
            </StandardText>
          </View>
        )}

        <Gap size="xxl" />
      </ScrollView>

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

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <PaymentDetailModal
          visible={showPaymentDetail}
          payment={selectedPayment}
          onDismiss={() => {
            setShowPaymentDetail(false);
            setSelectedPayment(null);
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
    borderWidth: 1,
    borderColor: 'rgba(238, 123, 17, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
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
    borderWidth: 1,
    borderColor: 'rgba(238, 123, 17, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
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
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dateButtonText: {
    fontSize: 13,
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
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  paymentCard: {
    marginVertical: 6,
    padding: 16,
    borderRadius: RADIUS.medium,
    ...SHADOW.medium,
    shadowColor: colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(238, 123, 17, 0.08)',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentMetaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  paymentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentAmount: {
    alignItems: 'flex-end',
    minWidth: 120,
  },
  statusChip: {
    height: 28,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: 14,
  },
  paymentFooter: {
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
  methodChip: {
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
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 8,
  },
});

export default PaymentHistory;
