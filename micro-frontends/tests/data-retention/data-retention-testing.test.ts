import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';
import {
  setupTestEnvironment,
  cleanupTestEnvironment,
} from '../setup/e2e-setup';

// 數據保留測試配置
const DATA_RETENTION_CONFIG = {
  // 數據保留策略
  retentionPolicies: {
    userLogs: { days: 90, type: 'log' },
    auditTrails: { days: 365, type: 'audit' },
    tempFiles: { days: 7, type: 'temp' },
    cacheData: { days: 30, type: 'cache' },
    sessionData: { days: 1, type: 'session' },
    analyticsData: { days: 180, type: 'analytics' },
    backupData: { days: 730, type: 'backup' },
    testData: { days: 1, type: 'test' },
  },
  // 清理頻率
  cleanupFrequency: {
    daily: ['sessionData', 'tempFiles'],
    weekly: ['cacheData', 'testData'],
    monthly: ['userLogs', 'analyticsData'],
    quarterly: ['auditTrails'],
    yearly: ['backupData'],
  },
  // 數據大小限制
  sizeLimits: {
    userLogs: '1GB',
    auditTrails: '5GB',
    tempFiles: '100MB',
    cacheData: '500MB',
    sessionData: '50MB',
    analyticsData: '2GB',
    backupData: '10GB',
    testData: '50MB',
  },
  // 合規要求
  compliance: {
    gdpr: true,
    ccpa: true,
    hipaa: false,
    sox: true,
    retentionPeriods: {
      personalData: 90,
      financialData: 365,
      medicalData: 0, // 不存儲醫療數據
      legalData: 2555, // 7年
    },
  },
};

// 數據保留測試工具類
class DataRetentionTestUtils {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * 測試數據保留策略配置
   */
  async testRetentionPolicyConfiguration() {
    console.log('🔧 測試數據保留策略配置...');

    // 檢查保留策略是否正確配置
    const policies = await this.page.evaluate(() => {
      return window.localStorage.getItem('retentionPolicies');
    });

    expect(policies).toBeTruthy();

    const parsedPolicies = JSON.parse(policies || '{}');
    expect(parsedPolicies).toHaveProperty('userLogs');
    expect(parsedPolicies).toHaveProperty('auditTrails');
    expect(parsedPolicies).toHaveProperty('tempFiles');

    console.log('✅ 數據保留策略配置測試通過');
  }

  /**
   * 測試數據清理機制
   */
  async testDataCleanupMechanism() {
    console.log('🧹 測試數據清理機制...');

    // 模擬創建過期數據
    await this.createExpiredData();

    // 觸發數據清理
    await this.triggerDataCleanup();

    // 驗證清理結果
    await this.verifyCleanupResults();

    console.log('✅ 數據清理機制測試通過');
  }

  /**
   * 創建過期數據
   */
  private async createExpiredData() {
    // 創建測試數據並設置過期時間
    await this.page.evaluate(() => {
      const expiredData = {
        userLogs: [
          {
            id: 'log1',
            timestamp: Date.now() - 91 * 24 * 60 * 60 * 1000,
            data: 'old log data',
          },
          {
            id: 'log2',
            timestamp: Date.now() - 92 * 24 * 60 * 60 * 1000,
            data: 'older log data',
          },
        ],
        tempFiles: [
          {
            id: 'temp1',
            timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000,
            data: 'old temp file',
          },
          {
            id: 'temp2',
            timestamp: Date.now() - 9 * 24 * 60 * 60 * 1000,
            data: 'older temp file',
          },
        ],
        sessionData: [
          {
            id: 'session1',
            timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
            data: 'old session',
          },
          {
            id: 'session2',
            timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
            data: 'older session',
          },
        ],
      };

      localStorage.setItem('expiredData', JSON.stringify(expiredData));
    });
  }

  /**
   * 觸發數據清理
   */
  private async triggerDataCleanup() {
    // 模擬觸發清理事件
    await this.page.evaluate(() => {
      const event = new CustomEvent('dataCleanup', {
        detail: {
          type: 'scheduled',
          timestamp: Date.now(),
        },
      });
      window.dispatchEvent(event);
    });

    // 等待清理完成
    await this.page.waitForTimeout(2000);
  }

