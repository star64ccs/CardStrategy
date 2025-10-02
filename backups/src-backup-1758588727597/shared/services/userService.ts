import type { User, UserPreferences } from '../../core/types';
import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * 用戶服務
 * 處理用戶相關功能
 */
export class UserService {
  private static instance: UserService;

  private constructor() {}

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * 獲取用戶信息
   */
  async getUserProfile(userId: string): Promise<User> {
    try {
      const response = await api.get<User>(`/users/${userId}`);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('獲取用戶信息失敗');
      }
    } catch (error) {
      logger.error('獲取用戶信息失敗:', { error, userId });
      throw error;
    }
  }

  /**
   * 更新用戶偏好設置
   */
  async updatePreferences(
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    try {
      const response = await api.put<UserPreferences>(
        '/users/preferences',
        preferences
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('更新用戶偏好設置失敗');
      }
    } catch (error) {
      logger.error('更新用戶偏好設置失敗:', { error });
      throw error;
    }
  }
}

// 導出單例實例
export const userService = UserService.getInstance();
