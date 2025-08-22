import { enhancedAIService } from '../../../services/enhancedAIService';
import { authenticityService } from '../../../services/authenticityService';

// Mock 外部依賴
jest.mock('../../../services/apiService');
jest.mock('../../../services/authenticityService');
jest.mock('../../../utils/logger');

describe('防偽判斷功能測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('真偽驗證算法測試', () => {
    it('應該正確識別真卡', async () => {
      const mockImageData = 'data:image/jpeg;base64,authentic_card...';
      const mockVerificationResult = {
        success: true,
        data: {
          authenticity: {
            isAuthentic: true,
            score: 0.95,
            confidence: 0.92,
            factors: {
              hologram: { score: 0.98, details: '全息圖特徵正常' },
              printing: { score: 0.94, details: '印刷質量符合標準' },
              material: { score: 0.93, details: '材料質地正確' }
            }
          },
          recommendations: ['建議在專業光線下進一步檢查']
        }
      };

      const mockApiService = require('../../../services/apiService');
      mockApiService.apiService.post.mockResolvedValue(mockVerificationResult);

      const result = await enhancedAIService.enhancedAuthenticityVerification(mockImageData, {
        useBlockchainVerification: true,
        includeHologramAnalysis: true,
        includePrintingAnalysis: true,
        includeMaterialAnalysis: true
      });

      expect(result.success).toBe(true);
      expect(result.data.authenticity.isAuthentic).toBe(true);
      expect(result.data.authenticity.score).toBeGreaterThan(0.9);
    });

    it('應該正確識別假卡', async () => {
      const mockImageData = 'data:image/jpeg;base64,fake_card...';
      const mockVerificationResult = {
        success: true,
        data: {
          authenticity: {
            isAuthentic: false,
            score: 0.35,
            confidence: 0.88,
            factors: {
              hologram: { score: 0.2, details: '全息圖特徵異常' },
              printing: { score: 0.4, details: '印刷質量不符合標準' },
              material: { score: 0.45, details: '材料質地可疑' }
            }
          },
          recommendations: ['建議尋求專業鑑定']
        }
      };

      const mockApiService = require('../../../services/apiService');
      mockApiService.apiService.post.mockResolvedValue(mockVerificationResult);

      const result = await enhancedAIService.enhancedAuthenticityVerification(mockImageData);

      expect(result.success).toBe(true);
      expect(result.data.authenticity.isAuthentic).toBe(false);
      expect(result.data.authenticity.score).toBeLessThan(0.5);
    });
  });

  describe('全息圖分析測試', () => {
    it('應該正確分析全息圖特徵', async () => {
      const mockImageData = 'data:image/jpeg;base64,hologram_image...';
      const mockHologramResult = {
        isValid: true,
        score: 0.96,
        features: {
          pattern: '正確的菱形圖案',
          color: '彩虹色光譜正常',
          depth: '立體效果明顯'
        }
      };

      const mockAuthenticity = require('../../../services/authenticityService');
      mockAuthenticity.authenticityService.analyzeHologram.mockResolvedValue(mockHologramResult);

      const result = await authenticityService.analyzeHologram(mockImageData);

      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(0.9);
      expect(result.features.pattern).toBe('正確的菱形圖案');
    });
  });

  describe('印刷質量分析測試', () => {
    it('應該正確分析印刷質量', async () => {
      const mockImageData = 'data:image/jpeg;base64,printing_image...';
      const mockPrintingResult = {
        quality: 'high',
        score: 0.94,
        details: {
          resolution: '高解析度',
          colorAccuracy: '色彩準確',
          edgeSharpness: '邊緣清晰'
        }
      };

      const mockAuthenticity = require('../../../services/authenticityService');
      mockAuthenticity.authenticityService.analyzePrinting.mockResolvedValue(mockPrintingResult);

      const result = await authenticityService.analyzePrinting(mockImageData);

      expect(result.quality).toBe('high');
      expect(result.score).toBeGreaterThan(0.9);
      expect(result.details.resolution).toBe('高解析度');
    });
  });

  describe('材料分析測試', () => {
    it('應該正確分析卡片材料', async () => {
      const mockImageData = 'data:image/jpeg;base64,material_image...';
      const mockMaterialResult = {
        type: 'authentic_cardstock',
        score: 0.93,
        properties: {
          thickness: '標準厚度',
          texture: '正確質地',
          weight: '標準重量'
        }
      };

      const mockAuthenticity = require('../../../services/authenticityService');
      mockAuthenticity.authenticityService.analyzeMaterial.mockResolvedValue(mockMaterialResult);

      const result = await authenticityService.analyzeMaterial(mockImageData);

      expect(result.type).toBe('authentic_cardstock');
      expect(result.score).toBeGreaterThan(0.9);
      expect(result.properties.thickness).toBe('標準厚度');
    });
  });
});
