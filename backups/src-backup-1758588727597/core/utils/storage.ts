import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from './constants';
import { logger } from './logger';

// 存儲工具類
export class StorageManager {
  // 設置值
  static async set(key: string, value: unknown): Promise<void> {
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

  // 獲取存儲大小
  static async getSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return totalSize;
    } catch (error) {
      logger.error('Storage getSize error:', { error });
      return 0;
    }
  }

  // 清理過期數據
  static async cleanup(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const now = Date.now();

      for (const key of keys) {
        if (key.includes('expiry')) {
          const expiryKey = key;
          const dataKey = key.replace('expiry', '');

          const expiry = await AsyncStorage.getItem(expiryKey);
          if (expiry && parseInt(expiry) < now) {
            await AsyncStorage.multiRemove([dataKey, expiryKey]);
          }
        }
      }
    } catch (error) {
      logger.error('Storage cleanup error:', { error });
    }
  }
}

// 認證存儲工具
export class AuthStorage {
  // 保存認證令牌
  static async setToken(token: string): Promise<void> {
    await StorageManager.set(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  // 獲取認證令牌
  static async getToken(): Promise<string | null> {
    return StorageManager.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  }

  // 移除認證令牌
  static async removeToken(): Promise<void> {
    await StorageManager.remove(STORAGE_KEYS.AUTH_TOKEN);
  }

  // 保存刷新令牌
  static async setRefreshToken(token: string): Promise<void> {
    await StorageManager.set(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  // 獲取刷新令牌
  static async getRefreshToken(): Promise<string | null> {
    return StorageManager.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
  }

  // 移除刷新令牌
  static async removeRefreshToken(): Promise<void> {
    await StorageManager.remove(STORAGE_KEYS.REFRESH_TOKEN);
  }

  // 清除所有認證數據
  static async clearAuth(): Promise<void> {
    await StorageManager.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
    ]);
  }
}

// 用戶數據存儲工具
export class UserStorage {
  // 保存用戶數據
  static async setUserData(userData: unknown): Promise<void> {
    await StorageManager.set(STORAGE_KEYS.USER_DATA, userData);
  }

  // 獲取用戶數據
  static async getUserData(): Promise<any | null> {
    return StorageManager.get(STORAGE_KEYS.USER_DATA);
  }

  // 移除用戶數據
  static async removeUserData(): Promise<void> {
    await StorageManager.remove(STORAGE_KEYS.USER_DATA);
  }
}

// 設置存儲工具
export class SettingsStorage {
  // 保存應用設置
  static async setSettings(settings: unknown): Promise<void> {
    await StorageManager.set(STORAGE_KEYS.SETTINGS, settings);
  }

  // 獲取應用設置
  static async getSettings(): Promise<any | null> {
    return StorageManager.get(STORAGE_KEYS.SETTINGS);
  }

  // 更新部分設置
  static async updateSettings(updates: unknown): Promise<void> {
    const currentSettings = (await this.getSettings()) || {};
    const newSettings = { ...currentSettings, ...updates };
    await this.setSettings(newSettings);
  }
}

// 緩存存儲工具
export class CacheStorage {
  // 保存緩存數據
  static async setCache(
    key: string,
    data: unknown,
    expiry?: number
  ): Promise<void> {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: expiry ? Date.now() + expiry : null,
    };
    await StorageManager.set(`${STORAGE_KEYS.CACHE}_${key}`, cacheData);
  }

  // 獲取緩存數據
  static async getCache<T>(key: string): Promise<T | null> {
    try {
      const cacheData = await StorageManager.get(
        `${STORAGE_KEYS.CACHE}_${key}`
      );

      if (!cacheData) {
        return null;
      }

      // 檢查是否過期
      if ((cacheData as any).expiry && Date.now() > (cacheData as any).expiry) {
        await this.removeCache(key);
        return null;
      }

      return (cacheData as any).data;
    } catch (error) {
      logger.error('Cache get error:', { error, key });
      return null;
    }
  }

  // 移除緩存數據
  static async removeCache(key: string): Promise<void> {
    await StorageManager.remove(`${STORAGE_KEYS.CACHE}_${key}`);
  }

  // 清除所有緩存
  static async clearCache(): Promise<void> {
    const keys = await StorageManager.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.CACHE));
    await StorageManager.multiRemove(cacheKeys);
  }
}

// 離線數據存儲工具
export class OfflineStorage {
  // 保存離線數據
  static async setOfflineData(key: string, data: unknown): Promise<void> {
    await StorageManager.set(`${STORAGE_KEYS.OFFLINE_DATA}_${key}`, data);
  }

  // 獲取離線數據
  static async getOfflineData<T>(key: string): Promise<T | null> {
    return StorageManager.get<T>(`${STORAGE_KEYS.OFFLINE_DATA}_${key}`);
  }

  // 移除離線數據
  static async removeOfflineData(key: string): Promise<void> {
    await StorageManager.remove(`${STORAGE_KEYS.OFFLINE_DATA}_${key}`);
  }

  // 清除所有離線數據
  static async clearOfflineData(): Promise<void> {
    const keys = await StorageManager.getAllKeys();
    const offlineKeys = keys.filter(key =>
      key.startsWith(STORAGE_KEYS.OFFLINE_DATA)
    );
    await StorageManager.multiRemove(offlineKeys);
  }
}
