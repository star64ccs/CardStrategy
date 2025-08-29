import { AIServiceManager } from '../AIServiceManager';

export interface InsightAnalysis {
  id: string;
  timestamp: Date;
  dataSourceId: string;
  analysisType: 'trend' | 'pattern' | 'anomaly' | 'prediction' | 'correlation';
  score: number;
  insights: DataInsight[];
  recommendations: InsightRecommendation[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedEffort: number;
  cost: number;
}

export interface DataInsight {
  id: string;
  type: 'trend' | 'pattern' | 'anomaly' | 'prediction' | 'correlation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  dataSource: string;
  impact: string;
  confidence: number;
  suggestedAction: string;
  estimatedValue: number;
  timeframe: string;
}

export interface InsightRecommendation {
  id: string;
  type: 'optimize' | 'investigate' | 'implement' | 'monitor';
  title: string;
  description: string;
  benefits: string[];
  implementation: string;
  estimatedCost: number;
  estimatedTime: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dependencies: string[];
  expectedROI: number;
}

export interface Prediction {
  value: number;
  confidence: number;
  timeframe: string;
  factors: string[];
}

export interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
  magnitude: number;
  duration: string;
  confidence: number;
  factors: string[];
  predictions: Prediction[];
}

export interface PatternAnalysis {
  patternType: 'seasonal' | 'cyclical' | 'trend' | 'random';
  strength: number;
  frequency: string;
  description: string;
  examples: string[];
  implications: string[];
}

export interface AnomalyAnalysis {
  anomalyType: 'outlier' | 'spike' | 'drop' | 'shift';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  cause: string;
  impact: string;
  recommendations: string[];
}

export interface PredictionAnalysis {
  prediction: string;
  confidence: number;
  timeframe: string;
  factors: string[];
  assumptions: string[];
  risks: string[];
}

export interface CorrelationAnalysis {
  correlationType: 'positive' | 'negative' | 'none';
  strength: number;
  variables: string[];
  description: string;
  significance: number;
  implications: string[];
}

export interface InsightWorkerConfig {
  enabled: boolean;
  schedule: string;
  analysis: {
    enableTrendAnalysis: boolean;
    enablePatternAnalysis: boolean;
    enableAnomalyDetection: boolean;
    enablePredictionAnalysis: boolean;
    enableCorrelationAnalysis: boolean;
    analysisInterval: number;
  };
  monitoring: {
    enableRealTimeMonitoring: boolean;
    enableAlerting: boolean;
    alertThresholds: {
      anomalyScore: number;
      predictionConfidence: number;
      trendMagnitude: number;
    };
  };
  reporting: {
    enableDetailedReports: boolean;
    reportFormat: 'json' | 'pdf' | 'html';
    retentionPeriod: number;
    autoGenerate: boolean;
  };
  optimization: {
    enableAutoOptimization: boolean;
    enableRecommendationEngine: boolean;
    optimizationThreshold: number;
  };
}

export class InsightWorker {
  private readonly aiServiceManager: AIServiceManager;
  private config: InsightWorkerConfig;
  private readonly analysisHistory: InsightAnalysis[] = [];
  private readonly trendAnalyses: Map<string, TrendAnalysis> = new Map();
  private readonly patternAnalyses: Map<string, PatternAnalysis> = new Map();
  private readonly anomalyAnalyses: Map<string, AnomalyAnalysis[]> = new Map();

  constructor(config: InsightWorkerConfig) {
    this.config = config;
    this.aiServiceManager = AIServiceManager.getInstance();
  }

  /**
   * 趨勢分析
   */
  async analyzeTrends(dataSourceId: string): Promise<InsightAnalysis> {
    try {
      const _prompt = `分析數據源 "${dataSourceId}" 的趨勢：
1. 數據趨勢識別
2. 趨勢強度評估
3. 趨勢持續時間分析
4. 影響因素分析
5. 未來趨勢預測

請提供詳細的趨勢分析報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'normal',
      });

      const analysis: InsightAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        dataSourceId,
        analysisType: 'trend',
        score: this.calculateTrendScore(response.content),
        insights: this.extractTrendInsights(response.content),
        recommendations: this.extractTrendRecommendations(response.content),
        impact: this.calculateTrendImpact(response.content),
        priority: this.calculateTrendPriority(response.content),
        estimatedEffort: this.estimateTrendEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('趨勢分析失敗:', error);
      throw new Error(`趨勢分析失敗: ${error}`);
    }
  }

  /**
   * 模式分析
   */
  async analyzePatterns(dataSourceId: string): Promise<InsightAnalysis> {
    try {
      const _prompt = `分析數據源 "${dataSourceId}" 的模式：
1. 數據模式識別
2. 模式類型分類
3. 模式強度評估
4. 模式頻率分析
5. 模式影響分析

請提供詳細的模式分析報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'normal',
      });

