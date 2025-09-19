import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Platform,
} from 'react-native';
import {
  Appbar,
  Avatar,
  Button,
  FAB,
  Badge,
  Card,
  List,
  Chip,
  DataTable,
  Switch,
  SegmentedButtons,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../context/ThemeContext';
import { CredentialsContext } from '../context/CredentialsContext';
import { analyticsDashBoard } from '../services/NetworkUtils';
import CircularIconsWithText from '../components/cards/CircularIcon';
import StandardText from '../components/StandardText/StandardText';
import StandardCard from '../components/StandardCard/StandardCard';
import Gap from '../components/Gap/Gap';
import { PieChart, LineChart, StackedBarChart } from 'react-native-chart-kit';
import * as Progress from 'react-native-progress';
import colors from '../theme/color';

const screenWidth = Dimensions.get('window').width;

const Home = ({ navigation }) => {
  const { theme: mode, toggleTheme } = useContext(ThemeContext);
  const { credentials } = useContext(CredentialsContext);

  const [selectedAction, setSelectedAction] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [scope, setScope] = useState('property'); // property | unit | tenant
  const [selectedProperty, setSelectedProperty] = useState('All');
  const [autoRecon, setAutoRecon] = useState(true);

  // const bottomSheetModalRef = useRef(null);
  // const handleClosePress = useCallback(
  //   () => bottomSheetModalRef.current?.close(),
  //   [],
  // );
  // const handleQuickActionPress = useCallback(action => {
  //   setSelectedAction(action);
  //   bottomSheetModalRef.current?.present();
  // }, []);

  // Fetch analytics (plug your API later)
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        if (credentials?.accessToken) {
          const response = await analyticsDashBoard(credentials.accessToken);
          setAnalyticsData(response.data);
        } else {
          // If no credentials, clear analytics data
          setAnalyticsData(null);
        }
      } catch (error) {
        // Fallback to mock if API not ready
        setAnalyticsData(null);
        console.error('Error fetching analytics data:', error);
      }
    };
    fetchAnalyticsData();
  }, [credentials]);

  // ---------- MOCKS (replace with API responses) ----------
  const paid = analyticsData?.incomeStats?.actualIncome ?? 72000;
  const notPaid = analyticsData?.incomeStats?.overdueIncome ?? 18000;
  const totalTenants = analyticsData?.tenantStats?.totalTenants ?? 38;
  const vacantRooms = analyticsData?.occupancyStats?.vacantRooms ?? 6;
  const totalRooms = analyticsData?.occupancyStats?.totalRooms ?? 48;

  const properties = ['All', 'Green View', 'City Heights', 'Lake Shore'];
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const revenueByMonth = [150, 165, 158, 172, 168, 181]; // ₹k
  const vacancyLossByMonth = [12, 10, 14, 9, 11, 8]; // ₹k

  const expensesBreakdown = [
    {
      name: 'Electricity',
      population: 22,
      color: '#7E57C2',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Water',
      population: 10,
      color: '#42A5F5',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Services',
      population: 14,
      color: '#26A69A',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Repairs',
      population: 18,
      color: '#EF5350',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Other',
      population: 8,
      color: '#FFCA28',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
  ];

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

  const maintenanceRequests = [
    { id: '1', title: 'Leaky Faucet - 201', status: 'Open', priority: 'High' },
    {
      id: '2',
      title: 'AC not cooling - 305',
      status: 'In-progress',
      priority: 'High',
    },
    {
      id: '3',
      title: 'WiFi intermittent - 102',
      status: 'Open',
      priority: 'Medium',
    },
    {
      id: '4',
      title: 'Wall paint - 402',
      status: 'Completed',
      priority: 'Low',
    },
  ];

  const tenants = [
    { id: 't1', name: 'John Doe', room: '201', status: 'On-time' },
    { id: 't2', name: 'Riya Sharma', room: '305', status: 'Overdue' },
    { id: 't3', name: 'Alex Chen', room: '102', status: 'On-time' },
  ];

  const occupancyGrid = [
    { room: '101', status: 'occupied' },
    { room: '102', status: 'vacant' },
    { room: '103', status: 'overdue' },
    { room: '201', status: 'occupied' },
    { room: '202', status: 'occupied' },
    { room: '203', status: 'vacant' },
    { room: '301', status: 'overdue' },
    { room: '302', status: 'occupied' },
    { room: '303', status: 'vacant' },
    { room: '401', status: 'occupied' },
    { room: '402', status: 'occupied' },
    { room: '403', status: 'vacant' },
  ];

  // ---------- Derived ----------
  const occupancyPct = totalRooms
    ? Math.round(((totalRooms - vacantRooms) / totalRooms) * 100)
    : 0;

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

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Avatar.Icon
            size={40}
            icon="menu"
            style={{ backgroundColor: colors.white }}
            color={colors.secondary}
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

        {/* <TouchableOpacity onPress={toggleTheme} style={{ marginLeft: 10 }}>
          <Avatar.Icon
            size={40}
            icon="theme-light-dark"
            style={{ backgroundColor: colors.white }}
            color={colors.secondary}
          />
        </TouchableOpacity> */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Pitch-aligned alerting & filters */}
        <Card style={styles.bannerCard}>
          <MaterialCommunityIcons
            name="lightning-bolt-outline"
            size={22}
            color={colors.white}
          />
          <View style={{ marginLeft: 10 }}>
            <StandardText style={{ color: colors.white }} fontWeight="bold">
              Real-time tracking enabled
            </StandardText>
            <StandardText style={{ color: colors.white }} size="sm">
              Monitor rent, occupancy & issues in one place.
            </StandardText>
          </View>
        </Card>

        {/* Search + scope filter */}

        {/* <View>
            <SegmentedButtons
              value={scope}
              onValueChange={setScope}
              buttons={[
                {
                  value: 'property',
                  label: 'Property',
                  labelStyle: {
                    fontSize: 16,
                    fontWeight: '600',
                    fontFamily: 'Metropolis-Medium',
                    color: scope === 'property' ? '#fff' : '#000',
                  },
                  style: {
                    backgroundColor:
                      scope === 'property' ? colors.secondary : '#f0f0f0',
                  },
                },
                {
                  value: 'unit',
                  label: 'Unit',
                  labelStyle: {
                    fontSize: 16,
                    fontWeight: '600',
                    fontFamily: 'Metropolis-Medium',
                    color: scope === 'unit' ? '#fff' : '#000',
                  },
                  style: {
                    backgroundColor:
                      scope === 'unit' ? colors.secondary : '#f0f0f0',
                  },
                },
                {
                  value: 'tenant',
                  label: 'Tenant',
                  labelStyle: {
                    fontSize: 16,
                    fontWeight: '600',
                    fontFamily: 'Metropolis-Medium',
                    color: scope === 'tenant' ? '#fff' : '#000',
                  },
                  style: {
                    backgroundColor:
                      scope === 'tenant' ? colors.secondary : '#f0f0f0',
                  },
                },
              ]}
            />
          </View> */}
        <View style={styles.searchRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <TextInput
              placeholder="Search tenants, units, or properties"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Property chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 10 }}
        >
          {properties.map(p => (
            <Chip
              key={p}
              selected={selectedProperty === p}
              selectedColor="#fff"
              onPress={() => setSelectedProperty(p)}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    selectedProperty === p ? colors.secondary : '#f5f5f5',
                },
              ]}
              textStyle={{
                color: selectedProperty === p ? '#fff' : '#000',
                fontFamily: 'Metropolis-Medium',
                fontWeight: selectedProperty === p ? '600' : '400',
              }}
            >
              {p})
            </Chip>
          ))}
        </ScrollView>

        {/* KPI Cards */}
        <View style={styles.kpiGrid}>
          <StandardCard style={styles.kpiCard}>
            <StandardText size="sm">Occupancy</StandardText>
            <StandardText size="xl" fontWeight="bold">
              {occupancyPct}%
            </StandardText>
            <Progress.Bar
              progress={occupancyPct / 100}
              width={null}
              style={{ marginTop: 8 }}
              color={colors.primary}
            />
          </StandardCard>
          <StandardCard style={styles.kpiCard}>
            <StandardText size="sm">Rent Collected</StandardText>
            <StandardText size="xl" fontWeight="bold">
              ₹{paid.toLocaleString()}
            </StandardText>
            <StandardText size="sm">
              Overdue: ₹{notPaid.toLocaleString()}
            </StandardText>
          </StandardCard>
          <StandardCard style={styles.kpiCard}>
            <StandardText size="sm">Tenants</StandardText>
            <StandardText size="xl" fontWeight="bold">
              {totalTenants}
            </StandardText>
            <StandardText size="sm">
              Vacant Units: {vacantRooms}/{totalRooms}
            </StandardText>
          </StandardCard>
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
                ₹{paid.toLocaleString()}
              </StandardText>
              <StandardText size="sm" style={styles.statPercentage}>
                {Math.round((paid / (paid + notPaid)) * 100)}%
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
                ₹{notPaid.toLocaleString()}
              </StandardText>
              <StandardText size="sm" style={styles.statPercentage}>
                {Math.round((notPaid / (paid + notPaid)) * 100)}%
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
                    width: `${(paid / (paid + notPaid)) * 100}%`,
                    backgroundColor: colors.success,
                  },
                ]}
              />
            </View>
            <StandardText size="sm" style={styles.progressText}>
              Collection Rate: {Math.round((paid / (paid + notPaid)) * 100)}%
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
                ₹
                {Math.round(
                  revenueByMonth.reduce((a, b) => a + b, 0) /
                    revenueByMonth.length,
                )}
                k
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
                ₹
                {Math.round(
                  vacancyLossByMonth.reduce((a, b) => a + b, 0) /
                    vacancyLossByMonth.length,
                )}
                k
              </StandardText>
            </View>
          </View>

          {/* Chart */}
          <StackedBarChart
            data={{
              labels: months,
              legend: ['Revenue (₹k)', 'Vacancy Loss (₹k)'],
              data: revenueByMonth.map((rev, i) => [
                rev,
                vacancyLossByMonth[i],
              ]),
              barColors: [colors.primary, colors.error],
            }}
            width={screenWidth - 64}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            }}
            style={styles.chartStyle}
          />
        </StandardCard>

        <Gap size="md" />

        {/* Auto-Reconciliation (Payment Inbox Preview) */}
        {/* <StandardCard
            style={[styles.kpiCard, { height: 400, width: '100%' }]}
          >
            <View style={styles.rowBetween}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons
                  name="sync"
                  size={20}
                  color={colors.primary}
                />
                <StandardText
                  size="lg"
                  fontWeight="bold"
                  style={{ marginLeft: 6 }}
                >
                  Auto Reconciliation
                </StandardText>
              </View>
              <Switch value={autoRecon} onValueChange={setAutoRecon} />
            </View>
            <StandardText size="sm" style={{ marginTop: 6 }}>
              Securely reads payment messages and updates records instantly.
            </StandardText>

            <Gap size="sm" />
            {reconInbox.map(msg => (
              <List.Item
                key={msg.id}
                title={`${msg.from} • ${msg.preview}`}
                left={() => (
                  <MaterialCommunityIcons
                    name="message-text-outline"
                    size={22}
                    color={colors.primary}
                  />
                )}
                right={() => (
                  <Chip
                    mode={msg.matched ? 'flat' : 'outlined'}
                    icon={msg.matched ? 'check' : 'alert'}
                  >
                    {msg.matched ? 'Matched' : 'Review'}
                  </Chip>
                )}
              />
            ))}
            <Button
              mode="contained"
              buttonColor={colors.primary}
              style={{ marginTop: 6 }}
            >
              Sync Now
            </Button>
          </StandardCard> */}

        <StandardCard
          style={[
            styles.kpiCard,
            { height: 400, width: '100%', position: 'relative' },
          ]}
        >
          <View style={styles.rowBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="sync"
                size={20}
                color={colors.primary}
              />
              <StandardText
                size="lg"
                fontWeight="bold"
                style={{ marginLeft: 6 }}
              >
                Auto Reconciliation
              </StandardText>
            </View>
            <Switch value={autoRecon} onValueChange={setAutoRecon} disabled />
          </View>
          <StandardText size="sm" style={{ marginTop: 6 }}>
            Securely reads payment messages and updates records instantly.
          </StandardText>

          <Gap size="sm" />
          {reconInbox.map(msg => (
            <List.Item
              key={msg.id}
              title={`${msg.from} • ${msg.preview}`}
              left={() => (
                <MaterialCommunityIcons
                  name="message-text-outline"
                  size={22}
                  color={colors.primary}
                />
              )}
              right={() => (
                <Chip
                  mode={msg.matched ? 'flat' : 'outlined'}
                  icon={msg.matched ? 'check' : 'alert'}
                >
                  {msg.matched ? 'Matched' : 'Review'}
                </Chip>
              )}
            />
          ))}
          <Button
            mode="contained"
            buttonColor={colors.primary}
            style={{ marginTop: 6 }}
            disabled
          >
            Sync Now
          </Button>

          {/* Premium Feature Lock Overlay */}
          <View style={styles.premiumOverlay}>
            <View style={styles.premiumContent}>
              <View style={styles.lockIconContainer}>
                <MaterialCommunityIcons name="lock" size={40} color="#FFD700" />
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
                  style={{ marginRight: 6 }}
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
                ₹{(52000 + 48000 + 46000).toLocaleString()}
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
                ₹{(17500 + 16000 + 13000).toLocaleString()}
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
                ₹
                {(
                  52000 +
                  48000 +
                  46000 -
                  (17500 + 16000 + 13000)
                ).toLocaleString()}
              </StandardText>
            </View>
          </View>

          {/* Enhanced Data Table */}
          <View style={styles.tableContainer}>
            <DataTable>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title textStyle={styles.tableHeaderText}>
                  {scope === 'property'
                    ? 'Property'
                    : scope === 'unit'
                    ? 'Unit'
                    : 'Tenant'}
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

              {[
                { k: 'Green View / 201 / John', r: 52000, e: 17500 },
                { k: 'City Heights / 305 / Riya', r: 48000, e: 16000 },
                { k: 'Lake Shore / 102 / Alex', r: 46000, e: 13000 },
              ].map((row, idx) => {
                const net = row.r - row.e;
                return (
                  <DataTable.Row key={idx} style={styles.tableRow}>
                    <DataTable.Cell textStyle={styles.tableCellText}>
                      {
                        row.k.split(' / ')[
                          scope === 'property' ? 0 : scope === 'unit' ? 1 : 2
                        ]
                      }
                    </DataTable.Cell>
                    <DataTable.Cell
                      numeric
                      textStyle={[
                        styles.tableCellText,
                        { color: colors.success },
                      ]}
                    >
                      ₹{row.r.toLocaleString()}
                    </DataTable.Cell>
                    <DataTable.Cell
                      numeric
                      textStyle={[
                        styles.tableCellText,
                        { color: colors.error },
                      ]}
                    >
                      ₹{row.e.toLocaleString()}
                    </DataTable.Cell>
                    <DataTable.Cell
                      numeric
                      textStyle={[
                        styles.tableCellText,
                        {
                          color: net >= 0 ? colors.success : colors.error,
                          fontWeight: 'bold',
                        },
                      ]}
                    >
                      ₹{net.toLocaleString()}
                    </DataTable.Cell>
                  </DataTable.Row>
                );
              })}
            </DataTable>
          </View>

          <Gap size="sm" />

          {/* Enhanced Expenses Breakdown */}
          <View style={styles.expensesSection}>
            <StandardText
              size="md"
              fontWeight="bold"
              style={styles.expensesSectionTitle}
            >
              Expenses Breakdown
            </StandardText>
            <PieChart
              data={expensesBreakdown}
              width={screenWidth - 64}
              height={180}
              accessor="population"
              backgroundColor="transparent"
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              }}
              paddingLeft="12"
              style={styles.chartStyle}
            />
          </View>
        </StandardCard>

        <Gap size="md" />

        {/* Forecasts */}
        {/* <StandardCard
            style={[styles.kpiCard, { height: 450, width: '100%' }]}
          >
            <StandardText size="lg" fontWeight="bold" textAlign="center">
              Forecast — Revenue & Vacancy Loss (Next 6 Months)
            </StandardText>
            <LineChart
              data={{
                labels: months,
                datasets: [
                  { data: revenueByMonth.map(v => v * 1.05) }, // simple uplift forecast
                  { data: vacancyLossByMonth.map(v => Math.max(5, v - 1)) }, // simple improvement
                ],
                legend: ['Revenue (₹k)', 'Vacancy Loss (₹k)'],
              }}
              width={screenWidth - 40}
              height={240}
              yAxisSuffix="k"
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              }}
            />
          </StandardCard> */}

        <Gap size="md" />

        {/* Issues & Maintenance Board */}
        <StandardCard style={styles.fullWidthCard}>
          <View style={styles.rowBetween}>
            <StandardText size="lg" fontWeight="bold">
              🔧 Issues & Maintenance
            </StandardText>
            <TouchableOpacity
              onPress={() => navigation.navigate('Tickets')}
              style={styles.showMoreButton}
            >
              <StandardText style={styles.showMoreText}>Show More</StandardText>
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
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
                    <StandardText size="md" fontWeight="600" numberOfLines={1}>
                      {req.title}
                    </StandardText>
                    <StandardText size="sm" style={styles.maintenanceSubtext}>
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
          <View style={styles.rowBetween}>
            <StandardText size="lg" fontWeight="bold">
              👑 Top Tenants
            </StandardText>
            <TouchableOpacity
              onPress={() => navigation.navigate('Tenants')}
              style={styles.showMoreButton}
            >
              <StandardText style={styles.showMoreText}>See More</StandardText>
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
                key={t.id}
                style={styles.tenantItem}
                onPress={() =>
                  navigation.navigate('TenantDetails', { tenant: t })
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
                    <StandardText size="md" fontWeight="600" numberOfLines={1}>
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
                        t.status === 'On-time' ? colors.success : colors.error,
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

        {/* 🪪 Tenant KYC Status */}
        <StandardCard style={styles.fullWidthCard}>
          <View style={styles.rowBetween}>
            <StandardText size="lg" fontWeight="bold">
              🪪 Tenant KYC
            </StandardText>
            <TouchableOpacity
              onPress={() => navigation.navigate('TenantKYC')}
              style={styles.showMoreButton}
            >
              <StandardText style={styles.showMoreText}>See More</StandardText>
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
                style={{ color: colors.success }}
              >
                12
              </StandardText>
              <StandardText size="sm" style={{ color: colors.success }}>
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
                style={{ color: colors.warning }}
              >
                3
              </StandardText>
              <StandardText size="sm" style={{ color: colors.warning }}>
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
              <StandardText
                size="lg"
                fontWeight="bold"
                style={{ color: colors.error }}
              >
                1
              </StandardText>
              <StandardText size="sm" style={{ color: colors.error }}>
                Rejected
              </StandardText>
            </View>
          </View>

          {/* Recent KYC Submissions */}
          <StandardText size="md" fontWeight="600" style={styles.sectionTitle}>
            Recent Submissions
          </StandardText>

          <View style={styles.kycList}>
            {[
              {
                name: 'Ravi Kumar',
                status: 'verified',
                date: '2025-08-30',
                id: 'k1',
              },
              {
                name: 'Amit Sharma',
                status: 'pending',
                date: '2025-08-29',
                id: 'k2',
              },
              {
                name: 'Neha Verma',
                status: 'rejected',
                date: '2025-08-28',
                id: 'k3',
              },
            ]
              .slice(0, 3)
              .map(kyc => (
                <TouchableOpacity
                  key={kyc.id}
                  style={styles.kycItem}
                  onPress={() =>
                    navigation.navigate('TenantDetails', {
                      tenant: { name: kyc.name, id: kyc.id },
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
                              : colors.error + '20',
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={
                          kyc.status === 'verified'
                            ? 'check'
                            : kyc.status === 'pending'
                            ? 'clock'
                            : 'close'
                        }
                        size={16}
                        color={
                          kyc.status === 'verified'
                            ? colors.success
                            : kyc.status === 'pending'
                            ? colors.warning
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
                        {kyc.name}
                      </StandardText>
                      <StandardText size="sm" style={styles.kycSubtext}>
                        Submitted: {kyc.date}
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
                            : colors.error,
                      }}
                    >
                      {kyc.status.charAt(0).toUpperCase() + kyc.status.slice(1)}
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
              <StandardText style={styles.showMoreText}>View All</StandardText>
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
                {totalRooms - vacantRooms}
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
                {vacantRooms}
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
                {occupancyPct}%
              </StandardText>
              <StandardText size="sm" style={styles.occupancyStatLabel}>
                Occupancy
              </StandardText>
            </View>
          </View>

          <View style={styles.roomGrid}>
            {occupancyGrid.slice(0, 9).map((room, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.roomCard,
                  { backgroundColor: getRoomColor(room.status) },
                ]}
                onPress={() => navigation.navigate('RoomDetails', { room })}
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
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.roomLegend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: colors.success }]}
              />
              <StandardText size="sm">Occupied</StandardText>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: colors.error }]}
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
      </ScrollView>

      {/* FAB */}
      {/* <FAB
          icon="plus"
          color={colors.white}
          style={styles.fab}
          onPress={() => {}}
        /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 20, // Add safe area padding for proper spacing
  },

  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
    // marginTop: -20,
    marginHorizontal: -16,
    marginBottom: 16,
  },

  headerContent: {
    flex: 1,
    marginLeft: 10,
  },

  welcomeText: {
    color: colors.secondary,
  },

  nameText: {
    color: colors.secondary,
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },

  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginBottom: 10,
    opacity: 1,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 0,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontFamily: 'Metropolis-Regular',
  },

  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiCard: {
    width: '32%',
    // padding: 12,
    // borderRadius: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  chip: { marginRight: 10, borderRadius: 20, elevation: 1 },
  // Occupancy grid
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  roomBox: {
    width: '31%',
    aspectRatio: 1,
    marginBottom: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  roomText: { color: '#fff', fontSize: 16 },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 6,
  },
  legendColor: { width: 16, height: 16, borderRadius: 4, marginRight: 6 },

  fab: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: colors.primary,
  },

  sheetContent: {
    flex: 1,
    width: '100%',
    padding: 16,
    alignItems: 'flex-start',
  },
  kycSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  kycSummaryBox: {
    padding: 8,
    borderRadius: 8,
  },
  kycSummaryText: {
    color: '#fff',
  },
  kycRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  kycBadge: {
    borderRadius: 12,
    paddingVertical: 4,
  },
  kycText: {
    color: '#fff',
  },
  // Add these to your styles object
  premiumOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.75)', // Reduced opacity to show content
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
    borderColor: 'rgba(255, 215, 0, 0.3)', // Golden border
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

  // New styles for improved sections
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

  // Maintenance styles
  maintenanceContainer: {
    marginTop: 16,
  },

  maintenanceItem: {
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  },

  tableHeaderText: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },

  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.accent,
  },

  tableCellText: {
    fontSize: 14,
    color: colors.textPrimary,
  },

  tableCellBold: {
    fontWeight: 'bold',
  },

  expensesSection: {
    alignItems: 'center',
  },

  expensesSectionTitle: {
    textAlign: 'center',
    marginBottom: 8,
    color: colors.textPrimary,
  },

  // Full width card styles
  fullWidthCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },

  sectionTitleText: {
    flex: 1,
    marginLeft: 8,
    color: colors.textPrimary,
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
  },

  roomNumber: {
    color: '#fff',
    marginBottom: 4,
  },

  roomIcon: {
    marginTop: 2,
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
});

export default Home;
