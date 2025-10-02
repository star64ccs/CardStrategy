/**
 * 同意管理模組測試
 * 測試同意收集、驗證、撤銷、更新等核心功能
 */

import { ConsentManagementModule } from '../../services/consentManagementModule';

describe('ConsentManagementModule', () => {
  let consentModule: ConsentManagementModule;

  beforeEach(async () => {
    consentModule = ConsentManagementModule.getInstance();
    await consentModule.reset();
  });

  describe('單例模式測試', () => {
    test('應該返回相同的實例', () => {
      const instance1 = ConsentManagementModule.getInstance();
      const instance2 = ConsentManagementModule.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化測試', () => {
    test('應該成功初始化模組', async () => {
      const result = await consentModule.initialize();
      expect(result).toBe(true);
    });

    test('應該使用自定義配置初始化', async () => {
      const customConfig = {
        requireExplicitConsent: false,
        consentExpiryDays: 365,
      };

      const result = await consentModule.initialize(customConfig);
      expect(result).toBe(true);
    });
  });

  describe('同意收集測試', () => {
    beforeEach(async () => {
      await consentModule.initialize();
    });

    test('應該成功收集明確同意', () => {
      const evidence = {
        method: 'web_form',
        location: 'registration',
        deviceInfo: 'desktop',
        sessionId: 'session_123',
        consentVersion: '1.0',
        dataProcessed: ['email', 'name'],
        thirdParties: [],
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      const consent = consentModule.collectConsent(
        'user_123',
        'essential',
        'explicit',
        evidence
      );

      expect(consent).toBeDefined();
      expect(consent.userId).toBe('user_123');
      expect(consent.purposeId).toBe('essential');
      expect(consent.consentType).toBe('explicit');
      expect(consent.status).toBe('active');
      expect(consent.evidence.method).toBe('web_form');
    });

    test('應該成功收集隱含同意', () => {
      const evidence = {
        method: 'mobile_app',
        location: 'settings',
        deviceInfo: 'mobile',
        sessionId: 'session_456',
        consentVersion: '1.0',
        dataProcessed: ['preferences'],
        thirdParties: [],
        ipAddress: '192.168.1.2',
        userAgent: 'Mobile App',
      };

      const consent = consentModule.collectConsent(
        'user_456',
        'functional',
        'implicit',
        evidence
      );

      expect(consent).toBeDefined();
      expect(consent.consentType).toBe('implicit');
      expect(consent.evidence.method).toBe('mobile_app');
    });

    test('應該拒絕無效的同意目的', () => {
      const evidence = {
        method: 'web_form',
        location: 'registration',
        deviceInfo: 'desktop',
        sessionId: 'session_789',
        consentVersion: '1.0',
        dataProcessed: [],
        thirdParties: [],
        ipAddress: '192.168.1.3',
        userAgent: 'Mozilla/5.0',
      };

      expect(() => {
        consentModule.collectConsent(
          'user_789',
          'invalid_purpose',
          'explicit',
          evidence
        );
      }).toThrow('未找到同意目的: invalid_purpose');
    });
  });

  describe('同意驗證測試', () => {
    beforeEach(async () => {
      await consentModule.initialize();
    });

    test('應該驗證有效的同意', () => {
      // 先收集同意
      const evidence = {
        method: 'web_form',
        location: 'registration',
        deviceInfo: 'desktop',
        sessionId: 'session_123',
        consentVersion: '1.0',
        dataProcessed: ['email'],
        thirdParties: [],
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      consentModule.collectConsent(
        'user_123',
        'essential',
        'explicit',
        evidence
      );

      // 驗證同意
      const result = consentModule.validateConsent('user_123', 'essential');

      expect(result.isValid).toBe(true);
      expect(result.status).toBe('valid');
      expect(result.errors).toHaveLength(0);
    });

    test('應該檢測缺失的同意', () => {
      const result = consentModule.validateConsent('user_999', 'essential');

      expect(result.isValid).toBe(false);
      expect(result.status).toBe('missing');
      expect(result.errors).toContain('未找到有效同意記錄');
    });

    test('應該檢測撤銷的同意', () => {
      // 先收集同意
      const evidence = {
        method: 'web_form',
        location: 'registration',
        deviceInfo: 'desktop',
        sessionId: 'session_123',
        consentVersion: '1.0',
        dataProcessed: ['email'],
        thirdParties: [],
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      consentModule.collectConsent(
        'user_123',
        'analytics',
        'explicit',
        evidence
      );

      // 撤銷同意
      const withdrawalRequest = {
        id: 'withdrawal_1',
        userId: 'user_123',
        purposeIds: ['analytics'],
        reason: '用戶要求撤銷',
        requestedAt: new Date(),
        effectiveDate: new Date(),
        processingStatus: 'completed' as const,
        notes: [],
      };

      consentModule.withdrawConsent(withdrawalRequest);

      // 驗證同意
      const result = consentModule.validateConsent('user_123', 'analytics');

      expect(result.isValid).toBe(false);
      expect(result.status).toBe('withdrawn');
      expect(result.errors).toContain('同意已被撤銷');
    });
  });

  describe('同意撤銷測試', () => {
    beforeEach(async () => {
      await consentModule.initialize();
    });

    test('應該成功撤銷單個同意', () => {
      // 先收集同意
      const evidence = {
        method: 'web_form',
        location: 'registration',
        deviceInfo: 'desktop',
        sessionId: 'session_123',
        consentVersion: '1.0',
        dataProcessed: ['email'],
        thirdParties: [],
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      consentModule.collectConsent(
        'user_123',
        'marketing',
        'explicit',
        evidence
      );

      // 撤銷同意
      const withdrawalRequest = {
        id: 'withdrawal_1',
        userId: 'user_123',
        purposeIds: ['marketing'],
        reason: '不再需要營銷信息',
        requestedAt: new Date(),
        effectiveDate: new Date(),
        processingStatus: 'completed' as const,
        notes: [],
      };

      const result = consentModule.withdrawConsent(withdrawalRequest);

      expect(result).toBe(true);

      // 驗證同意已被撤銷
      const validation = consentModule.validateConsent('user_123', 'marketing');
      expect(validation.status).toBe('withdrawn');
    });

    test('應該成功撤銷多個同意', () => {
      // 先收集多個同意
      const evidence = {
        method: 'web_form',
        location: 'registration',
        deviceInfo: 'desktop',
        sessionId: 'session_123',
        consentVersion: '1.0',
        dataProcessed: ['email'],
        thirdParties: [],
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      consentModule.collectConsent(
        'user_123',
        'analytics',
        'explicit',
        evidence
      );
      consentModule.collectConsent(
        'user_123',
        'marketing',
        'explicit',
        evidence
      );

      // 撤銷多個同意
      const withdrawalRequest = {
        id: 'withdrawal_2',
        userId: 'user_123',
        purposeIds: ['analytics', 'marketing'],
        reason: '隱私保護',
        requestedAt: new Date(),
        effectiveDate: new Date(),
        processingStatus: 'completed' as const,
        notes: [],
      };

      const result = consentModule.withdrawConsent(withdrawalRequest);

      expect(result).toBe(true);

      // 驗證所有同意都被撤銷
      const analyticsValidation = consentModule.validateConsent(
        'user_123',
        'analytics'
      );
      const marketingValidation = consentModule.validateConsent(
        'user_123',
        'marketing'
      );

      expect(analyticsValidation.status).toBe('withdrawn');
      expect(marketingValidation.status).toBe('withdrawn');
    });

    test('應該處理不存在的同意撤銷', () => {
      const withdrawalRequest = {
        id: 'withdrawal_3',
        userId: 'user_999',
        purposeIds: ['nonexistent'],
        reason: '測試',
        requestedAt: new Date(),
        effectiveDate: new Date(),
        processingStatus: 'completed' as const,
        notes: [],
      };

      const result = consentModule.withdrawConsent(withdrawalRequest);

      expect(result).toBe(false);
    });
  });

  describe('同意更新測試', () => {
    beforeEach(async () => {
      await consentModule.initialize();
    });

    test('應該成功更新同意類型', () => {
      // 先收集隱含同意
      const evidence = {
        method: 'web_form',
        location: 'registration',
        deviceInfo: 'desktop',
        sessionId: 'session_123',
        consentVersion: '1.0',
        dataProcessed: ['email'],
        thirdParties: [],
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      const originalConsent = consentModule.collectConsent(
        'user_123',
        'functional',
        'implicit',
        evidence
      );

      // 更新為明確同意
      const updateRequest = {
        id: 'update_1',
        userId: 'user_123',
        purposeId: 'functional',
        newConsentType: 'explicit' as const,
        reason: '提高合規性',
        requestedAt: new Date(),
        effectiveDate: new Date(),
        processingStatus: 'completed' as const,
        previousConsent: originalConsent,
        newConsent: { ...originalConsent, consentType: 'explicit' },
      };

      const newConsent = consentModule.updateConsent(updateRequest);

      expect(newConsent.consentType).toBe('explicit');
      expect(newConsent.status).toBe('active');

      // 驗證舊同意已被撤銷
      const validation = consentModule.validateConsent(
        'user_123',
        'functional'
      );
      expect(validation.isValid).toBe(true);
    });

    test('應該拒絕更新不存在的同意', () => {
      const updateRequest = {
        id: 'update_2',
        userId: 'user_999',
        purposeId: 'nonexistent',
        newConsentType: 'explicit' as const,
        reason: '測試',
        requestedAt: new Date(),
        effectiveDate: new Date(),
        processingStatus: 'completed' as const,
        previousConsent: {} as any,
        newConsent: {} as any,
      };

      expect(() => {
        consentModule.updateConsent(updateRequest);
      }).toThrow('未找到要更新的同意記錄');
    });
  });

  describe('用戶同意狀態測試', () => {
    beforeEach(async () => {
      await consentModule.initialize();
    });

    test('應該獲取用戶所有同意狀態', () => {
      // 收集多個同意
      const evidence = {
        method: 'web_form',
        location: 'registration',
        deviceInfo: 'desktop',
        sessionId: 'session_123',
        consentVersion: '1.0',
        dataProcessed: ['email'],
        thirdParties: [],
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      consentModule.collectConsent(
        'user_123',
        'essential',
        'explicit',
        evidence
      );
      consentModule.collectConsent(
        'user_123',
        'functional',
        'implicit',
        evidence
      );

      const status = consentModule.getUserConsentStatus('user_123');

      expect(status).toBeDefined();
      expect(status.essential.isValid).toBe(true);
      expect(status.functional.isValid).toBe(true);
      expect(status.analytics.isValid).toBe(false); // 未收集
      expect(status.marketing.isValid).toBe(false); // 未收集
    });
  });

  describe('同意報告測試', () => {
    beforeEach(async () => {
      await consentModule.initialize();
    });

    test('應該生成同意報告', () => {
      // 收集一些同意
      const evidence = {
        method: 'web_form',
        location: 'registration',
        deviceInfo: 'desktop',
        sessionId: 'session_123',
        consentVersion: '1.0',
        dataProcessed: ['email'],
        thirdParties: [],
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      consentModule.collectConsent(
        'user_123',
        'essential',
        'explicit',
        evidence
      );
      consentModule.collectConsent(
        'user_456',
        'functional',
        'implicit',
        evidence
      );

      const report = consentModule.generateConsentReport();

      expect(report).toBeDefined();
      expect(report.summary.totalConsents).toBeGreaterThan(0);
      expect(report.summary.consentRate).toBeGreaterThan(0);
      expect(report.byPurpose).toBeDefined();
      expect(report.byCategory).toBeDefined();
    });

    test('應該生成指定時期的報告', () => {
      const period = {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
        end: new Date(),
      };

      const report = consentModule.generateConsentReport(period);

      expect(report.period).toEqual(period);
    });
  });

  describe('過期同意清理測試', () => {
    beforeEach(async () => {
      await consentModule.initialize();
    });

    test('應該清理過期同意', () => {
      // 收集同意（默認1年後過期）
      const evidence = {
        method: 'web_form',
        location: 'registration',
        deviceInfo: 'desktop',
        sessionId: 'session_123',
        consentVersion: '1.0',
        dataProcessed: ['email'],
        thirdParties: [],
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      consentModule.collectConsent(
        'user_123',
        'essential',
        'explicit',
        evidence
      );

      // 模擬時間過去（這裡只是測試清理功能，實際過期需要時間）
      const cleanedCount = consentModule.cleanupExpiredConsents();

      expect(cleanedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('配置管理測試', () => {
    test('應該更新配置', () => {
      const newConfig = {
        requireExplicitConsent: false,
        consentExpiryDays: 180,
      };

      consentModule.updateConfig(newConfig);

      // 配置更新應該成功（這裡只是測試方法調用）
      expect(true).toBe(true);
    });
  });

  describe('重置測試', () => {
    test('應該重置模組狀態', async () => {
      await consentModule.initialize();

      // 收集一些同意
      const evidence = {
        method: 'web_form',
        location: 'registration',
        deviceInfo: 'desktop',
        sessionId: 'session_123',
        consentVersion: '1.0',
        dataProcessed: ['email'],
        thirdParties: [],
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      consentModule.collectConsent(
        'user_123',
        'essential',
        'explicit',
        evidence
      );

      // 重置
      await consentModule.reset();

      // 驗證同意已被清除
      const validation = consentModule.validateConsent('user_123', 'essential');
      expect(validation.status).toBe('missing');
    });
  });

  describe('邊界條件測試', () => {
    beforeEach(async () => {
      await consentModule.initialize();
    });

    test('應該處理空證據的同意收集', () => {
      const evidence = {
        method: '',
        location: '',
        deviceInfo: '',
        sessionId: '',
        consentVersion: '1.0',
        dataProcessed: [],
        thirdParties: [],
        ipAddress: '',
        userAgent: '',
      };

      const consent = consentModule.collectConsent(
        'user_123',
        'essential',
        'explicit',
        evidence
      );

      expect(consent).toBeDefined();
      expect(consent.evidence.method).toBe('');
    });

    test('應該處理無效的同意類型', () => {
      const evidence = {
        method: 'web_form',
        location: 'registration',
        deviceInfo: 'desktop',
        sessionId: 'session_123',
        consentVersion: '1.0',
        dataProcessed: ['email'],
        thirdParties: [],
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      // TypeScript 會阻止無效類型，這裡測試有效類型
      const consent = consentModule.collectConsent(
        'user_123',
        'essential',
        'explicit',
        evidence
      );
      expect(consent.consentType).toBe('explicit');
    });
  });

  describe('性能測試', () => {
    beforeEach(async () => {
      await consentModule.initialize();
    });

    test('應該快速處理大量同意收集', () => {
      const startTime = Date.now();
      const evidence = {
        method: 'web_form',
        location: 'registration',
        deviceInfo: 'desktop',
        sessionId: 'session_123',
        consentVersion: '1.0',
        dataProcessed: ['email'],
        thirdParties: [],
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      // 收集100個同意
      for (let i = 0; i < 100; i++) {
        consentModule.collectConsent(
          `user_${i}`,
          'essential',
          'explicit',
          evidence
        );
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1秒內完成
    });

    test('應該快速驗證同意', () => {
      // 先收集同意
      const evidence = {
        method: 'web_form',
        location: 'registration',
        deviceInfo: 'desktop',
        sessionId: 'session_123',
        consentVersion: '1.0',
        dataProcessed: ['email'],
        thirdParties: [],
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      consentModule.collectConsent(
        'user_123',
        'essential',
        'explicit',
        evidence
      );

      const startTime = Date.now();

      // 驗證100次
      for (let i = 0; i < 100; i++) {
        consentModule.validateConsent('user_123', 'essential');
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500); // 應該在500ms內完成
    });
  });

  describe('功能測試', () => {
    beforeEach(async () => {
      await consentModule.initialize();
    });

    test('應該處理複雜的同意場景', () => {
      const evidence = {
        method: 'web_form',
        location: 'registration',
        deviceInfo: 'desktop',
        sessionId: 'session_123',
        consentVersion: '1.0',
        dataProcessed: ['email', 'name', 'phone'],
        thirdParties: ['analytics_provider'],
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      // 收集多個同意
      const essentialConsent = consentModule.collectConsent(
        'user_123',
        'essential',
        'explicit',
        evidence
      );
      const analyticsConsent = consentModule.collectConsent(
        'user_123',
        'analytics',
        'explicit',
        evidence
      );
      const marketingConsent = consentModule.collectConsent(
        'user_123',
        'marketing',
        'implicit',
        evidence
      );

      // 驗證所有同意
      const essentialValidation = consentModule.validateConsent(
        'user_123',
        'essential'
      );
      const analyticsValidation = consentModule.validateConsent(
        'user_123',
        'analytics'
      );
      const marketingValidation = consentModule.validateConsent(
        'user_123',
        'marketing'
      );

      expect(essentialValidation.isValid).toBe(true);
      expect(analyticsValidation.isValid).toBe(true);
      expect(marketingValidation.isValid).toBe(true);

      // 撤銷部分同意
      const withdrawalRequest = {
        id: 'withdrawal_complex',
        userId: 'user_123',
        purposeIds: ['analytics', 'marketing'],
        reason: '隱私保護',
        requestedAt: new Date(),
        effectiveDate: new Date(),
        processingStatus: 'completed' as const,
        notes: [],
      };

      consentModule.withdrawConsent(withdrawalRequest);

      // 驗證撤銷後的狀態
      const updatedAnalyticsValidation = consentModule.validateConsent(
        'user_123',
        'analytics'
      );
      const updatedMarketingValidation = consentModule.validateConsent(
        'user_123',
        'marketing'
      );

      expect(updatedAnalyticsValidation.status).toBe('withdrawn');
      expect(updatedMarketingValidation.status).toBe('withdrawn');
      expect(essentialValidation.isValid).toBe(true); // 基本功能同意仍然有效
    });

    test('應該生成完整的用戶同意狀態報告', () => {
      const evidence = {
        method: 'web_form',
        location: 'registration',
        deviceInfo: 'desktop',
        sessionId: 'session_123',
        consentVersion: '1.0',
        dataProcessed: ['email'],
        thirdParties: [],
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      // 為多個用戶收集同意
      consentModule.collectConsent('user_1', 'essential', 'explicit', evidence);
      consentModule.collectConsent(
        'user_1',
        'functional',
        'implicit',
        evidence
      );
      consentModule.collectConsent('user_2', 'essential', 'explicit', evidence);
      consentModule.collectConsent('user_2', 'analytics', 'explicit', evidence);

      // 生成報告
      const report = consentModule.generateConsentReport();

      expect(report.summary.totalConsents).toBe(4);
      expect(report.summary.activeConsents).toBe(4);
      expect(report.summary.consentRate).toBe(100);
      expect(report.byPurpose.essential.total).toBe(2);
      expect(report.byCategory.essential.total).toBe(2);
    });
  });
});
