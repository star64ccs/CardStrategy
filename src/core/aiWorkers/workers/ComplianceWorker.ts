import { AIServiceManager } from '../AIServiceManager';

export interface ComplianceAnalysis {
  id: string;
  timestamp: Date;
  targetId: string;
  analysisType: 'gdpr' | 'ccpa' | 'hipaa' | 'sox' | 'pci' | 'general';
  score: number;
  issues: ComplianceIssue[];
  recommendations: ComplianceRecommendation[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedEffort: number;
  cost: number;
}

export interface ComplianceIssue {
  id: string;
  type: 'gdpr' | 'ccpa' | 'hipaa' | 'sox' | 'pci' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  impact: string;
  suggestedFix: string;
  estimatedCost: number;
  estimatedTime: number;
  regulation: string;
}

export interface ComplianceRecommendation {
  id: string;
  type: 'implement' | 'configure' | 'document' | 'train';
  title: string;
  description: string;
  benefits: string[];
  implementation: string;
  estimatedCost: number;
  estimatedTime: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dependencies: string[];
  regulation: string;
}

export interface ComplianceStatus {
  gdpr: ComplianceFrameworkStatus;
  ccpa: ComplianceFrameworkStatus;
  hipaa: ComplianceFrameworkStatus;
  sox: ComplianceFrameworkStatus;
  pci: ComplianceFrameworkStatus;
  overall: ComplianceFrameworkStatus;
}

export interface ComplianceFrameworkStatus {
  compliant: boolean;
  score: number;
  issues: ComplianceIssue[];
  lastChecked: Date;
  nextCheck: Date;
}

export interface ComplianceReport {
  id: string;
  timestamp: Date;
  targetId: string;
  status: ComplianceStatus;
  summary: string;
  details: ComplianceAnalysis[];
  recommendations: ComplianceRecommendation[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ComplianceWorkerConfig {
  enabled: boolean;
  schedule: string;
  frameworks: {
    enableGDPR: boolean;
    enableCCPA: boolean;
    enableHIPAA: boolean;
    enableSOX: boolean;
    enablePCI: boolean;
    checkInterval: number;
  };
  monitoring: {
    enableRealTimeMonitoring: boolean;
    enableComplianceAlerts: boolean;
    alertThresholds: {
      complianceScore: number;
      issueCount: number;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
    };
  };
  reporting: {
    enableDetailedReports: boolean;
    reportFormat: 'json' | 'pdf' | 'html';
    retentionPeriod: number;
    autoGenerate: boolean;
  };
  remediation: {
    enableAutoRemediation: boolean;
    enableEscalation: boolean;
    remediationTimeout: number;
  };
}

export class ComplianceWorker {
  private readonly aiServiceManager: AIServiceManager;
  private config: ComplianceWorkerConfig;
  private readonly analysisHistory: ComplianceAnalysis[] = [];
  private readonly complianceStatus: Map<string, ComplianceStatus> = new Map();
  private readonly complianceReports: ComplianceReport[] = [];

  constructor(config: ComplianceWorkerConfig) {
    this.config = config;
    this.aiServiceManager = AIServiceManager.getInstance();
  }

  /**
   * GDPR合規性Check
   */
  async checkGDPRCompliance(targetId: string): Promise<ComplianceAnalysis> {
    try {
      const _prompt = `檢查目標 "${targetId}" 的GDPR合規性：
1. 數據處理合法性檢查
2. 數據主體權利保障
3. 數據保護措施檢查
4. 數據泄露通知機制
5. 數據保護影響評估

請提供詳細的GDPR合規性檢查報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'high',
      });

      const analysis: ComplianceAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        targetId,
        analysisType: 'gdpr',
        score: this.calculateGDPRScore(response.content),
        issues: this.extractGDPRIssues(response.content),
        recommendations: this.extractGDPRRecommendations(response.content),
        impact: this.calculateGDPRImpact(response.content),
        priority: this.calculateGDPRPriority(response.content),
        estimatedEffort: this.estimateGDPREffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('GDPR合規性CheckFailed:', error);
      throw new Error(`GDPR合規性CheckFailed: ${error}`);
    }
  }

  /**
   * CCPA合規性Check
   */
  async checkCCPACompliance(targetId: string): Promise<ComplianceAnalysis> {
    try {
      const _prompt = `檢查目標 "${targetId}" 的CCPA合規性：
1. 消費者權利保障檢查
2. 數據收集透明度檢查
3. 數據銷售選擇權檢查
4. 數據刪除權檢查
5. 非歧視條款檢查

請提供詳細的CCPA合規性檢查報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'high',
      });

      const analysis: ComplianceAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        targetId,
        analysisType: 'ccpa',
        score: this.calculateCCPAScore(response.content),
        issues: this.extractCCPAIssues(response.content),
        recommendations: this.extractCCPARecommendations(response.content),
        impact: this.calculateCCPAImpact(response.content),
        priority: this.calculateCCPAPriority(response.content),
        estimatedEffort: this.estimateCCPAEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('CCPA合規性CheckFailed:', error);
      throw new Error(`CCPA合規性CheckFailed: ${error}`);
    }
  }

