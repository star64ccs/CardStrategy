import { apiService, ApiResponse } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';
import { validateInput, validateApiResponse } from '../utils/validationService';
import {
  ShareVerification,
  ShareVerificationCreateRequest,
  ShareVerificationResponse,
  VerificationLookupResponse,
} from '../types';
import { z } from 'zod';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// 分享驗證服務類
class ShareVerificationService {
  // 創建分享驗證
  async createShareVerification(
    request: ShareVerificationCreateRequest
  ): Promise<ApiResponse<ShareVerificationResponse>> {
    try {
      const validationResult = validateInput(
        z.object({
          cardId: z.string().uuid('無效的卡牌 ID'),
          analysisType: z.enum(['centering', 'authenticity', 'comprehensive']),
          analysisResult: z.object({
            centering: z
              .object({
                score: z.number().min(0).max(100),
                grade: z.string(),
                details: z.array(z.string()),
                confidence: z.number().min(0).max(1),
              })
              .optional(),
            authenticity: z
              .object({
                isAuthentic: z.boolean(),
                confidence: z.number().min(0).max(1),
                riskFactors: z.array(z.string()),
                verificationDetails: z.array(z.string()),
              })
              .optional(),
            overallGrade: z.string().optional(),
            overallScore: z.number().min(0).max(100).optional(),
            processingTime: z.number(),
            metadata: z.object({
              analysisMethod: z.string(),
              modelVersion: z.string(),
              imageQuality: z.string(),
              lightingConditions: z.string(),
            }),
          }),
          expiresInDays: z.number().min(1).max(365).optional(),
        }),
        request
      );

      if (!validationResult.isValid) {
        throw new Error(
          validationResult.errorMessage || '分享驗證請求驗證失敗'
        );
      }

      const response = await apiService.post<ShareVerificationResponse>(
        API_ENDPOINTS.SHARE_VERIFICATION.CREATE,
        validationResult.data!
      );

      const responseValidation = validateApiResponse(
        z.object({
          verificationCode: z.string(),
          shareUrl: z.string().url(),
          qrCodeUrl: z.string().url(),
          socialShareLinks: z.object({
            whatsapp: z.string().url(),
            instagram: z.string().url(),
            facebook: z.string().url(),
            twitter: z.string().url(),
            telegram: z.string().url(),
          }),
        }),
        response.data
      );

      if (!responseValidation.isValid) {
        throw new Error(
          responseValidation.errorMessage || '分享驗證響應驗證失敗'
        );
      }

      logger.info('✅ Share verification created', {
        verificationCode: responseValidation.data!.verificationCode,
      });

      return {
        ...response,
        data: responseValidation.data!,
      };
    } catch (error: any) {
      logger.error('❌ Create share verification error:', {
        error: error.message,
      });
      throw error;
    }
  }

