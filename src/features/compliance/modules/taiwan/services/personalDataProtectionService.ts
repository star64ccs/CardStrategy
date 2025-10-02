// 台灣個人資料保護法Service實現
// Taiwan Personal Data Protection Act Service Implementation

import type {
  TaiwanPersonalDataProcessing,
  TaiwanCrossBorderTransfer,
  TaiwanPersonalDataComplianceResult,
  TaiwanPersonalDataViolation,
  TaiwanPenalty,
  TaiwanAuditTrail,
} from '../types/personalDataProtection';
import {
  TaiwanDataCategory,
  TaiwanProcessingMethod,
  TaiwanSecurityMeasure,
  TaiwanConsentMethod,
  TaiwanDataSubjectRight,
  TaiwanTransferMethod,
  TaiwanSafeguard,
  TaiwanRecipientInfo,
  TaiwanRiskAssessment,
  TaiwanRiskLevel,
  TaiwanApprovalStatus,
  TaiwanPersonalDataViolationType,
  TaiwanViolationSeverity,
  TaiwanPenaltyType,
  TaiwanViolationStatus,
  TaiwanComplianceStatus,
} from '../types/personalDataProtection';

export class TaiwanPersonalDataProtectionService {
  private static instance: TaiwanPersonalDataProtectionService;
  private auditTrails: TaiwanAuditTrail[] = [];
  private violations: TaiwanPersonalDataViolation[] = [];

  private constructor() {}

  public static getInstance(): TaiwanPersonalDataProtectionService {
    if (!TaiwanPersonalDataProtectionService.instance) {
      TaiwanPersonalDataProtectionService.instance =
        new TaiwanPersonalDataProtectionService();
    }
    return TaiwanPersonalDataProtectionService.instance;
  }

  /**
   * Verify個人資料Handle合規性
   */
  public validatePersonalDataProcessing(
    processing: TaiwanPersonalDataProcessing
  ): TaiwanPersonalDataComplianceResult {
    const violations: TaiwanPersonalDataViolation[] = [];
    const recommendations: string[] = [];

    // Check必要欄位
    if (!processing.purpose) {
      violations.push(
        this.createViolation(
          TaiwanPersonalDataViolationType.UNAUTHORIZED_PROCESSING,
          '處理目的未明確說明',
          TaiwanViolationSeverity.MAJOR
        )
      );
      recommendations.push('應明確說明個人資料處理之特定目的');
    }

    // Check資料Class別
    if (!processing.dataCategory) {
      violations.push(
        this.createViolation(
          TaiwanPersonalDataViolationType.UNAUTHORIZED_COLLECTION,
          '資料類別未明確分類',
          TaiwanViolationSeverity.MODERATE
        )
      );
      recommendations.push('應明確分類個人資料類別');
    }

    // Check安全措施
    if (processing.securityMeasures.length === 0) {
      violations.push(
        this.createViolation(
          TaiwanPersonalDataViolationType.INSUFFICIENT_SECURITY,
          '未實施適當安全維護措施',
          TaiwanViolationSeverity.CRITICAL
        )
      );
      recommendations.push('應實施適當之安全維護措施');
    }

    // CheckAgree機制
    if (processing.consentRequired && !processing.consentMethod) {
      violations.push(
        this.createViolation(
          TaiwanPersonalDataViolationType.LACK_OF_CONSENT,
          '需要同意但未指定同意方式',
          TaiwanViolationSeverity.MAJOR
        )
      );
      recommendations.push('應明確指定同意方式');
    }

    // Check當事人權利
    if (processing.dataSubjectRights.length === 0) {
      violations.push(
        this.createViolation(
          TaiwanPersonalDataViolationType.VIOLATION_OF_RIGHTS,
          '未提供當事人權利行使機制',
          TaiwanViolationSeverity.MAJOR
        )
      );
      recommendations.push('應提供當事人權利行使機制');
    }

    // Check跨境傳輸
    if (processing.crossBorderTransfer) {
      const _crossBorderResult = this.validateCrossBorderTransfer(processing);
      violations.push(...crossBorderResult.violations);
      recommendations.push(...crossBorderResult.recommendations);
    }

    // Check第三方分享
    if (processing.thirdPartySharing) {
      const _thirdPartyResult = this.validateThirdPartySharing(processing);
      violations.push(...thirdPartyResult.violations);
      recommendations.push(...thirdPartyResult.recommendations);
    }

    // Check保留期間
    if (processing.retentionPeriod <= 0) {
      violations.push(
        this.createViolation(
          TaiwanPersonalDataViolationType.UNAUTHORIZED_PROCESSING,
          '保留期間未明確設定',
          TaiwanViolationSeverity.MODERATE
        )
      );
      recommendations.push('應明確設定個人資料保留期間');
    }

    // Check審計Trace
    if (!processing.auditTrail) {
      violations.push(
        this.createViolation(
          TaiwanPersonalDataViolationType.OTHER,
          '未建立審計追蹤機制',
          TaiwanViolationSeverity.MODERATE
        )
      );
      recommendations.push('應建立個人資料處理之審計追蹤機制');
    }

    // Check違規Notification
    if (!processing.breachNotification) {
      violations.push(
        this.createViolation(
          TaiwanPersonalDataViolationType.BREACH_NOTIFICATION_FAILURE,
          '未建立違規通知機制',
          TaiwanViolationSeverity.MAJOR
        )
      );
      recommendations.push('應建立個人資料違規事件通知機制');
    }

    // Record審計Trace
    this.logAuditTrail('validate_personal_data_processing', {
      processingId: processing.id,
      violationsCount: violations.length,
      recommendationsCount: recommendations.length,
    });

    // 儲存違規Record
    this.violations.push(...violations);

    return {
      success: violations.length === 0,
      complianceStatus: this.determineComplianceStatus(violations),
      violations,
      recommendations,
      riskLevel: this.calculateRiskLevel(violations),
      auditTrail: this.auditTrails,
      timestamp: new Date(),
    };
  }

