/* global jest, describe, it, expect, beforeEach, afterEach */
import { simulatedGradingService } from '../../../services/simulatedGradingService';
import { apiService } from '../../../services/apiService';
import { logger } from '../../../utils/logger';

// Mock 依賴
jest.mock('../../../services/apiService');
jest.mock('../../../utils/logger');

const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('SimulatedGradingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeCondition', () => {
    const mockCardId = '123e4567-e89b-12d3-a456-426614174000';
    const mockImageData = 'base64_image_data';

    const mockGradingResult = {
      success: true,
      data: {
        cardId: mockCardId,
        grading: {
          overallGrade: 'Near Mint',
          overallScore: 85,
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
        processingTime: 3.2,
        metadata: {
          analysisMethod: 'AI 視覺分析',
          modelVersion: 'v2.1.0',
          imageQuality: '高質量',
          lightingConditions: '良好',
          gradingStandard: 'PSA',
        },
      },
    };

    it('應該正確評分卡片條件', async () => {
      mockApiService.post.mockResolvedValue(mockGradingResult);

      const result = await simulatedGradingService.analyzeCondition(
        mockCardId,
        mockImageData
      );

      expect(result.success).toBe(true);
      expect(result.data.grading.overallGrade).toBe('Near Mint');
      expect(result.data.grading.overallScore).toBeGreaterThan(80);
      expect(result.data.grading.confidence).toBeGreaterThan(0.8);
      expect(mockApiService.post).toHaveBeenCalledWith(expect.any(String), {
        cardId: mockCardId,
        imageData: mockImageData,
      });
    });

    it('應該處理無效的卡牌 ID', async () => {
      const invalidCardId = 'invalid-id';

      await expect(
        simulatedGradingService.analyzeCondition(invalidCardId, mockImageData)
      ).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('API 錯誤'));

      await expect(
        simulatedGradingService.analyzeCondition(mockCardId, mockImageData)
      ).rejects.toThrow('API 錯誤');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('generateGradingReport', () => {
    const mockCardId = '123e4567-e89b-12d3-a456-426614174000';

    it('應該生成鑑定報告', async () => {
      const mockReportResult = {
        success: true,
        data: {
          reportId: 'report-123',
          cardId: mockCardId,
          reportType: 'comprehensive',
          gradingDetails: {
            overallGrade: 'Near Mint',
            overallScore: 85,
            confidence: 0.92,
          },
          detailedAnalysis: {
            corners: { score: 88, grade: 'Near Mint' },
            edges: { score: 85, grade: 'Near Mint' },
            surface: { score: 90, grade: 'Near Mint' },
            centering: { score: 82, grade: 'Near Mint' },
            printQuality: { score: 87, grade: 'Near Mint' },
          },
          marketValue: {
            estimated: 950,
            range: { min: 900, max: 1000 },
            confidence: 0.88,
          },
          recommendations: ['建議保持現狀', '避免進一步磨損', '定期檢查條件'],
          preservationTips: ['使用專業保護套', '避免陽光直射', '保持乾燥環境'],
          reportDate: '2024-01-01T00:00:00Z',
          validUntil: '2024-12-31T23:59:59Z',
        },
      };

      mockApiService.post.mockResolvedValue(mockReportResult);

      const result =
        await simulatedGradingService.generateGradingReport(mockCardId);

      expect(result.success).toBe(true);
      expect(result.data.reportId).toBe('report-123');
      expect(result.data.gradingDetails.overallGrade).toBe('Near Mint');
      expect(result.data.marketValue.estimated).toBe(950);
    });
  });

  describe('predictGrade', () => {
    const mockCardId = '123e4567-e89b-12d3-a456-426614174000';

    it('應該預測鑑定等級', async () => {
      const mockPredictionResult = {
        success: true,
        data: {
          cardId: mockCardId,
          predictedGrade: 'Near Mint',
          confidence: 0.85,
          probabilityDistribution: {
            Mint: 0.05,
            'Near Mint': 0.75,
            Excellent: 0.15,
            Good: 0.03,
            'Light Played': 0.02,
          },
          factors: ['邊角輕微磨損', '表面清潔', '印刷清晰', '居中度良好'],
          recommendations: ['建議專業鑑定', '保持現有條件'],
        },
      };

      mockApiService.get.mockResolvedValue(mockPredictionResult);

      const result = await simulatedGradingService.predictGrade(mockCardId);

      expect(result.success).toBe(true);
      expect(result.data.predictedGrade).toBe('Near Mint');
      expect(result.data.confidence).toBeGreaterThan(0.8);
      expect(result.data.probabilityDistribution['Near Mint']).toBe(0.75);
    });
  });

  describe('assessMarketValue', () => {
    const mockCardId = '123e4567-e89b-12d3-a456-426614174000';
    const mockGrade = 'Near Mint';

    it('應該評估市場價值', async () => {
      const mockValueResult = {
        success: true,
        data: {
          cardId: mockCardId,
          grade: mockGrade,
          marketValue: {
            estimated: 950,
            range: {
              min: 900,
              max: 1000,
            },
            confidence: 0.88,
            factors: ['當前市場需求', '供應量', '歷史價格趨勢', '條件評分'],
          },
          priceHistory: [
            { date: '2024-01-01', price: 950 },
            { date: '2023-12-01', price: 920 },
            { date: '2023-11-01', price: 900 },
          ],
          marketTrend: 'stable',
          recommendations: ['建議持有', '關注市場動態', '考慮適時出售'],
        },
      };

      mockApiService.post.mockResolvedValue(mockValueResult);

      const result = await simulatedGradingService.assessMarketValue(
        mockCardId,
        mockGrade
      );

      expect(result.success).toBe(true);
      expect(result.data.marketValue.estimated).toBe(950);
      expect(result.data.marketValue.confidence).toBeGreaterThan(0.8);
      expect(result.data.marketTrend).toBe('stable');
    });
  });

  describe('getPreservationTips', () => {
    const mockCardId = '123e4567-e89b-12d3-a456-426614174000';

    it('應該獲取保存建議', async () => {
      const mockTipsResult = {
        success: true,
        data: {
          cardId: mockCardId,
          currentCondition: 'Near Mint',
          preservationTips: [
            '使用專業保護套',
            '避免陽光直射',
            '保持乾燥環境',
            '定期檢查條件',
            '避免頻繁觸摸',
          ],
          storageRecommendations: [
            '使用無酸保護套',
            '存放在乾燥環境',
            '避免高溫潮濕',
            '定期通風',
          ],
          handlingGuidelines: [
            '戴手套處理',
            '避免彎折',
            '輕拿輕放',
            '避免接觸化學品',
          ],
          restorationOptions: [
            '輕微清潔表面',
            '使用專業清潔劑',
            '避免使用化學清潔劑',
            '尋求專業修復',
          ],
        },
      };

      mockApiService.get.mockResolvedValue(mockTipsResult);

      const result =
        await simulatedGradingService.getPreservationTips(mockCardId);

      expect(result.success).toBe(true);
      expect(result.data.preservationTips).toHaveLength(5);
      expect(result.data.storageRecommendations).toHaveLength(4);
      expect(result.data.handlingGuidelines).toHaveLength(4);
    });
  });

  describe('compareWithGradingStandards', () => {
    const mockCardId = '123e4567-e89b-12d3-a456-426614174000';

    it('應該與鑑定標準比較', async () => {
      const mockComparisonResult = {
        success: true,
        data: {
          cardId: mockCardId,
          standards: {
            PSA: {
              grade: 'Near Mint',
              score: 85,
              confidence: 0.88,
              criteria: {
                corners: { score: 88, requirement: 'Excellent' },
                edges: { score: 85, requirement: 'Excellent' },
                surface: { score: 90, requirement: 'Excellent' },
                centering: { score: 82, requirement: 'Good' },
              },
            },
            BGS: {
              grade: 'Near Mint',
              score: 83,
              confidence: 0.85,
              criteria: {
                corners: { score: 88, requirement: 'Excellent' },
                edges: { score: 85, requirement: 'Excellent' },
                surface: { score: 90, requirement: 'Excellent' },
                centering: { score: 82, requirement: 'Good' },
              },
            },
            CGC: {
              grade: 'Near Mint',
              score: 84,
              confidence: 0.87,
              criteria: {
                corners: { score: 88, requirement: 'Excellent' },
                edges: { score: 85, requirement: 'Excellent' },
                surface: { score: 90, requirement: 'Excellent' },
                centering: { score: 82, requirement: 'Good' },
              },
            },
          },
          recommendations: [
            'PSA 鑑定可能獲得較高評分',
            'BGS 鑑定適合收藏',
            'CGC 鑑定性價比較高',
          ],
        },
      };

      mockApiService.get.mockResolvedValue(mockComparisonResult);

      const result =
        await simulatedGradingService.compareWithGradingStandards(mockCardId);

      expect(result.success).toBe(true);
      expect(result.data.standards.PSA.grade).toBe('Near Mint');
      expect(result.data.standards.BGS.grade).toBe('Near Mint');
      expect(result.data.standards.CGC.grade).toBe('Near Mint');
      expect(result.data.recommendations).toHaveLength(3);
    });
  });
});
