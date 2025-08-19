import { apiService } from './apiService';
import { logger } from '../utils/logger';
import { storage } from '../utils/storage';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';
import {
  UserFeedback,
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
  CreateFeedbackResponseRequest,
  FeedbackQueryParams,
  FeedbackStats,
  FeedbackAnalysisReport,
  FeedbackTemplate,
  FeedbackTag,
  FeedbackNotificationSettings
} from '../types/feedback';

/**
 * 用戶反饋服務
 * 處理所有與用戶反饋相關的操作
 */
class FeedbackService {
  private baseUrl = '/feedback';

  /**
   * 創建新的反饋
   */
  async createFeedback(data: CreateFeedbackRequest): Promise<UserFeedback> {
    try {
      logger.info('創建用戶反饋', { type: data.type, category: data.category });

      // 添加設備信息
      const deviceInfo = await this.getDeviceInfo();
      const appInfo = await this.getAppInfo();

      const requestData = {
        ...data,
        deviceInfo,
        appInfo,
        location: await this.getCurrentLocation()
      };

      const response = await apiService.post(`${this.baseUrl}`, requestData);

      logger.info('反饋創建成功', { feedbackId: response.data.id });
      return response.data;
    } catch (error) {
      logger.error('創建反饋失敗', { error, data });
      throw error;
    }
  }

  /**
   * 獲取用戶反饋列表
   */
  async getFeedbacks(params?: FeedbackQueryParams): Promise<{
    feedbacks: UserFeedback[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      logger.info('獲取反饋列表', { params });

      const response = await apiService.get(`${this.baseUrl}`, { params });

      logger.info('反饋列表獲取成功', {
        count: response.data.feedbacks.length,
        total: response.data.total
      });

      return response.data;
    } catch (error) {
      logger.error('獲取反饋列表失敗', { error, params });
      throw error;
    }
  }

  /**
   * 獲取單個反饋詳情
   */
  async getFeedback(id: string): Promise<UserFeedback> {
    try {
      logger.info('獲取反饋詳情', { feedbackId: id });

      const response = await apiService.get(`${this.baseUrl}/${id}`);

      logger.info('反饋詳情獲取成功', { feedbackId: id });
      return response.data;
    } catch (error) {
      logger.error('獲取反饋詳情失敗', { error, feedbackId: id });
      throw error;
    }
  }

  /**
   * 更新反饋
   */
  async updateFeedback(id: string, data: UpdateFeedbackRequest): Promise<UserFeedback> {
    try {
      logger.info('更新反饋', { feedbackId: id, data });

      const response = await apiService.put(`${this.baseUrl}/${id}`, data);

      logger.info('反饋更新成功', { feedbackId: id });
      return response.data;
    } catch (error) {
      logger.error('更新反饋失敗', { error, feedbackId: id, data });
      throw error;
    }
  }

  /**
   * 刪除反饋
   */
  async deleteFeedback(id: string): Promise<void> {
    try {
      logger.info('刪除反饋', { feedbackId: id });

      await apiService.delete(`${this.baseUrl}/${id}`);

      logger.info('反饋刪除成功', { feedbackId: id });
    } catch (error) {
      logger.error('刪除反饋失敗', { error, feedbackId: id });
      throw error;
    }
  }

  /**
   * 為反饋投票
   */
  async voteFeedback(id: string, vote: 1 | -1): Promise<void> {
    try {
      logger.info('為反饋投票', { feedbackId: id, vote });

      await apiService.post(`${this.baseUrl}/${id}/vote`, { vote });

      logger.info('反饋投票成功', { feedbackId: id, vote });
    } catch (error) {
      logger.error('反饋投票失敗', { error, feedbackId: id, vote });
      throw error;
    }
  }

