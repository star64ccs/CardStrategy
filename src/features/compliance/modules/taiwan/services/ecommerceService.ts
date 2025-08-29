// 台灣電子商務法服務實現
// Taiwan E-commerce Law Service Implementation

import type {
  TaiwanEcommercePlatform,
  TaiwanOnlineTransaction,
  TaiwanSeller,
  TaiwanBuyer,
  TaiwanEcommerceComplianceResult,
  TaiwanEcommerceViolation,
  TaiwanAuditTrail,
} from '../types/ecommerce';
import {
  TaiwanPlatformType,
  TaiwanBusinessModel,
  TaiwanRevenueModel,
  TaiwanComplianceStatus,
  TaiwanRegistrationInfo,
  TaiwanBusinessLicense,
  TaiwanLicenseType,
  TaiwanLicenseStatus,
  TaiwanTransactionType,
  TaiwanSellerType,
  TaiwanContactInfo,
  TaiwanContactType,
  TaiwanComplianceHistory,
  TaiwanComplianceType,
  TaiwanBuyerType,
  TaiwanPurchaseHistory,
  TaiwanTransactionStatus,
  TaiwanProduct,
  TaiwanProductType,
  TaiwanWarrantyInfo,
  TaiwanWarrantyType,
  TaiwanReturnPolicy,
  TaiwanReturnMethod,
  TaiwanRefundPolicy,
  TaiwanRefundType,
  TaiwanProductComplianceInfo,
  TaiwanSafetyCertification,
  TaiwanCertificationType,
  TaiwanCertificationStatus,
  TaiwanPaymentMethod,
  TaiwanPaymentType,
  TaiwanTransactionLimits,
  TaiwanPaymentFees,
  TaiwanDeliveryMethod,
  TaiwanDeliveryType,
  TaiwanDisputeResolution,
  TaiwanDisputeType,
  TaiwanResolutionMethod,
  TaiwanFeedback,
  TaiwanFeedbackCategory,
  TaiwanSentiment,
  TaiwanPenalty,
  TaiwanPenaltyType,
  TaiwanEcommerceViolationType,
  TaiwanViolationSeverity,
  TaiwanViolationStatus,
  TaiwanRiskLevel,
} from '../types/ecommerce';

export class TaiwanEcommerceService {
  private static instance: TaiwanEcommerceService;
  private auditTrails: TaiwanAuditTrail[] = [];
  private violations: TaiwanEcommerceViolation[] = [];
  private readonly platforms: TaiwanEcommercePlatform[] = [];
  private readonly transactions: TaiwanOnlineTransaction[] = [];
  private readonly sellers: TaiwanSeller[] = [];
  private readonly buyers: TaiwanBuyer[] = [];

  private constructor() {}

  public static getInstance(): TaiwanEcommerceService {
    if (!TaiwanEcommerceService.instance) {
      TaiwanEcommerceService.instance = new TaiwanEcommerceService();
    }
    return TaiwanEcommerceService.instance;
  }

