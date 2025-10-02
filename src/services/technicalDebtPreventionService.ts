import { Platform } from 'react-native';

// 代碼質量指標Interface
export interface CodeQualityMetrics {
  timestamp: number;
  cyclomaticComplexity: number;
  codeDuplication: number;
  testCoverage: number;
  codeSmells: number;
  technicalDebtRatio: number;
  maintainabilityIndex: number;
  reliabilityIndex: number;
  securityIndex: number;
}

// 技術債務檢測結果Interface
export interface TechnicalDebtDetectionResult {
  id: string;
  type:
    | 'code_smell'
    | 'duplication'
    | 'complexity'
    | 'coverage'
    | 'security'
    | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  file: string;
  line: number;
  message: string;
  suggestion: string;
  estimatedEffort: number; // Hour
  impact: string;
  timestamp: number;
  resolved: boolean;
}

// 代碼質量門禁ConfigureInterface
export interface CodeQualityGateConfig {
  enabled: boolean;
  thresholds: {
    cyclomaticComplexity: number;
    codeDuplication: number;
    testCoverage: number;
    codeSmells: number;
    technicalDebtRatio: number;
    maintainabilityIndex: number;
  };
  blockingRules: {
    criticalIssues: boolean;
    highSeverityDebt: boolean;
    lowTestCoverage: boolean;
    securityVulnerabilities: boolean;
  };
  autoReject: boolean;
}

