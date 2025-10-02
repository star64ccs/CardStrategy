import AsyncStorage from '@react-native-async-storage/async-storage';

import type { User } from '../types';
import { logger } from '../utils/logger';

class UserStorage {
  private static readonly USER_KEY = 'user_data';
  private static readonly USER_PREFERENCES_KEY = 'user_preferences';
  private static readonly USER_STATISTICS_KEY = 'user_statistics';
  private static readonly USER_SETTINGS_KEY = 'user_settings';

  /**
   * SaveUserData
   */
  static async setUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
      logger.debug('用戶數據已保存');
    } catch (error: unknown) {
      logger.error('保存用戶數據Failed:', error);
      throw new Error(`保存用戶數據Failed: ${error.message}`);
    }
  }

  /**
   * GetUserData
   */
  static async getUser(): Promise<User | null> {
    try {
      const _userData = await AsyncStorage.getItem(this.USER_KEY);
      if (!userData) {
        return null;
      }

      const _user = JSON.parse(userData);

      // ConvertDay字符串為 Date Object
      if (user.statistics?.joinDate) {
        user.statistics.joinDate = new Date(user.statistics.joinDate);
      }
      if (user.statistics?.lastActive) {
        user.statistics.lastActive = new Date(user.statistics.lastActive);
      }

      return user;
    } catch (error: unknown) {
      logger.error('Get用戶數據Failed:', error);
      return null;
    }
  }

  /**
   * SaveUserPreferencesSettings
   */
  static async setUserPreferences(preferences: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.USER_PREFERENCES_KEY,
        JSON.stringify(preferences)
      );
      logger.debug('用戶偏好設置已保存');
    } catch (error: unknown) {
      logger.error('保存用戶偏好SettingsFailed:', error);
      throw new Error(`保存用戶偏好SettingsFailed: ${error.message}`);
    }
  }

  /**
   * GetUserPreferencesSettings
   */
  static async getUserPreferences(): Promise<any | null> {
    try {
      const _preferencesData = await AsyncStorage.getItem(
        this.USER_PREFERENCES_KEY
      );
      if (!preferencesData) {
        return null;
      }
      return JSON.parse(preferencesData);
    } catch (error: unknown) {
      logger.error('Get用戶偏好SettingsFailed:', error);
      return null;
    }
  }

  /**
   * SaveUser統Count據
   */
  static async setUserStatistics(statistics: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.USER_STATISTICS_KEY,
        JSON.stringify(statistics)
      );
      logger.debug('用戶統計數據已保存');
    } catch (error: unknown) {
      logger.error('保存用戶統計數據Failed:', error);
      throw new Error(`保存用戶統計數據Failed: ${error.message}`);
    }
  }

  /**
   * GetUser統Count據
   */
  static async getUserStatistics(): Promise<any | null> {
    try {
      const _statisticsData = await AsyncStorage.getItem(
        this.USER_STATISTICS_KEY
      );
      if (!statisticsData) {
        return null;
      }

      const _statistics = JSON.parse(statisticsData);

      // ConvertDay字符串為 Date Object
      if (statistics.joinDate) {
        statistics.joinDate = new Date(statistics.joinDate);
      }
      if (statistics.lastActive) {
        statistics.lastActive = new Date(statistics.lastActive);
      }

      return statistics;
    } catch (error: unknown) {
      logger.error('Get用戶統計數據Failed:', error);
      return null;
    }
  }

  /**
   * SaveUserSettings
   */
  static async setUserSettings(settings: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.USER_SETTINGS_KEY,
        JSON.stringify(settings)
      );
      logger.debug('用戶設置已保存');
    } catch (error: unknown) {
      logger.error('保存用戶SettingsFailed:', error);
      throw new Error(`保存用戶SettingsFailed: ${error.message}`);
    }
  }

  /**
   * GetUserSettings
   */
  static async getUserSettings(): Promise<any | null> {
    try {
      const _settingsData = await AsyncStorage.getItem(this.USER_SETTINGS_KEY);
      if (!settingsData) {
        return null;
      }
      return JSON.parse(settingsData);
    } catch (error: unknown) {
      logger.error('Get用戶SettingsFailed:', error);
      return null;
    }
  }

  /**
   * UpdateUserData的SpecificField
   */
  static async updateUser(updates: Partial<User>): Promise<void> {
    try {
      const _currentUser = await this.getUser();
      if (!currentUser) {
        throw new Error('用戶數據不存在');
      }

      const _updatedUser = { ...currentUser, ...updates };
      await this.setUser(updatedUser);
      logger.debug('用戶數據已更新');
    } catch (error: unknown) {
      logger.error('Update用戶數據Failed:', error);
      throw new Error(`Update用戶數據Failed: ${error.message}`);
    }
  }

  /**
   * UpdateUserPreferencesSettings的SpecificField
   */
  static async updateUserPreferences(updates: unknown): Promise<void> {
    try {
      const _currentPreferences = await this.getUserPreferences();
      const _updatedPreferences = { ...currentPreferences, ...updates };
      await this.setUserPreferences(updatedPreferences);
      logger.debug('用戶偏好設置已更新');
    } catch (error: unknown) {
      logger.error('Update用戶偏好SettingsFailed:', error);
      throw new Error(`Update用戶偏好SettingsFailed: ${error.message}`);
    }
  }

  /**
   * UpdateUser統Count據的SpecificField
   */
  static async updateUserStatistics(updates: unknown): Promise<void> {
    try {
      const _currentStatistics = await this.getUserStatistics();
      const _updatedStatistics = { ...currentStatistics, ...updates };
      await this.setUserStatistics(updatedStatistics);
      logger.debug('用戶統計數據已更新');
    } catch (error: unknown) {
      logger.error('Update用戶統計數據Failed:', error);
      throw new Error(`Update用戶統計數據Failed: ${error.message}`);
    }
  }

  /**
   * UpdateUserSettings的SpecificField
   */
  static async updateUserSettings(updates: unknown): Promise<void> {
    try {
      const _currentSettings = await this.getUserSettings();
      const _updatedSettings = { ...currentSettings, ...updates };
      await this.setUserSettings(updatedSettings);
      logger.debug('用戶設置已更新');
    } catch (error: unknown) {
      logger.error('Update用戶SettingsFailed:', error);
      throw new Error(`Update用戶SettingsFailed: ${error.message}`);
    }
  }

  /**
   * Clear所有User相OffData
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
      logger.error('清除用戶數據Failed:', error);
      throw new Error(`清除用戶數據Failed: ${error.message}`);
    }
  }

  /**
   * CheckYesNo有Storage的UserData
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
      logger.error('Check用戶數據Failed:', error);
      return false;
    }
  }

  /**
   * Get所有User相Off的Key
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
   * BackupUserData
   */
  static async backupUserData(): Promise<any> {
    try {
      const [user, preferences, statistics, settings] = await Promise.all([
        this.getUser(),
        this.getUserPreferences(),
        this.getUserStatistics(),
        this.getUserSettings(),
      ]);

      const _backup = {
        user,
        preferences,
        statistics,
        settings,
        timestamp: new Date().toISOString(),
      };

      logger.debug('用戶數據備份已創建');
      return backup;
    } catch (error: unknown) {
      logger.error('Create用戶數據備份Failed:', error);
      throw new Error(`Create用戶數據備份Failed: ${error.message}`);
    }
  }

  /**
   * RestoreUserData
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
      logger.error('恢復用戶數據Failed:', error);
      throw new Error(`恢復用戶數據Failed: ${error.message}`);
    }
  }
}

export { UserStorage };
