import { socialMediaIntegrationService } from '../../../services/socialMediaIntegrationService';
import { mockApiResponse } from '../../setup/test-utils';

// Mock API service
jest.mock('../../../services/apiService', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

describe('SocialMediaIntegrationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('connectSocialAccount', () => {
    it('應該成功連接Facebook帳戶', async () => {
      const connectionData = {
        platform: 'facebook',
        accessToken: 'facebook_access_token',
        userId: 'user123'
      };

      const mockResponse = {
        id: 'connection_id',
        platform: 'facebook',
        connected: true,
        connectedAt: '2024-01-01T00:00:00Z',
        profile: {
          id: 'fb_user_id',
          name: 'Facebook User',
          email: 'user@facebook.com',
          picture: 'profile_picture.jpg'
        }
      };

      mockApiResponse('post', mockResponse);

      const result = await socialMediaIntegrationService.connectSocialAccount(connectionData);

      expect(result).toEqual(mockResponse);
    });

    it('應該成功連接Twitter帳戶', async () => {
      const connectionData = {
        platform: 'twitter',
        accessToken: 'twitter_access_token',
        userId: 'user123'
      };

      const mockResponse = {
        id: 'connection_id',
        platform: 'twitter',
        connected: true,
        connectedAt: '2024-01-01T00:00:00Z',
        profile: {
          id: 'twitter_user_id',
          username: '@twitteruser',
          name: 'Twitter User',
          profileImage: 'profile_image.jpg'
        }
      };

      mockApiResponse('post', mockResponse);

      const result = await socialMediaIntegrationService.connectSocialAccount(connectionData);

      expect(result).toEqual(mockResponse);
    });

    it('應該處理連接失敗的情況', async () => {
      const connectionData = {
        platform: 'invalid_platform',
        accessToken: 'invalid_token',
        userId: 'user123'
      };

      mockApiResponse('post', null, new Error('Invalid platform'));

      await expect(socialMediaIntegrationService.connectSocialAccount(connectionData)).rejects.toThrow('Invalid platform');
    });
  });

  describe('disconnectSocialAccount', () => {
    it('應該成功斷開社交媒體帳戶', async () => {
      const disconnectData = {
        platform: 'facebook',
        userId: 'user123'
      };

      mockApiResponse('delete', { success: true });

      const result = await socialMediaIntegrationService.disconnectSocialAccount(disconnectData);

      expect(result).toEqual({ success: true });
    });

    it('應該處理斷開連接失敗的情況', async () => {
      const disconnectData = {
        platform: 'facebook',
        userId: 'invalid_user'
      };

      mockApiResponse('delete', null, new Error('Connection not found'));

      await expect(socialMediaIntegrationService.disconnectSocialAccount(disconnectData)).rejects.toThrow('Connection not found');
    });
  });

  describe('getConnectedAccounts', () => {
    it('應該成功獲取已連接的社交媒體帳戶', async () => {
      const mockConnections = [
        {
          id: 'connection_1',
          platform: 'facebook',
          connected: true,
          connectedAt: '2024-01-01T00:00:00Z',
          profile: {
            id: 'fb_user_id',
            name: 'Facebook User',
            email: 'user@facebook.com'
          }
        },
        {
          id: 'connection_2',
          platform: 'twitter',
          connected: true,
          connectedAt: '2024-01-02T00:00:00Z',
          profile: {
            id: 'twitter_user_id',
            username: '@twitteruser',
            name: 'Twitter User'
          }
        }
      ];

      mockApiResponse('get', mockConnections);

      const result = await socialMediaIntegrationService.getConnectedAccounts('user123');

      expect(result).toEqual(mockConnections);
    });
  });

  describe('shareCard', () => {
    it('應該成功在Facebook分享卡片', async () => {
      const shareData = {
        platform: 'facebook',
        cardId: 'card123',
        message: '看看我發現的稀有卡片！',
        userId: 'user123'
      };

      const mockResponse = {
        id: 'share_id',
        platform: 'facebook',
        shared: true,
        sharedAt: '2024-01-01T00:00:00Z',
        postId: 'facebook_post_id',
        url: 'https://facebook.com/post/123'
      };

      mockApiResponse('post', mockResponse);

      const result = await socialMediaIntegrationService.shareCard(shareData);

      expect(result).toEqual(mockResponse);
    });

    it('應該成功在Twitter分享卡片', async () => {
      const shareData = {
        platform: 'twitter',
        cardId: 'card123',
        message: '稀有卡片發現！#TCG #CardCollector',
        userId: 'user123'
      };

      const mockResponse = {
        id: 'share_id',
        platform: 'twitter',
        shared: true,
        sharedAt: '2024-01-01T00:00:00Z',
        tweetId: 'twitter_tweet_id',
        url: 'https://twitter.com/user/status/123'
      };

      mockApiResponse('post', mockResponse);

      const result = await socialMediaIntegrationService.shareCard(shareData);

      expect(result).toEqual(mockResponse);
    });

    it('應該處理分享失敗的情況', async () => {
      const shareData = {
        platform: 'facebook',
        cardId: 'invalid_card',
        message: 'Test message',
        userId: 'user123'
      };

      mockApiResponse('post', null, new Error('Card not found'));

      await expect(socialMediaIntegrationService.shareCard(shareData)).rejects.toThrow('Card not found');
    });
  });

  describe('shareCollection', () => {
    it('應該成功分享收藏', async () => {
      const shareData = {
        platform: 'facebook',
        collectionId: 'collection123',
        message: '我的卡片收藏！',
        userId: 'user123'
      };

      const mockResponse = {
        id: 'share_id',
        platform: 'facebook',
        shared: true,
        sharedAt: '2024-01-01T00:00:00Z',
        postId: 'facebook_post_id',
        url: 'https://facebook.com/post/123'
      };

      mockApiResponse('post', mockResponse);

      const result = await socialMediaIntegrationService.shareCollection(shareData);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('shareAchievement', () => {
    it('應該成功分享成就', async () => {
      const shareData = {
        platform: 'twitter',
        achievementId: 'achievement123',
        message: '我解鎖了新成就！',
        userId: 'user123'
      };

      const mockResponse = {
        id: 'share_id',
        platform: 'twitter',
        shared: true,
        sharedAt: '2024-01-01T00:00:00Z',
        tweetId: 'twitter_tweet_id',
        url: 'https://twitter.com/user/status/123'
      };

      mockApiResponse('post', mockResponse);

      const result = await socialMediaIntegrationService.shareAchievement(shareData);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getShareHistory', () => {
    it('應該成功獲取分享歷史', async () => {
      const mockHistory = [
        {
          id: 'share_1',
          platform: 'facebook',
          type: 'card',
          sharedAt: '2024-01-01T00:00:00Z',
          postId: 'facebook_post_1',
          url: 'https://facebook.com/post/1'
        },
        {
          id: 'share_2',
          platform: 'twitter',
          type: 'collection',
          sharedAt: '2024-01-02T00:00:00Z',
          tweetId: 'twitter_tweet_2',
          url: 'https://twitter.com/user/status/2'
        }
      ];

      mockApiResponse('get', mockHistory);

      const result = await socialMediaIntegrationService.getShareHistory('user123');

      expect(result).toEqual(mockHistory);
    });

    it('應該支持分頁參數', async () => {
      const page = 2;
      const limit = 10;

      mockApiResponse('get', []);

      await socialMediaIntegrationService.getShareHistory('user123', page, limit);

      expect(require('../../../services/apiService').apiService.get).toHaveBeenCalledWith(
        expect.stringContaining('shares'),
        expect.objectContaining({
          params: { page, limit }
        })
      );
    });
  });

  describe('getSocialAnalytics', () => {
    it('應該成功獲取社交媒體分析數據', async () => {
      const mockAnalytics = {
        totalShares: 25,
        platformBreakdown: {
          facebook: 15,
          twitter: 10
        },
        engagement: {
          likes: 150,
          comments: 45,
          shares: 30
        },
        topSharedContent: [
          {
            id: 'card123',
            type: 'card',
            shareCount: 8,
            engagement: 45
          }
        ]
      };

      mockApiResponse('get', mockAnalytics);

      const result = await socialMediaIntegrationService.getSocialAnalytics('user123');

      expect(result).toEqual(mockAnalytics);
    });
  });

  describe('inviteFriends', () => {
    it('應該成功邀請Facebook好友', async () => {
      const inviteData = {
        platform: 'facebook',
        friendIds: ['friend1', 'friend2'],
        message: '來加入卡片收藏家！',
        userId: 'user123'
      };

      const mockResponse = {
        sent: 2,
        failed: 0,
        invites: [
          { friendId: 'friend1', sent: true },
          { friendId: 'friend2', sent: true }
        ]
      };

      mockApiResponse('post', mockResponse);

      const result = await socialMediaIntegrationService.inviteFriends(inviteData);

      expect(result).toEqual(mockResponse);
    });

    it('應該處理邀請失敗的情況', async () => {
      const inviteData = {
        platform: 'facebook',
        friendIds: ['invalid_friend'],
        message: 'Test invite',
        userId: 'user123'
      };

      mockApiResponse('post', null, new Error('Invalid friend ID'));

      await expect(socialMediaIntegrationService.inviteFriends(inviteData)).rejects.toThrow('Invalid friend ID');
    });
  });

  describe('getFriendsList', () => {
    it('應該成功獲取Facebook好友列表', async () => {
      const mockFriends = [
        {
          id: 'friend1',
          name: 'Friend One',
          picture: 'friend1.jpg',
          isAppUser: true
        },
        {
          id: 'friend2',
          name: 'Friend Two',
          picture: 'friend2.jpg',
          isAppUser: false
        }
      ];

      mockApiResponse('get', mockFriends);

      const result = await socialMediaIntegrationService.getFriendsList('facebook', 'user123');

      expect(result).toEqual(mockFriends);
    });
  });

  describe('syncSocialData', () => {
    it('應該成功同步社交媒體數據', async () => {
      const syncData = {
        platform: 'facebook',
        userId: 'user123',
        syncType: 'profile'
      };

      const mockResponse = {
        synced: true,
        syncedAt: '2024-01-01T00:00:00Z',
        updatedFields: ['name', 'picture']
      };

      mockApiResponse('post', mockResponse);

      const result = await socialMediaIntegrationService.syncSocialData(syncData);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPlatformStatus', () => {
    it('應該返回正確的平台狀態', () => {
      const connectedAccounts = [
        { platform: 'facebook', connected: true },
        { platform: 'twitter', connected: false }
      ];

      const status = socialMediaIntegrationService.getPlatformStatus(connectedAccounts);

      expect(status).toEqual({
        facebook: { connected: true, available: true },
        twitter: { connected: false, available: true },
        instagram: { connected: false, available: false }
      });
    });
  });

  describe('formatShareMessage', () => {
    it('應該正確格式化分享訊息', () => {
      const cardData = {
        name: '稀有卡片',
        rarity: 'Legendary',
        price: 1000
      };

      const message = socialMediaIntegrationService.formatShareMessage('card', cardData, 'facebook');

      expect(message).toContain('稀有卡片');
      expect(message).toContain('Legendary');
      expect(message).toContain('1000');
    });

    it('應該處理不同平台的字數限制', () => {
      const cardData = {
        name: 'Very Long Card Name That Exceeds Twitter Character Limit',
        rarity: 'Legendary',
        price: 1000
      };

      const twitterMessage = socialMediaIntegrationService.formatShareMessage('card', cardData, 'twitter');
      const facebookMessage = socialMediaIntegrationService.formatShareMessage('card', cardData, 'facebook');

      expect(twitterMessage.length).toBeLessThanOrEqual(280);
      expect(facebookMessage.length).toBeGreaterThan(twitterMessage.length);
    });
  });

  describe('validatePlatform', () => {
    it('應該驗證支持的平台', () => {
      expect(socialMediaIntegrationService.validatePlatform('facebook')).toBe(true);
      expect(socialMediaIntegrationService.validatePlatform('twitter')).toBe(true);
      expect(socialMediaIntegrationService.validatePlatform('instagram')).toBe(false);
      expect(socialMediaIntegrationService.validatePlatform('invalid')).toBe(false);
    });
  });

  describe('getPlatformConfig', () => {
    it('應該返回正確的平台配置', () => {
      const facebookConfig = socialMediaIntegrationService.getPlatformConfig('facebook');
      const twitterConfig = socialMediaIntegrationService.getPlatformConfig('twitter');

      expect(facebookConfig).toEqual({
        name: 'Facebook',
        icon: 'facebook-icon',
        color: '#1877F2',
        maxMessageLength: 63206
      });

      expect(twitterConfig).toEqual({
        name: 'Twitter',
        icon: 'twitter-icon',
        color: '#1DA1F2',
        maxMessageLength: 280
      });
    });

    it('應該處理不支持的平台', () => {
      const config = socialMediaIntegrationService.getPlatformConfig('invalid');

      expect(config).toBeNull();
    });
  });

  describe('getSharePreview', () => {
    it('應該生成正確的分享預覽', () => {
      const cardData = {
        name: '測試卡片',
        image: 'card_image.jpg',
        rarity: 'Rare',
        price: 500
      };

      const preview = socialMediaIntegrationService.getSharePreview('card', cardData, 'facebook');

      expect(preview).toEqual({
        title: '測試卡片',
        description: '稀有度: Rare | 價格: $500',
        image: 'card_image.jpg',
        url: expect.stringContaining('card')
      });
    });
  });
});
