import { enhancedAIService } from '../../../services/enhancedAIService';
import { predictionService } from '../../../services/predictionService';

// Mock 外部依賴
jest.mock('../../../services/apiService');
jest.mock('../../../services/predictionService');
jest.mock('../../../utils/logger');

describe('AI預測價格功能測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('機器學習模型測試', () => {
    it('應該正確使用集成模型進行預測', async () => {
      const mockCardId = 'card-123';
      const mockTimeframes = ['7d', '30d', '90d'] as const;
      const mockPredictionResult = {
        success: true,
        data: {
          predictions: [
            {
              timeframe: '7d',
              predictedPrice: 150.50,
              confidence: 0.85,
              change: '+5.2%',
              factors: ['市場需求上升', '供應減少']
            },
            {
              timeframe: '30d',
              predictedPrice: 165.75,
              confidence: 0.78,
              change: '+12.8%',
              factors: ['季節性需求', '競賽影響']
            },
            {
              timeframe: '90d',
              predictedPrice: 180.25,
              confidence: 0.72,
              change: '+22.5%',
              factors: ['長期趨勢', '收藏價值提升']
            }
          ],
          modelPerformance: {
            accuracy: 0.82,
            mse: 12.5,
            mae: 8.3
          }
        }
      };

      const mockApiService = require('../../../services/apiService');
      mockApiService.apiService.post.mockResolvedValue(mockPredictionResult);

      const result = await enhancedAIService.enhancedPricePrediction(mockCardId, mockTimeframes, {
        useEnsembleModels: true,
        includeMarketSentiment: true,
        includeCompetitiveAnalysis: true,
        includeSeasonalFactors: true,
        includeEventImpact: true
      });

      expect(result.success).toBe(true);
      expect(result.data.predictions).toHaveLength(3);
      expect(result.data.predictions[0].confidence).toBeGreaterThan(0.8);
      expect(result.data.modelPerformance.accuracy).toBeGreaterThan(0.8);
    });

    it('應該處理預測失敗的情況', async () => {
      const mockCardId = 'card-456';
      const mockTimeframes = ['7d'] as const;
      const mockPredictionResult = {
        success: false,
        message: '數據不足，無法進行預測'
      };

      const mockApiService = require('../../../services/apiService');
      mockApiService.apiService.post.mockResolvedValue(mockPredictionResult);

      const result = await enhancedAIService.enhancedPricePrediction(mockCardId, mockTimeframes);

      expect(result.success).toBe(false);
      expect(result.message).toContain('數據不足');
    });
  });

  describe('預測準確性測試', () => {
    it('應該評估預測模型的準確性', async () => {
      const mockHistoricalData = [
        { date: '2024-01-01', price: 100 },
        { date: '2024-01-08', price: 105 },
        { date: '2024-01-15', price: 110 },
        { date: '2024-01-22', price: 108 }
      ];

      const mockAccuracyResult = {
        overallAccuracy: 0.85,
        accuracyByModel: {
          linear: 0.82,
          polynomial: 0.87,
          exponential: 0.84,
          arima: 0.86,
          lstm: 0.88,
          ensemble: 0.90
        },
        metrics: {
          mse: 15.2,
          mae: 9.8,
          rmse: 3.9
        }
      };

      const mockPrediction = require('../../../services/predictionService');
      mockPrediction.predictionService.evaluateAccuracy.mockResolvedValue(mockAccuracyResult);

      const result = await predictionService.evaluateAccuracy(mockHistoricalData);

      expect(result.overallAccuracy).toBeGreaterThan(0.8);
      expect(result.accuracyByModel.ensemble).toBeGreaterThan(0.85);
      expect(result.metrics.mse).toBeLessThan(20);
    });
  });

  describe('模型性能評估測試', () => {
    it('應該評估不同模型的性能', async () => {
      const mockModelPerformance = {
        models: [
          {
            name: 'linear',
            accuracy: 0.82,
            speed: 'fast',
            resourceUsage: 'low'
          },
          {
            name: 'lstm',
            accuracy: 0.88,
            speed: 'slow',
            resourceUsage: 'high'
          },
          {
            name: 'ensemble',
            accuracy: 0.90,
            speed: 'medium',
            resourceUsage: 'medium'
          }
        ],
        recommendations: ['建議使用集成模型以獲得最佳準確性']
      };

      const mockPrediction = require('../../../services/predictionService');
      mockPrediction.predictionService.evaluateModelPerformance.mockResolvedValue(mockModelPerformance);

      const result = await predictionService.evaluateModelPerformance();

      expect(result.models).toHaveLength(3);
      expect(result.models[2].accuracy).toBeGreaterThan(0.85);
      expect(result.recommendations).toContain('集成模型');
    });
  });

  describe('市場情緒分析測試', () => {
    it('應該正確分析市場情緒對價格的影響', async () => {
      const mockSentimentData = {
        overallSentiment: 'positive',
        score: 0.75,
        factors: {
          socialMedia: { sentiment: 'positive', score: 0.8 },
          news: { sentiment: 'neutral', score: 0.5 },
          marketActivity: { sentiment: 'positive', score: 0.7 }
        },
        impact: {
          priceDirection: 'upward',
          confidence: 0.72,
          magnitude: 'moderate'
        }
      };

      const mockPrediction = require('../../../services/predictionService');
      mockPrediction.predictionService.analyzeMarketSentiment.mockResolvedValue(mockSentimentData);

      const result = await predictionService.analyzeMarketSentiment('card-123');

      expect(result.overallSentiment).toBe('positive');
      expect(result.score).toBeGreaterThan(0.7);
      expect(result.impact.priceDirection).toBe('upward');
    });
  });

  describe('競爭分析測試', () => {
    it('應該正確分析競爭對價格的影響', async () => {
      const mockCompetitiveData = {
        competitivePosition: 'strong',
        score: 0.85,
        analysis: {
          marketShare: 'high',
          priceCompetitiveness: 'competitive',
          demandVsSupply: 'demand_high'
        },
        recommendations: ['保持當前定價策略', '關注競爭對手動態']
      };

      const mockPrediction = require('../../../services/predictionService');
      mockPrediction.predictionService.analyzeCompetition.mockResolvedValue(mockCompetitiveData);

      const result = await predictionService.analyzeCompetition('card-123');

      expect(result.competitivePosition).toBe('strong');
      expect(result.score).toBeGreaterThan(0.8);
      expect(result.recommendations).toHaveLength(2);
    });
  });

  describe('季節性因素分析測試', () => {
    it('應該正確分析季節性對價格的影響', async () => {
      const mockSeasonalData = {
        seasonalPattern: 'summer_peak',
        score: 0.78,
        factors: {
          currentSeason: 'summer',
          seasonalImpact: 'positive',
          historicalTrend: 'consistent'
        },
        predictions: {
          nextSeason: 'autumn',
          expectedChange: 'slight_decrease',
          confidence: 0.75
        }
      };

      const mockPrediction = require('../../../services/predictionService');
      mockPrediction.predictionService.analyzeSeasonalFactors.mockResolvedValue(mockSeasonalData);

      const result = await predictionService.analyzeSeasonalFactors('card-123');

      expect(result.seasonalPattern).toBe('summer_peak');
      expect(result.score).toBeGreaterThan(0.7);
      expect(result.predictions.expectedChange).toBe('slight_decrease');
    });
  });
});
