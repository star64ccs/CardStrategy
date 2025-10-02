import { AIServiceManager } from '../AIServiceManager';

export interface VersionAnalysis {
  id: string;
  timestamp: Date;
  componentId: string;
  analysisType:
    | 'version'
    | 'update'
    | 'compatibility'
    | 'migration'
    | 'rollback';
  score: number;
  issues: VersionIssue[];
  recommendations: VersionRecommendation[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedEffort: number;
  cost: number;
}

export interface VersionIssue {
  id: string;
  type: 'version' | 'update' | 'compatibility' | 'migration';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  impact: string;
  suggestedFix: string;
  estimatedCost: number;
  estimatedTime: number;
}

export interface VersionRecommendation {
  id: string;
  type: 'update' | 'migrate' | 'rollback' | 'test';
  title: string;
  description: string;
  benefits: string[];
  implementation: string;
  estimatedCost: number;
  estimatedTime: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dependencies: string[];
}

export interface VersionInfo {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  updateType: 'patch' | 'minor' | 'major';
  releaseNotes: string;
  compatibility: CompatibilityInfo;
  securityUpdates: SecurityUpdate[];
}

export interface CompatibilityInfo {
  compatible: boolean;
  breakingChanges: string[];
  migrationSteps: string[];
  dependencies: string[];
  requirements: string[];
}

export interface SecurityUpdate {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  cveId?: string;
  affectedVersions: string[];
  fixVersion: string;
}

export interface UpdatePlan {
  id: string;
  targetVersion: string;
  updateSteps: UpdateStep[];
  rollbackPlan: RollbackStep[];
  estimatedDuration: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  prerequisites: string[];
}

export interface UpdateStep {
  id: string;
  order: number;
  description: string;
  action: string;
  expectedDuration: number;
  rollbackAction?: string;
}

export interface RollbackStep {
  id: string;
  order: number;
  description: string;
  action: string;
  expectedDuration: number;
}

export interface VersionWorkerConfig {
  enabled: boolean;
  schedule: string;
  monitoring: {
    enableVersionMonitoring: boolean;
    enableUpdateChecking: boolean;
    enableCompatibilityChecking: boolean;
    checkInterval: number;
  };
  updates: {
    enableAutoUpdates: boolean;
    enableSecurityUpdates: boolean;
    enableFeatureUpdates: boolean;
    updateWindow: string;
    requireApproval: boolean;
  };
  testing: {
    enablePreUpdateTesting: boolean;
    enablePostUpdateTesting: boolean;
    testEnvironment: string;
    testTimeout: number;
  };
  rollback: {
    enableAutoRollback: boolean;
    rollbackThreshold: number;
    rollbackTimeout: number;
  };
}

export class VersionWorker {
  private readonly aiServiceManager: AIServiceManager;
  private config: VersionWorkerConfig;
  private readonly analysisHistory: VersionAnalysis[] = [];
  private readonly versionInfo: Map<string, VersionInfo> = new Map();
  private readonly updatePlans: Map<string, UpdatePlan> = new Map();

  constructor(config: VersionWorkerConfig) {
    this.config = config;
    this.aiServiceManager = AIServiceManager.getInstance();
  }

  /**
   * AnalysisVersion狀況
   */
  async analyzeVersion(componentId: string): Promise<VersionAnalysis> {
    try {
      const _prompt = `分析組件 "${componentId}" 的版本狀況：
1. 當前版本評估
2. 最新版本檢查
3. 版本差異分析
4. 更新必要性評估
5. 版本穩定性分析

請提供詳細的版本分析報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'normal',
      });

      const analysis: VersionAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        componentId,
        analysisType: 'version',
        score: this.calculateVersionScore(response.content),
        issues: this.extractVersionIssues(response.content),
        recommendations: this.extractVersionRecommendations(response.content),
        impact: this.calculateVersionImpact(response.content),
        priority: this.calculateVersionPriority(response.content),
        estimatedEffort: this.estimateVersionEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('版本分析Failed:', error);
      throw new Error(`版本分析Failed: ${error}`);
    }
  }

  /**
   * CheckUpdate可用性
   */
  async checkForUpdates(componentId: string): Promise<VersionAnalysis> {
    try {
      const _prompt = `檢查組件 "${componentId}" 的更新可用性：
1. 可用更新檢查
2. 更新類型分析
3. 更新內容評估
4. 更新優先級分析
5. 更新風險評估

請提供詳細的更新檢查報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'normal',
      });

