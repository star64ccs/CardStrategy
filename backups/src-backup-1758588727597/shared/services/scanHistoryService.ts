import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * 掃描記錄
 */
export interface ScanRecord {
  id: string;
  userId: string;
  cardId?: string;
  cardName?: string;
  imageUrl: string;
  scanType:
    | 'card_recognition'
    | 'condition_assessment'
    | 'authenticity_verification'
    | 'price_check';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  confidence?: number;
  results?: unknown;
  metadata?: {
    imageQuality: number;
    processingTime: number;
    modelVersion: string;
    scanDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 掃描統計
 */
export interface ScanStats {
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  averageConfidence: number;
  averageProcessingTime: number;
  scansByType: Record<string, number>;
  scansByDate: {
    date: string;
    count: number;
  }[];
}

/**
 * 創建掃描記錄請求
 */
export interface CreateScanRecordRequest {
  cardId?: string;
  cardName?: string;
  imageUrl: string;
  scanType: ScanRecord['scanType'];
  metadata?: Partial<ScanRecord['metadata']>;
}

/**
 * 更新掃描記錄請求
 */
export interface UpdateScanRecordRequest {
  status?: ScanRecord['status'];
  confidence?: number;
  results?: unknown;
  metadata?: Partial<ScanRecord['metadata']>;
}

/**
 * 掃描歷史服務
 */
export class ScanHistoryService {
  private readonly baseUrl = '/api/scan-history';

  /**
   * 創建掃描記錄
   */
  async createScanRecord(
    userId: string,
    data: CreateScanRecordRequest
  ): Promise<any> {
    try {
      logger.info('創建掃描記錄:', { userId, scanType: data.scanType });

      const response = await api.post(`${this.baseUrl}/records`, {
        userId,
        ...data,
      });

      if (response.success) {
        logger.info('掃描記錄創建成功:', { id: (response.data as any)?.id });
        return {
          success: true,
          data: response.data,
          message: '掃描記錄創建成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('創建掃描記錄失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '創建掃描記錄失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('創建掃描記錄時發生錯誤:', error);
      return {
        success: false,
        message: '創建掃描記錄時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取用戶掃描記錄列表
   */
  async getUserScanRecords(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      scanType?: ScanRecord['scanType'];
      status?: ScanRecord['status'];
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<any> {
    try {
      logger.info('獲取用戶掃描記錄列表:', { userId, options });

      const params = new URLSearchParams();
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.scanType) params.append('scanType', options.scanType);
      if (options?.status) params.append('status', options.status);
      if (options?.startDate)
        params.append('startDate', options.startDate.toISOString());
      if (options?.endDate)
        params.append('endDate', options.endDate.toISOString());

      const response = await api.get(
        `${this.baseUrl}/records/user/${userId}?${params}`
      );

      if (response.success) {
        logger.info('用戶掃描記錄列表獲取成功:', {
          count: (response.data as any)?.records?.length,
        });
        return {
          success: true,
          data: response.data,
          message: '用戶掃描記錄列表獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取用戶掃描記錄列表失敗:', {
          message: response.message,
        });
        return {
          success: false,
          message: response.message || '獲取用戶掃描記錄列表失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取用戶掃描記錄列表時發生錯誤:', error);
      return {
        success: false,
        message: '獲取用戶掃描記錄列表時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取掃描記錄詳情
   */
  async getScanRecord(recordId: string): Promise<any> {
    try {
      logger.info('獲取掃描記錄詳情:', { recordId });

      const response = await api.get(`${this.baseUrl}/records/${recordId}`);

      if (response.success) {
        logger.info('掃描記錄詳情獲取成功:', {
          id: (response.data as any)?.id,
        });
        return {
          success: true,
          data: response.data,
          message: '掃描記錄詳情獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取掃描記錄詳情失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取掃描記錄詳情失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取掃描記錄詳情時發生錯誤:', error);
      return {
        success: false,
        message: '獲取掃描記錄詳情時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 更新掃描記錄
   */
  async updateScanRecord(
    recordId: string,
    data: UpdateScanRecordRequest
  ): Promise<any> {
    try {
      logger.info('更新掃描記錄:', { recordId, updates: data });

      const response = await api.put(
        `${this.baseUrl}/records/${recordId}`,
        data
      );

      if (response.success) {
        logger.info('掃描記錄更新成功:', { recordId });
        return {
          success: true,
          data: response.data,
          message: '掃描記錄更新成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('更新掃描記錄失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '更新掃描記錄失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('更新掃描記錄時發生錯誤:', error);
      return {
        success: false,
        message: '更新掃描記錄時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 刪除掃描記錄
   */
  async deleteScanRecord(recordId: string): Promise<any> {
    try {
      logger.info('刪除掃描記錄:', { recordId });

      const response = await api.delete(`${this.baseUrl}/records/${recordId}`);

      if (response.success) {
        logger.info('掃描記錄刪除成功:', { recordId });
        return {
          success: true,
          message: '掃描記錄刪除成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('刪除掃描記錄失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '刪除掃描記錄失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('刪除掃描記錄時發生錯誤:', error);
      return {
        success: false,
        message: '刪除掃描記錄時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 批量刪除掃描記錄
   */
  async deleteMultipleScanRecords(
    userId: string,
    recordIds: string[]
  ): Promise<any> {
    try {
      logger.info('批量刪除掃描記錄:', { userId, count: recordIds.length });

      const response = await api.delete(`${this.baseUrl}/records/batch`, {
        data: { userId, recordIds },
      });

      if (response.success) {
        logger.info('批量刪除掃描記錄成功:', {
          deletedCount: (response.data as any)?.deletedCount,
        });
        return {
          success: true,
          data: response.data,
          message: '批量刪除掃描記錄成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('批量刪除掃描記錄失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '批量刪除掃描記錄失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('批量刪除掃描記錄時發生錯誤:', error);
      return {
        success: false,
        message: '批量刪除掃描記錄時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取掃描統計
   */
  async getScanStats(
    userId: string,
    period: '1d' | '1w' | '1m' | '3m' | '6m' | '1y' = '1m'
  ): Promise<any> {
    try {
      logger.info('獲取掃描統計:', { userId, period });

      const response = await api.get(
        `${this.baseUrl}/stats/${userId}?period=${period}`
      );

      if (response.success) {
        logger.info('掃描統計獲取成功:', { userId });
        return {
          success: true,
          data: response.data,
          message: '掃描統計獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取掃描統計失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取掃描統計失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取掃描統計時發生錯誤:', error);
      return {
        success: false,
        message: '獲取掃描統計時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 導出掃描記錄
   */
  async exportScanRecords(
    userId: string,
    format: 'csv' | 'json' | 'xlsx' = 'csv',
    options?: {
      startDate?: Date;
      endDate?: Date;
      scanType?: ScanRecord['scanType'];
    }
  ): Promise<any> {
    try {
      logger.info('導出掃描記錄:', { userId, format, options });

      const params = new URLSearchParams({ format });
      if (options?.startDate)
        params.append('startDate', options.startDate.toISOString());
      if (options?.endDate)
        params.append('endDate', options.endDate.toISOString());
      if (options?.scanType) params.append('scanType', options.scanType);

      const response = await api.get(
        `${this.baseUrl}/export/${userId}?${params}`
      );

      if (response.success) {
        logger.info('掃描記錄導出成功:', {
          downloadUrl: (response.data as any)?.downloadUrl,
        });
        return {
          success: true,
          data: response.data,
          message: '掃描記錄導出成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('導出掃描記錄失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '導出掃描記錄失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('導出掃描記錄時發生錯誤:', error);
      return {
        success: false,
        message: '導出掃描記錄時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 搜索掃描記錄
   */
  async searchScanRecords(
    userId: string,
    query: string,
    options?: {
      page?: number;
      limit?: number;
      scanType?: ScanRecord['scanType'];
    }
  ): Promise<any> {
    try {
      logger.info('搜索掃描記錄:', { userId, query, options });

      const params = new URLSearchParams({ query });
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.scanType) params.append('scanType', options.scanType);

      const response = await api.get(
        `${this.baseUrl}/search/${userId}?${params}`
      );

      if (response.success) {
        logger.info('掃描記錄搜索成功:', {
          count: (response.data as any)?.records?.length,
        });
        return {
          success: true,
          data: response.data,
          message: '掃描記錄搜索成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('搜索掃描記錄失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '搜索掃描記錄失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('搜索掃描記錄時發生錯誤:', error);
      return {
        success: false,
        message: '搜索掃描記錄時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取掃描歷史
   */
  async getScanHistory(filters?: unknown): Promise<any> {
    try {
      logger.info('獲取掃描歷史:', { filters });

      let url = `${this.baseUrl}/history`;
      if (filters) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
        url += `?${params}`;
      }

      const response = await api.get(url);

      if (response.success) {
        logger.info('掃描歷史獲取成功:', {
          count: (response.data as any)?.records?.length,
        });
        return {
          success: true,
          data: response.data,
          message: '掃描歷史獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取掃描歷史失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取掃描歷史失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取掃描歷史時發生錯誤:', error);
      return {
        success: false,
        message: '獲取掃描歷史時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 搜索掃描歷史
   */
  async searchScanHistory(query: string, filters?: unknown): Promise<any> {
    try {
      logger.info('搜索掃描歷史:', { query, filters });

      const params = new URLSearchParams({ query });
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const response = await api.get(`${this.baseUrl}/search?${params}`);

      if (response.success) {
        logger.info('掃描歷史搜索成功:', {
          count: (response.data as any)?.records?.length,
        });
        return {
          success: true,
          data: response.data,
          message: '掃描歷史搜索成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('搜索掃描歷史失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '搜索掃描歷史失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('搜索掃描歷史時發生錯誤:', error);
      return {
        success: false,
        message: '搜索掃描歷史時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取服務狀態
   */
  async getServiceStats(): Promise<any> {
    try {
      logger.info('獲取掃描歷史服務狀態');

      const response = await api.get(`${this.baseUrl}/health`);

      return {
        success: true,
        data: {
          service: 'scan-history',
          status: response.success ? 'healthy' : 'unhealthy',
          timestamp: new Date(),
          endpoints: {
            records: `${this.baseUrl}/records`,
            stats: `${this.baseUrl}/stats/:userId`,
            export: `${this.baseUrl}/export/:userId`,
            search: `${this.baseUrl}/search/:userId`,
          },
        },
        message: '掃描歷史服務狀態獲取成功',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('獲取掃描歷史服務狀態時發生錯誤:', error);
      return {
        success: false,
        message: '獲取掃描歷史服務狀態時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 批量刪除記錄（別名方法）
   */
  async deleteMultipleRecords(recordIds: string[]): Promise<any> {
    return this.deleteMultipleScanRecords('', recordIds);
  }

  /**
   * 切換收藏狀態
   */
  async toggleFavorite(recordId: string): Promise<any> {
    try {
      logger.info('切換收藏狀態:', { recordId });

      const response = await api.put(
        `${this.baseUrl}/records/${recordId}/favorite`
      );

      if (response.success) {
        logger.info('收藏狀態切換成功');
        return {
          success: true,
          data: response.data,
          message: '收藏狀態切換成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('切換收藏狀態失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '切換收藏狀態失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('切換收藏狀態時發生錯誤:', error);
      return {
        success: false,
        message: '切換收藏狀態時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 添加筆記
   */
  async addNote(recordId: string, note: string): Promise<any> {
    try {
      logger.info('添加筆記:', { recordId, note });

      const response = await api.post(
        `${this.baseUrl}/records/${recordId}/notes`,
        { note }
      );

      if (response.success) {
        logger.info('筆記添加成功');
        return {
          success: true,
          data: response.data,
          message: '筆記添加成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('添加筆記失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '添加筆記失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('添加筆記時發生錯誤:', error);
      return {
        success: false,
        message: '添加筆記時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 添加標籤
   */
  async addTags(recordId: string, tags: string[]): Promise<any> {
    try {
      logger.info('添加標籤:', { recordId, tags });

      const response = await api.post(
        `${this.baseUrl}/records/${recordId}/tags`,
        { tags }
      );

      if (response.success) {
        logger.info('標籤添加成功');
        return {
          success: true,
          data: response.data,
          message: '標籤添加成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('添加標籤失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '添加標籤失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('添加標籤時發生錯誤:', error);
      return {
        success: false,
        message: '添加標籤時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取掃描統計（別名方法）
   */
  async getScanStatistics(): Promise<any> {
    return this.getScanStats('', '1m');
  }
}

export const scanHistoryService = new ScanHistoryService();
