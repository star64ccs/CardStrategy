/* global jest, describe, it, expect, beforeEach, afterEach */
import { configureStore } from '@reduxjs/toolkit';

import authReducer, {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  clearError,
} from '../../../store/slices/authSlice';

// Mock auth service
jest.mock('../../../services/authService', () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
    getCurrentUser: jest.fn(),
    updateProfile: jest.fn(),
  })),
}));

describe('Auth Slice', () => {
  let store: unknown;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  describe('Initial State', () => {
    it('應該返回初始狀態', () => {
      const _state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('Login Actions', () => {
    it('應該處理登錄 pending 狀態', () => {
      const _loginData = { email: 'test@example.com', password: 'password123' };
      store.dispatch(loginUser.pending('test-request-id', loginData));

      const _state = store.getState().auth;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('應該Handle登錄Success', () => {
      const _user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };
      const _tokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      store.dispatch(
        loginUser.fulfilled(
          { user, token: tokens.accessToken },
          'test-request-id',
          { email: 'test@example.com', password: 'password123' }
        )
      );

      const _state = store.getState().auth;
      expect(state.user).toEqual(user);
      expect(state.token).toEqual(tokens.accessToken);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('應該Handle登錄Failed', () => {
      const _error = '登錄Failed';

      store.dispatch(
        loginUser.rejected(
          new Error(error),
          'test-request-id',
          { email: 'test@example.com', password: 'password123' },
          error
        )
      );

      const _state = store.getState().auth;
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('Register Actions', () => {
    it('應該處理註冊開始', () => {
      const _registerData = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };
      store.dispatch(registerUser.pending('test-request-id', registerData));

      const _state = store.getState().auth;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('應該Handle註冊Success', () => {
      const _user = {
        id: '2',
        email: 'new@example.com',
        name: 'New User',
      };
      const _tokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      store.dispatch(
        registerUser.fulfilled(
          { user, token: tokens.accessToken },
          'test-request-id',
          {
            email: 'new@example.com',
            password: 'password123',
            name: 'New User',
          }
        )
      );

      const _state = store.getState().auth;
      expect(state.user).toEqual(user);
      expect(state.token).toEqual(tokens.accessToken);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('應該Handle註冊Failed', () => {
      const _error = '用戶已存在';

      store.dispatch(
        registerUser.rejected(
          new Error(error),
          'test-request-id',
          {
            email: 'new@example.com',
            password: 'password123',
            name: 'New User',
          },
          error
        )
      );

      const _state = store.getState().auth;
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('Logout Actions', () => {
    it('應該處理登出開始', () => {
      store.dispatch(logoutUser.pending('test-request-id'));

      const _state = store.getState().auth;
      expect(state.isLoading).toBe(true);
    });

    it('應該Handle登出Success', () => {
      // 先SettingsLoginStatus
      store.dispatch(
        loginUser.fulfilled(
          {
            user: { id: '1', email: 'test@example.com', name: 'Test User' },
            token: 'token',
          },
          'test-request-id',
          { email: 'test@example.com', password: 'password123' }
        )
      );

      // 然後登出
      store.dispatch(logoutUser.fulfilled(null, 'test-request-id'));

      const _state = store.getState().auth;
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('應該Handle登出Failed', () => {
      const _error = '登出Failed';

      store.dispatch(
        logoutUser.rejected(
          new Error(error),
          'test-request-id',
          undefined,
          error
        )
      );

      const _state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('Refresh Token Actions', () => {
    it('應該處理刷新令牌開始', () => {
      store.dispatch(getCurrentUser.pending('test-request-id'));

      const _state = store.getState().auth;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('應該Handle刷新令牌Success', () => {
      const _tokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      store.dispatch(
        getCurrentUser.fulfilled(
          { id: '1', email: 'test@example.com', name: 'Test User' },
          'test-request-id'
        )
      );

      const _state = store.getState().auth;
      expect(state.user).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('應該Handle刷新令牌Failed', () => {
      const _error = '令牌刷新Failed';

      store.dispatch(
        getCurrentUser.rejected(
          new Error(error),
          'test-request-id',
          undefined,
          error
        )
      );

      const _state = store.getState().auth;
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('Get Current User Actions', () => {
    it('應該處理獲取當前用戶開始', () => {
      store.dispatch(getCurrentUser());

      const _state = store.getState().auth;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('應該HandleGet當前用戶Success', () => {
      const _user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'avatar-url',
      };

      store.dispatch(getCurrentUser.fulfilled(user, 'test-request-id'));

      const _state = store.getState().auth;
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('應該HandleGet當前用戶Failed', () => {
      const _error = 'Get用戶信息Failed';

      store.dispatch(
        getCurrentUser.rejected(
          new Error(error),
          'test-request-id',
          undefined,
          error
        )
      );

      const _state = store.getState().auth;
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('Update Profile Actions', () => {
    it('應該處理更新資料開始', () => {
      const _profileData = {
        name: 'Updated Name',
        avatar: 'new-avatar-url',
      };
      store.dispatch(getCurrentUser.pending('test-request-id'));

      const _state = store.getState().auth;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('應該HandleUpdate資料Success', () => {
      const _user = {
        id: '1',
        email: 'test@example.com',
        name: 'Updated Name',
        avatar: 'new-avatar-url',
      };

      store.dispatch(getCurrentUser.fulfilled(user, 'test-request-id'));

      const _state = store.getState().auth;
      expect(state.user).toEqual(user);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('應該HandleUpdate資料Failed', () => {
      const _error = 'Update資料Failed';

      store.dispatch(
        getCurrentUser.rejected(
          new Error(error),
          'test-request-id',
          undefined,
          error
        )
      );

      const _state = store.getState().auth;
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('Clear Error Action', () => {
    it('應該清除Error', () => {
      // 先SettingsError
      store.dispatch(
        loginUser.rejected(
          new Error('登錄Failed'),
          'test-request-id',
          { email: 'test@example.com', password: 'password123' },
          '登錄Failed'
        )
      );

      // 然後ClearError
      store.dispatch(clearError());

      const _state = store.getState().auth;
      expect(state.error).toBe(null);
    });
  });

  describe('State Transitions', () => {
    it('應該正確處理完整的登錄流程', () => {
      // BeginLogin
      store.dispatch(
        loginUser.pending('test-request-id', {
          email: 'test@example.com',
          password: 'password123',
        })
      );
      expect(store.getState().auth.isLoading).toBe(true);

      // LoginSuccess
      const _user = { id: '1', email: 'test@example.com', name: 'Test User' };
      const _tokens = { accessToken: 'token', refreshToken: 'refresh' };
      store.dispatch(
        loginUser.fulfilled(
          { user, token: tokens.accessToken },
          'test-request-id',
          { email: 'test@example.com', password: 'password123' }
        )
      );

      const _state = store.getState().auth;
      expect(state.user).toEqual(user);
      expect(state.token).toEqual(tokens.accessToken);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('應該正確Handle登錄Failed後的狀態', () => {
      // BeginLogin
      store.dispatch(
        loginUser.pending('test-request-id', {
          email: 'test@example.com',
          password: 'wrong',
        })
      );
      expect(store.getState().auth.isLoading).toBe(true);

      // LoginFailed
      store.dispatch(
        loginUser.rejected(
          new Error('密碼Error'),
          'test-request-id',
          { email: 'test@example.com', password: 'wrong' },
          '密碼Error'
        )
      );

      const _state = store.getState().auth;
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('密碼Error');
    });

    it('應該正確處理登出後的狀態重置', () => {
      // 先Login
      store.dispatch(
        loginUser.fulfilled(
          {
            user: { id: '1', email: 'test@example.com', name: 'Test User' },
            token: 'token',
          },
          'test-request-id',
          { email: 'test@example.com', password: 'password123' }
        )
      );

      // 然後登出
      store.dispatch(logoutUser.fulfilled(null, 'test-request-id'));

      const _state = store.getState().auth;
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('Selectors', () => {
    it('應該正確選擇用戶狀態', () => {
      const _user = { id: '1', email: 'test@example.com', name: 'Test User' };
      store.dispatch(
        loginUser.fulfilled({ user, token: 'token' }, 'test-request-id', {
          email: 'test@example.com',
          password: 'password123',
        })
      );

      const _state = store.getState().auth;
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
    });

    it('應該正確選擇加載狀態', () => {
      store.dispatch(
        loginUser.pending('test-request-id', {
          email: 'test@example.com',
          password: 'password123',
        })
      );
      expect(store.getState().auth.isLoading).toBe(true);
    });

    it('應該正確選擇Error狀態', () => {
      store.dispatch(
        loginUser.rejected(
          new Error('登錄Failed'),
          'test-request-id',
          { email: 'test@example.com', password: 'password123' },
          '登錄Failed'
        )
      );
      expect(store.getState().auth.error).toBe('登錄Failed');
    });
  });
});
