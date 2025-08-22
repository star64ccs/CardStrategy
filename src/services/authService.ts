import { api, API_ENDPOINTS } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';
import { validateInput, validateApiResponse } from '../utils/validationService';
import {
  LoginRequestSchema,
  RegisterRequestSchema,
  AuthResponseSchema,
} from '../utils/validationSchemas';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// 用戶類型
export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// 登錄請求
export interface LoginRequest {
  email: string;
  password: string;
}

// 註冊請求
export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

// 認證響應
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// API 響應類型
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';

  // 登錄
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      // 驗證輸入數據
      const inputValidation = validateInput(
        LoginRequestSchema,
        credentials,
        '登錄請求'
      );
      if (!inputValidation.isValid) {
        throw new Error(inputValidation.errorMessage || '登錄數據驗證失敗');
      }

      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        inputValidation.data
      );

      // 驗證 API 響應
      if (response.success && response.data) {
        const responseValidation = validateApiResponse(
          AuthResponseSchema,
          response.data,
          '登錄響應'
        );
        if (!responseValidation.isValid) {
          logger.error('登錄響應數據驗證失敗:', responseValidation.errors);
          throw new Error('服務器響應數據格式錯誤');
        }

        // 保存認證信息到本地存儲
        this.saveAuthData(responseValidation.data);
      }
      return response;
    } catch (error: any) {
      logger.error('❌ Login error:', { error: error.message });
      throw error;
    }
  }

  // 註冊
  async register(
    userData: RegisterRequest
  ): Promise<ApiResponse<AuthResponse>> {
    try {
      // 驗證輸入數據
      const inputValidation = validateInput(
        RegisterRequestSchema,
        userData,
        '註冊請求'
      );
      if (!inputValidation.isValid) {
        throw new Error(inputValidation.errorMessage || '註冊數據驗證失敗');
      }

      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        inputValidation.data
      );

      // 驗證 API 響應
      if (response.success && response.data) {
        const responseValidation = validateApiResponse(
          AuthResponseSchema,
          response.data,
          '註冊響應'
        );
        if (!responseValidation.isValid) {
          logger.error('註冊響應數據驗證失敗:', responseValidation.errors);
          throw new Error('服務器響應數據格式錯誤');
        }

        // 保存認證信息到本地存儲
        this.saveAuthData(responseValidation.data);
      }
      return response;
    } catch (error: any) {
      logger.error('❌ Register error:', { error: error.message });
      throw error;
    }
  }

  // 登出
  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await api.post<void>(API_ENDPOINTS.AUTH.LOGOUT);
      // 清除本地存儲的認證信息
      this.clearAuthData();
      return response;
    } catch (error: any) {
      logger.error('❌ Logout error:', { error: error.message });
      // 即使 API 失敗，也要清除本地數據
      this.clearAuthData();
      return { success: true, message: '登出成功', data: undefined };
    }
  }

  // 刷新令牌
  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    const refreshToken = await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error('沒有刷新令牌');
    }

    try {
      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REFRESH,
        {
          refreshToken,
        }
      );

      if (response.success && response.data) {
        this.saveAuthData(response.data);
      }
      return response;
    } catch (error: any) {
      logger.error('❌ Refresh token error:', { error: error.message });
      throw error;
    }
  }

  // 獲取當前用戶
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await api.get<User>(API_ENDPOINTS.AUTH.ME);
      return response;
    } catch (error: any) {
      logger.error('❌ Get current user error:', { error: error.message });
      throw error;
    }
  }

  // 更新用戶資料
  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await api.put<User>(
        API_ENDPOINTS.AUTH.PROFILE,
        profileData
      );
      return response;
    } catch (error: any) {
      logger.error('❌ Update profile error:', { error: error.message });
      throw error;
    }
  }

  // 保存認證數據到本地存儲
  private async saveAuthData(authData: AuthResponse): Promise<void> {
    try {
      await AsyncStorage.setItem(this.TOKEN_KEY, authData.token);
      await AsyncStorage.setItem(this.REFRESH_TOKEN_KEY, authData.refreshToken);
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(authData.user));
    } catch (error) {
      logger.error('保存認證數據失敗:', { error });
    }
  }

  // 清除本地存儲的認證數據
  private async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.TOKEN_KEY);
      await AsyncStorage.removeItem(this.REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(this.USER_KEY);
    } catch (error) {
      logger.error('清除認證數據失敗:', { error });
    }
  }

  // 檢查是否已登錄
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(this.TOKEN_KEY);
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // 獲取存儲的令牌
  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      return null;
    }
  }

  // 獲取存儲的用戶信息
  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }
}

// 導出認證服務類和實例
export { AuthService };
export const authService = new AuthService();
