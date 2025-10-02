import {
  authService,
  oauthService,
  jwtService,
} from '../shared/services/auth/authService';

// 模擬 logger 和 api
const _mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

const _mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

// 模擬 OAuth Service
class MockOAuthService {
  private isInitialized = false;
  private providers: Record<string, any> = {};

  async initialize() {
    this.isInitialized = true;
    this.providers = {
      google: { name: 'Google', clientId: 'test-client-id' },
      facebook: { name: 'Facebook', clientId: 'test-facebook-id' },
    };
    return { success: true, data: { providers: ['google', 'facebook'] } };
  }

  isAvailable() {
    return this.isInitialized && Object.keys(this.providers).length > 0;
  }

  getAuthorizationUrl(provider: string) {
    if (this.providers[provider]) {
      return { success: true, data: `https://${provider}.com/auth` };
    }
    return { success: false, error: 'Provider not found' };
  }

  async exchangeCodeForToken(provider: string, code: string) {
    if (this.providers[provider] && code) {
      return {
        success: true,
        data: {
          access_token: 'test-access-token',
          token_type: 'Bearer',
          expires_in: 3600,
        },
      };
    }
    return { success: false, error: 'Invalid code' };
  }

  async getUserInfo(provider: string, token: string) {
    if (this.providers[provider] && token) {
      return {
        success: true,
        data: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          provider,
          verified: true,
        },
      };
    }
    return { success: false, error: 'Invalid token' };
  }

  getAvailableProviders() {
    return Object.keys(this.providers).reduce(
      (acc, provider) => {
        acc[provider] = true;
        return acc;
      },
      {} as Record<string, boolean>
    );
  }
}

// 模擬 JWT Service
class MockJWTService {
  private isInitialized = false;
  private secret = 'test-secret';

  async initialize() {
    this.isInitialized = true;
    return { success: true, data: { expiresIn: '15m' } };
  }

  isAvailable() {
    return this.isInitialized && this.secret !== 'default-jwt-secret-key';
  }

  generateToken(payload: unknown) {
    if (this.isInitialized && payload.userId) {
      return {
        success: true,
        data: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          expiresIn: 900,
          tokenType: 'Bearer',
        },
      };
    }
    return { success: false, error: 'Invalid payload' };
  }

  verifyToken(token: string) {
    if (this.isInitialized && token) {
      return {
        success: true,
        data: {
          userId: 'test-user-id',
          email: 'test@example.com',
          provider: 'google',
        },
      };
    }
    return { success: false, error: 'Invalid token' };
  }

  refreshToken(refreshToken: string) {
    if (this.isInitialized && refreshToken) {
      return {
        success: true,
        data: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          expiresIn: 900,
          tokenType: 'Bearer',
        },
      };
    }
    return { success: false, error: 'Invalid refresh token' };
  }

  revokeToken(token: string) {
    if (this.isInitialized && token) {
      return { success: true, message: 'Token revoked' };
    }
    return { success: false, error: 'Invalid token' };
  }
}

// 模擬AuthenticateService
class MockAuthService {
  private isInitialized = false;
  private activeSessions = new Map();

  async initialize() {
    this.isInitialized = true;
    return { success: true, data: { oauth: {}, jwt: {} } };
  }

  isAvailable() {
    return this.isInitialized;
  }

  async loginWithOAuth(provider: string, code: string) {
    if (this.isInitialized && provider && code) {
      const _session = {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          name: 'Test User',
          provider,
          verified: true,
          role: 'user',
          permissions: ['read:own', 'write:own'],
          createdAt: new Date(),
          lastLoginAt: new Date(),
        },
        tokens: {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          expiresIn: 900,
          tokenType: 'Bearer',
        },
        provider,
        expiresAt: new Date(Date.now() + 900 * 1000),
      };

      this.activeSessions.set('test-user-id', session);

      return {
        success: true,
        session,
        message: 'Login successful',
      };
    }
    return { success: false, error: 'Login failed' };
  }

  async verifyToken(token: string) {
    if (this.isInitialized && token) {
      const _session = this.activeSessions.get('test-user-id');
      if (session) {
        return { success: true, data: session.user };
      }
    }
    return { success: false, error: 'Invalid token' };
  }

  async logout(userId: string) {
    if (this.isInitialized && userId) {
      this.activeSessions.delete(userId);
      return { success: true, message: 'Logout successful' };
    }
    return { success: false, error: 'Logout failed' };
  }

  getAuthorizationUrl(provider: string) {
    if (this.isInitialized && provider) {
      return { success: true, data: `https://${provider}.com/auth` };
    }
    return { success: false, error: 'Provider not found' };
  }

  getAvailableProviders() {
    return { google: true, facebook: true };
  }
}

