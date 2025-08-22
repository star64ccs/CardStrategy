import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  authService,
  User,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
} from '../../services/authService';

// 認證狀態接口
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// 初始狀態
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// 異步Action：用戶註冊
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || '註冊失敗';
      return rejectWithValue(errorMessage);
    }
  }
);

// 異步Action：用戶登錄
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || '登錄失敗';
      return rejectWithValue(errorMessage);
    }
  }
);

// 異步Action：用戶登出
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || '登出失敗';
      return rejectWithValue(errorMessage);
    }
  }
);

// 異步Action：獲取當前用戶
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || '獲取用戶信息失敗';
      return rejectWithValue(errorMessage);
    }
  }
);

// 異步Action：檢查認證狀態
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const isAuthenticated = await authService.isAuthenticated();
      if (isAuthenticated) {
        const user = await authService.getCurrentUser();
        const token = await authService.getStoredToken();
        return { user, token };
      }
      return { user: null, token: null };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || '檢查認證狀態失敗';
      return rejectWithValue(errorMessage);
    }
  }
);

// 異步Action：更新用戶資料
export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<User>, { rejectWithValue }) => {
    try {
      const user = await authService.updateProfile(profileData);
      return user;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || '更新資料失敗';
      return rejectWithValue(errorMessage);
    }
  }
);

// 認證Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 清除錯誤
    clearError: (state) => {
      state.error = null;
    },

    // 設置用戶
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },

    // 設置令牌
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },

    // 重置認證狀態
    resetAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 註冊用戶
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        registerUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.isLoading = false;
          state.user = action.payload.data.user;
          state.token = action.payload.data.token;
          state.isAuthenticated = true;
          state.error = null;
        }
      )
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 登錄用戶
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.isLoading = false;
          state.user = action.payload.data.user;
          state.token = action.payload.data.token;
          state.isAuthenticated = true;
          state.error = null;
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 登出用戶
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 獲取當前用戶
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getCurrentUser.fulfilled,
        (state, action: PayloadAction<User | null>) => {
          state.isLoading = false;
          if (action.payload) {
            state.user = action.payload;
            state.isAuthenticated = true;
          } else {
            state.user = null;
            state.isAuthenticated = false;
          }
          state.error = null;
        }
      )
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 檢查認證狀態
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        checkAuthStatus.fulfilled,
        (
          state,
          action: PayloadAction<{ user: User | null; token: string | null }>
        ) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = !!action.payload.user;
          state.error = null;
        }
      )
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 更新用戶資料
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateUserProfile.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.isLoading = false;
          state.user = action.payload;
          state.error = null;
        }
      )
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// 導出actions
export const { clearError, setUser, setToken, resetAuth } = authSlice.actions;

// 導出selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;

// 導出reducer
export default authSlice.reducer;
