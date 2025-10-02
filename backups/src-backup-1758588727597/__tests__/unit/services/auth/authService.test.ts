// 認證服務單元測試
import { AuthService } from '../../../../shared/services/auth/authService';
import { mockApiError, mockApiResponse } from '../../../fixtures/test-utils';

// Mock AuthService
jest.mock('../../../../shared/services/auth/authService');

// Mock 外部依賴
jest.mock('../../../../shared/services/auth/jwtService');
jest.mock('../../../../shared/services/auth/oauthService');
jest.mock('../../../../shared/services/auth/twoFactorService');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = {
      login: jest.fn(),
      loginWithCredentials: jest.fn(),
      loginWithOAuth: jest.fn(),
      register: jest.fn(),
      requestPasswordReset: jest.fn(),
      refreshToken: jest.fn(),
      logout: jest.fn(),
      verifyToken: jest.fn(),
      initialize: jest.fn(),
      refreshSession: jest.fn(),
      getServiceStats: jest.fn(),
    } as any;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('用戶登錄', () => {
    it('應該成功登錄有效用戶', async () => {
      // Arrange
      const mockCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };

      // Mock API 響應
      const mockResponse = mockApiResponse({
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      });

      (authService.loginWithCredentials as jest.Mock).mockResolvedValue(
        mockResponse
      );

      // Act
      const result = await authService.loginWithCredentials(
        mockCredentials.email,
        mockCredentials.password
      );

      // Assert
      expect(result).toEqual({
        success: true,
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      });
    });

    it('應該拒絕無效憑證', async () => {
      // Arrange
      const mockCredentials = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      (authService.loginWithCredentials as jest.Mock).mockImplementation(() =>
        mockApiError('Invalid credentials')
      );

      // Act & Assert
      await expect(
        authService.loginWithCredentials(
          mockCredentials.email,
          mockCredentials.password
        )
      ).rejects.toThrow('Invalid credentials');
    });

    it('應該處理網絡錯誤', async () => {
      // Arrange
      const mockCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      (authService.login as jest.Mock).mockImplementation(() =>
        mockApiError('Network error')
      );

      // Act & Assert
      await expect(authService.login(mockCredentials)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('用戶註冊', () => {
    it('應該成功註冊新用戶', async () => {
      // Arrange
      const mockUserData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '2',
        name: 'New User',
        email: 'newuser@example.com',
        role: 'user',
      };

      const mockResponse = mockApiResponse({
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      });

      (authService.register as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await authService.register(mockUserData);

      // Assert
      expect(result).toEqual({
        success: true,
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      });
    });

    it('應該拒絕重複郵箱', async () => {
      // Arrange
      const mockUserData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      (authService.register as jest.Mock).mockImplementation(() =>
        mockApiError('Email already exists')
      );

      // Act & Assert
      await expect(authService.register(mockUserData)).rejects.toThrow(
        'Email already exists'
      );
    });
  });

  describe('密碼重置', () => {
    it('應該成功發送重置郵件', async () => {
      // Arrange
      const email = 'test@example.com';

      const mockResponse = mockApiResponse({
        message: 'Reset email sent successfully',
      });

      (authService.requestPasswordReset as jest.Mock).mockResolvedValue(
        mockResponse
      );

      // Act
      const result = await authService.requestPasswordReset(email);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Reset email sent successfully',
      });
    });

    it('應該拒絕不存在的郵箱', async () => {
      // Arrange
      const email = 'nonexistent@example.com';

      (authService.requestPasswordReset as jest.Mock).mockImplementation(() =>
        mockApiError('Email not found')
      );

      // Act & Assert
      await expect(authService.requestPasswordReset(email)).rejects.toThrow(
        'Email not found'
      );
    });
  });

  describe('Token 管理', () => {
    it('應該成功刷新 Token', async () => {
      // Arrange
      const refreshToken = 'old-refresh-token';
      const newToken = 'new-mock-jwt-token';

      const mockResponse = mockApiResponse({
        token: newToken,
        refreshToken: 'new-refresh-token',
      });

      (authService.refreshToken as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await authService.refreshToken(refreshToken);

      // Assert
      expect(result).toEqual({
        success: true,
        token: newToken,
        refreshToken: 'new-refresh-token',
      });
    });

    it('應該拒絕無效的 Refresh Token', async () => {
      // Arrange
      const invalidRefreshToken = 'invalid-refresh-token';

      (authService.refreshToken as jest.Mock).mockImplementation(() =>
        mockApiError('Invalid refresh token')
      );

      // Act & Assert
      await expect(
        authService.refreshToken(invalidRefreshToken)
      ).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('用戶登出', () => {
    it('應該成功登出用戶', async () => {
      // Arrange
      const mockToken = 'mock-jwt-token';

      const mockResponse = mockApiResponse({
        message: 'Logged out successfully',
      });

      (authService.logout as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await authService.logout(mockToken);

      // Assert
      expect(result).toEqual({
        success: true,
        message: 'Logged out successfully',
      });
    });

    it('應該處理登出失敗', async () => {
      // Arrange
      const mockToken = 'invalid-token';

      (authService.logout as jest.Mock).mockImplementation(() =>
        mockApiError('Logout failed')
      );

      // Act & Assert
      await expect(authService.logout(mockToken)).rejects.toThrow(
        'Logout failed'
      );
    });
  });

  describe('用戶驗證', () => {
    it('應該驗證有效 Token', async () => {
      // Arrange
      const mockToken = 'valid-jwt-token';
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };

      const mockResponse = mockApiResponse({
        valid: true,
        user: mockUser,
      });

      (authService.verifyToken as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await authService.verifyToken(mockToken);

      // Assert
      expect(result).toEqual({
        success: true,
        valid: true,
        user: mockUser,
      });
    });

    it('應該拒絕無效 Token', async () => {
      // Arrange
      const invalidToken = 'invalid-jwt-token';

      (authService.verifyToken as jest.Mock).mockImplementation(() =>
        mockApiError('Invalid token')
      );

      // Act & Assert
      await expect(authService.verifyToken(invalidToken)).rejects.toThrow(
        'Invalid token'
      );
    });
  });

  describe('邊界條件測試', () => {
    it('應該處理空憑證', async () => {
      // Arrange
      const emptyCredentials = {
        email: '',
        password: '',
      };

      (authService.login as jest.Mock).mockImplementation(() =>
        mockApiError('Invalid input')
      );

      // Act & Assert
      await expect(authService.login(emptyCredentials)).rejects.toThrow(
        'Invalid input'
      );
    });

    it('應該處理超長輸入', async () => {
      // Arrange
      const longInput = {
        email: 'a'.repeat(300) + '@example.com',
        password: 'a'.repeat(300),
      };

      (authService.login as jest.Mock).mockImplementation(() =>
        mockApiError('Input too long')
      );

      // Act & Assert
      await expect(authService.login(longInput)).rejects.toThrow(
        'Input too long'
      );
    });

    it('應該處理特殊字符', async () => {
      // Arrange
      const specialChars = {
        email: 'test+tag@example.com',
        password: 'p@ssw0rd!',
      };

      const mockResponse = mockApiResponse({
        success: true,
        user: { id: '1', email: specialChars.email },
      });

      (authService.login as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await authService.login(specialChars);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('錯誤處理', () => {
    it('應該處理服務器錯誤', async () => {
      // Arrange
      const mockCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      (authService.login as jest.Mock).mockImplementation(() =>
        mockApiError('Internal server error')
      );

      // Act & Assert
      await expect(authService.login(mockCredentials)).rejects.toThrow(
        'Internal server error'
      );
    });

    it('應該處理超時錯誤', async () => {
      // Arrange
      const mockCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      (authService.login as jest.Mock).mockImplementation(() =>
        mockApiError('Request timeout')
      );

      // Act & Assert
      await expect(authService.login(mockCredentials)).rejects.toThrow(
        'Request timeout'
      );
    });

    it('應該處理網絡中斷', async () => {
      // Arrange
      const mockCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      (authService.login as jest.Mock).mockImplementation(() =>
        mockApiError('Network error')
      );

      // Act & Assert
      await expect(authService.login(mockCredentials)).rejects.toThrow(
        'Network error'
      );
    });
  });
});
