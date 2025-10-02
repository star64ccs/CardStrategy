import type {
  GoogleAppInfo,
  GoogleInAppPurchase,
  GoogleSubscription,
  GooglePrivacyPolicy,
  GoogleAppReview,
  GoogleViolation,
  GoogleComplianceResult,
  GoogleAuditTrail,
} from '../types/google';
import {
  GoogleComplianceStatus,
  GoogleRiskLevel,
  GoogleAppCategory,
  GoogleContentRating,
  GoogleInAppPurchaseType,
  GoogleSubscriptionDuration,
  GooglePermission,
} from '../types/google';

export class GooglePlayService {
  private static instance: GooglePlayService;
  private readonly auditTrails: GoogleAuditTrail[] = [];
  private readonly violations: GoogleViolation[] = [];

  private constructor() {}

  public static getInstance(): GooglePlayService {
    if (!GooglePlayService.instance) {
      GooglePlayService.instance = new GooglePlayService();
    }
    return GooglePlayService.instance;
  }

  /**
   * 驗證應用程式資訊
   */
  public validateAppInfo(appInfo: GoogleAppInfo): GoogleComplianceResult {
    const violations: GoogleViolation[] = [];
    let riskLevel = GoogleRiskLevel.LOW;

    // 檢查必要欄位
    if (!appInfo.appName || appInfo.appName.trim().length === 0) {
      violations.push(
        this.createViolation(
          'MISSING_APP_NAME',
          '缺少應用程式名稱',
          GoogleRiskLevel.CRITICAL,
          'Content Policy'
        )
      );
    }

    if (!appInfo.packageName || !this.isValidPackageName(appInfo.packageName)) {
      violations.push(
        this.createViolation(
          'INVALID_PACKAGE_NAME',
          '無效的Package Name格式',
          GoogleRiskLevel.CRITICAL,
          'Content Policy'
        )
      );
    }

    if (!appInfo.description || appInfo.description.length < 80) {
      violations.push(
        this.createViolation(
          'INSUFFICIENT_DESCRIPTION',
          '應用程式描述不足（至少80字符）',
          GoogleRiskLevel.MEDIUM,
          'Content Policy'
        )
      );
    }

    if (!appInfo.screenshots || appInfo.screenshots.length < 2) {
      violations.push(
        this.createViolation(
          'INSUFFICIENT_SCREENSHOTS',
          '至少需要2張截圖',
          GoogleRiskLevel.HIGH,
          'Content Policy'
        )
      );
    }

    // 檢查SDK版本
    if (appInfo.targetSdkVersion < 30) {
      violations.push(
        this.createViolation(
          'OUTDATED_TARGET_SDK',
          '目標SDK版本過舊，建議使用API 30或更高版本',
          GoogleRiskLevel.MEDIUM,
          'Security Policy'
        )
      );
    }

    // 評估風險等級
    if (violations.some(v => v.severity === GoogleRiskLevel.CRITICAL)) {
      riskLevel = GoogleRiskLevel.CRITICAL;
    } else if (violations.some(v => v.severity === GoogleRiskLevel.HIGH)) {
      riskLevel = GoogleRiskLevel.HIGH;
    } else if (violations.some(v => v.severity === GoogleRiskLevel.MEDIUM)) {
      riskLevel = GoogleRiskLevel.MEDIUM;
    }

    const complianceStatus =
      violations.length === 0
        ? GoogleComplianceStatus.COMPLIANT
        : GoogleComplianceStatus.NON_COMPLIANT;

    const result: GoogleComplianceResult = {
      appId: appInfo.appId,
      complianceStatus,
      riskLevel,
      violations,
      recommendations: this.generateRecommendations(violations),
      lastAuditDate: new Date(),
      nextAuditDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      auditTrail: this.auditTrails,
      policyCompliance: {
        contentPolicy: !violations.some(
          v => v.policySection === 'Content Policy'
        ),
        privacyPolicy: true,
        monetizationPolicy: true,
        securityPolicy: !violations.some(
          v => v.policySection === 'Security Policy'
        ),
      },
    };

    this.addAuditTrail(
      'APP_INFO_VALIDATION',
      `驗證應用程式資訊: ${appInfo.appName}`,
      { appId: appInfo.appId, violations: violations.length }
    );

    return result;
  }

