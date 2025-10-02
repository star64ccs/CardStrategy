/**
 * RegulatoryAdaptationLayer TestFile
 * Test法規適應層的核心功能和子Service
 */

import type { Regulation } from '../RegulatoryAdaptationLayer';
import {
  RegulatoryAdaptationLayer,
  JurisdictionDetector,
  RegulationMapper,
  ComplianceEngine,
  Jurisdiction,
  RegulationMapping,
  ComplianceStatus,
  RequiredAction,
  RegulationCategory,
} from '../RegulatoryAdaptationLayer';

describe('RegulatoryAdaptationLayer', () => {
  let adaptationLayer: RegulatoryAdaptationLayer;
  let jurisdictionDetector: JurisdictionDetector;
  let regulationMapper: RegulationMapper;
  let complianceEngine: ComplianceEngine;

  beforeEach(async () => {
    // Reset單例Instance
    (RegulatoryAdaptationLayer as any).instance = undefined;

    adaptationLayer = RegulatoryAdaptationLayer.getInstance();
    jurisdictionDetector = new JurisdictionDetector();
    regulationMapper = new RegulationMapper();
    complianceEngine = new ComplianceEngine();

    await adaptationLayer.initialize();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('單例模式', () => {
    it('應該返回相同的實例', () => {
      const _instance1 = RegulatoryAdaptationLayer.getInstance();
      const _instance2 = RegulatoryAdaptationLayer.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('應該正確初始化', async () => {
      expect(adaptationLayer).toBeDefined();
      // VerifyInitialize後有Data
      const _jurisdictions = adaptationLayer.getAllJurisdictions();
      const _regulations = adaptationLayer.getAllRegulations();
      expect(jurisdictions.length).toBeGreaterThan(0);
      expect(regulations.length).toBeGreaterThan(0);
    });
  });

  describe('司法管轄區檢測', () => {
    it('應該基於國家代碼檢測司法管轄區', async () => {
      const _jurisdiction = await adaptationLayer.detectJurisdiction({
        country: 'US',
      });
      expect(jurisdiction.code).toBe('US');
      expect(jurisdiction.name).toBe('United States');
    });

    it('應該基於語言檢測司法管轄區', async () => {
      const _jurisdiction = await adaptationLayer.detectJurisdiction({
        language: 'zh-TW',
      });
      expect(jurisdiction.code).toBe('TW');
      expect(jurisdiction.name).toBe('Taiwan');
    });

    it('應該基於時區檢測司法管轄區', async () => {
      const _jurisdiction = await adaptationLayer.detectJurisdiction({
        timezone: 'Asia/Macau',
      });
      expect(jurisdiction.code).toBe('MO');
      expect(jurisdiction.name).toBe('Macau');
    });

    it('應該處理未知國家代碼', async () => {
      const _jurisdiction = await adaptationLayer.detectJurisdiction({
        country: 'UNKNOWN',
      });
      expect(jurisdiction.code).toBe('GLOBAL');
    });

    it('應該處理空輸入', async () => {
      const _jurisdiction = await adaptationLayer.detectJurisdiction({});
      expect(jurisdiction.code).toBe('GLOBAL');
    });
  });

  describe('法規映射', () => {
    it('應該獲取司法管轄區的法規映射', async () => {
      const _mapping = await adaptationLayer.getRegulationMapping('US');
      expect(mapping.jurisdiction.code).toBe('US');
      expect(mapping.applicableRegulations).toBeDefined();
      expect(mapping.complianceStatus).toBeDefined();
      expect(mapping.requiredActions).toBeDefined();
    });

    it('應該緩存法規映射', async () => {
      const _mapping1 = await adaptationLayer.getRegulationMapping('EU');
      const _mapping2 = await adaptationLayer.getRegulationMapping('EU');
      expect(mapping1).toBe(mapping2);
    });

    it('應該處理未知司法管轄區', async () => {
      await expect(
        adaptationLayer.getRegulationMapping('UNKNOWN')
      ).rejects.toThrow('Jurisdiction not found: UNKNOWN');
    });

    it('應該包含適用的法規', async () => {
      const _mapping = await adaptationLayer.getRegulationMapping('EU');
      expect(mapping.applicableRegulations.length).toBeGreaterThan(0);
      expect(mapping.applicableRegulations[0].jurisdiction).toBe('EU');
    });
  });

  describe('合規檢查', () => {
    it('應該檢查合規狀態', async () => {
      const _mockImplementation = {
        consentManagement: true,
        dataDisclosure: false,
      };

      const _compliance = await adaptationLayer.checkCompliance(
        'US',
        mockImplementation
      );
      expect(compliance.overall).toBeDefined();
      expect(compliance.score).toBeGreaterThanOrEqual(0);
      expect(compliance.score).toBeLessThanOrEqual(100);
      expect(compliance.details).toBeDefined();
    });

    it('應該生成合規建議', async () => {
      const _mockImplementation = {
        consentManagement: false,
        dataDisclosure: false,
      };

      const _recommendations =
        await adaptationLayer.getComplianceRecommendations(
          'US',
          mockImplementation
        );
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('應該處理空實現', async () => {
      const _compliance = await adaptationLayer.checkCompliance('US', {});
      expect(compliance.overall).toBeDefined();
      expect(compliance.score).toBeDefined();
    });
  });

  describe('法規更新', () => {
    it('應該更新法規', async () => {
      const newRegulation: Regulation = {
        id: 'TEST_REG',
        name: 'Test Regulation',
        jurisdiction: 'US',
        category: 'PRIVACY',
        version: '2024',
        effectiveDate: new Date(),
        priority: 'HIGH',
        status: 'ACTIVE',
        requirements: [],
      };

      await adaptationLayer.updateRegulation(newRegulation);
      const _regulations = adaptationLayer.getAllRegulations();
      const _found = regulations.find(r => r.id === 'TEST_REG');
      expect(found).toBeDefined();
    });

    it('應該清除相關緩存', async () => {
      // 先GetMap以建立Cache
      await adaptationLayer.getRegulationMapping('US');

      const newRegulation: Regulation = {
        id: 'CCPA',
        name: 'Updated CCPA',
        jurisdiction: 'US',
        category: 'PRIVACY',
        version: '2024',
        effectiveDate: new Date(),
        priority: 'HIGH',
        status: 'ACTIVE',
        requirements: [],
      };

      await adaptationLayer.updateRegulation(newRegulation);
      // Update後應該ReCreateMap
      const _mapping = await adaptationLayer.getRegulationMapping('US');
      expect(mapping.lastUpdated).toBeDefined();
    });
  });

  describe('數據獲取', () => {
    it('應該獲取所有司法管轄區', () => {
      const _jurisdictions = adaptationLayer.getAllJurisdictions();
      expect(Array.isArray(jurisdictions)).toBe(true);
      expect(jurisdictions.length).toBeGreaterThan(0);

      const _codes = jurisdictions.map(j => j.code);
      expect(codes).toContain('GLOBAL');
      expect(codes).toContain('US');
      expect(codes).toContain('EU');
      expect(codes).toContain('TW');
      expect(codes).toContain('MO');
    });

    it('應該獲取所有法規', () => {
      const _regulations = adaptationLayer.getAllRegulations();
      expect(Array.isArray(regulations)).toBe(true);
      expect(regulations.length).toBeGreaterThan(0);

      const _ids = regulations.map(r => r.id);
      expect(ids).toContain('GDPR');
      expect(ids).toContain('CCPA');
      expect(ids).toContain('PDPA');
    });
  });

  describe('ErrorHandle', () => {
    it('應該處理未初始化的調用', async () => {
      const _uninitializedLayer = RegulatoryAdaptationLayer.getInstance();
      (uninitializedLayer as any).isInitialized = false;

      await expect(
        uninitializedLayer.detectJurisdiction({ country: 'US' })
      ).rejects.toThrow('RegulatoryAdaptationLayer not initialized');
    });

    it('應該HandleInitializeFailed', async () => {
      // Create一個新的Instance來TestInitializeFailed
      const _mockLayer = new (RegulatoryAdaptationLayer as any)();
      jest
        .spyOn(mockLayer as any, 'loadJurisdictions')
        .mockRejectedValue(new Error('Load failed'));

      await expect(mockLayer.initialize()).rejects.toThrow('Load failed');
    });
  });
});

describe('JurisdictionDetector', () => {
  let detector: JurisdictionDetector;

  beforeEach(async () => {
    detector = new JurisdictionDetector();
    const _adaptationLayer = RegulatoryAdaptationLayer.getInstance();
    await adaptationLayer.initialize();
  });

  describe('用戶司法管轄區檢測', () => {
    it('應該檢測用戶司法管轄區', async () => {
      const _jurisdiction = await detector.detectUserJurisdiction({
        country: 'US',
        language: 'en',
        timezone: 'America/New_York',
      });
      expect(jurisdiction.code).toBe('US');
    });

    it('應該處理複雜的用戶數據', async () => {
      const _jurisdiction = await detector.detectUserJurisdiction({
        country: 'TW',
        region: 'Taipei',
        ip: '203.74.120.1',
        language: 'zh-TW',
        timezone: 'Asia/Taipei',
      });
      expect(jurisdiction.code).toBe('TW');
    });
  });

  describe('司法管轄區信息獲取', () => {
    it('應該獲取司法管轄區信息', async () => {
      const _info = await detector.getJurisdictionInfo('US');
      expect(info).toBeDefined();
      expect(info?.code).toBe('US');
      expect(info?.name).toBe('United States');
    });

    it('應該處理未知司法管轄區', async () => {
      const _info = await detector.getJurisdictionInfo('UNKNOWN');
      expect(info).toBeNull();
    });
  });
});

describe('RegulationMapper', () => {
  let mapper: RegulationMapper;

  beforeEach(async () => {
    mapper = new RegulationMapper();
    const _adaptationLayer = RegulatoryAdaptationLayer.getInstance();
    await adaptationLayer.initialize();
  });

  describe('法規映射獲取', () => {
    it('應該獲取法規映射', async () => {
      const _mapping = await mapper.getRegulationMapping('EU');
      expect(mapping.jurisdiction.code).toBe('EU');
      expect(mapping.applicableRegulations).toBeDefined();
    });

    it('應該按類別獲取法規', async () => {
      const _regulations = await mapper.getRegulationsByCategory(
        'EU',
        'PRIVACY'
      );
      expect(Array.isArray(regulations)).toBe(true);
      regulations.forEach(regulation => {
        expect(regulation.category).toBe('PRIVACY');
      });
    });

    it('應該按優先級獲取法規', async () => {
      const _regulations = await mapper.getRegulationsByPriority('US', 'HIGH');
      expect(Array.isArray(regulations)).toBe(true);
      regulations.forEach(regulation => {
        expect(regulation.priority).toBe('HIGH');
      });
    });
  });
});

describe('ComplianceEngine', () => {
  let engine: ComplianceEngine;

  beforeEach(async () => {
    engine = new ComplianceEngine();
    const _adaptationLayer = RegulatoryAdaptationLayer.getInstance();
    await adaptationLayer.initialize();
  });

  describe('合規檢查', () => {
    it('應該檢查合規狀態', async () => {
      const _mockImplementation = {
        consentManagement: true,
        dataDisclosure: true,
        userRights: false,
      };

      const _compliance = await engine.checkCompliance('US', mockImplementation);
      expect(compliance.overall).toBeDefined();
      expect(compliance.score).toBeGreaterThanOrEqual(0);
      expect(compliance.score).toBeLessThanOrEqual(100);
    });

    it('應該生成合規建議', async () => {
      const _mockImplementation = {
        consentManagement: false,
      };

      const _recommendations = await engine.getComplianceRecommendations(
        'US',
        mockImplementation
      );
      expect(Array.isArray(recommendations)).toBe(true);
      recommendations.forEach(action => {
        expect(action.id).toBeDefined();
        expect(action.description).toBeDefined();
        expect(action.priority).toBeDefined();
        expect(action.status).toBe('PENDING');
      });
    });
  });

  describe('合規報告生成', () => {
    it('應該生成完整的合規報告', async () => {
      const _mockImplementation = {
        consentManagement: true,
        dataDisclosure: false,
      };

      const _report = await engine.generateComplianceReport(
        'US',
        mockImplementation
      );
      expect(report.jurisdiction).toBeDefined();
      expect(report.compliance).toBeDefined();
      expect(report.actions).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(typeof report.summary).toBe('string');
    });

    it('應該包含正確的摘要信息', async () => {
      const _mockImplementation = {};
      const _report = await engine.generateComplianceReport(
        'EU',
        mockImplementation
      );

      expect(report.summary).toContain('Compliance Score:');
      expect(report.summary).toContain('Status:');
      expect(report.summary).toContain('Critical Issues:');
      expect(report.summary).toContain('High Priority Issues:');
      expect(report.summary).toContain('Total Actions Required:');
    });
  });

  describe('邊界情況處理', () => {
    it('應該處理空實現', async () => {
      const _compliance = await engine.checkCompliance('US', {});
      expect(compliance.overall).toBeDefined();
      expect(compliance.score).toBeDefined();
    });

    it('應該處理未知司法管轄區', async () => {
      await expect(engine.checkCompliance('UNKNOWN', {})).rejects.toThrow(
        'Jurisdiction not found: UNKNOWN'
      );
    });
  });
});

describe('RegulatoryAdaptationLayer 整合測試', () => {
  let adaptationLayer: RegulatoryAdaptationLayer;
  let detector: JurisdictionDetector;
  let mapper: RegulationMapper;
  let engine: ComplianceEngine;

  beforeEach(async () => {
    adaptationLayer = RegulatoryAdaptationLayer.getInstance();
    detector = new JurisdictionDetector();
    mapper = new RegulationMapper();
    engine = new ComplianceEngine();

    await adaptationLayer.initialize();
  });

  it('應該完成完整的合規工作流程', async () => {
    // 1. 檢測User司法管轄District
    const _jurisdiction = await detector.detectUserJurisdiction({
      country: 'TW',
      language: 'zh-TW',
    });
    expect(jurisdiction.code).toBe('TW');

    // 2. Get法規Map
    const _mapping = await mapper.getRegulationMapping(jurisdiction.code);
    expect(mapping.jurisdiction.code).toBe('TW');

    // 3. Check合規Status
    const _mockImplementation = {
      dataSubjectRights: true,
      consentManagement: false,
    };
    const _compliance = await engine.checkCompliance(
      jurisdiction.code,
      mockImplementation
    );
    expect(compliance.overall).toBeDefined();

    // 4. 生成合規Report
    const _report = await engine.generateComplianceReport(
      jurisdiction.code,
      mockImplementation
    );
    expect(report.jurisdiction.code).toBe('TW');
    expect(report.compliance).toBeDefined();
    expect(report.actions).toBeDefined();
  });

  it('應該處理多司法管轄區場景', async () => {
    const _jurisdictions = ['US', 'EU', 'TW', 'MO'];

    for (const code of jurisdictions) {
      const _mapping = await mapper.getRegulationMapping(code);
      expect(mapping.jurisdiction.code).toBe(code);

      const _compliance = await engine.checkCompliance(code, {});
      expect(compliance.overall).toBeDefined();
    }
  });

  it('應該正確處理法規更新', async () => {
    // Update法規
    const updatedRegulation: Regulation = {
      id: 'GDPR',
      name: 'Updated GDPR',
      jurisdiction: 'EU',
      category: 'PRIVACY',
      version: '2024',
      effectiveDate: new Date(),
      priority: 'HIGH',
      status: 'ACTIVE',
      requirements: [
        {
          id: 'GDPR_002',
          name: 'New Requirement',
          description: 'New GDPR requirement',
          type: 'MANDATORY',
          implementation: 'Implement new feature',
          validation: 'Verify implementation',
          impact: 'CRITICAL',
        },
      ],
    };

    await adaptationLayer.updateRegulation(updatedRegulation);

    // VerifyUpdate
    const _mapping = await mapper.getRegulationMapping('EU');
    const _gdpr = mapping.applicableRegulations.find(r => r.id === 'GDPR');
    expect(gdpr?.name).toBe('Updated GDPR');
    expect(gdpr?.requirements.length).toBe(1);
  });
});
