import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';

import type { SocialProvider } from '../../../core/types';
import { SocialLoginCredentials } from '../../../core/types';
import { logger } from '../../../core/utils/logger';
import { useAppDispatch } from '../../../store/hooks';
import {
  socialLogin,
  getSocialLoginUrl,
  handleSocialCallback,
  checkSocialLoginConfig,
  selectConfiguredProviders,
  selectIsSocialLoggingIn,
  selectSocialLoginError,
  selectIsLoadingUrls,
  selectUrlsError,
  selectIsCheckingConfig,
  selectConfigError,
  clearSocialLoginError,
  clearUrlsError,
  clearConfigError,
} from '../../../store/slices/socialAuthSlice';

interface SocialLoginButtonsProps {
  onLoginSuccess?: (response: unknown) => void;
  onLoginError?: (error: string) => void;
  onProviderNotConfigured?: (provider: SocialProvider) => void;
  style?: unknown;
  buttonStyle?: unknown;
  textStyle?: unknown;
  showLabels?: boolean;
  disabled?: boolean;
}

interface SocialProviderConfig {
  name: string;
  icon: string;
  color: string;
  backgroundColor: string;
}

const SOCIAL_PROVIDERS: Record<SocialProvider, SocialProviderConfig> = {
  google: {
    name: 'Google',
    icon: '🔍',
    color: '#FFFFFF',
    backgroundColor: '#4285F4',
  },
  facebook: {
    name: 'Facebook',
    icon: '📘',
    color: '#FFFFFF',
    backgroundColor: '#1877F2',
  },
  apple: {
    name: 'Apple',
    icon: '🍎',
    color: '#FFFFFF',
    backgroundColor: '#000000',
  },
  twitter: {
    name: 'Twitter',
    icon: '🐦',
    color: '#FFFFFF',
    backgroundColor: '#1DA1F2',
  },
  github: {
    name: 'GitHub',
    icon: '🐙',
    color: '#FFFFFF',
    backgroundColor: '#333333',
  },
  discord: {
    name: 'Discord',
    icon: '🎮',
    color: '#FFFFFF',
    backgroundColor: '#5865F2',
  },
  line: {
    name: 'LINE',
    icon: '💬',
    color: '#FFFFFF',
    backgroundColor: '#00B900',
  },
  kakao: {
    name: 'Kakao',
    icon: '💛',
    color: '#000000',
    backgroundColor: '#FEE500',
  },
};

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onLoginSuccess,
  onLoginError,
  onProviderNotConfigured,
  style,
  buttonStyle,
  textStyle,
  showLabels = true,
  disabled = false,
}) => {
  const _dispatch = useAppDispatch();
  const _configuredProviders = useSelector(selectConfiguredProviders);
  const _isSocialLoggingIn = useSelector(selectIsSocialLoggingIn);
  const _socialLoginError = useSelector(selectSocialLoginError);
  const _isLoadingUrls = useSelector(selectIsLoadingUrls);
  const _urlsError = useSelector(selectUrlsError);
  const _isCheckingConfig = useSelector(selectIsCheckingConfig);
  const _configError = useSelector(selectConfigError);

  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(
    null
  );

  useEffect(() => {
    // 檢查社交登錄配置
    dispatch(checkSocialLoginConfig());
  }, [dispatch]);

  useEffect(() => {
    // 處理社交登錄錯誤
    if (socialLoginError) {
      onLoginError?.(socialLoginError);
      dispatch(clearSocialLoginError());
    }
  }, [socialLoginError, onLoginError, dispatch]);

  useEffect(() => {
    // 處理 URL 錯誤
    if (urlsError) {
      Alert.alert('錯誤', urlsError);
      dispatch(clearUrlsError());
    }
  }, [urlsError, dispatch]);

  useEffect(() => {
    // 處理配置錯誤
    if (configError) {
      logger.error('社交登錄配置錯誤:', { error: configError });
      dispatch(clearConfigError());
    }
  }, [configError, dispatch]);

  /**
   * 處理社交登錄
   */
  const _handleSocialLogin = async (provider: SocialProvider) => {
    try {
      setLoadingProvider(provider);

      // 檢查提供商是否已配置
      if (!configuredProviders.includes(provider)) {
        onProviderNotConfigured?.(provider);
        Alert.alert(
          '未配置',
          `${SOCIAL_PROVIDERS[provider].name} 登錄尚未配置`
        );
        return;
      }

      // 獲取社交登錄 URL
      const _result = await dispatch(getSocialLoginUrl({ provider })).unwrap();
      const { url } = result;

      // 打開社交登錄頁面
      const _supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('錯誤', '無法打開登錄頁面');
      }
    } catch (error: unknown) {
      logger.error('社交登錄失敗:', { error, provider });
      Alert.alert('登錄失敗', error.message || '社交登錄失敗');
    } finally {
      setLoadingProvider(null);
    }
  };

  /**
   * 處理社交登錄回調
   */
  const _handleSocialCallbackInternal = async (
    provider: SocialProvider,
    code: string,
    state?: string
  ) => {
    try {
      setLoadingProvider(provider);

      const _response = await dispatch(
        handleSocialCallback({ provider, code, state })
      ).unwrap();

      logger.info('社交登錄成功:', { provider, userId: response.user.id });
      onLoginSuccess?.(response);
    } catch (error: unknown) {
      logger.error('社交登錄回調處理失敗:', { error, provider });
      onLoginError?.(error.message || '社交登錄失敗');
    } finally {
      setLoadingProvider(null);
    }
  };

  /**
   * 渲染社交登錄按鈕
   */
  const _renderSocialButton = (provider: SocialProvider) => {
    const _config = SOCIAL_PROVIDERS[provider];
    const _isConfigured = configuredProviders.includes(provider);
    const _isLoading = loadingProvider === provider || isSocialLoggingIn;
    const _isDisabled = disabled || isLoading || !isConfigured;

    return (
      <TouchableOpacity
        key={provider}
        style={[
          styles.socialButton,
          { backgroundColor: config.backgroundColor },
          isDisabled && styles.disabledButton,
          buttonStyle,
        ]}
        onPress={() => handleSocialLogin(provider)}
        disabled={isDisabled}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator size='small' color={config.color} />
        ) : (
          <>
            <Text style={styles.icon}>{config.icon}</Text>
            {showLabels && (
              <Text
                style={[styles.buttonText, { color: config.color }, textStyle]}
              >
                {config.name}
              </Text>
            )}
          </>
        )}
      </TouchableOpacity>
    );
  };

  if (isCheckingConfig) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size='large' color='#4285F4' />
        <Text style={styles.loadingText}>檢查社交登錄配置...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>使用社交帳戶登錄</Text>

      <View style={styles.buttonsContainer}>
        {Object.keys(SOCIAL_PROVIDERS).map(provider =>
          renderSocialButton(provider as SocialProvider)
        )}
      </View>

      {configuredProviders.length === 0 && (
        <Text style={styles.noProvidersText}>暫無可用的社交登錄選項</Text>
      )}
    </View>
  );
};

const _styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    minHeight: 44,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
  },
  noProvidersText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default SocialLoginButtons;
