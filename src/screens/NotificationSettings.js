import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Switch,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Card } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import StandardCard from '../components/StandardCard/StandardCard';
import Gap from '../components/Gap/Gap';
import { ThemeContext } from '../context/ThemeContext';
import colors from '../theme/colors';
import NotificationService from '../services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationSettings = ({ navigation }) => {
  const { theme: mode } = useContext(ThemeContext);
  const isDark = mode === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  const [fcmToken, setFcmToken] = useState('');
  const [permissionEnabled, setPermissionEnabled] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    payments: true,
    maintenance: true,
    lease: true,
    reminders: true,
  });

  useEffect(() => {
    loadNotificationData();
  }, []);

  const loadNotificationData = async () => {
    // Get FCM token
    const token = await NotificationService.getStoredToken();
    if (token) {
      setFcmToken(token);
    }

    // Check permission status
    const hasPermission = await NotificationService.checkPermissionStatus();
    setPermissionEnabled(hasPermission);

    // Load notification preferences
    const saved = await AsyncStorage.getItem('notificationSettings');
    if (saved) {
      setNotificationSettings(JSON.parse(saved));
    }
  };

  const requestPermission = async () => {
    const granted = await NotificationService.requestUserPermission();
    if (granted) {
      const token = await NotificationService.getFCMToken();
      if (token) {
        setFcmToken(token);
        setPermissionEnabled(true);
        Alert.alert('Success', 'Notifications enabled successfully!');
      }
    } else {
      Alert.alert(
        'Permission Denied',
        'Please enable notifications in your device settings.',
      );
    }
  };

  const toggleNotificationSetting = async key => {
    const newSettings = {
      ...notificationSettings,
      [key]: !notificationSettings[key],
    };
    setNotificationSettings(newSettings);
    await AsyncStorage.setItem(
      'notificationSettings',
      JSON.stringify(newSettings),
    );

    // Subscribe/unsubscribe from topics
    const topic = key;
    if (newSettings[key]) {
      await NotificationService.subscribeToTopic(topic);
    } else {
      await NotificationService.unsubscribeFromTopic(topic);
    }
  };

  const copyTokenToClipboard = () => {
    if (fcmToken) {
      Alert.alert('FCM Token', fcmToken, [
        { text: 'OK', onPress: () => console.log('Token:', fcmToken) },
      ]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StandardHeader
        navigation={navigation}
        title="Notification Settings"
        subtitle="Manage your notification preferences"
        showBackButton
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Permission Status */}
        <StandardCard
          style={[styles.card, { backgroundColor: cardBackground }]}
        >
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name={permissionEnabled ? 'bell-ring' : 'bell-off'}
              size={24}
              color={permissionEnabled ? colors.success : colors.error}
            />
            <StandardText
              fontWeight="bold"
              size="lg"
              style={[styles.cardTitle, { color: textPrimary }]}
            >
              Notification Status
            </StandardText>
          </View>
          <StandardText
            size="sm"
            style={[styles.statusText, { color: textSecondary }]}
          >
            {permissionEnabled
              ? 'Notifications are enabled'
              : 'Notifications are disabled'}
          </StandardText>
          {!permissionEnabled && (
            <>
              <Gap size="md" />
              <TouchableOpacity
                style={[
                  styles.enableButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={requestPermission}
              >
                <StandardText fontWeight="bold" style={{ color: colors.white }}>
                  Enable Notifications
                </StandardText>
              </TouchableOpacity>
            </>
          )}
        </StandardCard>

        <Gap size="lg" />

        {/* FCM Token */}
        {fcmToken && (
          <>
            <StandardCard
              style={[styles.card, { backgroundColor: cardBackground }]}
            >
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons
                  name="key"
                  size={24}
                  color={colors.primary}
                />
                <StandardText
                  fontWeight="bold"
                  size="lg"
                  style={[styles.cardTitle, { color: textPrimary }]}
                >
                  Device Token
                </StandardText>
              </View>
              <TouchableOpacity onPress={copyTokenToClipboard}>
                <StandardText
                  size="xs"
                  style={[styles.tokenText, { color: textSecondary }]}
                  numberOfLines={2}
                >
                  {fcmToken}
                </StandardText>
                <StandardText
                  size="xs"
                  style={{ color: colors.primary, marginTop: 8 }}
                >
                  Tap to view full token
                </StandardText>
              </TouchableOpacity>
            </StandardCard>

            <Gap size="lg" />
          </>
        )}

        {/* Notification Preferences */}
        <StandardText
          fontWeight="bold"
          size="md"
          style={[styles.sectionTitle, { color: textPrimary }]}
        >
          NOTIFICATION PREFERENCES
        </StandardText>

        <Gap size="sm" />

        <StandardCard
          style={[styles.card, { backgroundColor: cardBackground }]}
        >
          {/* Payment Notifications */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons
                name="cash"
                size={22}
                color={colors.success}
              />
              <View style={styles.settingTextContainer}>
                <StandardText
                  fontWeight="medium"
                  size="md"
                  style={{ color: textPrimary }}
                >
                  Payment Notifications
                </StandardText>
                <StandardText size="xs" style={{ color: textSecondary }}>
                  Rent payments, receipts
                </StandardText>
              </View>
            </View>
            <Switch
              value={notificationSettings.payments}
              onValueChange={() => toggleNotificationSetting('payments')}
              trackColor={{ false: '#767577', true: colors.primary + '80' }}
              thumbColor={
                notificationSettings.payments ? colors.primary : '#f4f3f4'
              }
            />
          </View>

          <View style={styles.divider} />

          {/* Maintenance Notifications */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons
                name="wrench"
                size={22}
                color={colors.warning}
              />
              <View style={styles.settingTextContainer}>
                <StandardText
                  fontWeight="medium"
                  size="md"
                  style={{ color: textPrimary }}
                >
                  Maintenance Notifications
                </StandardText>
                <StandardText size="xs" style={{ color: textSecondary }}>
                  Repair requests, updates
                </StandardText>
              </View>
            </View>
            <Switch
              value={notificationSettings.maintenance}
              onValueChange={() => toggleNotificationSetting('maintenance')}
              trackColor={{ false: '#767577', true: colors.primary + '80' }}
              thumbColor={
                notificationSettings.maintenance ? colors.primary : '#f4f3f4'
              }
            />
          </View>

          <View style={styles.divider} />

          {/* Lease Notifications */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons
                name="file-document"
                size={22}
                color={colors.primary}
              />
              <View style={styles.settingTextContainer}>
                <StandardText
                  fontWeight="medium"
                  size="md"
                  style={{ color: textPrimary }}
                >
                  Lease Notifications
                </StandardText>
                <StandardText size="xs" style={{ color: textSecondary }}>
                  Renewals, expirations
                </StandardText>
              </View>
            </View>
            <Switch
              value={notificationSettings.lease}
              onValueChange={() => toggleNotificationSetting('lease')}
              trackColor={{ false: '#767577', true: colors.primary + '80' }}
              thumbColor={
                notificationSettings.lease ? colors.primary : '#f4f3f4'
              }
            />
          </View>

          <View style={styles.divider} />

          {/* Reminder Notifications */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <MaterialCommunityIcons
                name="bell-alert"
                size={22}
                color={colors.error}
              />
              <View style={styles.settingTextContainer}>
                <StandardText
                  fontWeight="medium"
                  size="md"
                  style={{ color: textPrimary }}
                >
                  Reminders
                </StandardText>
                <StandardText size="xs" style={{ color: textSecondary }}>
                  Due dates, important events
                </StandardText>
              </View>
            </View>
            <Switch
              value={notificationSettings.reminders}
              onValueChange={() => toggleNotificationSetting('reminders')}
              trackColor={{ false: '#767577', true: colors.primary + '80' }}
              thumbColor={
                notificationSettings.reminders ? colors.primary : '#f4f3f4'
              }
            />
          </View>
        </StandardCard>

        <Gap size="xl" />

        {/* Info Card */}
        <StandardCard
          style={[styles.infoCard, { backgroundColor: colors.primary + '10' }]}
        >
          <MaterialCommunityIcons
            name="information"
            size={24}
            color={colors.primary}
          />
          <StandardText
            size="sm"
            style={{ color: textPrimary, marginLeft: 12, flex: 1 }}
          >
            You can manage notification permissions in your device settings at
            any time.
          </StandardText>
        </StandardCard>

        <Gap size="xl" />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
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
    marginLeft: 12,
  },
  statusText: {
    marginTop: 8,
  },
  enableButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tokenText: {
    marginTop: 8,
    fontFamily: 'monospace',
  },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light_gray + '30',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
});

export default NotificationSettings;
