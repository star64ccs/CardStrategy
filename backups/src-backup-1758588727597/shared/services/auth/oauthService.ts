import { api } from '../../../core/utils/api';
import { logger } from '../../../core/utils/logger';

export interface OAuthProvider {
  name: string;
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string[];
  redirectUri: string;
}

export interface OAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  id_token?: string;
}

export interface OAuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: string;
  verified: boolean;
}

export interface OAuthConfig {
  providers: Record<string, OAuthProvider>;
  defaultProvider: string;
  jwtSecret: string;
  jwtExpiresIn: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

export class OAuthService {
  private readonly config: OAuthConfig;
  private isInitialized = false;

  constructor() {
    this.config = {
      providers: {},
      defaultProvider: 'google',
      jwtSecret: process.env.JWT_SECRET || 'default-secret',
      jwtExpiresIn: '7d',
    };
  }

  isAvailable(): boolean {
    return this.isInitialized && Object.keys(this.config.providers).length > 0;
  }

  async initialize(): Promise<ApiResponse> {
    try {
      logger.info('初始化 OAuth 服務');

      // 配置 Google OAuth
      if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        this.config.providers.google = {
          name: 'Google',
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token',
          userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
          scope: ['openid', 'email', 'profile'],
          redirectUri:
            process.env.GOOGLE_REDIRECT_URI ||
            'http://localhost:3000/auth/google/callback',
        };
      }

      // 配置 Facebook OAuth
      if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
        this.config.providers.facebook = {
          name: 'Facebook',
          clientId: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          authorizationUrl: 'https://www.facebook.com/v12.0/dialog/oauth',
          tokenUrl: 'https://graph.facebook.com/v12.0/oauth/access_token',
          userInfoUrl: 'https://graph.facebook.com/me',
          scope: ['email', 'public_profile'],
          redirectUri:
            process.env.FACEBOOK_REDIRECT_URI ||
            'http://localhost:3000/auth/facebook/callback',
        };
      }

      // 配置 Apple OAuth
      if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID) {
        this.config.providers.apple = {
          name: 'Apple',
          clientId: process.env.APPLE_CLIENT_ID,
          clientSecret: process.env.APPLE_CLIENT_SECRET || '',
          authorizationUrl: 'https://appleid.apple.com/auth/authorize',
          tokenUrl: 'https://appleid.apple.com/auth/token',
          userInfoUrl: 'https://appleid.apple.com/auth/userinfo',
          scope: ['name', 'email'],
          redirectUri:
            process.env.APPLE_REDIRECT_URI ||
            'http://localhost:3000/auth/apple/callback',
        };
      }