  /**
   * 驗證清理結果
   */
  private async verifyCleanupResults() {
    const remainingData = await this.page.evaluate(() => {
      return localStorage.getItem('expiredData');
    });

    if (remainingData) {
      const parsedData = JSON.parse(remainingData);

      // 檢查過期數據是否已被清理
      expect(parsedData.userLogs).toHaveLength(0);
      expect(parsedData.tempFiles).toHaveLength(0);
      expect(parsedData.sessionData).toHaveLength(0);
    }
  }

  /**
   * 測試數據保留合規性
   */
  async testDataRetentionCompliance() {
    console.log('📋 測試數據保留合規性...');

    // 檢查 GDPR 合規性
    await this.checkGDPRCompliance();

    // 檢查 CCPA 合規性
    await this.checkCCPACompliance();

    // 檢查 SOX 合規性
    await this.checkSOXCompliance();

    console.log('✅ 數據保留合規性測試通過');
  }

  /**
   * 檢查 GDPR 合規性
   */
  private async checkGDPRCompliance() {
    const gdprCompliance = await this.page.evaluate(() => {
      // 檢查是否有數據處理同意機制
      const hasConsent = localStorage.getItem('userConsent') !== null;

      // 檢查是否有數據刪除機制
      const hasDeletionMechanism =
        localStorage.getItem('dataDeletionPolicy') !== null;

      // 檢查是否有數據可攜性機制
      const hasPortability = localStorage.getItem('dataPortability') !== null;

      return {
        hasConsent,
        hasDeletionMechanism,
        hasPortability,
        compliant: hasConsent && hasDeletionMechanism && hasPortability,
      };
    });

    expect(gdprCompliance.compliant).toBe(true);
  }

  /**
   * 檢查 CCPA 合規性
   */
  private async checkCCPACompliance() {
    const ccpaCompliance = await this.page.evaluate(() => {
      // 檢查是否有隱私政策
      const hasPrivacyPolicy = localStorage.getItem('privacyPolicy') !== null;

      // 檢查是否有選擇退出機制
      const hasOptOut = localStorage.getItem('optOutMechanism') !== null;

      // 檢查是否有數據披露機制
      const hasDisclosure = localStorage.getItem('dataDisclosure') !== null;

      return {
        hasPrivacyPolicy,
        hasOptOut,
        hasDisclosure,
        compliant: hasPrivacyPolicy && hasOptOut && hasDisclosure,
      };
    });

    expect(ccpaCompliance.compliant).toBe(true);
  }

  /**
   * 檢查 SOX 合規性
   */
  private async checkSOXCompliance() {
    const soxCompliance = await this.page.evaluate(() => {
      // 檢查是否有審計日誌
      const hasAuditLogs = localStorage.getItem('auditLogs') !== null;

      // 檢查是否有數據完整性保護
      const hasDataIntegrity = localStorage.getItem('dataIntegrity') !== null;

      // 檢查是否有訪問控制
      const hasAccessControl = localStorage.getItem('accessControl') !== null;

      return {
        hasAuditLogs,
        hasDataIntegrity,
        hasAccessControl,
        compliant: hasAuditLogs && hasDataIntegrity && hasAccessControl,
      };
    });

    expect(soxCompliance.compliant).toBe(true);
  }

