import { AIServiceManager } from '../AIServiceManager';

export interface RegulationUpdate {
  id: string;
  title: string;
  description: string;
  jurisdiction: string;
  category: string;
  effectiveDate: Date;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  url?: string;
  status: 'pending' | 'reviewed' | 'implemented' | 'ignored';
  aiAnalysis?: {
    summary: string;
    impact: string;
    recommendations: string[];
    riskScore: number;
    aiProvider: string;
    cost: number;
  };
}

export interface ComplianceReport {
  id: string;
  content: string;
  jurisdiction: string;
  regulations: string[];
  complianceScore: number;
  violations: ComplianceViolation[];
  recommendations: string[];
  timestamp: Date;
  aiProvider: string;
  cost: number;
}

export interface ComplianceViolation {
  regulation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  suggestedFix: string;
}

export interface RegulationWorkerConfig {
  enabled: boolean;
  schedule: string; // cron expression
  monitoring: {
    jurisdictions: string[];
    categories: string[];
    sources: string[];
    checkInterval: number; // minutes
  };
  compliance: {
    enableAutoCheck: boolean;
    checkThreshold: number; // 0-100
    autoAlert: boolean;
    alertThreshold: number; // 0-100
  };
  costControl: {
    maxDailyBudget: number;
    preferredAIProvider: string;
    enableCostOptimization: boolean;
  };
}

export class RegulationWorker {
  private readonly aiService: AIServiceManager;
  private config: RegulationWorkerConfig;
  private readonly isRunning = false;
  private lastCheck: Date | null = null;

  constructor(config: RegulationWorkerConfig) {
    this.config = config;
    this.aiService = AIServiceManager.getInstance();
  }

  /**
   * 掃描法規更新
   */
  public async scanRegulations(): Promise<RegulationUpdate[]> {
    try {
      if (!this.config.enabled) {
        throw new Error('RegulationWorker 已停用');
      }

      const updates: RegulationUpdate[] = [];

      // 模擬從多個來源獲取法規更新
      const { sources } = this.config.monitoring;

      for (const source of sources) {
        const _sourceUpdates = await this.fetchRegulationUpdates(source);
        updates.push(...sourceUpdates);
      }

      // 使用AI分析每個更新
      for (const update of updates) {
        update.aiAnalysis = await this.analyzeRegulationUpdate(update);
      }

      // 按影響等級排序
      updates.sort((a, b) => {
        const impactOrder: { [key: string]: number } = {
          critical: 4,
          high: 3,
          medium: 2,
          low: 1,
        };
        const _bImpactLevel = (b.aiAnalysis as any)?.impactLevel || 'low';
        const _aImpactLevel = (a.aiAnalysis as any)?.impactLevel || 'low';
        return impactOrder[bImpactLevel] - impactOrder[aImpactLevel];
      });

      this.lastCheck = new Date();
      return updates;
    } catch (error) {
      console.error('掃描法規更新失敗:', error);
      throw error;
    }
  }

