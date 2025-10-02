import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';
import DatePicker from 'react-native-ui-datepicker';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import StandardCard from '../components/StandardCard/StandardCard';
import { CredentialsContext } from '../context/CredentialsContext';
import { useProperty } from '../context/PropertyContext';
import colors from '../theme/color';
import Gap from '../components/Gap/Gap';
import PropertySelector from '../components/PropertySelector/PropertySelector';

const RevenueOverview = ({ navigation }) => {
  const { credentials } = useContext(CredentialsContext);
  const { theme: mode } = useContext(ThemeContext);
  const {} = useProperty();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    pendingPayments: 0,
    overduePayments: 0,
    monthlyTrend: [],
    yearlyTrend: [],
  });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

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

      // Mock data for now - replace with actual API call
      const mockData = {
        totalRevenue: 125000,
        monthlyRevenue: 15000,
        yearlyRevenue: 180000,
        pendingPayments: 2500,
        overduePayments: 1200,
        monthlyTrend: [
          { month: 'Jan', amount: 12000 },
          { month: 'Feb', amount: 13500 },
          { month: 'Mar', amount: 14200 },
          { month: 'Apr', amount: 13800 },
          { month: 'May', amount: 15200 },
          { month: 'Jun', amount: 15800 },
        ],
        yearlyTrend: [
          { year: '2022', amount: 145000 },
          { year: '2023', amount: 168000 },
          { year: '2024', amount: 175000 },
          { year: '2025', amount: 180000 },
        ],
      };

      setRevenueData(mockData);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [credentials]);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRevenueData();
  }, [fetchRevenueData]);

  // Download revenue report
  const downloadReport = useCallback(async () => {
    try {
      // Filter data based on date range if selected
      let filteredMonthlyTrend = revenueData.monthlyTrend;
      let filteredYearlyTrend = revenueData.yearlyTrend;

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Filter monthly trend
        filteredMonthlyTrend = revenueData.monthlyTrend.filter(trend => {
          const trendDate = new Date(trend.month + '-01');
          return trendDate >= start && trendDate <= end;
        });

        // Filter yearly trend
        filteredYearlyTrend = revenueData.yearlyTrend.filter(trend => {
          const trendDate = new Date(trend.year + '-01-01');
          return trendDate >= start && trendDate <= end;
        });
      }

      // Create CSV content with revenue summary
      const headers = ['Metric', 'Value'];
      const csvContent = [
        headers.join(','),
        `Total Revenue,${revenueData.totalRevenue}`,
        `Monthly Revenue,${revenueData.monthlyRevenue}`,
        `Yearly Revenue,${revenueData.yearlyRevenue}`,
        `Pending Payments,${revenueData.pendingPayments}`,
        `Overdue Payments,${revenueData.overduePayments}`,
        `Date Range,${startDate ? startDate : 'All'} to ${
          endDate ? endDate : 'All'
        }`,
        '',
        'Monthly Trend',
        'Month,Amount',
        ...filteredMonthlyTrend.map(trend => `${trend.month},${trend.amount}`),
        '',
        'Yearly Trend',
        'Year,Amount',
        ...filteredYearlyTrend.map(trend => `${trend.year},${trend.amount}`),
      ].join('\n');

      // Generate filename with date range
      const dateRange =
        startDate && endDate ? `${startDate}_to_${endDate}` : 'all_time';
      const filename = `revenue_report_${dateRange}.csv`;

      // Share the CSV file
      await Share.open({
        title: 'Revenue Report',
        message: 'Revenue Report',
        url: `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`,
        filename: filename,
        type: 'text/csv',
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      Alert.alert('Error', 'Failed to download the report. Please try again.');
    }
  }, [revenueData, startDate, endDate]);

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
        <StandardHeader navigation={navigation} title="Revenue Overview" />
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons
            name="chart-line"
            size={64}
            color={isDark ? colors.light_gray : colors.secondary}
          />
          <StandardText
            style={[styles.loadingText, { color: textPrimary }]}
            fontWeight="medium"
          >
            Loading revenue data...
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
      <StandardHeader navigation={navigation} title="Revenue Overview" />

      <PropertySelector />

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
                name="cash-multiple"
                size={24}
                color={colors.success}
              />
              <StandardText
                style={[styles.cardTitle, { color: textPrimary }]}
                fontWeight="bold"
                size="md"
              >
                Total Revenue
              </StandardText>
            </View>
            <StandardText
              style={[styles.cardValue, { color: colors.success }]}
              fontWeight="bold"
              size="xl"
            >
              ₹{revenueData.totalRevenue.toLocaleString()}
            </StandardText>
          </Card>

          <Card
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="calendar-month"
                size={24}
                color={colors.primary}
              />
              <StandardText
                style={[styles.cardTitle, { color: textPrimary }]}
                fontWeight="bold"
                size="md"
              >
                This Month
              </StandardText>
            </View>
            <StandardText
              style={[styles.cardValue, { color: colors.primary }]}
              fontWeight="bold"
              size="xl"
            >
              ₹{revenueData.monthlyRevenue.toLocaleString()}
            </StandardText>
          </Card>
        </View>

        <View style={styles.summaryContainer}>
          <Card
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="calendar-today"
                size={24}
                color={colors.info}
              />
              <StandardText
                style={[styles.cardTitle, { color: textPrimary }]}
                fontWeight="bold"
                size="md"
              >
                This Year
              </StandardText>
            </View>
            <StandardText
              style={[styles.cardValue, { color: colors.info }]}
              fontWeight="bold"
              size="xl"
            >
              ₹{revenueData.yearlyRevenue.toLocaleString()}
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
              ₹{revenueData.pendingPayments.toLocaleString()}
            </StandardText>
          </Card>
        </View>

        <Gap size="lg" />

        {/* Download Report Section */}
        <StandardCard
          style={[styles.downloadCard, { backgroundColor: cardBackground }]}
        >
          <View style={styles.downloadHeader}>
            <MaterialCommunityIcons
              name="file-chart"
              size={24}
              color={colors.primary}
            />
            <StandardText
              style={[styles.downloadTitle, { color: textPrimary }]}
              fontWeight="bold"
              size="lg"
            >
              Download Revenue Report
            </StandardText>
          </View>

          <StandardText
            style={[styles.downloadSubtitle, { color: textSecondary }]}
            size="sm"
          >
            Export revenue data with custom date ranges
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

          <Gap size="sm" />

          {/* Clear Filters */}
          {(startDate || endDate) && (
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
                style={[styles.clearFiltersText, { color: colors.error }]}
                size="sm"
              >
                Clear Date Filters
              </StandardText>
            </TouchableOpacity>
          )}

          <Gap size="md" />

          {/* Download Button */}
          <Button
            mode="contained"
            onPress={downloadReport}
            style={[
              styles.downloadActionButton,
              { backgroundColor: colors.primary },
            ]}
            labelStyle={{ color: colors.white }}
            icon="download"
            disabled={loading}
          >
            Download CSV Report
          </Button>
        </StandardCard>

        <Gap size="lg" />

        {/* Monthly Trend */}
        <StandardText
          fontWeight="bold"
          size="xl"
          style={[styles.sectionTitle, { color: textPrimary }]}
        >
          Monthly Revenue Trend
        </StandardText>

        <Gap size="md" />

        <StandardCard
          style={[styles.chartCard, { backgroundColor: cardBackground }]}
        >
          <View style={styles.chartPlaceholder}>
            <MaterialCommunityIcons
              name="chart-line"
              size={48}
              color={colors.secondary}
            />
            <StandardText
              style={[styles.chartText, { color: textSecondary }]}
              fontWeight="medium"
            >
              Revenue Chart
            </StandardText>
            <StandardText
              style={[styles.chartSubtext, { color: textSecondary }]}
            >
              Interactive chart will be displayed here
            </StandardText>
          </View>
        </StandardCard>

        <Gap size="lg" />

        {/* Yearly Trend */}
        <StandardText
          fontWeight="bold"
          size="xl"
          style={[styles.sectionTitle, { color: textPrimary }]}
        >
          Yearly Revenue Trend
        </StandardText>

        <Gap size="md" />

        <StandardCard
          style={[styles.chartCard, { backgroundColor: cardBackground }]}
        >
          <View style={styles.chartPlaceholder}>
            <MaterialCommunityIcons
              name="chart-bar"
              size={48}
              color={colors.secondary}
            />
            <StandardText
              style={[styles.chartText, { color: textSecondary }]}
              fontWeight="medium"
            >
              Yearly Chart
            </StandardText>
            <StandardText
              style={[styles.chartSubtext, { color: textSecondary }]}
            >
              Annual revenue comparison chart
            </StandardText>
          </View>
        </StandardCard>

        <Gap size="xxl" />
      </ScrollView>

      {/* Start Date Picker Modal */}
      {showStartDatePicker && (
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.datePickerContainer,
              { backgroundColor: cardBackground },
            ]}
          >
            <View style={styles.datePickerHeader}>
              <StandardText
                style={[styles.datePickerTitle, { color: textPrimary }]}
                fontWeight="bold"
                size="lg"
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
              headerTextColor={textPrimary}
              calendarTextColor={textPrimary}
              todayTextColor={colors.primary}
            />
          </View>
        </View>
      )}

      {/* End Date Picker Modal */}
      {showEndDatePicker && (
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.datePickerContainer,
              { backgroundColor: cardBackground },
            ]}
          >
            <View style={styles.datePickerHeader}>
              <StandardText
                style={[styles.datePickerTitle, { color: textPrimary }]}
                fontWeight="bold"
                size="lg"
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
              headerTextColor={textPrimary}
              calendarTextColor={textPrimary}
              todayTextColor={colors.primary}
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
  sectionTitle: {
    marginBottom: 8,
  },
  chartCard: {
    padding: 24,
    borderRadius: 12,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  chartPlaceholder: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  chartText: {
    marginTop: 12,
    fontSize: 16,
  },
  chartSubtext: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
  downloadButton: {
    padding: 8,
    marginLeft: 8,
  },
  downloadCard: {
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  downloadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  downloadTitle: {
    marginLeft: 12,
    fontSize: 18,
  },
  downloadSubtitle: {
    marginLeft: 36,
    fontSize: 14,
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
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  clearFiltersText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  downloadActionButton: {
    borderRadius: 8,
    paddingVertical: 6,
  },
  modalOverlay: {
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
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 18,
  },
  closeButton: {
    padding: 4,
  },
});

export default RevenueOverview;
