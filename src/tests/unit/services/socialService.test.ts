import { aiEcosystem } from '../../../services/aiEcosystem';
import { authService } from '../../../services/authService';
import { cardService } from '../../../services/cardService';
import { socialService } from '../../../services/socialService';
import { logger } from '../../../utils/logger';

// Mock 依賴
jest.mock('../../../services/authService');
jest.mock('../../../services/cardService');
jest.mock('../../../services/aiEcosystem');
jest.mock('../../../utils/logger');

const _mockAuthService = authService as jest.Mocked<typeof authService>;
const _mockCardService = cardService as jest.Mocked<typeof cardService>;
const _mockAiEcosystem = aiEcosystem as jest.Mocked<typeof aiEcosystem>;
const _mockLogger = logger as jest.Mocked<typeof logger>;

describe('SocialService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('應該SuccessInitialize社交功能Service', async () => {
      await socialService.initialize();

      expect(mockLogger.info).toHaveBeenCalledWith('Initialize社交功能Service...');
      expect(mockLogger.info).toHaveBeenCalledWith('社交功能ServiceInitialize完成');
    });

    it('應該Handle依賴Service未Initialize的情況', async () => {
      // 模擬依賴Service未Initialize
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.initialize()).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '社交功能ServiceInitializeFailed:',
        expect.any(Error)
      );
    });
  });

  describe('createUserProfile', () => {
    it('應該SuccessCreate用戶資料', async () => {
      const _profileData = {
        username: 'testuser',
        displayName: '測試用戶',
        bio: '這是一個測試用戶',
        location: '台北',
        website: 'https://example.com',
        socialLinks: {
          twitter: 'https://twitter.com/testuser',
        },
        preferences: {
          privacy: 'public' as const,
          notifications: true,
          emailUpdates: true,
        },
      };

      const _result = await socialService.createUserProfile(
        'user-1',
        profileData
      );

      expect(result).toMatchObject({
        userId: 'user-1',
        username: 'testuser',
        displayName: '測試用戶',
        bio: '這是一個測試用戶',
        location: '台北',
        website: 'https://example.com',
        socialLinks: {
          twitter: 'https://twitter.com/testuser',
        },
        preferences: {
          privacy: 'public',
          notifications: true,
          emailUpdates: true,
        },
        stats: {
          followers: 0,
          following: 0,
          posts: 0,
          likes: 0,
          reputation: 0,
        },
        badges: [],
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('創建用戶資料:', 'user-1');
      expect(mockLogger.info).toHaveBeenCalledWith('用戶資料CreateSuccess');
    });

    it('應該處理無效的用戶資料數據', async () => {
      const _invalidProfileData = {
        username: '', // 無效：Empty字符串
        displayName: '測試用戶',
      };

      await expect(
        socialService.createUserProfile('user-1', invalidProfileData)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Create用戶資料Failed:',
        expect.any(Error)
      );
    });

    it('應該使用默認值創建用戶資料', async () => {
      const _minimalProfileData = {
        username: 'testuser',
        displayName: '測試用戶',
      };

      const _result = await socialService.createUserProfile(
        'user-1',
        minimalProfileData
      );

      expect(result.avatar).toBe('');
      expect(result.bio).toBe('');
      expect(result.location).toBe('');
      expect(result.website).toBe('');
      expect(result.socialLinks).toEqual({});
      expect(result.preferences).toEqual({
        privacy: 'public',
        notifications: true,
        emailUpdates: true,
      });
    });
  });

  describe('updateUserProfile', () => {
    it('應該SuccessUpdate用戶資料', async () => {
      const _updates = {
        displayName: '更新後的用戶名',
        bio: '更新後的個人簡介',
      };

      const _result = await socialService.updateUserProfile('user-1', updates);

      expect(result).toMatchObject({
        displayName: '更新後的用戶名',
        bio: '更新後的個人簡介',
      });
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('更新用戶資料:', 'user-1');
      expect(mockLogger.info).toHaveBeenCalledWith('用戶資料UpdateSuccess');
    });

    it('應該處理用戶資料不存在的情況', async () => {
      const _updates = { displayName: '新名稱' };

      await expect(
        socialService.updateUserProfile('nonexistent-user', updates)
      ).rejects.toThrow('用戶資料不存在');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Update用戶資料Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getUserProfile', () => {
    it('應該SuccessGet用戶資料', async () => {
      const _result = await socialService.getUserProfile('user-1');

      expect(mockLogger.info).toHaveBeenCalledWith('獲取用戶資料:', 'user-1');
      // 目前實現Return null，所以這裡Test null
      expect(result).toBeNull();
    });

    it('應該HandleGet用戶資料Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.getUserProfile('user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get用戶資料Failed:',
        expect.any(Error)
      );
    });
  });

  describe('searchUsers', () => {
    it('應該Success搜索用戶', async () => {
      const _result = await socialService.searchUsers('test');

      expect(mockLogger.info).toHaveBeenCalledWith('搜索用戶:', 'test');
      expect(result).toEqual([]);
    });

    it('應該Handle搜索Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.searchUsers('test')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '搜索用戶Failed:',
        expect.any(Error)
      );
    });
  });

  describe('createPost', () => {
    it('應該SuccessCreate帖子', async () => {
      const _postData = {
        type: 'text' as const,
        content: {
          text: '這是一個測試帖子',
        },
        tags: ['測試', '社交'],
        visibility: 'public' as const,
      };

      const _result = await socialService.createPost('user-1', postData);

      expect(result).toMatchObject({
        authorId: 'user-1',
        type: 'text',
        content: {
          text: '這是一個測試帖子',
        },
        tags: ['測試', '社交'],
        visibility: 'public',
        stats: {
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0,
        },
        isEdited: false,
        isPinned: false,
        isSponsored: false,
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('創建帖子:', 'user-1');
      expect(mockLogger.info).toHaveBeenCalledWith('帖子CreateSuccess');
    });

    it('應該處理無效的帖子數據', async () => {
      const _invalidPostData = {
        type: 'text' as const,
        content: {
          text: 'a'.repeat(10001), // 超過最大長度
        },
        tags: ['測試'],
        visibility: 'public' as const,
      };

      await expect(
        socialService.createPost('user-1', invalidPostData)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Create帖子Failed:',
        expect.any(Error)
      );
    });

    it('應該處理過多的標籤', async () => {
      const _postData = {
        type: 'text' as const,
        content: {
          text: '測試帖子',
        },
        tags: Array(11).fill('標籤'), // 超過10個Tag
        visibility: 'public' as const,
      };

      await expect(
        socialService.createPost('user-1', postData)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Create帖子Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getPost', () => {
    it('應該SuccessGet帖子', async () => {
      const _result = await socialService.getPost('post-1');

      expect(mockLogger.info).toHaveBeenCalledWith('獲取帖子:', 'post-1');
      expect(result).toBeNull();
    });

    it('應該HandleGet帖子Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.getPost('post-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get帖子Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getUserPosts', () => {
    it('應該SuccessGet用戶帖子', async () => {
      const _result = await socialService.getUserPosts('user-1', 1, 20);

      expect(mockLogger.info).toHaveBeenCalledWith(
        '獲取用戶帖子:',
        'user-1',
        1,
        20
      );
      expect(result).toEqual([]);
    });

    it('應該HandleGet用戶帖子Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.getUserPosts('user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get用戶帖子Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getFeed', () => {
    it('應該SuccessGet動態流', async () => {
      const _result = await socialService.getFeed('user-1', 1, 20);

      expect(mockLogger.info).toHaveBeenCalledWith(
        '獲取動態流:',
        'user-1',
        1,
        20
      );
      expect(result).toEqual([]);
    });

    it('應該HandleGet動態流Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.getFeed('user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get動態流Failed:',
        expect.any(Error)
      );
    });
  });

  describe('updatePost', () => {
    it('應該SuccessUpdate帖子', async () => {
      const _updates = {
        content: {
          text: '更新後的帖子內容',
        },
      };

      const _result = await socialService.updatePost('post-1', updates);

      expect(result).toMatchObject({
        content: {
          text: '更新後的帖子內容',
        },
        isEdited: true,
      });
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('更新帖子:', 'post-1');
      expect(mockLogger.info).toHaveBeenCalledWith('帖子UpdateSuccess');
    });

    it('應該處理帖子不存在的情況', async () => {
      const _updates = { content: { text: '新內容' } };

      await expect(
        socialService.updatePost('nonexistent-post', updates)
      ).rejects.toThrow('帖子不存在');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Update帖子Failed:',
        expect.any(Error)
      );
    });
  });

  describe('deletePost', () => {
    it('應該SuccessDelete帖子', async () => {
      await socialService.deletePost('post-1', 'user-1');

      expect(mockLogger.info).toHaveBeenCalledWith(
        '刪除帖子:',
        'post-1',
        'user-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('帖子DeleteSuccess');
    });

    it('應該HandleDelete帖子Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        socialService.deletePost('post-1', 'user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Delete帖子Failed:',
        expect.any(Error)
      );
    });
  });

  describe('addComment', () => {
    it('應該Success添加評論', async () => {
      const _commentData = {
        content: '這是一個測試評論',
        parentId: 'parent-comment-1',
        mentions: ['user-2'],
      };

      const _result = await socialService.addComment(
        'post-1',
        'user-1',
        commentData
      );

      expect(result).toMatchObject({
        postId: 'post-1',
        authorId: 'user-1',
        content: '這是一個測試評論',
        parentId: 'parent-comment-1',
        mentions: ['user-2'],
        isEdited: false,
        stats: {
          likes: 0,
          replies: 0,
        },
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '添加評論:',
        'post-1',
        'user-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('評論添加Success');
    });

    it('應該處理無效的評論數據', async () => {
      const _invalidCommentData = {
        content: '', // 無效：EmptyContent
      };

      await expect(
        socialService.addComment('post-1', 'user-1', invalidCommentData)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '添加評論Failed:',
        expect.any(Error)
      );
    });

    it('應該處理評論內容過長', async () => {
      const _commentData = {
        content: 'a'.repeat(1001), // 超過最大長度
      };

      await expect(
        socialService.addComment('post-1', 'user-1', commentData)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '添加評論Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getPostComments', () => {
    it('應該SuccessGet帖子評論', async () => {
      const _result = await socialService.getPostComments('post-1', 1, 20);

      expect(mockLogger.info).toHaveBeenCalledWith(
        '獲取帖子評論:',
        'post-1',
        1,
        20
      );
      expect(result).toEqual([]);
    });

    it('應該HandleGet評論Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.getPostComments('post-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get帖子評論Failed:',
        expect.any(Error)
      );
    });
  });

  describe('likePost', () => {
    it('應該Success點讚帖子', async () => {
      const _result = await socialService.likePost('post-1', 'user-1', 'love');

      expect(result).toMatchObject({
        userId: 'user-1',
        targetType: 'post',
        targetId: 'post-1',
        type: 'love',
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '點讚帖子:',
        'post-1',
        'user-1',
        'love'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('點讚Success');
    });

    it('應該使用默認點讚類型', async () => {
      const _result = await socialService.likePost('post-1', 'user-1');

      expect(result.type).toBe('like');
    });

    it('應該Handle點讚Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        socialService.likePost('post-1', 'user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '點讚Failed:',
        expect.any(Error)
      );
    });
  });

  describe('unlikePost', () => {
    it('應該Success取消點讚', async () => {
      await socialService.unlikePost('post-1', 'user-1');

      expect(mockLogger.info).toHaveBeenCalledWith(
        '取消點讚:',
        'post-1',
        'user-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('取消點讚Success');
    });

    it('應該Handle取消點讚Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        socialService.unlikePost('post-1', 'user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '取消點讚Failed:',
        expect.any(Error)
      );
    });
  });

  describe('sharePost', () => {
    it('應該Success分享帖子', async () => {
      const _result = await socialService.sharePost(
        'post-1',
        'user-1',
        'twitter',
        '分享消息'
      );

      expect(result).toMatchObject({
        userId: 'user-1',
        originalPostId: 'post-1',
        platform: 'twitter',
        message: '分享消息',
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '分享帖子:',
        'post-1',
        'user-1',
        'twitter'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('分享Success');
    });

    it('應該Handle分享Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        socialService.sharePost('post-1', 'user-1', 'twitter')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '分享Failed:',
        expect.any(Error)
      );
    });
  });

  describe('followUser', () => {
    it('應該Success關注用戶', async () => {
      const _result = await socialService.followUser(
        'follower-1',
        'following-1'
      );

      expect(result).toMatchObject({
        followerId: 'follower-1',
        followingId: 'following-1',
        status: 'accepted',
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '關注用戶:',
        'follower-1',
        'following-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('關注Success');
    });

    it('應該Handle關注Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        socialService.followUser('follower-1', 'following-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '關注Failed:',
        expect.any(Error)
      );
    });
  });

  describe('unfollowUser', () => {
    it('應該Success取消關注', async () => {
      await socialService.unfollowUser('follower-1', 'following-1');

      expect(mockLogger.info).toHaveBeenCalledWith(
        '取消關注:',
        'follower-1',
        'following-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('取消關注Success');
    });

    it('應該Handle取消關注Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        socialService.unfollowUser('follower-1', 'following-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '取消關注Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getFollowers', () => {
    it('應該SuccessGet關注者列表', async () => {
      const _result = await socialService.getFollowers('user-1', 1, 20);

      expect(mockLogger.info).toHaveBeenCalledWith(
        '獲取關注者列表:',
        'user-1',
        1,
        20
      );
      expect(result).toEqual([]);
    });

    it('應該HandleGet關注者Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.getFollowers('user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get關注者列表Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getFollowing', () => {
    it('應該SuccessGet關注列表', async () => {
      const _result = await socialService.getFollowing('user-1', 1, 20);

      expect(mockLogger.info).toHaveBeenCalledWith(
        '獲取關注列表:',
        'user-1',
        1,
        20
      );
      expect(result).toEqual([]);
    });

    it('應該HandleGet關注列表Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.getFollowing('user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get關注列表Failed:',
        expect.any(Error)
      );
    });
  });

  describe('sendMessage', () => {
    it('應該Success發送消息', async () => {
      const _result = await socialService.sendMessage(
        'sender-1',
        'recipient-1',
        '測試消息',
        'text',
        { metadata: 'test' }
      );

      expect(result).toMatchObject({
        senderId: 'sender-1',
        recipientId: 'recipient-1',
        type: 'text',
        content: '測試消息',
        metadata: { metadata: 'test' },
        isRead: false,
        isEdited: false,
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '發送消息:',
        'sender-1',
        'recipient-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('消息發送Success');
    });

    it('應該使用默認消息類型', async () => {
      const _result = await socialService.sendMessage(
        'sender-1',
        'recipient-1',
        '測試消息'
      );

      expect(result.type).toBe('text');
    });

    it('應該Handle發送消息Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        socialService.sendMessage('sender-1', 'recipient-1', '測試消息')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '發送消息Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getConversations', () => {
    it('應該SuccessGet對話列表', async () => {
      const _result = await socialService.getConversations('user-1');

      expect(mockLogger.info).toHaveBeenCalledWith('獲取對話列表:', 'user-1');
      expect(result).toEqual([]);
    });

    it('應該HandleGet對話列表Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.getConversations('user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get對話列表Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getConversationMessages', () => {
    it('應該SuccessGet對話消息', async () => {
      const _result = await socialService.getConversationMessages(
        'conversation-1',
        1,
        50
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        '獲取對話消息:',
        'conversation-1',
        1,
        50
      );
      expect(result).toEqual([]);
    });

    it('應該HandleGet對話消息Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        socialService.getConversationMessages('conversation-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get對話消息Failed:',
        expect.any(Error)
      );
    });
  });

  describe('markMessageAsRead', () => {
    it('應該Success標記消息為已讀', async () => {
      await socialService.markMessageAsRead('message-1', 'user-1');

      expect(mockLogger.info).toHaveBeenCalledWith(
        '標記消息為已讀:',
        'message-1',
        'user-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('消息已標記為已讀');
    });

    it('應該Handle標記消息Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        socialService.markMessageAsRead('message-1', 'user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '標記消息為已讀Failed:',
        expect.any(Error)
      );
    });
  });

  describe('createCommunity', () => {
    it('應該SuccessCreate社區', async () => {
      const _communityData = {
        name: '測試社區',
        description: '這是一個測試社區',
        avatar: 'avatar.jpg',
        coverImage: 'cover.jpg',
        category: '遊戲',
        tags: ['卡片', '遊戲'],
        privacy: 'public' as const,
        rules: ['遵守規則'],
      };

      const _result = await socialService.createCommunity(
        'creator-1',
        communityData
      );

      expect(result).toMatchObject({
        name: '測試社區',
        description: '這是一個測試社區',
        avatar: 'avatar.jpg',
        coverImage: 'cover.jpg',
        category: '遊戲',
        tags: ['卡片', '遊戲'],
        privacy: 'public',
        rules: ['遵守規則'],
        stats: {
          members: 0,
          posts: 0,
          online: 0,
        },
        moderators: [],
        admins: ['creator-1'],
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('創建社區:', 'creator-1');
      expect(mockLogger.info).toHaveBeenCalledWith('社區CreateSuccess');
    });

    it('應該HandleCreate社區Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        socialService.createCommunity('creator-1', {})
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Create社區Failed:',
        expect.any(Error)
      );
    });
  });

  describe('joinCommunity', () => {
    it('應該Success加入社區', async () => {
      const _result = await socialService.joinCommunity('community-1', 'user-1');

      expect(result).toMatchObject({
        communityId: 'community-1',
        userId: 'user-1',
        role: 'member',
        status: 'active',
      });
      expect(result.id).toBeDefined();
      expect(result.joinedAt).toBeInstanceOf(Date);
      expect(result.lastActiveAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '加入社區:',
        'community-1',
        'user-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('加入社區Success');
    });

    it('應該Handle加入社區Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        socialService.joinCommunity('community-1', 'user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '加入社區Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getCommunityPosts', () => {
    it('應該SuccessGet社區帖子', async () => {
      const _result = await socialService.getCommunityPosts(
        'community-1',
        1,
        20
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        '獲取社區帖子:',
        'community-1',
        1,
        20
      );
      expect(result).toEqual([]);
    });

    it('應該HandleGet社區帖子Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        socialService.getCommunityPosts('community-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get社區帖子Failed:',
        expect.any(Error)
      );
    });
  });

  describe('createNotification', () => {
    it('應該SuccessCreate通知', async () => {
      const _notificationData = {
        type: 'like' as const,
        title: '新點讚',
        message: '有人點讚了你的帖子',
        data: { postId: 'post-1' },
        isActionable: true,
        actionUrl: '/post/post-1',
      };

      const _result = await socialService.createNotification(
        'user-1',
        notificationData
      );

      expect(result).toMatchObject({
        userId: 'user-1',
        type: 'like',
        title: '新點讚',
        message: '有人點讚了你的帖子',
        data: { postId: 'post-1' },
        isRead: false,
        isActionable: true,
        actionUrl: '/post/post-1',
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('創建通知:', 'user-1');
      expect(mockLogger.info).toHaveBeenCalledWith('通知CreateSuccess');
    });

    it('應該HandleCreate通知Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        socialService.createNotification('user-1', {})
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Create通知Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getUserNotifications', () => {
    it('應該SuccessGet用戶通知', async () => {
      const _result = await socialService.getUserNotifications('user-1', 1, 20);

      expect(mockLogger.info).toHaveBeenCalledWith(
        '獲取用戶通知:',
        'user-1',
        1,
        20
      );
      expect(result).toEqual([]);
    });

    it('應該HandleGet通知Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        socialService.getUserNotifications('user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get用戶通知Failed:',
        expect.any(Error)
      );
    });
  });

  describe('markNotificationAsRead', () => {
    it('應該Success標記通知為已讀', async () => {
      await socialService.markNotificationAsRead('notification-1', 'user-1');

      expect(mockLogger.info).toHaveBeenCalledWith(
        '標記通知為已讀:',
        'notification-1',
        'user-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('通知已標記為已讀');
    });

    it('應該Handle標記通知Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        socialService.markNotificationAsRead('notification-1', 'user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '標記通知為已讀Failed:',
        expect.any(Error)
      );
    });
  });

  describe('getSocialAnalytics', () => {
    it('應該SuccessGet社交分析', async () => {
      const _result = await socialService.getSocialAnalytics('user-1', 'month');

      expect(result).toMatchObject({
        userId: 'user-1',
        period: 'month',
        metrics: {
          followers: 0,
          following: 0,
          posts: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0,
          engagement: 0,
        },
        trends: [],
        topPosts: [],
        topFollowers: [],
      });
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '獲取社交分析:',
        'user-1',
        'month'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('社交分析GetSuccess');
    });

    it('應該HandleGet分析Failed', async () => {
      // 模擬Error情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        socialService.getSocialAnalytics('user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Get社交分析Failed:',
        expect.any(Error)
      );
    });
  });

  describe('配置管理', () => {
    it('應該SuccessGetConfigure', () => {
      const _config = socialService.getConfig();

      expect(config).toMatchObject({
        enableUserProfiles: true,
        enableContentSharing: true,
        enableSocialNetworking: true,
        enableCommunityFeatures: true,
        enableMessaging: true,
        enableNotifications: true,
        enableModeration: true,
        enableAnalytics: true,
        enableGamification: true,
        enableCollaboration: true,
      });
    });

    it('應該SuccessUpdateConfigure', () => {
      const _newConfig = {
        enableUserProfiles: false,
        enableMessaging: false,
      };

      socialService.updateConfig(newConfig);

      const _updatedConfig = socialService.getConfig();
      expect(updatedConfig.enableUserProfiles).toBe(false);
      expect(updatedConfig.enableMessaging).toBe(false);
      expect(mockLogger.info).toHaveBeenCalledWith('社交功能ServiceConfigure已Update');
    });

    it('應該CheckService狀態', () => {
      expect(socialService.isReady()).toBe(false); // 未Initialize

      // Initialize後應該Return true
      socialService.initialize().then(() => {
        expect(socialService.isReady()).toBe(true);
      });
    });
  });
});
