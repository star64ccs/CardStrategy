// 用戶認證流程集成測試
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BiometricAuthService } from '../../../../features/auth/services/biometricAuthService';
import { AuthService } from '../../../../shared/services/auth/authService';
import authSlice, {
  login,
  logout,
  register,
  verifyToken,
} from '../../../../store/slices/authSlice';
import { mockApiError, mockApiResponse } from '../../../fixtures/test-utils';

// Mock 外部依賴
jest.mock('../../../../src/services/auth/authService');
jest.mock('../../../../src/features/auth/services/biometricAuthService');

// 測試組件
const TestAuthComponent = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLogin, setIsLogin] = React.useState(true);

  return (
    <View>
      <TextInput
        testID='email-input'
        value={email}
        onChangeText={setEmail}
        placeholder='Email'
      />
      <TextInput
        testID='password-input'
        value={password}
        onChangeText={setPassword}
        placeholder='Password'
        secureTextEntry
      />
      <TouchableOpacity
        testID='auth-button'
        onPress={() => {
          if (isLogin) {
            // 觸發登錄
          } else {
            // 觸發註冊
          }
        }}
      >
        <Text>{isLogin ? 'Login' : 'Register'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID='toggle-mode'
        onPress={() => setIsLogin(!isLogin)}
      >
        <Text>Toggle Mode</Text>
      </TouchableOpacity>
    </View>
  );
};