  /**
   * 驗證內購項目
   */
  public validateInAppPurchase(
    purchase: GoogleInAppPurchase
  ): GoogleComplianceResult {
    const violations: GoogleViolation[] = [];
    let riskLevel = GoogleRiskLevel.LOW;

    // 檢查必要欄位
    if (!purchase.productId || !this.isValidProductId(purchase.productId)) {
      violations.push(
        this.createViolation(
          'INVALID_PRODUCT_ID',
          '無效的產品ID格式',
          GoogleRiskLevel.CRITICAL,
          'Monetization Policy'
        )
      );
    }

    if (!purchase.productName || purchase.productName.trim().length === 0) {
      violations.push(
        this.createViolation(
          'MISSING_PRODUCT_NAME',
          '缺少產品名稱',
          GoogleRiskLevel.HIGH,
          'Monetization Policy'
        )
      );
    }

    if (purchase.price <= 0) {
      violations.push(
        this.createViolation(
          'INVALID_PRICE',
          '價格必須大於0',
          GoogleRiskLevel.HIGH,
          'Monetization Policy'
        )
      );
    }

    // 檢查價格合理性
    if (purchase.price > 999.99) {
      violations.push(
        this.createViolation(
          'EXCESSIVE_PRICE',
          '價格過高，可能違反Google Play政策',
          GoogleRiskLevel.HIGH,
          'Monetization Policy'
        )
      );
    }

    // 評估風險等級
    if (violations.some(v => v.severity === GoogleRiskLevel.CRITICAL)) {
      riskLevel = GoogleRiskLevel.CRITICAL;
    } else if (violations.some(v => v.severity === GoogleRiskLevel.HIGH)) {
      riskLevel = GoogleRiskLevel.HIGH;
    } else if (violations.some(v => v.severity === GoogleRiskLevel.MEDIUM)) {
      riskLevel = GoogleRiskLevel.MEDIUM;
    }

    const complianceStatus =
      violations.length === 0
        ? GoogleComplianceStatus.COMPLIANT
        : GoogleComplianceStatus.NON_COMPLIANT;

    const result: GoogleComplianceResult = {
      appId: purchase.productId,
      complianceStatus,
      riskLevel,
      violations,
      recommendations: this.generateRecommendations(violations),
      lastAuditDate: new Date(),
      nextAuditDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      auditTrail: this.auditTrails,
      policyCompliance: {
        contentPolicy: true,
        privacyPolicy: true,
        monetizationPolicy: violations.length === 0,
        securityPolicy: true,
      },
    };

    this.addAuditTrail(
      'IN_APP_PURCHASE_VALIDATION',
      `驗證內購項目: ${purchase.productName}`,
      { productId: purchase.productId, violations: violations.length }
    );

    return result;
  }

  /**
   * 驗證訂閱項目
   */
  public validateSubscription(
    subscription: GoogleSubscription
  ): GoogleComplianceResult {
    const violations: GoogleViolation[] = [];
    let riskLevel = GoogleRiskLevel.LOW;

    // 檢查必要欄位
    if (
      !subscription.productId ||
      !this.isValidProductId(subscription.productId)
    ) {
      violations.push(
        this.createViolation(
          'INVALID_PRODUCT_ID',
          '無效的產品ID格式',
          GoogleRiskLevel.CRITICAL,
          'Monetization Policy'
        )
      );
    }

    if (
      !subscription.productName ||
      subscription.productName.trim().length === 0
    ) {
      violations.push(
        this.createViolation(
          'MISSING_PRODUCT_NAME',
          '缺少訂閱名稱',
          GoogleRiskLevel.HIGH,
          'Monetization Policy'
        )
      );
    }

    if (subscription.price <= 0) {
      violations.push(
        this.createViolation(
          'INVALID_PRICE',
          '價格必須大於0',
          GoogleRiskLevel.HIGH,
          'Monetization Policy'
        )
      );
    }

    // 檢查試用期設定
    if (subscription.trialPeriod && subscription.trialPeriod > 365) {
      violations.push(
        this.createViolation(
          'EXCESSIVE_TRIAL_PERIOD',
          '試用期不能超過一年',
          GoogleRiskLevel.HIGH,
          'Monetization Policy'
        )
      );
    }

    // 評估風險等級
    if (violations.some(v => v.severity === GoogleRiskLevel.CRITICAL)) {
      riskLevel = GoogleRiskLevel.CRITICAL;
    } else if (violations.some(v => v.severity === GoogleRiskLevel.HIGH)) {
      riskLevel = GoogleRiskLevel.HIGH;
    } else if (violations.some(v => v.severity === GoogleRiskLevel.MEDIUM)) {
      riskLevel = GoogleRiskLevel.MEDIUM;
    }

    const complianceStatus =
      violations.length === 0
        ? GoogleComplianceStatus.COMPLIANT
        : GoogleComplianceStatus.NON_COMPLIANT;

    const result: GoogleComplianceResult = {
      appId: subscription.productId,
      complianceStatus,
      riskLevel,
      violations,
      recommendations: this.generateRecommendations(violations),
      lastAuditDate: new Date(),
      nextAuditDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      auditTrail: this.auditTrails,
      policyCompliance: {
        contentPolicy: true,
        privacyPolicy: true,
        monetizationPolicy: violations.length === 0,
        securityPolicy: true,
      },
    };

    this.addAuditTrail(
      'SUBSCRIPTION_VALIDATION',
      `驗證訂閱項目: ${subscription.productName}`,
      { productId: subscription.productId, violations: violations.length }
    );

    return result;
  }

