import type {
  MacauEcommercePlatform,
  MacauOnlineTransaction,
  MacauSeller,
  MacauComplianceResult,
  MacauViolation,
  MacauAuditTrail,
} from '../types/ecommerce';
import {
  MacauComplianceStatus,
  MacauRiskLevel,
  MacauEcommercePlatformType,
  MacauTransactionType,
  MacauPaymentMethod,
  MacauDeliveryMethod,
  MacauDisputeResolutionType,
  MacauBuyer,
  MacauProduct,
  MacauPayment,
  MacauDelivery,
  MacauDisputeResolution,
} from '../types/ecommerce';

export class MacauEcommerceService {
  private static instance: MacauEcommerceService;
  private readonly auditTrails: MacauAuditTrail[] = [];
  private readonly violations: MacauViolation[] = [];

  private constructor() {}

  public static getInstance(): MacauEcommerceService {
    if (!MacauEcommerceService.instance) {
      MacauEcommerceService.instance = new MacauEcommerceService();
    }
    return MacauEcommerceService.instance;
  }

  public validateEcommercePlatform(
    platform: MacauEcommercePlatform
  ): MacauComplianceResult {
    const violations: MacauViolation[] = [];
    let riskLevel = MacauRiskLevel.LOW;

    // 檢查平台名稱
    if (!platform.platformName || platform.platformName.trim() === '') {
      violations.push({
        id: `violation_${Date.now()}_1`,
        type: 'MISSING_PLATFORM_NAME',
        description: '缺少平台名稱',
        severity: MacauRiskLevel.HIGH,
        article: '第5條',
        penalty: '最高罰款澳門幣30萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      riskLevel = MacauRiskLevel.HIGH;
    }

    // 檢查商業登記
    if (
      !platform.businessRegistration ||
      platform.businessRegistration.trim() === ''
    ) {
      violations.push({
        id: `violation_${Date.now()}_2`,
        type: 'MISSING_BUSINESS_REGISTRATION',
        description: '缺少商業登記',
        severity: MacauRiskLevel.CRITICAL,
        article: '第6條',
        penalty: '最高罰款澳門幣100萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      riskLevel = MacauRiskLevel.CRITICAL;
    }

    // 檢查聯絡資訊
    if (
      !platform.contactInformation.email ||
      !platform.contactInformation.phone ||
      !platform.contactInformation.address
    ) {
      violations.push({
        id: `violation_${Date.now()}_3`,
        type: 'INCOMPLETE_CONTACT_INFO',
        description: '聯絡資訊不完整',
        severity: MacauRiskLevel.MEDIUM,
        article: '第7條',
        penalty: '最高罰款澳門幣20萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      if (riskLevel === MacauRiskLevel.LOW) riskLevel = MacauRiskLevel.MEDIUM;
    }

    // 檢查服務條款
    if (!platform.termsOfService || platform.termsOfService.trim() === '') {
      violations.push({
        id: `violation_${Date.now()}_4`,
        type: 'MISSING_TERMS_OF_SERVICE',
        description: '缺少服務條款',
        severity: MacauRiskLevel.HIGH,
        article: '第8條',
        penalty: '最高罰款澳門幣50萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      if (riskLevel === MacauRiskLevel.LOW) riskLevel = MacauRiskLevel.HIGH;
    }

    const complianceStatus =
      violations.length === 0
        ? MacauComplianceStatus.COMPLIANT
        : MacauComplianceStatus.NON_COMPLIANT;

    const result: MacauComplianceResult = {
      id: `result_${Date.now()}`,
      entityId: platform.id,
      entityType: 'ecommerce_platform',
      complianceStatus,
      riskLevel,
      violations,
      recommendations: this.generateRecommendations(violations),
      assessmentDate: new Date(),
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    };

    this.logAuditTrail(
      'ECOMMERCE_PLATFORM_VALIDATION',
      platform.id,
      `驗證電子商務平台合規性，結果：${complianceStatus}`
    );
    this.violations.push(...violations);

    return result;
  }

  public validateOnlineTransaction(
    transaction: MacauOnlineTransaction
  ): MacauComplianceResult {
    const violations: MacauViolation[] = [];
    let riskLevel = MacauRiskLevel.LOW;

    // 檢查賣家資訊
    if (!transaction.sellerId || transaction.sellerId.trim() === '') {
      violations.push({
        id: `violation_${Date.now()}_5`,
        type: 'MISSING_SELLER_INFO',
        description: '缺少賣家資訊',
        severity: MacauRiskLevel.HIGH,
        article: '第10條',
        penalty: '最高罰款澳門幣40萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      riskLevel = MacauRiskLevel.HIGH;
    }

    // 檢查商品資訊
    if (!transaction.productName || transaction.productName.trim() === '') {
      violations.push({
        id: `violation_${Date.now()}_6`,
        type: 'MISSING_PRODUCT_INFO',
        description: '缺少商品資訊',
        severity: MacauRiskLevel.MEDIUM,
        article: '第11條',
        penalty: '最高罰款澳門幣25萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      if (riskLevel === MacauRiskLevel.LOW) riskLevel = MacauRiskLevel.MEDIUM;
    }

    // 檢查價格資訊
    if (transaction.unitPrice <= 0 || transaction.totalAmount <= 0) {
      violations.push({
        id: `violation_${Date.now()}_7`,
        type: 'INVALID_PRICE_INFO',
        description: '價格資訊無效',
        severity: MacauRiskLevel.HIGH,
        article: '第12條',
        penalty: '最高罰款澳門幣30萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      if (riskLevel === MacauRiskLevel.LOW) riskLevel = MacauRiskLevel.HIGH;
    }

    // 檢查付款方式
    if (!transaction.paymentMethod) {
      violations.push({
        id: `violation_${Date.now()}_8`,
        type: 'MISSING_PAYMENT_METHOD',
        description: '缺少付款方式',
        severity: MacauRiskLevel.MEDIUM,
        article: '第13條',
        penalty: '最高罰款澳門幣20萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      if (riskLevel === MacauRiskLevel.LOW) riskLevel = MacauRiskLevel.MEDIUM;
    }

    const complianceStatus =
      violations.length === 0
        ? MacauComplianceStatus.COMPLIANT
        : MacauComplianceStatus.NON_COMPLIANT;

    const result: MacauComplianceResult = {
      id: `result_${Date.now()}`,
      entityId: transaction.id,
      entityType: 'online_transaction',
      complianceStatus,
      riskLevel,
      violations,
      recommendations: this.generateRecommendations(violations),
      assessmentDate: new Date(),
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    };

    this.logAuditTrail(
      'ONLINE_TRANSACTION_VALIDATION',
      transaction.id,
      `驗證線上交易合規性，結果：${complianceStatus}`
    );
    this.violations.push(...violations);

    return result;
  }

  public validateSeller(seller: MacauSeller): MacauComplianceResult {
    const violations: MacauViolation[] = [];
    let riskLevel = MacauRiskLevel.LOW;

    // 檢查賣家名稱
    if (!seller.sellerName || seller.sellerName.trim() === '') {
      violations.push({
        id: `violation_${Date.now()}_9`,
        type: 'MISSING_SELLER_NAME',
        description: '缺少賣家名稱',
        severity: MacauRiskLevel.HIGH,
        article: '第15條',
        penalty: '最高罰款澳門幣30萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      riskLevel = MacauRiskLevel.HIGH;
    }

    // 檢查商業登記
    if (
      !seller.businessRegistration ||
      seller.businessRegistration.trim() === ''
    ) {
      violations.push({
        id: `violation_${Date.now()}_10`,
        type: 'MISSING_SELLER_REGISTRATION',
        description: '賣家缺少商業登記',
        severity: MacauRiskLevel.CRITICAL,
        article: '第16條',
        penalty: '最高罰款澳門幣80萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      riskLevel = MacauRiskLevel.CRITICAL;
    }

    // 檢查聯絡資訊
    if (!seller.contactInformation.email || !seller.contactInformation.phone) {
      violations.push({
        id: `violation_${Date.now()}_11`,
        type: 'INCOMPLETE_SELLER_CONTACT',
        description: '賣家聯絡資訊不完整',
        severity: MacauRiskLevel.MEDIUM,
        article: '第17條',
        penalty: '最高罰款澳門幣15萬元',
        rectificationRequired: true,
        rectificationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        detectedAt: new Date(),
      });
      if (riskLevel === MacauRiskLevel.LOW) riskLevel = MacauRiskLevel.MEDIUM;
    }

    const complianceStatus =
      violations.length === 0
        ? MacauComplianceStatus.COMPLIANT
        : MacauComplianceStatus.NON_COMPLIANT;

    const result: MacauComplianceResult = {
      id: `result_${Date.now()}`,
      entityId: seller.id,
      entityType: 'seller',
      complianceStatus,
      riskLevel,
      violations,
      recommendations: this.generateRecommendations(violations),
      assessmentDate: new Date(),
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    };

    this.logAuditTrail(
      'SELLER_VALIDATION',
      seller.id,
      `驗證賣家合規性，結果：${complianceStatus}`
    );
    this.violations.push(...violations);

    return result;
  }

  public processPlatformRegistration(
    platform: MacauEcommercePlatform
  ): MacauEcommercePlatform {
    const processedPlatform = { ...platform };

    // 檢查平台類型並設置相應要求
    switch (platform.platformType) {
      case MacauEcommercePlatformType.B2C:
        processedPlatform.complianceStatus = MacauComplianceStatus.COMPLIANT;
        break;
      case MacauEcommercePlatformType.B2B:
        processedPlatform.complianceStatus = MacauComplianceStatus.COMPLIANT;
        break;
      case MacauEcommercePlatformType.C2C:
        processedPlatform.complianceStatus = MacauComplianceStatus.UNDER_REVIEW;
        break;
      case MacauEcommercePlatformType.MARKETPLACE:
        processedPlatform.complianceStatus = MacauComplianceStatus.COMPLIANT;
        break;
      case MacauEcommercePlatformType.AUCTION:
        processedPlatform.complianceStatus = MacauComplianceStatus.UNDER_REVIEW;
        break;
    }

    processedPlatform.updatedAt = new Date();

    this.logAuditTrail(
      'PLATFORM_REGISTRATION_PROCESSED',
      platform.id,
      `處理平台註冊：${platform.platformType}`
    );

    return processedPlatform;
  }

  public generateComplianceReport(startDate: Date, endDate: Date): unknown {
    const periodViolations = this.violations.filter(
      v => v.detectedAt >= startDate && v.detectedAt <= endDate
    );

    const report = {
      period: { startDate, endDate },
      summary: {
        totalViolations: periodViolations.length,
        complianceRate: this.calculateComplianceRate(periodViolations),
        riskDistribution: this.calculateRiskDistribution(periodViolations),
        platformViolations: periodViolations.filter(v =>
          v.type.includes('PLATFORM')
        ).length,
        transactionViolations: periodViolations.filter(
          v => v.type.includes('TRANSACTION') || v.type.includes('PRODUCT')
        ).length,
        sellerViolations: periodViolations.filter(v =>
          v.type.includes('SELLER')
        ).length,
        paymentViolations: periodViolations.filter(v =>
          v.type.includes('PAYMENT')
        ).length,
      },
      violations: periodViolations,
      recommendations: this.generateOverallRecommendations(periodViolations),
    };

    this.logAuditTrail(
      'COMPLIANCE_REPORT_GENERATED',
      'SYSTEM',
      `生成電子商務合規報告：${startDate.toISOString()} 至 ${endDate.toISOString()}`
    );

    return report;
  }

  private generateRecommendations(violations: MacauViolation[]): string[] {
    const recommendations: string[] = [];

    violations.forEach(violation => {
      switch (violation.type) {
        case 'MISSING_PLATFORM_NAME':
          recommendations.push('為電子商務平台設置明確的名稱');
          break;
        case 'MISSING_BUSINESS_REGISTRATION':
          recommendations.push('完成商業登記手續');
          break;
        case 'INCOMPLETE_CONTACT_INFO':
          recommendations.push('完善聯絡資訊，包括電子郵件、電話和地址');
          break;
        case 'MISSING_TERMS_OF_SERVICE':
          recommendations.push('制定並公佈服務條款');
          break;
        case 'MISSING_SELLER_INFO':
          recommendations.push('要求賣家提供完整的身份資訊');
          break;
        case 'MISSING_PRODUCT_INFO':
          recommendations.push('確保所有商品都有詳細的產品資訊');
          break;
        case 'INVALID_PRICE_INFO':
          recommendations.push('確保價格資訊準確且有效');
          break;
        case 'MISSING_PAYMENT_METHOD':
          recommendations.push('提供多種安全的付款方式');
          break;
        case 'MISSING_SELLER_NAME':
          recommendations.push('要求賣家提供真實姓名或公司名稱');
          break;
        case 'MISSING_SELLER_REGISTRATION':
          recommendations.push('要求賣家完成商業登記');
          break;
        case 'INCOMPLETE_SELLER_CONTACT':
          recommendations.push('要求賣家提供完整的聯絡資訊');
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
      recommendations.push('建立賣家驗證機制');
      recommendations.push('實施商品品質控制');
      recommendations.push('建立消費者保護機制');
      recommendations.push('加強支付安全措施');
      recommendations.push('建立爭議解決機制');
    }

    return recommendations;
  }

  private calculateComplianceRate(violations: MacauViolation[]): number {
    const totalAssessments = violations.length + 10; // 假設有10個合規評估
    return ((totalAssessments - violations.length) / totalAssessments) * 100;
  }

  private calculateRiskDistribution(
    violations: MacauViolation[]
  ): Record<MacauRiskLevel, number> {
    const distribution = {
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