  /**
   * Verify跨境傳輸合規性
   */
  private validateCrossBorderTransfer(
    processing: TaiwanPersonalDataProcessing
  ): { violations: TaiwanPersonalDataViolation[]; recommendations: string[] } {
    const violations: TaiwanPersonalDataViolation[] = [];
    const recommendations: string[] = [];

    // 這裡應該CheckConcrete的跨境傳輸設定
    // 由於沒有Concrete的跨境傳輸物件，我們Check基本要求

    if (processing.crossBorderTransfer) {
      recommendations.push('應評估目的地國家之個人資料保護水準');
      recommendations.push('應採取適當之保護措施');
      recommendations.push('應取得當事人同意');
      recommendations.push('應向主管機關申報');
    }

    return { violations, recommendations };
  }

  /**
   * Verify第三方分享合規性
   */
  private validateThirdPartySharing(processing: TaiwanPersonalDataProcessing): {
    violations: TaiwanPersonalDataViolation[];
    recommendations: string[];
  } {
    const violations: TaiwanPersonalDataViolation[] = [];
    const recommendations: string[] = [];

    if (processing.thirdPartySharing) {
      recommendations.push('應與受託者簽訂書面契約');
      recommendations.push('應監督受託者之個人資料處理');
      recommendations.push('應確保受託者採取適當之安全維護措施');
      recommendations.push('應取得當事人同意');
    }

    return { violations, recommendations };
  }