      // 配置 GitHub OAuth
      if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
        this.config.providers.github = {
          name: 'GitHub',
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          authorizationUrl: 'https://github.com/login/oauth/authorize',
          tokenUrl: 'https://github.com/login/oauth/access_token',
          userInfoUrl: 'https://api.github.com/user',
          scope: ['read:user', 'user:email'],
          redirectUri:
            process.env.GITHUB_REDIRECT_URI ||
            'http://localhost:3000/auth/github/callback',
        };
      }

      this.isInitialized = true;
      logger.info(
        `OAuth 服務初始化完成，已配置 ${Object.keys(this.config.providers).length} 個提供商`
      );

      return {
        success: true,
        data: {
          providers: Object.keys(this.config.providers),
          defaultProvider: this.config.defaultProvider,
        },
        message: 'OAuth 服務初始化成功',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('OAuth 服務初始化失敗:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  getAuthorizationUrl(provider: string, state?: string): ApiResponse<string> {
    try {
      const oauthProvider = this.config.providers[provider];
      if (!oauthProvider) {
        return {
          success: false,
          error: `不支持的 OAuth 提供商: ${provider}`,
          timestamp: Date.now(),
        };
      }

      const params = new URLSearchParams({
        client_id: oauthProvider.clientId,
        redirect_uri: oauthProvider.redirectUri,
        scope: oauthProvider.scope.join(' '),
        response_type: 'code',
        ...(state && { state }),
      });

      const authUrl = `${oauthProvider.authorizationUrl}?${params.toString()}`;

      logger.info(`生成 ${provider} 授權 URL`);

      return {
        success: true,
        data: authUrl,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`生成 ${provider} 授權 URL 失敗:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  async exchangeCodeForToken(
    provider: string,
    code: string
  ): Promise<ApiResponse<OAuthToken>> {
    try {
      const oauthProvider = this.config.providers[provider];
      if (!oauthProvider) {
        return {
          success: false,
          error: `不支持的 OAuth 提供商: ${provider}`,
          timestamp: Date.now(),
        };
      }

      const tokenData = {
        client_id: oauthProvider.clientId,
        client_secret: oauthProvider.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: oauthProvider.redirectUri,
      };

      const response = await api.post(oauthProvider.tokenUrl, tokenData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
      });

      if (!response.success || !response.data) {
        return {
          success: false,
          error: '獲取訪問令牌失敗',
          timestamp: Date.now(),
        };
      }

      const token: OAuthToken = response.data as OAuthToken;
      logger.info(`成功獲取 ${provider} 訪問令牌`);

      return {
        success: true,
        data: token,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`交換 ${provider} 代碼失敗:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  async getUserInfo(
    provider: string,
    accessToken: string
  ): Promise<ApiResponse<OAuthUser>> {
    try {
      const oauthProvider = this.config.providers[provider];
      if (!oauthProvider) {
        return {
          success: false,
          error: `不支持的 OAuth 提供商: ${provider}`,
          timestamp: Date.now(),
        };
      }

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      };

      // GitHub 需要特殊的 Accept 頭
      if (provider === 'github') {
        headers['Accept'] = 'application/vnd.github.v3+json';
      }

      const response = await api.get(oauthProvider.userInfoUrl, { headers });

      if (!response.success || !response.data) {
        return {
          success: false,
          error: '獲取用戶信息失敗',
          timestamp: Date.now(),
        };
      }

      const userData = response.data as any;
      const user: OAuthUser = {
        id: userData.id || userData.sub,
        email: userData.email,
        name: userData.name || userData.login,
        picture: userData.picture || userData.avatar_url,
        provider,
        verified: userData.verified || userData.email_verified || false,
      };

      logger.info(`成功獲取 ${provider} 用戶信息: ${user.email}`);

      return {
        success: true,
        data: user,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`獲取 ${provider} 用戶信息失敗:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  async refreshToken(
    provider: string,
    refreshToken: string
  ): Promise<ApiResponse<OAuthToken>> {
    try {
      const oauthProvider = this.config.providers[provider];
      if (!oauthProvider) {
        return {
          success: false,
          error: `不支持的 OAuth 提供商: ${provider}`,
          timestamp: Date.now(),
        };
      }

      const tokenData = {
        client_id: oauthProvider.clientId,
        client_secret: oauthProvider.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      };

      const response = await api.post(oauthProvider.tokenUrl, tokenData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
      });

      if (!response.success || !response.data) {
        return {
          success: false,
          error: '刷新令牌失敗',
          timestamp: Date.now(),
        };
      }

      const token: OAuthToken = response.data as OAuthToken;
      logger.info(`成功刷新 ${provider} 訪問令牌`);

      return {
        success: true,
        data: token,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`刷新 ${provider} 令牌失敗:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: Date.now(),
      };
    }
  }

  getAvailableProviders(): Record<string, boolean> {
    return Object.keys(this.config.providers).reduce(
      (acc, provider) => {
        acc[provider] = true;
        return acc;
      },
      {} as Record<string, boolean>
    );
  }

  async getServiceStats(): Promise<ApiResponse> {
    return {
      success: true,
      data: {
        initialized: this.isInitialized,
        providers: Object.keys(this.config.providers),
        defaultProvider: this.config.defaultProvider,
        totalProviders: Object.keys(this.config.providers).length,
      },
      timestamp: Date.now(),
    };
  }
}

export const oauthService = new OAuthService();
