import * as Linking from 'expo-linking';
import * as Sharing from 'expo-sharing';

import { API_ENDPOINTS } from '../../../config/api';
import { apiService } from '../../../services/apiService';
import { shareVerificationService } from '../../../services/shareVerificationService';
import { logger } from '../../../utils/logger';
import {
  validateInput,
  validateApiResponse,
} from '../../../utils/validationService';

// Mock 依賴
jest.mock('../../../services/apiService');
jest.mock('../../../config/api');
jest.mock('../../../utils/logger');
jest.mock('../../../utils/validationService');
jest.mock('expo-linking');
jest.mock('expo-sharing');

const _mockApiService = apiService as jest.Mocked<typeof apiService>;
const _mockApiEndpoints = API_ENDPOINTS as jest.Mocked<typeof API_ENDPOINTS>;
const _mockLogger = logger as jest.Mocked<typeof logger>;
const _mockValidateInput = validateInput as jest.MockedFunction<
  typeof validateInput
>;
const _mockValidateApiResponse = validateApiResponse as jest.MockedFunction<
  typeof validateApiResponse
>;
const _mockLinking = Linking as jest.Mocked<typeof Linking>;
const _mockSharing = Sharing as jest.Mocked<typeof Sharing>;

describe('ShareVerificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // SettingsDefault的 API 端點
    mockApiEndpoints.SHARE_VERIFICATION = {
      CREATE: '/share-verification/create',
      LOOKUP: '/share-verification/lookup',
    };
  });

  describe('createShareVerification', () => {
    it('應該SuccessCreate分享Verify', async () => {
      const _request = {
        cardId: '123e4567-e89b-12d3-a456-426614174000',
        analysisType: 'comprehensive' as const,
        analysisResult: {
          centering: {
            score: 85,
            grade: 'A',
            details: ['邊框對稱性良好'],
            confidence: 0.9,
          },
          authenticity: {
            isAuthentic: true,
            confidence: 0.95,
            riskFactors: [],
            verificationDetails: ['印刷質量符合標準'],
          },
          overallGrade: 'A',
          overallScore: 90,
          processingTime: 2.5,
          metadata: {
            analysisMethod: 'AI',
            modelVersion: '1.0.0',
            imageQuality: 'high',
            lightingConditions: 'good',
          },
        },
        expiresInDays: 30,
      };

      const _mockResponse = {
        data: {
          verificationCode: 'ABC123DEF456',
          shareUrl: 'https://cardstrategy.com/share/ABC123DEF456',
          qrCodeUrl:
            'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://cardstrategy.com/share/ABC123DEF456&format=png',
          socialShareLinks: {
            whatsapp:
              'https://wa.me/?text=查看我的卡牌評估結果！%0A%0Ahttps://cardstrategy.com/share/ABC123DEF456',
            instagram: 'https://instagram.com/share/ABC123DEF456',
            facebook: 'https://facebook.com/share/ABC123DEF456',
            twitter: 'https://twitter.com/share/ABC123DEF456',
            telegram:
              'https://t.me/share/url?url=https://cardstrategy.com/share/ABC123DEF456&text=查看我的卡牌評估結果！',
          },
        },
      };

      mockValidateInput.mockReturnValue({
        isValid: true,
        data: request,
      });

      mockValidateApiResponse.mockReturnValue({
        isValid: true,
        data: mockResponse.data,
      });

      mockApiService.post.mockResolvedValue(mockResponse);

      const _result =
        await shareVerificationService.createShareVerification(request);

      expect(result.data).toEqual(mockResponse.data);
      expect(mockValidateInput).toHaveBeenCalled();
      expect(mockApiService.post).toHaveBeenCalledWith(
        '/share-verification/create',
        request
      );
      expect(mockValidateApiResponse).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        '✅ Share verification created',
        {
          verificationCode: 'ABC123DEF456',
        }
      );
    });

    it('應該處理無效的請求數據', async () => {
      const _invalidRequest = {
        cardId: 'invalid-uuid',
        analysisType: 'comprehensive' as const,
        analysisResult: {
          processingTime: 2.5,
          metadata: {
            analysisMethod: 'AI',
            modelVersion: '1.0.0',
            imageQuality: 'high',
            lightingConditions: 'good',
          },
        },
      };

      mockValidateInput.mockReturnValue({
        isValid: false,
        errorMessage: '無效的卡牌 ID',
      });

      await expect(
        shareVerificationService.createShareVerification(invalidRequest)
      ).rejects.toThrow('無效的卡牌 ID');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '❌ Create share verification error:',
        { error: '無效的卡牌 ID' }
      );
    });

    it('應該Handle API 響應VerifyFailed', async () => {
      const _request = {
        cardId: '123e4567-e89b-12d3-a456-426614174000',
        analysisType: 'comprehensive' as const,
        analysisResult: {
          processingTime: 2.5,
          metadata: {
            analysisMethod: 'AI',
            modelVersion: '1.0.0',
            imageQuality: 'high',
            lightingConditions: 'good',
          },
        },
      };

      const _mockResponse = {
        data: {
          verificationCode: 'ABC123DEF456',
          // 缺少必要的Field
        },
      };

      mockValidateInput.mockReturnValue({
        isValid: true,
        data: request,
      });

      mockValidateApiResponse.mockReturnValue({
        isValid: false,
        errorMessage: '分享Verify響應VerifyFailed',
      });

      mockApiService.post.mockResolvedValue(mockResponse);

      await expect(
        shareVerificationService.createShareVerification(request)
      ).rejects.toThrow('分享Verify響應VerifyFailed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '❌ Create share verification error:',
        { error: '分享Verify響應VerifyFailed' }
      );
    });
  });

  describe('lookupVerification', () => {
    it('應該Success查詢分享Verify', async () => {
      const _verificationCode = 'ABC123DEF456';
      const _mockResponse = {
        data: {
          verification: {
            id: 'verification-1',
            verificationCode: 'ABC123DEF456',
            userId: 'user-1',
            cardId: 'card-1',
            analysisType: 'comprehensive',
            analysisResult: {
              centering: {
                score: 85,
                grade: 'A',
                details: ['邊框對稱性良好'],
                confidence: 0.9,
              },
              authenticity: {
                isAuthentic: true,
                confidence: 0.95,
                riskFactors: [],
                verificationDetails: ['印刷質量符合標準'],
              },
              overallGrade: 'A',
              overallScore: 90,
              processingTime: 2.5,
              metadata: {
                analysisMethod: 'AI',
                modelVersion: '1.0.0',
                imageQuality: 'high',
                lightingConditions: 'good',
              },
            },
            shareUrl: 'https://cardstrategy.com/share/ABC123DEF456',
            expiresAt: '2024-12-31T23:59:59Z',
            isActive: true,
            viewCount: 5,
            lastViewedAt: '2024-01-15T10:30:00Z',
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
          },
          card: {
            id: 'card-1',
            name: '皮卡丘',
            setName: '基礎系列',
            rarity: '稀有',
            imageUrl: 'https://example.com/pikachu.jpg',
            price: 1000,
          },
          user: {
            username: 'cardcollector',
            avatar: 'https://example.com/avatar.jpg',
          },
          isExpired: false,
          isValid: true,
        },
      };

      mockValidateInput.mockReturnValue({
        isValid: true,
        data: { verificationCode },
      });

      mockValidateApiResponse.mockReturnValue({
        isValid: true,
        data: mockResponse.data,
      });

      mockApiService.get.mockResolvedValue(mockResponse);

      const _result =
        await shareVerificationService.lookupVerification(verificationCode);

      expect(result.data).toEqual(mockResponse.data);
      expect(mockValidateInput).toHaveBeenCalled();
      expect(mockApiService.get).toHaveBeenCalledWith(
        '/share-verification/lookup/ABC123DEF456'
      );
      expect(mockValidateApiResponse).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        '✅ Share verification lookup successful',
        { verificationCode }
      );
    });

    it('應該處理無效的驗證碼', async () => {
      const _invalidCode = '123';

      mockValidateInput.mockReturnValue({
        isValid: false,
        errorMessage: '驗證碼格式無效',
      });

      await expect(
        shareVerificationService.lookupVerification(invalidCode)
      ).rejects.toThrow('驗證碼格式無效');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '❌ Lookup verification error:',
        { error: '驗證碼格式無效' }
      );
    });
  });

  describe('shareToWhatsApp', () => {
    it('應該Success分享到 WhatsApp', async () => {
      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';
      const _message = '自定義消息';

      mockLinking.canOpenURL.mockResolvedValue(true);
      mockLinking.openURL.mockResolvedValue();

      await shareVerificationService.shareToWhatsApp(shareUrl, message);

      expect(mockLinking.canOpenURL).toHaveBeenCalledWith(
        'whatsapp://send?text=CustomMessage%0A%0Ahttps://cardstrategy.com/share/ABC123DEF456'
      );
      expect(mockLinking.openURL).toHaveBeenCalledWith(
        'whatsapp://send?text=CustomMessage%0A%0Ahttps://cardstrategy.com/share/ABC123DEF456'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('✅ Shared to WhatsApp');
    });

    it('應該使用默認消息', async () => {
      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';

      mockLinking.canOpenURL.mockResolvedValue(true);
      mockLinking.openURL.mockResolvedValue();

      await shareVerificationService.shareToWhatsApp(shareUrl);

      expect(mockLinking.canOpenURL).toHaveBeenCalledWith(
        'whatsapp://send?text=查看我的卡牌評估結果！%0A%0Ahttps://cardstrategy.com/share/ABC123DEF456'
      );
    });

    it('應該處理無法打開 WhatsApp', async () => {
      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';

      mockLinking.canOpenURL.mockResolvedValue(false);

      await expect(
        shareVerificationService.shareToWhatsApp(shareUrl)
      ).rejects.toThrow('無法打開 WhatsApp');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '❌ Share to WhatsApp error:',
        { error: '無法打開 WhatsApp' }
      );
    });
  });

  describe('shareToInstagram', () => {
    it('應該Success分享到 Instagram', async () => {
      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';
      const _imageUrl = 'https://example.com/card-image.jpg';

      mockLinking.canOpenURL.mockResolvedValue(true);
      mockLinking.openURL.mockResolvedValue();

      await shareVerificationService.shareToInstagram(shareUrl, imageUrl);

      expect(mockLinking.canOpenURL).toHaveBeenCalledWith(
        expect.stringContaining('instagram://library')
      );
      expect(mockLinking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('instagram://library')
      );
      expect(mockLogger.info).toHaveBeenCalledWith('✅ Shared to Instagram');
    });

    it('應該使用默認圖片', async () => {
      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';

      mockLinking.canOpenURL.mockResolvedValue(true);
      mockLinking.openURL.mockResolvedValue();

      await shareVerificationService.shareToInstagram(shareUrl);

      expect(mockLinking.canOpenURL).toHaveBeenCalledWith(
        expect.stringContaining('https://cardstrategy.com/share-image.png')
      );
    });

    it('應該處理無法打開 Instagram', async () => {
      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';

      mockLinking.canOpenURL.mockResolvedValue(false);

      await expect(
        shareVerificationService.shareToInstagram(shareUrl)
      ).rejects.toThrow('無法打開 Instagram，已複製鏈接到剪貼板');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '❌ Share to Instagram error:',
        { error: '無法打開 Instagram，已複製鏈接到剪貼板' }
      );
    });
  });

  describe('shareToFacebook', () => {
    it('應該Success分享到 Facebook', async () => {
      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';
      const _message = '自定義消息';

      mockLinking.openURL.mockResolvedValue();

      await shareVerificationService.shareToFacebook(shareUrl, message);

      expect(mockLinking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('facebook.com/sharer/sharer.php')
      );
      expect(mockLogger.info).toHaveBeenCalledWith('✅ Shared to Facebook');
    });

    it('應該使用默認消息', async () => {
      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';

      mockLinking.openURL.mockResolvedValue();

      await shareVerificationService.shareToFacebook(shareUrl);

      expect(mockLinking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('facebook.com/sharer/sharer.php')
      );
    });

    it('應該Handle分享Failed', async () => {
      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';

      mockLinking.openURL.mockRejectedValue(new Error('分享Failed'));

      await expect(
        shareVerificationService.shareToFacebook(shareUrl)
      ).rejects.toThrow('分享Failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '❌ Share to Facebook error:',
        { error: '分享Failed' }
      );
    });
  });

  describe('shareToTwitter', () => {
    it('應該Success分享到 Twitter', async () => {
      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';
      const _message = '自定義消息';

      mockLinking.openURL.mockResolvedValue();

      await shareVerificationService.shareToTwitter(shareUrl, message);

      expect(mockLinking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com/intent/tweet')
      );
      expect(mockLogger.info).toHaveBeenCalledWith('✅ Shared to Twitter');
    });

    it('應該使用默認消息', async () => {
      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';

      mockLinking.openURL.mockResolvedValue();

      await shareVerificationService.shareToTwitter(shareUrl);

      expect(mockLinking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com/intent/tweet')
      );
    });

    it('應該Handle分享Failed', async () => {
      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';

      mockLinking.openURL.mockRejectedValue(new Error('分享Failed'));

      await expect(
        shareVerificationService.shareToTwitter(shareUrl)
      ).rejects.toThrow('分享Failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '❌ Share to Twitter error:',
        { error: '分享Failed' }
      );
    });
  });

  describe('shareToTelegram', () => {
    it('應該Success分享到 Telegram', async () => {
      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';
      const _message = '自定義消息';

      mockLinking.openURL.mockResolvedValue();

      await shareVerificationService.shareToTelegram(shareUrl, message);

      expect(mockLinking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('t.me/share/url')
      );
      expect(mockLogger.info).toHaveBeenCalledWith('✅ Shared to Telegram');
    });

    it('應該使用默認消息', async () => {
      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';

      mockLinking.openURL.mockResolvedValue();

      await shareVerificationService.shareToTelegram(shareUrl);

      expect(mockLinking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('t.me/share/url')
      );
    });

    it('應該Handle分享Failed', async () => {
      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';

      mockLinking.openURL.mockRejectedValue(new Error('分享Failed'));

      await expect(
        shareVerificationService.shareToTelegram(shareUrl)
      ).rejects.toThrow('分享Failed');
      expect(mockLogger.error).toHaveBeenCalledWith(
        '❌ Share to Telegram error:',
        { error: '分享Failed' }
      );
    });
  });

  describe('shareGeneric', () => {
    it('應該Success進行通用分享', async () => {
      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';
      const _title = '自定義標題';
      const _message = '自定義消息';

      mockSharing.isAvailableAsync.mockResolvedValue(true);
      mockSharing.shareAsync.mockResolvedValue();

      await shareVerificationService.shareGeneric(shareUrl, title, message);

      expect(mockSharing.isAvailableAsync).toHaveBeenCalled();
      expect(mockSharing.shareAsync).toHaveBeenCalledWith(shareUrl, {
        dialogTitle: '自定義標題',
        mimeType: 'text/plain',
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        '✅ Generic share successful'
      );
    });

    it('應該使用默認標題和消息', async () => {
      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';

      mockSharing.isAvailableAsync.mockResolvedValue(true);
      mockSharing.shareAsync.mockResolvedValue();

      await shareVerificationService.shareGeneric(shareUrl);

      expect(mockSharing.shareAsync).toHaveBeenCalledWith(shareUrl, {
        dialogTitle: '卡牌評估結果',
        mimeType: 'text/plain',
      });
    });

    it('應該在不支援原生分享時複製到剪貼板', async () => {
      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';

      mockSharing.isAvailableAsync.mockResolvedValue(false);

      await expect(
        shareVerificationService.shareGeneric(shareUrl)
      ).rejects.toThrow('不支援原生分享，已複製鏈接到剪貼板');
      expect(mockLogger.error).toHaveBeenCalledWith('❌ Generic share error:', {
        error: '不支援原生分享，已複製鏈接到剪貼板',
      });
    });

    it('應該Handle分享Failed', async () => {
      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';

      mockSharing.isAvailableAsync.mockResolvedValue(true);
      mockSharing.shareAsync.mockRejectedValue(new Error('分享Failed'));

      await expect(
        shareVerificationService.shareGeneric(shareUrl)
      ).rejects.toThrow('分享Failed');
      expect(mockLogger.error).toHaveBeenCalledWith('❌ Generic share error:', {
        error: '分享Failed',
      });
    });
  });

  describe('generateQRCodeUrl', () => {
    it('應該Success生成 QR 碼 URL', () => {
      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';
      const _result = shareVerificationService.generateQRCodeUrl(shareUrl);

      expect(result).toContain('https://api.qrserver.com/v1/create-qr-code/');
      expect(result).toContain('size=300x300');
      expect(result).toContain(`data=${encodeURIComponent(shareUrl)}`);
      expect(result).toContain('format=png');
    });

    it('應該處理包含特殊字符的 URL', () => {
      const _shareUrl =
        'https://cardstrategy.com/share/ABC123DEF456?param=value&other=test';
      const _result = shareVerificationService.generateQRCodeUrl(shareUrl);

      expect(result).toContain(`data=${encodeURIComponent(shareUrl)}`);
    });
  });

  describe('validateShareUrl', () => {
    it('應該SuccessVerify有效的分享鏈接', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
      });

      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';
      const _result = await shareVerificationService.validateShareUrl(shareUrl);

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(shareUrl, { method: 'HEAD' });
    });

    it('應該驗證無效的分享鏈接', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
      });

      const _shareUrl = 'https://cardstrategy.com/share/invalid';
      const _result = await shareVerificationService.validateShareUrl(shareUrl);

      expect(result).toBe(false);
    });

    it('應該Handle網絡Error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('網絡Error'));

      const _shareUrl = 'https://cardstrategy.com/share/ABC123DEF456';
      const _result = await shareVerificationService.validateShareUrl(shareUrl);

      expect(result).toBe(false);
    });
  });
});
