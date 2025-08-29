import { aiEcosystem } from '../../../services/aiEcosystem';
import { authService } from '../../../services/authService';
import { gamificationService } from '../../../services/gamificationService';
import { socialService } from '../../../services/socialService';
import { logger } from '../../../utils/logger';

// Mock 依賴
jest.mock('../../../services/authService');
jest.mock('../../../services/socialService');
jest.mock('../../../services/aiEcosystem');
jest.mock('../../../utils/logger');

const _mockAuthService = authService as jest.Mocked<typeof authService>;
const _mockSocialService = socialService as jest.Mocked<typeof socialService>;
const _mockAiEcosystem = aiEcosystem as jest.Mocked<typeof aiEcosystem>;
const _mockLogger = logger as jest.Mocked<typeof logger>;

describe('GamificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('應該成功初始化遊戲化服務', async () => {
      await gamificationService.initialize();

      expect(mockLogger.info).toHaveBeenCalledWith('初始化遊戲化服務...');
      expect(mockLogger.info).toHaveBeenCalledWith('遊戲化系統初始化完成');
      expect(mockLogger.info).toHaveBeenCalledWith('遊戲化配置已加載');
      expect(mockLogger.info).toHaveBeenCalledWith('遊戲化服務初始化完成');
    });

    it('應該處理依賴服務未初始化的情況', async () => {
      // 模擬依賴服務未初始化
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(gamificationService.initialize()).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '遊戲化服務初始化失敗:',
        expect.any(Error)
      );
    });
  });

  describe('createAchievement', () => {
    it('應該成功創建成就', async () => {
      const _achievementData = {
        name: '測試成就',
        description: '這是一個測試成就',
        category: 'collection' as const,
        rarity: 'common' as const,
        points: 100,
        requirements: [
          {
            type: 'action' as const,
            action: 'add_card',
            target: 10,
          },
        ],
        icon: '🏆',
        isHidden: false,
        isRepeatable: false,
        maxProgress: 10,
      };

      const _result =
        await gamificationService.createAchievement(achievementData);

      expect(result).toMatchObject({
        name: '測試成就',
        description: '這是一個測試成就',
        category: 'collection',
        rarity: 'common',
        points: 100,
        requirements: [
          {
            type: 'action',
            action: 'add_card',
            target: 10,
          },
        ],
        icon: '🏆',
        isHidden: false,
        isRepeatable: false,
        maxProgress: 10,
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('創建成就:', '測試成就');
      expect(mockLogger.info).toHaveBeenCalledWith('成就創建成功');
    });

    it('應該處理無效的成就數據', async () => {
      const _invalidAchievementData = {
        name: '', // 無效：空名稱
        description: '這是一個測試成就',
        category: 'collection' as const,
        rarity: 'common' as const,
        points: 100,
        requirements: [],
      };

      await expect(
        gamificationService.createAchievement(invalidAchievementData)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '創建成就失敗:',
        expect.any(Error)
      );
    });

    it('應該使用默認值創建成就', async () => {
      const _minimalAchievementData = {
        name: '測試成就',
        description: '這是一個測試成就',
        category: 'collection' as const,
        rarity: 'common' as const,
        points: 100,
        requirements: [],
      };

      const _result = await gamificationService.createAchievement(
        minimalAchievementData
      );

      expect(result.icon).toBe('🏆');
      expect(result.isHidden).toBe(false);
      expect(result.isRepeatable).toBe(false);
      expect(result.maxProgress).toBe(1);
      expect(result.rewards).toEqual([]);
    });
  });

  describe('getAchievement', () => {
    it('應該成功獲取成就', async () => {
      // 先創建一個成就
      const _achievementData = {
        name: '測試成就',
        description: '這是一個測試成就',
        category: 'collection' as const,
        rarity: 'common' as const,
        points: 100,
        requirements: [],
      };

      const _createdAchievement =
        await gamificationService.createAchievement(achievementData);
      const _result = await gamificationService.getAchievement(
        createdAchievement.id
      );

      expect(result).toEqual(createdAchievement);
    });

    it('應該在成就不存在時返回 null', async () => {
      const _result = await gamificationService.getAchievement(
        'nonexistent-achievement'
      );

      expect(result).toBeNull();
    });
  });

  describe('getAllAchievements', () => {
    it('應該成功獲取所有成就', async () => {
      // 創建多個成就
      const _achievement1 = await gamificationService.createAchievement({
        name: '成就1',
        description: '第一個成就',
        category: 'collection' as const,
        rarity: 'common' as const,
        points: 100,
        requirements: [],
      });

      const _achievement2 = await gamificationService.createAchievement({
        name: '成就2',
        description: '第二個成就',
        category: 'social' as const,
        rarity: 'rare' as const,
        points: 200,
        requirements: [],
      });

      const _result = await gamificationService.getAllAchievements();

      expect(result).toHaveLength(5); // 3個默認成就 + 2個新創建的成就
      expect(result).toContainEqual(achievement1);
      expect(result).toContainEqual(achievement2);
    });
  });

  describe('getUserAchievements', () => {
    it('應該成功獲取用戶成就', async () => {
      const _result = await gamificationService.getUserAchievements('user-1');

      expect(mockLogger.info).toHaveBeenCalledWith('獲取用戶成就:', 'user-1');
      expect(result).toEqual([]);
    });

    it('應該處理獲取用戶成就失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        gamificationService.getUserAchievements('user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '獲取用戶成就失敗:',
        expect.any(Error)
      );
    });
  });

  describe('checkAchievementProgress', () => {
    it('應該成功檢查成就進度', async () => {
      await gamificationService.checkAchievementProgress(
        'user-1',
        'add_card',
        5
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        '檢查成就進度:',
        'user-1',
        'add_card',
        5
      );
    });

    it('應該處理檢查成就進度失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        gamificationService.checkAchievementProgress('user-1', 'add_card')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '檢查成就進度失敗:',
        expect.any(Error)
      );
    });
  });

  describe('getUserPoints', () => {
    it('應該成功獲取用戶積分', async () => {
      const _result = await gamificationService.getUserPoints('user-1');

      expect(mockLogger.info).toHaveBeenCalledWith('獲取用戶積分:', 'user-1');
      expect(result).toBeNull();
    });

    it('應該處理獲取用戶積分失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        gamificationService.getUserPoints('user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '獲取用戶積分失敗:',
        expect.any(Error)
      );
    });
  });

  describe('addPoints', () => {
    it('應該成功添加積分', async () => {
      await gamificationService.addPoints(
        'user-1',
        100,
        'collection',
        '添加卡片'
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        '添加積分:',
        'user-1',
        100,
        'collection',
        '添加卡片'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('積分添加成功');
    });

    it('應該處理添加積分失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        gamificationService.addPoints('user-1', 100)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '添加積分失敗:',
        expect.any(Error)
      );
    });

    it('應該使用默認參數添加積分', async () => {
      await gamificationService.addPoints('user-1', 50);

      expect(mockLogger.info).toHaveBeenCalledWith(
        '添加積分:',
        'user-1',
        50,
        'general',
        ''
      );
    });
  });

  describe('calculateUserLevel', () => {
    it('應該成功計算用戶等級', async () => {
      const _result = await gamificationService.calculateUserLevel('user-1');

      expect(result).toEqual({
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
      });
      expect(mockLogger.info).toHaveBeenCalledWith('計算用戶等級:', 'user-1');
    });

    it('應該處理計算用戶等級失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        gamificationService.calculateUserLevel('user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '計算用戶等級失敗:',
        expect.any(Error)
      );
    });
  });

  describe('createLeaderboard', () => {
    it('應該成功創建排行榜', async () => {
      const _leaderboardData = {
        name: '測試排行榜',
        description: '這是一個測試排行榜',
        type: 'points' as const,
        metric: 'total_points',
        timeframe: 'weekly' as const,
        scope: 'global' as const,
        maxEntries: 50,
      };

      const _result =
        await gamificationService.createLeaderboard(leaderboardData);

      expect(result).toMatchObject({
        name: '測試排行榜',
        description: '這是一個測試排行榜',
        type: 'points',
        metric: 'total_points',
        timeframe: 'weekly',
        scope: 'global',
        maxEntries: 50,
        isActive: true,
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('創建排行榜:', '測試排行榜');
      expect(mockLogger.info).toHaveBeenCalledWith('排行榜創建成功');
    });

    it('應該處理創建排行榜失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(gamificationService.createLeaderboard({})).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '創建排行榜失敗:',
        expect.any(Error)
      );
    });
  });

  describe('getLeaderboard', () => {
    it('應該成功獲取排行榜', async () => {
      const _result = await gamificationService.getLeaderboard('leaderboard-1');

      expect(mockLogger.info).toHaveBeenCalledWith(
        '獲取排行榜:',
        'leaderboard-1'
      );
      expect(result).toBeNull();
    });

    it('應該處理獲取排行榜失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        gamificationService.getLeaderboard('leaderboard-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '獲取排行榜失敗:',
        expect.any(Error)
      );
    });
  });

  describe('getLeaderboardEntries', () => {
    it('應該成功獲取排行榜條目', async () => {
      const _result = await gamificationService.getLeaderboardEntries(
        'leaderboard-1',
        1,
        20
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        '獲取排行榜條目:',
        'leaderboard-1',
        1,
        20
      );
      expect(result).toEqual([]);
    });

    it('應該處理獲取排行榜條目失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        gamificationService.getLeaderboardEntries('leaderboard-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '獲取排行榜條目失敗:',
        expect.any(Error)
      );
    });
  });

  describe('updateLeaderboardScore', () => {
    it('應該成功更新排行榜分數', async () => {
      await gamificationService.updateLeaderboardScore(
        'leaderboard-1',
        'user-1',
        1000
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        '更新排行榜分數:',
        'leaderboard-1',
        'user-1',
        1000
      );
      expect(mockLogger.info).toHaveBeenCalledWith('排行榜分數更新成功');
    });

    it('應該處理更新排行榜分數失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        gamificationService.updateLeaderboardScore(
          'leaderboard-1',
          'user-1',
          1000
        )
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '更新排行榜分數失敗:',
        expect.any(Error)
      );
    });
  });

  describe('createChallenge', () => {
    it('應該成功創建挑戰', async () => {
      const _challengeData = {
        name: '測試挑戰',
        description: '這是一個測試挑戰',
        type: 'daily' as const,
        category: 'collection' as const,
        requirements: [
          {
            type: 'count' as const,
            action: 'add_cards',
            target: 10,
            conditions: { timeframe: 'daily' },
          },
        ],
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        maxParticipants: 100,
        isRepeatable: true,
        difficulty: 'medium' as const,
      };

      const _result = await gamificationService.createChallenge(challengeData);

      expect(result).toMatchObject({
        name: '測試挑戰',
        description: '這是一個測試挑戰',
        type: 'daily',
        category: 'collection',
        requirements: [
          {
            type: 'count',
            action: 'add_cards',
            target: 10,
            conditions: { timeframe: 'daily' },
          },
        ],
        startDate: challengeData.startDate,
        endDate: challengeData.endDate,
        maxParticipants: 100,
        currentParticipants: 0,
        isActive: true,
        isRepeatable: true,
        difficulty: 'medium',
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith('創建挑戰:', '測試挑戰');
      expect(mockLogger.info).toHaveBeenCalledWith('挑戰創建成功');
    });

    it('應該處理無效的挑戰數據', async () => {
      const _invalidChallengeData = {
        name: '', // 無效：空名稱
        description: '這是一個測試挑戰',
        type: 'daily' as const,
        category: 'collection' as const,
        requirements: [],
        startDate: new Date(),
        endDate: new Date(),
        difficulty: 'medium' as const,
      };

      await expect(
        gamificationService.createChallenge(invalidChallengeData)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '創建挑戰失敗:',
        expect.any(Error)
      );
    });
  });

  describe('getChallenge', () => {
    it('應該成功獲取挑戰', async () => {
      // 先創建一個挑戰
      const _challengeData = {
        name: '測試挑戰',
        description: '這是一個測試挑戰',
        type: 'daily' as const,
        category: 'collection' as const,
        requirements: [],
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        difficulty: 'easy' as const,
      };

      const _createdChallenge =
        await gamificationService.createChallenge(challengeData);
      const _result = await gamificationService.getChallenge(
        createdChallenge.id
      );

      expect(result).toEqual(createdChallenge);
    });

    it('應該在挑戰不存在時返回 null', async () => {
      const _result = await gamificationService.getChallenge(
        'nonexistent-challenge'
      );

      expect(result).toBeNull();
    });
  });

  describe('getAllChallenges', () => {
    it('應該成功獲取所有挑戰', async () => {
      // 創建多個挑戰
      const _challenge1 = await gamificationService.createChallenge({
        name: '挑戰1',
        description: '第一個挑戰',
        type: 'daily' as const,
        category: 'collection' as const,
        requirements: [],
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        difficulty: 'easy' as const,
      });

      const _challenge2 = await gamificationService.createChallenge({
        name: '挑戰2',
        description: '第二個挑戰',
        type: 'weekly' as const,
        category: 'social' as const,
        requirements: [],
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        difficulty: 'medium' as const,
      });

      const _result = await gamificationService.getAllChallenges();

      expect(result).toHaveLength(3); // 1個默認挑戰 + 2個新創建的挑戰
      expect(result).toContainEqual(challenge1);
      expect(result).toContainEqual(challenge2);
    });
  });

  describe('joinChallenge', () => {
    it('應該成功參與挑戰', async () => {
      // 先創建一個挑戰
      const _challenge = await gamificationService.createChallenge({
        name: '測試挑戰',
        description: '這是一個測試挑戰',
        type: 'daily' as const,
        category: 'collection' as const,
        requirements: [],
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        difficulty: 'easy' as const,
      });

      const _result = await gamificationService.joinChallenge(
        challenge.id,
        'user-1'
      );

      expect(result).toMatchObject({
        userId: 'user-1',
        challengeId: challenge.id,
        progress: 0,
        isCompleted: false,
      });
      expect(result.id).toBeDefined();
      expect(result.startedAt).toBeInstanceOf(Date);
      expect(result.lastUpdated).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '參與挑戰:',
        challenge.id,
        'user-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('挑戰參與成功');
    });

    it('應該處理挑戰不存在的情況', async () => {
      await expect(
        gamificationService.joinChallenge('nonexistent-challenge', 'user-1')
      ).rejects.toThrow('挑戰不存在');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '參與挑戰失敗:',
        expect.any(Error)
      );
    });

    it('應該處理挑戰未激活的情況', async () => {
      // 創建一個未激活的挑戰
      const _challenge = await gamificationService.createChallenge({
        name: '未激活挑戰',
        description: '這是一個未激活的挑戰',
        type: 'daily' as const,
        category: 'collection' as const,
        requirements: [],
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        difficulty: 'easy' as const,
      });

      // 手動設置為未激活
      (challenge as any).isActive = false;

      await expect(
        gamificationService.joinChallenge(challenge.id, 'user-1')
      ).rejects.toThrow('挑戰未激活');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '參與挑戰失敗:',
        expect.any(Error)
      );
    });
  });

  describe('getUserChallenges', () => {
    it('應該成功獲取用戶挑戰', async () => {
      const _result = await gamificationService.getUserChallenges('user-1');

      expect(mockLogger.info).toHaveBeenCalledWith('獲取用戶挑戰:', 'user-1');
      expect(result).toEqual([]);
    });

    it('應該處理獲取用戶挑戰失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        gamificationService.getUserChallenges('user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '獲取用戶挑戰失敗:',
        expect.any(Error)
      );
    });
  });

  describe('getQuest', () => {
    it('應該成功獲取任務', async () => {
      const _result = await gamificationService.getQuest('beginner-quest');

      expect(result).toMatchObject({
        id: 'beginner-quest',
        name: '新手任務',
        description: '完成基礎功能學習',
        type: 'main',
        category: 'learning',
      });
    });

    it('應該在任務不存在時返回 null', async () => {
      const _result = await gamificationService.getQuest('nonexistent-quest');

      expect(result).toBeNull();
    });
  });

  describe('getAllQuests', () => {
    it('應該成功獲取所有任務', async () => {
      const _result = await gamificationService.getAllQuests();

      expect(result).toHaveLength(1); // 1個默認任務
      expect(result[0].id).toBe('beginner-quest');
    });
  });

  describe('startQuest', () => {
    it('應該成功開始任務', async () => {
      const _result = await gamificationService.startQuest(
        'beginner-quest',
        'user-1'
      );

      expect(result).toMatchObject({
        userId: 'user-1',
        questId: 'beginner-quest',
        progress: 0,
        isCompleted: false,
      });
      expect(result.id).toBeDefined();
      expect(result.startedAt).toBeInstanceOf(Date);
      expect(result.lastUpdated).toBeInstanceOf(Date);
      expect(result.objectives).toHaveLength(2);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '開始任務:',
        'beginner-quest',
        'user-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('任務開始成功');
    });

    it('應該處理任務不存在的情況', async () => {
      await expect(
        gamificationService.startQuest('nonexistent-quest', 'user-1')
      ).rejects.toThrow('任務不存在');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '開始任務失敗:',
        expect.any(Error)
      );
    });

    it('應該處理任務未激活的情況', async () => {
      // 創建一個未激活的任務
      const _quest = await gamificationService.getQuest('beginner-quest');
      if (quest) {
        (quest as any).isActive = false;

        await expect(
          gamificationService.startQuest('beginner-quest', 'user-1')
        ).rejects.toThrow('任務未激活');
        expect(mockLogger.error).toHaveBeenCalledWith(
          '開始任務失敗:',
          expect.any(Error)
        );
      }
    });
  });

  describe('getUserQuests', () => {
    it('應該成功獲取用戶任務', async () => {
      const _result = await gamificationService.getUserQuests('user-1');

      expect(mockLogger.info).toHaveBeenCalledWith('獲取用戶任務:', 'user-1');
      expect(result).toEqual([]);
    });

    it('應該處理獲取用戶任務失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        gamificationService.getUserQuests('user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '獲取用戶任務失敗:',
        expect.any(Error)
      );
    });
  });

  describe('getEvent', () => {
    it('應該成功獲取事件', async () => {
      const _result = await gamificationService.getEvent('winter-collection');

      expect(result).toMatchObject({
        id: 'winter-collection',
        name: '冬季收藏活動',
        description: '收集冬季主題卡片',
        type: 'seasonal',
      });
    });

    it('應該在事件不存在時返回 null', async () => {
      const _result = await gamificationService.getEvent('nonexistent-event');

      expect(result).toBeNull();
    });
  });

  describe('getAllEvents', () => {
    it('應該成功獲取所有事件', async () => {
      const _result = await gamificationService.getAllEvents();

      expect(result).toHaveLength(1); // 1個默認事件
      expect(result[0].id).toBe('winter-collection');
    });
  });

  describe('joinEvent', () => {
    it('應該成功參與事件', async () => {
      await gamificationService.joinEvent('winter-collection', 'user-1');

      expect(mockLogger.info).toHaveBeenCalledWith(
        '參與事件:',
        'winter-collection',
        'user-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('事件參與成功');
    });

    it('應該處理事件不存在的情況', async () => {
      await expect(
        gamificationService.joinEvent('nonexistent-event', 'user-1')
      ).rejects.toThrow('事件不存在');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '參與事件失敗:',
        expect.any(Error)
      );
    });

    it('應該處理事件未激活的情況', async () => {
      // 創建一個未激活的事件
      const _event = await gamificationService.getEvent('winter-collection');
      if (event) {
        (event as any).isActive = false;

        await expect(
          gamificationService.joinEvent('winter-collection', 'user-1')
        ).rejects.toThrow('事件未激活');
        expect(mockLogger.error).toHaveBeenCalledWith(
          '參與事件失敗:',
          expect.any(Error)
        );
      }
    });
  });

  describe('grantReward', () => {
    it('應該成功發放獎勵', async () => {
      const _result = await gamificationService.grantReward(
        'user-1',
        'reward-1',
        5
      );

      expect(result).toMatchObject({
        userId: 'user-1',
        rewardId: 'reward-1',
        quantity: 5,
        isClaimed: false,
      });
      expect(result.id).toBeDefined();
      expect(result.earnedAt).toBeInstanceOf(Date);
      expect(mockLogger.info).toHaveBeenCalledWith(
        '發放獎勵:',
        'user-1',
        'reward-1',
        5
      );
      expect(mockLogger.info).toHaveBeenCalledWith('獎勵發放成功');
    });

    it('應該處理發放獎勵失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        gamificationService.grantReward('user-1', 'reward-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '發放獎勵失敗:',
        expect.any(Error)
      );
    });

    it('應該使用默認數量發放獎勵', async () => {
      const _result = await gamificationService.grantReward(
        'user-1',
        'reward-1'
      );

      expect(result.quantity).toBe(1);
    });
  });

  describe('claimReward', () => {
    it('應該成功領取獎勵', async () => {
      await gamificationService.claimReward('user-1', 'reward-1');

      expect(mockLogger.info).toHaveBeenCalledWith(
        '領取獎勵:',
        'user-1',
        'reward-1'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('獎勵領取成功');
    });

    it('應該處理領取獎勵失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        gamificationService.claimReward('user-1', 'reward-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '領取獎勵失敗:',
        expect.any(Error)
      );
    });
  });

  describe('getUserRewards', () => {
    it('應該成功獲取用戶獎勵', async () => {
      const _result = await gamificationService.getUserRewards('user-1');

      expect(mockLogger.info).toHaveBeenCalledWith('獲取用戶獎勵:', 'user-1');
      expect(result).toEqual([]);
    });

    it('應該處理獲取用戶獎勵失敗', async () => {
      // 模擬錯誤情況
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        gamificationService.getUserRewards('user-1')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        '獲取用戶獎勵失敗:',
        expect.any(Error)
      );
    });
  });

  describe('配置管理', () => {
    it('應該成功獲取配置', () => {
      const _config = gamificationService.getConfig();

      expect(config).toMatchObject({
        enableAchievements: true,
        enablePoints: true,
        enableLeaderboards: true,
        enableChallenges: true,
        enableRewards: true,
        enableLevels: true,
        enableBadges: true,
        enableQuests: true,
        enableEvents: true,
        enableCompetitions: true,
      });
    });

    it('應該成功更新配置', () => {
      const _newConfig = {
        enableAchievements: false,
        enableCompetitions: false,
      };

      gamificationService.updateConfig(newConfig);

      const _updatedConfig = gamificationService.getConfig();
      expect(updatedConfig.enableAchievements).toBe(false);
      expect(updatedConfig.enableCompetitions).toBe(false);
      expect(mockLogger.info).toHaveBeenCalledWith('遊戲化服務配置已更新');
    });

    it('應該檢查服務狀態', () => {
      expect(gamificationService.isReady()).toBe(false); // 未初始化

      // 初始化後應該返回 true
      gamificationService.initialize().then(() => {
        expect(gamificationService.isReady()).toBe(true);
      });
    });
  });
});
