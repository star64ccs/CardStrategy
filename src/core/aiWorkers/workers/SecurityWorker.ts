import { AIServiceManager } from '../AIServiceManager';

export interface SecurityAnalysis {
  id: string;
  timestamp: Date;
  targetId: string;
  analysisType: 'threat' | 'vulnerability' | 'compliance' | 'incident' | 'risk';
  score: number;
  issues: SecurityIssue[];
  recommendations: SecurityRecommendation[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedEffort: number;
  cost: number;
}

export interface SecurityIssue {
  id: string;
  type: 'threat' | 'vulnerability' | 'compliance' | 'incident';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  impact: string;
  suggestedFix: string;
  estimatedCost: number;
  estimatedTime: number;
  cveId?: string;
}

export interface SecurityRecommendation {
  id: string;
  type: 'patch' | 'configure' | 'monitor' | 'train';
  title: string;
  description: string;
  benefits: string[];
  implementation: string;
  estimatedCost: number;
  estimatedTime: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dependencies: string[];
}

export interface ThreatMetrics {
  totalThreats: number;
  activeThreats: number;
  blockedThreats: number;
  threatTypes: Record<string, number>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface VulnerabilityMetrics {
  totalVulnerabilities: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  mediumVulnerabilities: number;
  lowVulnerabilities: number;
  patchedVulnerabilities: number;
}

export interface SecurityIncident {
  id: string;
  timestamp: Date;
  type: 'breach' | 'attack' | 'malware' | 'phishing' | 'ddos';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedSystems: string[];
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  resolution?: string;
  cost: number;
}

export interface SecurityWorkerConfig {
  enabled: boolean;
  schedule: string;
  monitoring: {
    enableRealTimeMonitoring: boolean;
    enableThreatDetection: boolean;
    enableVulnerabilityScanning: boolean;
    enableIncidentResponse: boolean;
    monitoringInterval: number;
  };
  alerts: {
    enableEmailAlerts: boolean;
    enableSMSAlerts: boolean;
    enablePushNotifications: boolean;
    alertThresholds: {
      threatLevel: 'low' | 'medium' | 'high' | 'critical';
      vulnerabilityCount: number;
      incidentSeverity: 'low' | 'medium' | 'high' | 'critical';
    };
  };
  response: {
    enableAutoResponse: boolean;
    enableIncidentEscalation: boolean;
    responseTimeThreshold: number;
  };
  reporting: {
    enableDetailedReports: boolean;
    reportFormat: 'json' | 'pdf' | 'html';
    retentionPeriod: number;
  };
}

export class SecurityWorker {
  private readonly aiServiceManager: AIServiceManager;
  private config: SecurityWorkerConfig;
  private readonly analysisHistory: SecurityAnalysis[] = [];
  private readonly threatMetrics: Map<string, ThreatMetrics> = new Map();
  private readonly vulnerabilityMetrics: Map<string, VulnerabilityMetrics> =
    new Map();
  private readonly securityIncidents: SecurityIncident[] = [];

  constructor(config: SecurityWorkerConfig) {
    this.config = config;
    this.aiServiceManager = AIServiceManager.getInstance();
  }

  /**
   * 威脅檢測和Analysis
   */
  async detectThreats(targetId: string): Promise<SecurityAnalysis> {
    try {
      const _prompt = `檢測目標 "${targetId}" 的安全威脅：
1. 網絡威脅檢測
2. 惡意軟件檢測
3. 釣魚攻擊檢測
4. DDoS攻擊檢測
5. 異常行為檢測

請提供詳細的威脅檢測報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'high',
      });

      const analysis: SecurityAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        targetId,
        analysisType: 'threat',
        score: this.calculateThreatScore(response.content),
        issues: this.extractThreatIssues(response.content),
        recommendations: this.extractThreatRecommendations(response.content),
        impact: this.calculateThreatImpact(response.content),
        priority: this.calculateThreatPriority(response.content),
        estimatedEffort: this.estimateThreatEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('威脅檢測Failed:', error);
      throw new Error(`威脅檢測Failed: ${error}`);
    }
  }

  /**
   * 漏洞掃描和Analysis
   */
  async scanVulnerabilities(targetId: string): Promise<SecurityAnalysis> {
    try {
      const _prompt = `掃描目標 "${targetId}" 的安全漏洞：
1. 軟件漏洞掃描
2. 配置漏洞檢查
3. 網絡漏洞檢測
4. 應用程序漏洞分析
5. 數據庫漏洞檢查

請提供詳細的漏洞掃描報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'high',
      });

