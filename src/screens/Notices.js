import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Components
import StandardText from '../components/StandardText/StandardText';

// Context
import { ThemeContext } from '../context/ThemeContext';

// Theme
import colors from '../theme/color';

// Payment Notice Card Component
const PaymentNoticeCard = ({ notice, onPress, mode }) => {
  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return '#ff4444';
      case 'medium':
        return '#ff9500';
      case 'low':
        return '#00c851';
      default:
        return '#9e9e9e';
    }
  };

  const unreadStyle = !notice.isRead
    ? {
        borderWidth: 2,
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 8,
      }
    : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.cardContainer}
    >
      <View
        style={[
          styles.paymentCard,
          {
            backgroundColor: colors.background,
            borderColor:
              mode === 'dark'
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.08)',
            borderLeftColor: getPriorityColor(notice.priority),
          },
          unreadStyle,
        ]}
      >
        {/* Header Row */}
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getPriorityColor(notice.priority) },
            ]}
          >
            <Icon name="cash-outline" size={20} color="white" />
          </View>
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <StandardText
                fontWeight="bold"
                size="medium"
                style={[styles.title, { color: colors.textPrimary }]}
              >
                {notice.title}
              </StandardText>
              {!notice.isRead && <View style={styles.unreadDot} />}
            </View>
            <StandardText
              style={[styles.description, { color: colors.textSecondary }]}
            >
              {notice.description}
            </StandardText>
          </View>
        </View>

        {/* Amount Section */}
        <View style={styles.amountSection}>
          <View style={styles.amountContainer}>
            <Icon name="wallet-outline" size={16} color={colors.success} />
            <StandardText
              fontWeight="bold"
              style={[styles.amount, { color: colors.success }]}
            >
              {notice.amount}
            </StandardText>
          </View>
        </View>

        {/* Footer */}
        <View
          style={[
            styles.cardFooter,
            {
              borderTopColor:
                mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.05)',
            },
          ]}
        >
          <View style={styles.tenantInfo}>
            <Icon
              name="person-outline"
              size={12}
              color={colors.textSecondary}
            />
            <StandardText
              size="small"
              style={[styles.tenantText, { color: colors.textSecondary }]}
            >
              {notice.tenantName}
            </StandardText>
            <Icon
              name="location-outline"
              size={12}
              color={colors.textSecondary}
              style={styles.roomIcon}
            />
            <StandardText
              size="small"
              style={[styles.roomText, { color: colors.textSecondary }]}
            >
              Room {notice.roomNumber}
            </StandardText>
          </View>
          <StandardText
            size="small"
            style={[styles.dateText, { color: colors.textSecondary }]}
          >
            {notice.date}
          </StandardText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Maintenance Notice Card Component
