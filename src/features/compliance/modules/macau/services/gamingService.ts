import type {
  MacauGamingLicense,
  MacauGamingOperation,
  MacauResponsibleGaming,
  MacauAntiMoneyLaundering,
  MacauComplianceResult,
  MacauViolation,
  MacauAuditTrail,
} from '../types/gaming';
import {
  MacauComplianceStatus,
  MacauRiskLevel,
  MacauGamingLicenseType,
  MacauGamingActivity,
  MacauGamingRegulation,
  MacauGamingViolationType,
  MacauGamingCompliance,
} from '../types/gaming';

export class MacauGamingService {
  private static instance: MacauGamingService;
  private readonly auditTrails: MacauAuditTrail[] = [];
  private readonly violations: MacauViolation[] = [];

  private constructor() {}

  public static getInstance(): MacauGamingService {
    if (!MacauGamingService.instance) {
      MacauGamingService.instance = new MacauGamingService();
    }
    return MacauGamingService.instance;
  }

  public validateGamingLicense(
    license: MacauGamingLicense
  ): MacauComplianceResult {
    const violations: MacauViolation[] = [];
    let riskLevel = MacauRiskLevel.LOW;

    // 檢查執照有效期
    const _now = new Date();
    if (license.validTo < now) {
      violations.push({
        id: `violation_${Date.now()}_1`,
        type: 'LICENSE_EXPIRED',
        description: '博彩執照已過期',
        severity: MacauRiskLevel.CRITICAL,
        article: '第7條',
        penalty: '最高罰款澳門幣500萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      riskLevel = MacauRiskLevel.CRITICAL;
    }

    // 檢查執照即將到期
    const _thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    if (license.validTo <= thirtyDaysFromNow && !license.renewalRequired) {
      violations.push({
        id: `violation_${Date.now()}_2`,
        type: 'LICENSE_RENEWAL_REQUIRED',
        description: '執照即將到期，需要申請續期',
        severity: MacauRiskLevel.HIGH,
        article: '第8條',
        penalty: '最高罰款澳門幣100萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      if (riskLevel === MacauRiskLevel.LOW) riskLevel = MacauRiskLevel.HIGH;
    }

    // 檢查執照持有人資訊
    if (!license.licenseeName || license.licenseeName.trim() === '') {
      violations.push({
        id: `violation_${Date.now()}_3`,
        type: 'MISSING_LICENSEE_INFO',
        description: '缺少執照持有人資訊',
        severity: MacauRiskLevel.HIGH,
        article: '第9條',
        penalty: '最高罰款澳門幣50萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      if (riskLevel === MacauRiskLevel.LOW) riskLevel = MacauRiskLevel.HIGH;
    }

    // 檢查營業地址
    if (!license.businessAddress || license.businessAddress.trim() === '') {
      violations.push({
        id: `violation_${Date.now()}_4`,
        type: 'MISSING_BUSINESS_ADDRESS',
        description: '缺少營業地址',
        severity: MacauRiskLevel.MEDIUM,
        article: '第10條',
        penalty: '最高罰款澳門幣30萬元',
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
      entityId: license.id,
      entityType: 'gaming_license',
      complianceStatus,
      riskLevel,
      violations,
      recommendations: this.generateRecommendations(violations),
      assessmentDate: new Date(),
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    };

    this.logAuditTrail(
      'GAMING_LICENSE_VALIDATION',
      license.id,
      `驗證博彩執照合規性，結果：${complianceStatus}`
    );
    this.violations.push(...violations);

    return result;
  }

  public validateGamingOperation(
    operation: MacauGamingOperation
  ): MacauComplianceResult {
    const violations: MacauViolation[] = [];
    let riskLevel = MacauRiskLevel.LOW;

    // 檢查容量限制
    if (operation.currentCapacity > operation.maxCapacity) {
      violations.push({
        id: `violation_${Date.now()}_5`,
        type: 'CAPACITY_EXCEEDED',
        description: '超出最大容量限制',
        severity: MacauRiskLevel.HIGH,
        article: '第15條',
        penalty: '最高罰款澳門幣200萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      riskLevel = MacauRiskLevel.HIGH;
    }

    // 檢查安全措施
    if (!operation.securityMeasures || operation.securityMeasures.length < 3) {
      violations.push({
        id: `violation_${Date.now()}_6`,
        type: 'INSUFFICIENT_SECURITY',
        description: '安全措施不足',
        severity: MacauRiskLevel.HIGH,
        article: '第16條',
        penalty: '最高罰款澳門幣150萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      if (riskLevel === MacauRiskLevel.LOW) riskLevel = MacauRiskLevel.HIGH;
    }

    // 檢查負責任博彩措施
    if (
      !operation.responsibleGamingMeasures ||
      operation.responsibleGamingMeasures.length < 2
    ) {
      violations.push({
        id: `violation_${Date.now()}_7`,
        type: 'INSUFFICIENT_RESPONSIBLE_GAMING',
        description: '負責任博彩措施不足',
        severity: MacauRiskLevel.MEDIUM,
        article: '第17條',
        penalty: '最高罰款澳門幣100萬元',
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
      entityId: operation.id,
      entityType: 'gaming_operation',
      complianceStatus,
      riskLevel,
      violations,
      recommendations: this.generateRecommendations(violations),
      assessmentDate: new Date(),
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    };

    this.logAuditTrail(
      'GAMING_OPERATION_VALIDATION',
      operation.id,
      `驗證博彩營運合規性，結果：${complianceStatus}`
    );
    this.violations.push(...violations);

    return result;
  }

  public validateResponsibleGaming(
    responsibleGaming: MacauResponsibleGaming
  ): MacauComplianceResult {
    const violations: MacauViolation[] = [];
    let riskLevel = MacauRiskLevel.LOW;

    // 檢查自我排除計劃
    if (!responsibleGaming.selfExclusionProgram) {
      violations.push({
        id: `violation_${Date.now()}_8`,
        type: 'MISSING_SELF_EXCLUSION',
        description: '缺少自我排除計劃',
        severity: MacauRiskLevel.HIGH,
        article: '第20條',
        penalty: '最高罰款澳門幣100萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      riskLevel = MacauRiskLevel.HIGH;
    }

    // 檢查年齡驗證
    if (!responsibleGaming.ageVerification) {
      violations.push({
        id: `violation_${Date.now()}_9`,
        type: 'MISSING_AGE_VERIFICATION',
        description: '缺少年齡驗證機制',
        severity: MacauRiskLevel.CRITICAL,
        article: '第21條',
        penalty: '最高罰款澳門幣300萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      riskLevel = MacauRiskLevel.CRITICAL;
    }

    // 檢查博彩限制
    if (
      responsibleGaming.gamingLimits.daily > 10000 ||
      responsibleGaming.gamingLimits.weekly > 50000 ||
      responsibleGaming.gamingLimits.monthly > 200000
    ) {
      violations.push({
        id: `violation_${Date.now()}_10`,
        type: 'EXCESSIVE_GAMING_LIMITS',
        description: '博彩限制設置過高',
        severity: MacauRiskLevel.MEDIUM,
        article: '第22條',
        penalty: '最高罰款澳門幣50萬元',
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
      entityId: responsibleGaming.id,
      entityType: 'responsible_gaming',
      complianceStatus,
      riskLevel,
      violations,
      recommendations: this.generateRecommendations(violations),
      assessmentDate: new Date(),
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    };

    this.logAuditTrail(
      'RESPONSIBLE_GAMING_VALIDATION',
      responsibleGaming.id,
      `驗證負責任博彩合規性，結果：${complianceStatus}`
    );
    this.violations.push(...violations);

    return result;
  }

  public validateAntiMoneyLaundering(
    aml: MacauAntiMoneyLaundering
  ): MacauComplianceResult {
    const violations: MacauViolation[] = [];
    let riskLevel = MacauRiskLevel.LOW;

    // 檢查客戶盡職調查
    if (!aml.customerDueDiligence) {
      violations.push({
        id: `violation_${Date.now()}_11`,
        type: 'MISSING_CUSTOMER_DUE_DILIGENCE',
        description: '缺少客戶盡職調查',
        severity: MacauRiskLevel.CRITICAL,
        article: '第25條',
        penalty: '最高罰款澳門幣500萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      riskLevel = MacauRiskLevel.CRITICAL;
    }

    // 檢查可疑交易報告
    if (!aml.suspiciousTransactionReporting) {
      violations.push({
        id: `violation_${Date.now()}_12`,
        type: 'MISSING_SUSPICIOUS_REPORTING',
        description: '缺少可疑交易報告機制',
        severity: MacauRiskLevel.HIGH,
        article: '第26條',
        penalty: '最高罰款澳門幣200萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      if (riskLevel === MacauRiskLevel.LOW) riskLevel = MacauRiskLevel.HIGH;
    }

    // 檢查記錄保存
    if (!aml.recordKeeping) {
      violations.push({
        id: `violation_${Date.now()}_13`,
        type: 'MISSING_RECORD_KEEPING',
        description: '缺少交易記錄保存',
        severity: MacauRiskLevel.HIGH,
        article: '第27條',
        penalty: '最高罰款澳門幣150萬元',
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
      entityId: aml.id,
      entityType: 'anti_money_laundering',
      complianceStatus,
      riskLevel,
      violations,
      recommendations: this.generateRecommendations(violations),
      assessmentDate: new Date(),
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    };

    this.logAuditTrail(
      'ANTI_MONEY_LAUNDERING_VALIDATION',
      aml.id,
      `驗證反洗錢合規性，結果：${complianceStatus}`
    );
    this.violations.push(...violations);

    return result;
  }

  public generateComplianceReport(startDate: Date, endDate: Date): unknown {
    const _periodViolations = this.violations.filter(
      v => v.detectedAt >= startDate && v.detectedAt <= endDate
    );

    const _report = {
      period: { startDate, endDate },
      summary: {
        totalViolations: periodViolations.length,
        complianceRate: this.calculateComplianceRate(periodViolations),
        riskDistribution: this.calculateRiskDistribution(periodViolations),
        licenseViolations: periodViolations.filter(v =>
          v.type.includes('LICENSE')
        ).length,
        operationViolations: periodViolations.filter(
          v => v.type.includes('CAPACITY') || v.type.includes('SECURITY')
        ).length,
        responsibleGamingViolations: periodViolations.filter(
          v => v.type.includes('SELF_EXCLUSION') || v.type.includes('AGE')
        ).length,
        amlViolations: periodViolations.filter(
          v =>
            v.type.includes('MONEY_LAUNDERING') ||
            v.type.includes('DUE_DILIGENCE')
        ).length,
      },
      violations: periodViolations,
      recommendations: this.generateOverallRecommendations(periodViolations),
    };

    this.logAuditTrail(
      'COMPLIANCE_REPORT_GENERATED',
      'SYSTEM',
      `生成博彩合規報告：${startDate.toISOString()} 至 ${endDate.toISOString()}`
    );

    return report;
  }

  private generateRecommendations(violations: MacauViolation[]): string[] {
    const recommendations: string[] = [];

    violations.forEach(violation => {
      switch (violation.type) {
        case 'LICENSE_EXPIRED':
          recommendations.push('立即申請執照續期或停止相關博彩活動');
          break;
        case 'LICENSE_RENEWAL_REQUIRED':
          recommendations.push('提前準備執照續期申請文件');
          break;
        case 'MISSING_LICENSEE_INFO':
          recommendations.push('完善執照持有人資訊登記');
          break;
        case 'MISSING_BUSINESS_ADDRESS':
          recommendations.push('更新營業地址資訊');
          break;
        case 'CAPACITY_EXCEEDED':
          recommendations.push('立即控制入場人數，確保不超過容量限制');
          break;
        case 'INSUFFICIENT_SECURITY':
          recommendations.push('加強安全措施，包括監控、警衛等');
          break;
        case 'INSUFFICIENT_RESPONSIBLE_GAMING':
          recommendations.push('實施更多負責任博彩措施');
          break;
        case 'MISSING_SELF_EXCLUSION':
          recommendations.push('建立自我排除計劃和機制');
          break;
        case 'MISSING_AGE_VERIFICATION':
          recommendations.push('實施嚴格的年齡驗證程序');
          break;
        case 'EXCESSIVE_GAMING_LIMITS':
          recommendations.push('調整博彩限制至合理水平');
          break;
        case 'MISSING_CUSTOMER_DUE_DILIGENCE':
          recommendations.push('建立完整的客戶盡職調查程序');
          break;
        case 'MISSING_SUSPICIOUS_REPORTING':
          recommendations.push('建立可疑交易監控和報告機制');
          break;
        case 'MISSING_RECORD_KEEPING':
          recommendations.push('建立完整的交易記錄保存系統');
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
      recommendations.push('建立定期合規審查機制');
      recommendations.push('加強員工合規培訓');
      recommendations.push('實施自動化合規監控系統');
      recommendations.push('建立與監管機構的溝通機制');
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
}
