import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { Chip } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Components
import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import StandardCard from '../components/StandardCard/StandardCard';
import Gap from '../components/Gap/Gap';
import AnimatedLoader from '../components/AnimatedLoader/AnimatedLoader';

// Context
import { ThemeContext } from '../context/ThemeContext';

// Theme
import colors from '../theme/colors';
import { RADIUS, SHADOW } from '../theme/layout';

const Notices = ({ navigation }) => {
  // Theme
  const { theme: mode } = useContext(ThemeContext);
  const isDark = mode === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  // Mock data
  const mockNotices = React.useMemo(
    () => [
      {
        id: '1',
        title: 'Rent Due Reminder',
        description:
          'Monthly rent payment is due for Room 101. Please ensure payment is made by the due date.',
        type: 'payment',
        priority: 'high',
        date: '2025-09-05',
        tenantName: 'John Doe',
        roomNumber: '101',
        amount: '₹15,000',
        status: 'pending',
        isRead: false,
      },
      {
        id: '2',
        title: 'Maintenance Request',
        description:
          'AC repair needed in Room 205. Tenant reported cooling issues.',
        type: 'maintenance',
        priority: 'medium',
        date: '2025-09-04',
        tenantName: 'Jane Smith',
        roomNumber: '205',
        status: 'in-progress',
        isRead: true,
      },
      {
        id: '3',
        title: 'Lease Renewal',
        description:
          'Lease agreement expires next month for Room 303. Renewal discussion needed.',
        type: 'lease',
        priority: 'low',
        date: '2025-09-03',
        tenantName: 'Mike Johnson',
        roomNumber: '303',
        status: 'pending',
        isRead: false,
      },
      {
        id: '4',
        title: 'Payment Received',
        description:
          'Rent payment confirmed for Room 102. Thank you for timely payment.',
        type: 'payment',
        priority: 'low',
        date: '2025-09-02',
        tenantName: 'Sarah Wilson',
        roomNumber: '102',
        amount: '₹12,000',
        status: 'completed',
        isRead: false,
      },
      {
        id: '5',
        title: 'Maintenance Completed',
        description:
          'Plumbing issue resolved in Room 405. All repairs completed successfully.',
        type: 'maintenance',
        priority: 'medium',
        date: '2025-09-01',
        tenantName: 'David Brown',
        roomNumber: '405',
        status: 'completed',
        isRead: true,
      },
    ],
    [],
  );

  // State
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notices, setNotices] = useState(mockNotices);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Filter options with counts matching PaymentHistory style
  const filterOptions = [
    { key: 'all', label: 'All Notices', icon: 'bell' },
    { key: 'unread', label: 'Unread', icon: 'bell-ring' },
    { key: 'payment', label: 'Payment', icon: 'cash' },
    { key: 'maintenance', label: 'Maintenance', icon: 'wrench' },
    { key: 'lease', label: 'Lease', icon: 'file-document' },
  ];

  const getFilterCounts = () => {
    const unreadCount = notices.filter(notice => !notice.isRead).length;
    const paymentCount = notices.filter(
      notice => notice.type === 'payment',
    ).length;
    const maintenanceCount = notices.filter(
      notice => notice.type === 'maintenance',
    ).length;
    const leaseCount = notices.filter(notice => notice.type === 'lease').length;

    return {
      all: notices.length,
      unread: unreadCount,
      payment: paymentCount,
      maintenance: maintenanceCount,
      lease: leaseCount,
    };
  };

  const filterCounts = getFilterCounts();

  // Stats calculations
  const totalNotices = notices.length;
  const unreadNotices = notices.filter(notice => !notice.isRead).length;
  const highPriorityNotices = notices.filter(
    notice => notice.priority === 'high',
  ).length;
  const pendingActions = notices.filter(
    notice => notice.status === 'pending',
  ).length;

  // Load notices
  const loadNotices = useCallback(async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotices(mockNotices);
    } catch (error) {
      console.error('Failed to load notices:', error);
      Alert.alert('Error', 'Failed to load notices. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mockNotices]);

  // Refresh notices
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotices();
  }, [loadNotices]);

  // Filter notices
  const filteredNotices = (notices || []).filter(notice => {
    switch (selectedFilter) {
      case 'unread':
        return !notice.isRead;
      case 'payment':
      case 'maintenance':
      case 'lease':
        return notice.type === selectedFilter;
      default:
        return true;
    }
  });

  // Mark notice as read
  const handleNoticePress = noticeId => {
    setNotices(prev =>
      (prev || []).map(notice =>
        notice.id === noticeId ? { ...notice, isRead: true } : notice,
      ),
    );
  };

  // Get priority color
  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  // Get status color
  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'in-progress':
        return colors.warning;
      case 'pending':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  // Get type icon
  const getTypeIcon = type => {
    switch (type) {
      case 'payment':
        return 'cash';
      case 'maintenance':
        return 'wrench';
      case 'lease':
        return 'file-document';
      default:
        return 'bell';
    }
  };

  // Load notices on mount
  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StandardHeader
          navigation={navigation}
          title="Notices"
          subtitle="Stay updated with notifications"
          showBackButton
        />
        <AnimatedLoader
          message="Loading notices..."
          icon="bell"
          fullScreen={false}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StandardHeader
        navigation={navigation}
        title="Notices"
        subtitle="Stay updated with notifications"
        showBackButton
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Cards Row 1 */}
        <View style={styles.summaryContainer}>
          <StandardCard
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="bell"
                size={24}
                color={colors.primary}
              />
              <StandardText
                fontWeight="medium"
                size="sm"
                style={[styles.cardTitle, { color: textSecondary }]}
              >
                Total Notices
              </StandardText>
            </View>
            <StandardText
              fontWeight="bold"
              size="xl"
              style={[styles.cardValue, { color: colors.primary }]}
            >
              {totalNotices}
            </StandardText>
            <StandardText
              size="xs"
              style={[styles.cardSubtext, { color: textSecondary }]}
            >
              All notifications
            </StandardText>
          </StandardCard>

          <StandardCard
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="bell-ring"
                size={24}
                color={colors.warning}
              />
              <StandardText
                fontWeight="medium"
                size="sm"
                style={[styles.cardTitle, { color: textSecondary }]}
              >
                Unread
              </StandardText>
            </View>
            <StandardText
              fontWeight="bold"
              size="xl"
              style={[styles.cardValue, { color: colors.warning }]}
            >
              {unreadNotices}
            </StandardText>
            <StandardText
              size="xs"
              style={[styles.cardSubtext, { color: textSecondary }]}
            >
              New notifications
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
                name="alert-circle"
                size={24}
                color={colors.error}
              />
              <StandardText
                fontWeight="medium"
                size="sm"
                style={[styles.cardTitle, { color: textSecondary }]}
              >
                High Priority
              </StandardText>
            </View>
            <StandardText
              fontWeight="bold"
              size="xl"
              style={[styles.cardValue, { color: colors.error }]}
            >
              {highPriorityNotices}
            </StandardText>
            <StandardText
              size="xs"
              style={[styles.cardSubtext, { color: textSecondary }]}
            >
              Urgent attention
            </StandardText>
          </StandardCard>

          <StandardCard
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="clock-alert"
                size={24}
                color={colors.success}
              />
              <StandardText
                fontWeight="medium"
                size="sm"
                style={[styles.cardTitle, { color: textSecondary }]}
              >
                Pending Actions
              </StandardText>
            </View>
            <StandardText
              fontWeight="bold"
              size="xl"
              style={[styles.cardValue, { color: colors.success }]}
            >
              {pendingActions}
            </StandardText>
            <StandardText
              size="xs"
              style={[styles.cardSubtext, { color: textSecondary }]}
            >
              Requires action
            </StandardText>
          </StandardCard>
        </View>

        <Gap size="lg" />

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <StandardText
            fontWeight="bold"
            size="sm"
            style={[styles.filterLabel, { color: textSecondary }]}
          >
            Filter By Category
          </StandardText>
          <Gap size="sm" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
          >
            {filterOptions.map(filter => (
              <Chip
                key={filter.key}
                mode="flat"
                selected={selectedFilter === filter.key}
                onPress={() => setSelectedFilter(filter.key)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      selectedFilter === filter.key
                        ? colors.primary
                        : cardBackground,
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
                    size={18}
                    color={
                      selectedFilter === filter.key ? colors.white : textPrimary
                    }
                  />
                )}
                selectedColor={colors.white}
              >
                {filter.label} ({filterCounts[filter.key]})
              </Chip>
            ))}
          </ScrollView>
        </View>

        <Gap size="lg" />

        {/* Notices List Header */}
        <View style={styles.listHeader}>
          <StandardText
            fontWeight="bold"
            size="lg"
            style={{ color: textPrimary }}
          >
            Notice Records
          </StandardText>
          <View style={styles.countBadge}>
            <StandardText
              fontWeight="bold"
              size="sm"
              style={{ color: colors.primary }}
            >
              {filteredNotices.length}
            </StandardText>
          </View>
        </View>

        <Gap size="md" />

        {/* Notices List */}
        {filteredNotices.length > 0 ? (
          filteredNotices.map(notice => (
            <StandardCard
              style={[
                styles.noticeCard,
                { backgroundColor: cardBackground },
                !notice.isRead && styles.unreadCard,
              ]}
              key={notice.id}
            >
              <View style={styles.noticeHeader}>
                <View style={styles.noticeInfo}>
                  <View style={styles.noticeTitleRow}>
                    <MaterialCommunityIcons
                      name={getTypeIcon(notice.type)}
                      size={20}
                      color={getPriorityColor(notice.priority)}
                    />
                    <StandardText
                      fontWeight="bold"
                      size="lg"
                      style={{ color: textPrimary, marginLeft: 8, flex: 1 }}
                    >
                      {notice.title}
                    </StandardText>
                    {!notice.isRead && (
                      <View style={styles.unreadBadge}>
                        <StandardText
                          size="xs"
                          fontWeight="bold"
                          style={{ color: colors.white }}
                        >
                          NEW
                        </StandardText>
                      </View>
                    )}
                  </View>
                  <StandardText
                    size="sm"
                    style={{ color: textSecondary, marginTop: 6 }}
                  >
                    {notice.description}
                  </StandardText>

                  {/* Meta Information */}
                  <View style={styles.noticeMetaRow}>
                    <View style={styles.noticeMeta}>
                      <MaterialCommunityIcons
                        name="account"
                        size={12}
                        color={textSecondary}
                      />
                      <StandardText
                        size="xs"
                        style={{ color: textSecondary, marginLeft: 4 }}
                      >
                        {notice.tenantName}
                      </StandardText>
                    </View>
                    <View style={styles.noticeMeta}>
                      <MaterialCommunityIcons
                        name="home"
                        size={12}
                        color={textSecondary}
                      />
                      <StandardText
                        size="xs"
                        style={{ color: textSecondary, marginLeft: 4 }}
                      >
                        Room {notice.roomNumber}
                      </StandardText>
                    </View>
                    <View style={styles.noticeMeta}>
                      <MaterialCommunityIcons
                        name="calendar"
                        size={12}
                        color={textSecondary}
                      />
                      <StandardText
                        size="xs"
                        style={{ color: textSecondary, marginLeft: 4 }}
                      >
                        {new Date(notice.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </StandardText>
                    </View>
                  </View>
                </View>

                {/* Amount or Status */}
                <View style={styles.noticeAmount}>
                  {notice.amount && (
                    <StandardText
                      fontWeight="bold"
                      size="xl"
                      style={{ color: colors.primary }}
                    >
                      {notice.amount}
                    </StandardText>
                  )}
                </View>
              </View>

              {/* Footer with badges */}
              <View style={styles.noticeFooter}>
                <View
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: getPriorityColor(notice.priority) + '20',
                    },
                  ]}
                >
                  <StandardText
                    fontWeight="bold"
                    size="xs"
                    style={{ color: getPriorityColor(notice.priority) }}
                  >
                    {notice.priority.toUpperCase()}
                  </StandardText>
                </View>

                <View
                  style={[
                    styles.statusChip,
                    { backgroundColor: getStatusColor(notice.status) + '20' },
                  ]}
                >
                  <StandardText
                    fontWeight="bold"
                    size="xs"
                    style={{ color: getStatusColor(notice.status) }}
                  >
                    {notice.status.toUpperCase().replace('-', ' ')}
                  </StandardText>
                </View>

                <View
                  style={[
                    styles.typeChip,
                    { backgroundColor: colors.primary + '20' },
                  ]}
                >
                  <StandardText
                    fontWeight="bold"
                    size="xs"
                    style={{ color: colors.primary }}
                  >
                    {notice.type.toUpperCase()}
                  </StandardText>
                </View>
              </View>
            </StandardCard>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={80}
              color={textSecondary}
            />
            <StandardText
              fontWeight="bold"
              size="xl"
              style={{ color: textPrimary, marginTop: 16 }}
            >
              No Notices Found
            </StandardText>
            <StandardText
              size="md"
              style={{
                color: textSecondary,
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              {selectedFilter === 'all'
                ? 'You have no notices at the moment'
                : `No ${selectedFilter} notices found`}
            </StandardText>
          </View>
        )}

        <Gap size="xl" />
      </ScrollView>
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
    fontSize: 24,
    marginTop: 4,
  },
  cardSubtext: {
    marginTop: 4,
    fontSize: 10,
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
    height: 36,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: 'Metropolis-Medium',
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
  noticeCard: {
    marginVertical: 8,
    padding: 18,
    borderRadius: RADIUS.large,
    ...SHADOW.medium,
    shadowColor: colors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(238, 123, 17, 0.08)',
  },
  unreadCard: {
    borderWidth: 2,
    borderColor: colors.primary + '40',
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  noticeInfo: {
    flex: 1,
  },
  noticeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  noticeMetaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  noticeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeAmount: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  noticeFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
});

export default Notices;
