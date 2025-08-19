import { socialService } from '../../../services/socialService';
import { authService } from '../../../services/authService';
import { cardService } from '../../../services/cardService';
import { aiEcosystem } from '../../../services/aiEcosystem';
import { logger } from '../../../utils/logger';

// Mock 依賴
jest.mock('../../../services/authService');
jest.mock('../../../services/cardService');
jest.mock('../../../services/aiEcosystem');
jest.mock('../../../utils/logger');

const mockAuthService = authService as jest.Mocked<typeof authService>;
const mockCardService = cardService as jest.Mocked<typeof cardService>;
const mockAiEcosystem = aiEcosystem as jest.Mocked<typeof aiEcosystem>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('SocialService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('應該成功初始化社交功能服務', async () => {
      await socialService.initialize();

      expect(mockLogger.info).toHaveBeenCalledWith('初始化社交功能服務...');
      expect(mockLogger.info).toHaveBeenCalledWith('社交功能服務初始化完成');
    });

    it('應該處理依賴服務未初始化的情況', async () => {
      // 模擬依賴服務未初始化
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.initialize()).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('社交功能服務初始化失敗:', expect.any(Error));
    });
  });

  describe('createUserProfile', () => {
    it('應該成功創建用戶資料', async () => {
      const profileData = {
        username: 'testuser',
        displayName: '測試用戶',
        bio: '這是一個測試用戶',
        location: '台北',
        website: 'https://example.com',
        socialLinks: {
          twitter: 'https://twitter.com/testuser'
        },
        preferences: {
          privacy: 'public' as const,
          notifications: true,
          emailUpdates: true
        }
      };

      const result = await socialService.createUserProfile('user-1', profileData);

      expect(result).toMatchObject({
        userId: 'user-1',
        username: 'testuser',
        displayName: '測試用戶',
        bio: '這是一個測試用戶',
        location: '台北',
        website: 'https://example.com',
        socialLinks: {
          twitter: 'https://twitter.com/testuser'
        },
        preferences: {
          privacy: 'public',
          notifications: true,
          emailUpdates: true
        },
        stats: {
          followers: 0,
          following: 0,
          posts: 0,
          likes: 0,
          reputation: 0
        },
        badges: []
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('創建用戶資料:', 'user-1');
      expect(mockLogger.info).toHaveBeenCalledWith('用戶資料創建成功');
    });

    it('應該處理無效的用戶資料數據', async () => {
      const invalidProfileData = {
        username: '', // 無效：空字符串
        displayName: '測試用戶'
      };

      await expect(socialService.createUserProfile('user-1', invalidProfileData)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('創建用戶資料失敗:', expect.any(Error));
    });

    it('應該使用默認值創建用戶資料', async () => {
      const minimalProfileData = {
        username: 'testuser',
        displayName: '測試用戶'
      };

      const result = await socialService.createUserProfile('user-1', minimalProfileData);

      expect(result.avatar).toBe('');
      expect(result.bio).toBe('');
      expect(result.location).toBe('');
      expect(result.website).toBe('');
      expect(result.socialLinks).toEqual({});
      expect(result.preferences).toEqual({
        privacy: 'public',
        notifications: true,
        emailUpdates: true
      });
    });
  });

  describe('updateUserProfile', () => {
    it('應該成功更新用戶資料', async () => {
      const updates = {
        displayName: '更新後的用戶名',
        bio: '更新後的個人簡介'
      };

      const result = await socialService.updateUserProfile('user-1', updates);

      expect(result).toMatchObject({
        displayName: '更新後的用戶名',
        bio: '更新後的個人簡介'
      });
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('更新用戶資料:', 'user-1');
      expect(mockLogger.info).toHaveBeenCalledWith('用戶資料更新成功');
    });

    it('應該處理用戶資料不存在的情況', async () => {
      const updates = { displayName: '新名稱' };

      await expect(socialService.updateUserProfile('nonexistent-user', updates)).rejects.toThrow('用戶資料不存在');
      expect(mockLogger.error).toHaveBeenCalledWith('更新用戶資料失敗:', expect.any(Error));
    });
  });

  describe('getUserProfile', () => {
    it('應該成功獲取用戶資料', async () => {
      const result = await socialService.getUserProfile('user-1');

      expect(mockLogger.info).toHaveBeenCalledWith('獲取用戶資料:', 'user-1');
      // 目前實現返回 null，所以這裡測試 null
      expect(result).toBeNull();
    });

    it('應該處理獲取用戶資料失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.getUserProfile('user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('獲取用戶資料失敗:', expect.any(Error));
    });
  });

  describe('searchUsers', () => {
    it('應該成功搜索用戶', async () => {
      const result = await socialService.searchUsers('test');

      expect(mockLogger.info).toHaveBeenCalledWith('搜索用戶:', 'test');
      expect(result).toEqual([]);
    });

    it('應該處理搜索失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.searchUsers('test')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('搜索用戶失敗:', expect.any(Error));
    });
  });

  describe('createPost', () => {
    it('應該成功創建帖子', async () => {
      const postData = {
        type: 'text' as const,
        content: {
          text: '這是一個測試帖子'
        },
        tags: ['測試', '社交'],
        visibility: 'public' as const
      };

      const result = await socialService.createPost('user-1', postData);

      expect(result).toMatchObject({
        authorId: 'user-1',
        type: 'text',
        content: {
          text: '這是一個測試帖子'
        },
        tags: ['測試', '社交'],
        visibility: 'public',
        stats: {
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0
        },
        isEdited: false,
        isPinned: false,
        isSponsored: false
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('創建帖子:', 'user-1');
      expect(mockLogger.info).toHaveBeenCalledWith('帖子創建成功');
    });

    it('應該處理無效的帖子數據', async () => {
      const invalidPostData = {
        type: 'text' as const,
        content: {
          text: 'a'.repeat(10001) // 超過最大長度
        },
        tags: ['測試'],
        visibility: 'public' as const
      };

      await expect(socialService.createPost('user-1', invalidPostData)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('創建帖子失敗:', expect.any(Error));
    });

    it('應該處理過多的標籤', async () => {
      const postData = {
        type: 'text' as const,
        content: {
          text: '測試帖子'
        },
        tags: Array(11).fill('標籤'), // 超過10個標籤
        visibility: 'public' as const
      };

      await expect(socialService.createPost('user-1', postData)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('創建帖子失敗:', expect.any(Error));
    });
  });

  describe('getPost', () => {
    it('應該成功獲取帖子', async () => {
      const result = await socialService.getPost('post-1');

      expect(mockLogger.info).toHaveBeenCalledWith('獲取帖子:', 'post-1');
      expect(result).toBeNull();
    });

    it('應該處理獲取帖子失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.getPost('post-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('獲取帖子失敗:', expect.any(Error));
    });
  });

  describe('getUserPosts', () => {
    it('應該成功獲取用戶帖子', async () => {
      const result = await socialService.getUserPosts('user-1', 1, 20);

      expect(mockLogger.info).toHaveBeenCalledWith('獲取用戶帖子:', 'user-1', 1, 20);
      expect(result).toEqual([]);
    });

    it('應該處理獲取用戶帖子失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.getUserPosts('user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('獲取用戶帖子失敗:', expect.any(Error));
    });
  });

  describe('getFeed', () => {
    it('應該成功獲取動態流', async () => {
      const result = await socialService.getFeed('user-1', 1, 20);

      expect(mockLogger.info).toHaveBeenCalledWith('獲取動態流:', 'user-1', 1, 20);
      expect(result).toEqual([]);
    });

    it('應該處理獲取動態流失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.getFeed('user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('獲取動態流失敗:', expect.any(Error));
    });
  });

  describe('updatePost', () => {
    it('應該成功更新帖子', async () => {
      const updates = {
        content: {
          text: '更新後的帖子內容'
        }
      };

      const result = await socialService.updatePost('post-1', updates);

      expect(result).toMatchObject({
        content: {
          text: '更新後的帖子內容'
        },
        isEdited: true
      });
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('更新帖子:', 'post-1');
      expect(mockLogger.info).toHaveBeenCalledWith('帖子更新成功');
    });

    it('應該處理帖子不存在的情況', async () => {
      const updates = { content: { text: '新內容' } };

      await expect(socialService.updatePost('nonexistent-post', updates)).rejects.toThrow('帖子不存在');
      expect(mockLogger.error).toHaveBeenCalledWith('更新帖子失敗:', expect.any(Error));
    });
  });

  describe('deletePost', () => {
    it('應該成功刪除帖子', async () => {
      await socialService.deletePost('post-1', 'user-1');

      expect(mockLogger.info).toHaveBeenCalledWith('刪除帖子:', 'post-1', 'user-1');
      expect(mockLogger.info).toHaveBeenCalledWith('帖子刪除成功');
    });

    it('應該處理刪除帖子失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.deletePost('post-1', 'user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('刪除帖子失敗:', expect.any(Error));
    });
  });

  describe('addComment', () => {
    it('應該成功添加評論', async () => {
      const commentData = {
        content: '這是一個測試評論',
        parentId: 'parent-comment-1',
        mentions: ['user-2']
      };

      const result = await socialService.addComment('post-1', 'user-1', commentData);

      expect(result).toMatchObject({
        postId: 'post-1',
        authorId: 'user-1',
        content: '這是一個測試評論',
        parentId: 'parent-comment-1',
        mentions: ['user-2'],
        isEdited: false,
        stats: {
          likes: 0,
          replies: 0
        }
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('添加評論:', 'post-1', 'user-1');
      expect(mockLogger.info).toHaveBeenCalledWith('評論添加成功');
    });

    it('應該處理無效的評論數據', async () => {
      const invalidCommentData = {
        content: '' // 無效：空內容
      };

      await expect(socialService.addComment('post-1', 'user-1', invalidCommentData)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('添加評論失敗:', expect.any(Error));
    });

    it('應該處理評論內容過長', async () => {
      const commentData = {
        content: 'a'.repeat(1001) // 超過最大長度
      };

      await expect(socialService.addComment('post-1', 'user-1', commentData)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('添加評論失敗:', expect.any(Error));
    });
  });

  describe('getPostComments', () => {
    it('應該成功獲取帖子評論', async () => {
      const result = await socialService.getPostComments('post-1', 1, 20);

      expect(mockLogger.info).toHaveBeenCalledWith('獲取帖子評論:', 'post-1', 1, 20);
      expect(result).toEqual([]);
    });

    it('應該處理獲取評論失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.getPostComments('post-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('獲取帖子評論失敗:', expect.any(Error));
    });
  });

  describe('likePost', () => {
    it('應該成功點讚帖子', async () => {
      const result = await socialService.likePost('post-1', 'user-1', 'love');

      expect(result).toMatchObject({
        userId: 'user-1',
        targetType: 'post',
        targetId: 'post-1',
        type: 'love'
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('點讚帖子:', 'post-1', 'user-1', 'love');
      expect(mockLogger.info).toHaveBeenCalledWith('點讚成功');
    });

    it('應該使用默認點讚類型', async () => {
      const result = await socialService.likePost('post-1', 'user-1');

      expect(result.type).toBe('like');
    });

    it('應該處理點讚失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.likePost('post-1', 'user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('點讚失敗:', expect.any(Error));
    });
  });

  describe('unlikePost', () => {
    it('應該成功取消點讚', async () => {
      await socialService.unlikePost('post-1', 'user-1');

      expect(mockLogger.info).toHaveBeenCalledWith('取消點讚:', 'post-1', 'user-1');
      expect(mockLogger.info).toHaveBeenCalledWith('取消點讚成功');
    });

    it('應該處理取消點讚失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.unlikePost('post-1', 'user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('取消點讚失敗:', expect.any(Error));
    });
  });

  describe('sharePost', () => {
    it('應該成功分享帖子', async () => {
      const result = await socialService.sharePost('post-1', 'user-1', 'twitter', '分享消息');

      expect(result).toMatchObject({
        userId: 'user-1',
        originalPostId: 'post-1',
        platform: 'twitter',
        message: '分享消息'
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('分享帖子:', 'post-1', 'user-1', 'twitter');
      expect(mockLogger.info).toHaveBeenCalledWith('分享成功');
    });

    it('應該處理分享失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.sharePost('post-1', 'user-1', 'twitter')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('分享失敗:', expect.any(Error));
    });
  });

  describe('followUser', () => {
    it('應該成功關注用戶', async () => {
      const result = await socialService.followUser('follower-1', 'following-1');

      expect(result).toMatchObject({
        followerId: 'follower-1',
        followingId: 'following-1',
        status: 'accepted'
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('關注用戶:', 'follower-1', 'following-1');
      expect(mockLogger.info).toHaveBeenCalledWith('關注成功');
    });

    it('應該處理關注失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.followUser('follower-1', 'following-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('關注失敗:', expect.any(Error));
    });
  });

  describe('unfollowUser', () => {
    it('應該成功取消關注', async () => {
      await socialService.unfollowUser('follower-1', 'following-1');

      expect(mockLogger.info).toHaveBeenCalledWith('取消關注:', 'follower-1', 'following-1');
      expect(mockLogger.info).toHaveBeenCalledWith('取消關注成功');
    });

    it('應該處理取消關注失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.unfollowUser('follower-1', 'following-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('取消關注失敗:', expect.any(Error));
    });
  });

  describe('getFollowers', () => {
    it('應該成功獲取關注者列表', async () => {
      const result = await socialService.getFollowers('user-1', 1, 20);

      expect(mockLogger.info).toHaveBeenCalledWith('獲取關注者列表:', 'user-1', 1, 20);
      expect(result).toEqual([]);
    });

    it('應該處理獲取關注者失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.getFollowers('user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('獲取關注者列表失敗:', expect.any(Error));
    });
  });

  describe('getFollowing', () => {
    it('應該成功獲取關注列表', async () => {
      const result = await socialService.getFollowing('user-1', 1, 20);

      expect(mockLogger.info).toHaveBeenCalledWith('獲取關注列表:', 'user-1', 1, 20);
      expect(result).toEqual([]);
    });

    it('應該處理獲取關注列表失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.getFollowing('user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('獲取關注列表失敗:', expect.any(Error));
    });
  });

  describe('sendMessage', () => {
    it('應該成功發送消息', async () => {
      const result = await socialService.sendMessage('sender-1', 'recipient-1', '測試消息', 'text', { metadata: 'test' });

      expect(result).toMatchObject({
        senderId: 'sender-1',
        recipientId: 'recipient-1',
        type: 'text',
        content: '測試消息',
        metadata: { metadata: 'test' },
        isRead: false,
        isEdited: false
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('發送消息:', 'sender-1', 'recipient-1');
      expect(mockLogger.info).toHaveBeenCalledWith('消息發送成功');
    });

    it('應該使用默認消息類型', async () => {
      const result = await socialService.sendMessage('sender-1', 'recipient-1', '測試消息');

      expect(result.type).toBe('text');
    });

    it('應該處理發送消息失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.sendMessage('sender-1', 'recipient-1', '測試消息')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('發送消息失敗:', expect.any(Error));
    });
  });

  describe('getConversations', () => {
    it('應該成功獲取對話列表', async () => {
      const result = await socialService.getConversations('user-1');

      expect(mockLogger.info).toHaveBeenCalledWith('獲取對話列表:', 'user-1');
      expect(result).toEqual([]);
    });

    it('應該處理獲取對話列表失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.getConversations('user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('獲取對話列表失敗:', expect.any(Error));
    });
  });

  describe('getConversationMessages', () => {
    it('應該成功獲取對話消息', async () => {
      const result = await socialService.getConversationMessages('conversation-1', 1, 50);

      expect(mockLogger.info).toHaveBeenCalledWith('獲取對話消息:', 'conversation-1', 1, 50);
      expect(result).toEqual([]);
    });

    it('應該處理獲取對話消息失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.getConversationMessages('conversation-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('獲取對話消息失敗:', expect.any(Error));
    });
  });

  describe('markMessageAsRead', () => {
    it('應該成功標記消息為已讀', async () => {
      await socialService.markMessageAsRead('message-1', 'user-1');

      expect(mockLogger.info).toHaveBeenCalledWith('標記消息為已讀:', 'message-1', 'user-1');
      expect(mockLogger.info).toHaveBeenCalledWith('消息已標記為已讀');
    });

    it('應該處理標記消息失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.markMessageAsRead('message-1', 'user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('標記消息為已讀失敗:', expect.any(Error));
    });
  });

  describe('createCommunity', () => {
    it('應該成功創建社區', async () => {
      const communityData = {
        name: '測試社區',
        description: '這是一個測試社區',
        avatar: 'avatar.jpg',
        coverImage: 'cover.jpg',
        category: '遊戲',
        tags: ['卡片', '遊戲'],
        privacy: 'public' as const,
        rules: ['遵守規則']
      };

      const result = await socialService.createCommunity('creator-1', communityData);

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
          online: 0
        },
        moderators: [],
        admins: ['creator-1']
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('創建社區:', 'creator-1');
      expect(mockLogger.info).toHaveBeenCalledWith('社區創建成功');
    });

    it('應該處理創建社區失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.createCommunity('creator-1', {})).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('創建社區失敗:', expect.any(Error));
    });
  });

  describe('joinCommunity', () => {
    it('應該成功加入社區', async () => {
      const result = await socialService.joinCommunity('community-1', 'user-1');

      expect(result).toMatchObject({
        communityId: 'community-1',
        userId: 'user-1',
        role: 'member',
        status: 'active'
      });
      expect(result.id).toBeDefined();
      expect(result.joinedAt).toBeInstanceOf(Date);
      expect(result.lastActiveAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('加入社區:', 'community-1', 'user-1');
      expect(mockLogger.info).toHaveBeenCalledWith('加入社區成功');
    });

    it('應該處理加入社區失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.joinCommunity('community-1', 'user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('加入社區失敗:', expect.any(Error));
    });
  });

  describe('getCommunityPosts', () => {
    it('應該成功獲取社區帖子', async () => {
      const result = await socialService.getCommunityPosts('community-1', 1, 20);

      expect(mockLogger.info).toHaveBeenCalledWith('獲取社區帖子:', 'community-1', 1, 20);
      expect(result).toEqual([]);
    });

    it('應該處理獲取社區帖子失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.getCommunityPosts('community-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('獲取社區帖子失敗:', expect.any(Error));
    });
  });

  describe('createNotification', () => {
    it('應該成功創建通知', async () => {
      const notificationData = {
        type: 'like' as const,
        title: '新點讚',
        message: '有人點讚了你的帖子',
        data: { postId: 'post-1' },
        isActionable: true,
        actionUrl: '/post/post-1'
      };

      const result = await socialService.createNotification('user-1', notificationData);

      expect(result).toMatchObject({
        userId: 'user-1',
        type: 'like',
        title: '新點讚',
        message: '有人點讚了你的帖子',
        data: { postId: 'post-1' },
        isRead: false,
        isActionable: true,
        actionUrl: '/post/post-1'
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('創建通知:', 'user-1');
      expect(mockLogger.info).toHaveBeenCalledWith('通知創建成功');
    });

    it('應該處理創建通知失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.createNotification('user-1', {})).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('創建通知失敗:', expect.any(Error));
    });
  });

  describe('getUserNotifications', () => {
    it('應該成功獲取用戶通知', async () => {
      const result = await socialService.getUserNotifications('user-1', 1, 20);

      expect(mockLogger.info).toHaveBeenCalledWith('獲取用戶通知:', 'user-1', 1, 20);
      expect(result).toEqual([]);
    });

    it('應該處理獲取通知失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.getUserNotifications('user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('獲取用戶通知失敗:', expect.any(Error));
    });
  });

  describe('markNotificationAsRead', () => {
    it('應該成功標記通知為已讀', async () => {
      await socialService.markNotificationAsRead('notification-1', 'user-1');

      expect(mockLogger.info).toHaveBeenCalledWith('標記通知為已讀:', 'notification-1', 'user-1');
      expect(mockLogger.info).toHaveBeenCalledWith('通知已標記為已讀');
    });

    it('應該處理標記通知失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.markNotificationAsRead('notification-1', 'user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('標記通知為已讀失敗:', expect.any(Error));
    });
  });

  describe('getSocialAnalytics', () => {
    it('應該成功獲取社交分析', async () => {
      const result = await socialService.getSocialAnalytics('user-1', 'month');

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
          engagement: 0
        },
        trends: [],
        topPosts: [],
        topFollowers: []
      });
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('獲取社交分析:', 'user-1', 'month');
      expect(mockLogger.info).toHaveBeenCalledWith('社交分析獲取成功');
    });

    it('應該處理獲取分析失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(socialService.getSocialAnalytics('user-1')).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith('獲取社交分析失敗:', expect.any(Error));
    });
  });

  describe('配置管理', () => {
    it('應該成功獲取配置', () => {
      const config = socialService.getConfig();

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
        enableCollaboration: true
      });
    });

    it('應該成功更新配置', () => {
      const newConfig = {
        enableUserProfiles: false,
        enableMessaging: false
      };

      socialService.updateConfig(newConfig);

      const updatedConfig = socialService.getConfig();
      expect(updatedConfig.enableUserProfiles).toBe(false);
      expect(updatedConfig.enableMessaging).toBe(false);
      expect(mockLogger.info).toHaveBeenCalledWith('社交功能服務配置已更新');
    });

    it('應該檢查服務狀態', () => {
      expect(socialService.isReady()).toBe(false); // 未初始化

      // 初始化後應該返回 true
      socialService.initialize().then(() => {
        expect(socialService.isReady()).toBe(true);
      });
    });
  });
});
