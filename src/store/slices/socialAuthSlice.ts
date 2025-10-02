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

// 社交AuthenticateStatusInterface
export interface SocialAuthState {
  // LoginStatus
  isSocialLoggingIn: boolean;
  socialLoginError: string | null;

  // 社交LoginResponse
  socialAuthResponse: SocialAuthResponse | null;

  // 已鏈接的社交帳戶
  linkedAccounts: SocialAccountLink[];
  isLoadingAccounts: boolean;
  accountsError: string | null;

  // 社交Login URL
  socialLoginUrls: Record<SocialProvider, string>;
  isLoadingUrls: boolean;
  urlsError: string | null;

  // 社交UserInformation
  socialUserInfo: Record<SocialProvider, SocialUserInfo | null>;

  // ConfigureStatus
  configuredProviders: SocialProvider[];
  isCheckingConfig: boolean;
  configError: string | null;
}

// 初始Status
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

// Async Thunk Actions

/**
 * 社交Login
 */
export const _socialLogin = createAsyncThunk(
  'socialAuth/socialLogin',
  async (credentials: SocialLoginCredentials, { rejectWithValue }) => {
    try {
      const _response = await socialAuthService.socialLogin(credentials);
      return response;
    } catch (error: unknown) {
      return rejectWithValue(error.message || '社交登錄Failed');
    }
  }
);

/**
 * Get社交Login URL
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
      return rejectWithValue(error.message || 'Get社交登錄 URL Failed');
    }
  }
);

/**
 * Handle社交LoginCallback
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
      return rejectWithValue(error.message || 'Handle社交登錄回調Failed');
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
      return rejectWithValue(error.message || '鏈接社交帳戶Failed');
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
      return rejectWithValue(error.message || '解除鏈接社交帳戶Failed');
    }
  }
);

/**
 * Get已鏈接的社交帳戶
 */
export const _getLinkedSocialAccounts = createAsyncThunk(
  'socialAuth/getLinkedSocialAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const _accounts = await socialAuthService.getLinkedSocialAccounts();
      return accounts;
    } catch (error: unknown) {
      return rejectWithValue(error.message || 'Get已鏈接社交帳戶Failed');
    }
  }
);

/**
 * Check社交帳戶YesNo已鏈接
 */
export const _checkSocialAccountLinked = createAsyncThunk(
  'socialAuth/checkSocialAccountLinked',
  async (provider: SocialProvider, { rejectWithValue }) => {
    try {
      const _isLinked = await socialAuthService.isSocialAccountLinked(provider);
      return { provider, isLinked };
    } catch (error: unknown) {
      return rejectWithValue(error.message || 'Check社交帳戶鏈接狀態Failed');
    }
  }
);

/**
 * Get社交UserInformation
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
      return rejectWithValue(error.message || 'Get社交用戶信息Failed');
    }
  }
);

/**
 * Check社交LoginConfigure
 */
export const _checkSocialLoginConfig = createAsyncThunk(
  'socialAuth/checkSocialLoginConfig',
  async (_, { rejectWithValue }) => {
    try {
      const _config = socialAuthService.getConfig();
      const configuredProviders: SocialProvider[] = [];

      // Check每個提供商YesNo已Configure
      (Object.keys(config) as SocialProvider[]).forEach(provider => {
        if (socialAuthService.isProviderConfigured(provider)) {
          configuredProviders.push(provider);
        }
      });

      return configuredProviders;
    } catch (error: unknown) {
      return rejectWithValue(error.message || 'Check社交登錄ConfigureFailed');
    }
  }
);

// Slice
const _socialAuthSlice = createSlice({
  name: 'socialAuth',
  initialState,
  reducers: {
    // Clear社交LoginError
    clearSocialLoginError: state => {
      state.socialLoginError = null;
    },

    // Clear社交AuthenticateResponse
    clearSocialAuthResponse: state => {
      state.socialAuthResponse = null;
    },

    // Clear帳戶Error
    clearAccountsError: state => {
      state.accountsError = null;
    },

    // Clear URL Error
    clearUrlsError: state => {
      state.urlsError = null;
    },

    // ClearConfigureError
    clearConfigError: state => {
      state.configError = null;
    },

    // Settings社交UserInformation
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

    // Reset社交AuthenticateStatus
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
      // 將新鏈接的帳戶Add到List中
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
      // 從List中Remove解除鏈接的帳戶
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

// Export actions
export const {
  clearSocialLoginError,
  clearSocialAuthResponse,
  clearAccountsError,
  clearUrlsError,
  clearConfigError,
  setSocialUserInfo,
  resetSocialAuth,
} = socialAuthSlice.actions;

// Export reducer
export default socialAuthSlice.reducer;

// ExportSelect器
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
