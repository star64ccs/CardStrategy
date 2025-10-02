import type { User, UserPreferences } from '../../core/types';
import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * UserService
 * HandleUser相Off功能
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
   * GetUserInformation
   */
  async getUserProfile(userId: string): Promise<User> {
    try {
      const _response = await api.get<User>(`/users/${userId}`);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Get用戶信息Failed');
      }
    } catch (error) {
      logger.error('Get用戶信息Failed:', { error, userId });
      throw error;
    }
  }

  /**
   * UpdateUserPreferencesSettings
   */
  async updatePreferences(
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    try {
      const _response = await api.put<UserPreferences>(
        '/users/preferences',
        preferences
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Update用戶偏好SettingsFailed');
      }
    } catch (error) {
      logger.error('Update用戶偏好SettingsFailed:', { error });
      throw error;
    }
  }
}

// Export單例Instance
export const _userService = UserService.getInstance();
