import { antiCounterfeitService } from '../../../services/antiCounterfeitService';
import { apiService } from '../../../services/apiService';
import { logger } from '../../../utils/logger';

// Mock 依賴
jest.mock('../../../services/apiService');
jest.mock('../../../utils/logger');

const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('AntiCounterfeitService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyAuthenticity', () => {
    const mockCardId = '123e4567-e89b-12d3-a456-426614174000';
    const mockImageData = 'base64_image_data';

    const mockAuthenticResult = {
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
              details: ['全息圖清晰度正常', '反光效果符合標準']
            },
            printingAnalysis: {
              isAuthentic: true,
              confidence: 0.90,
              details: ['印刷精度符合標準', '顏色匹配度正常']
            },
            materialAnalysis: {
              isAuthentic: true,
              confidence: 0.88,
              details: ['紙質符合標準', '厚度正常']
            },
            blockchainVerification: {
              isVerified: true,
              confidence: 0.95,
              details: ['區塊鏈記錄驗證通過']
            }
          }
        },
        recommendations: ['建議持有', '定期檢查'],
        riskFactors: []
      }
    };

    const mockCounterfeitResult = {
      success: true,
      data: {
        cardId: mockCardId,
        authenticity: {
          score: 0.25,
          confidence: 0.85,
          riskLevel: 'high' as const,
          factors: ['全息圖異常', '印刷質量不符合標準', '材料分析異常'],
          details: {
            hologramAnalysis: {
              isAuthentic: false,
              confidence: 0.85,
              details: ['全息圖模糊', '反光效果異常']
            },
            printingAnalysis: {
              isAuthentic: false,
              confidence: 0.80,
              details: ['印刷精度不符合標準', '顏色偏差明顯']
            },
            materialAnalysis: {
              isAuthentic: false,
              confidence: 0.75,
              details: ['紙質不符合標準', '厚度異常']
            },
            blockchainVerification: {
              isVerified: false,
              confidence: 0.90,
              details: ['區塊鏈記錄驗證失敗']
            }
          }
        },
        recommendations: ['建議謹慎處理', '尋求專業鑑定'],
        riskFactors: ['高風險偽造品', '建議報警']
      }
    };

    it('應該成功驗證真品卡片', async () => {
      mockApiService.post.mockResolvedValue(mockAuthenticResult);

      const result = await antiCounterfeitService.verifyAuthenticity(mockCardId, mockImageData);

      expect(result.success).toBe(true);
      expect(result.data.authenticity.score).toBeGreaterThan(0.8);
      expect(result.data.authenticity.riskLevel).toBe('low');
      expect(mockApiService.post).toHaveBeenCalledWith(
        expect.any(String),
        { cardId: mockCardId, imageData: mockImageData }
      );
    });

    it('應該檢測到偽造卡片', async () => {
      mockApiService.post.mockResolvedValue(mockCounterfeitResult);

      const result = await antiCounterfeitService.verifyAuthenticity(mockCardId, mockImageData);

      expect(result.success).toBe(true);
      expect(result.data.authenticity.score).toBeLessThan(0.5);
      expect(result.data.authenticity.riskLevel).toBe('high');
      expect(result.data.riskFactors).toContain('高風險偽造品');
    });

    it('應該處理無效的卡牌 ID', async () => {
      const invalidCardId = 'invalid-id';

      await expect(antiCounterfeitService.verifyAuthenticity(invalidCardId, mockImageData)).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('API 錯誤'));

      await expect(antiCounterfeitService.verifyAuthenticity(mockCardId, mockImageData)).rejects.toThrow('API 錯誤');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('analyzeHologram', () => {
    const mockImageData = 'base64_image_data';

    it('應該分析全息圖特徵', async () => {
      const mockHologramResult = {
        success: true,
        data: {
          isAuthentic: true,
          confidence: 0.95,
          features: {
            clarity: 0.92,
            reflection: 0.88,
            pattern: 0.90
          },
          details: ['全息圖清晰度正常', '反光效果符合標準', '圖案完整性良好']
        }
      };

      mockApiService.post.mockResolvedValue(mockHologramResult);

      const result = await antiCounterfeitService.analyzeHologram(mockImageData);

      expect(result.success).toBe(true);
      expect(result.data.isAuthentic).toBe(true);
      expect(result.data.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('analyzePrinting', () => {
    const mockImageData = 'base64_image_data';

    it('應該分析印刷質量', async () => {
      const mockPrintingResult = {
        success: true,
        data: {
          isAuthentic: true,
          confidence: 0.90,
          quality: {
            precision: 0.88,
            colorAccuracy: 0.92,
            sharpness: 0.85
          },
          details: ['印刷精度符合標準', '顏色匹配度正常', '清晰度良好']
        }
      };

      mockApiService.post.mockResolvedValue(mockPrintingResult);

      const result = await antiCounterfeitService.analyzePrinting(mockImageData);

      expect(result.success).toBe(true);
      expect(result.data.isAuthentic).toBe(true);
      expect(result.data.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('analyzeMaterial', () => {
    const mockImageData = 'base64_image_data';

    it('應該分析材料特性', async () => {
      const mockMaterialResult = {
        success: true,
        data: {
          isAuthentic: true,
          confidence: 0.88,
          properties: {
            texture: 0.85,
            thickness: 0.90,
            color: 0.88
          },
          details: ['紙質符合標準', '厚度正常', '顏色符合標準']
        }
      };

      mockApiService.post.mockResolvedValue(mockMaterialResult);

      const result = await antiCounterfeitService.analyzeMaterial(mockImageData);

      expect(result.success).toBe(true);
      expect(result.data.isAuthentic).toBe(true);
      expect(result.data.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('verifyBlockchain', () => {
    const mockCardId = '123e4567-e89b-12d3-a456-426614174000';

    it('應該驗證區塊鏈記錄', async () => {
      const mockBlockchainResult = {
        success: true,
        data: {
          isVerified: true,
          confidence: 0.95,
          transactionHash: '0x1234567890abcdef',
          blockNumber: 12345678,
          timestamp: '2024-01-01T00:00:00Z',
          details: ['區塊鏈記錄驗證通過', '交易記錄完整']
        }
      };

      mockApiService.post.mockResolvedValue(mockBlockchainResult);

      const result = await antiCounterfeitService.verifyBlockchain(mockCardId);

      expect(result.success).toBe(true);
      expect(result.data.isVerified).toBe(true);
      expect(result.data.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('getRiskAssessment', () => {
    const mockCardId = '123e4567-e89b-12d3-a456-426614174000';

    it('應該評估風險等級', async () => {
      const mockRiskResult = {
        success: true,
        data: {
          riskLevel: 'low' as const,
          riskScore: 0.15,
          factors: ['全息圖驗證通過', '印刷質量良好'],
          recommendations: ['建議持有', '定期檢查'],
          confidence: 0.92
        }
      };

      mockApiService.get.mockResolvedValue(mockRiskResult);

      const result = await antiCounterfeitService.getRiskAssessment(mockCardId);

      expect(result.success).toBe(true);
      expect(result.data.riskLevel).toBe('low');
      expect(result.data.riskScore).toBeLessThan(0.3);
    });
  });
});
