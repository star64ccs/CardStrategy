import { HybridArchitectureCore } from './HybridArchitectureCore';

// 技術債務類型定義
export interface TechnicalDebtItem {
  id: string;
  title: string;
  description: string;
  category: TechnicalDebtCategory;
  severity: TechnicalDebtSeverity;
  priority: TechnicalDebtPriority;
  estimatedEffort: number; // 小時
  actualEffort?: number; // 小時
  impact: TechnicalDebtImpact;
  location: string; // 文件路徑或模組名稱
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  status: TechnicalDebtStatus;
  assignedTo?: string;
  tags: string[];
  dependencies: string[]; // 相關的技術債務ID
  resolution?: TechnicalDebtResolution;
  metrics: TechnicalDebtMetrics;
}

export enum TechnicalDebtCategory {
  CODE_QUALITY = 'CODE_QUALITY',
  ARCHITECTURE = 'ARCHITECTURE',
  PERFORMANCE = 'PERFORMANCE',
  SECURITY = 'SECURITY',
  TESTING = 'TESTING',
  DOCUMENTATION = 'DOCUMENTATION',
  DEPENDENCIES = 'DEPENDENCIES',
  LEGACY_CODE = 'LEGACY_CODE',
  COMPLIANCE = 'COMPLIANCE',
  MONITORING = 'MONITORING',
}

export enum TechnicalDebtSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TechnicalDebtPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TechnicalDebtImpact {
  MINIMAL = 'MINIMAL',
  MODERATE = 'MODERATE',
  SIGNIFICANT = 'SIGNIFICANT',
  SEVERE = 'SEVERE',
}

export enum TechnicalDebtStatus {
  IDENTIFIED = 'IDENTIFIED',
  ANALYZED = 'ANALYZED',
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  DEFERRED = 'DEFERRED',
}

export interface TechnicalDebtResolution {
  approach: string;
  steps: string[];
  resources: string[];
  timeline: number; // 天
  cost: number; // 預估成本
  risks: string[];
  benefits: string[];
}

export interface TechnicalDebtMetrics {
  codeComplexity: number;
  testCoverage: number;
  performanceScore: number;
  securityScore: number;
  maintainabilityIndex: number;
  technicalDebtRatio: number; // 百分比
}

export interface TechnicalDebtReport {
  summary: {
    totalItems: number;
    byStatus: Record<TechnicalDebtStatus, number>;
    bySeverity: Record<TechnicalDebtSeverity, number>;
    byCategory: Record<TechnicalDebtCategory, number>;
    totalEffort: number;
    totalCost: number;
  };
  items: TechnicalDebtItem[];
  trends: {
    newItems: number;
    resolvedItems: number;
    averageResolutionTime: number;
    debtGrowthRate: number;
  };
  recommendations: TechnicalDebtRecommendation[];
}

export interface TechnicalDebtRecommendation {
  type: 'IMMEDIATE' | 'SHORT_TERM' | 'LONG_TERM';
  priority: TechnicalDebtPriority;
  items: string[]; // 技術債務ID
  rationale: string;
  expectedImpact: string;
  estimatedEffort: number;
}

// 技術債務識別器
export class TechnicalDebtIdentifier {
  private readonly hybridCore: HybridArchitectureCore;

  constructor() {
    this.hybridCore = HybridArchitectureCore.getInstance();
  }

  async identifyCodeQualityIssues(): Promise<TechnicalDebtItem[]> {
    const issues: TechnicalDebtItem[] = [];

    // 識別代碼複雜度問題
    const _complexityIssues = await this.analyzeCodeComplexity();
    issues.push(...complexityIssues);

    // 識別重複代碼
    const _duplicationIssues = await this.analyzeCodeDuplication();
    issues.push(...duplicationIssues);

    // 識別命名規範問題
    const _namingIssues = await this.analyzeNamingConventions();
    issues.push(...namingIssues);

    return issues;
  }

  async identifyArchitectureIssues(): Promise<TechnicalDebtItem[]> {
    const issues: TechnicalDebtItem[] = [];

    // 識別模組耦合問題
    const _couplingIssues = await this.analyzeModuleCoupling();
    issues.push(...couplingIssues);

    // 識別設計模式問題
    const _patternIssues = await this.analyzeDesignPatterns();
    issues.push(...patternIssues);

    return issues;
  }

