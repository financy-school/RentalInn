import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Card, Button, Portal, Modal, Chip } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import DatePicker from 'react-native-ui-datepicker';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import StandardCard from '../components/StandardCard/StandardCard';
import AnimatedLoader from '../components/AnimatedLoader/AnimatedLoader';
import { CredentialsContext } from '../context/CredentialsContext';
import { useProperty } from '../context/PropertyContext';
import colors from '../theme/colors';
import Gap from '../components/Gap/Gap';
import PropertySelector from '../components/PropertySelector/PropertySelector';

const { width } = Dimensions.get('window');

const RevenueOverview = ({ navigation }) => {
  const { credentials } = useContext(CredentialsContext);
  const { theme: mode } = useContext(ThemeContext);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    pendingPayments: 0,
    overduePayments: 0,
    averageMonthly: 0,
    totalProperties: 0,
    occupiedUnits: 0,
    monthlyTrend: [],
    categoryBreakdown: [],
    topTenants: [],
  });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // month, year, all

  // Theme variables
  const isDark = mode === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  // Fetch revenue data
  const fetchRevenueData = useCallback(async () => {
    if (!credentials?.accessToken) return;

    try {
      setLoading(true);

      // Mock data - replace with actual API call
      const mockData = {
        totalRevenue: 450000,
        monthlyRevenue: 75000,
        yearlyRevenue: 900000,
        pendingPayments: 25000,
        overduePayments: 12000,
        averageMonthly: 75000,
        totalProperties: 3,
        occupiedUnits: 24,
        monthlyTrend: [
          { month: 'Jul', amount: 68000, received: 65000, pending: 3000 },
          { month: 'Aug', amount: 72000, received: 70000, pending: 2000 },
          { month: 'Sep', amount: 70000, received: 68000, pending: 2000 },
          { month: 'Oct', amount: 75000, received: 72000, pending: 3000 },
          { month: 'Nov', amount: 78000, received: 75000, pending: 3000 },
          { month: 'Dec', amount: 80000, received: 75000, pending: 5000 },
        ],
        categoryBreakdown: [
          { category: 'Rent', amount: 360000, percentage: 80, count: 144 },
          { category: 'Deposit', amount: 60000, percentage: 13, count: 12 },
          { category: 'Maintenance', amount: 20000, percentage: 4, count: 24 },
          { category: 'Utilities', amount: 10000, percentage: 3, count: 18 },
        ],
        topTenants: [
          {
            name: 'John Doe',
            property: 'Apt 101',
            amount: 18000,
            payments: 12,
          },
          {
            name: 'Jane Smith',
            property: 'Apt 102',
            amount: 20000,
            payments: 10,
          },
          {
            name: 'Mike Johnson',
            property: 'Apt 103',
            amount: 15000,
            payments: 12,
          },
          {
            name: 'Sarah Wilson',
            property: 'Apt 104',
            amount: 18000,
            payments: 12,
          },
          {
            name: 'David Brown',
            property: 'Apt 105',
            amount: 16500,
            payments: 11,
          },
        ],
      };

      setTimeout(() => {
        setRevenueData(mockData);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      Alert.alert('Error', 'Failed to fetch revenue data. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  }, [credentials]);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRevenueData();
  }, [fetchRevenueData]);

  // Download revenue report
  const downloadReport = useCallback(async () => {
    try {
      const headers = ['Report Type', 'Value'];

      const summaryData = [
        ['Total Revenue', revenueData.totalRevenue],
        ['Monthly Revenue', revenueData.monthlyRevenue],
        ['Yearly Revenue', revenueData.yearlyRevenue],
        ['Pending Payments', revenueData.pendingPayments],
        ['Overdue Payments', revenueData.overduePayments],
        ['Average Monthly', revenueData.averageMonthly],
        ['Total Properties', revenueData.totalProperties],
        ['Occupied Units', revenueData.occupiedUnits],
      ];

      const csvContent = [
        'Revenue Overview Report',
        `Generated on: ${new Date().toLocaleDateString('en-IN')}`,
        `Date Range: ${startDate || 'All'} to ${endDate || 'All'}`,
        '',
        'Summary',
        headers.join(','),
        ...summaryData.map(row => row.join(',')),
        '',
        'Monthly Trend',
        'Month,Total Amount,Received,Pending',
        ...revenueData.monthlyTrend.map(
          trend =>
            `${trend.month},${trend.amount},${trend.received},${trend.pending}`,
        ),
        '',
        'Category Breakdown',
        'Category,Amount,Percentage,Count',
        ...revenueData.categoryBreakdown.map(
          cat =>
            `${cat.category},${cat.amount},${cat.percentage}%,${cat.count}`,
        ),
        '',
        'Top Tenants',
        'Name,Property,Total Amount,Payments',
        ...revenueData.topTenants.map(
          tenant =>
            `"${tenant.name}","${tenant.property}",${tenant.amount},${tenant.payments}`,
        ),
      ].join('\n');

      const date = new Date().toISOString().split('T')[0];
      const filename = `revenue_overview_${date}.csv`;
      const filePath = `${RNFS.CachesDirectoryPath}/${filename}`;

      await RNFS.writeFile(filePath, csvContent, 'utf8');

      await Share.open({
        title: 'Revenue Overview Report',
        message: 'Revenue Overview Report',
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
  }, [revenueData, startDate, endDate]);

  // Calculate growth percentage
  const calculateGrowth = () => {
    if (revenueData.monthlyTrend.length < 2) return 0;
    const current =
      revenueData.monthlyTrend[revenueData.monthlyTrend.length - 1].amount;
    const previous =
      revenueData.monthlyTrend[revenueData.monthlyTrend.length - 2].amount;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const growth = calculateGrowth();

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StandardHeader
          navigation={navigation}
          title="Revenue Overview"
          subtitle="Financial analytics and insights"
          showBackButton
        />
        <AnimatedLoader
          message="Loading revenue data..."
          icon="chart-line"
          fullScreen={false}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StandardHeader
        navigation={navigation}
        title="Revenue Overview"
        subtitle="Financial analytics and insights"
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

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {[
            { key: 'month', label: 'This Month', icon: 'calendar-month' },
            { key: 'year', label: 'This Year', icon: 'calendar' },
            { key: 'all', label: 'All Time', icon: 'clock-outline' },
          ].map(period => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && {
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <MaterialCommunityIcons
                name={period.icon}
                size={18}
                color={
                  selectedPeriod === period.key ? colors.white : textSecondary
                }
              />
              <StandardText
                size="sm"
                fontWeight={selectedPeriod === period.key ? 'bold' : 'medium'}
                style={{
                  color:
                    selectedPeriod === period.key ? colors.white : textPrimary,
                  marginLeft: 6,
                }}
              >
                {period.label}
              </StandardText>
            </TouchableOpacity>
          ))}
        </View>

        <Gap size="lg" />

        {/* Main Revenue Card */}
        <StandardCard
          style={[styles.mainRevenueCard, { backgroundColor: cardBackground }]}
        >
          <View style={styles.mainRevenueHeader}>
            <View>
              <StandardText size="sm" style={{ color: textSecondary }}>
                {selectedPeriod === 'month'
                  ? 'Monthly'
                  : selectedPeriod === 'year'
                  ? 'Yearly'
                  : 'Total'}{' '}
                Revenue
              </StandardText>
              <StandardText
                fontWeight="bold"
                style={[styles.mainRevenueAmount, { color: colors.success }]}
              >
                ₹
                {(selectedPeriod === 'month'
                  ? revenueData.monthlyRevenue
                  : selectedPeriod === 'year'
                  ? revenueData.yearlyRevenue
                  : revenueData.totalRevenue
                ).toLocaleString()}
              </StandardText>
            </View>
            <View
              style={[
                styles.growthBadge,
                {
                  backgroundColor:
                    growth >= 0 ? colors.success + '20' : colors.error + '20',
                },
              ]}
            >
              <MaterialCommunityIcons
                name={growth >= 0 ? 'trending-up' : 'trending-down'}
                size={20}
                color={growth >= 0 ? colors.success : colors.error}
              />
              <StandardText
                fontWeight="bold"
                size="sm"
                style={{
                  color: growth >= 0 ? colors.success : colors.error,
                  marginLeft: 4,
                }}
              >
                {Math.abs(growth)}%
              </StandardText>
            </View>
          </View>

          <Gap size="sm" />

          <View style={styles.revenueStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="home-city"
                size={16}
                color={textSecondary}
              />
              <StandardText
                size="xs"
                style={{ color: textSecondary, marginLeft: 4 }}
              >
                {revenueData.totalProperties} Properties
              </StandardText>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="account-group"
                size={16}
                color={textSecondary}
              />
              <StandardText
                size="xs"
                style={{ color: textSecondary, marginLeft: 4 }}
              >
                {revenueData.occupiedUnits} Tenants
              </StandardText>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="chart-line"
                size={16}
                color={textSecondary}
              />
              <StandardText
                size="xs"
                style={{ color: textSecondary, marginLeft: 4 }}
              >
                ₹{revenueData.averageMonthly.toLocaleString()}/mo avg
              </StandardText>
            </View>
          </View>
        </StandardCard>

        <Gap size="md" />

        {/* Summary Cards Grid */}
        <View style={styles.summaryGrid}>
          <StandardCard
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <MaterialCommunityIcons
              name="cash-multiple"
              size={24}
              color={colors.success}
            />
            <StandardText
              size="xs"
              style={[styles.summaryLabel, { color: textSecondary }]}
            >
              Collected
            </StandardText>
            <StandardText
              fontWeight="bold"
              size="lg"
              style={{ color: colors.success }}
            >
              ₹
              {(
                revenueData.monthlyRevenue - revenueData.pendingPayments
              ).toLocaleString()}
            </StandardText>
          </StandardCard>

          <StandardCard
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <MaterialCommunityIcons
              name="clock-outline"
              size={24}
              color={colors.warning}
            />
            <StandardText
              size="xs"
              style={[styles.summaryLabel, { color: textSecondary }]}
            >
              Pending
            </StandardText>
            <StandardText
              fontWeight="bold"
              size="lg"
              style={{ color: colors.warning }}
            >
              ₹{revenueData.pendingPayments.toLocaleString()}
            </StandardText>
          </StandardCard>

          <StandardCard
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <MaterialCommunityIcons
              name="alert-circle"
              size={24}
              color={colors.error}
            />
            <StandardText
              size="xs"
              style={[styles.summaryLabel, { color: textSecondary }]}
            >
              Overdue
            </StandardText>
            <StandardText
              fontWeight="bold"
              size="lg"
              style={{ color: colors.error }}
            >
              ₹{revenueData.overduePayments.toLocaleString()}
            </StandardText>
          </StandardCard>
        </View>

        <Gap size="lg" />

        {/* Download Report Section */}
        <StandardCard
          style={[styles.downloadCard, { backgroundColor: cardBackground }]}
        >
          <View style={styles.downloadHeader}>
            <View style={styles.downloadHeaderLeft}>
              <MaterialCommunityIcons
                name="file-chart"
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
                  Download detailed revenue analytics
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
                style={{
                  color: endDate ? textPrimary : textSecondary,
                  marginLeft: 8,
                }}
              >
                {endDate || 'End Date'}
              </StandardText>
            </TouchableOpacity>
          </View>

          {(startDate || endDate) && (
            <>
              <Gap size="sm" />
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setStartDate(null);
                  setEndDate(null);
                }}
              >
                <MaterialCommunityIcons
                  name="filter-remove"
                  size={16}
                  color={colors.error}
                />
                <StandardText
                  size="sm"
                  style={{ color: colors.error, marginLeft: 4 }}
                >
                  Clear Date Filters
                </StandardText>
              </TouchableOpacity>
            </>
          )}

          <Gap size="md" />

          <Button
            mode="contained"
            onPress={downloadReport}
            style={{ backgroundColor: colors.primary }}
            labelStyle={{ color: colors.white }}
            icon="download"
          >
            Download CSV Report
          </Button>
        </StandardCard>

        <Gap size="lg" />

        {/* Monthly Trend */}
        <View style={styles.sectionHeader}>
          <StandardText
            fontWeight="bold"
            size="lg"
            style={{ color: textPrimary }}
          >
            Revenue Trend
          </StandardText>
          <StandardText size="sm" style={{ color: textSecondary }}>
            Last 6 months
          </StandardText>
        </View>

        <Gap size="md" />

        <StandardCard
          style={[styles.chartCard, { backgroundColor: cardBackground }]}
        >
          {revenueData.monthlyTrend.map((trend, index) => {
            const maxAmount = Math.max(
              ...revenueData.monthlyTrend.map(t => t.amount),
            );
            const barHeight = (trend.amount / maxAmount) * 120;
            const receivedHeight = (trend.received / maxAmount) * 120;

            return (
              <View key={index} style={styles.barGroup}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                        backgroundColor: colors.primary + '30',
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      styles.barOverlay,
                      {
                        height: receivedHeight,
                        backgroundColor: colors.success,
                      },
                    ]}
                  />
                </View>
                <StandardText
                  size="xs"
                  fontWeight="medium"
                  style={{ color: textPrimary, marginTop: 4 }}
                >
                  {trend.month}
                </StandardText>
                <StandardText size="xs" style={{ color: textSecondary }}>
                  ₹{(trend.amount / 1000).toFixed(0)}k
                </StandardText>
              </View>
            );
          })}
        </StandardCard>

        <Gap size="sm" />

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: colors.success }]}
            />
            <StandardText size="xs" style={{ color: textSecondary }}>
              Received
            </StandardText>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: colors.primary + '30' },
              ]}
            />
            <StandardText size="xs" style={{ color: textSecondary }}>
              Expected
            </StandardText>
          </View>
        </View>

        <Gap size="lg" />

        {/* Category Breakdown */}
        <StandardText
          fontWeight="bold"
          size="lg"
          style={[styles.sectionTitle, { color: textPrimary }]}
        >
          Revenue by Category
        </StandardText>

        <Gap size="md" />

        <StandardCard
          style={[styles.categoryCard, { backgroundColor: cardBackground }]}
        >
          {revenueData.categoryBreakdown.map((category, index) => (
            <View key={index}>
              {index > 0 && <View style={styles.categoryDivider} />}
              <View style={styles.categoryItem}>
                <View style={styles.categoryLeft}>
                  <View
                    style={[
                      styles.categoryIcon,
                      {
                        backgroundColor:
                          index === 0
                            ? colors.primary + '20'
                            : index === 1
                            ? colors.success + '20'
                            : index === 2
                            ? colors.warning + '20'
                            : colors.primary + '20',
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        category.category === 'Rent'
                          ? 'home'
                          : category.category === 'Deposit'
                          ? 'shield-check'
                          : category.category === 'Maintenance'
                          ? 'wrench'
                          : 'flash'
                      }
                      size={20}
                      color={
                        index === 0
                          ? colors.primary
                          : index === 1
                          ? colors.success
                          : index === 2
                          ? colors.warning
                          : colors.primary
                      }
                    />
                  </View>
                  <View style={styles.categoryInfo}>
                    <StandardText
                      fontWeight="bold"
                      size="md"
                      style={{ color: textPrimary }}
                    >
                      {category.category}
                    </StandardText>
                    <StandardText size="xs" style={{ color: textSecondary }}>
                      {category.count} transactions
                    </StandardText>
                  </View>
                </View>
                <View style={styles.categoryRight}>
                  <StandardText
                    fontWeight="bold"
                    size="md"
                    style={{ color: textPrimary }}
                  >
                    ₹{category.amount.toLocaleString()}
                  </StandardText>
                  <View
                    style={[
                      styles.percentageBadge,
                      {
                        backgroundColor:
                          index === 0
                            ? colors.primary + '15'
                            : index === 1
                            ? colors.success + '15'
                            : index === 2
                            ? colors.warning + '15'
                            : colors.primary + '15',
                      },
                    ]}
                  >
                    <StandardText
                      size="xs"
                      fontWeight="bold"
                      style={{
                        color:
                          index === 0
                            ? colors.primary
                            : index === 1
                            ? colors.success
                            : index === 2
                            ? colors.warning
                            : colors.primary,
                      }}
                    >
                      {category.percentage}%
                    </StandardText>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </StandardCard>

        <Gap size="lg" />

        {/* Top Tenants */}
        <StandardText
          fontWeight="bold"
          size="lg"
          style={[styles.sectionTitle, { color: textPrimary }]}
        >
          Top Contributing Tenants
        </StandardText>

        <Gap size="md" />

        {revenueData.topTenants.map((tenant, index) => (
          <StandardCard
            key={index}
            style={[styles.tenantCard, { backgroundColor: cardBackground }]}
          >
            <View style={styles.tenantRank}>
              <StandardText
                fontWeight="bold"
                size="lg"
                style={{ color: colors.primary }}
              >
                #{index + 1}
              </StandardText>
            </View>
            <View style={styles.tenantInfo}>
              <StandardText
                fontWeight="bold"
                size="md"
                style={{ color: textPrimary }}
              >
                {tenant.name}
              </StandardText>
              <StandardText size="sm" style={{ color: textSecondary }}>
                {tenant.property} • {tenant.payments} payments
              </StandardText>
            </View>
            <StandardText
              fontWeight="bold"
              size="lg"
              style={{ color: colors.success }}
            >
              ₹{tenant.amount.toLocaleString()}
            </StandardText>
          </StandardCard>
        ))}

        <Gap size="xxl" />
      </ScrollView>

      {/* Date Pickers */}
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
              selectedItemColor={colors.primary}
              headerButtonColor={colors.primary}
              calendarTextStyle={{ color: textPrimary }}
              headerTextStyle={{ color: textPrimary }}
              weekDaysTextStyle={{ color: textSecondary }}
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
              selectedItemColor={colors.primary}
              headerButtonColor={colors.primary}
              calendarTextStyle={{ color: textPrimary }}
              headerTextStyle={{ color: textPrimary }}
              weekDaysTextStyle={{ color: textSecondary }}
            />
          </View>
        </Modal>
      </Portal>
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
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 245, 245, 0.98)',
    shadowColor: '#EE7B11',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(238, 123, 17, 0.08)',
  },
  mainRevenueCard: {
    padding: 20,
    borderRadius: 18,
    elevation: 5,
    shadowColor: '#EE7B11',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(238, 123, 17, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
  },
  mainRevenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mainRevenueAmount: {
    fontSize: 32,
    marginTop: 4,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  revenueStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 18,
    borderRadius: 18,
    elevation: 5,
    alignItems: 'center',
    shadowColor: '#EE7B11',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(238, 123, 17, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
  },
  summaryLabel: {
    marginTop: 8,
    marginBottom: 4,
  },
  downloadCard: {
    padding: 20,
    borderRadius: 12,
    elevation: 3,
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
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: 8,
  },
  chartCard: {
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    width: 32,
    height: 120,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    position: 'absolute',
    bottom: 0,
  },
  barOverlay: {
    zIndex: 1,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  categoryCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  tenantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 8,
    gap: 12,
  },
  tenantRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tenantInfo: {
    flex: 1,
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

export default RevenueOverview;
