/**
 * AgreeManage模組
 * 實現重構計劃Task 1.3: ConsentManagementModule
 * 負責Agree收集、Verify、撤銷、Update等核心功能
 */

import { logger } from '../../../core/utils/logger';

// AgreeManageClass型定義
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

      // InitializeAgree目的
      await this.initializePurposes();

      this.isInitialized = true;
      logger.info('同意管理模組InitializeSuccess');
      return true;
    } catch (error) {
      logger.error('同意管理模組InitializeFailed:', error);
      return false;
    }
  }

  /**
   * 收集Agree
   */
  public collectConsent(
    userId: string,
    purposeId: string,
    consentType: 'explicit' | 'implicit',
    evidence: Omit<ConsentEvidence, 'timestamp'>
  ): ConsentRecord {
    try {
      const _purpose = this.getPurpose(purposeId);
      if (!purpose) {
        throw new Error(`未找到同意目的: ${purposeId}`);
      }

      const _consentRecord = this.createConsentRecord(
        userId,
        purposeId,
        consentType,
        evidence
      );
      this.consentRecords.set(consentRecord.id, consentRecord);

      // Record審計Event
      this.logAuditEvent({
        action: 'granted',
        userId,
        purposeId,
        details: { consentType, purposeName: purpose.name },
        ipAddress: '',
        userAgent: '',
      });

      logger.info('同意收集Success', {
        userId,
        purposeId,
        consentType,
        consentId: consentRecord.id,
      });

      return consentRecord;
    } catch (error) {
      logger.error('同意收集Failed:', error);
      throw error;
    }
  }

  /**
   * VerifyAgree
   */
  public validateConsent(
    userId: string,
    purposeId: string
  ): ConsentValidationResult {
    try {
      const _consentRecord = this.getConsentRecord(userId, purposeId);
      const _purpose = this.getPurpose(purposeId);

      if (!consentRecord) {
        return this.createValidationResult('missing', ['未找到有效同意記錄']);
      }

      const _validationResult = this.performConsentValidation(
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
      logger.error('同意VerifyFailed:', error);
      throw error;
    }
  }

  /**
   * 撤銷Agree
   */
  public withdrawConsent(request: ConsentWithdrawalRequest): boolean {
    try {
      const results: boolean[] = [];

      request.purposeIds.forEach(purposeId => {
        const _consentRecord = this.getActiveConsent(request.userId, purposeId);
        if (consentRecord) {
          consentRecord.status = 'withdrawn';
          consentRecord.withdrawnAt = new Date();

          // Record審計Event
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

      const _success = results.some(result => result);

      logger.info('同意撤銷處理完成', {
        userId: request.userId,
        purposeIds: request.purposeIds,
        success,
        successCount: results.filter(r => r).length,
      });

      return success;
    } catch (error) {
      logger.error('同意撤銷Failed:', error);
      throw error;
    }
  }

  /**
   * UpdateAgree
   */
  public updateConsent(request: ConsentUpdateRequest): ConsentRecord {
    try {
      const _previousConsent = this.getActiveConsent(
        request.userId,
        request.purposeId
      );
      if (!previousConsent) {
        throw new Error('未找到要更新的同意記錄');
      }

      // 撤銷舊Agree
      previousConsent.status = 'withdrawn';
      previousConsent.withdrawnAt = new Date();

      // Create新Agree
      const newEvidence: Omit<ConsentEvidence, 'timestamp'> = {
        method: 'update',
        location: 'web_form',
        deviceInfo: 'updated_consent',
        sessionId: `session_${Date.now()}`,
        consentVersion: request.newConsent.version,
        dataProcessed: [],
        thirdParties: [],
      };

      const _newConsent = this.createConsentRecord(
        request.userId,
        request.purposeId,
        request.newConsentType,
        newEvidence
      );

      this.consentRecords.set(newConsent.id, newConsent);

      // Record審計Event
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

      logger.info('同意UpdateSuccess', {
        userId: request.userId,
        purposeId: request.purposeId,
        previousType: previousConsent.consentType,
        newType: request.newConsentType,
      });

      return newConsent;
    } catch (error) {
      logger.error('同意UpdateFailed:', error);
      throw error;
    }
  }

  /**
   * GetUserAgreeStatus
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
      logger.error('Get用戶同意狀態Failed:', error);
      throw error;
    }
  }

  /**
   * 生成AgreeReport
   */
  public generateConsentReport(period?: {
    start: Date;
    end: Date;
  }): ConsentReport {
    try {
      const _reportPeriod = period || this.getDefaultReportPeriod();
      const _consentsInPeriod = this.getConsentsInPeriod(reportPeriod);

      const _summary = this.calculateConsentSummary(consentsInPeriod);
      const _byPurpose = this.calculateConsentByPurpose(consentsInPeriod);
      const _byCategory = this.calculateConsentByCategory(consentsInPeriod);

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
      logger.error('生成同意報告Failed:', error);
      throw error;
    }
  }

  /**
   * 清理過期Agree
   */
  public cleanupExpiredConsents(): number {
    try {
      const _now = new Date();
      let cleanedCount = 0;

      this.consentRecords.forEach((consent, consentId) => {
        if (
          consent.expiresAt &&
          consent.expiresAt < now &&
          consent.status === 'active'
        ) {
          consent.status = 'expired';

          // Record審計Event
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
      logger.error('清理過期同意Failed:', error);
      throw error;
    }
  }

  /**
   * UpdateConfigure
   */
  public updateConfig(config: Partial<ConsentManagementConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('同意管理模組配置已更新', { config: this.config });
  }

  /**
   * Reset模組
   */
  public async reset(): Promise<void> {
    this.purposes.clear();
    this.consentRecords.clear();
    this.isInitialized = false;

    logger.info('同意管理模組已重置');
  }

  // PrivateMethod

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
    const _purposes = [
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
    const _purpose = this.getPurpose(purposeId);
    const _expiresAt = purpose
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

    // CheckAgreeYesNo過期
    if (consent.expiresAt && consent.expiresAt < new Date()) {
      errors.push('同意已過期');
      return this.createValidationResult('expired', errors);
    }

    // CheckAgreeYesNo被撤銷
    if (consent.status === 'withdrawn') {
      errors.push('同意已被撤銷');
      return this.createValidationResult('withdrawn', errors);
    }

    // CheckAgreeClass型
    if (
      this.config.requireExplicitConsent &&
      consent.consentType === 'implicit'
    ) {
      warnings.push('建議使用明確同意而非隱含同意');
      recommendations.push('考慮重新獲取明確同意');
    }

    // CheckAgreeVersion
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
    const _end = new Date();
    const _start = new Date();
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
    const _totalConsents = consents.length;
    const _activeConsents = consents.filter(c => c.status === 'active').length;
    const _withdrawnConsents = consents.filter(
      c => c.status === 'withdrawn'
    ).length;
    const _expiredConsents = consents.filter(
      c => c.status === 'expired'
    ).length;
    const _consentRate =
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
      const _purpose = byPurpose[purposeId];
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
      const _purpose = this.getPurpose(consent.purposeId);
      const _category = purpose?.category || 'unknown';

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
      const _cat = byCategory[category];
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

    // 這裡可以將審計EventStorage到Database或Log系統
    logger.info(
      '同意審計事件',
      auditEvent as unknown as Record<string, unknown>
    );
  }

  // CreateAgree目的Instance
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
      description: '用於改進Service和用戶體驗的分析',
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
      name: '第三方Service',
      description: '與第三方Service提供商共享數據',
      category: 'third_party',
      mandatory: false,
      defaultEnabled: false,
      legalBasis: '同意',
      retentionPeriod: 365,
      dataCategories: ['personal', 'third_party'],
    };
  }
}
