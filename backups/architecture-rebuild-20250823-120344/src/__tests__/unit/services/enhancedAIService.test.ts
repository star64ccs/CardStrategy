/* global jest, describe, it, expect, beforeEach, afterEach */
import { enhancedAIService } from '../../../services/enhancedAIService';
import { apiService } from '../../../services/apiService';
import { logger } from '../../../utils/logger';

// Mock 依賴
jest.mock('../../../services/apiService');
jest.mock('../../../utils/logger');

const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('EnhancedAIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('enhancedRecognizeCard', () => {
    const mockImageData = 'base64_image_data';

    const mockRecognitionResult = {
      success: true,
      data: {
        recognizedCard: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: '皮卡丘',
          series: '基礎系列',
          set: '基礎系列',
          number: '025/102',
          rarity: '稀有',
          type: '電',
          hp: 60,
          attacks: [
            {
              name: '電擊',
              damage: '20',
              text: '對對手造成20點傷害',
            },
          ],
          weaknesses: ['格鬥'],
          resistances: [],
          retreatCost: 1,
        },
        confidence: 0.95,
        alternatives: [
          {
            id: 'alternative-1',
            name: '皮卡丘 V',
            confidence: 0.85,
          },
        ],
        features: {
          colors: ['黃色', '紅色'],
          patterns: ['電氣', '臉部特徵'],
          text: ['皮卡丘', '電擊', '20'],
        },
        processingTime: 1.2,
        modelVersion: 'v2.1.0',
      },
    };

    it('應該成功識別卡片', async () => {
      mockApiService.post.mockResolvedValue(mockRecognitionResult);

      const result =
        await enhancedAIService.enhancedRecognizeCard(mockImageData);

      expect(result.success).toBe(true);
      expect(result.data.recognizedCard.name).toBe('皮卡丘');
      expect(result.data.confidence).toBeGreaterThan(0.9);
      expect(result.data.alternatives).toHaveLength(1);
      expect(mockApiService.post).toHaveBeenCalledWith(expect.any(String), {
        imageData: mockImageData,
      });
    });

    it('應該處理識別失敗', async () => {
      const mockFailedResult = {
        success: false,
        data: {
          recognizedCard: null,
          confidence: 0.0,
          alternatives: [],
          error: '無法識別卡片',
        },
      };

      mockApiService.post.mockResolvedValue(mockFailedResult);

      const result =
        await enhancedAIService.enhancedRecognizeCard(mockImageData);

      expect(result.success).toBe(false);
      expect(result.data.recognizedCard).toBeNull();
      expect(result.data.confidence).toBe(0.0);
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('API 錯誤'));

      await expect(
        enhancedAIService.enhancedRecognizeCard(mockImageData)
      ).rejects.toThrow('API 錯誤');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('enhancedAnalyzeCondition', () => {
    const mockCardId = '123e4567-e89b-12d3-a456-426614174000';
    const mockImageData = 'base64_image_data';

    const mockConditionResult = {
      success: true,
      data: {
        cardId: mockCardId,
        analysis: {
          overallScore: 85,
          overallGrade: 'Near Mint',
          confidence: 0.92,
          factors: {
            corners: {
              score: 88,
              grade: 'Near Mint',
              details: ['邊角輕微磨損', '無明顯損傷'],
              images: ['corner1.jpg', 'corner2.jpg'],
            },
            edges: {
              score: 85,
              grade: 'Near Mint',
              details: ['邊緣輕微磨損', '無明顯白邊'],
              images: ['edge1.jpg', 'edge2.jpg'],
            },
            surface: {
              score: 90,
              grade: 'Near Mint',
              details: ['表面清潔', '無明顯刮痕'],
              images: ['surface1.jpg', 'surface2.jpg'],
            },
            centering: {
              score: 82,
              grade: 'Near Mint',
              details: ['居中度良好', '輕微偏移'],
              images: ['centering1.jpg', 'centering2.jpg'],
            },
            printQuality: {
              score: 87,
              grade: 'Near Mint',
              details: ['印刷清晰', '顏色飽滿'],
              images: ['print1.jpg', 'print2.jpg'],
            },
          },
          damageAssessment: {
            scratches: 2,
            dents: 0,
            creases: 0,
            stains: 0,
            fading: 0,
            totalDamage: 2,
          },
          marketImpact: {
            valueMultiplier: 0.95,
            estimatedValue: 950,
            valueRange: {
              min: 900,
              max: 1000,
            },
            recommendations: ['建議保持現狀', '避免進一步磨損'],
          },
          preservationTips: ['使用專業保護套', '避免陽光直射', '保持乾燥環境'],
          restorationSuggestions: [
            '輕微清潔表面',
            '使用專業清潔劑',
            '避免使用化學清潔劑',
          ],
        },
        processingTime: 2.5,
        metadata: {
          analysisMethod: 'AI 視覺分析',
          modelVersion: 'v2.1.0',
          imageQuality: '高質量',
          lightingConditions: '良好',
          useAdvancedMetrics: true,
          includeUVInspection: true,
          includeMicroscopicAnalysis: true,
        },
      },
    };

    it('應該成功分析卡片條件', async () => {
      mockApiService.post.mockResolvedValue(mockConditionResult);

      const result = await enhancedAIService.enhancedAnalyzeCondition(
        mockCardId,
        mockImageData
      );

      expect(result.success).toBe(true);
      expect(result.data.analysis.overallScore).toBe(85);
      expect(result.data.analysis.overallGrade).toBe('Near Mint');
      expect(result.data.analysis.confidence).toBeGreaterThan(0.9);
      expect(mockApiService.post).toHaveBeenCalledWith(expect.any(String), {
        cardId: mockCardId,
        imageData: mockImageData,
      });
    });
  });

  describe('enhancedVerifyAuthenticity', () => {
    const mockCardId = '123e4567-e89b-12d3-a456-426614174000';
    const mockImageData = 'base64_image_data';

    const mockAuthenticityResult = {
      success: true,
      data: {
        cardId: mockCardId,
        authenticity: {
          score: 0.95,
          confidence: 0.92,
          riskLevel: 'low' as const,
          factors: ['全息圖驗證通過', '印刷質量符合標準', '材料分析正常'],
          details: {
            hologramAnalysis: {
              isAuthentic: true,
              confidence: 0.95,
              details: ['全息圖清晰度正常', '反光效果符合標準'],
            },
            printingAnalysis: {
              isAuthentic: true,
              confidence: 0.9,
              details: ['印刷精度符合標準', '顏色匹配度正常'],
            },
            materialAnalysis: {
              isAuthentic: true,
              confidence: 0.88,
              details: ['紙質符合標準', '厚度正常'],
            },
            blockchainVerification: {
              isVerified: true,
              confidence: 0.95,
              details: ['區塊鏈記錄驗證通過'],
            },
          },
        },
        condition: {
          grade: 'Near Mint',
          score: 85,
          details: ['條件良好', '適合收藏'],
          recommendations: ['建議持有', '定期檢查'],
        },
        marketValue: {
          estimated: 950,
          range: {
            min: 900,
            max: 1000,
          },
          factors: ['真品保證', '條件良好', '市場需求'],
          confidence: 0.88,
        },
        aiInsights: {
          recommendations: ['建議持有', '關注市場動態'],
          warnings: [],
          opportunities: ['可能升值'],
          riskFactors: [],
        },
      },
    };

    it('應該成功驗證真偽', async () => {
      mockApiService.post.mockResolvedValue(mockAuthenticityResult);

      const result = await enhancedAIService.enhancedVerifyAuthenticity(
        mockCardId,
        mockImageData
      );

      expect(result.success).toBe(true);
      expect(result.data.authenticity.score).toBeGreaterThan(0.9);
      expect(result.data.authenticity.riskLevel).toBe('low');
      expect(result.data.condition.grade).toBe('Near Mint');
      expect(mockApiService.post).toHaveBeenCalledWith(expect.any(String), {
        cardId: mockCardId,
        imageData: mockImageData,
      });
    });
  });

  describe('enhancedPricePrediction', () => {
    const mockCardId = '123e4567-e89b-12d3-a456-426614174000';

    const mockPredictionResult = {
      success: true,
      data: {
        cardId: mockCardId,
        predictions: [
          {
            timeframe: '7d' as const,
            predictedPrice: 150.5,
            confidence: 0.85,
            factors: ['市場需求增加', '供應減少'],
            riskAssessment: '中等風險',
            trend: 'up' as const,
          },
          {
            timeframe: '30d' as const,
            predictedPrice: 165.0,
            confidence: 0.78,
            factors: ['季節性需求', '新產品發布'],
            riskAssessment: '低風險',
            trend: 'up' as const,
          },
          {
            timeframe: '90d' as const,
            predictedPrice: 180.0,
            confidence: 0.72,
            factors: ['長期市場趨勢', '收藏價值提升'],
            riskAssessment: '低風險',
            trend: 'up' as const,
          },
        ],
        marketSentiment: {
          overall: 'positive',
          score: 0.75,
          factors: ['市場樂觀', '需求穩定', '供應有限'],
        },
        competitiveAnalysis: {
          similarCards: [
            {
              id: 'similar-1',
              name: '類似卡片1',
              currentPrice: 140,
              trend: 'up',
            },
          ],
          marketPosition: 'competitive',
        },
        seasonalFactors: {
          currentSeason: 'spring',
          impact: 'positive',
          factors: ['春季收藏熱潮', '新系列發布'],
        },
        eventImpact: {
          upcomingEvents: [
            {
              name: '遊戲展覽',
              date: '2024-03-15',
              expectedImpact: 'positive',
            },
          ],
          overallImpact: 'positive',
        },
      },
    };

    it('應該成功預測價格', async () => {
      mockApiService.post.mockResolvedValue(mockPredictionResult);

      const result = await enhancedAIService.enhancedPricePrediction(
        mockCardId,
        ['7d', '30d', '90d']
      );

      expect(result.success).toBe(true);
      expect(result.data.predictions).toHaveLength(3);
      expect(result.data.predictions[0].timeframe).toBe('7d');
      expect(result.data.predictions[0].predictedPrice).toBe(150.5);
      expect(result.data.marketSentiment.overall).toBe('positive');
      expect(mockApiService.post).toHaveBeenCalledWith(expect.any(String), {
        cardId: mockCardId,
        timeframes: ['7d', '30d', '90d'],
      });
    });
  });

  describe('comprehensiveAnalysis', () => {
    const mockImageData = 'base64_image_data';

    it('應該執行綜合分析', async () => {
      // Mock 各個分析步驟的結果
      const mockRecognitionResult = {
        success: true,
        data: {
          recognizedCard: { id: 'card-123', name: '皮卡丘' },
          confidence: 0.95,
        },
      };

      const mockConditionResult = {
        success: true,
        data: {
          analysis: { overallScore: 85, overallGrade: 'Near Mint' },
        },
      };

      const mockAuthenticityResult = {
        success: true,
        data: {
          authenticity: { score: 0.95, riskLevel: 'low' },
        },
      };

      const mockPredictionResult = {
        success: true,
        data: {
          predictions: [{ timeframe: '7d', predictedPrice: 150.5 }],
        },
      };

      // Mock API 調用
      mockApiService.post
        .mockResolvedValueOnce(mockRecognitionResult)
        .mockResolvedValueOnce(mockConditionResult)
        .mockResolvedValueOnce(mockAuthenticityResult)
        .mockResolvedValueOnce(mockPredictionResult);

      const result =
        await enhancedAIService.comprehensiveAnalysis(mockImageData);

      expect(result.recognition.success).toBe(true);
      expect(result.conditionAnalysis.success).toBe(true);
      expect(result.authenticityVerification.success).toBe(true);
      expect(result.pricePrediction.success).toBe(true);
      expect(result.recognition.data.recognizedCard.name).toBe('皮卡丘');
      expect(result.conditionAnalysis.data.analysis.overallGrade).toBe(
        'Near Mint'
      );
      expect(result.authenticityVerification.data.authenticity.riskLevel).toBe(
        'low'
      );
      expect(result.pricePrediction.data.predictions[0].predictedPrice).toBe(
        150.5
      );
    });

    it('應該處理識別失敗的情況', async () => {
      const mockFailedRecognition = {
        success: false,
        data: { recognizedCard: null },
      };

      mockApiService.post.mockResolvedValue(mockFailedRecognition);

      await expect(
        enhancedAIService.comprehensiveAnalysis(mockImageData)
      ).rejects.toThrow('卡片識別失敗，無法進行後續分析');
    });
  });

  describe('getConfig', () => {
    it('應該返回當前配置', () => {
      const config = enhancedAIService.getConfig();

      expect(config).toBeDefined();
      expect(config.recognition).toBeDefined();
      expect(config.conditionAnalysis).toBeDefined();
      expect(config.authenticityVerification).toBeDefined();
      expect(config.pricePrediction).toBeDefined();
      expect(config.recognition.confidenceThreshold).toBe(0.85);
      expect(config.conditionAnalysis.confidenceThreshold).toBe(0.9);
      expect(config.authenticityVerification.useBlockchainVerification).toBe(
        true
      );
      expect(config.pricePrediction.useEnsembleModels).toBe(true);
    });
  });

  describe('updateConfig', () => {
    it('應該更新配置', () => {
      const newConfig = {
        recognition: {
          confidenceThreshold: 0.9,
        },
        conditionAnalysis: {
          confidenceThreshold: 0.95,
        },
      };

      enhancedAIService.updateConfig(newConfig);

      const updatedConfig = enhancedAIService.getConfig();
      expect(updatedConfig.recognition.confidenceThreshold).toBe(0.9);
      expect(updatedConfig.conditionAnalysis.confidenceThreshold).toBe(0.95);
      expect(
        updatedConfig.authenticityVerification.useBlockchainVerification
      ).toBe(true); // 保持原值
    });
  });
});
