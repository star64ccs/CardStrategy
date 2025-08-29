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
  // 狀態
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

  // 操作方法
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

  // 清除方法
  clearError: () => void;
  clearResponse: () => void;
  clearAccountsError: () => void;
  clearUrlsError: () => void;
  clearConfigError: () => void;
  reset: () => void;

  // 工具方法
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

  // 從 Redux 獲取狀態
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

  // 本地狀態
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化
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

  // 處理登錄成功
  useEffect(() => {
    if (socialAuthResponse && onLoginSuccess) {
      onLoginSuccess(socialAuthResponse);
    }
  }, [socialAuthResponse, onLoginSuccess]);

  // 處理登錄錯誤
  useEffect(() => {
    if (socialLoginError && onLoginError) {
      onLoginError(socialLoginError);
    }
  }, [socialLoginError, onLoginError]);

  // 處理帳戶錯誤
  useEffect(() => {
    if (accountsError) {
      logger.error('社交帳戶錯誤:', { error: accountsError });
    }
  }, [accountsError]);

  // 處理 URL 錯誤
  useEffect(() => {
    if (urlsError) {
      logger.error('社交登錄 URL 錯誤:', { error: urlsError });
    }
  }, [urlsError]);

  // 處理配置錯誤
  useEffect(() => {
    if (configError) {
      logger.error('社交登錄配置錯誤:', { error: configError });
    }
  }, [configError]);

  // 社交登錄
  const _login = useCallback(
    async (
      credentials: SocialLoginCredentials
    ): Promise<SocialAuthResponse> => {
      try {
        const _response = await dispatch(socialLogin(credentials)).unwrap();
        logger.info('社交登錄成功:', { provider: credentials.provider });
        return response;
      } catch (error: unknown) {
        logger.error('社交登錄失敗:', {
          error,
          provider: credentials.provider,
        });
        throw error;
      }
    },
    [dispatch]
  );

  // 獲取登錄 URL
  const _getLoginUrl = useCallback(
    async (provider: SocialProvider, redirectUri?: string): Promise<string> => {
      try {
        const { url } = await dispatch(
          getSocialLoginUrl({ provider, redirectUri })
        ).unwrap();
        logger.info('獲取社交登錄 URL 成功:', { provider });
        return url;
      } catch (error: unknown) {
        logger.error('獲取社交登錄 URL 失敗:', { error, provider });
        throw error;
      }
    },
    [dispatch]
  );

  // 處理回調
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
        logger.info('社交登錄回調處理成功:', { provider });
        return response;
      } catch (error: unknown) {
        logger.error('社交登錄回調處理失敗:', { error, provider });
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
        logger.info('社交帳戶鏈接成功:', { provider: credentials.provider });
        onAccountLinked?.(account);
        return account;
      } catch (error: unknown) {
        logger.error('社交帳戶鏈接失敗:', {
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
        logger.info('社交帳戶解除鏈接成功:', { provider });
        onAccountUnlinked?.(provider);
      } catch (error: unknown) {
        logger.error('社交帳戶解除鏈接失敗:', { error, provider });
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
      logger.info('已鏈接社交帳戶加載成功:', { count: accounts.length });
      return accounts;
    } catch (error: unknown) {
      logger.error('加載已鏈接社交帳戶失敗:', { error });
      throw error;
    }
  }, [dispatch]);

  // 檢查帳戶是否已鏈接
  const _checkAccountLinked = useCallback(
    async (provider: SocialProvider): Promise<boolean> => {
      try {
        const { isLinked } = await dispatch(
          checkSocialAccountLinked(provider)
        ).unwrap();
        logger.info('檢查社交帳戶鏈接狀態:', { provider, isLinked });
        return isLinked;
      } catch (error: unknown) {
        logger.error('檢查社交帳戶鏈接狀態失敗:', { error, provider });
        throw error;
      }
    },
    [dispatch]
  );

  // 獲取用戶信息
  const _getUserInfo = useCallback(
    async (
      provider: SocialProvider,
      accessToken: string
    ): Promise<SocialUserInfo> => {
      try {
        const { userInfo } = await dispatch(
          getSocialUserInfo({ provider, accessToken })
        ).unwrap();
        logger.info('獲取社交用戶信息成功:', { provider });
        return userInfo;
      } catch (error: unknown) {
        logger.error('獲取社交用戶信息失敗:', { error, provider });
        throw error;
      }
    },
    [dispatch]
  );

  // 檢查配置
  const _checkConfig = useCallback(async (): Promise<SocialProvider[]> => {
    try {
      const _providers = await dispatch(checkSocialLoginConfig()).unwrap();
      logger.info('社交登錄配置檢查完成:', { configuredProviders: providers });
      return providers;
    } catch (error: unknown) {
      logger.error('檢查社交登錄配置失敗:', { error });
      throw error;
    }
  }, [dispatch]);

  // 清除錯誤
  const _clearError = useCallback(() => {
    dispatch(clearSocialLoginError());
  }, [dispatch]);

  // 清除響應
  const _clearResponse = useCallback(() => {
    dispatch(clearSocialAuthResponse());
  }, [dispatch]);

  // 清除帳戶錯誤
  const _clearAccountsErrorInternal = useCallback(() => {
    dispatch(clearAccountsError());
  }, [dispatch]);

  // 清除 URL 錯誤
  const _clearUrlsErrorInternal = useCallback(() => {
    dispatch(clearUrlsError());
  }, [dispatch]);

  // 清除配置錯誤
  const _clearConfigErrorInternal = useCallback(() => {
    dispatch(clearConfigError());
  }, [dispatch]);

  // 重置
  const _reset = useCallback(() => {
    dispatch(resetSocialAuth());
  }, [dispatch]);

  // 檢查提供商是否已配置
  const _isProviderConfigured = useCallback(
    (provider: SocialProvider): boolean => {
      return configuredProviders.includes(provider);
    },
    [configuredProviders]
  );

  // 檢查帳戶是否已鏈接
  const _isAccountLinked = useCallback(
    (provider: SocialProvider): boolean => {
      return linkedAccounts.some(account => account.provider === provider);
    },
    [linkedAccounts]
  );

  // 獲取提供商名稱
  const _getProviderName = useCallback((provider: SocialProvider): string => {
    return PROVIDER_NAMES[provider] || provider;
  }, []);

  return {
    // 狀態
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

    // 操作方法
    login,
    getLoginUrl,
    handleCallback,
    linkAccount,
    unlinkAccount,
    loadLinkedAccounts,
    checkAccountLinked,
    getUserInfo,
    checkConfig,

    // 清除方法
    clearError,
    clearResponse,
    clearAccountsError: clearAccountsErrorInternal,
    clearUrlsError: clearUrlsErrorInternal,
    clearConfigError: clearConfigErrorInternal,
    reset,

    // 工具方法
    isProviderConfigured,
    isAccountLinked,
    getProviderName,
  };
};

export default useSocialAuth;
