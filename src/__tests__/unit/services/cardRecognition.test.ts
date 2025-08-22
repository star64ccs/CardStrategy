import { enhancedAIService } from '../../../services/enhancedAIService';
import { cardService } from '../../../services/cardService';
import { imageProcessingService } from '../../../services/imageProcessingService';

// Mock 外部依賴
jest.mock('../../../services/apiService');
jest.mock('../../../services/imageProcessingService');
jest.mock('../../../utils/logger');

describe('卡牌識別功能測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('圖像識別算法測試', () => {
    it('應該正確識別卡片圖像', async () => {
      const mockImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';
      const mockRecognitionResult = {
        success: true,
        data: {
          recognizedCard: {
            id: 'card-123',
            name: '青眼白龍',
            series: '遊戲王',
            rarity: 'UR',
            confidence: 0.95
          },
          confidence: 0.95,
          alternatives: []
        }
      };

      // Mock API 響應
      const mockApiService = require('../../../services/apiService');
      mockApiService.apiService.post.mockResolvedValue(mockRecognitionResult);

      const result = await enhancedAIService.enhancedRecognizeCard(mockImageData, {
        confidenceThreshold: 0.9,
        useMultiModel: true,
        imagePreprocessing: true
      });

      expect(result.success).toBe(true);
      expect(result.data.recognizedCard.name).toBe('青眼白龍');
      expect(result.data.confidence).toBeGreaterThan(0.9);
    });

    it('應該處理低質量圖像', async () => {
      const mockImageData = 'data:image/jpeg;base64,low_quality_image...';
      const mockRecognitionResult = {
        success: false,
        message: '圖像質量過低，無法識別'
      };

      const mockApiService = require('../../../services/apiService');
      mockApiService.apiService.post.mockResolvedValue(mockRecognitionResult);

      const result = await enhancedAIService.enhancedRecognizeCard(mockImageData);

      expect(result.success).toBe(false);
      expect(result.message).toContain('圖像質量過低');
    });
  });

  describe('OCR 文字提取測試', () => {
    it('應該正確提取卡片文字信息', async () => {
      const mockImageData = 'data:image/jpeg;base64,text_image...';
      const mockOcrResult = {
        text: '青眼白龍\n攻擊力: 3000\n防禦力: 2500',
        confidence: 0.88,
        boundingBoxes: [
          { text: '青眼白龍', confidence: 0.95 },
          { text: '攻擊力: 3000', confidence: 0.88 },
          { text: '防禦力: 2500', confidence: 0.85 }
        ]
      };

      const mockImageProcessing = require('../../../services/imageProcessingService');
      mockImageProcessing.imageProcessingService.extractText.mockResolvedValue(mockOcrResult);

      const result = await imageProcessingService.extractText(mockImageData);

      expect(result.text).toContain('青眼白龍');
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.boundingBoxes).toHaveLength(3);
    });
  });

  describe('卡片信息解析測試', () => {
    it('應該正確解析卡片基本信息', async () => {
      const mockCardData = {
        id: 'card-123',
        name: '青眼白龍',
        series: '遊戲王',
        rarity: 'UR',
        attack: 3000,
        defense: 2500,
        type: '龍族/效果',
        attribute: '光'
      };

      const result = await cardService.parseCardInfo(mockCardData);

      expect(result.name).toBe('青眼白龍');
      expect(result.attack).toBe(3000);
      expect(result.defense).toBe(2500);
      expect(result.type).toBe('龍族/效果');
    });
  });
});
