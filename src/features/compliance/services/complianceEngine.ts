/**
 * 合規性引擎核心Service
 * 實現重構計劃Task 1.1: ComplianceEngine 核心Service
 * 負責法規檢測與Apply、合規性Check、審計Trace等核心功能
 */

import { logger } from '../../../core/utils/logger';

// 基礎Class型定義
export interface Location {
  country: string;
  region?: string;
  city?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Jurisdiction {
  id: string;
  name: string;
  country: string;
  region?: string;
  regulations: Regulation[];
  complianceLevel: 'strict' | 'moderate' | 'lenient';
  lastUpdated: Date;
}

export interface Regulation {
  id: string;
  name: string;
  type:
    | 'privacy'
    | 'security'
    | 'consumer'
    | 'payment'
    | 'gaming'
    | 'copyright'
    | 'marketing'
    | 'tax'
    | 'antitrust';
  version: string;
  effectiveDate: Date;
  requirements: RegulationRequirement[];
  priority: 'high' | 'medium' | 'low';
}

export interface RegulationRequirement {
  id: string;
  description: string;
  category: string;
  mandatory: boolean;
  validationRules: ValidationRule[];
}

export interface ValidationRule {
  type:
    | 'data_minimization'
    | 'consent_required'
    | 'age_verification'
    | 'encryption'
    | 'audit_trail';
  parameters: Record<string, any>;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface ComplianceRules {
  jurisdiction: Jurisdiction;
  applicableRegulations: Regulation[];
  featureRestrictions: string[];
  dataRequirements: DataRequirement[];
  auditRequirements: AuditRequirement[];
}

export interface DataRequirement {
  type: 'personal_data' | 'payment_data' | 'gaming_data' | 'marketing_data';
  retentionPeriod: number; // 天數
  encryptionRequired: boolean;
  consentRequired: boolean;
  accessControls: string[];
}

export interface AuditRequirement {
  type:
    | 'access_log'
    | 'data_processing'
    | 'consent_management'
    | 'security_incident';
  retentionPeriod: number; // 天數
  format: 'json' | 'xml' | 'csv';
  encryptionRequired: boolean;
}

export interface Consent {
  id: string;
  userId: string;
  purposes: string[];
  grantedAt: Date;
  expiresAt?: Date;
  version: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

export interface ConsentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiredActions: string[];
}

export interface ComplianceResult {
  isCompliant: boolean;
  score: number; // 0-100
  violations: ComplianceViolation[];
  recommendations: string[];
  requiredActions: string[];
  auditTrail: AuditEvent[];
}

export interface ComplianceViolation {
  id: string;
  regulationId: string;
  requirementId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  detectedAt: Date;
  status: 'open' | 'in_progress' | 'resolved';
  remediationSteps: string[];
}

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId?: string;
  action: string;
  resource: string;
  result: 'success' | 'failure' | 'warning';
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface ComplianceReport {
  id: string;
  jurisdiction: Jurisdiction;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalChecks: number;
    compliantChecks: number;
    violations: number;
    score: number;
  };
  violations: ComplianceViolation[];
  recommendations: string[];
  generatedAt: Date;
}

export interface ComplianceEngineConfig {
  enableRealTimeMonitoring: boolean;
  enableAuditLogging: boolean;
  enableAutomaticReporting: boolean;
  auditRetentionDays: number;
  complianceCheckInterval: number; // Minute
  alertThreshold: number; // 合規分數閾Value
}

export class ComplianceEngine {
  private static instance: ComplianceEngine;
  private config: ComplianceEngineConfig;
  private readonly jurisdictions: Map<string, Jurisdiction>;
  private auditEvents: AuditEvent[];
  private isInitialized = false;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.jurisdictions = new Map();
    this.auditEvents = [];
  }

  public static getInstance(): ComplianceEngine {
    if (!ComplianceEngine.instance) {
      ComplianceEngine.instance = new ComplianceEngine();
    }
    return ComplianceEngine.instance;
  }