  async identifyPerformanceIssues(): Promise<TechnicalDebtItem[]> {
    const issues: TechnicalDebtItem[] = [];

    // 識別性能瓶頸
    const _bottleneckIssues = await this.analyzePerformanceBottlenecks();
    issues.push(...bottleneckIssues);

    // 識別內存洩漏
    const _memoryIssues = await this.analyzeMemoryLeaks();
    issues.push(...memoryIssues);

    return issues;
  }

  async identifySecurityIssues(): Promise<TechnicalDebtItem[]> {
    const issues: TechnicalDebtItem[] = [];

    // 識別安全漏洞
    const _vulnerabilityIssues = await this.analyzeSecurityVulnerabilities();
    issues.push(...vulnerabilityIssues);

    // 識別權限問題
    const _permissionIssues = await this.analyzePermissionIssues();
    issues.push(...permissionIssues);

    return issues;
  }

  private async analyzeCodeComplexity(): Promise<TechnicalDebtItem[]> {
    // 模擬代碼複雜度分析
    return [
      {
        id: `complexity_${Date.now()}`,
        title: '高複雜度函數檢測',
        description: '發現多個函數的圈複雜度超過閾值',
        category: TechnicalDebtCategory.CODE_QUALITY,
        severity: TechnicalDebtSeverity.MEDIUM,
        priority: TechnicalDebtPriority.MEDIUM,
        estimatedEffort: 8,
        impact: TechnicalDebtImpact.MODERATE,
        location: 'src/core/services/',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: TechnicalDebtStatus.IDENTIFIED,
        tags: ['complexity', 'refactoring'],
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
  }

  private async analyzeCodeDuplication(): Promise<TechnicalDebtItem[]> {
    return [
      {
        id: `duplication_${Date.now()}`,
        title: '代碼重複檢測',
        description: '發現多處重複的代碼邏輯',
        category: TechnicalDebtCategory.CODE_QUALITY,
        severity: TechnicalDebtSeverity.LOW,
        priority: TechnicalDebtPriority.LOW,
        estimatedEffort: 4,
        impact: TechnicalDebtImpact.MINIMAL,
        location: 'src/utils/',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: TechnicalDebtStatus.IDENTIFIED,
        tags: ['duplication', 'refactoring'],
        dependencies: [],
        metrics: {
          codeComplexity: 8,
          testCoverage: 80,
          performanceScore: 85,
          securityScore: 90,
          maintainabilityIndex: 70,
          technicalDebtRatio: 8,
        },
      },
    ];
  }

  private async analyzeNamingConventions(): Promise<TechnicalDebtItem[]> {
    return [
      {
        id: `naming_${Date.now()}`,
        title: '命名規範問題',
        description: '部分變量和函數命名不符合規範',
        category: TechnicalDebtCategory.CODE_QUALITY,
        severity: TechnicalDebtSeverity.LOW,
        priority: TechnicalDebtPriority.LOW,
        estimatedEffort: 2,
        impact: TechnicalDebtImpact.MINIMAL,
        location: 'src/components/',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: TechnicalDebtStatus.IDENTIFIED,
        tags: ['naming', 'standards'],
        dependencies: [],
        metrics: {
          codeComplexity: 5,
          testCoverage: 85,
          performanceScore: 90,
          securityScore: 95,
          maintainabilityIndex: 75,
          technicalDebtRatio: 5,
        },
      },
    ];
  }

  private async analyzeModuleCoupling(): Promise<TechnicalDebtItem[]> {
    return [
      {
        id: `coupling_${Date.now()}`,
        title: '模組耦合過高',
        description: '某些模組之間的耦合度過高',
        category: TechnicalDebtCategory.ARCHITECTURE,
        severity: TechnicalDebtSeverity.HIGH,
        priority: TechnicalDebtPriority.HIGH,
        estimatedEffort: 16,
        impact: TechnicalDebtImpact.SIGNIFICANT,
        location: 'src/core/',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: TechnicalDebtStatus.IDENTIFIED,
        tags: ['coupling', 'architecture'],
        dependencies: [],
        metrics: {
          codeComplexity: 12,
          testCoverage: 70,
          performanceScore: 75,
          securityScore: 80,
          maintainabilityIndex: 60,
          technicalDebtRatio: 18,
        },
      },
    ];
  }

  private async analyzeDesignPatterns(): Promise<TechnicalDebtItem[]> {
    return [
      {
        id: `pattern_${Date.now()}`,
        title: '設計模式應用不當',
        description: '某些地方應該使用設計模式但沒有使用',
        category: TechnicalDebtCategory.ARCHITECTURE,
        severity: TechnicalDebtSeverity.MEDIUM,
        priority: TechnicalDebtPriority.MEDIUM,
        estimatedEffort: 12,
        impact: TechnicalDebtImpact.MODERATE,
        location: 'src/services/',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: TechnicalDebtStatus.IDENTIFIED,
        tags: ['patterns', 'architecture'],
        dependencies: [],
        metrics: {
          codeComplexity: 10,
          testCoverage: 75,
          performanceScore: 80,
          securityScore: 85,
          maintainabilityIndex: 65,
          technicalDebtRatio: 15,
        },
      },
    ];
  }

  private async analyzePerformanceBottlenecks(): Promise<TechnicalDebtItem[]> {
    return [
      {
        id: `performance_${Date.now()}`,
        title: '性能瓶頸檢測',
        description: '發現多個性能瓶頸點',
        category: TechnicalDebtCategory.PERFORMANCE,
        severity: TechnicalDebtSeverity.HIGH,
        priority: TechnicalDebtPriority.HIGH,
        estimatedEffort: 20,
        impact: TechnicalDebtImpact.SIGNIFICANT,
        location: 'src/api/',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: TechnicalDebtStatus.IDENTIFIED,
        tags: ['performance', 'optimization'],
        dependencies: [],
        metrics: {
          codeComplexity: 8,
          testCoverage: 80,
          performanceScore: 60,
          securityScore: 85,
          maintainabilityIndex: 70,
          technicalDebtRatio: 20,
        },
      },
    ];
  }

  private async analyzeMemoryLeaks(): Promise<TechnicalDebtItem[]> {
    return [
      {
        id: `memory_${Date.now()}`,
        title: '潛在內存洩漏',
        description: '檢測到潛在的內存洩漏問題',
        category: TechnicalDebtCategory.PERFORMANCE,
        severity: TechnicalDebtSeverity.CRITICAL,
        priority: TechnicalDebtPriority.URGENT,
        estimatedEffort: 8,
        impact: TechnicalDebtImpact.SEVERE,
        location: 'src/components/',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: TechnicalDebtStatus.IDENTIFIED,
        tags: ['memory', 'leak'],
        dependencies: [],
        metrics: {
          codeComplexity: 6,
          testCoverage: 85,
          performanceScore: 50,
          securityScore: 90,
          maintainabilityIndex: 75,
          technicalDebtRatio: 25,
        },
      },
    ];
  }

  private async analyzeSecurityVulnerabilities(): Promise<TechnicalDebtItem[]> {
    return [
      {
        id: `security_${Date.now()}`,
        title: '安全漏洞檢測',
        description: '發現多個安全漏洞',
        category: TechnicalDebtCategory.SECURITY,
        severity: TechnicalDebtSeverity.CRITICAL,
        priority: TechnicalDebtPriority.URGENT,
        estimatedEffort: 24,
        impact: TechnicalDebtImpact.SEVERE,
        location: 'src/auth/',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: TechnicalDebtStatus.IDENTIFIED,
        tags: ['security', 'vulnerability'],
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
  }

  private async analyzePermissionIssues(): Promise<TechnicalDebtItem[]> {
    return [
      {
        id: `permission_${Date.now()}`,
        title: '權限控制問題',
        description: '權限控制邏輯存在缺陷',
        category: TechnicalDebtCategory.SECURITY,
        severity: TechnicalDebtSeverity.HIGH,
        priority: TechnicalDebtPriority.HIGH,
        estimatedEffort: 12,
        impact: TechnicalDebtImpact.SIGNIFICANT,
        location: 'src/permissions/',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: TechnicalDebtStatus.IDENTIFIED,
        tags: ['permissions', 'security'],
        dependencies: [],
        metrics: {
          codeComplexity: 8,
          testCoverage: 85,
          performanceScore: 90,
          securityScore: 55,
          maintainabilityIndex: 75,
          technicalDebtRatio: 22,
        },
      },
    ];
  }
}

// 技術債務評估器
export class TechnicalDebtEvaluator {
  evaluateSeverity(item: TechnicalDebtItem): TechnicalDebtSeverity {
    const _factors = {
      impact: this.getImpactScore(item.impact),
      complexity: this.getComplexityScore(item.metrics.codeComplexity),
      coverage: this.getCoverageScore(item.metrics.testCoverage),
      performance: this.getPerformanceScore(item.metrics.performanceScore),
      security: this.getSecurityScore(item.metrics.securityScore),
    };

    const _totalScore = Object.values(factors).reduce(
      (sum, score) => sum + score,
      0
    );
    const _averageScore = totalScore / Object.keys(factors).length;

    if (averageScore >= 8) return TechnicalDebtSeverity.CRITICAL;
    if (averageScore >= 6) return TechnicalDebtSeverity.HIGH;
    if (averageScore >= 4) return TechnicalDebtSeverity.MEDIUM;
    return TechnicalDebtSeverity.LOW;
  }

  evaluatePriority(item: TechnicalDebtItem): TechnicalDebtPriority {
    const _severityScore = this.getSeverityScore(item.severity);
    const _impactScore = this.getImpactScore(item.impact);
    const _effortScore = this.getEffortScore(item.estimatedEffort);

    const _totalScore = severityScore + impactScore + effortScore;

    if (totalScore >= 15) return TechnicalDebtPriority.URGENT;
    if (totalScore >= 10) return TechnicalDebtPriority.HIGH;
    if (totalScore >= 6) return TechnicalDebtPriority.MEDIUM;
    return TechnicalDebtPriority.LOW;
  }

  calculateTechnicalDebtRatio(items: TechnicalDebtItem[]): number {
    if (items.length === 0) return 0;

    const _totalDebt = items.reduce((sum, item) => {
      const _severityMultiplier = this.getSeverityMultiplier(item.severity);
      return sum + item.estimatedEffort * severityMultiplier;
    }, 0);

    const _totalCode = 1000; // 假設總代碼量
    return (totalDebt / totalCode) * 100;
  }

  generateRecommendations(
    items: TechnicalDebtItem[]
  ): TechnicalDebtRecommendation[] {
    const recommendations: TechnicalDebtRecommendation[] = [];

    // 立即處理的建議
    const _immediateItems = items.filter(
      item =>
        item.severity === TechnicalDebtSeverity.CRITICAL ||
        item.priority === TechnicalDebtPriority.URGENT
    );

    if (immediateItems.length > 0) {
      recommendations.push({
        type: 'IMMEDIATE',
        priority: TechnicalDebtPriority.URGENT,
        items: immediateItems.map(item => item.id),
        rationale: '這些問題需要立即處理以避免嚴重後果',
        expectedImpact: '高',
        estimatedEffort: immediateItems.reduce(
          (sum, item) => sum + item.estimatedEffort,
          0
        ),
      });
    }

    // 短期處理的建議
    const _shortTermItems = items.filter(
      item =>
        item.severity === TechnicalDebtSeverity.HIGH &&
        item.priority === TechnicalDebtPriority.HIGH
    );

    if (shortTermItems.length > 0) {
      recommendations.push({
        type: 'SHORT_TERM',
        priority: TechnicalDebtPriority.HIGH,
        items: shortTermItems.map(item => item.id),
        rationale: '這些問題應該在短期內處理',
        expectedImpact: '中高',
        estimatedEffort: shortTermItems.reduce(
          (sum, item) => sum + item.estimatedEffort,
          0
        ),
      });
    }

    // 長期處理的建議
    const _longTermItems = items.filter(
      item =>
        item.severity === TechnicalDebtSeverity.LOW ||
        item.severity === TechnicalDebtSeverity.MEDIUM
    );

    if (longTermItems.length > 0) {
      recommendations.push({
        type: 'LONG_TERM',
        priority: TechnicalDebtPriority.MEDIUM,
        items: longTermItems.map(item => item.id),
        rationale: '這些問題可以在長期規劃中處理',
        expectedImpact: '中低',
        estimatedEffort: longTermItems.reduce(
          (sum, item) => sum + item.estimatedEffort,
          0
        ),
      });
    }

    return recommendations;
  }

  private getImpactScore(impact: TechnicalDebtImpact): number {
    switch (impact) {
      case TechnicalDebtImpact.SEVERE:
        return 10;
      case TechnicalDebtImpact.SIGNIFICANT:
        return 8;
      case TechnicalDebtImpact.MODERATE:
        return 6;
      case TechnicalDebtImpact.MINIMAL:
        return 2;
      default:
        return 5;
    }
  }

  private getComplexityScore(complexity: number): number {
    if (complexity > 20) return 10;
    if (complexity > 15) return 8;
    if (complexity > 10) return 6;
    if (complexity > 5) return 4;
    return 2;
  }

  private getCoverageScore(coverage: number): number {
    if (coverage < 50) return 10;
    if (coverage < 70) return 8;
    if (coverage < 80) return 6;
    if (coverage < 90) return 4;
    return 2;
  }

  private getPerformanceScore(performance: number): number {
    if (performance < 50) return 10;
    if (performance < 70) return 8;
    if (performance < 80) return 6;
    if (performance < 90) return 4;
    return 2;
  }

  private getSecurityScore(security: number): number {
    if (security < 50) return 10;
    if (security < 70) return 8;
    if (security < 80) return 6;
    if (security < 90) return 4;
    return 2;
  }

  private getSeverityScore(severity: TechnicalDebtSeverity): number {
    switch (severity) {
      case TechnicalDebtSeverity.CRITICAL:
        return 5;
      case TechnicalDebtSeverity.HIGH:
        return 4;
      case TechnicalDebtSeverity.MEDIUM:
        return 3;
      case TechnicalDebtSeverity.LOW:
        return 1;
      default:
        return 2;
    }
  }

  private getEffortScore(effort: number): number {
    if (effort > 20) return 5;
    if (effort > 10) return 4;
    if (effort > 5) return 3;
    if (effort > 2) return 2;
    return 1;
  }

  private getSeverityMultiplier(severity: TechnicalDebtSeverity): number {
    switch (severity) {
      case TechnicalDebtSeverity.CRITICAL:
        return 4;
      case TechnicalDebtSeverity.HIGH:
        return 3;
      case TechnicalDebtSeverity.MEDIUM:
        return 2;
      case TechnicalDebtSeverity.LOW:
        return 1;
      default:
        return 1;
    }
  }
}

// 技術債務追蹤器
export class TechnicalDebtTracker {
  private readonly items: Map<string, TechnicalDebtItem> = new Map();
  private readonly evaluator: TechnicalDebtEvaluator;

  constructor() {
    this.evaluator = new TechnicalDebtEvaluator();
  }

  addItem(item: TechnicalDebtItem): void {
    this.items.set(item.id, item);
  }

  updateItem(id: string, updates: Partial<TechnicalDebtItem>): boolean {
    const _item = this.items.get(id);
    if (!item) return false;

    const _updatedItem = { ...item, ...updates, updatedAt: new Date() };
    this.items.set(id, updatedItem);
    return true;
  }

  removeItem(id: string): boolean {
    return this.items.delete(id);
  }

  getItem(id: string): TechnicalDebtItem | undefined {
    return this.items.get(id);
  }

  getAllItems(): TechnicalDebtItem[] {
    return Array.from(this.items.values());
  }

  getItemsByStatus(status: TechnicalDebtStatus): TechnicalDebtItem[] {
    return this.getAllItems().filter(item => item.status === status);
  }

  getItemsBySeverity(severity: TechnicalDebtSeverity): TechnicalDebtItem[] {
    return this.getAllItems().filter(item => item.severity === severity);
  }

  getItemsByCategory(category: TechnicalDebtCategory): TechnicalDebtItem[] {
    return this.getAllItems().filter(item => item.category === category);
  }

  getOverdueItems(): TechnicalDebtItem[] {
    const _now = new Date();
    return this.getAllItems().filter(
      item =>
        item.dueDate &&
        item.dueDate < now &&
        item.status !== TechnicalDebtStatus.RESOLVED
    );
  }

  generateReport(): TechnicalDebtReport {
    const _items = this.getAllItems();
    const _summary = {
      totalItems: items.length,
      byStatus: this.getStatusDistribution(items),
      bySeverity: this.getSeverityDistribution(items),
      byCategory: this.getCategoryDistribution(items),
      totalEffort: items.reduce(
        (sum, item) => sum + (item.actualEffort || item.estimatedEffort),
        0
      ),
      totalCost: items.reduce(
        (sum, item) => sum + (item.resolution?.cost || 0),
        0
      ),
    };

    const _trends = {
      newItems: this.getNewItemsCount(items),
      resolvedItems: this.getResolvedItemsCount(items),
      averageResolutionTime: this.getAverageResolutionTime(items),
      debtGrowthRate: this.calculateDebtGrowthRate(items),
    };

    const _recommendations = this.evaluator.generateRecommendations(items);

    return {
      summary,
      items,
      trends,
      recommendations,
    };
  }

  private getStatusDistribution(
    items: TechnicalDebtItem[]
  ): Record<TechnicalDebtStatus, number> {
    const distribution: Record<TechnicalDebtStatus, number> = {
      [TechnicalDebtStatus.IDENTIFIED]: 0,
      [TechnicalDebtStatus.ANALYZED]: 0,
      [TechnicalDebtStatus.PLANNED]: 0,
      [TechnicalDebtStatus.IN_PROGRESS]: 0,
      [TechnicalDebtStatus.RESOLVED]: 0,
      [TechnicalDebtStatus.CLOSED]: 0,
      [TechnicalDebtStatus.DEFERRED]: 0,
    };

    items.forEach(item => {
      distribution[item.status]++;
    });

    return distribution;
  }

  private getSeverityDistribution(
    items: TechnicalDebtItem[]
  ): Record<TechnicalDebtSeverity, number> {
    const distribution: Record<TechnicalDebtSeverity, number> = {
      [TechnicalDebtSeverity.LOW]: 0,
      [TechnicalDebtSeverity.MEDIUM]: 0,
      [TechnicalDebtSeverity.HIGH]: 0,
      [TechnicalDebtSeverity.CRITICAL]: 0,
    };

    items.forEach(item => {
      distribution[item.severity]++;
    });

    return distribution;
  }

  private getCategoryDistribution(
    items: TechnicalDebtItem[]
  ): Record<TechnicalDebtCategory, number> {
    const distribution: Record<TechnicalDebtCategory, number> = {
      [TechnicalDebtCategory.CODE_QUALITY]: 0,
      [TechnicalDebtCategory.ARCHITECTURE]: 0,
      [TechnicalDebtCategory.PERFORMANCE]: 0,
      [TechnicalDebtCategory.SECURITY]: 0,
      [TechnicalDebtCategory.TESTING]: 0,
      [TechnicalDebtCategory.DOCUMENTATION]: 0,
      [TechnicalDebtCategory.DEPENDENCIES]: 0,
      [TechnicalDebtCategory.LEGACY_CODE]: 0,
      [TechnicalDebtCategory.COMPLIANCE]: 0,
      [TechnicalDebtCategory.MONITORING]: 0,
    };

    items.forEach(item => {
      distribution[item.category]++;
    });

    return distribution;
  }

  private getNewItemsCount(items: TechnicalDebtItem[]): number {
    const _oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return items.filter(item => item.createdAt > oneWeekAgo).length;
  }

  private getResolvedItemsCount(items: TechnicalDebtItem[]): number {
    const _oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return items.filter(
      item =>
        item.status === TechnicalDebtStatus.RESOLVED &&
        item.updatedAt > oneWeekAgo
    ).length;
  }

  private getAverageResolutionTime(items: TechnicalDebtItem[]): number {
    const _resolvedItems = items.filter(
      item => item.status === TechnicalDebtStatus.RESOLVED
    );
    if (resolvedItems.length === 0) return 0;

    const _totalTime = resolvedItems.reduce((sum, item) => {
      const _resolutionTime =
        item.updatedAt.getTime() - item.createdAt.getTime();
      return sum + resolutionTime;
    }, 0);

    return totalTime / resolvedItems.length / (1000 * 60 * 60 * 24); // 轉換為天
  }

  private calculateDebtGrowthRate(items: TechnicalDebtItem[]): number {
    const _twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const _oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const _oldItems = items.filter(
      item => item.createdAt > twoWeeksAgo && item.createdAt <= oneWeekAgo
    );
    const _newItems = items.filter(item => item.createdAt > oneWeekAgo);

    if (oldItems.length === 0) return newItems.length;

    return ((newItems.length - oldItems.length) / oldItems.length) * 100;
  }
}

// 技術債務管理主類
export class TechnicalDebtManagement {
  private static instance: TechnicalDebtManagement;
  private readonly identifier: TechnicalDebtIdentifier;
  private readonly evaluator: TechnicalDebtEvaluator;
  private readonly tracker: TechnicalDebtTracker;
  private isInitialized = false;

  private constructor() {
    this.identifier = new TechnicalDebtIdentifier();
    this.evaluator = new TechnicalDebtEvaluator();
    this.tracker = new TechnicalDebtTracker();
  }

  public static getInstance(): TechnicalDebtManagement {
    if (!TechnicalDebtManagement.instance) {
      TechnicalDebtManagement.instance = new TechnicalDebtManagement();
    }
    return TechnicalDebtManagement.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // 初始化技術債務識別
      await this.performInitialScan();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('技術債務管理初始化失敗:', error);
      return false;
    }
  }

  async performInitialScan(): Promise<void> {
    // 執行初始掃描
    const _codeQualityIssues =
      await this.identifier.identifyCodeQualityIssues();
    const _architectureIssues =
      await this.identifier.identifyArchitectureIssues();
    const _performanceIssues =
      await this.identifier.identifyPerformanceIssues();
    const _securityIssues = await this.identifier.identifySecurityIssues();

    // 評估並添加到追蹤器
    const _allIssues = [
      ...codeQualityIssues,
      ...architectureIssues,
      ...performanceIssues,
      ...securityIssues,
    ];

    allIssues.forEach(item => {
      // 重新評估嚴重性和優先級
      item.severity = this.evaluator.evaluateSeverity(item);
      item.priority = this.evaluator.evaluatePriority(item);
      this.tracker.addItem(item);
    });
  }

  async scanForNewIssues(): Promise<TechnicalDebtItem[]> {
    if (!this.isInitialized) {
      throw new Error('技術債務管理尚未初始化');
    }

    const _newIssues = await this.identifier.identifyCodeQualityIssues();
    newIssues.forEach(item => {
      item.severity = this.evaluator.evaluateSeverity(item);
      item.priority = this.evaluator.evaluatePriority(item);
      this.tracker.addItem(item);
    });

    return newIssues;
  }

  getTechnicalDebtReport(): TechnicalDebtReport {
    return this.tracker.generateReport();
  }

  getItemsByStatus(status: TechnicalDebtStatus): TechnicalDebtItem[] {
    return this.tracker.getItemsByStatus(status);
  }

  getItemsBySeverity(severity: TechnicalDebtSeverity): TechnicalDebtItem[] {
    return this.tracker.getItemsBySeverity(severity);
  }

  getItemsByCategory(category: TechnicalDebtCategory): TechnicalDebtItem[] {
    return this.tracker.getItemsByCategory(category);
  }

  getOverdueItems(): TechnicalDebtItem[] {
    return this.tracker.getOverdueItems();
  }

  updateItemStatus(id: string, status: TechnicalDebtStatus): boolean {
    return this.tracker.updateItem(id, { status });
  }

  assignItem(id: string, assignedTo: string): boolean {
    return this.tracker.updateItem(id, { assignedTo });
  }

  addResolution(id: string, resolution: TechnicalDebtResolution): boolean {
    return this.tracker.updateItem(id, { resolution });
  }

  getRecommendations(): TechnicalDebtRecommendation[] {
    const _report = this.tracker.generateReport();
    return report.recommendations;
  }

  calculateTechnicalDebtRatio(): number {
    const _items = this.tracker.getAllItems();
    return this.evaluator.calculateTechnicalDebtRatio(items);
  }

  getInitializationStatus(): boolean {
    return this.isInitialized;
  }
}