  /**
   * HIPAA合規性Check
   */
  async checkHIPAACompliance(targetId: string): Promise<ComplianceAnalysis> {
    try {
      const _prompt = `檢查目標 "${targetId}" 的HIPAA合規性：
1. 隱私規則合規性檢查
2. 安全規則合規性檢查
3. 違規通知規則檢查
4. 業務關聯協議檢查
5. 患者權利保障檢查

請提供詳細的HIPAA合規性檢查報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'high',
      });

      const analysis: ComplianceAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        targetId,
        analysisType: 'hipaa',
        score: this.calculateHIPAAScore(response.content),
        issues: this.extractHIPAAIssues(response.content),
        recommendations: this.extractHIPAARecommendations(response.content),
        impact: this.calculateHIPAAImpact(response.content),
        priority: this.calculateHIPAAPriority(response.content),
        estimatedEffort: this.estimateHIPAAEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('HIPAA合規性CheckFailed:', error);
      throw new Error(`HIPAA合規性CheckFailed: ${error}`);
    }
  }

  /**
   * SOX合規性Check
   */
  async checkSOXCompliance(targetId: string): Promise<ComplianceAnalysis> {
    try {
      const _prompt = `檢查目標 "${targetId}" 的SOX合規性：
1. 財務報告準確性檢查
2. 內部控制評估
3. 審計追蹤檢查
4. 數據完整性檢查
5. 管理責任檢查

請提供詳細的SOX合規性檢查報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'high',
      });

