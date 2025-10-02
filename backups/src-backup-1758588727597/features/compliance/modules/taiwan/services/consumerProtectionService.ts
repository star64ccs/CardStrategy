// 台灣消費者保護法服務實現
// Taiwan Consumer Protection Act Service Implementation

import type {
  TaiwanConsumerRights,
  TaiwanProductLabeling,
  TaiwanConsumerDispute,
  TaiwanConsumerInfo,
  TaiwanResolution,
  TaiwanConsumerProtectionComplianceResult,
  TaiwanConsumerProtectionViolation,
  TaiwanPenalty,
  TaiwanAuditTrail,
} from '../types/consumerProtection';
import {
  TaiwanConsumerRightType,
  TaiwanEnforcementMechanism,
  TaiwanComplaintProcess,
  TaiwanComplaintStep,
  TaiwanComplaintTimeframe,
  TaiwanContactInfo,
  TaiwanProductType,
  TaiwanRequiredLabel,
  TaiwanOptionalLabel,
  TaiwanLabelingStandard,
  TaiwanComplianceStatus,
  TaiwanDisputeType,
  TaiwanBusinessInfo,
  TaiwanProductInfo,
  TaiwanDisputeDetails,
  TaiwanDamage,
  TaiwanUrgencyLevel,
  TaiwanEvidence,
  TaiwanEvidenceType,
  TaiwanResolutionType,
  TaiwanResolutionStatus,
  TaiwanMediatorInfo,
  TaiwanDisputeStatus,
  TaiwanConsumerProtectionViolationType,
  TaiwanViolationSeverity,
  TaiwanPenaltyType,
  TaiwanViolationStatus,
  TaiwanRiskLevel,
} from '../types/consumerProtection';

export class TaiwanConsumerProtectionService {
  private static instance: TaiwanConsumerProtectionService;
  private auditTrails: TaiwanAuditTrail[] = [];
  private violations: TaiwanConsumerProtectionViolation[] = [];
  private disputes: TaiwanConsumerDispute[] = [];

  private constructor() {}

  public static getInstance(): TaiwanConsumerProtectionService {
    if (!TaiwanConsumerProtectionService.instance) {
      TaiwanConsumerProtectionService.instance =
        new TaiwanConsumerProtectionService();
    }
    return TaiwanConsumerProtectionService.instance;
  }

