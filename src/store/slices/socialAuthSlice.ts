import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import type {
  SocialProvider,
  SocialLoginCredentials,
  SocialAuthResponse,
  SocialAccountLink,
  SocialUserInfo,
} from '../../core/types';
import { socialAuthService } from '../../features/auth/services/socialAuthService';

// 社交認證狀態接口
export interface SocialAuthState {
  // 登錄狀態
  isSocialLoggingIn: boolean;
  socialLoginError: string | null;

  // 社交登錄響應
  socialAuthResponse: SocialAuthResponse | null;

  // 已鏈接的社交帳戶
  linkedAccounts: SocialAccountLink[];
  isLoadingAccounts: boolean;
  accountsError: string | null;

  // 社交登錄 URL
  socialLoginUrls: Record<SocialProvider, string>;
  isLoadingUrls: boolean;
  urlsError: string | null;

  // 社交用戶信息
  socialUserInfo: Record<SocialProvider, SocialUserInfo | null>;

  // 配置狀態
  configuredProviders: SocialProvider[];
  isCheckingConfig: boolean;
  configError: string | null;
}

// 初始狀態
const initialState: SocialAuthState = {
  isSocialLoggingIn: false,
  socialLoginError: null,
  socialAuthResponse: null,
  linkedAccounts: [],
  isLoadingAccounts: false,
  accountsError: null,
  socialLoginUrls: {} as Record<SocialProvider, string>,
  isLoadingUrls: false,
  urlsError: null,
  socialUserInfo: {} as Record<SocialProvider, SocialUserInfo | null>,
  configuredProviders: [],
  isCheckingConfig: false,
  configError: null,
};

// 異步 Thunk Actions

/**
 * 社交登錄
 */
export const _socialLogin = createAsyncThunk(
  'socialAuth/socialLogin',
  async (credentials: SocialLoginCredentials, { rejectWithValue }) => {
    try {
      const _response = await socialAuthService.socialLogin(credentials);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(error.message || '社交登錄失敗');
    }
  }
);

/**
 * 獲取社交登錄 URL
 */
export const _getSocialLoginUrl = createAsyncThunk(
  'socialAuth/getSocialLoginUrl',
  async (
    {
      provider,
      redirectUri,
    }: { provider: SocialProvider; redirectUri?: string },
    { rejectWithValue }
  ) => {
    try {
      const _url = await socialAuthService.getSocialLoginUrl(
        provider,
        redirectUri
      );
      return { provider, url };
    } catch (error: unknown) {
      return rejectWithValue(error.message || '獲取社交登錄 URL 失敗');
    }
  }
);

/**
 * 處理社交登錄回調
 */
export const _handleSocialCallback = createAsyncThunk(
  'socialAuth/handleSocialCallback',
  async (
    {
      provider,
      code,
      state,
    }: { provider: SocialProvider; code: string; state?: string },
    { rejectWithValue }
  ) => {
    try {
      const _response = await socialAuthService.handleSocialCallback(
        provider,
        code,
        state
      );
      return response;
    } catch (error: unknown) {
      return rejectWithValue(error.message || '處理社交登錄回調失敗');
    }
  }
);

/**
 * 鏈接社交帳戶
 */
export const _linkSocialAccount = createAsyncThunk(
  'socialAuth/linkSocialAccount',
  async (credentials: SocialLoginCredentials, { rejectWithValue }) => {
    try {
      const _account = await socialAuthService.linkSocialAccount(credentials);
      return account;
    } catch (error: unknown) {
      return rejectWithValue(error.message || '鏈接社交帳戶失敗');
    }
  }
);

/**
 * 解除鏈接社交帳戶
 */
export const _unlinkSocialAccount = createAsyncThunk(
  'socialAuth/unlinkSocialAccount',
  async (provider: SocialProvider, { rejectWithValue }) => {
    try {
      await socialAuthService.unlinkSocialAccount(provider);
      return provider;
    } catch (error: unknown) {
      return rejectWithValue(error.message || '解除鏈接社交帳戶失敗');
    }
  }
);

/**
 * 獲取已鏈接的社交帳戶
 */
export const _getLinkedSocialAccounts = createAsyncThunk(
  'socialAuth/getLinkedSocialAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const _accounts = await socialAuthService.getLinkedSocialAccounts();
      return accounts;
    } catch (error: unknown) {
      return rejectWithValue(error.message || '獲取已鏈接社交帳戶失敗');
    }
  }
);

/**
 * 檢查社交帳戶是否已鏈接
 */
