import type {
  MacauDataProcessing,
  MacauCrossBorderTransfer,
  MacauDataSubjectRequest,
  MacauComplianceResult,
  MacauViolation,
  MacauAuditTrail,
} from '../types/personalDataProtection';
import {
  MacauComplianceStatus,
  MacauRiskLevel,
  MacauDataCategory,
  MacauProcessingMethod,
  MacauSecurityMeasure,
  MacauConsentType,
  MacauDataSubjectRight,
} from '../types/personalDataProtection';

export class MacauPersonalDataProtectionService {
  private static instance: MacauPersonalDataProtectionService;
  private readonly auditTrails: MacauAuditTrail[] = [];
  private readonly violations: MacauViolation[] = [];
  private readonly dataSubjectRequests: MacauDataSubjectRequest[] = [];

  private constructor() {}

  public static getInstance(): MacauPersonalDataProtectionService {
    if (!MacauPersonalDataProtectionService.instance) {
      MacauPersonalDataProtectionService.instance =
        new MacauPersonalDataProtectionService();
    }
    return MacauPersonalDataProtectionService.instance;
  }

  public validateDataProcessing(
    processing: MacauDataProcessing
  ): MacauComplianceResult {
    const violations: MacauViolation[] = [];
    let riskLevel = MacauRiskLevel.LOW;

    // 檢查法律基礎
    if (!processing.legalBasis) {
      violations.push({
        id: `violation_${Date.now()}_1`,
        type: 'LEGAL_BASIS_MISSING',
        description: '缺少法律基礎',
        severity: MacauRiskLevel.HIGH,
        article: '第6條',
        penalty: '最高罰款澳門幣50萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      riskLevel = MacauRiskLevel.HIGH;
    }

    // 檢查敏感資料處理
    if (processing.dataCategories.includes(MacauDataCategory.SENSITIVE)) {
      if (
        !processing.consentRequired ||
        processing.consentType !== MacauConsentType.EXPLICIT
      ) {
        violations.push({
          id: `violation_${Date.now()}_2`,
          type: 'SENSITIVE_DATA_CONSENT',
          description: '敏感資料需要明確同意',
          severity: MacauRiskLevel.CRITICAL,
          article: '第7條',
          penalty: '最高罰款澳門幣100萬元',
          rectificationRequired: true,
          rectificationDeadline: new Date(
            Date.now() + 15 * 24 * 60 * 60 * 1000
          ),
          detectedAt: new Date(),
        });
        riskLevel = MacauRiskLevel.CRITICAL;
      }
    }

    // 檢查資料保留期限
    if (processing.dataRetentionPeriod > 2555) {
      // 7年
      violations.push({
        id: `violation_${Date.now()}_3`,
        type: 'RETENTION_PERIOD_EXCESSIVE',
        description: '資料保留期限過長',
        severity: MacauRiskLevel.MEDIUM,
        article: '第5條',
        penalty: '最高罰款澳門幣30萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      if (riskLevel === MacauRiskLevel.LOW) riskLevel = MacauRiskLevel.MEDIUM;
    }

    // 檢查安全措施
    if (processing.securityMeasures.length < 3) {
      violations.push({
        id: `violation_${Date.now()}_4`,
        type: 'INSUFFICIENT_SECURITY',
        description: '安全措施不足',
        severity: MacauRiskLevel.HIGH,
        article: '第15條',
        penalty: '最高罰款澳門幣50萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      if (riskLevel === MacauRiskLevel.LOW) riskLevel = MacauRiskLevel.HIGH;
    }

    // 檢查跨境傳輸
    if (
      processing.crossBorderTransfer &&
      (!processing.recipientCountries ||
        processing.recipientCountries.length === 0)
    ) {
      violations.push({
        id: `violation_${Date.now()}_5`,
        type: 'CROSS_BORDER_TRANSFER_DETAILS',
        description: '跨境傳輸缺少目的地國家資訊',
        severity: MacauRiskLevel.HIGH,
        article: '第20條',
        penalty: '最高罰款澳門幣50萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      if (riskLevel === MacauRiskLevel.LOW) riskLevel = MacauRiskLevel.HIGH;
    }

    const _complianceStatus =
      violations.length === 0
        ? MacauComplianceStatus.COMPLIANT
        : MacauComplianceStatus.NON_COMPLIANT;

    const result: MacauComplianceResult = {
      id: `result_${Date.now()}`,
      processingId: processing.id,
      complianceStatus,
      riskLevel,
      violations,
      recommendations: this.generateRecommendations(violations),
      assessmentDate: new Date(),
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    };

    this.logAuditTrail(
      'DATA_PROCESSING_VALIDATION',
      processing.id,
      `驗證資料處理合規性，結果：${complianceStatus}`
    );
    this.violations.push(...violations);

    return result;
  }

  public processDataSubjectRequest(
    request: MacauDataSubjectRequest
  ): MacauDataSubjectRequest {
    const _processedRequest = { ...request };

    // 根據權利類型處理請求
    switch (request.rightType) {
      case MacauDataSubjectRight.ACCESS:
        processedRequest.response =
          '已提供資料副本，包含處理目的、資料類別、接收者等資訊';
        break;
      case MacauDataSubjectRight.RECTIFICATION:
        processedRequest.response = '已更新不準確或不完整的個人資料';
        break;
      case MacauDataSubjectRight.ERASURE:
        processedRequest.response = '已刪除相關個人資料，除非有法律保留義務';
        break;
      case MacauDataSubjectRight.RESTRICTION:
        processedRequest.response = '已限制資料處理，僅用於法律主張或保護權利';
        break;
      case MacauDataSubjectRight.PORTABILITY:
        processedRequest.response = '已提供結構化、常用且機器可讀格式的資料';
        break;
      case MacauDataSubjectRight.OBJECTION:
        processedRequest.response = '已停止基於合法利益的資料處理';
        break;
    }

    processedRequest.status = MacauComplianceStatus.COMPLIANT;
    processedRequest.processedAt = new Date();

    this.dataSubjectRequests.push(processedRequest);
    this.logAuditTrail(
      'DATA_SUBJECT_REQUEST_PROCESSED',
      request.id,
      `處理資料主體請求：${request.rightType}`
    );

    return processedRequest;
  }

  public validateCrossBorderTransfer(
    transfer: MacauCrossBorderTransfer
  ): MacauComplianceResult {
    const violations: MacauViolation[] = [];
    let riskLevel = MacauRiskLevel.LOW;

    // 檢查目的地國家
    if (!transfer.destinationCountry) {
      violations.push({
        id: `violation_${Date.now()}_6`,
        type: 'DESTINATION_COUNTRY_MISSING',
        description: '缺少目的地國家資訊',
        severity: MacauRiskLevel.HIGH,
        article: '第20條',
        penalty: '最高罰款澳門幣50萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      riskLevel = MacauRiskLevel.HIGH;
    }

    // 檢查適當性決定
    if (
      !transfer.adequacyDecision &&
      !transfer.standardContractualClauses &&
      !transfer.bindingCorporateRules
    ) {
      violations.push({
        id: `violation_${Date.now()}_7`,
        type: 'TRANSFER_SAFEGUARDS_MISSING',
        description: '缺少適當的傳輸保障措施',
        severity: MacauRiskLevel.CRITICAL,
        article: '第20條',
        penalty: '最高罰款澳門幣100萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      riskLevel = MacauRiskLevel.CRITICAL;
    }

    // 檢查風險評估
    if (
      transfer.riskAssessment === MacauRiskLevel.HIGH ||
      transfer.riskAssessment === MacauRiskLevel.CRITICAL
    ) {
      if (!transfer.approvalRequired) {
        violations.push({
          id: `violation_${Date.now()}_8`,
          type: 'HIGH_RISK_TRANSFER_APPROVAL',
          description: '高風險跨境傳輸需要事先批准',
          severity: MacauRiskLevel.HIGH,
          article: '第20條',
          penalty: '最高罰款澳門幣50萬元',
          rectificationRequired: true,
          rectificationDeadline: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ),
          detectedAt: new Date(),
        });
        if (riskLevel === MacauRiskLevel.LOW) riskLevel = MacauRiskLevel.HIGH;
      }
    }

    const _complianceStatus =
      violations.length === 0
        ? MacauComplianceStatus.COMPLIANT
        : MacauComplianceStatus.NON_COMPLIANT;

    const result: MacauComplianceResult = {
      id: `result_${Date.now()}`,
      processingId: transfer.id,
      complianceStatus,
      riskLevel,
      violations,
      recommendations: this.generateRecommendations(violations),
      assessmentDate: new Date(),
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    };

    this.logAuditTrail(
      'CROSS_BORDER_TRANSFER_VALIDATION',
      transfer.id,
      `驗證跨境傳輸合規性，結果：${complianceStatus}`
    );
    this.violations.push(...violations);

    return result;
  }

  public generateComplianceReport(startDate: Date, endDate: Date): unknown {
    const _periodViolations = this.violations.filter(
      v => v.detectedAt >= startDate && v.detectedAt <= endDate
    );

    const _periodRequests = this.dataSubjectRequests.filter(
      r => r.requestedAt >= startDate && r.requestedAt <= endDate
    );

    const _report = {
      period: { startDate, endDate },
      summary: {
        totalViolations: periodViolations.length,
        totalRequests: periodRequests.length,
        complianceRate: this.calculateComplianceRate(periodViolations),
        riskDistribution: this.calculateRiskDistribution(periodViolations),
      },
      violations: periodViolations,
      dataSubjectRequests: periodRequests,
      recommendations: this.generateOverallRecommendations(periodViolations),
    };

    this.logAuditTrail(
      'COMPLIANCE_REPORT_GENERATED',
      'SYSTEM',
      `生成合規報告：${startDate.toISOString()} 至 ${endDate.toISOString()}`
    );

    return report;
  }

  private generateRecommendations(violations: MacauViolation[]): string[] {
    const recommendations: string[] = [];

    violations.forEach(violation => {
      switch (violation.type) {
        case 'LEGAL_BASIS_MISSING':
          recommendations.push(
            '建立明確的法律基礎文件，說明資料處理的合法依據'
          );
          break;
        case 'SENSITIVE_DATA_CONSENT':
          recommendations.push(
            '實施明確同意機制，確保敏感資料處理獲得明確授權'
          );
          break;
        case 'RETENTION_PERIOD_EXCESSIVE':
          recommendations.push('檢討資料保留政策，確保符合最小化原則');
          break;
        case 'INSUFFICIENT_SECURITY':
          recommendations.push('加強安全措施，實施加密、存取控制等技術保障');
          break;
        case 'CROSS_BORDER_TRANSFER_DETAILS':
          recommendations.push('完善跨境傳輸文件，明確目的地國家和保障措施');
          break;
        case 'DESTINATION_COUNTRY_MISSING':
          recommendations.push('明確指定跨境傳輸的目的地國家');
          break;
        case 'TRANSFER_SAFEGUARDS_MISSING':
          recommendations.push('實施標準契約條款或企業約束規則等保障措施');
          break;
        case 'HIGH_RISK_TRANSFER_APPROVAL':
          recommendations.push('建立高風險跨境傳輸的審批機制');
          break;
      }
    });

    return recommendations;
  }

  private generateOverallRecommendations(
    violations: MacauViolation[]
  ): string[] {
    const recommendations: string[] = [];

    if (violations.length > 0) {
      recommendations.push('定期進行合規審查，及時發現和修正違規行為');
      recommendations.push('加強員工培訓，提高個人資料保護意識');
      recommendations.push('建立完善的內部控制機制，確保合規要求得到落實');
    }

    return recommendations;
  }

  private calculateComplianceRate(violations: MacauViolation[]): number {
    const _totalAssessments = violations.length + 10; // 假設有10個合規評估
    return ((totalAssessments - violations.length) / totalAssessments) * 100;
  }

  private calculateRiskDistribution(
    violations: MacauViolation[]
  ): Record<MacauRiskLevel, number> {
    const _distribution = {
      [MacauRiskLevel.LOW]: 0,
      [MacauRiskLevel.MEDIUM]: 0,
      [MacauRiskLevel.HIGH]: 0,
      [MacauRiskLevel.CRITICAL]: 0,
    };

    violations.forEach(violation => {
      distribution[violation.severity]++;
    });

    return distribution;
  }

  private logAuditTrail(action: string, entity: string, details: string): void {
    const auditTrail: MacauAuditTrail = {
      id: `audit_${Date.now()}`,
      action,
      entity,
      details,
      timestamp: new Date(),
    };

    this.auditTrails.push(auditTrail);
  }

  public getAuditTrails(): MacauAuditTrail[] {
    return [...this.auditTrails];
  }

  public getViolations(): MacauViolation[] {
    return [...this.violations];
  }

  public getDataSubjectRequests(): MacauDataSubjectRequest[] {
    return [...this.dataSubjectRequests];
  }
}
