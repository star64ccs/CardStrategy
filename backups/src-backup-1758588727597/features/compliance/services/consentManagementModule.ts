/**
 * 同意管理模組
 * 實現重構計劃任務 1.3: ConsentManagementModule
 * 負責同意收集、驗證、撤銷、更新等核心功能
 */

import { logger } from '../../../core/utils/logger';

// 同意管理類型定義
export interface ConsentPurpose {
  id: string;
  name: string;
  description: string;
  category:
    | 'essential'
    | 'functional'
    | 'analytics'
    | 'marketing'
    | 'third_party';
  mandatory: boolean;
  defaultEnabled: boolean;
  legalBasis: string;
  retentionPeriod: number; // 天數
  dataCategories: string[];
}

export interface ConsentRecord {
  id: string;
  userId: string;
  purposeId: string;
  consentType: 'explicit' | 'implicit' | 'withdrawn';
  status: 'active' | 'expired' | 'withdrawn' | 'invalid';
  grantedAt: Date;
  expiresAt?: Date;
  withdrawnAt?: Date;
  version: string;
  ipAddress: string;
  userAgent: string;
  consentText: string;
  consentMethod: 'web_form' | 'mobile_app' | 'email' | 'phone' | 'in_person';
  evidence: ConsentEvidence;
  auditTrail: ConsentAuditEvent[];
}

export interface ConsentEvidence {
  timestamp: Date;
  method: string;
  location: string;
  deviceInfo: string;
  sessionId: string;
  consentVersion: string;
  dataProcessed: string[];
  thirdParties: string[];
}

export interface ConsentAuditEvent {
  id: string;
  timestamp: Date;
  action: 'granted' | 'withdrawn' | 'updated' | 'expired' | 'invalidated';
  userId: string;
  purposeId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
}

export interface ConsentValidationResult {
  isValid: boolean;
  status: 'valid' | 'expired' | 'withdrawn' | 'invalid' | 'missing';
  errors: string[];
  warnings: string[];
  recommendations: string[];
  lastUpdated: Date;
  nextReviewDate: Date;
}

export interface ConsentWithdrawalRequest {
  id: string;
  userId: string;
  purposeIds: string[];
  reason?: string;
  requestedAt: Date;
  effectiveDate: Date;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  notes: string[];
}

export interface ConsentUpdateRequest {
  id: string;
  userId: string;
  purposeId: string;
  newConsentType: 'explicit' | 'implicit';
  reason: string;
  requestedAt: Date;
  effectiveDate: Date;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  previousConsent: ConsentRecord;
  newConsent: ConsentRecord;
}

export interface ConsentReport {
  id: string;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalConsents: number;
    activeConsents: number;
    withdrawnConsents: number;
    expiredConsents: number;
    consentRate: number; // 百分比
  };
  byPurpose: Record<
    string,
    {
      total: number;
      active: number;
      withdrawn: number;
      expired: number;
      rate: number;
    }
  >;
  byCategory: Record<
    string,
    {
      total: number;
      active: number;
      withdrawn: number;
      expired: number;
      rate: number;
    }
  >;
  generatedAt: Date;
}

export interface ConsentManagementConfig {
  enableConsentCollection: boolean;
  enableConsentValidation: boolean;
  enableConsentWithdrawal: boolean;
  enableConsentUpdates: boolean;
  enableAuditLogging: boolean;
  defaultRetentionPeriod: number;
  consentExpiryDays: number;
  requireExplicitConsent: boolean;
  enableGranularConsent: boolean;
}