      const analysis: SecurityAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        targetId,
        analysisType: 'vulnerability',
        score: this.calculateVulnerabilityScore(response.content),
        issues: this.extractVulnerabilityIssues(response.content),
        recommendations: this.extractVulnerabilityRecommendations(
          response.content
        ),
        impact: this.calculateVulnerabilityImpact(response.content),
        priority: this.calculateVulnerabilityPriority(response.content),
        estimatedEffort: this.estimateVulnerabilityEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('漏洞掃描Failed:', error);
      throw new Error(`漏洞掃描Failed: ${error}`);
    }
  }

  /**
   * 安全合規性Check
   */
  async checkCompliance(targetId: string): Promise<SecurityAnalysis> {
    try {
      const _prompt = `檢查目標 "${targetId}" 的安全合規性：
1. GDPR合規性檢查
2. ISO 27001合規性檢查
3. SOC 2合規性檢查
4. PCI DSS合規性檢查
5. 行業特定法規合規性

請提供詳細的合規性檢查報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'high',
      });

      const analysis: SecurityAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        targetId,
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
   * 安全EventResponse
   */
  async respondToIncident(
    incident: SecurityIncident
  ): Promise<SecurityAnalysis> {
    try {
      const _prompt = `響應安全事件 "${incident.id}"：
1. 事件分析
2. 影響評估
3. 響應策略制定
4. 修復措施實施
5. 預防措施建議

請提供詳細的事件響應報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'high',
      });

