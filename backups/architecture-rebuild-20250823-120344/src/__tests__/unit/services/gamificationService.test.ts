/* global jest, describe, it, expect, beforeEach, afterEach */
import { gamificationService } from '../../../services/gamificationService';
import { mockApiResponse } from '../../setup/test-utils';

// Mock API service
jest.mock('../../../services/apiService', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('GamificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('應該成功獲取用戶遊戲化檔案', async () => {
      const mockProfile = {
        userId: 'user123',
        level: 5,
        experience: 1250,
        totalPoints: 5000,
        achievements: ['first_scan', 'collector_10'],
        badges: ['bronze_collector', 'silver_scanner'],
        rank: 'silver',
        streak: 7,
      };

      mockApiResponse('get', mockProfile);

      const result = await gamificationService.getUserProfile('user123');

      expect(result).toEqual(mockProfile);
    });

    it('應該處理獲取用戶檔案失敗的情況', async () => {
      mockApiResponse('get', null, new Error('User not found'));

      await expect(
        gamificationService.getUserProfile('invalid_user')
      ).rejects.toThrow('User not found');
    });
  });

  describe('addExperience', () => {
    it('應該成功添加經驗值', async () => {
      const experienceData = {
        userId: 'user123',
        amount: 100,
        source: 'card_scan',
        description: '掃描卡片獲得經驗值',
      };

      const mockResponse = {
        userId: 'user123',
        newExperience: 1350,
        newLevel: 6,
        levelUp: true,
        rewards: ['new_badge'],
      };

      mockApiResponse('post', mockResponse);

      const result = await gamificationService.addExperience(experienceData);

      expect(result).toEqual(mockResponse);
    });

    it('應該處理添加經驗值失敗的情況', async () => {
      const experienceData = {
        userId: 'invalid_user',
        amount: 100,
        source: 'card_scan',
        description: '掃描卡片獲得經驗值',
      };

      mockApiResponse('post', null, new Error('Invalid user'));

      await expect(
        gamificationService.addExperience(experienceData)
      ).rejects.toThrow('Invalid user');
    });
  });

  describe('getAchievements', () => {
    it('應該成功獲取成就列表', async () => {
      const mockAchievements = [
        {
          id: 'first_scan',
          name: '首次掃描',
          description: '完成第一次卡片掃描',
          icon: 'scan-icon',
          points: 50,
          isUnlocked: true,
          unlockedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'collector_10',
          name: '收藏家',
          description: '收集10張卡片',
          icon: 'collector-icon',
          points: 100,
          isUnlocked: true,
          unlockedAt: '2024-01-02T00:00:00Z',
        },
        {
          id: 'streak_30',
          name: '堅持不懈',
          description: '連續使用30天',
          icon: 'streak-icon',
          points: 200,
          isUnlocked: false,
        },
      ];

      mockApiResponse('get', mockAchievements);

      const result = await gamificationService.getAchievements('user123');

      expect(result).toEqual(mockAchievements);
    });
  });

  describe('unlockAchievement', () => {
    it('應該成功解鎖成就', async () => {
      const achievementData = {
        userId: 'user123',
        achievementId: 'streak_30',
      };

      const mockResponse = {
        achievementId: 'streak_30',
        unlocked: true,
        pointsEarned: 200,
        newTotalPoints: 5200,
      };

      mockApiResponse('post', mockResponse);

      const result =
        await gamificationService.unlockAchievement(achievementData);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getLeaderboard', () => {
    it('應該成功獲取排行榜', async () => {
      const mockLeaderboard = [
        {
          rank: 1,
          userId: 'user1',
          username: 'TopPlayer',
          level: 10,
          totalPoints: 15000,
          avatar: 'avatar1.jpg',
        },
        {
          rank: 2,
          userId: 'user2',
          username: 'SecondPlayer',
          level: 9,
          totalPoints: 12000,
          avatar: 'avatar2.jpg',
        },
      ];

      mockApiResponse('get', mockLeaderboard);

      const result = await gamificationService.getLeaderboard();

      expect(result).toEqual(mockLeaderboard);
    });

    it('應該支持排行榜類型參數', async () => {
      const leaderboardType = 'weekly';

      mockApiResponse('get', []);

      await gamificationService.getLeaderboard(leaderboardType);

      expect(
        require('../../../services/apiService').apiService.get
      ).toHaveBeenCalledWith(
        expect.stringContaining('leaderboard'),
        expect.objectContaining({
          params: { type: leaderboardType },
        })
      );
    });
  });

  describe('getChallenges', () => {
    it('應該成功獲取挑戰列表', async () => {
      const mockChallenges = [
        {
          id: 'daily_scan',
          name: '每日掃描',
          description: '今天掃描5張卡片',
          type: 'daily',
          target: 5,
          current: 3,
          reward: 50,
          expiresAt: '2024-01-02T00:00:00Z',
          isCompleted: false,
        },
        {
          id: 'weekly_collect',
          name: '週收集',
          description: '本週收集20張卡片',
          type: 'weekly',
          target: 20,
          current: 15,
          reward: 200,
          expiresAt: '2024-01-08T00:00:00Z',
          isCompleted: false,
        },
      ];

      mockApiResponse('get', mockChallenges);

      const result = await gamificationService.getChallenges('user123');

      expect(result).toEqual(mockChallenges);
    });
  });

  describe('updateChallengeProgress', () => {
    it('應該成功更新挑戰進度', async () => {
      const progressData = {
        userId: 'user123',
        challengeId: 'daily_scan',
        progress: 1,
      };

      const mockResponse = {
        challengeId: 'daily_scan',
        currentProgress: 4,
        isCompleted: false,
        rewardEarned: null,
      };

      mockApiResponse('put', mockResponse);

      const result =
        await gamificationService.updateChallengeProgress(progressData);

      expect(result).toEqual(mockResponse);
    });

    it('應該處理挑戰完成的情況', async () => {
      const progressData = {
        userId: 'user123',
        challengeId: 'daily_scan',
        progress: 2,
      };

      const mockResponse = {
        challengeId: 'daily_scan',
        currentProgress: 5,
        isCompleted: true,
        rewardEarned: 50,
        newTotalPoints: 5250,
      };

      mockApiResponse('put', mockResponse);

      const result =
        await gamificationService.updateChallengeProgress(progressData);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getRewards', () => {
    it('應該成功獲取獎勵列表', async () => {
      const mockRewards = [
        {
          id: 'badge_bronze',
          name: '青銅徽章',
          description: '獲得青銅收藏家徽章',
          type: 'badge',
          icon: 'bronze-badge.png',
          isClaimed: true,
          claimedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'points_100',
          name: '100點數',
          description: '獲得100點數獎勵',
          type: 'points',
          amount: 100,
          isClaimed: false,
        },
      ];

      mockApiResponse('get', mockRewards);

      const result = await gamificationService.getRewards('user123');

      expect(result).toEqual(mockRewards);
    });
  });

  describe('claimReward', () => {
    it('應該成功領取獎勵', async () => {
      const rewardData = {
        userId: 'user123',
        rewardId: 'points_100',
      };

      const mockResponse = {
        rewardId: 'points_100',
        claimed: true,
        claimedAt: '2024-01-01T00:00:00Z',
        newTotalPoints: 5300,
      };

      mockApiResponse('post', mockResponse);

      const result = await gamificationService.claimReward(rewardData);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getStreak', () => {
    it('應該成功獲取連續使用天數', async () => {
      const mockStreak = {
        currentStreak: 7,
        longestStreak: 15,
        lastActivityDate: '2024-01-01T00:00:00Z',
        streakRewards: [50, 100, 200],
      };

      mockApiResponse('get', mockStreak);

      const result = await gamificationService.getStreak('user123');

      expect(result).toEqual(mockStreak);
    });
  });

  describe('updateStreak', () => {
    it('應該成功更新連續使用天數', async () => {
      const mockResponse = {
        newStreak: 8,
        streakReward: 100,
        newTotalPoints: 5400,
      };

      mockApiResponse('post', mockResponse);

      const result = await gamificationService.updateStreak('user123');

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getLevelInfo', () => {
    it('應該返回正確的等級信息', () => {
      const levelInfo = gamificationService.getLevelInfo(1250);

      expect(levelInfo).toEqual({
        level: 5,
        experienceInLevel: 250,
        experienceToNext: 750,
        progressPercentage: 25,
      });
    });

    it('應該處理最高等級的情況', () => {
      const levelInfo = gamificationService.getLevelInfo(100000);

      expect(levelInfo).toEqual({
        level: 100,
        experienceInLevel: 0,
        experienceToNext: 0,
        progressPercentage: 100,
      });
    });
  });

  describe('calculateLevel', () => {
    it('應該正確計算等級', () => {
      expect(gamificationService.calculateLevel(0)).toBe(1);
      expect(gamificationService.calculateLevel(100)).toBe(2);
      expect(gamificationService.calculateLevel(500)).toBe(3);
      expect(gamificationService.calculateLevel(1250)).toBe(5);
    });
  });

  describe('getExperienceToNextLevel', () => {
    it('應該正確計算升級所需經驗值', () => {
      expect(gamificationService.getExperienceToNextLevel(1)).toBe(100);
      expect(gamificationService.getExperienceToNextLevel(2)).toBe(200);
      expect(gamificationService.getExperienceToNextLevel(5)).toBe(1000);
    });
  });

  describe('getRankInfo', () => {
    it('應該返回正確的排名信息', () => {
      expect(gamificationService.getRankInfo(1000)).toBe('bronze');
      expect(gamificationService.getRankInfo(5000)).toBe('silver');
      expect(gamificationService.getRankInfo(10000)).toBe('gold');
      expect(gamificationService.getRankInfo(20000)).toBe('platinum');
    });
  });

  describe('getRankColor', () => {
    it('應該返回正確的排名顏色', () => {
      expect(gamificationService.getRankColor('bronze')).toBe('#CD7F32');
      expect(gamificationService.getRankColor('silver')).toBe('#C0C0C0');
      expect(gamificationService.getRankColor('gold')).toBe('#FFD700');
      expect(gamificationService.getRankColor('platinum')).toBe('#E5E4E2');
    });
  });

  describe('formatPoints', () => {
    it('應該正確格式化點數', () => {
      expect(gamificationService.formatPoints(1000)).toBe('1,000');
      expect(gamificationService.formatPoints(1234567)).toBe('1,234,567');
      expect(gamificationService.formatPoints(0)).toBe('0');
    });
  });

  describe('getAchievementProgress', () => {
    it('應該返回正確的成就進度', () => {
      const achievement = {
        id: 'collector_100',
        target: 100,
        current: 75,
      };

      const progress = gamificationService.getAchievementProgress(achievement);

      expect(progress).toEqual({
        current: 75,
        target: 100,
        percentage: 75,
        isCompleted: false,
      });
    });

    it('應該處理已完成的成就', () => {
      const achievement = {
        id: 'collector_100',
        target: 100,
        current: 100,
      };

      const progress = gamificationService.getAchievementProgress(achievement);

      expect(progress).toEqual({
        current: 100,
        target: 100,
        percentage: 100,
        isCompleted: true,
      });
    });
  });
});
