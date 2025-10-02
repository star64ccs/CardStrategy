import { RecommendationService } from '../services/recommendationService';
import type {
  InvestmentRecommendationRequest,
  UserProfile,
} from '../types/recommendation';
import {
  InvestmentRecommendationResult,
  InvestmentTimeHorizon,
  RiskTolerance,
  InvestmentGoal,
  ExperienceLevel,
  KnowledgeLevel,
  CollectingStyle,
  RecommendationAction,
  RiskLevel,
  RECOMMENDATION_CONSTANTS,
} from '../types/recommendation';

// Mock logger
jest.mock('../../../core/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('RecommendationService', () => {
  let recommendationService: RecommendationService;

  beforeEach(() => {
    recommendationService = RecommendationService.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const _instance1 = RecommendationService.getInstance();
      const _instance2 = RecommendationService.getInstance();
      expect(instance1).toBe(instance2);
      expect(instance1).toBe(recommendationService);
    });
  });

  describe('initialize', () => {
    it('should initialize service successfully', async () => {
      await expect(recommendationService.initialize()).resolves.toBeUndefined();
    });

    it('should not reinitialize if already initialized', async () => {
      await recommendationService.initialize();
      await expect(recommendationService.initialize()).resolves.toBeUndefined();
    });
  });

  describe('generateRecommendation', () => {
    const mockUserProfile: UserProfile = {
      age: 30,
      experience: ExperienceLevel.INTERMEDIATE,
      currentPortfolio: [],
      totalInvestment: 10000,
      monthlyIncome: 5000,
      investmentKnowledge: KnowledgeLevel.INTERMEDIATE,
      preferredGenres: ['Pokemon', 'Magic'],
      blacklistedCards: [],
      favoriteArtists: ['Ken Sugimori'],
      collectingStyle: CollectingStyle.INVESTOR,
    };

    const mockRequest: InvestmentRecommendationRequest = {
      userId: 'test_user_1',
      userProfile: mockUserProfile,
      budget: 5000,
      timeHorizon: InvestmentTimeHorizon.MEDIUM_TERM,
      riskTolerance: RiskTolerance.MODERATE,
      investmentGoals: [InvestmentGoal.CAPITAL_APPRECIATION],
      excludeCategories: [],
    };

    it('should generate investment recommendation successfully', async () => {
      const _result =
        await recommendationService.generateRecommendation(mockRequest);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.userId).toBe(mockRequest.userId);
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.portfolioSuggestion).toBeDefined();
      expect(result.riskAnalysis).toBeDefined();
      expect(result.expectedReturn).toBeDefined();
      expect(result.reasoning).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      expect(result.validUntil).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.metadata).toBeDefined();
    });

    it('should generate recommendations within budget', async () => {
      const _result =
        await recommendationService.generateRecommendation(mockRequest);

      result.recommendations.forEach(rec => {
        expect(rec.currentPrice).toBeLessThanOrEqual(mockRequest.budget);
      });
    });

    it('should include required recommendation fields', async () => {
      const _result =
        await recommendationService.generateRecommendation(mockRequest);

      result.recommendations.forEach(rec => {
        expect(rec.cardId).toBeDefined();
        expect(rec.cardName).toBeDefined();
        expect(rec.series).toBeDefined();
        expect(rec.currentPrice).toBeGreaterThan(0);
        expect(rec.recommendedAction).toBeDefined();
        expect(rec.priority).toBeDefined();
        expect(rec.confidence).toBeGreaterThan(0);
        expect(rec.confidence).toBeLessThanOrEqual(1);
        expect(rec.reasoning).toBeInstanceOf(Array);
        expect(rec.priceTarget).toBeDefined();
        expect(rec.timeframe).toBeDefined();
        expect(rec.riskLevel).toBeDefined();
        expect(rec.marketAnalysis).toBeDefined();
        expect(rec.alternatives).toBeInstanceOf(Array);
      });
    });

    it('should respect user risk tolerance', async () => {
      const _conservativeRequest = {
        ...mockRequest,
        riskTolerance: RiskTolerance.CONSERVATIVE,
      };

      const _result =
        await recommendationService.generateRecommendation(conservativeRequest);

      // 保守型投資者應該主要獲得低到中等風險的建議
      const _highRiskCount = result.recommendations.filter(
        rec =>
          rec.riskLevel === RiskLevel.HIGH ||
          rec.riskLevel === RiskLevel.VERY_HIGH
      ).length;
      const _totalCount = result.recommendations.length;
      const _highRiskRatio = highRiskCount / totalCount;

      expect(highRiskRatio).toBeLessThan(0.5); // 高風險建議應少於一半
    });

    it('should respect user investment goals', async () => {
      const _speculativeRequest = {
        ...mockRequest,
        investmentGoals: [InvestmentGoal.SPECULATION],
      };

      const _result =
        await recommendationService.generateRecommendation(speculativeRequest);

      expect(result.recommendations.length).toBeGreaterThan(0);
      // 投機型目標可能會產生更多積極的建議
      const _buyActions = result.recommendations.filter(
        rec =>
          rec.recommendedAction === RecommendationAction.BUY ||
          rec.recommendedAction === RecommendationAction.STRONG_BUY
      ).length;

      expect(buyActions).toBeGreaterThan(0);
    });

    it('should include portfolio suggestion', async () => {
      const _result =
        await recommendationService.generateRecommendation(mockRequest);

      expect(result.portfolioSuggestion).toBeDefined();
      expect(result.portfolioSuggestion.totalValue).toBe(mockRequest.budget);
      expect(result.portfolioSuggestion.allocation).toBeInstanceOf(Array);
      expect(result.portfolioSuggestion.diversification).toBeDefined();
      expect(
        result.portfolioSuggestion.rebalanceRecommendations
      ).toBeInstanceOf(Array);
      expect(result.portfolioSuggestion.cashReserve).toBeGreaterThan(0);
      expect(result.portfolioSuggestion.emergencyFund).toBeGreaterThan(0);
    });

    it('should include risk analysis', async () => {
      const _result =
        await recommendationService.generateRecommendation(mockRequest);

      expect(result.riskAnalysis).toBeDefined();
      expect(result.riskAnalysis.overallRisk).toBeDefined();
      expect(result.riskAnalysis.portfolioRisk).toBeDefined();
      expect(result.riskAnalysis.marketRisk).toBeDefined();
      expect(result.riskAnalysis.liquidityRisk).toBeDefined();
      expect(result.riskAnalysis.concentrationRisk).toBeDefined();
      expect(result.riskAnalysis.riskFactors).toBeInstanceOf(Array);
      expect(result.riskAnalysis.mitigation).toBeInstanceOf(Array);
      expect(result.riskAnalysis.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskAnalysis.riskScore).toBeLessThanOrEqual(100);
      expect(result.riskAnalysis.volatilityEstimate).toBeGreaterThan(0);
    });

    it('should include expected return analysis', async () => {
      const _result =
        await recommendationService.generateRecommendation(mockRequest);

      expect(result.expectedReturn).toBeDefined();
      expect(result.expectedReturn.optimistic).toBeGreaterThan(
        result.expectedReturn.realistic
      );
      expect(result.expectedReturn.realistic).toBeGreaterThan(
        result.expectedReturn.pessimistic
      );
      expect(result.expectedReturn.timeWeightedReturn).toBeDefined();
      expect(result.expectedReturn.annualizedReturn).toBeDefined();
      expect(result.expectedReturn.riskAdjustedReturn).toBeDefined();
      expect(result.expectedReturn.benchmark).toBeDefined();
    });

    it('should include reasoning', async () => {
      const _result =
        await recommendationService.generateRecommendation(mockRequest);

      expect(result.reasoning).toBeDefined();
      expect(result.reasoning.primary).toBeInstanceOf(Array);
      expect(result.reasoning.primary.length).toBeGreaterThan(0);
      expect(result.reasoning.technical).toBeDefined();
      expect(result.reasoning.fundamental).toBeDefined();
      expect(result.reasoning.market).toBeDefined();
      expect(result.reasoning.seasonal).toBeDefined();
      expect(result.reasoning.sentiment).toBeDefined();
    });

    it('should set proper expiration date', async () => {
      const _result =
        await recommendationService.generateRecommendation(mockRequest);

      const _now = new Date();
      const _expectedExpiry = new Date(
        now.getTime() +
          RECOMMENDATION_CONSTANTS.RECOMMENDATION_EXPIRY_DAYS *
            24 *
            60 *
            60 *
            1000
      );

      expect(result.validUntil.getTime()).toBeCloseTo(
        expectedExpiry.getTime(),
        -1000
      ); // 1Second誤差內
    });

    it('should validate request parameters', async () => {
      const _invalidRequest = {
        ...mockRequest,
        budget: RECOMMENDATION_CONSTANTS.MIN_BUDGET - 1,
      };

      await expect(
        recommendationService.generateRecommendation(invalidRequest)
      ).rejects.toThrow('Budget must be at least');
    });

    it('should handle missing user ID', async () => {
      const _invalidRequest = {
        ...mockRequest,
        userId: '',
      };

      await expect(
        recommendationService.generateRecommendation(invalidRequest)
      ).rejects.toThrow('User ID is required');
    });

    it('should handle missing user profile', async () => {
      const _invalidRequest = {
        ...mockRequest,
        userProfile: undefined as any,
      };

      await expect(
        recommendationService.generateRecommendation(invalidRequest)
      ).rejects.toThrow('User profile is required');
    });

    it('should handle budget exceeding maximum', async () => {
      const _invalidRequest = {
        ...mockRequest,
        budget: RECOMMENDATION_CONSTANTS.MAX_BUDGET + 1,
      };

      await expect(
        recommendationService.generateRecommendation(invalidRequest)
      ).rejects.toThrow('Budget cannot exceed');
    });
  });

  describe('getRecommendationHistory', () => {
    it('should return null for non-existent user', async () => {
      const _history =
        await recommendationService.getRecommendationHistory(
          'non_existent_user'
        );
      expect(history).toBeNull();
    });

    it('should return history after generating recommendation', async () => {
      const mockRequest: InvestmentRecommendationRequest = {
        userId: 'test_user_2',
        userProfile: {
          age: 25,
          experience: ExperienceLevel.BEGINNER,
          currentPortfolio: [],
          totalInvestment: 1000,
          investmentKnowledge: KnowledgeLevel.BASIC,
          preferredGenres: ['Pokemon'],
          blacklistedCards: [],
          favoriteArtists: [],
          collectingStyle: CollectingStyle.CASUAL,
        },
        budget: 1000,
        timeHorizon: InvestmentTimeHorizon.SHORT_TERM,
        riskTolerance: RiskTolerance.CONSERVATIVE,
        investmentGoals: [InvestmentGoal.CAPITAL_PRESERVATION],
      };

      await recommendationService.generateRecommendation(mockRequest);
      const _history =
        await recommendationService.getRecommendationHistory('test_user_2');

      expect(history).toBeDefined();
      expect(history.userId).toBe('test_user_2');
      expect(history.recommendations).toBeInstanceOf(Array);
      expect(history.recommendations.length).toBeGreaterThan(0);
      expect(history.performance).toBeDefined();
      expect(history.preferences).toBeDefined();
      expect(history.learnings).toBeInstanceOf(Array);
    });
  });

  describe('getRecommendationStats', () => {
    it('should return recommendation statistics', async () => {
      const _stats = await recommendationService.getRecommendationStats();

      expect(stats).toBeDefined();
      expect(stats.totalRecommendations).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeLessThanOrEqual(1);
      expect(stats.averageReturn).toBeDefined();
      expect(stats.bestPerforming).toBeDefined();
      expect(stats.worstPerforming).toBeDefined();
      expect(stats.userSatisfaction).toBeGreaterThanOrEqual(0);
      expect(stats.userSatisfaction).toBeLessThanOrEqual(1);
      expect(stats.conversionRate).toBeGreaterThanOrEqual(0);
      expect(stats.conversionRate).toBeLessThanOrEqual(1);
      expect(stats.portfolioImprovement).toBeDefined();
    });

    it('should have valid best performing recommendation', async () => {
      const _stats = await recommendationService.getRecommendationStats();

      expect(stats.bestPerforming.cardId).toBeDefined();
      expect(stats.bestPerforming.cardName).toBeDefined();
      expect(stats.bestPerforming.series).toBeDefined();
      expect(stats.bestPerforming.currentPrice).toBeGreaterThan(0);
      expect(stats.bestPerforming.expectedReturn).toBeGreaterThan(0);
      expect(stats.bestPerforming.recommendedAction).toBeDefined();
    });

    it('should have valid worst performing recommendation', async () => {
      const _stats = await recommendationService.getRecommendationStats();

      expect(stats.worstPerforming.cardId).toBeDefined();
      expect(stats.worstPerforming.cardName).toBeDefined();
      expect(stats.worstPerforming.series).toBeDefined();
      expect(stats.worstPerforming.currentPrice).toBeGreaterThan(0);
      expect(stats.worstPerforming.expectedReturn).toBeLessThan(0);
      expect(stats.worstPerforming.recommendedAction).toBeDefined();
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const mockProfile: UserProfile = {
        age: 35,
        experience: ExperienceLevel.ADVANCED,
        currentPortfolio: [],
        totalInvestment: 50000,
        monthlyIncome: 10000,
        investmentKnowledge: KnowledgeLevel.ADVANCED,
        preferredGenres: ['Magic', 'Pokemon'],
        blacklistedCards: ['banned_card_1'],
        favoriteArtists: ['Ken Sugimori', 'Mark Rosewater'],
        collectingStyle: CollectingStyle.COMPLETIONIST,
      };

      await expect(
        recommendationService.updateUserProfile('test_user_3', mockProfile)
      ).resolves.toBeUndefined();

      const _retrievedProfile =
        await recommendationService.getUserProfile('test_user_3');
      expect(retrievedProfile).toEqual(mockProfile);
    });
  });

  describe('getUserProfile', () => {
    it('should return null for non-existent user', async () => {
      const _profile =
        await recommendationService.getUserProfile('non_existent_user');
      expect(profile).toBeNull();
    });

    it('should return profile after update', async () => {
      const mockProfile: UserProfile = {
        age: 28,
        experience: ExperienceLevel.INTERMEDIATE,
        currentPortfolio: [],
        totalInvestment: 15000,
        investmentKnowledge: KnowledgeLevel.INTERMEDIATE,
        preferredGenres: ['Yu-Gi-Oh'],
        blacklistedCards: [],
        favoriteArtists: [],
        collectingStyle: CollectingStyle.META_FOCUSED,
      };

      await recommendationService.updateUserProfile('test_user_4', mockProfile);
      const _retrievedProfile =
        await recommendationService.getUserProfile('test_user_4');

      expect(retrievedProfile).toEqual(mockProfile);
    });
  });

  describe('analyzePortfolio', () => {
    it('should analyze portfolio successfully', async () => {
      const mockProfile: UserProfile = {
        age: 30,
        experience: ExperienceLevel.INTERMEDIATE,
        currentPortfolio: [],
        totalInvestment: 20000,
        investmentKnowledge: KnowledgeLevel.INTERMEDIATE,
        preferredGenres: ['Pokemon'],
        blacklistedCards: [],
        favoriteArtists: [],
        collectingStyle: CollectingStyle.INVESTOR,
      };

      await recommendationService.updateUserProfile('test_user_5', mockProfile);

      const _mockPortfolio = [
        { cardId: 'card_1', value: 1000, category: 'Pokemon' },
        { cardId: 'card_2', value: 1500, category: 'Magic' },
      ];

      const _analysis = await recommendationService.analyzePortfolio(
        'test_user_5',
        mockPortfolio
      );

      expect(analysis).toBeDefined();
      expect(analysis.analysis).toBeDefined();
      expect(analysis.recommendations).toBeInstanceOf(Array);
      expect(analysis.riskAssessment).toBeDefined();
    });

    it('should throw error for non-existent user', async () => {
      const _mockPortfolio = [{ cardId: 'card_1', value: 1000 }];

      await expect(
        recommendationService.analyzePortfolio(
          'non_existent_user',
          mockPortfolio
        )
      ).rejects.toThrow('User profile not found');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty investment goals gracefully', async () => {
      const mockRequest: InvestmentRecommendationRequest = {
        userId: 'test_user_6',
        userProfile: {
          age: 30,
          experience: ExperienceLevel.INTERMEDIATE,
          currentPortfolio: [],
          totalInvestment: 10000,
          investmentKnowledge: KnowledgeLevel.INTERMEDIATE,
          preferredGenres: [],
          blacklistedCards: [],
          favoriteArtists: [],
          collectingStyle: CollectingStyle.CASUAL,
        },
        budget: 5000,
        timeHorizon: InvestmentTimeHorizon.MEDIUM_TERM,
        riskTolerance: RiskTolerance.MODERATE,
        investmentGoals: [], // Empty的投資目標
      };

      const _result =
        await recommendationService.generateRecommendation(mockRequest);
      expect(result).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle very aggressive risk tolerance', async () => {
      const mockRequest: InvestmentRecommendationRequest = {
        userId: 'test_user_7',
        userProfile: {
          age: 25,
          experience: ExperienceLevel.EXPERT,
          currentPortfolio: [],
          totalInvestment: 100000,
          investmentKnowledge: KnowledgeLevel.EXPERT,
          preferredGenres: ['Pokemon', 'Magic'],
          blacklistedCards: [],
          favoriteArtists: [],
          collectingStyle: CollectingStyle.SPECULATOR,
        },
        budget: 50000,
        timeHorizon: InvestmentTimeHorizon.LONG_TERM,
        riskTolerance: RiskTolerance.VERY_AGGRESSIVE,
        investmentGoals: [InvestmentGoal.SPECULATION],
      };

      const _result =
        await recommendationService.generateRecommendation(mockRequest);

      expect(result).toBeDefined();
      // 極度積極的風險承受度應該產生更多高風險高回報的建議
      const _highRiskCount = result.recommendations.filter(
        rec =>
          rec.riskLevel === RiskLevel.HIGH ||
          rec.riskLevel === RiskLevel.VERY_HIGH
      ).length;

      expect(highRiskCount).toBeGreaterThan(0);
    });

    it('should handle minimum budget scenario', async () => {
      const mockRequest: InvestmentRecommendationRequest = {
        userId: 'test_user_8',
        userProfile: {
          age: 20,
          experience: ExperienceLevel.BEGINNER,
          currentPortfolio: [],
          totalInvestment: 100,
          investmentKnowledge: KnowledgeLevel.BASIC,
          preferredGenres: [],
          blacklistedCards: [],
          favoriteArtists: [],
          collectingStyle: CollectingStyle.CASUAL,
        },
        budget: RECOMMENDATION_CONSTANTS.MIN_BUDGET,
        timeHorizon: InvestmentTimeHorizon.SHORT_TERM,
        riskTolerance: RiskTolerance.CONSERVATIVE,
        investmentGoals: [InvestmentGoal.CAPITAL_PRESERVATION],
      };

      const _result =
        await recommendationService.generateRecommendation(mockRequest);
      expect(result).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);

      // 預算較Hour，建議的卡牌價格應該都在預算範圍內
      result.recommendations.forEach(rec => {
        expect(rec.currentPrice).toBeLessThanOrEqual(mockRequest.budget);
      });
    });
  });
});