  /**
   * 驗證隱私政策
   */
  public validatePrivacyPolicy(
    policy: GooglePrivacyPolicy
  ): GoogleComplianceResult {
    const violations: GoogleViolation[] = [];
    let riskLevel = GoogleRiskLevel.LOW;

    // 檢查政策URL
    if (!policy.policyUrl || !this.isValidUrl(policy.policyUrl)) {
      violations.push(
        this.createViolation(
          'INVALID_POLICY_URL',
          '無效的隱私政策URL',
          GoogleRiskLevel.CRITICAL,
          'Privacy Policy'
        )
      );
    }

    // 檢查更新時間
    const daysSinceUpdate =
      (Date.now() - policy.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 365) {
      violations.push(
        this.createViolation(
          'OUTDATED_POLICY',
          '隱私政策已過期',
          GoogleRiskLevel.HIGH,
          'Privacy Policy'
        )
      );
    }

    // 檢查資料收集聲明
    if (
      policy.dataCollection.personalData &&
      !policy.dataUsage.analytics &&
      !policy.dataUsage.functionality
    ) {
      violations.push(
        this.createViolation(
          'INCONSISTENT_DATA_USAGE',
          '收集個人資料但未說明用途',
          GoogleRiskLevel.HIGH,
          'Privacy Policy'
        )
      );
    }

    // 評估風險等級
    if (violations.some(v => v.severity === GoogleRiskLevel.CRITICAL)) {
      riskLevel = GoogleRiskLevel.CRITICAL;
    } else if (violations.some(v => v.severity === GoogleRiskLevel.HIGH)) {
      riskLevel = GoogleRiskLevel.HIGH;
    } else if (violations.some(v => v.severity === GoogleRiskLevel.MEDIUM)) {
      riskLevel = GoogleRiskLevel.MEDIUM;
    }

    const complianceStatus =
      violations.length === 0
        ? GoogleComplianceStatus.COMPLIANT
        : GoogleComplianceStatus.NON_COMPLIANT;

    const result: GoogleComplianceResult = {
      appId: 'privacy_policy',
      complianceStatus,
      riskLevel,
      violations,
      recommendations: this.generateRecommendations(violations),
      lastAuditDate: new Date(),
      nextAuditDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      auditTrail: this.auditTrails,
      policyCompliance: {
        contentPolicy: true,
        privacyPolicy: violations.length === 0,
        monetizationPolicy: true,
        securityPolicy: true,
      },
    };

    this.addAuditTrail('PRIVACY_POLICY_VALIDATION', '驗證隱私政策', {
      policyUrl: policy.policyUrl,
      violations: violations.length,
    });

    return result;
  }

