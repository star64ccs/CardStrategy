import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * 反饋Class型
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
 * Create反饋Request
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
 * Update反饋Request
 */
export interface UpdateFeedbackRequest {
  title?: string;
  description?: string;
  priority?: Feedback['priority'];
  status?: Feedback['status'];
  category?: string;
}

/**
 * 反饋Service
 */
export class FeedbackService {
  private readonly baseUrl = '/api/feedback';

  /**
   * Create反饋
   */
  async createFeedback(data: CreateFeedbackRequest): Promise<any> {
    try {
      logger.info('創建反饋:', { type: data.type, title: data.title });

      const _response = await api.post(this.baseUrl, data as any);

      if (response.success) {
        logger.info('反饋CreateSuccess:', { id: (response.data as any)?.id });
        return {
          success: true,
          data: response.data,
          message: '反饋CreateSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('反饋CreateFailed:', { message: response.message });
        return {
          success: false,
          message: response.message || '反饋CreateFailed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Create反饋時發生Error:', error);
      return {
        success: false,
        message: 'Create反饋時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetUser反饋List
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

      const _response = await api.get(`${this.baseUrl}/user`, { params });

      if (response.success) {
        logger.info('用戶反饋列表GetSuccess:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data || [],
          message: '反饋列表GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get用戶反饋列表Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get反饋列表Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get用戶反饋列表時發生Error:', error);
      return {
        success: false,
        message: 'Get反饋列表時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get反饋詳情
   */
  async getFeedback(feedbackId: string): Promise<any> {
    try {
      logger.info('獲取反饋詳情:', { feedbackId });

      const _response = await api.get(`${this.baseUrl}/${feedbackId}`);

      if (response.success) {
        logger.info('反饋詳情GetSuccess:', { id: (response.data as any)?.id });
        return {
          success: true,
          data: response.data,
          message: '反饋詳情GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get反饋詳情Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get反饋詳情Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get反饋詳情時發生Error:', error);
      return {
        success: false,
        message: 'Get反饋詳情時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Update反饋
   */
  async updateFeedback(
    feedbackId: string,
    data: UpdateFeedbackRequest
  ): Promise<any> {
    try {
      logger.info('更新反饋:', { feedbackId, updates: data });

      const _response = await api.put(`${this.baseUrl}/${feedbackId}`, data);

      if (response.success) {
        logger.info('反饋UpdateSuccess:', { id: (response.data as any)?.id });
        return {
          success: true,
          data: response.data,
          message: '反饋UpdateSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Update反饋Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Update反饋Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Update反饋時發生Error:', error);
      return {
        success: false,
        message: 'Update反饋時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Delete反饋
   */
  async deleteFeedback(feedbackId: string): Promise<any> {
    try {
      logger.info('刪除反饋:', { feedbackId });

      const _response = await api.delete(`${this.baseUrl}/${feedbackId}`);

      if (response.success) {
        logger.info('反饋DeleteSuccess:', { feedbackId });
        return {
          success: true,
          message: '反饋DeleteSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Delete反饋Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Delete反饋Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Delete反饋時發生Error:', error);
      return {
        success: false,
        message: 'Delete反饋時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get反饋Statistics
   */
  async getFeedbackStats(userId?: string): Promise<any> {
    try {
      logger.info('獲取反饋統計:', { userId });

      const params: Record<string, unknown> = {};
      if (userId) {
        params.userId = userId;
      }
      const _response = await api.get(`${this.baseUrl}/stats`, { params });

      if (response.success) {
        logger.info('反饋統計GetSuccess');
        return {
          success: true,
          data: response.data,
          message: '反饋統計GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get反饋統計Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get反饋統計Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get反饋統計時發生Error:', error);
      return {
        success: false,
        message: 'Get反饋統計時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetServiceStatus
   */
  async getServiceStats(): Promise<any> {
    try {
      logger.info('Get反饋Service狀態');

      const _response = await api.get(`${this.baseUrl}/health`);

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
        message: '反饋Service狀態GetSuccess',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Get反饋Service狀態時發生Error:', error);
      return {
        success: false,
        message: 'Get反饋Service狀態時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get反饋List
   */
  async getFeedbacks(params?: unknown): Promise<any> {
    try {
      logger.info('獲取反饋列表:', { params });

      const _response = await api.get(this.baseUrl, { params });

      if (response.success) {
        logger.info('反饋列表GetSuccess:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data,
          message: '反饋列表GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get反饋列表Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get反饋列表Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get反饋列表時發生Error:', error);
      return {
        success: false,
        message: 'Get反饋列表時發生Error',
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

      const _response = await api.post(`${this.baseUrl}/${id}/vote`, { vote });

      if (response.success) {
        logger.info('反饋投票Success');
        return {
          success: true,
          data: response.data,
          message: '反饋投票Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('反饋投票Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '反饋投票Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('反饋投票時發生Error:', error);
      return {
        success: false,
        message: '反饋投票時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Create反饋回應
   */
  async createResponse(data: unknown): Promise<any> {
    try {
      logger.info('創建反饋回應:', { feedbackId: data.feedbackId });

      const _response = await api.post(
        `${this.baseUrl}/${data.feedbackId}/responses`,
        data
      );

      if (response.success) {
        logger.info('反饋回應CreateSuccess');
        return {
          success: true,
          data: response.data,
          message: '反饋回應CreateSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Create反饋回應Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Create反饋回應Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Create反饋回應時發生Error:', error);
      return {
        success: false,
        message: 'Create反饋回應時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get反饋Analysis
   */
  async getFeedbackAnalysis(period: string): Promise<any> {
    try {
      logger.info('獲取反饋分析:', { period });

      const _response = await api.get(
        `${this.baseUrl}/analysis?period=${period}`
      );

      if (response.success) {
        logger.info('反饋分析GetSuccess');
        return {
          success: true,
          data: response.data,
          message: '反饋分析GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get反饋分析Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get反饋分析Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get反饋分析時發生Error:', error);
      return {
        success: false,
        message: 'Get反饋分析時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get反饋模板
   */
  async getFeedbackTemplates(): Promise<any> {
    try {
      logger.info('獲取反饋模板');

      const _response = await api.get(`${this.baseUrl}/templates`);

      if (response.success) {
        logger.info('反饋模板GetSuccess');
        return {
          success: true,
          data: response.data,
          message: '反饋模板GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get反饋模板Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get反饋模板Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get反饋模板時發生Error:', error);
      return {
        success: false,
        message: 'Get反饋模板時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get反饋Tag
   */
  async getFeedbackTags(): Promise<any> {
    try {
      logger.info('獲取反饋標籤');

      const _response = await api.get(`${this.baseUrl}/tags`);

      if (response.success) {
        logger.info('反饋標籤GetSuccess');
        return {
          success: true,
          data: response.data,
          message: '反饋標籤GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get反饋標籤Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get反饋標籤Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get反饋標籤時發生Error:', error);
      return {
        success: false,
        message: 'Get反饋標籤時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetNotificationSettings
   */
  async getNotificationSettings(): Promise<any> {
    try {
      logger.info('獲取通知設置');

      const _response = await api.get(`${this.baseUrl}/notification-settings`);

      if (response.success) {
        logger.info('通知SettingsGetSuccess');
        return {
          success: true,
          data: response.data,
          message: '通知SettingsGetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get通知SettingsFailed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get通知SettingsFailed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get通知Settings時發生Error:', error);
      return {
        success: false,
        message: 'Get通知Settings時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * UpdateNotificationSettings
   */
  async updateNotificationSettings(settings: unknown): Promise<any> {
    try {
      logger.info('更新通知設置:', { settings });

      const _response = await api.put(
        `${this.baseUrl}/notification-settings`,
        settings
      );

      if (response.success) {
        logger.info('通知SettingsUpdateSuccess');
        return {
          success: true,
          data: response.data,
          message: '通知SettingsUpdateSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Update通知SettingsFailed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Update通知SettingsFailed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Update通知Settings時發生Error:', error);
      return {
        success: false,
        message: 'Update通知Settings時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Search反饋
   */
  async searchFeedbacks(query: string, params?: unknown): Promise<any> {
    try {
      logger.info('搜索反饋:', { query, params });

      const _searchParams = new URLSearchParams({ query });
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
      }

      const _response = await api.get(`${this.baseUrl}/search?${searchParams}`);

      if (response.success) {
        logger.info('反饋搜索Success');
        return {
          success: true,
          data: response.data,
          message: '反饋搜索Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('搜索反饋Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '搜索反饋Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('搜索反饋時發生Error:', error);
      return {
        success: false,
        message: '搜索反饋時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetUser反饋歷史
   */
  async getUserFeedbackHistory(): Promise<any> {
    try {
      logger.info('獲取用戶反饋歷史');

      const _response = await api.get(`${this.baseUrl}/user/history`);

      if (response.success) {
        logger.info('用戶反饋歷史GetSuccess');
        return {
          success: true,
          data: response.data,
          message: '用戶反饋歷史GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get用戶反饋歷史Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get用戶反饋歷史Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get用戶反饋歷史時發生Error:', error);
      return {
        success: false,
        message: 'Get用戶反饋歷史時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Mark反饋為已讀
   */
  async markFeedbackAsRead(id: string): Promise<any> {
    try {
      logger.info('標記反饋為已讀:', { id });

      const _response = await api.put(`${this.baseUrl}/${id}/read`);

      if (response.success) {
        logger.info('反饋標記為已讀Success');
        return {
          success: true,
          data: response.data,
          message: '反饋標記為已讀Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('標記反饋為已讀Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '標記反饋為已讀Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('標記反饋為已讀時發生Error:', error);
      return {
        success: false,
        message: '標記反饋為已讀時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Upload附件
   */
  async uploadAttachment(feedbackId: string, file: File): Promise<any> {
    try {
      logger.info('上傳反饋附件:', { feedbackId, fileName: file.name });

      const _formData = new FormData();
      formData.append('file', file);

      const _response = await api.post(
        `${this.baseUrl}/${feedbackId}/attachments`,
        formData
      );

      if (response.success) {
        logger.info('反饋附件上傳Success');
        return {
          success: true,
          data: response.data,
          message: '反饋附件上傳Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('上傳反饋附件Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '上傳反饋附件Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('上傳反饋附件時發生Error:', error);
      return {
        success: false,
        message: '上傳反饋附件時發生Error',
        timestamp: new Date(),
      };
    }
  }
}

export const _feedbackService = new FeedbackService();