      const analysis: ComplianceAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        targetId,
        analysisType: 'sox',
        score: this.calculateSOXScore(response.content),
        issues: this.extractSOXIssues(response.content),
        recommendations: this.extractSOXRecommendations(response.content),
        impact: this.calculateSOXImpact(response.content),
        priority: this.calculateSOXPriority(response.content),
        estimatedEffort: this.estimateSOXEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('SOX合規性CheckFailed:', error);
      throw new Error(`SOX合規性CheckFailed: ${error}`);
    }
  }

  /**
   * PCI DSS合規性Check
   */
  async checkPCICompliance(targetId: string): Promise<ComplianceAnalysis> {
    try {
      const _prompt = `檢查目標 "${targetId}" 的PCI DSS合規性：
1. 網絡安全檢查
2. 數據保護檢查
3. 漏洞管理檢查
4. 訪問控制檢查
5. 監控和測試檢查

請提供詳細的PCI DSS合規性檢查報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'high',
      });

      const analysis: ComplianceAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        targetId,
        analysisType: 'pci',
        score: this.calculatePCIScore(response.content),
        issues: this.extractPCIIssues(response.content),
        recommendations: this.extractPCIRecommendations(response.content),
        impact: this.calculatePCIImpact(response.content),
        priority: this.calculatePCIPriority(response.content),
        estimatedEffort: this.estimatePCIEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('PCI DSS合規性CheckFailed:', error);
      throw new Error(`PCI DSS合規性CheckFailed: ${error}`);
    }
  }

  /**
   * 生成綜合合規Report
   */
  async generateComplianceReport(targetId: string): Promise<ComplianceReport> {
    try {
      const _prompt = `為目標 "${targetId}" 生成綜合合規報告：
1. 各框架合規狀況總結
2. 整體合規評分
3. 關鍵問題識別
4. 改進建議
5. 風險評估

請提供詳細的綜合合規報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'normal',
      });

      const _recentAnalyses = this.analysisHistory.filter(
        analysis =>
          analysis.targetId === targetId &&
          new Date().getTime() - analysis.timestamp.getTime() <
            7 * 24 * 60 * 60 * 1000
      );

      const _complianceStatus = this.calculateComplianceStatus(recentAnalyses);
      const _recommendations =
        this.generateComplianceRecommendations(recentAnalyses);

      const report: ComplianceReport = {
        id: this.generateId(),
        timestamp: new Date(),
        targetId,
        status: complianceStatus,
        summary: response.content,
        details: recentAnalyses,
        recommendations,
        riskLevel: this.calculateOverallRiskLevel(recentAnalyses),
      };

      this.complianceReports.push(report);
      return report;
    } catch (error) {
      console.error('合規報告生成Failed:', error);
      throw new Error(`合規報告生成Failed: ${error}`);
    }
  }

  /**
   * Monitor合規Status
   */
  async monitorComplianceStatus(targetId: string): Promise<{
    overallCompliance: number;
    criticalIssues: number;
    frameworks: string[];
    recommendations: ComplianceRecommendation[];
  }> {
    try {
      const _recentAnalyses = this.analysisHistory.filter(
        analysis =>
          analysis.targetId === targetId &&
          new Date().getTime() - analysis.timestamp.getTime() <
            24 * 60 * 60 * 1000
      );

      const _criticalIssues = recentAnalyses
        .flatMap(analysis => analysis.issues)
        .filter(issue => issue.severity === 'critical');

      const _frameworks = [
        ...new Set(recentAnalyses.map(analysis => analysis.analysisType)),
      ];
      const _overallCompliance =
        this.calculateOverallCompliance(recentAnalyses);
      const _recommendations =
        this.generateComplianceRecommendations(recentAnalyses);

      return {
        overallCompliance,
        criticalIssues: criticalIssues.length,
        frameworks,
        recommendations,
      };
    } catch (error) {
      console.error('合規狀態監控Failed:', error);
      throw new Error(`合規狀態監控Failed: ${error}`);
    }
  }

  /**
   * Get合規Status
   */
  getComplianceStatus(targetId: string): ComplianceStatus | undefined {
    return this.complianceStatus.get(targetId);
  }

  /**
   * Settings合規Status
   */
  setComplianceStatus(targetId: string, status: ComplianceStatus): void {
    this.complianceStatus.set(targetId, status);
  }

  /**
   * Get合規Report
   */
  getComplianceReports(targetId?: string): ComplianceReport[] {
    let filtered = this.complianceReports;

    if (targetId) {
      filtered = filtered.filter(report => report.targetId === targetId);
    }

    return filtered.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * GetAnalysis歷史
   */
  getAnalysisHistory(
    targetId?: string,
    analysisType?: string
  ): ComplianceAnalysis[] {
    let filtered = this.analysisHistory;

    if (targetId) {
      filtered = filtered.filter(analysis => analysis.targetId === targetId);
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
  updateConfig(newConfig: Partial<ComplianceWorkerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * GetConfigure
   */
  getConfig(): ComplianceWorkerConfig {
    return { ...this.config };
  }

  // Private輔助Method
  private generateId(): string {
    return `compliance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // GDPR相OffMethod
  private calculateGDPRScore(content: string): number {
    const _positiveIndicators = ['合規', '符合', '滿足', '達標'];
    const _negativeIndicators = ['不合規', '違規', '不符合', '未達標'];

    let score = 75;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 15;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractGDPRIssues(content: string): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];

    if (
      content.includes('GDPR') &&
      (content.includes('不合規') || content.includes('non-compliant'))
    ) {
      issues.push({
        id: this.generateId(),
        type: 'gdpr',
        severity: 'high',
        description: 'GDPR合規性問題',
        location: '系統',
        impact: '法律風險',
        suggestedFix: '修復GDPR合規性問題',
        estimatedCost: 3000,
        estimatedTime: 20,
        regulation: 'GDPR',
      });
    }

    return issues;
  }

  private extractGDPRRecommendations(
    content: string
  ): ComplianceRecommendation[] {
    const recommendations: ComplianceRecommendation[] = [];

    if (content.includes('GDPR')) {
      recommendations.push({
        id: this.generateId(),
        type: 'implement',
        title: 'GDPR合規性改進建議',
        description: '基於AI分析的GDPR合規性改進建議',
        benefits: ['確保GDPR合規', '降低法律風險'],
        implementation: '實施GDPR合規性措施',
        estimatedCost: 3500,
        estimatedTime: 24,
        priority: 'high',
        dependencies: [],
        regulation: 'GDPR',
      });
    }

    return recommendations;
  }

  private calculateGDPRImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('嚴重違規') || content.includes('critical'))
      return 'critical';
    if (content.includes('高風險') || content.includes('high')) return 'high';
    if (content.includes('中等風險') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculateGDPRPriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急修復') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimateGDPREffort(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 70);
  }

  // CCPA相OffMethod
  private calculateCCPAScore(content: string): number {
    const _positiveIndicators = ['合規', '符合', '滿足', '達標'];
    const _negativeIndicators = ['不合規', '違規', '不符合', '未達標'];

    let score = 75;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 15;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractCCPAIssues(content: string): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];

    if (
      content.includes('CCPA') &&
      (content.includes('不合規') || content.includes('non-compliant'))
    ) {
      issues.push({
        id: this.generateId(),
        type: 'ccpa',
        severity: 'high',
        description: 'CCPA合規性問題',
        location: '系統',
        impact: '法律風險',
        suggestedFix: '修復CCPA合規性問題',
        estimatedCost: 2500,
        estimatedTime: 16,
        regulation: 'CCPA',
      });
    }

    return issues;
  }

  private extractCCPARecommendations(
    content: string
  ): ComplianceRecommendation[] {
    const recommendations: ComplianceRecommendation[] = [];

    if (content.includes('CCPA')) {
      recommendations.push({
        id: this.generateId(),
        type: 'implement',
        title: 'CCPA合規性改進建議',
        description: '基於AI分析的CCPA合規性改進建議',
        benefits: ['確保CCPA合規', '降低法律風險'],
        implementation: '實施CCPA合規性措施',
        estimatedCost: 3000,
        estimatedTime: 20,
        priority: 'high',
        dependencies: [],
        regulation: 'CCPA',
      });
    }

    return recommendations;
  }

  private calculateCCPAImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('嚴重違規') || content.includes('critical'))
      return 'critical';
    if (content.includes('高風險') || content.includes('high')) return 'high';
    if (content.includes('中等風險') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculateCCPAPriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急修復') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimateCCPAEffort(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 70);
  }

  // HIPAA相OffMethod
  private calculateHIPAAScore(content: string): number {
    const _positiveIndicators = ['合規', '符合', '滿足', '達標'];
    const _negativeIndicators = ['不合規', '違規', '不符合', '未達標'];

    let score = 75;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 15;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractHIPAAIssues(content: string): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];

    if (
      content.includes('HIPAA') &&
      (content.includes('不合規') || content.includes('non-compliant'))
    ) {
      issues.push({
        id: this.generateId(),
        type: 'hipaa',
        severity: 'high',
        description: 'HIPAA合規性問題',
        location: '系統',
        impact: '法律風險',
        suggestedFix: '修復HIPAA合規性問題',
        estimatedCost: 4000,
        estimatedTime: 28,
        regulation: 'HIPAA',
      });
    }

    return issues;
  }

  private extractHIPAARecommendations(
    content: string
  ): ComplianceRecommendation[] {
    const recommendations: ComplianceRecommendation[] = [];

    if (content.includes('HIPAA')) {
      recommendations.push({
        id: this.generateId(),
        type: 'implement',
        title: 'HIPAA合規性改進建議',
        description: '基於AI分析的HIPAA合規性改進建議',
        benefits: ['確保HIPAA合規', '降低法律風險'],
        implementation: '實施HIPAA合規性措施',
        estimatedCost: 4500,
        estimatedTime: 32,
        priority: 'high',
        dependencies: [],
        regulation: 'HIPAA',
      });
    }

    return recommendations;
  }

  private calculateHIPAAImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('嚴重違規') || content.includes('critical'))
      return 'critical';
    if (content.includes('高風險') || content.includes('high')) return 'high';
    if (content.includes('中等風險') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculateHIPAAPriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急修復') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimateHIPAAEffort(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 65);
  }

  // SOX相OffMethod
  private calculateSOXScore(content: string): number {
    const _positiveIndicators = ['合規', '符合', '滿足', '達標'];
    const _negativeIndicators = ['不合規', '違規', '不符合', '未達標'];

    let score = 75;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 15;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractSOXIssues(content: string): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];

    if (
      content.includes('SOX') &&
      (content.includes('不合規') || content.includes('non-compliant'))
    ) {
      issues.push({
        id: this.generateId(),
        type: 'sox',
        severity: 'high',
        description: 'SOX合規性問題',
        location: '系統',
        impact: '法律風險',
        suggestedFix: '修復SOX合規性問題',
        estimatedCost: 3500,
        estimatedTime: 24,
        regulation: 'SOX',
      });
    }

    return issues;
  }

  private extractSOXRecommendations(
    content: string
  ): ComplianceRecommendation[] {
    const recommendations: ComplianceRecommendation[] = [];

    if (content.includes('SOX')) {
      recommendations.push({
        id: this.generateId(),
        type: 'implement',
        title: 'SOX合規性改進建議',
        description: '基於AI分析的SOX合規性改進建議',
        benefits: ['確保SOX合規', '降低法律風險'],
        implementation: '實施SOX合規性措施',
        estimatedCost: 4000,
        estimatedTime: 28,
        priority: 'high',
        dependencies: [],
        regulation: 'SOX',
      });
    }

    return recommendations;
  }

  private calculateSOXImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('嚴重違規') || content.includes('critical'))
      return 'critical';
    if (content.includes('高風險') || content.includes('high')) return 'high';
    if (content.includes('中等風險') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculateSOXPriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急修復') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimateSOXEffort(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 70);
  }

  // PCI相OffMethod
  private calculatePCIScore(content: string): number {
    const _positiveIndicators = ['合規', '符合', '滿足', '達標'];
    const _negativeIndicators = ['不合規', '違規', '不符合', '未達標'];

    let score = 75;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 15;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractPCIIssues(content: string): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];

    if (
      content.includes('PCI') &&
      (content.includes('不合規') || content.includes('non-compliant'))
    ) {
      issues.push({
        id: this.generateId(),
        type: 'pci',
        severity: 'high',
        description: 'PCI DSS合規性問題',
        location: '系統',
        impact: '安全風險',
        suggestedFix: '修復PCI DSS合規性問題',
        estimatedCost: 3000,
        estimatedTime: 20,
        regulation: 'PCI DSS',
      });
    }

    return issues;
  }

  private extractPCIRecommendations(
    content: string
  ): ComplianceRecommendation[] {
    const recommendations: ComplianceRecommendation[] = [];

    if (content.includes('PCI')) {
      recommendations.push({
        id: this.generateId(),
        type: 'implement',
        title: 'PCI DSS合規性改進建議',
        description: '基於AI分析的PCI DSS合規性改進建議',
        benefits: ['確保PCI DSS合規', '提升安全性'],
        implementation: '實施PCI DSS合規性措施',
        estimatedCost: 3500,
        estimatedTime: 24,
        priority: 'high',
        dependencies: [],
        regulation: 'PCI DSS',
      });
    }

    return recommendations;
  }

  private calculatePCIImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('嚴重違規') || content.includes('critical'))
      return 'critical';
    if (content.includes('高風險') || content.includes('high')) return 'high';
    if (content.includes('中等風險') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculatePCIPriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急修復') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimatePCIEffort(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 70);
  }

  private calculateComplianceStatus(
    analyses: ComplianceAnalysis[]
  ): ComplianceStatus {
    const _gdprAnalyses = analyses.filter(a => a.analysisType === 'gdpr');
    const _ccpaAnalyses = analyses.filter(a => a.analysisType === 'ccpa');
    const _hipaaAnalyses = analyses.filter(a => a.analysisType === 'hipaa');
    const _soxAnalyses = analyses.filter(a => a.analysisType === 'sox');
    const _pciAnalyses = analyses.filter(a => a.analysisType === 'pci');

    return {
      gdpr: this.calculateFrameworkStatus(gdprAnalyses),
      ccpa: this.calculateFrameworkStatus(ccpaAnalyses),
      hipaa: this.calculateFrameworkStatus(hipaaAnalyses),
      sox: this.calculateFrameworkStatus(soxAnalyses),
      pci: this.calculateFrameworkStatus(pciAnalyses),
      overall: this.calculateFrameworkStatus(analyses),
    };
  }

  private calculateFrameworkStatus(
    analyses: ComplianceAnalysis[]
  ): ComplianceFrameworkStatus {
    if (analyses.length === 0) {
      return {
        compliant: true,
        score: 100,
        issues: [],
        lastChecked: new Date(),
        nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天後
      };
    }

    const _averageScore =
      analyses.reduce((sum, analysis) => sum + analysis.score, 0) /
      analyses.length;
    const _allIssues = analyses.flatMap(analysis => analysis.issues);
    const _lastChecked = new Date(
      Math.max(...analyses.map(a => a.timestamp.getTime()))
    );

    return {
      compliant: averageScore >= 80,
      score: Math.round(averageScore),
      issues: allIssues,
      lastChecked,
      nextCheck: new Date(lastChecked.getTime() + 30 * 24 * 60 * 60 * 1000), // 30天後
    };
  }

  private calculateOverallCompliance(analyses: ComplianceAnalysis[]): number {
    if (analyses.length === 0) return 100;

    const _totalScore = analyses.reduce(
      (sum, analysis) => sum + analysis.score,
      0
    );
    return Math.round(totalScore / analyses.length);
  }

  private calculateOverallRiskLevel(
    analyses: ComplianceAnalysis[]
  ): 'low' | 'medium' | 'high' | 'critical' {
    const _criticalIssues = analyses
      .flatMap(analysis => analysis.issues)
      .filter(issue => issue.severity === 'critical');

    if (criticalIssues.length > 5) return 'critical';
    if (criticalIssues.length > 2) return 'high';
    if (criticalIssues.length > 0) return 'medium';
    return 'low';
  }

  private generateComplianceRecommendations(
    analyses: ComplianceAnalysis[]
  ): ComplianceRecommendation[] {
    const recommendations: ComplianceRecommendation[] = [];

    const _criticalIssues = analyses
      .flatMap(analysis => analysis.issues)
      .filter(issue => issue.severity === 'critical');

    if (criticalIssues.length > 0) {
      recommendations.push({
        id: this.generateId(),
        type: 'implement',
        title: '緊急合規修復建議',
        description: `發現 ${criticalIssues.length} 個嚴重合規問題需要緊急修復`,
        benefits: ['解決嚴重問題', '確保合規'],
        implementation: '優先修復嚴重合規問題',
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
        regulation: 'General',
      });
    }

    return recommendations;
  }
}
