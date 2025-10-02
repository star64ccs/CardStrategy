import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import type {
  SocialProvider,
  SocialLoginCredentials,
  SocialAuthResponse,
  SocialAccountLink,
  SocialUserInfo,
} from '../../../core/types';
import { logger } from '../../../core/utils/logger';
import { useAppDispatch } from '../../../store/hooks';
import {
  socialLogin,
  getSocialLoginUrl,
  handleSocialCallback,
  linkSocialAccount,
  unlinkSocialAccount,
  getLinkedSocialAccounts,
  checkSocialAccountLinked,
  getSocialUserInfo,
  checkSocialLoginConfig,
  selectConfiguredProviders,
  selectIsSocialLoggingIn,
  selectSocialLoginError,
  selectSocialAuthResponse,
  selectLinkedAccounts,
  selectIsLoadingAccounts,
  selectAccountsError,
  selectSocialLoginUrls,
  selectIsLoadingUrls,
  selectUrlsError,
  selectIsCheckingConfig,
  selectConfigError,
  clearSocialLoginError,
  clearSocialAuthResponse,
  clearAccountsError,
  clearUrlsError,
  clearConfigError,
  resetSocialAuth,
} from '../../../store/slices/socialAuthSlice';

interface UseSocialAuthOptions {
  onLoginSuccess?: (response: SocialAuthResponse) => void;
  onLoginError?: (error: string) => void;
  onAccountLinked?: (account: SocialAccountLink) => void;
  onAccountUnlinked?: (provider: SocialProvider) => void;
  autoCheckConfig?: boolean;
  autoLoadAccounts?: boolean;
}

interface UseSocialAuthReturn {
  // Status
  isSocialLoggingIn: boolean;
  socialLoginError: string | null;
  socialAuthResponse: SocialAuthResponse | null;
  linkedAccounts: SocialAccountLink[];
  isLoadingAccounts: boolean;
  accountsError: string | null;
  socialLoginUrls: Record<SocialProvider, string>;
  isLoadingUrls: boolean;
  urlsError: string | null;
  configuredProviders: SocialProvider[];
  isCheckingConfig: boolean;
  configError: string | null;

  // OperationMethod
  login: (credentials: SocialLoginCredentials) => Promise<SocialAuthResponse>;
  getLoginUrl: (
    provider: SocialProvider,
    redirectUri?: string
  ) => Promise<string>;
  handleCallback: (
    provider: SocialProvider,
    code: string,
    state?: string
  ) => Promise<SocialAuthResponse>;
  linkAccount: (
    credentials: SocialLoginCredentials
  ) => Promise<SocialAccountLink>;
  unlinkAccount: (provider: SocialProvider) => Promise<void>;
  loadLinkedAccounts: () => Promise<SocialAccountLink[]>;
  checkAccountLinked: (provider: SocialProvider) => Promise<boolean>;
  getUserInfo: (
    provider: SocialProvider,
    accessToken: string
  ) => Promise<SocialUserInfo>;
  checkConfig: () => Promise<SocialProvider[]>;

  // ClearMethod
  clearError: () => void;
  clearResponse: () => void;
  clearAccountsError: () => void;
  clearUrlsError: () => void;
  clearConfigError: () => void;
  reset: () => void;

  // ToolMethod
  isProviderConfigured: (provider: SocialProvider) => boolean;
  isAccountLinked: (provider: SocialProvider) => boolean;
  getProviderName: (provider: SocialProvider) => string;
}

const PROVIDER_NAMES: Record<SocialProvider, string> = {
  google: 'Google',
  facebook: 'Facebook',
  apple: 'Apple',
  twitter: 'Twitter',
  github: 'GitHub',
  discord: 'Discord',
  line: 'LINE',
  kakao: 'Kakao',
};

