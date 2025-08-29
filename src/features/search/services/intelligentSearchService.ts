import type {
  AutoCompleteOption,
  Entity,
  IntelligentSearchConfig,
  IntelligentSearchFilters,
  IntelligentSearchQuery,
  IntelligentSearchResponse,
  IntelligentSearchResult,
  IntelligentSearchStats,
  PopularSearchItem,
  QueryAnalysis,
  QueryCorrection,
  RelatedSearchItem,
  SearchContext,
  SearchHistoryItem,
  SearchIntent,
  SemanticMatch,
  UserSearchPreferences,
} from '../types/intelligentSearch';
import type { SearchFilters, SearchQuery, SearchResult } from '../types/search';

import { FullTextSearchService } from './fullTextSearchService';

export class IntelligentSearchService {
  private static instance: IntelligentSearchService;
  private config: IntelligentSearchConfig;
  private readonly searchHistory: Map<string, SearchHistoryItem[]>;
  private readonly userPreferences: Map<string, UserSearchPreferences>;
  private popularSearches: PopularSearchItem[];
  private searchStats: IntelligentSearchStats;
  private readonly cache: Map<string, IntelligentSearchResponse>;
  private isInitialized = false;
  private readonly fullTextSearchService: FullTextSearchService;

  private constructor() {
    this.config = {
      semanticSearchEnabled: true,
      personalizationEnabled: true,
      autoCompleteEnabled: true,
      searchHistoryEnabled: true,
      suggestionsEnabled: true,
      cacheEnabled: true,
      maxSuggestions: 10,
      maxHistoryItems: 50,
      maxResults: 100,
      semanticThreshold: 0.7,
      relevanceThreshold: 0.5,
      cacheTTL: 300000, // 5 minutes
      personalizationWeight: 0.3,
      popularityWeight: 0.2,
      recencyWeight: 0.1,
      semanticWeight: 0.4,
    };

    this.searchHistory = new Map();
    this.userPreferences = new Map();
    this.popularSearches = [];
    this.cache = new Map();
    this.fullTextSearchService = FullTextSearchService.getInstance();

    this.searchStats = {
      totalQueries: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      semanticUsageRate: 0,
      personalizationUsageRate: 0,
      userSatisfactionScore: 0,
      topQueries: [],
      searchTrends: [],
      categoryDistribution: [],
      timeDistribution: [],
    };

    // 初始化熱門搜索數據
    this.initializePopularSearches();
  }

