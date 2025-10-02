import { logger } from '../../../core/utils/logger';

import type { JWTPayload, JWTToken } from './jwtService';
import { jwtService } from './jwtService';
import type { OAuthUser, OAuthToken } from './oauthService';
import { oauthService } from './oauthService';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: string;
  verified: boolean;
  role?: string;
  permissions?: string[];
  createdAt: Date;
  lastLoginAt: Date;
}

export interface AuthSession {
  user: AuthUser;
  tokens: JWTToken;
  provider: string;
  expiresAt: Date;
}

export interface LoginResult {
  success: boolean;
  session?: AuthSession;
  error?: string;
  message?: string;
  timestamp: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

export class AuthService {
  private static instance: AuthService;
  private isInitialized = false;
  private readonly activeSessions: Map<string, AuthSession> = new Map();

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  isAvailable(): boolean {
    return (
      this.isInitialized &&
      oauthService.isAvailable() &&
      jwtService.isAvailable()
    );
  }

  async initialize(): Promise<ApiResponse> {
    try {
      logger.info('Initialize認證Service');

      // Initialize OAuth Service
      const _oauthResult = await oauthService.initialize();
      if (!oauthResult.success) {
        return {
          success: false,
          error: `OAuth ServiceInitializeFailed: ${oauthResult.error}`,
          timestamp: Date.now(),
        };
      }

      // Initialize JWT Service
      const _jwtResult = await jwtService.initialize();
      if (!jwtResult.success) {
        return {
          success: false,
          error: `JWT ServiceInitializeFailed: ${jwtResult.error}`,
          timestamp: Date.now(),
        };
      }

      this.isInitialized = true;
      logger.info('認證ServiceInitialize完成');

      return {
        success: true,
        data: {
          oauth: oauthResult.data,
          jwt: jwtResult.data,
        },
        message: '認證ServiceInitializeSuccess',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('認證ServiceInitializeFailed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  async loginWithOAuth(provider: string, code: string): Promise<LoginResult> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '認證Service未Initialize',
          timestamp: Date.now(),
        };
      }

      // 交換Authorize碼Get訪問令牌
      const _tokenResult = await oauthService.exchangeCodeForToken(
        provider,
        code
      );
      if (!tokenResult.success || !tokenResult.data) {
        return {
          success: false,
          error: `Get ${provider} 令牌Failed: ${tokenResult.error}`,
          timestamp: Date.now(),
        };
      }

      const oauthToken: OAuthToken = tokenResult.data;

      // GetUserInformation
      const _userResult = await oauthService.getUserInfo(
        provider,
        oauthToken.access_token
      );
      if (!userResult.success || !userResult.data) {
        return {
          success: false,
          error: `Get ${provider} 用戶信息Failed: ${userResult.error}`,
          timestamp: Date.now(),
        };
      }

      const oauthUser: OAuthUser = userResult.data;

      // Create或UpdateUser
      const _authUser = await this.createOrUpdateUser(oauthUser);

      // 生成 JWT 令牌
      const jwtPayload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'> = {
        userId: authUser.id,
        email: authUser.email,
        provider: authUser.provider,
        role: authUser.role,
        permissions: authUser.permissions,
      };

      const _jwtResult = jwtService.generateToken(jwtPayload);
      if (!jwtResult.success || !jwtResult.data) {
        return {
          success: false,
          error: `生成 JWT 令牌Failed: ${jwtResult.error}`,
          timestamp: Date.now(),
        };
      }

      const jwtToken: JWTToken = jwtResult.data;

      // Create會話
      const session: AuthSession = {
        user: authUser,
        tokens: jwtToken,
        provider,
        expiresAt: new Date(Date.now() + jwtToken.expiresIn * 1000),
      };

      // Storage會話
      this.activeSessions.set(authUser.id, session);

      logger.info(`用戶 ${authUser.email} 通過 ${provider} 登錄Success`);

      return {
        success: true,
        session,
        message: '登錄Success',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(`OAuth 登錄Failed (${provider}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  async loginWithCredentials(
    email: string,
    password: string
  ): Promise<LoginResult> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '認證Service未Initialize',
          timestamp: Date.now(),
        };
      }

      // VerifyUser憑證（這裡應該Connect到Database）
      const _authUser = await this.verifyCredentials(email, password);
      if (!authUser) {
        return {
          success: false,
          error: '無效的電子郵件或密碼',
          timestamp: Date.now(),
        };
      }

      // 生成 JWT 令牌
      const jwtPayload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'> = {
        userId: authUser.id,
        email: authUser.email,
        provider: 'email',
        role: authUser.role,
        permissions: authUser.permissions,
      };

      const _jwtResult = jwtService.generateToken(jwtPayload);
      if (!jwtResult.success || !jwtResult.data) {
        return {
          success: false,
          error: `生成 JWT 令牌Failed: ${jwtResult.error}`,
          timestamp: Date.now(),
        };
      }

      const jwtToken: JWTToken = jwtResult.data;

      // Create會話
      const session: AuthSession = {
        user: authUser,
        tokens: jwtToken,
        provider: 'email',
        expiresAt: new Date(Date.now() + jwtToken.expiresIn * 1000),
      };

      // Storage會話
      this.activeSessions.set(authUser.id, session);

      logger.info(`用戶 ${authUser.email} 通過電子郵件登錄Success`);

      return {
        success: true,
        session,
        message: '登錄Success',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('憑證登錄Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  async verifyToken(token: string): Promise<ApiResponse<AuthUser>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '認證Service未Initialize',
          timestamp: Date.now(),
        };
      }

      // Verify JWT 令牌
      const _jwtResult = jwtService.verifyToken(token);
      if (!jwtResult.success || !jwtResult.data) {
        return {
          success: false,
          error: `JWT 令牌VerifyFailed: ${jwtResult.error}`,
          timestamp: Date.now(),
        };
      }

      const _payload = jwtResult.data;

      // Check會話YesNo存在
      const _session = this.activeSessions.get(payload.userId);
      if (!session) {
        return {
          success: false,
          error: '會話不存在或已過期',
          timestamp: Date.now(),
        };
      }

      // Check會話YesNo過期
      if (session.expiresAt < new Date()) {
        this.activeSessions.delete(payload.userId);
        return {
          success: false,
          error: '會話已過期',
          timestamp: Date.now(),
        };
      }

      logger.info(`Verify令牌Success: ${payload.email}`);

      return {
        success: true,
        data: session.user,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('令牌VerifyFailed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  async refreshSession(
    refreshToken: string
  ): Promise<ApiResponse<AuthSession>> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '認證Service未Initialize',
          timestamp: Date.now(),
        };
      }

      // Refresh JWT 令牌
      const _jwtResult = jwtService.refreshToken(refreshToken);
      if (!jwtResult.success || !jwtResult.data) {
        return {
          success: false,
          error: `刷新 JWT 令牌Failed: ${jwtResult.error}`,
          timestamp: Date.now(),
        };
      }

      const jwtToken: JWTToken = jwtResult.data;

      // VerifyRefresh令牌以GetUserInformation
      const _verifyResult = jwtService.verifyToken(refreshToken);
      if (!verifyResult.success || !verifyResult.data) {
        return {
          success: false,
          error: '無效的刷新令牌',
          timestamp: Date.now(),
        };
      }

      const _payload = verifyResult.data;

      // GetUserInformation
      const _user = await this.getUserById(payload.userId);
      if (!user) {
        return {
          success: false,
          error: '用戶不存在',
          timestamp: Date.now(),
        };
      }

      // Update會話
      const session: AuthSession = {
        user,
        tokens: jwtToken,
        provider: payload.provider || 'unknown',
        expiresAt: new Date(Date.now() + jwtToken.expiresIn * 1000),
      };

      this.activeSessions.set(user.id, session);

      logger.info(`為用戶 ${user.email} 刷新會話Success`);

      return {
        success: true,
        data: session,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('刷新會話Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  async logout(userId: string): Promise<ApiResponse> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: '認證Service未Initialize',
          timestamp: Date.now(),
        };
      }

      const _session = this.activeSessions.get(userId);
      if (session) {
        // 撤銷 JWT 令牌
        await jwtService.revokeToken(session.tokens.accessToken);

        // Remove會話
        this.activeSessions.delete(userId);

        logger.info(`用戶 ${session.user.email} 登出Success`);
      }

      return {
        success: true,
        message: '登出Success',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('登出Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  getAuthorizationUrl(provider: string, state?: string): ApiResponse<string> {
    return oauthService.getAuthorizationUrl(provider, state);
  }

  getAvailableProviders(): Record<string, boolean> {
    return oauthService.getAvailableProviders();
  }

  private async createOrUpdateUser(oauthUser: OAuthUser): Promise<AuthUser> {
    // 這裡應該Connect到Database來Create或UpdateUser
    // 目前Return模擬UserData
    const authUser: AuthUser = {
      id: oauthUser.id,
      email: oauthUser.email,
      name: oauthUser.name,
      picture: oauthUser.picture,
      provider: oauthUser.provider,
      verified: oauthUser.verified,
      role: 'user',
      permissions: ['read:own', 'write:own'],
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };

    return authUser;
  }

  private async verifyCredentials(
    email: string,
    password: string
  ): Promise<AuthUser | null> {
    // 這裡應該Connect到Database來VerifyUser憑證
    // 目前Return null（模擬VerifyFailed）
    return null;
  }

  private async getUserById(userId: string): Promise<AuthUser | null> {
    // 這裡應該Connect到Database來GetUserInformation
    // 目前從活動會話中Get
    const _session = this.activeSessions.get(userId);
    return session ? session.user : null;
  }

  async getServiceStats(): Promise<ApiResponse> {
    return {
      success: true,
      data: {
        initialized: this.isInitialized,
        activeSessions: this.activeSessions.size,
        oauthAvailable: oauthService.isAvailable(),
        jwtAvailable: jwtService.isAvailable(),
        providers: this.getAvailableProviders(),
      },
      timestamp: Date.now(),
    };
  }
}

export const _authService = AuthService.getInstance();