  public validateEcommercePlatform(
    platform: TaiwanEcommercePlatform
  ): TaiwanEcommerceComplianceResult {
    const violations: TaiwanEcommerceViolation[] = [];
    const recommendations: string[] = [];

    // 驗證基本要求
    if (!platform.platformName || platform.platformName.trim().length === 0) {
      violations.push(
        this.createViolation(
          platform.id,
          TaiwanEcommerceViolationType.REGISTRATION_VIOLATION,
          '缺少平台名稱',
          TaiwanViolationSeverity.MODERATE
        )
      );
      recommendations.push('請提供平台名稱');
    }

    if (!platform.registrationInfo?.companyName) {
      violations.push(
        this.createViolation(
          platform.id,
          TaiwanEcommerceViolationType.REGISTRATION_VIOLATION,
          '缺少公司註冊資訊',
          TaiwanViolationSeverity.SERIOUS
        )
      );
      recommendations.push('請提供完整的公司註冊資訊');
    }

    if (
      !platform.businessLicense ||
      platform.businessLicense.status !== TaiwanLicenseStatus.ACTIVE
    ) {
      violations.push(
        this.createViolation(
          platform.id,
          TaiwanEcommerceViolationType.LICENSING_VIOLATION,
          '營業執照無效或過期',
          TaiwanViolationSeverity.CRITICAL
        )
      );
      recommendations.push('請確保營業執照有效且未過期');
    }

    // 根據平台類型進行特定驗證
    switch (platform.platformType) {
      case TaiwanPlatformType.B2C:
        if (platform.userBase < 1000) {
          violations.push(
            this.createViolation(
              platform.id,
              TaiwanEcommerceViolationType.OTHER,
              'B2C平台用戶基數不足',
              TaiwanViolationSeverity.MINOR
            )
          );
          recommendations.push('建議增加用戶基數以符合B2C平台要求');
        }
        break;

      case TaiwanPlatformType.C2C:
        if (
          !platform.registrationInfo.contactPerson ||
          !platform.registrationInfo.contactPhone
        ) {
          violations.push(
            this.createViolation(
              platform.id,
              TaiwanEcommerceViolationType.REGISTRATION_VIOLATION,
              'C2C平台缺少聯絡人資訊',
              TaiwanViolationSeverity.MODERATE
            )
          );
          recommendations.push('請提供聯絡人資訊');
        }
        break;

      case TaiwanPlatformType.CROSS_BORDER:
        if (!platform.registrationInfo.businessScope.includes('跨境電商')) {
          violations.push(
            this.createViolation(
              platform.id,
              TaiwanEcommerceViolationType.REGISTRATION_VIOLATION,
              '跨境電商平台缺少相應營業範圍',
              TaiwanViolationSeverity.SERIOUS
            )
          );
          recommendations.push('請在營業範圍中添加跨境電商業務');
        }
        break;
    }

    // 記錄審計追蹤
    this.createAuditTrail(
      'validate_ecommerce_platform',
      'TaiwanEcommercePlatform',
      platform.id,
      {
        platformType: platform.platformType,
        violationsCount: violations.length,
        recommendationsCount: recommendations.length,
      }
    );

    const _complianceStatus =
      violations.length === 0
        ? TaiwanComplianceStatus.COMPLIANT
        : TaiwanComplianceStatus.NON_COMPLIANT;

    const _riskLevel = this.calculateRiskLevel(violations);

    return {
      id: `compliance_${Date.now()}`,
      platformId: platform.id,
      complianceStatus,
      violations,
      recommendations,
      riskLevel,
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天後
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  public validateOnlineTransaction(
    transaction: TaiwanOnlineTransaction
  ): TaiwanEcommerceComplianceResult {
    const violations: TaiwanEcommerceViolation[] = [];
    const recommendations: string[] = [];

    // 驗證基本要求
    if (!transaction.seller?.businessName) {
      violations.push(
        this.createViolation(
          transaction.id,
          TaiwanEcommerceViolationType.CONSUMER_PROTECTION_VIOLATION,
          '缺少賣家資訊',
          TaiwanViolationSeverity.SERIOUS
        )
      );
      recommendations.push('請提供完整的賣家資訊');
    }

    if (!transaction.buyer?.name) {
      violations.push(
        this.createViolation(
          transaction.id,
          TaiwanEcommerceViolationType.CONSUMER_PROTECTION_VIOLATION,
          '缺少買家資訊',
          TaiwanViolationSeverity.MODERATE
        )
      );
      recommendations.push('請提供完整的買家資訊');
    }

    if (!transaction.products || transaction.products.length === 0) {
      violations.push(
        this.createViolation(
          transaction.id,
          TaiwanEcommerceViolationType.CONSUMER_PROTECTION_VIOLATION,
          '缺少商品資訊',
          TaiwanViolationSeverity.SERIOUS
        )
      );
      recommendations.push('請提供商品資訊');
    }

    if (!transaction.paymentMethod?.provider) {
      violations.push(
        this.createViolation(
          transaction.id,
          TaiwanEcommerceViolationType.PAYMENT_VIOLATION,
          '缺少付款方式資訊',
          TaiwanViolationSeverity.SERIOUS
        )
      );
      recommendations.push('請提供付款方式資訊');
    }

    if (!transaction.deliveryMethod?.provider) {
      violations.push(
        this.createViolation(
          transaction.id,
          TaiwanEcommerceViolationType.DELIVERY_VIOLATION,
          '缺少配送方式資訊',
          TaiwanViolationSeverity.MODERATE
        )
      );
      recommendations.push('請提供配送方式資訊');
    }

    // 根據交易類型進行特定驗證
    switch (transaction.transactionType) {
      case TaiwanTransactionType.GOODS:
        if (
          !transaction.warrantyInfo ||
          transaction.warrantyInfo.warrantyType === TaiwanWarrantyType.NONE
        ) {
          violations.push(
            this.createViolation(
              transaction.id,
              TaiwanEcommerceViolationType.WARRANTY_VIOLATION,
              '商品交易缺少保固資訊',
              TaiwanViolationSeverity.MODERATE
            )
          );
          recommendations.push('請提供商品保固資訊');
        }
        break;

      case TaiwanTransactionType.SERVICES:
        if (!transaction.disputeResolution?.mediator) {
          violations.push(
            this.createViolation(
              transaction.id,
              TaiwanEcommerceViolationType.DISPUTE_RESOLUTION_VIOLATION,
              '服務交易缺少爭議解決機制',
              TaiwanViolationSeverity.MODERATE
            )
          );
          recommendations.push('請提供爭議解決機制');
        }
        break;

      case TaiwanTransactionType.DIGITAL_CONTENT:
        if (
          !transaction.returnPolicy ||
          transaction.returnPolicy.returnPeriod < 7
        ) {
          violations.push(
            this.createViolation(
              transaction.id,
              TaiwanEcommerceViolationType.RETURN_POLICY_VIOLATION,
              '數位內容交易退貨期限不足',
              TaiwanViolationSeverity.MINOR
            )
          );
          recommendations.push('建議提供至少7天的退貨期限');
        }
        break;
    }

    // 記錄審計追蹤
    this.createAuditTrail(
      'validate_online_transaction',
      'TaiwanOnlineTransaction',
      transaction.id,
      {
        transactionType: transaction.transactionType,
        violationsCount: violations.length,
      }
    );

    const _complianceStatus =
      violations.length === 0
        ? TaiwanComplianceStatus.COMPLIANT
        : TaiwanComplianceStatus.NON_COMPLIANT;

    const _riskLevel = this.calculateRiskLevel(violations);

    return {
      id: `compliance_${Date.now()}`,
      platformId: transaction.id,
      complianceStatus,
      violations,
      recommendations,
      riskLevel,
      nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天後
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  public validateSeller(seller: TaiwanSeller): TaiwanEcommerceComplianceResult {
    const violations: TaiwanEcommerceViolation[] = [];
    const recommendations: string[] = [];

    // 驗證基本要求
    if (!seller.businessName || seller.businessName.trim().length === 0) {
      violations.push(
        this.createViolation(
          seller.id,
          TaiwanEcommerceViolationType.REGISTRATION_VIOLATION,
          '缺少商家名稱',
          TaiwanViolationSeverity.SERIOUS
        )
      );
      recommendations.push('請提供商家名稱');
    }

    if (
      !seller.registrationNumber ||
      seller.registrationNumber.trim().length === 0
    ) {
      violations.push(
        this.createViolation(
          seller.id,
          TaiwanEcommerceViolationType.REGISTRATION_VIOLATION,
          '缺少統一編號',
          TaiwanViolationSeverity.CRITICAL
        )
      );
      recommendations.push('請提供統一編號');
    }

    if (
      !seller.businessLicense ||
      seller.businessLicense.status !== TaiwanLicenseStatus.ACTIVE
    ) {
      violations.push(
        this.createViolation(
          seller.id,
          TaiwanEcommerceViolationType.LICENSING_VIOLATION,
          '營業執照無效或過期',
          TaiwanViolationSeverity.CRITICAL
        )
      );
      recommendations.push('請確保營業執照有效且未過期');
    }

    if (!seller.contactInfo?.phone || !seller.contactInfo.email) {
      violations.push(
        this.createViolation(
          seller.id,
          TaiwanEcommerceViolationType.CONSUMER_PROTECTION_VIOLATION,
          '缺少聯絡資訊',
          TaiwanViolationSeverity.MODERATE
        )
      );
      recommendations.push('請提供完整的聯絡資訊');
    }

    // 根據賣家類型進行特定驗證
    switch (seller.sellerType) {
      case TaiwanSellerType.BUSINESS:
        if (
          !seller.businessAddress ||
          seller.businessAddress.trim().length === 0
        ) {
          violations.push(
            this.createViolation(
              seller.id,
              TaiwanEcommerceViolationType.REGISTRATION_VIOLATION,
              '企業賣家缺少營業地址',
              TaiwanViolationSeverity.MODERATE
            )
          );
          recommendations.push('請提供營業地址');
        }
        break;

      case TaiwanSellerType.FOREIGN_ENTITY:
        if (!seller.registrationNumber.startsWith('F')) {
          violations.push(
            this.createViolation(
              seller.id,
              TaiwanEcommerceViolationType.REGISTRATION_VIOLATION,
              '外國實體統一編號格式不正確',
              TaiwanViolationSeverity.SERIOUS
            )
          );
          recommendations.push('外國實體統一編號應以F開頭');
        }
        break;
    }

    // 記錄審計追蹤
    this.createAuditTrail('validate_seller', 'TaiwanSeller', seller.id, {
      sellerType: seller.sellerType,
      violationsCount: violations.length,
    });

    const _complianceStatus =
      violations.length === 0
        ? TaiwanComplianceStatus.COMPLIANT
        : TaiwanComplianceStatus.NON_COMPLIANT;

    const _riskLevel = this.calculateRiskLevel(violations);

    return {
      id: `compliance_${Date.now()}`,
      platformId: seller.id,
      complianceStatus,
      violations,
      recommendations,
      riskLevel,
      nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天後
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  public processPlatformRegistration(platform: TaiwanEcommercePlatform): {
    success: boolean;
    message: string;
    data?: unknown;
  } {
    try {
      // 檢查是否已存在相同平台
      const _existingPlatform = this.platforms.find(
        p =>
          p.platformName === platform.platformName ||
          p.registrationInfo.registrationNumber ===
            platform.registrationInfo.registrationNumber
      );

      if (existingPlatform) {
        return {
          success: false,
          message: '已存在相同的平台註冊',
        };
      }

      // 進行合規性檢查
      const _complianceResult = this.validateEcommercePlatform(platform);

      if (
        complianceResult.complianceStatus === TaiwanComplianceStatus.COMPLIANT
      ) {
        platform.complianceStatus = TaiwanComplianceStatus.COMPLIANT;
        this.platforms.push(platform);

        this.createAuditTrail(
          'process_platform_registration',
          'TaiwanEcommercePlatform',
          platform.id,
          {
            platformType: platform.platformType,
            complianceStatus: platform.complianceStatus,
          }
        );

        return {
          success: true,
          message: '平台註冊成功',
          data: {
            platformId: platform.id,
            complianceStatus: platform.complianceStatus,
          },
        };
      } else {
        platform.complianceStatus = TaiwanComplianceStatus.NON_COMPLIANT;

        this.createAuditTrail(
          'process_platform_registration',
          'TaiwanEcommercePlatform',
          platform.id,
          {
            platformType: platform.platformType,
            complianceStatus: platform.complianceStatus,
            violations: complianceResult.violations.length,
          }
        );

        return {
          success: false,
          message: '平台註冊失敗，存在合規問題',
          data: {
            violations: complianceResult.violations,
          },
        };
      }
    } catch (error) {
      this.createAuditTrail(
        'process_platform_registration_error',
        'TaiwanEcommercePlatform',
        platform.id,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );

      return {
        success: false,
        message: '處理平台註冊時發生錯誤',
      };
    }
  }

  public updatePlatformStatus(
    platformId: string,
    newStatus: TaiwanComplianceStatus
  ): { success: boolean; message: string; data?: unknown } {
    try {
      const _platform = this.platforms.find(p => p.id === platformId);

      if (!platform) {
        return {
          success: false,
          message: '找不到指定的平台',
        };
      }

      const _oldStatus = platform.complianceStatus;
      platform.complianceStatus = newStatus;
      platform.updatedAt = new Date();

      this.createAuditTrail(
        'update_platform_status',
        'TaiwanEcommercePlatform',
        platformId,
        {
          oldStatus,
          newStatus,
        }
      );

      return {
        success: true,
        message: '平台狀態已更新',
        data: {
          complianceStatus: newStatus,
        },
      };
    } catch (error) {
      this.createAuditTrail(
        'update_platform_status_error',
        'TaiwanEcommercePlatform',
        platformId,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );

      return {
        success: false,
        message: '更新平台狀態時發生錯誤',
      };
    }
  }

  public generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): {
    totalPlatforms: number;
    compliantPlatforms: number;
    nonCompliantPlatforms: number;
    totalTransactions: number;
    compliantTransactions: number;
    nonCompliantTransactions: number;
    totalViolations: number;
    violationsByType: Record<string, number>;
    riskDistribution: Record<string, number>;
    recommendations: string[];
  } {
    const _platformsInPeriod = this.platforms.filter(
      p => p.createdAt >= startDate && p.createdAt <= endDate
    );

    const _transactionsInPeriod = this.transactions.filter(
      t => t.createdAt >= startDate && t.createdAt <= endDate
    );

    const _violationsInPeriod = this.violations.filter(
      v => v.createdAt >= startDate && v.createdAt <= endDate
    );

    const violationsByType: Record<string, number> = {};
    const riskDistribution: Record<string, number> = {};

    violationsInPeriod.forEach(violation => {
      violationsByType[violation.violationType] =
        (violationsByType[violation.violationType] || 0) + 1;

      riskDistribution[violation.severity] =
        (riskDistribution[violation.severity] || 0) + 1;
    });

    const _recommendations = [
      '定期進行電子商務法合規檢查',
      '加強平台賣家管理',
      '建立交易糾紛處理機制',
      '確保付款和配送資訊完整',
      '及時更新營業執照和證照',
    ];

    this.createAuditTrail(
      'generate_compliance_report',
      'Report',
      'ecommerce_compliance_report',
      {
        startDate,
        endDate,
        totalPlatforms: platformsInPeriod.length,
        totalTransactions: transactionsInPeriod.length,
        totalViolations: violationsInPeriod.length,
      }
    );

    return {
      totalPlatforms: platformsInPeriod.length,
      compliantPlatforms: platformsInPeriod.filter(
        p => p.complianceStatus === TaiwanComplianceStatus.COMPLIANT
      ).length,
      nonCompliantPlatforms: platformsInPeriod.filter(
        p => p.complianceStatus === TaiwanComplianceStatus.NON_COMPLIANT
      ).length,
      totalTransactions: transactionsInPeriod.length,
      compliantTransactions: transactionsInPeriod.filter(
        t => t.complianceStatus === TaiwanComplianceStatus.COMPLIANT
      ).length,
      nonCompliantTransactions: transactionsInPeriod.filter(
        t => t.complianceStatus === TaiwanComplianceStatus.NON_COMPLIANT
      ).length,
      totalViolations: violationsInPeriod.length,
      violationsByType,
      riskDistribution,
      recommendations,
    };
  }

  public getAuditTrails(
    entityType?: string,
    entityId?: string,
    startDate?: Date,
    endDate?: Date
  ): TaiwanAuditTrail[] {
    let filteredTrails = this.auditTrails;

    if (entityType) {
      filteredTrails = filteredTrails.filter(
        trail => trail.entityType === entityType
      );
    }

    if (entityId) {
      filteredTrails = filteredTrails.filter(
        trail => trail.entityId === entityId
      );
    }

    if (startDate) {
      filteredTrails = filteredTrails.filter(
        trail => trail.timestamp >= startDate
      );
    }

    if (endDate) {
      filteredTrails = filteredTrails.filter(
        trail => trail.timestamp <= endDate
      );
    }

    return filteredTrails.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  public getViolations(
    platformId?: string,
    violationType?: TaiwanEcommerceViolationType,
    status?: TaiwanViolationStatus
  ): TaiwanEcommerceViolation[] {
    let filteredViolations = this.violations;

    if (platformId) {
      filteredViolations = filteredViolations.filter(
        v => v.platformId === platformId
      );
    }

    if (violationType) {
      filteredViolations = filteredViolations.filter(
        v => v.violationType === violationType
      );
    }

    if (status) {
      filteredViolations = filteredViolations.filter(v => v.status === status);
    }

    return filteredViolations.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  public getPlatforms(
    platformType?: TaiwanPlatformType,
    complianceStatus?: TaiwanComplianceStatus
  ): TaiwanEcommercePlatform[] {
    let filteredPlatforms = this.platforms;

    if (platformType) {
      filteredPlatforms = filteredPlatforms.filter(
        p => p.platformType === platformType
      );
    }

    if (complianceStatus) {
      filteredPlatforms = filteredPlatforms.filter(
        p => p.complianceStatus === complianceStatus
      );
    }

    return filteredPlatforms.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  public cleanup(): void {
    const _thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    this.auditTrails = this.auditTrails.filter(
      trail => trail.timestamp >= thirtyDaysAgo
    );
    this.violations = this.violations.filter(
      violation => violation.createdAt >= thirtyDaysAgo
    );
  }

  private createViolation(
    platformId: string,
    violationType: TaiwanEcommerceViolationType,
    description: string,
    severity: TaiwanViolationSeverity
  ): TaiwanEcommerceViolation {
    const violation: TaiwanEcommerceViolation = {
      id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      platformId,
      violationType,
      description,
      severity,
      evidence: [],
      penalty: {
        id: `penalty_${Date.now()}`,
        penaltyType: TaiwanPenaltyType.ADMINISTRATIVE_FINE,
        amount: 0,
        currency: 'TWD',
        basis: '電子商務法',
        aggravatingFactors: [],
        mitigatingFactors: [],
        createdAt: new Date(),
      },
      rectificationRequired: true,
      status: TaiwanViolationStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.violations.push(violation);
    return violation;
  }

  private createAuditTrail(
    action: string,
    entityType: string,
    entityId: string,
    details: unknown
  ): void {
    const auditTrail: TaiwanAuditTrail = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      entityType,
      entityId,
      userId: 'system',
      timestamp: new Date(),
      details,
    };

    this.auditTrails.push(auditTrail);
  }

  private calculateRiskLevel(
    violations: TaiwanEcommerceViolation[]
  ): TaiwanRiskLevel {
    if (violations.length === 0) {
      return TaiwanRiskLevel.LOW;
    }

    const _criticalCount = violations.filter(
      v => v.severity === TaiwanViolationSeverity.CRITICAL
    ).length;
    const _seriousCount = violations.filter(
      v => v.severity === TaiwanViolationSeverity.SERIOUS
    ).length;
    const _moderateCount = violations.filter(
      v => v.severity === TaiwanViolationSeverity.MODERATE
    ).length;

    if (criticalCount > 0) {
      return TaiwanRiskLevel.CRITICAL;
    } else if (seriousCount > 0) {
      return TaiwanRiskLevel.HIGH;
    } else if (moderateCount > 0) {
      return TaiwanRiskLevel.MEDIUM;
    } else {
      return TaiwanRiskLevel.LOW;
    }
  }
}
