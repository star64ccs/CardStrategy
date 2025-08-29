import { logger } from '../../../core/utils/logger';
import type {
  ReportRequest,
  ReportResponse,
  ReportRecord,
  Warning,
  BlacklistEntry,
  CommunityWarning,
  ReportStats,
  ReportServiceConfig,
  ReportQueryParams,
  ReportNotification,
  ReportAuditLog,
} from '../types/reporting';
import {
  ReportConfig,
  ReportFilter,
  ReportExport,
  ReportType,
  ReportSeverity,
  ReportStatus,
  WarningType,
  BlacklistType,
  EvidenceItem,
} from '../types/reporting';

/**
 * 假卡回報服務
 * 負責處理假卡舉報、社區警告、黑名單管理等功能
 */
export class FakeCardReportingService {
  private static instance: FakeCardReportingService;
  private isInitialized = false;
  private config: ReportServiceConfig;
  private readonly reports: Map<string, ReportRecord> = new Map();
  private readonly warnings: Map<string, Warning> = new Map();
  private readonly blacklist: Map<string, BlacklistEntry> = new Map();
  private readonly communityWarnings: Map<string, CommunityWarning> = new Map();
  private readonly notifications: Map<string, ReportNotification> = new Map();
  private readonly auditLogs: Map<string, ReportAuditLog> = new Map();

  private constructor() {
    this.config = this.getDefaultConfig();
  }

  /**
   * 獲取服務實例（單例模式）
   */
  public static getInstance(): FakeCardReportingService {
    if (!FakeCardReportingService.instance) {
      FakeCardReportingService.instance = new FakeCardReportingService();
    }
    return FakeCardReportingService.instance;
  }

