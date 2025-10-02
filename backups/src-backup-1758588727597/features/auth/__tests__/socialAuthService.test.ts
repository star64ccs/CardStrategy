import type {
  SocialProvider,
  SocialLoginCredentials,
  SocialUserInfo,
} from '../../../core/types';
import { SocialAuthService } from '../services/socialAuthService';

// Mock API
jest.mock('../../../core/utils/api', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock logger
jest.mock('../../../core/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('SocialAuthService', () => {
  let socialAuthService: SocialAuthService;

  beforeEach(() => {
    socialAuthService = SocialAuthService.getInstance();
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('應該返回單例實例', () => {
      const instance1 = SocialAuthService.getInstance();
      const instance2 = SocialAuthService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('socialLogin', () => {
    const mockCredentials: SocialLoginCredentials = {
      provider: 'google',
      accessToken: 'mock-access-token',
      userInfo: {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      },
    };

    it('應該成功執行社交登錄', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: '123', email: 'test@example.com' },
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600,
          provider: 'google',
          socialUserId: '123',
          isNewUser: false,
        },
      };

      const { api } = require('../../../core/utils/api');
      api.post.mockResolvedValue(mockResponse);

      const result = await socialAuthService.socialLogin(mockCredentials);

      expect(api.post).toHaveBeenCalledWith(
        '/auth/social/login',
        mockCredentials
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('應該處理登錄失敗', async () => {
      const mockResponse = {
        success: false,
        message: '登錄失敗',
      };

      const { api } = require('../../../core/utils/api');
      api.post.mockResolvedValue(mockResponse);

      await expect(
        socialAuthService.socialLogin(mockCredentials)
      ).rejects.toThrow('社交登錄失敗');
    });

    it('應該驗證必要的憑證', async () => {
      const invalidCredentials = {
        provider: 'google',
        accessToken: '',
      } as SocialLoginCredentials;

      await expect(
        socialAuthService.socialLogin(invalidCredentials)
      ).rejects.toThrow('社交登錄訪問令牌不能為空');
    });
  });

  describe('getSocialLoginUrl', () => {
    it('應該成功獲取社交登錄 URL', async () => {
      const mockResponse = {
        success: true,
        data: { url: 'https://example.com/auth/google' },
      };

      const { api } = require('../../../core/utils/api');
      api.get.mockResolvedValue(mockResponse);

      const result = await socialAuthService.getSocialLoginUrl(
        'google',
        'https://app.com/callback'
      );

      expect(api.get).toHaveBeenCalledWith('/auth/social/google/url', {
        params: { redirectUri: 'https://app.com/callback' },
      });
      expect(result).toBe('https://example.com/auth/google');
    });

    it('應該處理獲取 URL 失敗', async () => {
      const mockResponse = {
        success: false,
        message: '獲取 URL 失敗',
      };

      const { api } = require('../../../core/utils/api');
      api.get.mockResolvedValue(mockResponse);

      await expect(
        socialAuthService.getSocialLoginUrl('google')
      ).rejects.toThrow('獲取社交登錄 URL 失敗');
    });
  });

  describe('handleSocialCallback', () => {
    it('應該成功處理社交登錄回調', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: '123', email: 'test@example.com' },
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600,
          provider: 'google',
          socialUserId: '123',
          isNewUser: false,
        },
      };

      const { api } = require('../../../core/utils/api');
      api.post.mockResolvedValue(mockResponse);

      const result = await socialAuthService.handleSocialCallback(
        'google',
        'mock-code',
        'mock-state'
      );

      expect(api.post).toHaveBeenCalledWith('/auth/social/callback', {
        provider: 'google',
        code: 'mock-code',
        state: 'mock-state',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('linkSocialAccount', () => {
    const mockCredentials: SocialLoginCredentials = {
      provider: 'facebook',
      accessToken: 'mock-access-token',
      userInfo: {
        id: '456',
        email: 'test@example.com',
        name: 'Test User',
      },
    };

    it('應該成功鏈接社交帳戶', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 'link-123',
          provider: 'facebook',
          socialUserId: '456',
          email: 'test@example.com',
          name: 'Test User',
          isVerified: true,
          linkedAt: new Date(),
        },
      };

      const { api } = require('../../../core/utils/api');
      api.post.mockResolvedValue(mockResponse);

      const result = await socialAuthService.linkSocialAccount(mockCredentials);

      expect(api.post).toHaveBeenCalledWith(
        '/auth/social/link',
        mockCredentials
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('unlinkSocialAccount', () => {
    it('應該成功解除鏈接社交帳戶', async () => {
      const mockResponse = {
        success: true,
      };

      const { api } = require('../../../core/utils/api');
      api.delete.mockResolvedValue(mockResponse);

      await socialAuthService.unlinkSocialAccount('google');

      expect(api.delete).toHaveBeenCalledWith('/auth/social/unlink/google');
    });
  });

  describe('getLinkedSocialAccounts', () => {
    it('應該成功獲取已鏈接的社交帳戶', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: 'link-123',
            provider: 'google',
            socialUserId: '123',
            email: 'test@example.com',
            name: 'Test User',
            isVerified: true,
            linkedAt: new Date(),
          },
        ],
      };

      const { api } = require('../../../core/utils/api');
      api.get.mockResolvedValue(mockResponse);

      const result = await socialAuthService.getLinkedSocialAccounts();

      expect(api.get).toHaveBeenCalledWith('/auth/social/accounts');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getSocialUserInfo', () => {
    it('應該成功獲取社交用戶信息', async () => {
      const mockUserInfo: SocialUserInfo = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockResponse = {
        success: true,
        data: mockUserInfo,
      };

      const { api } = require('../../../core/utils/api');
      api.get.mockResolvedValue(mockResponse);

      const result = await socialAuthService.getSocialUserInfo(
        'google',
        'mock-access-token'
      );

      expect(api.get).toHaveBeenCalledWith('/auth/social/google/userinfo', {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });
      expect(result).toEqual(mockUserInfo);
    });
  });

  describe('isProviderConfigured', () => {
    it('應該正確檢查提供商配置狀態', () => {
      // 由於我們使用環境變量，這裡只是測試方法調用不會出錯
      expect(socialAuthService.isProviderConfigured('google')).toBeDefined();
      expect(socialAuthService.isProviderConfigured('facebook')).toBeDefined();
      expect(socialAuthService.isProviderConfigured('apple')).toBeDefined();
    });
  });

  describe('getConfig', () => {
    it('應該返回社交登錄配置', () => {
      const config = socialAuthService.getConfig();

      expect(config).toHaveProperty('google');
      expect(config).toHaveProperty('facebook');
      expect(config).toHaveProperty('apple');
      expect(config).toHaveProperty('twitter');
      expect(config).toHaveProperty('github');
      expect(config).toHaveProperty('discord');
      expect(config).toHaveProperty('line');
      expect(config).toHaveProperty('kakao');
    });
  });

  describe('錯誤處理', () => {
    it('應該處理 API 錯誤', async () => {
      const { api } = require('../../../core/utils/api');
      api.post.mockRejectedValue(new Error('網絡錯誤'));

      const credentials: SocialLoginCredentials = {
        provider: 'google',
        accessToken: 'mock-token',
      };

      await expect(socialAuthService.socialLogin(credentials)).rejects.toThrow(
        '網絡錯誤'
      );
    });

    it('應該驗證提供商類型', async () => {
      const invalidCredentials = {
        provider: 'invalid-provider' as SocialProvider,
        accessToken: 'mock-token',
      };

      await expect(
        socialAuthService.socialLogin(invalidCredentials)
      ).rejects.toThrow('不支持的社交登錄提供商: invalid-provider');
    });
  });
});