  /**
   * 創建反饋回應
   */
  async createResponse(data: CreateFeedbackResponseRequest): Promise<void> {
    try {
      logger.info('創建反饋回應', { feedbackId: data.feedbackId });

      await apiService.post(`${this.baseUrl}/${data.feedbackId}/responses`, data);

      logger.info('反饋回應創建成功', { feedbackId: data.feedbackId });
    } catch (error) {
      logger.error('創建反饋回應失敗', { error, data });
      throw error;
    }
  }

  /**
   * 獲取反饋統計
   */
  async getFeedbackStats(): Promise<FeedbackStats> {
    try {
      logger.info('獲取反饋統計');

      const response = await apiService.get(`${this.baseUrl}/stats`);

      logger.info('反饋統計獲取成功');
      return response.data;
    } catch (error) {
      logger.error('獲取反饋統計失敗', { error });
      throw error;
    }
  }

  /**
   * 獲取反饋分析報告
   */
  async getFeedbackAnalysis(period?: { start: string; end: string }): Promise<FeedbackAnalysisReport> {
    try {
      logger.info('獲取反饋分析報告', { period });

      const params = period ? { period } : {};
      const response = await apiService.get(`${this.baseUrl}/analysis`, { params });

      logger.info('反饋分析報告獲取成功');
      return response.data;
    } catch (error) {
      logger.error('獲取反饋分析報告失敗', { error, period });
      throw error;
    }
  }

  /**
   * 獲取反饋模板
   */
  async getFeedbackTemplates(): Promise<FeedbackTemplate[]> {
    try {
      logger.info('獲取反饋模板');

      const response = await apiService.get(`${this.baseUrl}/templates`);

      logger.info('反饋模板獲取成功', { count: response.data.length });
      return response.data;
    } catch (error) {
      logger.error('獲取反饋模板失敗', { error });
      throw error;
    }
  }

  /**
   * 獲取反饋標籤
   */
  async getFeedbackTags(): Promise<FeedbackTag[]> {
    try {
      logger.info('獲取反饋標籤');

      const response = await apiService.get(`${this.baseUrl}/tags`);

      logger.info('反饋標籤獲取成功', { count: response.data.length });
      return response.data;
    } catch (error) {
      logger.error('獲取反饋標籤失敗', { error });
      throw error;
    }
  }

  /**
   * 獲取反饋通知設置
   */
  async getNotificationSettings(): Promise<FeedbackNotificationSettings> {
    try {
      logger.info('獲取反饋通知設置');

      const response = await apiService.get(`${this.baseUrl}/notifications/settings`);

      logger.info('反饋通知設置獲取成功');
      return response.data;
    } catch (error) {
      logger.error('獲取反饋通知設置失敗', { error });
      throw error;
    }
  }

  /**
   * 更新反饋通知設置
   */
  async updateNotificationSettings(settings: Partial<FeedbackNotificationSettings>): Promise<void> {
    try {
      logger.info('更新反饋通知設置', { settings });

      await apiService.put(`${this.baseUrl}/notifications/settings`, settings);

      logger.info('反饋通知設置更新成功');
    } catch (error) {
      logger.error('更新反饋通知設置失敗', { error, settings });
      throw error;
    }
  }

