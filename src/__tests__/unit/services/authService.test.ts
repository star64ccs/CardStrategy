/* global jest, describe, it, expect, beforeEach, afterEach */
import { API_ENDPOINTS } from '../../../config/endpoints';
import { AuthService } from '../../../services/authService';

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
jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock validation service
jest.mock('../../../utils/validationService', () => ({
  validateApiResponse: jest.fn(() => ({
    isValid: true,
    errors: [],
    data: {
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
    },
  })),
  validateLoginData: jest.fn(() => ({
    isValid: true,
    data: { email: 'test@example.com', password: 'password123' },
    errors: [],
    errorMessage: null,
  })),
  validateRegisterData: jest.fn(() => ({
    isValid: true,
    data: {
      email: 'test@example.com',
      password: 'password123',
      username: 'Test User',
    },
    errors: [],
    errorMessage: null,
  })),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockApi: unknown;
  let mockAsyncStorage: unknown;
  let mockLogger: unknown;
  let mockValidationService: unknown;

  beforeEach(() => {
    authService = new AuthService();
    mockApi = require('../../../config/api').api;
    mockAsyncStorage = require('@react-native-async-storage/async-storage');
    mockLogger = require('../../../utils/logger').logger;
    mockValidationService = require('../../../utils/validationService');

    jest.clearAllMocks();

    // Settings validateApiResponse 的 mock 實現
    mockValidationService.validateApiResponse.mockReturnValue({
      isValid: true,
      errors: [],
      data: {
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
      },
    });

    // Settings validateLoginData 的 mock 實現
    mockValidationService.validateLoginData.mockReturnValue({
      isValid: true,
      data: { email: 'test@example.com', password: 'password123' },
      errors: [],
      errorMessage: null,
    });

    // Settings validateRegisterData 的 mock 實現
    mockValidationService.validateRegisterData.mockReturnValue({
      isValid: true,
      data: {
        email: 'test@example.com',
        password: 'password123',
        username: 'Test User',
      },
      errors: [],
      errorMessage: null,
    });
  });

  describe('login', () => {
    it('應該Success登錄用戶', async () => {
      const _loginData = { email: 'test@example.com', password: 'password123' };
      const _mockResponse = {
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

      mockApi.post.mockResolvedValue({ data: mockResponse });
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      console.log('Before login call');
      const _result = await authService.login(loginData);

      console.log('Login result:', JSON.stringify(result, null, 2));

      expect(result.success).toBe(true);
      expect(result.data.user).toBeDefined();
      expect(mockApi.post).toHaveBeenCalledWith(
        API_ENDPOINTS.AUTH.LOGIN,
        loginData
      );
    });

    it('應該Handle登錄Error', async () => {
      const _loginData = {
        email: 'test@example.com',
        password: 'wrong-password',
      };
      const _mockError = new Error('登錄Failed');

      mockApi.post.mockRejectedValue(mockError);

      const _result = await authService.login(loginData);
      expect(result.success).toBe(false);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('應該Success註冊用戶', async () => {
      const _registerData = {
        email: 'new@example.com',
        password: 'password123',
        username: 'New User',
      };
      const _mockResponse = {
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

      mockApi.post.mockResolvedValue({ data: mockResponse });
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      const _result = await authService.register(registerData);

      expect(result.success).toBe(true);
      expect(result.data.user).toBeDefined();
      expect(mockApi.post).toHaveBeenCalledWith(
        API_ENDPOINTS.AUTH.REGISTER,
        registerData
      );
    });
  });

  describe('logout', () => {
    it('應該Success登出用戶', async () => {
      const _mockResponse = { success: true, data: { message: '登出Success' } };

      mockApi.post.mockResolvedValue({ data: mockResponse });
      mockAsyncStorage.removeItem.mockResolvedValue(undefined);

      const _result = await authService.logout();

      expect(result.success).toBe(true);
      expect(mockApi.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.LOGOUT);
    });
  });

  describe('getCurrentUser', () => {
    it('應該SuccessGet當前用戶信息', async () => {
      const _mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'Test User',
      };
      const _mockResponse = {
        success: true,
        data: {
          user: mockUser,
        },
      };

      // Settings AsyncStorage mock Return一個有效的 token
      mockAsyncStorage.getItem.mockImplementation((key: string) => {
        if (key === 'accessToken') {
          return Promise.resolve('mock-token');
        }
        if (key === 'refreshToken') {
          return Promise.resolve('mock-refresh-token');
        }
        return Promise.resolve(null);
      });

      mockApi.get.mockResolvedValue({ data: mockResponse });

      const _result = await authService.checkAuthStatus();

      expect(result.success).toBe(true);
      expect(result.data?.user).toEqual(mockUser);
      expect(mockApi.get).toHaveBeenCalledWith('/auth/me');
    });
  });

  describe('isAuthenticated', () => {
    it('應該檢查用戶是否已認證', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('mock-token');

      const _result = await authService.isLoggedIn();

      expect(result).toBe(true);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('accessToken');
    });

    it('應該返回 false 當沒有 token 時', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const _result = await authService.isLoggedIn();

      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('應該獲取存儲的用戶信息', async () => {
      const _mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'Test User',
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUser));

      const _result = await authService.getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('user');
    });
  });

  it('應該返回 null 當沒有用戶數據時', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const _result = await authService.getCurrentUser();

    expect(result).toBe(null);
  });
});
