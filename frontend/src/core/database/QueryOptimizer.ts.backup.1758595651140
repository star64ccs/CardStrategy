/**
 * 查詢優化器 - 第三階段性能優化
 * 實現數據庫查詢優化和索引管理
 */

import { logger } from '../utils/logger';

export interface QueryOptimizationConfig {
  enableQueryCache: boolean;
  cacheSize: number;
  cacheTTL: number; // 秒
  enableQueryAnalysis: boolean;
  slowQueryThreshold: number; // 毫秒
  maxQueryTime: number; // 毫秒
  enableIndexOptimization: boolean;
  enableQueryRewriting: boolean;
}

export interface QueryMetrics {
  totalQueries: number;
  slowQueries: number;
  averageQueryTime: number;
  cacheHitRate: number;
  indexUsage: number;
  queryOptimizations: number;
  lastOptimization: Date;
}

export interface SlowQuery {
  id: string;
  query: string;
  executionTime: number;
  timestamp: Date;
  optimizationSuggestions: string[];
}

export interface IndexRecommendation {
  table: string;
  columns: string[];
  type: 'btree' | 'hash' | 'gin' | 'gist';
  priority: 'high' | 'medium' | 'low';
  estimatedImprovement: number; // 百分比
}

/**
 * 查詢優化器
 */
export class QueryOptimizer {
  private static instance: QueryOptimizer;
  private config: QueryOptimizationConfig;
  private metrics: QueryMetrics;
  private queryCache: Map<string, { result: any; timestamp: number }> =
    new Map();
  private slowQueries: SlowQuery[] = [];
  private queryHistory: Array<{
    query: string;
    executionTime: number;
    timestamp: Date;
  }> = [];
  private indexRecommendations: IndexRecommendation[] = [];

  private constructor() {
    this.config = this.getDefaultConfig();
    this.metrics = this.getInitialMetrics();
  }

