import { AuthService } from '@/services/authService';
import { mockApiResponse, mockApiError } from '@/__tests__/setup/test-utils';

// Mock API service
jest.mock('@/services/apiService', () => ({
  apiService: {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn()
  }
}));

// Mock storage
jest.mock('@/utils/storage', () => ({
  storage: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  }
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

// Mock validation service
jest.mock('@/utils/validationService', () => ({
  validateApiResponse: jest.fn(() => ({ isValid: true, errors: [] })),
  validateInput: jest.fn(() => ({ isValid: true, errors: [] }))
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockApiService: any;
  let mockStorage: any;
  let mockLogger: any;
  let mockValidationService: any;

  beforeEach(() => {
    authService = new AuthService();
    mockApiService = require('@/services/apiService').apiService;
    mockStorage = require('@/utils/storage').storage;
    mockLogger = require('@/utils/logger').logger;
    mockValidationService = require('@/utils/validationService');

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('應該成功登錄用戶', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' };
      const mockResponse = mockApiResponse({
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User'
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      });

      mockApiService.post.mockResolvedValue(mockResponse);
      mockStorage.setItem.mockResolvedValue(undefined);

      const result = await authService.login(loginData);

      expect(result.success).toBe(true);
      expect(result.data.user).toBeDefined();
      expect(result.data.tokens).toBeDefined();
      expect(mockApiService.post).toHaveBeenCalledWith('/auth/login', loginData);
      expect(mockStorage.setItem).toHaveBeenCalledWith('accessToken', 'mock-access-token');
      expect(mockStorage.setItem).toHaveBeenCalledWith('refreshToken', 'mock-refresh-token');
    });

    it('應該處理登錄錯誤', async () => {
      const loginData = { email: 'test@example.com', password: 'wrong-password' };
      const mockError = mockApiError('登錄失敗');

      mockApiService.post.mockRejectedValue(mockError);

      await expect(authService.login(loginData)).rejects.toThrow('登錄失敗');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('應該驗證登錄輸入', async () => {
      const invalidLoginData = { email: '', password: '' };

      mockValidationService.validateInput.mockReturnValue({
        isValid: false,
        errors: ['郵箱不能為空', '密碼不能為空']
      });

      await expect(authService.login(invalidLoginData)).rejects.toThrow('郵箱不能為空');
    });
  });

  describe('register', () => {
    it('應該成功註冊用戶', async () => {
      const registerData = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User'
      };
      const mockResponse = mockApiResponse({
        user: {
          id: '2',
          email: 'new@example.com',
          name: 'New User'
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      });

      mockApiService.post.mockResolvedValue(mockResponse);
      mockStorage.setItem.mockResolvedValue(undefined);

      const result = await authService.register(registerData);

      expect(result.success).toBe(true);
      expect(result.data.user).toBeDefined();
      expect(mockApiService.post).toHaveBeenCalledWith('/auth/register', registerData);
    });

    it('應該處理註冊錯誤', async () => {
      const registerData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User'
      };
      const mockError = mockApiError('用戶已存在');

      mockApiService.post.mockRejectedValue(mockError);

      await expect(authService.register(registerData)).rejects.toThrow('用戶已存在');
    });
  });

  describe('logout', () => {
    it('應該成功登出用戶', async () => {
      const mockResponse = mockApiResponse({ message: '登出成功' });

      mockApiService.post.mockResolvedValue(mockResponse);
      mockStorage.clear.mockResolvedValue(undefined);

      const result = await authService.logout();

      expect(result.success).toBe(true);
      expect(mockApiService.post).toHaveBeenCalledWith('/auth/logout');
      expect(mockStorage.clear).toHaveBeenCalled();
    });

    it('應該處理登出錯誤', async () => {
      const mockError = mockApiError('登出失敗');

      mockApiService.post.mockRejectedValue(mockError);

      await expect(authService.logout()).rejects.toThrow('登出失敗');
    });
  });

  describe('refreshToken', () => {
    it('應該成功刷新令牌', async () => {
      const mockResponse = mockApiResponse({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      });

      mockApiService.post.mockResolvedValue(mockResponse);
      mockStorage.setItem.mockResolvedValue(undefined);

      const result = await authService.refreshToken();

      expect(result.success).toBe(true);
      expect(result.data.accessToken).toBe('new-access-token');
      expect(mockApiService.post).toHaveBeenCalledWith('/auth/refresh');
    });

    it('應該處理刷新令牌錯誤', async () => {
      const mockError = mockApiError('令牌刷新失敗');

      mockApiService.post.mockRejectedValue(mockError);

      await expect(authService.refreshToken()).rejects.toThrow('令牌刷新失敗');
    });
  });

  describe('getCurrentUser', () => {
    it('應該成功獲取當前用戶信息', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      };
      const mockResponse = mockApiResponse(mockUser);

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await authService.getCurrentUser();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(mockApiService.get).toHaveBeenCalledWith('/auth/me');
    });

    it('應該處理獲取用戶信息錯誤', async () => {
      const mockError = mockApiError('獲取用戶信息失敗');

      mockApiService.get.mockRejectedValue(mockError);

      await expect(authService.getCurrentUser()).rejects.toThrow('獲取用戶信息失敗');
    });
  });

  describe('forgotPassword', () => {
    it('應該成功發送密碼重置郵件', async () => {
      const email = 'test@example.com';
      const mockResponse = mockApiResponse({ message: '密碼重置郵件已發送' });

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.forgotPassword(email);

      expect(result.success).toBe(true);
      expect(mockApiService.post).toHaveBeenCalledWith('/auth/forgot-password', { email });
    });

    it('應該處理密碼重置錯誤', async () => {
      const email = 'nonexistent@example.com';
      const mockError = mockApiError('用戶不存在');

      mockApiService.post.mockRejectedValue(mockError);

      await expect(authService.forgotPassword(email)).rejects.toThrow('用戶不存在');
    });
  });

  describe('resetPassword', () => {
    it('應該成功重置密碼', async () => {
      const resetData = {
        token: 'reset-token',
        password: 'new-password'
      };
      const mockResponse = mockApiResponse({ message: '密碼重置成功' });

      mockApiService.post.mockResolvedValue(mockResponse);

      const result = await authService.resetPassword(resetData);

      expect(result.success).toBe(true);
      expect(mockApiService.post).toHaveBeenCalledWith('/auth/reset-password', resetData);
    });

    it('應該處理密碼重置錯誤', async () => {
      const resetData = {
        token: 'invalid-token',
        password: 'new-password'
      };
      const mockError = mockApiError('無效的重置令牌');

      mockApiService.post.mockRejectedValue(mockError);

      await expect(authService.resetPassword(resetData)).rejects.toThrow('無效的重置令牌');
    });
  });

  describe('updateProfile', () => {
    it('應該成功更新用戶資料', async () => {
      const profileData = {
        name: 'Updated Name',
        avatar: 'new-avatar-url'
      };
      const mockResponse = mockApiResponse({
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Updated Name',
          avatar: 'new-avatar-url'
        }
      });

      mockApiService.put.mockResolvedValue(mockResponse);

      const result = await authService.updateProfile(profileData);

      expect(result.success).toBe(true);
      expect(result.data.user.name).toBe('Updated Name');
      expect(mockApiService.put).toHaveBeenCalledWith('/auth/profile', profileData);
    });

    it('應該處理更新資料錯誤', async () => {
      const profileData = { name: 'Updated Name' };
      const mockError = mockApiError('更新資料失敗');

      mockApiService.put.mockRejectedValue(mockError);

      await expect(authService.updateProfile(profileData)).rejects.toThrow('更新資料失敗');
    });
  });

  describe('changePassword', () => {
    it('應該成功修改密碼', async () => {
      const passwordData = {
        currentPassword: 'old-password',
        newPassword: 'new-password'
      };
      const mockResponse = mockApiResponse({ message: '密碼修改成功' });

      mockApiService.put.mockResolvedValue(mockResponse);

      const result = await authService.changePassword(passwordData);

      expect(result.success).toBe(true);
      expect(mockApiService.put).toHaveBeenCalledWith('/auth/change-password', passwordData);
    });

    it('應該處理密碼修改錯誤', async () => {
      const passwordData = {
        currentPassword: 'wrong-password',
        newPassword: 'new-password'
      };
      const mockError = mockApiError('當前密碼錯誤');

      mockApiService.put.mockRejectedValue(mockError);

      await expect(authService.changePassword(passwordData)).rejects.toThrow('當前密碼錯誤');
    });
  });
});
