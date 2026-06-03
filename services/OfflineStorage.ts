// services/OfflineStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export class OfflineStorage {
  private static instance: OfflineStorage;
  private isConnected: boolean = true;

  private constructor() {
    this.initializeNetworkListener();
  }

  static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage();
    }
    return OfflineStorage.instance;
  }

  private async initializeNetworkListener(): Promise<void> {
    const netInfo = await NetInfo.fetch();
    this.isConnected = netInfo.isConnected ?? true;

    NetInfo.addEventListener((state: NetInfoState) => {
      this.isConnected = state.isConnected ?? true;
      console.log(`Network status changed: ${this.isConnected ? 'Connected' : 'Disconnected'}`);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error reading from AsyncStorage: ${key}`, error);
      return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to AsyncStorage: ${key}`, error);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from AsyncStorage: ${key}`, error);
    }
  }

  async multiGet(keys: string[]): Promise<readonly [string, string | null][]> {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      console.error('Error with multiGet', error);
      return [];
    }
  }

  async multiSet(keyValuePairs: [string, any][]): Promise<void> {
    try {
      const stringPairs = keyValuePairs.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(stringPairs as any);
    } catch (error) {
      console.error('Error with multiSet', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing AsyncStorage', error);
    }
  }

  // Cache management
  async cacheData<T>(key: string, data: T, ttl: number = 3600000): Promise<void> {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    await this.set(`cache_${key}`, cacheItem);
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    const cacheItem = await this.get<{ data: T; timestamp: number; ttl: number }>(`cache_${key}`);
    
    if (!cacheItem) {
      return null;
    }

    const isExpired = Date.now() - cacheItem.timestamp > cacheItem.ttl;
    if (isExpired) {
      await this.remove(`cache_${key}`);
      return null;
    }

    return cacheItem.data;
  }

  // Queue for offline actions
  async addToQueue(action: OfflineAction): Promise<void> {
    const queue = await this.get<OfflineAction[]>('offline_queue') || [];
    queue.push(action);
    await this.set('offline_queue', queue);
  }

  async processQueue(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    const queue = await this.get<OfflineAction[]>('offline_queue') || [];
    
    for (const action of queue) {
      try {
        // Process action (this would be API calls in real implementation)
        console.log('Processing offline action:', action);
        
        // Remove from queue after successful processing
        const newQueue = queue.filter(a => a.id !== action.id);
        await this.set('offline_queue', newQueue);
      } catch (error) {
        console.error('Failed to process offline action:', error);
      }
    }
  }

  isOnline(): boolean {
    return this.isConnected;
  }
}

interface OfflineAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

export const offlineStorage = OfflineStorage.getInstance();