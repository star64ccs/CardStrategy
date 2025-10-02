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
      const _instance1 = SocialAuthService.getInstance();
      const _instance2 = SocialAuthService.getInstance();
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

    it('應該Success執行社交登錄', async () => {
      const _mockResponse = {
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

      const _result = await socialAuthService.socialLogin(mockCredentials);

      expect(api.post).toHaveBeenCalledWith(
        '/auth/social/login',
        mockCredentials
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('應該Handle登錄Failed', async () => {
      const _mockResponse = {
        success: false,
        message: '登錄Failed',
      };

      const { api } = require('../../../core/utils/api');
      api.post.mockResolvedValue(mockResponse);

      await expect(
        socialAuthService.socialLogin(mockCredentials)
      ).rejects.toThrow('社交登錄Failed');
    });

    it('應該驗證必要的憑證', async () => {
      const _invalidCredentials = {
        provider: 'google',
        accessToken: '',
      } as SocialLoginCredentials;

      await expect(
        socialAuthService.socialLogin(invalidCredentials)
      ).rejects.toThrow('社交登錄訪問令牌不能為空');
    });
  });

  describe('getSocialLoginUrl', () => {
    it('應該SuccessGet社交登錄 URL', async () => {
      const _mockResponse = {
        success: true,
        data: { url: 'https://example.com/auth/google' },
      };

      const { api } = require('../../../core/utils/api');
      api.get.mockResolvedValue(mockResponse);

      const _result = await socialAuthService.getSocialLoginUrl(
        'google',
        'https://app.com/callback'
      );

      expect(api.get).toHaveBeenCalledWith('/auth/social/google/url', {
        params: { redirectUri: 'https://app.com/callback' },
      });
      expect(result).toBe('https://example.com/auth/google');
    });

    it('應該HandleGet URL Failed', async () => {
      const _mockResponse = {
        success: false,
        message: 'Get URL Failed',
      };

      const { api } = require('../../../core/utils/api');
      api.get.mockResolvedValue(mockResponse);

      await expect(
        socialAuthService.getSocialLoginUrl('google')
      ).rejects.toThrow('Get社交登錄 URL Failed');
    });
  });

  describe('handleSocialCallback', () => {
    it('應該SuccessHandle社交登錄回調', async () => {
      const _mockResponse = {
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

      const _result = await socialAuthService.handleSocialCallback(
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

    it('應該Success鏈接社交帳戶', async () => {
      const _mockResponse = {
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

      const _result = await socialAuthService.linkSocialAccount(mockCredentials);

      expect(api.post).toHaveBeenCalledWith(
        '/auth/social/link',
        mockCredentials
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('unlinkSocialAccount', () => {
    it('應該Success解除鏈接社交帳戶', async () => {
      const _mockResponse = {
        success: true,
      };

      const { api } = require('../../../core/utils/api');
      api.delete.mockResolvedValue(mockResponse);

      await socialAuthService.unlinkSocialAccount('google');

      expect(api.delete).toHaveBeenCalledWith('/auth/social/unlink/google');
    });
  });

  describe('getLinkedSocialAccounts', () => {
    it('應該SuccessGet已鏈接的社交帳戶', async () => {
      const _mockResponse = {
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

      const _result = await socialAuthService.getLinkedSocialAccounts();

      expect(api.get).toHaveBeenCalledWith('/auth/social/accounts');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getSocialUserInfo', () => {
    it('應該SuccessGet社交用戶信息', async () => {
      const mockUserInfo: SocialUserInfo = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
      };

      const _mockResponse = {
        success: true,
        data: mockUserInfo,
      };

      const { api } = require('../../../core/utils/api');
      api.get.mockResolvedValue(mockResponse);

      const _result = await socialAuthService.getSocialUserInfo(
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
      // 由於我們使用環境Variable，這裡只YesTestMethod調用不會出錯
      expect(socialAuthService.isProviderConfigured('google')).toBeDefined();
      expect(socialAuthService.isProviderConfigured('facebook')).toBeDefined();
      expect(socialAuthService.isProviderConfigured('apple')).toBeDefined();
    });
  });

  describe('getConfig', () => {
    it('應該返回社交登錄配置', () => {
      const _config = socialAuthService.getConfig();

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

  describe('ErrorHandle', () => {
    it('應該Handle API Error', async () => {
      const { api } = require('../../../core/utils/api');
      api.post.mockRejectedValue(new Error('網絡Error'));

      const credentials: SocialLoginCredentials = {
        provider: 'google',
        accessToken: 'mock-token',
      };

      await expect(socialAuthService.socialLogin(credentials)).rejects.toThrow(
        '網絡Error'
      );
    });

    it('應該驗證提供商類型', async () => {
      const _invalidCredentials = {
        provider: 'invalid-provider' as SocialProvider,
        accessToken: 'mock-token',
      };

      await expect(
        socialAuthService.socialLogin(invalidCredentials)
      ).rejects.toThrow('不支持的社交登錄提供商: invalid-provider');
    });
  });
});
