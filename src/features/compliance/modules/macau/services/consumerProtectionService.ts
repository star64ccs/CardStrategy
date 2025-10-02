import type {
  MacauConsumerComplaint,
  MacauProductLabeling,
  MacauAdvertising,
  MacauComplianceResult,
  MacauViolation,
  MacauAuditTrail,
} from '../types/consumerProtection';
import {
  MacauComplianceStatus,
  MacauRiskLevel,
  MacauConsumerRight,
  MacauProductCategory,
  MacauLabelingRequirement,
  MacauDisputeType,
  MacauDisputeStatus,
} from '../types/consumerProtection';

export class MacauConsumerProtectionService {
  private static instance: MacauConsumerProtectionService;
  private readonly auditTrails: MacauAuditTrail[] = [];
  private readonly violations: MacauViolation[] = [];
  private readonly complaints: MacauConsumerComplaint[] = [];

  private constructor() {}

  public static getInstance(): MacauConsumerProtectionService {
    if (!MacauConsumerProtectionService.instance) {
      MacauConsumerProtectionService.instance =
        new MacauConsumerProtectionService();
    }
    return MacauConsumerProtectionService.instance;
  }

  public validateConsumerRights(
    rights: MacauConsumerRight[]
  ): MacauComplianceResult {
    const violations: MacauViolation[] = [];
    let riskLevel = MacauRiskLevel.LOW;

    // Check基本消費者權利
    const _requiredRights = [
      MacauConsumerRight.SAFETY,
      MacauConsumerRight.INFORMATION,
      MacauConsumerRight.CHOICE,
      MacauConsumerRight.REDRESS,
    ];

    const _missingRights = requiredRights.filter(
      right => !rights.includes(right)
    );

    if (missingRights.length > 0) {
      violations.push({
        id: `violation_${Date.now()}_1`,
        type: 'MISSING_CONSUMER_RIGHTS',
        description: `缺少基本消費者權利：${missingRights.join(', ')}`,
        severity: MacauRiskLevel.HIGH,
        article: '第7條',
        penalty: '最高罰款澳門幣30萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      riskLevel = MacauRiskLevel.HIGH;
    }

    // Check安全權
    if (!rights.includes(MacauConsumerRight.SAFETY)) {
      violations.push({
        id: `violation_${Date.now()}_2`,
        type: 'SAFETY_RIGHT_MISSING',
        description: '缺少消費者安全權',
        severity: MacauRiskLevel.CRITICAL,
        article: '第8條',
        penalty: '最高罰款澳門幣50萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      riskLevel = MacauRiskLevel.CRITICAL;
    }

    const _complianceStatus =
      violations.length === 0
        ? MacauComplianceStatus.COMPLIANT
        : MacauComplianceStatus.NON_COMPLIANT;

    const result: MacauComplianceResult = {
      id: `result_${Date.now()}`,
      entityId: 'consumer_rights_validation',
      entityType: 'consumer_rights',
      complianceStatus,
      riskLevel,
      violations,
      recommendations: this.generateRecommendations(violations),
      assessmentDate: new Date(),
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    };

    this.logAuditTrail(
      'CONSUMER_RIGHTS_VALIDATION',
      'consumer_rights',
      `驗證消費者權利合規性，結果：${complianceStatus}`
    );
    this.violations.push(...violations);

    return result;
  }

  public validateProductLabeling(
    labeling: MacauProductLabeling
  ): MacauComplianceResult {
    const violations: MacauViolation[] = [];
    let riskLevel = MacauRiskLevel.LOW;

    // Check產品名稱
    if (!labeling.productName || labeling.productName.trim() === '') {
      violations.push({
        id: `violation_${Date.now()}_3`,
        type: 'MISSING_PRODUCT_NAME',
        description: '缺少產品名稱',
        severity: MacauRiskLevel.HIGH,
        article: '第12條',
        penalty: '最高罰款澳門幣20萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      riskLevel = MacauRiskLevel.HIGH;
    }

    // Check製造商資訊
    if (!labeling.manufacturer || labeling.manufacturer.trim() === '') {
      violations.push({
        id: `violation_${Date.now()}_4`,
        type: 'MISSING_MANUFACTURER',
        description: '缺少製造商資訊',
        severity: MacauRiskLevel.HIGH,
        article: '第12條',
        penalty: '最高罰款澳門幣20萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      if (riskLevel === MacauRiskLevel.LOW) riskLevel = MacauRiskLevel.HIGH;
    }

    // Check安全Warning
    if (!labeling.safetyWarnings || labeling.safetyWarnings.length === 0) {
      violations.push({
        id: `violation_${Date.now()}_5`,
        type: 'MISSING_SAFETY_WARNINGS',
        description: '缺少安全警告',
        severity: MacauRiskLevel.MEDIUM,
        article: '第13條',
        penalty: '最高罰款澳門幣15萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      if (riskLevel === MacauRiskLevel.LOW) riskLevel = MacauRiskLevel.MEDIUM;
    }

    // Check使用Description
    if (!labeling.usageInstructions) {
      violations.push({
        id: `violation_${Date.now()}_6`,
        type: 'MISSING_USAGE_INSTRUCTIONS',
        description: '缺少使用說明',
        severity: MacauRiskLevel.MEDIUM,
        article: '第13條',
        penalty: '最高罰款澳門幣15萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      if (riskLevel === MacauRiskLevel.LOW) riskLevel = MacauRiskLevel.MEDIUM;
    }

    const _complianceStatus =
      violations.length === 0
        ? MacauComplianceStatus.COMPLIANT
        : MacauComplianceStatus.NON_COMPLIANT;

    const result: MacauComplianceResult = {
      id: `result_${Date.now()}`,
      entityId: labeling.id,
      entityType: 'product_labeling',
      complianceStatus,
      riskLevel,
      violations,
      recommendations: this.generateRecommendations(violations),
      assessmentDate: new Date(),
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    };

    this.logAuditTrail(
      'PRODUCT_LABELING_VALIDATION',
      labeling.id,
      `驗證產品標籤合規性，結果：${complianceStatus}`
    );
    this.violations.push(...violations);

    return result;
  }

  public processConsumerComplaint(
    complaint: MacauConsumerComplaint
  ): MacauConsumerComplaint {
    const _processedComplaint = { ...complaint };

    // Root據投訴Class型Handle
    switch (complaint.complaintType) {
      case MacauDisputeType.PRODUCT_DEFECT:
        processedComplaint.status = MacauDisputeStatus.UNDER_INVESTIGATION;
        processedComplaint.resolution = '已安排產品檢測和調查';
        break;
      case MacauDisputeType.FALSE_ADVERTISING:
        processedComplaint.status = MacauDisputeStatus.UNDER_INVESTIGATION;
        processedComplaint.resolution = '已啟動廣告內容審查程序';
        break;
      case MacauDisputeType.UNFAIR_TERMS:
        processedComplaint.status = MacauDisputeStatus.UNDER_INVESTIGATION;
        processedComplaint.resolution = '已安排合約條款審查';
        break;
      case MacauDisputeType.PRICE_GOUGING:
        processedComplaint.status = MacauDisputeStatus.UNDER_INVESTIGATION;
        processedComplaint.resolution = '已啟動價格調查程序';
        break;
      case MacauDisputeType.SERVICE_QUALITY:
        processedComplaint.status = MacauDisputeStatus.UNDER_INVESTIGATION;
        processedComplaint.resolution = '已安排Service品質評估';
        break;
      case MacauDisputeType.REFUND_REFUSAL:
        processedComplaint.status = MacauDisputeStatus.UNDER_INVESTIGATION;
        processedComplaint.resolution = '已啟動退款程序審查';
        break;
    }

    processedComplaint.resolvedAt = new Date();

    this.complaints.push(processedComplaint);
    this.logAuditTrail(
      'CONSUMER_COMPLAINT_PROCESSED',
      complaint.id,
      `處理消費者投訴：${complaint.complaintType}`
    );

    return processedComplaint;
  }

  public validateAdvertising(
    advertising: MacauAdvertising
  ): MacauComplianceResult {
    const violations: MacauViolation[] = [];
    let riskLevel = MacauRiskLevel.LOW;

    // Check廣告ContentTrue實性
    if (!advertising.content || advertising.content.trim() === '') {
      violations.push({
        id: `violation_${Date.now()}_7`,
        type: 'EMPTY_ADVERTISING_CONTENT',
        description: '廣告內容為空',
        severity: MacauRiskLevel.MEDIUM,
        article: '第15條',
        penalty: '最高罰款澳門幣25萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      riskLevel = MacauRiskLevel.MEDIUM;
    }

    // Check虛False聲明
    if (advertising.claims && advertising.claims.length > 0) {
      const _falseClaims = advertising.claims.filter(
        claim =>
          claim.includes('100%') ||
          claim.includes('絕對') ||
          claim.includes('保證')
      );

      if (falseClaims.length > 0) {
        violations.push({
          id: `violation_${Date.now()}_8`,
          type: 'FALSE_ADVERTISING_CLAIMS',
          description: '包含虛假或誇大聲明',
          severity: MacauRiskLevel.HIGH,
          article: '第16條',
          penalty: '最高罰款澳門幣40萬元',
          rectificationRequired: true,
          rectificationDeadline: new Date(
            Date.now() + 15 * 24 * 60 * 60 * 1000
          ),
          detectedAt: new Date(),
        });
        riskLevel = MacauRiskLevel.HIGH;
      }
    }

    // Check目標受眾
    if (!advertising.targetAudience) {
      violations.push({
        id: `violation_${Date.now()}_9`,
        type: 'MISSING_TARGET_AUDIENCE',
        description: '缺少目標受眾資訊',
        severity: MacauRiskLevel.LOW,
        article: '第17條',
        penalty: '最高罰款澳門幣10萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      if (riskLevel === MacauRiskLevel.LOW) riskLevel = MacauRiskLevel.LOW;
    }

    const _complianceStatus =
      violations.length === 0
        ? MacauComplianceStatus.COMPLIANT
        : MacauComplianceStatus.NON_COMPLIANT;

    const result: MacauComplianceResult = {
      id: `result_${Date.now()}`,
      entityId: advertising.id,
      entityType: 'advertising',
      complianceStatus,
      riskLevel,
      violations,
      recommendations: this.generateRecommendations(violations),
      assessmentDate: new Date(),
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    };

    this.logAuditTrail(
      'ADVERTISING_VALIDATION',
      advertising.id,
      `驗證廣告合規性，結果：${complianceStatus}`
    );
    this.violations.push(...violations);

    return result;
  }

  public generateComplianceReport(startDate: Date, endDate: Date): unknown {
    const _periodViolations = this.violations.filter(
      v => v.detectedAt >= startDate && v.detectedAt <= endDate
    );

    const _periodComplaints = this.complaints.filter(
      c => c.filedAt >= startDate && c.filedAt <= endDate
    );

    const _report = {
      period: { startDate, endDate },
      summary: {
        totalViolations: periodViolations.length,
        totalComplaints: periodComplaints.length,
        complianceRate: this.calculateComplianceRate(periodViolations),
        riskDistribution: this.calculateRiskDistribution(periodViolations),
        complaintResolutionRate:
          this.calculateComplaintResolutionRate(periodComplaints),
      },
      violations: periodViolations,
      complaints: periodComplaints,
      recommendations: this.generateOverallRecommendations(periodViolations),
    };

    this.logAuditTrail(
      'COMPLIANCE_REPORT_GENERATED',
      'SYSTEM',
      `生成消費者保護合規報告：${startDate.toISOString()} 至 ${endDate.toISOString()}`
    );

    return report;
  }

  private generateRecommendations(violations: MacauViolation[]): string[] {
    const recommendations: string[] = [];

    violations.forEach(violation => {
      switch (violation.type) {
        case 'MISSING_CONSUMER_RIGHTS':
          recommendations.push(
            '建立完整的消費者權利保護機制，確保所有基本權利得到保障'
          );
          break;
        case 'SAFETY_RIGHT_MISSING':
          recommendations.push('優先建立產品安全監控和召回機制');
          break;
        case 'MISSING_PRODUCT_NAME':
          recommendations.push('確保所有產品都有明確的產品名稱標識');
          break;
        case 'MISSING_MANUFACTURER':
          recommendations.push('在產品標籤上清楚標示製造商資訊');
          break;
        case 'MISSING_SAFETY_WARNINGS':
          recommendations.push('為有安全風險的產品添加適當的安全警告');
          break;
        case 'MISSING_USAGE_INSTRUCTIONS':
          recommendations.push('提供清楚的使用說明和注意事項');
          break;
        case 'EMPTY_ADVERTISING_CONTENT':
          recommendations.push('確保廣告內容完整且真實');
          break;
        case 'FALSE_ADVERTISING_CLAIMS':
          recommendations.push('避免使用誇大或虛假的廣告聲明');
          break;
        case 'MISSING_TARGET_AUDIENCE':
          recommendations.push('明確標示廣告的目標受眾群體');
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
      recommendations.push('建立消費者投訴快速處理機制');
      recommendations.push('加強產品品質控制和安全監測');
      recommendations.push('定期進行廣告內容審查');
      recommendations.push('提供消費者教育和資訊Service');
    }

    return recommendations;
  }

  private calculateComplianceRate(violations: MacauViolation[]): number {
    const _totalAssessments = violations.length + 10; // False設有10個合規評估
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

  private calculateComplaintResolutionRate(
    complaints: MacauConsumerComplaint[]
  ): number {
    if (complaints.length === 0) return 100;

    const _resolvedComplaints = complaints.filter(
      c =>
        c.status === MacauDisputeStatus.RESOLVED ||
        c.status === MacauDisputeStatus.CLOSED
    );

    return (resolvedComplaints.length / complaints.length) * 100;
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

  public getComplaints(): MacauConsumerComplaint[] {
    return [...this.complaints];
  }
}
