import AsyncStorage from '@react-native-async-storage/async-storage';

import type { User } from '../types';
import { logger } from '../utils/logger';

class UserStorage {
  private static readonly USER_KEY = 'user_data';
  private static readonly USER_PREFERENCES_KEY = 'user_preferences';
  private static readonly USER_STATISTICS_KEY = 'user_statistics';
  private static readonly USER_SETTINGS_KEY = 'user_settings';

  /**
   * 保存用戶數據
   */
  static async setUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
      logger.debug('用戶數據已保存');
    } catch (error: unknown) {
      logger.error('保存用戶數據失敗:', error);
      throw new Error(`保存用戶數據失敗: ${error.message}`);
    }
  }

  /**
   * 獲取用戶數據
   */
  static async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.USER_KEY);
      if (!userData) {
        return null;
      }

      const user = JSON.parse(userData);

      // 轉換日期字符串為 Date 對象
      if (user.statistics?.joinDate) {
        user.statistics.joinDate = new Date(user.statistics.joinDate);
      }
      if (user.statistics?.lastActive) {
        user.statistics.lastActive = new Date(user.statistics.lastActive);
      }

      return user;
    } catch (error: unknown) {
      logger.error('獲取用戶數據失敗:', error);
      return null;
    }
  }

  /**
   * 保存用戶偏好設置
   */
  static async setUserPreferences(preferences: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.USER_PREFERENCES_KEY,
        JSON.stringify(preferences)
      );
      logger.debug('用戶偏好設置已保存');
    } catch (error: unknown) {
      logger.error('保存用戶偏好設置失敗:', error);
      throw new Error(`保存用戶偏好設置失敗: ${error.message}`);
    }
  }

  /**
   * 獲取用戶偏好設置
   */
  static async getUserPreferences(): Promise<any | null> {
    try {
      const preferencesData = await AsyncStorage.getItem(
        this.USER_PREFERENCES_KEY
      );
      if (!preferencesData) {
        return null;
      }
      return JSON.parse(preferencesData);
    } catch (error: unknown) {
      logger.error('獲取用戶偏好設置失敗:', error);
      return null;
    }
  }

  /**
   * 保存用戶統計數據
   */
  static async setUserStatistics(statistics: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.USER_STATISTICS_KEY,
        JSON.stringify(statistics)
      );
      logger.debug('用戶統計數據已保存');
    } catch (error: unknown) {
      logger.error('保存用戶統計數據失敗:', error);
      throw new Error(`保存用戶統計數據失敗: ${error.message}`);
    }
  }

  /**
   * 獲取用戶統計數據
   */
  static async getUserStatistics(): Promise<any | null> {
    try {
      const statisticsData = await AsyncStorage.getItem(
        this.USER_STATISTICS_KEY
      );
      if (!statisticsData) {
        return null;
      }

      const statistics = JSON.parse(statisticsData);

      // 轉換日期字符串為 Date 對象
      if (statistics.joinDate) {
        statistics.joinDate = new Date(statistics.joinDate);
      }
      if (statistics.lastActive) {
        statistics.lastActive = new Date(statistics.lastActive);
      }

      return statistics;
    } catch (error: unknown) {
      logger.error('獲取用戶統計數據失敗:', error);
      return null;
    }
  }

  /**
   * 保存用戶設置
   */
  static async setUserSettings(settings: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.USER_SETTINGS_KEY,
        JSON.stringify(settings)
      );
      logger.debug('用戶設置已保存');
    } catch (error: unknown) {
      logger.error('保存用戶設置失敗:', error);
      throw new Error(`保存用戶設置失敗: ${error.message}`);
    }
  }

  /**
   * 獲取用戶設置
   */
  static async getUserSettings(): Promise<any | null> {
    try {
      const settingsData = await AsyncStorage.getItem(this.USER_SETTINGS_KEY);
      if (!settingsData) {
        return null;
      }
      return JSON.parse(settingsData);
    } catch (error: unknown) {
      logger.error('獲取用戶設置失敗:', error);
      return null;
    }
  }

  /**
   * 更新用戶數據的特定字段
   */
  static async updateUser(updates: Partial<User>): Promise<void> {
    try {
      const currentUser = await this.getUser();
      if (!currentUser) {
        throw new Error('用戶數據不存在');
      }

      const updatedUser = { ...currentUser, ...updates };
      await this.setUser(updatedUser);
      logger.debug('用戶數據已更新');
    } catch (error: unknown) {
      logger.error('更新用戶數據失敗:', error);
      throw new Error(`更新用戶數據失敗: ${error.message}`);
    }
  }

  /**
   * 更新用戶偏好設置的特定字段
   */
  static async updateUserPreferences(updates: unknown): Promise<void> {
    try {
      const currentPreferences = await this.getUserPreferences();
      const updatedPreferences = { ...currentPreferences, ...updates };
      await this.setUserPreferences(updatedPreferences);
      logger.debug('用戶偏好設置已更新');
    } catch (error: unknown) {
      logger.error('更新用戶偏好設置失敗:', error);
      throw new Error(`更新用戶偏好設置失敗: ${error.message}`);
    }
  }

  /**
   * 更新用戶統計數據的特定字段
   */
  static async updateUserStatistics(updates: unknown): Promise<void> {
    try {
      const currentStatistics = await this.getUserStatistics();
      const updatedStatistics = { ...currentStatistics, ...updates };
      await this.setUserStatistics(updatedStatistics);
      logger.debug('用戶統計數據已更新');
    } catch (error: unknown) {
      logger.error('更新用戶統計數據失敗:', error);
      throw new Error(`更新用戶統計數據失敗: ${error.message}`);
    }
  }

  /**
   * 更新用戶設置的特定字段
   */
  static async updateUserSettings(updates: unknown): Promise<void> {
    try {
      const currentSettings = await this.getUserSettings();
      const updatedSettings = { ...currentSettings, ...updates };
      await this.setUserSettings(updatedSettings);
      logger.debug('用戶設置已更新');
    } catch (error: unknown) {
      logger.error('更新用戶設置失敗:', error);
      throw new Error(`更新用戶設置失敗: ${error.message}`);
    }
  }

  /**
   * 清除所有用戶相關數據
   */
  static async clearAll(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.USER_KEY),
        AsyncStorage.removeItem(this.USER_PREFERENCES_KEY),
        AsyncStorage.removeItem(this.USER_STATISTICS_KEY),
        AsyncStorage.removeItem(this.USER_SETTINGS_KEY),
      ]);
      logger.debug('所有用戶數據已清除');
    } catch (error: unknown) {
      logger.error('清除用戶數據失敗:', error);
      throw new Error(`清除用戶數據失敗: ${error.message}`);
    }
  }

  /**
   * 檢查是否有存儲的用戶數據
   */
  static async hasUserData(): Promise<boolean> {
    try {
      const [user, preferences, statistics, settings] = await Promise.all([
        AsyncStorage.getItem(this.USER_KEY),
        AsyncStorage.getItem(this.USER_PREFERENCES_KEY),
        AsyncStorage.getItem(this.USER_STATISTICS_KEY),
        AsyncStorage.getItem(this.USER_SETTINGS_KEY),
      ]);

      return !!(user || preferences || statistics || settings);
    } catch (error: unknown) {
      logger.error('檢查用戶數據失敗:', error);
      return false;
    }
  }

  /**
   * 獲取所有用戶相關的鍵
   */
  static getUserKeys(): string[] {
    return [
      this.USER_KEY,
      this.USER_PREFERENCES_KEY,
      this.USER_STATISTICS_KEY,
      this.USER_SETTINGS_KEY,
    ];
  }

  /**
   * 備份用戶數據
   */
  static async backupUserData(): Promise<any> {
    try {
      const [user, preferences, statistics, settings] = await Promise.all([
        this.getUser(),
        this.getUserPreferences(),
        this.getUserStatistics(),
        this.getUserSettings(),
      ]);

      const backup = {
        user,
        preferences,
        statistics,
        settings,
        timestamp: new Date().toISOString(),
      };

      logger.debug('用戶數據備份已創建');
      return backup;
    } catch (error: unknown) {
      logger.error('創建用戶數據備份失敗:', error);
      throw new Error(`創建用戶數據備份失敗: ${error.message}`);
    }
  }

  /**
   * 恢復用戶數據
   */
  static async restoreUserData(backup: unknown): Promise<void> {
    try {
      if (backup.user) {
        await this.setUser(backup.user);
      }
      if (backup.preferences) {
        await this.setUserPreferences(backup.preferences);
      }
      if (backup.statistics) {
        await this.setUserStatistics(backup.statistics);
      }
      if (backup.settings) {
        await this.setUserSettings(backup.settings);
      }

      logger.debug('用戶數據已恢復');
    } catch (error: unknown) {
      logger.error('恢復用戶數據失敗:', error);
      throw new Error(`恢復用戶數據失敗: ${error.message}`);
    }
  }
}

export { UserStorage };
