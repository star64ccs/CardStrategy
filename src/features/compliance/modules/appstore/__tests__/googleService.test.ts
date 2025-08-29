import { GooglePlayService } from '../services/googleService';
import type {
  GoogleAppInfo,
  GoogleInAppPurchase,
  GoogleSubscription,
  GooglePrivacyPolicy,
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

describe('GooglePlayService', () => {
  let service: GooglePlayService;

  beforeEach(() => {
    service = GooglePlayService.getInstance();
  });

  describe('validateAppInfo', () => {
    it('應該驗證有效的應用程式資訊', () => {
      const appInfo: GoogleAppInfo = {
        appId: 'app_123',
        appName: '測試應用程式',
        packageName: 'com.test.app',
        versionCode: 1,
        versionName: '1.0.0',
        category: GoogleAppCategory.GAMES,
        contentRating: GoogleContentRating.EVERYONE,
        description:
          '這是一個測試應用程式的詳細描述，包含足夠的字符來滿足Google Play的要求，確保描述長度達到80字符以上，這是一個非常詳細的應用程式描述，包含了所有必要的資訊和功能說明，讓用戶能夠充分了解這個應用程式的用途和特色',
        shortDescription: '測試應用程式',
        keywords: ['遊戲', '娛樂', '測試'],
        screenshots: ['screenshot1.jpg', 'screenshot2.jpg'],
        featureGraphic: 'feature.jpg',
        iconUrl: 'https://example.com/icon.png',
        developerName: '測試開發商',
        developerEmail: 'dev@example.com',
        price: 0,
        isFree: true,
        releaseDate: new Date(),
        lastUpdated: new Date(),
        size: 1024000,
        languages: ['zh-TW', 'en'],
        targetSdkVersion: 33,
        minSdkVersion: 21,
        permissions: [GooglePermission.STORAGE, GooglePermission.NOTIFICATIONS],
      };

      const _result = service.validateAppInfo(appInfo);

      expect(result.complianceStatus).toBe(GoogleComplianceStatus.COMPLIANT);
      expect(result.riskLevel).toBe(GoogleRiskLevel.LOW);
      expect(result.violations).toHaveLength(0);
    });

    it('應該檢測缺少應用程式名稱', () => {
      const appInfo: GoogleAppInfo = {
        appId: 'app_123',
        appName: '',
        packageName: 'com.test.app',
        versionCode: 1,
        versionName: '1.0.0',
        category: GoogleAppCategory.GAMES,
        contentRating: GoogleContentRating.EVERYONE,
        description:
          '這是一個測試應用程式的詳細描述，包含足夠的字符來滿足Google Play的要求，確保描述長度達到80字符以上，這是一個非常詳細的應用程式描述，包含了所有必要的資訊和功能說明，讓用戶能夠充分了解這個應用程式的用途和特色',
        shortDescription: '測試應用程式',
        keywords: ['遊戲'],
        screenshots: ['screenshot1.jpg', 'screenshot2.jpg'],
        featureGraphic: 'feature.jpg',
        iconUrl: 'https://example.com/icon.png',
        developerName: '測試開發商',
        developerEmail: 'dev@example.com',
        price: 0,
        isFree: true,
        releaseDate: new Date(),
        lastUpdated: new Date(),
        size: 1024000,
        languages: ['zh-TW'],
        targetSdkVersion: 33,
        minSdkVersion: 21,
        permissions: [GooglePermission.STORAGE],
      };

      const _result = service.validateAppInfo(appInfo);

      expect(result.complianceStatus).toBe(
        GoogleComplianceStatus.NON_COMPLIANT
      );
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('缺少應用程式名稱');
      expect(result.violations[0].severity).toBe(GoogleRiskLevel.CRITICAL);
    });

    it('應該檢測無效的Package Name', () => {
      const appInfo: GoogleAppInfo = {
        appId: 'app_123',
        appName: '測試應用程式',
        packageName: 'invalid-package-name',
        versionCode: 1,
        versionName: '1.0.0',
        category: GoogleAppCategory.GAMES,
        contentRating: GoogleContentRating.EVERYONE,
        description:
          '這是一個測試應用程式的詳細描述，包含足夠的字符來滿足Google Play的要求，確保描述長度達到80字符以上，這是一個非常詳細的應用程式描述，包含了所有必要的資訊和功能說明，讓用戶能夠充分了解這個應用程式的用途和特色',
        shortDescription: '測試應用程式',
        keywords: ['遊戲'],
        screenshots: ['screenshot1.jpg', 'screenshot2.jpg'],
        featureGraphic: 'feature.jpg',
        iconUrl: 'https://example.com/icon.png',
        developerName: '測試開發商',
        developerEmail: 'dev@example.com',
        price: 0,
        isFree: true,
        releaseDate: new Date(),
        lastUpdated: new Date(),
        size: 1024000,
        languages: ['zh-TW'],
        targetSdkVersion: 33,
        minSdkVersion: 21,
        permissions: [GooglePermission.STORAGE],
      };

      const _result = service.validateAppInfo(appInfo);

      expect(result.complianceStatus).toBe(
        GoogleComplianceStatus.NON_COMPLIANT
      );
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('無效的Package Name格式');
      expect(result.violations[0].severity).toBe(GoogleRiskLevel.CRITICAL);
    });

    it('應該檢測描述不足', () => {
      const appInfo: GoogleAppInfo = {
        appId: 'app_123',
        appName: '測試應用程式',
        packageName: 'com.test.app',
        versionCode: 1,
        versionName: '1.0.0',
        category: GoogleAppCategory.GAMES,
        contentRating: GoogleContentRating.EVERYONE,
        description: '短描述',
        shortDescription: '測試應用程式',
        keywords: ['遊戲'],
        screenshots: ['screenshot1.jpg', 'screenshot2.jpg'],
        featureGraphic: 'feature.jpg',
        iconUrl: 'https://example.com/icon.png',
        developerName: '測試開發商',
        developerEmail: 'dev@example.com',
        price: 0,
        isFree: true,
        releaseDate: new Date(),
        lastUpdated: new Date(),
        size: 1024000,
        languages: ['zh-TW'],
        targetSdkVersion: 33,
        minSdkVersion: 21,
        permissions: [GooglePermission.STORAGE],
      };

      const _result = service.validateAppInfo(appInfo);

      expect(result.complianceStatus).toBe(
        GoogleComplianceStatus.NON_COMPLIANT
      );
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe(
        '應用程式描述不足（至少80字符）'
      );
      expect(result.violations[0].severity).toBe(GoogleRiskLevel.MEDIUM);
    });

    it('應該檢測截圖不足', () => {
      const appInfo: GoogleAppInfo = {
        appId: 'app_123',
        appName: '測試應用程式',
        packageName: 'com.test.app',
        versionCode: 1,
        versionName: '1.0.0',
        category: GoogleAppCategory.GAMES,
        contentRating: GoogleContentRating.EVERYONE,
        description:
          '這是一個測試應用程式的詳細描述，包含足夠的字符來滿足Google Play的要求，確保描述長度達到80字符以上，這是一個非常詳細的應用程式描述，包含了所有必要的資訊和功能說明，讓用戶能夠充分了解這個應用程式的用途和特色',
        shortDescription: '測試應用程式',
        keywords: ['遊戲'],
        screenshots: ['screenshot1.jpg'],
        featureGraphic: 'feature.jpg',
        iconUrl: 'https://example.com/icon.png',
        developerName: '測試開發商',
        developerEmail: 'dev@example.com',
        price: 0,
        isFree: true,
        releaseDate: new Date(),
        lastUpdated: new Date(),
        size: 1024000,
        languages: ['zh-TW'],
        targetSdkVersion: 33,
        minSdkVersion: 21,
        permissions: [GooglePermission.STORAGE],
      };

      const _result = service.validateAppInfo(appInfo);

      expect(result.complianceStatus).toBe(
        GoogleComplianceStatus.NON_COMPLIANT
      );
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('至少需要2張截圖');
      expect(result.violations[0].severity).toBe(GoogleRiskLevel.HIGH);
    });

    it('應該檢測過舊的SDK版本', () => {
      const appInfo: GoogleAppInfo = {
        appId: 'app_123',
        appName: '測試應用程式',
        packageName: 'com.test.app',
        versionCode: 1,
        versionName: '1.0.0',
        category: GoogleAppCategory.GAMES,
        contentRating: GoogleContentRating.EVERYONE,
        description:
          '這是一個測試應用程式的詳細描述，包含足夠的字符來滿足Google Play的要求，確保描述長度達到80字符以上，這是一個非常詳細的應用程式描述，包含了所有必要的資訊和功能說明，讓用戶能夠充分了解這個應用程式的用途和特色',
        shortDescription: '測試應用程式',
        keywords: ['遊戲'],
        screenshots: ['screenshot1.jpg', 'screenshot2.jpg'],
        featureGraphic: 'feature.jpg',
        iconUrl: 'https://example.com/icon.png',
        developerName: '測試開發商',
        developerEmail: 'dev@example.com',
        price: 0,
        isFree: true,
        releaseDate: new Date(),
        lastUpdated: new Date(),
        size: 1024000,
        languages: ['zh-TW'],
        targetSdkVersion: 28,
        minSdkVersion: 21,
        permissions: [GooglePermission.STORAGE],
      };

      const _result = service.validateAppInfo(appInfo);

      expect(result.complianceStatus).toBe(
        GoogleComplianceStatus.NON_COMPLIANT
      );
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe(
        '目標SDK版本過舊，建議使用API 30或更高版本'
      );
      expect(result.violations[0].severity).toBe(GoogleRiskLevel.MEDIUM);
    });
  });

  describe('validateInAppPurchase', () => {
    it('應該驗證有效的內購項目', () => {
      const purchase: GoogleInAppPurchase = {
        productId: 'coins_100',
        productName: '100金幣',
        productType: GoogleInAppPurchaseType.CONSUMABLE,
        price: 30,
        currency: 'TWD',
        description: '購買100個遊戲金幣',
        isActive: true,
        reviewStatus: GoogleComplianceStatus.PENDING,
        purchaseType: 'managed',
      };

      const _result = service.validateInAppPurchase(purchase);

      expect(result.complianceStatus).toBe(GoogleComplianceStatus.COMPLIANT);
      expect(result.riskLevel).toBe(GoogleRiskLevel.LOW);
      expect(result.violations).toHaveLength(0);
    });

    it('應該檢測無效的產品ID', () => {
      const purchase: GoogleInAppPurchase = {
        productId: 'ab',
        productName: '100金幣',
        productType: GoogleInAppPurchaseType.CONSUMABLE,
        price: 30,
        currency: 'TWD',
        description: '購買100個遊戲金幣',
        isActive: true,
        reviewStatus: GoogleComplianceStatus.PENDING,
        purchaseType: 'managed',
      };

      const _result = service.validateInAppPurchase(purchase);

      expect(result.complianceStatus).toBe(
        GoogleComplianceStatus.NON_COMPLIANT
      );
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('無效的產品ID格式');
      expect(result.violations[0].severity).toBe(GoogleRiskLevel.CRITICAL);
    });

    it('應該檢測價格過高', () => {
      const purchase: GoogleInAppPurchase = {
        productId: 'premium_package',
        productName: '豪華禮包',
        productType: GoogleInAppPurchaseType.NON_CONSUMABLE,
        price: 1500,
        currency: 'TWD',
        description: '豪華遊戲禮包',
        isActive: true,
        reviewStatus: GoogleComplianceStatus.PENDING,
        purchaseType: 'managed',
      };

      const _result = service.validateInAppPurchase(purchase);

      expect(result.complianceStatus).toBe(
        GoogleComplianceStatus.NON_COMPLIANT
      );
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe(
        '價格過高，可能違反Google Play政策'
      );
      expect(result.violations[0].severity).toBe(GoogleRiskLevel.HIGH);
    });
  });

  describe('validateSubscription', () => {
    it('應該驗證有效的訂閱項目', () => {
      const subscription: GoogleSubscription = {
        productId: 'premium_monthly',
        productName: '月費會員',
        duration: GoogleSubscriptionDuration.MONTHLY,
        price: 99,
        currency: 'TWD',
        isActive: true,
        reviewStatus: GoogleComplianceStatus.PENDING,
        autoRenewable: true,
        familySharing: true,
      };

      const _result = service.validateSubscription(subscription);

      expect(result.complianceStatus).toBe(GoogleComplianceStatus.COMPLIANT);
      expect(result.riskLevel).toBe(GoogleRiskLevel.LOW);
      expect(result.violations).toHaveLength(0);
    });

    it('應該檢測過長的試用期', () => {
      const subscription: GoogleSubscription = {
        productId: 'premium_yearly',
        productName: '年費會員',
        duration: GoogleSubscriptionDuration.YEARLY,
        price: 999,
        currency: 'TWD',
        trialPeriod: 400,
        trialPeriodUnit: 'days',
        isActive: true,
        reviewStatus: GoogleComplianceStatus.PENDING,
        autoRenewable: true,
        familySharing: false,
      };

      const _result = service.validateSubscription(subscription);

      expect(result.complianceStatus).toBe(
        GoogleComplianceStatus.NON_COMPLIANT
      );
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('試用期不能超過一年');
      expect(result.violations[0].severity).toBe(GoogleRiskLevel.HIGH);
    });
  });

  describe('validatePrivacyPolicy', () => {
    it('應該驗證有效的隱私政策', () => {
      const policy: GooglePrivacyPolicy = {
        policyUrl: 'https://example.com/privacy',
        lastUpdated: new Date(),
        dataCollection: {
          personalData: true,
          usageData: true,
          deviceData: false,
          locationData: false,
          thirdPartyData: false,
          advertisingData: false,
        },
        dataUsage: {
          analytics: true,
          advertising: false,
          personalization: false,
          security: true,
          functionality: true,
        },
        dataSharing: {
          thirdParties: false,
          affiliates: false,
          serviceProviders: true,
          advertisingPartners: false,
        },
        userRights: {
          access: true,
          correction: true,
          deletion: true,
          portability: true,
          optOut: true,
        },
        contactInfo: {
          email: 'privacy@example.com',
        },
        dataRetention: {
          retentionPeriod: 30,
          retentionUnit: 'days',
          deletionPolicy: '自動刪除',
        },
      };

      const _result = service.validatePrivacyPolicy(policy);

      expect(result.complianceStatus).toBe(GoogleComplianceStatus.COMPLIANT);
      expect(result.riskLevel).toBe(GoogleRiskLevel.LOW);
      expect(result.violations).toHaveLength(0);
    });

    it('應該檢測無效的政策URL', () => {
      const policy: GooglePrivacyPolicy = {
        policyUrl: 'invalid-url',
        lastUpdated: new Date(),
        dataCollection: {
          personalData: false,
          usageData: false,
          deviceData: false,
          locationData: false,
          thirdPartyData: false,
          advertisingData: false,
        },
        dataUsage: {
          analytics: false,
          advertising: false,
          personalization: false,
          security: false,
          functionality: false,
        },
        dataSharing: {
          thirdParties: false,
          affiliates: false,
          serviceProviders: false,
          advertisingPartners: false,
        },
        userRights: {
          access: false,
          correction: false,
          deletion: false,
          portability: false,
          optOut: false,
        },
        contactInfo: {
          email: 'privacy@example.com',
        },
        dataRetention: {
          retentionPeriod: 30,
          retentionUnit: 'days',
          deletionPolicy: '自動刪除',
        },
      };

      const _result = service.validatePrivacyPolicy(policy);

      expect(result.complianceStatus).toBe(
        GoogleComplianceStatus.NON_COMPLIANT
      );
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('無效的隱私政策URL');
      expect(result.violations[0].severity).toBe(GoogleRiskLevel.CRITICAL);
    });

    it('應該檢測過期的隱私政策', () => {
      const policy: GooglePrivacyPolicy = {
        policyUrl: 'https://example.com/privacy',
        lastUpdated: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000), // 400天前
        dataCollection: {
          personalData: false,
          usageData: false,
          deviceData: false,
          locationData: false,
          thirdPartyData: false,
          advertisingData: false,
        },
        dataUsage: {
          analytics: false,
          advertising: false,
          personalization: false,
          security: false,
          functionality: false,
        },
        dataSharing: {
          thirdParties: false,
          affiliates: false,
          serviceProviders: false,
          advertisingPartners: false,
        },
        userRights: {
          access: false,
          correction: false,
          deletion: false,
          portability: false,
          optOut: false,
        },
        contactInfo: {
          email: 'privacy@example.com',
        },
        dataRetention: {
          retentionPeriod: 30,
          retentionUnit: 'days',
          deletionPolicy: '自動刪除',
        },
      };

      const _result = service.validatePrivacyPolicy(policy);

      expect(result.complianceStatus).toBe(
        GoogleComplianceStatus.NON_COMPLIANT
      );
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].description).toBe('隱私政策已過期');
      expect(result.violations[0].severity).toBe(GoogleRiskLevel.HIGH);
    });
  });

  describe('processAppReview', () => {
    it('應該處理完整的應用程式審核', () => {
      const appInfo: GoogleAppInfo = {
        appId: 'app_123',
        appName: '測試應用程式',
        packageName: 'com.test.app',
        versionCode: 1,
        versionName: '1.0.0',
        category: GoogleAppCategory.GAMES,
        contentRating: GoogleContentRating.EVERYONE,
        description:
          '這是一個測試應用程式的詳細描述，包含足夠的字符來滿足Google Play的要求，確保描述長度達到80字符以上，這是一個非常詳細的應用程式描述，包含了所有必要的資訊和功能說明，讓用戶能夠充分了解這個應用程式的用途和特色',
        shortDescription: '測試應用程式',
        keywords: ['遊戲'],
        screenshots: ['screenshot1.jpg', 'screenshot2.jpg'],
        featureGraphic: 'feature.jpg',
        iconUrl: 'https://example.com/icon.png',
        developerName: '測試開發商',
        developerEmail: 'dev@example.com',
        price: 0,
        isFree: true,
        releaseDate: new Date(),
        lastUpdated: new Date(),
        size: 1024000,
        languages: ['zh-TW'],
        targetSdkVersion: 33,
        minSdkVersion: 21,
        permissions: [GooglePermission.STORAGE],
      };

      const inAppPurchases: GoogleInAppPurchase[] = [
        {
          productId: 'coins_100',
          productName: '100金幣',
          productType: GoogleInAppPurchaseType.CONSUMABLE,
          price: 30,
          currency: 'TWD',
          description: '購買100個遊戲金幣',
          isActive: true,
          reviewStatus: GoogleComplianceStatus.PENDING,
          purchaseType: 'managed',
        },
      ];

      const subscriptions: GoogleSubscription[] = [
        {
          productId: 'premium_monthly',
          productName: '月費會員',
          duration: GoogleSubscriptionDuration.MONTHLY,
          price: 99,
          currency: 'TWD',
          isActive: true,
          reviewStatus: GoogleComplianceStatus.PENDING,
          autoRenewable: true,
          familySharing: true,
        },
      ];

      const privacyPolicy: GooglePrivacyPolicy = {
        policyUrl: 'https://example.com/privacy',
        lastUpdated: new Date(),
        dataCollection: {
          personalData: false,
          usageData: false,
          deviceData: false,
          locationData: false,
          thirdPartyData: false,
          advertisingData: false,
        },
        dataUsage: {
          analytics: false,
          advertising: false,
          personalization: false,
          security: false,
          functionality: false,
        },
        dataSharing: {
          thirdParties: false,
          affiliates: false,
          serviceProviders: false,
          advertisingPartners: false,
        },
        userRights: {
          access: false,
          correction: false,
          deletion: false,
          portability: false,
          optOut: false,
        },
        contactInfo: {
          email: 'privacy@example.com',
        },
        dataRetention: {
          retentionPeriod: 30,
          retentionUnit: 'days',
          deletionPolicy: '自動刪除',
        },
      };

      const _review = service.processAppReview(
        appInfo,
        inAppPurchases,
        subscriptions,
        privacyPolicy
      );

      expect(review.appId).toBe('app_123');
      expect(review.status).toBe(GoogleComplianceStatus.COMPLIANT);
      expect(review.violations).toHaveLength(0);
      expect(review.requiresResubmission).toBe(false);
    });
  });
});