export const _useSocialAuth = (
  options: UseSocialAuthOptions = {}
): UseSocialAuthReturn => {
  const _dispatch = useAppDispatch();
  const {
    onLoginSuccess,
    onLoginError,
    onAccountLinked,
    onAccountUnlinked,
    autoCheckConfig = true,
    autoLoadAccounts = true,
  } = options;

  // 從 Redux GetStatus
  const _isSocialLoggingIn = useSelector(selectIsSocialLoggingIn);
  const _socialLoginError = useSelector(selectSocialLoginError);
  const _socialAuthResponse = useSelector(selectSocialAuthResponse);
  const _linkedAccounts = useSelector(selectLinkedAccounts);
  const _isLoadingAccounts = useSelector(selectIsLoadingAccounts);
  const _accountsError = useSelector(selectAccountsError);
  const _socialLoginUrls = useSelector(selectSocialLoginUrls);
  const _isLoadingUrls = useSelector(selectIsLoadingUrls);
  const _urlsError = useSelector(selectUrlsError);
  const _configuredProviders = useSelector(selectConfiguredProviders);
  const _isCheckingConfig = useSelector(selectIsCheckingConfig);
  const _configError = useSelector(selectConfigError);

  // LocalStatus
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize
  useEffect(() => {
    if (!isInitialized) {
      if (autoCheckConfig) {
        checkConfig();
      }
      if (autoLoadAccounts) {
        loadLinkedAccounts();
      }
      setIsInitialized(true);
    }
  }, [isInitialized, autoCheckConfig, autoLoadAccounts]);

  // HandleLoginSuccess
  useEffect(() => {
    if (socialAuthResponse && onLoginSuccess) {
      onLoginSuccess(socialAuthResponse);
    }
  }, [socialAuthResponse, onLoginSuccess]);

  // HandleLoginError
  useEffect(() => {
    if (socialLoginError && onLoginError) {
      onLoginError(socialLoginError);
    }
  }, [socialLoginError, onLoginError]);

  // Handle帳戶Error
  useEffect(() => {
    if (accountsError) {
      logger.error('社交帳戶Error:', { error: accountsError });
    }
  }, [accountsError]);

  // Handle URL Error
  useEffect(() => {
    if (urlsError) {
      logger.error('社交登錄 URL Error:', { error: urlsError });
    }
  }, [urlsError]);

  // HandleConfigureError
  useEffect(() => {
    if (configError) {
      logger.error('社交登錄ConfigureError:', { error: configError });
    }
  }, [configError]);

  // 社交Login
  const _login = useCallback(
    async (
      credentials: SocialLoginCredentials
    ): Promise<SocialAuthResponse> => {
      try {
        const _response = await dispatch(socialLogin(credentials)).unwrap();
        logger.info('社交登錄Success:', { provider: credentials.provider });
        return response;
      } catch (error: unknown) {
        logger.error('社交登錄Failed:', {
          error,
          provider: credentials.provider,
        });
        throw error;
      }
    },
    [dispatch]
  );

  // GetLogin URL
  const _getLoginUrl = useCallback(
    async (provider: SocialProvider, redirectUri?: string): Promise<string> => {
      try {
        const { url } = await dispatch(
          getSocialLoginUrl({ provider, redirectUri })
        ).unwrap();
        logger.info('Get社交登錄 URL Success:', { provider });
        return url;
      } catch (error: unknown) {
        logger.error('Get社交登錄 URL Failed:', { error, provider });
        throw error;
      }
    },
    [dispatch]
  );

  // HandleCallback
  const _handleCallback = useCallback(
    async (
      provider: SocialProvider,
      code: string,
      state?: string
    ): Promise<SocialAuthResponse> => {
      try {
        const _response = await dispatch(
          handleSocialCallback({ provider, code, state })
        ).unwrap();
        logger.info('社交登錄回調HandleSuccess:', { provider });
        return response;
      } catch (error: unknown) {
        logger.error('社交登錄回調HandleFailed:', { error, provider });
        throw error;
      }
    },
    [dispatch]
  );

  // 鏈接帳戶
  const _linkAccount = useCallback(
    async (credentials: SocialLoginCredentials): Promise<SocialAccountLink> => {
      try {
        const _account = await dispatch(
          linkSocialAccount(credentials)
        ).unwrap();
        logger.info('社交帳戶鏈接Success:', { provider: credentials.provider });
        onAccountLinked?.(account);
        return account;
      } catch (error: unknown) {
        logger.error('社交帳戶鏈接Failed:', {
          error,
          provider: credentials.provider,
        });
        throw error;
      }
    },
    [dispatch, onAccountLinked]
  );

  // 解除鏈接帳戶
  const _unlinkAccount = useCallback(
    async (provider: SocialProvider): Promise<void> => {
      try {
        await dispatch(unlinkSocialAccount(provider)).unwrap();
        logger.info('社交帳戶解除鏈接Success:', { provider });
        onAccountUnlinked?.(provider);
      } catch (error: unknown) {
        logger.error('社交帳戶解除鏈接Failed:', { error, provider });
        throw error;
      }
    },
    [dispatch, onAccountUnlinked]
  );

  // 加載已鏈接帳戶
  const _loadLinkedAccounts = useCallback(async (): Promise<
    SocialAccountLink[]
  > => {
    try {
      const _accounts = await dispatch(getLinkedSocialAccounts()).unwrap();
      logger.info('已鏈接社交帳戶加載Success:', { count: accounts.length });
      return accounts;
    } catch (error: unknown) {
      logger.error('加載已鏈接社交帳戶Failed:', { error });
      throw error;
    }
  }, [dispatch]);

  // Check帳戶YesNo已鏈接
  const _checkAccountLinked = useCallback(
    async (provider: SocialProvider): Promise<boolean> => {
      try {
        const { isLinked } = await dispatch(
          checkSocialAccountLinked(provider)
        ).unwrap();
        logger.info('檢查社交帳戶鏈接狀態:', { provider, isLinked });
        return isLinked;
      } catch (error: unknown) {
        logger.error('Check社交帳戶鏈接狀態Failed:', { error, provider });
        throw error;
      }
    },
    [dispatch]
  );

  // GetUserInformation
  const _getUserInfo = useCallback(
    async (
      provider: SocialProvider,
      accessToken: string
    ): Promise<SocialUserInfo> => {
      try {
        const { userInfo } = await dispatch(
          getSocialUserInfo({ provider, accessToken })
        ).unwrap();
        logger.info('Get社交用戶信息Success:', { provider });
        return userInfo;
      } catch (error: unknown) {
        logger.error('Get社交用戶信息Failed:', { error, provider });
        throw error;
      }
    },
    [dispatch]
  );

  // CheckConfigure
  const _checkConfig = useCallback(async (): Promise<SocialProvider[]> => {
    try {
      const _providers = await dispatch(checkSocialLoginConfig()).unwrap();
      logger.info('社交登錄配置檢查完成:', { configuredProviders: providers });
      return providers;
    } catch (error: unknown) {
      logger.error('Check社交登錄ConfigureFailed:', { error });
      throw error;
    }
  }, [dispatch]);

  // ClearError
  const _clearError = useCallback(() => {
    dispatch(clearSocialLoginError());
  }, [dispatch]);

  // ClearResponse
  const _clearResponse = useCallback(() => {
    dispatch(clearSocialAuthResponse());
  }, [dispatch]);

  // Clear帳戶Error
  const _clearAccountsErrorInternal = useCallback(() => {
    dispatch(clearAccountsError());
  }, [dispatch]);

  // Clear URL Error
  const _clearUrlsErrorInternal = useCallback(() => {
    dispatch(clearUrlsError());
  }, [dispatch]);

  // ClearConfigureError
  const _clearConfigErrorInternal = useCallback(() => {
    dispatch(clearConfigError());
  }, [dispatch]);

  // Reset
  const _reset = useCallback(() => {
    dispatch(resetSocialAuth());
  }, [dispatch]);

  // Check提供商YesNo已Configure
  const _isProviderConfigured = useCallback(
    (provider: SocialProvider): boolean => {
      return configuredProviders.includes(provider);
    },
    [configuredProviders]
  );

  // Check帳戶YesNo已鏈接
  const _isAccountLinked = useCallback(
    (provider: SocialProvider): boolean => {
      return linkedAccounts.some(account => account.provider === provider);
    },
    [linkedAccounts]
  );

  // Get提供商名稱
  const _getProviderName = useCallback((provider: SocialProvider): string => {
    return PROVIDER_NAMES[provider] || provider;
  }, []);

  return {
    // Status
    isSocialLoggingIn,
    socialLoginError,
    socialAuthResponse,
    linkedAccounts,
    isLoadingAccounts,
    accountsError,
    socialLoginUrls,
    isLoadingUrls,
    urlsError,
    configuredProviders,
    isCheckingConfig,
    configError,

    // OperationMethod
    login,
    getLoginUrl,
    handleCallback,
    linkAccount,
    unlinkAccount,
    loadLinkedAccounts,
    checkAccountLinked,
    getUserInfo,
    checkConfig,

    // ClearMethod
    clearError,
    clearResponse,
    clearAccountsError: clearAccountsErrorInternal,
    clearUrlsError: clearUrlsErrorInternal,
    clearConfigError: clearConfigErrorInternal,
    reset,

    // ToolMethod
    isProviderConfigured,
    isAccountLinked,
    getProviderName,
  };
};

export default useSocialAuth;