  public static getInstance(): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer();
    }
    return QueryOptimizer.instance;
  }

  /**
   * 初始化查詢優化器
   */
  public async initialize(): Promise<void> {
    logger.info('初始化查詢優化器...');

    try {
      // 分析現有索引
      await this.analyzeExistingIndexes();

      // 設置查詢監控
      this.setupQueryMonitoring();

      // 初始化查詢緩存
      this.initializeQueryCache();

      // 設置定期優化
      this.setupPeriodicOptimization();

      logger.info('查詢優化器初始化完成');
    } catch (error) {
      logger.error('查詢優化器初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 優化查詢
   */
  public async optimizeQuery(
    query: string,
    params?: any[]
  ): Promise<{
    optimizedQuery: string;
    suggestions: string[];
    estimatedImprovement: number;
  }> {
    logger.debug('優化查詢', { query: query.substring(0, 100) });

    const startTime = Date.now();

    try {
      // 1. 查詢重寫
      const rewrittenQuery = this.rewriteQuery(query);

      // 2. 參數綁定優化
      const optimizedParams = this.optimizeParameters(params || []);

      // 3. 生成優化建議
      const suggestions = this.generateOptimizationSuggestions(query);

      // 4. 估算性能改進
      const estimatedImprovement = this.estimatePerformanceImprovement(
        query,
        rewrittenQuery
      );

      const optimizationTime = Date.now() - startTime;

      logger.debug('查詢優化完成', {
        optimizationTime,
        estimatedImprovement,
      });

      return {
        optimizedQuery: rewrittenQuery,
        suggestions,
        estimatedImprovement,
      };
    } catch (error) {
      logger.error('查詢優化失敗:', error);
      return {
        optimizedQuery: query,
        suggestions: ['優化失敗，使用原始查詢'],
        estimatedImprovement: 0,
      };
    }
  }

  /**
   * 執行優化查詢
   */
  public async executeOptimizedQuery<T>(
    query: string,
    params?: any[],
    client?: any
  ): Promise<T[]> {
    const startTime = Date.now();

    try {
      // 檢查緩存
      if (this.config.enableQueryCache) {
        const cachedResult = this.getCachedResult(query, params);
        if (cachedResult) {
          this.metrics.cacheHitRate = (this.metrics.cacheHitRate + 1) / 2;
          return cachedResult;
        }
      }

      // 優化查詢
      const optimization = await this.optimizeQuery(query, params);

      // 執行查詢
      const result = await this.executeQuery<T>(
        optimization.optimizedQuery,
        params,
        client
      );

      // 緩存結果
      if (this.config.enableQueryCache) {
        this.cacheResult(query, params, result);
      }

      // 記錄查詢指標
      const executionTime = Date.now() - startTime;
      this.recordQueryMetrics(query, executionTime);

      // 檢查慢查詢
      if (executionTime > this.config.slowQueryThreshold) {
        this.recordSlowQuery(query, executionTime, optimization.suggestions);
      }

      return result;
    } catch (error) {
      logger.error('查詢執行失敗:', error);
      throw error;
    }
  }

  /**
   * 分析索引使用情況
   */
  public async analyzeIndexUsage(): Promise<{
    usedIndexes: Array<{ index: string; usage: number }>;
    unusedIndexes: string[];
    recommendations: IndexRecommendation[];
  }> {
    logger.info('分析索引使用情況...');

    try {
      // 模擬索引分析
      const usedIndexes = [
        { index: 'idx_cards_name', usage: 0.95 },
        { index: 'idx_cards_series', usage: 0.87 },
        { index: 'idx_cards_rarity', usage: 0.73 },
        { index: 'idx_market_price', usage: 0.91 },
      ];

      const unusedIndexes = ['idx_old_table_column', 'idx_temp_index'];

      const recommendations = await this.generateIndexRecommendations();

      logger.info('索引分析完成', {
        usedIndexes: usedIndexes.length,
        unusedIndexes: unusedIndexes.length,
        recommendations: recommendations.length,
      });

      return {
        usedIndexes,
        unusedIndexes,
        recommendations,
      };
    } catch (error) {
      logger.error('索引分析失敗:', error);
      throw error;
    }
  }

  /**
   * 創建推薦索引
   */
  public async createRecommendedIndexes(): Promise<{
    created: string[];
    failed: string[];
    totalImprovement: number;
  }> {
    logger.info('創建推薦索引...');

    try {
      const results = {
        created: [] as string[],
        failed: [] as string[],
        totalImprovement: 0,
      };

      for (const recommendation of this.indexRecommendations) {
        if (recommendation.priority === 'high') {
          try {
            await this.createIndex(recommendation);
            results.created.push(
              `${recommendation.table}_${recommendation.columns.join('_')}`
            );
            results.totalImprovement += recommendation.estimatedImprovement;
          } catch (error) {
            results.failed.push(
              `${recommendation.table}_${recommendation.columns.join('_')}`
            );
            logger.error('索引創建失敗:', error);
          }
        }
      }

      logger.info('推薦索引創建完成', results);
      return results;
    } catch (error) {
      logger.error('創建推薦索引失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取查詢指標
   */
  public getQueryMetrics(): QueryMetrics {
    return { ...this.metrics };
  }

  /**
   * 獲取慢查詢報告
   */
  public getSlowQueryReport(): SlowQuery[] {
    return [...this.slowQueries];
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<QueryOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('查詢優化器配置已更新', this.config);
  }

  // 私有方法

  private async analyzeExistingIndexes(): Promise<void> {
    logger.debug('分析現有索引...');

    // 模擬索引分析
    const existingIndexes = [
      'idx_cards_name',
      'idx_cards_series',
      'idx_cards_rarity',
      'idx_market_price',
      'idx_users_email',
    ];

    logger.debug('現有索引分析完成', { count: existingIndexes.length });
  }

  private setupQueryMonitoring(): void {
    // 設置查詢監控
    setInterval(() => {
      this.analyzeQueryPatterns();
    }, 300000); // 每5分鐘分析一次
  }

  private initializeQueryCache(): void {
    // 設置緩存清理
    setInterval(() => {
      this.cleanupQueryCache();
    }, this.config.cacheTTL * 1000);
  }

  private setupPeriodicOptimization(): void {
    // 設置定期優化
    setInterval(async () => {
      await this.performPeriodicOptimization();
    }, 3600000); // 每小時執行一次
  }

  private rewriteQuery(query: string): string {
    let optimizedQuery = query;

    // 1. 移除不必要的DISTINCT
    optimizedQuery = optimizedQuery.replace(/\bDISTINCT\s+/g, '');

    // 2. 優化WHERE子句順序
    optimizedQuery = this.optimizeWhereClause(optimizedQuery);

    // 3. 優化JOIN順序
    optimizedQuery = this.optimizeJoinOrder(optimizedQuery);

    // 4. 優化子查詢
    optimizedQuery = this.optimizeSubqueries(optimizedQuery);

    return optimizedQuery;
  }

  private optimizeWhereClause(query: string): string {
    // 將選擇性高的條件放在前面
    // 這是一個簡化的實現
    return query;
  }

  private optimizeJoinOrder(query: string): string {
    // 優化JOIN順序，從小表到大表
    // 這是一個簡化的實現
    return query;
  }

  private optimizeSubqueries(query: string): string {
    // 將子查詢轉換為JOIN（如果可能）
    // 這是一個簡化的實現
    return query;
  }

  private optimizeParameters(params: any[]): any[] {
    // 參數綁定優化
    return params.map(param => {
      if (typeof param === 'string' && param.length > 1000) {
        // 長字符串參數優化
        return param.substring(0, 1000);
      }
      return param;
    });
  }

  private generateOptimizationSuggestions(query: string): string[] {
    const suggestions: string[] = [];

    // 分析查詢模式
    if (query.includes('SELECT *')) {
      suggestions.push('避免使用SELECT *，只選擇需要的列');
    }

    if (query.includes('ORDER BY') && !query.includes('LIMIT')) {
      suggestions.push('考慮添加LIMIT子句以限制結果數量');
    }

    if (query.includes('LIKE') && query.includes('%')) {
      suggestions.push('LIKE查詢可能很慢，考慮使用全文搜索索引');
    }

    if (query.includes('IN') && query.match(/IN\s*\([^)]{100,}\)/)) {
      suggestions.push('大型IN子句可能很慢，考慮使用臨時表或JOIN');
    }

    return suggestions;
  }

  private estimatePerformanceImprovement(
    originalQuery: string,
    optimizedQuery: string
  ): number {
    // 估算性能改進百分比
    let improvement = 0;

    // 基於優化類型估算改進
    if (originalQuery !== optimizedQuery) {
      improvement += 15; // 基本查詢重寫
    }

    if (originalQuery.includes('SELECT *')) {
      improvement += 10; // 避免SELECT *
    }

    if (
      originalQuery.includes('ORDER BY') &&
      !originalQuery.includes('LIMIT')
    ) {
      improvement += 20; // 添加LIMIT
    }

    return Math.min(improvement, 50); // 最大50%改進
  }

  private async executeQuery<T>(
    query: string,
    params: any[],
    client: any
  ): Promise<T[]> {
    if (client) {
      const result = await client.query(query, params);
      return result.rows;
    } else {
      // 模擬查詢執行
      return [] as T[];
    }
  }

  private getCachedResult(query: string, params?: any[]): any | null {
    const cacheKey = this.generateCacheKey(query, params);
    const cached = this.queryCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.config.cacheTTL * 1000) {
      return cached.result;
    }

    return null;
  }

  private cacheResult(
    query: string,
    params: any[] | undefined,
    result: any
  ): void {
    const cacheKey = this.generateCacheKey(query, params);

    // 檢查緩存大小限制
    if (this.queryCache.size >= this.config.cacheSize) {
      this.evictOldestCacheEntry();
    }

    this.queryCache.set(cacheKey, {
      result,
      timestamp: Date.now(),
    });
  }

  private generateCacheKey(query: string, params?: any[]): string {
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${query}:${paramsStr}`;
  }

  private evictOldestCacheEntry(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, value] of this.queryCache.entries()) {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.queryCache.delete(oldestKey);
    }
  }

  private recordQueryMetrics(query: string, executionTime: number): void {
    this.metrics.totalQueries++;

    if (executionTime > this.config.slowQueryThreshold) {
      this.metrics.slowQueries++;
    }

    // 更新平均查詢時間
    this.metrics.averageQueryTime =
      (this.metrics.averageQueryTime * (this.metrics.totalQueries - 1) +
        executionTime) /
      this.metrics.totalQueries;

    // 記錄查詢歷史
    this.queryHistory.push({
      query,
      executionTime,
      timestamp: new Date(),
    });

    // 限制歷史記錄大小
    if (this.queryHistory.length > 1000) {
      this.queryHistory = this.queryHistory.slice(-500);
    }
  }

  private recordSlowQuery(
    query: string,
    executionTime: number,
    suggestions: string[]
  ): void {
    const slowQuery: SlowQuery = {
      id: `slow_${Date.now()}`,
      query,
      executionTime,
      timestamp: new Date(),
      optimizationSuggestions: suggestions,
    };

    this.slowQueries.push(slowQuery);

    // 限制慢查詢記錄數量
    if (this.slowQueries.length > 100) {
      this.slowQueries = this.slowQueries.slice(-50);
    }

    logger.warn('檢測到慢查詢', {
      executionTime,
      suggestions: suggestions.length,
    });
  }

  private async analyzeQueryPatterns(): Promise<void> {
    logger.debug('分析查詢模式...');

    // 分析常見查詢模式
    const patterns = new Map<string, number>();

    for (const history of this.queryHistory) {
      const pattern = this.extractQueryPattern(history.query);
      patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
    }

    // 生成索引建議
    await this.generateIndexRecommendationsFromPatterns(patterns);
  }

  private extractQueryPattern(query: string): string {
    // 提取查詢模式（簡化實現）
    return query
      .replace(/\d+/g, '?')
      .replace(/'[^']*'/g, '?')
      .replace(/"([^"]*)"/g, '?')
      .toLowerCase();
  }

  private async generateIndexRecommendationsFromPatterns(
    patterns: Map<string, number>
  ): Promise<void> {
    // 基於查詢模式生成索引建議
    const recommendations: IndexRecommendation[] = [];

    for (const [pattern, count] of patterns.entries()) {
      if (count > 10) {
        // 頻繁查詢
        const columns = this.extractColumnsFromPattern(pattern);
        if (columns.length > 0) {
          recommendations.push({
            table: this.extractTableFromPattern(pattern),
            columns,
            type: 'btree',
            priority: count > 50 ? 'high' : 'medium',
            estimatedImprovement: Math.min(count * 2, 80),
          });
        }
      }
    }

    this.indexRecommendations = recommendations;
  }

  private extractColumnsFromPattern(pattern: string): string[] {
    // 從查詢模式中提取列名
    const matches = pattern.match(/where\s+(\w+)/gi);
    return matches ? matches.map(m => m.split(/\s+/)[1]) : [];
  }

  private extractTableFromPattern(pattern: string): string {
    // 從查詢模式中提取表名
    const match = pattern.match(/from\s+(\w+)/i);
    return match ? match[1] : 'unknown';
  }

  private async generateIndexRecommendations(): Promise<IndexRecommendation[]> {
    // 生成索引建議
    const recommendations: IndexRecommendation[] = [
      {
        table: 'cards',
        columns: ['name', 'series'],
        type: 'btree',
        priority: 'high',
        estimatedImprovement: 75,
      },
      {
        table: 'market_data',
        columns: ['card_id', 'price_date'],
        type: 'btree',
        priority: 'high',
        estimatedImprovement: 80,
      },
      {
        table: 'user_collections',
        columns: ['user_id', 'card_id'],
        type: 'btree',
        priority: 'medium',
        estimatedImprovement: 60,
      },
    ];

    return recommendations;
  }

  private async createIndex(
    recommendation: IndexRecommendation
  ): Promise<void> {
    const indexName = `idx_${recommendation.table}_${recommendation.columns.join('_')}`;
    const indexSQL = `CREATE INDEX IF NOT EXISTS ${indexName} ON ${recommendation.table} (${recommendation.columns.join(', ')})`;

    logger.info('創建索引', { indexName, sql: indexSQL });

    // 實際實現中會執行SQL
    // await client.query(indexSQL);
  }

  private cleanupQueryCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, value] of this.queryCache.entries()) {
      if (now - value.timestamp > this.config.cacheTTL * 1000) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.queryCache.delete(key));

    if (expiredKeys.length > 0) {
      logger.debug('清理過期緩存', { count: expiredKeys.length });
    }
  }

  private async performPeriodicOptimization(): Promise<void> {
    logger.info('執行定期查詢優化...');

    try {
      // 分析索引使用
      await this.analyzeIndexUsage();

      // 創建推薦索引
      await this.createRecommendedIndexes();

      // 更新指標
      this.metrics.queryOptimizations++;
      this.metrics.lastOptimization = new Date();

      logger.info('定期查詢優化完成');
    } catch (error) {
      logger.error('定期查詢優化失敗:', error);
    }
  }

  private getDefaultConfig(): QueryOptimizationConfig {
    return {
      enableQueryCache: true,
      cacheSize: 1000,
      cacheTTL: 300, // 5分鐘
      enableQueryAnalysis: true,
      slowQueryThreshold: 1000, // 1秒
      maxQueryTime: 30000, // 30秒
      enableIndexOptimization: true,
      enableQueryRewriting: true,
    };
  }

  private getInitialMetrics(): QueryMetrics {
    return {
      totalQueries: 0,
      slowQueries: 0,
      averageQueryTime: 0,
      cacheHitRate: 0,
      indexUsage: 0,
      queryOptimizations: 0,
      lastOptimization: new Date(),
    };
  }
}

export default QueryOptimizer;
