import { FullTextSearchService } from '../services/fullTextSearchService';
import { IntelligentSearchService } from '../services/intelligentSearchService';
import type {
  IntelligentSearchQuery,
  SearchContext,
  UserSearchPreferences,
  IntelligentSearchConfig,
} from '../types/intelligentSearch';
import {
  IntelligentSearchResponse,
  IntelligentSearchFilters,
  AutoCompleteOption,
  SearchHistoryItem,
  PopularSearchItem,
  RelatedSearchItem,
  QueryAnalysis,
} from '../types/intelligentSearch';

// Mock FullTextSearchService
jest.mock('../services/fullTextSearchService');

describe('IntelligentSearchService', () => {
  let service: IntelligentSearchService;
  let mockFullTextSearchService: jest.Mocked<FullTextSearchService>;

  beforeEach(() => {
    jest.clearAllMocks();

    const mockInstance = {
      initialize: jest.fn().mockResolvedValue(true),
      search: jest.fn().mockResolvedValue({
        results: [
          {
            id: '1',
            title: 'Pokemon Charizard',
            description: 'A powerful fire-type Pokemon card',
            category: 'Pokemon',
            price: 150,
            condition: 'NM',
            rarity: 'Rare',
            set: 'Base Set',
            artist: 'Ken Sugimori',
            language: 'English',
            imageUrl: 'https://example.com/charizard.jpg',
            highlights: [],
            metadata: {},
            availability: true,
            location: 'Taiwan',
            seller: 'CardShop',
            rating: 4.5,
            reviewCount: 10,
          },
        ],
        totalResults: 1,
        searchTime: 50,
      }),
      getInitializationStatus: jest.fn().mockReturnValue(true),
    };

    mockFullTextSearchService = {
      getInstance: jest.fn().mockReturnValue(mockInstance),
    } as any;

    (FullTextSearchService.getInstance as jest.Mock).mockReturnValue(
      mockInstance
    );
    service = IntelligentSearchService.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('應該返回相同的實例', () => {
      const instance1 = IntelligentSearchService.getInstance();
      const instance2 = IntelligentSearchService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化', () => {
    it('應該成功初始化服務', async () => {
      const result = await service.initialize();
      expect(result).toBe(true);
      expect(service.getInitializationStatus()).toBe(true);
    });

    it('應該在初始化失敗時返回 false', async () => {
      // 清除單例實例
      (IntelligentSearchService as any).instance = undefined;

      const mockInstance = {
        initialize: jest
          .fn()
          .mockRejectedValue(new Error('Initialization failed')),
        search: jest.fn().mockResolvedValue({
          results: [],
          totalResults: 0,
          searchTime: 10,
        }),
        getInitializationStatus: jest.fn().mockReturnValue(false),
      };
      (FullTextSearchService.getInstance as jest.Mock).mockReturnValue(
        mockInstance
      );

      const newService = IntelligentSearchService.getInstance();
      const result = await newService.initialize();
      expect(result).toBe(false);
    });
  });

  describe('智能搜索', () => {
    beforeEach(async () => {
      // 確保服務已初始化
      if (!(service as any).isInitialized) {
        await service.initialize();
      }
    });

    it('應該執行基本智能搜索', async () => {
      const query: IntelligentSearchQuery = {
        query: 'Charizard',
        userId: 'user123',
      };

      const response = await service.search(query);

      expect(response).toBeDefined();
      expect(response.results).toBeDefined();
      expect(Array.isArray(response.results)).toBe(true);
      expect(response.suggestions).toBeDefined();
      expect(response.semanticMatches).toBeDefined();
      expect(response.autoComplete).toBeDefined();
      expect(response.searchHistory).toBeDefined();
      expect(response.popularSearches).toBeDefined();
      expect(response.relatedSearches).toBeDefined();
      expect(response.queryAnalysis).toBeDefined();
      expect(response.personalizationScore).toBeGreaterThanOrEqual(0);
      expect(response.responseTime).toBeGreaterThanOrEqual(0);
      expect(response.cacheHit).toBe(false);
    });

    it('應該處理空查詢', async () => {
      const query: IntelligentSearchQuery = {
        query: '',
        userId: 'user123',
      };

      await expect(service.search(query)).rejects.toThrow('搜索查詢不能為空');
    });

    it('應該處理過長的查詢', async () => {
      const longQuery = 'a'.repeat(501);
      const query: IntelligentSearchQuery = {
        query: longQuery,
        userId: 'user123',
      };

      await expect(service.search(query)).rejects.toThrow('搜索查詢過長');
    });

    it('應該在未初始化時拋出錯誤', async () => {
      const newService = IntelligentSearchService.getInstance();
      // 重置初始化狀態
      (newService as any).isInitialized = false;

      const query: IntelligentSearchQuery = {
        query: 'test',
        userId: 'user123',
      };

      await expect(newService.search(query)).rejects.toThrow(
        '智能搜索服務尚未初始化'
      );
    });
  });

  describe('搜索建議', () => {
    beforeEach(async () => {
      // 確保服務已初始化
      if (!(service as any).isInitialized) {
        await service.initialize();
      }
    });

    it('應該獲取搜索建議', async () => {
      const suggestions = await service.getSuggestions('char');

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);

      if (suggestions.length > 0) {
        expect(suggestions[0]).toHaveProperty('text');
        expect(suggestions[0]).toHaveProperty('type');
        expect(suggestions[0]).toHaveProperty('relevance');
      }
    });

    it('應該包含熱門搜索建議', async () => {
      const suggestions = await service.getSuggestions('char');
      const popularSuggestions = suggestions.filter(s => s.type === 'popular');
      expect(popularSuggestions.length).toBeGreaterThan(0);
    });
  });

  describe('搜索歷史', () => {
    beforeEach(async () => {
      // 確保服務已初始化
      if (!(service as any).isInitialized) {
        await service.initialize();
      }
    });

    it('應該保存搜索歷史', async () => {
      const userId = 'user123';
      const query = 'Charizard';
      const results = ['1', '2'];

      await service.saveSearchHistory(userId, query, results);

      const history = await service.getSearchHistory(userId);
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].query).toBe(query);
      expect(history[0].resultCount).toBe(results.length);
    });

    it('應該獲取搜索歷史', async () => {
      const userId = 'user123';
      const history = await service.getSearchHistory(userId);
      expect(Array.isArray(history)).toBe(true);
    });

    it('應該清除搜索歷史', async () => {
      const userId = 'user123';
      await service.clearSearchHistory(userId);
      const history = await service.getSearchHistory(userId);
      expect(history.length).toBe(0);
    });
  });

  describe('熱門搜索', () => {
    beforeEach(async () => {
      // 確保服務已初始化
      if (!(service as any).isInitialized) {
        await service.initialize();
      }
    });

    it('應該獲取所有熱門搜索', async () => {
      const popularSearches = await service.getPopularSearches();

      expect(Array.isArray(popularSearches)).toBe(true);
      expect(popularSearches.length).toBeGreaterThan(0);

      if (popularSearches.length > 0) {
        expect(popularSearches[0]).toHaveProperty('query');
        expect(popularSearches[0]).toHaveProperty('count');
        expect(popularSearches[0]).toHaveProperty('trend');
      }
    });

    it('應該按類別獲取熱門搜索', async () => {
      const popularSearches = await service.getPopularSearches('Pokemon');

      expect(Array.isArray(popularSearches)).toBe(true);
      popularSearches.forEach(item => {
        expect(item.category).toBe('Pokemon');
      });
    });
  });

  describe('相關搜索', () => {
    beforeEach(async () => {
      // 確保服務已初始化
      if (!(service as any).isInitialized) {
        await service.initialize();
      }
    });

    it('應該獲取相關搜索', async () => {
      const relatedSearches = await service.getRelatedSearches('Charizard');

      expect(Array.isArray(relatedSearches)).toBe(true);
      expect(relatedSearches.length).toBeGreaterThan(0);

      if (relatedSearches.length > 0) {
        expect(relatedSearches[0]).toHaveProperty('query');
        expect(relatedSearches[0]).toHaveProperty('relevance');
        expect(relatedSearches[0]).toHaveProperty('reason');
      }
    });
  });

  describe('查詢分析', () => {
    beforeEach(async () => {
      // 確保服務已初始化
      if (!(service as any).isInitialized) {
        await service.initialize();
      }
    });

    it('應該分析查詢', async () => {
      const analysis = await service.analyzeQuery('Pokemon Charizard price');

      expect(analysis).toBeDefined();
      expect(analysis.originalQuery).toBe('Pokemon Charizard price');
      expect(analysis.normalizedQuery).toBe('pokemon charizard price');
      expect(Array.isArray(analysis.tokens)).toBe(true);
      expect(Array.isArray(analysis.entities)).toBe(true);
      expect(analysis.intent).toBeDefined();
      expect(analysis.confidence).toBeGreaterThan(0);
      expect(Array.isArray(analysis.suggestions)).toBe(true);
      expect(Array.isArray(analysis.corrections)).toBe(true);
      expect(analysis.language).toBe('zh-TW');
      expect(['simple', 'moderate', 'complex']).toContain(analysis.complexity);
    });

    it('應該識別實體', async () => {
      const analysis = await service.analyzeQuery('Pokemon Charizard');

      expect(analysis.entities.length).toBeGreaterThan(0);
      const cardEntity = analysis.entities.find(e => e.type === 'card_name');
      expect(cardEntity).toBeDefined();
      expect(cardEntity?.text).toBe('Charizard');
    });

    it('應該確定搜索意圖', async () => {
      const analysis = await service.analyzeQuery('Charizard price');

      expect(analysis.intent.primary).toBe('compare_prices');
      expect(analysis.intent.confidence).toBeGreaterThan(0);
    });
  });

  describe('用戶偏好', () => {
    beforeEach(async () => {
      // 確保服務已初始化
      if (!(service as any).isInitialized) {
        await service.initialize();
      }
    });

    it('應該更新用戶偏好', async () => {
      const userId = 'user123';
      const preferences: UserSearchPreferences = {
        preferredCategories: ['Pokemon'],
        preferredRarity: ['Rare'],
        personalizationEnabled: true,
      };

      await service.updateUserPreferences(userId, preferences);

      const savedPreferences = await service.getUserPreferences(userId);
      expect(savedPreferences.preferredCategories).toEqual(['Pokemon']);
      expect(savedPreferences.preferredRarity).toEqual(['Rare']);
      expect(savedPreferences.personalizationEnabled).toBe(true);
    });

    it('應該獲取用戶偏好', async () => {
      const userId = 'user123';

      const preferences = await service.getUserPreferences(userId);
      expect(preferences).toBeDefined();
      expect(preferences.personalizationEnabled).toBe(true);
    });
  });

  describe('搜索統計', () => {
    beforeEach(async () => {
      // 確保服務已初始化
      if (!(service as any).isInitialized) {
        await service.initialize();
      }
    });

    it('應該獲取搜索統計', async () => {
      const stats = await service.getSearchStats();

      expect(stats).toBeDefined();
      expect(stats.totalQueries).toBeGreaterThan(0);
      expect(stats.averageResponseTime).toBeGreaterThan(0);
      expect(stats.cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(stats.semanticUsageRate).toBeGreaterThanOrEqual(0);
      expect(stats.personalizationUsageRate).toBeGreaterThanOrEqual(0);
      expect(stats.userSatisfactionScore).toBeGreaterThan(0);
      expect(Array.isArray(stats.topQueries)).toBe(true);
      expect(Array.isArray(stats.searchTrends)).toBe(true);
      expect(Array.isArray(stats.categoryDistribution)).toBe(true);
      expect(Array.isArray(stats.timeDistribution)).toBe(true);
    });
  });

  describe('配置管理', () => {
    beforeEach(async () => {
      // 確保服務已初始化
      if (!(service as any).isInitialized) {
        await service.initialize();
      }
    });

    it('應該獲取配置', () => {
      const config = service.getConfig();

      expect(config).toBeDefined();
      expect(config.semanticSearchEnabled).toBe(true);
      expect(config.personalizationEnabled).toBe(true);
      expect(config.autoCompleteEnabled).toBe(true);
      expect(config.searchHistoryEnabled).toBe(true);
      expect(config.suggestionsEnabled).toBe(true);
      expect(config.cacheEnabled).toBe(true);
      expect(config.maxSuggestions).toBe(10);
      expect(config.maxHistoryItems).toBe(50);
      expect(config.maxResults).toBe(100);
      expect(config.semanticThreshold).toBe(0.7);
      expect(config.relevanceThreshold).toBe(0.5);
      expect(config.cacheTTL).toBe(300000);
      expect(config.personalizationWeight).toBe(0.3);
      expect(config.popularityWeight).toBe(0.2);
      expect(config.recencyWeight).toBe(0.1);
      expect(config.semanticWeight).toBe(0.4);
    });

    it('應該更新配置', () => {
      const newConfig: Partial<IntelligentSearchConfig> = {
        maxSuggestions: 15,
        semanticThreshold: 0.8,
      };

      service.updateConfig(newConfig);

      const updatedConfig = service.getConfig();
      expect(updatedConfig.maxSuggestions).toBe(15);
      expect(updatedConfig.semanticThreshold).toBe(0.8);
    });
  });

  describe('自動完成', () => {
    beforeEach(async () => {
      // 確保服務已初始化
      if (!(service as any).isInitialized) {
        await service.initialize();
      }
    });

    it('應該獲取自動完成選項', async () => {
      const autoComplete = await service.getAutoComplete('char');

      expect(Array.isArray(autoComplete)).toBe(true);
      expect(autoComplete.length).toBeGreaterThan(0);

      if (autoComplete.length > 0) {
        expect(autoComplete[0]).toHaveProperty('text');
        expect(autoComplete[0]).toHaveProperty('type');
        expect(autoComplete[0]).toHaveProperty('relevance');
      }
    });

    it('應該支持上下文', async () => {
      const context: SearchContext = {
        category: 'Pokemon',
        sessionId: 'session123',
      };

      const autoComplete = await service.getAutoComplete('char', context);
      expect(Array.isArray(autoComplete)).toBe(true);
    });
  });

  describe('錯誤處理', () => {
    beforeEach(async () => {
      // 確保服務已初始化
      if (!(service as any).isInitialized) {
        await service.initialize();
      }
    });

    it('應該處理搜索錯誤', async () => {
      const newService = IntelligentSearchService.getInstance();
      await newService.initialize();

      // Mock FullTextSearchService to throw error
      const mockInstance = {
        search: jest.fn().mockRejectedValue(new Error('搜索錯誤')),
      };
      (newService as any).fullTextSearchService = mockInstance;

      const query: IntelligentSearchQuery = {
        query: 'test',
        userId: 'user123',
      };

      await expect(newService.search(query)).rejects.toThrow(
        '智能搜索失敗: 搜索錯誤'
      );
    });
  });

  describe('性能測試', () => {
    beforeEach(async () => {
      // 確保服務已初始化
      if (!(service as any).isInitialized) {
        await service.initialize();
      }
    });

    it('應該在合理時間內完成搜索', async () => {
      const startTime = Date.now();

      const query: IntelligentSearchQuery = {
        query: 'Charizard',
        userId: 'user123',
      };

      await service.search(query);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 搜索應該在 1 秒內完成
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('邊界情況', () => {
    beforeEach(async () => {
      // 確保服務已初始化
      if (!(service as any).isInitialized) {
        await service.initialize();
      }
    });

    it('應該處理空結果', async () => {
      // 清除單例實例
      (IntelligentSearchService as any).instance = undefined;

      const mockInstance = {
        initialize: jest.fn().mockResolvedValue(true),
        search: jest.fn().mockResolvedValue({
          results: [],
          totalResults: 0,
          searchTime: 10,
        }),
        getInitializationStatus: jest.fn().mockReturnValue(true),
      };
      (FullTextSearchService.getInstance as jest.Mock).mockReturnValue(
        mockInstance
      );

      const newService = IntelligentSearchService.getInstance();
      await newService.initialize();

      const query: IntelligentSearchQuery = {
        query: 'nonexistent',
        userId: 'user123',
      };

      const response = await newService.search(query);
      expect(response.results).toHaveLength(0);
    });

    it('應該處理特殊字符', async () => {
      // 確保服務已初始化
      if (!(service as any).isInitialized) {
        await service.initialize();
      }

      const query: IntelligentSearchQuery = {
        query: 'Charizard@#$%^&*()',
        userId: 'user123',
      };

      const response = await service.search(query);
      expect(response).toBeDefined();
    });

    it('應該處理中文字符', async () => {
      // 確保服務已初始化
      if (!(service as any).isInitialized) {
        await service.initialize();
      }

      const query: IntelligentSearchQuery = {
        query: '噴火龍',
        userId: 'user123',
      };

      const response = await service.search(query);
      expect(response).toBeDefined();
    });
  });
});