  /**
   * 處理應用程式審核
   */
  public processAppReview(
    appInfo: GoogleAppInfo,
    inAppPurchases: GoogleInAppPurchase[],
    subscriptions: GoogleSubscription[],
    privacyPolicy: GooglePrivacyPolicy
  ): GoogleAppReview {
    const appValidation = this.validateAppInfo(appInfo);
    const purchaseValidations = inAppPurchases.map(p =>
      this.validateInAppPurchase(p)
    );
    const subscriptionValidations = subscriptions.map(s =>
      this.validateSubscription(s)
    );
    const policyValidation = this.validatePrivacyPolicy(privacyPolicy);

    const allViolations = [
      ...appValidation.violations,
      ...purchaseValidations.flatMap(v => v.violations),
      ...subscriptionValidations.flatMap(v => v.violations),
      ...policyValidation.violations,
    ];

    const status =
      allViolations.length === 0
        ? GoogleComplianceStatus.COMPLIANT
        : GoogleComplianceStatus.NON_COMPLIANT;

    const policyViolations = this.categorizePolicyViolations(allViolations);

    const review: GoogleAppReview = {
      reviewId: `review_${Date.now()}`,
      appId: appInfo.appId,
      reviewDate: new Date(),
      reviewer: 'system',
      status,
      violations: allViolations,
      notes: this.generateReviewNotes(allViolations),
      requiresResubmission: allViolations.some(
        v =>
          v.severity === GoogleRiskLevel.CRITICAL ||
          v.severity === GoogleRiskLevel.HIGH
      ),
      resubmissionDeadline: allViolations.some(
        v => v.severity === GoogleRiskLevel.CRITICAL
      )
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天
        : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14天
      policyViolations,
    };

    this.addAuditTrail(
      'APP_REVIEW_PROCESSED',
      `處理應用程式審核: ${appInfo.appName}`,
      {
        appId: appInfo.appId,
        violations: allViolations.length,
        status,
      }
    );

    return review;
  }

  // 私有輔助方法
  private createViolation(
    type: string,
    description: string,
    severity: GoogleRiskLevel,
    policySection: string
  ): GoogleViolation {
    const violation: GoogleViolation = {
      id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      description,
      severity,
      ruleReference: `GOOGLE_PLAY_${type}`,
      timestamp: new Date(),
      isResolved: false,
      policySection,
    };

    this.violations.push(violation);
    return violation;
  }

  private addAuditTrail(
    action: string,
    details: string,
    changes?: Record<string, any>
  ): void {
    const trail: GoogleAuditTrail = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      timestamp: new Date(),
      userId: 'system',
      details,
      changes,
    };

    this.auditTrails.push(trail);
  }

  private generateRecommendations(violations: GoogleViolation[]): string[] {
    const recommendations: string[] = [];

    if (violations.some(v => v.type === 'MISSING_APP_NAME')) {
      recommendations.push('請提供有效的應用程式名稱');
    }

    if (violations.some(v => v.type === 'INVALID_PACKAGE_NAME')) {
      recommendations.push(
        '請使用正確的Package Name格式（例如：com.company.appname）'
      );
    }

    if (violations.some(v => v.type === 'INSUFFICIENT_DESCRIPTION')) {
      recommendations.push('請提供更詳細的應用程式描述（至少80個字符）');
    }

    if (violations.some(v => v.type === 'INSUFFICIENT_SCREENSHOTS')) {
      recommendations.push('請上傳至少2張應用程式截圖');
    }

    if (violations.some(v => v.type === 'INVALID_POLICY_URL')) {
      recommendations.push('請提供有效的隱私政策URL');
    }

    if (violations.some(v => v.type === 'OUTDATED_POLICY')) {
      recommendations.push('請更新隱私政策（不能超過一年）');
    }

    return recommendations;
  }

  private generateReviewNotes(violations: GoogleViolation[]): string {
    if (violations.length === 0) {
      return '應用程式符合Google Play政策，可以上架。';
    }

    const criticalCount = violations.filter(
      v => v.severity === GoogleRiskLevel.CRITICAL
    ).length;
    const highCount = violations.filter(
      v => v.severity === GoogleRiskLevel.HIGH
    ).length;
    const mediumCount = violations.filter(
      v => v.severity === GoogleRiskLevel.MEDIUM
    ).length;

    let notes = `發現 ${violations.length} 個合規問題：`;
    if (criticalCount > 0) notes += ` ${criticalCount} 個嚴重問題，`;
    if (highCount > 0) notes += ` ${highCount} 個高風險問題，`;
    if (mediumCount > 0) notes += ` ${mediumCount} 個中等風險問題。`;

    notes += '請根據建議進行修正後重新提交。';

    return notes;
  }

  private categorizePolicyViolations(violations: GoogleViolation[]): string[] {
    const categories = new Set<string>();
    violations.forEach(v => {
      if (v.policySection) {
        categories.add(v.policySection);
      }
    });
    return Array.from(categories);
  }

  private isValidPackageName(packageName: string): boolean {
    return /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(packageName);
  }

  private isValidProductId(productId: string): boolean {
    return /^[a-zA-Z0-9_]+$/.test(productId) && productId.length >= 3;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
