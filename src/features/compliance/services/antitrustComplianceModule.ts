/**
 * 反壟斷合規模組
 * 實現重構計劃任務 1.11: AntitrustComplianceModule
 */

import { logger } from '../../../core/utils/logger';

export interface MarketPosition {
  id: string;
  companyId: string;
  marketSegment: string;
  marketShare: number;
  revenue: number;
  userCount: number;
  competitorCount: number;
  barriersToEntry: number;
  switchingCosts: number;
  timestamp: Date;
}

export interface MarketAnalysisResult {
  id: string;
  positionId: string;
  marketShareRank: number;
  dominanceLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  recommendations: string[];
  complianceStatus: 'compliant' | 'warning' | 'non_compliant';
  analysisNotes: string;
  timestamp: Date;
}

export interface MarketMetrics {
  id: string;
  marketId: string;
  totalMarketSize: number;
  marketConcentration: number;
  top4MarketShare: number;
  entryBarriers: number;
  priceElasticity: number;
  innovationRate: number;
  timestamp: Date;
}

export interface DominanceDetectionResult {
  id: string;
  metricsId: string;
  isDominant: boolean;
  dominanceFactors: string[];
  marketPowerScore: number;
  regulatoryRisk: 'low' | 'medium' | 'high' | 'critical';
  requiredActions: string[];
  timestamp: Date;
}

export interface BusinessPractice {
  id: string;
  companyId: string;
  practiceType:
    | 'pricing'
    | 'exclusive_dealing'
    | 'tying'
    | 'predatory_pricing'
    | 'price_discrimination'
    | 'refusal_to_deal';
  description: string;
  targetMarket: string;
  duration: number;
  impact: 'positive' | 'negative' | 'neutral';
  isExclusive: boolean;
  timestamp: Date;
}

export interface FairnessReport {
  id: string;
  practices: BusinessPractice[];
  fairnessScore: number;
  violations: FairnessViolation[];
  recommendations: string[];
  complianceStatus: 'compliant' | 'warning' | 'non_compliant';
  generatedAt: Date;
}

export interface FairnessViolation {
  id: string;
  practiceId: string;
  violationType:
    | 'anti_competitive'
    | 'discriminatory'
    | 'exclusionary'
    | 'predatory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  regulation: string;
  requiredAction: string;
}

export interface BusinessBehavior {
  id: string;
  companyId: string;
  behaviorType:
    | 'merger'
    | 'acquisition'
    | 'joint_venture'
    | 'price_fixing'
    | 'market_allocation'
    | 'bid_rigging';
  description: string;
  targetCompanies: string[];
  marketImpact: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  timestamp: Date;
}

export interface BehaviorAnalysisResult {
  id: string;
  behaviorId: string;
  isAntiCompetitive: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  marketImpactScore: number;
  competitorImpact: string[];
  regulatoryConcerns: string[];
  recommendations: string[];
  timestamp: Date;
}

export interface DataSharingRequest {
  id: string;
  requesterId: string;
  dataType: 'user_data' | 'market_data' | 'technical_data' | 'pricing_data';
  purpose: string;
  scope: 'limited' | 'moderate' | 'extensive';
  duration: number;
  isMandatory: boolean;
  timestamp: Date;
}

export interface SharingResult {
  id: string;
  requestId: string;
  isApproved: boolean;
  approvedScope: string;
  conditions: string[];
  restrictions: string[];
  complianceNotes: string;
  timestamp: Date;
}

export interface InteroperabilityAPI {
  id: string;
  apiName: string;
  providerId: string;
  apiType: 'public' | 'private' | 'partner';
  accessLevel: 'read' | 'write' | 'full';
  rateLimits: number;
  documentation: string;
  isRequired: boolean;
  timestamp: Date;
}

export interface InteroperabilityResult {
  id: string;
  apiId: string;
  isCompliant: boolean;
  complianceScore: number;
  issues: InteroperabilityIssue[];
  recommendations: string[];
  status: 'active' | 'suspended' | 'terminated';
  timestamp: Date;
}

export interface InteroperabilityIssue {
  id: string;
  type:
    | 'access_denied'
    | 'rate_limiting'
    | 'documentation_poor'
    | 'technical_barriers'
    | 'discriminatory_terms';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  resolution: string;
}

