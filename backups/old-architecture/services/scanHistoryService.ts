import { apiService, ApiResponse } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';
import { validateInput, validateApiResponse } from '../utils/validationService';
import { z } from 'zod';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// 掃描歷史記錄類型
export interface ScanHistoryItem {
  id: string;
  userId: string;
  cardId?: string;
  cardName?: string;
  cardImage?: string;
  scanType: 'recognition' | 'condition' | 'authenticity' | 'batch';
  scanResult: {
    success: boolean;
    confidence?: number;
    recognizedCard?: any;
    conditionAnalysis?: any;
    authenticityCheck?: any;
    error?: string;
  };
  imageUri: string;
  scanDate: Date;
  processingTime: number;
  metadata: {
    deviceInfo: string;
    appVersion: string;
    scanMethod: string;
    imageQuality: string;
    location?: {
      latitude: number;
      longitude: number;
      accuracy: number;
    };
  };
  tags: string[];
  notes?: string;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 掃描歷史記錄響應類型
export interface ScanHistoryResponse {
  success: boolean;
  message: string;
  data: {
    history: ScanHistoryItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// 掃描統計類型
export interface ScanStatistics {
  totalScans: number;
  successfulScans: number;
  failedScans: number;
  successRate: number;
  averageProcessingTime: number;
  scansByType: {
    recognition: number;
    condition: number;
    authenticity: number;
    batch: number;
  };
  scansByDate: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  mostScannedCards: {
    cardId: string;
    cardName: string;
    scanCount: number;
  }[];
}

// 掃描歷史記錄過濾器
export interface ScanHistoryFilters {
  scanType?: 'recognition' | 'condition' | 'authenticity' | 'batch';
  dateRange?: {
    start: Date;
    end: Date;
  };
  successOnly?: boolean;
  favoriteOnly?: boolean;
  searchQuery?: string;
  sortBy?: 'date' | 'processingTime' | 'confidence';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// 掃描歷史記錄服務類
class ScanHistoryService {
  // 獲取掃描歷史記錄
  async getScanHistory(
    filters: ScanHistoryFilters = {}
  ): Promise<ScanHistoryResponse> {
    try {
      const response = await apiService.get<ScanHistoryResponse['data']>(
        API_ENDPOINTS.SCAN_HISTORY.LIST,
        filters
      );

      return {
        success: response.success,
        message: response.message,
        data: response.data,
      };
    } catch (error: any) {
      logger.error('❌ Get scan history error:', { error: error.message });
      throw error;
    }
  }

  // 獲取單個掃描記錄
  async getScanRecord(recordId: string): Promise<ScanHistoryItem> {
    try {
      if (!recordId || typeof recordId !== 'string') {
        throw new Error('無效的記錄 ID');
      }

      const response = await apiService.get<ScanHistoryItem>(
        API_ENDPOINTS.SCAN_HISTORY.DETAIL(recordId)
      );

      return response.data;
    } catch (error: any) {
      logger.error('❌ Get scan record error:', { error: error.message });
      throw error;
    }
  }

  // 創建掃描記錄
  async createScanRecord(
    scanData: Omit<ScanHistoryItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<ScanHistoryItem> {
    try {
      const response = await apiService.post<ScanHistoryItem>(
        API_ENDPOINTS.SCAN_HISTORY.CREATE,
        scanData
      );

      logger.info('✅ Scan record created:', { recordId: response.data.id });
      return response.data;
    } catch (error: any) {
      logger.error('❌ Create scan record error:', { error: error.message });
      throw error;
    }
  }

  // 更新掃描記錄
  async updateScanRecord(
    recordId: string,
    updates: Partial<ScanHistoryItem>
  ): Promise<ScanHistoryItem> {
    try {
      if (!recordId || typeof recordId !== 'string') {
        throw new Error('無效的記錄 ID');
      }

      const response = await apiService.put<ScanHistoryItem>(
        API_ENDPOINTS.SCAN_HISTORY.UPDATE(recordId),
        updates
      );

      logger.info('✅ Scan record updated:', { recordId });
      return response.data;
    } catch (error: any) {
      logger.error('❌ Update scan record error:', { error: error.message });
      throw error;
    }
  }

  // 刪除掃描記錄
  async deleteScanRecord(recordId: string): Promise<void> {
    try {
      if (!recordId || typeof recordId !== 'string') {
        throw new Error('無效的記錄 ID');
      }

      await apiService.delete(API_ENDPOINTS.SCAN_HISTORY.DELETE(recordId));
      logger.info('✅ Scan record deleted:', { recordId });
    } catch (error: any) {
      logger.error('❌ Delete scan record error:', { error: error.message });
      throw error;
    }
  }

  // 批量刪除掃描記錄
  async deleteMultipleRecords(recordIds: string[]): Promise<void> {
    try {
      if (!Array.isArray(recordIds) || recordIds.length === 0) {
        throw new Error('無效的記錄 ID 列表');
      }

      await apiService.post(API_ENDPOINTS.SCAN_HISTORY.BATCH_DELETE, {
        recordIds,
      });

      logger.info('✅ Multiple scan records deleted:', {
        count: recordIds.length,
      });
    } catch (error: any) {
      logger.error('❌ Delete multiple scan records error:', {
        error: error.message,
      });
      throw error;
    }
  }

  // 標記為收藏/取消收藏
  async toggleFavorite(recordId: string): Promise<ScanHistoryItem> {
    try {
      if (!recordId || typeof recordId !== 'string') {
        throw new Error('無效的記錄 ID');
      }

      const response = await apiService.patch<ScanHistoryItem>(
        API_ENDPOINTS.SCAN_HISTORY.TOGGLE_FAVORITE(recordId)
      );

      logger.info('✅ Scan record favorite toggled:', { recordId });
      return response.data;
    } catch (error: any) {
      logger.error('❌ Toggle favorite error:', { error: error.message });
      throw error;
    }
  }

  // 添加筆記
  async addNote(recordId: string, note: string): Promise<ScanHistoryItem> {
    try {
      if (!recordId || typeof recordId !== 'string') {
        throw new Error('無效的記錄 ID');
      }

      if (!note || typeof note !== 'string') {
        throw new Error('無效的筆記內容');
      }

      const response = await apiService.patch<ScanHistoryItem>(
        API_ENDPOINTS.SCAN_HISTORY.ADD_NOTE(recordId),
        { note }
      );

      logger.info('✅ Note added to scan record:', { recordId });
      return response.data;
    } catch (error: any) {
      logger.error('❌ Add note error:', { error: error.message });
      throw error;
    }
  }

  // 添加標籤
  async addTags(recordId: string, tags: string[]): Promise<ScanHistoryItem> {
    try {
      if (!recordId || typeof recordId !== 'string') {
        throw new Error('無效的記錄 ID');
      }

      if (!Array.isArray(tags) || tags.length === 0) {
        throw new Error('無效的標籤列表');
      }

      const response = await apiService.patch<ScanHistoryItem>(
        API_ENDPOINTS.SCAN_HISTORY.ADD_TAGS(recordId),
        { tags }
      );

      logger.info('✅ Tags added to scan record:', { recordId, tags });
      return response.data;
    } catch (error: any) {
      logger.error('❌ Add tags error:', { error: error.message });
      throw error;
    }
  }

  // 獲取掃描統計
  async getScanStatistics(): Promise<ScanStatistics> {
    try {
      const response = await apiService.get<ScanStatistics>(
        API_ENDPOINTS.SCAN_HISTORY.STATISTICS
      );

      return response.data;
    } catch (error: any) {
      logger.error('❌ Get scan statistics error:', { error: error.message });
      throw error;
    }
  }

  // 導出掃描歷史
  async exportScanHistory(
    format: 'csv' | 'json' | 'pdf',
    filters?: ScanHistoryFilters
  ): Promise<string> {
    try {
      const response = await apiService.post<{ downloadUrl: string }>(
        API_ENDPOINTS.SCAN_HISTORY.EXPORT,
        { format, filters }
      );

      logger.info('✅ Scan history exported:', { format });
      return response.data.downloadUrl;
    } catch (error: any) {
      logger.error('❌ Export scan history error:', { error: error.message });
      throw error;
    }
  }

  // 搜索掃描記錄
  async searchScanHistory(
    query: string,
    filters?: ScanHistoryFilters
  ): Promise<ScanHistoryResponse> {
    try {
      if (!query || typeof query !== 'string') {
        throw new Error('無效的搜索查詢');
      }

      const response = await apiService.get<ScanHistoryResponse['data']>(
        API_ENDPOINTS.SCAN_HISTORY.SEARCH,
        { query, ...filters }
      );

      return {
        success: response.success,
        message: response.message,
        data: response.data,
      };
    } catch (error: any) {
      logger.error('❌ Search scan history error:', { error: error.message });
      throw error;
    }
  }

  // 獲取推薦標籤
  async getRecommendedTags(): Promise<string[]> {
    try {
      const response = await apiService.get<string[]>(
        API_ENDPOINTS.SCAN_HISTORY.RECOMMENDED_TAGS
      );

      return response.data;
    } catch (error: any) {
      logger.error('❌ Get recommended tags error:', { error: error.message });
      throw error;
    }
  }

  // 清理過期記錄
  async cleanupExpiredRecords(
    daysToKeep: number = 30
  ): Promise<{ deletedCount: number }> {
    try {
      const response = await apiService.post<{ deletedCount: number }>(
        API_ENDPOINTS.SCAN_HISTORY.CLEANUP,
        { daysToKeep }
      );

      logger.info('✅ Expired scan records cleaned up:', {
        deletedCount: response.data.deletedCount,
      });
      return response.data;
    } catch (error: any) {
      logger.error('❌ Cleanup expired records error:', {
        error: error.message,
      });
      throw error;
    }
  }
}

// 導出掃描歷史記錄服務實例
export { ScanHistoryService };
export const scanHistoryService = new ScanHistoryService();