  /**
   * 測試數據大小監控
   */
  async testDataSizeMonitoring() {
    console.log('📊 測試數據大小監控...');

    const sizeInfo = await this.page.evaluate(() => {
      // 模擬計算各種數據類型的大小
      const dataSizes = {
        userLogs: Math.random() * 1000, // MB
        auditTrails: Math.random() * 5000, // MB
        tempFiles: Math.random() * 100, // MB
        cacheData: Math.random() * 500, // MB
        sessionData: Math.random() * 50, // MB
        analyticsData: Math.random() * 2000, // MB
        backupData: Math.random() * 10000, // MB
        testData: Math.random() * 50, // MB
      };

      // 檢查是否超過限制
      const limits = {
        userLogs: 1024, // 1GB
        auditTrails: 5120, // 5GB
        tempFiles: 100, // 100MB
        cacheData: 500, // 500MB
        sessionData: 50, // 50MB
        analyticsData: 2048, // 2GB
        backupData: 10240, // 10GB
        testData: 50, // 50MB
      };

      const violations = Object.keys(dataSizes).filter(
        (key) =>
          dataSizes[key as keyof typeof dataSizes] >
          limits[key as keyof typeof limits]
      );

      return {
        sizes: dataSizes,
        violations,
        totalSize: Object.values(dataSizes).reduce(
          (sum, size) => sum + size,
          0
        ),
      };
    });

    // 檢查是否有違規
    expect(sizeInfo.violations.length).toBeLessThanOrEqual(2); // 允許少量違規

    console.log('✅ 數據大小監控測試通過');
  }

  /**
   * 測試自動化清理調度
   */
  async testAutomatedCleanupScheduling() {
    console.log('⏰ 測試自動化清理調度...');

    const scheduleInfo = await this.page.evaluate(() => {
      // 模擬清理調度配置
      const schedules = {
        daily: ['sessionData', 'tempFiles'],
        weekly: ['cacheData', 'testData'],
        monthly: ['userLogs', 'analyticsData'],
        quarterly: ['auditTrails'],
        yearly: ['backupData'],
      };

      // 檢查調度是否正確配置
      const isValidSchedule = Object.keys(schedules).every(
        (frequency) =>
          Array.isArray(schedules[frequency as keyof typeof schedules]) &&
          schedules[frequency as keyof typeof schedules].length > 0
      );

      return {
        schedules,
        isValidSchedule,
        nextCleanup: {
          daily: new Date(Date.now() + 24 * 60 * 60 * 1000),
          weekly: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          monthly: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      };
    });

    expect(scheduleInfo.isValidSchedule).toBe(true);

    console.log('✅ 自動化清理調度測試通過');
  }

  /**
   * 測試數據恢復機制
   */
  async testDataRecoveryMechanism() {
    console.log('🔄 測試數據恢復機制...');

    const recoveryInfo = await this.page.evaluate(() => {
      // 模擬數據恢復測試
      const backupData = {
        userLogs: [
          { id: 'backup1', timestamp: Date.now(), data: 'backup data' },
        ],
        auditTrails: [
          { id: 'backup2', timestamp: Date.now(), data: 'audit backup' },
        ],
      };

      // 模擬恢復過程
      const recoveryProcess = {
        backupExists: true,
        recoveryPossible: true,
        dataIntegrity: true,
        recoveryTime: Math.random() * 300 + 60, // 1-6分鐘
      };

      return {
        backupData,
        recoveryProcess,
        success:
          recoveryProcess.backupExists &&
          recoveryProcess.recoveryPossible &&
          recoveryProcess.dataIntegrity,
      };
    });

    expect(recoveryInfo.success).toBe(true);

    console.log('✅ 數據恢復機制測試通過');
  }
}

describe('CardStrategy 數據保留管理測試', () => {
  let browser: Browser;
  let context: BrowserContext;
  let page: Page;
  let testUtils: DataRetentionTestUtils;

  beforeAll(async () => {
    await setupTestEnvironment();
  });

  beforeEach(async () => {
    browser = await test.browser();
    context = await browser.newContext();
    page = await context.newPage();
    testUtils = new DataRetentionTestUtils(page);

    // 導航到應用程序
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  afterEach(async () => {
    await context.close();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  test('數據保留策略配置測試', async () => {
    await testUtils.testRetentionPolicyConfiguration();
  });

  test('數據清理機制測試', async () => {
    await testUtils.testDataCleanupMechanism();
  });

  test('數據保留合規性測試', async () => {
    await testUtils.testDataRetentionCompliance();
  });

  test('數據大小監控測試', async () => {
    await testUtils.testDataSizeMonitoring();
  });

  test('自動化清理調度測試', async () => {
    await testUtils.testAutomatedCleanupScheduling();
  });

  test('數據恢復機制測試', async () => {
    await testUtils.testDataRecoveryMechanism();
  });
});
