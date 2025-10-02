import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import type {
  User,
  RegisterData,
  LoginCredentials,
  AuthResponse,
} from '../../core/types/auth';
import { authService } from '../../shared/services/authService';

// AuthenticateStatusInterface
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// 初始Status
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// AsyncAction：UserRegister
export const _registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const _response = await authService.register(userData);
      return response;
    } catch (error: unknown) {
      const _errorMessage =
        error.response?.data?.message || error.message || '註冊Failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// AsyncAction：UserLogin
export const _loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const _response = await authService.login(credentials);
      return response;
    } catch (error: unknown) {
      const _errorMessage =
        error.response?.data?.message || error.message || '登錄Failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// AsyncAction：User登出
export const _logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error: unknown) {
      const _errorMessage =
        error.response?.data?.message || error.message || '登出Failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// AsyncAction：Get當前User
export const _getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const _user = await authService.getCurrentUserAsync();
      return user;
    } catch (error: unknown) {
      const _errorMessage =
        error.response?.data?.message || error.message || 'Get用戶信息Failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// AsyncAction：CheckAuthenticateStatus
export const _checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const _isAuthenticated = await authService.checkAuthenticationStatus();
      if (isAuthenticated) {
        const _user = await authService.getCurrentUserAsync();
        const _token = await authService.getStoredToken();
        return { user, token };
      }
      return { user: null, token: null };
    } catch (error: unknown) {
      const _errorMessage =
        error.response?.data?.message || error.message || 'Check認證狀態Failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// AsyncAction：UpdateUser資料
export const _updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<User>, { rejectWithValue }) => {
    try {
      const _user = await authService.updateProfile(profileData);
      return user;
    } catch (error: unknown) {
      const _errorMessage =
        error.response?.data?.message || error.message || 'Update資料Failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// AuthenticateSlice
const _authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ClearError
    clearError: state => {
      state.error = null;
    },

    // SettingsUser
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },

    // Settings令牌
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },

    // ResetAuthenticateStatus
    resetAuth: state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    // RegisterUser
    builder
      .addCase(registerUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        registerUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
        }
      )
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // LoginUser
    builder
      .addCase(loginUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 登出User
    builder
      .addCase(logoutUser.pending, state => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, state => {
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

    // Get當前User
    builder
      .addCase(getCurrentUser.pending, state => {
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

    // CheckAuthenticateStatus
    builder
      .addCase(checkAuthStatus.pending, state => {
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

    // UpdateUser資料
    builder
      .addCase(updateUserProfile.pending, state => {
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

// Exportactions
export const { clearError, setUser, setToken, resetAuth } = authSlice.actions;

// Exportselectors
export const _selectAuth = (state: { auth: AuthState }) => state.auth;
export const _selectUser = (state: { auth: AuthState }) => state.auth.user;
export const _selectToken = (state: { auth: AuthState }) => state.auth.token;
export const _selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const _selectIsLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
export const _selectError = (state: { auth: AuthState }) => state.auth.error;

// Exportreducer
export default authSlice.reducer;
