import { AIServiceManager } from '../AIServiceManager';

export interface ArchitectureAnalysis {
  id: string;
  timestamp: Date;
  componentName: string;
  analysisType:
    | 'performance'
    | 'security'
    | 'scalability'
    | 'maintainability'
    | 'compliance';
  score: number;
  issues: ArchitectureIssue[];
  recommendations: ArchitectureRecommendation[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedEffort: number; // hours
  cost: number;
}

export interface ArchitectureIssue {
  id: string;
  type:
    | 'performance'
    | 'security'
    | 'scalability'
    | 'maintainability'
    | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  impact: string;
  suggestedFix: string;
  estimatedCost: number;
  estimatedTime: number;
}

export interface ArchitectureRecommendation {
  id: string;
  type: 'refactor' | 'optimize' | 'secure' | 'scale' | 'comply';
  title: string;
  description: string;
  benefits: string[];
  implementation: string;
  estimatedCost: number;
  estimatedTime: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dependencies: string[];
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  errorRate: number;
  availability: number;
}

export interface SecurityAssessment {
  vulnerabilities: SecurityVulnerability[];
  complianceStatus: ComplianceStatus;
  riskScore: number;
  recommendations: SecurityRecommendation[];
}

export interface SecurityVulnerability {
  id: string;
  type: 'authentication' | 'authorization' | 'data' | 'network' | 'code';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  cveId?: string;
  fix: string;
  estimatedCost: number;
}

export interface ComplianceStatus {
  gdpr: boolean;
  ccpa: boolean;
  hipaa: boolean;
  sox: boolean;
  pci: boolean;
  issues: ComplianceIssue[];
}

export interface ComplianceIssue {
  regulation: string;
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'partial';
  description: string;
  fix: string;
}

export interface SecurityRecommendation {
  id: string;
  type:
    | 'authentication'
    | 'authorization'
    | 'encryption'
    | 'monitoring'
    | 'training';
  title: string;
  description: string;
  implementation: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCost: number;
}

export interface ScalabilityAnalysis {
  currentCapacity: number;
  projectedGrowth: number;
  bottlenecks: ScalabilityBottleneck[];
  recommendations: ScalabilityRecommendation[];
  estimatedCost: number;
}

export interface ScalabilityBottleneck {
  component: string;
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'database';
  currentUsage: number;
  maxCapacity: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  solution: string;
}

export interface ScalabilityRecommendation {
  id: string;
  type: 'horizontal' | 'vertical' | 'caching' | 'optimization';
  title: string;
  description: string;
  implementation: string;
  estimatedCost: number;
  expectedImprovement: number;
}

export interface ArchitectureWorkerConfig {
  enabled: boolean;
  schedule: string;
  analysis: {
    enablePerformanceAnalysis: boolean;
    enableSecurityAssessment: boolean;
    enableScalabilityAnalysis: boolean;
    enableMaintainabilityAnalysis: boolean;
    enableComplianceCheck: boolean;
    analysisInterval: number;
  };
  monitoring: {
    enableRealTimeMonitoring: boolean;
    performanceThresholds: {
      responseTime: number;
      errorRate: number;
      resourceUsage: number;
    };
    alertChannels: string[];
  };
  optimization: {
    enableAutoOptimization: boolean;
    enableCostOptimization: boolean;
    optimizationThreshold: number;
  };
  reporting: {
    enableDetailedReports: boolean;
    reportFormat: 'json' | 'pdf' | 'html';
    retentionPeriod: number;
  };
}

export class ArchitectureWorker {
  private readonly aiServiceManager: AIServiceManager;
  private config: ArchitectureWorkerConfig;
  private readonly analysisHistory: ArchitectureAnalysis[] = [];
  private readonly performanceMetrics: Map<string, PerformanceMetrics> =
    new Map();
  private readonly securityAssessments: Map<string, SecurityAssessment> =
    new Map();

  constructor(config: ArchitectureWorkerConfig) {
    this.config = config;
    this.aiServiceManager = AIServiceManager.getInstance();
  }

