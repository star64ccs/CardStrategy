import { logger } from '@/utils/logger';
import {
  validateApiResponse,
  validateLoginData,
  validateRegisterData,
} from '@/utils/validationService';
import { apiService } from './apiService';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AuthResult {
  success: boolean;
  data?: AuthResponse;
  message?: string;
  errors?: string[];
}

export class AuthService {
  private static instance: AuthService;
  private isInitialized = false;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 檢查現有的認證狀態
      await this.checkAuthStatus();
      this.isInitialized = true;
      logger.info('AuthService initialized successfully');
    } catch (error) {
      logger.error('AuthService initialization failed', error);
      throw error;
    }
  }

  /**
   * 用戶登錄
   */
  public async login(loginData: LoginData): Promise<AuthResult> {
    try {
      // 驗證輸入數據
      const validation = validateLoginData(loginData);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Invalid login data',
          errors: validation.errors,
        };
      }

      logger.info('Attempting user login', { email: loginData.email });

      const response = await apiService.post('/auth/login', loginData);

      // apiService 已經返回 { success: true, data: ... } 格式
      if (response.success && response.data) {
        // 保存認證信息
        await this.saveAuthData(response.data);
        logger.info('User login successful', {
          userId: response.data.user.id,
        });

        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          message: response.error || 'Login failed',
          errors: [response.error || 'Login failed'],
        };
      }
    } catch (error) {
      logger.error('Login error', error);
      // 如果是 API 錯誤，拋出異常
      if (error instanceof Error) {
        throw error;
      }
      return {
        success: false,
        message: 'Login failed',
        errors: ['Network error or server unavailable'],
      };
    }
  }

  /**
   * 用戶註冊
   */
  public async register(registerData: RegisterData): Promise<AuthResult> {
    try {
      // 驗證輸入數據
      const validation = validateRegisterData(registerData);
      if (!validation.isValid) {
        return {
          success: false,
          message: 'Invalid registration data',
          errors: validation.errors,
        };
      }

      logger.info('Attempting user registration', {
        email: registerData.email,
      });

      const response = await apiService.post('/auth/register', registerData);

      // apiService 已經返回 { success: true, data: ... } 格式
      if (response.success && response.data) {
        // 保存認證信息
        await this.saveAuthData(response.data);
        logger.info('User registration successful', {
          userId: response.data.user.id,
        });

        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          message: response.error || 'Registration failed',
          errors: [response.error || 'Registration failed'],
        };
      }
    } catch (error) {
      logger.error('Registration error', error);
      return {
        success: false,
        message: 'Registration failed',
        errors: ['Network error or server unavailable'],
      };
    }
  }

  /**
   * 用戶登出
   */
  public async logout(): Promise<AuthResult> {
    try {
      logger.info('Attempting user logout');

      const response = await apiService.post('/auth/logout');

      // 清除本地認證信息
      await this.clearAuthData();

      logger.info('User logout successful');

      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      logger.error('Logout error', error);
      // 即使API調用失敗，也要清除本地數據
      await this.clearAuthData();

      return {
        success: false,
        message: 'Logout failed',
        errors: ['Network error or server unavailable'],
      };
    }
  }

  /**
   * 刷新令牌
   */
  public async refreshToken(): Promise<AuthResult> {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        return {
          success: false,
          message: 'No refresh token available',
          errors: ['Refresh token not found'],
        };
      }

      logger.info('Attempting token refresh');

      const response = await apiService.post('/auth/refresh', {
        refreshToken,
      });

      // 驗證API響應
      const responseValidation = validateApiResponse(response.data);
      if (!responseValidation.isValid) {
        return {
          success: false,
          message: 'Invalid API response',
          errors: responseValidation.errors,
        };
      }

      if (response.data.success) {
        // 更新認證信息
        await this.saveAuthData(response.data.data);
        logger.info('Token refresh successful');

        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Token refresh failed',
          errors: response.data.errors,
        };
      }
    } catch (error) {
      logger.error('Token refresh error', error);
      return {
        success: false,
        message: 'Token refresh failed',
        errors: ['Network error or server unavailable'],
      };
    }
  }

  /**
   * 檢查認證狀態
   */
  public async checkAuthStatus(): Promise<AuthResult> {
    try {
      const token = await this.getAccessToken();
      if (!token) {
        return {
          success: false,
          message: 'No authentication token',
          errors: ['Token not found'],
        };
      }

      logger.info('Checking authentication status');

      const response = await apiService.get('/auth/me');

      // 驗證API響應
      const responseValidation = validateApiResponse(response.data);
      if (!responseValidation.isValid) {
        return {
          success: false,
          message: 'Invalid API response',
          errors: responseValidation.errors,
        };
      }

      if (response.data.success) {
        logger.info('Authentication status check successful');
        return {
          success: true,
          data: {
            user: response.data.data.user,
            token,
            refreshToken: (await this.getRefreshToken()) || '',
          },
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Authentication check failed',
          errors: response.data.errors,
        };
      }
    } catch (error) {
      logger.error('Authentication status check error', error);
      return {
        success: false,
        message: 'Authentication check failed',
        errors: ['Network error or server unavailable'],
      };
    }
  }

  /**
   * 保存認證數據
   */
  private async saveAuthData(authData: AuthResponse): Promise<void> {
    try {
      // 在測試環境中使用 require，在運行時使用 import
      let AsyncStorage;
      if (process.env.NODE_ENV === 'test') {
        AsyncStorage = require('@react-native-async-storage/async-storage');
      } else {
        const module = await import(
          '@react-native-async-storage/async-storage'
        );
        AsyncStorage = module.default;
      }

      await AsyncStorage.setItem('accessToken', authData.token);
      await AsyncStorage.setItem('refreshToken', authData.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(authData.user));

      logger.info('Auth data saved successfully');
    } catch (error) {
      logger.error('Failed to save auth data', error);
      throw error;
    }
  }

  /**
   * 清除認證數據
   */
  private async clearAuthData(): Promise<void> {
    try {
      // 在測試環境中使用 require，在運行時使用 import
      let AsyncStorage;
      if (process.env.NODE_ENV === 'test') {
        AsyncStorage = require('@react-native-async-storage/async-storage');
      } else {
        const module = await import(
          '@react-native-async-storage/async-storage'
        );
        AsyncStorage = module.default;
      }

      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');

      logger.info('Auth data cleared successfully');
    } catch (error) {
      logger.error('Failed to clear auth data', error);
      throw error;
    }
  }

  /**
   * 獲取訪問令牌
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      // 在測試環境中使用 require，在運行時使用 import
      let AsyncStorage;
      if (process.env.NODE_ENV === 'test') {
        AsyncStorage = require('@react-native-async-storage/async-storage');
      } else {
        const module = await import(
          '@react-native-async-storage/async-storage'
        );
        AsyncStorage = module.default;
      }
      return await AsyncStorage.getItem('accessToken');
    } catch (error) {
      logger.error('Failed to get access token', error);
      return null;
    }
  }

  /**
   * 獲取刷新令牌
   */
  private async getRefreshToken(): Promise<string | null> {
    try {
      // 在測試環境中使用 require，在運行時使用 import
      let AsyncStorage;
      if (process.env.NODE_ENV === 'test') {
        AsyncStorage = require('@react-native-async-storage/async-storage');
      } else {
        const module = await import(
          '@react-native-async-storage/async-storage'
        );
        AsyncStorage = module.default;
      }
      return await AsyncStorage.getItem('refreshToken');
    } catch (error) {
      logger.error('Failed to get refresh token', error);
      throw error;
    }
  }

  /**
   * 獲取當前用戶
   */
  public async getCurrentUser(): Promise<User | null> {
    try {
      // 在測試環境中使用 require，在運行時使用 import
      let AsyncStorage;
      if (process.env.NODE_ENV === 'test') {
        AsyncStorage = require('@react-native-async-storage/async-storage');
      } else {
        const module = await import(
          '@react-native-async-storage/async-storage'
        );
        AsyncStorage = module.default;
      }
      const userData = await AsyncStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      logger.error('Failed to get current user', error);
      return null;
    }
  }

  /**
   * 檢查是否已登錄
   */
  public async isLoggedIn(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      return !!token;
    } catch (error) {
      logger.error('Failed to check login status', error);
      return false;
    }
  }
}

// 導出單例實例
export const authService = AuthService.getInstance();

export default authService;
