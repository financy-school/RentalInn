import React, { useContext, useState, useMemo, useCallback } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

// Components
import StandardText from '../../../components/StandardText/StandardText';

// Context
import { CredentialsContext } from '../../../context/CredentialsContext';
import { ThemeContext } from '../../../context/ThemeContext';

// Constants and utilities
import { SCREEN_NAMES, menuItems } from '../../../navigation/constants';
import { navigateToRoute } from '../../../navigation/navigationUtils';
import colors from '../../../theme/color';
import { color } from 'react-native-elements/dist/helpers';

const { width: screenWidth } = Dimensions.get('window');

const DrawerContent = ({ drawerWidth, screenWidth: propScreenWidth }) => {
  const navigation = useNavigation();
  const { credentials, clearCredentials } = useContext(CredentialsContext);
  const { theme: mode } = useContext(ThemeContext);

  const [expandedMenus, setExpandedMenus] = useState({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
        <View key={`${item.label}-${index}`} style={{ marginVertical: 4 }}>
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
                borderColor: themeColors.borderColor,
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
                color={themeColors.textPrimary}
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
                size={18}
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
                    name="ellipse-outline"
                    size={8}
                    color={themeColors.textSecondary}
                    style={styles.submenuIcon}
                  />
                  <StandardText
                    style={[
                      styles.submenuLabel,
                      { color: themeColors.textSecondary },
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
        <SafeAreaView
          style={[styles.header, { backgroundColor: colors.backgroundLight }]}
        >
          <View style={{ backgroundColor: colors.backgroundLight }}>
            <View style={styles.logoContainer}>
              <Image
                style={styles.logo}
                source={require('../../../assets/rentalinn.png')}
                resizeMode="contain"
              />
            </View>

            {/* User Info */}
            <View style={styles.userInfoContainer}>
              <View
                style={[
                  styles.avatarContainer,
                  { backgroundColor: colors.primary },
                ]}
              >
                <StandardText fontWeight="bold" style={styles.avatarText}>
                  {userInfo.initials}
                </StandardText>
              </View>

              <View style={styles.userDetails}>
                <StandardText
                  fontWeight="bold"
                  style={[
                    styles.userName,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  {userInfo.firstName}
                </StandardText>
                <StandardText
                  style={[
                    styles.userContact,
                    { color: themeColors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {userInfo.email}
                </StandardText>
                <StandardText
                  style={[
                    styles.userContact,
                    { color: themeColors.textSecondary },
                  ]}
                >
                  +91 {userInfo.phone}
                </StandardText>
              </View>
            </View>
          </View>
        </SafeAreaView>

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
          {menuItems.map(renderMenuItem)}
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
  },
  logoContainer: {
    alignItems: 'flex-start',
    marginBottom: 20,
    backgroundColor: colors.backgroundLight,
  },
  logo: {
    width: Math.min(screenWidth * 0.9, 250),
    height: 80,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    marginBottom: 4,
  },
  userContact: {
    fontSize: 14,
    marginBottom: 2,
    color: '#FFFFFF',
  },
  statusCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: 14,
    width: 22,
  },
  menuLabel: {
    fontSize: 16,
    flex: 1,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  submenuContainer: {
    paddingLeft: 52,
    paddingTop: 8,
    paddingBottom: 4,
  },
  submenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  submenuIcon: {
    marginRight: 12,
    width: 8,
  },
  submenuLabel: {
    fontSize: 15,
    flex: 1,
  },
  logoutContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  logoutText: {
    marginLeft: 14,
    fontSize: 16,
  },
};

export default DrawerContent;
