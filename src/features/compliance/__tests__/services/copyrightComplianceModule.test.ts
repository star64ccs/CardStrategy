import type {
  UserContent,
  DMCARequest,
  CounterNotice,
  RightsHolderInfo,
  License,
} from '../../services/copyrightComplianceModule';
import { CopyrightComplianceModule } from '../../services/copyrightComplianceModule';

describe('CopyrightComplianceModule', () => {
  let copyrightComplianceModule: CopyrightComplianceModule;

  beforeEach(async () => {
    copyrightComplianceModule = CopyrightComplianceModule.getInstance();
    await copyrightComplianceModule.reset();
    await copyrightComplianceModule.initialize({
      enableContentFiltering: true,
      enableDMCAProcessing: true,
      enableRightsHolderProtection: true,
    });
  });

  describe('單例模式', () => {
    it('應該返回相同的實例', () => {
      const _instance1 = CopyrightComplianceModule.getInstance();
      const _instance2 = CopyrightComplianceModule.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化', () => {
    it('應該SuccessInitialize模組', async () => {
      const _result = await copyrightComplianceModule.initialize();
      expect(result).toBe(true);
    });

    it('應該使用自定義配置初始化', async () => {
      const _customConfig = {
        enableContentFiltering: false,
        enableDMCAProcessing: true,
        enableRightsHolderProtection: false,
      };
      const _result = await copyrightComplianceModule.initialize(customConfig);
      expect(result).toBe(true);
    });
  });

  describe('內容過濾', () => {
    it('應該過濾版權內容', () => {
      const content: UserContent = {
        id: 'content123',
        userId: 'user123',
        contentType: 'image',
        content: '包含版權圖片的內容',
        metadata: { size: '2MB', format: 'JPEG' },
        uploadDate: new Date(),
        isPublic: true,
      };

      const _result =
        copyrightComplianceModule.filterCopyrightedContent(content);

      expect(result.id).toBeDefined();
      expect(result.contentId).toBe('content123');
      expect(typeof result.isFiltered).toBe('boolean');
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('應該檢測版權違規', () => {
      const content: UserContent = {
        id: 'content456',
        userId: 'user456',
        contentType: 'video',
        content: '包含版權視頻的內容',
        metadata: { duration: '5:30', resolution: '1080p' },
        uploadDate: new Date(),
        isPublic: true,
      };

      const _result =
        copyrightComplianceModule.detectCopyrightViolations(content);

      expect(result.id).toBeDefined();
      expect(result.contentId).toBe('content456');
      expect(Array.isArray(result.violations)).toBe(true);
      expect(typeof result.riskScore).toBe('number');
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('應該處理文本內容', () => {
      const content: UserContent = {
        id: 'content789',
        userId: 'user789',
        contentType: 'text',
        content: '包含版權文本的內容',
        metadata: { wordCount: 500, language: 'zh-TW' },
        uploadDate: new Date(),
        isPublic: false,
      };

      const _filterResult =
        copyrightComplianceModule.filterCopyrightedContent(content);
      const _detectionResult =
        copyrightComplianceModule.detectCopyrightViolations(content);

      expect(filterResult.contentId).toBe('content789');
      expect(detectionResult.contentId).toBe('content789');
    });

    it('應該處理音頻內容', () => {
      const content: UserContent = {
        id: 'content999',
        userId: 'user999',
        contentType: 'audio',
        content: '包含版權音樂的內容',
        metadata: { duration: '3:45', format: 'MP3' },
        uploadDate: new Date(),
        isPublic: true,
      };

      const _filterResult =
        copyrightComplianceModule.filterCopyrightedContent(content);
      const _detectionResult =
        copyrightComplianceModule.detectCopyrightViolations(content);

      expect(filterResult.contentId).toBe('content999');
      expect(detectionResult.contentId).toBe('content999');
    });
  });

  describe('DMCA處理', () => {
    it('應該處理DMCA請求', () => {
      const dmcaRequest: DMCARequest = {
        id: 'dmca123',
        rightsHolder: '版權所有者',
        contactInfo: {
          name: '張三',
          email: 'zhang@example.com',
          phone: '0912345678',
          address: '台北市信義區信義路五段7號',
        },
        contentId: 'content123',
        description: '未經授權使用我們的版權內容',
        evidence: ['原始文件', '版權證明'],
        requestType: 'takedown',
        urgency: 'high',
        submittedAt: new Date(),
      };

      const _result = copyrightComplianceModule.processDMCARequest(dmcaRequest);

      expect(result.id).toBeDefined();
      expect(result.requestId).toBe('dmca123');
      expect([
        'received',
        'reviewing',
        'approved',
        'rejected',
        'pending_evidence',
      ]).toContain(result.status);
      expect(['takedown', 'modify', 'block', 'no_action']).toContain(
        result.action
      );
      expect(typeof result.responseTime).toBe('number');
      expect(result.responseTime).toBeGreaterThan(0);
      expect(typeof result.notes).toBe('string');
      expect(result.processedAt).toBeInstanceOf(Date);
    });

    it('應該處理不同緊急程度的DMCA請求', () => {
      const urgentRequest: DMCARequest = {
        id: 'dmca_urgent',
        rightsHolder: '緊急權利人',
        contactInfo: {
          name: '李四',
          email: 'li@example.com',
          address: '台北市',
        },
        contentId: 'content_urgent',
        description: '緊急下架請求',
        evidence: ['緊急證據'],
        requestType: 'takedown',
        urgency: 'urgent',
        submittedAt: new Date(),
      };

      const lowRequest: DMCARequest = {
        id: 'dmca_low',
        rightsHolder: '一般權利人',
        contactInfo: {
          name: '王五',
          email: 'wang@example.com',
          address: '台北市',
        },
        contentId: 'content_low',
        description: '一般下架請求',
        evidence: ['一般證據'],
        requestType: 'modification',
        urgency: 'low',
        submittedAt: new Date(),
      };

      const _urgentResult =
        copyrightComplianceModule.processDMCARequest(urgentRequest);
      const _lowResult =
        copyrightComplianceModule.processDMCARequest(lowRequest);

      expect(urgentResult.responseTime).toBeLessThan(lowResult.responseTime);
    });

    it('應該處理反通知', () => {
      const counterNotice: CounterNotice = {
        id: 'counter123',
        dmcaRequestId: 'dmca123',
        submitter: '內容創作者',
        contactInfo: {
          name: '趙六',
          email: 'zhao@example.com',
          phone: '0987654321',
          address: '台北市大安區復興南路一段390號',
        },
        statement: '我們擁有使用該內容的合法權利',
        evidence: ['授權證明', '原創證明'],
        submittedAt: new Date(),
      };

      const _result =
        copyrightComplianceModule.handleCounterNotice(counterNotice);

      expect(result.id).toBeDefined();
      expect(result.counterNoticeId).toBe('counter123');
      expect(['received', 'reviewing', 'accepted', 'rejected']).toContain(
        result.status
      );
      expect(typeof result.responseTime).toBe('number');
      expect(result.responseTime).toBeGreaterThan(0);
      expect(typeof result.notes).toBe('string');
      expect(result.processedAt).toBeInstanceOf(Date);
    });
  });

  describe('權利人保護', () => {
    it('應該保護個人權利人', () => {
      const rightsHolder: RightsHolderInfo = {
        id: 'rights_individual',
        name: '個人創作者',
        type: 'individual',
        contactInfo: {
          email: 'creator@example.com',
          phone: '0911111111',
          address: '台北市',
        },
        rights: ['版權', '商標'],
        registrationDate: new Date(),
        verificationStatus: 'verified',
      };

      const _result =
        copyrightComplianceModule.protectRightsHolder(rightsHolder);

      expect(result.id).toBeDefined();
      expect(result.rightsHolderId).toBe('rights_individual');
      expect(['basic', 'enhanced', 'premium']).toContain(
        result.protectionLevel
      );
      expect(Array.isArray(result.features)).toBe(true);
      expect(result.status).toBe('active');
      expect(result.lastUpdated).toBeInstanceOf(Date);
    });

    it('應該保護企業權利人', () => {
      const rightsHolder: RightsHolderInfo = {
        id: 'rights_corporation',
        name: '企業版權所有者',
        type: 'corporation',
        contactInfo: {
          email: 'corp@example.com',
          phone: '0222222222',
          address: '台北市信義區',
        },
        rights: ['版權', '專利', '商標'],
        registrationDate: new Date(),
        verificationStatus: 'verified',
      };

      const _result =
        copyrightComplianceModule.protectRightsHolder(rightsHolder);

      expect(result.rightsHolderId).toBe('rights_corporation');
      expect(result.protectionLevel).toBe('premium');
      expect(result.features.length).toBeGreaterThan(0);
    });

    it('應該保護組織權利人', () => {
      const rightsHolder: RightsHolderInfo = {
        id: 'rights_organization',
        name: '非營利組織',
        type: 'organization',
        contactInfo: {
          email: 'org@example.com',
          address: '台北市',
        },
        rights: ['版權'],
        registrationDate: new Date(),
        verificationStatus: 'pending',
      };

      const _result =
        copyrightComplianceModule.protectRightsHolder(rightsHolder);

      expect(result.rightsHolderId).toBe('rights_organization');
      expect(result.protectionLevel).toBe('enhanced');
    });
  });

  describe('授權管理', () => {
    it('應該創建新授權', () => {
      const license: License = {
        id: 'license123',
        rightsHolderId: 'rights_individual',
        licenseeId: 'licensee123',
        licenseType: 'non_exclusive',
        scope: ['商業使用', '修改'],
        terms: ['不得轉讓', '需標註來源'],
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 一年後
        status: 'active',
      };

      const _result = copyrightComplianceModule.manageLicensing(license);

      expect(result.id).toBeDefined();
      expect(result.licenseId).toBe('license123');
      expect(result.action).toBe('created');
      expect(['success', 'failed', 'pending']).toContain(result.status);
      expect(typeof result.notes).toBe('string');
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('應該處理獨家授權', () => {
      const license: License = {
        id: 'license_exclusive',
        rightsHolderId: 'rights_corporation',
        licenseeId: 'licensee_exclusive',
        licenseType: 'exclusive',
        scope: ['獨家使用', '分銷'],
        terms: ['獨家權利', '最低保證金'],
        startDate: new Date(),
        status: 'active',
      };

      const _result = copyrightComplianceModule.manageLicensing(license);

      expect(result.licenseId).toBe('license_exclusive');
      expect(result.action).toBe('created');
    });

    it('應該處理有限授權', () => {
      const license: License = {
        id: 'license_limited',
        rightsHolderId: 'rights_organization',
        licenseeId: 'licensee_limited',
        licenseType: 'limited',
        scope: ['教育使用'],
        terms: ['僅限教育目的'],
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天後
        status: 'active',
      };

      const _result = copyrightComplianceModule.manageLicensing(license);

      expect(result.licenseId).toBe('license_limited');
      expect(result.action).toBe('created');
    });

    it('應該處理永久授權', () => {
      const license: License = {
        id: 'license_perpetual',
        rightsHolderId: 'rights_individual',
        licenseeId: 'licensee_perpetual',
        licenseType: 'perpetual',
        scope: ['永久使用'],
        terms: ['永久有效'],
        startDate: new Date(),
        status: 'active',
      };

      const _result = copyrightComplianceModule.manageLicensing(license);

      expect(result.licenseId).toBe('license_perpetual');
      expect(result.action).toBe('created');
    });
  });

  describe('配置管理', () => {
    it('應該更新配置', () => {
      const _newConfig = {
        enableContentFiltering: false,
        enableDMCAProcessing: true,
        enableRightsHolderProtection: false,
      };

      copyrightComplianceModule.updateConfig(newConfig);

      // VerifyConfigure已Update（通過CheckRow為變化）
      const content: UserContent = {
        id: 'test_content',
        userId: 'test_user',
        contentType: 'text',
        content: '測試內容',
        metadata: {},
        uploadDate: new Date(),
        isPublic: true,
      };

      const _result =
        copyrightComplianceModule.filterCopyrightedContent(content);
      // 當ContentFilter被Disable時，應該不會被Filter
      expect(result.isFiltered).toBe(false);
    });
  });

  describe('重置功能', () => {
    it('應該重置模組狀態', async () => {
      // 先Add一些Data
      const content: UserContent = {
        id: 'test_content',
        userId: 'test_user',
        contentType: 'text',
        content: '測試內容',
        metadata: {},
        uploadDate: new Date(),
        isPublic: true,
      };

      const dmcaRequest: DMCARequest = {
        id: 'test_dmca',
        rightsHolder: '測試權利人',
        contactInfo: {
          name: '測試',
          email: 'test@example.com',
          address: '測試地址',
        },
        contentId: 'test_content',
        description: '測試描述',
        evidence: ['測試證據'],
        requestType: 'takedown',
        urgency: 'low',
        submittedAt: new Date(),
      };

      copyrightComplianceModule.filterCopyrightedContent(content);
      copyrightComplianceModule.processDMCARequest(dmcaRequest);

      // Reset
      await copyrightComplianceModule.reset();

      // VerifyReset後的Status（通過Check模組YesNo正常工作）
      const newContent: UserContent = {
        id: 'new_content',
        userId: 'new_user',
        contentType: 'text',
        content: '新內容',
        metadata: {},
        uploadDate: new Date(),
        isPublic: true,
      };

      const _result =
        copyrightComplianceModule.filterCopyrightedContent(newContent);
      expect(result.contentId).toBe('new_content');
    });
  });

  describe('邊界條件', () => {
    it('應該處理空內容', () => {
      const content: UserContent = {
        id: 'empty_content',
        userId: 'user123',
        contentType: 'text',
        content: '',
        metadata: {},
        uploadDate: new Date(),
        isPublic: true,
      };

      const _filterResult =
        copyrightComplianceModule.filterCopyrightedContent(content);
      const _detectionResult =
        copyrightComplianceModule.detectCopyrightViolations(content);

      expect(filterResult.contentId).toBe('empty_content');
      expect(detectionResult.contentId).toBe('empty_content');
    });

    it('應該處理特殊字符內容', () => {
      const content: UserContent = {
        id: 'special_content',
        userId: 'user123',
        contentType: 'text',
        content: '特殊字符：!@#$%^&*()_+-=[]{}|;:,.<>?',
        metadata: {},
        uploadDate: new Date(),
        isPublic: true,
      };

      const _filterResult =
        copyrightComplianceModule.filterCopyrightedContent(content);
      const _detectionResult =
        copyrightComplianceModule.detectCopyrightViolations(content);

      expect(filterResult.contentId).toBe('special_content');
      expect(detectionResult.contentId).toBe('special_content');
    });

    it('應該處理極長內容', () => {
      const content: UserContent = {
        id: 'long_content',
        userId: 'user123',
        contentType: 'text',
        content: 'A'.repeat(10000), // 極長Content
        metadata: {},
        uploadDate: new Date(),
        isPublic: true,
      };

      const _filterResult =
        copyrightComplianceModule.filterCopyrightedContent(content);
      const _detectionResult =
        copyrightComplianceModule.detectCopyrightViolations(content);

      expect(filterResult.contentId).toBe('long_content');
      expect(detectionResult.contentId).toBe('long_content');
    });
  });

  describe('性能測試', () => {
    it('應該快速處理大量內容過濾', () => {
      const _startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        const content: UserContent = {
          id: `content_${i}`,
          userId: `user_${i}`,
          contentType: 'text',
          content: `內容${i}`,
          metadata: {},
          uploadDate: new Date(),
          isPublic: true,
        };

        copyrightComplianceModule.filterCopyrightedContent(content);
      }

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1Second內Complete
    });

    it('應該快速處理大量違規檢測', () => {
      const _startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        const content: UserContent = {
          id: `content_${i}`,
          userId: `user_${i}`,
          contentType: 'image',
          content: `圖片內容${i}`,
          metadata: {},
          uploadDate: new Date(),
          isPublic: true,
        };

        copyrightComplianceModule.detectCopyrightViolations(content);
      }

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1Second內Complete
    });
  });

  describe('功能場景測試', () => {
    it('應該處理完整的版權合規流程', () => {
      // 1. CreateUserContent
      const content: UserContent = {
        id: 'scenario_content',
        userId: 'scenario_user',
        contentType: 'video',
        content: '包含版權視頻的內容',
        metadata: { duration: '10:00', resolution: '4K' },
        uploadDate: new Date(),
        isPublic: true,
      };

      // 2. FilterContent
      const _filterResult =
        copyrightComplianceModule.filterCopyrightedContent(content);

      // 3. 檢測違規
      const _detectionResult =
        copyrightComplianceModule.detectCopyrightViolations(content);

      // 4. HandleDMCARequest
      const dmcaRequest: DMCARequest = {
        id: 'scenario_dmca',
        rightsHolder: '版權所有者',
        contactInfo: {
          name: '版權所有者',
          email: 'owner@example.com',
          address: '台北市',
        },
        contentId: 'scenario_content',
        description: '未經授權使用版權內容',
        evidence: ['版權證明'],
        requestType: 'takedown',
        urgency: 'high',
        submittedAt: new Date(),
      };

      const _dmcaResult =
        copyrightComplianceModule.processDMCARequest(dmcaRequest);

      // 5. 保護權利人
      const rightsHolder: RightsHolderInfo = {
        id: 'scenario_rights',
        name: '版權所有者',
        type: 'corporation',
        contactInfo: {
          email: 'owner@example.com',
          address: '台北市',
        },
        rights: ['版權'],
        registrationDate: new Date(),
        verificationStatus: 'verified',
      };

      const _protectionResult =
        copyrightComplianceModule.protectRightsHolder(rightsHolder);

      // Verify結果
      expect(filterResult.contentId).toBe('scenario_content');
      expect(detectionResult.contentId).toBe('scenario_content');
      expect(dmcaResult.requestId).toBe('scenario_dmca');
      expect(protectionResult.rightsHolderId).toBe('scenario_rights');
      expect(protectionResult.protectionLevel).toBe('premium');
    });

    it('應該處理反通知流程', () => {
      // 1. CreateDMCARequest
      const dmcaRequest: DMCARequest = {
        id: 'counter_dmca',
        rightsHolder: '權利人',
        contactInfo: {
          name: '權利人',
          email: 'rights@example.com',
          address: '台北市',
        },
        contentId: 'counter_content',
        description: '版權侵權',
        evidence: ['證據'],
        requestType: 'takedown',
        urgency: 'medium',
        submittedAt: new Date(),
      };

      copyrightComplianceModule.processDMCARequest(dmcaRequest);

      // 2. Handle反Notification
      const counterNotice: CounterNotice = {
        id: 'counter_notice',
        dmcaRequestId: 'counter_dmca',
        submitter: '內容創作者',
        contactInfo: {
          name: '創作者',
          email: 'creator@example.com',
          address: '台北市',
        },
        statement: '我們擁有合法使用權',
        evidence: ['授權證明'],
        submittedAt: new Date(),
      };

      const _counterResult =
        copyrightComplianceModule.handleCounterNotice(counterNotice);

      expect(counterResult.counterNoticeId).toBe('counter_notice');
      expect(['received', 'reviewing', 'accepted', 'rejected']).toContain(
        counterResult.status
      );
    });
  });
});
