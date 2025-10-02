import type {
  MarketingEmail,
  Advertisement,
} from '../../services/marketingComplianceModule';
import { MarketingComplianceModule } from '../../services/marketingComplianceModule';

describe('MarketingComplianceModule', () => {
  let marketingComplianceModule: MarketingComplianceModule;

  beforeEach(async () => {
    marketingComplianceModule = MarketingComplianceModule.getInstance();
    await marketingComplianceModule.reset();
    await marketingComplianceModule.initialize({
      enableConsentManagement: true,
      enableEmailCompliance: true,
      enableAdTransparency: true,
    });
  });

  describe('單例模式', () => {
    it('應該返回相同的實例', () => {
      const _instance1 = MarketingComplianceModule.getInstance();
      const _instance2 = MarketingComplianceModule.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化', () => {
    it('應該SuccessInitialize模組', async () => {
      const _result = await marketingComplianceModule.initialize();
      expect(result).toBe(true);
    });

    it('應該使用自定義配置初始化', async () => {
      const _customConfig = {
        enableConsentManagement: false,
        enableEmailCompliance: true,
        enableAdTransparency: false,
      };
      const _result = await marketingComplianceModule.initialize(customConfig);
      expect(result).toBe(true);
    });
  });

  describe('營銷同意管理', () => {
    it('應該驗證營銷同意', () => {
      const _result = marketingComplianceModule.validateMarketingConsent(
        'user123',
        'email'
      );

      expect(result.id).toBeDefined();
      expect(result.userId).toBe('user123');
      expect(result.channel).toBe('email');
      expect(typeof result.isValid).toBe('boolean');
      expect(['granted', 'denied', 'expired', 'pending']).toContain(
        result.consentStatus
      );
      expect(typeof result.validationNotes).toBe('string');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('應該管理退出請求', () => {
      const _result = marketingComplianceModule.manageOptOut('user456', 'sms');

      expect(result.id).toBeDefined();
      expect(result.userId).toBe('user456');
      expect(result.channel).toBe('sms');
      expect(['opted_out', 'opted_in', 'pending', 'failed']).toContain(
        result.action
      );
      expect(result.effectiveDate).toBeInstanceOf(Date);
      expect(typeof result.processingTime).toBe('number');
      expect(result.processingTime).toBeGreaterThan(0);
      expect(typeof result.notes).toBe('string');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('應該處理不同渠道的同意', () => {
      const _emailResult = marketingComplianceModule.validateMarketingConsent(
        'user1',
        'email'
      );
      const _smsResult = marketingComplianceModule.validateMarketingConsent(
        'user1',
        'sms'
      );
      const _pushResult = marketingComplianceModule.validateMarketingConsent(
        'user1',
        'push'
      );

      expect(emailResult.channel).toBe('email');
      expect(smsResult.channel).toBe('sms');
      expect(pushResult.channel).toBe('push');
    });
  });

  describe('電子郵件合規', () => {
    it('應該驗證合規的電子郵件', () => {
      const email: MarketingEmail = {
        id: 'email123',
        sender: 'marketing@company.com',
        recipients: ['user@example.com'],
        subject: '產品更新通知',
        content: '我們的新產品已經上線',
        contentType: 'promotional',
        hasUnsubscribeLink: true,
        hasPhysicalAddress: true,
        hasValidSubject: true,
        sentAt: new Date(),
      };

      const _result = marketingComplianceModule.validateEmailMarketing(email);

      expect(result.id).toBeDefined();
      expect(result.emailId).toBe('email123');
      expect(typeof result.isCompliant).toBe('boolean');
      expect(Array.isArray(result.violations)).toBe(true);
      expect(typeof result.complianceScore).toBe('number');
      expect(result.complianceScore).toBeGreaterThanOrEqual(0);
      expect(result.complianceScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('應該檢測不合規的電子郵件', () => {
      const email: MarketingEmail = {
        id: 'email456',
        sender: 'spam@fake.com',
        recipients: ['user@example.com'],
        subject: '免費獲得現金',
        content: '立即點擊獲得免費現金',
        contentType: 'promotional',
        hasUnsubscribeLink: false,
        hasPhysicalAddress: false,
        hasValidSubject: false,
        sentAt: new Date(),
      };

      const _result = marketingComplianceModule.validateEmailMarketing(email);

      expect(result.isCompliant).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.complianceScore).toBeLessThan(100);
    });

    it('應該執行CAN-SPAM檢查', () => {
      const email: MarketingEmail = {
        id: 'email789',
        sender: 'legitimate@company.com',
        recipients: ['user@example.com'],
        subject: '合法營銷郵件',
        content: '這是合法的營銷內容',
        contentType: 'newsletter',
        hasUnsubscribeLink: true,
        hasPhysicalAddress: true,
        hasValidSubject: true,
        sentAt: new Date(),
      };

      const _result = marketingComplianceModule.enforceCANSPAM(email);

      expect(result.id).toBeDefined();
      expect(result.emailId).toBe('email789');
      expect(typeof result.isCANSPAMCompliant).toBe('boolean');
      expect(Array.isArray(result.checks)).toBe(true);
      expect(result.checks.length).toBeGreaterThan(0);
      expect(typeof result.overallScore).toBe('number');
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
      expect([
        'compliant',
        'non_compliant',
        'warning',
        'pending_review',
      ]).toContain(result.status);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('應該處理不同類型的郵件', () => {
      const promotionalEmail: MarketingEmail = {
        id: 'promo_email',
        sender: 'marketing@company.com',
        recipients: ['user@example.com'],
        subject: '限時優惠',
        content: '限時優惠活動',
        contentType: 'promotional',
        hasUnsubscribeLink: true,
        hasPhysicalAddress: true,
        hasValidSubject: true,
        sentAt: new Date(),
      };

      const transactionalEmail: MarketingEmail = {
        id: 'transactional_email',
        sender: 'noreply@company.com',
        recipients: ['user@example.com'],
        subject: '訂單確認',
        content: '您的訂單已確認',
        contentType: 'transactional',
        hasUnsubscribeLink: false,
        hasPhysicalAddress: true,
        hasValidSubject: true,
        sentAt: new Date(),
      };

      const _promoResult =
        marketingComplianceModule.validateEmailMarketing(promotionalEmail);
      const _transactionalResult =
        marketingComplianceModule.validateEmailMarketing(transactionalEmail);

      expect(promoResult.emailId).toBe('promo_email');
      expect(transactionalResult.emailId).toBe('transactional_email');
    });
  });

  describe('廣告透明度', () => {
    it('應該追蹤透明廣告', () => {
      const ad: Advertisement = {
        id: 'ad123',
        advertiser: '透明公司',
        adType: 'banner',
        content: '透明廣告內容',
        targetAudience: ['25-35歲', '台北市', '科技愛好者'],
        placement: '首頁橫幅',
        budget: 10000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天後
        isSponsored: true,
        hasDisclosure: true,
      };

      const _result = marketingComplianceModule.trackAdTransparency(ad);

      expect(result.id).toBeDefined();
      expect(result.adId).toBe('ad123');
      expect(typeof result.transparencyScore).toBe('number');
      expect(result.transparencyScore).toBeGreaterThanOrEqual(0);
      expect(result.transparencyScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.disclosures)).toBe(true);
      expect(result.audienceTargeting).toBeDefined();
      expect(result.spendingBreakdown).toBeDefined();
      expect([
        'transparent',
        'partially_transparent',
        'opaque',
        'non_compliant',
      ]).toContain(result.complianceStatus);
      expect(result.generatedAt).toBeInstanceOf(Date);
    });

    it('應該檢測不透明廣告', () => {
      const ad: Advertisement = {
        id: 'ad456',
        advertiser: '不透明公司',
        adType: 'native',
        content: '隱藏廣告內容',
        targetAudience: [],
        placement: '內容流',
        budget: 0,
        startDate: new Date(),
        endDate: new Date(),
        isSponsored: true,
        hasDisclosure: false,
      };

      const _result = marketingComplianceModule.trackAdTransparency(ad);

      expect(result.transparencyScore).toBeLessThan(50);
      expect(result.complianceStatus).toBe('non_compliant');
    });

    it('應該驗證廣告內容', () => {
      const ad: Advertisement = {
        id: 'ad789',
        advertiser: '誠實公司',
        adType: 'video',
        content: '真實的產品介紹',
        targetAudience: ['成年人', '台北市'],
        placement: '視頻流',
        budget: 5000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14天後
        isSponsored: false,
        hasDisclosure: false,
      };

      const _result = marketingComplianceModule.validateAdContent(ad);

      expect(result.id).toBeDefined();
      expect(result.adId).toBe('ad789');
      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.violations)).toBe(true);
      expect(typeof result.riskScore).toBe('number');
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('應該檢測虛假廣告', () => {
      const ad: Advertisement = {
        id: 'fake_ad',
        advertiser: '虛假公司',
        adType: 'social',
        content: '100%有效的神奇產品，保證賺錢',
        targetAudience: ['所有人'],
        placement: '社交媒體',
        budget: 1000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7天後
        isSponsored: true,
        hasDisclosure: false,
      };

      const _result = marketingComplianceModule.validateAdContent(ad);

      expect(result.isValid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.riskScore).toBeGreaterThan(50);
    });

    it('應該處理不同類型的廣告', () => {
      const bannerAd: Advertisement = {
        id: 'banner_ad',
        advertiser: '橫幅公司',
        adType: 'banner',
        content: '橫幅廣告',
        targetAudience: ['一般用戶'],
        placement: '側邊欄',
        budget: 2000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        isSponsored: false,
        hasDisclosure: false,
      };

      const videoAd: Advertisement = {
        id: 'video_ad',
        advertiser: '視頻公司',
        adType: 'video',
        content: '視頻廣告',
        targetAudience: ['視頻用戶'],
        placement: '視頻播放器',
        budget: 8000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        isSponsored: true,
        hasDisclosure: true,
      };

      const _bannerResult =
        marketingComplianceModule.trackAdTransparency(bannerAd);
      const _videoResult =
        marketingComplianceModule.trackAdTransparency(videoAd);

      expect(bannerResult.adId).toBe('banner_ad');
      expect(videoResult.adId).toBe('video_ad');
    });
  });

  describe('配置管理', () => {
    it('應該更新配置', () => {
      const _newConfig = {
        enableConsentManagement: false,
        enableEmailCompliance: true,
        enableAdTransparency: false,
      };

      marketingComplianceModule.updateConfig(newConfig);

      // VerifyConfigure已Update（通過CheckRow為變化）
      const _result = marketingComplianceModule.validateMarketingConsent(
        'test_user',
        'email'
      );
      // 當AgreeManage被Disable時，應該仍然正常工作但可能有不同的Row為
      expect(result.userId).toBe('test_user');
    });
  });

  describe('重置功能', () => {
    it('應該重置模組狀態', async () => {
      // 先Add一些Data
      const email: MarketingEmail = {
        id: 'test_email',
        sender: 'test@company.com',
        recipients: ['user@example.com'],
        subject: '測試郵件',
        content: '測試內容',
        contentType: 'promotional',
        hasUnsubscribeLink: true,
        hasPhysicalAddress: true,
        hasValidSubject: true,
        sentAt: new Date(),
      };

      const ad: Advertisement = {
        id: 'test_ad',
        advertiser: '測試公司',
        adType: 'banner',
        content: '測試廣告',
        targetAudience: ['測試用戶'],
        placement: '測試位置',
        budget: 1000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isSponsored: false,
        hasDisclosure: false,
      };

      marketingComplianceModule.validateEmailMarketing(email);
      marketingComplianceModule.trackAdTransparency(ad);

      // Reset
      await marketingComplianceModule.reset();

      // VerifyReset後的Status（通過Check模組YesNo正常工作）
      const newEmail: MarketingEmail = {
        id: 'new_email',
        sender: 'new@company.com',
        recipients: ['user@example.com'],
        subject: '新郵件',
        content: '新內容',
        contentType: 'promotional',
        hasUnsubscribeLink: true,
        hasPhysicalAddress: true,
        hasValidSubject: true,
        sentAt: new Date(),
      };

      const _result = marketingComplianceModule.validateEmailMarketing(newEmail);
      expect(result.emailId).toBe('new_email');
    });
  });

  describe('邊界條件', () => {
    it('應該處理空內容郵件', () => {
      const email: MarketingEmail = {
        id: 'empty_email',
        sender: 'empty@company.com',
        recipients: ['user@example.com'],
        subject: '',
        content: '',
        contentType: 'promotional',
        hasUnsubscribeLink: false,
        hasPhysicalAddress: false,
        hasValidSubject: false,
        sentAt: new Date(),
      };

      const _result = marketingComplianceModule.validateEmailMarketing(email);
      expect(result.emailId).toBe('empty_email');
    });

    it('應該處理極長內容', () => {
      const email: MarketingEmail = {
        id: 'long_email',
        sender: 'long@company.com',
        recipients: ['user@example.com'],
        subject: 'A'.repeat(1000),
        content: 'A'.repeat(10000),
        contentType: 'newsletter',
        hasUnsubscribeLink: true,
        hasPhysicalAddress: true,
        hasValidSubject: true,
        sentAt: new Date(),
      };

      const _result = marketingComplianceModule.validateEmailMarketing(email);
      expect(result.emailId).toBe('long_email');
    });

    it('應該處理特殊字符', () => {
      const email: MarketingEmail = {
        id: 'special_email',
        sender: 'special@company.com',
        recipients: ['user@example.com'],
        subject: '特殊字符：!@#$%^&*()_+-=[]{}|;:,.<>?',
        content: '特殊內容：!@#$%^&*()_+-=[]{}|;:,.<>?',
        contentType: 'survey',
        hasUnsubscribeLink: true,
        hasPhysicalAddress: true,
        hasValidSubject: true,
        sentAt: new Date(),
      };

      const _result = marketingComplianceModule.validateEmailMarketing(email);
      expect(result.emailId).toBe('special_email');
    });
  });

  describe('性能測試', () => {
    it('應該快速處理大量郵件驗證', () => {
      const _startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        const email: MarketingEmail = {
          id: `email_${i}`,
          sender: `sender${i}@company.com`,
          recipients: [`user${i}@example.com`],
          subject: `郵件${i}`,
          content: `內容${i}`,
          contentType: 'promotional',
          hasUnsubscribeLink: true,
          hasPhysicalAddress: true,
          hasValidSubject: true,
          sentAt: new Date(),
        };

        marketingComplianceModule.validateEmailMarketing(email);
      }

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1Second內Complete
    });

    it('應該快速處理大量廣告透明度檢查', () => {
      const _startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        const ad: Advertisement = {
          id: `ad_${i}`,
          advertiser: `廣告商${i}`,
          adType: 'banner',
          content: `廣告內容${i}`,
          targetAudience: [`目標用戶${i}`],
          placement: `位置${i}`,
          budget: 1000 + i,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isSponsored: i % 2 === 0,
          hasDisclosure: i % 3 === 0,
        };

        marketingComplianceModule.trackAdTransparency(ad);
      }

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1Second內Complete
    });
  });

  describe('功能場景測試', () => {
    it('應該處理完整的營銷合規流程', () => {
      // 1. VerifyUserAgree
      const _consentResult = marketingComplianceModule.validateMarketingConsent(
        'scenario_user',
        'email'
      );

      // 2. Create營銷郵件
      const email: MarketingEmail = {
        id: 'scenario_email',
        sender: 'scenario@company.com',
        recipients: ['scenario_user@example.com'],
        subject: '場景測試郵件',
        content: '這是場景測試的郵件內容',
        contentType: 'promotional',
        hasUnsubscribeLink: true,
        hasPhysicalAddress: true,
        hasValidSubject: true,
        sentAt: new Date(),
      };

      // 3. Verify郵件合規
      const _emailResult =
        marketingComplianceModule.validateEmailMarketing(email);

      // 4. 執RowCAN-SPAMCheck
      const _canspamResult = marketingComplianceModule.enforceCANSPAM(email);

      // 5. Create廣告
      const ad: Advertisement = {
        id: 'scenario_ad',
        advertiser: '場景公司',
        adType: 'social',
        content: '場景測試廣告',
        targetAudience: ['場景用戶'],
        placement: '社交媒體',
        budget: 5000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        isSponsored: true,
        hasDisclosure: true,
      };

      // 6. Trace廣告透明度
      const _transparencyResult =
        marketingComplianceModule.trackAdTransparency(ad);

      // 7. Verify廣告Content
      const _contentResult = marketingComplianceModule.validateAdContent(ad);

      // Verify結果
      expect(consentResult.userId).toBe('scenario_user');
      expect(emailResult.emailId).toBe('scenario_email');
      expect(canspamResult.emailId).toBe('scenario_email');
      expect(transparencyResult.adId).toBe('scenario_ad');
      expect(contentResult.adId).toBe('scenario_ad');
    });

    it('應該處理用戶退出流程', () => {
      // 1. UserAgreeReceive營銷
      const _consentResult = marketingComplianceModule.validateMarketingConsent(
        'optout_user',
        'email'
      );

      // 2. UserSelectExit
      const _optoutResult = marketingComplianceModule.manageOptOut(
        'optout_user',
        'email'
      );

      // 3. 再次VerifyAgreeStatus
      const _newConsentResult =
        marketingComplianceModule.validateMarketingConsent(
          'optout_user',
          'email'
        );

      expect(consentResult.userId).toBe('optout_user');
      expect(optoutResult.userId).toBe('optout_user');
      expect(newConsentResult.userId).toBe('optout_user');
    });
  });
});