  /**
   * 初始化服務
   */
  public async initialize(
    config?: Partial<ReportServiceConfig>
  ): Promise<boolean> {
    if (this.isInitialized) {
      logger.warn('FakeCardReportingService 已經初始化');
      return true;
    }

    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // 初始化默認數據
      await this.initializeDefaultData();

      this.isInitialized = true;
      logger.info('FakeCardReportingService 初始化成功');
      return true;
    } catch (error) {
      logger.error('FakeCardReportingService 初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 創建假卡舉報
   */
  public async createReport(
    reportData: Omit<ReportRequest, 'id' | 'timestamp'>
  ): Promise<{
    success: boolean;
    reportId?: string;
    status?: ReportStatus;
    error?: string;
  }> {
    try {
      // 驗證必填字段
      if (
        !reportData.title ||
        !reportData.description ||
        !reportData.reportType ||
        !reportData.severity
      ) {
        return { success: false, error: '缺少必填字段' };
      }

      // 驗證報告類型
      if (!Object.values(ReportType).includes(reportData.reportType)) {
        return { success: false, error: '無效的報告類型' };
      }

      // 驗證嚴重程度
      if (!Object.values(ReportSeverity).includes(reportData.severity)) {
        return { success: false, error: '無效的嚴重程度' };
      }

      // 驗證郵箱格式
      if (
        reportData.contactInfo &&
        !this.isValidEmail(reportData.contactInfo)
      ) {
        return { success: false, error: '無效的郵箱格式' };
      }

      const _reportId = this.generateId();
      const _timestamp = new Date();

      const report: ReportRequest = {
        ...reportData,
        id: reportId,
        timestamp,
      };

      const response: ReportResponse = {
        id: this.generateId(),
        reportId,
        status: ReportStatus.PENDING,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      const record: ReportRecord = {
        id: reportId,
        report,
        response,
        warnings: [],
        blacklistEntries: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      this.reports.set(reportId, record);
      await this.addAuditLog(
        reportId,
        'CREATED',
        reportData.reporterId || 'anonymous',
        '舉報創建',
        undefined,
        report
      );

      // 檢查是否需要自動處理
      await this.checkAutoModeration(record);

      logger.info(`假卡舉報創建成功: ${reportId}`);
      return { success: true, reportId, status: ReportStatus.PENDING };
    } catch (error) {
      logger.error('創建假卡舉報失敗:', error);
      return { success: false, error: '創建失敗' };
    }
  }

  /**
   * 獲取舉報記錄
   */
  public async getReport(reportId: string): Promise<ReportRecord | null> {
    try {
      const _record = this.reports.get(reportId);
      if (!record) {
        logger.warn(`舉報記錄不存在: ${reportId}`);
        return null;
      }
      return record;
    } catch (error) {
      logger.error('獲取舉報記錄失敗:', error);
      throw error;
    }
  }

  /**
   * 更新舉報狀態
   */
  public async updateReportStatus(
    reportId: string,
    status: ReportStatus,
    userId?: string,
    notes?: string,
    actionTaken?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const _record = this.reports.get(reportId);
      if (!record) {
        logger.warn(`舉報記錄不存在: ${reportId}`);
        return { success: false, error: '舉報記錄不存在' };
      }

      const _oldStatus = record.response.status;
      record.response.status = status;
      record.response.updatedAt = new Date();
      record.response.reviewNotes = notes;
      record.response.actionTaken = actionTaken;

      if (status === ReportStatus.RESOLVED) {
        record.response.resolvedAt = new Date();
      } else if (status === ReportStatus.CLOSED) {
        record.response.closedAt = new Date();
      }

      record.updatedAt = new Date();

      await this.addAuditLog(
        reportId,
        'STATUS_CHANGED',
        userId || 'system',
        '狀態更新',
        oldStatus,
        status
      );

      // 根據狀態變化執行相應操作
      await this.handleStatusChange(
        record,
        oldStatus,
        status,
        userId || 'system'
      );

      logger.info(`舉報狀態更新成功: ${reportId} -> ${status}`);
      return { success: true };
    } catch (error) {
      logger.error('更新舉報狀態失敗:', error);
      return { success: false, error: '更新失敗' };
    }
  }

  /**
   * 創建警告
   */
  public async createWarning(
    warningData: Omit<Warning, 'id' | 'createdAt'>
  ): Promise<{ success: boolean; warningId?: string; error?: string }> {
    try {
      // 驗證必填字段
      if (
        !warningData.title ||
        !warningData.message ||
        !warningData.targetId ||
        !warningData.severity
      ) {
        return { success: false, error: '缺少必填字段' };
      }

      const _warningId = this.generateId();
      const _timestamp = new Date();

      const warning: Warning = {
        ...warningData,
        id: warningId,
        createdAt: timestamp,
      };

      this.warnings.set(warningId, warning);

      // 如果警告與舉報相關，添加到舉報記錄中
      if (warningData.targetType === 'USER') {
        for (const record of this.reports.values()) {
          if (record.report.reportedUserId === warningData.targetId) {
            record.warnings.push(warning);
            record.updatedAt = new Date();
            break;
          }
        }
      }

      await this.createNotification({
        type: 'WARNING_ISSUED',
        targetUserId: warningData.targetId,
        title: warningData.title,
        message: warningData.message,
        data: { warningId, severity: warningData.severity },
      });

      logger.info(`警告創建成功: ${warningId}`);
      return { success: true, warningId };
    } catch (error) {
      logger.error('創建警告失敗:', error);
      return { success: false, error: '創建失敗' };
    }
  }

  /**
   * 添加到黑名單
   */
  public async addToBlacklist(
    blacklistData: Omit<BlacklistEntry, 'id' | 'createdAt'>
  ): Promise<{ success: boolean; blacklistId?: string; error?: string }> {
    try {
      // 驗證必填字段
      if (
        !blacklistData.targetId ||
        !blacklistData.reason ||
        !blacklistData.severity
      ) {
        return { success: false, error: '缺少必填字段' };
      }

      const _blacklistId = this.generateId();
      const _timestamp = new Date();

      const blacklistEntry: BlacklistEntry = {
        ...blacklistData,
        id: blacklistId,
        createdAt: timestamp,
      };

      this.blacklist.set(blacklistId, blacklistEntry);

      // 如果黑名單條目與舉報相關，添加到舉報記錄中
      if (blacklistData.type === BlacklistType.USER) {
        for (const record of this.reports.values()) {
          if (record.report.reportedUserId === blacklistData.targetId) {
            record.blacklistEntries.push(blacklistEntry);
            record.updatedAt = new Date();
            break;
          }
        }
      }

      await this.createNotification({
        type: 'BLACKLIST_ADDED',
        targetUserId: blacklistData.targetId,
        title: '黑名單通知',
        message: `您已被添加到黑名單，原因: ${blacklistData.reason}`,
        data: {
          blacklistId,
          reason: blacklistData.reason,
          severity: blacklistData.severity,
        },
      });

      logger.info(`黑名單條目添加成功: ${blacklistId}`);
      return { success: true, blacklistId };
    } catch (error) {
      logger.error('添加到黑名單失敗:', error);
      return { success: false, error: '添加失敗' };
    }
  }

  /**
   * 創建社區警告
   */
  public async createCommunityWarning(
    warningData: Omit<
      CommunityWarning,
      'id' | 'createdAt' | 'acknowledgedCount' | 'dismissedCount'
    >
  ): Promise<{ success: boolean; warningId?: string; error?: string }> {
    try {
      // 驗證必填字段
      if (!warningData.title || !warningData.message || !warningData.severity) {
        return { success: false, error: '缺少必填字段' };
      }

      const _warningId = this.generateId();
      const _timestamp = new Date();

      const communityWarning: CommunityWarning = {
        ...warningData,
        id: warningId,
        createdAt: timestamp,
        acknowledgedCount: 0,
        dismissedCount: 0,
      };

      this.communityWarnings.set(warningId, communityWarning);

      logger.info(`社區警告創建成功: ${warningId}`);
      return { success: true, warningId };
    } catch (error) {
      logger.error('創建社區警告失敗:', error);
      return { success: false, error: '創建失敗' };
    }
  }

  /**
   * 獲取舉報統計
   */
  public async getReportStats(): Promise<ReportStats> {
    try {
      const _reports = Array.from(this.reports.values());
      const _totalReports = reports.length;
      const _pendingReports = reports.filter(
        r => r.response.status === ReportStatus.PENDING
      ).length;
      const _resolvedReports = reports.filter(
        r => r.response.status === ReportStatus.RESOLVED
      ).length;
      const _rejectedReports = reports.filter(
        r => r.response.status === ReportStatus.REJECTED
      ).length;

      // 計算平均解決時間
      const _resolvedReportsWithTime = reports.filter(
        r => r.response.resolvedAt
      );
      const _averageResolutionTime =
        resolvedReportsWithTime.length > 0
          ? resolvedReportsWithTime.reduce((sum, r) => {
              const _resolutionTime =
                r.response.resolvedAt.getTime() - r.createdAt.getTime();
              return sum + resolutionTime;
            }, 0) /
            resolvedReportsWithTime.length /
            (1000 * 60 * 60) // 轉換為小時
          : 0;

      // 按類型統計
      const reportsByType: Record<ReportType, number> = {
        [ReportType.FAKE_CARD]: 0,
        [ReportType.COUNTERFEIT]: 0,
        [ReportType.REPRINT]: 0,
        [ReportType.ALTERED]: 0,
        [ReportType.STOLEN]: 0,
        [ReportType.SCAM]: 0,
        [ReportType.OTHER]: 0,
      };

      reports.forEach(r => {
        reportsByType[r.report.reportType]++;
      });

      // 按嚴重性統計
      const reportsBySeverity: Record<ReportSeverity, number> = {
        [ReportSeverity.LOW]: 0,
        [ReportSeverity.MEDIUM]: 0,
        [ReportSeverity.HIGH]: 0,
        [ReportSeverity.CRITICAL]: 0,
      };

      reports.forEach(r => {
        reportsBySeverity[r.report.severity]++;
      });

      // 按狀態統計
      const reportsByStatus: Record<ReportStatus, number> = {
        [ReportStatus.PENDING]: 0,
        [ReportStatus.UNDER_REVIEW]: 0,
        [ReportStatus.APPROVED]: 0,
        [ReportStatus.REJECTED]: 0,
        [ReportStatus.RESOLVED]: 0,
        [ReportStatus.CLOSED]: 0,
      };

      reports.forEach(r => {
        reportsByStatus[r.response.status]++;
      });

      // 統計舉報者
      const _reporterStats = new Map<string, { count: number; valid: number }>();
      reports.forEach(r => {
        const { reporterId } = r.report;
        const _current = reporterStats.get(reporterId) || { count: 0, valid: 0 };
        current.count++;
        if (
          r.response.status === ReportStatus.APPROVED ||
          r.response.status === ReportStatus.RESOLVED
        ) {
          current.valid++;
        }
        reporterStats.set(reporterId, current);
      });

      const _topReporters = Array.from(reporterStats.entries())
        .map(([userId, stats]) => ({
          userId,
          username: `User_${userId ? userId.slice(-4) : '0000'}`,
          reportCount: stats.count,
          validReports: stats.valid,
        }))
        .sort((a, b) => b.reportCount - a.reportCount)
        .slice(0, 10);

      // 統計被舉報者
      const _reportedStats = new Map<
        string,
        { count: number; resolved: number }
      >();
      reports.forEach(r => {
        if (r.report.reportedUserId) {
          const _reportedId = r.report.reportedUserId;
          const _current = reportedStats.get(reportedId) || {
            count: 0,
            resolved: 0,
          };
          current.count++;
          if (r.response.status === ReportStatus.RESOLVED) {
            current.resolved++;
          }
          reportedStats.set(reportedId, current);
        }
      });

      const _topReportedUsers = Array.from(reportedStats.entries())
        .map(([userId, stats]) => ({
          userId,
          username: `User_${userId ? userId.slice(-4) : '0000'}`,
          reportCount: stats.count,
          resolvedReports: stats.resolved,
        }))
        .sort((a, b) => b.reportCount - a.reportCount)
        .slice(0, 10);

      return {
        totalReports,
        pendingReports,
        resolvedReports,
        rejectedReports,
        averageResolutionTime,
        reportsByType,
        reportsBySeverity,
        reportsByStatus,
        topReporters,
        topReportedUsers,
      };
    } catch (error) {
      logger.error('獲取舉報統計失敗:', error);
      throw error;
    }
  }

  /**
   * 查詢舉報記錄
   */
  public async queryReports(params: ReportQueryParams): Promise<{
    success: boolean;
    reports: ReportRecord[];
    total: number;
    error?: string;
  }> {
    try {
      let reports = Array.from(this.reports.values());

      // 應用過濾器
      if (params.status && params.status.length > 0) {
        reports = reports.filter(r =>
          params.status.includes(r.response.status)
        );
      }

      if (params.type && params.type.length > 0) {
        reports = reports.filter(r =>
          params.type.includes(r.report.reportType)
        );
      }

      if (params.severity && params.severity.length > 0) {
        reports = reports.filter(r =>
          params.severity.includes(r.report.severity)
        );
      }

      if (params.reporterId) {
        reports = reports.filter(
          r => r.report.reporterId === params.reporterId
        );
      }

      if (params.reportedUserId) {
        reports = reports.filter(
          r => r.report.reportedUserId === params.reportedUserId
        );
      }

      if (params.dateFrom) {
        reports = reports.filter(r => r.createdAt >= params.dateFrom);
      }

      if (params.dateTo) {
        reports = reports.filter(r => r.createdAt <= params.dateTo);
      }

      // 排序
      if (params.sortBy) {
        reports.sort((a, b) => {
          let aValue: unknown, bValue: unknown;

          switch (params.sortBy) {
            case 'createdAt':
              aValue = a.createdAt;
              bValue = b.createdAt;
              break;
            case 'updatedAt':
              aValue = a.updatedAt;
              bValue = b.updatedAt;
              break;
            case 'severity':
              aValue = a.report.severity;
              bValue = b.report.severity;
              break;
            case 'status':
              aValue = a.response.status;
              bValue = b.response.status;
              break;
            default:
              aValue = a.createdAt;
              bValue = b.createdAt;
          }

          if (params.sortOrder === 'DESC') {
            return bValue > aValue ? 1 : -1;
          } else {
            return aValue > bValue ? 1 : -1;
          }
        });
      }

      // 分頁
      const _total = reports.length;
      const _offset = params.offset || 0;
      const _limit = params.limit || 50;
      reports = reports.slice(offset, offset + limit);

      return { success: true, reports, total };
    } catch (error) {
      logger.error('查詢舉報記錄失敗:', error);
      return { success: false, reports: [], total: 0, error: '查詢失敗' };
    }
  }

  /**
   * 獲取用戶的警告
   */
  public async getUserWarnings(userId: string): Promise<Warning[]> {
    try {
      const _userWarnings = Array.from(this.warnings.values()).filter(
        w => w.targetId === userId && w.isActive
      );

      return userWarnings;
    } catch (error) {
      logger.error('獲取用戶警告失敗:', error);
      throw error;
    }
  }

  /**
   * 檢查用戶是否在黑名單中
   */
  public async isUserBlacklisted(userId: string): Promise<boolean> {
    try {
      const _blacklistEntry = Array.from(this.blacklist.values()).find(
        b => b.targetId === userId && b.isActive
      );

      return !!blacklistEntry;
    } catch (error) {
      logger.error('檢查用戶黑名單狀態失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取活躍的社區警告
   */
  public async getActiveCommunityWarnings(): Promise<CommunityWarning[]> {
    try {
      const _now = new Date();
      const _activeWarnings = Array.from(this.communityWarnings.values()).filter(
        w =>
          w.isActive &&
          w.displayFrom <= now &&
          (!w.displayUntil || w.displayUntil > now)
      );

      return activeWarnings;
    } catch (error) {
      logger.error('獲取活躍社區警告失敗:', error);
      throw error;
    }
  }

  /**
   * 創建通知
   */
  private async createNotification(
    notificationData: Omit<ReportNotification, 'id' | 'createdAt' | 'isRead'>
  ): Promise<ReportNotification> {
    try {
      const _notificationId = this.generateId();
      const _timestamp = new Date();

      const notification: ReportNotification = {
        ...notificationData,
        id: notificationId,
        createdAt: timestamp,
        isRead: false,
      };

      this.notifications.set(notificationId, notification);

      return notification;
    } catch (error) {
      logger.error('創建通知失敗:', error);
      throw error;
    }
  }

  /**
   * 添加審核日誌
   */
  private async addAuditLog(
    reportId: string,
    action: ReportAuditLog['action'],
    userId: string,
    notes?: string,
    oldValue?: unknown,
    newValue?: unknown
  ): Promise<void> {
    try {
      const _logId = this.generateId();
      const _timestamp = new Date();

      const auditLog: ReportAuditLog = {
        id: logId,
        reportId,
        action,
        userId,
        username: `User_${userId.slice(-4)}`,
        oldValue,
        newValue,
        notes,
        timestamp,
        ipAddress: '127.0.0.1',
        userAgent: 'CardStrategy-App',
      };

      this.auditLogs.set(logId, auditLog);
    } catch (error) {
      logger.error('添加審核日誌失敗:', error);
    }
  }

  /**
   * 檢查自動審核
   */
  private async checkAutoModeration(record: ReportRecord): Promise<void> {
    try {
      if (!this.config.autoModerationEnabled) {
        return;
      }

      // 檢查證據數量
      if (
        record.report.evidence.length >= this.config.config.autoApproveThreshold
      ) {
        await this.updateReportStatus(
          record.id,
          ReportStatus.APPROVED,
          'system',
          '自動審核：證據充分',
          '自動批准'
        );
      }
    } catch (error) {
      logger.error('自動審核檢查失敗:', error);
    }
  }

  /**
   * 處理狀態變化
   */
  private async handleStatusChange(
    record: ReportRecord,
    oldStatus: ReportStatus,
    newStatus: ReportStatus,
    userId: string
  ): Promise<void> {
    try {
      // 如果狀態變為已批准，檢查是否需要發出警告或加入黑名單
      if (
        newStatus === ReportStatus.APPROVED &&
        oldStatus !== ReportStatus.APPROVED
      ) {
        await this.handleApprovedReport(record, userId);
      }

      // 如果狀態變為已解決，發送通知
      if (
        newStatus === ReportStatus.RESOLVED &&
        oldStatus !== ReportStatus.RESOLVED
      ) {
        await this.createNotification({
          type: 'REPORT_RESOLVED',
          targetUserId: record.report.reporterId,
          title: '舉報已解決',
          message: `您的舉報 "${record.report.title}" 已解決`,
          data: { reportId: record.id, resolution: record.response.resolution },
        });
      }
    } catch (error) {
      logger.error('處理狀態變化失敗:', error);
    }
  }

  /**
   * 處理已批准的舉報
   */
  private async handleApprovedReport(
    record: ReportRecord,
    userId: string
  ): Promise<void> {
    try {
      if (!record.report.reportedUserId) {
        return;
      }

      // 檢查該用戶的舉報數量
      const _userReports = Array.from(this.reports.values()).filter(
        r =>
          r.report.reportedUserId === record.report.reportedUserId &&
          (r.response.status === ReportStatus.APPROVED ||
            r.response.status === ReportStatus.RESOLVED)
      );

      // 如果達到警告閾值，發出警告
      if (userReports.length >= this.config.config.warningThreshold) {
        await this.createWarning({
          type: WarningType.SELLER_WARNING,
          targetId: record.report.reportedUserId,
          targetType: 'SELLER',
          title: '多次違規警告',
          message: '您已被多次舉報違規行為，請注意遵守平台規則',
          severity: ReportSeverity.HIGH,
          isActive: true,
          createdBy: userId,
        });
      }

      // 如果達到黑名單閾值，加入黑名單
      if (userReports.length >= this.config.config.blacklistThreshold) {
        await this.addToBlacklist({
          type: BlacklistType.USER,
          targetId: record.report.reportedUserId,
          targetValue: record.report.reportedUserId,
          reason: '多次違規行為',
          severity: ReportSeverity.CRITICAL,
          isActive: true,
          createdBy: userId,
        });
      }
    } catch (error) {
      logger.error('處理已批准舉報失敗:', error);
    }
  }

  /**
   * 獲取默認配置
   */
  private getDefaultConfig(): ReportServiceConfig {
    return {
      enabled: true,
      config: {
        autoApproveThreshold: 3,
        manualReviewThreshold: 1,
        warningThreshold: 2,
        blacklistThreshold: 5,
        maxReportsPerUser: 10,
        maxReportsPerDay: 5,
        reportExpirationDays: 365,
        warningExpirationDays: 30,
        blacklistExpirationDays: 90,
        enableAnonymousReports: true,
        requireEvidence: true,
        minEvidenceCount: 1,
        maxEvidenceSize: 10,
        allowedEvidenceTypes: [
          'image/jpeg',
          'image/png',
          'image/webp',
          'video/mp4',
          'application/pdf',
        ],
      },
      moderators: [],
      admins: [],
      autoModerationEnabled: true,
      aiModerationEnabled: false,
      notificationEnabled: true,
      emailNotifications: true,
      pushNotifications: true,
      retentionDays: 2555, // 7年
      backupEnabled: true,
    };
  }

  /**
   * 初始化默認數據
   */
  private async initializeDefaultData(): Promise<void> {
    try {
      // 創建一些示例舉報
      const _sampleReport = await this.createReport({
        reporterId: 'user_001',
        reportedUserId: 'user_002',
        cardId: 'card_001',
        reportType: ReportType.FAKE_CARD,
        severity: ReportSeverity.HIGH,
        title: '發現假卡',
        description: '用戶 user_002 銷售的卡牌疑似假卡',
        evidence: [
          {
            id: 'evidence_001',
            type: 'IMAGE',
            url: 'https://example.com/fake-card-image.jpg',
            filename: 'fake-card.jpg',
            size: 1024000,
            mimeType: 'image/jpeg',
            description: '假卡正面照片',
            timestamp: new Date(),
          },
        ],
        isAnonymous: false,
        priority: 'HIGH',
      });

      // 創建示例警告
      await this.createWarning({
        type: WarningType.SELLER_WARNING,
        targetId: 'user_002',
        targetType: 'SELLER',
        title: '假卡銷售警告',
        message: '您被舉報銷售假卡，請立即停止此類行為',
        severity: ReportSeverity.HIGH,
        isActive: true,
        createdBy: 'moderator_001',
      });

      // 創建示例社區警告
      await this.createCommunityWarning({
        title: '假卡防範提醒',
        message: '請注意防範假卡，購買前務必仔細檢查',
        severity: ReportSeverity.MEDIUM,
        targetAudience: 'ALL',
        isActive: true,
        displayFrom: new Date(),
        createdBy: 'admin_001',
      });

      logger.info('默認數據初始化完成');
    } catch (error) {
      logger.error('初始化默認數據失敗:', error);
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 驗證郵箱格式
   */
  private isValidEmail(email: string): boolean {
    const _emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 銷毀服務
   */
  public async destroy(): Promise<boolean> {
    try {
      this.reports.clear();
      this.warnings.clear();
      this.blacklist.clear();
      this.communityWarnings.clear();
      this.notifications.clear();
      this.auditLogs.clear();
      this.isInitialized = false;
      logger.info('FakeCardReportingService 已銷毀');
      return true;
    } catch (error) {
      logger.error('銷毀 FakeCardReportingService 失敗:', error);
      return false;
    }
  }
}
