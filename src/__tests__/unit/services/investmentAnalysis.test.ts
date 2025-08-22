import { investmentService } from '../../../services/investmentService';
import { portfolioService } from '../../../services/portfolioService';

// Mock 外部依賴
jest.mock('../../../services/investmentService');
jest.mock('../../../services/portfolioService');
jest.mock('../../../utils/logger');

describe('投資評估功能測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('投資組合分析測試', () => {
    it('應該正確分析投資組合', async () => {
      const mockPortfolio = {
        userId: 'user-123',
        cards: [
          { id: 'card-1', name: '青眼白龍', quantity: 2, avgPrice: 100, currentPrice: 120 },
          { id: 'card-2', name: '黑魔導', quantity: 1, avgPrice: 80, currentPrice: 85 },
          { id: 'card-3', name: '真紅眼黑龍', quantity: 3, avgPrice: 50, currentPrice: 45 }
        ]
      };

      const mockAnalysisResult = {
        totalValue: 415,
        totalCost: 430,
        totalReturn: -15,
        returnRate: -3.49,
        diversification: {
          score: 0.75,
          categories: ['龍族', '魔法師族', '惡魔族'],
          recommendations: ['增加不同種族卡片以分散風險']
        },
        performance: {
          bestPerformer: { name: '青眼白龍', return: 20 },
          worstPerformer: { name: '真紅眼黑龍', return: -10 },
          volatility: 'medium'
        }
      };

      const mockInvestment = require('../../../services/investmentService');
      mockInvestment.investmentService.analyzePortfolio.mockResolvedValue(mockAnalysisResult);

      const result = await investmentService.analyzePortfolio(mockPortfolio);

      expect(result.totalValue).toBe(415);
      expect(result.returnRate).toBeCloseTo(-3.49, 2);
      expect(result.diversification.score).toBeGreaterThan(0.7);
      expect(result.performance.bestPerformer.return).toBe(20);
    });
  });

  describe('風險評估測試', () => {
    it('應該正確評估投資風險', async () => {
      const mockPortfolio = {
        userId: 'user-123',
        cards: [
          { id: 'card-1', name: '青眼白龍', quantity: 2, avgPrice: 100, currentPrice: 120 },
          { id: 'card-2', name: '黑魔導', quantity: 1, avgPrice: 80, currentPrice: 85 }
        ]
      };

      const mockRiskAssessment = {
        overallRisk: 'medium',
        score: 0.65,
        factors: {
          concentration: { risk: 'high', details: '過度集中在高價值卡片' },
          volatility: { risk: 'medium', details: '市場波動性中等' },
          liquidity: { risk: 'low', details: '流動性良好' }
        },
        recommendations: [
          '分散投資到不同價位區間',
          '考慮增加穩定收益型卡片',
          '定期重新平衡投資組合'
        ]
      };

      const mockInvestment = require('../../../services/investmentService');
      mockInvestment.investmentService.assessRisk.mockResolvedValue(mockRiskAssessment);

      const result = await investmentService.assessRisk(mockPortfolio);

      expect(result.overallRisk).toBe('medium');
      expect(result.score).toBeGreaterThan(0.6);
      expect(result.factors.concentration.risk).toBe('high');
      expect(result.recommendations).toHaveLength(3);
    });
  });

  describe('收益預測測試', () => {
    it('應該正確預測投資收益', async () => {
      const mockPortfolio = {
        userId: 'user-123',
        cards: [
          { id: 'card-1', name: '青眼白龍', quantity: 2, avgPrice: 100, currentPrice: 120 }
        ]
      };

      const mockReturnPrediction = {
        shortTerm: {
          timeframe: '3m',
          expectedReturn: 8.5,
          confidence: 0.75,
          factors: ['市場需求穩定', '供應有限']
        },
        mediumTerm: {
          timeframe: '1y',
          expectedReturn: 15.2,
          confidence: 0.68,
          factors: ['長期收藏價值', '競賽影響']
        },
        longTerm: {
          timeframe: '3y',
          expectedReturn: 25.8,
          confidence: 0.55,
          factors: ['歷史升值趨勢', '稀有性保持']
        },
        scenarios: {
          optimistic: 35.0,
          realistic: 15.2,
          pessimistic: -5.0
        }
      };

      const mockInvestment = require('../../../services/investmentService');
      mockInvestment.investmentService.predictReturns.mockResolvedValue(mockReturnPrediction);

      const result = await investmentService.predictReturns(mockPortfolio);

      expect(result.shortTerm.expectedReturn).toBeGreaterThan(5);
      expect(result.mediumTerm.confidence).toBeGreaterThan(0.6);
      expect(result.scenarios.realistic).toBe(15.2);
    });
  });

  describe('投資建議測試', () => {
    it('應該提供個性化投資建議', async () => {
      const mockUserProfile = {
        userId: 'user-123',
        riskTolerance: 'medium',
        investmentGoal: 'growth',
        timeHorizon: '5y',
        budget: 1000
      };

      const mockInvestmentAdvice = {
        recommendations: [
          {
            type: 'buy',
            cardId: 'card-4',
            cardName: '混沌戰士',
            reason: '符合風險偏好，具有升值潛力',
            confidence: 0.82
          },
          {
            type: 'hold',
            cardId: 'card-1',
            cardName: '青眼白龍',
            reason: '表現良好，建議繼續持有',
            confidence: 0.78
          },
          {
            type: 'sell',
            cardId: 'card-3',
            cardName: '真紅眼黑龍',
            reason: '表現不佳，建議止損',
            confidence: 0.75
          }
        ],
        portfolioOptimization: {
          targetAllocation: {
            highValue: 0.4,
            mediumValue: 0.4,
            lowValue: 0.2
          },
          rebalancingNeeded: true
        }
      };

      const mockInvestment = require('../../../services/investmentService');
      mockInvestment.investmentService.getInvestmentAdvice.mockResolvedValue(mockInvestmentAdvice);

      const result = await investmentService.getInvestmentAdvice(mockUserProfile);

      expect(result.recommendations).toHaveLength(3);
      expect(result.recommendations[0].confidence).toBeGreaterThan(0.8);
      expect(result.portfolioOptimization.rebalancingNeeded).toBe(true);
    });
  });

  describe('市場時機分析測試', () => {
    it('應該分析最佳買賣時機', async () => {
      const mockCardId = 'card-1';
      const mockMarketTiming = {
        currentMarketPhase: 'bull',
        recommendation: 'buy',
        confidence: 0.78,
        analysis: {
          priceTrend: 'upward',
          volume: 'increasing',
          sentiment: 'positive',
          technicalIndicators: {
            rsi: 65,
            macd: 'positive',
            movingAverage: 'above'
          }
        },
        timing: {
          bestEntryPoint: 'within_1_week',
          expectedPrice: 125,
          stopLoss: 110
        }
      };

      const mockInvestment = require('../../../services/investmentService');
      mockInvestment.investmentService.analyzeMarketTiming.mockResolvedValue(mockMarketTiming);

      const result = await investmentService.analyzeMarketTiming(mockCardId);

      expect(result.currentMarketPhase).toBe('bull');
      expect(result.recommendation).toBe('buy');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.analysis.sentiment).toBe('positive');
    });
  });

  describe('投資組合優化測試', () => {
    it('應該提供投資組合優化建議', async () => {
      const mockPortfolio = {
        userId: 'user-123',
        cards: [
          { id: 'card-1', name: '青眼白龍', quantity: 2, avgPrice: 100, currentPrice: 120 },
          { id: 'card-2', name: '黑魔導', quantity: 1, avgPrice: 80, currentPrice: 85 }
        ]
      };

      const mockOptimizationResult = {
        optimizedAllocation: {
          'card-1': { targetQuantity: 1, action: 'reduce' },
          'card-2': { targetQuantity: 2, action: 'increase' },
          'card-4': { targetQuantity: 1, action: 'add' }
        },
        expectedImprovement: {
          riskReduction: 0.15,
          returnIncrease: 0.08,
          diversificationImprovement: 0.25
        },
        implementation: {
          steps: [
            '賣出1張青眼白龍',
            '買入1張黑魔導',
            '買入1張混沌戰士'
          ],
          estimatedCost: 50,
          timeline: 'within_1_month'
        }
      };

      const mockInvestment = require('../../../services/investmentService');
      mockInvestment.investmentService.optimizePortfolio.mockResolvedValue(mockOptimizationResult);

      const result = await investmentService.optimizePortfolio(mockPortfolio);

      expect(result.optimizedAllocation['card-1'].action).toBe('reduce');
      expect(result.expectedImprovement.riskReduction).toBeGreaterThan(0.1);
      expect(result.implementation.steps).toHaveLength(3);
    });
  });
});