  public async initialize(
    config?: Partial<ComplianceEngineConfig>
  ): Promise<boolean> {
    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // Initialize管轄DistrictData
      await this.initializeJurisdictions();

      // Initialize審計系統
      if (this.config.enableAuditLogging) {
        await this.initializeAuditSystem();
      }

      this.isInitialized = true;
      logger.info('合規性引擎InitializeSuccess');

      // RecordInitializeEvent
      this.logAuditEvent({
        action: 'engine_initialized',
        resource: 'compliance_engine',
        result: 'success',
        details: { config: this.config },
      });

      return true;
    } catch (error) {
      logger.error('合規性引擎InitializeFailed:', error);
      return false;
    }
  }

  /**
   * 檢測User管轄District
   */
  public detectJurisdiction(userLocation: Location): Jurisdiction {
    try {
      const _jurisdiction = this.findJurisdictionByLocation(userLocation);

      this.logAuditEvent({
        action: 'jurisdiction_detected',
        resource: 'user_location',
        result: 'success',
        details: {
          userLocation,
          detectedJurisdiction: jurisdiction.id,
        },
      });

      return jurisdiction;
    } catch (error) {
      logger.error('管轄區檢測Failed:', error);

      this.logAuditEvent({
        action: 'jurisdiction_detection_failed',
        resource: 'user_location',
        result: 'failure',
        details: { userLocation, error: error.message },
      });

      // ReturnDefault管轄District
      return this.getDefaultJurisdiction();
    }
  }

  /**
   * Apply法規規則
   */
  public applyRegulations(jurisdiction: Jurisdiction): ComplianceRules {
    try {
      const _applicableRegulations =
        this.getApplicableRegulations(jurisdiction);
      const _featureRestrictions = this.getFeatureRestrictions(
        applicableRegulations
      );
      const _dataRequirements = this.getDataRequirements(applicableRegulations);
      const _auditRequirements = this.getAuditRequirements(
        applicableRegulations
      );

      const complianceRules: ComplianceRules = {
        jurisdiction,
        applicableRegulations,
        featureRestrictions,
        dataRequirements,
        auditRequirements,
      };

      this.logAuditEvent({
        action: 'regulations_applied',
        resource: 'compliance_rules',
        result: 'success',
        details: {
          jurisdictionId: jurisdiction.id,
          regulationCount: applicableRegulations.length,
        },
      });

      return complianceRules;
    } catch (error) {
      logger.error('法規應用Failed:', error);

      this.logAuditEvent({
        action: 'regulations_application_failed',
        resource: 'compliance_rules',
        result: 'failure',
        details: { jurisdictionId: jurisdiction.id, error: error.message },
      });

      throw error;
    }
  }

  /**
   * Check合規性
   */
  public checkCompliance(data: unknown, operation: string): ComplianceResult {
    try {
      const violations: ComplianceViolation[] = [];
      const recommendations: string[] = [];
      const requiredActions: string[] = [];
      const auditTrail: AuditEvent[] = [];

      // CheckData最小化
      const _dataMinimizationCheck = this.checkDataMinimization(
        data,
        operation
      );
      if (!dataMinimizationCheck.isCompliant) {
        violations.push(...dataMinimizationCheck.violations);
        recommendations.push(...dataMinimizationCheck.recommendations);
      }

      // CheckAgree要求
      const _consentCheck = this.checkConsentRequirements(data, operation);
      if (!consentCheck.isCompliant) {
        violations.push(...consentCheck.violations);
        recommendations.push(...consentCheck.recommendations);
      }

      // CheckAgeVerify
      const _ageVerificationCheck = this.checkAgeVerification(data, operation);
      if (!ageVerificationCheck.isCompliant) {
        violations.push(...ageVerificationCheck.violations);
        recommendations.push(...ageVerificationCheck.recommendations);
      }

      // 計算合規分數
      const _score = this.calculateComplianceScore(violations);

      // 生成所需Row動
      requiredActions.push(...this.generateRequiredActions(violations));

      const result: ComplianceResult = {
        isCompliant: violations.length === 0,
        score,
        violations,
        recommendations,
        requiredActions,
        auditTrail,
      };

      this.logAuditEvent({
        action: 'compliance_check',
        resource: operation,
        result: result.isCompliant ? 'success' : 'warning',
        details: {
          operation,
          score,
          violationCount: violations.length,
        },
      });

      return result;
    } catch (error) {
      logger.error('合規性CheckFailed:', error);

      this.logAuditEvent({
        action: 'compliance_check_failed',
        resource: operation,
        result: 'failure',
        details: { operation, error: error.message },
      });

      throw error;
    }
  }

  /**
   * VerifyAgree
   */
  public validateConsent(consent: Consent): ConsentValidationResult {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];
      const requiredActions: string[] = [];

      // CheckAgreeYesNo過期
      if (consent.expiresAt && consent.expiresAt < new Date()) {
        errors.push('同意已過期');
        requiredActions.push('重新獲取用戶同意');
      }

      // CheckAgreeVersion
      if (!consent.version) {
        warnings.push('同意版本信息缺失');
      }

      // CheckIPAddress
      if (!consent.ipAddress) {
        warnings.push('IP地址信息缺失');
      }

      // CheckUser代理
      if (!consent.userAgent) {
        warnings.push('用戶代理信息缺失');
      }

      const _isValid = errors.length === 0;

      this.logAuditEvent({
        action: 'consent_validation',
        resource: 'user_consent',
        result: isValid ? 'success' : 'failure',
        details: {
          consentId: consent.id,
          userId: consent.userId,
          errorCount: errors.length,
        },
      });

      return {
        isValid,
        errors,
        warnings,
        requiredActions,
      };
    } catch (error) {
      logger.error('同意VerifyFailed:', error);
      throw error;
    }
  }

  /**
   * Record合規Event
   */
  public logComplianceEvent(event: AuditEvent): void {
    try {
      this.auditEvents.push(event);

      // 如果Enable實時Monitor，立即HandleEvent
      if (this.config.enableRealTimeMonitoring) {
        this.processRealTimeEvent(event);
      }

      // 清理舊的審計Event
      this.cleanupOldAuditEvents();
    } catch (error) {
      logger.error('合規事件記錄Failed:', error);
    }
  }

  /**
   * 生成合規Report
   */
  public generateComplianceReport(
    jurisdiction?: Jurisdiction
  ): ComplianceReport {
    try {
      const _targetJurisdiction = jurisdiction || this.getDefaultJurisdiction();
      const _period = this.getReportPeriod();

      // Get期間內的審計Event
      const _periodEvents = this.auditEvents.filter(
        event =>
          event.timestamp >= period.start && event.timestamp <= period.end
      );

      // Statistics違規
      const _violations = this.extractViolationsFromEvents(periodEvents);

      // 計算統Count據
      const _totalChecks = periodEvents.filter(e =>
        e.action.includes('compliance_check')
      ).length;
      const _compliantChecks = periodEvents.filter(
        e => e.action.includes('compliance_check') && e.result === 'success'
      ).length;
      const _score =
        totalChecks > 0 ? (compliantChecks / totalChecks) * 100 : 100;

      // 生成建議
      const _recommendations = this.generateRecommendations(violations, score);

      const report: ComplianceReport = {
        id: `compliance_report_${Date.now()}`,
        jurisdiction: targetJurisdiction,
        period,
        summary: {
          totalChecks,
          compliantChecks,
          violations: violations.length,
          score,
        },
        violations,
        recommendations,
        generatedAt: new Date(),
      };

      this.logAuditEvent({
        action: 'compliance_report_generated',
        resource: 'compliance_report',
        result: 'success',
        details: {
          reportId: report.id,
          jurisdictionId: targetJurisdiction.id,
          score,
        },
      });

      return report;
    } catch (error) {
      logger.error('合規報告生成Failed:', error);
      throw error;
    }
  }

  /**
   * UpdateConfigure
   */
  public updateConfig(config: Partial<ComplianceEngineConfig>): void {
    this.config = { ...this.config, ...config };

    this.logAuditEvent({
      action: 'config_updated',
      resource: 'compliance_engine',
      result: 'success',
      details: { config: this.config },
    });
  }

  /**
   * Reset引擎
   */
  public async reset(): Promise<void> {
    this.auditEvents = [];
    this.isInitialized = false;

    this.logAuditEvent({
      action: 'engine_reset',
      resource: 'compliance_engine',
      result: 'success',
      details: {},
    });
  }

  // PrivateMethod

  private getDefaultConfig(): ComplianceEngineConfig {
    return {
      enableRealTimeMonitoring: true,
      enableAuditLogging: true,
      enableAutomaticReporting: false,
      auditRetentionDays: 365,
      complianceCheckInterval: 60,
      alertThreshold: 80,
    };
  }

  private async initializeJurisdictions(): Promise<void> {
    // Initialize主要管轄District
    const _jurisdictions = [
      this.createTaiwanJurisdiction(),
      this.createMacauJurisdiction(),
      this.createGDPRJurisdiction(),
      this.createCCPAJurisdiction(),
      this.createPIPEDAJurisdiction(),
    ];

    jurisdictions.forEach(jurisdiction => {
      this.jurisdictions.set(jurisdiction.id, jurisdiction);
    });
  }

  private async initializeAuditSystem(): Promise<void> {
    // Initialize審計系統
    logger.info('審計系統初始化完成');
  }

  private findJurisdictionByLocation(location: Location): Jurisdiction {
    // Root據位置Find管轄District
    const _country = location.country.toLowerCase();

    for (const jurisdiction of this.jurisdictions.values()) {
      if (jurisdiction.country.toLowerCase() === country) {
        return jurisdiction;
      }
    }

    // 如果找不到，ReturnDefault管轄District
    return this.getDefaultJurisdiction();
  }

  private getDefaultJurisdiction(): Jurisdiction {
    return this.jurisdictions.get('taiwan') || this.createTaiwanJurisdiction();
  }

  private getApplicableRegulations(jurisdiction: Jurisdiction): Regulation[] {
    return jurisdiction.regulations.filter(
      regulation => regulation.effectiveDate <= new Date()
    );
  }

  private getFeatureRestrictions(regulations: Regulation[]): string[] {
    const restrictions: string[] = [];

    regulations.forEach(regulation => {
      if (regulation.type === 'gaming') {
        restrictions.push('age_verification_required');
        restrictions.push('time_limits');
      }
      if (regulation.type === 'payment') {
        restrictions.push('strong_authentication');
      }
    });

    return restrictions;
  }

  private getDataRequirements(regulations: Regulation[]): DataRequirement[] {
    const requirements: DataRequirement[] = [];

    regulations.forEach(regulation => {
      if (regulation.type === 'privacy') {
        requirements.push({
          type: 'personal_data',
          retentionPeriod: 365,
          encryptionRequired: true,
          consentRequired: true,
          accessControls: ['read', 'update', 'delete'],
        });
      }
    });

    return requirements;
  }

  private getAuditRequirements(regulations: Regulation[]): AuditRequirement[] {
    const requirements: AuditRequirement[] = [];

    regulations.forEach(regulation => {
      requirements.push({
        type: 'access_log',
        retentionPeriod: 365,
        format: 'json',
        encryptionRequired: true,
      });
    });

    return requirements;
  }

  private checkDataMinimization(
    data: unknown,
    operation: string
  ): ComplianceResult {
    const violations: ComplianceViolation[] = [];
    const recommendations: string[] = [];

    // CheckYesNo收集了過多Data
    if (data && typeof data === 'object') {
      const _dataKeys = Object.keys(data);
      if (dataKeys.length > 10) {
        violations.push({
          id: `dm_${Date.now()}`,
          regulationId: 'gdpr',
          requirementId: 'data_minimization',
          severity: 'medium',
          description: '收集的數據超過最小化原則要求',
          detectedAt: new Date(),
          status: 'open',
          remediationSteps: ['審查數據收集必要性', '移除非必要字段'],
        });
        recommendations.push('實施數據最小化原則，只收集必要的個人數據');
      }
    }

    return {
      isCompliant: violations.length === 0,
      score: violations.length === 0 ? 100 : 70,
      violations,
      recommendations,
      requiredActions: [],
      auditTrail: [],
    };
  }

  private checkConsentRequirements(
    data: unknown,
    operation: string
  ): ComplianceResult {
    const violations: ComplianceViolation[] = [];
    const recommendations: string[] = [];

    // CheckYesNo需要Agree
    if (this.requiresConsent(operation) && data && !data.consent) {
      violations.push({
        id: `cr_${Date.now()}`,
        regulationId: 'gdpr',
        requirementId: 'consent_required',
        severity: 'high',
        description: '操作需要用戶同意但未獲得',
        detectedAt: new Date(),
        status: 'open',
        remediationSteps: ['獲取用戶明確同意', '記錄同意詳情'],
      });
      recommendations.push('實施明確的同意管理機制');
    }

    return {
      isCompliant: violations.length === 0,
      score: violations.length === 0 ? 100 : 60,
      violations,
      recommendations,
      requiredActions: [],
      auditTrail: [],
    };
  }

  private checkAgeVerification(
    data: unknown,
    operation: string
  ): ComplianceResult {
    const violations: ComplianceViolation[] = [];
    const recommendations: string[] = [];

    // CheckAgeVerify
    if (
      this.requiresAgeVerification(operation) &&
      data &&
      (!data.age || data.age < 18)
    ) {
      violations.push({
        id: `av_${Date.now()}`,
        regulationId: 'gaming',
        requirementId: 'age_verification',
        severity: 'critical',
        description: '年齡VerifyFailed或未Verify',
        detectedAt: new Date(),
        status: 'open',
        remediationSteps: ['實施年齡驗證機制', '阻止未成年人訪問'],
      });
      recommendations.push('實施嚴格的年齡驗證機制');
    }

    return {
      isCompliant: violations.length === 0,
      score: violations.length === 0 ? 100 : 50,
      violations,
      recommendations,
      requiredActions: [],
      auditTrail: [],
    };
  }

  private requiresConsent(operation: string): boolean {
    const _consentRequiredOperations = [
      'data_collection',
      'marketing_communication',
      'third_party_sharing',
      'profiling',
    ];
    return consentRequiredOperations.includes(operation);
  }

  private requiresAgeVerification(operation: string): boolean {
    const _ageRequiredOperations = [
      'gaming_access',
      'alcohol_purchase',
      'adult_content',
    ];
    return ageRequiredOperations.includes(operation);
  }

  private calculateComplianceScore(violations: ComplianceViolation[]): number {
    if (violations.length === 0) return 100;

    const _severityWeights = {
      critical: 0.4,
      high: 0.3,
      medium: 0.2,
      low: 0.1,
    };

    const _totalWeight = violations.reduce((sum, violation) => {
      return sum + severityWeights[violation.severity];
    }, 0);

    return Math.max(0, 100 - totalWeight * 100);
  }

  private generateRequiredActions(violations: ComplianceViolation[]): string[] {
    const actions: string[] = [];

    violations.forEach(violation => {
      actions.push(...violation.remediationSteps);
    });

    return [...new Set(actions)]; // 去重
  }

  private processRealTimeEvent(event: AuditEvent): void {
    // 實時HandleEvent邏輯
    if (event.result === 'failure') {
      logger.warn('檢測到合規違規事件:', {
        id: event.id,
        action: event.action,
        resource: event.resource,
        result: event.result,
        details: event.details,
      });
    }
  }

  private cleanupOldAuditEvents(): void {
    const _cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.auditRetentionDays);

    this.auditEvents = this.auditEvents.filter(
      event => event.timestamp >= cutoffDate
    );
  }

  private getReportPeriod(): { start: Date; end: Date } {
    const _end = new Date();
    const _start = new Date();
    start.setDate(start.getDate() - 30); // 最近30天
    return { start, end };
  }

  private extractViolationsFromEvents(
    events: AuditEvent[]
  ): ComplianceViolation[] {
    // 從審計Event中提取違規Information
    const violations: ComplianceViolation[] = [];

    events.forEach(event => {
      if (event.result === 'failure' && event.details.violations) {
        violations.push(...event.details.violations);
      }
    });

    return violations;
  }

  private generateRecommendations(
    violations: ComplianceViolation[],
    score: number
  ): string[] {
    const recommendations: string[] = [];

    if (score < 80) {
      recommendations.push('建議立即審查合規程序並實施改進措施');
    }

    if (violations.some(v => v.severity === 'critical')) {
      recommendations.push('存在關鍵違規，建議優先處理');
    }

    return recommendations;
  }

  private logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): void {
    const auditEvent: AuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action: event.action,
      resource: event.resource,
      result: event.result,
      details: event.details,
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
    };

    this.auditEvents.push(auditEvent);
  }

  // Create管轄DistrictInstance
  private createTaiwanJurisdiction(): Jurisdiction {
    return {
      id: 'taiwan',
      name: '台灣',
      country: 'TW',
      regulations: [
        {
          id: 'taiwan_pdpa',
          name: '台灣個人資料保護法',
          type: 'privacy',
          version: '2023',
          effectiveDate: new Date('2023-01-01'),
          requirements: [
            {
              id: 'consent_required',
              description: '處理個人資料需要當事人同意',
              category: 'consent',
              mandatory: true,
              validationRules: [
                {
                  type: 'consent_required',
                  parameters: {},
                  severity: 'high',
                },
              ],
            },
          ],
          priority: 'high',
        },
      ],
      complianceLevel: 'strict',
      lastUpdated: new Date(),
    };
  }

  private createMacauJurisdiction(): Jurisdiction {
    return {
      id: 'macau',
      name: '澳門',
      country: 'MO',
      regulations: [
        {
          id: 'macau_pdpa',
          name: '澳門個人資料保護法',
          type: 'privacy',
          version: '2023',
          effectiveDate: new Date('2023-01-01'),
          requirements: [
            {
              id: 'consent_required',
              description: '處理個人資料需要當事人同意',
              category: 'consent',
              mandatory: true,
              validationRules: [
                {
                  type: 'consent_required',
                  parameters: {},
                  severity: 'high',
                },
              ],
            },
          ],
          priority: 'high',
        },
      ],
      complianceLevel: 'strict',
      lastUpdated: new Date(),
    };
  }

  private createGDPRJurisdiction(): Jurisdiction {
    return {
      id: 'eu_gdpr',
      name: '歐盟GDPR',
      country: 'EU',
      regulations: [
        {
          id: 'gdpr',
          name: '一般數據保護條例',
          type: 'privacy',
          version: '2018',
          effectiveDate: new Date('2018-05-25'),
          requirements: [
            {
              id: 'data_minimization',
              description: '數據最小化原則',
              category: 'data_protection',
              mandatory: true,
              validationRules: [
                {
                  type: 'data_minimization',
                  parameters: {},
                  severity: 'high',
                },
              ],
            },
          ],
          priority: 'high',
        },
      ],
      complianceLevel: 'strict',
      lastUpdated: new Date(),
    };
  }

  private createCCPAJurisdiction(): Jurisdiction {
    return {
      id: 'us_ccpa',
      name: '美國CCPA',
      country: 'US',
      region: 'CA',
      regulations: [
        {
          id: 'ccpa',
          name: '加州消費者隱私法案',
          type: 'privacy',
          version: '2020',
          effectiveDate: new Date('2020-01-01'),
          requirements: [
            {
              id: 'consumer_rights',
              description: '消費者權利保護',
              category: 'consumer_protection',
              mandatory: true,
              validationRules: [
                {
                  type: 'consent_required',
                  parameters: {},
                  severity: 'high',
                },
              ],
            },
          ],
          priority: 'high',
        },
      ],
      complianceLevel: 'moderate',
      lastUpdated: new Date(),
    };
  }

  private createPIPEDAJurisdiction(): Jurisdiction {
    return {
      id: 'ca_pipeda',
      name: '加拿大PIPEDA',
      country: 'CA',
      regulations: [
        {
          id: 'pipeda',
          name: '個人信息保護和電子文檔法案',
          type: 'privacy',
          version: '2022',
          effectiveDate: new Date('2022-01-01'),
          requirements: [
            {
              id: 'consent_principle',
              description: '同意原則',
              category: 'consent',
              mandatory: true,
              validationRules: [
                {
                  type: 'consent_required',
                  parameters: {},
                  severity: 'high',
                },
              ],
            },
          ],
          priority: 'high',
        },
      ],
      complianceLevel: 'moderate',
      lastUpdated: new Date(),
    };
  }
}
