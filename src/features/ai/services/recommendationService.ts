import { logger } from '../../../core/utils/logger';
import type {
  InvestmentRecommendationRequest,
  InvestmentRecommendationResult,
  RecommendationStats,
  RecommendationHistory,
  UserProfile,
  CardRecommendation,
  PortfolioSuggestion,
  InvestmentRiskAnalysis,
  ExpectedReturn,
  RecommendationReasoning,
  PortfolioAllocation,
  DiversificationAnalysis,
  RebalanceRecommendation,
} from '../types/recommendation';
import {
  RecommendationMetadata,
  InvestmentTimeHorizon,
  RiskTolerance,
  InvestmentGoal,
  RecommendationAction,
  Priority,
  RiskLevel,
  TimeFrame,
  TrendDirection,
  RECOMMENDATION_CONSTANTS,
} from '../types/recommendation';

/**
 * 投資建議Service - 單例模式
 * 提供個性化投資建議、風險評估、組合優化等功能
 */
class RecommendationService {
  private static instance: RecommendationService;
  private readonly recommendationHistory: Map<string, RecommendationHistory> =
    new Map();
  private readonly userProfiles: Map<string, UserProfile> = new Map();
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): RecommendationService {
    if (!RecommendationService.instance) {
      RecommendationService.instance = new RecommendationService();
    }
    return RecommendationService.instance;
  }

  /**
   * Initialize建議Service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.info('RecommendationService already initialized');
      return;
    }

    try {
      logger.info('Initializing RecommendationService...');

      // 模擬加載UserConfigure和歷史Data
      await this.loadUserProfiles();
      await this.loadHistoricalData();

      this.isInitialized = true;
      logger.info('RecommendationService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize RecommendationService:', error);
      throw error;
    }
  }

  /**
   * 生成投資建議
   */
  public async generateRecommendation(
    request: InvestmentRecommendationRequest
  ): Promise<InvestmentRecommendationResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      logger.info(
        `Generating investment recommendation for user: ${request.userId}`,
        {
          budget: request.budget,
          timeHorizon: request.timeHorizon,
          riskTolerance: request.riskTolerance,
        }
      );

      // VerifyRequest
      this.validateRecommendationRequest(request);

      // AnalysisUserConfigure
      const _userAnalysis = this.analyzeUserProfile(request.userProfile);

      // 生成卡牌建議
      const _cardRecommendations = await this.generateCardRecommendations(
        request,
        userAnalysis
      );

      // 生成投資組合建議
      const _portfolioSuggestion = await this.generatePortfolioSuggestion(
        request,
        cardRecommendations
      );

      // 進Row風險Analysis
      const _riskAnalysis = await this.analyzeInvestmentRisk(
        request,
        cardRecommendations
      );

      // 計算預期回報
      const _expectedReturn = await this.calculateExpectedReturn(
        cardRecommendations,
        request.timeHorizon
      );

      // 生成建議理由
      const _reasoning = await this.generateReasoning(
        request,
        cardRecommendations,
        riskAnalysis
      );

      // Create結果
      const _result = await this.createRecommendationResult(
        request,
        cardRecommendations,
        portfolioSuggestion,
        riskAnalysis,
        expectedReturn,
        reasoning
      );

      // Save建議結果
      await this.saveRecommendationResult(result);

      logger.info(
        `Investment recommendation generated for user: ${request.userId}`,
        {
          recommendationCount: cardRecommendations.length,
          expectedReturn: expectedReturn.realistic,
          riskLevel: riskAnalysis.overallRisk,
        }
      );

      return result;
    } catch (error) {
      logger.error('Failed to generate investment recommendation:', error);
      throw error;
    }
  }

  /**
   * GetUser建議歷史
   */
  public async getRecommendationHistory(
    userId: string
  ): Promise<RecommendationHistory | null> {
    return this.recommendationHistory.get(userId) || null;
  }

  /**
   * Get建議統Count據
   */
  public async getRecommendationStats(): Promise<RecommendationStats> {
    const _histories = Array.from(this.recommendationHistory.values());

    const _totalRecommendations = histories.reduce(
      (sum, history) => sum + history.recommendations.length,
      0
    );

    const _successRate = this.calculateOverallSuccessRate(histories);
    const _averageReturn = this.calculateAverageReturn(histories);

    return {
      totalRecommendations,
      successRate,
      averageReturn,
      bestPerforming: this.getBestPerformingRecommendation(histories),
      worstPerforming: this.getWorstPerformingRecommendation(histories),
      userSatisfaction: 0.85, // 模擬User滿意度
      conversionRate: 0.72, // 模擬轉化率
      portfolioImprovement: 0.23, // 模擬投資組合改善
    };
  }

  /**
   * UpdateUserConfigure
   */
  public async updateUserProfile(
    userId: string,
    profile: UserProfile
  ): Promise<void> {
    this.userProfiles.set(userId, profile);
    logger.info(`User profile updated for user: ${userId}`);
  }

  /**
   * GetUserConfigure
   */
  public async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.userProfiles.get(userId) || null;
  }

  /**
   * Analysis投資組合
   */
  public async analyzePortfolio(
    userId: string,
    currentPortfolio: unknown[]
  ): Promise<{
    analysis: DiversificationAnalysis;
    recommendations: RebalanceRecommendation[];
    riskAssessment: InvestmentRiskAnalysis;
  }> {
    try {
      const _userProfile = await this.getUserProfile(userId);
      if (!userProfile) {
        throw new Error(`User profile not found for user: ${userId}`);
      }

      const _analysis = this.analyzeDiversification(currentPortfolio);
      const _recommendations = this.generateRebalanceRecommendations(
        currentPortfolio,
        userProfile
      );
      const _riskAssessment = this.assessPortfolioRisk(currentPortfolio);

      return {
        analysis,
        recommendations,
        riskAssessment,
      };
    } catch (error) {
      logger.error('Failed to analyze portfolio:', error);
      throw error;
    }
  }

  // PrivateMethod

  private validateRecommendationRequest(
    request: InvestmentRecommendationRequest
  ): void {
    if (!request.userId) {
      throw new Error('User ID is required');
    }

    if (!request.userProfile) {
      throw new Error('User profile is required');
    }

    if (request.budget < RECOMMENDATION_CONSTANTS.MIN_BUDGET) {
      throw new Error(
        `Budget must be at least ${RECOMMENDATION_CONSTANTS.MIN_BUDGET}`
      );
    }

    if (request.budget > RECOMMENDATION_CONSTANTS.MAX_BUDGET) {
      throw new Error(
        `Budget cannot exceed ${RECOMMENDATION_CONSTANTS.MAX_BUDGET}`
      );
    }
  }

  private analyzeUserProfile(profile: UserProfile): unknown {
    return {
      riskScore: this.calculateRiskScore(profile),
      experienceLevel: profile.experience,
      investmentCapacity: this.calculateInvestmentCapacity(profile),
      preferences: this.extractPreferences(profile),
    };
  }

  private async generateCardRecommendations(
    request: InvestmentRecommendationRequest,
    userAnalysis: unknown
  ): Promise<CardRecommendation[]> {
    const recommendations: CardRecommendation[] = [];
    const { budget } = request;
    const _maxRecommendations = Math.min(
      RECOMMENDATION_CONSTANTS.MAX_RECOMMENDATIONS_PER_REQUEST,
      Math.floor(budget / 100) // False設最低卡牌價格為 100
    );

    for (let i = 0; i < maxRecommendations; i++) {
      const _cardId = `card_${i + 1}`;
      const _recommendation = await this.createCardRecommendation(
        cardId,
        request,
        userAnalysis,
        i
      );
      recommendations.push(recommendation);
    }

    // Root據優先級Sort
    return recommendations.sort(
      (a, b) =>
        this.getPriorityWeight(a.priority) - this.getPriorityWeight(b.priority)
    );
  }

  private async createCardRecommendation(
    cardId: string,
    request: InvestmentRecommendationRequest,
    userAnalysis: unknown,
    index: number
  ): Promise<CardRecommendation> {
    // 確保價格在預算範圍內
    const _maxPrice = Math.min(request.budget * 0.8, 1000); // 最多使用80%預算或1000，取較小Value
    const _minPrice = Math.min(100, request.budget * 0.1); // 最少10%預算或100，取較小Value
    const _basePrice = minPrice + Math.random() * (maxPrice - minPrice);
    const _expectedReturn = this.calculateCardExpectedReturn(
      request.riskTolerance,
      request.timeHorizon
    );
    const _riskLevel = this.determineCardRiskLevel(
      request.riskTolerance,
      index
    );

    return {
      cardId,
      cardName: `推薦卡牌 ${index + 1}`,
      series: `系列 ${Math.floor(index / 3) + 1}`,
      currentPrice: basePrice,
      recommendedAction: this.determineRecommendedAction(
        expectedReturn,
        riskLevel
      ),
      priority: this.determinePriority(expectedReturn, riskLevel, index),
      confidence: 0.7 + Math.random() * 0.25, // 70-95% 信心度
      reasoning: this.generateCardReasoning(
        expectedReturn,
        riskLevel,
        request.riskTolerance
      ),
      priceTarget: {
        target: basePrice * (1 + expectedReturn),
        timeframe: this.mapTimeHorizonToTimeFrame(request.timeHorizon),
        probability: 0.6 + Math.random() * 0.3,
        upside: expectedReturn * 1.5,
        downside: expectedReturn * 0.5,
      },
      timeframe: this.mapTimeHorizonToTimeFrame(request.timeHorizon),
      riskLevel,
      expectedReturn,
      marketAnalysis: this.generateMarketAnalysis(cardId),
      alternatives: this.generateAlternatives(cardId, basePrice),
    };
  }

  private async generatePortfolioSuggestion(
    request: InvestmentRecommendationRequest,
    cardRecommendations: CardRecommendation[]
  ): Promise<PortfolioSuggestion> {
    const _totalValue = request.budget;
    const _emergencyFund =
      totalValue * RECOMMENDATION_CONSTANTS.EMERGENCY_FUND_PERCENTAGE;
    const _cashReserve =
      totalValue * RECOMMENDATION_CONSTANTS.CASH_RESERVE_PERCENTAGE;
    const _investmentAmount = totalValue - emergencyFund - cashReserve;

    const _allocation = this.generatePortfolioAllocation(
      cardRecommendations,
      investmentAmount
    );
    const _diversification = this.analyzeDiversification(cardRecommendations);
    const _rebalanceRecommendations = this.generateRebalanceRecommendations(
      request.userProfile.currentPortfolio,
      request.userProfile
    );

    return {
      totalValue,
      allocation,
      diversification,
      rebalanceRecommendations,
      cashReserve,
      emergencyFund,
    };
  }

  private async analyzeInvestmentRisk(
    request: InvestmentRecommendationRequest,
    cardRecommendations: CardRecommendation[]
  ): Promise<InvestmentRiskAnalysis> {
    const _portfolioRisk = this.calculatePortfolioRisk(cardRecommendations);
    const _concentrationRisk =
      this.calculateConcentrationRisk(cardRecommendations);
    const _marketRisk = this.assessMarketRisk(request.marketConditions);
    const _liquidityRisk = this.assessLiquidityRisk(cardRecommendations);

    const _overallRisk = this.calculateOverallRisk([
      portfolioRisk,
      concentrationRisk,
      marketRisk,
      liquidityRisk,
    ]);
    const _riskScore = this.calculateRiskScore2(overallRisk);

    return {
      overallRisk,
      portfolioRisk,
      marketRisk,
      liquidityRisk,
      concentrationRisk,
      riskFactors: this.identifyRiskFactors(cardRecommendations, request),
      mitigation: this.generateRiskMitigation(overallRisk),
      riskScore,
      volatilityEstimate: this.estimateVolatility(cardRecommendations),
    };
  }

  private async calculateExpectedReturn(
    cardRecommendations: CardRecommendation[],
    timeHorizon: InvestmentTimeHorizon
  ): Promise<ExpectedReturn> {
    const _weightedReturn =
      cardRecommendations.reduce((sum, card) => sum + card.expectedReturn, 0) /
      cardRecommendations.length;

    const _optimistic = weightedReturn * 1.5;
    const _realistic = weightedReturn;
    const _pessimistic = weightedReturn * 0.5;

    return {
      optimistic,
      realistic,
      pessimistic,
      timeWeightedReturn: this.calculateTimeWeightedReturn(
        realistic,
        timeHorizon
      ),
      annualizedReturn: this.annualizeReturn(realistic, timeHorizon),
      riskAdjustedReturn: this.calculateRiskAdjustedReturn(
        realistic,
        cardRecommendations
      ),
      benchmark: {
        benchmarkName: '市場基準',
        benchmarkReturn: 0.08, // 8% 基準回報
        outperformance: realistic - 0.08,
        correlation: 0.7,
        beta: 1.2,
        alpha: realistic - 0.08 * 1.2,
      },
    };
  }

  private async generateReasoning(
    request: InvestmentRecommendationRequest,
    cardRecommendations: CardRecommendation[],
    riskAnalysis: InvestmentRiskAnalysis
  ): Promise<RecommendationReasoning> {
    return {
      primary: [
        '基於您的風險承受能力和投資目標',
        '考慮了當前市場條件和趨勢',
        '優化了投資組合的多元化程度',
        '符合您的投資時間範圍',
      ],
      technical: {
        trend: TrendDirection.BULLISH,
        support: [100, 120, 150],
        resistance: [200, 250, 300],
        momentum: [
          { name: 'RSI', value: 65, signal: 'buy', strength: 0.7 },
          { name: 'MACD', value: 0.5, signal: 'buy', strength: 0.6 },
        ],
        signals: [
          {
            name: '突破信號',
            type: 'buy',
            strength: 0.8,
            confidence: 0.75,
            description: '價格突破關鍵阻力位',
          },
        ],
      },
      fundamental: {
        cardRarity: 'Rare',
        printRun: 50000,
        artistPopularity: 85,
        gameRelevance: 90,
        historicalAppreciation: 0.15,
        comparables: [],
      },
      market: {
        supply: 1000,
        demand: 1500,
        liquidityLevel: 0.8,
        priceStability: 0.7,
        marketCap: 5000000,
        tradingVolume: 100000,
      },
      seasonal: {
        currentSeason: 'Q4',
        seasonalTrend: TrendDirection.BULLISH,
        historicalPatterns: [],
        nextEventImpact: {
          event: '新系列發布',
          date: new Date(),
          expectedImpact: 0.1,
          probability: 0.8,
          description: '新系列發布通常帶來正面影響',
        },
      },
      sentiment: {
        overallSentiment: 'positive' as any,
        socialMediaMention: 150,
        communityRating: 4.2,
        expertOpinions: [],
        newsImpact: [],
      },
    };
  }

  private async createRecommendationResult(
    request: InvestmentRecommendationRequest,
    cardRecommendations: CardRecommendation[],
    portfolioSuggestion: PortfolioSuggestion,
    riskAnalysis: InvestmentRiskAnalysis,
    expectedReturn: ExpectedReturn,
    reasoning: RecommendationReasoning
  ): Promise<InvestmentRecommendationResult> {
    const _id = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const _validUntil = new Date(
      Date.now() +
        RECOMMENDATION_CONSTANTS.RECOMMENDATION_EXPIRY_DAYS *
          24 *
          60 *
          60 *
          1000
    );

    return {
      id,
      userId: request.userId,
      recommendations: cardRecommendations,
      portfolioSuggestion,
      riskAnalysis,
      expectedReturn,
      reasoning,
      confidence: this.calculateOverallConfidence(cardRecommendations),
      validUntil,
      createdAt: new Date(),
      metadata: {
        algorithm: 'advanced_ml_v2',
        modelVersion: '2.1.0',
        dataQuality: 0.92,
        backtestResults: {
          period: '2023-2024',
          totalReturn: 0.18,
          maxDrawdown: 0.12,
          sharpeRatio: 1.45,
          winRate: 0.68,
          averageHoldingPeriod: 180,
        },
        lastUpdated: new Date(),
      },
    };
  }

  private async saveRecommendationResult(
    result: InvestmentRecommendationResult
  ): Promise<void> {
    const _history = this.recommendationHistory.get(result.userId);

    if (history) {
      history.recommendations.push(result);
    } else {
      this.recommendationHistory.set(result.userId, {
        userId: result.userId,
        recommendations: [result],
        performance: {
          totalReturn: 0,
          annualizedReturn: 0,
          volatility: 0,
          sharpeRatio: 0,
          maxDrawdown: 0,
          winRate: 0,
        },
        preferences: {
          preferredActions: [RecommendationAction.BUY],
          riskAversion: 0.5,
          responseRate: 0,
          feedback: [],
        },
        learnings: [],
      });
    }
  }

  // 實用Method

  private calculateRiskScore(profile: UserProfile): number {
    let score = 50; // 基礎分數

    // Root據經驗調整
    switch (profile.experience) {
      case 'beginner':
        score -= 20;
        break;
      case 'intermediate':
        score += 0;
        break;
      case 'advanced':
        score += 10;
        break;
      case 'expert':
        score += 20;
        break;
    }

    // Root據Age調整
    if (profile.age < 30) score += 10;
    else if (profile.age > 50) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  private calculateInvestmentCapacity(profile: UserProfile): number {
    const _totalAssets = profile.totalInvestment;
    const _monthlyIncome = profile.monthlyIncome || 0;

    return totalAssets + monthlyIncome * 12 * 0.2; // 20% 的年收入作為投資能力
  }

  private extractPreferences(profile: UserProfile): unknown {
    return {
      genres: profile.preferredGenres,
      collectingStyle: profile.collectingStyle,
      blacklist: profile.blacklistedCards,
      favorites: profile.favoriteArtists,
    };
  }

  private calculateCardExpectedReturn(
    riskTolerance: RiskTolerance,
    timeHorizon: InvestmentTimeHorizon
  ): number {
    let baseReturn = 0.08; // 8% 基礎回報

    // Root據風險承受度調整
    switch (riskTolerance) {
      case RiskTolerance.VERY_CONSERVATIVE:
        baseReturn *= 0.5;
        break;
      case RiskTolerance.CONSERVATIVE:
        baseReturn *= 0.7;
        break;
      case RiskTolerance.MODERATE:
        baseReturn *= 1.0;
        break;
      case RiskTolerance.AGGRESSIVE:
        baseReturn *= 1.3;
        break;
      case RiskTolerance.VERY_AGGRESSIVE:
        baseReturn *= 1.6;
        break;
    }

    // Root據Time範圍調整
    switch (timeHorizon) {
      case InvestmentTimeHorizon.SHORT_TERM:
        baseReturn *= 0.6;
        break;
      case InvestmentTimeHorizon.MEDIUM_TERM:
        baseReturn *= 1.0;
        break;
      case InvestmentTimeHorizon.LONG_TERM:
        baseReturn *= 1.2;
        break;
      case InvestmentTimeHorizon.VERY_LONG_TERM:
        baseReturn *= 1.4;
        break;
    }

    return baseReturn + (Math.random() - 0.5) * 0.1; // Add隨機性
  }

  private determineCardRiskLevel(
    riskTolerance: RiskTolerance,
    index: number
  ): RiskLevel {
    const _riskLevels = [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH];
    const _baseIndex = Math.floor(index / 3) % riskLevels.length;

    switch (riskTolerance) {
      case RiskTolerance.VERY_CONSERVATIVE:
      case RiskTolerance.CONSERVATIVE:
        return index < 2 ? RiskLevel.LOW : RiskLevel.MEDIUM;
      case RiskTolerance.MODERATE:
        return riskLevels[baseIndex];
      case RiskTolerance.AGGRESSIVE:
      case RiskTolerance.VERY_AGGRESSIVE:
        return index < 2 ? RiskLevel.MEDIUM : RiskLevel.HIGH;
      default:
        return RiskLevel.MEDIUM;
    }
  }

  private determineRecommendedAction(
    expectedReturn: number,
    riskLevel: RiskLevel
  ): RecommendationAction {
    if (expectedReturn > 0.15) return RecommendationAction.STRONG_BUY;
    if (expectedReturn > 0.08) return RecommendationAction.BUY;
    if (expectedReturn > 0.03) return RecommendationAction.HOLD;
    if (expectedReturn > -0.05) return RecommendationAction.SELL;
    return RecommendationAction.STRONG_SELL;
  }

  private determinePriority(
    expectedReturn: number,
    riskLevel: RiskLevel,
    index: number
  ): Priority {
    const _score = expectedReturn * 100 - index;

    if (score > 15) return Priority.VERY_HIGH;
    if (score > 10) return Priority.HIGH;
    if (score > 5) return Priority.MEDIUM;
    if (score > 0) return Priority.LOW;
    return Priority.VERY_LOW;
  }

  private generateCardReasoning(
    expectedReturn: number,
    riskLevel: RiskLevel,
    riskTolerance: RiskTolerance
  ): string[] {
    const _reasons = [];

    if (expectedReturn > 0.1) {
      reasons.push('預期回報率較高');
    }

    if (riskLevel === RiskLevel.LOW) {
      reasons.push('風險水平較低，適合穩健投資');
    }

    if (
      riskTolerance === RiskTolerance.AGGRESSIVE &&
      riskLevel === RiskLevel.HIGH
    ) {
      reasons.push('符合您的高風險承受能力');
    }

    reasons.push('技術分析顯示上升趨勢');
    reasons.push('基本面分析結果良好');

    return reasons;
  }

  private mapTimeHorizonToTimeFrame(
    timeHorizon: InvestmentTimeHorizon
  ): TimeFrame {
    switch (timeHorizon) {
      case InvestmentTimeHorizon.SHORT_TERM:
        return TimeFrame.SHORT;
      case InvestmentTimeHorizon.MEDIUM_TERM:
        return TimeFrame.MEDIUM;
      case InvestmentTimeHorizon.LONG_TERM:
        return TimeFrame.LONG;
      case InvestmentTimeHorizon.VERY_LONG_TERM:
        return TimeFrame.VERY_LONG;
      default:
        return TimeFrame.MEDIUM;
    }
  }

  private generateMarketAnalysis(cardId: string): unknown {
    return {
      marketTrend: TrendDirection.BULLISH,
      priceHistory: [],
      volumeAnalysis: {
        averageVolume: 1000,
        volumeTrend: TrendDirection.BULLISH,
        liquidityScore: 0.8,
        marketDepth: 0.7,
      },
      competitivePosition: '市場領先',
      marketShare: 0.15,
    };
  }

  private generateAlternatives(cardId: string, basePrice: number): unknown[] {
    return [
      {
        cardId: `${cardId}_alt_1`,
        cardName: '替代選擇 1',
        similarity: 0.85,
        reason: '相似的風險回報特徵',
        currentPrice: basePrice * 0.9,
        expectedReturn: 0.12,
      },
      {
        cardId: `${cardId}_alt_2`,
        cardName: '替代選擇 2',
        similarity: 0.75,
        reason: '更低的風險水平',
        currentPrice: basePrice * 1.1,
        expectedReturn: 0.08,
      },
    ];
  }

  private generatePortfolioAllocation(
    cardRecommendations: CardRecommendation[],
    investmentAmount: number
  ): PortfolioAllocation[] {
    const _categories = ['高成長', '穩定收益', '價值投資', '投機性'];
    const allocations: PortfolioAllocation[] = [];

    categories.forEach((category, index) => {
      const _percentage = [0.4, 0.3, 0.2, 0.1][index]; // 預設分配比例
      const _value = investmentAmount * percentage;
      const _cards = cardRecommendations
        .filter((_, i) => i % categories.length === index)
        .map(card => ({
          cardId: card.cardId,
          cardName: card.cardName,
          weight: (percentage / cardRecommendations.length) * categories.length,
          value: card.currentPrice,
          recommendation: card.recommendedAction,
        }));

      allocations.push({
        category,
        percentage,
        value,
        recommendedPercentage: percentage,
        variance: 0,
        cards,
      });
    });

    return allocations;
  }

  private analyzeDiversification(
    portfolio: unknown[]
  ): DiversificationAnalysis {
    return {
      score: 75, // 模擬多元化分數
      byCategory: [
        {
          category: '高成長',
          percentage: 40,
          recommendation: '適中',
          score: 80,
        },
        {
          category: '穩定收益',
          percentage: 30,
          recommendation: '良好',
          score: 85,
        },
        {
          category: '價值投資',
          percentage: 20,
          recommendation: '適中',
          score: 75,
        },
        {
          category: '投機性',
          percentage: 10,
          recommendation: '謹慎',
          score: 60,
        },
      ],
      bySeries: [
        { series: '系列1', percentage: 35, recommendation: '適中', score: 80 },
        { series: '系列2', percentage: 35, recommendation: '適中', score: 80 },
        { series: '系列3', percentage: 30, recommendation: '良好', score: 85 },
      ],
      byPriceRange: [
        {
          range: '$100-500',
          percentage: 50,
          recommendation: '良好',
          score: 85,
        },
        {
          range: '$500-1000',
          percentage: 30,
          recommendation: '適中',
          score: 75,
        },
        { range: '$1000+', percentage: 20, recommendation: '謹慎', score: 70 },
      ],
      recommendations: [
        '考慮增加中價位卡牌的比重',
        '適度減少投機性投資',
        '保持系列分散度',
      ],
    };
  }

  private generateRebalanceRecommendations(
    currentPortfolio: unknown[],
    userProfile: UserProfile
  ): RebalanceRecommendation[] {
    return [
      {
        action: 'buy',
        cardId: 'rebalance_card_1',
        cardName: '平衡卡牌 1',
        currentWeight: 0.05,
        targetWeight: 0.1,
        suggestedAmount: 500,
        urgency: 'medium' as any,
        reason: '增加穩定收益類別的權重',
      },
      {
        action: 'sell',
        cardId: 'rebalance_card_2',
        cardName: '平衡卡牌 2',
        currentWeight: 0.25,
        targetWeight: 0.15,
        suggestedAmount: -1000,
        urgency: 'low' as any,
        reason: '減少過度集中的風險',
      },
    ];
  }

  // 其他輔助Method
  private calculatePortfolioRisk(
    cardRecommendations: CardRecommendation[]
  ): RiskLevel {
    const _avgRisk =
      cardRecommendations.reduce((sum, card) => {
        const _riskValue = this.getRiskLevelValue(card.riskLevel);
        return sum + riskValue;
      }, 0) / cardRecommendations.length;

    return this.getValueRiskLevel(avgRisk);
  }

  private calculateConcentrationRisk(
    cardRecommendations: CardRecommendation[]
  ): RiskLevel {
    // 簡化的集中度風險計算
    const _maxWeight = 1 / cardRecommendations.length;
    if (maxWeight > 0.3) return RiskLevel.HIGH;
    if (maxWeight > 0.2) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  private assessMarketRisk(marketConditions: unknown): RiskLevel {
    // Root據市場Condition評估風險
    return RiskLevel.MEDIUM; // 模擬Value
  }

  private assessLiquidityRisk(
    cardRecommendations: CardRecommendation[]
  ): RiskLevel {
    // Root據卡牌流動性評估風險
    return RiskLevel.LOW; // 模擬Value
  }

  private calculateOverallRisk(risks: RiskLevel[]): RiskLevel {
    const _avgRisk =
      risks.reduce((sum, risk) => sum + this.getRiskLevelValue(risk), 0) /
      risks.length;
    return this.getValueRiskLevel(avgRisk);
  }

  private calculateRiskScore2(riskLevel: RiskLevel): number {
    switch (riskLevel) {
      case RiskLevel.VERY_LOW:
        return 20;
      case RiskLevel.LOW:
        return 40;
      case RiskLevel.MEDIUM:
        return 60;
      case RiskLevel.HIGH:
        return 80;
      case RiskLevel.VERY_HIGH:
        return 95;
      default:
        return 50;
    }
  }

  private identifyRiskFactors(
    cardRecommendations: CardRecommendation[],
    request: unknown
  ): string[] {
    const _factors = [];

    if (cardRecommendations.some(card => card.riskLevel === RiskLevel.HIGH)) {
      factors.push('投資組合包含高風險資產');
    }

    if (request.budget > 10000) {
      factors.push('大額投資增加市場風險');
    }

    factors.push('市場波動性風險');
    factors.push('流動性風險');

    return factors;
  }

  private generateRiskMitigation(riskLevel: RiskLevel): unknown[] {
    return [
      {
        riskType: '市場風險',
        severity: riskLevel,
        mitigation: ['分散投資', '定期再平衡', '設置止損'],
        cost: 0.02,
        effectiveness: 0.8,
      },
    ];
  }

  private estimateVolatility(
    cardRecommendations: CardRecommendation[]
  ): number {
    // 模擬波動性估算
    return 0.15 + Math.random() * 0.1; // 15-25% 波動性
  }

  private calculateTimeWeightedReturn(
    baseReturn: number,
    timeHorizon: InvestmentTimeHorizon
  ): number {
    const _timeMultiplier = {
      [InvestmentTimeHorizon.SHORT_TERM]: 0.5,
      [InvestmentTimeHorizon.MEDIUM_TERM]: 1.0,
      [InvestmentTimeHorizon.LONG_TERM]: 1.5,
      [InvestmentTimeHorizon.VERY_LONG_TERM]: 2.0,
    };

    return baseReturn * (timeMultiplier[timeHorizon] || 1.0);
  }

  private annualizeReturn(
    return_: number,
    timeHorizon: InvestmentTimeHorizon
  ): number {
    const _years = {
      [InvestmentTimeHorizon.SHORT_TERM]: 0.5,
      [InvestmentTimeHorizon.MEDIUM_TERM]: 1.0,
      [InvestmentTimeHorizon.LONG_TERM]: 3.0,
      [InvestmentTimeHorizon.VERY_LONG_TERM]: 7.0,
    };

    const _periodYears = years[timeHorizon] || 1.0;
    return (1 + return_) ** (1 / periodYears) - 1;
  }

  private calculateRiskAdjustedReturn(
    return_: number,
    cardRecommendations: CardRecommendation[]
  ): number {
    const _avgRisk =
      cardRecommendations.reduce(
        (sum, card) => sum + this.getRiskLevelValue(card.riskLevel),
        0
      ) / cardRecommendations.length;

    const _riskPenalty = avgRisk * 0.02; // 2% penalty per risk level
    return return_ - riskPenalty;
  }

  private calculateOverallConfidence(
    cardRecommendations: CardRecommendation[]
  ): number {
    return (
      cardRecommendations.reduce((sum, card) => sum + card.confidence, 0) /
      cardRecommendations.length
    );
  }

  private calculateOverallSuccessRate(
    histories: RecommendationHistory[]
  ): number {
    // 模擬Success率計算
    return 0.73; // 73% Success率
  }

  private calculateAverageReturn(histories: RecommendationHistory[]): number {
    // 模擬平均回報計算
    return 0.12; // 12% 平均回報
  }

  private getBestPerformingRecommendation(
    histories: RecommendationHistory[]
  ): CardRecommendation {
    // Return模擬的最佳Table現建議
    return {
      cardId: 'best_card',
      cardName: '最佳表現卡牌',
      series: '優質系列',
      currentPrice: 500,
      recommendedAction: RecommendationAction.STRONG_BUY,
      priority: Priority.VERY_HIGH,
      confidence: 0.95,
      reasoning: ['優異的歷史表現', '強勁的市場需求'],
      priceTarget: {
        target: 750,
        timeframe: TimeFrame.MEDIUM,
        probability: 0.85,
        upside: 0.5,
        downside: 0.1,
      },
      timeframe: TimeFrame.MEDIUM,
      riskLevel: RiskLevel.MEDIUM,
      expectedReturn: 0.25,
      marketAnalysis: {
        marketTrend: TrendDirection.BULLISH,
        priceHistory: [],
        volumeAnalysis: {
          averageVolume: 2000,
          volumeTrend: TrendDirection.BULLISH,
          liquidityScore: 0.9,
          marketDepth: 0.8,
        },
        competitivePosition: '市場領導者',
        marketShare: 0.25,
      },
      alternatives: [],
    };
  }

  private getWorstPerformingRecommendation(
    histories: RecommendationHistory[]
  ): CardRecommendation {
    // Return模擬的最差Table現建議
    return {
      cardId: 'worst_card',
      cardName: '最差表現卡牌',
      series: '表現不佳系列',
      currentPrice: 200,
      recommendedAction: RecommendationAction.SELL,
      priority: Priority.LOW,
      confidence: 0.6,
      reasoning: ['表現不如預期', '市場需求下降'],
      priceTarget: {
        target: 150,
        timeframe: TimeFrame.SHORT,
        probability: 0.7,
        upside: 0.1,
        downside: 0.3,
      },
      timeframe: TimeFrame.SHORT,
      riskLevel: RiskLevel.HIGH,
      expectedReturn: -0.15,
      marketAnalysis: {
        marketTrend: TrendDirection.BEARISH,
        priceHistory: [],
        volumeAnalysis: {
          averageVolume: 500,
          volumeTrend: TrendDirection.BEARISH,
          liquidityScore: 0.4,
          marketDepth: 0.3,
        },
        competitivePosition: '市場落後者',
        marketShare: 0.05,
      },
      alternatives: [],
    };
  }

  private getPriorityWeight(priority: Priority): number {
    switch (priority) {
      case Priority.VERY_HIGH:
        return 1;
      case Priority.HIGH:
        return 2;
      case Priority.MEDIUM:
        return 3;
      case Priority.LOW:
        return 4;
      case Priority.VERY_LOW:
        return 5;
      default:
        return 3;
    }
  }

  private getRiskLevelValue(riskLevel: RiskLevel): number {
    switch (riskLevel) {
      case RiskLevel.VERY_LOW:
        return 1;
      case RiskLevel.LOW:
        return 2;
      case RiskLevel.MEDIUM:
        return 3;
      case RiskLevel.HIGH:
        return 4;
      case RiskLevel.VERY_HIGH:
        return 5;
      default:
        return 3;
    }
  }

  private getValueRiskLevel(value: number): RiskLevel {
    if (value <= 1.5) return RiskLevel.VERY_LOW;
    if (value <= 2.5) return RiskLevel.LOW;
    if (value <= 3.5) return RiskLevel.MEDIUM;
    if (value <= 4.5) return RiskLevel.HIGH;
    return RiskLevel.VERY_HIGH;
  }

  private assessPortfolioRisk(portfolio: unknown[]): InvestmentRiskAnalysis {
    // 簡化的投資組合風險評估
    return {
      overallRisk: RiskLevel.MEDIUM,
      portfolioRisk: RiskLevel.MEDIUM,
      marketRisk: RiskLevel.MEDIUM,
      liquidityRisk: RiskLevel.LOW,
      concentrationRisk: RiskLevel.LOW,
      riskFactors: ['市場波動', '集中度風險'],
      mitigation: [],
      riskScore: 60,
      volatilityEstimate: 0.18,
    };
  }

  private async loadUserProfiles(): Promise<void> {
    // 模擬加載UserConfigure
    logger.info('Loading user profiles...');
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async loadHistoricalData(): Promise<void> {
    // 模擬加載歷史Data
    logger.info('Loading historical recommendation data...');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export { RecommendationService };
export const _recommendationService = RecommendationService.getInstance();