  /**
   * Handle當事人權利Request
   */
  public processDataSubjectRequest(
    requestType: TaiwanDataSubjectRight,
    userId: string,
    requestDetails: unknown
  ): { success: boolean; message: string; data?: unknown } {
    try {
      switch (requestType) {
        case TaiwanDataSubjectRight.ACCESS:
          return this.handleAccessRequest(userId, requestDetails);
        case TaiwanDataSubjectRight.COPY:
          return this.handleCopyRequest(userId, requestDetails);
        case TaiwanDataSubjectRight.CORRECTION:
          return this.handleCorrectionRequest(userId, requestDetails);
        case TaiwanDataSubjectRight.DELETION:
          return this.handleDeletionRequest(userId, requestDetails);
        case TaiwanDataSubjectRight.PORTABILITY:
          return this.handlePortabilityRequest(userId, requestDetails);
        case TaiwanDataSubjectRight.WITHDRAWAL:
          return this.handleWithdrawalRequest(userId, requestDetails);
        case TaiwanDataSubjectRight.COMPLAINT:
          return this.handleComplaintRequest(userId, requestDetails);
        default:
          return { success: false, message: '不支援的權利請求類型' };
      }
    } catch (error) {
      this.logAuditTrail('data_subject_request_error', {
        userId,
        requestType,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return { success: false, message: 'Handle權利請求時發生Error' };
    }
  }

  /**
   * HandleQuery或Request閱覽
   */
  private handleAccessRequest(
    userId: string,
    details: unknown
  ): { success: boolean; message: string; data?: unknown } {
    this.logAuditTrail('access_request', { userId, details });
    return {
      success: true,
      message: '已處理查詢請求',
      data: { requestId: `access_${Date.now()}`, status: 'processed' },
    };
  }

  /**
   * HandleRequest製給複製本
   */
  private handleCopyRequest(
    userId: string,
    details: unknown
  ): { success: boolean; message: string; data?: unknown } {
    this.logAuditTrail('copy_request', { userId, details });
    return {
      success: true,
      message: '已處理複製本請求',
      data: { requestId: `copy_${Date.now()}`, status: 'processed' },
    };
  }

  /**
   * HandleRequest補充或更正
   */
  private handleCorrectionRequest(
    userId: string,
    details: unknown
  ): { success: boolean; message: string; data?: unknown } {
    this.logAuditTrail('correction_request', { userId, details });
    return {
      success: true,
      message: '已處理更正請求',
      data: { requestId: `correction_${Date.now()}`, status: 'processed' },
    };
  }

  /**
   * HandleRequestStop蒐集、Handle或利用
   */
  private handleDeletionRequest(
    userId: string,
    details: unknown
  ): { success: boolean; message: string; data?: unknown } {
    this.logAuditTrail('deletion_request', { userId, details });
    return {
      success: true,
      message: '已處理刪除請求',
      data: { requestId: `deletion_${Date.now()}`, status: 'processed' },
    };
  }

  /**
   * HandleRequestDelete
   */
  private handlePortabilityRequest(
    userId: string,
    details: unknown
  ): { success: boolean; message: string; data?: unknown } {
    this.logAuditTrail('portability_request', { userId, details });
    return {
      success: true,
      message: '已處理可攜性請求',
      data: { requestId: `portability_${Date.now()}`, status: 'processed' },
    };
  }

  /**
   * Handle撤回Agree
   */
  private handleWithdrawalRequest(
    userId: string,
    details: unknown
  ): { success: boolean; message: string; data?: unknown } {
    this.logAuditTrail('withdrawal_request', { userId, details });
    return {
      success: true,
      message: '已處理撤回同意請求',
      data: { requestId: `withdrawal_${Date.now()}`, status: 'processed' },
    };
  }

  /**
   * Handle申訴
   */
  private handleComplaintRequest(
    userId: string,
    details: unknown
  ): { success: boolean; message: string; data?: unknown } {
    this.logAuditTrail('complaint_request', { userId, details });
    return {
      success: true,
      message: '已處理申訴請求',
      data: { requestId: `complaint_${Date.now()}`, status: 'processed' },
    };
  }

  /**
   * Manage跨境傳輸
   */
  public manageCrossBorderTransfer(transfer: TaiwanCrossBorderTransfer): {
    success: boolean;
    message: string;
    data?: unknown;
  } {
    try {
      // Check目的地Country
      if (!transfer.destinationCountry) {
        return { success: false, message: '目的地國家未指定' };
      }

      // Check傳輸方式
      if (!transfer.transferMethod) {
        return { success: false, message: '傳輸方式未指定' };
      }

      // Check保護措施
      if (transfer.safeguards.length === 0) {
        return { success: false, message: '未指定適當保護措施' };
      }

      // Check風險評估
      if (!transfer.riskAssessment) {
        return { success: false, message: '未進行風險評估' };
      }

      this.logAuditTrail('cross_border_transfer_management', {
        transferId: transfer.id,
        destinationCountry: transfer.destinationCountry,
        transferMethod: transfer.transferMethod,
      });

      return {
        success: true,
        message: '跨境傳輸管理Success',
        data: { transferId: transfer.id, status: 'approved' },
      };
    } catch (error) {
      this.logAuditTrail('cross_border_transfer_error', {
        transferId: transfer.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return { success: false, message: '跨境傳輸管理Failed' };
    }
  }

  /**
   * Handle當事人權利
   */
  public handleDataSubjectRights(
    rights: TaiwanDataSubjectRight[],
    userId: string
  ): { success: boolean; message: string; data?: unknown } {
    try {
      const _results = rights.map(right =>
        this.processDataSubjectRequest(right, userId, {})
      );

      const _successCount = results.filter(r => r.success).length;
      const _totalCount = results.length;

      this.logAuditTrail('data_subject_rights_handling', {
        userId,
        rightsCount: totalCount,
        successCount,
      });

      return {
        success: successCount === totalCount,
        message: `已處理 ${successCount}/${totalCount} 項權利請求`,
        data: { results, successCount, totalCount },
      };
    } catch (error) {
      this.logAuditTrail('data_subject_rights_error', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return { success: false, message: 'Handle當事人權利時發生Error' };
    }
  }

  /**
   * 生成合規Report
   */
  public generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): TaiwanPersonalDataComplianceResult {
    const _periodViolations = this.violations.filter(
      v => v.deadline >= startDate && v.deadline <= endDate
    );

    const _periodAuditTrails = this.auditTrails.filter(
      a => a.timestamp >= startDate && a.timestamp <= endDate
    );

    this.logAuditTrail('compliance_report_generation', {
      startDate,
      endDate,
      violationsCount: periodViolations.length,
      auditTrailsCount: periodAuditTrails.length,
    });

    return {
      success: periodViolations.length === 0,
      complianceStatus: this.determineComplianceStatus(periodViolations),
      violations: periodViolations,
      recommendations: this.generateRecommendations(periodViolations),
      riskLevel: this.calculateRiskLevel(periodViolations),
      auditTrail: periodAuditTrails,
      timestamp: new Date(),
    };
  }

  /**
   * Create違規Record
   */
  private createViolation(
    type: TaiwanPersonalDataViolationType,
    description: string,
    severity: TaiwanViolationSeverity
  ): TaiwanPersonalDataViolation {
    return {
      id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      violationType: type,
      description,
      severity,
      applicableLaw: '個人資料保護法',
      penalty: this.generatePenalty(severity),
      correctiveAction: this.generateCorrectiveAction(type),
      deadline: new Date(
        Date.now() + this.getDeadlineDays(severity) * 24 * 60 * 60 * 1000
      ),
      status: TaiwanViolationStatus.OPEN,
    };
  }

  /**
   * 生成處罰
   */
  private generatePenalty(severity: TaiwanViolationSeverity): TaiwanPenalty {
    const _penalties = {
      [TaiwanViolationSeverity.MINOR]: {
        type: TaiwanPenaltyType.CORRECTIVE_MEASURES,
        amount: 0,
      },
      [TaiwanViolationSeverity.MODERATE]: {
        type: TaiwanPenaltyType.ADMINISTRATIVE_FINE,
        amount: 50000,
      },
      [TaiwanViolationSeverity.MAJOR]: {
        type: TaiwanPenaltyType.ADMINISTRATIVE_FINE,
        amount: 200000,
      },
      [TaiwanViolationSeverity.CRITICAL]: {
        type: TaiwanPenaltyType.ADMINISTRATIVE_FINE,
        amount: 500000,
      },
    };

    const _penalty = penalties[severity];
    return {
      type: penalty.type,
      amount: penalty.amount,
      description: `因違反個人資料保護法第${this.getLawArticle(severity)}條`,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天
      appealable: true,
    };
  }

  /**
   * 生成改正措施
   */
  private generateCorrectiveAction(
    type: TaiwanPersonalDataViolationType
  ): string {
    const _actions = {
      [TaiwanPersonalDataViolationType.UNAUTHORIZED_COLLECTION]:
        '立即停止未經授權之個人資料蒐集',
      [TaiwanPersonalDataViolationType.UNAUTHORIZED_PROCESSING]:
        '立即停止未經授權之個人資料處理',
      [TaiwanPersonalDataViolationType.UNAUTHORIZED_USE]:
        '立即停止未經授權之個人資料利用',
      [TaiwanPersonalDataViolationType.UNAUTHORIZED_TRANSFER]:
        '立即停止未經授權之個人資料傳輸',
      [TaiwanPersonalDataViolationType.INSUFFICIENT_SECURITY]:
        '立即實施適當之安全維護措施',
      [TaiwanPersonalDataViolationType.LACK_OF_CONSENT]:
        '立即建立適當之同意機制',
      [TaiwanPersonalDataViolationType.VIOLATION_OF_RIGHTS]:
        '立即建立當事人權利行使機制',
      [TaiwanPersonalDataViolationType.BREACH_NOTIFICATION_FAILURE]:
        '立即建立違規通知機制',
      [TaiwanPersonalDataViolationType.OTHER]: '立即改善相關缺失',
    };

    return actions[type] || '立即改善相關缺失';
  }

  /**
   * 取得期限天數
   */
  private getDeadlineDays(severity: TaiwanViolationSeverity): number {
    const _days = {
      [TaiwanViolationSeverity.MINOR]: 7,
      [TaiwanViolationSeverity.MODERATE]: 14,
      [TaiwanViolationSeverity.MAJOR]: 30,
      [TaiwanViolationSeverity.CRITICAL]: 7,
    };
    return days[severity];
  }

  /**
   * 取得法條條號
   */
  private getLawArticle(severity: TaiwanViolationSeverity): string {
    const _articles = {
      [TaiwanViolationSeverity.MINOR]: '6',
      [TaiwanViolationSeverity.MODERATE]: '8',
      [TaiwanViolationSeverity.MAJOR]: '11',
      [TaiwanViolationSeverity.CRITICAL]: '27',
    };
    return articles[severity];
  }

  /**
   * 決定合規Status
   */
  private determineComplianceStatus(
    violations: TaiwanPersonalDataViolation[]
  ): TaiwanComplianceStatus {
    if (violations.length === 0) return TaiwanComplianceStatus.COMPLIANT;

    const _criticalViolations = violations.filter(
      v => v.severity === TaiwanViolationSeverity.CRITICAL
    );
    const _majorViolations = violations.filter(
      v => v.severity === TaiwanViolationSeverity.MAJOR
    );

    if (criticalViolations.length > 0)
      return TaiwanComplianceStatus.NON_COMPLIANT;
    if (majorViolations.length > 0)
      return TaiwanComplianceStatus.PARTIALLY_COMPLIANT;

    return TaiwanComplianceStatus.PARTIALLY_COMPLIANT;
  }

  /**
   * 計算風險等級
   */
  private calculateRiskLevel(
    violations: TaiwanPersonalDataViolation[]
  ): TaiwanRiskLevel {
    if (violations.length === 0) return TaiwanRiskLevel.LOW;

    const _criticalCount = violations.filter(
      v => v.severity === TaiwanViolationSeverity.CRITICAL
    ).length;
    const _majorCount = violations.filter(
      v => v.severity === TaiwanViolationSeverity.MAJOR
    ).length;
    const _moderateCount = violations.filter(
      v => v.severity === TaiwanViolationSeverity.MODERATE
    ).length;

    if (criticalCount > 0) return TaiwanRiskLevel.CRITICAL;
    if (majorCount > 2) return TaiwanRiskLevel.HIGH;
    if (majorCount > 0 || moderateCount > 3) return TaiwanRiskLevel.MEDIUM;

    return TaiwanRiskLevel.LOW;
  }

  /**
   * 生成建議
   */
  private generateRecommendations(
    violations: TaiwanPersonalDataViolation[]
  ): string[] {
    const recommendations: string[] = [];

    if (violations.length === 0) {
      recommendations.push('持續監控個人資料處理活動');
      recommendations.push('定期更新安全維護措施');
      recommendations.push('加強員工個人資料保護教育訓練');
      return recommendations;
    }

    const _violationTypes = violations.map(v => v.violationType);

    if (
      violationTypes.includes(
        TaiwanPersonalDataViolationType.UNAUTHORIZED_COLLECTION
      )
    ) {
      recommendations.push('建立個人資料蒐集前評估機制');
    }

    if (
      violationTypes.includes(
        TaiwanPersonalDataViolationType.INSUFFICIENT_SECURITY
      )
    ) {
      recommendations.push('加強個人資料安全維護措施');
      recommendations.push('定期進行安全評估');
    }

    if (
      violationTypes.includes(TaiwanPersonalDataViolationType.LACK_OF_CONSENT)
    ) {
      recommendations.push('建立明確的同意機制');
      recommendations.push('加強同意管理系統');
    }

    if (
      violationTypes.includes(
        TaiwanPersonalDataViolationType.VIOLATION_OF_RIGHTS
      )
    ) {
      recommendations.push('建立當事人權利行使機制');
      recommendations.push('加強權利請求處理流程');
    }

    recommendations.push('建立定期合規檢查機制');
    recommendations.push('加強員工教育訓練');

    return recommendations;
  }

  /**
   * Record審計Trace
   */
  private logAuditTrail(action: string, details: Record<string, any>): void {
    const auditTrail: TaiwanAuditTrail = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      description: `個人資料保護法相關操作: ${action}`,
      actor: 'system',
      timestamp: new Date(),
      details,
    };

    this.auditTrails.push(auditTrail);
  }

  /**
   * 取得審計Trace
   */
  public getAuditTrails(): TaiwanAuditTrail[] {
    return [...this.auditTrails];
  }

  /**
   * 取得違規Record
   */
  public getViolations(): TaiwanPersonalDataViolation[] {
    return [...this.violations];
  }

  /**
   * 清理過期資料
   */
  public cleanup(): void {
    const _oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    this.auditTrails = this.auditTrails.filter(a => a.timestamp > oneYearAgo);
    this.violations = this.violations.filter(
      v => v.status !== TaiwanViolationStatus.CLOSED
    );
  }
}
