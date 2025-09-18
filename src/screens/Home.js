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

  const piePaidVsDue = [
    {
      name: 'Paid',
      population: 70,
      color: '#4CAF50',
      legendFontColor: '#333',
      legendFontSize: 14,
    },
    {
      name: 'Due',
      population: 30,
      color: '#F44336',
      legendFontColor: '#333',
      legendFontSize: 14,
    },
  ];

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
              onPress={() => setSelectedProperty(p)}
              style={{ marginRight: 8 }}
              textStyle={{
                color: selectedProperty === p ? '#fff' : '#000',
                fontFamily: 'Metropolis-Medium',
              }}
            >
              {p}
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

        {/* Paid vs Overdue + Revenue Trend */}
        {console.log('piePaidVsDue', piePaidVsDue)}
        <View style={{ gap: 12 }}>
          <StandardCard
            style={[styles.kpiCard, { height: 300, width: '100%' }]}
          >
            <StandardText size="lg" fontWeight="bold" textAlign="center">
              Rent Collection
            </StandardText>
            <PieChart
              data={piePaidVsDue}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              hasLegend={true}
              absolute // shows absolute values instead of percentages
            />
          </StandardCard>

          <StandardCard
            style={[styles.kpiCard, { height: 350, width: '100%' }]}
          >
            <StandardText size="lg" fontWeight="bold" textAlign="center">
              Revenue & Vacancy Loss
            </StandardText>
            <StackedBarChart
              data={{
                labels: months,
                legend: ['Revenue (₹k)', 'Vacancy Loss (₹k)'],
                data: revenueByMonth.map((rev, i) => [
                  rev,
                  vacancyLossByMonth[i],
                ]),
                barColors: ['#1976D2', '#E53935'],
              }}
              width={screenWidth - 40}
              height={240}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              }}
            />
          </StandardCard>
        </View>

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

        {/* P&L by scope */}
        <StandardCard style={[styles.kpiCard, { height: 500, width: '100%' }]}>
          <StandardText size="lg" fontWeight="bold">
            Profit & Loss —{' '}
            {scope === 'property'
              ? 'Property'
              : scope === 'unit'
              ? 'Unit'
              : 'Tenant'}
          </StandardText>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>
                {scope === 'property'
                  ? 'Property'
                  : scope === 'unit'
                  ? 'Unit'
                  : 'Tenant'}
              </DataTable.Title>
              <DataTable.Title numeric>Revenue</DataTable.Title>
              <DataTable.Title numeric>Expenses</DataTable.Title>
              <DataTable.Title numeric>Net</DataTable.Title>
            </DataTable.Header>

            {[
              { k: 'Green View / 201 / John', r: 52000, e: 17500 },
              { k: 'City Heights / 305 / Riya', r: 48000, e: 16000 },
              { k: 'Lake Shore / 102 / Alex', r: 46000, e: 13000 },
            ].map((row, idx) => {
              const net = row.r - row.e;
              return (
                <DataTable.Row key={idx}>
                  <DataTable.Cell>
                    {
                      row.k.split(' / ')[
                        scope === 'property' ? 0 : scope === 'unit' ? 1 : 2
                      ]
                    }
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    ₹{row.r.toLocaleString()}
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    ₹{row.e.toLocaleString()}
                  </DataTable.Cell>
                  <DataTable.Cell
                    numeric
                    style={{ color: net >= 0 ? '#2E7D32' : '#C62828' }}
                  >
                    ₹{net.toLocaleString()}
                  </DataTable.Cell>
                </DataTable.Row>
              );
            })}
          </DataTable>

          <Gap size="sm" />
          <StandardText
            size="md"
            fontWeight="bold"
            style={{ textAlign: 'center' }}
          >
            Expenses Breakdown
          </StandardText>
          <PieChart
            data={expensesBreakdown}
            width={screenWidth - 40}
            height={210}
            accessor="population"
            backgroundColor="transparent"
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            }}
            paddingLeft="12"
          />
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
        <StandardCard style={[styles.kpiCard, { height: 350, width: '100%' }]}>
          <View style={styles.rowBetween}>
            <StandardText size="lg" fontWeight="bold">
              Issues & Maintenance
            </StandardText>
          </View>
          {maintenanceRequests.map(req => (
            <List.Item
              key={req.id}
              title={req.title}
              description={`Priority: ${req.priority}`}
              titleStyle={{
                fontFamily: 'Metropolis-Medium',
                fontSize: 16,
              }}
              descriptionStyle={{
                fontFamily: 'Metropolis-Regular',
                fontSize: 14,
              }}
              style={{}}
              left={() => (
                <MaterialCommunityIcons
                  name="wrench"
                  size={22}
                  color={colors.primary}
                />
              )}
              right={() => (
                <Chip
                  textStyle={{
                    fontFamily: 'Metropolis-Medium',
                    fontSize: 14,
                  }}
                >
                  {req.status}
                </Chip>
              )}
            />
          ))}
        </StandardCard>

        <Gap size="md" />

        {/* Tenant Leaderboard */}
        <StandardCard style={[styles.kpiCard, { height: 300, width: '100%' }]}>
          <StandardText size="lg" fontWeight="bold">
            Top Tenants
          </StandardText>
          {tenants.map(t => (
            <List.Item
              key={t.id}
              title={`${t.name} — ${t.room}`}
              description={t.status}
              titleStyle={{
                fontFamily: 'Metropolis-Medium',
                fontSize: 16,
              }}
              descriptionStyle={{
                fontFamily: 'Metropolis-Regular',
                fontSize: 14,
              }}
              style={{}}
              left={() => <Avatar.Icon size={36} icon="account-circle" />}
              right={() =>
                t.status === 'On-time' ? (
                  <Chip icon="star">Consistent</Chip>
                ) : (
                  <Chip icon="alert">Overdue</Chip>
                )
              }
            />
          ))}
        </StandardCard>

        <Gap size="md" />

        {/* 🪪 Tenant KYC Status */}
        {/* 🪪 Tenant KYC Overview */}
        <StandardCard style={[styles.kpiCard, { height: 350, width: '100%' }]}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <StandardText size="lg" fontWeight="bold">
              🪪 Tenant KYC
            </StandardText>
            <TouchableOpacity onPress={() => navigation.navigate('KYCDetails')}>
              <StandardText style={{ color: colors.primary }}>
                View More
              </StandardText>
            </TouchableOpacity>
          </View>

          {/* Summary */}
          <View style={styles.kycSummary}>
            <View
              style={[styles.kycSummaryBox, { backgroundColor: '#4CAF50' }]}
            >
              <StandardText fontWeight="bold" style={styles.kycSummaryText}>
                Verified: 12
              </StandardText>
            </View>
            <View
              style={[styles.kycSummaryBox, { backgroundColor: '#FFC107' }]}
            >
              <StandardText fontWeight="bold" style={styles.kycSummaryText}>
                Pending: 3
              </StandardText>
            </View>
            <View
              style={[styles.kycSummaryBox, { backgroundColor: '#F44336' }]}
            >
              <StandardText fontWeight="bold" style={styles.kycSummaryText}>
                Rejected: 1
              </StandardText>
            </View>
          </View>

          {/* Last 3 KYCs */}
          <StandardText
            size="md"
            fontWeight="semibold"
            style={{ marginTop: 8 }}
          >
            Last 3 KYC Submissions
          </StandardText>
          {[
            { name: 'Ravi Kumar', status: 'verified', date: '2025-08-30' },
            { name: 'Amit Sharma', status: 'pending', date: '2025-08-29' },
            { name: 'Neha Verma', status: 'rejected', date: '2025-08-28' },
          ].map((kyc, index) => (
            <View key={index} style={styles.kycRow}>
              <View>
                <StandardText>{kyc.name}</StandardText>
                <StandardText size="sm" style={{ color: '#666' }}>
                  Submitted: {kyc.date}
                </StandardText>
              </View>
              <View
                style={[
                  styles.kycBadge,
                  kyc.status === 'verified'
                    ? { backgroundColor: '#4CAF50' }
                    : kyc.status === 'pending'
                    ? { backgroundColor: '#FFC107' }
                    : { backgroundColor: '#F44336' },
                ]}
              >
                <StandardText fontWeight="bold" style={styles.kycText}>
                  {kyc.status.charAt(0).toUpperCase() + kyc.status.slice(1)}
                </StandardText>
              </View>
            </View>
          ))}
        </StandardCard>

        <Gap size="md" />

        {/* Occupancy Grid */}
        <StandardCard sstyle={[styles.kpiCard, { height: 300, width: '100%' }]}>
          <StandardText size="lg" fontWeight="bold">
            Room Occupancy Map
          </StandardText>
          <View style={styles.gridWrapper}>
            {occupancyGrid.map((room, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.roomBox,
                  { backgroundColor: getRoomColor(room.status) },
                ]}
                onPress={() => {
                  setSelectedAction({ label: 'RoomDetails', data: room });
                }}
              >
                <StandardText fontWeight="bold" style={styles.roomText}>
                  {room.room}
                </StandardText>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: '#4CAF50' }]}
              />
              <StandardText>Occupied</StandardText>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: '#F44336' }]}
              />
              <StandardText>Overdue</StandardText>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: '#BDBDBD' }]}
              />
              <StandardText>Vacant</StandardText>
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
  legendItem: { flexDirection: 'row', alignItems: 'center' },
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
});

export default Home;