describe('用戶認證流程集成測試', () => {
  let store: ReturnType<typeof configureStore>;
  let authService: jest.Mocked<AuthService>;
  let biometricAuthService: jest.Mocked<BiometricAuthService>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authSlice.reducer,
      },
    });

    authService = new AuthService() as jest.Mocked<AuthService>;
    biometricAuthService =
      new BiometricAuthService() as jest.Mocked<BiometricAuthService>;

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('完整登錄流程', () => {
    it('應該成功完成從登錄到認證的完整流程', async () => {
      // Arrange
      const mockCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };
      const mockTokens = {
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      };

      // Mock API 響應
      const mockLoginResponse = mockApiResponse({
        user: mockUser,
        ...mockTokens,
      });

      const mockVerifyResponse = mockApiResponse({
        valid: true,
        user: mockUser,
      });

      // Act
      // 1. 用戶登錄
      await store.dispatch(login(mockCredentials));

      // 2. 驗證 Token
      await store.dispatch(verifyToken(mockTokens.token));

      // Assert
      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockTokens.token);
      expect(state.refreshToken).toBe(mockTokens.refreshToken);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('應該處理登錄失敗後的錯誤狀態', async () => {
      // Arrange
      const mockCredentials = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      // Mock API 錯誤響應
      const mockError = mockApiError('Invalid credentials', 401);

      // Act
      await store.dispatch(login(mockCredentials));

      // Assert
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Invalid credentials');
    });

    it('應該處理 Token 過期後的重新認證', async () => {
      // Arrange
      const mockCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };
      const mockTokens = {
        token: 'expired-jwt-token',
        refreshToken: 'mock-refresh-token',
      };

      // Mock API 響應
      const mockLoginResponse = mockApiResponse({
        user: mockUser,
        ...mockTokens,
      });

      const mockVerifyError = mockApiError('Token expired', 401);

      // Act
      // 1. 用戶登錄
      await store.dispatch(login(mockCredentials));

      // 2. Token 驗證失敗
      await store.dispatch(verifyToken(mockTokens.token));

      // Assert
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Token expired');
    });
  });

  describe('完整註冊流程', () => {
    it('應該成功完成從註冊到認證的完整流程', async () => {
      // Arrange
      const mockUserData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };
      const mockUser = {
        id: '2',
        email: 'newuser@example.com',
        name: 'New User',
        role: 'user',
      };
      const mockTokens = {
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      };

      // Mock API 響應
      const mockRegisterResponse = mockApiResponse({
        user: mockUser,
        ...mockTokens,
      });

      const mockVerifyResponse = mockApiResponse({
        valid: true,
        user: mockUser,
      });

      // Act
      // 1. 用戶註冊
      await store.dispatch(register(mockUserData));

      // 2. 驗證 Token
      await store.dispatch(verifyToken(mockTokens.token));

      // Assert
      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockTokens.token);
      expect(state.refreshToken).toBe(mockTokens.refreshToken);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('應該處理註冊失敗後的錯誤狀態', async () => {
      // Arrange
      const mockUserData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      };

      // Mock API 錯誤響應
      const mockError = mockApiError('Email already exists', 409);

      // Act
      await store.dispatch(register(mockUserData));

      // Assert
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Email already exists');
    });
  });

  describe('生物識別認證流程', () => {
    it('應該成功完成生物識別認證流程', async () => {
      // Arrange
      const mockBiometricData = {
        biometricType: 'fingerprint',
        template: 'mock_template_data',
      };
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };
      const mockTokens = {
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      };

      // Mock API 響應
      const mockBiometricResponse = mockApiResponse({
        verified: true,
        user: mockUser,
        ...mockTokens,
      });

      // Act
      const result =
        await biometricAuthService.verifyBiometric(mockBiometricData);

      // 模擬 Redux 狀態更新
      store.dispatch({
        type: 'auth/biometricLogin/fulfilled',
        payload: {
          user: mockUser,
          ...mockTokens,
        },
      });

      // Assert
      expect(result).toEqual({
        success: true,
        verified: true,
        user: mockUser,
        token: mockTokens.token,
        refreshToken: mockTokens.refreshToken,
      });

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('應該處理生物識別認證失敗', async () => {
      // Arrange
      const mockBiometricData = {
        biometricType: 'fingerprint',
        template: 'invalid_template_data',
      };

      // Mock API 錯誤響應
      const mockError = mockApiError('Biometric verification failed', 401);

      // Act
      await expect(
        biometricAuthService.verifyBiometric(mockBiometricData)
      ).rejects.toThrow('Biometric verification failed');
    });
  });

  describe('登出流程', () => {
    it('應該成功完成登出流程', async () => {
      // Arrange
      const mockToken = 'mock-jwt-token';
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };

      // 先設置登錄狀態
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: {
          user: mockUser,
          token: mockToken,
          refreshToken: 'mock-refresh-token',
        },
      });

      // Mock API 響應
      const mockLogoutResponse = mockApiResponse({
        message: 'Logged out successfully',
      });

      // Act
      await store.dispatch(logout(mockToken));

      // Assert
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
    });

    it('應該處理登出失敗', async () => {
      // Arrange
      const mockToken = 'invalid-token';

      // Mock API 錯誤響應
      const mockError = mockApiError('Logout failed', 500);

      // Act
      await store.dispatch(logout(mockToken));

      // Assert
      const state = store.getState().auth;
      expect(state.error).toBe('Logout failed');
    });
  });

  describe('認證狀態持久化', () => {
    it('應該在應用重啟後恢復認證狀態', async () => {
      // Arrange
      const mockToken = 'persistent-jwt-token';
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };

      // Mock 從存儲恢復的狀態
      const persistedState = {
        auth: {
          user: mockUser,
          token: mockToken,
          refreshToken: 'persistent-refresh-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
          lastLogin: new Date().toISOString(),
          sessionExpiry: new Date(
            Date.now() + 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      };

      // 創建帶有持久化狀態的 store
      store = configureStore({
        reducer: {
          auth: authSlice.reducer,
        },
        preloadedState: persistedState,
      });

      // Mock API 響應
      const mockVerifyResponse = mockApiResponse({
        valid: true,
        user: mockUser,
      });

      // Act
      await store.dispatch(verifyToken(mockToken));

      // Assert
      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockToken);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('應該在 Token 無效時清除認證狀態', async () => {
      // Arrange
      const mockToken = 'invalid-persistent-token';

      // Mock 從存儲恢復的狀態
      const persistedState = {
        auth: {
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            role: 'user',
          },
          token: mockToken,
          refreshToken: 'persistent-refresh-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
          lastLogin: new Date().toISOString(),
          sessionExpiry: new Date(
            Date.now() + 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      };

      // 創建帶有持久化狀態的 store
      store = configureStore({
        reducer: {
          auth: authSlice.reducer,
        },
        preloadedState: persistedState,
      });

      // Mock API 錯誤響應
      const mockVerifyError = mockApiError('Invalid token', 401);

      // Act
      await store.dispatch(verifyToken(mockToken));

      // Assert
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Invalid token');
    });
  });

  describe('錯誤恢復流程', () => {
    it('應該在網絡錯誤後成功恢復認證', async () => {
      // Arrange
      const mockCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      };
      const mockTokens = {
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      };

      // Mock 第一次請求失敗，第二次成功
      let requestCount = 0;
      const mockLoginResponse = mockApiResponse(
        {
          user: mockUser,
          ...mockTokens,
        },
        0,
        () => {
          requestCount++;
          if (requestCount === 1) {
            throw new Error('Network error');
          }
          return mockLoginResponse;
        }
      );

      // Act
      // 第一次嘗試（失敗）
      await store.dispatch(login(mockCredentials));
      let state = store.getState().auth;
      expect(state.error).toBe('Network error');

      // 第二次嘗試（成功）
      await store.dispatch(login(mockCredentials));

      // Assert
      state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe(mockTokens.token);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('並發認證請求', () => {
    it('應該正確處理並發登錄請求', async () => {
      // Arrange
      const mockCredentials1 = {
        email: 'user1@example.com',
        password: 'password123',
      };
      const mockCredentials2 = {
        email: 'user2@example.com',
        password: 'password123',
      };

      // Mock API 響應
      const mockResponse1 = mockApiResponse({
        user: {
          id: '1',
          email: 'user1@example.com',
          name: 'User 1',
          role: 'user',
        },
        token: 'token1',
        refreshToken: 'refresh1',
      });

      const mockResponse2 = mockApiResponse({
        user: {
          id: '2',
          email: 'user2@example.com',
          name: 'User 2',
          role: 'user',
        },
        token: 'token2',
        refreshToken: 'refresh2',
      });

      // Act
      const promise1 = store.dispatch(login(mockCredentials1));
      const promise2 = store.dispatch(login(mockCredentials2));

      await Promise.all([promise1, promise2]);

      // Assert
      const state = store.getState().auth;
      // 最後一個成功的請求應該是最終狀態
      expect(state.user).toBeTruthy();
      expect(state.token).toBeTruthy();
      expect(state.isAuthenticated).toBe(true);
    });
  });
});
