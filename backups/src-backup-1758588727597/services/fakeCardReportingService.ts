/**
 * 假卡回報服務
 * 提供假卡舉報、警告管理、黑名單管理功能
 */

import { logger } from '../core/utils/logger';
import {
  BlacklistEntityType,
  BlacklistEntry,
  BlacklistStatus,
  FakeCardEvidence,
  FakeCardFilters,
  FakeCardReport,
  FakeCardReportStatus,
  FakeCardReportType,
  FakeCardResolution,
  FakeCardSearchResult,
  FakeCardSeverity,
  FakeCardStats,
  FakeCardWarning,
  ResolutionAction,
  WarningType,
} from '../types/fakeCardReporting';
import { apiService } from './apiService';

export interface CreateReportRequest {
  userId: string;
  cardId?: string;
  reportType: FakeCardReportType;
  severity: FakeCardSeverity;
  description: string;
  evidence: Omit<FakeCardEvidence, 'id' | 'uploadedAt'>[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  sellerInfo?: {
    name?: string;
    platform?: string;
    sellerId?: string;
    contactInfo?: string;
  };
  purchaseInfo?: {
    purchaseDate?: Date;
    price?: number;
    currency?: string;
    paymentMethod?: string;
    platform?: string;
    transactionId?: string;
  };
}

export interface UpdateReportRequest {
  id: string;
  description?: string;
  evidence?: Omit<FakeCardEvidence, 'id' | 'uploadedAt'>[];
  status?: FakeCardReportStatus;
}

export interface CreateWarningRequest {
  userId: string;
  sellerId?: string;
  cardId?: string;
  warningType: WarningType;
  message: string;
  severity: FakeCardSeverity;
  expiresAt?: Date;
  actions: Array<{
    type: string;
    description: string;
  }>;
}

export interface CreateBlacklistRequest {
  entityType: BlacklistEntityType;
  entityId: string;
  entityName: string;
  reason: string;
  severity: FakeCardSeverity;
  evidence: string[];
  addedBy: string;
  expiresAt?: Date;
}

class FakeCardReportingService {
  private static instance: FakeCardReportingService;
  private isInitialized = false;

  public static getInstance(): FakeCardReportingService {
    if (!FakeCardReportingService.instance) {
      FakeCardReportingService.instance = new FakeCardReportingService();
    }
    return FakeCardReportingService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.info('初始化 FakeCardReportingService');
      this.isInitialized = true;
      logger.info('FakeCardReportingService 初始化成功');
    } catch (error) {
      logger.error('FakeCardReportingService 初始化失敗', error);
      throw error;
    }
  }