  /**
   * 驗證消費者權利合規性
   */
  public validateConsumerRights(
    rights: TaiwanConsumerRights
  ): TaiwanConsumerProtectionComplianceResult {
    const violations: TaiwanConsumerProtectionViolation[] = [];
    const recommendations: string[] = [];

    // 檢查權利類型
    if (!rights.rightType) {
      violations.push(
        this.createViolation(
          TaiwanConsumerProtectionViolationType.CONSUMER_RIGHTS_VIOLATION,
          '消費者權利類型未明確',
          TaiwanViolationSeverity.MODERATE
        )
      );
      recommendations.push('應明確指定消費者權利類型');
    }

    // 檢查描述
    if (!rights.description) {
      violations.push(
        this.createViolation(
          TaiwanConsumerProtectionViolationType.CONSUMER_RIGHTS_VIOLATION,
          '權利描述未提供',
          TaiwanViolationSeverity.MINOR
        )
      );
      recommendations.push('應提供詳細的權利描述');
    }

    // 檢查適用產品/服務
    if (
      rights.applicableProducts.length === 0 &&
      rights.applicableServices.length === 0
    ) {
      violations.push(
        this.createViolation(
          TaiwanConsumerProtectionViolationType.CONSUMER_RIGHTS_VIOLATION,
          '未指定適用產品或服務',
          TaiwanViolationSeverity.MODERATE
        )
      );
      recommendations.push('應明確指定適用的產品或服務範圍');
    }

    // 檢查執行機制
    if (!rights.enforcementMechanism) {
      violations.push(
        this.createViolation(
          TaiwanConsumerProtectionViolationType.CONSUMER_RIGHTS_VIOLATION,
          '未指定權利執行機制',
          TaiwanViolationSeverity.MAJOR
        )
      );
      recommendations.push('應建立明確的權利執行機制');
    }

    // 檢查申訴流程
    if (!rights.complaintProcess) {
      violations.push(
        this.createViolation(
          TaiwanConsumerProtectionViolationType.CONSUMER_RIGHTS_VIOLATION,
          '未建立申訴流程',
          TaiwanViolationSeverity.MAJOR
        )
      );
      recommendations.push('應建立完整的申訴處理流程');
    }

    // 記錄審計追蹤
    this.logAuditTrail('validate_consumer_rights', {
      rightsId: rights.id,
      rightType: rights.rightType,
      violationsCount: violations.length,
      recommendationsCount: recommendations.length,
    });

    // 儲存違規記錄
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
   * 驗證商品標示合規性
   */
  public validateProductLabeling(
    labeling: TaiwanProductLabeling
  ): TaiwanConsumerProtectionComplianceResult {
    const violations: TaiwanConsumerProtectionViolation[] = [];
    const recommendations: string[] = [];

    // 檢查商品類型
    if (!labeling.productType) {
      violations.push(
        this.createViolation(
          TaiwanConsumerProtectionViolationType.LABELING_VIOLATION,
          '商品類型未指定',
          TaiwanViolationSeverity.MODERATE
        )
      );
      recommendations.push('應明確指定商品類型');
    }

    // 檢查必要標示
    if (labeling.requiredLabels.length === 0) {
      violations.push(
        this.createViolation(
          TaiwanConsumerProtectionViolationType.LABELING_VIOLATION,
          '缺少必要標示',
          TaiwanViolationSeverity.MAJOR
        )
      );
      recommendations.push('應提供所有必要的商品標示');
    }

    // 檢查標示標準
    if (labeling.labelingStandards.length === 0) {
      violations.push(
        this.createViolation(
          TaiwanConsumerProtectionViolationType.LABELING_VIOLATION,
          '未遵循標示標準',
          TaiwanViolationSeverity.MODERATE
        )
      );
      recommendations.push('應遵循相關標示標準');
    }

    // 檢查檢查日期
    if (!labeling.inspectionDate) {
      violations.push(
        this.createViolation(
          TaiwanConsumerProtectionViolationType.LABELING_VIOLATION,
          '未記錄檢查日期',
          TaiwanViolationSeverity.MINOR
        )
      );
      recommendations.push('應記錄標示檢查日期');
    }

    // 記錄審計追蹤
    this.logAuditTrail('validate_product_labeling', {
      labelingId: labeling.id,
      productType: labeling.productType,
      violationsCount: violations.length,
      recommendationsCount: recommendations.length,
    });

    // 儲存違規記錄
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
   * 處理消費者爭議
   */
  public handleConsumerDispute(dispute: TaiwanConsumerDispute): {
    success: boolean;
    message: string;
    data?: unknown;
  } {
    try {
      // 驗證爭議資訊
      if (!dispute.disputeType) {
        return { success: false, message: '爭議類型未指定' };
      }

      if (!dispute.consumerInfo) {
        return { success: false, message: '消費者資訊未提供' };
      }

      if (!dispute.businessInfo) {
        return { success: false, message: '企業資訊未提供' };
      }

      if (!dispute.disputeDetails) {
        return { success: false, message: '爭議詳情未提供' };
      }

      // 設定初始狀態
      dispute.status = TaiwanDisputeStatus.FILED;
      dispute.createdAt = new Date();
      dispute.updatedAt = new Date();

      // 儲存爭議記錄
      this.disputes.push(dispute);

      // 記錄審計追蹤
      this.logAuditTrail('consumer_dispute_filed', {
        disputeId: dispute.id,
        disputeType: dispute.disputeType,
        consumerName: dispute.consumerInfo.name,
        businessName: dispute.businessInfo.name,
      });

      return {
        success: true,
        message: '消費者爭議已成功提交',
        data: { disputeId: dispute.id, status: dispute.status },
      };
    } catch (error) {
      this.logAuditTrail('consumer_dispute_error', {
        disputeId: dispute.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return { success: false, message: '處理消費者爭議時發生錯誤' };
    }
  }

  /**
   * 更新爭議狀態
   */
  public updateDisputeStatus(
    disputeId: string,
    newStatus: TaiwanDisputeStatus,
    resolution?: TaiwanResolution
  ): { success: boolean; message: string; data?: unknown } {
    try {
      const dispute = this.disputes.find(d => d.id === disputeId);
      if (!dispute) {
        return { success: false, message: '找不到指定的爭議記錄' };
      }

      // 更新狀態
      dispute.status = newStatus;
      dispute.updatedAt = new Date();

      // 如果有解決方案，更新解決方案
      if (resolution) {
        dispute.resolution = resolution;
      }

      // 記錄審計追蹤
      this.logAuditTrail('dispute_status_update', {
        disputeId,
        oldStatus: dispute.status,
        newStatus,
        hasResolution: !!resolution,
      });

      return {
        success: true,
        message: '爭議狀態已更新',
        data: { disputeId, status: newStatus },
      };
    } catch (error) {
      this.logAuditTrail('dispute_status_update_error', {
        disputeId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return { success: false, message: '更新爭議狀態時發生錯誤' };
    }
  }

  /**
   * 處理消費者權利請求
   */
  public processConsumerRightsRequest(
    rightType: TaiwanConsumerRightType,
    consumerInfo: TaiwanConsumerInfo,
    requestDetails: unknown
  ): { success: boolean; message: string; data?: unknown } {
    try {
      switch (rightType) {
        case TaiwanConsumerRightType.SAFETY:
          return this.handleSafetyRequest(consumerInfo, requestDetails);
        case TaiwanConsumerRightType.INFORMATION:
          return this.handleInformationRequest(consumerInfo, requestDetails);
        case TaiwanConsumerRightType.CHOICE:
          return this.handleChoiceRequest(consumerInfo, requestDetails);
        case TaiwanConsumerRightType.REPRESENTATION:
          return this.handleRepresentationRequest(consumerInfo, requestDetails);
        case TaiwanConsumerRightType.COMPENSATION:
          return this.handleCompensationRequest(consumerInfo, requestDetails);
        case TaiwanConsumerRightType.EDUCATION:
          return this.handleEducationRequest(consumerInfo, requestDetails);
        case TaiwanConsumerRightType.HEALTHY_ENVIRONMENT:
          return this.handleHealthyEnvironmentRequest(
            consumerInfo,
            requestDetails
          );
        default:
          return { success: false, message: '不支援的消費者權利類型' };
      }
    } catch (error) {
      this.logAuditTrail('consumer_rights_request_error', {
        rightType,
        consumerId: consumerInfo.idNumber,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return { success: false, message: '處理消費者權利請求時發生錯誤' };
    }
  }

  /**
   * 處理安全權請求
   */
  private handleSafetyRequest(
    consumerInfo: TaiwanConsumerInfo,
    details: unknown
  ): { success: boolean; message: string; data?: unknown } {
    this.logAuditTrail('safety_request', {
      consumerId: consumerInfo.idNumber,
      details,
    });
    return {
      success: true,
      message: '安全權請求已處理',
      data: { requestId: `safety_${Date.now()}`, status: 'processed' },
    };
  }

  /**
   * 處理資訊權請求
   */
  private handleInformationRequest(
    consumerInfo: TaiwanConsumerInfo,
    details: unknown
  ): { success: boolean; message: string; data?: unknown } {
    this.logAuditTrail('information_request', {
      consumerId: consumerInfo.idNumber,
      details,
    });
    return {
      success: true,
      message: '資訊權請求已處理',
      data: { requestId: `information_${Date.now()}`, status: 'processed' },
    };
  }

  /**
   * 處理選擇權請求
   */
  private handleChoiceRequest(
    consumerInfo: TaiwanConsumerInfo,
    details: unknown
  ): { success: boolean; message: string; data?: unknown } {
    this.logAuditTrail('choice_request', {
      consumerId: consumerInfo.idNumber,
      details,
    });
    return {
      success: true,
      message: '選擇權請求已處理',
      data: { requestId: `choice_${Date.now()}`, status: 'processed' },
    };
  }

  /**
   * 處理表達權請求
   */
  private handleRepresentationRequest(
    consumerInfo: TaiwanConsumerInfo,
    details: unknown
  ): { success: boolean; message: string; data?: unknown } {
    this.logAuditTrail('representation_request', {
      consumerId: consumerInfo.idNumber,
      details,
    });
    return {
      success: true,
      message: '表達權請求已處理',
      data: { requestId: `representation_${Date.now()}`, status: 'processed' },
    };
  }

  /**
   * 處理求償權請求
   */
  private handleCompensationRequest(
    consumerInfo: TaiwanConsumerInfo,
    details: unknown
  ): { success: boolean; message: string; data?: unknown } {
    this.logAuditTrail('compensation_request', {
      consumerId: consumerInfo.idNumber,
      details,
    });
    return {
      success: true,
      message: '求償權請求已處理',
      data: { requestId: `compensation_${Date.now()}`, status: 'processed' },
    };
  }

  /**
   * 處理教育權請求
   */
  private handleEducationRequest(
    consumerInfo: TaiwanConsumerInfo,
    details: unknown
  ): { success: boolean; message: string; data?: unknown } {
    this.logAuditTrail('education_request', {
      consumerId: consumerInfo.idNumber,
      details,
    });
    return {
      success: true,
      message: '教育權請求已處理',
      data: { requestId: `education_${Date.now()}`, status: 'processed' },
    };
  }

  /**
   * 處理健康環境權請求
   */
  private handleHealthyEnvironmentRequest(
    consumerInfo: TaiwanConsumerInfo,
    details: unknown
  ): { success: boolean; message: string; data?: unknown } {
    this.logAuditTrail('healthy_environment_request', {
      consumerId: consumerInfo.idNumber,
      details,
    });
    return {
      success: true,
      message: '健康環境權請求已處理',
      data: {
        requestId: `healthy_environment_${Date.now()}`,
        status: 'processed',
      },
    };
  }

  /**
   * 生成合規報告
   */
  public generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): TaiwanConsumerProtectionComplianceResult {
    const periodViolations = this.violations.filter(
      v => v.deadline >= startDate && v.deadline <= endDate
    );

    const periodAuditTrails = this.auditTrails.filter(
      a => a.timestamp >= startDate && a.timestamp <= endDate
    );

    const periodDisputes = this.disputes.filter(
      d => d.createdAt >= startDate && d.createdAt <= endDate
    );

    this.logAuditTrail('compliance_report_generation', {
      startDate,
      endDate,
      violationsCount: periodViolations.length,
      auditTrailsCount: periodAuditTrails.length,
      disputesCount: periodDisputes.length,
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
   * 創建違規記錄
   */
  private createViolation(
    type: TaiwanConsumerProtectionViolationType,
    description: string,
    severity: TaiwanViolationSeverity
  ): TaiwanConsumerProtectionViolation {
    return {
      id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      violationType: type,
      description,
      severity,
      applicableLaw: '消費者保護法',
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
    const penalties = {
      [TaiwanViolationSeverity.MINOR]: {
        type: TaiwanPenaltyType.CORRECTIVE_MEASURES,
        amount: 0,
      },
      [TaiwanViolationSeverity.MODERATE]: {
        type: TaiwanPenaltyType.ADMINISTRATIVE_FINE,
        amount: 30000,
      },
      [TaiwanViolationSeverity.MAJOR]: {
        type: TaiwanPenaltyType.ADMINISTRATIVE_FINE,
        amount: 150000,
      },
      [TaiwanViolationSeverity.CRITICAL]: {
        type: TaiwanPenaltyType.ADMINISTRATIVE_FINE,
        amount: 300000,
      },
    };

    const penalty = penalties[severity];
    return {
      type: penalty.type,
      amount: penalty.amount,
      description: `因違反消費者保護法第${this.getLawArticle(severity)}條`,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天
      appealable: true,
    };
  }

  /**
   * 生成改正措施
   */
  private generateCorrectiveAction(
    type: TaiwanConsumerProtectionViolationType
  ): string {
    const actions = {
      [TaiwanConsumerProtectionViolationType.PRODUCT_SAFETY_VIOLATION]:
        '立即停止銷售不安全商品',
      [TaiwanConsumerProtectionViolationType.FALSE_ADVERTISING]:
        '立即停止不實廣告',
      [TaiwanConsumerProtectionViolationType.UNFAIR_CONTRACT]:
        '立即修正不公平契約條款',
      [TaiwanConsumerProtectionViolationType.PRICE_GOUGING]:
        '立即調整不合理價格',
      [TaiwanConsumerProtectionViolationType.SERVICE_DEFECT]:
        '立即改善服務品質',
      [TaiwanConsumerProtectionViolationType.CONSUMER_RIGHTS_VIOLATION]:
        '立即建立消費者權利保護機制',
      [TaiwanConsumerProtectionViolationType.LABELING_VIOLATION]:
        '立即修正商品標示',
      [TaiwanConsumerProtectionViolationType.WARRANTY_VIOLATION]:
        '立即提供適當保證',
      [TaiwanConsumerProtectionViolationType.OTHER]: '立即改善相關缺失',
    };

    return actions[type] || '立即改善相關缺失';
  }

  /**
   * 取得期限天數
   */
  private getDeadlineDays(severity: TaiwanViolationSeverity): number {
    const days = {
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
    const articles = {
      [TaiwanViolationSeverity.MINOR]: '7',
      [TaiwanViolationSeverity.MODERATE]: '22',
      [TaiwanViolationSeverity.MAJOR]: '36',
      [TaiwanViolationSeverity.CRITICAL]: '56',
    };
    return articles[severity];
  }

  /**
   * 決定合規狀態
   */
  private determineComplianceStatus(
    violations: TaiwanConsumerProtectionViolation[]
  ): TaiwanComplianceStatus {
    if (violations.length === 0) return TaiwanComplianceStatus.COMPLIANT;

    const criticalViolations = violations.filter(
      v => v.severity === TaiwanViolationSeverity.CRITICAL
    );
    const majorViolations = violations.filter(
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
    violations: TaiwanConsumerProtectionViolation[]
  ): TaiwanRiskLevel {
    if (violations.length === 0) return TaiwanRiskLevel.LOW;

    const criticalCount = violations.filter(
      v => v.severity === TaiwanViolationSeverity.CRITICAL
    ).length;
    const majorCount = violations.filter(
      v => v.severity === TaiwanViolationSeverity.MAJOR
    ).length;
    const moderateCount = violations.filter(
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
    violations: TaiwanConsumerProtectionViolation[]
  ): string[] {
    const recommendations: string[] = [];

    if (violations.length === 0) {
      recommendations.push('持續監控消費者保護合規狀況');
      recommendations.push('定期更新消費者權利保護機制');
      recommendations.push('加強員工消費者保護教育訓練');
      return recommendations;
    }

    const violationTypes = violations.map(v => v.violationType);

    if (
      violationTypes.includes(
        TaiwanConsumerProtectionViolationType.PRODUCT_SAFETY_VIOLATION
      )
    ) {
      recommendations.push('建立商品安全評估機制');
    }

    if (
      violationTypes.includes(
        TaiwanConsumerProtectionViolationType.FALSE_ADVERTISING
      )
    ) {
      recommendations.push('建立廣告內容審查機制');
    }

    if (
      violationTypes.includes(
        TaiwanConsumerProtectionViolationType.UNFAIR_CONTRACT
      )
    ) {
      recommendations.push('建立契約條款審查機制');
    }

    if (
      violationTypes.includes(
        TaiwanConsumerProtectionViolationType.CONSUMER_RIGHTS_VIOLATION
      )
    ) {
      recommendations.push('建立消費者權利保護機制');
    }

    recommendations.push('建立定期合規檢查機制');
    recommendations.push('加強員工教育訓練');

    return recommendations;
  }

  /**
   * 記錄審計追蹤
   */
  private logAuditTrail(action: string, details: Record<string, any>): void {
    const auditTrail: TaiwanAuditTrail = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      description: `消費者保護法相關操作: ${action}`,
      actor: 'system',
      timestamp: new Date(),
      details,
    };

    this.auditTrails.push(auditTrail);
  }

  /**
   * 取得審計追蹤
   */
  public getAuditTrails(): TaiwanAuditTrail[] {
    return [...this.auditTrails];
  }

  /**
   * 取得違規記錄
   */
  public getViolations(): TaiwanConsumerProtectionViolation[] {
    return [...this.violations];
  }

  /**
   * 取得爭議記錄
   */
  public getDisputes(): TaiwanConsumerDispute[] {
    return [...this.disputes];
  }

  /**
   * 清理過期資料
   */
  public cleanup(): void {
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    this.auditTrails = this.auditTrails.filter(a => a.timestamp > oneYearAgo);
    this.violations = this.violations.filter(
      v => v.status !== TaiwanViolationStatus.CLOSED
    );
    this.disputes = this.disputes.filter(
      d => d.status !== TaiwanDisputeStatus.CLOSED
    );
  }
}
