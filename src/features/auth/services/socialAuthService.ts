import type {
  SocialProvider,
  SocialLoginCredentials,
  SocialAuthResponse,
  SocialAccountLink,
  SocialLoginConfig,
  SocialUserInfo,
} from '../../../core/types';
import { api } from '../../../core/utils/api';
import { logger } from '../../../core/utils/logger';

/**
 * 社交登錄服務
 * 處理多平台社交登錄功能
 */
export class SocialAuthService {
  private static instance: SocialAuthService;
  private readonly config: SocialLoginConfig;

  private constructor() {
    // 初始化社交登錄配置
    this.config = this.loadSocialLoginConfig();
  }

  static getInstance(): SocialAuthService {
    if (!SocialAuthService.instance) {
      SocialAuthService.instance = new SocialAuthService();
    }
    return SocialAuthService.instance;
  }

  /**
   * 社交登錄
   */
  async socialLogin(
    credentials: SocialLoginCredentials
  ): Promise<SocialAuthResponse> {
    try {
      logger.info('社交登錄嘗試:', {
        provider: credentials.provider,
        email: credentials.userInfo?.email,
      });

      // 驗證社交登錄憑證
      this.validateSocialCredentials(credentials);

      // 發送社交登錄請求
      const _response = await api.post<SocialAuthResponse>(
        '/auth/social/login',
        credentials
      );

      if (response.success && response.data) {
        logger.info('社交登錄成功:', {
          provider: credentials.provider,
          userId: response.data.user.id,
          isNewUser: response.data.isNewUser,
        });
        return response.data;
      } else {
        throw new Error('社交登錄失敗');
      }
    } catch (error) {
      logger.error('社交登錄失敗:', {
        error,
        provider: credentials.provider,
        email: credentials.userInfo?.email,
      });
      throw error;
    }
  }

  /**
   * 獲取社交登錄 URL
   */
  async getSocialLoginUrl(
    provider: SocialProvider,
    redirectUri?: string
  ): Promise<string> {
    try {
      logger.info('獲取社交登錄 URL:', { provider });

      const _response = await api.get<{ url: string }>(
        `/auth/social/${provider}/url`,
        {
          params: { redirectUri },
        }
      );

      if (response.success && response.data) {
        logger.info('社交登錄 URL 獲取成功:', { provider });
        return response.data.url;
      } else {
        throw new Error('獲取社交登錄 URL 失敗');
      }
    } catch (error) {
      logger.error('獲取社交登錄 URL 失敗:', { error, provider });
      throw error;
    }
  }

  /**
   * 處理社交登錄回調
   */
  async handleSocialCallback(
    provider: SocialProvider,
    code: string,
    state?: string
  ): Promise<SocialAuthResponse> {
    try {
      logger.info('處理社交登錄回調:', { provider });

      const _response = await api.post<SocialAuthResponse>(
        '/auth/social/callback',
        {
          provider,
          code,
          state,
        }
      );

      if (response.success && response.data) {
        logger.info('社交登錄回調處理成功:', {
          provider,
          userId: response.data.user.id,
        });
        return response.data;
      } else {
        throw new Error('社交登錄回調處理失敗');
      }
    } catch (error) {
      logger.error('社交登錄回調處理失敗:', { error, provider });
      throw error;
    }
  }

  /**
   * 鏈接社交帳戶
   */
  async linkSocialAccount(
    credentials: SocialLoginCredentials
  ): Promise<SocialAccountLink> {
    try {
      logger.info('鏈接社交帳戶:', {
        provider: credentials.provider,
        email: credentials.userInfo?.email,
      });

      const _response = await api.post<SocialAccountLink>(
        '/auth/social/link',
        credentials
      );

      if (response.success && response.data) {
        logger.info('社交帳戶鏈接成功:', {
          provider: credentials.provider,
          accountId: response.data.id,
        });
        return response.data;
      } else {
        throw new Error('社交帳戶鏈接失敗');
      }
    } catch (error) {
      logger.error('社交帳戶鏈接失敗:', {
        error,
        provider: credentials.provider,
      });
      throw error;
    }
  }

  /**
   * 解除鏈接社交帳戶
   */
  async unlinkSocialAccount(provider: SocialProvider): Promise<void> {
    try {
      logger.info('解除鏈接社交帳戶:', { provider });

      const _response = await api.delete(`/auth/social/unlink/${provider}`);

      if (response.success) {
        logger.info('社交帳戶解除鏈接成功:', { provider });
      } else {
        throw new Error('社交帳戶解除鏈接失敗');
      }
    } catch (error) {
      logger.error('社交帳戶解除鏈接失敗:', { error, provider });
      throw error;
    }
  }

  /**
   * 獲取已鏈接的社交帳戶
   */
  async getLinkedSocialAccounts(): Promise<SocialAccountLink[]> {
    try {
      logger.info('獲取已鏈接的社交帳戶');

      const _response = await api.get<SocialAccountLink[]>(
        '/auth/social/accounts'
      );

      if (response.success && response.data) {
        logger.info('已鏈接社交帳戶獲取成功:', {
          count: response.data.length,
        });
        return response.data;
      } else {
        throw new Error('獲取已鏈接社交帳戶失敗');
      }
    } catch (error) {
      logger.error('獲取已鏈接社交帳戶失敗:', { error });
      throw error;
    }
  }

