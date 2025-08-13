import apiService from './apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, RegisterData, AuthResponse } from '@/types';

class AuthService {
  // 登入
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    if (!response.data) {
      throw new Error('登入失敗：無效的響應數據');
    }
    return response.data;
  }

  // 註冊
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register', data);
    if (!response.data) {
      throw new Error('註冊失敗：無效的響應數據');
    }
    return response.data;
  }

  // 登出
  async logout(): Promise<void> {
    await apiService.post('/auth/logout');
    await this.clearTokens();
  }

  // 刷新令牌
  async refreshToken(): Promise<{ token: string; refreshToken: string }> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('無效的刷新令牌');
    }

    const response = await apiService.post<{ token: string; refreshToken: string }>('/auth/refresh', {
      refreshToken
    });
    if (!response.data) {
      throw new Error('刷新令牌失敗：無效的響應數據');
    }
    return response.data;
  }

  // 獲取用戶資料
  async getProfile(): Promise<User> {
    const response = await apiService.get<User>('/auth/profile');
    if (!response.data) {
      throw new Error('獲取用戶資料失敗：無效的響應數據');
    }
    return response.data;
  }

  // 更新用戶資料
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiService.put<User>('/auth/profile', data);
    if (!response.data) {
      throw new Error('更新用戶資料失敗：無效的響應數據');
    }
    return response.data;
  }

  // 更改密碼
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await apiService.post('/auth/change-password', data);
  }

  // 忘記密碼
  async forgotPassword(email: string): Promise<void> {
    await apiService.post('/auth/forgot-password', { email });
  }

  // 重置密碼
  async resetPassword(data: { token: string; newPassword: string }): Promise<void> {
    await apiService.post('/auth/reset-password', data);
  }

  // 驗證郵箱
  async verifyEmail(token: string): Promise<void> {
    await apiService.post('/auth/verify-email', { token });
  }

  // 重新發送驗證郵件
  async resendVerificationEmail(email: string): Promise<void> {
    await apiService.post('/auth/resend-verification', { email });
  }

  // 社交登入
  async socialLogin(provider: string, token: string): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(`/auth/${provider}`, { token });
    if (!response.data) {
      throw new Error('社交登入失敗：無效的響應數據');
    }
    return response.data;
  }

  // Delete account
  async deleteAccount(password: string): Promise<void> {
    await apiService.post('/auth/delete-account', { password });

    // Clear all stored data
    await AsyncStorage.multiRemove([
      'authToken',
      'refreshToken',
      'user',
      'settings',
      'membership'
    ]);
  }

  // Get auth token
  async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  }

  // Set auth token
  async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem('authToken', token);
  }

  // Clear auth data
  async clearAuthData(): Promise<void> {
    await AsyncStorage.multiRemove([
      'authToken',
      'refreshToken',
      'user'
    ]);
  }

  private async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem('refreshToken');
  }

  private async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove([
      'authToken',
      'refreshToken'
    ]);
  }
}

export const authService = new AuthService();
export default authService;
