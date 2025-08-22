import { apiService, ApiResponse } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';
import { validateInput } from '../utils/validationService';
import { z } from 'zod';

// 假卡數據類型
export interface FakeCardData {
  id: string;
  userId: string;
  cardName: string;
  cardType: string;
  fakeType: 'counterfeit' | 'reprint' | 'custom' | 'proxy';
  imageUrls: string[];
  description: string;
  fakeIndicators: string[];
  submissionDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewerNotes?: string;
  rewardPoints?: number;
}

// 假卡提交請求
export interface FakeCardSubmissionRequest {
  cardName: string;
  cardType: string;
  fakeType: 'counterfeit' | 'reprint' | 'custom' | 'proxy';
  imageData: string[];
  description: string;
  fakeIndicators: string[];
}

// 假卡收集服務類
class FakeCardCollectionService {
  private config = {
    maxImageSize: 10 * 1024 * 1024, // 10MB
    maxImagesPerSubmission: 5,
    rewardPoints: {
      counterfeit: 100,
      reprint: 50,
      custom: 30,
      proxy: 20,
    },
  };

  // 提交假卡數據
  async submitFakeCard(
    request: FakeCardSubmissionRequest
  ): Promise<ApiResponse<FakeCardData>> {
    try {
      // 驗證輸入
      const validationResult = validateInput(
        z.object({
          cardName: z.string().min(1, '卡牌名稱不能為空'),
          cardType: z.string().min(1, '卡牌類型不能為空'),
          fakeType: z.enum(['counterfeit', 'reprint', 'custom', 'proxy']),
          imageData: z.array(z.string()).min(1, '至少需要一張圖片').max(5, '最多5張圖片'),
          description: z.string().min(10, '描述至少10個字符'),
          fakeIndicators: z.array(z.string()).min(1, '至少需要一個假卡特徵'),
        }),
        request
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '輸入驗證失敗');
      }

      // 驗證圖片大小
      for (const imageData of request.imageData) {
        if (imageData.length > this.config.maxImageSize) {
          throw new Error('圖片大小超過限制');
        }
      }

      const response = await apiService.post<FakeCardData>(
        API_ENDPOINTS.FAKE_CARD.SUBMIT || '/fake-card/submit',
        request
      );

      logger.info('✅ 假卡數據提交成功', {
        cardName: request.cardName,
        fakeType: request.fakeType,
      });

      return response;
    } catch (error: any) {
      logger.error('❌ 假卡數據提交失敗:', { error: error.message });
      throw error;
    }
  }

  // 獲取用戶提交的假卡列表
  async getUserSubmissions(): Promise<ApiResponse<FakeCardData[]>> {
    try {
      const response = await apiService.get<FakeCardData[]>(
        API_ENDPOINTS.FAKE_CARD.USER_SUBMISSIONS || '/fake-card/user-submissions'
      );

      return response;
    } catch (error: any) {
      logger.error('❌ 獲取用戶提交失敗:', { error: error.message });
      throw error;
    }
  }

  // 獲取假卡數據庫（僅供AI訓練）
  async getFakeCardDatabase(): Promise<ApiResponse<FakeCardData[]>> {
    try {
      const response = await apiService.get<FakeCardData[]>(
        API_ENDPOINTS.FAKE_CARD.DATABASE || '/fake-card/database'
      );

      return response;
    } catch (error: any) {
      logger.error('❌ 獲取假卡數據庫失敗:', { error: error.message });
      throw error;
    }
  }

  // 獲取獎勵積分
  async getRewardPoints(): Promise<ApiResponse<{ points: number; history: any[] }>> {
    try {
      const response = await apiService.get<{ points: number; history: any[] }>(
        API_ENDPOINTS.FAKE_CARD.REWARDS || '/fake-card/rewards'
      );

      return response;
    } catch (error: any) {
      logger.error('❌ 獲取獎勵積分失敗:', { error: error.message });
      throw error;
    }
  }
}

export const fakeCardCollectionService = new FakeCardCollectionService();
export default fakeCardCollectionService;
