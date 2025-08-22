import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';
import { logger } from './logger';

// 存儲工具類
export class StorageManager {
  // 設置值
  static async set(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      logger.error('Storage set error:', { error, key });
      throw error;
    }
  }

  // 獲取值
  static async get<T>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue !== null) {
        return JSON.parse(jsonValue);
      }
      return defaultValue || null;
    } catch (error) {
      logger.error('Storage get error:', { error, key });
      return defaultValue || null;
    }
  }

  // 移除值
  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      logger.error('Storage remove error:', { error, key });
      throw error;
    }
  }

  // 清除所有數據
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      logger.error('Storage clear error:', { error });
      throw error;
    }
  }

  // 獲取所有鍵
  static async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return Array.from(keys);
    } catch (error) {
      logger.error('Storage getAllKeys error:', { error });
      return [];
    }
  }

  // 檢查鍵是否存在
  static async hasKey(key: string): Promise<boolean> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.includes(key);
    } catch (error) {
      logger.error('Storage hasKey error:', { error, key });
      return false;
    }
  }

  // 獲取多個值
  static async multiGet(keys: string[]): Promise<[string, any][]> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      return pairs.map(([key, value]) => [
        key,
        value ? JSON.parse(value) : null,
      ]);
    } catch (error) {
      logger.error('Storage multiGet error:', { error, keys });
      return [];
    }
  }

  // 設置多個值
  static async multiSet(keyValuePairs: [string, any][]): Promise<void> {
    try {
      const pairs: [string, string][] = keyValuePairs.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      logger.error('Storage multiSet error:', { error, keyValuePairs });
      throw error;
    }
  }

  // 移除多個值
  static async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      logger.error('Storage multiRemove error:', { error, keys });
      throw error;
    }
  }
}

// 認證相關存儲
export const AuthStorage = {
  // 保存認證令牌
  setAuthToken: (token: string): Promise<void> => {
    return StorageManager.set(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  // 獲取認證令牌
  getAuthToken: (): Promise<string | null> => {
    return StorageManager.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  },

  // 保存刷新令牌
  setRefreshToken: (token: string): Promise<void> => {
    return StorageManager.set(STORAGE_KEYS.REFRESH_TOKEN, token);
  },

  // 獲取刷新令牌
  getRefreshToken: (): Promise<string | null> => {
    return StorageManager.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
  },

  // 保存用戶數據
  setUserData: (userData: any): Promise<void> => {
    return StorageManager.set(STORAGE_KEYS.USER_DATA, userData);
  },

  // 獲取用戶數據
  getUserData: (): Promise<any | null> => {
    return StorageManager.get(STORAGE_KEYS.USER_DATA);
  },

  // 清除認證數據
  clearAuth: async (): Promise<void> => {
    await StorageManager.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
  },
};

// 設置相關存儲
export const SettingsStorage = {
  // 保存設置
  setSettings: (settings: any): Promise<void> => {
    return StorageManager.set(STORAGE_KEYS.SETTINGS, settings);
  },

  // 獲取設置
  getSettings: (): Promise<any | null> => {
    return StorageManager.get(STORAGE_KEYS.SETTINGS);
  },

  // 保存主題
  setTheme: (theme: string): Promise<void> => {
    return StorageManager.set(STORAGE_KEYS.THEME, theme);
  },

  // 獲取主題
  getTheme: (): Promise<string | null> => {
    return StorageManager.get<string>(STORAGE_KEYS.THEME);
  },

  // 保存語言
  setLanguage: (language: string): Promise<void> => {
    return StorageManager.set(STORAGE_KEYS.LANGUAGE, language);
  },

  // 獲取語言
  getLanguage: (): Promise<string | null> => {
    return StorageManager.get<string>(STORAGE_KEYS.LANGUAGE);
  },
};

// 快取相關存儲
export const CacheStorage = {
  // 保存快取數據
  setCacheData: (key: string, data: any, expiry?: number): Promise<void> => {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      expiry: expiry || Date.now() + 24 * 60 * 60 * 1000, // 預設 24 小時
    };
    return StorageManager.set(`cache_${key}`, cacheItem);
  },

  // 獲取快取數據
  getCacheData: async <T>(key: string): Promise<T | null> => {
    try {
      const cacheItem = await StorageManager.get<{
        data: T;
        timestamp: number;
        expiry: number;
      }>(`cache_${key}`);

      if (!cacheItem) {
        return null;
      }

      // 檢查是否過期
      if (Date.now() > cacheItem.expiry) {
        await StorageManager.remove(`cache_${key}`);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      logger.error('Cache get error:', { error, key });
      return null;
    }
  },

  // 移除快取數據
  removeCacheData: (key: string): Promise<void> => {
    return StorageManager.remove(`cache_${key}`);
  },

  // 清除所有快取
  clearCache: async (): Promise<void> => {
    try {
      const keys = await StorageManager.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith('cache_'));
      await StorageManager.multiRemove(cacheKeys);
    } catch (error) {
      logger.error('Cache clear error:', { error });
      throw error;
    }
  },

  // 清理過期快取
  cleanupExpiredCache: async (): Promise<void> => {
    try {
      const keys = await StorageManager.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith('cache_'));

      for (const key of cacheKeys) {
        const cacheItem = await StorageManager.get<{
          data: any;
          timestamp: number;
          expiry: number;
        }>(key);

        if (cacheItem && Date.now() > cacheItem.expiry) {
          await StorageManager.remove(key);
        }
      }
    } catch (error) {
      logger.error('Cache cleanup error:', { error });
    }
  },
};

// 應用數據存儲
export const AppStorage = {
  // 設置引導完成狀態
  setOnboardingCompleted: (completed: boolean): Promise<void> => {
    return StorageManager.set(STORAGE_KEYS.ONBOARDING_COMPLETED, completed);
  },

  // 獲取引導完成狀態
  getOnboardingCompleted: async (): Promise<boolean> => {
    const result = await StorageManager.get<boolean>(
      STORAGE_KEYS.ONBOARDING_COMPLETED,
      false
    );
    return result ?? false;
  },

  // 設置最後同步時間
  setLastSync: (timestamp: number): Promise<void> => {
    return StorageManager.set(STORAGE_KEYS.LAST_SYNC, timestamp);
  },

  // 獲取最後同步時間
  getLastSync: (): Promise<number | null> => {
    return StorageManager.get<number>(STORAGE_KEYS.LAST_SYNC);
  },

  // 檢查是否需要同步
  needsSync: async (syncInterval: number = 5 * 60 * 1000): Promise<boolean> => {
    const lastSync = await AppStorage.getLastSync();
    if (!lastSync) {
      return true;
    }
    return Date.now() - lastSync > syncInterval;
  },
};

// 導出預設存儲管理器
export default StorageManager;
