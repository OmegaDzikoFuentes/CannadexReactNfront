// src/services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Strain, Encounter } from '../types';

export class StorageService {
  private static readonly KEYS = {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    CACHED_STRAINS: 'cached_strains',
    CACHED_ENCOUNTERS: 'cached_encounters',
    APP_SETTINGS: 'app_settings',
    ONBOARDING_COMPLETED: 'onboarding_completed',
    LAST_SYNC: 'last_sync',
    OFFLINE_QUEUE: 'offline_queue',
  } as const;

  // Auth methods
  static async setAuthData(token: string, refreshToken?: string, user?: User): Promise<void> {
    const promises = [AsyncStorage.setItem(this.KEYS.AUTH_TOKEN, token)];
    
    if (refreshToken) {
      promises.push(AsyncStorage.setItem(this.KEYS.REFRESH_TOKEN, refreshToken));
    }
    
    if (user) {
      promises.push(AsyncStorage.setItem(this.KEYS.USER_DATA, JSON.stringify(user)));
    }
    
    await Promise.all(promises);
  }

  static async getAuthToken(): Promise<string | null> {
    return AsyncStorage.getItem(this.KEYS.AUTH_TOKEN);
  }

  static async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(this.KEYS.REFRESH_TOKEN);
  }

  static async getUser(): Promise<User | null> {
    const userData = await AsyncStorage.getItem(this.KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }

  static async updateUser(user: User): Promise<void> {
    await AsyncStorage.setItem(this.KEYS.USER_DATA, JSON.stringify(user));
  }

  static async clearAuthData(): Promise<void> {
    await AsyncStorage.multiRemove([
      this.KEYS.AUTH_TOKEN,
      this.KEYS.REFRESH_TOKEN,
      this.KEYS.USER_DATA,
    ]);
  }

  // Cache methods
  static async setCachedStrains(strains: Strain[], timestamp?: number): Promise<void> {
    const cacheData = {
      data: strains,
      timestamp: timestamp || Date.now(),
    };
    await AsyncStorage.setItem(this.KEYS.CACHED_STRAINS, JSON.stringify(cacheData));
  }

  static async getCachedStrains(maxAge: number = 3600000): Promise<Strain[] | null> {
    try {
      const cached = await AsyncStorage.getItem(this.KEYS.CACHED_STRAINS);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      return age <= maxAge ? data : null;
    } catch (error) {
      return null;
    }
  }

  static async setCachedEncounters(encounters: Encounter[], timestamp?: number): Promise<void> {
    const cacheData = {
      data: encounters,
      timestamp: timestamp || Date.now(),
    };
    await AsyncStorage.setItem(this.KEYS.CACHED_ENCOUNTERS, JSON.stringify(cacheData));
  }

  static async getCachedEncounters(maxAge: number = 1800000): Promise<Encounter[] | null> {
    try {
      const cached = await AsyncStorage.getItem(this.KEYS.CACHED_ENCOUNTERS);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      return age <= maxAge ? data : null;
    } catch (error) {
      return null;
    }
  }

  // App settings
  static async getAppSettings(): Promise<{
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    location_sharing: boolean;
    analytics: boolean;
  }> {
    const settings = await AsyncStorage.getItem(this.KEYS.APP_SETTINGS);
    return settings ? JSON.parse(settings) : {
      theme: 'system',
      notifications: true,
      location_sharing: true,
      analytics: true,
    };
  }

  static async updateAppSettings(settings: any): Promise<void> {
    const currentSettings = await this.getAppSettings();
    const newSettings = { ...currentSettings, ...settings };
    await AsyncStorage.setItem(this.KEYS.APP_SETTINGS, JSON.stringify(newSettings));
  }

  // Onboarding
  static async setOnboardingCompleted(): Promise<void> {
    await AsyncStorage.setItem(this.KEYS.ONBOARDING_COMPLETED, 'true');
  }

  static async isOnboardingCompleted(): Promise<boolean> {
    const completed = await AsyncStorage.getItem(this.KEYS.ONBOARDING_COMPLETED);
    return completed === 'true';
  }

  // Offline queue for failed requests
  static async addToOfflineQueue(request: {
    method: string;
    url: string;
    data?: any;
    timestamp: number;
  }): Promise<void> {
    const queue = await this.getOfflineQueue();
    queue.push(request);
    await AsyncStorage.setItem(this.KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  }

  static async getOfflineQueue(): Promise<any[]> {
    const queue = await AsyncStorage.getItem(this.KEYS.OFFLINE_QUEUE);
    return queue ? JSON.parse(queue) : [];
  }

  static async clearOfflineQueue(): Promise<void> {
    await AsyncStorage.setItem(this.KEYS.OFFLINE_QUEUE, JSON.stringify([]));
  }

  // Last sync timestamp
  static async setLastSync(timestamp: number = Date.now()): Promise<void> {
    await AsyncStorage.setItem(this.KEYS.LAST_SYNC, timestamp.toString());
  }

  static async getLastSync(): Promise<number> {
    const timestamp = await AsyncStorage.getItem(this.KEYS.LAST_SYNC);
    return timestamp ? parseInt(timestamp, 10) : 0;
  }

  // Clear all data
  static async clearAll(): Promise<void> {
    await AsyncStorage.clear();
  }
}