      const analysis: InsightAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        dataSourceId,
        analysisType: 'pattern',
        score: this.calculatePatternScore(response.content),
        insights: this.extractPatternInsights(response.content),
        recommendations: this.extractPatternRecommendations(response.content),
        impact: this.calculatePatternImpact(response.content),
        priority: this.calculatePatternPriority(response.content),
        estimatedEffort: this.estimatePatternEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('模式分析失敗:', error);
      throw new Error(`模式分析失敗: ${error}`);
    }
  }

  /**
   * 異常檢測
   */
  async detectAnomalies(dataSourceId: string): Promise<InsightAnalysis> {
    try {
      const _prompt = `檢測數據源 "${dataSourceId}" 的異常：
1. 異常數據識別
2. 異常類型分類
3. 異常嚴重性評估
4. 異常原因分析
5. 異常影響評估

請提供詳細的異常檢測報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'high',
      });

      const analysis: InsightAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        dataSourceId,
        analysisType: 'anomaly',
        score: this.calculateAnomalyScore(response.content),
        insights: this.extractAnomalyInsights(response.content),
        recommendations: this.extractAnomalyRecommendations(response.content),
        impact: this.calculateAnomalyImpact(response.content),
        priority: this.calculateAnomalyPriority(response.content),
        estimatedEffort: this.estimateAnomalyEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('異常檢測失敗:', error);
      throw new Error(`異常檢測失敗: ${error}`);
    }
  }

  /**
   * 預測分析
   */
  async generatePredictions(dataSourceId: string): Promise<InsightAnalysis> {
    try {
      const _prompt = `為數據源 "${dataSourceId}" 生成預測：
1. 未來趨勢預測
2. 預測置信度評估
3. 預測時間範圍分析
4. 影響因素識別
5. 預測風險評估

請提供詳細的預測分析報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'normal',
      });

      const analysis: InsightAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        dataSourceId,
        analysisType: 'prediction',
        score: this.calculatePredictionScore(response.content),
        insights: this.extractPredictionInsights(response.content),
        recommendations: this.extractPredictionRecommendations(
          response.content
        ),
        impact: this.calculatePredictionImpact(response.content),
        priority: this.calculatePredictionPriority(response.content),
        estimatedEffort: this.estimatePredictionEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('預測分析失敗:', error);
      throw new Error(`預測分析失敗: ${error}`);
    }
  }

  /**
   * 相關性分析
   */
  async analyzeCorrelations(dataSourceId: string): Promise<InsightAnalysis> {
    try {
      const _prompt = `分析數據源 "${dataSourceId}" 的相關性：
1. 變量相關性識別
2. 相關性強度評估
3. 相關性類型分析
4. 統計顯著性檢驗
5. 相關性影響分析

請提供詳細的相關性分析報告。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'normal',
      });

      const analysis: InsightAnalysis = {
        id: this.generateId(),
        timestamp: new Date(),
        dataSourceId,
        analysisType: 'correlation',
        score: this.calculateCorrelationScore(response.content),
        insights: this.extractCorrelationInsights(response.content),
        recommendations: this.extractCorrelationRecommendations(
          response.content
        ),
        impact: this.calculateCorrelationImpact(response.content),
        priority: this.calculateCorrelationPriority(response.content),
        estimatedEffort: this.estimateCorrelationEffort(response.content),
        cost: response.cost,
      };

      this.analysisHistory.push(analysis);
      return analysis;
    } catch (error) {
      console.error('相關性分析失敗:', error);
      throw new Error(`相關性分析失敗: ${error}`);
    }
  }

  /**
   * 生成洞察建議
   */
  async generateInsightRecommendations(
    dataSourceId: string
  ): Promise<InsightRecommendation[]> {
    try {
      const _prompt = `為數據源 "${dataSourceId}" 生成洞察建議：
1. 基於趨勢的建議
2. 基於模式的建議
3. 基於異常的建議
4. 基於預測的建議
5. 基於相關性的建議

請提供詳細的洞察建議。`;

      const _response = await this.aiServiceManager.callAI({
        prompt,
        priority: 'normal',
      });

      return this.extractInsightRecommendations(response.content);
    } catch (error) {
      console.error('洞察建議生成失敗:', error);
      throw new Error(`洞察建議生成失敗: ${error}`);
    }
  }

  /**
   * 監控洞察狀態
   */
  async monitorInsightStatus(dataSourceId: string): Promise<{
    overallInsight: number;
    criticalInsights: number;
    activeAnomalies: number;
    recommendations: InsightRecommendation[];
  }> {
    try {
      const _recentAnalyses = this.analysisHistory.filter(
        analysis =>
          analysis.dataSourceId === dataSourceId &&
          new Date().getTime() - analysis.timestamp.getTime() <
            24 * 60 * 60 * 1000
      );

      const _criticalInsights = recentAnalyses
        .flatMap(analysis => analysis.insights)
        .filter(insight => insight.severity === 'critical');

      const _activeAnomalies = recentAnalyses
        .filter(analysis => analysis.analysisType === 'anomaly')
        .flatMap(analysis => analysis.insights)
        .filter(
          insight =>
            insight.severity === 'high' || insight.severity === 'critical'
        );

      const _overallInsight = this.calculateOverallInsight(recentAnalyses);
      const _recommendations =
        this.generateInsightRecommendationsFromAnalyses(recentAnalyses);

      return {
        overallInsight,
        criticalInsights: criticalInsights.length,
        activeAnomalies: activeAnomalies.length,
        recommendations,
      };
    } catch (error) {
      console.error('洞察狀態監控失敗:', error);
      throw new Error(`洞察狀態監控失敗: ${error}`);
    }
  }

  /**
   * 獲取分析歷史
   */
  getAnalysisHistory(
    dataSourceId?: string,
    analysisType?: string
  ): InsightAnalysis[] {
    let filtered = this.analysisHistory;

    if (dataSourceId) {
      filtered = filtered.filter(
        analysis => analysis.dataSourceId === dataSourceId
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
   * 更新配置
   */
  updateConfig(newConfig: Partial<InsightWorkerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 獲取配置
   */
  getConfig(): InsightWorkerConfig {
    return { ...this.config };
  }

  // 私有輔助方法
  private generateId(): string {
    return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 趨勢相關方法
  private calculateTrendScore(content: string): number {
    const _positiveIndicators = ['上升', '增長', '改善', '積極'];
    const _negativeIndicators = ['下降', '減少', '惡化', '消極'];

    let score = 70;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 10;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractTrendInsights(content: string): DataInsight[] {
    const insights: DataInsight[] = [];

    if (content.includes('趨勢') || content.includes('trend')) {
      insights.push({
        id: this.generateId(),
        type: 'trend',
        severity: 'medium',
        description: '識別到數據趨勢',
        dataSource: '數據源',
        impact: '業務影響',
        confidence: 0.8,
        suggestedAction: '基於趨勢制定策略',
        estimatedValue: 1000,
        timeframe: '1個月',
      });
    }

    return insights;
  }

  private extractTrendRecommendations(
    content: string
  ): InsightRecommendation[] {
    const recommendations: InsightRecommendation[] = [];

    if (content.includes('趨勢')) {
      recommendations.push({
        id: this.generateId(),
        type: 'optimize',
        title: '趨勢優化建議',
        description: '基於AI分析的趨勢優化建議',
        benefits: ['利用趨勢', '提升效率'],
        implementation: '實施趨勢優化策略',
        estimatedCost: 2000,
        estimatedTime: 16,
        priority: 'medium',
        dependencies: [],
        expectedROI: 150,
      });
    }

    return recommendations;
  }

  private calculateTrendImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('重大趨勢') || content.includes('critical'))
      return 'critical';
    if (content.includes('重要趨勢') || content.includes('high')) return 'high';
    if (content.includes('一般趨勢') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculateTrendPriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急趨勢') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimateTrendEffort(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 100);
  }

  // 模式相關方法
  private calculatePatternScore(content: string): number {
    const _positiveIndicators = ['清晰', '穩定', '規律', '可預測'];
    const _negativeIndicators = ['混亂', '不穩定', '隨機', '不可預測'];

    let score = 70;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 10;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractPatternInsights(content: string): DataInsight[] {
    const insights: DataInsight[] = [];

    if (content.includes('模式') || content.includes('pattern')) {
      insights.push({
        id: this.generateId(),
        type: 'pattern',
        severity: 'medium',
        description: '識別到數據模式',
        dataSource: '數據源',
        impact: '模式影響',
        confidence: 0.75,
        suggestedAction: '利用模式優化流程',
        estimatedValue: 800,
        timeframe: '2週',
      });
    }

    return insights;
  }

  private extractPatternRecommendations(
    content: string
  ): InsightRecommendation[] {
    const recommendations: InsightRecommendation[] = [];

    if (content.includes('模式')) {
      recommendations.push({
        id: this.generateId(),
        type: 'optimize',
        title: '模式優化建議',
        description: '基於AI分析的模式優化建議',
        benefits: ['利用模式', '提升效率'],
        implementation: '實施模式優化策略',
        estimatedCost: 1500,
        estimatedTime: 12,
        priority: 'medium',
        dependencies: [],
        expectedROI: 120,
      });
    }

    return recommendations;
  }

  private calculatePatternImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('重要模式') || content.includes('critical'))
      return 'critical';
    if (content.includes('顯著模式') || content.includes('high')) return 'high';
    if (content.includes('一般模式') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculatePatternPriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急模式') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimatePatternEffort(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 90);
  }

  // 異常相關方法
  private calculateAnomalyScore(content: string): number {
    const _positiveIndicators = ['正常', '無異常', '穩定', '良好'];
    const _negativeIndicators = ['異常', '問題', '偏差', '錯誤'];

    let score = 80;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 15;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractAnomalyInsights(content: string): DataInsight[] {
    const insights: DataInsight[] = [];

    if (content.includes('異常') || content.includes('anomaly')) {
      insights.push({
        id: this.generateId(),
        type: 'anomaly',
        severity: 'high',
        description: '檢測到數據異常',
        dataSource: '數據源',
        impact: '異常影響',
        confidence: 0.9,
        suggestedAction: '調查異常原因',
        estimatedValue: -500,
        timeframe: '立即',
      });
    }

    return insights;
  }

  private extractAnomalyRecommendations(
    content: string
  ): InsightRecommendation[] {
    const recommendations: InsightRecommendation[] = [];

    if (content.includes('異常')) {
      recommendations.push({
        id: this.generateId(),
        type: 'investigate',
        title: '異常調查建議',
        description: '基於AI分析的異常調查建議',
        benefits: ['解決異常', '恢復正常'],
        implementation: '實施異常調查',
        estimatedCost: 1000,
        estimatedTime: 8,
        priority: 'high',
        dependencies: [],
        expectedROI: 200,
      });
    }

    return recommendations;
  }

  private calculateAnomalyImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('嚴重異常') || content.includes('critical'))
      return 'critical';
    if (content.includes('重要異常') || content.includes('high')) return 'high';
    if (content.includes('一般異常') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculateAnomalyPriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急異常') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimateAnomalyEffort(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 80);
  }

  // 預測相關方法
  private calculatePredictionScore(content: string): number {
    const _positiveIndicators = ['準確', '可靠', '高置信度', '可信'];
    const _negativeIndicators = ['不準確', '不可靠', '低置信度', '不可信'];

    let score = 70;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 10;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractPredictionInsights(content: string): DataInsight[] {
    const insights: DataInsight[] = [];

    if (content.includes('預測') || content.includes('prediction')) {
      insights.push({
        id: this.generateId(),
        type: 'prediction',
        severity: 'medium',
        description: '生成數據預測',
        dataSource: '數據源',
        impact: '預測影響',
        confidence: 0.7,
        suggestedAction: '基於預測制定計劃',
        estimatedValue: 1200,
        timeframe: '3個月',
      });
    }

    return insights;
  }

  private extractPredictionRecommendations(
    content: string
  ): InsightRecommendation[] {
    const recommendations: InsightRecommendation[] = [];

    if (content.includes('預測')) {
      recommendations.push({
        id: this.generateId(),
        type: 'implement',
        title: '預測實施建議',
        description: '基於AI分析的預測實施建議',
        benefits: ['利用預測', '提前準備'],
        implementation: '實施預測策略',
        estimatedCost: 2500,
        estimatedTime: 20,
        priority: 'medium',
        dependencies: [],
        expectedROI: 180,
      });
    }

    return recommendations;
  }

  private calculatePredictionImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('重要預測') || content.includes('critical'))
      return 'critical';
    if (content.includes('顯著預測') || content.includes('high')) return 'high';
    if (content.includes('一般預測') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculatePredictionPriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急預測') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimatePredictionEffort(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 85);
  }

  // 相關性相關方法
  private calculateCorrelationScore(content: string): number {
    const _positiveIndicators = ['強相關', '顯著', '重要', '有意義'];
    const _negativeIndicators = ['弱相關', '不顯著', '無意義', '隨機'];

    let score = 70;

    positiveIndicators.forEach(indicator => {
      if (content.includes(indicator)) score += 5;
    });

    negativeIndicators.forEach(indicator => {
      if (content.includes(indicator)) score -= 10;
    });

    return Math.max(0, Math.min(100, score));
  }

  private extractCorrelationInsights(content: string): DataInsight[] {
    const insights: DataInsight[] = [];

    if (content.includes('相關性') || content.includes('correlation')) {
      insights.push({
        id: this.generateId(),
        type: 'correlation',
        severity: 'medium',
        description: '發現數據相關性',
        dataSource: '數據源',
        impact: '相關性影響',
        confidence: 0.8,
        suggestedAction: '利用相關性優化',
        estimatedValue: 900,
        timeframe: '1個月',
      });
    }

    return insights;
  }

  private extractCorrelationRecommendations(
    content: string
  ): InsightRecommendation[] {
    const recommendations: InsightRecommendation[] = [];

    if (content.includes('相關性')) {
      recommendations.push({
        id: this.generateId(),
        type: 'optimize',
        title: '相關性優化建議',
        description: '基於AI分析的相關性優化建議',
        benefits: ['利用相關性', '提升效率'],
        implementation: '實施相關性優化策略',
        estimatedCost: 1800,
        estimatedTime: 14,
        priority: 'medium',
        dependencies: [],
        expectedROI: 140,
      });
    }

    return recommendations;
  }

  private calculateCorrelationImpact(
    content: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (content.includes('強相關性') || content.includes('critical'))
      return 'critical';
    if (content.includes('顯著相關性') || content.includes('high'))
      return 'high';
    if (content.includes('一般相關性') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private calculateCorrelationPriority(
    content: string
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (content.includes('緊急相關性') || content.includes('urgent'))
      return 'urgent';
    if (content.includes('高優先級') || content.includes('high')) return 'high';
    if (content.includes('中等優先級') || content.includes('medium'))
      return 'medium';
    return 'low';
  }

  private estimateCorrelationEffort(content: string): number {
    const _wordCount = content.length;
    return Math.ceil(wordCount / 90);
  }

  private extractInsightRecommendations(
    content: string
  ): InsightRecommendation[] {
    const recommendations: InsightRecommendation[] = [];

    if (content.includes('建議') || content.includes('recommendation')) {
      recommendations.push({
        id: this.generateId(),
        type: 'optimize',
        title: '綜合洞察建議',
        description: '基於AI分析的綜合洞察建議',
        benefits: ['綜合優化', '提升效率'],
        implementation: '實施綜合洞察策略',
        estimatedCost: 3000,
        estimatedTime: 24,
        priority: 'medium',
        dependencies: [],
        expectedROI: 200,
      });
    }

    return recommendations;
  }

  private calculateOverallInsight(analyses: InsightAnalysis[]): number {
    if (analyses.length === 0) return 100;

    const _totalScore = analyses.reduce(
      (sum, analysis) => sum + analysis.score,
      0
    );
    return Math.round(totalScore / analyses.length);
  }

  private generateInsightRecommendationsFromAnalyses(
    analyses: InsightAnalysis[]
  ): InsightRecommendation[] {
    const recommendations: InsightRecommendation[] = [];

    const _criticalInsights = analyses
      .flatMap(analysis => analysis.insights)
      .filter(insight => insight.severity === 'critical');

    if (criticalInsights.length > 0) {
      recommendations.push({
        id: this.generateId(),
        type: 'investigate',
        title: '緊急洞察處理建議',
        description: `發現 ${criticalInsights.length} 個關鍵洞察需要緊急處理`,
        benefits: ['處理關鍵洞察', '提升業務價值'],
        implementation: '優先處理關鍵洞察',
        estimatedCost: criticalInsights.reduce(
          (sum, insight) => sum + Math.abs(insight.estimatedValue),
          0
        ),
        estimatedTime: criticalInsights.length * 4,
        priority: 'urgent',
        dependencies: [],
        expectedROI: 300,
      });
    }

    return recommendations;
  }
}
