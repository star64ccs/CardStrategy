import { logger } from '../../../core/utils/logger';
import type {
  AppraisalRequest,
  AppraisalResult,
  AppraisalHistory,
  AppraisalStats,
  AppraisalOptions,
  AppraisalError,
} from '../types/appraisal';
import {
  AppraisalMethod,
  GRADE_STANDARDS,
  GradeLevel,
} from '../types/appraisal';

class AppraisalService {
  private static instance: AppraisalService;
  private isInitialized = false;
  private readonly appraisalHistory: Map<string, AppraisalResult[]> = new Map();
  private readonly stats: AppraisalStats = {
    totalAppraisals: 0,
    averageProcessingTime: 0,
    gradeDistribution: {},
    methodUsage: {},
    accuracyRate: 95.5,
    userSatisfaction: 4.2,
  };

  private constructor() {}

  static getInstance(): AppraisalService {
    if (!AppraisalService.instance) {
      AppraisalService.instance = new AppraisalService();
    }
    return AppraisalService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.info('AppraisalService already initialized');
      return;
    }

    try {
      logger.info('Initializing AppraisalService...');

      // 初始化評分標準
      Object.keys(GRADE_STANDARDS).forEach(grade => {
        this.stats.gradeDistribution[grade] = 0;
      });

      // 初始化方法使用統計
      ['ai_vision', 'expert_system', 'hybrid', 'manual'].forEach(method => {
        this.stats.methodUsage[method] = 0;
      });

      this.isInitialized = true;
      logger.info('AppraisalService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AppraisalService:', error);
      throw error;
    }
  }

  async performAppraisal(request: AppraisalRequest): Promise<AppraisalResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      logger.info(`Starting appraisal for card: ${request.cardId}`);
      const _startTime = Date.now();

      // 模擬圖像處理
      await this.processImage(request.imageUrl);

      // 執行鑑定分析
      const _details = await this.analyzeCardDetails(request);

      // 計算總分和等級
      const _overallScore = this.calculateOverallScore(details);
      const _overallGrade = this.calculateGrade(overallScore);

      // 生成建議
      const _recommendations = this.generateRecommendations(
        details,
        overallScore
      );

      // 創建鑑定結果
      const result: AppraisalResult = {
        id: `appraisal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        cardId: request.cardId,
        overallGrade,
        overallScore,
        details,
        recommendations,
        metadata: {
          appraiser: 'AI Appraisal System',
          appraisalMethod: request.options?.method || 'hybrid',
          confidence: this.calculateConfidence(details),
          processingTime: Date.now() - startTime,
          imageQuality: this.assessImageQuality(request.imageUrl),
          lightingConditions: this.assessLightingConditions(request.imageUrl),
        },
        timestamp: new Date().toISOString(),
        status: 'completed',
      };

      // 更新統計數據
      this.updateStats(result);

      // 保存到歷史記錄
      this.saveToHistory(result);

      logger.info(
        `Appraisal completed for card: ${request.cardId}, Grade: ${overallGrade}`
      );
      return result;
    } catch (error) {
      logger.error('Appraisal failed:', error);
      const appraisalError: AppraisalError = {
        code: 'APPRAISAL_FAILED',
        message: '鑑定過程失敗',
        details: error instanceof Error ? error.message : '未知錯誤',
        isRetryable: true,
      };
      throw appraisalError;
    }
  }

  async getAppraisalHistory(cardId: string): Promise<AppraisalHistory> {
    const _appraisals = this.appraisalHistory.get(cardId) || [];

    if (appraisals.length === 0) {
      return {
        id: `history_${cardId}`,
        cardId,
        appraisals: [],
        totalAppraisals: 0,
        averageGrade: 'N/A',
        averageScore: 0,
        bestGrade: 'N/A',
        worstGrade: 'N/A',
        trend: 'stable',
      };
    }

    const _scores = appraisals.map(a => a.overallScore);
    const _averageScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const _averageGrade = this.calculateGrade(averageScore);

    const _bestAppraisal = appraisals.reduce((best, current) =>
      current.overallScore > best.overallScore ? current : best
    );

    const _worstAppraisal = appraisals.reduce((worst, current) =>
      current.overallScore < worst.overallScore ? current : worst
    );

    // 計算趨勢
    const _trend = this.calculateTrend(appraisals);

    return {
      id: `history_${cardId}`,
      cardId,
      appraisals,
      totalAppraisals: appraisals.length,
      averageGrade,
      averageScore,
      bestGrade: bestAppraisal.overallGrade,
      worstGrade: worstAppraisal.overallGrade,
      trend,
    };
  }

  async getAppraisalStats(): Promise<AppraisalStats> {
    return { ...this.stats };
  }

  async getAppraisalOptions(): Promise<AppraisalOptions> {
    return {
      method: 'hybrid',
      includeImages: true,
      detailedAnalysis: true,
      marketComparison: true,
      preservationTips: true,
    };
  }

  private async processImage(imageUrl: string): Promise<void> {
    // 模擬圖像處理
    await new Promise(resolve => setTimeout(resolve, 500));
    logger.info('Image processing completed');
  }

  private async analyzeCardDetails(request: AppraisalRequest) {
    // 模擬詳細分析
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      centering: this.generateGradeAssessment('centering', 8.5),
      corners: this.generateGradeAssessment('corners', 8.2),
      edges: this.generateGradeAssessment('edges', 8.8),
      surface: this.generateGradeAssessment('surface', 8.0),
      printQuality: this.generateGradeAssessment('printQuality', 8.7),
      colorAccuracy: this.generateGradeAssessment('colorAccuracy', 8.3),
      glossiness: this.generateGradeAssessment('glossiness', 8.1),
      registration: this.generateGradeAssessment('registration', 8.6),
    };
  }

  private generateGradeAssessment(category: string, baseScore: number) {
    const _variation = (Math.random() - 0.5) * 2; // ±1 分變化
    const _score = Math.max(1, Math.min(10, baseScore + variation));
    const _grade = this.calculateGrade(score);

    return {
      grade,
      score,
      description: `${category} 評估完成`,
      issues: score < 7 ? [`${category} 需要改善`] : [],
      images: [],
    };
  }

  private calculateOverallScore(details: unknown): number {
    const _scores = [
      details.centering.score,
      details.corners.score,
      details.edges.score,
      details.surface.score,
      details.printQuality.score,
      details.colorAccuracy.score,
      details.glossiness.score,
      details.registration.score,
    ];

    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  private calculateGrade(score: number): string {
    for (const [grade, standard] of Object.entries(GRADE_STANDARDS)) {
      if (score >= standard.min && score <= standard.max) {
        return grade;
      }
    }
    return 'POOR';
  }

  private calculateConfidence(details: unknown): number {
    // 基於各項評估的一致性計算信心度
    const _scores = Object.values(details).map((d: unknown) => d.score);
    const _variance = this.calculateVariance(scores);
    const _confidence = Math.max(0.5, 1 - variance / 10);
    return Math.round(confidence * 100) / 100;
  }

  private calculateVariance(scores: number[]): number {
    const _mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const _squaredDiffs = scores.map(score => (score - mean) ** 2);
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / scores.length;
  }

  private assessImageQuality(imageUrl: string): 'low' | 'medium' | 'high' {
    // 模擬圖像質量評估
    const _quality = Math.random();
    if (quality > 0.7) return 'high';
    if (quality > 0.4) return 'medium';
    return 'low';
  }

  private assessLightingConditions(
    imageUrl: string
  ): 'poor' | 'fair' | 'good' | 'excellent' {
    // 模擬光照條件評估
    const _lighting = Math.random();
    if (lighting > 0.8) return 'excellent';
    if (lighting > 0.6) return 'good';
    if (lighting > 0.4) return 'fair';
    return 'poor';
  }

  private generateRecommendations(details: unknown, overallScore: number): unknown[] {
    const _recommendations = [];

    if (overallScore < 7) {
      recommendations.push({
        type: 'improvement' as const,
        title: '卡牌狀態需要改善',
        description: '建議進行專業修復或重新評估',
        priority: 'high' as const,
        actionItems: ['聯繫專業修復師', '改善存儲條件', '定期檢查'],
      });
    }

    if (details.surface.score < 7) {
      recommendations.push({
        type: 'maintenance' as const,
        title: '表面維護建議',
        description: '表面狀態需要特別注意',
        priority: 'medium' as const,
        actionItems: ['使用專業清潔劑', '避免陽光直射', '定期除塵'],
      });
    }

    if (overallScore > 8.5) {
      recommendations.push({
        type: 'investment' as const,
        title: '投資價值評估',
        description: '卡牌具有較高的投資價值',
        priority: 'low' as const,
        actionItems: ['考慮專業認證', '保險評估', '市場價值追蹤'],
      });
    }

    return recommendations;
  }

  private updateStats(result: AppraisalResult): void {
    this.stats.totalAppraisals++;
    this.stats.gradeDistribution[result.overallGrade] =
      (this.stats.gradeDistribution[result.overallGrade] || 0) + 1;
    this.stats.methodUsage[result.metadata.appraisalMethod] =
      (this.stats.methodUsage[result.metadata.appraisalMethod] || 0) + 1;

    // 更新平均處理時間
    const _totalTime =
      this.stats.averageProcessingTime * (this.stats.totalAppraisals - 1) +
      result.metadata.processingTime;
    this.stats.averageProcessingTime = totalTime / this.stats.totalAppraisals;
  }

  private saveToHistory(result: AppraisalResult): void {
    const _history = this.appraisalHistory.get(result.cardId) || [];
    history.push(result);
    this.appraisalHistory.set(result.cardId, history);
  }

  private calculateTrend(
    appraisals: AppraisalResult[]
  ): 'improving' | 'declining' | 'stable' {
    if (appraisals.length < 2) return 'stable';

    const _recentScores = appraisals.slice(-3).map(a => a.overallScore);
    const _olderScores = appraisals.slice(-6, -3).map(a => a.overallScore);

    if (olderScores.length === 0) return 'stable';

    const _recentAvg =
      recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const _olderAvg =
      olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;

    const _difference = recentAvg - olderAvg;

    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
  }
}

export { AppraisalService };
export const _appraisalService = AppraisalService.getInstance();
