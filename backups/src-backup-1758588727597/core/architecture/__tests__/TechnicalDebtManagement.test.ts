import { HybridArchitectureCore } from '../HybridArchitectureCore';
import type {
  TechnicalDebtItem,
  TechnicalDebtResolution,
} from '../TechnicalDebtManagement';
import {
  TechnicalDebtManagement,
  TechnicalDebtIdentifier,
  TechnicalDebtEvaluator,
  TechnicalDebtTracker,
  TechnicalDebtCategory,
  TechnicalDebtSeverity,
  TechnicalDebtPriority,
  TechnicalDebtImpact,
  TechnicalDebtStatus,
} from '../TechnicalDebtManagement';

jest.mock('../HybridArchitectureCore');

describe('TechnicalDebtManagement', () => {
  let management: TechnicalDebtManagement;
  let mockHybridCore: jest.Mocked<HybridArchitectureCore>;

  beforeEach(() => {
    (TechnicalDebtManagement as any).instance = undefined;
    management = TechnicalDebtManagement.getInstance();
    mockHybridCore = {
      getInstance: jest.fn().mockReturnValue({}),
    } as any;
    (HybridArchitectureCore.getInstance as jest.Mock).mockReturnValue(
      mockHybridCore
    );
  });

  describe('單例模式', () => {
    it('應該返回相同的實例', () => {
      const instance1 = TechnicalDebtManagement.getInstance();
      const instance2 = TechnicalDebtManagement.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化', () => {
    it('應該成功初始化', async () => {
      const result = await management.initialize();
      expect(result).toBe(true);
      expect(management.getInitializationStatus()).toBe(true);
    });

    it('應該處理初始化失敗', async () => {
      // 創建一個新的實例來測試初始化失敗
      (TechnicalDebtManagement as any).instance = undefined;
      const newManagement = TechnicalDebtManagement.getInstance();

      // Mock identifier 的方法
      const mockIdentifier = newManagement as any;
      mockIdentifier.identifier = {
        identifyCodeQualityIssues: jest
          .fn()
          .mockRejectedValue(new Error('掃描失敗')),
        identifyArchitectureIssues: jest.fn().mockResolvedValue([]),
        identifyPerformanceIssues: jest.fn().mockResolvedValue([]),
        identifySecurityIssues: jest.fn().mockResolvedValue([]),
      };

      const result = await newManagement.initialize();
      expect(result).toBe(false);
      expect(newManagement.getInitializationStatus()).toBe(false);
    });
  });

  describe('掃描新問題', () => {
    it('應該掃描新問題', async () => {
      await management.initialize();
      const newIssues = await management.scanForNewIssues();
      expect(newIssues.length).toBeGreaterThan(0);
    });

    it('應該在未初始化時拋出錯誤', async () => {
      await expect(management.scanForNewIssues()).rejects.toThrow(
        '技術債務管理尚未初始化'
      );
    });
  });

  describe('報告生成', () => {
    it('應該生成技術債務報告', async () => {
      await management.initialize();
      const report = management.getTechnicalDebtReport();
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.items).toBeDefined();
      expect(report.trends).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });
  });

  describe('項目查詢', () => {
    beforeEach(async () => {
      await management.initialize();
    });

    it('應該按狀態查詢項目', () => {
      const items = management.getItemsByStatus(TechnicalDebtStatus.IDENTIFIED);
      expect(Array.isArray(items)).toBe(true);
    });

    it('應該按嚴重性查詢項目', () => {
      const items = management.getItemsBySeverity(TechnicalDebtSeverity.HIGH);
      expect(Array.isArray(items)).toBe(true);
    });

    it('應該按類別查詢項目', () => {
      const items = management.getItemsByCategory(
        TechnicalDebtCategory.CODE_QUALITY
      );
      expect(Array.isArray(items)).toBe(true);
    });

    it('應該查詢逾期項目', () => {
      const items = management.getOverdueItems();
      expect(Array.isArray(items)).toBe(true);
    });
  });

  describe('項目管理', () => {
    beforeEach(async () => {
      await management.initialize();
    });

    it('應該更新項目狀態', () => {
      const report = management.getTechnicalDebtReport();
      if (report.items.length > 0) {
        const itemId = report.items[0].id;
        const result = management.updateItemStatus(
          itemId,
          TechnicalDebtStatus.IN_PROGRESS
        );
        expect(result).toBe(true);
      }
    });

    it('應該分配項目', () => {
      const report = management.getTechnicalDebtReport();
      if (report.items.length > 0) {
        const itemId = report.items[0].id;
        const result = management.assignItem(itemId, 'developer1');
        expect(result).toBe(true);
      }
    });

    it('應該添加解決方案', () => {
      const report = management.getTechnicalDebtReport();
      if (report.items.length > 0) {
        const itemId = report.items[0].id;
        const resolution: TechnicalDebtResolution = {
          approach: '重構代碼',
          steps: ['分析問題', '設計解決方案', '實施修復'],
          resources: ['開發者', '測試工具'],
          timeline: 5,
          cost: 1000,
          risks: ['可能引入新bug'],
          benefits: ['提高代碼質量'],
        };
        const result = management.addResolution(itemId, resolution);
        expect(result).toBe(true);
      }
    });
  });

  describe('建議和指標', () => {
    beforeEach(async () => {
      await management.initialize();
    });

    it('應該獲取建議', () => {
      const recommendations = management.getRecommendations();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('應該計算技術債務比率', () => {
      const ratio = management.calculateTechnicalDebtRatio();
      expect(typeof ratio).toBe('number');
      expect(ratio).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('TechnicalDebtIdentifier', () => {
  let identifier: TechnicalDebtIdentifier;
  let mockHybridCore: jest.Mocked<HybridArchitectureCore>;

  beforeEach(() => {
    mockHybridCore = {
      getInstance: jest.fn().mockReturnValue({}),
    } as any;
    (HybridArchitectureCore.getInstance as jest.Mock).mockReturnValue(
      mockHybridCore
    );
    identifier = new TechnicalDebtIdentifier();
  });

  describe('問題識別', () => {
    it('應該識別代碼質量問題', async () => {
      const issues = await identifier.identifyCodeQualityIssues();
      expect(Array.isArray(issues)).toBe(true);
      expect(issues.length).toBeGreaterThan(0);
      issues.forEach(issue => {
        expect(issue.category).toBe(TechnicalDebtCategory.CODE_QUALITY);
      });
    });

    it('應該識別架構問題', async () => {
      const issues = await identifier.identifyArchitectureIssues();
      expect(Array.isArray(issues)).toBe(true);
      expect(issues.length).toBeGreaterThan(0);
      issues.forEach(issue => {
        expect(issue.category).toBe(TechnicalDebtCategory.ARCHITECTURE);
      });
    });

    it('應該識別性能問題', async () => {
      const issues = await identifier.identifyPerformanceIssues();
      expect(Array.isArray(issues)).toBe(true);
      expect(issues.length).toBeGreaterThan(0);
      issues.forEach(issue => {
        expect(issue.category).toBe(TechnicalDebtCategory.PERFORMANCE);
      });
    });

    it('應該識別安全問題', async () => {
      const issues = await identifier.identifySecurityIssues();
      expect(Array.isArray(issues)).toBe(true);
      expect(issues.length).toBeGreaterThan(0);
      issues.forEach(issue => {
        expect(issue.category).toBe(TechnicalDebtCategory.SECURITY);
      });
    });
  });
});

describe('TechnicalDebtEvaluator', () => {
  let evaluator: TechnicalDebtEvaluator;

  beforeEach(() => {
    evaluator = new TechnicalDebtEvaluator();
  });

  describe('嚴重性評估', () => {
    it('應該評估嚴重性', () => {
      const item: TechnicalDebtItem = {
        id: 'test1',
        title: '測試問題',
        description: '測試描述',
        category: TechnicalDebtCategory.CODE_QUALITY,
        severity: TechnicalDebtSeverity.MEDIUM,
        priority: TechnicalDebtPriority.MEDIUM,
        estimatedEffort: 8,
        impact: TechnicalDebtImpact.MODERATE,
        location: 'src/test/',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: TechnicalDebtStatus.IDENTIFIED,
        tags: ['test'],
        dependencies: [],
        metrics: {
          codeComplexity: 15,
          testCoverage: 75,
          performanceScore: 80,
          securityScore: 85,
          maintainabilityIndex: 65,
          technicalDebtRatio: 12,
        },
      };

      const severity = evaluator.evaluateSeverity(item);
      expect([
        TechnicalDebtSeverity.LOW,
        TechnicalDebtSeverity.MEDIUM,
        TechnicalDebtSeverity.HIGH,
        TechnicalDebtSeverity.CRITICAL,
      ]).toContain(severity);
    });
  });

  describe('優先級評估', () => {
    it('應該評估優先級', () => {
      const item: TechnicalDebtItem = {
        id: 'test2',
        title: '測試問題',
        description: '測試描述',
        category: TechnicalDebtCategory.SECURITY,
        severity: TechnicalDebtSeverity.HIGH,
        priority: TechnicalDebtPriority.HIGH,
        estimatedEffort: 16,
        impact: TechnicalDebtImpact.SIGNIFICANT,
        location: 'src/security/',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: TechnicalDebtStatus.IDENTIFIED,
        tags: ['security'],
        dependencies: [],
        metrics: {
          codeComplexity: 10,
          testCoverage: 90,
          performanceScore: 85,
          securityScore: 40,
          maintainabilityIndex: 80,
          technicalDebtRatio: 30,
        },
      };

      const priority = evaluator.evaluatePriority(item);
      expect([
        TechnicalDebtPriority.LOW,
        TechnicalDebtPriority.MEDIUM,
        TechnicalDebtPriority.HIGH,
        TechnicalDebtPriority.URGENT,
      ]).toContain(priority);
    });
  });

  describe('技術債務比率計算', () => {
    it('應該計算技術債務比率', () => {
      const items: TechnicalDebtItem[] = [
        {
          id: 'test3',
          title: '測試問題1',
          description: '測試描述1',
          category: TechnicalDebtCategory.CODE_QUALITY,
          severity: TechnicalDebtSeverity.MEDIUM,
          priority: TechnicalDebtPriority.MEDIUM,
          estimatedEffort: 8,
          impact: TechnicalDebtImpact.MODERATE,
          location: 'src/test1/',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: TechnicalDebtStatus.IDENTIFIED,
          tags: ['test1'],
          dependencies: [],
          metrics: {
            codeComplexity: 15,
            testCoverage: 75,
            performanceScore: 80,
            securityScore: 85,
            maintainabilityIndex: 65,
            technicalDebtRatio: 12,
          },
        },
      ];

      const ratio = evaluator.calculateTechnicalDebtRatio(items);
      expect(typeof ratio).toBe('number');
      expect(ratio).toBeGreaterThanOrEqual(0);
    });

    it('應該處理空項目列表', () => {
      const ratio = evaluator.calculateTechnicalDebtRatio([]);
      expect(ratio).toBe(0);
    });
  });

  describe('建議生成', () => {
    it('應該生成建議', () => {
      const items: TechnicalDebtItem[] = [
        {
          id: 'test4',
          title: '嚴重問題',
          description: '嚴重問題描述',
          category: TechnicalDebtCategory.SECURITY,
          severity: TechnicalDebtSeverity.CRITICAL,
          priority: TechnicalDebtPriority.URGENT,
          estimatedEffort: 24,
          impact: TechnicalDebtImpact.SEVERE,
          location: 'src/security/',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: TechnicalDebtStatus.IDENTIFIED,
          tags: ['security', 'critical'],
          dependencies: [],
          metrics: {
            codeComplexity: 10,
            testCoverage: 90,
            performanceScore: 85,
            securityScore: 40,
            maintainabilityIndex: 80,
            technicalDebtRatio: 30,
          },
        },
      ];

      const recommendations = evaluator.generateRecommendations(items);
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
    });
  });
});

describe('TechnicalDebtTracker', () => {
  let tracker: TechnicalDebtTracker;

  beforeEach(() => {
    tracker = new TechnicalDebtTracker();
  });

  describe('項目管理', () => {
    it('應該添加項目', () => {
      const item: TechnicalDebtItem = {
        id: 'test5',
        title: '測試項目',
        description: '測試項目描述',
        category: TechnicalDebtCategory.CODE_QUALITY,
        severity: TechnicalDebtSeverity.MEDIUM,
        priority: TechnicalDebtPriority.MEDIUM,
        estimatedEffort: 8,
        impact: TechnicalDebtImpact.MODERATE,
        location: 'src/test/',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: TechnicalDebtStatus.IDENTIFIED,
        tags: ['test'],
        dependencies: [],
        metrics: {
          codeComplexity: 15,
          testCoverage: 75,
          performanceScore: 80,
          securityScore: 85,
          maintainabilityIndex: 65,
          technicalDebtRatio: 12,
        },
      };

      tracker.addItem(item);
      const retrievedItem = tracker.getItem('test5');
      expect(retrievedItem).toBeDefined();
      expect(retrievedItem?.id).toBe('test5');
    });

    it('應該更新項目', () => {
      const item: TechnicalDebtItem = {
        id: 'test6',
        title: '測試項目',
        description: '測試項目描述',
        category: TechnicalDebtCategory.CODE_QUALITY,
        severity: TechnicalDebtSeverity.MEDIUM,
        priority: TechnicalDebtPriority.MEDIUM,
        estimatedEffort: 8,
        impact: TechnicalDebtImpact.MODERATE,
        location: 'src/test/',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: TechnicalDebtStatus.IDENTIFIED,
        tags: ['test'],
        dependencies: [],
        metrics: {
          codeComplexity: 15,
          testCoverage: 75,
          performanceScore: 80,
          securityScore: 85,
          maintainabilityIndex: 65,
          technicalDebtRatio: 12,
        },
      };

      tracker.addItem(item);
      const result = tracker.updateItem('test6', {
        status: TechnicalDebtStatus.IN_PROGRESS,
      });
      expect(result).toBe(true);

      const updatedItem = tracker.getItem('test6');
      expect(updatedItem?.status).toBe(TechnicalDebtStatus.IN_PROGRESS);
    });

    it('應該刪除項目', () => {
      const item: TechnicalDebtItem = {
        id: 'test7',
        title: '測試項目',
        description: '測試項目描述',
        category: TechnicalDebtCategory.CODE_QUALITY,
        severity: TechnicalDebtSeverity.MEDIUM,
        priority: TechnicalDebtPriority.MEDIUM,
        estimatedEffort: 8,
        impact: TechnicalDebtImpact.MODERATE,
        location: 'src/test/',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: TechnicalDebtStatus.IDENTIFIED,
        tags: ['test'],
        dependencies: [],
        metrics: {
          codeComplexity: 15,
          testCoverage: 75,
          performanceScore: 80,
          securityScore: 85,
          maintainabilityIndex: 65,
          technicalDebtRatio: 12,
        },
      };

      tracker.addItem(item);
      const result = tracker.removeItem('test7');
      expect(result).toBe(true);

      const deletedItem = tracker.getItem('test7');
      expect(deletedItem).toBeUndefined();
    });
  });

  describe('查詢功能', () => {
    beforeEach(() => {
      const items: TechnicalDebtItem[] = [
        {
          id: 'test8',
          title: '代碼質量問題',
          description: '代碼質量問題描述',
          category: TechnicalDebtCategory.CODE_QUALITY,
          severity: TechnicalDebtSeverity.MEDIUM,
          priority: TechnicalDebtPriority.MEDIUM,
          estimatedEffort: 8,
          impact: TechnicalDebtImpact.MODERATE,
          location: 'src/test/',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: TechnicalDebtStatus.IDENTIFIED,
          tags: ['test'],
          dependencies: [],
          metrics: {
            codeComplexity: 15,
            testCoverage: 75,
            performanceScore: 80,
            securityScore: 85,
            maintainabilityIndex: 65,
            technicalDebtRatio: 12,
          },
        },
        {
          id: 'test9',
          title: '安全問題',
          description: '安全問題描述',
          category: TechnicalDebtCategory.SECURITY,
          severity: TechnicalDebtSeverity.HIGH,
          priority: TechnicalDebtPriority.HIGH,
          estimatedEffort: 16,
          impact: TechnicalDebtImpact.SIGNIFICANT,
          location: 'src/security/',
          createdAt: new Date(),
          updatedAt: new Date(),
          status: TechnicalDebtStatus.IN_PROGRESS,
          tags: ['security'],
          dependencies: [],
          metrics: {
            codeComplexity: 10,
            testCoverage: 90,
            performanceScore: 85,
            securityScore: 40,
            maintainabilityIndex: 80,
            technicalDebtRatio: 30,
          },
        },
      ];

      items.forEach(item => tracker.addItem(item));
    });

    it('應該按狀態查詢項目', () => {
      const identifiedItems = tracker.getItemsByStatus(
        TechnicalDebtStatus.IDENTIFIED
      );
      const inProgressItems = tracker.getItemsByStatus(
        TechnicalDebtStatus.IN_PROGRESS
      );

      expect(identifiedItems.length).toBe(1);
      expect(inProgressItems.length).toBe(1);
    });

    it('應該按嚴重性查詢項目', () => {
      const mediumItems = tracker.getItemsBySeverity(
        TechnicalDebtSeverity.MEDIUM
      );
      const highItems = tracker.getItemsBySeverity(TechnicalDebtSeverity.HIGH);

      expect(mediumItems.length).toBe(1);
      expect(highItems.length).toBe(1);
    });

    it('應該按類別查詢項目', () => {
      const codeQualityItems = tracker.getItemsByCategory(
        TechnicalDebtCategory.CODE_QUALITY
      );
      const securityItems = tracker.getItemsByCategory(
        TechnicalDebtCategory.SECURITY
      );

      expect(codeQualityItems.length).toBe(1);
      expect(securityItems.length).toBe(1);
    });
  });

  describe('報告生成', () => {
    it('應該生成報告', () => {
      const item: TechnicalDebtItem = {
        id: 'test10',
        title: '測試項目',
        description: '測試項目描述',
        category: TechnicalDebtCategory.CODE_QUALITY,
        severity: TechnicalDebtSeverity.MEDIUM,
        priority: TechnicalDebtPriority.MEDIUM,
        estimatedEffort: 8,
        impact: TechnicalDebtImpact.MODERATE,
        location: 'src/test/',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: TechnicalDebtStatus.IDENTIFIED,
        tags: ['test'],
        dependencies: [],
        metrics: {
          codeComplexity: 15,
          testCoverage: 75,
          performanceScore: 80,
          securityScore: 85,
          maintainabilityIndex: 65,
          technicalDebtRatio: 12,
        },
      };

      tracker.addItem(item);
      const report = tracker.generateReport();

      expect(report.summary.totalItems).toBe(1);
      expect(report.items.length).toBe(1);
      expect(report.trends).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });
  });
});