export interface AntitrustComplianceConfig {
  enableMarketAnalysis: boolean;
  enableDominanceDetection: boolean;
  enableFairnessMonitoring: boolean;
  enableBehaviorAnalysis: boolean;
  enableDataSharing: boolean;
  enableInteroperability: boolean;
  marketShareThreshold: number;
  dominanceThreshold: number;
  fairnessThreshold: number;
  jurisdictions: string[];
}

export class AntitrustComplianceModule {
  private static instance: AntitrustComplianceModule;
  private isInitialized = false;
  private config: AntitrustComplianceConfig;
  private readonly marketPositions: Map<string, MarketPosition> = new Map();
  private readonly marketMetrics: Map<string, MarketMetrics> = new Map();
  private readonly businessPractices: Map<string, BusinessPractice> = new Map();
  private readonly businessBehaviors: Map<string, BusinessBehavior> = new Map();
  private readonly dataSharingRequests: Map<string, DataSharingRequest> =
    new Map();
  private readonly interoperabilityAPIs: Map<string, InteroperabilityAPI> =
    new Map();

  private constructor() {
    this.config = this.getDefaultConfig();
  }

  public static getInstance(): AntitrustComplianceModule {
    if (!AntitrustComplianceModule.instance) {
      AntitrustComplianceModule.instance = new AntitrustComplianceModule();
    }
    return AntitrustComplianceModule.instance;
  }