  /**
   * Analysis架構Component的性能
   */
  async analyzePerformance(
    componentName: string
  ): Promise<ArchitectureAnalysis> {
    try {
      const _prompt = `分析組件 "${componentName}" 的性能問題：
1. 響應時間分析
2. 資源使用情況
3. 吞吐量評估
4. 錯誤率分析
5. 可用性評估

請提供詳細的性能分析報告，包括問題識別和優化建議。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'high',
      });

      const analysis: ArchitectureAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        componentName,
        analysisType: 'performance',
        score: this.calculatePerformanceScore(response.content),
        issues: this.extractPerformanceIssues(response.content),
        recommendations: this.extractRecommendations(response.content),
        impact: this.calculateImpact(response.content),
        priority: this.calculatePriority(response.content),
        estimatedEffort: this.estimateEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('性能分析Failed:', error);
      throw new Error(`性能分析Failed: ${error}`);
    }
  }

  /**
   * 進Row安全評估
   */
  async assessSecurity(componentName: string): Promise<ArchitectureAnalysis> {
    try {
      const _prompt = `對組件 "${componentName}" 進行安全評估：
1. 身份驗證和授權
2. 數據保護和加密
3. 網絡安全
4. 代碼安全
5. 合規性檢查

請提供詳細的安全評估報告，包括漏洞識別和安全建議。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'high',
      });