  /**
   * 檢查內容合規性
   */
  public async checkCompliance(
    content: string,
    jurisdiction = 'global'
  ): Promise<ComplianceReport> {
    try {
      if (!this.config.enabled) {
        throw new Error('RegulationWorker 已停用');
      }

      // 檢查成本限制
      await this.checkCostLimits();

      // 使用AI分析合規性
      const _analysisPrompt = `分析以下內容的合規性，要求：
1. 檢查是否違反相關法規
2. 評估合規風險等級
3. 提供具體的違規點和建議
4. 計算合規分數（0-100）

內容：${content.substring(0, 2000)}...
管轄區：${jurisdiction}

請以JSON格式返回分析結果，包含：
- complianceScore: 合規分數
- violations: 違規列表
- recommendations: 建議列表
- riskLevel: 風險等級`;

      const _analysisResponse = await this.aiService.callAI({
        prompt: analysisPrompt,
        maxTokens: 1000,
        temperature: 0.3,
        useCache: true,
      });

      // 解析AI分析結果
      const _analysis = this.parseComplianceAnalysis(analysisResponse.content);

      const report: ComplianceReport = {
        id: `compliance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: content.substring(0, 200), // 只保存前200字符
        jurisdiction,
        regulations: this.getRelevantRegulations(jurisdiction),
        complianceScore: analysis.complianceScore,
        violations: analysis.violations,
        recommendations: analysis.recommendations,
        timestamp: new Date(),
        aiProvider: analysisResponse.provider,
        cost: analysisResponse.cost,
      };

      // 檢查是否需要警報
      if (
        this.config.compliance.autoAlert &&
        analysis.complianceScore < this.config.compliance.alertThreshold
      ) {
        await this.triggerComplianceAlert(report);
      }

      return report;
    } catch (error) {
      console.error('合規性檢查失敗:', error);
      throw error;
    }
  }

  /**
   * 觸發合規警報
   */
  public async triggerAlerts(): Promise<void> {
    try {
      // 檢查是否有新的高風險法規更新
      const _updates = await this.scanRegulations();
      const _criticalUpdates = updates.filter(
        u => (u.aiAnalysis as any)?.impactLevel === 'critical'
      );

      if (criticalUpdates.length > 0) {
        await this.sendCriticalUpdateAlert(criticalUpdates);
      }

      // 檢查合規分數是否下降
      const _recentReports = await this.getRecentComplianceReports();
      const _averageScore =
        recentReports.reduce((sum, r) => sum + r.complianceScore, 0) /
        recentReports.length;

      if (averageScore < this.config.compliance.alertThreshold) {
        await this.sendComplianceScoreAlert(averageScore);
      }
    } catch (error) {
      console.error('觸發警報失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取法規更新摘要
   */
  public async getRegulationSummary(
    period: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): Promise<string> {
    try {
      const _updates = await this.scanRegulations();

      const _summaryPrompt = `為以下法規更新生成摘要報告，要求：
1. 概括主要變更
2. 分析對業務的影響
3. 提供行動建議
4. 突出關鍵風險點

法規更新數量：${updates.length}
時間範圍：${period}

請生成一份簡潔的摘要報告。`;

      const _summaryResponse = await this.aiService.callAI({
        prompt: summaryPrompt,
        maxTokens: 800,
        temperature: 0.5,
        useCache: true,
      });

      return summaryResponse.content;
    } catch (error) {
      console.error('生成法規摘要失敗:', error);
      throw error;
    }
  }

  /**
   * 檢查特定法規的影響
   */
  public async analyzeRegulationImpact(
    regulationId: string,
    businessContext: string
  ): Promise<any> {
    try {
      const _impactPrompt = `分析特定法規對業務的影響，要求：
1. 評估直接影響
2. 分析間接影響
3. 計算實施成本
4. 提供應對策略

法規ID：${regulationId}
業務背景：${businessContext}

請提供詳細的影響分析。`;

      const _impactResponse = await this.aiService.callAI({
        prompt: impactPrompt,
        maxTokens: 1200,
        temperature: 0.4,
        useCache: true,
      });

      return {
        regulationId,
        analysis: impactResponse.content,
        aiProvider: impactResponse.provider,
        cost: impactResponse.cost,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('分析法規影響失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取工作狀態
   */
  public getStatus(): {
    isRunning: boolean;
    lastCheck: Date | null;
    config: RegulationWorkerConfig;
  } {
    return {
      isRunning: this.isRunning,
      lastCheck: this.lastCheck,
      config: this.config,
    };
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<RegulationWorkerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 私有方法

  /**
   * 從特定來源獲取法規更新
   */
  private async fetchRegulationUpdates(
    source: string
  ): Promise<RegulationUpdate[]> {
    // 這裡應該實現實際的法規數據獲取邏輯
    // 簡化實現，返回模擬數據
    const mockUpdates: RegulationUpdate[] = [
      {
        id: `reg_${Date.now()}_1`,
        title: '數據保護法規更新',
        description: '新的數據保護要求將於下月生效',
        jurisdiction: 'EU',
        category: 'data-protection',
        effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        impactLevel: 'high',
        source,
        url: 'https://example.com/regulation1',
        status: 'pending',
      },
      {
        id: `reg_${Date.now()}_2`,
        title: 'AI治理框架發布',
        description: '新的AI治理框架已正式發布',
        jurisdiction: 'Global',
        category: 'ai-governance',
        effectiveDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        impactLevel: 'critical',
        source,
        url: 'https://example.com/regulation2',
        status: 'pending',
      },
    ];

    return mockUpdates;
  }

  /**
   * 使用AI分析法規更新
   */
  private async analyzeRegulationUpdate(
    update: RegulationUpdate
  ): Promise<RegulationUpdate['aiAnalysis']> {
    const _analysisPrompt = `分析以下法規更新的影響，要求：
1. 評估對業務的影響等級
2. 提供簡要摘要
3. 分析具體影響
4. 提供實施建議
5. 計算風險分數（0-100）

法規標題：${update.title}
法規描述：${update.description}
管轄區：${update.jurisdiction}
類別：${update.category}
生效日期：${update.effectiveDate.toISOString()}

請以JSON格式返回分析結果。`;

    const _analysisResponse = await this.aiService.callAI({
      prompt: analysisPrompt,
      maxTokens: 800,
      temperature: 0.4,
      useCache: true,
    });

    try {
      const _analysis = JSON.parse(analysisResponse.content);
      return {
        summary: analysis.summary || '',
        impact: analysis.impact || '',
        recommendations: analysis.recommendations || [],
        riskScore: analysis.riskScore || 50,
        aiProvider: analysisResponse.provider,
        cost: analysisResponse.cost,
      };
    } catch (error) {
      // 如果JSON解析失敗，返回基本分析
      return {
        summary: analysisResponse.content.substring(0, 200),
        impact: '需要進一步分析',
        recommendations: ['請人工審查此法規更新'],
        riskScore: 50,
        aiProvider: analysisResponse.provider,
        cost: analysisResponse.cost,
      };
    }
  }

  /**
   * 解析合規性分析結果
   */
  private parseComplianceAnalysis(content: string): {
    complianceScore: number;
    violations: ComplianceViolation[];
    recommendations: string[];
  } {
    try {
      const _analysis = JSON.parse(content);
      return {
        complianceScore: analysis.complianceScore || 50,
        violations: analysis.violations || [],
        recommendations: analysis.recommendations || [],
      };
    } catch (error) {
      // 如果解析失敗，返回默認值
      return {
        complianceScore: 50,
        violations: [],
        recommendations: ['請人工審查合規性'],
      };
    }
  }

  /**
   * 獲取相關法規列表
   */
  private getRelevantRegulations(jurisdiction: string): string[] {
    const regulationMap: Record<string, string[]> = {
      EU: ['GDPR', 'AI Act', 'Digital Services Act'],
      US: ['CCPA', 'CPRA', 'AI Bill of Rights'],
      China: ['Personal Information Protection Law', 'Data Security Law'],
      global: ['Universal Declaration of Human Rights', 'UN Guidelines'],
    };

    return regulationMap[jurisdiction] || regulationMap['global'];
  }

  /**
   * 檢查成本限制
   */
  private async checkCostLimits(): Promise<void> {
    const _stats = this.aiService.getStats();
    const _dailyCost = stats.totalCost; // 簡化實現

    if (dailyCost >= this.config.costControl.maxDailyBudget) {
      throw new Error(
        `已達到每日成本限制: $${this.config.costControl.maxDailyBudget}`
      );
    }
  }

  /**
   * 觸發合規警報
   */
  private async triggerComplianceAlert(
    report: ComplianceReport
  ): Promise<void> {
    console.log(
      `🚨 合規警報: 合規分數 ${report.complianceScore} 低於閾值 ${this.config.compliance.alertThreshold}`
    );

    // 這裡應該發送實際的警報通知
    // 例如：郵件、Slack、釘釘等
  }

  /**
   * 發送關鍵更新警報
   */
  private async sendCriticalUpdateAlert(
    updates: RegulationUpdate[]
  ): Promise<void> {
    console.log(`🚨 關鍵法規更新警報: ${updates.length} 個關鍵更新`);

    // 這裡應該發送實際的警報通知
  }

  /**
   * 發送合規分數警報
   */
  private async sendComplianceScoreAlert(averageScore: number): Promise<void> {
    console.log(
      `🚨 合規分數警報: 平均分數 ${averageScore} 低於閾值 ${this.config.compliance.alertThreshold}`
    );

    // 這裡應該發送實際的警報通知
  }

  /**
   * 獲取最近的合規報告
   */
  private async getRecentComplianceReports(): Promise<ComplianceReport[]> {
    // 這裡應該從數據庫獲取最近的報告
    // 簡化實現，返回空數組
    return [];
  }
}
