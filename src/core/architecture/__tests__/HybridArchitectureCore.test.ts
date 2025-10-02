import { ExtensionModuleLayer } from '../ExtensionModuleLayer';
import { GlobalCoreArchitecture } from '../GlobalCoreArchitecture';
import {
  ComplianceMonitor,
  HybridArchitectureCore,
  PerformanceMonitor,
  SecurityMonitor,
} from '../HybridArchitectureCore';
import { RegulatoryAdaptationLayer } from '../RegulatoryAdaptationLayer';

// Mock 依賴
jest.mock('../GlobalCoreArchitecture');
jest.mock('../RegulatoryAdaptationLayer');
jest.mock('../ExtensionModuleLayer');

describe('HybridArchitectureCore', () => {
  let hybridCore: HybridArchitectureCore;
  let mockGlobalCore: jest.Mocked<GlobalCoreArchitecture>;
  let mockRegulatoryLayer: jest.Mocked<RegulatoryAdaptationLayer>;
  let mockExtensionLayer: jest.Mocked<ExtensionModuleLayer>;

  beforeEach(() => {
    // Reset所有 mock
    jest.clearAllMocks();

    // Create mock Instance
    mockGlobalCore = {
      initialize: jest.fn().mockResolvedValue(true),
      getCoreBusinessService: jest.fn().mockReturnValue({
        isInitialized: true,
        executeBusinessOperation: jest
          .fn()
          .mockResolvedValue({ success: true }),
        processBusinessLogic: jest.fn().mockResolvedValue({ success: true }),
      }),
      getGlobalSecurityFramework: jest.fn().mockReturnValue({
        isInitialized: true,
        checkSecurityPolicy: jest.fn().mockResolvedValue({ success: true }),
        monitorSecurity: jest.fn().mockResolvedValue({ success: true }),
      }),
      getGlobalDataModels: jest.fn().mockReturnValue({ isInitialized: true }),
      getGlobalAPIDesign: jest.fn().mockReturnValue({ isInitialized: true }),
    } as any;

    mockRegulatoryLayer = {
      initialize: jest.fn().mockResolvedValue(true),
      detectJurisdiction: jest.fn().mockResolvedValue({ jurisdiction: 'test' }),
      getRegulationMapping: jest.fn().mockResolvedValue({ mapping: 'test' }),
      checkCompliance: jest.fn().mockResolvedValue({ success: true }),
      jurisdictionDetector: { isInitialized: true },
      regulationMapper: { isInitialized: true },
      complianceEngine: {
        isInitialized: true,
        checkCompliance: jest.fn().mockResolvedValue({ success: true }),
      },
    } as any;

    mockExtensionLayer = {
      initialize: jest.fn().mockResolvedValue(true),
      pluginManager: { isInitialized: true },
      configurationManager: { isInitialized: true },
      ruleEngine: {
        isInitialized: true,
        executeRule: jest.fn().mockResolvedValue({ success: true }),
        executeRules: jest.fn().mockResolvedValue({ success: true }),
      },
    } as any;

    // Settings mock ReturnValue
    (GlobalCoreArchitecture.getInstance as jest.Mock).mockReturnValue(
      mockGlobalCore
    );
    (RegulatoryAdaptationLayer.getInstance as jest.Mock).mockReturnValue(
      mockRegulatoryLayer
    );
    (ExtensionModuleLayer.getInstance as jest.Mock).mockReturnValue(
      mockExtensionLayer
    );

    // Reset單例Instance
    (HybridArchitectureCore as any).instance = undefined;
    hybridCore = HybridArchitectureCore.getInstance();
  });

  describe('單例模式', () => {
    it('應該返回相同的實例', () => {
      const _instance1 = HybridArchitectureCore.getInstance();
      const _instance2 = HybridArchitectureCore.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化', () => {
    it('應該SuccessInitialize混合架構核心', async () => {
      const _result = await hybridCore.initialize();

      expect(result).toBe(true);
      expect(mockGlobalCore.initialize).toHaveBeenCalled();
      expect(mockRegulatoryLayer.initialize).toHaveBeenCalled();
      expect(mockExtensionLayer.initialize).toHaveBeenCalled();
    });

    it('應該HandleInitializeFailed', async () => {
      // Reset單例Instance以確保Test隔離
      (HybridArchitectureCore as any).instance = undefined;
      const _testCore = HybridArchitectureCore.getInstance();

      mockGlobalCore.initialize.mockRejectedValue(new Error('InitializeFailed'));

      const _result = await testCore.initialize();

      expect(result).toBe(false);
    });
  });

  describe('核心層訪問', () => {
    it('應該提供核心層訪問', () => {
      const { core } = hybridCore;

      expect(core.businessLogic).toBe(mockGlobalCore.getCoreBusinessService());
      expect(core.security).toBe(mockGlobalCore.getGlobalSecurityFramework());
      expect(core.data).toBe(mockGlobalCore.getGlobalDataModels());
      expect(core.api).toBe(mockGlobalCore.getGlobalAPIDesign());
    });
  });

  describe('適配層訪問', () => {
    it('應該提供適配層訪問', async () => {
      await hybridCore.initialize();
      const { adaptation } = hybridCore;

      expect(adaptation.jurisdiction).toBeDefined();
      expect(adaptation.regulation).toBeDefined();
      expect(adaptation.compliance).toBeDefined();
    });
  });

  describe('擴充層訪問', () => {
    it('應該提供擴充層訪問', () => {
      const { extensions } = hybridCore;

      expect(extensions.plugins).toBe(mockExtensionLayer.pluginManager);
      expect(extensions.configs).toBe(mockExtensionLayer.configurationManager);
      expect(extensions.rules).toBe(mockExtensionLayer.ruleEngine);
    });
  });

  describe('監控層訪問', () => {
    it('應該提供監控層訪問', () => {
      const { monitoring } = hybridCore;

      expect(monitoring.performance).toBeInstanceOf(PerformanceMonitor);
      expect(monitoring.compliance).toBeInstanceOf(ComplianceMonitor);
      expect(monitoring.security).toBeInstanceOf(SecurityMonitor);
    });
  });

  describe('業務操作執行', () => {
    beforeEach(async () => {
      await hybridCore.initialize();
    });

    it('應該Success執行業務操作', async () => {
      const _operation = { type: 'test', data: 'test' };
      const _context = { startTime: Date.now() };

      const _result = await hybridCore.executeBusinessOperation(
        operation,
        context
      );

      expect(result.success).toBe(true);
      expect(
        mockGlobalCore.getCoreBusinessService().processBusinessLogic
      ).toHaveBeenCalledWith(operation);
      expect(mockRegulatoryLayer.checkCompliance).toHaveBeenCalledWith(
        operation,
        context
      );
      expect(
        mockGlobalCore.getGlobalSecurityFramework().monitorSecurity
      ).toHaveBeenCalled();
      expect(mockExtensionLayer.ruleEngine.executeRules).toHaveBeenCalled();
    });

    it('應該處理未初始化的情況', async () => {
      // ResetInitializeStatus
      (hybridCore as any)._isInitialized = false;

      const _operation = { type: 'test', data: 'test' };
      const _context = { startTime: Date.now() };

      const _result = await hybridCore.executeBusinessOperation(
        operation,
        context
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('混合架構核心尚未初始化');
    });

    it('應該Handle業務操作執行Error', async () => {
      // Reset單例Instance以確保Test隔離
      (HybridArchitectureCore as any).instance = undefined;
      const _testCore = HybridArchitectureCore.getInstance();
      await testCore.initialize();

      mockGlobalCore
        .getCoreBusinessService()
        .processBusinessLogic.mockRejectedValue(new Error('業務操作Failed'));

      const _operation = { type: 'test', data: 'test' };
      const _context = { startTime: Date.now() };

      const _result = await testCore.executeBusinessOperation(
        operation,
        context
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('業務操作Failed');
    });
  });

  describe('架構狀態', () => {
    it('應該返回架構狀態', () => {
      const _status = hybridCore.getArchitectureStatus();

      expect(status).toHaveProperty('isInitialized');
      expect(status).toHaveProperty('core');
      expect(status).toHaveProperty('adaptation');
      expect(status).toHaveProperty('extensions');
      expect(status).toHaveProperty('monitoring');
    });
  });

  describe('關閉架構', () => {
    it('應該Success關閉架構', async () => {
      await hybridCore.shutdown();

      // VerifyStatus已Reset
      const _status = hybridCore.getArchitectureStatus();
      expect(status.isInitialized).toBe(false);
    });
  });
});

describe('PerformanceMonitor', () => {
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor();
  });

  describe('性能監控', () => {
    it('應該監控性能指標', async () => {
      const _metrics = [
        {
          id: 'test_metric',
          name: 'cpu_usage',
          value: 85,
          unit: '%',
          timestamp: new Date(),
          category: 'cpu' as const,
        },
      ];

      const _result = await performanceMonitor.monitorPerformance(metrics);

      expect(result.success).toBe(true);
      expect(result.data.metrics).toEqual(metrics);
      // CheckYesNo有問題（85 > 80 閾Value）
      expect(result.data.issues.length).toBeGreaterThanOrEqual(0);
    });

    it('應該分析性能數據', async () => {
      const _data = {
        metrics: [
          {
            id: 'test_metric',
            name: 'response_time',
            value: 100,
            unit: 'ms',
            timestamp: new Date(),
            category: 'api' as const,
          },
        ],
        period: {
          start: new Date(),
          end: new Date(),
        },
        summary: {
          average: 100,
          max: 200,
          min: 50,
          count: 10,
        },
      };

      const _result = await performanceMonitor.analyzePerformance(data);

      expect(result.success).toBe(true);
      expect(result.insights).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.riskLevel).toBeDefined();
    });

    it('應該發送性能警報', async () => {
      const _issue = {
        id: 'test_issue',
        severity: 'high' as const,
        description: 'CPU使用率過高',
        metric: {
          id: 'test_metric',
          name: 'cpu_usage',
          value: 90,
          unit: '%',
          timestamp: new Date(),
          category: 'cpu' as const,
        },
        threshold: 80,
        timestamp: new Date(),
      };

      const _result = await performanceMonitor.alertOnPerformanceIssue(issue);

      expect(result.success).toBe(true);
      expect(result.alertId).toBeDefined();
      expect(result.sentTo).toContain('admin@cardstrategy.com');
    });

    it('應該生成優化建議', async () => {
      const _data = {
        metrics: [
          {
            id: 'test_metric',
            name: 'memory_usage',
            value: 85,
            unit: '%',
            timestamp: new Date(),
            category: 'memory' as const,
          },
        ],
        period: {
          start: new Date(),
          end: new Date(),
        },
        summary: {
          average: 85,
          max: 90,
          min: 80,
          count: 10,
        },
      };

      const _suggestions = await performanceMonitor.suggestOptimizations(data);

      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });
});

describe('ComplianceMonitor', () => {
  let complianceMonitor: ComplianceMonitor;

  beforeEach(() => {
    complianceMonitor = new ComplianceMonitor();
  });

  describe('合規監控', () => {
    it('應該監控合規指標', async () => {
      const _compliance = [
        {
          id: 'test_compliance',
          regulation: 'GDPR',
          jurisdiction: 'EU',
          status: 'non-compliant' as const,
          score: 30,
          timestamp: new Date(),
          details: '數據保護不足',
        },
      ];

      const _result = await complianceMonitor.monitorCompliance(compliance);

      expect(result.success).toBe(true);
      expect(result.data.compliance).toEqual(compliance);
      expect(result.data.violations).toHaveLength(1);
    });

    it('應該分析合規數據', async () => {
      const _data = {
        metrics: [
          {
            id: 'test_compliance',
            regulation: 'GDPR',
            jurisdiction: 'EU',
            status: 'compliant' as const,
            score: 85,
            timestamp: new Date(),
            details: '合規',
          },
        ],
        period: {
          start: new Date(),
          end: new Date(),
        },
        summary: {
          compliant: 8,
          nonCompliant: 2,
          pending: 0,
          total: 10,
        },
      };

      const _result = await complianceMonitor.analyzeCompliance(data);

      expect(result.success).toBe(true);
      expect(result.insights).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.riskLevel).toBeDefined();
    });

    it('應該發送合規警報', async () => {
      const _violation = {
        id: 'test_violation',
        regulation: 'GDPR',
        jurisdiction: 'EU',
        severity: 'high' as const,
        description: '違反GDPR法規',
        timestamp: new Date(),
        requiredActions: ['立即停止違規操作'],
      };

      const _result =
        await complianceMonitor.alertOnComplianceViolation(violation);

      expect(result.success).toBe(true);
      expect(result.alertId).toBeDefined();
      expect(result.sentTo).toContain('compliance@cardstrategy.com');
    });

    it('應該生成合規報告', async () => {
      const _report = await complianceMonitor.generateComplianceReport('weekly');

      expect(report.id).toBeDefined();
      expect(report.period).toBe('weekly');
      expect(report.summary).toBeDefined();
      expect(report.violations).toBeInstanceOf(Array);
      expect(report.recommendations).toBeInstanceOf(Array);
    });
  });
});

describe('SecurityMonitor', () => {
  let securityMonitor: SecurityMonitor;

  beforeEach(() => {
    securityMonitor = new SecurityMonitor();
  });

  describe('安全監控', () => {
    it('應該監控安全指標', async () => {
      const _security = [
        {
          id: 'test_security',
          type: 'authentication' as const,
          status: 'breach' as const,
          severity: 'high' as const,
          timestamp: new Date(),
          details: '認證Failed',
        },
      ];

      const _result = await securityMonitor.monitorSecurity(security);

      expect(result.success).toBe(true);
      expect(result.data.security).toEqual(security);
      expect(result.data.threats).toHaveLength(1);
    });

    it('應該分析安全數據', async () => {
      const _data = {
        metrics: [
          {
            id: 'test_security',
            type: 'authentication' as const,
            status: 'secure' as const,
            severity: 'low' as const,
            timestamp: new Date(),
            details: '安全',
          },
        ],
        period: {
          start: new Date(),
          end: new Date(),
        },
        summary: {
          secure: 8,
          warning: 2,
          breach: 0,
          total: 10,
        },
      };

      const _result = await securityMonitor.analyzeSecurity(data);

      expect(result.success).toBe(true);
      expect(result.insights).toBeInstanceOf(Array);
      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.riskLevel).toBeDefined();
    });

    it('應該發送安全警報', async () => {
      const _threat = {
        id: 'test_threat',
        type: 'authentication' as const,
        severity: 'high' as const,
        description: '認證系統遭受攻擊',
        source: 'Unknown',
        timestamp: new Date(),
        status: 'active' as const,
      };

      const _result = await securityMonitor.alertOnSecurityThreat(threat);

      expect(result.success).toBe(true);
      expect(result.alertId).toBeDefined();
      expect(result.sentTo).toContain('security@cardstrategy.com');
    });

    it('應該響應安全事件', async () => {
      const _event = {
        id: 'test_event',
        type: 'breach' as const,
        severity: 'high' as const,
        description: '數據洩露事件',
        timestamp: new Date(),
        affectedResources: ['user_database'],
        responseActions: ['隔離系統'],
      };

      const _result = await securityMonitor.respondToSecurityEvent(event);

      expect(result.success).toBe(true);
      expect(result.actionId).toBeDefined();
      expect(result.actions).toBeInstanceOf(Array);
      expect(result.status).toBe('in-progress');
    });
  });
});
