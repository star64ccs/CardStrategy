import type {
  AppleAppCategory,
  AppleAppInfo,
  AppleAppReview,
  AppleAuditTrail,
  AppleComplianceResult,
  AppleInAppPurchase,
  ApplePrivacyPolicy,
  AppleSubscription,
  AppleViolation,
} from '../types/apple';
import {
  AppleComplianceStatus,
  AppleInAppPurchaseType,
  AppleRiskLevel,
} from '../types/apple';

export class AppleAppStoreService {
  private static instance: AppleAppStoreService;
  private readonly auditTrails: AppleAuditTrail[] = [];
  private readonly violations: AppleViolation[] = [];

  private constructor() {}

  public static getInstance(): AppleAppStoreService {
    if (!AppleAppStoreService.instance) {
      AppleAppStoreService.instance = new AppleAppStoreService();
    }
    return AppleAppStoreService.instance;
  }

  /**
   * 驗證應用程式資訊
   */
  public validateAppInfo(appInfo: AppleAppInfo): AppleComplianceResult {
    const violations: AppleViolation[] = [];
    let riskLevel = AppleRiskLevel.LOW;

    // 檢查必要欄位
    if (!appInfo.appName || appInfo.appName.trim().length === 0) {
      violations.push(
        this.createViolation(
          'MISSING_APP_NAME',
          '缺少應用程式名稱',
          AppleRiskLevel.CRITICAL
        )
      );
    }

    if (!appInfo.bundleId || !this.isValidBundleId(appInfo.bundleId)) {
      violations.push(
        this.createViolation(
          'INVALID_BUNDLE_ID',
          '無效的Bundle ID格式',
          AppleRiskLevel.CRITICAL
        )
      );
    }

    if (!appInfo.description || appInfo.description.length < 10) {
      violations.push(
        this.createViolation(
          'INSUFFICIENT_DESCRIPTION',
          '應用程式描述不足',
          AppleRiskLevel.MEDIUM
        )
      );
    }

    if (!appInfo.keywords || appInfo.keywords.length === 0) {
      violations.push(
        this.createViolation(
          'MISSING_KEYWORDS',
          '缺少關鍵字',
          AppleRiskLevel.MEDIUM
        )
      );
    }

    if (!appInfo.screenshots || appInfo.screenshots.length < 1) {
      violations.push(
        this.createViolation(
          'MISSING_SCREENSHOTS',
          '缺少應用程式截圖',
          AppleRiskLevel.HIGH
        )
      );
    }

    // 檢查年齡分級
    if (this.requiresHigherAgeRating(appInfo.category, appInfo.description)) {
      violations.push(
        this.createViolation(
          'INAPPROPRIATE_AGE_RATING',
          '年齡分級不適當',
          AppleRiskLevel.HIGH
        )
      );
    }

    // 檢查價格設定
    if (appInfo.isFree && appInfo.price > 0) {
      violations.push(
        this.createViolation(
          'PRICE_MISMATCH',
          '免費應用程式不應設定價格',
          AppleRiskLevel.MEDIUM
        )
      );
    }

    // 檢查版本號格式
    if (!this.isValidVersionFormat(appInfo.version)) {
      violations.push(
        this.createViolation(
          'INVALID_VERSION',
          '無效的版本號格式',
          AppleRiskLevel.MEDIUM
        )
      );
    }

    // 評估風險等級
    if (violations.some(v => v.severity === AppleRiskLevel.CRITICAL)) {
      riskLevel = AppleRiskLevel.CRITICAL;
    } else if (violations.some(v => v.severity === AppleRiskLevel.HIGH)) {
      riskLevel = AppleRiskLevel.HIGH;
    } else if (violations.some(v => v.severity === AppleRiskLevel.MEDIUM)) {
      riskLevel = AppleRiskLevel.MEDIUM;
    }

    const _complianceStatus =
      violations.length === 0
        ? AppleComplianceStatus.COMPLIANT
        : AppleComplianceStatus.NON_COMPLIANT;

    const result: AppleComplianceResult = {
      appId: appInfo.appId,
      complianceStatus,
      riskLevel,
      violations,
      recommendations: this.generateRecommendations(violations),
      lastAuditDate: new Date(),
      nextAuditDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天後
      auditTrail: this.auditTrails,
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
    purchase: AppleInAppPurchase
  ): AppleComplianceResult {
    const violations: AppleViolation[] = [];
    let riskLevel = AppleRiskLevel.LOW;

    // 檢查必要欄位
    if (!purchase.productId || !this.isValidProductId(purchase.productId)) {
      violations.push(
        this.createViolation(
          'INVALID_PRODUCT_ID',
          '無效的產品ID格式',
          AppleRiskLevel.CRITICAL
        )
      );
    }

    if (!purchase.productName || purchase.productName.trim().length === 0) {
      violations.push(
        this.createViolation(
          'MISSING_PRODUCT_NAME',
          '缺少產品名稱',
          AppleRiskLevel.HIGH
        )
      );
    }

    if (purchase.price <= 0) {
      violations.push(
        this.createViolation(
          'INVALID_PRICE',
          '價格必須大於0',
          AppleRiskLevel.HIGH
        )
      );
    }

    if (!purchase.description || purchase.description.length < 5) {
      violations.push(
        this.createViolation(
          'INSUFFICIENT_DESCRIPTION',
          '產品描述不足',
          AppleRiskLevel.MEDIUM
        )
      );
    }

    // 檢查價格合理性
    if (purchase.price > 999.99) {
      violations.push(
        this.createViolation(
          'EXCESSIVE_PRICE',
          '價格過高，可能違反App Store政策',
          AppleRiskLevel.HIGH
        )
      );
    }

    // 檢查產品類型一致性
    if (
      purchase.productType === AppleInAppPurchaseType.CONSUMABLE &&
      !this.isConsumableProduct(purchase.productName)
    ) {
      violations.push(
        this.createViolation(
          'INCONSISTENT_PRODUCT_TYPE',
          '產品類型與名稱不一致',
          AppleRiskLevel.MEDIUM
        )
      );
    }

    // 評估風險等級
    if (violations.some(v => v.severity === AppleRiskLevel.CRITICAL)) {
      riskLevel = AppleRiskLevel.CRITICAL;
    } else if (violations.some(v => v.severity === AppleRiskLevel.HIGH)) {
      riskLevel = AppleRiskLevel.HIGH;
    } else if (violations.some(v => v.severity === AppleRiskLevel.MEDIUM)) {
      riskLevel = AppleRiskLevel.MEDIUM;
    }

    const _complianceStatus =
      violations.length === 0
        ? AppleComplianceStatus.COMPLIANT
        : AppleComplianceStatus.NON_COMPLIANT;

    const result: AppleComplianceResult = {
      appId: purchase.productId,
      complianceStatus,
      riskLevel,
      violations,
      recommendations: this.generateRecommendations(violations),
      lastAuditDate: new Date(),
      nextAuditDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      auditTrail: this.auditTrails,
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
    subscription: AppleSubscription
  ): AppleComplianceResult {
    const violations: AppleViolation[] = [];
    let riskLevel = AppleRiskLevel.LOW;

    // 檢查必要欄位
    if (
      !subscription.productId ||
      !this.isValidProductId(subscription.productId)
    ) {
      violations.push(
        this.createViolation(
          'INVALID_PRODUCT_ID',
          '無效的產品ID格式',
          AppleRiskLevel.CRITICAL
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
          AppleRiskLevel.HIGH
        )
      );
    }

    if (subscription.price <= 0) {
      violations.push(
        this.createViolation(
          'INVALID_PRICE',
          '價格必須大於0',
          AppleRiskLevel.HIGH
        )
      );
    }

    // 檢查試用期設定
    if (subscription.trialPeriod && subscription.trialPeriod > 365) {
      violations.push(
        this.createViolation(
          'EXCESSIVE_TRIAL_PERIOD',
          '試用期不能超過一年',
          AppleRiskLevel.HIGH
        )
      );
    }

    // 檢查自動續訂設定
    if (
      subscription.autoRenewable &&
      !this.hasProperRenewalTerms(subscription)
    ) {
      violations.push(
        this.createViolation(
          'MISSING_RENEWAL_TERMS',
          '自動續訂缺少適當條款',
          AppleRiskLevel.MEDIUM
        )
      );
    }

    // 檢查家庭共享設定
    if (
      subscription.familySharing &&
      !this.isEligibleForFamilySharing(subscription)
    ) {
      violations.push(
        this.createViolation(
          'INELIGIBLE_FAMILY_SHARING',
          '此訂閱不適合家庭共享',
          AppleRiskLevel.MEDIUM
        )
      );
    }

    // 評估風險等級
    if (violations.some(v => v.severity === AppleRiskLevel.CRITICAL)) {
      riskLevel = AppleRiskLevel.CRITICAL;
    } else if (violations.some(v => v.severity === AppleRiskLevel.HIGH)) {
      riskLevel = AppleRiskLevel.HIGH;
    } else if (violations.some(v => v.severity === AppleRiskLevel.MEDIUM)) {
      riskLevel = AppleRiskLevel.MEDIUM;
    }

    const _complianceStatus =
      violations.length === 0
        ? AppleComplianceStatus.COMPLIANT
        : AppleComplianceStatus.NON_COMPLIANT;

    const result: AppleComplianceResult = {
      appId: subscription.productId,
      complianceStatus,
      riskLevel,
      violations,
      recommendations: this.generateRecommendations(violations),
      lastAuditDate: new Date(),
      nextAuditDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      auditTrail: this.auditTrails,
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
    policy: ApplePrivacyPolicy
  ): AppleComplianceResult {
    const violations: AppleViolation[] = [];
    let riskLevel = AppleRiskLevel.LOW;

    // 檢查政策URL
    if (!policy.policyUrl || !this.isValidUrl(policy.policyUrl)) {
      violations.push(
        this.createViolation(
          'INVALID_POLICY_URL',
          '無效的隱私政策URL',
          AppleRiskLevel.CRITICAL
        )
      );
    }

    // 檢查更新時間
    const _daysSinceUpdate =
      (Date.now() - policy.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 365) {
      violations.push(
        this.createViolation(
          'OUTDATED_POLICY',
          '隱私政策已過期',
          AppleRiskLevel.HIGH
        )
      );
    }

    // 檢查資料收集聲明
    if (policy.dataCollection.personalData && !policy.dataUsage.analytics) {
      violations.push(
        this.createViolation(
          'INCONSISTENT_DATA_USAGE',
          '收集個人資料但未說明用途',
          AppleRiskLevel.HIGH
        )
      );
    }

    // 檢查第三方資料共享
    if (policy.dataSharing.thirdParties && !policy.contactInfo.email) {
      violations.push(
        this.createViolation(
          'MISSING_CONTACT_INFO',
          '第三方資料共享但缺少聯絡資訊',
          AppleRiskLevel.MEDIUM
        )
      );
    }

    // 檢查用戶權利
    if (policy.dataCollection.personalData && !policy.userRights.access) {
      violations.push(
        this.createViolation(
          'MISSING_USER_RIGHTS',
          '收集個人資料但未提供用戶權利',
          AppleRiskLevel.HIGH
        )
      );
    }

    // 評估風險等級
    if (violations.some(v => v.severity === AppleRiskLevel.CRITICAL)) {
      riskLevel = AppleRiskLevel.CRITICAL;
    } else if (violations.some(v => v.severity === AppleRiskLevel.HIGH)) {
      riskLevel = AppleRiskLevel.HIGH;
    } else if (violations.some(v => v.severity === AppleRiskLevel.MEDIUM)) {
      riskLevel = AppleRiskLevel.MEDIUM;
    }

    const _complianceStatus =
      violations.length === 0
        ? AppleComplianceStatus.COMPLIANT
        : AppleComplianceStatus.NON_COMPLIANT;

    const result: AppleComplianceResult = {
      appId: 'privacy_policy',
      complianceStatus,
      riskLevel,
      violations,
      recommendations: this.generateRecommendations(violations),
      lastAuditDate: new Date(),
      nextAuditDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      auditTrail: this.auditTrails,
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
    appInfo: AppleAppInfo,
    inAppPurchases: AppleInAppPurchase[],
    subscriptions: AppleSubscription[],
    privacyPolicy: ApplePrivacyPolicy
  ): AppleAppReview {
    const _appValidation = this.validateAppInfo(appInfo);
    const _purchaseValidations = inAppPurchases.map(p =>
      this.validateInAppPurchase(p)
    );
    const _subscriptionValidations = subscriptions.map(s =>
      this.validateSubscription(s)
    );
    const _policyValidation = this.validatePrivacyPolicy(privacyPolicy);

    const _allViolations = [
      ...appValidation.violations,
      ...purchaseValidations.flatMap(v => v.violations),
      ...subscriptionValidations.flatMap(v => v.violations),
      ...policyValidation.violations,
    ];

    const _highestRiskLevel = this.getHighestRiskLevel([
      appValidation.riskLevel,
      ...purchaseValidations.map(v => v.riskLevel),
      ...subscriptionValidations.map(v => v.riskLevel),
      policyValidation.riskLevel,
    ]);

    const _status =
      allViolations.length === 0
        ? AppleComplianceStatus.COMPLIANT
        : AppleComplianceStatus.NON_COMPLIANT;

    const review: AppleAppReview = {
      reviewId: `review_${Date.now()}`,
      appId: appInfo.appId,
      reviewDate: new Date(),
      reviewer: 'system',
      status,
      violations: allViolations,
      notes: this.generateReviewNotes(allViolations),
      requiresResubmission: allViolations.some(
        v =>
          v.severity === AppleRiskLevel.CRITICAL ||
          v.severity === AppleRiskLevel.HIGH
      ),
      resubmissionDeadline: allViolations.some(
        v => v.severity === AppleRiskLevel.CRITICAL
      )
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天
        : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14天
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

  /**
   * 生成合規報告
   */
  public generateComplianceReport(appId: string): AppleComplianceResult {
    const _appViolations = this.violations.filter(v => v.id.includes(appId));
    const _riskLevel = this.getHighestRiskLevel(
      appViolations.map(v => v.severity)
    );
    const _complianceStatus =
      appViolations.length === 0
        ? AppleComplianceStatus.COMPLIANT
        : AppleComplianceStatus.NON_COMPLIANT;

    return {
      appId,
      complianceStatus,
      riskLevel,
      violations: appViolations,
      recommendations: this.generateRecommendations(appViolations),
      lastAuditDate: new Date(),
      nextAuditDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      auditTrail: this.auditTrails.filter(t => t.details.includes(appId)),
    };
  }

  // 私有輔助方法
  private createViolation(
    type: string,
    description: string,
    severity: AppleRiskLevel
  ): AppleViolation {
    const violation: AppleViolation = {
      id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      description,
      severity,
      ruleReference: `APP_STORE_${type}`,
      timestamp: new Date(),
      isResolved: false,
    };

    this.violations.push(violation);
    return violation;
  }

  private addAuditTrail(
    action: string,
    details: string,
    changes?: Record<string, any>
  ): void {
    const trail: AppleAuditTrail = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      timestamp: new Date(),
      userId: 'system',
      details,
      changes,
    };

    this.auditTrails.push(trail);
  }

  private generateRecommendations(violations: AppleViolation[]): string[] {
    const recommendations: string[] = [];

    if (violations.some(v => v.type === 'MISSING_APP_NAME')) {
      recommendations.push('請提供有效的應用程式名稱');
    }

    if (violations.some(v => v.type === 'INVALID_BUNDLE_ID')) {
      recommendations.push(
        '請使用正確的Bundle ID格式（例如：com.company.appname）'
      );
    }

    if (violations.some(v => v.type === 'INSUFFICIENT_DESCRIPTION')) {
      recommendations.push('請提供更詳細的應用程式描述（至少10個字符）');
    }

    if (violations.some(v => v.type === 'MISSING_SCREENSHOTS')) {
      recommendations.push('請上傳至少一張應用程式截圖');
    }

    if (violations.some(v => v.type === 'INVALID_POLICY_URL')) {
      recommendations.push('請提供有效的隱私政策URL');
    }

    if (violations.some(v => v.type === 'OUTDATED_POLICY')) {
      recommendations.push('請更新隱私政策（不能超過一年）');
    }

    return recommendations;
  }

  private generateReviewNotes(violations: AppleViolation[]): string {
    if (violations.length === 0) {
      return '應用程式符合App Store審核指南，可以上架。';
    }

    const _criticalCount = violations.filter(
      v => v.severity === AppleRiskLevel.CRITICAL
    ).length;
    const _highCount = violations.filter(
      v => v.severity === AppleRiskLevel.HIGH
    ).length;
    const _mediumCount = violations.filter(
      v => v.severity === AppleRiskLevel.MEDIUM
    ).length;

    let notes = `發現 ${violations.length} 個合規問題：`;
    if (criticalCount > 0) notes += ` ${criticalCount} 個嚴重問題，`;
    if (highCount > 0) notes += ` ${highCount} 個高風險問題，`;
    if (mediumCount > 0) notes += ` ${mediumCount} 個中等風險問題。`;

    notes += '請根據建議進行修正後重新提交。';

    return notes;
  }

  private isValidBundleId(bundleId: string): boolean {
    return /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)+$/.test(bundleId);
  }

  private isValidProductId(productId: string): boolean {
    return /^[a-zA-Z0-9_]+$/.test(productId) && productId.length >= 3;
  }

  private isValidVersionFormat(version: string): boolean {
    return /^\d+\.\d+(\.\d+)?$/.test(version);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private requiresHigherAgeRating(
    category: AppleAppCategory,
    description: string
  ): boolean {
    const _adultKeywords = ['賭博', '暴力', '色情', '毒品', '酒精'];
    return adultKeywords.some(keyword =>
      description.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private isConsumableProduct(productName: string): boolean {
    const _consumableKeywords = ['金幣', '鑽石', '體力', '道具', '禮包'];
    return consumableKeywords.some(keyword => productName.includes(keyword));
  }

  private hasProperRenewalTerms(subscription: AppleSubscription): boolean {
    return !!(
      subscription.productName && subscription.productName.includes('自動續訂')
    );
  }

  private isEligibleForFamilySharing(subscription: AppleSubscription): boolean {
    const _nonEligibleTypes = ['consumable', 'non_consumable'];
    return !nonEligibleTypes.includes(subscription.productId);
  }

  private getHighestRiskLevel(riskLevels: AppleRiskLevel[]): AppleRiskLevel {
    if (riskLevels.includes(AppleRiskLevel.CRITICAL))
      return AppleRiskLevel.CRITICAL;
    if (riskLevels.includes(AppleRiskLevel.HIGH)) return AppleRiskLevel.HIGH;
    if (riskLevels.includes(AppleRiskLevel.MEDIUM))
      return AppleRiskLevel.MEDIUM;
    return AppleRiskLevel.LOW;
  }
}
