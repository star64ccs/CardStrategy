import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Session } from '../types';
import { logger } from '../utils/logger';

class AuthStorage {
  private static readonly SESSION_KEY = 'auth_session';
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  private static readonly USER_KEY = 'auth_user';

  /**
   * 保存會話到本地存儲
   */
  static async setSession(session: Session): Promise<void> {
    try {
      await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      logger.debug('會話已保存到本地存儲');
    } catch (error: unknown) {
      logger.error('保存會話失敗:', error);
      throw new Error(`保存會話失敗: ${error.message}`);
    }
  }

  /**
   * 從本地存儲獲取會話
   */
  static async getSession(): Promise<Session | null> {
    try {
      const sessionData = await AsyncStorage.getItem(this.SESSION_KEY);
      if (!sessionData) {
        return null;
      }

      const session = JSON.parse(sessionData);

      // 轉換日期字符串為 Date 對象
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
      logger.error('獲取會話失敗:', error);
      return null;
    }
  }

  /**
   * 清除本地存儲的會話
   */
  static async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SESSION_KEY);
      logger.debug('會話已從本地存儲清除');
    } catch (error: unknown) {
      logger.error('清除會話失敗:', error);
      throw new Error(`清除會話失敗: ${error.message}`);
    }
  }

  /**
   * 保存訪問令牌
   */
  static async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.TOKEN_KEY, token);
      logger.debug('訪問令牌已保存');
    } catch (error: unknown) {
      logger.error('保存訪問令牌失敗:', error);
      throw new Error(`保存訪問令牌失敗: ${error.message}`);
    }
  }

  /**
   * 獲取訪問令牌
   */
  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error: unknown) {
      logger.error('獲取訪問令牌失敗:', error);
      return null;
    }
  }

  /**
   * 保存刷新令牌
   */
  static async setRefreshToken(refreshToken: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
      logger.debug('刷新令牌已保存');
    } catch (error: unknown) {
      logger.error('保存刷新令牌失敗:', error);
      throw new Error(`保存刷新令牌失敗: ${error.message}`);
    }
  }

  /**
   * 獲取刷新令牌
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error: unknown) {
      logger.error('獲取刷新令牌失敗:', error);
      return null;
    }
  }

  /**
   * 保存用戶信息
   */
  static async setUser(user: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
      logger.debug('用戶信息已保存');
    } catch (error: unknown) {
      logger.error('保存用戶信息失敗:', error);
      throw new Error(`保存用戶信息失敗: ${error.message}`);
    }
  }

  /**
   * 獲取用戶信息
   */
  static async getUser(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(this.USER_KEY);
      if (!userData) {
        return null;
      }
      return JSON.parse(userData);
    } catch (error: unknown) {
      logger.error('獲取用戶信息失敗:', error);
      return null;
    }
  }

  /**
   * 清除所有認證相關數據
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
      logger.error('清除認證數據失敗:', error);
      throw new Error(`清除認證數據失敗: ${error.message}`);
    }
  }

  /**
   * 檢查是否有存儲的認證數據
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
      logger.error('檢查認證數據失敗:', error);
      return false;
    }
  }

  /**
   * 獲取所有認證相關的鍵
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