export const _checkSocialAccountLinked = createAsyncThunk(
  'socialAuth/checkSocialAccountLinked',
  async (provider: SocialProvider, { rejectWithValue }) => {
    try {
      const _isLinked = await socialAuthService.isSocialAccountLinked(provider);
      return { provider, isLinked };
    } catch (error: unknown) {
      return rejectWithValue(error.message || '檢查社交帳戶鏈接狀態失敗');
    }
  }
);

/**
 * 獲取社交用戶信息
 */
export const _getSocialUserInfo = createAsyncThunk(
  'socialAuth/getSocialUserInfo',
  async (
    {
      provider,
      accessToken,
    }: { provider: SocialProvider; accessToken: string },
    { rejectWithValue }
  ) => {
    try {
      const _userInfo = await socialAuthService.getSocialUserInfo(
        provider,
        accessToken
      );
      return { provider, userInfo };
    } catch (error: unknown) {
      return rejectWithValue(error.message || '獲取社交用戶信息失敗');
    }
  }
);

/**
 * 檢查社交登錄配置
 */
export const _checkSocialLoginConfig = createAsyncThunk(
  'socialAuth/checkSocialLoginConfig',
  async (_, { rejectWithValue }) => {
    try {
      const _config = socialAuthService.getConfig();
      const configuredProviders: SocialProvider[] = [];

      // 檢查每個提供商是否已配置
      (Object.keys(config) as SocialProvider[]).forEach(provider => {
        if (socialAuthService.isProviderConfigured(provider)) {
          configuredProviders.push(provider);
        }
      });

      return configuredProviders;
    } catch (error: unknown) {
      return rejectWithValue(error.message || '檢查社交登錄配置失敗');
    }
  }
);

// Slice
const _socialAuthSlice = createSlice({
  name: 'socialAuth',
  initialState,
  reducers: {
    // 清除社交登錄錯誤
    clearSocialLoginError: state => {
      state.socialLoginError = null;
    },

    // 清除社交認證響應
    clearSocialAuthResponse: state => {
      state.socialAuthResponse = null;
    },

    // 清除帳戶錯誤
    clearAccountsError: state => {
      state.accountsError = null;
    },

    // 清除 URL 錯誤
    clearUrlsError: state => {
      state.urlsError = null;
    },

    // 清除配置錯誤
    clearConfigError: state => {
      state.configError = null;
    },

    // 設置社交用戶信息
    setSocialUserInfo: (
      state,
      action: PayloadAction<{
        provider: SocialProvider;
        userInfo: SocialUserInfo | null;
      }>
    ) => {
      const { provider, userInfo } = action.payload;
      state.socialUserInfo[provider] = userInfo;
    },

    // 重置社交認證狀態
    resetSocialAuth: state => {
      state.isSocialLoggingIn = false;
      state.socialLoginError = null;
      state.socialAuthResponse = null;
      state.linkedAccounts = [];
      state.isLoadingAccounts = false;
      state.accountsError = null;
      state.socialLoginUrls = {} as Record<SocialProvider, string>;
      state.isLoadingUrls = false;
      state.urlsError = null;
      state.socialUserInfo = {} as Record<
        SocialProvider,
        SocialUserInfo | null
      >;
      state.configuredProviders = [];
      state.isCheckingConfig = false;
      state.configError = null;
    },
  },
  extraReducers: builder => {
    // socialLogin
    builder
      .addCase(socialLogin.pending, state => {
        state.isSocialLoggingIn = true;
        state.socialLoginError = null;
      })
      .addCase(socialLogin.fulfilled, (state, action) => {
        state.isSocialLoggingIn = false;
        state.socialAuthResponse = action.payload;
        state.socialLoginError = null;
      })
      .addCase(socialLogin.rejected, (state, action) => {
        state.isSocialLoggingIn = false;
        state.socialLoginError = action.payload as string;
      });

    // getSocialLoginUrl
    builder
      .addCase(getSocialLoginUrl.pending, state => {
        state.isLoadingUrls = true;
        state.urlsError = null;
      })
      .addCase(getSocialLoginUrl.fulfilled, (state, action) => {
        state.isLoadingUrls = false;
        const { provider, url } = action.payload;
        state.socialLoginUrls[provider] = url;
        state.urlsError = null;
      })
      .addCase(getSocialLoginUrl.rejected, (state, action) => {
        state.isLoadingUrls = false;
        state.urlsError = action.payload as string;
      });

    // handleSocialCallback
    builder
      .addCase(handleSocialCallback.pending, state => {
        state.isSocialLoggingIn = true;
        state.socialLoginError = null;
      })
      .addCase(handleSocialCallback.fulfilled, (state, action) => {
        state.isSocialLoggingIn = false;
        state.socialAuthResponse = action.payload;
        state.socialLoginError = null;
      })
      .addCase(handleSocialCallback.rejected, (state, action) => {
        state.isSocialLoggingIn = false;
        state.socialLoginError = action.payload as string;
      });

    // linkSocialAccount
    builder.addCase(linkSocialAccount.fulfilled, (state, action) => {
      // 將新鏈接的帳戶添加到列表中
      const _existingIndex = state.linkedAccounts.findIndex(
        account => account.provider === action.payload.provider
      );
      if (existingIndex >= 0) {
        state.linkedAccounts[existingIndex] = action.payload;
      } else {
        state.linkedAccounts.push(action.payload);
      }
    });

    // unlinkSocialAccount
    builder.addCase(unlinkSocialAccount.fulfilled, (state, action) => {
      // 從列表中移除解除鏈接的帳戶
      state.linkedAccounts = state.linkedAccounts.filter(
        account => account.provider !== action.payload
      );
    });

    // getLinkedSocialAccounts
    builder
      .addCase(getLinkedSocialAccounts.pending, state => {
        state.isLoadingAccounts = true;
        state.accountsError = null;
      })
      .addCase(getLinkedSocialAccounts.fulfilled, (state, action) => {
        state.isLoadingAccounts = false;
        state.linkedAccounts = action.payload;
        state.accountsError = null;
      })
      .addCase(getLinkedSocialAccounts.rejected, (state, action) => {
        state.isLoadingAccounts = false;
        state.accountsError = action.payload as string;
      });

    // getSocialUserInfo
    builder.addCase(getSocialUserInfo.fulfilled, (state, action) => {
      const { provider, userInfo } = action.payload;
      state.socialUserInfo[provider] = userInfo;
    });

    // checkSocialLoginConfig
    builder
      .addCase(checkSocialLoginConfig.pending, state => {
        state.isCheckingConfig = true;
        state.configError = null;
      })
      .addCase(checkSocialLoginConfig.fulfilled, (state, action) => {
        state.isCheckingConfig = false;
        state.configuredProviders = action.payload;
        state.configError = null;
      })
      .addCase(checkSocialLoginConfig.rejected, (state, action) => {
        state.isCheckingConfig = false;
        state.configError = action.payload as string;
      });
  },
});