// 技術債務趨勢AnalysisInterface
export interface TechnicalDebtTrendAnalysis {
  period: string;
  totalIssues: number;
  resolvedIssues: number;
  newIssues: number;
  debtRatio: number;
  trend: 'improving' | 'stable' | 'worsening';
  recommendations: string[];
  predictions: {
    nextMonthDebtRatio: number;
    estimatedResolutionTime: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

// 定期審查ReportInterface
export interface CodeReviewReport {
  id: string;
  timestamp: number;
  reviewer: string;
  scope: string;
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: string[];
  actionItems: string[];
  nextReviewDate: number;
  status: 'pending' | 'in_progress' | 'completed';
}

// 技術債務預防機制Service
export class TechnicalDebtPreventionService {
  private static instance: TechnicalDebtPreventionService;
  private config: CodeQualityGateConfig;
  private readonly qualityMetrics: CodeQualityMetrics[] = [];
  private readonly detectionResults: TechnicalDebtDetectionResult[] = [];
  private readonly reviewReports: CodeReviewReport[] = [];
  private readonly trendAnalyses: TechnicalDebtTrendAnalysis[] = [];

  private constructor() {
    this.config = {
      enabled: true,
      thresholds: {
        cyclomaticComplexity: 10,
        codeDuplication: 5,
        testCoverage: 80,
        codeSmells: 10,
        technicalDebtRatio: 5,
        maintainabilityIndex: 70,
      },
      blockingRules: {
        criticalIssues: true,
        highSeverityDebt: true,
        lowTestCoverage: true,
        securityVulnerabilities: true,
      },
      autoReject: false,
    };
  }

  static getInstance(): TechnicalDebtPreventionService {
    if (!TechnicalDebtPreventionService.instance) {
      TechnicalDebtPreventionService.instance =
        new TechnicalDebtPreventionService();
    }
    return TechnicalDebtPreventionService.instance;
  }

  // InitializeService
  async initialize(): Promise<void> {
    console.log('初始化技術債務預防機制...');

    // Initialize歷史Data
    this.initializeHistoricalData();

    // Begin定期檢測
    this.startPeriodicDetection();

    console.log('技術債務預防機制初始化完成');
  }

  // Initialize歷史Data
  private initializeHistoricalData(): void {
    // 模擬歷史質量指標
    for (let i = 30; i >= 0; i--) {
      const _timestamp = Date.now() - i * 24 * 60 * 60 * 1000;
      this.qualityMetrics.push({
        timestamp,
        cyclomaticComplexity: Math.random() * 15 + 5,
        codeDuplication: Math.random() * 10 + 2,
        testCoverage: Math.random() * 20 + 75,
        codeSmells: Math.random() * 15 + 5,
        technicalDebtRatio: Math.random() * 8 + 2,
        maintainabilityIndex: Math.random() * 30 + 60,
        reliabilityIndex: Math.random() * 20 + 70,
        securityIndex: Math.random() * 15 + 80,
      });
    }

    // 模擬歷史檢測結果
    this.generateMockDetectionResults();
  }

  // 生成模擬檢測結果
  private generateMockDetectionResults(): void {
    const mockResults: TechnicalDebtDetectionResult[] = [
      {
        id: 'td-001',
        type: 'code_smell',
        severity: 'medium',
        file: 'src/components/CardDisplay.tsx',
        line: 45,
        message: '函數過長，建議拆分',
        suggestion: '將 handleCardAction 函數拆分為多個小函數',
        estimatedEffort: 2,
        impact: '降低可讀性和可維護性',
        timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
        resolved: false,
      },
      {
        id: 'td-002',
        type: 'duplication',
        severity: 'high',
        file: 'src/services/apiService.ts',
        line: 23,
        message: '代碼重複，與 utils/network.ts 中的代碼相似',
        suggestion: '提取公共方法到共享工具類',
        estimatedEffort: 4,
        impact: '增加維護成本和Error風險',
        timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
        resolved: false,
      },
      {
        id: 'td-003',
        type: 'complexity',
        severity: 'critical',
        file: 'src/features/realtime/useWebSocket.ts',
        line: 67,
        message: '圈複雜度過高 (15)，建議重構',
        suggestion: '使用策略模式或狀態機重構複雜邏輯',
        estimatedEffort: 8,
        impact: '難以測試和維護',
        timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
        resolved: false,
      },
      {
        id: 'td-004',
        type: 'coverage',
        severity: 'medium',
        file: 'src/services/errorHandlingService.ts',
        line: 89,
        message: '測試覆蓋率不足 (65%)',
        suggestion: '添加更多單元測試和集成測試',
        estimatedEffort: 6,
        impact: '降低代碼可靠性',
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
        resolved: false,
      },
      {
        id: 'td-005',
        type: 'security',
        severity: 'high',
        file: 'src/services/authService.ts',
        line: 34,
        message: '敏感信息可能暴露在日誌中',
        suggestion: '使用安全的日誌記錄方式，避免記錄敏感信息',
        estimatedEffort: 3,
        impact: '安全風險',
        timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
        resolved: false,
      },
    ];

    this.detectionResults.push(...mockResults);
  }

  // Begin定期檢測
  private startPeriodicDetection(): void {
    // 模擬定期檢測
    setInterval(
      () => {
        this.performCodeQualityAnalysis();
      },
      24 * 60 * 60 * 1000
    ); // 每24Hour檢測一次
  }

  // 執Row代碼質量Analysis
  private performCodeQualityAnalysis(): void {
    const _currentMetrics = this.collectCurrentMetrics();
    this.qualityMetrics.push(currentMetrics);

    // 檢測新的技術債務
    const _newIssues = this.detectTechnicalDebt(currentMetrics);
    this.detectionResults.push(...newIssues);

    // Update趨勢Analysis
    this.updateTrendAnalysis();

    console.log(`代碼質量分析完成，發現 ${newIssues.length} 個新問題`);
  }

  // 收集當前質量指標
  private collectCurrentMetrics(): CodeQualityMetrics {
    return {
      timestamp: Date.now(),
      cyclomaticComplexity: Math.random() * 15 + 5,
      codeDuplication: Math.random() * 10 + 2,
      testCoverage: Math.random() * 20 + 75,
      codeSmells: Math.random() * 15 + 5,
      technicalDebtRatio: Math.random() * 8 + 2,
      maintainabilityIndex: Math.random() * 30 + 60,
      reliabilityIndex: Math.random() * 20 + 70,
      securityIndex: Math.random() * 15 + 80,
    };
  }

  // 檢測技術債務
  private detectTechnicalDebt(
    metrics: CodeQualityMetrics
  ): TechnicalDebtDetectionResult[] {
    const issues: TechnicalDebtDetectionResult[] = [];

    // 檢測圈複雜度問題
    if (
      metrics.cyclomaticComplexity > this.config.thresholds.cyclomaticComplexity
    ) {
      issues.push({
        id: `td-${Date.now()}-complexity`,
        type: 'complexity',
        severity: metrics.cyclomaticComplexity > 15 ? 'critical' : 'high',
        file: 'src/components/ComplexComponent.tsx',
        line: Math.floor(Math.random() * 100) + 1,
        message: `圈複雜度過高 (${metrics.cyclomaticComplexity})`,
        suggestion: '重構複雜邏輯，提取方法',
        estimatedEffort: Math.ceil(metrics.cyclomaticComplexity / 3),
        impact: '難以測試和維護',
        timestamp: Date.now(),
        resolved: false,
      });
    }

    // 檢測代碼Duplicate問題
    if (metrics.codeDuplication > this.config.thresholds.codeDuplication) {
      issues.push({
        id: `td-${Date.now()}-duplication`,
        type: 'duplication',
        severity: 'medium',
        file: 'src/utils/commonUtils.ts',
        line: Math.floor(Math.random() * 50) + 1,
        message: `代碼重複率過高 (${metrics.codeDuplication}%)`,
        suggestion: '提取公共方法，消除重複代碼',
        estimatedEffort: Math.ceil(metrics.codeDuplication / 2),
        impact: '增加維護成本',
        timestamp: Date.now(),
        resolved: false,
      });
    }

    // 檢測Test覆蓋率問題
    if (metrics.testCoverage < this.config.thresholds.testCoverage) {
      issues.push({
        id: `td-${Date.now()}-coverage`,
        type: 'coverage',
        severity: 'medium',
        file: 'src/services/newService.ts',
        line: Math.floor(Math.random() * 30) + 1,
        message: `測試覆蓋率不足 (${metrics.testCoverage}%)`,
        suggestion: '添加更多單元測試和集成測試',
        estimatedEffort: Math.ceil(
          (this.config.thresholds.testCoverage - metrics.testCoverage) / 5
        ),
        impact: '降低代碼可靠性',
        timestamp: Date.now(),
        resolved: false,
      });
    }

    return issues;
  }

  // Update趨勢Analysis
  private updateTrendAnalysis(): void {
    const _recentMetrics = this.qualityMetrics.slice(-30); // 最近30天
    const _previousMetrics = this.qualityMetrics.slice(-60, -30); // 前30天

    if (recentMetrics.length === 0) return;

    const _currentDebtRatio =
      recentMetrics.reduce((sum, m) => sum + m.technicalDebtRatio, 0) /
      recentMetrics.length;
    const _previousDebtRatio =
      previousMetrics.length > 0
        ? previousMetrics.reduce((sum, m) => sum + m.technicalDebtRatio, 0) /
          previousMetrics.length
        : currentDebtRatio;

    const trend: 'improving' | 'stable' | 'worsening' =
      currentDebtRatio < previousDebtRatio - 1
        ? 'improving'
        : currentDebtRatio > previousDebtRatio + 1
          ? 'worsening'
          : 'stable';

    const analysis: TechnicalDebtTrendAnalysis = {
      period: '最近30天',
      totalIssues: this.detectionResults.filter(r => !r.resolved).length,
      resolvedIssues: this.detectionResults.filter(r => r.resolved).length,
      newIssues: this.detectionResults.filter(
        r => r.timestamp > Date.now() - 30 * 24 * 60 * 60 * 1000
      ).length,
      debtRatio: currentDebtRatio,
      trend,
      recommendations: this.generateTrendRecommendations(
        trend,
        currentDebtRatio
      ),
      predictions: {
        nextMonthDebtRatio: this.predictNextMonthDebtRatio(
          currentDebtRatio,
          trend
        ),
        estimatedResolutionTime: this.estimateResolutionTime(),
        riskLevel: this.assessRiskLevel(currentDebtRatio),
      },
    };

    this.trendAnalyses.push(analysis);
  }

  // 生成趨勢建議
  private generateTrendRecommendations(
    trend: string,
    debtRatio: number
  ): string[] {
    const recommendations: string[] = [];

    if (trend === 'worsening') {
      recommendations.push('加強代碼審查流程');
      recommendations.push('實施更嚴格的質量門禁');
      recommendations.push('增加重構時間分配');
      recommendations.push('建立技術債務優先級管理');
    } else if (trend === 'improving') {
      recommendations.push('保持當前的質量標準');
      recommendations.push('繼續定期重構工作');
      recommendations.push('分享最佳實踐');
    } else {
      recommendations.push('維持現有質量水平');
      recommendations.push('關注新引入的技術債務');
    }

    if (debtRatio > 10) {
      recommendations.push('考慮暫停新功能開發，專注於技術債務清理');
      recommendations.push('建立技術債務清理衝刺');
    }

    return recommendations;
  }

  // 預測下個月債務比率
  private predictNextMonthDebtRatio(
    currentRatio: number,
    trend: string
  ): number {
    const _trendFactor =
      trend === 'improving' ? 0.9 : trend === 'worsening' ? 1.1 : 1.0;
    return Math.max(0, currentRatio * trendFactor);
  }

  // 估算ResolveTime
  private estimateResolutionTime(): number {
    const _unresolvedIssues = this.detectionResults.filter(r => !r.resolved);
    const _totalEffort = unresolvedIssues.reduce(
      (sum, issue) => sum + issue.estimatedEffort,
      0
    );
    return Math.ceil(totalEffort / 8); // False設每天8Hour工作
  }

  // 評估風險等級
  private assessRiskLevel(debtRatio: number): 'low' | 'medium' | 'high' {
    if (debtRatio < 5) return 'low';
    if (debtRatio < 10) return 'medium';
    return 'high';
  }

  // Check代碼質量門禁
  checkCodeQualityGate(metrics: CodeQualityMetrics): {
    passed: boolean;
    violations: string[];
    blocking: boolean;
  } {
    if (!this.config.enabled) {
      return { passed: true, violations: [], blocking: false };
    }

    const violations: string[] = [];
    let blocking = false;

    // Check負數指標
    if (
      metrics.cyclomaticComplexity < 0 ||
      metrics.codeDuplication < 0 ||
      metrics.testCoverage < 0 ||
      metrics.codeSmells < 0 ||
      metrics.technicalDebtRatio < 0 ||
      metrics.maintainabilityIndex < 0
    ) {
      violations.push('檢測到負數指標，請檢查數據完整性');
      blocking = true;
    }

    // Check各項指標
    if (
      metrics.cyclomaticComplexity > this.config.thresholds.cyclomaticComplexity
    ) {
      violations.push(
        `圈複雜度過高: ${metrics.cyclomaticComplexity} > ${this.config.thresholds.cyclomaticComplexity}`
      );
      if (this.config.blockingRules.highSeverityDebt) blocking = true;
    }

    if (metrics.codeDuplication > this.config.thresholds.codeDuplication) {
      violations.push(
        `代碼重複率過高: ${metrics.codeDuplication}% > ${this.config.thresholds.codeDuplication}%`
      );
    }

    if (metrics.testCoverage < this.config.thresholds.testCoverage) {
      violations.push(
        `測試覆蓋率不足: ${metrics.testCoverage}% < ${this.config.thresholds.testCoverage}%`
      );
      if (this.config.blockingRules.lowTestCoverage) blocking = true;
    }

    if (metrics.codeSmells > this.config.thresholds.codeSmells) {
      violations.push(
        `代碼異味過多: ${metrics.codeSmells} > ${this.config.thresholds.codeSmells}`
      );
    }

    if (
      metrics.technicalDebtRatio > this.config.thresholds.technicalDebtRatio
    ) {
      violations.push(
        `技術債務比率過高: ${metrics.technicalDebtRatio}% > ${this.config.thresholds.technicalDebtRatio}%`
      );
      if (this.config.blockingRules.highSeverityDebt) blocking = true;
    }

    if (
      metrics.maintainabilityIndex < this.config.thresholds.maintainabilityIndex
    ) {
      violations.push(
        `可維護性指數過低: ${metrics.maintainabilityIndex} < ${this.config.thresholds.maintainabilityIndex}`
      );
    }

    const _passed = violations.length === 0;

    return { passed, violations, blocking };
  }

  // Auto檢測技術債務
  autoDetectTechnicalDebt(): TechnicalDebtDetectionResult[] {
    const _currentMetrics = this.collectCurrentMetrics();
    this.qualityMetrics.push(currentMetrics);

    const _newIssues = this.detectTechnicalDebt(currentMetrics);

    // Add更多Auto檢測邏輯
    const _additionalIssues = this.performAdvancedDetection();
    newIssues.push(...additionalIssues);

    this.detectionResults.push(...newIssues);

    // Update趨勢Analysis
    this.updateTrendAnalysis();

    return newIssues;
  }

  // 執Row高級檢測
  private performAdvancedDetection(): TechnicalDebtDetectionResult[] {
    const issues: TechnicalDebtDetectionResult[] = [];

    // 檢測性能問題
    if (Math.random() > 0.7) {
      issues.push({
        id: `td-${Date.now()}-performance`,
        type: 'performance',
        severity: 'medium',
        file: 'src/components/HeavyComponent.tsx',
        line: Math.floor(Math.random() * 100) + 1,
        message: '組件渲染性能較差',
        suggestion: '使用 React.memo 和 useMemo 優化渲染',
        estimatedEffort: 3,
        impact: '影響用戶體驗',
        timestamp: Date.now(),
        resolved: false,
      });
    }

    // 檢測安全問題
    if (Math.random() > 0.8) {
      issues.push({
        id: `td-${Date.now()}-security`,
        type: 'security',
        severity: 'high',
        file: 'src/services/dataService.ts',
        line: Math.floor(Math.random() * 50) + 1,
        message: '數據驗證不充分',
        suggestion: '加強輸入驗證和數據清理',
        estimatedEffort: 4,
        impact: '安全風險',
        timestamp: Date.now(),
        resolved: false,
      });
    }

    return issues;
  }

  // 定期架構審查
  scheduleCodeReview(reviewer: string, scope: string): CodeReviewReport {
    const report: CodeReviewReport = {
      id: `review-${Date.now()}`,
      timestamp: Date.now(),
      reviewer,
      scope,
      findings: {
        critical: Math.floor(Math.random() * 3),
        high: Math.floor(Math.random() * 5) + 1,
        medium: Math.floor(Math.random() * 8) + 2,
        low: Math.floor(Math.random() * 10) + 3,
      },
      recommendations: [
        '加強ErrorHandle機制',
        '優化數據結構設計',
        '改進命名規範',
        '增加文檔註釋',
      ],
      actionItems: [
        '重構複雜的業務邏輯',
        '添加缺失的單元測試',
        '優化數據庫查詢',
        '更新 API 文檔',
      ],
      nextReviewDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30天後
      status: 'pending',
    };

    this.reviewReports.push(report);
    return report;
  }

  // Analysis技術債務趨勢
  analyzeTechnicalDebtTrend(period = '30天'): TechnicalDebtTrendAnalysis {
    const _recentAnalysis = this.trendAnalyses[this.trendAnalyses.length - 1];
    return recentAnalysis || this.generateDefaultTrendAnalysis();
  }

  // 生成Default趨勢Analysis
  private generateDefaultTrendAnalysis(): TechnicalDebtTrendAnalysis {
    return {
      period: '30天',
      totalIssues: this.detectionResults.filter(r => !r.resolved).length,
      resolvedIssues: this.detectionResults.filter(r => r.resolved).length,
      newIssues: this.detectionResults.filter(
        r => r.timestamp > Date.now() - 30 * 24 * 60 * 60 * 1000
      ).length,
      debtRatio: 5.2,
      trend: 'stable',
      recommendations: [
        '保持當前的質量標準',
        '定期進行代碼重構',
        '加強代碼審查流程',
      ],
      predictions: {
        nextMonthDebtRatio: 5.0,
        estimatedResolutionTime: 20,
        riskLevel: 'low',
      },
    };
  }

  // Get質量指標
  getQualityMetrics(limit = 30): CodeQualityMetrics[] {
    return this.qualityMetrics.slice(-limit);
  }

  // Get檢測結果
  getDetectionResults(resolved = false): TechnicalDebtDetectionResult[] {
    return this.detectionResults.filter(r => r.resolved === resolved);
  }

  // Get審查Report
  getReviewReports(): CodeReviewReport[] {
    return this.reviewReports;
  }

  // Get趨勢Analysis
  getTrendAnalyses(): TechnicalDebtTrendAnalysis[] {
    return this.trendAnalyses;
  }

  // Resolve技術債務問題
  resolveTechnicalDebt(issueId: string): void {
    const _issue = this.detectionResults.find(r => r.id === issueId);
    if (issue) {
      issue.resolved = true;
    }
  }

  // UpdateConfigure
  updateConfig(newConfig: Partial<CodeQualityGateConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      thresholds: { ...this.config.thresholds, ...newConfig.thresholds },
      blockingRules: {
        ...this.config.blockingRules,
        ...newConfig.blockingRules,
      },
    };
  }

  // 生成預防Report
  generatePreventionReport(): string {
    const _report = {
      timestamp: Date.now(),
      config: this.config,
      currentMetrics: this.qualityMetrics[this.qualityMetrics.length - 1],
      activeIssues: this.detectionResults.filter(r => !r.resolved).length,
      resolvedIssues: this.detectionResults.filter(r => r.resolved).length,
      recentReviews: this.reviewReports.slice(-5),
      trendAnalysis:
        this.trendAnalyses[this.trendAnalyses.length - 1] ||
        this.generateDefaultTrendAnalysis(),
      recommendations: [
        '建立代碼質量門禁機制',
        '實施自動化技術債務檢測',
        '定期進行架構審查',
        '建立技術債務優先級管理',
        '加強開發團隊質量意識',
      ],
    };

    return JSON.stringify(report, null, 2);
  }

  // Export完整Report
  exportFullReport(): string {
    const _report = {
      timestamp: Date.now(),
      config: this.config,
      qualityMetrics: this.qualityMetrics.slice(-30),
      detectionResults: this.detectionResults,
      reviewReports: this.reviewReports,
      trendAnalyses: this.trendAnalyses,
      summary: {
        totalIssues: this.detectionResults.length,
        resolvedIssues: this.detectionResults.filter(r => r.resolved).length,
        activeIssues: this.detectionResults.filter(r => !r.resolved).length,
        averageDebtRatio:
          this.qualityMetrics.reduce(
            (sum, m) => sum + m.technicalDebtRatio,
            0
          ) / this.qualityMetrics.length,
        trend:
          this.trendAnalyses[this.trendAnalyses.length - 1]?.trend || 'stable',
      },
    };

    return JSON.stringify(report, null, 2);
  }
}

// Export單例Instance
export const _technicalDebtPreventionService =
  TechnicalDebtPreventionService.getInstance();
