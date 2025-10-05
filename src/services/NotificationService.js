import messaging from '@react-native-firebase/messaging';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUserFirebaseToken } from './NetworkUtils';

class NotificationService {
  constructor() {
    this.fcmToken = null;
    this.unsubscribeTokenRefresh = null;
    this.unsubscribeForeground = null;
    this.unsubscribeBackground = null;
    this.credentials = null; // Store credentials for API calls
  }

  // Set user credentials for API calls
  async setCredentials(credentials) {
    this.credentials = credentials;
    if (__DEV__) {
      console.log('NotificationService: Credentials set', {
        userId: credentials?.user_id,
        hasToken: !!credentials?.accessToken,
      });
    }

    // If we already have a token, send it to backend now that we have credentials
    if (this.fcmToken) {
      console.log(
        '📤 Sending existing FCM token to backend after credentials set',
      );
      await this.sendTokenToBackend(this.fcmToken);
    } else {
      // Try to get stored token from AsyncStorage
      const storedToken = await this.getStoredToken();
      if (storedToken) {
        console.log(
          '📤 Sending stored FCM token to backend after credentials set',
        );
        this.fcmToken = storedToken;
        await this.sendTokenToBackend(storedToken);
      }
    }
  }

  // Send FCM token to backend
  async sendTokenToBackend(token) {
    if (!this.credentials?.accessToken || !this.credentials?.user_id) {
      console.warn('NotificationService: Cannot send token - no credentials');
      return;
    }

    try {
      const response = await updateUserFirebaseToken(
        this.credentials.accessToken,
        this.credentials.user_id,
        token,
      );

      if (response.success) {
        console.log('✅ FCM token sent to backend successfully');
      } else {
        console.error(
          '❌ Failed to send FCM token to backend:',
          response.error,
        );
      }
    } catch (error) {
      console.error('❌ Error sending FCM token to backend:', error);
    }
  }

  // Request notification permissions
  async requestUserPermission() {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('iOS Authorization status:', authStatus);
          return true;
        }
      } else if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Android notification permission granted');
            return true;
          }
        } else {
          // For Android versions below 13, permission is granted by default
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  // Get FCM token
  async getFCMToken() {
    try {
      const token = await messaging().getToken();
      if (token) {
        console.log('FCM Token:', token);
        this.fcmToken = token;
        await AsyncStorage.setItem('fcmToken', token);

        // Send token to backend
        await this.sendTokenToBackend(token);

        return token;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
    return null;
  }

  // Initialize notification listeners
  async initializeNotifications() {
    try {
      // Request permission first
      const hasPermission = await this.requestUserPermission();
      if (!hasPermission) {
        console.log('Notification permission not granted');
        return;
      }

      // Get FCM token
      await this.getFCMToken();

      // Listen for token refresh
      this.unsubscribeTokenRefresh = messaging().onTokenRefresh(async token => {
        console.log('FCM Token refreshed:', token);
        this.fcmToken = token;
        await AsyncStorage.setItem('fcmToken', token);

        // Send refreshed token to backend
        await this.sendTokenToBackend(token);
      });

      // Handle foreground notifications
      this.unsubscribeForeground = messaging().onMessage(
        async remoteMessage => {
          console.log('Foreground notification:', remoteMessage);

          if (remoteMessage.notification) {
            Alert.alert(
              remoteMessage.notification.title || 'Notification',
              remoteMessage.notification.body || '',
              [
                {
                  text: 'OK',
                  onPress: () => console.log('Notification dismissed'),
                },
              ],
            );
          }
        },
      );

      // Handle notification opened app from background
      this.unsubscribeBackground = messaging().onNotificationOpenedApp(
        remoteMessage => {
          console.log(
            'Notification caused app to open from background:',
            remoteMessage,
          );
          // Navigate to specific screen based on notification data
          this.handleNotificationNavigation(remoteMessage);
        },
      );

      // Check if notification opened app from quit state
      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            console.log(
              'Notification caused app to open from quit state:',
              remoteMessage,
            );
            // Navigate to specific screen based on notification data
            this.handleNotificationNavigation(remoteMessage);
          }
        });
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  // Handle notification navigation
  handleNotificationNavigation(remoteMessage) {
    // You can implement navigation logic based on notification data
    if (remoteMessage?.data) {
      const { type, screen, id } = remoteMessage.data;
      console.log('Navigate to:', { type, screen, id });

      // Example: Navigate to specific screens based on notification type
      // navigation.navigate(screen, {id});
    }
  }

  // Subscribe to topic
  async subscribeToTopic(topic) {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error('Error subscribing to topic:', error);
    }
  }

  // Unsubscribe from topic
  async unsubscribeFromTopic(topic) {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
    }
  }

  // Get stored token
  async getStoredToken() {
    try {
      const token = await AsyncStorage.getItem('fcmToken');
      return token;
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  // Check notification permission status
  async checkPermissionStatus() {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        return (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
      } else if (Platform.OS === 'android') {
        // On Android, check if POST_NOTIFICATIONS permission is granted
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          return granted;
        }
        // For Android versions below 13, permission is granted by default
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking permission status:', error);
      return false;
    }
  }

  // Clean up listeners
  cleanup() {
    if (this.unsubscribeTokenRefresh) {
      this.unsubscribeTokenRefresh();
    }
    if (this.unsubscribeForeground) {
      this.unsubscribeForeground();
    }
    if (this.unsubscribeBackground) {
      this.unsubscribeBackground();
    }
  }
}

export default new NotificationService();
