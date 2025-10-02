import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from './constants';
import { logger } from './logger';

// StorageToolClass
export class StorageManager {
  // SettingsValue
  static async set(key: string, value: unknown): Promise<void> {
    try {
      const _jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      logger.error('Storage set error:', { error, key });
      throw error;
    }
  }

  // GetValue
  static async get<T>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      const _jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue !== null) {
        return JSON.parse(jsonValue);
      }
      return defaultValue || null;
    } catch (error) {
      logger.error('Storage get error:', { error, key });
      return defaultValue || null;
    }
  }

  // RemoveValue
  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      logger.error('Storage remove error:', { error, key });
      throw error;
    }
  }

  // Clear所有Data
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      logger.error('Storage clear error:', { error });
      throw error;
    }
  }

  // Get所有Key
  static async getAllKeys(): Promise<string[]> {
    try {
      const _keys = await AsyncStorage.getAllKeys();
      return Array.from(keys);
    } catch (error) {
      logger.error('Storage getAllKeys error:', { error });
      return [];
    }
  }

  // CheckKeyYesNo存在
  static async hasKey(key: string): Promise<boolean> {
    try {
      const _keys = await AsyncStorage.getAllKeys();
      return keys.includes(key);
    } catch (error) {
      logger.error('Storage hasKey error:', { error, key });
      return false;
    }
  }

  // GetMultipleValue
  static async multiGet(keys: string[]): Promise<[string, any][]> {
    try {
      const _pairs = await AsyncStorage.multiGet(keys);
      return pairs.map(([key, value]) => [
        key,
        value ? JSON.parse(value) : null,
      ]);
    } catch (error) {
      logger.error('Storage multiGet error:', { error, keys });
      return [];
    }
  }

  // SettingsMultipleValue
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

  // RemoveMultipleValue
  static async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      logger.error('Storage multiRemove error:', { error, keys });
      throw error;
    }
  }

  // GetStorage大小
  static async getSize(): Promise<number> {
    try {
      const _keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const _value = await AsyncStorage.getItem(key);
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

  // 清理過期Data
  static async cleanup(): Promise<void> {
    try {
      const _keys = await AsyncStorage.getAllKeys();
      const _now = Date.now();

      for (const key of keys) {
        if (key.includes('_expiry')) {
          const _expiryKey = key;
          const _dataKey = key.replace('_expiry', '');

          const _expiry = await AsyncStorage.getItem(expiryKey);
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

// AuthenticateStorageTool
export class AuthStorage {
  // SaveAuthenticate令牌
  static async setToken(token: string): Promise<void> {
    await StorageManager.set(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  // GetAuthenticate令牌
  static async getToken(): Promise<string | null> {
    return StorageManager.get<string>(STORAGE_KEYS.AUTH_TOKEN);
  }

  // RemoveAuthenticate令牌
  static async removeToken(): Promise<void> {
    await StorageManager.remove(STORAGE_KEYS.AUTH_TOKEN);
  }

  // SaveRefresh令牌
  static async setRefreshToken(token: string): Promise<void> {
    await StorageManager.set(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  // GetRefresh令牌
  static async getRefreshToken(): Promise<string | null> {
    return StorageManager.get<string>(STORAGE_KEYS.REFRESH_TOKEN);
  }

  // RemoveRefresh令牌
  static async removeRefreshToken(): Promise<void> {
    await StorageManager.remove(STORAGE_KEYS.REFRESH_TOKEN);
  }

  // Clear所有AuthenticateData
  static async clearAuth(): Promise<void> {
    await StorageManager.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
    ]);
  }
}

// UserDataStorageTool
export class UserStorage {
  // SaveUserData
  static async setUserData(userData: unknown): Promise<void> {
    await StorageManager.set(STORAGE_KEYS.USER_DATA, userData);
  }

  // GetUserData
  static async getUserData(): Promise<any | null> {
    return StorageManager.get(STORAGE_KEYS.USER_DATA);
  }

  // RemoveUserData
  static async removeUserData(): Promise<void> {
    await StorageManager.remove(STORAGE_KEYS.USER_DATA);
  }
}

// SettingsStorageTool
export class SettingsStorage {
  // SaveApplySettings
  static async setSettings(settings: unknown): Promise<void> {
    await StorageManager.set(STORAGE_KEYS.SETTINGS, settings);
  }

  // GetApplySettings
  static async getSettings(): Promise<any | null> {
    return StorageManager.get(STORAGE_KEYS.SETTINGS);
  }

  // UpdatePartialSettings
  static async updateSettings(updates: unknown): Promise<void> {
    const _currentSettings = (await this.getSettings()) || {};
    const _newSettings = { ...currentSettings, ...updates };
    await this.setSettings(newSettings);
  }
}

// CacheStorageTool
export class CacheStorage {
  // SaveCacheData
  static async setCache(
    key: string,
    data: unknown,
    expiry?: number
  ): Promise<void> {
    const _cacheData = {
      data,
      timestamp: Date.now(),
      expiry: expiry ? Date.now() + expiry : null,
    };
    await StorageManager.set(`${STORAGE_KEYS.CACHE}_${key}`, cacheData);
  }

  // GetCacheData
  static async getCache<T>(key: string): Promise<T | null> {
    try {
      const _cacheData = await StorageManager.get(
        `${STORAGE_KEYS.CACHE}_${key}`
      );

      if (!cacheData) {
        return null;
      }

      // CheckYesNo過期
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

  // RemoveCacheData
  static async removeCache(key: string): Promise<void> {
    await StorageManager.remove(`${STORAGE_KEYS.CACHE}_${key}`);
  }

  // Clear所有Cache
  static async clearCache(): Promise<void> {
    const _keys = await StorageManager.getAllKeys();
    const _cacheKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.CACHE));
    await StorageManager.multiRemove(cacheKeys);
  }
}

// 離線DataStorageTool
export class OfflineStorage {
  // Save離線Data
  static async setOfflineData(key: string, data: unknown): Promise<void> {
    await StorageManager.set(`${STORAGE_KEYS.OFFLINE_DATA}_${key}`, data);
  }

  // Get離線Data
  static async getOfflineData<T>(key: string): Promise<T | null> {
    return StorageManager.get<T>(`${STORAGE_KEYS.OFFLINE_DATA}_${key}`);
  }

  // Remove離線Data
  static async removeOfflineData(key: string): Promise<void> {
    await StorageManager.remove(`${STORAGE_KEYS.OFFLINE_DATA}_${key}`);
  }

  // Clear所有離線Data
  static async clearOfflineData(): Promise<void> {
    const _keys = await StorageManager.getAllKeys();
    const _offlineKeys = keys.filter(key =>
      key.startsWith(STORAGE_KEYS.OFFLINE_DATA)
    );
    await StorageManager.multiRemove(offlineKeys);
  }
}
