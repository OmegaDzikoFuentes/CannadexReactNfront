// src/services/sync.ts
import NetInfo from '@react-native-netinfo/netinfo';
import { StorageService } from './storage';
import ApiService from './api';

export class SyncService {
  private static isSyncing: boolean = false;
  private static syncCallbacks: Array<() => void> = [];

  static async performSync(): Promise<void> {
    if (this.isSyncing) return;

    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      console.log('Cannot sync - no network connection');
      return;
    }

    this.isSyncing = true;

    try {
      // Process offline queue
      await this.processOfflineQueue();

      // Update last sync timestamp
      await StorageService.setLastSync();

      // Notify listeners
      this.syncCallbacks.forEach(callback => callback());

    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  private static async processOfflineQueue(): Promise<void> {
    const queue = await StorageService.getOfflineQueue();
    if (queue.length === 0) return;

    const failedRequests: any[] = [];

    for (const request of queue) {
      try {
        // Attempt to replay the request
        // This would need to be implemented based on your specific needs
        console.log('Processing offline request:', request);
        
        // For now, we'll just log it
        // In a real implementation, you'd reconstruct and send the API call
        
      } catch (error) {
        console.error('Failed to process offline request:', error);
        
        // Keep requests that are less than 24 hours old
        const age = Date.now() - request.timestamp;
        if (age < 24 * 60 * 60 * 1000) {
          failedRequests.push(request);
        }
      }
    }

    // Update queue with failed requests
    await StorageService.clearOfflineQueue();
    for (const failedRequest of failedRequests) {
      await StorageService.addToOfflineQueue(failedRequest);
    }
  }

  static onSync(callback: () => void): () => void {
    this.syncCallbacks.push(callback);
    
    return () => {
      const index = this.syncCallbacks.indexOf(callback);
      if (index > -1) {
        this.syncCallbacks.splice(index, 1);
      }
    };
  }

  static isSyncInProgress(): boolean {
    return this.isSyncing;
  }
}
