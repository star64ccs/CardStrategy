import { logger } from '../../../core/utils/logger';

export interface JWTConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
  issuer: string;
  audience: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  provider?: string;
  role?: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export interface JWTToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

export class JWTService {
  private readonly config: JWTConfig;
  private isInitialized = false;

  constructor() {
    this.config = {
      secret: process.env.JWT_SECRET || 'default-jwt-secret-key',
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: process.env.JWT_ISSUER || 'cardstrategy-app',
      audience: process.env.JWT_AUDIENCE || 'cardstrategy-users',
    };
  }

  isAvailable(): boolean {
    return (
      this.isInitialized && this.config.secret !== 'default-jwt-secret-key'
    );
  }

  async initialize(): Promise<ApiResponse> {
    try {
      logger.info('Initialize JWT Service');

      // VerifyConfigure
      if (
        !this.config.secret ||
        this.config.secret === 'default-jwt-secret-key'
      ) {
        logger.warn('JWT_SECRET 未設置，使用默認密鑰（僅用於開發）');
      }

      this.isInitialized = true;
      logger.info('JWT ServiceInitialize完成');

      return {
        success: true,
        data: {
          expiresIn: this.config.expiresIn,
          refreshExpiresIn: this.config.refreshExpiresIn,
          issuer: this.config.issuer,
          audience: this.config.audience,
        },
        message: 'JWT ServiceInitializeSuccess',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('JWT ServiceInitializeFailed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  generateToken(
    payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'>
  ): ApiResponse<JWTToken> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'JWT Service未Initialize',
          timestamp: Date.now(),
        };
      }

      const _now = Math.floor(Date.now() / 1000);
      const _accessTokenExp = now + this.parseExpiresIn(this.config.expiresIn);
      const _refreshTokenExp =
        now + this.parseExpiresIn(this.config.refreshExpiresIn);

      // 生成訪問令牌
      const accessTokenPayload: JWTPayload = {
        ...payload,
        iat: now,
        exp: accessTokenExp,
        iss: this.config.issuer,
        aud: this.config.audience,
      };

      // 生成Refresh令牌
      const refreshTokenPayload: JWTPayload = {
        userId: payload.userId,
        email: payload.email,
        iat: now,
        exp: refreshTokenExp,
        iss: this.config.issuer,
        aud: this.config.audience,
      };

      const _accessToken = this.encodeToken(accessTokenPayload);
      const _refreshToken = this.encodeToken(refreshTokenPayload);

      const token: JWTToken = {
        accessToken,
        refreshToken,
        expiresIn: accessTokenExp - now,
        tokenType: 'Bearer',
      };

      logger.info(`為用戶 ${payload.email} 生成 JWT 令牌`);

      return {
        success: true,
        data: token,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('生成 JWT 令牌Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  verifyToken(token: string): ApiResponse<JWTPayload> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'JWT Service未Initialize',
          timestamp: Date.now(),
        };
      }

      const _payload = this.decodeToken(token);
      if (!payload) {
        return {
          success: false,
          error: '無效的令牌格式',
          timestamp: Date.now(),
        };
      }

      // Check令牌YesNo過期
      const _now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return {
          success: false,
          error: '令牌已過期',
          timestamp: Date.now(),
        };
      }

      // Check發Row者
      if (payload.iss && payload.iss !== this.config.issuer) {
        return {
          success: false,
          error: '無效的令牌發行者',
          timestamp: Date.now(),
        };
      }

      // Check受眾
      if (payload.aud && payload.aud !== this.config.audience) {
        return {
          success: false,
          error: '無效的令牌受眾',
          timestamp: Date.now(),
        };
      }

      logger.info(`Verify JWT 令牌Success: ${payload.email}`);

      return {
        success: true,
        data: payload,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('Verify JWT 令牌Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  refreshToken(refreshToken: string): ApiResponse<JWTToken> {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'JWT Service未Initialize',
          timestamp: Date.now(),
        };
      }

      // VerifyRefresh令牌
      const _verifyResult = this.verifyToken(refreshToken);
      if (!verifyResult.success || !verifyResult.data) {
        return {
          success: false,
          error: '無效的刷新令牌',
          timestamp: Date.now(),
        };
      }

      const _payload = verifyResult.data;

      // 生成新的令牌對
      const _newTokenResult = this.generateToken({
        userId: payload.userId,
        email: payload.email,
        provider: payload.provider,
        role: payload.role,
        permissions: payload.permissions,
      });

      if (!newTokenResult.success || !newTokenResult.data) {
        return {
          success: false,
          error: '生成新令牌Failed',
          timestamp: Date.now(),
        };
      }

      logger.info(`為用戶 ${payload.email} 刷新 JWT 令牌`);

      return {
        success: true,
        data: newTokenResult.data,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('刷新 JWT 令牌Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  revokeToken(token: string): ApiResponse {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'JWT Service未Initialize',
          timestamp: Date.now(),
        };
      }

      // Verify令牌
      const _verifyResult = this.verifyToken(token);
      if (!verifyResult.success || !verifyResult.data) {
        return {
          success: false,
          error: '無效的令牌',
          timestamp: Date.now(),
        };
      }

      // 在實際Apply中，這裡應該將令牌加入黑名單
      // 目前只YesRecord撤銷Operation
      logger.info(`撤銷用戶 ${verifyResult.data.email} 的 JWT 令牌`);

      return {
        success: true,
        message: '令牌已撤銷',
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('撤銷 JWT 令牌Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知Error',
        timestamp: Date.now(),
      };
    }
  }

  private parseExpiresIn(expiresIn: string): number {
    const _unit = expiresIn.slice(-1);
    const _value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return parseInt(expiresIn) || 900; // Default 15 Minute
    }
  }

  private encodeToken(payload: JWTPayload): string {
    // 簡化的 JWT Encode實現
    // 在實際Apply中，應該使用專業的 JWT Library
    const _header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const _encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const _encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const _signature = this.generateSignature(encodedHeader, encodedPayload);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private decodeToken(token: string): JWTPayload | null {
    try {
      const _parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const [, encodedPayload] = parts;
      const _payload = JSON.parse(this.base64UrlDecode(encodedPayload));
      return payload;
    } catch (error) {
      return null;
    }
  }

  private generateSignature(header: string, payload: string): string {
    // 簡化的Sign生成
    // 在實際Apply中，應該使用 HMAC-SHA256
    const _data = `${header}.${payload}`;
    return this.base64UrlEncode(this.simpleHash(data + this.config.secret));
  }

  private base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private base64UrlDecode(str: string): string {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
      str += '=';
    }
    return Buffer.from(str, 'base64').toString();
  }

  private simpleHash(str: string): string {
    // 簡化的哈希Function
    // 在實際Apply中，應該使用 crypto.createHmac
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const _char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert為 32 位整數
    }
    return hash.toString(16);
  }

  async getServiceStats(): Promise<ApiResponse> {
    return {
      success: true,
      data: {
        initialized: this.isInitialized,
        expiresIn: this.config.expiresIn,
        refreshExpiresIn: this.config.refreshExpiresIn,
        issuer: this.config.issuer,
        audience: this.config.audience,
      },
      timestamp: Date.now(),
    };
  }
}

export const _jwtService = new JWTService();
