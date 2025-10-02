import type { QueryMetrics } from './databasePoolService';

import { logger } from '@/utils/logger';

export interface QueryAnalysis {
  queryId: string;
  sql: string;
  executionTime: number;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  optimizationScore: number; // 0-100
  recommendations: string[];
  estimatedImprovement: number; // 預估改善百分比
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface QueryPattern {
  pattern: string;
  frequency: number;
  averageExecutionTime: number;
  totalExecutionTime: number;
  optimizationOpportunities: string[];
}

export interface OptimizationResult {
  originalQuery: string;
  optimizedQuery: string;
  estimatedImprovement: number;
  changes: string[];
  riskAssessment: string;
  testingRequired: boolean;
}

export interface PerformanceReport {
  totalQueries: number;
  averageExecutionTime: number;
  slowQueries: number; // > 1000ms
  verySlowQueries: number; // > 5000ms
  optimizationOpportunities: number;
  topSlowQueries: QueryAnalysis[];
  queryPatterns: QueryPattern[];
  recommendations: string[];
  overallScore: number; // 0-100
}

export class QueryOptimizationService {
  private static instance: QueryOptimizationService;
  private isInitialized = false;
  private queryHistory: QueryMetrics[] = [];
  private readonly optimizationRules: Map<string, Function> = new Map();
  private readonly maxHistorySize = 10000;

  public static getInstance(): QueryOptimizationService {
    if (!QueryOptimizationService.instance) {
      QueryOptimizationService.instance = new QueryOptimizationService();
    }
    return QueryOptimizationService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('QueryOptimizationService already initialized');
      return;
    }

    try {
      this.setupOptimizationRules();
      logger.info('QueryOptimizationService initialized successfully');
      this.isInitialized = true;
    } catch (error) {
      logger.error('Failed to initialize QueryOptimizationService', error);
      throw error;
    }
  }

  /**
   * 分析查詢性能
   */
  public analyzeQuery(queryMetrics: QueryMetrics): QueryAnalysis {
    if (!this.isInitialized) {
      throw new Error('QueryOptimizationService not initialized');
    }

    const { sql, executionTime } = queryMetrics;

    // 分析查詢複雜度
    const complexity = this.analyzeComplexity(sql);

    // 計算優化分數
    const optimizationScore = this.calculateOptimizationScore(
      sql,
      executionTime
    );

    // 生成優化建議
    const recommendations = this.generateRecommendations(
      sql,
      executionTime,
      complexity
    );

    // 預估改善效果
    const estimatedImprovement = this.estimateImprovement(
      sql,
      executionTime,
      recommendations
    );

    // 評估風險等級
    const riskLevel = this.assessRiskLevel(sql, recommendations);

    return {
      queryId: queryMetrics.queryId,
      sql,
      executionTime,
      complexity,
      optimizationScore,
      recommendations,
      estimatedImprovement,
      riskLevel,
    };
  }

  /**
   * 優化查詢
   */
  public optimizeQuery(sql: string): OptimizationResult {
    if (!this.isInitialized) {
      throw new Error('QueryOptimizationService not initialized');
    }

    const originalQuery = sql;
    let optimizedQuery = sql;
    const changes: string[] = [];
    let estimatedImprovement = 0;

    // 應用優化規則
    for (const [ruleName, ruleFunction] of this.optimizationRules) {
      try {
        const result = ruleFunction(optimizedQuery);
        if (result.optimized && result.query !== optimizedQuery) {
          optimizedQuery = result.query;
          changes.push(result.description);
          estimatedImprovement += result.improvement || 0;
        }
      } catch (error) {
        logger.warn(`Optimization rule ${ruleName} failed`, error);
      }
    }

    const riskAssessment = this.assessOptimizationRisk(
      originalQuery,
      optimizedQuery,
      changes
    );
    const testingRequired = this.requiresTesting(
      originalQuery,
      optimizedQuery
    );

    return {
      originalQuery,
      optimizedQuery,
      estimatedImprovement: Math.min(estimatedImprovement, 95), // 最大95%改善
      changes,
      riskAssessment,
      testingRequired,
    };
  }

