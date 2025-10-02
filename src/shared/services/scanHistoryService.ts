import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * 掃描Record
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
 * 掃描Statistics
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
 * Create掃描RecordRequest
 */
export interface CreateScanRecordRequest {
  cardId?: string;
  cardName?: string;
  imageUrl: string;
  scanType: ScanRecord['scanType'];
  metadata?: Partial<ScanRecord['metadata']>;
}

/**
 * Update掃描RecordRequest
 */
export interface UpdateScanRecordRequest {
  status?: ScanRecord['status'];
  confidence?: number;
  results?: unknown;
  metadata?: Partial<ScanRecord['metadata']>;
}

/**
 * 掃描歷史Service
 */
export class ScanHistoryService {
  private readonly baseUrl = '/api/scan-history';

  /**
   * Create掃描Record
   */
  async createScanRecord(
    userId: string,
    data: CreateScanRecordRequest
  ): Promise<any> {
    try {
      logger.info('創建掃描記錄:', { userId, scanType: data.scanType });

      const _response = await api.post(`${this.baseUrl}/records`, {
        userId,
        ...data,
      });

      if (response.success) {
        logger.info('掃描記錄CreateSuccess:', { id: (response.data as any)?.id });
        return {
          success: true,
          data: response.data,
          message: '掃描記錄CreateSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Create掃描記錄Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Create掃描記錄Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Create掃描記錄時發生Error:', error);
      return {
        success: false,
        message: 'Create掃描記錄時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetUser掃描RecordList
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

      const _params = new URLSearchParams();
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.scanType) params.append('scanType', options.scanType);
      if (options?.status) params.append('status', options.status);
      if (options?.startDate)
        params.append('startDate', options.startDate.toISOString());
      if (options?.endDate)
        params.append('endDate', options.endDate.toISOString());

      const _response = await api.get(
        `${this.baseUrl}/records/user/${userId}?${params}`
      );

      if (response.success) {
        logger.info('用戶掃描記錄列表GetSuccess:', {
          count: (response.data as any)?.records?.length,
        });
        return {
          success: true,
          data: response.data,
          message: '用戶掃描記錄列表GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get用戶掃描記錄列表Failed:', {
          message: response.message,
        });
        return {
          success: false,
          message: response.message || 'Get用戶掃描記錄列表Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get用戶掃描記錄列表時發生Error:', error);
      return {
        success: false,
        message: 'Get用戶掃描記錄列表時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get掃描Record詳情
   */
  async getScanRecord(recordId: string): Promise<any> {
    try {
      logger.info('獲取掃描記錄詳情:', { recordId });

      const _response = await api.get(`${this.baseUrl}/records/${recordId}`);

      if (response.success) {
        logger.info('掃描記錄詳情GetSuccess:', {
          id: (response.data as any)?.id,
        });
        return {
          success: true,
          data: response.data,
          message: '掃描記錄詳情GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get掃描記錄詳情Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get掃描記錄詳情Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get掃描記錄詳情時發生Error:', error);
      return {
        success: false,
        message: 'Get掃描記錄詳情時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Update掃描Record
   */
  async updateScanRecord(
    recordId: string,
    data: UpdateScanRecordRequest
  ): Promise<any> {
    try {
      logger.info('更新掃描記錄:', { recordId, updates: data });

      const _response = await api.put(
        `${this.baseUrl}/records/${recordId}`,
        data
      );

      if (response.success) {
        logger.info('掃描記錄UpdateSuccess:', { recordId });
        return {
          success: true,
          data: response.data,
          message: '掃描記錄UpdateSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Update掃描記錄Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Update掃描記錄Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Update掃描記錄時發生Error:', error);
      return {
        success: false,
        message: 'Update掃描記錄時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Delete掃描Record
   */
  async deleteScanRecord(recordId: string): Promise<any> {
    try {
      logger.info('刪除掃描記錄:', { recordId });

      const _response = await api.delete(`${this.baseUrl}/records/${recordId}`);

      if (response.success) {
        logger.info('掃描記錄DeleteSuccess:', { recordId });
        return {
          success: true,
          message: '掃描記錄DeleteSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Delete掃描記錄Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Delete掃描記錄Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Delete掃描記錄時發生Error:', error);
      return {
        success: false,
        message: 'Delete掃描記錄時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * BatchDelete掃描Record
   */
  async deleteMultipleScanRecords(
    userId: string,
    recordIds: string[]
  ): Promise<any> {
    try {
      logger.info('批量刪除掃描記錄:', { userId, count: recordIds.length });

      const _response = await api.delete(`${this.baseUrl}/records/batch`, {
        data: { userId, recordIds },
      });

      if (response.success) {
        logger.info('批量Delete掃描記錄Success:', {
          deletedCount: (response.data as any)?.deletedCount,
        });
        return {
          success: true,
          data: response.data,
          message: '批量Delete掃描記錄Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('批量Delete掃描記錄Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '批量Delete掃描記錄Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('批量Delete掃描記錄時發生Error:', error);
      return {
        success: false,
        message: '批量Delete掃描記錄時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get掃描Statistics
   */
  async getScanStats(
    userId: string,
    period: '1d' | '1w' | '1m' | '3m' | '6m' | '1y' = '1m'
  ): Promise<any> {
    try {
      logger.info('獲取掃描統計:', { userId, period });

      const _response = await api.get(
        `${this.baseUrl}/stats/${userId}?period=${period}`
      );

      if (response.success) {
        logger.info('掃描統計GetSuccess:', { userId });
        return {
          success: true,
          data: response.data,
          message: '掃描統計GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get掃描統計Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get掃描統計Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get掃描統計時發生Error:', error);
      return {
        success: false,
        message: 'Get掃描統計時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Export掃描Record
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

      const _params = new URLSearchParams({ format });
      if (options?.startDate)
        params.append('startDate', options.startDate.toISOString());
      if (options?.endDate)
        params.append('endDate', options.endDate.toISOString());
      if (options?.scanType) params.append('scanType', options.scanType);

      const _response = await api.get(
        `${this.baseUrl}/export/${userId}?${params}`
      );

      if (response.success) {
        logger.info('掃描記錄導出Success:', {
          downloadUrl: (response.data as any)?.downloadUrl,
        });
        return {
          success: true,
          data: response.data,
          message: '掃描記錄導出Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('導出掃描記錄Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '導出掃描記錄Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('導出掃描記錄時發生Error:', error);
      return {
        success: false,
        message: '導出掃描記錄時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Search掃描Record
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

      const _params = new URLSearchParams({ query });
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.scanType) params.append('scanType', options.scanType);

      const _response = await api.get(
        `${this.baseUrl}/search/${userId}?${params}`
      );

      if (response.success) {
        logger.info('掃描記錄搜索Success:', {
          count: (response.data as any)?.records?.length,
        });
        return {
          success: true,
          data: response.data,
          message: '掃描記錄搜索Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('搜索掃描記錄Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '搜索掃描記錄Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('搜索掃描記錄時發生Error:', error);
      return {
        success: false,
        message: '搜索掃描記錄時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get掃描歷史
   */
  async getScanHistory(filters?: unknown): Promise<any> {
    try {
      logger.info('獲取掃描歷史:', { filters });

      let url = `${this.baseUrl}/history`;
      if (filters) {
        const _params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
        url += `?${params}`;
      }

      const _response = await api.get(url);

      if (response.success) {
        logger.info('掃描歷史GetSuccess:', {
          count: (response.data as any)?.records?.length,
        });
        return {
          success: true,
          data: response.data,
          message: '掃描歷史GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get掃描歷史Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get掃描歷史Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get掃描歷史時發生Error:', error);
      return {
        success: false,
        message: 'Get掃描歷史時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Search掃描歷史
   */
  async searchScanHistory(query: string, filters?: unknown): Promise<any> {
    try {
      logger.info('搜索掃描歷史:', { query, filters });

      const _params = new URLSearchParams({ query });
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const _response = await api.get(`${this.baseUrl}/search?${params}`);

      if (response.success) {
        logger.info('掃描歷史搜索Success:', {
          count: (response.data as any)?.records?.length,
        });
        return {
          success: true,
          data: response.data,
          message: '掃描歷史搜索Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('搜索掃描歷史Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '搜索掃描歷史Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('搜索掃描歷史時發生Error:', error);
      return {
        success: false,
        message: '搜索掃描歷史時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetServiceStatus
   */
  async getServiceStats(): Promise<any> {
    try {
      logger.info('Get掃描歷史Service狀態');

      const _response = await api.get(`${this.baseUrl}/health`);

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
        message: '掃描歷史Service狀態GetSuccess',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Get掃描歷史Service狀態時發生Error:', error);
      return {
        success: false,
        message: 'Get掃描歷史Service狀態時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * BatchDeleteRecord（別名Method）
   */
  async deleteMultipleRecords(recordIds: string[]): Promise<any> {
    return this.deleteMultipleScanRecords('', recordIds);
  }

  /**
   * Switch收藏Status
   */
  async toggleFavorite(recordId: string): Promise<any> {
    try {
      logger.info('切換收藏狀態:', { recordId });

      const _response = await api.put(
        `${this.baseUrl}/records/${recordId}/favorite`
      );

      if (response.success) {
        logger.info('收藏狀態切換Success');
        return {
          success: true,
          data: response.data,
          message: '收藏狀態切換Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('切換收藏狀態Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '切換收藏狀態Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('切換收藏狀態時發生Error:', error);
      return {
        success: false,
        message: '切換收藏狀態時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Add筆記
   */
  async addNote(recordId: string, note: string): Promise<any> {
    try {
      logger.info('添加筆記:', { recordId, note });

      const _response = await api.post(
        `${this.baseUrl}/records/${recordId}/notes`,
        { note }
      );

      if (response.success) {
        logger.info('筆記添加Success');
        return {
          success: true,
          data: response.data,
          message: '筆記添加Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('添加筆記Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '添加筆記Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('添加筆記時發生Error:', error);
      return {
        success: false,
        message: '添加筆記時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * AddTag
   */
  async addTags(recordId: string, tags: string[]): Promise<any> {
    try {
      logger.info('添加標籤:', { recordId, tags });

      const _response = await api.post(
        `${this.baseUrl}/records/${recordId}/tags`,
        { tags }
      );

      if (response.success) {
        logger.info('標籤添加Success');
        return {
          success: true,
          data: response.data,
          message: '標籤添加Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('添加標籤Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '添加標籤Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('添加標籤時發生Error:', error);
      return {
        success: false,
        message: '添加標籤時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get掃描Statistics（別名Method）
   */
  async getScanStatistics(): Promise<any> {
    return this.getScanStats('', '1m');
  }
}

export const _scanHistoryService = new ScanHistoryService();