  /**
   * 檢查社交帳戶是否已鏈接
   */
  async isSocialAccountLinked(provider: SocialProvider): Promise<boolean> {
    try {
      const _accounts = await this.getLinkedSocialAccounts();
      return accounts.some(account => account.provider === provider);
    } catch (error) {
      logger.error('檢查社交帳戶鏈接狀態失敗:', { error, provider });
      return false;
    }
  }

  /**
   * 獲取社交用戶信息
   */
  async getSocialUserInfo(
    provider: SocialProvider,
    accessToken: string
  ): Promise<SocialUserInfo> {
    try {
      logger.info('獲取社交用戶信息:', { provider });

      const _response = await api.get<SocialUserInfo>(
        `/auth/social/${provider}/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.success && response.data) {
        logger.info('社交用戶信息獲取成功:', {
          provider,
          email: response.data.email,
        });
        return response.data;
      } else {
        throw new Error('獲取社交用戶信息失敗');
      }
    } catch (error) {
      logger.error('獲取社交用戶信息失敗:', { error, provider });
      throw error;
    }
  }

  /**
   * 驗證社交登錄憑證
   */
  private validateSocialCredentials(credentials: SocialLoginCredentials): void {
    if (!credentials.provider) {
      throw new Error('社交登錄提供商不能為空');
    }

    if (!credentials.accessToken) {
      throw new Error('社交登錄訪問令牌不能為空');
    }

    if (!this.isValidProvider(credentials.provider)) {
      throw new Error(`不支持的社交登錄提供商: ${credentials.provider}`);
    }
  }

  /**
   * 檢查是否為有效的社交登錄提供商
   */
  private isValidProvider(provider: string): provider is SocialProvider {
    const validProviders: SocialProvider[] = [
      'google',
      'facebook',
      'apple',
      'twitter',
      'github',
      'discord',
      'line',
      'kakao',
    ];
    return validProviders.includes(provider as SocialProvider);
  }

  /**
   * 加載社交登錄配置
   */
  private loadSocialLoginConfig(): SocialLoginConfig {
    // 從環境變量或配置文件加載
    return {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
      },
      facebook: {
        appId: process.env.FACEBOOK_APP_ID || '',
        appSecret: process.env.FACEBOOK_APP_SECRET || '',
        redirectUri: process.env.FACEBOOK_REDIRECT_URI || '',
      },
      apple: {
        clientId: process.env.APPLE_CLIENT_ID || '',
        teamId: process.env.APPLE_TEAM_ID || '',
        keyId: process.env.APPLE_KEY_ID || '',
        privateKey: process.env.APPLE_PRIVATE_KEY || '',
        redirectUri: process.env.APPLE_REDIRECT_URI || '',
      },
      twitter: {
        consumerKey: process.env.TWITTER_CONSUMER_KEY || '',
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET || '',
        redirectUri: process.env.TWITTER_REDIRECT_URI || '',
      },
      github: {
        clientId: process.env.GITHUB_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        redirectUri: process.env.GITHUB_REDIRECT_URI || '',
      },
      discord: {
        clientId: process.env.DISCORD_CLIENT_ID || '',
        clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
        redirectUri: process.env.DISCORD_REDIRECT_URI || '',
      },
      line: {
        channelId: process.env.LINE_CHANNEL_ID || '',
        channelSecret: process.env.LINE_CHANNEL_SECRET || '',
        redirectUri: process.env.LINE_REDIRECT_URI || '',
      },
      kakao: {
        clientId: process.env.KAKAO_CLIENT_ID || '',
        clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
        redirectUri: process.env.KAKAO_REDIRECT_URI || '',
      },
    };
  }

  /**
   * 獲取社交登錄配置
   */
  getConfig(): SocialLoginConfig {
    return this.config;
  }

  /**
   * 檢查社交登錄提供商是否已配置
   */
  isProviderConfigured(provider: SocialProvider): boolean {
    const _providerConfig = this.config[provider];
    if (!providerConfig) return false;

    // 檢查必要的配置項
    switch (provider) {
      case 'google': {
        const _config = providerConfig as typeof this.config.google;
        return !!(config.clientId && config.clientSecret);
      }
      case 'facebook': {
        const _config = providerConfig as typeof this.config.facebook;
        return !!(config.appId && config.appSecret);
      }
      case 'apple': {
        const _config = providerConfig as typeof this.config.apple;
        return !!(
          config.clientId &&
          config.teamId &&
          config.keyId &&
          config.privateKey
        );
      }
      case 'twitter': {
        const _config = providerConfig as typeof this.config.twitter;
        return !!(config.consumerKey && config.consumerSecret);
      }
      case 'github': {
        const _config = providerConfig as typeof this.config.github;
        return !!(config.clientId && config.clientSecret);
      }
      case 'discord': {
        const _config = providerConfig as typeof this.config.discord;
        return !!(config.clientId && config.clientSecret);
      }
      case 'line': {
        const _config = providerConfig as typeof this.config.line;
        return !!(config.channelId && config.channelSecret);
      }
      case 'kakao': {
        const _config = providerConfig as typeof this.config.kakao;
        return !!(config.clientId && config.clientSecret);
      }
      default:
        return false;
    }
  }
}

// 導出單例實例
export const _socialAuthService = SocialAuthService.getInstance();