const MaintenanceNoticeCard = ({ notice, onPress, mode }) => {
  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return '#ff4444';
      case 'medium':
        return '#ff9500';
      case 'low':
        return '#00c851';
      default:
        return '#9e9e9e';
    }
  };

  const unreadStyle = !notice.isRead
    ? {
        borderWidth: 2,
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 8,
      }
    : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.cardContainer}
    >
      <View
        style={[
          styles.maintenanceCard,
          {
            backgroundColor: colors.background,
            borderColor:
              mode === 'dark'
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.08)',
            borderLeftColor: getPriorityColor(notice.priority),
          },
          unreadStyle,
        ]}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getPriorityColor(notice.priority) },
            ]}
          >
            <Icon name="construct-outline" size={20} color="white" />
          </View>
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <StandardText
                fontWeight="bold"
                size="medium"
                style={[styles.title, { color: colors.textPrimary }]}
              >
                {notice.title}
              </StandardText>
              {!notice.isRead && <View style={styles.unreadDot} />}
            </View>
            <StandardText
              style={[styles.description, { color: colors.textSecondary }]}
            >
              {notice.description}
            </StandardText>
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.statusSection}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  notice.status === 'completed'
                    ? 'rgba(0, 200, 81, 0.1)'
                    : notice.status === 'in-progress'
                    ? 'rgba(255, 149, 0, 0.1)'
                    : 'rgba(255, 68, 68, 0.1)',
              },
            ]}
          >
            <StandardText
              size="small"
              fontWeight="semibold"
              style={{
                color:
                  notice.status === 'completed'
                    ? colors.success
                    : notice.status === 'in-progress'
                    ? colors.warning
                    : colors.error,
              }}
            >
              {notice.status.toUpperCase()}
            </StandardText>
          </View>
        </View>

        {/* Footer */}
        <View
          style={[
            styles.cardFooter,
            {
              borderTopColor:
                mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.05)',
            },
          ]}
        >
          <View style={styles.tenantInfo}>
            <Icon
              name="person-outline"
              size={12}
              color={colors.textSecondary}
            />
            <StandardText
              size="small"
              style={[styles.tenantText, { color: colors.textSecondary }]}
            >
              {notice.tenantName}
            </StandardText>
            <Icon
              name="location-outline"
              size={12}
              color={colors.textSecondary}
              style={styles.roomIcon}
            />
            <StandardText
              size="small"
              style={[styles.roomText, { color: colors.textSecondary }]}
            >
              Room {notice.roomNumber}
            </StandardText>
          </View>
          <StandardText
            size="small"
            style={[styles.dateText, { color: colors.textSecondary }]}
          >
            {notice.date}
          </StandardText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Lease Notice Card Component
const LeaseNoticeCard = ({ notice, onPress, mode }) => {
  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return '#ff4444';
      case 'medium':
        return '#ff9500';
      case 'low':
        return '#00c851';
      default:
        return '#9e9e9e';
    }
  };

  const unreadStyle = !notice.isRead
    ? {
        borderWidth: 2,
        borderColor: colors.primary,
        shadowColor: colors.primary,
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 8,
      }
    : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.cardContainer}
    >
      <View
        style={[
          styles.leaseCard,
          {
            backgroundColor: colors.background,
            borderColor:
              mode === 'dark'
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.08)',
            borderLeftColor: getPriorityColor(notice.priority),
          },
          unreadStyle,
        ]}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: getPriorityColor(notice.priority) },
            ]}
          >
            <Icon name="document-text-outline" size={20} color="white" />
          </View>
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <StandardText
                fontWeight="bold"
                size="medium"
                style={[styles.title, { color: colors.textPrimary }]}
              >
                {notice.title}
              </StandardText>
              {!notice.isRead && <View style={styles.unreadDot} />}
            </View>
            <StandardText
              style={[styles.description, { color: colors.textSecondary }]}
            >
              {notice.description}
            </StandardText>
          </View>
        </View>

        {/* Lease Info */}
        <View style={styles.leaseInfo}>
          <View style={styles.leaseDetail}>
            <Icon name="calendar-outline" size={14} color={colors.primary} />
            <StandardText
              size="small"
              style={[styles.leaseText, { color: colors.textSecondary }]}
            >
              Expires Next Month
            </StandardText>
          </View>
        </View>

        {/* Footer */}
        <View
          style={[
            styles.cardFooter,
            {
              borderTopColor:
                mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.05)',
            },
          ]}
        >
          <View style={styles.tenantInfo}>
            <Icon
              name="person-outline"
              size={12}
              color={colors.textSecondary}
            />
            <StandardText
              size="small"
              style={[styles.tenantText, { color: colors.textSecondary }]}
            >
              {notice.tenantName}
            </StandardText>
            <Icon
              name="location-outline"
              size={12}
              color={colors.textSecondary}
              style={styles.roomIcon}
            />
            <StandardText
              size="small"
              style={[styles.roomText, { color: colors.textSecondary }]}
            >
              Room {notice.roomNumber}
            </StandardText>
          </View>
          <StandardText
            size="small"
            style={[styles.dateText, { color: colors.textSecondary }]}
          >
            {notice.date}
          </StandardText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Empty component