  // 查詢分享驗證
  async lookupVerification(
    verificationCode: string
  ): Promise<ApiResponse<VerificationLookupResponse>> {
    try {
      const validationResult = validateInput(
        z.object({ verificationCode: z.string().min(8, '驗證碼格式無效') }),
        { verificationCode }
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '驗證碼驗證失敗');
      }

      const response = await apiService.get<VerificationLookupResponse>(
        `${API_ENDPOINTS.SHARE_VERIFICATION.LOOKUP}/${validationResult.data!.verificationCode}`
      );

      const responseValidation = validateApiResponse(
        z.object({
          verification: z.object({
            id: z.string(),
            verificationCode: z.string(),
            userId: z.string(),
            cardId: z.string(),
            analysisType: z.enum([
              'centering',
              'authenticity',
              'comprehensive',
            ]),
            analysisResult: z.object({
              centering: z
                .object({
                  score: z.number(),
                  grade: z.string(),
                  details: z.array(z.string()),
                  confidence: z.number(),
                })
                .optional(),
              authenticity: z
                .object({
                  isAuthentic: z.boolean(),
                  confidence: z.number(),
                  riskFactors: z.array(z.string()),
                  verificationDetails: z.array(z.string()),
                })
                .optional(),
              overallGrade: z.string().optional(),
              overallScore: z.number().optional(),
              processingTime: z.number(),
              metadata: z.object({
                analysisMethod: z.string(),
                modelVersion: z.string(),
                imageQuality: z.string(),
                lightingConditions: z.string(),
              }),
            }),
            shareUrl: z.string(),
            expiresAt: z.string(),
            isActive: z.boolean(),
            viewCount: z.number(),
            lastViewedAt: z.string().optional(),
            createdAt: z.string(),
            updatedAt: z.string(),
          }),
          card: z.object({
            id: z.string(),
            name: z.string(),
            setName: z.string(),
            rarity: z.string(),
            imageUrl: z.string().optional(),
            price: z.number().optional(),
          }),
          user: z.object({
            username: z.string(),
            avatar: z.string().optional(),
          }),
          isExpired: z.boolean(),
          isValid: z.boolean(),
        }),
        response.data
      );

      if (!responseValidation.isValid) {
        throw new Error(
          responseValidation.errorMessage || '驗證查詢響應驗證失敗'
        );
      }

      logger.info('✅ Share verification lookup successful', {
        verificationCode,
      });

      return {
        ...response,
        data: responseValidation.data!,
      };
    } catch (error: any) {
      logger.error('❌ Lookup verification error:', { error: error.message });
      throw error;
    }
  }

  // 分享到 WhatsApp
  async shareToWhatsApp(shareUrl: string, message?: string): Promise<void> {
    try {
      const defaultMessage = '查看我的卡牌評估結果！';
      const fullMessage = `${message || defaultMessage}\n\n${shareUrl}`;
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(fullMessage)}`;

      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        logger.info('✅ Shared to WhatsApp');
      } else {
        throw new Error('無法打開 WhatsApp');
      }
    } catch (error: any) {
      logger.error('❌ Share to WhatsApp error:', { error: error.message });
      throw error;
    }
  }

  // 分享到 Instagram
  async shareToInstagram(shareUrl: string, imageUrl?: string): Promise<void> {
    try {
      // Instagram 分享需要圖片，如果沒有提供則使用默認圖片
      const imageToShare =
        imageUrl || 'https://cardstrategy.com/share-image.png';
      const instagramUrl = `instagram://library?AssetPath=${encodeURIComponent(imageToShare)}&InstagramCaption=${encodeURIComponent(`查看我的卡牌評估結果！\n\n${shareUrl}`)}`;

      const canOpen = await Linking.canOpenURL(instagramUrl);
      if (canOpen) {
        await Linking.openURL(instagramUrl);
        logger.info('✅ Shared to Instagram');
      } else {
        // 如果無法直接打開 Instagram，則複製鏈接到剪貼板
        await this.copyToClipboard(shareUrl);
        throw new Error('無法打開 Instagram，已複製鏈接到剪貼板');
      }
    } catch (error: any) {
      logger.error('❌ Share to Instagram error:', { error: error.message });
      throw error;
    }
  }

  // 分享到 Facebook
  async shareToFacebook(shareUrl: string, message?: string): Promise<void> {
    try {
      const defaultMessage = '查看我的卡牌評估結果！';
      const fullMessage = `${message || defaultMessage}\n\n${shareUrl}`;
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(fullMessage)}`;

      await Linking.openURL(facebookUrl);
      logger.info('✅ Shared to Facebook');
    } catch (error: any) {
      logger.error('❌ Share to Facebook error:', { error: error.message });
      throw error;
    }
  }

  // 分享到 Twitter
  async shareToTwitter(shareUrl: string, message?: string): Promise<void> {
    try {
      const defaultMessage = '查看我的卡牌評估結果！';
      const fullMessage = `${message || defaultMessage}\n\n${shareUrl}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullMessage)}`;

      await Linking.openURL(twitterUrl);
      logger.info('✅ Shared to Twitter');
    } catch (error: any) {
      logger.error('❌ Share to Twitter error:', { error: error.message });
      throw error;
    }
  }

  // 分享到 Telegram
  async shareToTelegram(shareUrl: string, message?: string): Promise<void> {
    try {
      const defaultMessage = '查看我的卡牌評估結果！';
      const fullMessage = `${message || defaultMessage}\n\n${shareUrl}`;
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(defaultMessage)}`;

      await Linking.openURL(telegramUrl);
      logger.info('✅ Shared to Telegram');
    } catch (error: any) {
      logger.error('❌ Share to Telegram error:', { error: error.message });
      throw error;
    }
  }

  // 通用分享
  async shareGeneric(
    shareUrl: string,
    title?: string,
    message?: string
  ): Promise<void> {
    try {
      const shareTitle = title || '卡牌評估結果';
      const shareMessage = message || '查看我的卡牌評估結果！';

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareUrl, {
          dialogTitle: shareTitle,
          mimeType: 'text/plain',
        });
        logger.info('✅ Generic share successful');
      } else {
        // 如果不支援原生分享，則複製到剪貼板
        await this.copyToClipboard(shareUrl);
        throw new Error('不支援原生分享，已複製鏈接到剪貼板');
      }
    } catch (error: any) {
      logger.error('❌ Generic share error:', { error: error.message });
      throw error;
    }
  }

  // 複製到剪貼板
  private async copyToClipboard(text: string): Promise<void> {
    try {
      const { Clipboard } = await import('@react-native-clipboard/clipboard');
      await Clipboard.setString(text);
      logger.info('✅ Copied to clipboard');
    } catch (error: any) {
      logger.error('❌ Copy to clipboard error:', { error: error.message });
      throw error;
    }
  }

  // 生成 QR 碼 URL
  generateQRCodeUrl(shareUrl: string): string {
    const qrApiUrl = 'https://api.qrserver.com/v1/create-qr-code/';
    const params = new URLSearchParams({
      size: '300x300',
      data: shareUrl,
      format: 'png',
    });
    return `${qrApiUrl}?${params.toString()}`;
  }

  // 驗證分享鏈接是否有效
  async validateShareUrl(shareUrl: string): Promise<boolean> {
    try {
      const response = await fetch(shareUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// 導出分享驗證服務實例
export { ShareVerificationService };
export const shareVerificationService = new ShareVerificationService();