  /**
   * 上傳反饋附件
   */
  async uploadAttachment(feedbackId: string, file: File): Promise<string> {
    try {
      logger.info('上傳反饋附件', { feedbackId, fileName: file.name });

      const formData = new FormData();
      formData.append('file', file);

      const response = await apiService.post(
        `${this.baseUrl}/${feedbackId}/attachments`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      logger.info('反饋附件上傳成功', { feedbackId, fileUrl: response.data.url });
      return response.data.url;
    } catch (error) {
      logger.error('上傳反饋附件失敗', { error, feedbackId, fileName: file.name });
      throw error;
    }
  }

  /**
   * 搜索反饋
   */
  async searchFeedbacks(query: string, params?: FeedbackQueryParams): Promise<{
    feedbacks: UserFeedback[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      logger.info('搜索反饋', { query, params });

      const searchParams = { ...params, q: query };
      const response = await apiService.get(`${this.baseUrl}/search`, { params: searchParams });

      logger.info('反饋搜索成功', {
        query,
        count: response.data.feedbacks.length,
        total: response.data.total
      });

      return response.data;
    } catch (error) {
      logger.error('搜索反饋失敗', { error, query, params });
      throw error;
    }
  }

  /**
   * 獲取用戶的反饋歷史
   */
  async getUserFeedbackHistory(): Promise<UserFeedback[]> {
    try {
      logger.info('獲取用戶反饋歷史');

      const response = await apiService.get(`${this.baseUrl}/my-feedback`);

      logger.info('用戶反饋歷史獲取成功', { count: response.data.length });
      return response.data;
    } catch (error) {
      logger.error('獲取用戶反饋歷史失敗', { error });
      throw error;
    }
  }

  /**
   * 標記反饋為已讀
   */
  async markFeedbackAsRead(id: string): Promise<void> {
    try {
      logger.info('標記反饋為已讀', { feedbackId: id });

      await apiService.post(`${this.baseUrl}/${id}/read`);

      logger.info('反饋標記為已讀成功', { feedbackId: id });
    } catch (error) {
      logger.error('標記反饋為已讀失敗', { error, feedbackId: id });
      throw error;
    }
  }

  /**
   * 獲取設備信息
   */
  private async getDeviceInfo() {
    const { Platform } = await import('react-native');
    const { Device } = await import('expo-device');

    return {
      platform: Platform.OS as 'ios' | 'android' | 'web',
      version: Platform.Version?.toString() || 'unknown',
      model: Device.modelName || undefined,
      osVersion: Device.osVersion || undefined
    };
  }

  /**
   * 獲取應用信息
   */
  private async getAppInfo() {
    const Constants = await import('expo-constants');

    return {
      version: Constants.expoConfig?.version || '1.0.0',
      buildNumber: Constants.expoConfig?.ios?.buildNumber ||
                   Constants.expoConfig?.android?.versionCode?.toString() || '1'
    };
  }

  /**
   * 獲取當前位置信息
   */
  private async getCurrentLocation() {
    try {
      // 這裡可以從導航狀態或其他地方獲取當前屏幕信息
      return {
        screen: 'unknown',
        action: 'unknown'
      };
    } catch (error) {
      logger.warn('無法獲取當前位置信息', { error });
      return undefined;
    }
  }

  /**
   * 緩存反饋數據
   */
  async cacheFeedback(feedback: UserFeedback): Promise<void> {
    try {
      const key = `feedback_${feedback.id}`;
      await storage.setItem(key, JSON.stringify(feedback));

      logger.info('反饋數據緩存成功', { feedbackId: feedback.id });
    } catch (error) {
      logger.error('緩存反饋數據失敗', { error, feedbackId: feedback.id });
    }
  }

  /**
   * 從緩存獲取反饋數據
   */
  async getCachedFeedback(id: string): Promise<UserFeedback | null> {
    try {
      const key = `feedback_${id}`;
      const cached = await storage.getItem(key);

      if (cached) {
        logger.info('從緩存獲取反饋數據', { feedbackId: id });
        return JSON.parse(cached);
      }

      return null;
    } catch (error) {
      logger.error('從緩存獲取反饋數據失敗', { error, feedbackId: id });
      return null;
    }
  }

  /**
   * 清理過期的緩存數據
   */
  async clearExpiredCache(): Promise<void> {
    try {
      const keys = await storage.getAllKeys();
      const feedbackKeys = keys.filter(key => key.startsWith('feedback_'));

      // 這裡可以實現更複雜的過期邏輯
      // 目前簡單地清理所有反饋緩存
      for (const key of feedbackKeys) {
        await storage.removeItem(key);
      }

      logger.info('清理過期緩存成功', { clearedCount: feedbackKeys.length });
    } catch (error) {
      logger.error('清理過期緩存失敗', { error });
    }
  }
}

export const feedbackService = new FeedbackService();