const EmptyNoticesComponent = React.memo(({ selectedFilter }) => (
  <View style={styles.emptyContainer}>
    <MaterialCommunityIcons
      name="bell-outline"
      size={64}
      color={colors.textSecondary}
    />
    <StandardText
      fontWeight="semibold"
      size="large"
      style={[styles.emptyTitle, { color: colors.textPrimary }]}
    >
      No Notices
    </StandardText>
    <StandardText
      style={[styles.emptySubtitle, { color: colors.textSecondary }]}
    >
      {selectedFilter === 'all'
        ? 'You have no notices at the moment'
        : `No ${selectedFilter} notices found`}
    </StandardText>
  </View>
));

// Main component styles
const styles = StyleSheet.create({
  // Card Container
  cardContainer: {
    marginBottom: 12,
  },

  // Common Card Styles
  paymentCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  maintenanceCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leaseCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Card Header
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
  },

  // Payment Specific
  amountSection: {
    marginBottom: 12,
    paddingLeft: 52, // Align with content
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    marginLeft: 6,
    fontSize: 16,
  },

  // Maintenance Specific
  statusSection: {
    marginBottom: 12,
    paddingLeft: 52, // Align with content
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // Lease Specific
  leaseInfo: {
    marginBottom: 12,
    paddingLeft: 52, // Align with content
  },
  leaseDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaseText: {
    marginLeft: 6,
  },

  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  tenantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tenantText: {
    marginLeft: 4,
    maxWidth: 100,
  },
  roomIcon: {
    marginLeft: 12,
  },
  roomText: {
    marginLeft: 4,
    maxWidth: 70,
  },
  dateText: {
    minWidth: 80,
    textAlign: 'right',
  },

  // Filter Chips
  filterChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minWidth: 60,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 12,
    lineHeight: 14,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    marginTop: 16,
  },
  emptySubtitle: {
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

const Notices = ({ navigation }) => {
  // Theme
  const { mode } = useContext(ThemeContext);

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
  const [refreshing, setRefreshing] = useState(false);
  const [notices, setNotices] = useState(mockNotices);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Memoized empty component
  const EmptyComponent = useCallback(
    () => <EmptyNoticesComponent selectedFilter={selectedFilter} />,
    [selectedFilter],
  );

  // Filter options with counts
  const getFilterOptions = useCallback(() => {
    const unreadCount = notices.filter(notice => !notice.isRead).length;
    const paymentCount = notices.filter(
      notice => notice.type === 'payment',
    ).length;
    const maintenanceCount = notices.filter(
      notice => notice.type === 'maintenance',
    ).length;
    const leaseCount = notices.filter(notice => notice.type === 'lease').length;

    return [
      { key: 'all', label: 'All', icon: 'list-outline', count: notices.length },
      {
        key: 'unread',
        label: 'Unread',
        icon: 'mail-unread-outline',
        count: unreadCount,
      },
      {
        key: 'payment',
        label: 'Payment',
        icon: 'cash-outline',
        count: paymentCount,
      },
      {
        key: 'maintenance',
        label: 'Maintenance',
        icon: 'construct-outline',
        count: maintenanceCount,
      },
      {
        key: 'lease',
        label: 'Lease',
        icon: 'document-text-outline',
        count: leaseCount,
      },
    ];
  }, [notices]);

  // Load notices
  const loadNotices = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotices(mockNotices);
    } catch (error) {
      console.error('Failed to load notices:', error);
      Alert.alert('Error', 'Failed to load notices. Please try again.');
    }
  }, [mockNotices]);

  // Refresh notices
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotices();
    setRefreshing(false);
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
  const markAsRead = useCallback(noticeId => {
    setNotices(prev =>
      (prev || []).map(notice =>
        notice.id === noticeId ? { ...notice, isRead: true } : notice,
      ),
    );
  }, []);

  // Handle notice action
  const handleNoticeAction = useCallback(
    notice => {
      markAsRead(notice.id);
      switch (notice.type) {
        case 'payment':
          Alert.alert(
            'Payment Notice',
            `Handle payment for ${notice.tenantName} - ${notice.amount}`,
          );
          break;
        case 'maintenance':
          navigation.navigate('Tickets');
          break;
        case 'lease':
          navigation.navigate('TenantDetails', { tenantId: notice.tenantName });
          break;
        default:
          Alert.alert('Notice', notice.description);
      }
    },
    [navigation, markAsRead],
  );

  // Render notice item based on type
  const renderNoticeItem = ({ item: notice }) => {
    const commonProps = {
      notice,
      // onPress: () => handleNoticeAction(notice),
      mode,
    };

    switch (notice.type) {
      case 'payment':
        return <PaymentNoticeCard {...commonProps} />;
      case 'maintenance':
        return <MaintenanceNoticeCard {...commonProps} />;
      case 'lease':
        return <LeaseNoticeCard {...commonProps} />;
      default:
        return <PaymentNoticeCard {...commonProps} />;
    }
  };

  // Render filter chip
  const renderFilterChip = filter => {
    const isSelected = selectedFilter === filter.key;
    return (
      <TouchableOpacity
        key={filter.key}
        onPress={() => setSelectedFilter(filter.key)}
        style={[
          styles.filterChip,
          {
            backgroundColor: isSelected
              ? colors.primary
              : mode === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(0, 0, 0, 0.02)',
            borderColor: isSelected
              ? colors.primary
              : mode === 'dark'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.1)',
          },
        ]}
        activeOpacity={0.7}
      >
        <Icon
          name={filter.icon}
          size={14}
          color={isSelected ? colors.white : colors.textSecondary}
          style={styles.filterIcon}
        />
        <StandardText
          style={[
            styles.filterText,
            {
              color: isSelected ? colors.white : colors.textSecondary,
              fontWeight: isSelected ? '600' : '400',
            },
          ]}
        >
          {filter.label}
        </StandardText>
        {filter.count > 0 && (
          <View
            style={{
              backgroundColor: isSelected
                ? 'rgba(255, 255, 255, 0.2)'
                : colors.primary,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 8,
              marginLeft: 4,
              minWidth: 18,
              height: 16,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <StandardText
              style={{
                color: colors.white,
                fontSize: 10,
                fontWeight: '600',
                lineHeight: 12,
              }}
            >
              {filter.count}
            </StandardText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Load notices on mount
  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  // Component styles
  const componentStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor:
        mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      backgroundColor: colors.background,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      color: colors.textPrimary,
    },
    headerSubtitle: {
      color: colors.textSecondary,
      marginTop: 2,
    },
    addButton: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    filterContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    listContainer: {
      paddingHorizontal: 20,
      paddingBottom: 100,
    },
  });

  return (
    <SafeAreaView style={componentStyles.container}>
      {/* Header */}
      <View style={componentStyles.header}>
        <View style={componentStyles.headerRow}>
          <View>
            <StandardText
              fontWeight="bold"
              size="large"
              style={componentStyles.headerTitle}
            >
              Notices
            </StandardText>
            <StandardText style={componentStyles.headerSubtitle}>
              {filteredNotices.length}{' '}
              {filteredNotices.length === 1 ? 'notice' : 'notices'}
            </StandardText>
          </View>
          <TouchableOpacity
            onPress={() => Alert.alert('Create Notice', 'Feature coming soon!')}
            style={componentStyles.addButton}
            activeOpacity={0.8}
          >
            <Icon name="add" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={componentStyles.filterContainer}
      >
        {getFilterOptions().map(renderFilterChip)}
      </ScrollView>

      {/* Notices List */}
      <FlatList
        data={filteredNotices}
        renderItem={renderNoticeItem}
        keyExtractor={item => item.id}
        contentContainerStyle={componentStyles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={EmptyComponent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default Notices;
