/* global jest, describe, it, expect, beforeEach, afterEach */
import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  loginUser,
  registerUser,
  logoutUser,
  refreshToken,
  getCurrentUser,
  updateUserProfile,
  clearError,
} from '@/store/slices/authSlice';

// Mock auth service
jest.mock('@/services/authService', () => ({
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
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  describe('Initial State', () => {
    it('應該返回初始狀態', () => {
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('Login Actions', () => {
    it('應該處理登錄 pending 狀態', () => {
      const loginData = { email: 'test@example.com', password: 'password123' };
      store.dispatch(loginUser.pending('test-request-id', loginData));

      const state = store.getState().auth;
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('應該處理登錄成功', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };
      const tokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      store.dispatch(loginSuccess({ user, tokens }));

      const state = store.getState().auth;
      expect(state.user).toEqual(user);
      expect(state.tokens).toEqual(tokens);
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('應該處理登錄失敗', () => {
      const error = '登錄失敗';

      store.dispatch(loginFailure(error));

      const state = store.getState().auth;
      expect(state.user).toBe(null);
      expect(state.tokens).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('Register Actions', () => {
    it('應該處理註冊開始', () => {
      const registerData = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };
      store.dispatch(register(registerData));

      const state = store.getState().auth;
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('應該處理註冊成功', () => {
      const user = {
        id: '2',
        email: 'new@example.com',
        name: 'New User',
      };
      const tokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      };

      store.dispatch(registerSuccess({ user, tokens }));

      const state = store.getState().auth;
      expect(state.user).toEqual(user);
      expect(state.tokens).toEqual(tokens);
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('應該處理註冊失敗', () => {
      const error = '用戶已存在';

      store.dispatch(registerFailure(error));

      const state = store.getState().auth;
      expect(state.user).toBe(null);
      expect(state.tokens).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('Logout Actions', () => {
    it('應該處理登出開始', () => {
      store.dispatch(logout());

      const state = store.getState().auth;
      expect(state.loading).toBe(true);
    });

    it('應該處理登出成功', () => {
      // 先設置登錄狀態
      store.dispatch(
        loginSuccess({
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          tokens: { accessToken: 'token', refreshToken: 'refresh' },
        })
      );

      // 然後登出
      store.dispatch(logoutSuccess());

      const state = store.getState().auth;
      expect(state.user).toBe(null);
      expect(state.tokens).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('應該處理登出失敗', () => {
      const error = '登出失敗';

      store.dispatch(logoutFailure(error));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('Refresh Token Actions', () => {
    it('應該處理刷新令牌開始', () => {
      store.dispatch(refreshToken());

      const state = store.getState().auth;
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('應該處理刷新令牌成功', () => {
      const tokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      store.dispatch(refreshTokenSuccess(tokens));

      const state = store.getState().auth;
      expect(state.tokens).toEqual(tokens);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('應該處理刷新令牌失敗', () => {
      const error = '令牌刷新失敗';

      store.dispatch(refreshTokenFailure(error));

      const state = store.getState().auth;
      expect(state.user).toBe(null);
      expect(state.tokens).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('Get Current User Actions', () => {
    it('應該處理獲取當前用戶開始', () => {
      store.dispatch(getCurrentUser());

      const state = store.getState().auth;
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('應該處理獲取當前用戶成功', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'avatar-url',
      };

      store.dispatch(getCurrentUserSuccess(user));

      const state = store.getState().auth;
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('應該處理獲取當前用戶失敗', () => {
      const error = '獲取用戶信息失敗';

      store.dispatch(getCurrentUserFailure(error));

      const state = store.getState().auth;
      expect(state.user).toBe(null);
      expect(state.tokens).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('Update Profile Actions', () => {
    it('應該處理更新資料開始', () => {
      const profileData = {
        name: 'Updated Name',
        avatar: 'new-avatar-url',
      };
      store.dispatch(updateProfile(profileData));

      const state = store.getState().auth;
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('應該處理更新資料成功', () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Updated Name',
        avatar: 'new-avatar-url',
      };

      store.dispatch(updateProfileSuccess(user));

      const state = store.getState().auth;
      expect(state.user).toEqual(user);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('應該處理更新資料失敗', () => {
      const error = '更新資料失敗';

      store.dispatch(updateProfileFailure(error));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('Clear Error Action', () => {
    it('應該清除錯誤', () => {
      // 先設置錯誤
      store.dispatch(loginFailure('登錄失敗'));

      // 然後清除錯誤
      store.dispatch(clearError());

      const state = store.getState().auth;
      expect(state.error).toBe(null);
    });
  });

  describe('State Transitions', () => {
    it('應該正確處理完整的登錄流程', () => {
      // 開始登錄
      store.dispatch(
        login({ email: 'test@example.com', password: 'password123' })
      );
      expect(store.getState().auth.loading).toBe(true);

      // 登錄成功
      const user = { id: '1', email: 'test@example.com', name: 'Test User' };
      const tokens = { accessToken: 'token', refreshToken: 'refresh' };
      store.dispatch(loginSuccess({ user, tokens }));

      const state = store.getState().auth;
      expect(state.user).toEqual(user);
      expect(state.tokens).toEqual(tokens);
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('應該正確處理登錄失敗後的狀態', () => {
      // 開始登錄
      store.dispatch(login({ email: 'test@example.com', password: 'wrong' }));
      expect(store.getState().auth.loading).toBe(true);

      // 登錄失敗
      store.dispatch(loginFailure('密碼錯誤'));

      const state = store.getState().auth;
      expect(state.user).toBe(null);
      expect(state.tokens).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBe('密碼錯誤');
    });

    it('應該正確處理登出後的狀態重置', () => {
      // 先登錄
      store.dispatch(
        loginSuccess({
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          tokens: { accessToken: 'token', refreshToken: 'refresh' },
        })
      );

      // 然後登出
      store.dispatch(logoutSuccess());

      const state = store.getState().auth;
      expect(state.user).toBe(null);
      expect(state.tokens).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('Selectors', () => {
    it('應該正確選擇用戶狀態', () => {
      const user = { id: '1', email: 'test@example.com', name: 'Test User' };
      store.dispatch(
        loginSuccess({
          user,
          tokens: { accessToken: 'token', refreshToken: 'refresh' },
        })
      );

      const state = store.getState().auth;
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
    });

    it('應該正確選擇加載狀態', () => {
      store.dispatch(
        login({ email: 'test@example.com', password: 'password123' })
      );
      expect(store.getState().auth.loading).toBe(true);
    });

    it('應該正確選擇錯誤狀態', () => {
      store.dispatch(loginFailure('登錄失敗'));
      expect(store.getState().auth.error).toBe('登錄失敗');
    });
  });
});
