import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  RefreshControl,
} from 'react-native';
import {
  Avatar,
  Button,
  Badge,
  Card,
  List,
  Chip,
  DataTable,
  Switch,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { CredentialsContext } from '../context/CredentialsContext';
import { ThemeContext } from '../context/ThemeContext';
import { useProperty } from '../context/PropertyContext';
import { getDashboardAnalytics } from '../services/NetworkUtils';
import StandardText from '../components/StandardText/StandardText';
import StandardCard from '../components/StandardCard/StandardCard';
import Gap from '../components/Gap/Gap';
import AnimatedLoader from '../components/AnimatedLoader/AnimatedLoader';
import { PieChart, StackedBarChart } from 'react-native-chart-kit';
import * as Progress from 'react-native-progress';
import colors from '../theme/colors';
import {
  PRIMARY,
  BACKGROUND,
  CARD_BACKGROUND,
  BORDER_LIGHT,
  BORDER_STANDARD,
} from '../theme/colors';
import { RADIUS, PADDING, SPACING, SHADOW, FONT_WEIGHT } from '../theme/layout';
import PropertySelector from '../components/PropertySelector/PropertySelector';

const screenWidth = Dimensions.get('window').width;

// Utility function to format amounts
const formatAmount = amount => {
  if (!amount || amount === 0) return '0';

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return amount.toString();

  const absAmount = Math.abs(numAmount);

  if (absAmount >= 10000000) {
    // 1 crore and above
    const crores = (absAmount / 10000000).toFixed(1);
    return `${numAmount < 0 ? '-' : ''}${crores}CR`;
  } else if (absAmount >= 100000) {
    // 1 lakh and above
    const lakhs = (absAmount / 100000).toFixed(1);
    return `${numAmount < 0 ? '-' : ''}${lakhs}L`;
  } else if (absAmount >= 1000) {
    // 1 thousand and above
    const thousands = (absAmount / 1000).toFixed(1);
    return `${numAmount < 0 ? '-' : ''}${thousands}k`;
  } else {
    return numAmount.toString();
  }
};

// Expense category configuration for UI properties
const EXPENSE_CATEGORY_CONFIG = {
  electricity: {
    name: 'Electricity',
    color: '#7E57C2',
    icon: 'lightning-bolt',
    order: 1,
  },
  water: {
    name: 'Water',
    color: '#42A5F5',
    icon: 'water',
    order: 2,
  },
  services: {
    name: 'Services',
    color: '#26A69A',
    icon: 'account-group',
    order: 3,
  },
  repairs: {
    name: 'Repairs',
    color: '#EF5350',
    icon: 'tools',
    order: 4,
  },
  other: {
    name: 'Other',
    color: '#FFCA28',
    icon: 'dots-horizontal',
    order: 5,
  },
};

// Fallback colors for unknown expense categories
const FALLBACK_COLORS = [
  '#7E57C2',
  '#42A5F5',
  '#26A69A',
  '#EF5350',
  '#FFCA28',
  '#66BB6A',
  '#FF7043',
  '#AB47BC',
  '#29B6F6',
  '#FFA726',
];

// Helper components for List items
const MessageLeftIcon = () => (
  <MaterialCommunityIcons
    name="message-text-outline"
    size={22}
    color={colors.primary}
  />
);

const MessageRightChip = ({ matched }) => (
  <Chip mode={matched ? 'flat' : 'outlined'} icon={matched ? 'check' : 'alert'}>
    {matched ? 'Matched' : 'Review'}
  </Chip>
);

// Create a function that returns the right component with matched prop
const createMessageRightChip = matched => () =>
  <MessageRightChip matched={matched} />;

const Home = ({ navigation }) => {
  const { credentials } = useContext(CredentialsContext);
  const { theme: mode } = useContext(ThemeContext);
  const { selectedProperty, isAllPropertiesSelected } = useProperty();

  // Theme variables
  const isDark = mode === 'dark';
  const chartBackgroundColor = isDark ? colors.backgroundDark : colors.white;
  const chartTextColor = isDark ? colors.white : colors.textPrimary;

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scope] = useState('property'); // property | unit | tenant
  const [autoRecon, setAutoRecon] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch analytics data from API
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (credentials?.accessToken) {
        // Build query parameters
        const queryParams = {};

        // If a specific property is selected, pass its ID to the API
        if (!isAllPropertiesSelected && selectedProperty?.property_id) {
          queryParams.property_id = selectedProperty.property_id;
        }

        // Default to current month data
        queryParams.date_range = 'current_month';

        const response = await getDashboardAnalytics(
          credentials.accessToken,
          queryParams,
        );

        if (response.success) {
          setAnalyticsData(response.data);
        } else {
          setError(response.error || 'Failed to fetch analytics data');
          console.error('Analytics API Error:', response.error);
        }
      } else {
        // If no credentials, clear analytics data
        setAnalyticsData(null);
      }
    } catch (err) {
      setError('Error fetching analytics data');
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [credentials, selectedProperty, isAllPropertiesSelected]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [
    credentials,
    selectedProperty,
    isAllPropertiesSelected,
    fetchAnalyticsData,
  ]);

  // Fetch data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAnalyticsData();
    });
    return unsubscribe;
  }, [navigation, fetchAnalyticsData]);

  // Handle pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalyticsData();
  };

  // Extract data from API response or use defaults
  const propertyInfo = analyticsData?.property_info || {};
  const occupancyData = analyticsData?.occupancy || {};
  const rentData = analyticsData?.rent_collection || {};
  const revenueData = analyticsData?.revenue_trends || {};
  const profitLossData = analyticsData?.profit_loss || {};
  const issuesData = analyticsData?.issues_maintenance || {};
  const tenantData = analyticsData?.tenant_info || {};
  const roomData = analyticsData?.room_occupancy_map || {};

  // Dynamic expense breakdown builder
  const buildExpensesBreakdown = () => {
    const expenseBreakdownData = profitLossData.expense_breakdown || {};
    const categories = Object.keys(expenseBreakdownData);

    return categories
      .map((categoryKey, index) => {
        const apiData = expenseBreakdownData[categoryKey];
        const config = EXPENSE_CATEGORY_CONFIG[categoryKey];

        // Use config if available, otherwise create dynamic entry
        const categoryName =
          config?.name ||
          categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
        const categoryColor =
          config?.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length];

        return {
          name: categoryName,
          population: apiData?.percentage || 0,
          color: categoryColor,
          legendFontColor: isDark ? colors.white : '#333',
          legendFontSize: 12,
          amount: apiData?.amount || 0,
          icon: config?.icon,
          order: config?.order || 999, // Put unknown categories at the end
        };
      })
      .sort((a, b) => a.order - b.order) // Sort by predefined order
      .filter(expense => expense.population > 0); // Remove empty categories
  };

  // Get expenses breakdown from API
  const expensesBreakdown = buildExpensesBreakdown();

  // KPI calculations from API data
  const paid = rentData.collected || 0;
  const notPaid = rentData.overdue || 0;
  const totalTenants = occupancyData.tenant_count || 0;
  const vacantRooms = occupancyData.vacant_units || 0;
  const totalRooms = occupancyData.total_units || 0;
  const occupancyPct = occupancyData.occupancy_percentage || 0;

  // Revenue trends data
  const getMonthIndex = monthName => {
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
    return months.indexOf(monthName);
  };

  const months = revenueData.monthly_data?.map(item => {
    const monthIndex = getMonthIndex(item.month);
    if (monthIndex === -1) return item.month;
    const date = new Date(item.year, monthIndex);
    return date.toLocaleDateString('en-US', { month: 'short' });
  }) || ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

  const revenueByMonth = revenueData.monthly_data?.map(
    item => item.revenue / 1000,
  ) || [150, 165, 158, 172, 168, 181];
  const vacancyLossByMonth = revenueData.monthly_data?.map(
    item => item.vacancy_loss / 1000,
  ) || [12, 10, 14, 9, 11, 8];

  // Mock data for features not in API (keep these until API is extended)
  const reconInbox = [
    {
      id: 'm1',
      from: 'ICICI',
      preview: 'UPI-CR ₹7,500 from Raj...',
      matched: true,
    },
    {
      id: 'm2',
      from: 'HDFC',
      preview: 'NEFT ₹12,000 from Priya...',
      matched: false,
    },
    {
      id: 'm3',
      from: 'SBI',
      preview: 'UPI-CR ₹9,000 from Aman...',
      matched: true,
    },
  ];

  // Recent maintenance requests from API

  const maintenanceRequests =
    issuesData.recent_issues?.map(issue => ({
      id: issue.issue_id,
      title: issue.title,
      status:
        issue.status === 'pending'
          ? 'Open'
          : issue.status === 'in_progress'
          ? 'In-progress'
          : 'Completed',
      priority:
        issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1),
    })) || [];

  // Top tenants from API
  const tenants =
    tenantData.top_tenants?.map((tenant, index) => ({
      tenant_id: tenant.tenant_id || `t${index + 1}`,
      name: tenant.name,
      room: tenant.room_number,
      status: tenant.payment_status === 'on_time' ? 'On-time' : 'Overdue',
    })) || [];

  // Room occupancy grid from API
  const occupancyGrid =
    roomData.rooms?.map(room => ({
      room_id: room.room_number,
      room: room.room_number,
      status: room.status,
      has_issues: room.has_issues,
      property_id: room.property_id,
    })) || [];

  // Colors for occupancy grid
  const getRoomColor = status => {
    switch (status) {
      case 'occupied':
        return '#4CAF50';
      case 'vacant':
        return '#BDBDBD';
      case 'overdue':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  // P&L data from API
  const plData = profitLossData.property_breakdown || [];

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Avatar.Icon
            size={40}
            icon="menu"
            style={{ backgroundColor: colors.white }}
            color={colors.primary}
          />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <StandardText size="md" style={styles.welcomeText}>
            Welcome
          </StandardText>
          <StandardText size="lg" fontWeight="bold" style={styles.nameText}>
            {credentials?.firstName} {credentials?.lastName}
          </StandardText>
        </View>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Notices');
          }}
        >
          <View>
            <Avatar.Icon
              size={40}
              icon="bell"
              style={{ backgroundColor: colors.light_black }}
              color={colors.white}
            />
            <Badge style={styles.badge} size={10} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Property Selector */}
      <View style={styles.propertySelectorContainer}>
        <PropertySelector navigation={navigation} showTitle={false} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Loading state - only for content area */}
        {loading && (
          <AnimatedLoader
            message="Loading dashboard data..."
            icon="view-dashboard"
            fullScreen={false}
          />
        )}

        {!loading && (
          <>
            {/* Real-time tracking banner */}
            <Card style={styles.bannerCard}>
              <MaterialCommunityIcons
                name="lightning-bolt-outline"
                size={22}
                color={colors.white}
              />
              <View style={styles.headerLeftContent}>
                <StandardText color="default_white" fontWeight="bold">
                  {propertyInfo.real_time_tracking_enabled
                    ? 'Real-time tracking enabled'
                    : 'Real-time tracking disabled'}
                </StandardText>
                <StandardText color="default_white" size="sm">
                  {propertyInfo.property_name || 'All Properties'} -{' '}
                  {propertyInfo.location || 'Multiple Locations'}
                </StandardText>
              </View>
            </Card>

            {/* Error state */}
            {error && (
              <StandardCard style={styles.fullWidthCard}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={24}
                    color={colors.error}
                  />
                  <StandardText
                    size="lg"
                    fontWeight="bold"
                    color="default_red"
                    style={styles.sectionTitleText}
                  >
                    Error Loading Data
                  </StandardText>
                </View>
                <StandardText size="sm" color="textSecondary">
                  {error}
                </StandardText>
              </StandardCard>
            )}

            {/* KPI Cards */}
            <View style={styles.kpiGrid}>
              <TouchableOpacity
                style={styles.kpiCard}
                onPress={() => navigation.navigate('Rooms')}
                activeOpacity={0.7}
              >
                <StandardText size="sm">Occupancy</StandardText>
                <StandardText size="xl" fontWeight="bold">
                  {occupancyPct}%
                </StandardText>
                <Progress.Bar
                  progress={occupancyPct / 100}
                  width={null}
                  style={styles.progressBarMargin}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.kpiCard}
                onPress={() => navigation.navigate('Payments')}
                activeOpacity={0.7}
              >
                <StandardText size="sm">Rent Collected</StandardText>
                <StandardText size="xl" fontWeight="bold">
                  ₹{formatAmount(paid)}
                </StandardText>
                <StandardText size="sm">
                  Overdue: ₹{formatAmount(notPaid)}
                </StandardText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.kpiCard}
                onPress={() => navigation.navigate('Tenants')}
                activeOpacity={0.7}
              >
                <StandardText size="sm">Tenants</StandardText>
                <StandardText size="xl" fontWeight="bold">
                  {totalTenants}
                </StandardText>
                <StandardText size="sm">
                  Vacant Units: {vacantRooms}/{totalRooms}
                </StandardText>
              </TouchableOpacity>
            </View>

            <Gap size="md" />

            {/* Enhanced Rent Collection */}
            <StandardCard style={styles.fullWidthCard}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="cash-multiple"
                  size={24}
                  color={colors.primary}
                />
                <StandardText
                  size="lg"
                  fontWeight="bold"
                  style={styles.sectionTitleText}
                >
                  Rent Collection
                </StandardText>
              </View>

              {/* Collection Summary */}
              <View style={styles.collectionSummary}>
                <View style={styles.collectionStat}>
                  <View
                    style={[
                      styles.statIndicator,
                      { backgroundColor: colors.success + '20' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color={colors.success}
                    />
                  </View>
                  <StandardText size="sm" style={styles.statLabel}>
                    Collected
                  </StandardText>
                  <StandardText
                    size="lg"
                    fontWeight="bold"
                    style={{ color: colors.success }}
                  >
                    ₹{formatAmount(paid)}
                  </StandardText>
                  <StandardText size="sm" style={styles.statPercentage}>
                    {rentData.collected_percentage ||
                      Math.round((paid / (paid + notPaid || 1)) * 100)}
                    %
                  </StandardText>
                </View>

                <View style={styles.collectionDivider} />

                <View style={styles.collectionStat}>
                  <View
                    style={[
                      styles.statIndicator,
                      { backgroundColor: colors.error + '20' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="clock-alert"
                      size={20}
                      color={colors.error}
                    />
                  </View>
                  <StandardText size="sm" style={styles.statLabel}>
                    Overdue
                  </StandardText>
                  <StandardText
                    size="lg"
                    fontWeight="bold"
                    style={{ color: colors.error }}
                  >
                    ₹{formatAmount(notPaid)}
                  </StandardText>
                  <StandardText size="sm" style={styles.statPercentage}>
                    {rentData.overdue_percentage ||
                      Math.round((notPaid / (paid + notPaid || 1)) * 100)}
                    %
                  </StandardText>
                </View>
              </View>

              {/* Collection Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          rentData.collected_percentage ||
                          Math.round((paid / (paid + notPaid || 1)) * 100)
                        }%`,
                        backgroundColor: colors.success,
                      },
                    ]}
                  />
                </View>
                <StandardText size="sm" style={styles.progressText}>
                  Collection Rate:{' '}
                  {rentData.collection_rate ||
                    Math.round((paid / (paid + notPaid || 1)) * 100)}
                  %
                </StandardText>
              </View>
            </StandardCard>

            <Gap size="md" />

            {/* Enhanced Revenue & Vacancy Loss */}
            <StandardCard style={styles.fullWidthCard}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="chart-line"
                  size={24}
                  color={colors.primary}
                />
                <StandardText
                  size="lg"
                  fontWeight="bold"
                  style={styles.sectionTitleText}
                >
                  Revenue & Vacancy Trends
                </StandardText>
              </View>

              {/* Revenue Summary Cards */}
              <View style={styles.revenueSummaryGrid}>
                <View
                  style={[
                    styles.revenueSummaryCard,
                    { backgroundColor: colors.success + '15' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="trending-up"
                    size={20}
                    color={colors.success}
                  />
                  <StandardText size="sm" style={styles.summaryLabel}>
                    Avg Revenue
                  </StandardText>
                  <StandardText
                    size="md"
                    fontWeight="bold"
                    style={{ color: colors.success }}
                  >
                    ₹{formatAmount(revenueData.avg_revenue || 0)}
                  </StandardText>
                </View>

                <View
                  style={[
                    styles.revenueSummaryCard,
                    { backgroundColor: colors.error + '15' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="trending-down"
                    size={20}
                    color={colors.error}
                  />
                  <StandardText size="sm" style={styles.summaryLabel}>
                    Avg Loss
                  </StandardText>
                  <StandardText
                    size="md"
                    fontWeight="bold"
                    style={{ color: colors.error }}
                  >
                    ₹{formatAmount(revenueData.avg_loss || 0)}
                  </StandardText>
                </View>
              </View>

              {/* Enhanced Chart with Theme Support */}
              <View style={styles.chartContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chartScrollContainer}
                >
                  <StackedBarChart
                    data={{
                      labels: months,
                      data: revenueByMonth.map((rev, i) => [
                        rev,
                        vacancyLossByMonth[i],
                      ]),
                      barColors: ['#4CAF50', '#FF7043'],
                    }}
                    width={Math.max(screenWidth - 64, months.length * 80)}
                    height={240}
                    chartConfig={{
                      backgroundColor: chartBackgroundColor,
                      backgroundGradientFrom: chartBackgroundColor,
                      backgroundGradientTo: chartBackgroundColor,
                      backgroundGradientFromOpacity: 1,
                      backgroundGradientToOpacity: 1,
                      decimalPlaces: 0,
                      color: (opacity = 1) =>
                        `${chartTextColor}${Math.round(opacity * 255)
                          .toString(16)
                          .padStart(2, '0')}`,
                      labelColor: (opacity = 1) =>
                        `${chartTextColor}${Math.round(opacity * 255)
                          .toString(16)
                          .padStart(2, '0')}`,
                      strokeWidth: 2,
                      barPercentage: 0.7,
                      useShadowColorFromDataset: false,
                      propsForLabels: {
                        fontSize: 12,
                        fontWeight: '600',
                        color: chartTextColor,
                      },
                      propsForVerticalLabels: {
                        fontSize: 11,
                        fontWeight: '500',
                        color: chartTextColor,
                      },
                      propsForHorizontalLabels: {
                        fontSize: 11,
                        fontWeight: '500',
                        color: chartTextColor,
                      },
                    }}
                    style={[
                      styles.chartStyle,
                      { backgroundColor: chartBackgroundColor },
                    ]}
                    withHorizontalLabels={true}
                    withVerticalLabels={true}
                    showValuesOnTopOfBars={true}
                    fromZero={true}
                    segments={4}
                  />
                </ScrollView>

                {/* Custom Enhanced Legend */}
                <View style={styles.chartLegend}>
                  <View style={styles.chartLegendItem}>
                    <View
                      style={[
                        styles.chartLegendDot,
                        { backgroundColor: '#4CAF50' },
                      ]}
                    />
                    <StandardText size="sm" style={styles.chartLegendText}>
                      Revenue (₹k)
                    </StandardText>
                  </View>
                  <View style={styles.chartLegendItem}>
                    <View
                      style={[
                        styles.chartLegendDot,
                        { backgroundColor: '#FF7043' },
                      ]}
                    />
                    <StandardText size="sm" style={styles.chartLegendText}>
                      Vacancy Loss (₹k)
                    </StandardText>
                  </View>
                </View>
              </View>
            </StandardCard>

            <Gap size="md" />

            {/* Auto-Reconciliation (Payment Inbox Preview) */}
            <StandardCard style={[styles.kpiCard, styles.premiumCardStyle]}>
              <View style={styles.messageContainer}>
                <MaterialCommunityIcons
                  name="sync"
                  size={20}
                  color={colors.primary}
                />
                <StandardText
                  size="lg"
                  fontWeight="bold"
                  style={styles.messageIcon}
                >
                  Auto Reconciliation
                </StandardText>
              </View>
              <Switch value={autoRecon} onValueChange={setAutoRecon} disabled />
              <StandardText size="sm" style={styles.messageText}>
                Securely reads payment messages and updates records instantly.
              </StandardText>

              <Gap size="sm" />
              {reconInbox.map(msg => (
                <List.Item
                  key={msg.id}
                  title={`${msg.from} • ${msg.preview}`}
                  left={MessageLeftIcon}
                  right={createMessageRightChip(msg.matched)}
                />
              ))}
              <Button
                mode="contained"
                buttonColor={colors.primary}
                style={styles.messagesList}
                disabled
              >
                Sync Now
              </Button>

              {/* Premium Feature Lock Overlay */}
              <View style={styles.premiumOverlay}>
                <View style={styles.premiumContent}>
                  <View style={styles.lockIconContainer}>
                    <MaterialCommunityIcons
                      name="lock"
                      size={40}
                      color="#FFD700"
                    />
                    <View style={styles.crownIcon}>
                      <MaterialCommunityIcons
                        name="crown"
                        size={24}
                        color="#FFD700"
                      />
                    </View>
                  </View>

                  <StandardText
                    fontWeight="bold"
                    size="lg"
                    style={styles.premiumTitle}
                  >
                    Premium Feature
                  </StandardText>

                  <StandardText
                    size="sm"
                    style={styles.premiumDescription}
                    textAlign="center"
                  >
                    Please contact your sales manager to unlock this feature
                  </StandardText>

                  <TouchableOpacity style={styles.contactButton}>
                    <MaterialCommunityIcons
                      name="phone"
                      size={16}
                      color="#fff"
                      style={styles.messageItemIcon}
                    />
                    <StandardText
                      fontWeight="semibold"
                      style={styles.contactButtonText}
                    >
                      Contact Sales
                    </StandardText>
                  </TouchableOpacity>
                </View>
              </View>
            </StandardCard>

            <Gap size="md" />

            {/* Enhanced P&L by scope */}
            <StandardCard style={styles.fullWidthCard}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="chart-bar"
                  size={24}
                  color={colors.primary}
                />
                <StandardText
                  size="lg"
                  fontWeight="bold"
                  style={styles.sectionTitleText}
                >
                  Profit & Loss —{' '}
                  {scope === 'property'
                    ? 'Property'
                    : scope === 'unit'
                    ? 'Unit'
                    : 'Tenant'}
                </StandardText>
              </View>

              {/* P&L Summary Cards */}
              <View style={styles.plSummaryGrid}>
                <View
                  style={[
                    styles.plSummaryCard,
                    { backgroundColor: colors.success + '15' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="cash-plus"
                    size={20}
                    color={colors.success}
                  />
                  <StandardText size="sm" style={styles.summaryLabel}>
                    Total Revenue
                  </StandardText>
                  <StandardText
                    size="md"
                    fontWeight="bold"
                    style={{ color: colors.success }}
                  >
                    ₹{formatAmount(profitLossData.summary?.total_revenue || 0)}
                  </StandardText>
                </View>

                <View
                  style={[
                    styles.plSummaryCard,
                    { backgroundColor: colors.error + '15' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="cash-minus"
                    size={20}
                    color={colors.error}
                  />
                  <StandardText size="sm" style={styles.summaryLabel}>
                    Total Expenses
                  </StandardText>
                  <StandardText
                    size="md"
                    fontWeight="bold"
                    style={{ color: colors.error }}
                  >
                    ₹{formatAmount(profitLossData.summary?.total_expenses || 0)}
                  </StandardText>
                </View>

                <View
                  style={[
                    styles.plSummaryCard,
                    { backgroundColor: colors.primary + '15' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="trending-up"
                    size={20}
                    color={colors.primary}
                  />
                  <StandardText size="sm" style={styles.summaryLabel}>
                    Net Profit
                  </StandardText>
                  <StandardText
                    size="md"
                    fontWeight="bold"
                    style={{ color: colors.primary }}
                  >
                    ₹{formatAmount(profitLossData.summary?.net_profit || 0)}
                  </StandardText>
                </View>
              </View>

              {/* Enhanced Data Table */}
              <View style={styles.tableContainer}>
                <DataTable>
                  <DataTable.Header style={styles.tableHeader}>
                    <DataTable.Title textStyle={styles.tableHeaderText}>
                      Property
                    </DataTable.Title>
                    <DataTable.Title numeric textStyle={styles.tableHeaderText}>
                      Revenue
                    </DataTable.Title>
                    <DataTable.Title numeric textStyle={styles.tableHeaderText}>
                      Expenses
                    </DataTable.Title>
                    <DataTable.Title numeric textStyle={styles.tableHeaderText}>
                      Net
                    </DataTable.Title>
                  </DataTable.Header>

                  {plData.slice(0, 3).map((row, idx) => {
                    const net = row.net_profit || row.revenue - row.expenses;
                    return (
                      <DataTable.Row key={idx} style={styles.tableRow}>
                        <DataTable.Cell textStyle={styles.tableCellText}>
                          {row.property_name}
                        </DataTable.Cell>
                        <DataTable.Cell
                          numeric
                          textStyle={[
                            styles.tableCellText,
                            { color: colors.success },
                          ]}
                        >
                          ₹{formatAmount(row.revenue || 0)}
                        </DataTable.Cell>
                        <DataTable.Cell
                          numeric
                          textStyle={[
                            styles.tableCellText,
                            { color: colors.error },
                          ]}
                        >
                          ₹{formatAmount(row.expenses || 0)}
                        </DataTable.Cell>
                        <DataTable.Cell
                          numeric
                          textStyle={[
                            styles.tableCellText,
                            {
                              color: net >= 0 ? colors.success : colors.error,
                            },
                            styles.boldText,
                          ]}
                        >
                          ₹{formatAmount(net)}
                        </DataTable.Cell>
                      </DataTable.Row>
                    );
                  })}
                </DataTable>
              </View>

              <Gap size="sm" />

              {/* Enhanced Expenses Breakdown - Using Dynamic API Data */}
              <View style={styles.expensesSection}>
                <StandardText
                  size="md"
                  fontWeight="bold"
                  style={styles.expensesSectionTitle}
                >
                  Expenses Breakdown
                </StandardText>

                {expensesBreakdown.length > 0 ? (
                  <PieChart
                    data={expensesBreakdown}
                    width={screenWidth - 64}
                    height={180}
                    accessor="population"
                    backgroundColor="transparent"
                    chartConfig={{
                      backgroundColor: isDark ? colors.backgroundDark : '#fff',
                      backgroundGradientFrom: isDark
                        ? colors.backgroundDark
                        : '#fff',
                      backgroundGradientTo: isDark
                        ? colors.backgroundDark
                        : '#fff',
                      color: (opacity = 1) =>
                        isDark
                          ? `rgba(255,255,255,${opacity})`
                          : `rgba(0,0,0,${opacity})`,
                    }}
                    paddingLeft="12"
                    style={styles.chartStyle}
                  />
                ) : (
                  <View style={styles.noDataContainer}>
                    <MaterialCommunityIcons
                      name="chart-pie"
                      size={48}
                      color={colors.textSecondary}
                    />
                    <StandardText size="sm" style={styles.noDataText}>
                      No expense data available
                    </StandardText>
                  </View>
                )}
              </View>
            </StandardCard>

            <Gap size="md" />

            {/* Issues & Maintenance Board */}
            <StandardCard style={styles.fullWidthCard}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="wrench"
                  size={24}
                  color={colors.primary}
                />
                <StandardText
                  size="lg"
                  fontWeight="bold"
                  style={styles.sectionTitleText}
                >
                  Issues & Maintenance
                </StandardText>

                <TouchableOpacity
                  onPress={() => navigation.navigate('Tickets')}
                  style={styles.showMoreButton}
                >
                  <StandardText style={styles.showMoreText}>
                    Show More
                  </StandardText>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>

              {/* Issues Summary */}
              <View style={styles.issuesSummaryGrid}>
                <View style={styles.issuesSummaryItem}>
                  <StandardText
                    size="xl"
                    fontWeight="bold"
                    style={{ color: colors.primary }}
                  >
                    {issuesData.total_issues || 0}
                  </StandardText>
                  <StandardText size="sm" style={styles.summaryLabel}>
                    Total Issues
                  </StandardText>
                </View>
                <View style={styles.issuesSummaryItem}>
                  <StandardText
                    size="xl"
                    fontWeight="bold"
                    style={{ color: colors.error }}
                  >
                    {issuesData.open_issues || 0}
                  </StandardText>
                  <StandardText size="sm" style={styles.summaryLabel}>
                    Open
                  </StandardText>
                </View>
                <View style={styles.issuesSummaryItem}>
                  <StandardText
                    size="xl"
                    fontWeight="bold"
                    style={{ color: colors.warning }}
                  >
                    {issuesData.in_progress_issues || 0}
                  </StandardText>
                  <StandardText size="sm" style={styles.summaryLabel}>
                    In Progress
                  </StandardText>
                </View>
                <View style={styles.issuesSummaryItem}>
                  <StandardText
                    size="xl"
                    fontWeight="bold"
                    style={{ color: colors.success }}
                  >
                    {issuesData.resolved_issues || 0}
                  </StandardText>
                  <StandardText size="sm" style={styles.summaryLabel}>
                    Resolved
                  </StandardText>
                </View>
              </View>

              <View style={styles.maintenanceContainer}>
                {maintenanceRequests.slice(0, 3).map(req => (
                  <TouchableOpacity
                    key={req.id}
                    style={styles.maintenanceItem}
                    onPress={() => navigation.navigate('Tickets')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.maintenanceLeft}>
                      <View
                        style={[
                          styles.maintenanceIcon,
                          {
                            backgroundColor:
                              req.priority === 'High'
                                ? colors.error + '20'
                                : req.priority === 'Medium'
                                ? colors.warning + '20'
                                : colors.success + '20',
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="wrench"
                          size={18}
                          color={
                            req.priority === 'High'
                              ? colors.error
                              : req.priority === 'Medium'
                              ? colors.warning
                              : colors.success
                          }
                        />
                      </View>
                      <View style={styles.maintenanceContent}>
                        <StandardText
                          size="md"
                          fontWeight="600"
                          numberOfLines={1}
                        >
                          {req.title}
                        </StandardText>
                        <StandardText
                          size="sm"
                          style={styles.maintenanceSubtext}
                        >
                          Priority: {req.priority}
                        </StandardText>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusChip,
                        {
                          backgroundColor:
                            req.status === 'Completed'
                              ? colors.success + '20'
                              : req.status === 'In-progress'
                              ? colors.warning + '20'
                              : colors.error + '20',
                        },
                      ]}
                    >
                      <StandardText
                        size="xs"
                        fontWeight="600"
                        style={{
                          color:
                            req.status === 'Completed'
                              ? colors.success
                              : req.status === 'In-progress'
                              ? colors.warning
                              : colors.error,
                        }}
                      >
                        {req.status}
                      </StandardText>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </StandardCard>

            <Gap size="md" />

            {/* Tenant Leaderboard */}
            <StandardCard style={styles.fullWidthCard}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="crown"
                  size={24}
                  color={colors.primary}
                />
                <StandardText
                  size="lg"
                  fontWeight="bold"
                  style={styles.sectionTitleText}
                >
                  Top Tenants
                </StandardText>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Tenants')}
                  style={styles.showMoreButton}
                >
                  <StandardText style={styles.showMoreText}>
                    See More
                  </StandardText>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.tenantsContainer}>
                {tenants.slice(0, 3).map((t, index) => (
                  <TouchableOpacity
                    key={t.tenant_id}
                    style={styles.tenantItem}
                    onPress={() =>
                      navigation.navigate('TenantDetails', {
                        tenant_id: t.tenant_id,
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.tenantLeft}>
                      <View style={styles.tenantRank}>
                        <StandardText
                          size="sm"
                          fontWeight="bold"
                          style={styles.rankText}
                        >
                          #{index + 1}
                        </StandardText>
                      </View>
                      <View style={styles.tenantInfo}>
                        <StandardText
                          size="md"
                          fontWeight="600"
                          numberOfLines={1}
                        >
                          {t.name}
                        </StandardText>
                        <StandardText size="sm" style={styles.tenantSubtext}>
                          Room {t.room}
                        </StandardText>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusChip,
                        {
                          backgroundColor:
                            t.status === 'On-time'
                              ? colors.success + '20'
                              : colors.error + '20',
                        },
                      ]}
                    >
                      <StandardText
                        size="xs"
                        fontWeight="600"
                        style={{
                          color:
                            t.status === 'On-time'
                              ? colors.success
                              : colors.error,
                        }}
                      >
                        {t.status}
                      </StandardText>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </StandardCard>

            <Gap size="md" />

            {/* Tenant KYC Status */}
            <StandardCard style={styles.fullWidthCard}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="card-account-details"
                  size={24}
                  color={colors.primary}
                />
                <StandardText
                  size="lg"
                  fontWeight="bold"
                  style={styles.sectionTitleText}
                >
                  Tenant KYC
                </StandardText>

                <TouchableOpacity
                  onPress={() => navigation.navigate('TenantKYC')}
                  style={styles.showMoreButton}
                >
                  <StandardText style={styles.showMoreText}>
                    See More
                  </StandardText>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>

              {/* Summary Cards */}
              <View style={styles.kycSummaryGrid}>
                <View
                  style={[
                    styles.kycSummaryCard,
                    { backgroundColor: colors.success + '20' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color={colors.success}
                  />
                  <StandardText
                    size="lg"
                    fontWeight="bold"
                    color="default_green"
                  >
                    {tenantData.kyc_stats?.verified || 0}
                  </StandardText>
                  <StandardText size="sm" color="default_green">
                    Verified
                  </StandardText>
                </View>

                <View
                  style={[
                    styles.kycSummaryCard,
                    { backgroundColor: colors.warning + '20' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={24}
                    color={colors.warning}
                  />
                  <StandardText
                    size="lg"
                    fontWeight="bold"
                    color="default_orange"
                  >
                    {tenantData.kyc_stats?.pending || 0}
                  </StandardText>
                  <StandardText size="sm" color="default_orange">
                    Pending
                  </StandardText>
                </View>

                <View
                  style={[
                    styles.kycSummaryCard,
                    { backgroundColor: colors.error + '20' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={24}
                    color={colors.error}
                  />
                  <StandardText size="lg" fontWeight="bold" color="default_red">
                    {tenantData.kyc_stats?.rejected || 0}
                  </StandardText>
                  <StandardText size="sm" color="default_red">
                    Rejected
                  </StandardText>
                </View>
              </View>

              {/* Recent KYC Submissions */}
              <StandardText
                size="md"
                fontWeight="600"
                style={styles.sectionTitle}
              >
                Recent Submissions
              </StandardText>
              <View style={styles.kycList}>
                {(tenantData.recent_kyc_submissions || [])
                  .slice(0, 3)
                  .map((kyc, index) => (
                    <TouchableOpacity
                      key={kyc.kyc_id}
                      style={styles.kycItem}
                      onPress={() =>
                        navigation.navigate('TenantDetails', {
                          tenant_id: kyc.tenant_id,
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <View style={styles.kycLeft}>
                        <View
                          style={[
                            styles.kycStatusIcon,
                            {
                              backgroundColor:
                                kyc.status === 'verified'
                                  ? colors.success + '20'
                                  : kyc.status === 'pending'
                                  ? colors.warning + '20'
                                  : kyc.status === 'in_review'
                                  ? colors.info + '20'
                                  : colors.error + '20',
                            },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={
                              kyc.status === 'verified'
                                ? 'check'
                                : kyc.status === 'pending'
                                ? 'progress-clock'
                                : kyc.status === 'in_review'
                                ? 'clock'
                                : 'close'
                            }
                            size={16}
                            color={
                              kyc.status === 'verified'
                                ? colors.success
                                : kyc.status === 'pending'
                                ? colors.warning
                                : kyc.status === 'in_review'
                                ? colors.info
                                : colors.error
                            }
                          />
                        </View>
                        <View style={styles.kycContent}>
                          <StandardText
                            size="md"
                            fontWeight="600"
                            numberOfLines={1}
                          >
                            {kyc.tenant_name}
                          </StandardText>
                          <StandardText size="sm" style={styles.kycSubtext}>
                            Submitted:{' '}
                            {new Date(kyc.submitted_date).toLocaleDateString()}
                          </StandardText>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.statusChip,
                          {
                            backgroundColor:
                              kyc.status === 'verified'
                                ? colors.success + '20'
                                : kyc.status === 'pending'
                                ? colors.warning + '20'
                                : kyc.status === 'in_review'
                                ? colors.info + '20'
                                : colors.error + '20',
                          },
                        ]}
                      >
                        <StandardText
                          size="xs"
                          fontWeight="600"
                          style={{
                            color:
                              kyc.status === 'verified'
                                ? colors.success
                                : kyc.status === 'pending'
                                ? colors.warning
                                : kyc.status === 'in_review'
                                ? colors.info
                                : colors.error,
                          }}
                        >
                          {kyc.status.charAt(0).toUpperCase() +
                            kyc.status.slice(1)}
                        </StandardText>
                      </View>
                    </TouchableOpacity>
                  ))}
              </View>
            </StandardCard>

            <Gap size="md" />

            {/* Enhanced Room Occupancy Map */}
            <StandardCard style={styles.fullWidthCard}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="home-variant"
                  size={24}
                  color={colors.primary}
                />
                <StandardText
                  size="lg"
                  fontWeight="bold"
                  style={styles.sectionTitleText}
                >
                  Room Occupancy Map
                </StandardText>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Rooms')}
                  style={styles.showMoreButton}
                >
                  <StandardText style={styles.showMoreText}>
                    View All
                  </StandardText>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={16}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.occupancyStats}>
                <View style={styles.occupancyStatItem}>
                  <StandardText
                    size="xl"
                    fontWeight="bold"
                    style={{ color: colors.success }}
                  >
                    {roomData.occupied_rooms || totalRooms - vacantRooms}
                  </StandardText>
                  <StandardText size="sm" style={styles.occupancyStatLabel}>
                    Occupied
                  </StandardText>
                </View>
                <View style={styles.occupancyStatItem}>
                  <StandardText
                    size="xl"
                    fontWeight="bold"
                    style={{ color: colors.error }}
                  >
                    {roomData.vacant_rooms || vacantRooms}
                  </StandardText>
                  <StandardText size="sm" style={styles.occupancyStatLabel}>
                    Vacant
                  </StandardText>
                </View>
                <View style={styles.occupancyStatItem}>
                  <StandardText
                    size="xl"
                    fontWeight="bold"
                    style={{ color: colors.primary }}
                  >
                    {Math.round(occupancyPct)}%
                  </StandardText>
                  <StandardText size="sm" style={styles.occupancyStatLabel}>
                    Occupancy
                  </StandardText>
                </View>
              </View>

              <View style={styles.roomGrid}>
                {occupancyGrid.slice(0, 9).map((room, idx) => (
                  <TouchableOpacity
                    key={room.room_id}
                    style={[
                      styles.roomCard,
                      { backgroundColor: getRoomColor(room.status) },
                    ]}
                    onPress={() => {
                      navigation.navigate('RoomDetails', {
                        room_id: room.room_id,
                        property_id: room.property_id,
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <StandardText fontWeight="bold" style={styles.roomNumber}>
                      {room.room}
                    </StandardText>
                    <MaterialCommunityIcons
                      name={
                        room.status === 'occupied'
                          ? 'account'
                          : room.status === 'overdue'
                          ? 'account-alert'
                          : 'home-outline'
                      }
                      size={16}
                      color="#fff"
                      style={styles.roomIcon}
                    />
                    {room.has_issues && (
                      <View style={styles.issueIndicator}>
                        <MaterialCommunityIcons
                          name="alert-circle"
                          size={12}
                          color={colors.warning}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.roomLegend}>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: colors.success },
                    ]}
                  />
                  <StandardText size="sm">Occupied</StandardText>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: colors.error },
                    ]}
                  />
                  <StandardText size="sm">Overdue</StandardText>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: colors.light_gray },
                    ]}
                  />
                  <StandardText size="sm">Vacant</StandardText>
                </View>
              </View>
            </StandardCard>

            <Gap size="xl" />
          </>
        )}
      </ScrollView>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    paddingHorizontal: PADDING.medium,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
  },

  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
    marginHorizontal: -16,
    marginBottom: 16,
  },

  propertySelectorContainer: {
    marginBottom: 16,
  },

  headerLeftContent: {
    marginLeft: 10,
  },

  progressBarMargin: {
    marginTop: 8,
  },

  premiumCardStyle: {
    height: 400,
    width: '100%',
    position: 'relative',
  },

  headerContent: {
    flex: 1,
    marginLeft: 10,
  },

  welcomeText: {
    color: colors.primary,
  },

  nameText: {
    color: colors.primary,
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },

  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: PRIMARY,
    borderRadius: RADIUS.medium,
    marginBottom: SPACING.sm,
    opacity: 0.95,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  kpiCard: {
    width: '32%',
    backgroundColor: '#fff',
    borderRadius: RADIUS.large,
    padding: PADDING.medium,
    marginVertical: SPACING.xs,
    shadowColor: PRIMARY,
    ...SHADOW.strong,
    borderWidth: 1,
    borderColor: BORDER_STANDARD,
  },

  premiumOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  premiumContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },

  lockIconContainer: {
    position: 'relative',
    marginBottom: 16,
  },

  crownIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },

  premiumTitle: {
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },

  premiumDescription: {
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
    maxWidth: 250,
  },

  contactButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },

  contactButtonText: {
    color: '#333',
    fontSize: 14,
  },

  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  showMoreText: {
    color: colors.primary,
    marginRight: 4,
    fontSize: 14,
    fontWeight: '600',
  },

  // Issues Summary
  issuesSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
  },

  issuesSummaryItem: {
    alignItems: 'center',
    flex: 1,
  },

  // Maintenance styles
  maintenanceContainer: {
    marginTop: 16,
  },

  maintenanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: PADDING.large,
    marginBottom: SPACING.sm,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: RADIUS.medium,
    borderLeftWidth: 5,
    borderLeftColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: BORDER_STANDARD,
  },

  maintenanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  maintenanceIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  maintenanceContent: {
    flex: 1,
  },

  maintenanceSubtext: {
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Tenants styles
  tenantsContainer: {
    marginTop: 16,
  },

  tenantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: PADDING.large,
    marginBottom: SPACING.sm,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: RADIUS.medium,
    shadowColor: PRIMARY,
    ...SHADOW.medium,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },

  tenantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  tenantRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  rankText: {
    color: colors.white,
  },

  tenantInfo: {
    flex: 1,
  },

  tenantSubtext: {
    color: colors.textSecondary,
    marginTop: 2,
  },

  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },

  // KYC styles
  kycSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },

  kycSummaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },

  sectionTitle: {
    marginTop: 16,
    marginBottom: 12,
    color: colors.textPrimary,
  },

  // Rent Collection styles
  collectionSummary: {
    flexDirection: 'row',
    backgroundColor: 'rgba(248, 249, 250, 0.95)',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(98, 0, 234, 0.08)',
  },

  collectionStat: {
    flex: 1,
    alignItems: 'center',
  },

  collectionDivider: {
    width: 1,
    backgroundColor: colors.textSecondary + '30',
    marginHorizontal: 16,
  },

  statIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  statLabel: {
    color: colors.textSecondary,
    marginBottom: 4,
  },

  statPercentage: {
    color: colors.textSecondary,
    marginTop: 4,
  },

  progressContainer: {
    marginTop: 8,
  },

  progressBar: {
    height: 8,
    backgroundColor: colors.accent,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },

  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  progressText: {
    textAlign: 'center',
    color: colors.textSecondary,
  },

  // Revenue Summary styles
  revenueSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },

  revenueSummaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  summaryLabel: {
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },

  chartStyle: {
    borderRadius: 12,
    marginTop: 8,
    fontFamily: 'Metropolis-Regular',
  },

  chartContainer: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 8,
    marginTop: 8,
    alignItems: 'center',
  },

  chartScrollContainer: {
    alignItems: 'center',
  },

  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingHorizontal: 16,
    width: '100%',
  },

  chartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.light_gray + '30',
    borderRadius: 8,
    marginHorizontal: 4,
  },

  chartLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },

  chartLegendText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
  },

  // P&L styles
  plSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },

  plSummaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  tableContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },

  tableHeader: {
    backgroundColor: colors.accent,
    fontFamily: 'Metropolis-Regular',
  },

  tableHeaderText: {
    color: colors.textPrimary,
  },

  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
    fontFamily: 'Metropolis-Regular',
  },

  tableCellText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontFamily: 'Metropolis-Regular',
  },

  expensesSection: {
    alignItems: 'center',
  },

  expensesSectionTitle: {
    textAlign: 'center',
    marginBottom: 8,
    color: colors.textPrimary,
  },

  // New styles for dynamic expense breakdown
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  noDataText: {
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },

  expenseDetailsList: {
    width: '100%',
    marginTop: 16,
  },

  expenseDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  expenseDetailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  expenseColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },

  expenseDetailContent: {
    flex: 1,
  },

  expenseDetailSubtext: {
    color: colors.textSecondary,
    marginTop: 2,
  },

  expensePercentage: {
    color: colors.textPrimary,
    minWidth: 40,
    textAlign: 'right',
  },

  // Full width card styles
  fullWidthCard: {
    width: '100%',
    backgroundColor: CARD_BACKGROUND,
    borderRadius: RADIUS.large,
    padding: PADDING.large,
    marginVertical: SPACING.sm,
    shadowColor: PRIMARY,
    ...SHADOW.strong,
    borderWidth: 1,
    borderColor: BORDER_STANDARD,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionTitleText: {
    flex: 1,
    marginLeft: 8,
  },

  // KYC List styles
  kycList: {
    marginTop: 8,
  },

  kycItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  kycLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  kycStatusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  kycContent: {
    flex: 1,
  },

  kycSubtext: {
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Room Occupancy Map styles
  occupancyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
  },

  occupancyStatItem: {
    alignItems: 'center',
  },

  occupancyStatLabel: {
    color: colors.textSecondary,
    marginTop: 4,
  },

  roomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  roomCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },

  roomNumber: {
    color: '#fff',
    marginBottom: 4,
  },

  roomIcon: {
    marginTop: 2,
  },

  issueIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 2,
  },

  roomLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },

  // Message and inline style replacements
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  messageIcon: {
    marginLeft: 6,
  },

  messageText: {
    marginTop: 6,
  },

  messagesList: {
    marginTop: 6,
  },

  messageItemIcon: {
    marginRight: 6,
  },

  boldText: {
    fontWeight: FONT_WEIGHT.bold,
  },
});

export default Home;
