// src/services/NotificationService.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type?: string;
  battle_id?: string;
  user_id?: string;
  strain_id?: string;
  achievement_id?: string;
  encounter_id?: string;
}

class NotificationService {
  private notificationListener: any;
  private responseListener: any;

  async initialize() {
    // Request permissions
    await this.requestPermissions();
    
    // Get FCM token and register with backend
    const token = await this.getToken();
    if (token) {
      await this.registerToken(token);
    }

    // Set up notification listeners
    this.setupNotificationListeners();

    // Handle notifications that opened the app when it was killed
    const initialNotification = await Notifications.getLastNotificationResponseAsync();
    if (initialNotification) {
      this.handleNotificationResponse(initialNotification);
    }
  }

  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }

    // For Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });

      // Create additional channels for different notification types
      await Notifications.setNotificationChannelAsync('battles', {
        name: 'Battle Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('social', {
        name: 'Social Notifications',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2196F3',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('achievements', {
        name: 'Achievement Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 150, 150, 150],
        lightColor: '#FFD700',
        sound: 'default',
      });
    }

    return true;
  }

  async getToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        return null;
      }

      const projectId = 'your-firebase-project-id'; // Replace with your Firebase project ID
      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      console.log('FCM Token:', token.data);
      await AsyncStorage.setItem('fcm_token', token.data);
      return token.data;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  async registerToken(token: string): Promise<void> {
    try {
      await ApiService.updateFCMToken(token);
      console.log('FCM token registered with backend');
    } catch (error) {
      console.error('Failed to register FCM token with backend:', error);
    }
  }

  setupNotificationListeners() {
    // Listener for notifications received while the app is in the foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
      this.handleForegroundNotification(notification);
    });

    // Listener for when a user taps on a notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  removeListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  private handleForegroundNotification(notification: Notifications.Notification) {
    const data = notification.request.content.data as NotificationData;
    
    // You can show in-app notifications here or update UI
    console.log('Handling foreground notification:', data);
    
    // Example: Show a custom in-app notification banner
    // showInAppNotification(notification.request.content.title, notification.request.content.body);
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data as NotificationData;
    
    console.log('Handling notification tap:', data);
    
    // Navigate based on notification type
    this.navigateFromNotification(data);
  }

  private navigateFromNotification(data: NotificationData) {
    // You'll need to import your navigation service here
    // import { navigationRef } from '../navigation/NavigationService';
    
    switch (data.type) {
      case 'battle_challenge':
      case 'battle_accepted':
      case 'battle_completed':
        if (data.battle_id) {
          // navigationRef.navigate('BattleDetail', { battleId: data.battle_id });
          console.log('Navigate to battle:', data.battle_id);
        }
        break;
        
      case 'friend_request':
      case 'friend_accepted':
        if (data.user_id) {
          // navigationRef.navigate('Profile', { userId: data.user_id });
          console.log('Navigate to profile:', data.user_id);
        }
        break;
        
      case 'achievement_unlocked':
        // navigationRef.navigate('Achievements');
        console.log('Navigate to achievements');
        break;
        
      case 'strain_update':
        if (data.strain_id) {
          // navigationRef.navigate('StrainDetail', { strainId: data.strain_id });
          console.log('Navigate to strain:', data.strain_id);
        }
        break;
        
      case 'encounter_liked':
        if (data.encounter_id) {
          // navigationRef.navigate('EncounterDetail', { encounterId: data.encounter_id });
          console.log('Navigate to encounter:', data.encounter_id);
        }
        break;
        
      default:
        // navigationRef.navigate('Home');
        console.log('Navigate to home');
        break;
    }
  }

  // Local notification methods (for in-app notifications)
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: NotificationData,
    delaySeconds: number = 0
  ) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: delaySeconds > 0 ? { seconds: delaySeconds } : null,
    });
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  async clearBadge() {
    await Notifications.setBadgeCountAsync(0);
  }

  // Test notification (for development)
  async sendTestNotification() {
    await this.scheduleLocalNotification(
      'Test Notification',
      'This is a test notification from Cannadex!',
      { type: 'test' },
      1
    );
  }
}

export default new NotificationService();

// src/navigation/NavigationService.ts
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never);
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

export function reset(routes: any[]) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes,
    });
  }
}