export class ConsentManagementModule {
  private static instance: ConsentManagementModule;
  private config: ConsentManagementConfig;
  private readonly purposes: Map<string, ConsentPurpose>;
  private readonly consentRecords: Map<string, ConsentRecord>;
  private isInitialized = false;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.purposes = new Map();
    this.consentRecords = new Map();
  }

  public static getInstance(): ConsentManagementModule {
    if (!ConsentManagementModule.instance) {
      ConsentManagementModule.instance = new ConsentManagementModule();
    }
    return ConsentManagementModule.instance;
  }

  public async initialize(
    config?: Partial<ConsentManagementConfig>
  ): Promise<boolean> {
    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // 初始化同意目的
      await this.initializePurposes();

      this.isInitialized = true;
      logger.info('同意管理模組初始化成功');
      return true;
    } catch (error) {
      logger.error('同意管理模組初始化失敗:', error);
      return false;
    }
  }

  /**
   * 收集同意
   */
  public collectConsent(
    userId: string,
    purposeId: string,
    consentType: 'explicit' | 'implicit',
    evidence: Omit<ConsentEvidence, 'timestamp'>
  ): ConsentRecord {
    try {
      const purpose = this.getPurpose(purposeId);
      if (!purpose) {
        throw new Error(`未找到同意目的: ${purposeId}`);
      }

      const consentRecord = this.createConsentRecord(
        userId,
        purposeId,
        consentType,
        evidence
      );
      this.consentRecords.set(consentRecord.id, consentRecord);

      // 記錄審計事件
      this.logAuditEvent({
        action: 'granted',
        userId,
        purposeId,
        details: { consentType, purposeName: purpose.name },
        ipAddress: '',
        userAgent: '',
      });

      logger.info('同意收集成功', {
        userId,
        purposeId,
        consentType,
        consentId: consentRecord.id,
      });

      return consentRecord;
    } catch (error) {
      logger.error('同意收集失敗:', error);
      throw error;
    }
  }

  /**
   * 驗證同意
   */
  public validateConsent(
    userId: string,
    purposeId: string
  ): ConsentValidationResult {
    try {
      const consentRecord = this.getConsentRecord(userId, purposeId);
      const purpose = this.getPurpose(purposeId);

      if (!consentRecord) {
        return this.createValidationResult('missing', ['未找到有效同意記錄']);
      }

      const validationResult = this.performConsentValidation(
        consentRecord,
        purpose
      );

      logger.info('同意驗證完成', {
        userId,
        purposeId,
        isValid: validationResult.isValid,
        status: validationResult.status,
      });

      return validationResult;
    } catch (error) {
      logger.error('同意驗證失敗:', error);
      throw error;
    }
  }

  /**
   * 撤銷同意
   */
  public withdrawConsent(request: ConsentWithdrawalRequest): boolean {
    try {
      const results: boolean[] = [];

      request.purposeIds.forEach(purposeId => {
        const consentRecord = this.getActiveConsent(request.userId, purposeId);
        if (consentRecord) {
          consentRecord.status = 'withdrawn';
          consentRecord.withdrawnAt = new Date();

          // 記錄審計事件
          this.logAuditEvent({
            action: 'withdrawn',
            userId: request.userId,
            purposeId,
            details: {
              reason: request.reason,
              effectiveDate: request.effectiveDate,
            },
            ipAddress: '',
            userAgent: '',
          });

          results.push(true);
        } else {
          results.push(false);
        }
      });

      const success = results.some(result => result);

      logger.info('同意撤銷處理完成', {
        userId: request.userId,
        purposeIds: request.purposeIds,
        success,
        successCount: results.filter(r => r).length,
      });

      return success;
    } catch (error) {
      logger.error('同意撤銷失敗:', error);
      throw error;
    }
  }

  /**
   * 更新同意
   */
  public updateConsent(request: ConsentUpdateRequest): ConsentRecord {
    try {
      const previousConsent = this.getActiveConsent(
        request.userId,
        request.purposeId
      );
      if (!previousConsent) {
        throw new Error('未找到要更新的同意記錄');
      }

      // 撤銷舊同意
      previousConsent.status = 'withdrawn';
      previousConsent.withdrawnAt = new Date();

      // 創建新同意
      const newEvidence: Omit<ConsentEvidence, 'timestamp'> = {
        method: 'update',
        location: 'web_form',
        deviceInfo: 'updated_consent',
        sessionId: `session_${Date.now()}`,
        consentVersion: request.newConsent.version,
        dataProcessed: [],
        thirdParties: [],
      };

      const newConsent = this.createConsentRecord(
        request.userId,
        request.purposeId,
        request.newConsentType,
        newEvidence
      );

      this.consentRecords.set(newConsent.id, newConsent);

      // 記錄審計事件
      this.logAuditEvent({
        action: 'updated',
        userId: request.userId,
        purposeId: request.purposeId,
        details: {
          previousType: previousConsent.consentType,
          newType: request.newConsentType,
          reason: request.reason,
        },
        ipAddress: '',
        userAgent: '',
      });

      logger.info('同意更新成功', {
        userId: request.userId,
        purposeId: request.purposeId,
        previousType: previousConsent.consentType,
        newType: request.newConsentType,
      });

      return newConsent;
    } catch (error) {
      logger.error('同意更新失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取用戶同意狀態
   */
  public getUserConsentStatus(
    userId: string
  ): Record<string, ConsentValidationResult> {
    try {
      const status: Record<string, ConsentValidationResult> = {};

      this.purposes.forEach((purpose, purposeId) => {
        status[purposeId] = this.validateConsent(userId, purposeId);
      });

      logger.info('用戶同意狀態查詢完成', {
        userId,
        purposeCount: Object.keys(status).length,
      });

      return status;
    } catch (error) {
      logger.error('獲取用戶同意狀態失敗:', error);
      throw error;
    }
  }

  /**
   * 生成同意報告
   */
  public generateConsentReport(period?: {
    start: Date;
    end: Date;
  }): ConsentReport {
    try {
      const reportPeriod = period || this.getDefaultReportPeriod();
      const consentsInPeriod = this.getConsentsInPeriod(reportPeriod);

      const summary = this.calculateConsentSummary(consentsInPeriod);
      const byPurpose = this.calculateConsentByPurpose(consentsInPeriod);
      const byCategory = this.calculateConsentByCategory(consentsInPeriod);

      const report: ConsentReport = {
        id: `consent_report_${Date.now()}`,
        period: reportPeriod,
        summary,
        byPurpose,
        byCategory,
        generatedAt: new Date(),
      };

      logger.info('同意報告生成完成', {
        reportId: report.id,
        period: reportPeriod,
        totalConsents: summary.totalConsents,
        consentRate: summary.consentRate,
      });

      return report;
    } catch (error) {
      logger.error('生成同意報告失敗:', error);
      throw error;
    }
  }

  /**
   * 清理過期同意
   */
  public cleanupExpiredConsents(): number {
    try {
      const now = new Date();
      let cleanedCount = 0;

      this.consentRecords.forEach((consent, consentId) => {
        if (
          consent.expiresAt &&
          consent.expiresAt < now &&
          consent.status === 'active'
        ) {
          consent.status = 'expired';

          // 記錄審計事件
          this.logAuditEvent({
            action: 'expired',
            userId: consent.userId,
            purposeId: consent.purposeId,
            details: { expiredAt: now },
            ipAddress: '',
            userAgent: '',
          });

          cleanedCount++;
        }
      });

      logger.info('過期同意清理完成', {
        cleanedCount,
        totalConsents: this.consentRecords.size,
      });

      return cleanedCount;
    } catch (error) {
      logger.error('清理過期同意失敗:', error);
      throw error;
    }
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<ConsentManagementConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('同意管理模組配置已更新', { config: this.config });
  }

  /**
   * 重置模組
   */
  public async reset(): Promise<void> {
    this.purposes.clear();
    this.consentRecords.clear();
    this.isInitialized = false;

    logger.info('同意管理模組已重置');
  }

  // 私有方法

  private getDefaultConfig(): ConsentManagementConfig {
    return {
      enableConsentCollection: true,
      enableConsentValidation: true,
      enableConsentWithdrawal: true,
      enableConsentUpdates: true,
      enableAuditLogging: true,
      defaultRetentionPeriod: 365,
      consentExpiryDays: 730, // 2年
      requireExplicitConsent: true,
      enableGranularConsent: true,
    };
  }

  private async initializePurposes(): Promise<void> {
    const purposes = [
      this.createEssentialPurpose(),
      this.createFunctionalPurpose(),
      this.createAnalyticsPurpose(),
      this.createMarketingPurpose(),
      this.createThirdPartyPurpose(),
    ];

    purposes.forEach(purpose => {
      this.purposes.set(purpose.id, purpose);
    });
  }

  private createConsentRecord(
    userId: string,
    purposeId: string,
    consentType: 'explicit' | 'implicit',
    evidence: Omit<ConsentEvidence, 'timestamp'>
  ): ConsentRecord {
    const purpose = this.getPurpose(purposeId);
    const expiresAt = purpose
      ? new Date(Date.now() + purpose.retentionPeriod * 24 * 60 * 60 * 1000)
      : undefined;

    const consentRecord: ConsentRecord = {
      id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      purposeId,
      consentType,
      status: 'active',
      grantedAt: new Date(),
      expiresAt,
      version: '1.0',
      ipAddress: '',
      userAgent: '',
      consentText: `用戶同意${purpose?.name || purposeId}的數據處理`,
      consentMethod: 'web_form',
      evidence: {
        ...evidence,
        timestamp: new Date(),
      },
      auditTrail: [],
    };

    return consentRecord;
  }

  private getPurpose(purposeId: string): ConsentPurpose | undefined {
    return this.purposes.get(purposeId);
  }

  private getActiveConsent(
    userId: string,
    purposeId: string
  ): ConsentRecord | undefined {
    for (const consent of this.consentRecords.values()) {
      if (
        consent.userId === userId &&
        consent.purposeId === purposeId &&
        consent.status === 'active'
      ) {
        return consent;
      }
    }
    return undefined;
  }

  private getConsentRecord(
    userId: string,
    purposeId: string
  ): ConsentRecord | undefined {
    let latestConsent: ConsentRecord | undefined;

    for (const consent of this.consentRecords.values()) {
      if (consent.userId === userId && consent.purposeId === purposeId) {
        if (!latestConsent || consent.grantedAt > latestConsent.grantedAt) {
          latestConsent = consent;
        }
      }
    }

    return latestConsent;
  }

  private performConsentValidation(
    consent: ConsentRecord,
    purpose?: ConsentPurpose
  ): ConsentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // 檢查同意是否過期
    if (consent.expiresAt && consent.expiresAt < new Date()) {
      errors.push('同意已過期');
      return this.createValidationResult('expired', errors);
    }

    // 檢查同意是否被撤銷
    if (consent.status === 'withdrawn') {
      errors.push('同意已被撤銷');
      return this.createValidationResult('withdrawn', errors);
    }

    // 檢查同意類型
    if (
      this.config.requireExplicitConsent &&
      consent.consentType === 'implicit'
    ) {
      warnings.push('建議使用明確同意而非隱含同意');
      recommendations.push('考慮重新獲取明確同意');
    }

    // 檢查同意版本
    if (consent.version !== '1.0') {
      warnings.push('同意版本可能需要更新');
      recommendations.push('檢查是否需要重新獲取同意');
    }

    return this.createValidationResult(
      'valid',
      errors,
      warnings,
      recommendations
    );
  }

  private createValidationResult(
    status: 'valid' | 'expired' | 'withdrawn' | 'invalid' | 'missing',
    errors: string[] = [],
    warnings: string[] = [],
    recommendations: string[] = []
  ): ConsentValidationResult {
    return {
      isValid: status === 'valid',
      status,
      errors,
      warnings,
      recommendations,
      lastUpdated: new Date(),
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天後
    };
  }

  private getDefaultReportPeriod(): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30); // 最近30天
    return { start, end };
  }

  private getConsentsInPeriod(period: {
    start: Date;
    end: Date;
  }): ConsentRecord[] {
    return Array.from(this.consentRecords.values()).filter(
      consent =>
        consent.grantedAt >= period.start && consent.grantedAt <= period.end
    );
  }

  private calculateConsentSummary(consents: ConsentRecord[]): {
    totalConsents: number;
    activeConsents: number;
    withdrawnConsents: number;
    expiredConsents: number;
    consentRate: number;
  } {
    const totalConsents = consents.length;
    const activeConsents = consents.filter(c => c.status === 'active').length;
    const withdrawnConsents = consents.filter(
      c => c.status === 'withdrawn'
    ).length;
    const expiredConsents = consents.filter(
      c => c.status === 'expired'
    ).length;
    const consentRate =
      totalConsents > 0 ? (activeConsents / totalConsents) * 100 : 0;

    return {
      totalConsents,
      activeConsents,
      withdrawnConsents,
      expiredConsents,
      consentRate,
    };
  }

  private calculateConsentByPurpose(consents: ConsentRecord[]): Record<
    string,
    {
      total: number;
      active: number;
      withdrawn: number;
      expired: number;
      rate: number;
    }
  > {
    const byPurpose: Record<string, any> = {};

    consents.forEach(consent => {
      if (!byPurpose[consent.purposeId]) {
        byPurpose[consent.purposeId] = {
          total: 0,
          active: 0,
          withdrawn: 0,
          expired: 0,
          rate: 0,
        };
      }

      byPurpose[consent.purposeId].total++;

      switch (consent.status) {
        case 'active':
          byPurpose[consent.purposeId].active++;
          break;
        case 'withdrawn':
          byPurpose[consent.purposeId].withdrawn++;
          break;
        case 'expired':
          byPurpose[consent.purposeId].expired++;
          break;
      }
    });

    // 計算比率
    Object.keys(byPurpose).forEach(purposeId => {
      const purpose = byPurpose[purposeId];
      purpose.rate =
        purpose.total > 0 ? (purpose.active / purpose.total) * 100 : 0;
    });

    return byPurpose;
  }

  private calculateConsentByCategory(consents: ConsentRecord[]): Record<
    string,
    {
      total: number;
      active: number;
      withdrawn: number;
      expired: number;
      rate: number;
    }
  > {
    const byCategory: Record<string, any> = {};

    consents.forEach(consent => {
      const purpose = this.getPurpose(consent.purposeId);
      const category = purpose?.category || 'unknown';

      if (!byCategory[category]) {
        byCategory[category] = {
          total: 0,
          active: 0,
          withdrawn: 0,
          expired: 0,
          rate: 0,
        };
      }

      byCategory[category].total++;

      switch (consent.status) {
        case 'active':
          byCategory[category].active++;
          break;
        case 'withdrawn':
          byCategory[category].withdrawn++;
          break;
        case 'expired':
          byCategory[category].expired++;
          break;
      }
    });

    // 計算比率
    Object.keys(byCategory).forEach(category => {
      const cat = byCategory[category];
      cat.rate = cat.total > 0 ? (cat.active / cat.total) * 100 : 0;
    });

    return byCategory;
  }

  private logAuditEvent(
    event: Omit<ConsentAuditEvent, 'id' | 'timestamp'>
  ): void {
    const auditEvent: ConsentAuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...event,
    };

    // 這裡可以將審計事件存儲到數據庫或日誌系統
    logger.info(
      '同意審計事件',
      auditEvent as unknown as Record<string, unknown>
    );
  }

  // 創建同意目的實例
  private createEssentialPurpose(): ConsentPurpose {
    return {
      id: 'essential',
      name: '基本功能',
      description: '應用程序基本功能所需的數據處理',
      category: 'essential',
      mandatory: true,
      defaultEnabled: true,
      legalBasis: '合同履行',
      retentionPeriod: 365,
      dataCategories: ['personal', 'account'],
    };
  }

  private createFunctionalPurpose(): ConsentPurpose {
    return {
      id: 'functional',
      name: '功能增強',
      description: '提供個性化和增強功能',
      category: 'functional',
      mandatory: false,
      defaultEnabled: true,
      legalBasis: '合法利益',
      retentionPeriod: 365,
      dataCategories: ['personal', 'preferences', 'behavioral'],
    };
  }

  private createAnalyticsPurpose(): ConsentPurpose {
    return {
      id: 'analytics',
      name: '分析統計',
      description: '用於改進服務和用戶體驗的分析',
      category: 'analytics',
      mandatory: false,
      defaultEnabled: false,
      legalBasis: '同意',
      retentionPeriod: 180,
      dataCategories: ['behavioral', 'analytics'],
    };
  }

  private createMarketingPurpose(): ConsentPurpose {
    return {
      id: 'marketing',
      name: '營銷推廣',
      description: '個性化營銷和推廣活動',
      category: 'marketing',
      mandatory: false,
      defaultEnabled: false,
      legalBasis: '同意',
      retentionPeriod: 365,
      dataCategories: ['personal', 'preferences', 'marketing'],
    };
  }

  private createThirdPartyPurpose(): ConsentPurpose {
    return {
      id: 'third_party',
      name: '第三方服務',
      description: '與第三方服務提供商共享數據',
      category: 'third_party',
      mandatory: false,
      defaultEnabled: false,
      legalBasis: '同意',
      retentionPeriod: 365,
      dataCategories: ['personal', 'third_party'],
    };
  }
}
