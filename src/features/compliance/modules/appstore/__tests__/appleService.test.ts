import { AppleAppStoreService } from '../services/appleService';
import type {
  AppleAppInfo,
  AppleInAppPurchase,
  AppleSubscription,
  ApplePrivacyPolicy,
} from '../types/apple';
import {
  AppleComplianceStatus,
  AppleRiskLevel,
  AppleAppCategory,
  AppleAgeRating,
  AppleInAppPurchaseType,
  AppleSubscriptionDuration,
} from '../types/apple';

describe('AppleAppStoreService', () => {
  let service: AppleAppStoreService;

  beforeEach(() => {
    service = AppleAppStoreService.getInstance();
  });

  describe('validateAppInfo', () => {
    it('應該驗證有效的應用程式資訊', () => {
      const appInfo: AppleAppInfo = {
        appId: 'app_123',
        appName: '測試應用程式',
        bundleId: 'com.test.app',
        version: '1.0.0',
        category: AppleAppCategory.GAMES,
        ageRating: AppleAgeRating.FOUR_PLUS,
        description: '這是一個測試應用程式的詳細描述',
        keywords: ['遊戲', '娛樂', '測試'],
        screenshots: ['screenshot1.jpg'],
        iconUrl: 'https://example.com/icon.png',
        developerName: '測試開發商',
        developerId: 'dev_123',
        price: 0,
        isFree: true,
        releaseDate: new Date(),
        lastUpdated: new Date(),
        size: 1024000,
        languages: ['zh-TW', 'en'],
        compatibility: ['iPhone', 'iPad'],
        minimumOSVersion: '14.0',
      };

      const _result = service.validateAppInfo(appInfo);

      expect(result.complianceStatus).toBe(AppleComplianceStatus.COMPLIANT);
      expect(result.riskLevel).toBe(AppleRiskLevel.LOW);
      expect(result.violations).toHaveLength(0);
    });

    it('應該檢測缺少應用程式名稱', () => {
      const appInfo: AppleAppInfo = {
        appId: 'app_123',
        appName: '',
        bundleId: 'com.test.app',
        version: '1.0.0',
        category: AppleAppCategory.GAMES,
        ageRating: AppleAgeRating.FOUR_PLUS,
        description: '這是一個測試應用程式',
        keywords: ['遊戲'],
        screenshots: ['screenshot1.jpg'],
        iconUrl: 'https://example.com/icon.png',
        developerName: '測試開發商',
        developerId: 'dev_123',
        price: 0,
        isFree: true,
        releaseDate: new Date(),
        lastUpdated: new Date(),
        size: 1024000,
        languages: ['zh-TW'],
        compatibility: ['iPhone'],
        minimumOSVersion: '14.0',
      };

      const _result = service.validateAppInfo(appInfo);

      expect(result.complianceStatus).toBe(AppleComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('缺少應用程式名稱');
      expect(result.violations[0].severity).toBe(AppleRiskLevel.CRITICAL);
    });

    it('應該檢測無效的Bundle ID', () => {
      const appInfo: AppleAppInfo = {
        appId: 'app_123',
        appName: '測試應用程式',
        bundleId: 'invalid-bundle-id',
        version: '1.0.0',
        category: AppleAppCategory.GAMES,
        ageRating: AppleAgeRating.FOUR_PLUS,
        description: '這是一個測試應用程式',
        keywords: ['遊戲'],
        screenshots: ['screenshot1.jpg'],
        iconUrl: 'https://example.com/icon.png',
        developerName: '測試開發商',
        developerId: 'dev_123',
        price: 0,
        isFree: true,
        releaseDate: new Date(),
        lastUpdated: new Date(),
        size: 1024000,
        languages: ['zh-TW'],
        compatibility: ['iPhone'],
        minimumOSVersion: '14.0',
      };

      const _result = service.validateAppInfo(appInfo);

      expect(result.complianceStatus).toBe(AppleComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('無效的Bundle ID格式');
      expect(result.violations[0].severity).toBe(AppleRiskLevel.CRITICAL);
    });

    it('應該檢測缺少截圖', () => {
      const appInfo: AppleAppInfo = {
        appId: 'app_123',
        appName: '測試應用程式',
        bundleId: 'com.test.app',
        version: '1.0.0',
        category: AppleAppCategory.GAMES,
        ageRating: AppleAgeRating.FOUR_PLUS,
        description: '這是一個測試應用程式',
        keywords: ['遊戲'],
        screenshots: [],
        iconUrl: 'https://example.com/icon.png',
        developerName: '測試開發商',
        developerId: 'dev_123',
        price: 0,
        isFree: true,
        releaseDate: new Date(),
        lastUpdated: new Date(),
        size: 1024000,
        languages: ['zh-TW'],
        compatibility: ['iPhone'],
        minimumOSVersion: '14.0',
      };

      const _result = service.validateAppInfo(appInfo);

      expect(result.complianceStatus).toBe(AppleComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('缺少應用程式截圖');
      expect(result.violations[0].severity).toBe(AppleRiskLevel.HIGH);
    });
  });

  describe('validateInAppPurchase', () => {
    it('應該驗證有效的內購項目', () => {
      const purchase: AppleInAppPurchase = {
        productId: 'coins_100',
        productName: '100金幣',
        productType: AppleInAppPurchaseType.CONSUMABLE,
        price: 30,
        currency: 'TWD',
        description: '購買100個遊戲金幣',
        isActive: true,
        reviewStatus: AppleComplianceStatus.PENDING,
      };

      const _result = service.validateInAppPurchase(purchase);

      expect(result.complianceStatus).toBe(AppleComplianceStatus.COMPLIANT);
      expect(result.riskLevel).toBe(AppleRiskLevel.LOW);
      expect(result.violations).toHaveLength(0);
    });

    it('應該檢測無效的產品ID', () => {
      const purchase: AppleInAppPurchase = {
        productId: 'ab',
        productName: '100金幣',
        productType: AppleInAppPurchaseType.CONSUMABLE,
        price: 30,
        currency: 'TWD',
        description: '購買100個遊戲金幣',
        isActive: true,
        reviewStatus: AppleComplianceStatus.PENDING,
      };

      const _result = service.validateInAppPurchase(purchase);

      expect(result.complianceStatus).toBe(AppleComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('無效的產品ID格式');
      expect(result.violations[0].severity).toBe(AppleRiskLevel.CRITICAL);
    });

    it('應該檢測價格過高', () => {
      const purchase: AppleInAppPurchase = {
        productId: 'premium_package',
        productName: '豪華禮包',
        productType: AppleInAppPurchaseType.NON_CONSUMABLE,
        price: 1500,
        currency: 'TWD',
        description: '豪華遊戲禮包',
        isActive: true,
        reviewStatus: AppleComplianceStatus.PENDING,
      };

      const _result = service.validateInAppPurchase(purchase);

      expect(result.complianceStatus).toBe(AppleComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe(
        '價格過高，可能違反App Store政策'
      );
      expect(result.violations[0].severity).toBe(AppleRiskLevel.HIGH);
    });
  });

  describe('validateSubscription', () => {
    it('應該驗證有效的訂閱項目', () => {
      const subscription: AppleSubscription = {
        productId: 'premium_monthly',
        productName: '月費會員',
        duration: AppleSubscriptionDuration.MONTHLY,
        price: 99,
        currency: 'TWD',
        description: '月費會員自動續訂服務',
        isActive: true,
        reviewStatus: AppleComplianceStatus.PENDING,
        autoRenewable: true,
        familySharing: true,
      };

      const _result = service.validateSubscription(subscription);

      expect(result.complianceStatus).toBe(AppleComplianceStatus.COMPLIANT);
      expect(result.riskLevel).toBe(AppleRiskLevel.LOW);
      expect(result.violations).toHaveLength(0);
    });

    it('應該檢測過長的試用期', () => {
      const subscription: AppleSubscription = {
        productId: 'premium_yearly',
        productName: '年費會員',
        duration: AppleSubscriptionDuration.YEARLY,
        price: 999,
        currency: 'TWD',
        description: '年費會員服務',
        trialPeriod: 400,
        trialPeriodUnit: 'days',
        isActive: true,
        reviewStatus: AppleComplianceStatus.PENDING,
        autoRenewable: true,
        familySharing: false,
      };

      const _result = service.validateSubscription(subscription);

      expect(result.complianceStatus).toBe(AppleComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(2);
      expect(
        result.violations.some(v => v.description === '試用期不能超過一年')
      ).toBe(true);
      expect(
        result.violations.some(v => v.description === '自動續訂缺少適當條款')
      ).toBe(true);
      expect(
        result.violations.some(v => v.severity === AppleRiskLevel.HIGH)
      ).toBe(true);
    });
  });

  describe('validatePrivacyPolicy', () => {
    it('應該驗證有效的隱私政策', () => {
      const policy: ApplePrivacyPolicy = {
        policyUrl: 'https://example.com/privacy',
        lastUpdated: new Date(),
        dataCollection: {
          personalData: true,
          usageData: true,
          deviceData: false,
          locationData: false,
          thirdPartyData: false,
        },
        dataUsage: {
          analytics: true,
          advertising: false,
          personalization: false,
          security: true,
        },
        dataSharing: {
          thirdParties: false,
          affiliates: false,
          serviceProviders: true,
        },
        userRights: {
          access: true,
          correction: true,
          deletion: true,
          portability: true,
        },
        contactInfo: {
          email: 'privacy@example.com',
        },
      };

      const _result = service.validatePrivacyPolicy(policy);

      expect(result.complianceStatus).toBe(AppleComplianceStatus.COMPLIANT);
      expect(result.riskLevel).toBe(AppleRiskLevel.LOW);
      expect(result.violations).toHaveLength(0);
    });

    it('應該檢測無效的政策URL', () => {
      const policy: ApplePrivacyPolicy = {
        policyUrl: 'invalid-url',
        lastUpdated: new Date(),
        dataCollection: {
          personalData: false,
          usageData: false,
          deviceData: false,
          locationData: false,
          thirdPartyData: false,
        },
        dataUsage: {
          analytics: false,
          advertising: false,
          personalization: false,
          security: false,
        },
        dataSharing: {
          thirdParties: false,
          affiliates: false,
          serviceProviders: false,
        },
        userRights: {
          access: false,
          correction: false,
          deletion: false,
          portability: false,
        },
        contactInfo: {
          email: 'privacy@example.com',
        },
      };

      const _result = service.validatePrivacyPolicy(policy);

      expect(result.complianceStatus).toBe(AppleComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('無效的隱私政策URL');
      expect(result.violations[0].severity).toBe(AppleRiskLevel.CRITICAL);
    });

    it('應該檢測過期的隱私政策', () => {
      const policy: ApplePrivacyPolicy = {
        policyUrl: 'https://example.com/privacy',
        lastUpdated: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000), // 400天前
        dataCollection: {
          personalData: false,
          usageData: false,
          deviceData: false,
          locationData: false,
          thirdPartyData: false,
        },
        dataUsage: {
          analytics: false,
          advertising: false,
          personalization: false,
          security: false,
        },
        dataSharing: {
          thirdParties: false,
          affiliates: false,
          serviceProviders: false,
        },
        userRights: {
          access: false,
          correction: false,
          deletion: false,
          portability: false,
        },
        contactInfo: {
          email: 'privacy@example.com',
        },
      };

      const _result = service.validatePrivacyPolicy(policy);

      expect(result.complianceStatus).toBe(AppleComplianceStatus.NON_COMPLIANT);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('隱私政策已過期');
      expect(result.violations[0].severity).toBe(AppleRiskLevel.HIGH);
    });
  });

  describe('processAppReview', () => {
    it('應該處理完整的應用程式審核', () => {
      const appInfo: AppleAppInfo = {
        appId: 'app_123',
        appName: '測試應用程式',
        bundleId: 'com.test.app',
        version: '1.0.0',
        category: AppleAppCategory.GAMES,
        ageRating: AppleAgeRating.FOUR_PLUS,
        description: '這是一個測試應用程式',
        keywords: ['遊戲'],
        screenshots: ['screenshot1.jpg'],
        iconUrl: 'https://example.com/icon.png',
        developerName: '測試開發商',
        developerId: 'dev_123',
        price: 0,
        isFree: true,
        releaseDate: new Date(),
        lastUpdated: new Date(),
        size: 1024000,
        languages: ['zh-TW'],
        compatibility: ['iPhone'],
        minimumOSVersion: '14.0',
      };

      const inAppPurchases: AppleInAppPurchase[] = [
        {
          productId: 'coins_100',
          productName: '100金幣',
          productType: AppleInAppPurchaseType.CONSUMABLE,
          price: 30,
          currency: 'TWD',
          description: '購買100個遊戲金幣',
          isActive: true,
          reviewStatus: AppleComplianceStatus.PENDING,
        },
      ];

      const subscriptions: AppleSubscription[] = [
        {
          productId: 'premium_monthly',
          productName: '月費會員',
          duration: AppleSubscriptionDuration.MONTHLY,
          price: 99,
          currency: 'TWD',
          description: '月費會員自動續訂服務',
          isActive: true,
          reviewStatus: AppleComplianceStatus.PENDING,
          autoRenewable: true,
          familySharing: true,
        },
      ];

      const privacyPolicy: ApplePrivacyPolicy = {
        policyUrl: 'https://example.com/privacy',
        lastUpdated: new Date(),
        dataCollection: {
          personalData: false,
          usageData: false,
          deviceData: false,
          locationData: false,
          thirdPartyData: false,
        },
        dataUsage: {
          analytics: false,
          advertising: false,
          personalization: false,
          security: false,
        },
        dataSharing: {
          thirdParties: false,
          affiliates: false,
          serviceProviders: false,
        },
        userRights: {
          access: false,
          correction: false,
          deletion: false,
          portability: false,
        },
        contactInfo: {
          email: 'privacy@example.com',
        },
      };

      const _review = service.processAppReview(
        appInfo,
        inAppPurchases,
        subscriptions,
        privacyPolicy
      );

      expect(review.appId).toBe('app_123');
      expect(review.status).toBe(AppleComplianceStatus.COMPLIANT);
      expect(review.violations).toHaveLength(0);
      expect(review.requiresResubmission).toBe(false);
    });
  });
});
