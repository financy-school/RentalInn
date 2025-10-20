import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  Share,
  ActivityIndicator,
} from 'react-native';
import { Card, Divider, Avatar } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../context/ThemeContext';
import { CredentialsContext } from '../context/CredentialsContext';
import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import Gap from '../components/Gap/Gap';
import AnimatedLoader from '../components/AnimatedLoader/AnimatedLoader';
import {
  getAppInfo,
  updateNotificationSettings,
  updatePreferences,
  updatePrivacySettings,
  backupData,
  exportReports,
  clearCache,
  notifyPasswordChanged,
} from '../services/NetworkUtils';
import colors from '../theme/colors';

const Settings = ({ navigation }) => {
  const { theme: mode, toggleTheme } = useContext(ThemeContext);
  const { credentials, setCredentials } = useContext(CredentialsContext);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Settings state - initialize with API structure
  const [settings, setSettings] = useState({
    notifications: {
      push: true,
      email: true,
      sms: false,
      maintenance: true,
      payments: true,
    },
    privacy: {
      analytics: true,
      twoFactor: false,
    },
    darkMode: mode === 'dark',
    language: 'ENGLISH',
    currency: 'INR',

    dataManagement: {
      autoBackup: true,
      autoExportReports: true,
    },
  });

  // App info state
  const [appInfo, setAppInfo] = useState({
    appVersion: 'v1.0.0 (Build 1)',
    lastBackupDate: null,
    lastCacheCleared: null,
    lastPasswordChange: null,
    lastLoginDate: null,
    loginAttempts: 0,
  });

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettingsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch settings and app info from API
  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      const response = await getAppInfo(credentials.accessToken);

      if (response.success && response.data) {
        const data = response.data;

        // Update settings state with API data
        setSettings(data.settings);

        // Update app info
        setAppInfo({
          appVersion: data.appVersion,
          lastBackupDate: data.lastBackupDate,
          lastCacheCleared: data.lastCacheCleared,
          lastPasswordChange: data.lastPasswordChange,
          lastLoginDate: data.lastLoginDate,
          loginAttempts: data.loginAttempts,
        });

        // Sync theme with API data
        if (data.settings.darkMode !== (mode === 'dark')) {
          toggleTheme();
        }
      } else {
        console.warn('Failed to fetch settings:', response.error);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      Alert.alert('Error', 'Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle setting toggle with API updates
  const toggleSetting = async (category, key) => {
    const newValue = !settings[category][key];

    // Optimistically update UI
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: newValue,
      },
    }));

    try {
      let response;

      // Call appropriate API endpoint based on category
      switch (category) {
        case 'notifications':
          const notificationData = {
            pushNotifications:
              key === 'push' ? newValue : settings.notifications.push,
            emailNotifications:
              key === 'email' ? newValue : settings.notifications.email,
            smsAlerts: key === 'sms' ? newValue : settings.notifications.sms,
            maintenanceAlerts:
              key === 'maintenance'
                ? newValue
                : settings.notifications.maintenance,
            paymentUpdates:
              key === 'payments' ? newValue : settings.notifications.payments,
          };
          response = await updateNotificationSettings(
            credentials.accessToken,
            notificationData,
          );
          break;

        case 'preferences':
          const preferencesData = {
            darkMode: key === 'darkMode' ? newValue : settings.darkMode,
            language: key === 'language' ? newValue : settings.language,
            currency: key === 'currency' ? newValue : settings.currency,
            autoBackup:
              key === 'autoBackup'
                ? newValue
                : settings.dataManagement.autoBackup,
          };
          response = await updatePreferences(
            credentials.accessToken,
            preferencesData,
          );
          break;

        case 'privacy':
          const privacyData = {
            analyticsEnabled:
              key === 'analytics' ? newValue : settings.privacy.analytics,
            twoFactorEnabled:
              key === 'twoFactor' ? newValue : settings.privacy.twoFactor,
          };
          response = await updatePrivacySettings(
            credentials.accessToken,
            privacyData,
          );
          break;

        default:
          console.warn('Unknown setting category:', category);
          return;
      }

      if (!response.success) {
        throw new Error(response.error || 'Failed to update setting');
      }

      // Handle special cases
      if (category === 'preferences' && key === 'darkMode') {
        toggleTheme();
      }
    } catch (error) {
      console.error('Error updating setting:', error);

      // Revert optimistic update on error
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: !newValue,
        },
      }));

      Alert.alert('Error', 'Failed to update setting. Please try again.');
    }
  };

  // Theme variables
  const isDark = mode === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  // User info from credentials
  const userInfo = {
    firstName: credentials?.firstName,
    lastName: credentials?.lastName,
    email: credentials?.email,
    phone: credentials?.phone,
  };

  // Language options
  const languageOptions = [
    { label: 'English', value: 'ENGLISH', flag: '🇺🇸' },
    { label: 'हिंदी (Hindi)', value: 'HINDI', flag: '🇮🇳' },
    { label: 'Español (Spanish)', value: 'SPANISH', flag: '🇪🇸' },
    { label: 'Français (French)', value: 'FRENCH', flag: '🇫🇷' },
    { label: 'العربية (Arabic)', value: 'ARABIC', flag: '🇸🇦' },
    { label: '中文 (Chinese)', value: 'CHINESE', flag: '🇨🇳' },
  ];

  // Currency options
  const currencyOptions = [
    { label: 'Indian Rupee (₹)', value: 'INR', symbol: '₹' },
    { label: 'US Dollar ($)', value: 'USD', symbol: '$' },
    { label: 'Euro (€)', value: 'EUR', symbol: '€' },
    { label: 'British Pound (£)', value: 'GBP', symbol: '£' },
    { label: 'Japanese Yen (¥)', value: 'JPY', symbol: '¥' },
    { label: 'Australian Dollar (A$)', value: 'AUD', symbol: 'A$' },
  ];

  // Handle language selection
  const handleLanguageSelection = () => {
    Alert.alert('Select Language', 'Choose your preferred language', [
      { text: 'Cancel', style: 'cancel' },
      ...languageOptions.map(lang => ({
        text: `${lang.flag} ${lang.label}`,
        onPress: async () => {
          try {
            const preferencesData = {
              darkMode: settings.darkMode,
              language: lang.value,
              currency: settings.currency,
            };

            const response = await updatePreferences(
              credentials.accessToken,
              preferencesData,
            );

            if (response.success) {
              setSettings(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  language: lang.value,
                },
              }));
              Alert.alert('Success', `Language changed to ${lang.label}`);
            } else {
              throw new Error(response.error || 'Failed to update language');
            }
          } catch (error) {
            console.error('Error updating language:', error);
            Alert.alert(
              'Error',
              'Failed to update language. Please try again.',
            );
          }
        },
      })),
    ]);
  };

  // Handle currency selection
  const handleCurrencySelection = () => {
    Alert.alert('Select Currency', 'Choose your preferred currency', [
      { text: 'Cancel', style: 'cancel' },
      ...currencyOptions.map(currency => ({
        text: `${currency.symbol} ${currency.label}`,
        onPress: async () => {
          try {
            const preferencesData = {
              darkMode: settings.darkMode,
              language: settings.language,
              currency: currency.value,
            };

            const response = await updatePreferences(
              credentials.accessToken,
              preferencesData,
            );

            if (response.success) {
              setSettings(prev => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  currency: currency.value,
                },
              }));
              Alert.alert('Success', `Currency changed to ${currency.label}`);
            } else {
              throw new Error(response.error || 'Failed to update currency');
            }
          } catch (error) {
            console.error('Error updating currency:', error);
            Alert.alert(
              'Error',
              'Failed to update currency. Please try again.',
            );
          }
        },
      })),
    ]);
  };

  // Handle change password
  const handleChangePassword = () => {
    Alert.prompt(
      'Change Password',
      'Enter your current password',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Next',
          onPress: currentPassword => {
            if (!currentPassword || currentPassword.length < 6) {
              Alert.alert('Error', 'Please enter a valid current password');
              return;
            }

            Alert.prompt(
              'New Password',
              'Enter your new password (minimum 6 characters)',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Change',
                  onPress: newPassword => {
                    if (!newPassword || newPassword.length < 6) {
                      Alert.alert(
                        'Error',
                        'New password must be at least 6 characters',
                      );
                      return;
                    }

                    Alert.prompt(
                      'Confirm Password',
                      'Confirm your new password',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Confirm',
                          onPress: async confirmPassword => {
                            if (newPassword !== confirmPassword) {
                              Alert.alert('Error', 'Passwords do not match');
                              return;
                            }

                            try {
                              // In a real implementation, you'd call a change password API first
                              // Then notify the backend that password has been changed
                              const response = await notifyPasswordChanged(
                                credentials.accessToken,
                              );

                              if (response.success) {
                                Alert.alert(
                                  'Success',
                                  'Password changed successfully!',
                                );
                                // Update app info to reflect password change
                                setAppInfo(prev => ({
                                  ...prev,
                                  lastPasswordChange: new Date().toISOString(),
                                }));
                              } else {
                                throw new Error(
                                  response.error || 'Failed to update password',
                                );
                              }
                            } catch (error) {
                              console.error('Error updating password:', error);
                              Alert.alert(
                                'Error',
                                'Failed to change password. Please try again.',
                              );
                            }
                          },
                        },
                      ],
                      'secure-text',
                    );
                  },
                },
              ],
              'secure-text',
            );
          },
        },
      ],
      'secure-text',
    );
  };

  // Handle terms of service
  const handleTermsOfService = () => {
    Alert.alert(
      'Terms of Service',
      'RentalInn Terms of Service\n\n1. By using this app, you agree to our terms.\n2. You are responsible for maintaining accurate property data.\n3. We ensure your data privacy and security.\n4. The app is provided "as is" without warranties.\n5. We may update these terms from time to time.\n\nFor the complete terms, visit our website.',
      [
        { text: 'Close' },
        {
          text: 'Visit Website',
          onPress: () => {
            Alert.alert('Opening Website', 'Redirecting to terms page...');
            // Linking.openURL('https://rentalinn.com/terms');
          },
        },
      ],
    );
  };

  // Handle privacy policy
  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'RentalInn Privacy Policy\n\n• We collect only necessary data for app functionality\n• Your property data is stored securely\n• We do not share personal information with third parties\n• You can request data deletion at any time\n• We use encryption to protect your data\n\nFor detailed privacy policy, visit our website.',
      [
        { text: 'Close' },
        {
          text: 'Visit Website',
          onPress: () => {
            Alert.alert('Opening Website', 'Redirecting to privacy page...');
            // Linking.openURL('https://rentalinn.com/privacy');
          },
        },
      ],
    );
  };

  // Handle export data
  const handleExportData = async () => {
    try {
      setActionLoading('export');
      const response = await exportReports(credentials.accessToken);

      if (response.success && response.data) {
        Alert.alert(
          'Success',
          response.data.message || 'Reports exported successfully!',
        );
        // If there's a report URL, you could open it or show it to the user
        if (response.data.reportUrl) {
          console.log('Report URL:', response.data.reportUrl);
        }
      } else {
        throw new Error(response.error || 'Failed to export reports');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert('Error', 'Failed to export reports. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle app version info
  const handleAppVersion = () => {
    const formatDate = dateString => {
      if (!dateString) return 'Never';
      return new Date(dateString).toLocaleDateString();
    };

    Alert.alert(
      'App Information',
      `RentalInn ${appInfo.appVersion}
Release Date: September 2025
Developed by RentalInn Team

App Statistics:
• Last Login: ${formatDate(appInfo.lastLoginDate)}
• Last Backup: ${formatDate(appInfo.lastBackupDate)}
• Last Cache Clear: ${formatDate(appInfo.lastCacheCleared)}
• Last Password Change: ${formatDate(appInfo.lastPasswordChange)}
• Login Attempts: ${appInfo.loginAttempts}

What's New:
• Property management dashboard
• Tenant tracking
• Payment records
• Invoice management
• Dark/Light theme support`,
      [{ text: 'OK' }],
    );
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            setCredentials(null);
            // Navigate to login screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'AuthStack' }],
            });
          },
        },
      ],
    );
  };

  // Handle app rating
  const handleRateApp = () => {
    Alert.alert(
      'Rate RentalInn',
      'Enjoying RentalInn? Please take a moment to rate us on the App Store!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Rate Now',
          onPress: () => {
            // In a real app, this would open the app store
            Alert.alert('Thank You!', 'Redirecting to App Store...');
            // Linking.openURL('https://apps.apple.com/app/rentalinn');
          },
        },
      ],
    );
  };

  // Handle share app
  const handleShareApp = async () => {
    try {
      await Share.share({
        title: 'RentalInn - Property Management Made Easy',
        message:
          'Manage your rental property with ease using RentalInn! Download now: https://rentalinn.app',
      });
    } catch (error) {
      console.log('Share failed:', error);
    }
  };

  // Handle backup
  const handleBackup = () => {
    Alert.alert(
      'Backup Data',
      'This will create a backup of all your property data to the cloud.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Backup',
          onPress: async () => {
            try {
              setActionLoading('backup');
              const response = await backupData(credentials.accessToken);

              if (response.success && response.data) {
                Alert.alert(
                  'Success',
                  response.data.message || 'Backup created successfully!',
                );
                // Update app info to reflect backup date
                setAppInfo(prev => ({
                  ...prev,
                  lastBackupDate: new Date().toISOString(),
                }));

                if (response.data.backupId) {
                  console.log('Backup ID:', response.data.backupId);
                }
              } else {
                throw new Error(response.error || 'Failed to create backup');
              }
            } catch (error) {
              console.error('Error creating backup:', error);
              Alert.alert(
                'Error',
                'Failed to create backup. Please try again.',
              );
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type "DELETE" to confirm account deletion',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Account',
                  style: 'destructive',
                  onPress: () => {
                    // Clear credentials and redirect to login
                    setCredentials(null);
                    Alert.alert(
                      'Account Deleted',
                      'Your account has been successfully deleted.',
                      [
                        {
                          text: 'OK',
                          onPress: () => {
                            navigation.reset({
                              index: 0,
                              routes: [{ name: 'AuthStack' }],
                            });
                          },
                        },
                      ],
                    );
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  // Show loading screen while fetching settings
  if (loading) {
    return (
      <View style={styles.container}>
        <StandardHeader navigation={navigation} title="Settings" />
        <AnimatedLoader
          message="Loading settings..."
          icon="cog"
          fullScreen={false}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StandardHeader navigation={navigation} title="Settings" />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <Card style={[styles.profileCard, { backgroundColor: cardBackground }]}>
          <View style={styles.profileHeader}>
            <Avatar.Image
              size={60}
              source={{
                uri: `https://ui-avatars.com/api/?name=${userInfo.firstName}+${userInfo.lastName}&background=EE7B11&color=fff`,
              }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <StandardText
                style={[styles.userName, { color: textPrimary }]}
                fontWeight="bold"
              >
                {userInfo.firstName} {userInfo.lastName}
              </StandardText>
              <StandardText
                style={[styles.userEmail, { color: textSecondary }]}
              >
                {userInfo.email}
              </StandardText>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={20}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </Card>

        <Gap size="lg" />

        {/* Notifications Settings */}
        <Card
          style={[styles.settingsCard, { backgroundColor: cardBackground }]}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={24}
              color={colors.primary}
            />
            <StandardText
              style={[styles.sectionTitle, { color: textPrimary }]}
              fontWeight="bold"
            >
              Notifications
            </StandardText>
          </View>

          <SettingItem
            title="Push Notifications"
            subtitle="Receive push notifications for important updates"
            value={settings.notifications.push}
            onToggle={() => toggleSetting('notifications', 'push')}
            textColor={textPrimary}
            subtitleColor={textSecondary}
          />

          <SettingItem
            title="Email Notifications"
            subtitle="Get notified via email for reports and summaries"
            value={settings.notifications.email}
            onToggle={() => toggleSetting('notifications', 'email')}
            textColor={textPrimary}
            subtitleColor={textSecondary}
          />

          <SettingItem
            title="SMS Alerts"
            subtitle="Receive SMS for urgent notifications"
            value={settings.notifications.sms}
            onToggle={() => toggleSetting('notifications', 'sms')}
            textColor={textPrimary}
            subtitleColor={textSecondary}
          />

          <SettingItem
            title="Maintenance Alerts"
            subtitle="Notifications for maintenance requests"
            value={settings.notifications.maintenance}
            onToggle={() => toggleSetting('notifications', 'maintenance')}
            textColor={textPrimary}
            subtitleColor={textSecondary}
          />

          <SettingItem
            title="Payment Updates"
            subtitle="Alerts for rent payments and dues"
            value={settings.notifications.payments}
            onToggle={() => toggleSetting('notifications', 'payments')}
            textColor={textPrimary}
            subtitleColor={textSecondary}
          />

          <SettingActionItem
            title="Advanced Notification Settings"
            subtitle="Manage notification permissions and preferences"
            icon="chevron-right"
            onPress={() => navigation.navigate('NotificationSettings')}
            textColor={textPrimary}
            subtitleColor={textSecondary}
            isLast
          />
        </Card>

        <Gap size="lg" />

        {/* App Preferences */}
        <Card
          style={[styles.settingsCard, { backgroundColor: cardBackground }]}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="cog-outline"
              size={24}
              color={colors.primary}
            />
            <StandardText
              style={[styles.sectionTitle, { color: textPrimary }]}
              fontWeight="bold"
            >
              App Preferences
            </StandardText>
          </View>

          {/* <SettingItem
            title="Dark Mode"
            subtitle="Switch between light and dark themes"
            value={settings.darkMode}
            onToggle={() => toggleSetting('darkMode')}
            textColor={textPrimary}
            subtitleColor={textSecondary}
          /> */}

          {/* <SettingActionItem
            title="Language"
            subtitle={
              languageOptions.find(lang => lang.value === settings.language)
                ?.label || 'English'
            }
            onPress={handleLanguageSelection}
            textColor={textPrimary}
            subtitleColor={textSecondary}
          /> */}

          {/* <SettingActionItem
            title="Currency"
            subtitle={
              currencyOptions.find(curr => curr.value === settings.currency)
                ?.label || 'Indian Rupee (₹)'
            }
            onPress={handleCurrencySelection}
            textColor={textPrimary}
            subtitleColor={textSecondary}
          /> */}

          <SettingItem
            title="Auto Backup"
            subtitle="Automatically backup data to cloud"
            value={settings.dataManagement.autoBackup}
            onToggle={() => toggleSetting('dataManagement', 'autoBackup')}
            textColor={textPrimary}
            subtitleColor={textSecondary}
            isLast
          />
        </Card>

        <Gap size="lg" />

        {/* Privacy & Security */}
        <Card
          style={[styles.settingsCard, { backgroundColor: cardBackground }]}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="shield-outline"
              size={24}
              color={colors.primary}
            />
            <StandardText
              style={[styles.sectionTitle, { color: textPrimary }]}
              fontWeight="bold"
            >
              Privacy & Security
            </StandardText>
          </View>

          {/* <SettingActionItem
            title="Change Password"
            subtitle="Update your account password"
            onPress={handleChangePassword}
            textColor={textPrimary}
            subtitleColor={textSecondary}
          /> */}

          <SettingItem
            title="Analytics"
            subtitle="Help improve the app by sharing usage data"
            value={settings.privacy.analytics}
            onToggle={() => toggleSetting('privacy', 'analytics')}
            textColor={textPrimary}
            subtitleColor={textSecondary}
          />

          <SettingActionItem
            title="Privacy Policy"
            subtitle="Read our privacy policy"
            onPress={handlePrivacyPolicy}
            textColor={textPrimary}
            subtitleColor={textSecondary}
            isLast
          />
        </Card>

        <Gap size="lg" />

        {/* Data Management */}
        {/* <Card
          style={[styles.settingsCard, { backgroundColor: cardBackground }]}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="database-outline"
              size={24}
              color={colors.primary}
            />
            <StandardText
              style={[styles.sectionTitle, { color: textPrimary }]}
              fontWeight="bold"
            >
              Data Management
            </StandardText>
          </View>

          <SettingActionItem
            title="Backup Data"
            subtitle="Create a backup of all your data"
            onPress={handleBackup}
            textColor={textPrimary}
            subtitleColor={textSecondary}
          />

          <SettingActionItem
            title="Export Reports"
            subtitle="Download property reports as PDF"
            onPress={handleExportData}
            textColor={textPrimary}
            subtitleColor={textSecondary}
          />

          <SettingActionItem
            title="Clear Cache"
            subtitle="Free up storage space"
            onPress={async () => {
              try {
                setActionLoading('cache');
                const response = await clearCache(credentials.accessToken);

                if (response.success) {
                  Alert.alert('Success', 'Cache cleared successfully!');
                  // Update app info to reflect cache clear date
                  setAppInfo(prev => ({
                    ...prev,
                    lastCacheCleared: new Date().toISOString(),
                  }));
                } else {
                  throw new Error(response.error || 'Failed to clear cache');
                }
              } catch (error) {
                console.error('Error clearing cache:', error);
                Alert.alert(
                  'Error',
                  'Failed to clear cache. Please try again.',
                );
              } finally {
                setActionLoading(null);
              }
            }}
            textColor={textPrimary}
            subtitleColor={textSecondary}
            isLast
          />
        </Card> */}

        <Gap size="lg" />

        {/* Support & About */}
        <Card
          style={[styles.settingsCard, { backgroundColor: cardBackground }]}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="help-circle-outline"
              size={24}
              color={colors.primary}
            />
            <StandardText
              style={[styles.sectionTitle, { color: textPrimary }]}
              fontWeight="bold"
            >
              Support & About
            </StandardText>
          </View>

          <SettingActionItem
            title="Help Center"
            subtitle="Get help and support"
            onPress={() => navigation.navigate('FAQ')}
            textColor={textPrimary}
            subtitleColor={textSecondary}
          />

          <SettingActionItem
            title="Contact Support"
            subtitle="Reach out to our support team"
            onPress={() => navigation.navigate('ContactSupport')}
            textColor={textPrimary}
            subtitleColor={textSecondary}
          />

          {/* <SettingActionItem
            title="Rate App"
            subtitle="Rate RentalInn on App Store"
            onPress={handleRateApp}
            textColor={textPrimary}
            subtitleColor={textSecondary}
          /> */}

          <SettingActionItem
            title="Share App"
            subtitle="Tell your friends about RentalInn"
            onPress={handleShareApp}
            textColor={textPrimary}
            subtitleColor={textSecondary}
          />

          <SettingActionItem
            title="Terms of Service"
            subtitle="Read our terms and conditions"
            onPress={handleTermsOfService}
            textColor={textPrimary}
            subtitleColor={textSecondary}
          />

          <SettingActionItem
            title="App Version"
            subtitle={appInfo.appVersion}
            onPress={handleAppVersion}
            textColor={textPrimary}
            subtitleColor={textSecondary}
            isLast
          />
        </Card>

        <Gap size="lg" />

        {/* Danger Zone */}
        <Card
          style={[styles.settingsCard, { backgroundColor: cardBackground }]}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="alert-outline"
              size={24}
              color={colors.error}
            />
            <StandardText
              style={[styles.sectionTitle, { color: colors.error }]}
              fontWeight="bold"
            >
              Danger Zone
            </StandardText>
          </View>

          <SettingActionItem
            title="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
            textColor={colors.error}
            subtitleColor={textSecondary}
            showArrow={false}
          />

          <SettingActionItem
            title="Delete Account"
            subtitle="Permanently delete your account and data"
            onPress={handleDeleteAccount}
            textColor={colors.error}
            subtitleColor={textSecondary}
            showArrow={false}
            isLast
          />
        </Card>

        <Gap size="xxl" />
      </ScrollView>
    </View>
  );
};

// Reusable Setting Item with Toggle
const SettingItem = ({
  title,
  subtitle,
  value,
  onToggle,
  textColor,
  subtitleColor,
  isLast = false,
}) => (
  <>
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <StandardText style={[styles.settingTitle, { color: textColor }]}>
          {title}
        </StandardText>
        <StandardText
          style={[styles.settingSubtitle, { color: subtitleColor }]}
        >
          {subtitle}
        </StandardText>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#E0E0E0', true: colors.primary + '40' }}
        thumbColor={value ? colors.primary : '#FFFFFF'}
        ios_backgroundColor="#E0E0E0"
      />
    </View>
    {!isLast && <Divider style={styles.divider} />}
  </>
);

// Reusable Setting Item with Action
const SettingActionItem = ({
  title,
  subtitle,
  onPress,
  textColor,
  subtitleColor,
  showArrow = true,
  isLast = false,
}) => (
  <>
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingContent}>
        <StandardText style={[styles.settingTitle, { color: textColor }]}>
          {title}
        </StandardText>
        <StandardText
          style={[styles.settingSubtitle, { color: subtitleColor }]}
        >
          {subtitle}
        </StandardText>
      </View>
      {showArrow && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={subtitleColor}
        />
      )}
    </TouchableOpacity>
    {!isLast && <Divider style={styles.divider} />}
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  profileCard: {
    marginTop: 16,
    padding: 20,
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  userProperty: {
    fontSize: 12,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.primary + '20',
  },
  settingsCard: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    marginHorizontal: 20,
    height: 1,
    backgroundColor: colors.border,
  },
});

export default Settings;