      const analysis: VersionAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        componentId,
        analysisType: 'update',
        score: this.calculateUpdateScore(response.content),
        issues: this.extractUpdateIssues(response.content),
        recommendations: this.extractUpdateRecommendations(response.content),
        impact: this.calculateUpdateImpact(response.content),
        priority: this.calculateUpdatePriority(response.content),
        estimatedEffort: this.estimateUpdateEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('UpdateCheckFailed:', error);
      throw new Error(`UpdateCheckFailed: ${error}`);
    }
  }

  /**
   * Check兼容性
   */
  async checkCompatibility(
    componentId: string,
    targetVersion: string
  ): Promise<VersionAnalysis> {
    try {
      const _prompt = `檢查組件 "${componentId}" 與版本 "${targetVersion}" 的兼容性：
1. 兼容性評估
2. 破壞性變更檢查
3. 依賴關係分析
4. 遷移步驟規劃
5. 風險評估

請提供詳細的兼容性檢查報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'high',
      });

      const analysis: VersionAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        componentId,
        analysisType: 'compatibility',
        score: this.calculateCompatibilityScore(response.content),
        issues: this.extractCompatibilityIssues(response.content),
        recommendations: this.extractCompatibilityRecommendations(
          response.content
        ),
        impact: this.calculateCompatibilityImpact(response.content),
        priority: this.calculateCompatibilityPriority(response.content),
        estimatedEffort: this.estimateCompatibilityEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('兼容性CheckFailed:', error);
      throw new Error(`兼容性CheckFailed: ${error}`);
    }
  }

  /**
   * 生成遷移計劃
   */
  async generateMigrationPlan(
    componentId: string,
    targetVersion: string
  ): Promise<UpdatePlan> {
    try {
      const _prompt = `為組件 "${componentId}" 生成到版本 "${targetVersion}" 的遷移計劃：
1. 遷移步驟規劃
2. 風險評估
3. 回滾計劃制定
4. 時間估算
5. 前置條件檢查

請提供詳細的遷移計劃。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'high',
      });

      const updatePlan: UpdatePlan = {
        id: this.generateId(),
        targetVersion,
        updateSteps: this.extractUpdateSteps(response.content),
        rollbackPlan: this.extractRollbackSteps(response.content),
        estimatedDuration: this.estimateMigrationDuration(response.content),
        riskLevel: this.calculateMigrationRisk(response.content),
        prerequisites: this.extractPrerequisites(response.content),
      };

      this.updatePlans.set(componentId, updatePlan);
      return updatePlan;
    } catch (error) {
      console.error('遷移計劃生成Failed:', error);
      throw new Error(`遷移計劃生成Failed: ${error}`);
    }
  }

  /**
   * 評估回滾需求
   */
  async assessRollbackNeed(componentId: string): Promise<VersionAnalysis> {
    try {
      const _prompt = `評估組件 "${componentId}" 是否需要回滾：
1. 當前問題分析
2. 回滾必要性評估
3. 回滾風險分析
4. 回滾目標版本選擇
5. 回滾計劃制定

請提供詳細的回滾評估報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'high',
      });

      const analysis: VersionAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        componentId,
        analysisType: 'rollback',
        score: this.calculateRollbackScore(response.content),
        issues: this.extractRollbackIssues(response.content),
        recommendations: this.extractRollbackRecommendations(response.content),
        impact: this.calculateRollbackImpact(response.content),
        priority: this.calculateRollbackPriority(response.content),
        estimatedEffort: this.estimateRollbackEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('回滾評估Failed:', error);
      throw new Error(`回滾評估Failed: ${error}`);
    }
  }

  /**
   * 生成Version建議
   */
  async generateVersionRecommendations(
    componentId: string
  ): Promise<VersionRecommendation[]> {
    try {
      const _prompt = `為組件 "${componentId}" 生成版本管理建議：
1. 版本更新建議
2. 版本穩定性建議
3. 版本測試建議
4. 版本部署建議
5. 版本監控建議

請提供詳細的版本管理建議。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'normal',
      });

      return this.extractVersionRecommendations(response.content);
    } catch (error) {
      console.error('版本建議生成Failed:', error);
      throw new Error(`版本建議生成Failed: ${error}`);
    }
  }

  /**
   * MonitorVersion健康度
   */
  async monitorVersionHealth(componentId: string): Promise<{
    overallHealth: number;
    outdatedComponents: number;
    criticalUpdates: number;
    recommendations: VersionRecommendation[];
  }> {
    try {
      const _recentAnalyses = this.analysisHistory.filter(
        analysis =>
          analysis.componentId === componentId &&
          new Date().getTime() - analysis.timestamp.getTime() <
            24 * 60 * 60 * 1000
      );

      const _outdatedComponents = recentAnalyses
        .filter(analysis => analysis.analysisType === 'version')
        .filter(analysis => analysis.score < 70);

      const _criticalUpdates = recentAnalyses
        .filter(analysis => analysis.analysisType === 'update')
        .flatMap(analysis => analysis.issues)
        .filter(issue => issue.severity === 'critical');

      const _overallHealth = this.calculateOverallHealth(recentAnalyses);
      const _recommendations =
        this.generateHealthRecommendations(recentAnalyses);

      return {
        overallHealth,
        outdatedComponents: outdatedComponents.length,
        criticalUpdates: criticalUpdates.length,
        recommendations,
      };
    } catch (error) {
      console.error('版本健康度監控Failed:', error);
      throw new Error(`版本健康度監控Failed: ${error}`);
    }
  }

  /**
   * GetVersionInformation
   */
  getVersionInfo(componentId: string): VersionInfo | undefined {
    return this.versionInfo.get(componentId);
  }

  /**
   * SettingsVersionInformation
   */
  setVersionInfo(componentId: string, versionInfo: VersionInfo): void {
    this.versionInfo.set(componentId, versionInfo);
  }

  /**
   * GetUpdate計劃
   */
  getUpdatePlan(componentId: string): UpdatePlan | undefined {
    return this.updatePlans.get(componentId);
  }

  /**
   * GetAnalysis歷史
   */
  getAnalysisHistory(
    componentId?: string,
    analysisType?: string
  ): VersionAnalysis[] {
    let filtered = this.analysisHistory;

    if (componentId) {
      filtered = filtered.filter(
        analysis => analysis.componentId === componentId
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
  updateConfig(newConfig: Partial<VersionWorkerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * GetConfigure
   */
  getConfig(): VersionWorkerConfig {
    return { ...this.config };
  }

  // Private輔助Method
  private generateId(): string {
    return `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Version相OffMethod
  private calculateVersionScore(content: string): number {
    const _positiveIndicators = ['最新', '穩定', '良好', '正常'];
    const _negativeIndicators = ['過時', '不穩定', '問題', '舊版本'];

    let score = 70;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 10;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractVersionIssues(content: string): VersionIssue[] {
    const issues: VersionIssue[] = [];

    if (content.includes('過時') || content.includes('outdated')) {
      issues.push({
        id: this.generateId(),
        type: 'version',
        severity: 'medium',
        description: '版本過時',
        location: '組件',
        impact: '功能限制',
        suggestedFix: '更新到最新版本',
        estimatedCost: 1000,
        estimatedTime: 4,
      });
    }

    return issues;
  }

  private extractVersionRecommendations(
    content: string
  ): VersionRecommendation[] {
    const recommendations: VersionRecommendation[] = [];

    if (content.includes('更新') || content.includes('update')) {
      recommendations.push({
        id: this.generateId(),
        type: 'update',
        title: '版本更新建議',
        description: '基於AI分析的版本更新建議',
        benefits: ['獲得新功能', '修復問題'],
        implementation: '執行版本更新',
        estimatedCost: 1500,
        estimatedTime: 8,
        priority: 'medium',
        dependencies: [],
      });
    }

    return recommendations;
  }

  private calculateVersionImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('嚴重問題') || content.includes('critical'))
      return 'critical';
    if (content.includes('版本問題') || content.includes('high')) return 'high';
    if (content.includes('輕微問題') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculateVersionPriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急更新') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimateVersionEffort(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 100);
  }

  // Update相OffMethod
  private calculateUpdateScore(content: string): number {
    const _positiveIndicators = ['可用', '安全', '穩定', '推薦'];
    const _negativeIndicators = ['不可用', '危險', '不穩定', '不推薦'];

    let score = 75;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 15;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractUpdateIssues(content: string): VersionIssue[] {
    const issues: VersionIssue[] = [];

    if (content.includes('更新問題') || content.includes('update issue')) {
      issues.push({
        id: this.generateId(),
        type: 'update',
        severity: 'medium',
        description: '更新過程中發現問題',
        location: '組件',
        impact: 'UpdateFailed',
        suggestedFix: '解決更新問題',
        estimatedCost: 1200,
        estimatedTime: 6,
      });
    }

    return issues;
  }

  private extractUpdateRecommendations(
    content: string
  ): VersionRecommendation[] {
    const recommendations: VersionRecommendation[] = [];

    if (content.includes('更新')) {
      recommendations.push({
        id: this.generateId(),
        type: 'update',
        title: '更新執行建議',
        description: '基於AI分析的更新執行建議',
        benefits: ['獲得更新', '提升功能'],
        implementation: '執行更新操作',
        estimatedCost: 1800,
        estimatedTime: 10,
        priority: 'medium',
        dependencies: [],
      });
    }

    return recommendations;
  }

  private calculateUpdateImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('重大更新') || content.includes('critical'))
      return 'critical';
    if (content.includes('重要更新') || content.includes('high')) return 'high';
    if (content.includes('一般更新') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculateUpdatePriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急更新') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimateUpdateEffort(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 90);
  }

  // 兼容性相OffMethod
  private calculateCompatibilityScore(content: string): number {
    const _positiveIndicators = ['兼容', '支持', '正常', '良好'];
    const _negativeIndicators = ['不兼容', '不支持', '問題', 'Error'];

    let score = 70;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 15;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractCompatibilityIssues(content: string): VersionIssue[] {
    const issues: VersionIssue[] = [];

    if (content.includes('不兼容') || content.includes('incompatible')) {
      issues.push({
        id: this.generateId(),
        type: 'compatibility',
        severity: 'high',
        description: '版本不兼容',
        location: '組件',
        impact: '功能異常',
        suggestedFix: '解決兼容性問題',
        estimatedCost: 2000,
        estimatedTime: 12,
      });
    }

    return issues;
  }

  private extractCompatibilityRecommendations(
    content: string
  ): VersionRecommendation[] {
    const recommendations: VersionRecommendation[] = [];

    if (content.includes('兼容性')) {
      recommendations.push({
        id: this.generateId(),
        type: 'migrate',
        title: '兼容性解決建議',
        description: '基於AI分析的兼容性解決建議',
        benefits: ['解決兼容性', '確保功能'],
        implementation: '實施兼容性解決方案',
        estimatedCost: 2500,
        estimatedTime: 16,
        priority: 'high',
        dependencies: [],
      });
    }

    return recommendations;
  }

  private calculateCompatibilityImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('嚴重不兼容') || content.includes('critical'))
      return 'critical';
    if (content.includes('不兼容') || content.includes('high')) return 'high';
    if (content.includes('部分兼容') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculateCompatibilityPriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急修復') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimateCompatibilityEffort(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 80);
  }

  // 回滾相OffMethod
  private calculateRollbackScore(content: string): number {
    const _positiveIndicators = ['不需要', '正常', '穩定', '良好'];
    const _negativeIndicators = ['需要', '問題', '不穩定', 'Error'];

    let score = 80;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 15;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractRollbackIssues(content: string): VersionIssue[] {
    const issues: VersionIssue[] = [];

    if (content.includes('需要回滾') || content.includes('rollback needed')) {
      issues.push({
        id: this.generateId(),
        type: 'migration',
        severity: 'high',
        description: '需要執行回滾操作',
        location: '組件',
        impact: '功能異常',
        suggestedFix: '執行回滾操作',
        estimatedCost: 1500,
        estimatedTime: 8,
      });
    }

    return issues;
  }

  private extractRollbackRecommendations(
    content: string
  ): VersionRecommendation[] {
    const recommendations: VersionRecommendation[] = [];

    if (content.includes('回滾')) {
      recommendations.push({
        id: this.generateId(),
        type: 'rollback',
        title: '回滾操作建議',
        description: '基於AI分析的回滾操作建議',
        benefits: ['恢復功能', '解決問題'],
        implementation: '執行回滾操作',
        estimatedCost: 1800,
        estimatedTime: 10,
        priority: 'high',
        dependencies: [],
      });
    }

    return recommendations;
  }

  private calculateRollbackImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('緊急回滾') || content.includes('critical'))
      return 'critical';
    if (content.includes('重要回滾') || content.includes('high')) return 'high';
    if (content.includes('一般回滾') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculateRollbackPriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急回滾') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimateRollbackEffort(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 85);
  }

  private extractUpdateSteps(content: string): UpdateStep[] {
    const steps: UpdateStep[] = [];

    // 基於Content生成Update步驟
    steps.push({
      id: this.generateId(),
      order: 1,
      description: '備份當前版本',
      action: 'backup',
      expectedDuration: 30,
    });

    steps.push({
      id: this.generateId(),
      order: 2,
      description: '執行版本更新',
      action: 'update',
      expectedDuration: 60,
      rollbackAction: 'restore_backup',
    });

    steps.push({
      id: this.generateId(),
      order: 3,
      description: '驗證更新結果',
      action: 'verify',
      expectedDuration: 30,
    });

    return steps;
  }

  private extractRollbackSteps(content: string): RollbackStep[] {
    const steps: RollbackStep[] = [];

    steps.push({
      id: this.generateId(),
      order: 1,
      description: '停止當前版本',
      action: 'stop',
      expectedDuration: 15,
    });

    steps.push({
      id: this.generateId(),
      order: 2,
      description: '恢復備份版本',
      action: 'restore',
      expectedDuration: 45,
    });

    steps.push({
      id: this.generateId(),
      order: 3,
      description: '驗證回滾結果',
      action: 'verify',
      expectedDuration: 30,
    });

    return steps;
  }

  private estimateMigrationDuration(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 50); // 每50字符約1Minute
  }

  private calculateMigrationRisk(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('高風險') || content.includes('critical'))
      return 'critical';
    if (content.includes('中等風險') || content.includes('high')) return 'high';
    if (content.includes('低風險') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private extractPrerequisites(content: string): string[] {
    const prerequisites: string[] = [];

    if (content.includes('備份')) prerequisites.push('備份當前數據');
    if (content.includes('測試')) prerequisites.push('在測試環境驗證');
    if (content.includes('依賴')) prerequisites.push('檢查依賴關係');

    return prerequisites;
  }

  private calculateOverallHealth(analyses: VersionAnalysis[]): number {
    if (analyses.length === 0) return 100;

    const _totalScore = analyses.reduce(
      (sum, analysis) => sum + analysis.score,
      0
    );
    return Math.round(totalScore / analyses.length);
  }

  private generateHealthRecommendations(
    analyses: VersionAnalysis[]
  ): VersionRecommendation[] {
    const recommendations: VersionRecommendation[] = [];

    const _criticalIssues = analyses
      .flatMap(analysis => analysis.issues)
      .filter(issue => issue.severity === 'critical');

    if (criticalIssues.length > 0) {
      recommendations.push({
        id: this.generateId(),
        type: 'update',
        title: '緊急版本修復建議',
        description: `發現 ${criticalIssues.length} 個嚴重版本問題需要緊急修復`,
        benefits: ['解決嚴重問題', '提升版本穩定性'],
        implementation: '優先修復嚴重版本問題',
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