// 導出 actions
export const {
  clearSocialLoginError,
  clearSocialAuthResponse,
  clearAccountsError,
  clearUrlsError,
  clearConfigError,
  setSocialUserInfo,
  resetSocialAuth,
} = socialAuthSlice.actions;

// 導出 reducer
export default socialAuthSlice.reducer;

// 導出選擇器
export const _selectSocialAuth = (state: { socialAuth: SocialAuthState }) =>
  state.socialAuth;
export const _selectIsSocialLoggingIn = (state: {
  socialAuth: SocialAuthState;
}) => state.socialAuth.isSocialLoggingIn;
export const _selectSocialLoginError = (state: {
  socialAuth: SocialAuthState;
}) => state.socialAuth.socialLoginError;
export const _selectSocialAuthResponse = (state: {
  socialAuth: SocialAuthState;
}) => state.socialAuth.socialAuthResponse;
export const _selectLinkedAccounts = (state: { socialAuth: SocialAuthState }) =>
  state.socialAuth.linkedAccounts;
export const _selectIsLoadingAccounts = (state: {
  socialAuth: SocialAuthState;
}) => state.socialAuth.isLoadingAccounts;
export const _selectAccountsError = (state: { socialAuth: SocialAuthState }) =>
  state.socialAuth.accountsError;
export const _selectSocialLoginUrls = (state: {
  socialAuth: SocialAuthState;
}) => state.socialAuth.socialLoginUrls;
export const _selectIsLoadingUrls = (state: { socialAuth: SocialAuthState }) =>
  state.socialAuth.isLoadingUrls;
export const _selectUrlsError = (state: { socialAuth: SocialAuthState }) =>
  state.socialAuth.urlsError;
export const _selectConfiguredProviders = (state: {
  socialAuth: SocialAuthState;
}) => state.socialAuth.configuredProviders;
export const _selectIsCheckingConfig = (state: {
  socialAuth: SocialAuthState;
}) => state.socialAuth.isCheckingConfig;
export const _selectConfigError = (state: { socialAuth: SocialAuthState }) =>
  state.socialAuth.configError;