      const analysis: SecurityAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        targetId: incident.id,
        analysisType: 'incident',
        score: this.calculateIncidentScore(response.content),
        issues: this.extractIncidentIssues(response.content),
        recommendations: this.extractIncidentRecommendations(response.content),
        impact: this.calculateIncidentImpact(response.content),
        priority: this.calculateIncidentPriority(response.content),
        estimatedEffort: this.estimateIncidentEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('事件響應Failed:', error);
      throw new Error(`事件響應Failed: ${error}`);
    }
  }

  /**
   * 風險評估
   */
  async assessRisk(targetId: string): Promise<SecurityAnalysis> {
    try {
      const _prompt = `評估目標 "${targetId}" 的安全風險：
1. 威脅風險評估
2. 漏洞風險評估
3. 業務影響評估
4. 風險等級分類
5. 風險緩解建議

請提供詳細的風險評估報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'normal',
      });

      const analysis: SecurityAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        targetId,
        analysisType: 'risk',
        score: this.calculateRiskScore(response.content),
        issues: this.extractRiskIssues(response.content),
        recommendations: this.extractRiskRecommendations(response.content),
        impact: this.calculateRiskImpact(response.content),
        priority: this.calculateRiskPriority(response.content),
        estimatedEffort: this.estimateRiskEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('風險評估Failed:', error);
      throw new Error(`風險評估Failed: ${error}`);
    }
  }

  /**
   * 生成安全建議
   */
  async generateSecurityRecommendations(
    targetId: string
  ): Promise<SecurityRecommendation[]> {
    try {
      const _prompt = `為目標 "${targetId}" 生成安全建議：
1. 威脅防護建議
2. 漏洞修復建議
3. 安全配置建議
4. 監控和響應建議
5. 安全培訓建議

請提供詳細的安全建議。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'normal',
      });

      return this.extractSecurityRecommendations(response.content);
    } catch (error) {
      console.error('安全建議生成Failed:', error);
      throw new Error(`安全建議生成Failed: ${error}`);
    }
  }

  /**
   * Monitor安全Status
   */
  async monitorSecurityStatus(targetId: string): Promise<{
    overallSecurity: number;
    activeThreats: number;
    criticalVulnerabilities: number;
    recommendations: SecurityRecommendation[];
  }> {
    try {
      const _recentAnalyses = this.analysisHistory.filter(
        analysis =>
          analysis.targetId === targetId &&
          new Date().getTime() - analysis.timestamp.getTime() <
            24 * 60 * 60 * 1000
      );

      const _activeThreats = recentAnalyses
        .filter(analysis => analysis.analysisType === 'threat')
        .flatMap(analysis => analysis.issues)
        .filter(
          issue => issue.severity === 'high' || issue.severity === 'critical'
        );

      const _criticalVulnerabilities = recentAnalyses
        .filter(analysis => analysis.analysisType === 'vulnerability')
        .flatMap(analysis => analysis.issues)
        .filter(issue => issue.severity === 'critical');

      const _overallSecurity = this.calculateOverallSecurity(recentAnalyses);
      const _recommendations =
        this.generateSecurityRecommendationsFromAnalyses(recentAnalyses);

      return {
        overallSecurity,
        activeThreats: activeThreats.length,
        criticalVulnerabilities: criticalVulnerabilities.length,
        recommendations,
      };
    } catch (error) {
      console.error('安全狀態監控Failed:', error);
      throw new Error(`安全狀態監控Failed: ${error}`);
    }
  }

  /**
   * Record安全Event
   */
  recordSecurityIncident(incident: SecurityIncident): void {
    this.securityIncidents.push(incident);
  }

  /**
   * Get安全Event歷史
   */
  getSecurityIncidents(
    targetId?: string,
    severity?: string
  ): SecurityIncident[] {
    let filtered = this.securityIncidents;

    if (targetId) {
      filtered = filtered.filter(incident =>
        incident.affectedSystems.includes(targetId)
      );
    }

    if (severity) {
      filtered = filtered.filter(incident => incident.severity === severity);
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
  ): SecurityAnalysis[] {
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
  updateConfig(newConfig: Partial<SecurityWorkerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * GetConfigure
   */
  getConfig(): SecurityWorkerConfig {
    return { ...this.config };
  }

  // Private輔助Method
  private generateId(): string {
    return `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 威脅相OffMethod
  private calculateThreatScore(content: string): number {
    const _positiveIndicators = ['安全', '無威脅', '正常', '良好'];
    const _negativeIndicators = ['威脅', '攻擊', '惡意', '異常'];

    let score = 80;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 15;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractThreatIssues(content: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    if (content.includes('威脅') || content.includes('threat')) {
      issues.push({
        id: this.generateId(),
        type: 'threat',
        severity: 'high',
        description: '檢測到安全威脅',
        location: '系統',
        impact: '安全風險',
        suggestedFix: '實施威脅防護措施',
        estimatedCost: 2000,
        estimatedTime: 12,
      });
    }

    return issues;
  }

  private extractThreatRecommendations(
    content: string
  ): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    if (content.includes('防護') || content.includes('protection')) {
      recommendations.push({
        id: this.generateId(),
        type: 'configure',
        title: '威脅防護建議',
        description: '基於AI分析的威脅防護建議',
        benefits: ['提升安全性', '防護威脅'],
        implementation: '實施威脅防護措施',
        estimatedCost: 2500,
        estimatedTime: 16,
        priority: 'high',
        dependencies: [],
      });
    }

    return recommendations;
  }

  private calculateThreatImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('嚴重威脅') || content.includes('critical'))
      return 'critical';
    if (content.includes('高威脅') || content.includes('high')) return 'high';
    if (content.includes('中等威脅') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculateThreatPriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急處理') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimateThreatEffort(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 80);
  }

  // 漏洞相OffMethod
  private calculateVulnerabilityScore(content: string): number {
    const _positiveIndicators = ['無漏洞', '安全', '已修復', '良好'];
    const _negativeIndicators = ['漏洞', '弱點', '風險', '問題'];

    let score = 75;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 15;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractVulnerabilityIssues(content: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    if (content.includes('漏洞') || content.includes('vulnerability')) {
      issues.push({
        id: this.generateId(),
        type: 'vulnerability',
        severity: 'high',
        description: '發現安全漏洞',
        location: '系統',
        impact: '安全風險',
        suggestedFix: '修復安全漏洞',
        estimatedCost: 1500,
        estimatedTime: 8,
      });
    }

    return issues;
  }

  private extractVulnerabilityRecommendations(
    content: string
  ): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    if (content.includes('修復') || content.includes('patch')) {
      recommendations.push({
        id: this.generateId(),
        type: 'patch',
        title: '漏洞修復建議',
        description: '基於AI分析的漏洞修復建議',
        benefits: ['修復漏洞', '提升安全性'],
        implementation: '實施漏洞修復',
        estimatedCost: 2000,
        estimatedTime: 12,
        priority: 'high',
        dependencies: [],
      });
    }

    return recommendations;
  }

  private calculateVulnerabilityImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('嚴重漏洞') || content.includes('critical'))
      return 'critical';
    if (content.includes('高危漏洞') || content.includes('high')) return 'high';
    if (content.includes('中等漏洞') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculateVulnerabilityPriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急修復') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimateVulnerabilityEffort(content: string): number {
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

  private extractComplianceIssues(content: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    if (content.includes('不合規') || content.includes('non-compliant')) {
      issues.push({
        id: this.generateId(),
        type: 'compliance',
        severity: 'high',
        description: '發現合規性問題',
        location: '系統',
        impact: '法律風險',
        suggestedFix: '修復合規性問題',
        estimatedCost: 3000,
        estimatedTime: 20,
      });
    }

    return issues;
  }

  private extractComplianceRecommendations(
    content: string
  ): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    if (content.includes('合規')) {
      recommendations.push({
        id: this.generateId(),
        type: 'configure',
        title: '合規性改進建議',
        description: '基於AI分析的合規性改進建議',
        benefits: ['確保合規', '降低風險'],
        implementation: '實施合規性措施',
        estimatedCost: 3500,
        estimatedTime: 24,
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
    return Math.ceil(wordCount / 70);
  }

  // Event相OffMethod
  private calculateIncidentScore(content: string): number {
    const _positiveIndicators = ['已解決', '已修復', '已處理', '正常'];
    const _negativeIndicators = ['未解決', '未修復', '未處理', '問題'];

    let score = 60;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 10;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 15;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractIncidentIssues(content: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    if (content.includes('事件') || content.includes('incident')) {
      issues.push({
        id: this.generateId(),
        type: 'incident',
        severity: 'high',
        description: '安全事件需要處理',
        location: '系統',
        impact: '安全風險',
        suggestedFix: '處理安全事件',
        estimatedCost: 2000,
        estimatedTime: 12,
      });
    }

    return issues;
  }

  private extractIncidentRecommendations(
    content: string
  ): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    if (content.includes('響應') || content.includes('response')) {
      recommendations.push({
        id: this.generateId(),
        type: 'monitor',
        title: '事件響應建議',
        description: '基於AI分析的事件響應建議',
        benefits: ['快速響應', '降低影響'],
        implementation: '實施事件響應措施',
        estimatedCost: 2500,
        estimatedTime: 16,
        priority: 'high',
        dependencies: [],
      });
    }

    return recommendations;
  }

  private calculateIncidentImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('嚴重事件') || content.includes('critical'))
      return 'critical';
    if (content.includes('高影響') || content.includes('high')) return 'high';
    if (content.includes('中等影響') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculateIncidentPriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急處理') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimateIncidentEffort(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 75);
  }

  // 風險相OffMethod
  private calculateRiskScore(content: string): number {
    const _positiveIndicators = ['低風險', '可控', '安全', '良好'];
    const _negativeIndicators = ['高風險', '不可控', '危險', '問題'];

    let score = 70;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 15;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractRiskIssues(content: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    if (content.includes('風險') || content.includes('risk')) {
      issues.push({
        id: this.generateId(),
        type: 'threat',
        severity: 'medium',
        description: '發現安全風險',
        location: '系統',
        impact: '安全風險',
        suggestedFix: '實施風險緩解措施',
        estimatedCost: 1500,
        estimatedTime: 8,
      });
    }

    return issues;
  }

  private extractRiskRecommendations(
    content: string
  ): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    if (content.includes('緩解') || content.includes('mitigation')) {
      recommendations.push({
        id: this.generateId(),
        type: 'configure',
        title: '風險緩解建議',
        description: '基於AI分析的風險緩解建議',
        benefits: ['降低風險', '提升安全性'],
        implementation: '實施風險緩解措施',
        estimatedCost: 2000,
        estimatedTime: 12,
        priority: 'medium',
        dependencies: [],
      });
    }

    return recommendations;
  }

  private calculateRiskImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('嚴重風險') || content.includes('critical'))
      return 'critical';
    if (content.includes('高風險') || content.includes('high')) return 'high';
    if (content.includes('中等風險') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculateRiskPriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急處理') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimateRiskEffort(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 85);
  }

  private extractSecurityRecommendations(
    content: string
  ): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    if (content.includes('建議') || content.includes('recommendation')) {
      recommendations.push({
        id: this.generateId(),
        type: 'configure',
        title: '綜合安全建議',
        description: '基於AI分析的綜合安全建議',
        benefits: ['提升整體安全性', '降低安全風險'],
        implementation: '實施綜合安全措施',
        estimatedCost: 4000,
        estimatedTime: 24,
        priority: 'medium',
        dependencies: [],
      });
    }

    return recommendations;
  }

  private calculateOverallSecurity(analyses: SecurityAnalysis[]): number {
    if (analyses.length === 0) return 100;

    const _totalScore = analyses.reduce(
      (sum, analysis) => sum + analysis.score,
      0
    );
    return Math.round(totalScore / analyses.length);
  }

  private generateSecurityRecommendationsFromAnalyses(
    analyses: SecurityAnalysis[]
  ): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    const _criticalIssues = analyses
      .flatMap(analysis => analysis.issues)
      .filter(issue => issue.severity === 'critical');

    if (criticalIssues.length > 0) {
      recommendations.push({
        id: this.generateId(),
        type: 'patch',
        title: '緊急安全修復建議',
        description: `發現 ${criticalIssues.length} 個嚴重安全問題需要緊急修復`,
        benefits: ['解決嚴重問題', '提升系統安全性'],
        implementation: '優先修復嚴重安全問題',
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