  public static getInstance(): IntelligentSearchService {
    if (!IntelligentSearchService.instance) {
      IntelligentSearchService.instance = new IntelligentSearchService();
    }
    return IntelligentSearchService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // 初始化全文搜索服務
      await this.fullTextSearchService.initialize();

      // 初始化搜索統計
      await this.initializeSearchStats();

      // 初始化緩存清理
      this.initializeCache();

      this.isInitialized = true;
      return true;
    } catch (error) {
      this.isInitialized = false;
      console.error('智能搜索服務初始化失敗:', error);
      return false;
    }
  }

  private async initializeSearchStats(): Promise<void> {
    // 模擬加載搜索統計數據
    this.searchStats = {
      totalQueries: 15420,
      averageResponseTime: 85,
      cacheHitRate: 0.75,
      semanticUsageRate: 0.45,
      personalizationUsageRate: 0.38,
      userSatisfactionScore: 4.2,
      topQueries: [
        {
          query: 'Pokemon Charizard',
          count: 1250,
          trend: 'up',
          category: 'Pokemon',
          relatedQueries: ['Charizard V', 'Charizard GX'],
          lastUpdated: Date.now(),
        },
        {
          query: 'Yu-Gi-Oh Blue Eyes',
          count: 980,
          trend: 'stable',
          category: 'Yu-Gi-Oh',
          relatedQueries: ['Blue Eyes White Dragon', 'Blue Eyes Ultimate'],
          lastUpdated: Date.now(),
        },
        {
          query: 'Magic Black Lotus',
          count: 750,
          trend: 'down',
          category: 'Magic',
          relatedQueries: ['Black Lotus', 'Power Nine'],
          lastUpdated: Date.now(),
        },
      ],
      searchTrends: [
        { date: '2024-01-01', searches: 1500, uniqueUsers: 1200 },
        { date: '2024-01-02', searches: 1600, uniqueUsers: 1300 },
        { date: '2024-01-03', searches: 1400, uniqueUsers: 1100 },
      ],
      categoryDistribution: [
        { category: 'Pokemon', count: 5200, percentage: 34, trend: 'up' },
        { category: 'Yu-Gi-Oh', count: 3800, percentage: 25, trend: 'stable' },
        { category: 'Magic', count: 2900, percentage: 19, trend: 'down' },
        { category: 'Other', count: 3520, percentage: 22, trend: 'up' },
      ],
      timeDistribution: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: Math.floor(Math.random() * 1000) + 100,
        averageResponseTime: Math.floor(Math.random() * 50) + 50,
        peak: i >= 9 && i <= 18,
      })),
    };
  }

  private initializePopularSearches(): void {
    this.popularSearches = [
      {
        query: 'Pokemon Charizard',
        count: 1250,
        trend: 'up',
        category: 'Pokemon',
        relatedQueries: ['Charizard V', 'Charizard GX'],
        lastUpdated: Date.now(),
      },
      {
        query: 'Yu-Gi-Oh Blue Eyes',
        count: 980,
        trend: 'stable',
        category: 'Yu-Gi-Oh',
        relatedQueries: ['Blue Eyes White Dragon', 'Blue Eyes Ultimate'],
        lastUpdated: Date.now(),
      },
      {
        query: 'Magic Black Lotus',
        count: 750,
        trend: 'down',
        category: 'Magic',
        relatedQueries: ['Black Lotus', 'Power Nine'],
        lastUpdated: Date.now(),
      },
      {
        query: 'Pokemon Pikachu',
        count: 680,
        trend: 'up',
        category: 'Pokemon',
        relatedQueries: ['Pikachu V', 'Pikachu GX'],
        lastUpdated: Date.now(),
      },
      {
        query: 'Yu-Gi-Oh Dark Magician',
        count: 520,
        trend: 'stable',
        category: 'Yu-Gi-Oh',
        relatedQueries: ['Dark Magician Girl', 'Dark Magic Attack'],
        lastUpdated: Date.now(),
      },
    ];
  }

  private initializeCache(): void {
    setInterval(() => {
      this.cleanExpiredCache();
    }, 60000); // 每分鐘清理一次
  }

  async search(
    query: IntelligentSearchQuery
  ): Promise<IntelligentSearchResponse> {
    const _startTime = Date.now();

    try {
      this.validateQuery(query);

      // 檢查緩存
      const _cacheKey = this.generateCacheKey(query);
      if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
        const _cachedResponse = this.cache.get(cacheKey)!;
        this.updateSearchStats(true, Date.now() - startTime);
        return { ...cachedResponse, cacheHit: true };
      }

      // 分析查詢
      const _queryAnalysis = await this.analyzeQuery(query.query);

      // 執行基礎搜索
      const baseSearchQuery: SearchQuery = {
        query: query.query,
        filters: query.filters ? this.convertFilters(query.filters) : undefined,
        sortBy: { field: 'relevance', direction: 'desc' },
        page: 1,
        limit: query.limit || this.config.maxResults,
      };

      const _baseResponse =
        await this.fullTextSearchService.search(baseSearchQuery);

      // 確保 baseResponse.results 存在
      if (!baseResponse?.results) {
        // 返回空結果而不是拋出錯誤
        const emptyResponse: IntelligentSearchResponse = {
          results: [],
          suggestions: (
            await this.getSuggestions(query.query, query.context)
          ).map(suggestion => ({
            text: suggestion.text,
            type: 'query' as const,
            score: suggestion.relevance,
            metadata: suggestion.metadata,
          })),
          semanticMatches: [],
          autoComplete: await this.getAutoComplete(query.query, query.context),
          searchHistory: query.userId
            ? await this.getSearchHistory(query.userId)
            : [],
          popularSearches: await this.getPopularSearches(
            query.context?.category
          ),
          relatedSearches: await this.getRelatedSearches(query.query),
          searchStats: this.searchStats,
          queryAnalysis: await this.analyzeQuery(query.query),
          personalizationScore: 0,
          responseTime: Date.now() - startTime,
          cacheHit: false,
        };
        return emptyResponse;
      }

      // 應用智能功能
      const _results = await this.applyIntelligentFeatures(
        baseResponse.results,
        query,
        queryAnalysis
      );

      // 生成響應
      const response: IntelligentSearchResponse = {
        results,
        suggestions: (
          await this.getSuggestions(query.query, query.context)
        ).map(suggestion => ({
          text: suggestion.text,
          type: 'query' as const,
          score: suggestion.relevance,
          metadata: suggestion.metadata,
        })),
        semanticMatches: await this.generateSemanticMatches(
          query.query,
          queryAnalysis
        ),
        autoComplete: await this.getAutoComplete(query.query, query.context),
        searchHistory: query.userId
          ? await this.getSearchHistory(query.userId)
          : [],
        popularSearches: await this.getPopularSearches(query.context?.category),
        relatedSearches: await this.getRelatedSearches(query.query),
        searchStats: this.searchStats,
        queryAnalysis,
        personalizationScore: 0,
        responseTime: Date.now() - startTime,
        cacheHit: false,
      };

      // 緩存結果
      if (this.config.cacheEnabled) {
        this.cache.set(cacheKey, response);
      }

      // 保存搜索歷史
      if (query.userId && this.config.searchHistoryEnabled) {
        await this.saveSearchHistory(
          query.userId,
          query.query,
          results.map(r => r.id)
        );
      }

      // 更新統計
      this.updateSearchStats(false, response.responseTime);

      return response;
    } catch (error) {
      const errorResponse: IntelligentSearchResponse = {
        results: [],
        suggestions: [],
        semanticMatches: [],
        autoComplete: [],
        searchHistory: [],
        popularSearches: [],
        relatedSearches: [],
        searchStats: this.searchStats,
        queryAnalysis: await this.analyzeQuery(query.query),
        personalizationScore: 0,
        responseTime: Date.now() - startTime,
        cacheHit: false,
      };

      throw new Error(
        `智能搜索失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
      );
    }
  }

  private validateQuery(query: IntelligentSearchQuery): void {
    if (!query.query || query.query.trim().length === 0) {
      throw new Error('搜索查詢不能為空');
    }

    if (query.query.length > 500) {
      throw new Error('搜索查詢過長');
    }

    if (!this.isInitialized) {
      throw new Error('智能搜索服務尚未初始化');
    }
  }

  private async applyIntelligentFeatures(
    baseResults: SearchResult[],
    query: IntelligentSearchQuery,
    analysis: QueryAnalysis
  ): Promise<IntelligentSearchResult[]> {
    const results: IntelligentSearchResult[] = [];

    for (const result of baseResults) {
      // 計算各種分數
      const _relevanceScore = this.calculateRelevanceScore(result, query.query);
      const _semanticScore = await this.calculateSemanticScore(result, analysis);
      const _personalizationScore = await this.calculatePersonalizationScore(
        query,
        [result]
      );

      // 計算最終分數
      const _finalScore = this.calculateFinalScore(
        relevanceScore,
        semanticScore,
        personalizationScore
      );

      // 應用過濾器
      if (
        finalScore >=
        (query.filters?.relevanceThreshold || this.config.relevanceThreshold)
      ) {
        const intelligentResult: IntelligentSearchResult = {
          id: result.id,
          title: result.title,
          description: result.description,
          category: result.type, // 使用 type 作為 category
          price: result.price || 0,
          condition: result.condition || 'good',
          rarity: result.rarity || 'common',
          set: result.set || 'unknown',
          artist: 'Unknown', // SearchResult 沒有 artist 屬性
          language: result.language || 'en',
          imageUrl: result.image,
          relevanceScore: result.score,
          semanticScore: 0,
          personalizationScore: 0,
          finalScore: result.score,
          highlights: result.highlights || [],
          metadata: result.metadata || {},
          availability: true,
          location: result.location,
          seller: result.seller,
          rating: undefined,
          reviewCount: undefined,
        };

        results.push(intelligentResult);
      }
    }

    // 按最終分數排序
    return results.sort((a, b) => b.finalScore - a.finalScore);
  }

  private calculateRelevanceScore(result: SearchResult, query: string): number {
    const _queryLower = query.toLowerCase();
    const _titleLower = result.title.toLowerCase();
    const _descriptionLower = result.description.toLowerCase();

    let score = 0;

    // 標題匹配
    if (titleLower.includes(queryLower)) {
      score += 0.6;
    }

    // 描述匹配
    if (descriptionLower.includes(queryLower)) {
      score += 0.3;
    }

    // 精確匹配加分
    if (titleLower === queryLower) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  private async calculateSemanticScore(
    result: SearchResult,
    analysis: QueryAnalysis
  ): Promise<number> {
    if (!this.config.semanticSearchEnabled) {
      return 0;
    }

    // 簡單的語義匹配邏輯
    const { entities } = analysis;
    let score = 0;

    for (const entity of entities) {
      switch (entity.type) {
        case 'card_name':
          if (
            result.title
              .toLowerCase()
              .includes(
                entity.normalizedValue?.toLowerCase() ||
                  entity.text.toLowerCase()
              )
          ) {
            score += 0.4;
          }
          break;
        case 'artist':
          // SearchResult 沒有 artist 屬性，跳過
          break;
        case 'set':
          if (
            result.set
              ?.toLowerCase()
              .includes(
                entity.normalizedValue?.toLowerCase() ||
                  entity.text.toLowerCase()
              )
          ) {
            score += 0.2;
          }
          break;
        case 'rarity':
          if (
            result.rarity
              ?.toLowerCase()
              .includes(
                entity.normalizedValue?.toLowerCase() ||
                  entity.text.toLowerCase()
              )
          ) {
            score += 0.1;
          }
          break;
      }
    }

    return Math.min(score, 1.0);
  }

  private async calculatePersonalizationScore(
    query: IntelligentSearchQuery,
    results: unknown[]
  ): Promise<number> {
    if (!this.config.personalizationEnabled || !query.userId) {
      return 0;
    }

    const _preferences = await this.getUserPreferences(query.userId);
    if (!preferences?.personalizationEnabled) {
      return 0;
    }

    let score = 0;

    // 基於用戶偏好的評分
    for (const result of results) {
      if (preferences.preferredCategories?.includes(result.category)) {
        score += 0.2;
      }
      if (preferences.preferredRarity?.includes(result.rarity)) {
        score += 0.1;
      }
      if (preferences.preferredSets?.includes(result.set)) {
        score += 0.1;
      }
      if (preferences.preferredArtists?.includes(result.artist)) {
        score += 0.1;
      }
    }

    return Math.min(score / results.length, 1.0);
  }

  private calculateFinalScore(
    relevanceScore: number,
    semanticScore: number,
    personalizationScore: number
  ): number {
    return (
      relevanceScore *
        (1 - this.config.semanticWeight - this.config.personalizationWeight) +
      semanticScore * this.config.semanticWeight +
      personalizationScore * this.config.personalizationWeight
    );
  }

  async getSuggestions(
    query: string,
    context?: SearchContext
  ): Promise<AutoCompleteOption[]> {
    const suggestions: AutoCompleteOption[] = [];

    // 基於熱門搜索的建議
    const _popularMatches = this.popularSearches
      .filter(item => item.query.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
      .map(item => ({
        text: item.query,
        type: 'popular' as const,
        relevance: item.count / 1000,
        category: item.category,
        icon: '🔥',
      }));

    suggestions.push(...popularMatches);

    // 基於搜索歷史的建議
    if (context?.sessionId) {
      const _history = this.searchHistory.get(context.sessionId) || [];
      const _historyMatches = history
        .filter(item => item.query.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 2)
        .map(item => ({
          text: item.query,
          type: 'history' as const,
          relevance: 0.8,
          icon: '🕒',
        }));

      suggestions.push(...historyMatches);
    }

    // 語義建議
    if (this.config.semanticSearchEnabled) {
      const _semanticSuggestions = this.generateSemanticSuggestions(query);
      suggestions.push(...semanticSuggestions);
    }

    // 排序並限制數量
    return suggestions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, this.config.maxSuggestions);
  }

  private generateSemanticSuggestions(query: string): AutoCompleteOption[] {
    // 簡單的語義建議邏輯
    const suggestions: AutoCompleteOption[] = [];

    const semanticMap: Record<string, string[]> = {
      charizard: ['Charizard V', 'Charizard GX', 'Charizard VMAX'],
      'blue eyes': [
        'Blue Eyes White Dragon',
        'Blue Eyes Ultimate Dragon',
        'Blue Eyes Alternative',
      ],
      'black lotus': ['Black Lotus', 'Power Nine', 'Mox Pearl'],
      pikachu: ['Pikachu V', 'Pikachu GX', 'Pikachu VMAX'],
      'dark magician': [
        'Dark Magician',
        'Dark Magician Girl',
        'Dark Magic Attack',
      ],
    };

    for (const [key, values] of Object.entries(semanticMap)) {
      if (query.toLowerCase().includes(key)) {
        values.forEach(value => {
          suggestions.push({
            text: value,
            type: 'semantic',
            relevance: 0.7,
            icon: '🧠',
          });
        });
      }
    }

    return suggestions;
  }

  async getSearchHistory(userId: string): Promise<SearchHistoryItem[]> {
    if (!this.config.searchHistoryEnabled) {
      return [];
    }

    const _history = this.searchHistory.get(userId) || [];
    return history
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, this.config.maxHistoryItems);
  }

  async saveSearchHistory(
    userId: string,
    query: string,
    results: string[]
  ): Promise<void> {
    if (!this.config.searchHistoryEnabled) {
      return;
    }

    const _history = this.searchHistory.get(userId) || [];
    const historyItem: SearchHistoryItem = {
      query,
      timestamp: Date.now(),
      resultCount: results.length,
      clickedResults: [],
      success: results.length > 0,
    };

    history.unshift(historyItem);

    // 限制歷史記錄數量
    if (history.length > this.config.maxHistoryItems) {
      history.splice(this.config.maxHistoryItems);
    }

    this.searchHistory.set(userId, history);
  }

  async getPopularSearches(category?: string): Promise<PopularSearchItem[]> {
    if (category) {
      return this.popularSearches.filter(item => item.category === category);
    }
    return this.popularSearches;
  }

  async getRelatedSearches(query: string): Promise<RelatedSearchItem[]> {
    const related: RelatedSearchItem[] = [];

    // 基於查詢詞生成相關搜索
    const _queryLower = query.toLowerCase();

    if (queryLower.includes('charizard')) {
      related.push({
        query: 'Charizard V',
        relevance: 0.9,
        category: 'Pokemon',
        reason: '相關卡牌',
        suggestedFilters: { category: ['Pokemon'] },
      });
    }

    if (queryLower.includes('blue eyes')) {
      related.push({
        query: 'Blue Eyes White Dragon',
        relevance: 0.9,
        category: 'Yu-Gi-Oh',
        reason: '相關卡牌',
        suggestedFilters: { category: ['Yu-Gi-Oh'] },
      });
    }

    return related.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
  }

  async analyzeQuery(query: string): Promise<QueryAnalysis> {
    const _tokens = query.toLowerCase().split(/\s+/);
    const entities: Entity[] = [];

    // 簡單的實體識別
    const _entityPatterns = [
      { pattern: /charizard/i, type: 'card_name' as const, value: 'Charizard' },
      {
        pattern: /blue\s*eyes/i,
        type: 'card_name' as const,
        value: 'Blue Eyes',
      },
      {
        pattern: /black\s*lotus/i,
        type: 'card_name' as const,
        value: 'Black Lotus',
      },
      { pattern: /pikachu/i, type: 'card_name' as const, value: 'Pikachu' },
      {
        pattern: /dark\s*magician/i,
        type: 'card_name' as const,
        value: 'Dark Magician',
      },
      { pattern: /pokemon/i, type: 'category' as const, value: 'Pokemon' },
      {
        pattern: /yu\s*gi\s*oh/i,
        type: 'category' as const,
        value: 'Yu-Gi-Oh',
      },
      { pattern: /magic/i, type: 'category' as const, value: 'Magic' },
    ];

    for (const pattern of entityPatterns) {
      const _match = query.match(pattern.pattern);
      if (match) {
        entities.push({
          text: match[0],
          type: pattern.type,
          confidence: 0.8,
          start: match.index || 0,
          end: (match.index || 0) + match[0].length,
          normalizedValue: pattern.value,
        });
      }
    }

    // 確定搜索意圖
    const _intent = this.determineSearchIntent(query, entities);

    // 生成建議和糾正
    const _suggestions = this.generateQuerySuggestions(query);
    const _corrections = this.generateQueryCorrections(query);

    return {
      originalQuery: query,
      normalizedQuery: query.toLowerCase().trim(),
      tokens,
      entities,
      intent,
      confidence: 0.8,
      suggestions,
      corrections,
      language: 'zh-TW',
      complexity:
        tokens.length <= 2
          ? 'simple'
          : tokens.length <= 4
            ? 'moderate'
            : 'complex',
    };
  }

  private determineSearchIntent(
    query: string,
    entities: Entity[]
  ): SearchIntent {
    const _queryLower = query.toLowerCase();

    if (
      queryLower.includes('價格') ||
      queryLower.includes('price') ||
      queryLower.includes('多少錢')
    ) {
      return {
        primary: 'compare_prices',
        confidence: 0.9,
        filters: {},
      };
    }

    if (
      queryLower.includes('便宜') ||
      queryLower.includes('deal') ||
      queryLower.includes('優惠')
    ) {
      return {
        primary: 'find_deals',
        confidence: 0.8,
        filters: {},
      };
    }

    if (entities.some(e => e.type === 'category')) {
      return {
        primary: 'explore_category',
        confidence: 0.7,
        filters: {},
      };
    }

    return {
      primary: 'find_card',
      confidence: 0.6,
      filters: {},
    };
  }

  private generateQuerySuggestions(query: string): string[] {
    const suggestions: string[] = [];
    const _queryLower = query.toLowerCase();

    if (queryLower.includes('charizard')) {
      suggestions.push('Charizard V', 'Charizard GX', 'Charizard VMAX');
    }

    if (queryLower.includes('blue eyes')) {
      suggestions.push('Blue Eyes White Dragon', 'Blue Eyes Ultimate Dragon');
    }

    return suggestions.slice(0, 3);
  }

  private generateQueryCorrections(query: string): QueryCorrection[] {
    const corrections: QueryCorrection[] = [];

    // 簡單的拼寫糾正
    const correctionMap: Record<string, string> = {
      charzard: 'charizard',
      'blu eyes': 'blue eyes',
      pikach: 'pikachu',
    };

    for (const [wrong, correct] of Object.entries(correctionMap)) {
      if (query.toLowerCase().includes(wrong)) {
        corrections.push({
          original: wrong,
          corrected: correct,
          confidence: 0.9,
          reason: '拼寫糾正',
          suggestion: true,
        });
      }
    }

    return corrections;
  }

  async getAutoComplete(
    query: string,
    context?: SearchContext
  ): Promise<AutoCompleteOption[]> {
    return this.getSuggestions(query, context);
  }

  async updateUserPreferences(
    userId: string,
    preferences: UserSearchPreferences
  ): Promise<void> {
    this.userPreferences.set(userId, {
      ...this.userPreferences.get(userId),
      ...preferences,
    });
  }

  async getUserPreferences(userId: string): Promise<UserSearchPreferences> {
    return (
      this.userPreferences.get(userId) || {
        personalizationEnabled: true,
        searchHistoryWeight: 0.3,
        popularityWeight: 0.2,
        recencyWeight: 0.1,
      }
    );
  }

  async getSearchStats(): Promise<IntelligentSearchStats> {
    return this.searchStats;
  }

  async clearSearchHistory(userId: string): Promise<void> {
    this.searchHistory.delete(userId);
  }

  getConfig(): IntelligentSearchConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<IntelligentSearchConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private convertFilters(filters: IntelligentSearchFilters): SearchFilters {
    return {
      priceRange: undefined,
      condition: undefined,
      category: undefined,
      rarity: undefined,
      set: undefined,
      language: undefined,
      location: undefined,
    };
  }

  private async generateSemanticMatches(
    query: string,
    analysis: QueryAnalysis
  ): Promise<SemanticMatch[]> {
    const matches: SemanticMatch[] = [];

    // 基於實體生成語義匹配
    for (const entity of analysis.entities) {
      if (entity.type === 'card_name') {
        matches.push({
          query: entity.normalizedValue || entity.text,
          originalQuery: query,
          similarity: 0.8,
          confidence: entity.confidence,
          explanation: `找到相關卡牌: ${entity.normalizedValue || entity.text}`,
          suggestedFilters: {
            category: entity.type === 'card_name' ? ['Pokemon'] : undefined,
          },
        });
      }
    }

    return matches;
  }

  private generateCacheKey(query: IntelligentSearchQuery): string {
    return JSON.stringify({
      query: query.query,
      userId: query.userId,
      context: query.context,
      filters: query.filters,
      limit: query.limit,
    });
  }

  private cleanExpiredCache(): void {
    const _now = Date.now();
    for (const [key, response] of this.cache.entries()) {
      if (now - response.responseTime > this.config.cacheTTL) {
        this.cache.delete(key);
      }
    }
  }

  private updateSearchStats(cacheHit: boolean, responseTime: number): void {
    this.searchStats.totalQueries++;
    this.searchStats.averageResponseTime =
      (this.searchStats.averageResponseTime *
        (this.searchStats.totalQueries - 1) +
        responseTime) /
      this.searchStats.totalQueries;

    if (cacheHit) {
      this.searchStats.cacheHitRate =
        (this.searchStats.cacheHitRate * (this.searchStats.totalQueries - 1) +
          1) /
        this.searchStats.totalQueries;
    } else {
      this.searchStats.cacheHitRate =
        (this.searchStats.cacheHitRate * (this.searchStats.totalQueries - 1)) /
        this.searchStats.totalQueries;
    }
  }

  getInitializationStatus(): boolean {
    return this.isInitialized;
  }
}
