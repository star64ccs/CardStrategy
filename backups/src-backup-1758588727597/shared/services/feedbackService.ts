import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * 反饋類型
 */
export interface Feedback {
  id: string;
  userId: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 創建反饋請求
 */
export interface CreateFeedbackRequest {
  type: Feedback['type'];
  title: string;
  description: string;
  priority: Feedback['priority'];
  category: string;
  attachments?: string[];
}

/**
 * 更新反饋請求
 */
export interface UpdateFeedbackRequest {
  title?: string;
  description?: string;
  priority?: Feedback['priority'];
  status?: Feedback['status'];
  category?: string;
}

/**
 * 反饋服務
 */
export class FeedbackService {
  private readonly baseUrl = '/api/feedback';

  /**
   * 創建反饋
   */
  async createFeedback(data: CreateFeedbackRequest): Promise<any> {
    try {
      logger.info('創建反饋:', { type: data.type, title: data.title });

      const response = await api.post(this.baseUrl, data as any);

      if (response.success) {
        logger.info('反饋創建成功:', { id: (response.data as any)?.id });
        return {
          success: true,
          data: response.data,
          message: '反饋創建成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('反饋創建失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '反饋創建失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('創建反饋時發生錯誤:', error);
      return {
        success: false,
        message: '創建反饋時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取用戶反饋列表
   */
  async getUserFeedbacks(
    userId: string,
    status?: Feedback['status']
  ): Promise<any> {
    try {
      logger.info('獲取用戶反饋列表:', { userId, status });

      const params: Record<string, unknown> = { userId };
      if (status) {
        params.status = status;
      }

      const response = await api.get(`${this.baseUrl}/user`, { params });

      if (response.success) {
        logger.info('用戶反饋列表獲取成功:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data || [],
          message: '反饋列表獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取用戶反饋列表失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取反饋列表失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取用戶反饋列表時發生錯誤:', error);
      return {
        success: false,
        message: '獲取反饋列表時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取反饋詳情
   */
  async getFeedback(feedbackId: string): Promise<any> {
    try {
      logger.info('獲取反饋詳情:', { feedbackId });

      const response = await api.get(`${this.baseUrl}/${feedbackId}`);

      if (response.success) {
        logger.info('反饋詳情獲取成功:', { id: (response.data as any)?.id });
        return {
          success: true,
          data: response.data,
          message: '反饋詳情獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取反饋詳情失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取反饋詳情失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取反饋詳情時發生錯誤:', error);
      return {
        success: false,
        message: '獲取反饋詳情時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 更新反饋
   */
  async updateFeedback(
    feedbackId: string,
    data: UpdateFeedbackRequest
  ): Promise<any> {
    try {
      logger.info('更新反饋:', { feedbackId, updates: data });

      const response = await api.put(`${this.baseUrl}/${feedbackId}`, data);

      if (response.success) {
        logger.info('反饋更新成功:', { id: (response.data as any)?.id });
        return {
          success: true,
          data: response.data,
          message: '反饋更新成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('更新反饋失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '更新反饋失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('更新反饋時發生錯誤:', error);
      return {
        success: false,
        message: '更新反饋時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 刪除反饋
   */
  async deleteFeedback(feedbackId: string): Promise<any> {
    try {
      logger.info('刪除反饋:', { feedbackId });

      const response = await api.delete(`${this.baseUrl}/${feedbackId}`);

      if (response.success) {
        logger.info('反饋刪除成功:', { feedbackId });
        return {
          success: true,
          message: '反饋刪除成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('刪除反饋失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '刪除反饋失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('刪除反饋時發生錯誤:', error);
      return {
        success: false,
        message: '刪除反饋時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取反饋統計
   */
  async getFeedbackStats(userId?: string): Promise<any> {
    try {
      logger.info('獲取反饋統計:', { userId });

      const params: Record<string, unknown> = {};
      if (userId) {
        params.userId = userId;
      }
      const response = await api.get(`${this.baseUrl}/stats`, { params });

      if (response.success) {
        logger.info('反饋統計獲取成功');
        return {
          success: true,
          data: response.data,
          message: '反饋統計獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取反饋統計失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取反饋統計失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取反饋統計時發生錯誤:', error);
      return {
        success: false,
        message: '獲取反饋統計時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取服務狀態
   */
  async getServiceStats(): Promise<any> {
    try {
      logger.info('獲取反饋服務狀態');

      const response = await api.get(`${this.baseUrl}/health`);

      return {
        success: true,
        data: {
          service: 'feedback',
          status: response.success ? 'healthy' : 'unhealthy',
          timestamp: new Date(),
          endpoints: {
            create: `${this.baseUrl}`,
            list: `${this.baseUrl}/user`,
            detail: `${this.baseUrl}/:id`,
            update: `${this.baseUrl}/:id`,
            delete: `${this.baseUrl}/:id`,
            stats: `${this.baseUrl}/stats`,
          },
        },
        message: '反饋服務狀態獲取成功',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('獲取反饋服務狀態時發生錯誤:', error);
      return {
        success: false,
        message: '獲取反饋服務狀態時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取反饋列表
   */
  async getFeedbacks(params?: unknown): Promise<any> {
    try {
      logger.info('獲取反饋列表:', { params });

      const response = await api.get(this.baseUrl, { params });

      if (response.success) {
        logger.info('反饋列表獲取成功:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data,
          message: '反饋列表獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取反饋列表失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取反饋列表失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取反饋列表時發生錯誤:', error);
      return {
        success: false,
        message: '獲取反饋列表時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 投票反饋
   */
  async voteFeedback(id: string, vote: 'up' | 'down'): Promise<any> {
    try {
      logger.info('投票反饋:', { id, vote });

      const response = await api.post(`${this.baseUrl}/${id}/vote`, { vote });

      if (response.success) {
        logger.info('反饋投票成功');
        return {
          success: true,
          data: response.data,
          message: '反饋投票成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('反饋投票失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '反饋投票失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('反饋投票時發生錯誤:', error);
      return {
        success: false,
        message: '反饋投票時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 創建反饋回應
   */
  async createResponse(data: unknown): Promise<any> {
    try {
      logger.info('創建反饋回應:', { feedbackId: data.feedbackId });

      const response = await api.post(
        `${this.baseUrl}/${data.feedbackId}/responses`,
        data
      );

      if (response.success) {
        logger.info('反饋回應創建成功');
        return {
          success: true,
          data: response.data,
          message: '反饋回應創建成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('創建反饋回應失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '創建反饋回應失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('創建反饋回應時發生錯誤:', error);
      return {
        success: false,
        message: '創建反饋回應時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取反饋分析
   */
  async getFeedbackAnalysis(period: string): Promise<any> {
    try {
      logger.info('獲取反饋分析:', { period });

      const response = await api.get(
        `${this.baseUrl}/analysis?period=${period}`
      );

      if (response.success) {
        logger.info('反饋分析獲取成功');
        return {
          success: true,
          data: response.data,
          message: '反饋分析獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取反饋分析失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取反饋分析失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取反饋分析時發生錯誤:', error);
      return {
        success: false,
        message: '獲取反饋分析時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取反饋模板
   */
  async getFeedbackTemplates(): Promise<any> {
    try {
      logger.info('獲取反饋模板');

      const response = await api.get(`${this.baseUrl}/templates`);

      if (response.success) {
        logger.info('反饋模板獲取成功');
        return {
          success: true,
          data: response.data,
          message: '反饋模板獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取反饋模板失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取反饋模板失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取反饋模板時發生錯誤:', error);
      return {
        success: false,
        message: '獲取反饋模板時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取反饋標籤
   */
  async getFeedbackTags(): Promise<any> {
    try {
      logger.info('獲取反饋標籤');

      const response = await api.get(`${this.baseUrl}/tags`);

      if (response.success) {
        logger.info('反饋標籤獲取成功');
        return {
          success: true,
          data: response.data,
          message: '反饋標籤獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取反饋標籤失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取反饋標籤失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取反饋標籤時發生錯誤:', error);
      return {
        success: false,
        message: '獲取反饋標籤時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取通知設置
   */
  async getNotificationSettings(): Promise<any> {
    try {
      logger.info('獲取通知設置');

      const response = await api.get(`${this.baseUrl}/notification-settings`);

      if (response.success) {
        logger.info('通知設置獲取成功');
        return {
          success: true,
          data: response.data,
          message: '通知設置獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取通知設置失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取通知設置失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取通知設置時發生錯誤:', error);
      return {
        success: false,
        message: '獲取通知設置時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 更新通知設置
   */
  async updateNotificationSettings(settings: unknown): Promise<any> {
    try {
      logger.info('更新通知設置:', { settings });

      const response = await api.put(
        `${this.baseUrl}/notification-settings`,
        settings
      );

      if (response.success) {
        logger.info('通知設置更新成功');
        return {
          success: true,
          data: response.data,
          message: '通知設置更新成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('更新通知設置失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '更新通知設置失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('更新通知設置時發生錯誤:', error);
      return {
        success: false,
        message: '更新通知設置時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 搜索反饋
   */
  async searchFeedbacks(query: string, params?: unknown): Promise<any> {
    try {
      logger.info('搜索反饋:', { query, params });

      const searchParams = new URLSearchParams({ query });
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
      }

      const response = await api.get(`${this.baseUrl}/search?${searchParams}`);

      if (response.success) {
        logger.info('反饋搜索成功');
        return {
          success: true,
          data: response.data,
          message: '反饋搜索成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('搜索反饋失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '搜索反饋失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('搜索反饋時發生錯誤:', error);
      return {
        success: false,
        message: '搜索反饋時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取用戶反饋歷史
   */
  async getUserFeedbackHistory(): Promise<any> {
    try {
      logger.info('獲取用戶反饋歷史');

      const response = await api.get(`${this.baseUrl}/user/history`);

      if (response.success) {
        logger.info('用戶反饋歷史獲取成功');
        return {
          success: true,
          data: response.data,
          message: '用戶反饋歷史獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取用戶反饋歷史失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取用戶反饋歷史失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取用戶反饋歷史時發生錯誤:', error);
      return {
        success: false,
        message: '獲取用戶反饋歷史時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 標記反饋為已讀
   */
  async markFeedbackAsRead(id: string): Promise<any> {
    try {
      logger.info('標記反饋為已讀:', { id });

      const response = await api.put(`${this.baseUrl}/${id}/read`);

      if (response.success) {
        logger.info('反饋標記為已讀成功');
        return {
          success: true,
          data: response.data,
          message: '反饋標記為已讀成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('標記反饋為已讀失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '標記反饋為已讀失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('標記反饋為已讀時發生錯誤:', error);
      return {
        success: false,
        message: '標記反饋為已讀時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 上傳附件
   */
  async uploadAttachment(feedbackId: string, file: File): Promise<any> {
    try {
      logger.info('上傳反饋附件:', { feedbackId, fileName: file.name });

      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(
        `${this.baseUrl}/${feedbackId}/attachments`,
        formData
      );

      if (response.success) {
        logger.info('反饋附件上傳成功');
        return {
          success: true,
          data: response.data,
          message: '反饋附件上傳成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('上傳反饋附件失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '上傳反饋附件失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('上傳反饋附件時發生錯誤:', error);
      return {
        success: false,
        message: '上傳反饋附件時發生錯誤',
        timestamp: new Date(),
      };
    }
  }
}

export const feedbackService = new FeedbackService();
