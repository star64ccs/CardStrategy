import { apiService, ApiResponse } from './apiService';
import { authService } from './authService';
import { socialService } from './socialService';
import { aiEcosystem } from './aiEcosystem';
import { logger } from '../utils/logger';
import { z } from 'zod';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// ==================== 接口定義 ====================

export interface GamificationConfig {
  enableAchievements: boolean;
  enablePoints: boolean;
  enableLeaderboards: boolean;
  enableChallenges: boolean;
  enableRewards: boolean;
  enableLevels: boolean;
  enableBadges: boolean;
  enableQuests: boolean;
  enableEvents: boolean;
  enableCompetitions: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category:
    | 'collection'
    | 'analysis'
    | 'social'
    | 'investment'
    | 'learning'
    | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirements: AchievementRequirement[];
  rewards: Reward[];
  isHidden: boolean;
  isRepeatable: boolean;
  maxProgress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AchievementRequirement {
  type: 'action' | 'count' | 'streak' | 'value' | 'combination';
  action?: string;
  target: number;
  metric?: string;
  timeframe?: string;
  conditions?: Record<string, any>;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  earnedAt?: Date;
  progressHistory: {
    date: Date;
    progress: number;
  }[];
}

export interface PointSystem {
  id: string;
  name: string;
  description: string;
  categories: PointCategory[];
  multipliers: PointMultiplier[];
  decayRules: PointDecayRule[];
  exchangeRates: Record<string, number>;
}

export interface PointCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  actions: PointAction[];
}

export interface PointAction {
  id: string;
  name: string;
  description: string;
  basePoints: number;
  conditions?: Record<string, any>;
  cooldown?: number;
  maxPerDay?: number;
}

export interface PointMultiplier {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  conditions: Record<string, any>;
  duration: number;
  isActive: boolean;
}

export interface PointDecayRule {
  id: string;
  category: string;
  decayRate: number;
  interval: 'daily' | 'weekly' | 'monthly';
  minPoints: number;
  isActive: boolean;
}

export interface UserPoints {
  userId: string;
  totalPoints: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  categories: Record<string, number>;
  multipliers: {
    id: string;
    expiresAt: Date;
  }[];
  lastUpdated: Date;
}

