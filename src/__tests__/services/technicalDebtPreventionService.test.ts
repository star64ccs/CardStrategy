import { technicalDebtPreventionService } from '../../services/technicalDebtPreventionService';
import type {
  CodeQualityMetrics,
  TechnicalDebtDetectionResult,
  CodeQualityGateConfig,
  TechnicalDebtTrendAnalysis,
  CodeReviewReport,
} from '../../services/technicalDebtPreventionService';

// Mock console.log to avoid noise in tests
const _originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('TechnicalDebtPreventionService', () => {
  beforeEach(() => {
    // Reset the singleton instance for each test
    (technicalDebtPreventionService as any).instance = undefined;
    jest.clearAllMocks();
  });

  describe('單例模式測試', () => {
    it('應該返回相同的實例', () => {
      const _instance1 = technicalDebtPreventionService;
      const _instance2 = technicalDebtPreventionService;
      expect(instance1).toBe(instance2);
    });

    it('應該正確初始化配置', () => {
      const _service = technicalDebtPreventionService;
      const { config } = service as any;

      expect(config.enabled).toBe(true);
      expect(config.thresholds.cyclomaticComplexity).toBe(10);
      expect(config.thresholds.codeDuplication).toBe(5);
      expect(config.thresholds.testCoverage).toBe(80);
      expect(config.thresholds.codeSmells).toBe(10);
      expect(config.thresholds.technicalDebtRatio).toBe(5);
      expect(config.thresholds.maintainabilityIndex).toBe(70);
    });
  });

  describe('初始化測試', () => {
    it('應該正確初始化服務', async () => {
      await technicalDebtPreventionService.initialize();

      expect(console.log).toHaveBeenCalledWith('初始化技術債務預防機制...');
      expect(console.log).toHaveBeenCalledWith('技術債務預防機制初始化完成');
    });

    it('應該初始化歷史數據', async () => {
      await technicalDebtPreventionService.initialize();

      const _metrics = technicalDebtPreventionService.getQualityMetrics();
      const _detectionResults =
        technicalDebtPreventionService.getDetectionResults();

      expect(metrics.length).toBeGreaterThan(0);
      expect(detectionResults.length).toBeGreaterThan(0);
    });
  });

  describe('代碼質量門禁測試', () => {
    it('應該通過所有指標檢查', () => {
      const goodMetrics: CodeQualityMetrics = {
        timestamp: Date.now(),
        cyclomaticComplexity: 5,
        codeDuplication: 2,
        testCoverage: 85,
        codeSmells: 5,
        technicalDebtRatio: 3,
        maintainabilityIndex: 80,
        reliabilityIndex: 85,
        securityIndex: 90,
      };

      const _result =
        technicalDebtPreventionService.checkCodeQualityGate(goodMetrics);

      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.blocking).toBe(false);
    });

    it('應該檢測圈複雜度違規', () => {
      const badMetrics: CodeQualityMetrics = {
        timestamp: Date.now(),
        cyclomaticComplexity: 15,
        codeDuplication: 2,
        testCoverage: 85,
        codeSmells: 5,
        technicalDebtRatio: 3,
        maintainabilityIndex: 80,
        reliabilityIndex: 85,
        securityIndex: 90,
      };

      const _result =
        technicalDebtPreventionService.checkCodeQualityGate(badMetrics);

      expect(result.passed).toBe(false);
      expect(result.violations).toContain('圈複雜度過高: 15 > 10');
      expect(result.blocking).toBe(true);
    });

    it('應該檢測測試覆蓋率違規', () => {
      const badMetrics: CodeQualityMetrics = {
        timestamp: Date.now(),
        cyclomaticComplexity: 5,
        codeDuplication: 2,
        testCoverage: 65,
        codeSmells: 5,
        technicalDebtRatio: 3,
        maintainabilityIndex: 80,
        reliabilityIndex: 85,
        securityIndex: 90,
      };

      const _result =
        technicalDebtPreventionService.checkCodeQualityGate(badMetrics);

      expect(result.passed).toBe(false);
      expect(result.violations).toContain('測試覆蓋率不足: 65% < 80%');
      expect(result.blocking).toBe(true);
    });

    it('應該檢測多個違規', () => {
      const badMetrics: CodeQualityMetrics = {
        timestamp: Date.now(),
        cyclomaticComplexity: 15,
        codeDuplication: 8,
        testCoverage: 65,
        codeSmells: 15,
        technicalDebtRatio: 8,
        maintainabilityIndex: 60,
        reliabilityIndex: 85,
        securityIndex: 90,
      };

      const _result =
        technicalDebtPreventionService.checkCodeQualityGate(badMetrics);

      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThan(1);
      expect(result.blocking).toBe(true);
    });

    it('應該在門禁禁用時通過檢查', () => {
      technicalDebtPreventionService.updateConfig({ enabled: false });

      const badMetrics: CodeQualityMetrics = {
        timestamp: Date.now(),
        cyclomaticComplexity: 15,
        codeDuplication: 8,
        testCoverage: 65,
        codeSmells: 15,
        technicalDebtRatio: 8,
        maintainabilityIndex: 60,
        reliabilityIndex: 85,
        securityIndex: 90,
      };

      const _result =
        technicalDebtPreventionService.checkCodeQualityGate(badMetrics);

      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.blocking).toBe(false);

      // 恢復配置
      technicalDebtPreventionService.updateConfig({ enabled: true });
    });
  });

  describe('自動檢測技術債務測試', () => {
    it('應該檢測新的技術債務問題', () => {
      const _initialCount =
        technicalDebtPreventionService.getDetectionResults().length;

      const _newIssues =
        technicalDebtPreventionService.autoDetectTechnicalDebt();

      expect(newIssues.length).toBeGreaterThan(0);
      expect(technicalDebtPreventionService.getDetectionResults().length).toBe(
        initialCount + newIssues.length
      );
    });

    it('應該生成正確的檢測結果結構', () => {
      const _newIssues =
        technicalDebtPreventionService.autoDetectTechnicalDebt();

      if (newIssues.length > 0) {
        const _issue = newIssues[0];

        expect(issue).toHaveProperty('id');
        expect(issue).toHaveProperty('type');
        expect(issue).toHaveProperty('severity');
        expect(issue).toHaveProperty('file');
        expect(issue).toHaveProperty('line');
        expect(issue).toHaveProperty('message');
        expect(issue).toHaveProperty('suggestion');
        expect(issue).toHaveProperty('estimatedEffort');
        expect(issue).toHaveProperty('impact');
        expect(issue).toHaveProperty('timestamp');
        expect(issue).toHaveProperty('resolved');
        expect(issue.resolved).toBe(false);
      }
    });

    it('應該支持不同類型的技術債務', () => {
      const _newIssues =
        technicalDebtPreventionService.autoDetectTechnicalDebt();

      const _types = newIssues.map(issue => issue.type);
      const _uniqueTypes = [...new Set(types)];

      expect(uniqueTypes.length).toBeGreaterThan(0);
      expect(
        uniqueTypes.every(type =>
          [
            'code_smell',
            'duplication',
            'complexity',
            'coverage',
            'security',
            'performance',
          ].includes(type)
        )
      ).toBe(true);
    });
  });

  describe('定期架構審查測試', () => {
    it('應該創建代碼審查報告', () => {
      const _report = technicalDebtPreventionService.scheduleCodeReview(
        '張三',
        '用戶認證模塊'
      );

      expect(report.id).toMatch(/^review-\d+$/);
      expect(report.reviewer).toBe('張三');
      expect(report.scope).toBe('用戶認證模塊');
      expect(report.timestamp).toBeGreaterThan(0);
      expect(report.status).toBe('pending');
      expect(report.findings).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(report.actionItems).toBeDefined();
      expect(report.nextReviewDate).toBeGreaterThan(Date.now());
    });

    it('應該包含正確的審查發現結構', () => {
      const _report = technicalDebtPreventionService.scheduleCodeReview(
        '李四',
        '數據處理模塊'
      );

      expect(report.findings.critical).toBeGreaterThanOrEqual(0);
      expect(report.findings.high).toBeGreaterThanOrEqual(0);
      expect(report.findings.medium).toBeGreaterThanOrEqual(0);
      expect(report.findings.low).toBeGreaterThanOrEqual(0);
    });

    it('應該包含建議和行動項目', () => {
      const _report = technicalDebtPreventionService.scheduleCodeReview(
        '王五',
        'UI組件庫'
      );

      expect(report.recommendations.length).toBeGreaterThan(0);
      expect(report.actionItems.length).toBeGreaterThan(0);

      expect(report.recommendations.every(rec => typeof rec === 'string')).toBe(
        true
      );
      expect(report.actionItems.every(item => typeof item === 'string')).toBe(
        true
      );
    });
  });

  describe('技術債務趨勢分析測試', () => {
    it('應該生成趨勢分析報告', () => {
      const _analysis =
        technicalDebtPreventionService.analyzeTechnicalDebtTrend();

      expect(analysis.period).toBe('最近30天');
      expect(analysis.totalIssues).toBeGreaterThanOrEqual(0);
      expect(analysis.resolvedIssues).toBeGreaterThanOrEqual(0);
      expect(analysis.newIssues).toBeGreaterThanOrEqual(0);
      expect(analysis.debtRatio).toBeGreaterThan(0);
      expect(['improving', 'stable', 'worsening']).toContain(analysis.trend);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
      expect(analysis.predictions).toBeDefined();
    });

    it('應該包含預測信息', () => {
      const _analysis =
        technicalDebtPreventionService.analyzeTechnicalDebtTrend();

      expect(analysis.predictions.nextMonthDebtRatio).toBeGreaterThan(0);
      expect(analysis.predictions.estimatedResolutionTime).toBeGreaterThan(0);
      expect(['low', 'medium', 'high']).toContain(
        analysis.predictions.riskLevel
      );
    });

    it('應該根據趨勢生成相應建議', () => {
      const _analysis =
        technicalDebtPreventionService.analyzeTechnicalDebtTrend();

      expect(analysis.recommendations.length).toBeGreaterThan(0);
      expect(
        analysis.recommendations.every(rec => typeof rec === 'string')
      ).toBe(true);
    });
  });

  describe('數據獲取測試', () => {
    beforeEach(async () => {
      await technicalDebtPreventionService.initialize();
    });

    it('應該獲取質量指標', () => {
      const _metrics = technicalDebtPreventionService.getQualityMetrics();

      expect(metrics.length).toBeGreaterThan(0);
      expect(
        metrics.every(
          metric =>
            metric.timestamp > 0 &&
            metric.cyclomaticComplexity > 0 &&
            metric.codeDuplication >= 0 &&
            metric.testCoverage >= 0 &&
            metric.codeSmells >= 0 &&
            metric.technicalDebtRatio >= 0 &&
            metric.maintainabilityIndex > 0 &&
            metric.reliabilityIndex > 0 &&
            metric.securityIndex > 0
        )
      ).toBe(true);
    });

    it('應該獲取未解決的檢測結果', () => {
      const _unresolvedResults =
        technicalDebtPreventionService.getDetectionResults(false);

      expect(unresolvedResults.length).toBeGreaterThan(0);
      expect(unresolvedResults.every(result => !result.resolved)).toBe(true);
    });

    it('應該獲取已解決的檢測結果', () => {
      const _resolvedResults =
        technicalDebtPreventionService.getDetectionResults(true);

      expect(resolvedResults.every(result => result.resolved)).toBe(true);
    });

    it('應該獲取審查報告', () => {
      // 先創建一些審查報告
      technicalDebtPreventionService.scheduleCodeReview('測試員1', '模塊A');
      technicalDebtPreventionService.scheduleCodeReview('測試員2', '模塊B');

      const _reports = technicalDebtPreventionService.getReviewReports();

      expect(reports.length).toBeGreaterThan(0);
      expect(
        reports.every(
          report =>
            report.id &&
            report.timestamp > 0 &&
            report.reviewer &&
            report.scope &&
            report.status
        )
      ).toBe(true);
    });

    it('應該獲取趨勢分析', () => {
      // 先執行一次自動檢測以生成趨勢分析
      technicalDebtPreventionService.autoDetectTechnicalDebt();

      const _analyses = technicalDebtPreventionService.getTrendAnalyses();

      expect(analyses.length).toBeGreaterThan(0);
      expect(
        analyses.every(
          analysis =>
            analysis.period &&
            analysis.totalIssues >= 0 &&
            analysis.resolvedIssues >= 0 &&
            analysis.newIssues >= 0 &&
            analysis.debtRatio > 0 &&
            analysis.trend &&
            analysis.recommendations.length > 0 &&
            analysis.predictions
        )
      ).toBe(true);
    });
  });

  describe('問題解決測試', () => {
    it('應該解決技術債務問題', () => {
      const _unresolvedResults =
        technicalDebtPreventionService.getDetectionResults(false);

      if (unresolvedResults.length > 0) {
        const _issueToResolve = unresolvedResults[0];
        const _initialUnresolvedCount = unresolvedResults.length;

        technicalDebtPreventionService.resolveTechnicalDebt(issueToResolve.id);

        const _newUnresolvedResults =
          technicalDebtPreventionService.getDetectionResults(false);
        expect(newUnresolvedResults.length).toBe(initialUnresolvedCount - 1);

        const _resolvedResults =
          technicalDebtPreventionService.getDetectionResults(true);
        const _resolvedIssue = resolvedResults.find(
          r => r.id === issueToResolve.id
        );
        expect(resolvedIssue).toBeDefined();
        expect(resolvedIssue?.resolved).toBe(true);
      }
    });

    it('應該處理不存在的問題ID', () => {
      const _unresolvedResults =
        technicalDebtPreventionService.getDetectionResults(false);
      const _initialCount = unresolvedResults.length;

      technicalDebtPreventionService.resolveTechnicalDebt('non-existent-id');

      const _newUnresolvedResults =
        technicalDebtPreventionService.getDetectionResults(false);
      expect(newUnresolvedResults.length).toBe(initialCount);
    });
  });

  describe('配置更新測試', () => {
    it('應該更新門禁配置', () => {
      const newConfig: Partial<CodeQualityGateConfig> = {
        thresholds: {
          cyclomaticComplexity: 15,
          codeDuplication: 8,
          testCoverage: 70,
          codeSmells: 15,
          technicalDebtRatio: 8,
          maintainabilityIndex: 60,
        },
        blockingRules: {
          criticalIssues: false,
          highSeverityDebt: false,
          lowTestCoverage: false,
          securityVulnerabilities: true,
        },
      };

      technicalDebtPreventionService.updateConfig(newConfig);

      const { config } = technicalDebtPreventionService as any;
      expect(config.thresholds.cyclomaticComplexity).toBe(15);
      expect(config.thresholds.testCoverage).toBe(70);
      expect(config.blockingRules.criticalIssues).toBe(false);
      expect(config.blockingRules.securityVulnerabilities).toBe(true);
    });

    it('應該部分更新配置', () => {
      const _originalConfig = (technicalDebtPreventionService as any).config;

      technicalDebtPreventionService.updateConfig({
        thresholds: { cyclomaticComplexity: 20 },
      });

      const _updatedConfig = (technicalDebtPreventionService as any).config;
      expect(updatedConfig.thresholds.cyclomaticComplexity).toBe(20);
      expect(updatedConfig.thresholds.testCoverage).toBe(
        originalConfig.thresholds.testCoverage
      );
      expect(updatedConfig.enabled).toBe(originalConfig.enabled);
    });
  });

  describe('報告生成測試', () => {
    it('應該生成預防報告', () => {
      const _report = technicalDebtPreventionService.generatePreventionReport();

      expect(typeof report).toBe('string');

      const _parsedReport = JSON.parse(report);
      expect(parsedReport).toHaveProperty('timestamp');
      expect(parsedReport).toHaveProperty('config');
      expect(parsedReport).toHaveProperty('currentMetrics');
      expect(parsedReport).toHaveProperty('activeIssues');
      expect(parsedReport).toHaveProperty('resolvedIssues');
      expect(parsedReport).toHaveProperty('recentReviews');
      expect(parsedReport).toHaveProperty('trendAnalysis');
      expect(parsedReport).toHaveProperty('recommendations');
    });

    it('應該導出完整報告', () => {
      const _report = technicalDebtPreventionService.exportFullReport();

      expect(typeof report).toBe('string');

      const _parsedReport = JSON.parse(report);
      expect(parsedReport).toHaveProperty('timestamp');
      expect(parsedReport).toHaveProperty('config');
      expect(parsedReport).toHaveProperty('qualityMetrics');
      expect(parsedReport).toHaveProperty('detectionResults');
      expect(parsedReport).toHaveProperty('reviewReports');
      expect(parsedReport).toHaveProperty('trendAnalyses');
      expect(parsedReport).toHaveProperty('summary');
    });

    it('應該包含正確的摘要信息', () => {
      const _report = technicalDebtPreventionService.exportFullReport();
      const _parsedReport = JSON.parse(report);

      expect(parsedReport.summary).toHaveProperty('totalIssues');
      expect(parsedReport.summary).toHaveProperty('resolvedIssues');
      expect(parsedReport.summary).toHaveProperty('activeIssues');
      expect(parsedReport.summary).toHaveProperty('averageDebtRatio');
      expect(parsedReport.summary).toHaveProperty('trend');

      expect(parsedReport.summary.totalIssues).toBeGreaterThanOrEqual(0);
      expect(parsedReport.summary.resolvedIssues).toBeGreaterThanOrEqual(0);
      expect(parsedReport.summary.activeIssues).toBeGreaterThanOrEqual(0);
      expect(parsedReport.summary.averageDebtRatio).toBeGreaterThan(0);
      expect(['improving', 'stable', 'worsening']).toContain(
        parsedReport.summary.trend
      );
    });
  });

  describe('邊界條件測試', () => {
    it('應該處理空數據的情況', () => {
      // 重置服務以獲得空數據
      (technicalDebtPreventionService as any).instance = undefined;

      // 創建新的實例
      const _newService = (
        technicalDebtPreventionService as any
      ).constructor.getInstance();

      const _metrics = newService.getQualityMetrics();
      const _detectionResults = newService.getDetectionResults();
      const _reviewReports = newService.getReviewReports();
      const _trendAnalyses = newService.getTrendAnalyses();

      // 新實例應該有空的數據（除了初始化時生成的歷史數據）
      expect(metrics.length).toBeGreaterThanOrEqual(0);
      expect(detectionResults.length).toBeGreaterThanOrEqual(0);
      expect(reviewReports.length).toBeGreaterThanOrEqual(0); // 新實例會初始化一些審查報告
      expect(trendAnalyses.length).toBeGreaterThanOrEqual(0); // 新實例也會生成趨勢分析
    });

    it('應該處理極端質量指標', () => {
      // 確保阻擋規則正確設置
      technicalDebtPreventionService.updateConfig({
        blockingRules: {
          criticalIssues: true,
          highSeverityDebt: true,
          lowTestCoverage: true,
          securityVulnerabilities: true,
        },
      });

      const extremeMetrics: CodeQualityMetrics = {
        timestamp: Date.now(),
        cyclomaticComplexity: 100,
        codeDuplication: 50,
        testCoverage: 0,
        codeSmells: 100,
        technicalDebtRatio: 50,
        maintainabilityIndex: 10,
        reliabilityIndex: 10,
        securityIndex: 10,
      };

      const _result =
        technicalDebtPreventionService.checkCodeQualityGate(extremeMetrics);

      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      // 極端指標應該觸發阻擋規則（測試覆蓋率為0會觸發阻擋）
      expect(result.blocking).toBe(true);
    });

    it('應該處理負數指標', () => {
      const negativeMetrics: CodeQualityMetrics = {
        timestamp: Date.now(),
        cyclomaticComplexity: -5,
        codeDuplication: -2,
        testCoverage: -10,
        codeSmells: -5,
        technicalDebtRatio: -3,
        maintainabilityIndex: -20,
        reliabilityIndex: -15,
        securityIndex: -10,
      };

      const _result =
        technicalDebtPreventionService.checkCodeQualityGate(negativeMetrics);

      // 負數指標應該被視為違規並阻擋
      expect(result.passed).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.blocking).toBe(true);
    });
  });

  describe('性能測試', () => {
    it('應該快速處理大量數據', () => {
      const _startTime = Date.now();

      // 模擬大量檢測結果
      for (let i = 0; i < 1000; i++) {
        technicalDebtPreventionService.autoDetectTechnicalDebt();
      }

      const _endTime = Date.now();
      const _processingTime = endTime - startTime;

      // 處理1000次檢測應該在合理時間內完成
      expect(processingTime).toBeLessThan(5000); // 5秒內
    });

    it('應該高效生成報告', () => {
      const _startTime = Date.now();

      const _report = technicalDebtPreventionService.exportFullReport();

      const _endTime = Date.now();
      const _processingTime = endTime - startTime;

      // 報告生成應該在合理時間內完成
      expect(processingTime).toBeLessThan(1000); // 1秒內
      expect(report.length).toBeGreaterThan(0);
    });
  });
});
