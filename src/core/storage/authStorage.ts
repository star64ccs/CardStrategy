import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Session } from '../types';
import { logger } from '../utils/logger';

class AuthStorage {
  private static readonly SESSION_KEY = 'auth_session';
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  private static readonly USER_KEY = 'auth_user';

  /**
   * Save會話到LocalStorage
   */
  static async setSession(session: Session): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      logger.debug('會話已保存到本地存儲');
    } catch (error: unknown) {
      logger.error('保存會話Failed:', error);
      throw new Error(`保存會話Failed: ${error.message}`);
    }
  }

  /**
   * 從LocalStorageGet會話
   */
  static async getSession(): Promise<Session | null> {
    try {
      const _sessionData = await AsyncStorage.getItem(this.SESSION_KEY);
      if (!sessionData) {
        return null;
      }

      const _session = JSON.parse(sessionData);

      // ConvertDay字符串為 Date Object
      if (session.createdAt) {
        session.createdAt = new Date(session.createdAt);
      }
      if (session.expiresAt) {
        session.expiresAt = new Date(session.expiresAt);
      }
      if (session.lastActiveAt) {
        session.lastActiveAt = new Date(session.lastActiveAt);
      }

      return session;
    } catch (error: unknown) {
      logger.error('Get會話Failed:', error);
      return null;
    }
  }

  /**
   * ClearLocalStorage的會話
   */
  static async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SESSION_KEY);
      logger.debug('會話已從本地存儲清除');
    } catch (error: unknown) {
      logger.error('清除會話Failed:', error);
      throw new Error(`清除會話Failed: ${error.message}`);
    }
  }

  /**
   * Save訪問令牌
   */
  static async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.TOKEN_KEY, token);
      logger.debug('訪問令牌已保存');
    } catch (error: unknown) {
      logger.error('保存訪問令牌Failed:', error);
      throw new Error(`保存訪問令牌Failed: ${error.message}`);
    }
  }

  /**
   * Get訪問令牌
   */
  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error: unknown) {
      logger.error('Get訪問令牌Failed:', error);
      return null;
    }
  }

  /**
   * SaveRefresh令牌
   */
  static async setRefreshToken(refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      logger.debug('刷新令牌已保存');
    } catch (error: unknown) {
      logger.error('保存刷新令牌Failed:', error);
      throw new Error(`保存刷新令牌Failed: ${error.message}`);
    }
  }

  /**
   * GetRefresh令牌
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error: unknown) {
      logger.error('Get刷新令牌Failed:', error);
      return null;
    }
  }

  /**
   * SaveUserInformation
   */
  static async setUser(user: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
      logger.debug('用戶信息已保存');
    } catch (error: unknown) {
      logger.error('保存用戶信息Failed:', error);
      throw new Error(`保存用戶信息Failed: ${error.message}`);
    }
  }

  /**
   * GetUserInformation
   */
  static async getUser(): Promise<any | null> {
    try {
      const _userData = await AsyncStorage.getItem(this.USER_KEY);
      if (!userData) {
        return null;
      }
      return JSON.parse(userData);
    } catch (error: unknown) {
      logger.error('Get用戶信息Failed:', error);
      return null;
    }
  }

  /**
   * Clear所有Authenticate相OffData
   */
  static async clearAll(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.SESSION_KEY),
        AsyncStorage.removeItem(this.TOKEN_KEY),
        AsyncStorage.removeItem(this.REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(this.USER_KEY),
      ]);
      logger.debug('所有認證數據已清除');
    } catch (error: unknown) {
      logger.error('清除認證數據Failed:', error);
      throw new Error(`清除認證數據Failed: ${error.message}`);
    }
  }

  /**
   * CheckYesNo有Storage的AuthenticateData
   */
  static async hasAuthData(): Promise<boolean> {
    try {
      const [session, token, refreshToken, user] = await Promise.all([
        AsyncStorage.getItem(this.SESSION_KEY),
        AsyncStorage.getItem(this.TOKEN_KEY),
        AsyncStorage.getItem(this.REFRESH_TOKEN_KEY),
        AsyncStorage.getItem(this.USER_KEY),
      ]);

      return !!(session || token || refreshToken || user);
    } catch (error: unknown) {
      logger.error('Check認證數據Failed:', error);
      return false;
    }
  }

  /**
   * Get所有Authenticate相Off的Key
   */
  static getAuthKeys(): string[] {
    return [
      this.SESSION_KEY,
      this.TOKEN_KEY,
      this.REFRESH_TOKEN_KEY,
      this.USER_KEY,
    ];
  }
}

export { AuthStorage };