  /**
   * 記錄查詢指標
   */
  public recordQueryMetrics(metrics: QueryMetrics): void {
    this.queryHistory.push(metrics);

    // 限制歷史記錄大小
    if (this.queryHistory.length > this.maxHistorySize) {
      this.queryHistory = this.queryHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * 生成性能報告
   */
  public generatePerformanceReport(): PerformanceReport {
    if (!this.isInitialized) {
      throw new Error('QueryOptimizationService not initialized');
    }

    const totalQueries = this.queryHistory.length;
    if (totalQueries === 0) {
      return {
        totalQueries: 0,
        averageExecutionTime: 0,
        slowQueries: 0,
        verySlowQueries: 0,
        optimizationOpportunities: 0,
        topSlowQueries: [],
        queryPatterns: [],
        recommendations: ['沒有查詢歷史數據'],
        overallScore: 100,
      };
    }

    const averageExecutionTime =
      this.queryHistory.reduce((sum, q) => sum + q.executionTime, 0) /
      totalQueries;
    const slowQueries = this.queryHistory.filter(
      q => q.executionTime > 1000
    ).length;
    const verySlowQueries = this.queryHistory.filter(
      q => q.executionTime > 5000
    ).length;

    // 分析所有查詢
    const queryAnalyses = this.queryHistory.map(q => this.analyzeQuery(q));
    const optimizationOpportunities = queryAnalyses.filter(
      q => q.optimizationScore > 50
    ).length;

    // 獲取最慢的查詢
    const topSlowQueries = queryAnalyses
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);

    // 分析查詢模式
    const queryPatterns = this.analyzeQueryPatterns();

    // 生成整體建議
    const recommendations = this.generateOverallRecommendations(
      queryAnalyses,
      queryPatterns
    );

    // 計算整體分數
    const overallScore = this.calculateOverallScore(
      queryAnalyses,
      averageExecutionTime,
      slowQueries
    );

    return {
      totalQueries,
      averageExecutionTime,
      slowQueries,
      verySlowQueries,
      optimizationOpportunities,
      topSlowQueries,
      queryPatterns,
      recommendations,
      overallScore,
    };
  }

  /**
   * 批量優化查詢
   */
  public batchOptimizeQueries(queries: string[]): OptimizationResult[] {
    if (!this.isInitialized) {
      throw new Error('QueryOptimizationService not initialized');
    }

    return queries.map(query => this.optimizeQuery(query));
  }

  /**
   * 獲取查詢模式分析
   */
  public getQueryPatterns(): QueryPattern[] {
    return this.analyzeQueryPatterns();
  }

  /**
   * 清理歷史數據
   */
  public clearHistory(): void {
    this.queryHistory = [];
    logger.info('Query history cleared');
  }

  /**
   * 獲取服務狀態
   */
  public getStatus(): unknown {
    return {
      isInitialized: this.isInitialized,
      queryHistorySize: this.queryHistory.length,
      optimizationRulesCount: this.optimizationRules.size,
      maxHistorySize: this.maxHistorySize,
    };
  }

  // 私有方法

  private setupOptimizationRules(): void {
    // 規則1: 移除不必要的 DISTINCT
    this.optimizationRules.set('removeUnnecessaryDistinct', (sql: string) => {
      const pattern =
        /SELECT\s+DISTINCT\s+(\w+)\s+FROM\s+(\w+)\s+WHERE\s+(\w+)\s*=\s*(\w+)/gi;
      if (pattern.test(sql)) {
        return {
          optimized: true,
          query: sql.replace(/DISTINCT\s+/gi, ''),
          description: '移除不必要的 DISTINCT 關鍵字',
          improvement: 10,
        };
      }
      return { optimized: false };
    });

    // 規則2: 優化 WHERE 子句順序
    this.optimizationRules.set('optimizeWhereClause', (sql: string) => {
      const pattern =
        /WHERE\s+(\w+)\s*=\s*(\w+)\s+AND\s+(\w+)\s*LIKE\s*'%(\w+)%'/gi;
      if (pattern.test(sql)) {
        return {
          optimized: true,
          query: sql.replace(
            /(\w+)\s*=\s*(\w+)\s+AND\s+(\w+)\s*LIKE\s*'%(\w+)%'/gi,
            "$3 LIKE '%$4%' AND $1 = $2"
          ),
          description: '重新排序 WHERE 子句，將索引條件放在前面',
          improvement: 15,
        };
      }
      return { optimized: false };
    });

    // 規則3: 簡化子查詢
    this.optimizationRules.set('simplifySubquery', (sql: string) => {
      const pattern =
        /SELECT\s+\*\s+FROM\s+(\w+)\s+WHERE\s+(\w+)\s+IN\s*\(\s*SELECT\s+(\w+)\s+FROM\s+(\w+)\s*\)/gi;
      if (pattern.test(sql)) {
        return {
          optimized: true,
          query: sql.replace(
            /(\w+)\s+IN\s*\(\s*SELECT\s+(\w+)\s+FROM\s+(\w+)\s*\)/gi,
            'EXISTS (SELECT 1 FROM $3 WHERE $3.$2 = $1.$2)'
          ),
          description: '將 IN 子查詢轉換為 EXISTS',
          improvement: 20,
        };
      }
      return { optimized: false };
    });

    // 規則4: 移除不必要的 ORDER BY
    this.optimizationRules.set('removeUnnecessaryOrderBy', (sql: string) => {
      const pattern =
        /SELECT\s+COUNT\s*\(\s*\*\s*\)\s+FROM\s+(\w+)\s+ORDER\s+BY\s+(\w+)/gi;
      if (pattern.test(sql)) {
        return {
          optimized: true,
          query: sql.replace(/\s+ORDER\s+BY\s+\w+/gi, ''),
          description: '移除 COUNT 查詢中的不必要 ORDER BY',
          improvement: 25,
        };
      }
      return { optimized: false };
    });

    // 規則5: 優化 LIMIT 使用
    this.optimizationRules.set('optimizeLimit', (sql: string) => {
      const pattern =
        /SELECT\s+\*\s+FROM\s+(\w+)\s+ORDER\s+BY\s+(\w+)\s+LIMIT\s+(\d+)\s+OFFSET\s+(\d+)/gi;
      if (pattern.test(sql)) {
        const offset = parseInt(sql.match(/OFFSET\s+(\d+)/i)?.[1] || '0');
        if (offset > 1000) {
          return {
            optimized: true,
            query: sql.replace(/LIMIT\s+\d+\s+OFFSET\s+\d+/gi, 'LIMIT $3'),
            description: '移除大偏移量的 OFFSET，考慮使用游標分頁',
            improvement: 30,
          };
        }
      }
      return { optimized: false };
    });
  }

  private analyzeComplexity(sql: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    const complexity = {
      joins: (sql.match(/JOIN/gi) || []).length,
      subqueries: (sql.match(/SELECT.*FROM/gi) || []).length - 1,
      aggregations: (
        sql.match(/GROUP\s+BY|HAVING|COUNT|SUM|AVG|MAX|MIN/gi) || []
      ).length,
      conditions: (sql.match(/WHERE|AND|OR/gi) || []).length,
    };

    const score =
      complexity.joins * 2 +
      complexity.subqueries * 3 +
      complexity.aggregations * 2 +
      complexity.conditions;

    if (score <= 5) return 'LOW';
    if (score <= 15) return 'MEDIUM';
    return 'HIGH';
  }

  private calculateOptimizationScore(
    sql: string,
    executionTime: number
  ): number {
    let score = 0;

    // 基於執行時間
    if (executionTime > 5000) score += 40;
    else if (executionTime > 1000) score += 25;
    else if (executionTime > 500) score += 15;

    // 基於查詢複雜度
    const complexity = this.analyzeComplexity(sql);
    if (complexity === 'HIGH') score += 30;
    else if (complexity === 'MEDIUM') score += 20;

    // 基於查詢模式
    if (sql.includes('SELECT *')) score += 10;
    if (sql.includes('DISTINCT')) score += 5;
    if (sql.includes('ORDER BY') && sql.includes('LIMIT')) score += 5;
    if (sql.includes("LIKE '%")) score += 15;

    return Math.min(score, 100);
  }

  private generateRecommendations(
    sql: string,
    executionTime: number,
    complexity: 'LOW' | 'MEDIUM' | 'HIGH'
  ): string[] {
    const recommendations: string[] = [];

    if (executionTime > 1000) {
      recommendations.push('查詢執行時間過長，建議添加索引或優化查詢結構');
    }

    if (complexity === 'HIGH') {
      recommendations.push('查詢複雜度較高，考慮拆分為多個簡單查詢');
    }

    if (sql.includes('SELECT *')) {
      recommendations.push('避免使用 SELECT *，明確指定需要的列');
    }

    if (sql.includes("LIKE '%")) {
      recommendations.push('避免在 LIKE 查詢中使用前綴通配符，會影響索引使用');
    }

    if (sql.includes('DISTINCT')) {
      recommendations.push('檢查是否真的需要 DISTINCT，可能影響性能');
    }

    if (sql.includes('ORDER BY') && !sql.includes('LIMIT')) {
      recommendations.push('添加 LIMIT 子句以限制結果集大小');
    }

    if (recommendations.length === 0) {
      recommendations.push('查詢性能良好，無需優化');
    }

    return recommendations;
  }

  private estimateImprovement(
    sql: string,
    executionTime: number,
    recommendations: string[]
  ): number {
    let improvement = 0;

    if (recommendations.includes('建議添加索引或優化查詢結構')) {
      improvement += 30;
    }

    if (recommendations.includes('考慮拆分為多個簡單查詢')) {
      improvement += 25;
    }

    if (recommendations.includes('避免使用 SELECT *')) {
      improvement += 15;
    }

    if (recommendations.includes('避免在 LIKE 查詢中使用前綴通配符')) {
      improvement += 20;
    }

    if (recommendations.includes('檢查是否真的需要 DISTINCT')) {
      improvement += 10;
    }

    return Math.min(improvement, 80);
  }

  private assessRiskLevel(
    sql: string,
    recommendations: string[]
  ): 'LOW' | 'MEDIUM' | 'HIGH' {
    let riskScore = 0;

    if (sql.includes('DELETE') || sql.includes('UPDATE')) {
      riskScore += 30;
    }

    if (sql.includes('DROP') || sql.includes('ALTER')) {
      riskScore += 50;
    }

    if (recommendations.includes('考慮拆分為多個簡單查詢')) {
      riskScore += 20;
    }

    if (riskScore >= 50) return 'HIGH';
    if (riskScore >= 20) return 'MEDIUM';
    return 'LOW';
  }

  private analyzeQueryPatterns(): QueryPattern[] {
    const patterns = new Map<string, QueryPattern>();

    for (const query of this.queryHistory) {
      const pattern = this.extractQueryPattern(query.sql);

      if (!patterns.has(pattern)) {
        patterns.set(pattern, {
          pattern,
          frequency: 0,
          averageExecutionTime: 0,
          totalExecutionTime: 0,
          optimizationOpportunities: [],
        });
      }

      const patternData = patterns.get(pattern)!;
      patternData.frequency++;
      patternData.totalExecutionTime += query.executionTime;
      patternData.averageExecutionTime =
        patternData.totalExecutionTime / patternData.frequency;
    }

    // 分析每個模式的優化機會
    for (const [pattern, data] of patterns) {
      data.optimizationOpportunities = this.generateRecommendations(
        pattern,
        data.averageExecutionTime,
        this.analyzeComplexity(pattern)
      );
    }

    return Array.from(patterns.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  private extractQueryPattern(sql: string): string {
    // 簡化查詢以識別模式
    return sql
      .replace(/\d+/g, 'N') // 數字
      .replace(/'[^']*'/g, "'STRING'") // 字符串
      .replace(/\s+/g, ' ') // 多個空格
      .trim();
  }

  private generateOverallRecommendations(
    analyses: QueryAnalysis[],
    patterns: QueryPattern[]
  ): string[] {
    const recommendations: string[] = [];

    const slowQueries = analyses.filter(a => a.executionTime > 1000).length;
    if (slowQueries > analyses.length * 0.1) {
      recommendations.push(
        '超過10%的查詢執行時間超過1秒，建議進行整體性能優化'
      );
    }

    const highComplexityQueries = analyses.filter(
      a => a.complexity === 'HIGH'
    ).length;
    if (highComplexityQueries > analyses.length * 0.2) {
      recommendations.push('高複雜度查詢佔比過高，建議簡化查詢邏輯');
    }

    const frequentPatterns = patterns.filter(p => p.frequency > 10);
    if (frequentPatterns.length > 0) {
      recommendations.push(
        `發現${frequentPatterns.length}個高頻查詢模式，建議創建預存程序或視圖`
      );
    }

    const optimizationOpportunities = analyses.filter(
      a => a.optimizationScore > 70
    ).length;
    if (optimizationOpportunities > 0) {
      recommendations.push(
        `發現${optimizationOpportunities}個高優化潛力的查詢，建議優先處理`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('整體查詢性能良好，建議定期監控');
    }

    return recommendations;
  }

  private calculateOverallScore(
    analyses: QueryAnalysis[],
    averageExecutionTime: number,
    slowQueries: number
  ): number {
    let score = 100;

    // 基於平均執行時間
    if (averageExecutionTime > 1000) score -= 30;
    else if (averageExecutionTime > 500) score -= 20;
    else if (averageExecutionTime > 200) score -= 10;

    // 基於慢查詢比例
    const slowQueryRatio = slowQueries / analyses.length;
    if (slowQueryRatio > 0.1) score -= 25;
    else if (slowQueryRatio > 0.05) score -= 15;
    else if (slowQueryRatio > 0.02) score -= 5;

    // 基於優化分數
    const averageOptimizationScore =
      analyses.reduce((sum, a) => sum + a.optimizationScore, 0) /
      analyses.length;
    score -= (100 - averageOptimizationScore) * 0.3;

    return Math.max(score, 0);
  }

  private assessOptimizationRisk(
    originalQuery: string,
    optimizedQuery: string,
    changes: string[]
  ): string {
    if (originalQuery === optimizedQuery) {
      return '無風險 - 查詢未改變';
    }

    if (changes.some(c => c.includes('移除'))) {
      return '低風險 - 移除不必要的操作';
    }

    if (changes.some(c => c.includes('重新排序'))) {
      return '低風險 - 重新排序操作';
    }

    if (changes.some(c => c.includes('轉換'))) {
      return '中風險 - 查詢結構改變，需要測試';
    }

    return '高風險 - 重大查詢改變，需要充分測試';
  }

  private requiresTesting(
    originalQuery: string,
    optimizedQuery: string
  ): boolean {
    return originalQuery !== optimizedQuery;
  }
}

// 導出單例實例
export const queryOptimizationService = QueryOptimizationService.getInstance();

export default queryOptimizationService;
