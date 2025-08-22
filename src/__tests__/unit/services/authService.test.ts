/* global jest, describe, it, expect, beforeEach, afterEach */
import { AuthService } from '@/services/authService';
import { API_ENDPOINTS } from '@/config/api';

// Mock API service
jest.mock('@/config/api', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  API_ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
      PROFILE: '/auth/profile',
    },
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock validation service
jest.mock('@/utils/validationService', () => ({
  validateApiResponse: jest.fn(() => ({ 
    isValid: true, 
    errors: [],
    data: {
      user: {
        id: '1',
        email: 'test@example.com',
        username: 'Test User',
      },
      token: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    }
  })),
  validateInput: jest.fn(() => ({ 
    isValid: true, 
    data: { email: 'test@example.com', password: 'password123' }, 
    errors: [],
    errorMessage: null
  })),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockApi: any;
  let mockAsyncStorage: any;
  let mockLogger: any;
  let mockValidationService: any;

  beforeEach(() => {
    authService = new AuthService();
    mockApi = require('@/config/api').api;
    mockAsyncStorage = require('@react-native-async-storage/async-storage');
    mockLogger = require('@/utils/logger').logger;
    mockValidationService = require('@/utils/validationService');

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('應該成功登錄用戶', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'Test User',
          },
          token: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const result = await authService.login(loginData);

      expect(result.success).toBe(true);
      expect(result.data.user).toBeDefined();
      expect(mockApi.post).toHaveBeenCalledWith(
        API_ENDPOINTS.AUTH.LOGIN,
        loginData
      );
    });

    it('應該處理登錄錯誤', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrong-password',
      };
      const mockError = new Error('登錄失敗');

      mockApi.post.mockRejectedValue(mockError);

      await expect(authService.login(loginData)).rejects.toThrow('登錄失敗');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('應該成功註冊用戶', async () => {
      const registerData = {
        email: 'new@example.com',
        password: 'password123',
        username: 'New User',
      };
      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '2',
            email: 'new@example.com',
            username: 'New User',
          },
          token: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const result = await authService.register(registerData);

      expect(result.success).toBe(true);
      expect(result.data.user).toBeDefined();
      expect(mockApi.post).toHaveBeenCalledWith(
        API_ENDPOINTS.AUTH.REGISTER,
        registerData
      );
    });
  });

  describe('logout', () => {
    it('應該成功登出用戶', async () => {
      const mockResponse = { success: true, data: { message: '登出成功' } };

      mockApi.post.mockResolvedValue(mockResponse);
      mockAsyncStorage.removeItem.mockResolvedValue(undefined);

      const result = await authService.logout();

      expect(result.success).toBe(true);
      expect(mockApi.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.LOGOUT);
    });
  });

  describe('getCurrentUser', () => {
    it('應該成功獲取當前用戶信息', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'Test User',
      };
      const mockResponse = { success: true, data: mockUser };

      mockApi.get.mockResolvedValue(mockResponse);

      const result = await authService.getCurrentUser();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(mockApi.get).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.ME);
    });
  });

  describe('isAuthenticated', () => {
    it('應該檢查用戶是否已認證', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('mock-token');

      const result = await authService.isAuthenticated();

      expect(result).toBe(true);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('auth_token');
    });

    it('應該返回 false 當沒有 token 時', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getStoredToken', () => {
    it('應該獲取存儲的 token', async () => {
      const mockToken = 'mock-token';
      mockAsyncStorage.getItem.mockResolvedValue(mockToken);

      const result = await authService.getStoredToken();

      expect(result).toBe(mockToken);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('getStoredUser', () => {
    it('應該獲取存儲的用戶信息', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'Test User',
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUser));

      const result = await authService.getStoredUser();

      expect(result).toEqual(mockUser);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('user_data');
    });

    it('應該返回 null 當沒有用戶數據時', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await authService.getStoredUser();

      expect(result).toBe(null);
    });
  });
});
