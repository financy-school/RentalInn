import React, { useState, useCallback, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Components
import StandardHeader from '../components/StandardHeader/StandardHeader';
import StandardText from '../components/StandardText/StandardText';
import StandardCard from '../components/StandardCard/StandardCard';
import AnimatedLoader from '../components/AnimatedLoader/AnimatedLoader';
import colors from '../theme/colors';
import { SHADOW, RADIUS } from '../theme/layout';

// Context
import { ThemeContext } from '../context/ThemeContext';
import { CredentialsContext } from '../context/CredentialsContext';

// Services
import {
  getNotifications,
  getNotificationStats,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../services/NetworkUtils';

const Notices = ({ navigation }) => {
  // Theme
  const { theme: mode } = useContext(ThemeContext);
  const { credentials } = useContext(CredentialsContext);
  const isDark = mode === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  // State
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notices, setNotices] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    high_priority: 0,
    pending: 0,
  });

  // Filter options
  const filterOptions = [
    { key: 'all', label: 'All Notices', icon: 'bell' },
    { key: 'unread', label: 'Unread', icon: 'bell-ring' },
    { key: 'payment', label: 'Payment', icon: 'cash' },
    { key: 'maintenance', label: 'Maintenance', icon: 'wrench' },
    { key: 'lease', label: 'Lease', icon: 'file-document' },
  ];

  const getFilterCounts = () => {
    // Ensure notices is always an array before filtering
    const noticesArray = Array.isArray(notices) ? notices : [];

    return {
      all: noticesArray.length,
      unread: noticesArray.filter(n => !n.is_read).length,
      payment: noticesArray.filter(n => n.type === 'payment').length,
      maintenance: noticesArray.filter(n => n.type === 'maintenance').length,
      lease: noticesArray.filter(n => n.type === 'lease').length,
    };
  };

  const filterCounts = getFilterCounts();

  // Load notifications from API
  const loadNotices = useCallback(async () => {
    if (!credentials?.accessToken) {
      console.warn('No access token available');
      return;
    }

    try {
      setLoading(true);

      // Get notifications
      const notificationsResponse = await getNotifications(
        credentials.accessToken,
        {
          page: 1,
          limit: 50,
        },
      );

      console.log('📥 Notifications API response:', {
        success: notificationsResponse?.success,
        dataType: typeof notificationsResponse?.data,
        isArray: Array.isArray(notificationsResponse?.data),
        dataKeys: notificationsResponse?.data
          ? Object.keys(notificationsResponse.data)
          : 'null',
      });

      if (notificationsResponse.success) {
        // Handle both paginated and non-paginated responses
        let notificationsData = notificationsResponse.data;

        // If data is an object with a 'data' property (paginated response)
        if (
          notificationsData &&
          typeof notificationsData === 'object' &&
          !Array.isArray(notificationsData)
        ) {
          if (Array.isArray(notificationsData.data)) {
            notificationsData = notificationsData.data;
          } else if (Array.isArray(notificationsData.notifications)) {
            notificationsData = notificationsData.notifications;
          }
        }

        // Ensure we always set an array
        setNotices(Array.isArray(notificationsData) ? notificationsData : []);
      } else {
        setNotices([]);
      }

      // Get stats
      const statsResponse = await getNotificationStats(credentials.accessToken);
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotices([]); // Ensure notices is always an array even on error
    } finally {
      setLoading(false);
    }
  }, [credentials]);

  // Refresh notices
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotices();
    setRefreshing(false);
  }, [loadNotices]);

  // Filter notices
  const filteredNotices = (Array.isArray(notices) ? notices : []).filter(
    notice => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'unread') return !notice.is_read;
      return notice.type === selectedFilter;
    },
  );

  // Mark notice as read
  const handleNoticePress = async noticeId => {
    if (!credentials?.accessToken) return;

    try {
      // Find the notice
      const noticesArray = Array.isArray(notices) ? notices : [];
      const notice = noticesArray.find(n => n.notification_id === noticeId);
      if (!notice || notice.is_read) return;

      // Mark as read in API
      await markNotificationAsRead(credentials.accessToken, noticeId);

      // Update local state
      setNotices(prevNotices => {
        const prevArray = Array.isArray(prevNotices) ? prevNotices : [];
        return prevArray.map(n =>
          n.notification_id === noticeId ? { ...n, is_read: true } : n,
        );
      });

      // Update stats
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Delete notification
  const handleDeleteNotice = async noticeId => {
    if (!credentials?.accessToken) return;

    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNotification(credentials.accessToken, noticeId);

              // Update local state
              setNotices(prevNotices => {
                const prevArray = Array.isArray(prevNotices) ? prevNotices : [];
                return prevArray.filter(n => n.notification_id !== noticeId);
              });

              // Reload stats
              const statsResponse = await getNotificationStats(
                credentials.accessToken,
              );
              if (statsResponse.success && statsResponse.data) {
                setStats(statsResponse.data);
              }
            } catch (error) {
              console.error('Error deleting notification:', error);
              Alert.alert('Error', 'Failed to delete notification');
            }
          },
        },
      ],
    );
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (!credentials?.accessToken) return;

    try {
      await markAllNotificationsAsRead(credentials.accessToken);

      // Update local state
      setNotices(prevNotices => {
        const prevArray = Array.isArray(prevNotices) ? prevNotices : [];
        return prevArray.map(n => ({ ...n, is_read: true }));
      });

      // Update stats
      setStats(prev => ({
        ...prev,
        unread: 0,
      }));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
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

  // Format date
  const formatDate = dateString => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  // Load notices on mount
  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  if (loading && notices.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StandardHeader
          navigation={navigation}
          title="Notices"
          subtitle="Stay updated with all notifications"
          showBackButton
        />
        <AnimatedLoader
          message="Loading notifications..."
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
        subtitle="Stay updated with all notifications"
        showBackButton
      />
      <View style={styles.content}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <StandardCard
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="bell"
                size={18}
                color={colors.primary}
              />
              <StandardText
                style={[
                  styles.cardTitle,
                  {
                    color: textSecondary,
                    fontFamily: 'Metropolis-Medium',
                  },
                ]}
              >
                Total
              </StandardText>
            </View>
            <StandardText
              style={[
                styles.cardValue,
                { color: textPrimary, fontFamily: 'Metropolis-Bold' },
              ]}
            >
              {stats.total}
            </StandardText>
            <StandardText
              style={[
                styles.cardSubtext,
                {
                  color: textSecondary,
                  fontFamily: 'Metropolis-Regular',
                },
              ]}
            >
              All notices
            </StandardText>
          </StandardCard>

          <StandardCard
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="bell-ring"
                size={18}
                color={colors.warning}
              />
              <StandardText
                style={[
                  styles.cardTitle,
                  {
                    color: textSecondary,
                    fontFamily: 'Metropolis-Medium',
                  },
                ]}
              >
                Unread
              </StandardText>
            </View>
            <StandardText
              style={[
                styles.cardValue,
                {
                  color: colors.warning,
                  fontFamily: 'Metropolis-Bold',
                },
              ]}
            >
              {stats.unread}
            </StandardText>
            <StandardText
              style={[
                styles.cardSubtext,
                {
                  color: textSecondary,
                  fontFamily: 'Metropolis-Regular',
                },
              ]}
            >
              Need attention
            </StandardText>
          </StandardCard>
        </View>

        <View style={styles.summaryContainer}>
          <StandardCard
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={18}
                color={colors.error}
              />
              <StandardText
                style={[
                  styles.cardTitle,
                  {
                    color: textSecondary,
                    fontFamily: 'Metropolis-Medium',
                  },
                ]}
              >
                Priority
              </StandardText>
            </View>
            <StandardText
              style={[
                styles.cardValue,
                {
                  color: colors.error,
                  fontFamily: 'Metropolis-Bold',
                },
              ]}
            >
              {stats.high_priority}
            </StandardText>
            <StandardText
              style={[
                styles.cardSubtext,
                {
                  color: textSecondary,
                  fontFamily: 'Metropolis-Regular',
                },
              ]}
            >
              High priority
            </StandardText>
          </StandardCard>

          <StandardCard
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="clock-alert"
                size={18}
                color={colors.primary}
              />
              <StandardText
                style={[
                  styles.cardTitle,
                  {
                    color: textSecondary,
                    fontFamily: 'Metropolis-Medium',
                  },
                ]}
              >
                Pending
              </StandardText>
            </View>
            <StandardText
              style={[
                styles.cardValue,
                {
                  color: colors.primary,
                  fontFamily: 'Metropolis-Bold',
                },
              ]}
            >
              {stats.pending}
            </StandardText>
            <StandardText
              style={[
                styles.cardSubtext,
                {
                  color: textSecondary,
                  fontFamily: 'Metropolis-Regular',
                },
              ]}
            >
              Actions needed
            </StandardText>
          </StandardCard>
        </View>

        {/* Filter Section */}
        <View style={[styles.filterSection, { marginTop: 20 }]}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <StandardText
              style={[
                styles.filterLabel,
                {
                  color: textSecondary,
                  fontFamily: 'Metropolis-SemiBold',
                },
              ]}
            >
              Filter Notices
            </StandardText>
            {stats.unread > 0 && (
              <TouchableOpacity onPress={handleMarkAllRead}>
                <StandardText
                  style={{
                    color: colors.primary,
                    fontSize: 14,
                    fontFamily: 'Metropolis-Medium',
                  }}
                >
                  Mark All Read
                </StandardText>
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filterOptions}
            keyExtractor={item => item.key}
            contentContainerStyle={styles.filterContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      selectedFilter === item.key
                        ? colors.primary
                        : cardBackground,
                  },
                ]}
                onPress={() => setSelectedFilter(item.key)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={16}
                    color={
                      selectedFilter === item.key
                        ? colors.white
                        : colors.primary
                    }
                  />
                  <StandardText
                    style={[
                      styles.filterChipText,
                      {
                        color:
                          selectedFilter === item.key
                            ? colors.white
                            : textPrimary,
                        marginLeft: 6,
                      },
                    ]}
                  >
                    {item.label}
                  </StandardText>
                  {filterCounts[item.key] > 0 && (
                    <View
                      style={{
                        backgroundColor:
                          selectedFilter === item.key
                            ? 'rgba(255,255,255,0.3)'
                            : colors.primary + '20',
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 10,
                        marginLeft: 6,
                      }}
                    >
                      <StandardText
                        style={{
                          color:
                            selectedFilter === item.key
                              ? colors.white
                              : colors.primary,
                          fontSize: 11,
                          fontFamily: 'Metropolis-Bold',
                        }}
                      >
                        {filterCounts[item.key]}
                      </StandardText>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Notices List */}
        <FlatList
          data={filteredNotices}
          keyExtractor={item => item.notification_id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <StandardText
                style={[
                  styles.filterLabel,
                  {
                    color: textSecondary,
                    fontFamily: 'Metropolis-SemiBold',
                    marginTop: 20,
                    marginBottom: 12,
                  },
                ]}
              >
                {selectedFilter === 'all'
                  ? 'All Notices'
                  : selectedFilter === 'unread'
                  ? 'Unread Notices'
                  : `${
                      selectedFilter.charAt(0).toUpperCase() +
                      selectedFilter.slice(1)
                    } Notices`}
              </StandardText>
              <View style={styles.countBadge}>
                <StandardText
                  style={{
                    color: colors.primary,
                    fontSize: 12,
                    fontFamily: 'Metropolis-Bold',
                  }}
                >
                  {filteredNotices.length}
                </StandardText>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.noticeCard,
                { backgroundColor: cardBackground },
                !item.is_read && styles.unreadCard,
              ]}
              onPress={() => handleNoticePress(item.notification_id)}
              onLongPress={() => handleDeleteNotice(item.notification_id)}
            >
              <View style={styles.noticeHeader}>
                <View style={styles.noticeInfo}>
                  <View style={styles.noticeTitleRow}>
                    <StandardText
                      style={{
                        fontSize: 16,
                        color: textPrimary,
                        fontFamily: 'Metropolis-Bold',
                        flex: 1,
                      }}
                    >
                      {item.title}
                    </StandardText>
                    {!item.is_read && (
                      <View style={styles.unreadBadge}>
                        <StandardText
                          style={{
                            color: colors.white,
                            fontSize: 10,
                            fontFamily: 'Metropolis-Bold',
                          }}
                        >
                          NEW
                        </StandardText>
                      </View>
                    )}
                  </View>

                  <StandardText
                    style={{
                      fontSize: 14,
                      color: textSecondary,
                      fontFamily: 'Metropolis-Regular',
                      marginTop: 6,
                      lineHeight: 20,
                    }}
                  >
                    {item.description}
                  </StandardText>

                  <View style={styles.noticeMetaRow}>
                    {item.tenant_name && (
                      <View style={styles.noticeMeta}>
                        <MaterialCommunityIcons
                          name="account"
                          size={14}
                          color={textSecondary}
                        />
                        <StandardText
                          style={{
                            fontSize: 12,
                            color: textSecondary,
                            fontFamily: 'Metropolis-Medium',
                            marginLeft: 4,
                          }}
                        >
                          {item.tenant_name}
                        </StandardText>
                      </View>
                    )}

                    {item.room_number && (
                      <View style={styles.noticeMeta}>
                        <MaterialCommunityIcons
                          name="door"
                          size={14}
                          color={textSecondary}
                        />
                        <StandardText
                          style={{
                            fontSize: 12,
                            color: textSecondary,
                            fontFamily: 'Metropolis-Medium',
                            marginLeft: 4,
                          }}
                        >
                          Room {item.room_number}
                        </StandardText>
                      </View>
                    )}

                    <View style={styles.noticeMeta}>
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={14}
                        color={textSecondary}
                      />
                      <StandardText
                        style={{
                          fontSize: 12,
                          color: textSecondary,
                          fontFamily: 'Metropolis-Medium',
                          marginLeft: 4,
                        }}
                      >
                        {formatDate(item.created_at)}
                      </StandardText>
                    </View>
                  </View>
                </View>

                {item.amount && (
                  <View style={styles.noticeAmount}>
                    <StandardText
                      style={{
                        fontSize: 18,
                        color: colors.primary,
                        fontFamily: 'Metropolis-Bold',
                      }}
                    >
                      ₹{item.amount.toLocaleString()}
                    </StandardText>
                  </View>
                )}
              </View>

              <View style={styles.noticeFooter}>
                <View
                  style={[
                    styles.typeChip,
                    { backgroundColor: colors.primary + '15' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={getTypeIcon(item.type)}
                    size={14}
                    color={colors.primary}
                  />
                  <StandardText
                    style={{
                      fontSize: 11,
                      color: colors.primary,
                      fontFamily: 'Metropolis-Bold',
                      marginLeft: 4,
                      textTransform: 'capitalize',
                    }}
                  >
                    {item.type}
                  </StandardText>
                </View>

                <View
                  style={[
                    styles.categoryChip,
                    { backgroundColor: getPriorityColor(item.priority) + '15' },
                  ]}
                >
                  <StandardText
                    style={{
                      fontSize: 11,
                      color: getPriorityColor(item.priority),
                      fontFamily: 'Metropolis-Bold',
                      textTransform: 'capitalize',
                    }}
                  >
                    {item.priority}
                  </StandardText>
                </View>

                <View
                  style={[
                    styles.statusChip,
                    { backgroundColor: getStatusColor(item.status) + '15' },
                  ]}
                >
                  <StandardText
                    style={{
                      fontSize: 11,
                      color: getStatusColor(item.status),
                      fontFamily: 'Metropolis-Bold',
                      textTransform: 'capitalize',
                    }}
                  >
                    {item.status}
                  </StandardText>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="bell-off"
                size={64}
                color={textSecondary}
              />
              <StandardText
                style={{
                  fontSize: 16,
                  color: textSecondary,
                  fontFamily: 'Metropolis-Medium',
                  marginTop: 16,
                }}
              >
                No notifications found
              </StandardText>
              <StandardText
                style={{
                  fontSize: 14,
                  color: textSecondary,
                  fontFamily: 'Metropolis-Regular',
                  marginTop: 8,
                  textAlign: 'center',
                }}
              >
                You're all caught up! No {selectedFilter} notifications at the
                moment.
              </StandardText>
            </View>
          }
        />
      </View>
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
    marginBottom: 12,
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
    paddingRight: 20,
  },
  filterChip: {
    marginRight: 8,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
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
    flexWrap: 'wrap',
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
});

export default Notices;
