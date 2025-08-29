/**
 * 合規性引擎測試
 * 測試重構計劃任務 1.1: ComplianceEngine 核心服務
 */

import type { Location, Consent } from '../../services/complianceEngine';
import {
  ComplianceEngine,
  Jurisdiction,
  ComplianceResult,
} from '../../services/complianceEngine';

describe('ComplianceEngine', () => {
  let complianceEngine: ComplianceEngine;

  beforeEach(async () => {
    complianceEngine = ComplianceEngine.getInstance();
    await complianceEngine.reset();
    await complianceEngine.initialize();
  });

  afterEach(async () => {
    await complianceEngine.reset();
  });

  describe('單例模式測試', () => {
    it('應該返回相同的實例', () => {
      const _instance1 = ComplianceEngine.getInstance();
      const _instance2 = ComplianceEngine.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化測試', () => {
    it('應該成功初始化引擎', async () => {
      const _result = await complianceEngine.initialize();
      expect(result).toBe(true);
    });

    it('應該使用自定義配置初始化', async () => {
      const _customConfig = {
        enableRealTimeMonitoring: false,
        auditRetentionDays: 180,
      };

      const _result = await complianceEngine.initialize(customConfig);
      expect(result).toBe(true);
    });
  });

  describe('管轄區檢測測試', () => {
    it('應該檢測台灣管轄區', () => {
      const location: Location = {
        country: 'TW',
        city: 'Taipei',
      };

      const _jurisdiction = complianceEngine.detectJurisdiction(location);
      expect(jurisdiction.id).toBe('taiwan');
      expect(jurisdiction.name).toBe('台灣');
      expect(jurisdiction.country).toBe('TW');
    });

    it('應該檢測澳門管轄區', () => {
      const location: Location = {
        country: 'MO',
        city: 'Macau',
      };

      const _jurisdiction = complianceEngine.detectJurisdiction(location);
      expect(jurisdiction.id).toBe('macau');
      expect(jurisdiction.name).toBe('澳門');
      expect(jurisdiction.country).toBe('MO');
    });

    it('應該檢測歐盟GDPR管轄區', () => {
      const location: Location = {
        country: 'EU',
        region: 'Germany',
      };

      const _jurisdiction = complianceEngine.detectJurisdiction(location);
      expect(jurisdiction.id).toBe('eu_gdpr');
      expect(jurisdiction.name).toBe('歐盟GDPR');
      expect(jurisdiction.country).toBe('EU');
    });

    it('應該為未知國家返回默認管轄區', () => {
      const location: Location = {
        country: 'UNKNOWN',
        city: 'Unknown City',
      };

      const _jurisdiction = complianceEngine.detectJurisdiction(location);
      expect(jurisdiction.id).toBe('taiwan'); // 默認管轄區
    });
  });

  describe('法規應用測試', () => {
    it('應該應用台灣法規', () => {
      const _jurisdiction = complianceEngine.detectJurisdiction({
        country: 'TW',
      });
      const _complianceRules = complianceEngine.applyRegulations(jurisdiction);

      expect(complianceRules.jurisdiction.id).toBe('taiwan');
      expect(complianceRules.applicableRegulations.length).toBeGreaterThan(0);
      expect(complianceRules.featureRestrictions).toBeDefined();
      expect(complianceRules.dataRequirements).toBeDefined();
      expect(complianceRules.auditRequirements).toBeDefined();
    });

    it('應該應用澳門法規', () => {
      const _jurisdiction = complianceEngine.detectJurisdiction({
        country: 'MO',
      });
      const _complianceRules = complianceEngine.applyRegulations(jurisdiction);

      expect(complianceRules.jurisdiction.id).toBe('macau');
      expect(complianceRules.applicableRegulations.length).toBeGreaterThan(0);
    });

    it('應該包含隱私法規要求', () => {
      const _jurisdiction = complianceEngine.detectJurisdiction({
        country: 'TW',
      });
      const _complianceRules = complianceEngine.applyRegulations(jurisdiction);

      const _privacyRegulations = complianceRules.applicableRegulations.filter(
        reg => reg.type === 'privacy'
      );
      expect(privacyRegulations.length).toBeGreaterThan(0);
    });
  });

  describe('合規性檢查測試', () => {
    it('應該通過合規性檢查', () => {
      const _data = {
        name: 'John Doe',
        email: 'john@example.com',
        consent: true,
        age: 25,
      };

      const _result = complianceEngine.checkCompliance(data, 'data_collection');
      expect(result.isCompliant).toBe(true);
      expect(result.score).toBe(100);
      expect(result.violations.length).toBe(0);
    });

    it('應該檢測數據最小化違規', () => {
      const _data = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        address: '123 Main St',
        city: 'Taipei',
        country: 'Taiwan',
        postalCode: '10001',
        birthDate: '1990-01-01',
        gender: 'male',
        occupation: 'Engineer',
        company: 'Tech Corp',
        department: 'Engineering',
        salary: '50000',
        consent: true,
      };

      const _result = complianceEngine.checkCompliance(data, 'data_collection');
      expect(result.isCompliant).toBe(false);
      expect(result.score).toBeLessThan(100);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(
        result.violations.some(v => v.requirementId === 'data_minimization')
      ).toBe(true);
    });

    it('應該檢測同意要求違規', () => {
      const _data = {
        name: 'John Doe',
        email: 'john@example.com',
        // 缺少 consent
      };

      const _result = complianceEngine.checkCompliance(data, 'data_collection');
      expect(result.isCompliant).toBe(false);
      expect(
        result.violations.some(v => v.requirementId === 'consent_required')
      ).toBe(true);
    });

    it('應該檢測年齡驗證違規', () => {
      const _data = {
        name: 'Young User',
        age: 16,
        consent: true,
      };

      const _result = complianceEngine.checkCompliance(data, 'gaming_access');
      expect(result.isCompliant).toBe(false);
      expect(
        result.violations.some(v => v.requirementId === 'age_verification')
      ).toBe(true);
    });

    it('應該為非敏感操作通過檢查', () => {
      const _data = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const _result = complianceEngine.checkCompliance(data, 'basic_profile');
      expect(result.isCompliant).toBe(true);
      expect(result.score).toBe(100);
    });
  });

  describe('同意驗證測試', () => {
    it('應該驗證有效同意', () => {
      const consent: Consent = {
        id: 'consent_123',
        userId: 'user_456',
        purposes: ['data_collection', 'marketing'],
        grantedAt: new Date(),
        version: '1.0',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        isActive: true,
      };

      const _result = complianceEngine.validateConsent(consent);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('應該檢測過期同意', () => {
      const consent: Consent = {
        id: 'consent_123',
        userId: 'user_456',
        purposes: ['data_collection'],
        grantedAt: new Date('2020-01-01'),
        expiresAt: new Date('2020-12-31'),
        version: '1.0',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        isActive: true,
      };

      const _result = complianceEngine.validateConsent(consent);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('同意已過期');
    });

    it('應該檢測缺失版本信息', () => {
      const consent: Consent = {
        id: 'consent_123',
        userId: 'user_456',
        purposes: ['data_collection'],
        grantedAt: new Date(),
        version: '',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        isActive: true,
      };

      const _result = complianceEngine.validateConsent(consent);
      expect(result.isValid).toBe(true); // 版本缺失只是警告
      expect(result.warnings).toContain('同意版本信息缺失');
    });

    it('應該檢測缺失IP地址', () => {
      const consent: Consent = {
        id: 'consent_123',
        userId: 'user_456',
        purposes: ['data_collection'],
        grantedAt: new Date(),
        version: '1.0',
        ipAddress: '',
        userAgent: 'Mozilla/5.0',
        isActive: true,
      };

      const _result = complianceEngine.validateConsent(consent);
      expect(result.isValid).toBe(true); // IP缺失只是警告
      expect(result.warnings).toContain('IP地址信息缺失');
    });
  });

  describe('合規報告生成測試', () => {
    it('應該生成合規報告', () => {
      const _jurisdiction = complianceEngine.detectJurisdiction({
        country: 'TW',
      });
      const _report = complianceEngine.generateComplianceReport(jurisdiction);

      expect(report.id).toBeDefined();
      expect(report.jurisdiction.id).toBe('taiwan');
      expect(report.period).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.violations).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(report.generatedAt).toBeDefined();
    });

    it('應該包含正確的統計信息', () => {
      const _report = complianceEngine.generateComplianceReport();

      expect(report.summary.totalChecks).toBeGreaterThanOrEqual(0);
      expect(report.summary.compliantChecks).toBeGreaterThanOrEqual(0);
      expect(report.summary.violations).toBeGreaterThanOrEqual(0);
      expect(report.summary.score).toBeGreaterThanOrEqual(0);
      expect(report.summary.score).toBeLessThanOrEqual(100);
    });
  });

  describe('配置管理測試', () => {
    it('應該更新配置', () => {
      const _newConfig = {
        enableRealTimeMonitoring: false,
        auditRetentionDays: 180,
        alertThreshold: 90,
      };

      complianceEngine.updateConfig(newConfig);

      // 驗證配置已更新（通過檢查行為變化）
      const _data = { name: 'Test', consent: true };
      const _result = complianceEngine.checkCompliance(data, 'data_collection');
      expect(result).toBeDefined();
    });
  });

  describe('重置測試', () => {
    it('應該重置引擎狀態', async () => {
      // 先執行一些操作
      const location: Location = { country: 'TW' };
      complianceEngine.detectJurisdiction(location);

      // 重置
      await complianceEngine.reset();

      // 驗證重置後可以重新初始化
      const _initResult = await complianceEngine.initialize();
      expect(initResult).toBe(true);
    });
  });

  describe('邊界條件測試', () => {
    it('應該處理空數據', () => {
      const _result = complianceEngine.checkCompliance(null, 'data_collection');
      expect(result.isCompliant).toBe(true);
      expect(result.score).toBe(100);
    });

    it('應該處理空操作', () => {
      const _data = { name: 'Test' };
      const _result = complianceEngine.checkCompliance(data, '');
      expect(result.isCompliant).toBe(true);
      expect(result.score).toBe(100);
    });

    it('應該處理無效位置', () => {
      const location: Location = { country: '' };
      const _jurisdiction = complianceEngine.detectJurisdiction(location);
      expect(jurisdiction.id).toBe('taiwan'); // 應該返回默認管轄區
    });
  });

  describe('性能測試', () => {
    it('應該快速處理大量檢查', () => {
      const _startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        const _data = { name: `User ${i}`, consent: true };
        complianceEngine.checkCompliance(data, 'data_collection');
      }

      const _endTime = Date.now();
      const _duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 應該在1秒內完成100次檢查
    });
  });

  describe('功能測試', () => {
    it('應該處理複雜的合規場景', () => {
      // 模擬複雜的用戶數據
      const _complexData = {
        personalInfo: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          address: '123 Main St',
        },
        preferences: {
          marketing: true,
          analytics: false,
          thirdParty: true,
        },
        consent: {
          marketing: true,
          analytics: false,
          thirdParty: true,
          timestamp: new Date(),
          version: '2.0',
        },
        age: 25,
        location: 'TW',
      };

      const _result = complianceEngine.checkCompliance(
        complexData,
        'data_collection'
      );
      expect(result).toBeDefined();
      expect(typeof result.isCompliant).toBe('boolean');
      expect(typeof result.score).toBe('number');
    });

    it('應該處理長期運行的場景', () => {
      const _jurisdictions = ['TW', 'MO', 'EU', 'US', 'CA'];

      jurisdictions.forEach(country => {
        const location: Location = { country };
        const _jurisdiction = complianceEngine.detectJurisdiction(location);
        const _rules = complianceEngine.applyRegulations(jurisdiction);

        expect(jurisdiction).toBeDefined();
        expect(rules).toBeDefined();
      });
    });
  });
});