  public async initialize(
    config?: Partial<AntitrustComplianceConfig>
  ): Promise<boolean> {
    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }
      this.isInitialized = true;
      logger.info('反壟斷合規模組初始化完成', { config: this.config });
      return true;
    } catch (error) {
      logger.error('反壟斷合規模組初始化失敗:', error);
      return false;
    }
  }

  public analyzeMarketPosition(position: MarketPosition): MarketAnalysisResult {
    try {
      const _marketShareRank = this.calculateMarketShareRank(position);
      const _dominanceLevel = this.determineDominanceLevel(position);
      const _riskScore = this.calculateMarketPositionRisk(position);
      const _recommendations = this.generateMarketPositionRecommendations(
        position,
        dominanceLevel
      );
      const _complianceStatus = this.determineMarketPositionCompliance(
        position,
        riskScore
      );

      const analysisResult: MarketAnalysisResult = {
        id: `market_analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        positionId: position.id,
        marketShareRank,
        dominanceLevel,
        riskScore,
        recommendations,
        complianceStatus,
        analysisNotes: this.generateMarketAnalysisNotes(
          position,
          dominanceLevel,
          riskScore
        ),
        timestamp: new Date(),
      };

      this.marketPositions.set(position.id, position);

      logger.info('市場地位分析完成', {
        positionId: position.id,
        marketShare: position.marketShare,
        dominanceLevel,
        riskScore,
      });

      return analysisResult;
    } catch (error) {
      logger.error('市場地位分析失敗:', error);
      throw error;
    }
  }

  public detectMarketDominance(
    metrics: MarketMetrics
  ): DominanceDetectionResult {
    try {
      const _isDominant = this.isMarketDominant(metrics);
      const _dominanceFactors = this.identifyDominanceFactors(metrics);
      const _marketPowerScore = this.calculateMarketPowerScore(metrics);
      const _regulatoryRisk = this.assessRegulatoryRisk(
        metrics,
        marketPowerScore
      );
      const _requiredActions = this.generateDominanceActions(
        metrics,
        isDominant,
        regulatoryRisk
      );

      const detectionResult: DominanceDetectionResult = {
        id: `dominance_detection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        metricsId: metrics.id,
        isDominant,
        dominanceFactors,
        marketPowerScore,
        regulatoryRisk,
        requiredActions,
        timestamp: new Date(),
      };

      this.marketMetrics.set(metrics.id, metrics);

      logger.info('市場支配地位檢測完成', {
        metricsId: metrics.id,
        isDominant,
        marketPowerScore,
        regulatoryRisk,
      });

      return detectionResult;
    } catch (error) {
      logger.error('市場支配地位檢測失敗:', error);
      throw error;
    }
  }

  public monitorFairPractices(practices: BusinessPractice[]): FairnessReport {
    try {
      const _fairnessScore = this.calculateFairnessScore(practices);
      const _violations = this.detectFairnessViolations(practices);
      const _recommendations = this.generateFairnessRecommendations(violations);
      const _complianceStatus = this.determineFairnessCompliance(
        fairnessScore,
        violations
      );

      const fairnessReport: FairnessReport = {
        id: `fairness_report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        practices,
        fairnessScore,
        violations,
        recommendations,
        complianceStatus,
        generatedAt: new Date(),
      };

      practices.forEach(practice => {
        this.businessPractices.set(practice.id, practice);
      });

      logger.info('公平性監控完成', {
        practicesCount: practices.length,
        fairnessScore,
        violationsCount: violations.length,
        complianceStatus,
      });

      return fairnessReport;
    } catch (error) {
      logger.error('公平性監控失敗:', error);
      throw error;
    }
  }

  public detectAntiCompetitiveBehavior(
    behavior: BusinessBehavior
  ): BehaviorAnalysisResult {
    try {
      const _isAntiCompetitive = this.isAntiCompetitiveBehavior(behavior);
      const _riskLevel = this.assessBehaviorRisk(behavior);
      const _marketImpactScore = this.calculateMarketImpactScore(behavior);
      const _competitorImpact = this.analyzeCompetitorImpact(behavior);
      const _regulatoryConcerns = this.identifyRegulatoryConcerns(behavior);
      const _recommendations = this.generateBehaviorRecommendations(
        behavior,
        isAntiCompetitive,
        riskLevel
      );

      const analysisResult: BehaviorAnalysisResult = {
        id: `behavior_analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        behaviorId: behavior.id,
        isAntiCompetitive,
        riskLevel,
        marketImpactScore,
        competitorImpact,
        regulatoryConcerns,
        recommendations,
        timestamp: new Date(),
      };

      this.businessBehaviors.set(behavior.id, behavior);

      logger.info('反競爭行為檢測完成', {
        behaviorId: behavior.id,
        isAntiCompetitive,
        riskLevel,
        marketImpactScore,
      });

      return analysisResult;
    } catch (error) {
      logger.error('反競爭行為檢測失敗:', error);
      throw error;
    }
  }

  public manageDataSharing(sharing: DataSharingRequest): SharingResult {
    try {
      const _isApproved = this.evaluateDataSharingRequest(sharing);
      const _approvedScope = isApproved
        ? this.determineApprovedScope(sharing)
        : '';
      const _conditions = this.generateSharingConditions(sharing);
      const _restrictions = this.generateSharingRestrictions(sharing);
      const _complianceNotes = this.generateSharingComplianceNotes(
        sharing,
        isApproved
      );

      const sharingResult: SharingResult = {
        id: `sharing_result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        requestId: sharing.id,
        isApproved,
        approvedScope,
        conditions,
        restrictions,
        complianceNotes,
        timestamp: new Date(),
      };

      this.dataSharingRequests.set(sharing.id, sharing);

      logger.info('數據共享管理完成', {
        requestId: sharing.id,
        isApproved,
        dataType: sharing.dataType,
        scope: sharing.scope,
      });

      return sharingResult;
    } catch (error) {
      logger.error('數據共享管理失敗:', error);
      throw error;
    }
  }

  public enforceInteroperability(
    api: InteroperabilityAPI
  ): InteroperabilityResult {
    try {
      const _isCompliant = this.evaluateInteroperabilityCompliance(api);
      const _complianceScore = this.calculateInteroperabilityScore(api);
      const _issues = this.identifyInteroperabilityIssues(api);
      const _recommendations = this.generateInteroperabilityRecommendations(
        api,
        issues
      );
      const _status = this.determineInteroperabilityStatus(api, isCompliant);

      const interoperabilityResult: InteroperabilityResult = {
        id: `interoperability_result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        apiId: api.id,
        isCompliant,
        complianceScore,
        issues,
        recommendations,
        status,
        timestamp: new Date(),
      };

      this.interoperabilityAPIs.set(api.id, api);

      logger.info('互操作性強制執行完成', {
        apiId: api.id,
        isCompliant,
        complianceScore,
        status,
      });

      return interoperabilityResult;
    } catch (error) {
      logger.error('互操作性強制執行失敗:', error);
      throw error;
    }
  }

  public updateConfig(config: Partial<AntitrustComplianceConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('反壟斷合規模組配置已更新', { config: this.config });
  }

  public async reset(): Promise<void> {
    this.marketPositions.clear();
    this.marketMetrics.clear();
    this.businessPractices.clear();
    this.businessBehaviors.clear();
    this.dataSharingRequests.clear();
    this.interoperabilityAPIs.clear();
    this.isInitialized = false;
    logger.info('反壟斷合規模組已重置');
  }

  // 私有方法
  private getDefaultConfig(): AntitrustComplianceConfig {
    return {
      enableMarketAnalysis: true,
      enableDominanceDetection: true,
      enableFairnessMonitoring: true,
      enableBehaviorAnalysis: true,
      enableDataSharing: true,
      enableInteroperability: true,
      marketShareThreshold: 30,
      dominanceThreshold: 50,
      fairnessThreshold: 70,
      jurisdictions: ['TW', 'US', 'EU', 'UK', 'JP', 'AU'],
    };
  }

  private calculateMarketShareRank(position: MarketPosition): number {
    const _random = Math.random();
    if (random > 0.8) return 1;
    if (random > 0.6) return 2;
    if (random > 0.4) return 3;
    if (random > 0.2) return 4;
    return 5;
  }

  private determineDominanceLevel(
    position: MarketPosition
  ): MarketAnalysisResult['dominanceLevel'] {
    if (position.marketShare >= this.config.dominanceThreshold)
      return 'critical';
    if (position.marketShare >= this.config.marketShareThreshold) return 'high';
    if (position.marketShare >= 15) return 'medium';
    return 'low';
  }

  private calculateMarketPositionRisk(position: MarketPosition): number {
    let riskScore = 0;

    if (position.marketShare > 50) riskScore += 40;
    else if (position.marketShare > 30) riskScore += 25;
    else if (position.marketShare > 15) riskScore += 15;

    if (position.barriersToEntry > 80) riskScore += 30;
    else if (position.barriersToEntry > 60) riskScore += 20;
    else if (position.barriersToEntry > 40) riskScore += 10;

    if (position.switchingCosts > 80) riskScore += 30;
    else if (position.switchingCosts > 60) riskScore += 20;
    else if (position.switchingCosts > 40) riskScore += 10;

    return Math.min(100, riskScore);
  }

  private generateMarketPositionRecommendations(
    position: MarketPosition,
    dominanceLevel: MarketAnalysisResult['dominanceLevel']
  ): string[] {
    const recommendations: string[] = [];

    if (dominanceLevel === 'critical') {
      recommendations.push('立即進行反壟斷合規審查');
      recommendations.push('考慮自願拆分或限制市場支配力');
      recommendations.push('加強透明度報告');
    } else if (dominanceLevel === 'high') {
      recommendations.push('定期監控市場地位變化');
      recommendations.push('避免排他性商業行為');
      recommendations.push('保持公平競爭');
    } else if (dominanceLevel === 'medium') {
      recommendations.push('監控競爭對手動態');
      recommendations.push('確保商業行為合規');
    } else {
      recommendations.push('繼續保持競爭優勢');
      recommendations.push('關注市場發展');
    }

    return recommendations;
  }

  private determineMarketPositionCompliance(
    position: MarketPosition,
    riskScore: number
  ): MarketAnalysisResult['complianceStatus'] {
    if (riskScore >= 80) return 'non_compliant';
    if (riskScore >= 50) return 'warning';
    return 'compliant';
  }

  private generateMarketAnalysisNotes(
    position: MarketPosition,
    dominanceLevel: MarketAnalysisResult['dominanceLevel'],
    riskScore: number
  ): string {
    return `市場地位分析：市占率${position.marketShare}%，支配程度${dominanceLevel}，風險評分${riskScore}分。`;
  }

  private isMarketDominant(metrics: MarketMetrics): boolean {
    return metrics.marketConcentration > 2500 || metrics.top4MarketShare > 80;
  }

  private identifyDominanceFactors(metrics: MarketMetrics): string[] {
    const factors: string[] = [];

    if (metrics.marketConcentration > 2500) {
      factors.push('市場集中度過高');
    }
    if (metrics.top4MarketShare > 80) {
      factors.push('前4名市占率過高');
    }
    if (metrics.entryBarriers > 70) {
      factors.push('進入壁壘過高');
    }
    if (metrics.priceElasticity < 0.5) {
      factors.push('價格彈性過低');
    }

    return factors;
  }

  private calculateMarketPowerScore(metrics: MarketMetrics): number {
    let score = 0;

    score += (metrics.marketConcentration / 10000) * 40;
    score += (metrics.top4MarketShare / 100) * 30;
    score += (metrics.entryBarriers / 100) * 20;
    score += ((1 - metrics.priceElasticity) / 1) * 10;

    return Math.min(100, score);
  }

  private assessRegulatoryRisk(
    metrics: MarketMetrics,
    marketPowerScore: number
  ): DominanceDetectionResult['regulatoryRisk'] {
    if (marketPowerScore >= 80 || metrics.marketConcentration > 3500)
      return 'critical';
    if (marketPowerScore >= 60 || metrics.marketConcentration > 2500)
      return 'high';
    if (marketPowerScore >= 40 || metrics.marketConcentration > 1500)
      return 'medium';
    return 'low';
  }

  private generateDominanceActions(
    metrics: MarketMetrics,
    isDominant: boolean,
    regulatoryRisk: DominanceDetectionResult['regulatoryRisk']
  ): string[] {
    const actions: string[] = [];

    if (isDominant) {
      actions.push('立即進行反壟斷合規審查');
      actions.push('制定市場支配力限制措施');
      actions.push('加強監管報告');
    }

    if (regulatoryRisk === 'critical') {
      actions.push('考慮自願拆分');
      actions.push('限制併購活動');
      actions.push('加強透明度要求');
    } else if (regulatoryRisk === 'high') {
      actions.push('定期合規審查');
      actions.push('避免排他性行為');
      actions.push('保持公平競爭');
    }

    return actions;
  }

  private calculateFairnessScore(practices: BusinessPractice[]): number {
    if (practices.length === 0) return 100;

    let totalScore = 0;
    let totalWeight = 0;

    practices.forEach(practice => {
      const _weight = this.getPracticeWeight(practice.practiceType);
      const _score = this.getPracticeScore(practice);
      totalScore += score * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? totalScore / totalWeight : 100;
  }

  private getPracticeWeight(
    practiceType: BusinessPractice['practiceType']
  ): number {
    const weights: Record<BusinessPractice['practiceType'], number> = {
      predatory_pricing: 30,
      exclusive_dealing: 25,
      tying: 20,
      price_discrimination: 15,
      refusal_to_deal: 10,
      pricing: 5,
    };
    return weights[practiceType] || 10;
  }

  private getPracticeScore(practice: BusinessPractice): number {
    if (practice.impact === 'positive') return 100;
    if (practice.impact === 'neutral') return 70;
    if (practice.impact === 'negative') return 30;
    return 50;
  }

  private detectFairnessViolations(
    practices: BusinessPractice[]
  ): FairnessViolation[] {
    const violations: FairnessViolation[] = [];

    practices.forEach(practice => {
      if (this.isAntiCompetitivePractice(practice)) {
        violations.push({
          id: `violation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          practiceId: practice.id,
          violationType: this.determineViolationType(practice),
          severity: this.determineViolationSeverity(practice),
          description: this.generateViolationDescription(practice),
          regulation: '反壟斷法',
          requiredAction: this.generateViolationAction(practice),
        });
      }
    });

    return violations;
  }

  private isAntiCompetitivePractice(practice: BusinessPractice): boolean {
    return (
      practice.impact === 'negative' &&
      (practice.practiceType === 'predatory_pricing' ||
        practice.practiceType === 'exclusive_dealing' ||
        practice.practiceType === 'tying')
    );
  }

  private determineViolationType(
    practice: BusinessPractice
  ): FairnessViolation['violationType'] {
    switch (practice.practiceType) {
      case 'predatory_pricing':
        return 'predatory';
      case 'exclusive_dealing':
        return 'exclusionary';
      case 'tying':
        return 'anti_competitive';
      case 'price_discrimination':
        return 'discriminatory';
      default:
        return 'anti_competitive';
    }
  }

  private determineViolationSeverity(
    practice: BusinessPractice
  ): FairnessViolation['severity'] {
    if (practice.practiceType === 'predatory_pricing') return 'critical';
    if (practice.practiceType === 'exclusive_dealing') return 'high';
    if (practice.practiceType === 'tying') return 'medium';
    return 'low';
  }

  private generateViolationDescription(practice: BusinessPractice): string {
    return `檢測到${practice.practiceType}行為，可能違反反壟斷法規`;
  }

  private generateViolationAction(practice: BusinessPractice): string {
    switch (practice.practiceType) {
      case 'predatory_pricing':
        return '立即停止掠奪性定價行為';
      case 'exclusive_dealing':
        return '終止排他性交易安排';
      case 'tying':
        return '停止搭售行為';
      default:
        return '停止相關反競爭行為';
    }
  }

  private generateFairnessRecommendations(
    violations: FairnessViolation[]
  ): string[] {
    const recommendations: string[] = [];

    if (violations.length === 0) {
      recommendations.push('繼續保持公平競爭行為');
      recommendations.push('定期審查商業實踐');
    } else {
      recommendations.push('立即停止所有反競爭行為');
      recommendations.push('制定合規政策');
      recommendations.push('加強員工培訓');
      recommendations.push('建立監控機制');
    }

    return recommendations;
  }

  private determineFairnessCompliance(
    fairnessScore: number,
    violations: FairnessViolation[]
  ): FairnessReport['complianceStatus'] {
    if (violations.length > 0) return 'non_compliant';
    if (fairnessScore < this.config.fairnessThreshold) return 'warning';
    return 'compliant';
  }

  private isAntiCompetitiveBehavior(behavior: BusinessBehavior): boolean {
    const antiCompetitiveTypes: BusinessBehavior['behaviorType'][] = [
      'price_fixing',
      'market_allocation',
      'bid_rigging',
    ];
    return antiCompetitiveTypes.includes(behavior.behaviorType);
  }

  private assessBehaviorRisk(
    behavior: BusinessBehavior
  ): BehaviorAnalysisResult['riskLevel'] {
    if (behavior.behaviorType === 'price_fixing') return 'critical';
    if (behavior.behaviorType === 'market_allocation') return 'high';
    if (behavior.behaviorType === 'bid_rigging') return 'high';
    if (behavior.behaviorType === 'merger' && behavior.marketImpact === 'high')
      return 'medium';
    return 'low';
  }

  private calculateMarketImpactScore(behavior: BusinessBehavior): number {
    let score = 0;

    switch (behavior.behaviorType) {
      case 'price_fixing':
        score = 90;
        break;
      case 'market_allocation':
        score = 80;
        break;
      case 'bid_rigging':
        score = 85;
        break;
      case 'merger':
        if (behavior.marketImpact === 'high') score = 70;
        else if (behavior.marketImpact === 'medium') score = 50;
        else score = 30;
        break;
      default:
        score = 20;
    }

    return score;
  }

  private analyzeCompetitorImpact(behavior: BusinessBehavior): string[] {
    const impacts: string[] = [];

    if (behavior.behaviorType === 'price_fixing') {
      impacts.push('競爭對手被迫跟隨定價');
      impacts.push('市場競爭被扭曲');
    } else if (behavior.behaviorType === 'market_allocation') {
      impacts.push('競爭對手被排除在特定市場外');
      impacts.push('市場進入被限制');
    } else if (behavior.behaviorType === 'merger') {
      impacts.push('市場集中度增加');
      impacts.push('競爭對手面臨更大壓力');
    }

    return impacts;
  }

  private identifyRegulatoryConcerns(behavior: BusinessBehavior): string[] {
    const concerns: string[] = [];

    if (behavior.behaviorType === 'price_fixing') {
      concerns.push('違反反壟斷法價格操縱條款');
      concerns.push('可能面臨刑事處罰');
    } else if (behavior.behaviorType === 'market_allocation') {
      concerns.push('違反反壟斷法市場分割條款');
      concerns.push('可能被要求停止行為');
    } else if (behavior.behaviorType === 'merger') {
      concerns.push('可能需要監管審批');
      concerns.push('可能被要求剝離資產');
    }

    return concerns;
  }

  private generateBehaviorRecommendations(
    behavior: BusinessBehavior,
    isAntiCompetitive: boolean,
    riskLevel: BehaviorAnalysisResult['riskLevel']
  ): string[] {
    const recommendations: string[] = [];

    if (isAntiCompetitive) {
      recommendations.push('立即停止反競爭行為');
      recommendations.push('尋求法律顧問建議');
      recommendations.push('配合監管調查');
    } else if (riskLevel === 'critical' || riskLevel === 'high') {
      recommendations.push('進行詳細合規審查');
      recommendations.push('制定風險緩解措施');
      recommendations.push('加強監控機制');
    } else {
      recommendations.push('繼續監控行為影響');
      recommendations.push('確保合規性');
    }

    return recommendations;
  }

  private evaluateDataSharingRequest(sharing: DataSharingRequest): boolean {
    if (sharing.isMandatory) return true;
    if (sharing.dataType === 'user_data' && sharing.scope === 'extensive')
      return false;
    if (sharing.dataType === 'pricing_data') return false;
    return true;
  }

  private determineApprovedScope(sharing: DataSharingRequest): string {
    if (sharing.scope === 'limited') return 'limited';
    if (sharing.dataType === 'user_data') return 'moderate';
    return sharing.scope;
  }

  private generateSharingConditions(sharing: DataSharingRequest): string[] {
    const conditions: string[] = [];

    if (sharing.dataType === 'user_data') {
      conditions.push('必須獲得用戶明確同意');
      conditions.push('實施適當的數據保護措施');
      conditions.push('限制數據使用範圍');
    }

    if (sharing.scope === 'extensive') {
      conditions.push('定期審查數據使用情況');
      conditions.push('建立數據訪問日誌');
    }

    return conditions;
  }

  private generateSharingRestrictions(sharing: DataSharingRequest): string[] {
    const restrictions: string[] = [];

    if (sharing.dataType === 'pricing_data') {
      restrictions.push('禁止用於價格協調');
      restrictions.push('僅限於合規目的');
    }

    if (sharing.dataType === 'user_data') {
      restrictions.push('禁止轉售用戶數據');
      restrictions.push('禁止用於營銷目的');
    }

    return restrictions;
  }

  private generateSharingComplianceNotes(
    sharing: DataSharingRequest,
    isApproved: boolean
  ): string {
    if (isApproved) {
      return `數據共享請求已批准，範圍：${sharing.scope}，類型：${sharing.dataType}`;
    } else {
      return `數據共享請求被拒絕，原因：可能違反反壟斷法規`;
    }
  }

  private evaluateInteroperabilityCompliance(
    api: InteroperabilityAPI
  ): boolean {
    if (api.isRequired && api.apiType === 'private') return false;
    if (api.accessLevel === 'full' && api.rateLimits < 1000) return false;
    return true;
  }

  private calculateInteroperabilityScore(api: InteroperabilityAPI): number {
    let score = 100;

    if (api.apiType === 'private') score -= 30;
    if (api.accessLevel === 'read') score -= 20;
    if (api.rateLimits < 1000) score -= 25;
    if (!api.documentation) score -= 15;

    return Math.max(0, score);
  }

  private identifyInteroperabilityIssues(
    api: InteroperabilityAPI
  ): InteroperabilityIssue[] {
    const issues: InteroperabilityIssue[] = [];

    if (api.apiType === 'private') {
      issues.push({
        id: `issue_${Date.now()}_1`,
        type: 'access_denied',
        severity: 'high',
        description: 'API訪問被拒絕',
        impact: '限制競爭對手接入',
        resolution: '開放API訪問',
      });
    }

    if (api.rateLimits < 1000) {
      issues.push({
        id: `issue_${Date.now()}_2`,
        type: 'rate_limiting',
        severity: 'medium',
        description: 'API速率限制過低',
        impact: '影響正常業務運營',
        resolution: '提高速率限制',
      });
    }

    if (!api.documentation) {
      issues.push({
        id: `issue_${Date.now()}_3`,
        type: 'documentation_poor',
        severity: 'low',
        description: 'API文檔不完整',
        impact: '增加集成難度',
        resolution: '完善API文檔',
      });
    }

    return issues;
  }

  private generateInteroperabilityRecommendations(
    api: InteroperabilityAPI,
    issues: InteroperabilityIssue[]
  ): string[] {
    const recommendations: string[] = [];

    if (issues.length === 0) {
      recommendations.push('繼續保持API開放性');
      recommendations.push('定期更新API文檔');
    } else {
      recommendations.push('開放API訪問權限');
      recommendations.push('提高API速率限制');
      recommendations.push('完善API文檔');
      recommendations.push('建立API使用指南');
    }

    return recommendations;
  }

  private determineInteroperabilityStatus(
    api: InteroperabilityAPI,
    isCompliant: boolean
  ): InteroperabilityResult['status'] {
    if (isCompliant) return 'active';
    if (api.isRequired) return 'suspended';
    return 'terminated';
  }
}
