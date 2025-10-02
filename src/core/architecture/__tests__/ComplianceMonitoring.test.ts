import type { ComplianceEvent, ComplianceRule } from '../ComplianceMonitoring';
import {
  ComplianceMonitoring,
  ComplianceRuleEngine,
  ComplianceEventTracker,
  ComplianceAuditTrail,
  ComplianceEventType,
  ComplianceSeverity,
  ComplianceEventStatus,
  ComplianceCategory,
  ComplianceCondition,
  ComplianceAction,
} from '../ComplianceMonitoring';
import { HybridArchitectureCore } from '../HybridArchitectureCore';
import { TechnicalDebtManagement } from '../TechnicalDebtManagement';

jest.mock('../HybridArchitectureCore');
jest.mock('../TechnicalDebtManagement');

describe('ComplianceMonitoring', () => {
  let monitoring: ComplianceMonitoring;
  let mockHybridCore: jest.Mocked<HybridArchitectureCore>;
  let mockTechnicalDebt: jest.Mocked<TechnicalDebtManagement>;

  beforeEach(() => {
    (ComplianceMonitoring as any).instance = undefined;
    monitoring = ComplianceMonitoring.getInstance();
    mockHybridCore = {
      getInstance: jest.fn().mockReturnValue({}),
    } as any;
    mockTechnicalDebt = {
      getInstance: jest.fn().mockReturnValue({}),
    } as any;
    (HybridArchitectureCore.getInstance as jest.Mock).mockReturnValue(
      mockHybridCore
    );
    (TechnicalDebtManagement.getInstance as jest.Mock).mockReturnValue(
      mockTechnicalDebt
    );
  });

  describe('單例模式', () => {
    it('應該返回相同的實例', () => {
      const _instance1 = ComplianceMonitoring.getInstance();
      const _instance2 = ComplianceMonitoring.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化', () => {
    it('應該SuccessInitialize', async () => {
      const _result = await monitoring.initialize();
      expect(result).toBe(true);
      expect(monitoring.getInitializationStatus()).toBe(true);
    });

    it('應該HandleInitializeFailed', async () => {
      // Create一個新的Instance來TestInitializeFailed
      (ComplianceMonitoring as any).instance = undefined;
      const _newMonitoring = ComplianceMonitoring.getInstance();

      // Mock ruleEngine 的Method
      const _mockRuleEngine = newMonitoring as any;
      mockRuleEngine.ruleEngine = {
        addRule: jest.fn().mockImplementation(() => {
          throw new Error('規則添加Failed');
        }),
      };

      const _result = await newMonitoring.initialize();
      expect(result).toBe(false);
      expect(newMonitoring.getInitializationStatus()).toBe(false);
    });
  });

  describe('事件監控', () => {
    beforeEach(async () => {
      await monitoring.initialize();
    });

    it('應該監控合規事件', () => {
      const event: ComplianceEvent = {
        id: 'test_event_1',
        timestamp: new Date(),
        eventType: ComplianceEventType.DATA_PROCESSING,
        severity: ComplianceSeverity.MEDIUM,
        source: 'test_source',
        description: '測試數據處理事件',
        details: { dataType: 'user_data' },
        jurisdiction: 'EU',
        regulation: 'GDPR',
        status: ComplianceEventStatus.OPEN,
        metadata: {
          tags: ['test', 'data-processing'],
        },
      };

      expect(() => monitoring.monitorEvent(event)).not.toThrow();
    });

    it('應該在未Initialize時拋出Error', () => {
      (ComplianceMonitoring as any).instance = undefined;
      const _newMonitoring = ComplianceMonitoring.getInstance();

      const event: ComplianceEvent = {
        id: 'test_event_2',
        timestamp: new Date(),
        eventType: ComplianceEventType.DATA_PROCESSING,
        severity: ComplianceSeverity.MEDIUM,
        source: 'test_source',
        description: '測試數據處理事件',
        details: { dataType: 'user_data' },
        jurisdiction: 'EU',
        regulation: 'GDPR',
        status: ComplianceEventStatus.OPEN,
        metadata: {
          tags: ['test', 'data-processing'],
        },
      };

      expect(() => newMonitoring.monitorEvent(event)).toThrow(
        '合規監控尚未初始化'
      );
    });
  });

  describe('報告生成', () => {
    beforeEach(async () => {
      await monitoring.initialize();
    });

    it('應該生成合規報告', () => {
      const _report = monitoring.getComplianceReport();
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.events).toBeDefined();
      expect(report.trends).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(typeof report.complianceScore).toBe('number');
    });
  });

  describe('警報管理', () => {
    beforeEach(async () => {
      await monitoring.initialize();
    });

    it('應該獲取警報', () => {
      const _alerts = monitoring.getAlerts();
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('應該獲取未確認警報', () => {
      const _unacknowledgedAlerts = monitoring.getUnacknowledgedAlerts();
      expect(Array.isArray(unacknowledgedAlerts)).toBe(true);
    });

    it('應該確認警報', () => {
      const _alerts = monitoring.getAlerts();
      if (alerts.length > 0) {
        const _alertId = alerts[0].id;
        const _result = monitoring.acknowledgeAlert(alertId, 'test_user');
        expect(result).toBe(true);
      }
    });
  });

  describe('審計日誌', () => {
    beforeEach(async () => {
      await monitoring.initialize();
    });

    it('應該獲取審計日誌', () => {
      const _auditLog = monitoring.getAuditLog();
      expect(Array.isArray(auditLog)).toBe(true);
    });

    it('應該導出審計日誌為 JSON', () => {
      const _jsonExport = monitoring.exportAuditLog('json');
      expect(typeof jsonExport).toBe('string');
      expect(() => JSON.parse(jsonExport)).not.toThrow();
    });

    it('應該導出審計日誌為 CSV', () => {
      // 先Add一個Event，然後再Export
      const event: ComplianceEvent = {
        id: 'csv_export_test',
        timestamp: new Date(),
        eventType: ComplianceEventType.AUDIT_EVENT,
        severity: ComplianceSeverity.LOW,
        source: 'test_source',
        description: 'CSV導出測試事件',
        details: {},
        jurisdiction: 'Global',
        regulation: 'ISO 27001',
        status: ComplianceEventStatus.CLOSED,
        metadata: { tags: ['test'] },
      };

      monitoring.monitorEvent(event);
      const _csvExport = monitoring.exportAuditLog('csv');
      expect(typeof csvExport).toBe('string');
      expect(csvExport).toContain(',');
    });
  });

  describe('規則管理', () => {
    beforeEach(async () => {
      await monitoring.initialize();
    });

    it('應該添加規則', () => {
      const rule: ComplianceRule = {
        id: 'test_rule_1',
        name: '測試規則',
        description: '測試合規規則',
        regulation: 'TEST_REGULATION',
        jurisdiction: 'TEST_JURISDICTION',
        category: ComplianceCategory.PRIVACY,
        conditions: [
          {
            field: 'eventType',
            operator: 'equals',
            value: ComplianceEventType.DATA_PROCESSING,
          },
        ],
        actions: [
          {
            type: 'ALERT',
            parameters: { message: '測試警報' },
          },
        ],
        enabled: true,
        priority: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      monitoring.addRule(rule);
      const _rules = monitoring.getRules();
      expect(rules.some(r => r.id === 'test_rule_1')).toBe(true);
    });

    it('應該刪除規則', () => {
      // 先Add一個規則，然後再Delete
      const rule: ComplianceRule = {
        id: 'test_rule_to_delete',
        name: '要刪除的測試規則',
        description: '測試合規規則',
        regulation: 'TEST_REGULATION',
        jurisdiction: 'TEST_JURISDICTION',
        category: ComplianceCategory.PRIVACY,
        conditions: [],
        actions: [],
        enabled: true,
        priority: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      monitoring.addRule(rule);
      const _result = monitoring.removeRule('test_rule_to_delete');
      expect(result).toBe(true);
    });
  });
});

describe('ComplianceRuleEngine', () => {
  let ruleEngine: ComplianceRuleEngine;
  let mockHybridCore: jest.Mocked<HybridArchitectureCore>;

  beforeEach(() => {
    mockHybridCore = {
      getInstance: jest.fn().mockReturnValue({}),
    } as any;
    (HybridArchitectureCore.getInstance as jest.Mock).mockReturnValue(
      mockHybridCore
    );
    ruleEngine = new ComplianceRuleEngine();
  });

  describe('規則管理', () => {
    it('應該添加規則', () => {
      const rule: ComplianceRule = {
        id: 'test_rule_2',
        name: '測試規則2',
        description: '測試合規規則2',
        regulation: 'TEST_REGULATION',
        jurisdiction: 'TEST_JURISDICTION',
        category: ComplianceCategory.SECURITY,
        conditions: [
          {
            field: 'eventType',
            operator: 'equals',
            value: ComplianceEventType.ACCESS_CONTROL,
          },
        ],
        actions: [
          {
            type: 'LOG',
            parameters: { level: 'INFO' },
          },
        ],
        enabled: true,
        priority: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      ruleEngine.addRule(rule);
      const _retrievedRule = ruleEngine.getRule('test_rule_2');
      expect(retrievedRule).toBeDefined();
      expect(retrievedRule?.id).toBe('test_rule_2');
    });

    it('應該刪除規則', () => {
      const rule: ComplianceRule = {
        id: 'test_rule_3',
        name: '測試規則3',
        description: '測試合規規則3',
        regulation: 'TEST_REGULATION',
        jurisdiction: 'TEST_JURISDICTION',
        category: ComplianceCategory.AUDIT,
        conditions: [],
        actions: [],
        enabled: true,
        priority: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      ruleEngine.addRule(rule);
      const _result = ruleEngine.removeRule('test_rule_3');
      expect(result).toBe(true);

      const _deletedRule = ruleEngine.getRule('test_rule_3');
      expect(deletedRule).toBeUndefined();
    });

    it('應該按類別查詢規則', () => {
      const privacyRule: ComplianceRule = {
        id: 'privacy_rule',
        name: '隱私規則',
        description: '隱私保護規則',
        regulation: 'GDPR',
        jurisdiction: 'EU',
        category: ComplianceCategory.PRIVACY,
        conditions: [],
        actions: [],
        enabled: true,
        priority: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const securityRule: ComplianceRule = {
        id: 'security_rule',
        name: '安全規則',
        description: '安全保護規則',
        regulation: 'ISO 27001',
        jurisdiction: 'Global',
        category: ComplianceCategory.SECURITY,
        conditions: [],
        actions: [],
        enabled: true,
        priority: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      ruleEngine.addRule(privacyRule);
      ruleEngine.addRule(securityRule);

      const _privacyRules = ruleEngine.getRulesByCategory(
        ComplianceCategory.PRIVACY
      );
      const _securityRules = ruleEngine.getRulesByCategory(
        ComplianceCategory.SECURITY
      );

      expect(privacyRules.length).toBe(1);
      expect(securityRules.length).toBe(1);
      expect(privacyRules[0].category).toBe(ComplianceCategory.PRIVACY);
      expect(securityRules[0].category).toBe(ComplianceCategory.SECURITY);
    });

    it('應該按司法管轄區查詢規則', () => {
      const euRule: ComplianceRule = {
        id: 'eu_rule',
        name: '歐盟規則',
        description: '歐盟合規規則',
        regulation: 'GDPR',
        jurisdiction: 'EU',
        category: ComplianceCategory.PRIVACY,
        conditions: [],
        actions: [],
        enabled: true,
        priority: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const globalRule: ComplianceRule = {
        id: 'global_rule',
        name: '全球規則',
        description: '全球合規規則',
        regulation: 'ISO 27001',
        jurisdiction: 'Global',
        category: ComplianceCategory.SECURITY,
        conditions: [],
        actions: [],
        enabled: true,
        priority: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      ruleEngine.addRule(euRule);
      ruleEngine.addRule(globalRule);

      const _euRules = ruleEngine.getRulesByJurisdiction('EU');
      const _globalRules = ruleEngine.getRulesByJurisdiction('Global');

      expect(euRules.length).toBe(1);
      expect(globalRules.length).toBe(1);
      expect(euRules[0].jurisdiction).toBe('EU');
      expect(globalRules[0].jurisdiction).toBe('Global');
    });
  });

  describe('事件評估', () => {
    it('應該評估事件並觸發規則', () => {
      const rule: ComplianceRule = {
        id: 'data_processing_rule',
        name: '數據處理規則',
        description: '檢查數據處理事件',
        regulation: 'GDPR',
        jurisdiction: 'EU',
        category: ComplianceCategory.PRIVACY,
        conditions: [
          {
            field: 'eventType',
            operator: 'equals',
            value: ComplianceEventType.DATA_PROCESSING,
          },
        ],
        actions: [
          {
            type: 'ALERT',
            parameters: { message: '檢測到數據處理事件' },
          },
        ],
        enabled: true,
        priority: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      ruleEngine.addRule(rule);

      const event: ComplianceEvent = {
        id: 'test_event_4',
        timestamp: new Date(),
        eventType: ComplianceEventType.DATA_PROCESSING,
        severity: ComplianceSeverity.MEDIUM,
        source: 'test_source',
        description: '測試數據處理事件',
        details: { dataType: 'user_data' },
        jurisdiction: 'EU',
        regulation: 'GDPR',
        status: ComplianceEventStatus.OPEN,
        metadata: {
          tags: ['test', 'data-processing'],
        },
      };

      const _triggeredEvents = ruleEngine.evaluateEvent(event);
      expect(triggeredEvents.length).toBeGreaterThan(0);
      expect(triggeredEvents[0].eventType).toBe(
        ComplianceEventType.VIOLATION_DETECTED
      );
    });
  });
});

describe('ComplianceEventTracker', () => {
  let eventTracker: ComplianceEventTracker;
  let mockHybridCore: jest.Mocked<HybridArchitectureCore>;

  beforeEach(() => {
    mockHybridCore = {
      getInstance: jest.fn().mockReturnValue({}),
    } as any;
    (HybridArchitectureCore.getInstance as jest.Mock).mockReturnValue(
      mockHybridCore
    );
    eventTracker = new ComplianceEventTracker();
  });

  describe('事件管理', () => {
    it('應該添加事件', () => {
      const event: ComplianceEvent = {
        id: 'test_event_5',
        timestamp: new Date(),
        eventType: ComplianceEventType.ACCESS_CONTROL,
        severity: ComplianceSeverity.HIGH,
        source: 'test_source',
        description: '測試訪問控制事件',
        details: { userId: 'user123' },
        jurisdiction: 'Global',
        regulation: 'ISO 27001',
        status: ComplianceEventStatus.OPEN,
        metadata: {
          tags: ['test', 'access-control'],
        },
      };

      eventTracker.addEvent(event);
      const _retrievedEvent = eventTracker.getEvent('test_event_5');
      expect(retrievedEvent).toBeDefined();
      expect(retrievedEvent?.id).toBe('test_event_5');
    });

    it('應該更新事件', () => {
      const event: ComplianceEvent = {
        id: 'test_event_6',
        timestamp: new Date(),
        eventType: ComplianceEventType.ACCESS_CONTROL,
        severity: ComplianceSeverity.HIGH,
        source: 'test_source',
        description: '測試訪問控制事件',
        details: { userId: 'user123' },
        jurisdiction: 'Global',
        regulation: 'ISO 27001',
        status: ComplianceEventStatus.OPEN,
        metadata: {
          tags: ['test', 'access-control'],
        },
      };

      eventTracker.addEvent(event);
      const _result = eventTracker.updateEvent('test_event_6', {
        status: ComplianceEventStatus.INVESTIGATING,
      });
      expect(result).toBe(true);

      const _updatedEvent = eventTracker.getEvent('test_event_6');
      expect(updatedEvent?.status).toBe(ComplianceEventStatus.INVESTIGATING);
    });
  });

  describe('事件查詢', () => {
    beforeEach(() => {
      const events: ComplianceEvent[] = [
        {
          id: 'event_1',
          timestamp: new Date(),
          eventType: ComplianceEventType.ACCESS_CONTROL,
          severity: ComplianceSeverity.HIGH,
          source: 'source1',
          description: '訪問控制事件1',
          details: {},
          jurisdiction: 'Global',
          regulation: 'ISO 27001',
          status: ComplianceEventStatus.OPEN,
          metadata: { tags: ['access'] },
        },
        {
          id: 'event_2',
          timestamp: new Date(),
          eventType: ComplianceEventType.DATA_PROCESSING,
          severity: ComplianceSeverity.MEDIUM,
          source: 'source2',
          description: '數據處理事件1',
          details: {},
          jurisdiction: 'EU',
          regulation: 'GDPR',
          status: ComplianceEventStatus.RESOLVED,
          metadata: { tags: ['data'] },
        },
      ];

      events.forEach(event => eventTracker.addEvent(event));
    });

    it('應該按狀態查詢事件', () => {
      const _openEvents = eventTracker.getEventsByStatus(
        ComplianceEventStatus.OPEN
      );
      const _resolvedEvents = eventTracker.getEventsByStatus(
        ComplianceEventStatus.RESOLVED
      );

      expect(openEvents.length).toBe(1);
      expect(resolvedEvents.length).toBe(1);
    });

    it('應該按嚴重性查詢事件', () => {
      const _highEvents = eventTracker.getEventsBySeverity(
        ComplianceSeverity.HIGH
      );
      const _mediumEvents = eventTracker.getEventsBySeverity(
        ComplianceSeverity.MEDIUM
      );

      expect(highEvents.length).toBe(1);
      expect(mediumEvents.length).toBe(1);
    });

    it('應該按類型查詢事件', () => {
      const _accessEvents = eventTracker.getEventsByType(
        ComplianceEventType.ACCESS_CONTROL
      );
      const _dataEvents = eventTracker.getEventsByType(
        ComplianceEventType.DATA_PROCESSING
      );

      expect(accessEvents.length).toBe(1);
      expect(dataEvents.length).toBe(1);
    });

    it('應該按司法管轄區查詢事件', () => {
      const _globalEvents = eventTracker.getEventsByJurisdiction('Global');
      const _euEvents = eventTracker.getEventsByJurisdiction('EU');

      expect(globalEvents.length).toBe(1);
      expect(euEvents.length).toBe(1);
    });

    it('應該查詢開放違規', () => {
      const _openViolations = eventTracker.getOpenViolations();
      expect(Array.isArray(openViolations)).toBe(true);
    });
  });

  describe('警報管理', () => {
    it('應該獲取警報', () => {
      const _alerts = eventTracker.getAlerts();
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('應該獲取未確認警報', () => {
      const _unacknowledgedAlerts = eventTracker.getUnacknowledgedAlerts();
      expect(Array.isArray(unacknowledgedAlerts)).toBe(true);
    });

    it('應該確認警報', () => {
      const _alerts = eventTracker.getAlerts();
      if (alerts.length > 0) {
        const _alertId = alerts[0].id;
        const _result = eventTracker.acknowledgeAlert(alertId, 'test_user');
        expect(result).toBe(true);
      }
    });
  });
});

describe('ComplianceAuditTrail', () => {
  let auditTrail: ComplianceAuditTrail;

  beforeEach(() => {
    auditTrail = new ComplianceAuditTrail();
  });

  describe('審計日誌管理', () => {
    it('應該添加審計事件', () => {
      const event: ComplianceEvent = {
        id: 'audit_event_1',
        timestamp: new Date(),
        eventType: ComplianceEventType.AUDIT_EVENT,
        severity: ComplianceSeverity.LOW,
        source: 'audit_source',
        description: '審計事件1',
        details: {},
        jurisdiction: 'Global',
        regulation: 'ISO 27001',
        status: ComplianceEventStatus.CLOSED,
        metadata: { tags: ['audit'] },
      };

      auditTrail.addAuditEvent(event);
      const _auditLog = auditTrail.getAuditLog();
      expect(auditLog.length).toBe(1);
      expect(auditLog[0].id).toBe('audit_event_1');
    });

    it('應該按日期範圍查詢審計日誌', () => {
      const event: ComplianceEvent = {
        id: 'audit_event_2',
        timestamp: new Date(),
        eventType: ComplianceEventType.AUDIT_EVENT,
        severity: ComplianceSeverity.LOW,
        source: 'audit_source',
        description: '審計事件2',
        details: {},
        jurisdiction: 'Global',
        regulation: 'ISO 27001',
        status: ComplianceEventStatus.CLOSED,
        metadata: { tags: ['audit'] },
      };

      auditTrail.addAuditEvent(event);

      const _startDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1天前
      const _endDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1天後

      const _filteredLog = auditTrail.getAuditLogByDateRange(startDate, endDate);
      expect(filteredLog.length).toBe(1);
    });

    it('應該按用戶查詢審計日誌', () => {
      const event: ComplianceEvent = {
        id: 'audit_event_3',
        timestamp: new Date(),
        eventType: ComplianceEventType.AUDIT_EVENT,
        severity: ComplianceSeverity.LOW,
        source: 'audit_source',
        description: '審計事件3',
        details: {},
        jurisdiction: 'Global',
        regulation: 'ISO 27001',
        status: ComplianceEventStatus.CLOSED,
        metadata: {
          tags: ['audit'],
          userId: 'user123',
        },
      };

      auditTrail.addAuditEvent(event);

      const _userLog = auditTrail.getAuditLogByUser('user123');
      expect(userLog.length).toBe(1);
      expect(userLog[0].metadata.userId).toBe('user123');
    });

    it('應該按事件類型查詢審計日誌', () => {
      const event: ComplianceEvent = {
        id: 'audit_event_4',
        timestamp: new Date(),
        eventType: ComplianceEventType.AUDIT_EVENT,
        severity: ComplianceSeverity.LOW,
        source: 'audit_source',
        description: '審計事件4',
        details: {},
        jurisdiction: 'Global',
        regulation: 'ISO 27001',
        status: ComplianceEventStatus.CLOSED,
        metadata: { tags: ['audit'] },
      };

      auditTrail.addAuditEvent(event);

      const _auditEvents = auditTrail.getAuditLogByEventType(
        ComplianceEventType.AUDIT_EVENT
      );
      expect(auditEvents.length).toBe(1);
      expect(auditEvents[0].eventType).toBe(ComplianceEventType.AUDIT_EVENT);
    });
  });

  describe('日誌導出', () => {
    it('應該導出為 JSON 格式', () => {
      const event: ComplianceEvent = {
        id: 'export_event_1',
        timestamp: new Date(),
        eventType: ComplianceEventType.AUDIT_EVENT,
        severity: ComplianceSeverity.LOW,
        source: 'export_source',
        description: '導出測試事件',
        details: {},
        jurisdiction: 'Global',
        regulation: 'ISO 27001',
        status: ComplianceEventStatus.CLOSED,
        metadata: { tags: ['export'] },
      };

      auditTrail.addAuditEvent(event);

      const _jsonExport = auditTrail.exportAuditLog('json');
      expect(typeof jsonExport).toBe('string');
      expect(() => JSON.parse(jsonExport)).not.toThrow();
    });

    it('應該導出為 CSV 格式', () => {
      const event: ComplianceEvent = {
        id: 'export_event_2',
        timestamp: new Date(),
        eventType: ComplianceEventType.AUDIT_EVENT,
        severity: ComplianceSeverity.LOW,
        source: 'export_source',
        description: '導出測試事件2',
        details: {},
        jurisdiction: 'Global',
        regulation: 'ISO 27001',
        status: ComplianceEventStatus.CLOSED,
        metadata: { tags: ['export'] },
      };

      auditTrail.addAuditEvent(event);

      const _csvExport = auditTrail.exportAuditLog('csv');
      expect(typeof csvExport).toBe('string');
      expect(csvExport).toContain(',');
      expect(csvExport).toContain(
        'ID,Timestamp,Event Type,Severity,Source,Description,Jurisdiction,Regulation,Status'
      );
    });
  });
});
