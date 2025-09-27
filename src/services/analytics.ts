// src/services/analytics.ts
import { StorageService } from './storage';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: number;
}

export class AnalyticsService {
  private static events: AnalyticsEvent[] = [];
  private static isEnabled: boolean = true;

  static async initialize(): Promise<void> {
    const settings = await StorageService.getAppSettings();
    this.isEnabled = settings.analytics;
  }

  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  static track(eventName: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(event);
    
    // In a real app, you'd send this to your analytics service
    if (__DEV__) {
      console.log('Analytics Event:', event);
    }

    // Batch send events when queue gets large
    if (this.events.length >= 10) {
      this.flush();
    }
  }

  static async flush(): Promise<void> {
    if (this.events.length === 0) return;

    try {
      // In a real app, send events to your analytics service
      // await ApiService.sendAnalyticsEvents(this.events);
      this.events = [];
    } catch (error) {
      console.error('Failed to send analytics events:', error);
    }
  }

  // Common tracking methods
  static trackScreenView(screenName: string, properties?: Record<string, any>): void {
    this.track('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  static trackUserAction(action: string, properties?: Record<string, any>): void {
    this.track('user_action', {
      action,
      ...properties,
    });
  }

  static trackEncounterCreated(strainId: number, rating: number): void {
    this.track('encounter_created', {
      strain_id: strainId,
      overall_rating: rating,
    });
  }

  static trackBattleCreated(opponentId: number): void {
    this.track('battle_created', {
      opponent_id: opponentId,
    });
  }

  static trackSearchPerformed(query: string, resultCount: number): void {
    this.track('search_performed', {
      query_length: query.length,
      result_count: resultCount,
    });
  }
}