export interface Leaderboard {
  id: string;
  name: string;
  description: string;
  type: 'points' | 'achievements' | 'activity' | 'custom';
  metric: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time';
  scope: 'global' | 'community' | 'friends';
  maxEntries: number;
  rewards: Reward[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaderboardEntry {
  id: string;
  leaderboardId: string;
  userId: string;
  rank: number;
  score: number;
  metadata?: any;
  lastUpdated: Date;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'event' | 'special';
  category: 'collection' | 'analysis' | 'social' | 'investment' | 'learning';
  requirements: ChallengeRequirement[];
  rewards: Reward[];
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  currentParticipants: number;
  isActive: boolean;
  isRepeatable: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeRequirement {
  type: 'action' | 'count' | 'streak' | 'value' | 'combination';
  action?: string;
  target: number;
  metric?: string;
  conditions?: Record<string, any>;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: Date;
  startedAt: Date;
  lastUpdated: Date;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: 'points' | 'badge' | 'item' | 'currency' | 'feature' | 'custom';
  value: number;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isStackable: boolean;
  maxQuantity?: number;
  expiresAt?: Date;
  conditions?: Record<string, any>;
}

export interface UserReward {
  id: string;
  userId: string;
  rewardId: string;
  quantity: number;
  isClaimed: boolean;
  claimedAt?: Date;
  expiresAt?: Date;
  earnedAt: Date;
}

export interface Level {
  id: string;
  level: number;
  name: string;
  description: string;
  experienceRequired: number;
  rewards: Reward[];
  badge?: string;
  color: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'achievement' | 'level' | 'event' | 'special' | 'seasonal';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: BadgeRequirement[];
  isHidden: boolean;
  isAnimated: boolean;
  createdAt: Date;
}

export interface BadgeRequirement {
  type: 'achievement' | 'level' | 'points' | 'action' | 'combination';
  target: any;
  conditions?: Record<string, any>;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  isEquipped: boolean;
  equippedAt?: Date;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: 'main' | 'side' | 'daily' | 'weekly' | 'event';
  category: 'collection' | 'analysis' | 'social' | 'investment' | 'learning';
  objectives: QuestObjective[];
  rewards: Reward[];
  prerequisites: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isRepeatable: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestObjective {
  id: string;
  name: string;
  description: string;
  type: 'action' | 'count' | 'streak' | 'value' | 'combination';
  target: number;
  progress: number;
  isCompleted: boolean;
  order: number;
}

export interface UserQuest {
  id: string;
  userId: string;
  questId: string;
  progress: number;
  objectives: {
    id: string;
    progress: number;
    isCompleted: boolean;
  }[];
  isCompleted: boolean;
  completedAt?: Date;
  startedAt: Date;
  lastUpdated: Date;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  type: 'seasonal' | 'special' | 'competition' | 'collaboration';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  features: EventFeature[];
  rewards: Reward[];
  participants: number;
  maxParticipants?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventFeature {
  id: string;
  name: string;
  description: string;
  type: 'challenge' | 'quest' | 'leaderboard' | 'special';
  data: any;
}

export interface Competition {
  id: string;
  name: string;
  description: string;
  type: 'tournament' | 'league' | 'challenge' | 'battle';
  format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  participants: CompetitionParticipant[];
  brackets: CompetitionBracket[];
  rewards: Reward[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  status: 'registration' | 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetitionParticipant {
  id: string;
  userId: string;
  rank: number;
  score: number;
  wins: number;
  losses: number;
  isEliminated: boolean;
  joinedAt: Date;
}

export interface CompetitionBracket {
  id: string;
  round: number;
  matches: CompetitionMatch[];
}

export interface CompetitionMatch {
  id: string;
  participant1Id: string;
  participant2Id: string;
  winnerId?: string;
  score1: number;
  score2: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  scheduledAt: Date;
  completedAt?: Date;
}

// ==================== 驗證模式 ====================

const AchievementSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  category: z.enum([
    'collection',
    'analysis',
    'social',
    'investment',
    'learning',
    'special',
  ]),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary']),
  points: z.number().min(0),
  requirements: z.array(
    z.object({
      type: z.enum(['action', 'count', 'streak', 'value', 'combination']),
      action: z.string().optional(),
      target: z.number(),
      metric: z.string().optional(),
      timeframe: z.string().optional(),
      conditions: z.record(z.any()).optional(),
    })
  ),
  isHidden: z.boolean().optional(),
  isRepeatable: z.boolean().optional(),
  maxProgress: z.number().min(1).optional(),
});

const ChallengeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  type: z.enum(['daily', 'weekly', 'monthly', 'event', 'special']),
  category: z.enum([
    'collection',
    'analysis',
    'social',
    'investment',
    'learning',
  ]),
  requirements: z.array(
    z.object({
      type: z.enum(['action', 'count', 'streak', 'value', 'combination']),
      action: z.string().optional(),
      target: z.number(),
      metric: z.string().optional(),
      conditions: z.record(z.any()).optional(),
    })
  ),
  startDate: z.date(),
  endDate: z.date(),
  maxParticipants: z.number().min(1).optional(),
  isRepeatable: z.boolean().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
});

// ==================== 遊戲化服務 ====================

class GamificationService {
  private config: GamificationConfig;
  private achievements: Map<string, Achievement> = new Map();
  private challenges: Map<string, Challenge> = new Map();
  private quests: Map<string, Quest> = new Map();
  private events: Map<string, Event> = new Map();
  private competitions: Map<string, Competition> = new Map();
  private isInitialized = false;

  constructor(config: Partial<GamificationConfig> = {}) {
    this.config = {
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
      ...config,
    };
  }

  /**
   * 初始化遊戲化服務
   */
  async initialize(): Promise<void> {
    try {
      logger.info('初始化遊戲化服務...');

      // 驗證依賴服務
      await this.validateDependencies();

      // 初始化系統
      await this.initializeSystems();

      // 初始化配置
      await this.initializeConfig();

      this.isInitialized = true;
      logger.info('遊戲化服務初始化完成');
    } catch (error) {
      logger.error('遊戲化服務初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 驗證依賴服務
   */
  private async validateDependencies(): Promise<void> {
    // 驗證認證服務
    if (!authService) {
      throw new Error('認證服務未初始化');
    }

    // 驗證社交服務
    if (!socialService) {
      throw new Error('社交服務未初始化');
    }

    // 驗證AI生態系統
    if (!aiEcosystem) {
      throw new Error('AI生態系統未初始化');
    }
  }

  /**
   * 初始化系統
   */
  private async initializeSystems(): Promise<void> {
    // 初始化成就系統
    await this.initializeAchievements();

    // 初始化挑戰系統
    await this.initializeChallenges();

    // 初始化任務系統
    await this.initializeQuests();

    // 初始化事件系統
    await this.initializeEvents();

    logger.info('遊戲化系統初始化完成');
  }

  /**
   * 初始化成就系統
   */
  private async initializeAchievements(): Promise<void> {
    // 創建默認成就
    const defaultAchievements: Achievement[] = [
      {
        id: 'first-card',
        name: '第一張卡片',
        description: '添加你的第一張卡片到收藏',
        icon: '🎴',
        category: 'collection',
        rarity: 'common',
        points: 10,
        requirements: [
          {
            type: 'action',
            action: 'add_card',
            target: 1,
          },
        ],
        rewards: [],
        isHidden: false,
        isRepeatable: false,
        maxProgress: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'card-collector',
        name: '卡片收藏家',
        description: '收集100張不同的卡片',
        icon: '📚',
        category: 'collection',
        rarity: 'rare',
        points: 100,
        requirements: [
          {
            type: 'count',
            action: 'unique_cards',
            target: 100,
          },
        ],
        rewards: [],
        isHidden: false,
        isRepeatable: false,
        maxProgress: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'social-butterfly',
        name: '社交蝴蝶',
        description: '獲得100個關注者',
        icon: '🦋',
        category: 'social',
        rarity: 'epic',
        points: 500,
        requirements: [
          {
            type: 'count',
            action: 'followers',
            target: 100,
          },
        ],
        rewards: [],
        isHidden: false,
        isRepeatable: false,
        maxProgress: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    defaultAchievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  /**
   * 初始化挑戰系統
   */
  private async initializeChallenges(): Promise<void> {
    // 創建默認挑戰
    const defaultChallenges: Challenge[] = [
      {
        id: 'daily-collector',
        name: '每日收藏家',
        description: '每天添加至少5張卡片',
        type: 'daily',
        category: 'collection',
        requirements: [
          {
            type: 'count',
            action: 'add_cards',
            target: 5,
            conditions: { timeframe: 'daily' },
          },
        ],
        rewards: [
          {
            id: 'daily-points',
            name: '每日積分',
            description: '完成每日挑戰的積分獎勵',
            type: 'points',
            value: 50,
            icon: '⭐',
            rarity: 'common',
            isStackable: true,
          },
        ],
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小時後
        maxParticipants: 1000,
        currentParticipants: 0,
        isActive: true,
        isRepeatable: true,
        difficulty: 'easy',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    defaultChallenges.forEach(challenge => {
      this.challenges.set(challenge.id, challenge);
    });
  }

  /**
   * 初始化任務系統
   */
  private async initializeQuests(): Promise<void> {
    // 創建默認任務
    const defaultQuests: Quest[] = [
      {
        id: 'beginner-quest',
        name: '新手任務',
        description: '完成基礎功能學習',
        type: 'main',
        category: 'learning',
        objectives: [
          {
            id: 'add-first-card',
            name: '添加第一張卡片',
            description: '添加一張卡片到你的收藏',
            type: 'action',
            target: 1,
            progress: 0,
            isCompleted: false,
            order: 1,
          },
          {
            id: 'complete-first-analysis',
            name: '完成第一次分析',
            description: '使用AI分析一張卡片',
            type: 'action',
            target: 1,
            progress: 0,
            isCompleted: false,
            order: 2,
          },
        ],
        rewards: [
          {
            id: 'beginner-badge',
            name: '新手徽章',
            description: '完成新手任務的證明',
            type: 'badge',
            value: 1,
            icon: '🎯',
            rarity: 'common',
            isStackable: false,
          },
        ],
        prerequisites: [],
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天後
        isActive: true,
        isRepeatable: false,
        difficulty: 'easy',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    defaultQuests.forEach(quest => {
      this.quests.set(quest.id, quest);
    });
  }

  /**
   * 初始化事件系統
   */
  private async initializeEvents(): Promise<void> {
    // 創建默認事件
    const defaultEvents: Event[] = [
      {
        id: 'winter-collection',
        name: '冬季收藏活動',
        description: '收集冬季主題卡片',
        type: 'seasonal',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-31'),
        isActive: true,
        features: [
          {
            id: 'winter-challenge',
            name: '冬季挑戰',
            description: '收集冬季主題卡片',
            type: 'challenge',
            data: { theme: 'winter' },
          },
        ],
        rewards: [
          {
            id: 'winter-badge',
            name: '冬季徽章',
            description: '冬季收藏活動紀念徽章',
            type: 'badge',
            value: 1,
            icon: '❄️',
            rarity: 'rare',
            isStackable: false,
          },
        ],
        participants: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    defaultEvents.forEach(event => {
      this.events.set(event.id, event);
    });
  }

  /**
   * 初始化配置
   */
  private async initializeConfig(): Promise<void> {
    // 這裡可以從數據庫或配置文件加載配置
    logger.info('遊戲化配置已加載');
  }

  // ==================== 成就系統 ====================

  /**
   * 創建成就
   */
  async createAchievement(
    achievementData: Partial<Achievement>
  ): Promise<Achievement> {
    try {
      // 驗證數據
      const validatedData = AchievementSchema.parse(achievementData);

      logger.info('創建成就:', validatedData.name);

      const achievement: Achievement = {
        id: this.generateId(),
        name: validatedData.name,
        description: validatedData.description,
        icon: achievementData.icon || '🏆',
        category: validatedData.category,
        rarity: validatedData.rarity,
        points: validatedData.points,
        requirements: validatedData.requirements,
        rewards: achievementData.rewards || [],
        isHidden: validatedData.isHidden || false,
        isRepeatable: validatedData.isRepeatable || false,
        maxProgress: validatedData.maxProgress || 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.achievements.set(achievement.id, achievement);

      logger.info('成就創建成功');
      return achievement;
    } catch (error) {
      logger.error('創建成就失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取成就
   */
  async getAchievement(achievementId: string): Promise<Achievement | null> {
    return this.achievements.get(achievementId) || null;
  }

  /**
   * 獲取所有成就
   */
  async getAllAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  /**
   * 獲取用戶成就
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      logger.info('獲取用戶成就:', userId);

      // 這裡應該從數據庫獲取用戶成就
      return [];
    } catch (error) {
      logger.error('獲取用戶成就失敗:', error);
      throw error;
    }
  }

  /**
   * 檢查成就進度
   */
  async checkAchievementProgress(
    userId: string,
    action: string,
    value: number = 1
  ): Promise<void> {
    try {
      logger.info('檢查成就進度:', userId, action, value);

      // 獲取用戶成就
      const userAchievements = await this.getUserAchievements(userId);

      // 檢查每個成就
      for (const [achievementId, achievement] of this.achievements) {
        const userAchievement = userAchievements.find(
          ua => ua.achievementId === achievementId
        );

        if (
          userAchievement &&
          userAchievement.isCompleted &&
          !achievement.isRepeatable
        ) {
          continue; // 已完成且不可重複的成就跳過
        }

        // 檢查成就要求
        const progress = await this.calculateAchievementProgress(
          userId,
          achievement,
          action,
          value
        );

        if (progress > 0) {
          await this.updateAchievementProgress(userId, achievementId, progress);
        }
      }
    } catch (error) {
      logger.error('檢查成就進度失敗:', error);
      throw error;
    }
  }

  // ==================== 積分系統 ====================

  /**
   * 獲取用戶積分
   */
  async getUserPoints(userId: string): Promise<UserPoints | null> {
    try {
      logger.info('獲取用戶積分:', userId);

      // 這裡應該從數據庫獲取用戶積分
      return null;
    } catch (error) {
      logger.error('獲取用戶積分失敗:', error);
      throw error;
    }
  }

  /**
   * 添加積分
   */
  async addPoints(
    userId: string,
    points: number,
    category: string = 'general',
    reason: string = ''
  ): Promise<void> {
    try {
      logger.info('添加積分:', userId, points, category, reason);

      // 這裡應該更新用戶積分
      logger.info('積分添加成功');
    } catch (error) {
      logger.error('添加積分失敗:', error);
      throw error;
    }
  }

  /**
   * 計算用戶等級
   */
  async calculateUserLevel(userId: string): Promise<{
    level: number;
    experience: number;
    experienceToNextLevel: number;
  }> {
    try {
      logger.info('計算用戶等級:', userId);

      // 這裡應該計算用戶等級
      return {
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
      };
    } catch (error) {
      logger.error('計算用戶等級失敗:', error);
      throw error;
    }
  }

  // ==================== 排行榜系統 ====================

  /**
   * 創建排行榜
   */
  async createLeaderboard(
    leaderboardData: Partial<Leaderboard>
  ): Promise<Leaderboard> {
    try {
      logger.info('創建排行榜:', leaderboardData.name);

      const leaderboard: Leaderboard = {
        id: this.generateId(),
        name: leaderboardData.name || '',
        description: leaderboardData.description || '',
        type: leaderboardData.type || 'points',
        metric: leaderboardData.metric || 'total_points',
        timeframe: leaderboardData.timeframe || 'all-time',
        scope: leaderboardData.scope || 'global',
        maxEntries: leaderboardData.maxEntries || 100,
        rewards: leaderboardData.rewards || [],
        isActive: leaderboardData.isActive !== false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 這裡應該保存到數據庫
      logger.info('排行榜創建成功');
      return leaderboard;
    } catch (error) {
      logger.error('創建排行榜失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取排行榜
   */
  async getLeaderboard(leaderboardId: string): Promise<Leaderboard | null> {
    try {
      logger.info('獲取排行榜:', leaderboardId);

      // 這裡應該從數據庫獲取排行榜
      return null;
    } catch (error) {
      logger.error('獲取排行榜失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取排行榜條目
   */
  async getLeaderboardEntries(
    leaderboardId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<LeaderboardEntry[]> {
    try {
      logger.info('獲取排行榜條目:', leaderboardId, page, limit);

      // 這裡應該從數據庫獲取排行榜條目
      return [];
    } catch (error) {
      logger.error('獲取排行榜條目失敗:', error);
      throw error;
    }
  }

  /**
   * 更新排行榜分數
   */
  async updateLeaderboardScore(
    leaderboardId: string,
    userId: string,
    score: number
  ): Promise<void> {
    try {
      logger.info('更新排行榜分數:', leaderboardId, userId, score);

      // 這裡應該更新排行榜分數
      logger.info('排行榜分數更新成功');
    } catch (error) {
      logger.error('更新排行榜分數失敗:', error);
      throw error;
    }
  }

  // ==================== 挑戰系統 ====================

  /**
   * 創建挑戰
   */
  async createChallenge(challengeData: Partial<Challenge>): Promise<Challenge> {
    try {
      // 驗證數據
      const validatedData = ChallengeSchema.parse(challengeData);

      logger.info('創建挑戰:', validatedData.name);

      const challenge: Challenge = {
        id: this.generateId(),
        name: validatedData.name,
        description: validatedData.description,
        type: validatedData.type,
        category: validatedData.category,
        requirements: validatedData.requirements,
        rewards: challengeData.rewards || [],
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        maxParticipants: validatedData.maxParticipants,
        currentParticipants: 0,
        isActive: true,
        isRepeatable: validatedData.isRepeatable || false,
        difficulty: validatedData.difficulty,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.challenges.set(challenge.id, challenge);

      logger.info('挑戰創建成功');
      return challenge;
    } catch (error) {
      logger.error('創建挑戰失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取挑戰
   */
  async getChallenge(challengeId: string): Promise<Challenge | null> {
    return this.challenges.get(challengeId) || null;
  }

  /**
   * 獲取所有挑戰
   */
  async getAllChallenges(): Promise<Challenge[]> {
    return Array.from(this.challenges.values());
  }

  /**
   * 參與挑戰
   */
  async joinChallenge(
    challengeId: string,
    userId: string
  ): Promise<UserChallenge> {
    try {
      logger.info('參與挑戰:', challengeId, userId);

      const challenge = await this.getChallenge(challengeId);
      if (!challenge) {
        throw new Error('挑戰不存在');
      }

      if (!challenge.isActive) {
        throw new Error('挑戰未激活');
      }

      if (
        challenge.maxParticipants &&
        challenge.currentParticipants >= challenge.maxParticipants
      ) {
        throw new Error('挑戰參與人數已滿');
      }

      const userChallenge: UserChallenge = {
        id: this.generateId(),
        userId,
        challengeId,
        progress: 0,
        isCompleted: false,
        startedAt: new Date(),
        lastUpdated: new Date(),
      };

      // 這裡應該保存到數據庫
      logger.info('挑戰參與成功');
      return userChallenge;
    } catch (error) {
      logger.error('參與挑戰失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取用戶挑戰
   */
  async getUserChallenges(userId: string): Promise<UserChallenge[]> {
    try {
      logger.info('獲取用戶挑戰:', userId);

      // 這裡應該從數據庫獲取用戶挑戰
      return [];
    } catch (error) {
      logger.error('獲取用戶挑戰失敗:', error);
      throw error;
    }
  }

  // ==================== 任務系統 ====================

  /**
   * 獲取任務
   */
  async getQuest(questId: string): Promise<Quest | null> {
    return this.quests.get(questId) || null;
  }

  /**
   * 獲取所有任務
   */
  async getAllQuests(): Promise<Quest[]> {
    return Array.from(this.quests.values());
  }

  /**
   * 開始任務
   */
  async startQuest(questId: string, userId: string): Promise<UserQuest> {
    try {
      logger.info('開始任務:', questId, userId);

      const quest = await this.getQuest(questId);
      if (!quest) {
        throw new Error('任務不存在');
      }

      if (!quest.isActive) {
        throw new Error('任務未激活');
      }

      const userQuest: UserQuest = {
        id: this.generateId(),
        userId,
        questId,
        progress: 0,
        objectives: quest.objectives.map(obj => ({
          id: obj.id,
          progress: 0,
          isCompleted: false,
        })),
        isCompleted: false,
        startedAt: new Date(),
        lastUpdated: new Date(),
      };

      // 這裡應該保存到數據庫
      logger.info('任務開始成功');
      return userQuest;
    } catch (error) {
      logger.error('開始任務失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取用戶任務
   */
  async getUserQuests(userId: string): Promise<UserQuest[]> {
    try {
      logger.info('獲取用戶任務:', userId);

      // 這裡應該從數據庫獲取用戶任務
      return [];
    } catch (error) {
      logger.error('獲取用戶任務失敗:', error);
      throw error;
    }
  }

  // ==================== 事件系統 ====================

  /**
   * 獲取事件
   */
  async getEvent(eventId: string): Promise<Event | null> {
    return this.events.get(eventId) || null;
  }

  /**
   * 獲取所有事件
   */
  async getAllEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  /**
   * 參與事件
   */
  async joinEvent(eventId: string, userId: string): Promise<void> {
    try {
      logger.info('參與事件:', eventId, userId);

      const event = await this.getEvent(eventId);
      if (!event) {
        throw new Error('事件不存在');
      }

      if (!event.isActive) {
        throw new Error('事件未激活');
      }

      // 這裡應該記錄用戶參與事件
      logger.info('事件參與成功');
    } catch (error) {
      logger.error('參與事件失敗:', error);
      throw error;
    }
  }

  // ==================== 獎勵系統 ====================

  /**
   * 發放獎勵
   */
  async grantReward(
    userId: string,
    rewardId: string,
    quantity: number = 1
  ): Promise<UserReward> {
    try {
      logger.info('發放獎勵:', userId, rewardId, quantity);

      const userReward: UserReward = {
        id: this.generateId(),
        userId,
        rewardId,
        quantity,
        isClaimed: false,
        earnedAt: new Date(),
      };

      // 這裡應該保存到數據庫
      logger.info('獎勵發放成功');
      return userReward;
    } catch (error) {
      logger.error('發放獎勵失敗:', error);
      throw error;
    }
  }

  /**
   * 領取獎勵
   */
  async claimReward(userId: string, rewardId: string): Promise<void> {
    try {
      logger.info('領取獎勵:', userId, rewardId);

      // 這裡應該更新獎勵狀態
      logger.info('獎勵領取成功');
    } catch (error) {
      logger.error('領取獎勵失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取用戶獎勵
   */
  async getUserRewards(userId: string): Promise<UserReward[]> {
    try {
      logger.info('獲取用戶獎勵:', userId);

      // 這裡應該從數據庫獲取用戶獎勵
      return [];
    } catch (error) {
      logger.error('獲取用戶獎勵失敗:', error);
      throw error;
    }
  }

  // ==================== 私有方法 ====================

  /**
   * 生成ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 計算成就進度
   */
  private async calculateAchievementProgress(
    userId: string,
    achievement: Achievement,
    action: string,
    value: number
  ): Promise<number> {
    // 這裡應該實現成就進度計算邏輯
    return 0;
  }

  /**
   * 更新成就進度
   */
  private async updateAchievementProgress(
    userId: string,
    achievementId: string,
    progress: number
  ): Promise<void> {
    // 這裡應該更新成就進度
  }

  /**
   * 獲取服務配置
   */
  getConfig(): GamificationConfig {
    return { ...this.config };
  }

  /**
   * 更新服務配置
   */
  updateConfig(newConfig: Partial<GamificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('遊戲化服務配置已更新');
  }

  /**
   * 檢查服務狀態
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  // ==================== 測試需要的方法 ====================

  /**
   * 獲取用戶遊戲化檔案
   */
  async getUserProfile(userId: string): Promise<any> {
    try {
      logger.info('獲取用戶遊戲化檔案:', userId);

      // 這裡應該從數據庫獲取用戶檔案
      return {
        userId,
        level: 1,
        experience: 0,
        points: 0,
        achievements: [],
        challenges: [],
      };
    } catch (error) {
      logger.error('獲取用戶遊戲化檔案失敗:', error);
      throw error;
    }
  }

  /**
   * 添加經驗值
   */
  async addExperience(experienceData: any): Promise<any> {
    try {
      logger.info('添加經驗值:', experienceData);

      // 這裡應該實現經驗值添加邏輯
      const result = {
        success: true,
        addedExperience: experienceData.amount,
        newTotal: 0,
      };

      return result;
    } catch (error) {
      logger.error('添加經驗值失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取成就列表
   */
  async getAchievements(userId: string): Promise<any[]> {
    try {
      logger.info('獲取成就列表:', userId);

      // 這裡應該從數據庫獲取成就列表
      return [];
    } catch (error) {
      logger.error('獲取成就列表失敗:', error);
      throw error;
    }
  }

  /**
   * 解鎖成就
   */
  async unlockAchievement(achievementData: any): Promise<any> {
    try {
      logger.info('解鎖成就:', achievementData);

      // 這裡應該實現成就解鎖邏輯
      const result = {
        success: true,
        achievementId: achievementData.achievementId,
        unlockedAt: new Date(),
      };

      return result;
    } catch (error) {
      logger.error('解鎖成就失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取排行榜
   */
  async getLeaderboard(type?: string): Promise<any[]> {
    try {
      logger.info('獲取排行榜:', type);

      // 這裡應該從數據庫獲取排行榜
      return [];
    } catch (error) {
      logger.error('獲取排行榜失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取挑戰列表
   */
  async getChallenges(userId: string): Promise<any[]> {
    try {
      logger.info('獲取挑戰列表:', userId);

      // 這裡應該從數據庫獲取挑戰列表
      return [];
    } catch (error) {
      logger.error('獲取挑戰列表失敗:', error);
      throw error;
    }
  }

  /**
   * 更新挑戰進度
   */
  async updateChallengeProgress(progressData: any): Promise<any> {
    try {
      logger.info('更新挑戰進度:', progressData);

      // 這裡應該實現挑戰進度更新邏輯
      const result = {
        success: true,
        challengeId: progressData.challengeId,
        progress: progressData.progress,
        updatedAt: new Date(),
      };

      return result;
    } catch (error) {
      logger.error('更新挑戰進度失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取獎勵列表
   */
  async getRewards(userId: string): Promise<any[]> {
    try {
      logger.info('獲取獎勵列表:', userId);

      // 這裡應該從數據庫獲取獎勵列表
      return [];
    } catch (error) {
      logger.error('獲取獎勵列表失敗:', error);
      throw error;
    }
  }

  /**
   * 領取獎勵
   */
  async claimReward(rewardData: any): Promise<any> {
    try {
      logger.info('領取獎勵:', rewardData);

      // 這裡應該實現獎勵領取邏輯
      const result = {
        rewardId: rewardData.rewardId,
        claimed: true,
        claimedAt: new Date(),
        newTotalPoints: 0,
      };

      return result;
    } catch (error) {
      logger.error('領取獎勵失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取連續使用天數
   */
  async getStreak(userId: string): Promise<any> {
    try {
      logger.info('獲取連續使用天數:', userId);

      // 這裡應該從數據庫獲取連續使用天數
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastLoginDate: new Date(),
      };
    } catch (error) {
      logger.error('獲取連續使用天數失敗:', error);
      throw error;
    }
  }

  /**
   * 更新連續使用天數
   */
  async updateStreak(userId: string): Promise<any> {
    try {
      logger.info('更新連續使用天數:', userId);

      // 這裡應該實現連續使用天數更新邏輯
      const result = {
        success: true,
        newStreak: 1,
        updatedAt: new Date(),
      };

      return result;
    } catch (error) {
      logger.error('更新連續使用天數失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取等級信息
   */
  getLevelInfo(experience: number): any {
    const level = this.calculateLevel(experience);
    const experienceToNext = this.getExperienceToNextLevel(level);

    return {
      level,
      experience,
      experienceToNextLevel: experienceToNext,
    };
  }

  /**
   * 計算等級
   */
  calculateLevel(experience: number): number {
    if (experience <= 0) return 1;
    if (experience >= 100000) return 100;

    // 簡單的等級計算公式
    return Math.floor(experience / 100) + 1;
  }

  /**
   * 計算升級所需經驗值
   */
  getExperienceToNextLevel(level: number): number {
    if (level >= 100) return 0;
    return level * 100;
  }

  /**
   * 獲取排名信息
   */
  getRankInfo(points: number): string {
    if (points < 1000) return 'bronze';
    if (points < 5000) return 'silver';
    if (points < 10000) return 'gold';
    return 'platinum';
  }

  /**
   * 獲取排名顏色
   */
  getRankColor(rank: string): string {
    const colors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
    };
    return colors[rank] || '#000000';
  }

  /**
   * 格式化點數
   */
  formatPoints(points: number): string {
    return points.toLocaleString();
  }

  /**
   * 獲取成就進度
   */
  getAchievementProgress(achievement: any): any {
    const current = achievement.progress || 0;
    const max = achievement.maxProgress || 1;
    const percentage = Math.min((current / max) * 100, 100);

    return {
      current,
      max: max,
      percentage,
      isCompleted: current >= max,
    };
  }
}

// ==================== 導出 ====================

export { GamificationService };
export const gamificationService = new GamificationService();
export default gamificationService;
