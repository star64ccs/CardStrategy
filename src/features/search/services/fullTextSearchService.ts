import type {
  SearchQuery,
  SearchResponse,
  SearchResult,
  SearchFilters,
  SortOption,
  SearchHighlight,
  SearchFacets,
  FacetItem,
  SearchStats,
  SearchIndex,
  SearchConfig,
  SearchError,
} from '../types/search';
import {
  SearchSuggestion,
  SearchMetrics,
  CardCondition,
} from '../types/search';

export class FullTextSearchService {
  private static instance: FullTextSearchService;
  private config: SearchConfig;
  private readonly searchIndex: Map<string, SearchResult[]>;
  private readonly searchHistory: Map<string, any[]>;
  private readonly cache: Map<string, SearchResponse>;
  private isInitialized = false;

  private constructor() {
    this.config = {
      maxResults: 1000,
      defaultLimit: 20,
      maxQueryLength: 500,
      enableFuzzySearch: true,
      enableAutocomplete: true,
      enableSuggestions: true,
      enableFacets: true,
      enableHighlights: true,
      cacheEnabled: true,
      cacheTTL: 300000, // 5 minutes
      indexRefreshInterval: 300000, // 5 minutes
    };
    this.searchIndex = new Map();
    this.searchHistory = new Map();
    this.cache = new Map();
  }