  /**
   * 創建假卡舉報
   */
  public async createReport(
    request: CreateReportRequest
  ): Promise<FakeCardReport> {
    try {
      logger.info('創建假卡舉報', {
        userId: request.userId,
        reportType: request.reportType,
      });

      const evidenceWithIds = request.evidence.map(evidence => ({
        ...evidence,
        id: `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        uploadedAt: new Date(),
      }));

      const reportData = {
        ...request,
        evidence: evidenceWithIds,
        status: FakeCardReportStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = await apiService.post('/fake-card/reports', reportData);

      if (response.success && response.data) {
        logger.info('假卡舉報創建成功', { reportId: response.data.id });
        return response.data;
      } else {
        throw new Error(response.message || '創建假卡舉報失敗');
      }
    } catch (error) {
      logger.error('創建假卡舉報失敗', error);
      throw error;
    }
  }

  /**
   * 獲取假卡舉報
   */
  public async getReport(reportId: string): Promise<FakeCardReport> {
    try {
      logger.info('獲取假卡舉報', { reportId });

      const response = await apiService.get(`/fake-card/reports/${reportId}`);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '獲取假卡舉報失敗');
      }
    } catch (error) {
      logger.error('獲取假卡舉報失敗', error);
      throw error;
    }
  }

  /**
   * 更新假卡舉報
   */
  public async updateReport(
    request: UpdateReportRequest
  ): Promise<FakeCardReport> {
    try {
      logger.info('更新假卡舉報', { reportId: request.id });

      const updateData = {
        ...request,
        updatedAt: new Date(),
      };

      const response = await apiService.put(
        `/fake-card/reports/${request.id}`,
        updateData
      );

      if (response.success && response.data) {
        logger.info('假卡舉報更新成功', { reportId: request.id });
        return response.data;
      } else {
        throw new Error(response.message || '更新假卡舉報失敗');
      }
    } catch (error) {
      logger.error('更新假卡舉報失敗', error);
      throw error;
    }
  }

  /**
   * 搜索假卡舉報
   */
  public async searchReports(
    filters: FakeCardFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<FakeCardSearchResult> {
    try {
      logger.info('搜索假卡舉報', { filters, page, limit });

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined)
        ),
      });

      const response = await apiService.get(
        `/fake-card/reports?${queryParams}`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '搜索假卡舉報失敗');
      }
    } catch (error) {
      logger.error('搜索假卡舉報失敗', error);
      throw error;
    }
  }

  /**
   * 解決假卡舉報
   */
  public async resolveReport(
    reportId: string,
    resolution: FakeCardResolution,
    resolvedBy: string
  ): Promise<FakeCardReport> {
    try {
      logger.info('解決假卡舉報', { reportId, resolvedBy });

      const resolveData = {
        status: FakeCardReportStatus.RESOLVED,
        resolvedAt: new Date(),
        resolvedBy,
        resolution,
        updatedAt: new Date(),
      };

      const response = await apiService.patch(
        `/fake-card/reports/${reportId}/resolve`,
        resolveData
      );

      if (response.success && response.data) {
        logger.info('假卡舉報解決成功', { reportId });
        return response.data;
      } else {
        throw new Error(response.message || '解決假卡舉報失敗');
      }
    } catch (error) {
      logger.error('解決假卡舉報失敗', error);
      throw error;
    }
  }

  /**
   * 創建警告
   */
  public async createWarning(
    request: CreateWarningRequest
  ): Promise<FakeCardWarning> {
    try {
      logger.info('創建假卡警告', {
        userId: request.userId,
        warningType: request.warningType,
      });

      const warningData = {
        ...request,
        issuedAt: new Date(),
        actions: request.actions.map(action => ({
          ...action,
          completed: false,
        })),
      };

      const response = await apiService.post(
        '/fake-card/warnings',
        warningData
      );

      if (response.success && response.data) {
        logger.info('假卡警告創建成功', { warningId: response.data.id });
        return response.data;
      } else {
        throw new Error(response.message || '創建假卡警告失敗');
      }
    } catch (error) {
      logger.error('創建假卡警告失敗', error);
      throw error;
    }
  }

  /**
   * 獲取用戶警告
   */
  public async getUserWarnings(userId: string): Promise<FakeCardWarning[]> {
    try {
      logger.info('獲取用戶警告', { userId });

      const response = await apiService.get(
        `/fake-card/warnings/user/${userId}`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '獲取用戶警告失敗');
      }
    } catch (error) {
      logger.error('獲取用戶警告失敗', error);
      throw error;
    }
  }

  /**
   * 確認警告
   */
  public async acknowledgeWarning(warningId: string): Promise<FakeCardWarning> {
    try {
      logger.info('確認警告', { warningId });

      const response = await apiService.patch(
        `/fake-card/warnings/${warningId}/acknowledge`
      );

      if (response.success && response.data) {
        logger.info('警告確認成功', { warningId });
        return response.data;
      } else {
        throw new Error(response.message || '確認警告失敗');
      }
    } catch (error) {
      logger.error('確認警告失敗', error);
      throw error;
    }
  }

  /**
   * 創建黑名單條目
   */
  public async createBlacklistEntry(
    request: CreateBlacklistRequest
  ): Promise<BlacklistEntry> {
    try {
      logger.info('創建黑名單條目', {
        entityType: request.entityType,
        entityId: request.entityId,
      });

      const blacklistData = {
        ...request,
        addedAt: new Date(),
        status: BlacklistStatus.ACTIVE,
        appealCount: 0,
      };

      const response = await apiService.post(
        '/fake-card/blacklist',
        blacklistData
      );

      if (response.success && response.data) {
        logger.info('黑名單條目創建成功', { entryId: response.data.id });
        return response.data;
      } else {
        throw new Error(response.message || '創建黑名單條目失敗');
      }
    } catch (error) {
      logger.error('創建黑名單條目失敗', error);
      throw error;
    }
  }

  /**
   * 獲取黑名單條目
   */
  public async getBlacklistEntries(
    entityType?: BlacklistEntityType,
    status?: BlacklistStatus
  ): Promise<BlacklistEntry[]> {
    try {
      logger.info('獲取黑名單條目', { entityType, status });

      const queryParams = new URLSearchParams();
      if (entityType) queryParams.append('entityType', entityType);
      if (status) queryParams.append('status', status);

      const response = await apiService.get(
        `/fake-card/blacklist?${queryParams}`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '獲取黑名單條目失敗');
      }
    } catch (error) {
      logger.error('獲取黑名單條目失敗', error);
      throw error;
    }
  }

  /**
   * 檢查實體是否在黑名單中
   */
  public async checkBlacklist(
    entityId: string,
    entityType: BlacklistEntityType
  ): Promise<boolean> {
    try {
      logger.info('檢查黑名單', { entityId, entityType });

      const response = await apiService.get(
        `/fake-card/blacklist/check/${entityType}/${entityId}`
      );

      if (response.success && response.data !== undefined) {
        return response.data;
      } else {
        throw new Error(response.message || '檢查黑名單失敗');
      }
    } catch (error) {
      logger.error('檢查黑名單失敗', error);
      throw error;
    }
  }

  /**
   * 上訴黑名單條目
   */
  public async appealBlacklistEntry(
    entryId: string,
    reason: string
  ): Promise<BlacklistEntry> {
    try {
      logger.info('上訴黑名單條目', { entryId });

      const appealData = {
        reason,
        appealCount: 1,
        lastAppealAt: new Date(),
        status: BlacklistStatus.APPEALED,
        updatedAt: new Date(),
      };

      const response = await apiService.patch(
        `/fake-card/blacklist/${entryId}/appeal`,
        appealData
      );

      if (response.success && response.data) {
        logger.info('黑名單條目上訴成功', { entryId });
        return response.data;
      } else {
        throw new Error(response.message || '上訴黑名單條目失敗');
      }
    } catch (error) {
      logger.error('上訴黑名單條目失敗', error);
      throw error;
    }
  }

  /**
   * 獲取假卡統計數據
   */
  public async getStats(
    dateRange?: { start: Date; end: Date },
    filters?: Partial<FakeCardFilters>
  ): Promise<FakeCardStats> {
    try {
      logger.info('獲取假卡統計數據', { dateRange, filters });

      const queryParams = new URLSearchParams();
      if (dateRange) {
        queryParams.append('startDate', dateRange.start.toISOString());
        queryParams.append('endDate', dateRange.end.toISOString());
      }
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            queryParams.append(
              key,
              Array.isArray(value) ? value.join(',') : value.toString()
            );
          }
        });
      }

      const response = await apiService.get(`/fake-card/stats?${queryParams}`);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '獲取假卡統計數據失敗');
      }
    } catch (error) {
      logger.error('獲取假卡統計數據失敗', error);
      throw error;
    }
  }

  /**
   * 驗證證據
   */
  public async verifyEvidence(
    evidenceId: string,
    verified: boolean,
    verificationScore?: number
  ): Promise<FakeCardEvidence> {
    try {
      logger.info('驗證證據', { evidenceId, verified, verificationScore });

      const verificationData = {
        verified,
        verificationScore,
        updatedAt: new Date(),
      };

      const response = await apiService.patch(
        `/fake-card/evidence/${evidenceId}/verify`,
        verificationData
      );

      if (response.success && response.data) {
        logger.info('證據驗證成功', { evidenceId });
        return response.data;
      } else {
        throw new Error(response.message || '驗證證據失敗');
      }
    } catch (error) {
      logger.error('驗證證據失敗', error);
      throw error;
    }
  }

  /**
   * 獲取用戶舉報歷史
   */
  public async getUserReportHistory(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<FakeCardSearchResult> {
    try {
      logger.info('獲取用戶舉報歷史', { userId, page, limit });

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await apiService.get(
        `/fake-card/reports/user/${userId}?${queryParams}`
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || '獲取用戶舉報歷史失敗');
      }
    } catch (error) {
      logger.error('獲取用戶舉報歷史失敗', error);
      throw error;
    }
  }

  /**
   * 刪除假卡舉報（僅管理員）
   */
  public async deleteReport(reportId: string): Promise<void> {
    try {
      logger.info('刪除假卡舉報', { reportId });

      const response = await apiService.delete(
        `/fake-card/reports/${reportId}`
      );

      if (response.success) {
        logger.info('假卡舉報刪除成功', { reportId });
      } else {
        throw new Error(response.message || '刪除假卡舉報失敗');
      }
    } catch (error) {
      logger.error('刪除假卡舉報失敗', error);
      throw error;
    }
  }

  /**
   * 批量處理舉報
   */
  public async bulkProcessReports(
    reportIds: string[],
    action: ResolutionAction,
    reason: string,
    processedBy: string
  ): Promise<FakeCardReport[]> {
    try {
      logger.info('批量處理舉報', {
        reportIds: reportIds.length,
        action,
        processedBy,
      });

      const bulkData = {
        reportIds,
        action,
        reason,
        processedBy,
        processedAt: new Date(),
      };

      const response = await apiService.post(
        '/fake-card/reports/bulk-process',
        bulkData
      );

      if (response.success && response.data) {
        logger.info('批量處理舉報成功', {
          processedCount: response.data.length,
        });
        return response.data;
      } else {
        throw new Error(response.message || '批量處理舉報失敗');
      }
    } catch (error) {
      logger.error('批量處理舉報失敗', error);
      throw error;
    }
  }
}

export const fakeCardReportingService = FakeCardReportingService.getInstance();
