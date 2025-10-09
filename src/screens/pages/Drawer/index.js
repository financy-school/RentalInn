import React, {
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

// Components
import StandardText from '../../../components/StandardText/StandardText';

// Context
import { CredentialsContext } from '../../../context/CredentialsContext';
import { ThemeContext } from '../../../context/ThemeContext';
import { PropertyContext } from '../../../context/PropertyContext';

// Constants and utilities
import { SCREEN_NAMES, menuItems } from '../../../navigation/constants';
import { navigateToRoute } from '../../../navigation/navigationUtils';
import { fetchTickets } from '../../../services/NetworkUtils';
import colors from '../../../theme/colors';
import { FONT_WEIGHT, RADIUS, SHADOW, SPACING } from '../../../theme/layout';

const { width: screenWidth } = Dimensions.get('window');

const DrawerContent = ({ drawerWidth, screenWidth: propScreenWidth }) => {
  const navigation = useNavigation();
  const { credentials, clearCredentials } = useContext(CredentialsContext);
  const { theme: mode } = useContext(ThemeContext);
  const { selectedProperty } = useContext(PropertyContext);

  const [expandedMenus, setExpandedMenus] = useState({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [ticketCount, setTicketCount] = useState(0);

  // Memoize user info
  const userInfo = useMemo(() => {
    if (!credentials) return null;

    return {
      firstName: credentials.firstName || 'User',
      email: credentials.email || 'No email',
      phone: credentials.phone || 'No phone',
      initials: credentials.firstName
        ? credentials.firstName.charAt(0).toUpperCase()
        : 'U',
    };
  }, [credentials]);

  useEffect(() => {
    const fetchTicketCount = async () => {
      if (!credentials?.accessToken || !selectedProperty?.property_id) {
        setTicketCount(0);
        return;
      }

      try {
        const response = await fetchTickets(
          credentials.accessToken,
          selectedProperty.property_id,
        );
        const tickets = response?.data?.items || [];
        const openTickets = tickets.filter(
          ticket => ticket.status === 'PENDING' || ticket.status === 'ACTIVE',
        );
        setTicketCount(openTickets.length);
      } catch (error) {
        console.error('Error fetching ticket count:', error);
        setTicketCount(0);
      }
    };

    fetchTicketCount();
  }, [credentials?.accessToken, selectedProperty?.property_id]);

  // Create menu items with dynamic badge
  const menuItemsWithBadge = useMemo(() => {
    return menuItems.map(item => {
      if (item.label === 'Support & Maintenance' && item.children) {
        return {
          ...item,
          children: item.children.map(child => {
            if (child.label === 'All Tickets') {
              return {
                ...child,
                badge: ticketCount > 0 ? ticketCount : null,
              };
            }
            return child;
          }),
        };
      }
      return item;
    });
  }, [ticketCount]);

  // Theme-aware colors
  const themeColors = useMemo(
    () => ({
      backgroundColor:
        mode === 'dark' ? colors.backgroundDark || '#1a1a1a' : colors.white,
      textPrimary:
        mode === 'dark' ? colors.white : colors.textPrimary || colors.black,
      textSecondary:
        mode === 'dark'
          ? colors.background || '#b3b3b3'
          : colors.background || '#666',
      cardBackground: mode === 'dark' ? colors.gray800 || '#2a2a2a' : '#f8f8f8',
      activeBackground:
        mode === 'dark'
          ? colors.primaryDark || '#1e3a8a'
          : colors.primaryLight || '#e3f2fd',
      borderColor:
        mode === 'dark'
          ? colors.gray700 || '#404040'
          : colors.gray200 || '#e0e0e0',
      statusBackground:
        mode === 'dark' ? colors.success800 || '#065f46' : '#e5f9ed',
      statusText: mode === 'dark' ? colors.success200 || '#86efac' : '#2f855a',
    }),
    [mode],
  );

  // Handle logout with confirmation
  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts

    try {
      try {
        setIsLoggingOut(true);

        // Clear credentials and logout
        const result = await clearCredentials();

        if (!result || !result.success) {
          throw new Error('Logout failed');
        }

        // Navigate to login screen after successful logout
        navigation.reset({
          index: 0,
          routes: [{ name: SCREEN_NAMES.LOGIN }],
        });
      } catch (error) {
        console.error('Logout error:', error);
        Alert.alert(
          'Logout Error',
          'There was an issue logging out. Please try again.',
        );
      } finally {
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  }, [clearCredentials, isLoggingOut, navigation]);

  // Handle menu expansion toggle
  const toggleExpand = useCallback(label => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label],
    }));
  }, []);

  // Handle navigation with analytics
  const handleNavigation = useCallback(
    (route, params = {}) => {
      navigateToRoute(navigation, route, params);
    },
    [navigation],
  );

  // Render individual menu item
  const renderMenuItem = useCallback(
    (item, index) => {
      const isExpanded = expandedMenus[item.label];
      const hasChildren = item.children?.length > 0;

      return (
        <View key={`${item.label}-${index}`}>
          <TouchableOpacity
            onPress={() =>
              hasChildren
                ? toggleExpand(item.label)
                : handleNavigation(item.route, item.params)
            }
            style={[
              styles.menuItem,
              {
                backgroundColor: themeColors.cardBackground,
              },
            ]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${item.label} menu item`}
            accessibilityHint={
              hasChildren
                ? 'Double tap to expand submenu'
                : 'Double tap to navigate'
            }
          >
            <View style={styles.menuItemContent}>
              <Icon
                name={item.icon}
                size={22}
                color={colors.primary}
                style={styles.menuIcon}
              />
              <StandardText
                fontWeight="semibold"
                style={[styles.menuLabel, { color: themeColors.textPrimary }]}
              >
                {item.label}
              </StandardText>

              {/* Badge for notifications */}
              {item.badge && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: colors.error || '#ff4444' },
                  ]}
                >
                  <StandardText style={styles.badgeText}>
                    {item.badge}
                  </StandardText>
                </View>
              )}
            </View>

            {hasChildren && (
              <Icon
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={themeColors.textSecondary}
              />
            )}
          </TouchableOpacity>

          {/* Submenu items */}
          {hasChildren && isExpanded && (
            <View style={styles.submenuContainer}>
              {item.children.map((subItem, subIndex) => (
                <TouchableOpacity
                  key={`${subItem.label}-${subIndex}`}
                  onPress={() =>
                    handleNavigation(subItem.route, subItem.params)
                  }
                  style={styles.submenuItem}
                  activeOpacity={0.6}
                  accessibilityRole="button"
                  accessibilityLabel={`${subItem.label} submenu item`}
                >
                  <Icon
                    name="ellipse"
                    size={6}
                    color={colors.primary}
                    style={styles.submenuIcon}
                  />
                  <StandardText
                    style={[
                      styles.submenuLabel,
                      { color: themeColors.textPrimary },
                    ]}
                  >
                    {subItem.label}
                  </StandardText>

                  {subItem.badge && (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: colors.warning || '#f59e0b' },
                      ]}
                    >
                      <StandardText style={styles.badgeText}>
                        {subItem.badge}
                      </StandardText>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      );
    },
    [expandedMenus, toggleExpand, handleNavigation, themeColors],
  );

  if (!userInfo) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themeColors.backgroundColor },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header Section */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              source={require('../../../assets/rentalinn-white-text-without-bg.png')}
              resizeMode="contain"
            />
          </View>

          {/* User Info */}
          <View style={styles.userInfoContainer}>
            {/* <View
              style={[
                styles.avatarContainer,
                { backgroundColor: colors.primary },
              ]}
            >
              <StandardText fontWeight="bold" style={styles.avatarText}>
                {userInfo.initials}
              </StandardText>
            </View> */}

            <View style={styles.userDetails}>
              <StandardText fontWeight="bold" style={styles.userName}>
                {userInfo.firstName}
              </StandardText>
              <StandardText style={styles.userContact} numberOfLines={1}>
                {userInfo.email}
              </StandardText>
              <StandardText style={styles.userContact}>
                +91 {userInfo.phone}
              </StandardText>
            </View>
          </View>
        </View>

        {/* Status Card */}
        {/* <View
          style={[
            styles.statusCard,
            {
              backgroundColor: themeColors.statusBackground,
              borderColor: themeColors.borderColor,
            },
          ]}
        >
          <StandardText
            fontWeight="bold"
            style={[styles.statusText, { color: themeColors.statusText }]}
          >
            10 Rooms Active • 2 Requests
          </StandardText>
        </View> */}

        {/* Menu Section */}
        <View style={styles.menuContainer}>
          {menuItemsWithBadge.map(renderMenuItem)}
        </View>
      </ScrollView>

      {/* Logout Section */}
      <View
        style={[
          styles.logoutContainer,
          { borderTopColor: themeColors.borderColor },
        ]}
      >
        <TouchableOpacity
          onPress={handleLogout}
          disabled={isLoggingOut}
          style={[
            styles.logoutButton,
            {
              opacity: isLoggingOut ? 0.6 : 1,
            },
          ]}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Logout button"
          accessibilityHint="Double tap to logout from the app"
        >
          <Icon
            name={isLoggingOut ? 'hourglass-outline' : 'log-out-outline'}
            size={22}
            color={colors.error || '#e53e3e'}
          />
          <StandardText
            fontWeight="medium"
            style={[styles.logoutText, { color: colors.error || '#e53e3e' }]}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </StandardText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: Platform.OS === 'android' ? SPACING.xl : SPACING.md,
    paddingBottom: SPACING.lg,
  },
  logoContainer: {
    marginBottom: SPACING.xl,
    backgroundColor: colors.primary,
    width: '100%',
  },
  logo: {
    width: 150,
    height: 60,
    alignSelf: 'flex-start',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  userDetails: {
    flex: 1,
    paddingBottom: SPACING.xs,
  },
  userName: {
    fontSize: 18,
    marginBottom: SPACING.xs,
    color: colors.white,
  },
  userContact: {
    fontSize: 14,
    marginBottom: SPACING.xs,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  statusCard: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.medium,
    borderWidth: 1,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    ...SHADOW.light,
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.medium,
    marginVertical: SPACING.xs,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: SPACING.md,
    width: 22,
  },
  menuLabel: {
    fontSize: 15,
    flex: 1,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: RADIUS.small,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
    paddingHorizontal: SPACING.xs + 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: FONT_WEIGHT.bold,
  },
  submenuContainer: {
    paddingLeft: 52,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  submenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: RADIUS.small,
  },
  submenuIcon: {
    marginRight: SPACING.md,
    width: 8,
  },
  submenuLabel: {
    fontSize: 14,
    flex: 1,
  },
  logoutContainer: {
    borderTopWidth: 1,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  logoutText: {
    marginLeft: SPACING.md,
    fontSize: 16,
  },
};

export default DrawerContent;