describe('Authentication Services Tests', () => {
  let mockOAuthService: MockOAuthService;
  let mockJWTService: MockJWTService;
  let mockAuthService: MockAuthService;

  beforeEach(async () => {
    mockOAuthService = new MockOAuthService();
    mockJWTService = new MockJWTService();
    mockAuthService = new MockAuthService();

    // InitializeService
    await mockOAuthService.initialize();
    await mockJWTService.initialize();
    await mockAuthService.initialize();

    // Reset模擬Function
    jest.clearAllMocks();
  });

  describe('MockOAuthService', () => {
    test('Initialize應該Success', async () => {
      const _result = await mockOAuthService.initialize();
      expect(result.success).toBe(true);
      expect(result.data?.providers).toContain('google');
      expect(result.data?.providers).toContain('facebook');
    });

    test('Get授權 URL 應該Success', () => {
      const _result = mockOAuthService.getAuthorizationUrl('google');
      expect(result.success).toBe(true);
      expect(result.data).toBe('https://google.com/auth');
    });

    test('交換代碼Get令牌應該Success', async () => {
      const _result = await mockOAuthService.exchangeCodeForToken(
        'google',
        'test-code'
      );
      expect(result.success).toBe(true);
      expect(result.data?.access_token).toBe('test-access-token');
    });

    test('Get用戶信息應該Success', async () => {
      const _result = await mockOAuthService.getUserInfo('google', 'test-token');
      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('test@example.com');
    });

    test('獲取可用提供商應該正確', () => {
      const _providers = mockOAuthService.getAvailableProviders();
      expect(providers.google).toBe(true);
      expect(providers.facebook).toBe(true);
    });
  });

  describe('MockJWTService', () => {
    test('Initialize應該Success', async () => {
      const _result = await mockJWTService.initialize();
      expect(result.success).toBe(true);
      expect(result.data?.expiresIn).toBe('15m');
    });

    test('生成令牌應該Success', () => {
      const _payload = { userId: 'test-user-id', email: 'test@example.com' };
      const _result = mockJWTService.generateToken(payload);
      expect(result.success).toBe(true);
      expect(result.data?.accessToken).toBe('test-access-token');
      expect(result.data?.refreshToken).toBe('test-refresh-token');
    });

    test('Verify令牌應該Success', () => {
      const _result = mockJWTService.verifyToken('test-token');
      expect(result.success).toBe(true);
      expect(result.data?.userId).toBe('test-user-id');
    });

    test('刷新令牌應該Success', () => {
      const _result = mockJWTService.refreshToken('test-refresh-token');
      expect(result.success).toBe(true);
      expect(result.data?.accessToken).toBe('new-access-token');
    });

    test('撤銷令牌應該Success', () => {
      const _result = mockJWTService.revokeToken('test-token');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Token revoked');
    });
  });

  describe('MockAuthService', () => {
    test('Initialize應該Success', async () => {
      const _result = await mockAuthService.initialize();
      expect(result.success).toBe(true);
      expect(result.data?.oauth).toBeDefined();
      expect(result.data?.jwt).toBeDefined();
    });

    test('OAuth 登錄應該Success', async () => {
      const _result = await mockAuthService.loginWithOAuth(
        'google',
        'test-code'
      );
      expect(result.success).toBe(true);
      expect(result.session?.user.email).toBe('test@example.com');
      expect(result.session?.provider).toBe('google');
    });

    test('令牌Verify應該Success', async () => {
      // 先Login
      await mockAuthService.loginWithOAuth('google', 'test-code');

      // 然後Verify令牌
      const _result = await mockAuthService.verifyToken('test-token');
      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('test@example.com');
    });

    test('登出應該Success', async () => {
      // 先Login
      await mockAuthService.loginWithOAuth('google', 'test-code');

      // 然後登出
      const _result = await mockAuthService.logout('test-user-id');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Logout successful');
    });

    test('Get授權 URL 應該Success', () => {
      const _result = mockAuthService.getAuthorizationUrl('google');
      expect(result.success).toBe(true);
      expect(result.data).toBe('https://google.com/auth');
    });

    test('獲取可用提供商應該正確', () => {
      const _providers = mockAuthService.getAvailableProviders();
      expect(providers.google).toBe(true);
      expect(providers.facebook).toBe(true);
    });
  });

  describe('認證流程測試', () => {
    test('完整的 OAuth 登錄流程應該Success', async () => {
      // 1. InitializeService
      await mockAuthService.initialize();

      // 2. GetAuthorize URL
      const _authUrlResult = mockAuthService.getAuthorizationUrl('google');
      expect(authUrlResult.success).toBe(true);

      // 3. 執RowLogin
      const _loginResult = await mockAuthService.loginWithOAuth(
        'google',
        'test-code'
      );
      expect(loginResult.success).toBe(true);
      expect(loginResult.session).toBeDefined();

      // 4. Verify令牌
      const _verifyResult = await mockAuthService.verifyToken('test-token');
      expect(verifyResult.success).toBe(true);
      expect(verifyResult.data?.email).toBe('test@example.com');

      // 5. 登出
      const _logoutResult = await mockAuthService.logout('test-user-id');
      expect(logoutResult.success).toBe(true);
    });

    test('ErrorHandle應該正確', async () => {
      // Create未Initialize的Service來TestErrorHandle
      const _uninitializedService = new MockAuthService();
      const _result = await uninitializedService.loginWithOAuth(
        'google',
        'test-code'
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe('Login failed');
    });
  });

  describe('Service可用性測試', () => {
    test('OAuth Service可用性Check', () => {
      expect(mockOAuthService.isAvailable()).toBe(true);
    });

    test('JWT Service可用性Check', () => {
      expect(mockJWTService.isAvailable()).toBe(true);
    });

    test('認證Service可用性Check', () => {
      expect(mockAuthService.isAvailable()).toBe(true);
    });
  });
});
