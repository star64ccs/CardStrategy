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
 * 社交LoginService
 * Handle多平台社交Login功能
 */
export class SocialAuthService {
  private static instance: SocialAuthService;
  private readonly config: SocialLoginConfig;

  private constructor() {
    // Initialize社交LoginConfigure
    this.config = this.loadSocialLoginConfig();
  }

  static getInstance(): SocialAuthService {
    if (!SocialAuthService.instance) {
      SocialAuthService.instance = new SocialAuthService();
    }
    return SocialAuthService.instance;
  }

  /**
   * 社交Login
   */
  async socialLogin(
    credentials: SocialLoginCredentials
  ): Promise<SocialAuthResponse> {
    try {
      logger.info('社交登錄嘗試:', {
        provider: credentials.provider,
        email: credentials.userInfo?.email,
      });

      // Verify社交Login憑證
      this.validateSocialCredentials(credentials);

      // Send社交LoginRequest
      const _response = await api.post<SocialAuthResponse>(
        '/auth/social/login',
        credentials
      );

      if (response.success && response.data) {
        logger.info('社交登錄Success:', {
          provider: credentials.provider,
          userId: response.data.user.id,
          isNewUser: response.data.isNewUser,
        });
        return response.data;
      } else {
        throw new Error('社交登錄Failed');
      }
    } catch (error) {
      logger.error('社交登錄Failed:', {
        error,
        provider: credentials.provider,
        email: credentials.userInfo?.email,
      });
      throw error;
    }
  }

  /**
   * Get社交Login URL
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
        logger.info('社交登錄 URL GetSuccess:', { provider });
        return response.data.url;
      } else {
        throw new Error('Get社交登錄 URL Failed');
      }
    } catch (error) {
      logger.error('Get社交登錄 URL Failed:', { error, provider });
      throw error;
    }
  }

  /**
   * Handle社交LoginCallback
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
        logger.info('社交登錄回調HandleSuccess:', {
          provider,
          userId: response.data.user.id,
        });
        return response.data;
      } else {
        throw new Error('社交登錄回調HandleFailed');
      }
    } catch (error) {
      logger.error('社交登錄回調HandleFailed:', { error, provider });
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
        logger.info('社交帳戶鏈接Success:', {
          provider: credentials.provider,
          accountId: response.data.id,
        });
        return response.data;
      } else {
        throw new Error('社交帳戶鏈接Failed');
      }
    } catch (error) {
      logger.error('社交帳戶鏈接Failed:', {
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
        logger.info('社交帳戶解除鏈接Success:', { provider });
      } else {
        throw new Error('社交帳戶解除鏈接Failed');
      }
    } catch (error) {
      logger.error('社交帳戶解除鏈接Failed:', { error, provider });
      throw error;
    }
  }

  /**
   * Get已鏈接的社交帳戶
   */
  async getLinkedSocialAccounts(): Promise<SocialAccountLink[]> {
    try {
      logger.info('獲取已鏈接的社交帳戶');

      const _response = await api.get<SocialAccountLink[]>(
        '/auth/social/accounts'
      );

      if (response.success && response.data) {
        logger.info('已鏈接社交帳戶GetSuccess:', {
          count: response.data.length,
        });
        return response.data;
      } else {
        throw new Error('Get已鏈接社交帳戶Failed');
      }
    } catch (error) {
      logger.error('Get已鏈接社交帳戶Failed:', { error });
      throw error;
    }
  }

  /**
   * Check社交帳戶YesNo已鏈接
   */
  async isSocialAccountLinked(provider: SocialProvider): Promise<boolean> {
    try {
      const _accounts = await this.getLinkedSocialAccounts();
      return accounts.some(account => account.provider === provider);
    } catch (error) {
      logger.error('Check社交帳戶鏈接狀態Failed:', { error, provider });
      return false;
    }
  }

  /**
   * Get社交UserInformation
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
        logger.info('社交用戶信息GetSuccess:', {
          provider,
          email: response.data.email,
        });
        return response.data;
      } else {
        throw new Error('Get社交用戶信息Failed');
      }
    } catch (error) {
      logger.error('Get社交用戶信息Failed:', { error, provider });
      throw error;
    }
  }

  /**
   * Verify社交Login憑證
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
   * CheckYesNo為有效的社交Login提供商
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
   * 加載社交LoginConfigure
   */
  private loadSocialLoginConfig(): SocialLoginConfig {
    // 從環境Variable或ConfigureFile加載
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
   * Get社交LoginConfigure
   */
  getConfig(): SocialLoginConfig {
    return this.config;
  }

  /**
   * Check社交Login提供商YesNo已Configure
   */
  isProviderConfigured(provider: SocialProvider): boolean {
    const _providerConfig = this.config[provider];
    if (!providerConfig) return false;

    // Check必要的Configure項
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

// Export單例Instance
export const _socialAuthService = SocialAuthService.getInstance();