  public static getInstance(): FullTextSearchService {
    if (!FullTextSearchService.instance) {
      FullTextSearchService.instance = new FullTextSearchService();
    }
    return FullTextSearchService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('FullTextSearchService 初始化開始...');

      // InitializeSearchIndex
      await this.initializeSearchIndex();

      // 加載SearchConfigure
      await this.loadSearchConfig();

      // InitializeCache
      this.initializeCache();

      this.isInitialized = true;
      console.log('FullTextSearchService 初始化完成');
      return true;
    } catch (error) {
      console.error('FullTextSearchService InitializeFailed:', error);
      return false;
    }
  }

  private async initializeSearchIndex(): Promise<void> {
    // 模擬InitializeSearchIndex
    const mockData: SearchResult[] = [
      {
        id: '1',
        type: 'card',
        title: 'Pokemon Charizard Holo',
        description: 'Rare holographic Charizard card from Base Set',
        image: 'https://example.com/charizard.jpg',
        price: 1500,
        currency: 'USD',
        condition: 'near_mint',
        rarity: 'Holo Rare',
        set: 'Base Set',
        year: 1999,
        language: 'English',
        location: 'US',
        seller: 'cardmaster',
        tags: ['pokemon', 'charizard', 'holographic'],
        score: 0.95,
        highlights: [],
        metadata: {},
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-12-01'),
      },
      {
        id: '2',
        type: 'card',
        title: 'Yu-Gi-Oh Blue-Eyes White Dragon',
        description: 'Legendary Blue-Eyes White Dragon card',
        image: 'https://example.com/blue-eyes.jpg',
        price: 800,
        currency: 'USD',
        condition: 'excellent',
        rarity: 'Ultra Rare',
        set: 'Legend of Blue Eyes White Dragon',
        year: 2002,
        language: 'English',
        location: 'US',
        seller: 'yugioh_expert',
        tags: ['yugioh', 'blue-eyes', 'dragon'],
        score: 0.92,
        highlights: [],
        metadata: {},
        createdAt: new Date('2023-02-01'),
        updatedAt: new Date('2023-11-15'),
      },
      {
        id: '3',
        type: 'card',
        title: 'Magic: The Gathering Black Lotus',
        description: 'The most valuable Magic card ever printed',
        image: 'https://example.com/black-lotus.jpg',
        price: 50000,
        currency: 'USD',
        condition: 'mint',
        rarity: 'Rare',
        set: 'Alpha',
        year: 1993,
        language: 'English',
        location: 'US',
        seller: 'mtg_collector',
        tags: ['magic', 'black-lotus', 'power-nine'],
        score: 0.98,
        highlights: [],
        metadata: {},
        createdAt: new Date('2023-03-01'),
        updatedAt: new Date('2023-10-20'),
      },
    ];

    this.searchIndex.set('cards', mockData);
    console.log(`搜索索引初始化完成，載入 ${mockData.length} 個文檔`);
  }

  private async loadSearchConfig(): Promise<void> {
    // 模擬從ConfigureFile或Database加載Configure
    console.log('搜索配置載入完成');
  }

  private initializeCache(): void {
    // InitializeCache系統
    setInterval(() => {
      this.cleanExpiredCache();
    }, 60000); // 每Minute清理過期Cache
    console.log('緩存系統初始化完成');
  }

  async search(query: SearchQuery): Promise<SearchResponse> {
    const _startTime = Date.now();

    try {
      if (!this.isInitialized) {
        throw new Error('搜索Service未Initialize');
      }

      // VerifyQuery
      this.validateQuery(query);

      // CheckCache
      const _cacheKey = this.generateCacheKey(query);
      if (this.config.cacheEnabled && this.cache.has(cacheKey)) {
        const _cachedResponse = this.cache.get(cacheKey)!;
        console.log('從緩存返回搜索結果');
        return cachedResponse;
      }

      // 執RowSearch
      const _results = await this.executeSearch(query);

      // ApplyFilter器
      const _filteredResults = this.applyFilters(results, query.filters);

      // ApplySort
      const _sortedResults = this.applySorting(filteredResults, query.sortBy);

      // Paginate
      const _paginatedResults = this.applyPagination(
        sortedResults,
        query.page,
        query.limit
      );

      // 生成高亮
      const _resultsWithHighlights = this.generateHighlights(
        paginatedResults,
        query.query
      );

      // 生成分面
      const _facets = this.generateFacets(filteredResults, query.filters);

      // 生成建議
      const _suggestions = this.generateSuggestions(
        query.query,
        filteredResults
      );

      const _searchTime = Date.now() - startTime;

      const response: SearchResponse = {
        results: resultsWithHighlights,
        total: filteredResults.length,
        page: query.page || 1,
        limit: query.limit || this.config.defaultLimit,
        totalPages: Math.ceil(
          filteredResults.length / (query.limit || this.config.defaultLimit)
        ),
        query: query.query,
        filters: query.filters || {},
        sortBy: query.sortBy || { field: 'score', direction: 'desc' },
        searchTime,
        suggestions,
        facets,
      };

      // Cache結果
      if (this.config.cacheEnabled) {
        this.cache.set(cacheKey, response);
      }

      // RecordSearch歷史
      this.recordSearchHistory(query, response);

      return response;
    } catch (error) {
      const searchError: SearchError = {
        code: 'SEARCH_ERROR',
        message: error instanceof Error ? error.message : '搜索執行Failed',
        details: { query },
        timestamp: new Date(),
      };
      throw searchError;
    }
  }

  private validateQuery(query: SearchQuery): void {
    if (!query.query || query.query.trim().length === 0) {
      throw new Error('搜索查詢不能為空');
    }

    if (query.query.length > this.config.maxQueryLength) {
      throw new Error(
        `搜索查詢長度不能超過 ${this.config.maxQueryLength} 個字符`
      );
    }
  }

  private async executeSearch(query: SearchQuery): Promise<SearchResult[]> {
    const _searchTerm = query.query.toLowerCase();
    const _allResults = this.searchIndex.get('cards') || [];

    // 簡單的全文Search實現
    const _results = allResults.filter(result => {
      const _searchableText = [
        result.title,
        result.description,
        result.set,
        result.rarity,
        result.language,
        result.location,
        result.seller,
        ...(result.tags || []),
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(searchTerm);
    });

    // 計算相Off性分數
    return results.map(result => ({
      ...result,
      score: this.calculateRelevanceScore(result, searchTerm),
    }));
  }

  private calculateRelevanceScore(
    result: SearchResult,
    searchTerm: string
  ): number {
    let score = 0;
    const _searchableText = [
      result.title,
      result.description,
      result.set,
      result.rarity,
      result.language,
      result.location,
      result.seller,
      ...(result.tags || []),
    ]
      .join(' ')
      .toLowerCase();

    // 標題匹配
    if (result.title.toLowerCase().includes(searchTerm)) {
      score += 0.4;
    }

    // Description匹配
    if (result.description.toLowerCase().includes(searchTerm)) {
      score += 0.2;
    }

    // Tag匹配
    if (result.tags?.some(tag => tag.toLowerCase().includes(searchTerm))) {
      score += 0.3;
    }

    // 其他Field匹配
    if (searchableText.includes(searchTerm)) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  private applyFilters(
    results: SearchResult[],
    filters?: SearchFilters
  ): SearchResult[] {
    if (!filters) return results;

    return results.filter(result => {
      // 價格範圍Filter
      if (filters.priceRange) {
        const _price = result.price || 0;
        if (filters.priceRange.min && price < filters.priceRange.min)
          return false;
        if (filters.priceRange.max && price > filters.priceRange.max)
          return false;
      }

      // ConditionFilter
      if (filters.condition && filters.condition.length > 0) {
        if (
          !result.condition ||
          !filters.condition.includes(result.condition)
        ) {
          return false;
        }
      }

      // 稀有度Filter
      if (filters.rarity && filters.rarity.length > 0) {
        if (!result.rarity || !filters.rarity.includes(result.rarity)) {
          return false;
        }
      }

      // 系ColumnFilter
      if (filters.set && filters.set.length > 0) {
        if (!result.set || !filters.set.includes(result.set)) {
          return false;
        }
      }

      // YearFilter
      if (filters.year && filters.year.length > 0) {
        if (!result.year || !filters.year.includes(result.year)) {
          return false;
        }
      }

      // LanguageFilter
      if (filters.language && filters.language.length > 0) {
        if (!result.language || !filters.language.includes(result.language)) {
          return false;
        }
      }

      // 位置Filter
      if (filters.location && filters.location.length > 0) {
        if (!result.location || !filters.location.includes(result.location)) {
          return false;
        }
      }

      // 賣家Filter
      if (filters.seller && filters.seller.length > 0) {
        if (!result.seller || !filters.seller.includes(result.seller)) {
          return false;
        }
      }

      // TagFilter
      if (filters.tags && filters.tags.length > 0) {
        if (
          !result.tags ||
          !filters.tags.some(tag => result.tags.includes(tag))
        ) {
          return false;
        }
      }

      // True偽Filter
      if (filters.isAuthentic !== undefined) {
        // 這裡需要Root據實際Data結構調整
        // 暫時Skip這個Filter
      }

      // Graph片Filter
      if (filters.hasImage !== undefined) {
        if (filters.hasImage && !result.image) return false;
        if (!filters.hasImage && result.image) return false;
      }

      return true;
    });
  }

  private applySorting(
    results: SearchResult[],
    sortBy?: SortOption
  ): SearchResult[] {
    if (!sortBy) {
      return results.sort((a, b) => b.score - a.score);
    }

    return results.sort((a, b) => {
      let aValue: unknown;
      let bValue: unknown;

      switch (sortBy.field) {
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'year':
          aValue = a.year || 0;
          bValue = b.year || 0;
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        case 'updatedAt':
          aValue = a.updatedAt;
          bValue = b.updatedAt;
          break;
        default:
          aValue = a.score;
          bValue = b.score;
      }

      if (sortBy.direction === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }

  private applyPagination(
    results: SearchResult[],
    page?: number,
    limit?: number
  ): SearchResult[] {
    const _currentPage = page || 1;
    const _currentLimit = limit || this.config.defaultLimit;
    const _startIndex = (currentPage - 1) * currentLimit;
    const _endIndex = startIndex + currentLimit;

    return results.slice(startIndex, endIndex);
  }

  private generateHighlights(
    results: SearchResult[],
    query: string
  ): SearchResult[] {
    if (!this.config.enableHighlights) return results;

    const _searchTerms = query.toLowerCase().split(' ');

    return results.map(result => {
      const highlights: SearchHighlight[] = [];

      // 標題高亮
      if (result.title) {
        const _titleHighlight = this.createHighlight(
          result.title,
          searchTerms,
          'title'
        );
        if (titleHighlight) highlights.push(titleHighlight);
      }

      // Description高亮
      if (result.description) {
        const _descHighlight = this.createHighlight(
          result.description,
          searchTerms,
          'description'
        );
        if (descHighlight) highlights.push(descHighlight);
      }

      return {
        ...result,
        highlights,
      };
    });
  }

  private createHighlight(
    text: string,
    searchTerms: string[],
    field: string
  ): SearchHighlight | null {
    const _lowerText = text.toLowerCase();
    const matchedTerms: string[] = [];

    for (const term of searchTerms) {
      if (lowerText.includes(term)) {
        matchedTerms.push(term);
      }
    }

    if (matchedTerms.length === 0) return null;

    // 簡單的高亮實現
    let snippet = text;
    if (text.length > 100) {
      const _firstMatch = matchedTerms[0];
      const _matchIndex = lowerText.indexOf(firstMatch);
      const _start = Math.max(0, matchIndex - 50);
      const _end = Math.min(text.length, matchIndex + 50);
      snippet = `...${text.substring(start, end)}...`;
    }

    return {
      field,
      snippet,
      matchedTerms,
    };
  }

  private generateFacets(
    results: SearchResult[],
    filters?: SearchFilters
  ): SearchFacets {
    if (!this.config.enableFacets) {
      return {
        categories: [],
        conditions: [],
        rarities: [],
        sets: [],
        years: [],
        languages: [],
        locations: [],
        priceRanges: [],
      };
    }

    const facets: SearchFacets = {
      categories: this.generateFacetItems(results, 'type'),
      conditions: this.generateFacetItems(results, 'condition'),
      rarities: this.generateFacetItems(results, 'rarity'),
      sets: this.generateFacetItems(results, 'set'),
      years: this.generateFacetItems(results, 'year'),
      languages: this.generateFacetItems(results, 'language'),
      locations: this.generateFacetItems(results, 'location'),
      priceRanges: this.generatePriceRangeFacets(results),
    };

    return facets;
  }

  private generateFacetItems(
    results: SearchResult[],
    field: keyof SearchResult
  ): FacetItem[] {
    const _counts = new Map<string, number>();

    results.forEach(result => {
      const _value = result[field];
      if (value !== undefined && value !== null) {
        const _key = Array.isArray(value) ? value.join(',') : String(value);
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    });

    return Array.from(counts.entries())
      .map(([value, count]) => ({
        value,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }

  private generatePriceRangeFacets(results: SearchResult[]): FacetItem[] {
    const _ranges = [
      { label: 'Under $10', min: 0, max: 10 },
      { label: '$10 - $50', min: 10, max: 50 },
      { label: '$50 - $100', min: 50, max: 100 },
      { label: '$100 - $500', min: 100, max: 500 },
      { label: '$500 - $1000', min: 500, max: 1000 },
      { label: 'Over $1000', min: 1000, max: Infinity },
    ];

    return ranges
      .map(range => {
        const _count = results.filter(result => {
          const _price = result.price || 0;
          return price >= range.min && price < range.max;
        }).length;

        return {
          value: range.label,
          count,
        };
      })
      .filter(item => item.count > 0);
  }

  private generateSuggestions(
    query: string,
    results: SearchResult[]
  ): string[] {
    if (!this.config.enableSuggestions) return [];

    const _suggestions = new Set<string>();

    // 基於結果生成建議
    results.forEach(result => {
      if (result.title.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(result.title);
      }
      if (result.set?.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(result.set);
      }
      if (result.rarity?.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(result.rarity);
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }

  private generateCacheKey(query: SearchQuery): string {
    return JSON.stringify({
      query: query.query,
      filters: query.filters,
      sortBy: query.sortBy,
      page: query.page,
      limit: query.limit,
    });
  }

  private recordSearchHistory(
    query: SearchQuery,
    response: SearchResponse
  ): void {
    const _historyEntry = {
      query: query.query,
      filters: query.filters,
      resultsCount: response.total,
      searchTime: response.searchTime,
      timestamp: new Date(),
    };

    const _userId = 'anonymous'; // 實際Apply中應該從Authenticate系統Get
    if (!this.searchHistory.has(userId)) {
      this.searchHistory.set(userId, []);
    }

    const _userHistory = this.searchHistory.get(userId)!;
    userHistory.push(historyEntry);

    // Limit歷史Record數量
    if (userHistory.length > 100) {
      userHistory.splice(0, userHistory.length - 100);
    }
  }

  private cleanExpiredCache(): void {
    const _now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      // 簡單的Cache過期Check
      if (now - value.searchTime > this.config.cacheTTL) {
        this.cache.delete(key);
      }
    }
  }

  async getSearchStats(): Promise<SearchStats> {
    const _totalSearches = Array.from(this.searchHistory.values()).reduce(
      (total, history) => total + history.length,
      0
    );

    const _allSearchTimes = Array.from(this.searchHistory.values())
      .flat()
      .map(entry => entry.searchTime);

    const _averageResponseTime =
      allSearchTimes.length > 0
        ? allSearchTimes.reduce((sum, time) => sum + time, 0) /
          allSearchTimes.length
        : 0;

    const _popularQueries = this.getPopularQueries();
    const _searchTrends = this.getSearchTrends();
    const _userBehavior = this.getUserSearchBehavior();

    return {
      totalSearches,
      averageResponseTime,
      popularQueries,
      searchTrends,
      userBehavior,
    };
  }

  private getPopularQueries(): unknown[] {
    const _queryCounts = new Map<string, number>();

    Array.from(this.searchHistory.values())
      .flat()
      .forEach(entry => {
        const _count = queryCounts.get(entry.query) || 0;
        queryCounts.set(entry.query, count + 1);
      });

    return Array.from(queryCounts.entries())
      .map(([query, count]) => ({ query, count, trend: 'stable' as const }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getSearchTrends(): unknown[] {
    // 模擬Search趨勢Data
    return [
      { date: '2023-12-01', searches: 150, uniqueUsers: 120 },
      { date: '2023-12-02', searches: 180, uniqueUsers: 140 },
      { date: '2023-12-03', searches: 200, uniqueUsers: 160 },
    ];
  }

  private getUserSearchBehavior(): unknown {
    return {
      averageQueriesPerSession: 3.2,
      averageSessionDuration: 1200000, // 20 minutes
      conversionRate: 0.15,
      bounceRate: 0.25,
    };
  }

  async getSearchIndexes(): Promise<SearchIndex[]> {
    return [
      {
        id: 'cards',
        name: 'Cards Index',
        type: 'card',
        status: 'active',
        documentCount: this.searchIndex.get('cards')?.length || 0,
        lastUpdated: new Date(),
        size: 1024 * 1024, // 1MB
      },
    ];
  }

  async updateSearchIndex(indexName: string): Promise<boolean> {
    try {
      console.log(`更新搜索索引: ${indexName}`);
      // 模擬IndexUpdate
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error(`Update搜索索引Failed: ${indexName}`, error);
      return false;
    }
  }

  getInitializationStatus(): boolean {
    return this.isInitialized;
  }

  getConfig(): SearchConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<SearchConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