      const analysis: ArchitectureAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        componentName,
        analysisType: 'security',
        score: this.calculateSecurityScore(response.content),
        issues: this.extractSecurityIssues(response.content),
        recommendations: this.extractSecurityRecommendations(response.content),
        impact: this.calculateSecurityImpact(response.content),
        priority: this.calculateSecurityPriority(response.content),
        estimatedEffort: this.estimateSecurityEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('安全評估Failed:', error);
      throw new Error(`安全評估Failed: ${error}`);
    }
  }

  /**
   * Analysis可Extension性
   */
  async analyzeScalability(
    componentName: string
  ): Promise<ArchitectureAnalysis> {
    try {
      const _prompt = `分析組件 "${componentName}" 的可擴展性：
1. 當前容量評估
2. 預期增長分析
3. 瓶頸識別
4. 擴展策略建議
5. 成本效益分析

請提供詳細的可擴展性分析報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'normal',
      });

      const analysis: ArchitectureAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        componentName,
        analysisType: 'scalability',
        score: this.calculateScalabilityScore(response.content),
        issues: this.extractScalabilityIssues(response.content),
        recommendations: this.extractScalabilityRecommendations(
          response.content
        ),
        impact: this.calculateScalabilityImpact(response.content),
        priority: this.calculateScalabilityPriority(response.content),
        estimatedEffort: this.estimateScalabilityEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('可擴展性分析Failed:', error);
      throw new Error(`可擴展性分析Failed: ${error}`);
    }
  }

  /**
   * Analysis可維護性
   */
  async analyzeMaintainability(
    componentName: string
  ): Promise<ArchitectureAnalysis> {
    try {
      const _prompt = `分析組件 "${componentName}" 的可維護性：
1. 代碼複雜度評估
2. 模組化程度分析
3. 文檔完整性檢查
4. 測試覆蓋率評估
5. 技術債務分析

請提供詳細的可維護性分析報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'normal',
      });

      const analysis: ArchitectureAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        componentName,
        analysisType: 'maintainability',
        score: this.calculateMaintainabilityScore(response.content),
        issues: this.extractMaintainabilityIssues(response.content),
        recommendations: this.extractMaintainabilityRecommendations(
          response.content
        ),
        impact: this.calculateMaintainabilityImpact(response.content),
        priority: this.calculateMaintainabilityPriority(response.content),
        estimatedEffort: this.estimateMaintainabilityEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('可維護性分析Failed:', error);
      throw new Error(`可維護性分析Failed: ${error}`);
    }
  }

  /**
   * Check合規性
   */
  async checkCompliance(componentName: string): Promise<ArchitectureAnalysis> {
    try {
      const _prompt = `檢查組件 "${componentName}" 的合規性：
1. GDPR 合規性檢查
2. CCPA 合規性檢查
3. HIPAA 合規性檢查
4. SOX 合規性檢查
5. PCI DSS 合規性檢查

請提供詳細的合規性檢查報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'high',
      });

      const analysis: ArchitectureAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        componentName,
        analysisType: 'compliance',
        score: this.calculateComplianceScore(response.content),
        issues: this.extractComplianceIssues(response.content),
        recommendations: this.extractComplianceRecommendations(
          response.content
        ),
        impact: this.calculateComplianceImpact(response.content),
        priority: this.calculateCompliancePriority(response.content),
        estimatedEffort: this.estimateComplianceEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('合規性CheckFailed:', error);
      throw new Error(`合規性CheckFailed: ${error}`);
    }
  }

  /**
   * 生成架構優化建議
   */
  async generateOptimizationPlan(
    componentName: string
  ): Promise<ArchitectureRecommendation[]> {
    try {
      const _prompt = `為組件 "${componentName}" 生成架構優化計劃：
1. 性能優化建議
2. 安全加固建議
3. 可擴展性改進建議
4. 可維護性提升建議
5. 成本優化建議

請提供詳細的優化計劃和實施步驟。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'normal',
      });

      return this.extractOptimizationRecommendations(response.content);
    } catch (error) {
      console.error('優化計劃生成Failed:', error);
      throw new Error(`優化計劃生成Failed: ${error}`);
    }
  }

  /**
   * Monitor架構健康度
   */
  async monitorArchitectureHealth(): Promise<{
    overallHealth: number;
    criticalIssues: number;
    recommendations: ArchitectureRecommendation[];
  }> {
    try {
      const _recentAnalyses = this.analysisHistory.filter(
        analysis =>
          new Date().getTime() - analysis.timestamp.getTime() <
          24 * 60 * 60 * 1000
      );

      const _criticalIssues = recentAnalyses
        .flatMap(analysis => analysis.issues)
        .filter(
          issue => issue.severity === 'critical' || issue.severity === 'high'
        );

      const _overallHealth = this.calculateOverallHealth(recentAnalyses);
      const _recommendations =
        this.generateHealthRecommendations(recentAnalyses);

      return {
        overallHealth,
        criticalIssues: criticalIssues.length,
        recommendations,
      };
    } catch (error) {
      console.error('架構健康度監控Failed:', error);
      throw new Error(`架構健康度監控Failed: ${error}`);
    }
  }

  /**
   * GetAnalysis歷史
   */
  getAnalysisHistory(
    componentName?: string,
    analysisType?: string
  ): ArchitectureAnalysis[] {
    let filtered = this.analysisHistory;

    if (componentName) {
      filtered = filtered.filter(
        analysis => analysis.componentName === componentName
      );
    }

    if (analysisType) {
      filtered = filtered.filter(
        analysis => analysis.analysisType === analysisType
      );
    }

    return filtered.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * UpdateConfigure
   */
  updateConfig(newConfig: Partial<ArchitectureWorkerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * GetConfigure
   */
  getConfig(): ArchitectureWorkerConfig {
    return { ...this.config };
  }

  // Private輔助Method
  private generateId(): string {
    return `arch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculatePerformanceScore(content: string): number {
    // 基於AIResponseContent計算性能分數
    const _positiveIndicators = ['良好', '優秀', '優化', '高效', '快速'];
    const _negativeIndicators = ['慢', '延遲', '瓶頸', '問題', 'Error'];

    let score = 70; // 基礎分數

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 10;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractPerformanceIssues(content: string): ArchitectureIssue[] {
    // 從AIResponse中提取性能問題
    const issues: ArchitectureIssue[] = [];

    if (content.includes('響應時間')) {
      issues.push({
        id: this.generateId(),
        type: 'performance',
        severity: 'medium',
        description: '響應時間需要優化',
        location: '系統組件',
        impact: '用戶體驗下降',
        suggestedFix: '優化算法和緩存策略',
        estimatedCost: 1000,
        estimatedTime: 8,
      });
    }

    return issues;
  }

  private extractRecommendations(
    content: string
  ): ArchitectureRecommendation[] {
    // 從AIResponse中提取建議
    const recommendations: ArchitectureRecommendation[] = [];

    if (content.includes('優化')) {
      recommendations.push({
        id: this.generateId(),
        type: 'optimize',
        title: '性能優化建議',
        description: '基於AI分析的性能優化建議',
        benefits: ['提升響應速度', '改善用戶體驗'],
        implementation: '實施緩存策略和算法優化',
        estimatedCost: 2000,
        estimatedTime: 16,
        priority: 'medium',
        dependencies: [],
      });
    }

    return recommendations;
  }

  private calculateImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('嚴重') || content.includes('critical'))
      return 'critical';
    if (content.includes('高') || content.includes('high')) return 'high';
    if (content.includes('中') || content.includes('medium')) return 'medium';
    return 'low';
  }

  private calculatePriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急') || content.includes('urgent')) return 'urgent';
    if (content.includes('高') || content.includes('high')) return 'high';
    if (content.includes('中') || content.includes('medium')) return 'medium';
    return 'low';
  }

  private estimateEffort(content: string): number {
    // 基於Content複雜度估算工作量
    const _wordCount = content.length;
    return Math.ceil(wordCount / 100); // 每100字符約1Hour
  }

  // 安全相OffMethod
  private calculateSecurityScore(content: string): number {
    const _positiveIndicators = ['安全', '加密', '保護', '合規'];
    const _negativeIndicators = ['漏洞', '風險', '不安全', '違規'];

    let score = 75;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 15;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractSecurityIssues(content: string): ArchitectureIssue[] {
    const issues: ArchitectureIssue[] = [];

    if (content.includes('漏洞') || content.includes('vulnerability')) {
      issues.push({
        id: this.generateId(),
        type: 'security',
        severity: 'high',
        description: '發現安全漏洞',
        location: '系統組件',
        impact: '安全風險',
        suggestedFix: '修復安全漏洞',
        estimatedCost: 1500,
        estimatedTime: 12,
      });
    }

    return issues;
  }

  private extractSecurityRecommendations(
    content: string
  ): ArchitectureRecommendation[] {
    const recommendations: ArchitectureRecommendation[] = [];

    if (content.includes('安全')) {
      recommendations.push({
        id: this.generateId(),
        type: 'secure',
        title: '安全加固建議',
        description: '基於AI分析的安全加固建議',
        benefits: ['提升安全性', '降低風險'],
        implementation: '實施安全最佳實踐',
        estimatedCost: 2500,
        estimatedTime: 20,
        priority: 'high',
        dependencies: [],
      });
    }

    return recommendations;
  }

  private calculateSecurityImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('嚴重漏洞') || content.includes('critical'))
      return 'critical';
    if (content.includes('高風險') || content.includes('high')) return 'high';
    if (content.includes('中等風險') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculateSecurityPriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急修復') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimateSecurityEffort(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 80); // 安全修復通常需要更多Time
  }

  // 可Extension性相OffMethod
  private calculateScalabilityScore(content: string): number {
    const _positiveIndicators = ['可擴展', '彈性', '擴展性', '容量'];
    const _negativeIndicators = ['瓶頸', '限制', '不可擴展'];

    let score = 70;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 10;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractScalabilityIssues(content: string): ArchitectureIssue[] {
    const issues: ArchitectureIssue[] = [];

    if (content.includes('瓶頸') || content.includes('bottleneck')) {
      issues.push({
        id: this.generateId(),
        type: 'scalability',
        severity: 'medium',
        description: '發現擴展瓶頸',
        location: '系統組件',
        impact: '限制系統擴展',
        suggestedFix: '優化架構設計',
        estimatedCost: 3000,
        estimatedTime: 24,
      });
    }

    return issues;
  }

  private extractScalabilityRecommendations(
    content: string
  ): ArchitectureRecommendation[] {
    const recommendations: ArchitectureRecommendation[] = [];

    if (content.includes('擴展')) {
      recommendations.push({
        id: this.generateId(),
        type: 'scale',
        title: '可擴展性改進建議',
        description: '基於AI分析的可擴展性改進建議',
        benefits: ['提升擴展能力', '支持更大規模'],
        implementation: '實施水平擴展策略',
        estimatedCost: 4000,
        estimatedTime: 32,
        priority: 'medium',
        dependencies: [],
      });
    }

    return recommendations;
  }

  private calculateScalabilityImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('嚴重瓶頸') || content.includes('critical'))
      return 'critical';
    if (content.includes('擴展限制') || content.includes('high')) return 'high';
    if (content.includes('中等限制') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculateScalabilityPriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急擴展') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimateScalabilityEffort(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 90);
  }

  // 可維護性相OffMethod
  private calculateMaintainabilityScore(content: string): number {
    const _positiveIndicators = ['清晰', '模組化', '文檔', '測試'];
    const _negativeIndicators = ['複雜', '混亂', '缺乏文檔', '技術債務'];

    let score = 70;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 10;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractMaintainabilityIssues(content: string): ArchitectureIssue[] {
    const issues: ArchitectureIssue[] = [];

    if (content.includes('複雜') || content.includes('complex')) {
      issues.push({
        id: this.generateId(),
        type: 'maintainability',
        severity: 'medium',
        description: '代碼複雜度過高',
        location: '系統組件',
        impact: '維護困難',
        suggestedFix: '重構代碼結構',
        estimatedCost: 2000,
        estimatedTime: 16,
      });
    }

    return issues;
  }

  private extractMaintainabilityRecommendations(
    content: string
  ): ArchitectureRecommendation[] {
    const recommendations: ArchitectureRecommendation[] = [];

    if (content.includes('維護')) {
      recommendations.push({
        id: this.generateId(),
        type: 'refactor',
        title: '可維護性改進建議',
        description: '基於AI分析的可維護性改進建議',
        benefits: ['提升可維護性', '降低維護成本'],
        implementation: '重構代碼結構和文檔',
        estimatedCost: 2500,
        estimatedTime: 20,
        priority: 'medium',
        dependencies: [],
      });
    }

    return recommendations;
  }

  private calculateMaintainabilityImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('嚴重複雜') || content.includes('critical'))
      return 'critical';
    if (content.includes('維護困難') || content.includes('high')) return 'high';
    if (content.includes('中等複雜') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculateMaintainabilityPriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急重構') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimateMaintainabilityEffort(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 85);
  }

  // 合規性相OffMethod
  private calculateComplianceScore(content: string): number {
    const _positiveIndicators = ['合規', '符合', '滿足', '達標'];
    const _negativeIndicators = ['不合規', '違規', '不符合', '未達標'];

    let score = 80;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 20;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractComplianceIssues(content: string): ArchitectureIssue[] {
    const issues: ArchitectureIssue[] = [];

    if (content.includes('不合規') || content.includes('non-compliant')) {
      issues.push({
        id: this.generateId(),
        type: 'compliance',
        severity: 'high',
        description: '發現合規性問題',
        location: '系統組件',
        impact: '法律風險',
        suggestedFix: '修復合規性問題',
        estimatedCost: 3000,
        estimatedTime: 24,
      });
    }

    return issues;
  }

  private extractComplianceRecommendations(
    content: string
  ): ArchitectureRecommendation[] {
    const recommendations: ArchitectureRecommendation[] = [];

    if (content.includes('合規')) {
      recommendations.push({
        id: this.generateId(),
        type: 'comply',
        title: '合規性改進建議',
        description: '基於AI分析的合規性改進建議',
        benefits: ['確保合規', '降低法律風險'],
        implementation: '實施合規性措施',
        estimatedCost: 3500,
        estimatedTime: 28,
        priority: 'high',
        dependencies: [],
      });
    }

    return recommendations;
  }

  private calculateComplianceImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('嚴重違規') || content.includes('critical'))
      return 'critical';
    if (content.includes('高風險') || content.includes('high')) return 'high';
    if (content.includes('中等風險') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculateCompliancePriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急修復') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimateComplianceEffort(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 70); // 合規修復通常需要更多Time
  }

  private extractOptimizationRecommendations(
    content: string
  ): ArchitectureRecommendation[] {
    const recommendations: ArchitectureRecommendation[] = [];

    // 提取優化建議
    if (content.includes('優化')) {
      recommendations.push({
        id: this.generateId(),
        type: 'optimize',
        title: '綜合優化建議',
        description: '基於AI分析的綜合優化建議',
        benefits: ['提升整體性能', '改善用戶體驗'],
        implementation: '實施綜合優化策略',
        estimatedCost: 5000,
        estimatedTime: 40,
        priority: 'medium',
        dependencies: [],
      });
    }

    return recommendations;
  }

  private calculateOverallHealth(analyses: ArchitectureAnalysis[]): number {
    if (analyses.length === 0) return 100;

    const _totalScore = analyses.reduce(
      (sum, analysis) => sum + analysis.score,
      0
    );
    return Math.round(totalScore / analyses.length);
  }

  private generateHealthRecommendations(
    analyses: ArchitectureAnalysis[]
  ): ArchitectureRecommendation[] {
    const recommendations: ArchitectureRecommendation[] = [];

    // 基於Analysis結果生成健康度建議
    const _criticalIssues = analyses
      .flatMap(analysis => analysis.issues)
      .filter(issue => issue.severity === 'critical');

    if (criticalIssues.length > 0) {
      recommendations.push({
        id: this.generateId(),
        type: 'refactor',
        title: '緊急修復建議',
        description: `發現 ${criticalIssues.length} 個嚴重問題需要緊急修復`,
        benefits: ['解決嚴重問題', '提升系統穩定性'],
        implementation: '優先修復嚴重問題',
        estimatedCost: criticalIssues.reduce(
          (sum, issue) => sum + issue.estimatedCost,
          0
        ),
        estimatedTime: criticalIssues.reduce(
          (sum, issue) => sum + issue.estimatedTime,
          0
        ),
        priority: 'urgent',
        dependencies: [],
      });
    }

    return recommendations;
  }
}
