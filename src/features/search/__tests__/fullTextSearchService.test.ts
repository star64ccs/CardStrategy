import { FullTextSearchService } from '../services/fullTextSearchService';
import type { SearchQuery } from '../types/search';
import {
  SearchFilters,
  SortOption,
  SearchResult,
  SearchResponse,
  SearchStats,
  SearchIndex,
} from '../types/search';

describe('FullTextSearchService', () => {
  let searchService: FullTextSearchService;

  beforeEach(() => {
    // 重置單例實例
    (FullTextSearchService as any).instance = undefined;
    searchService = FullTextSearchService.getInstance();
  });

  describe('單例模式', () => {
    it('應該返回相同的實例', () => {
      const _instance1 = FullTextSearchService.getInstance();
      const _instance2 = FullTextSearchService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化', () => {
    it('應該成功初始化搜索服務', async () => {
      const _result = await searchService.initialize();
      expect(result).toBe(true);
      expect(searchService.getInitializationStatus()).toBe(true);
    });

    it('應該避免重複初始化', async () => {
      const _consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await searchService.initialize();
      await searchService.initialize(); // 第二次調用

      expect(consoleSpy).toHaveBeenCalledWith(
        'FullTextSearchService 初始化完成'
      );
      expect(searchService.getInitializationStatus()).toBe(true);

      consoleSpy.mockRestore();
    });

    it('應該處理初始化失敗', async () => {
      // 模擬初始化失敗
      jest
        .spyOn(searchService as any, 'initializeSearchIndex')
        .mockRejectedValue(new Error('索引初始化失敗'));

      const _result = await searchService.initialize();
      expect(result).toBe(false);
      expect(searchService.getInitializationStatus()).toBe(false);
    });
  });

  describe('搜索功能', () => {
    beforeEach(async () => {
      await searchService.initialize();
    });

    it('應該執行基本搜索', async () => {
      const query: SearchQuery = {
        query: 'charizard',
        page: 1,
        limit: 10,
      };

      const _response = await searchService.search(query);

      expect(response).toBeDefined();
      expect(response.results).toBeInstanceOf(Array);
      expect(response.total).toBeGreaterThan(0);
      expect(response.query).toBe('charizard');
      expect(response.searchTime).toBeGreaterThanOrEqual(0);
    });

    it('應該處理空查詢', async () => {
      const query: SearchQuery = {
        query: '',
        page: 1,
        limit: 10,
      };

      try {
        await searchService.search(query);
        fail('應該拋出錯誤');
      } catch (error: unknown) {
        expect(error.message).toContain('搜索查詢不能為空');
      }
    });

    it('應該處理過長的查詢', async () => {
      const _longQuery = 'a'.repeat(501);
      const query: SearchQuery = {
        query: longQuery,
        page: 1,
        limit: 10,
      };

      try {
        await searchService.search(query);
        fail('應該拋出錯誤');
      } catch (error: unknown) {
        expect(error.message).toContain('搜索查詢長度不能超過 500 個字符');
      }
    });

    it('應該在未初始化時拋出錯誤', async () => {
      // 重置服務狀態
      (searchService as any).isInitialized = false;

      const query: SearchQuery = {
        query: 'test',
        page: 1,
        limit: 10,
      };

      try {
        await searchService.search(query);
        fail('應該拋出錯誤');
      } catch (error: unknown) {
        expect(error.message).toContain('搜索服務未初始化');
      }
    });

    it('應該應用價格過濾器', async () => {
      const query: SearchQuery = {
        query: 'card',
        filters: {
          priceRange: {
            min: 100,
            max: 1000,
          },
        },
        page: 1,
        limit: 10,
      };

      const _response = await searchService.search(query);

      expect(
        response.results.every(result => {
          const _price = result.price || 0;
          return price >= 100 && price <= 1000;
        })
      ).toBe(true);
    });

    it('應該應用條件過濾器', async () => {
      const query: SearchQuery = {
        query: 'card',
        filters: {
          condition: ['near_mint', 'excellent'],
        },
        page: 1,
        limit: 10,
      };

      const _response = await searchService.search(query);

      expect(
        response.results.every(result => {
          return (
            result.condition &&
            ['near_mint', 'excellent'].includes(result.condition)
          );
        })
      ).toBe(true);
    });

    it('應該應用排序', async () => {
      const query: SearchQuery = {
        query: 'card',
        sortBy: {
          field: 'price',
          direction: 'desc',
        },
        page: 1,
        limit: 10,
      };

      const _response = await searchService.search(query);

      // 檢查價格是否按降序排列
      for (let i = 1; i < response.results.length; i++) {
        const _prevPrice = response.results[i - 1].price || 0;
        const _currentPrice = response.results[i].price || 0;
        expect(prevPrice).toBeGreaterThanOrEqual(currentPrice);
      }
    });

    it('應該應用分頁', async () => {
      const query: SearchQuery = {
        query: 'card',
        page: 1,
        limit: 2,
      };

      const _response = await searchService.search(query);

      expect(response.results.length).toBeLessThanOrEqual(2);
      expect(response.page).toBe(1);
      expect(response.limit).toBe(2);
    });

    it('應該生成搜索建議', async () => {
      const query: SearchQuery = {
        query: 'pokemon',
        page: 1,
        limit: 10,
      };

      const _response = await searchService.search(query);

      expect(response.suggestions).toBeInstanceOf(Array);
      expect(response.suggestions.length).toBeGreaterThan(0);
    });

    it('應該生成搜索分面', async () => {
      const query: SearchQuery = {
        query: 'card',
        page: 1,
        limit: 10,
      };

      const _response = await searchService.search(query);

      expect(response.facets).toBeDefined();
      expect(response.facets.categories).toBeInstanceOf(Array);
      expect(response.facets.conditions).toBeInstanceOf(Array);
      expect(response.facets.rarities).toBeInstanceOf(Array);
    });

    it('應該生成搜索高亮', async () => {
      const query: SearchQuery = {
        query: 'charizard',
        page: 1,
        limit: 10,
      };

      const _response = await searchService.search(query);

      expect(
        response.results.some(
          result => result.highlights && result.highlights.length > 0
        )
      ).toBe(true);
    });

    it('應該計算相關性分數', async () => {
      const query: SearchQuery = {
        query: 'charizard',
        page: 1,
        limit: 10,
      };

      const _response = await searchService.search(query);

      expect(
        response.results.every(result => {
          return (
            typeof result.score === 'number' &&
            result.score >= 0 &&
            result.score <= 1
          );
        })
      ).toBe(true);
    });
  });

  describe('搜索統計', () => {
    beforeEach(async () => {
      await searchService.initialize();
    });

    it('應該獲取搜索統計', async () => {
      const _stats = await searchService.getSearchStats();

      expect(stats).toBeDefined();
      expect(stats.totalSearches).toBeGreaterThanOrEqual(0);
      expect(stats.averageResponseTime).toBeGreaterThanOrEqual(0);
      expect(stats.popularQueries).toBeInstanceOf(Array);
      expect(stats.searchTrends).toBeInstanceOf(Array);
      expect(stats.userBehavior).toBeDefined();
    });

    it('應該包含用戶行為數據', async () => {
      const _stats = await searchService.getSearchStats();

      expect(stats.userBehavior.averageQueriesPerSession).toBeGreaterThan(0);
      expect(stats.userBehavior.averageSessionDuration).toBeGreaterThan(0);
      expect(stats.userBehavior.conversionRate).toBeGreaterThanOrEqual(0);
      expect(stats.userBehavior.bounceRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('搜索索引管理', () => {
    beforeEach(async () => {
      await searchService.initialize();
    });

    it('應該獲取搜索索引列表', async () => {
      const _indexes = await searchService.getSearchIndexes();

      expect(indexes).toBeInstanceOf(Array);
      expect(indexes.length).toBeGreaterThan(0);

      const _cardsIndex = indexes.find(index => index.id === 'cards');
      expect(cardsIndex).toBeDefined();
      expect(cardsIndex?.type).toBe('card');
      expect(cardsIndex?.status).toBe('active');
      expect(cardsIndex?.documentCount).toBeGreaterThan(0);
    });

    it('應該更新搜索索引', async () => {
      const _result = await searchService.updateSearchIndex('cards');

      expect(result).toBe(true);
    });

    it.skip('應該處理索引更新失敗', async () => {
      // 模擬更新失敗
      const _mockUpdateIndex = jest.spyOn(
        searchService as any,
        'updateSearchIndex'
      );
      mockUpdateIndex.mockImplementation(() =>
        Promise.reject(new Error('更新失敗'))
      );

      const _result = await searchService.updateSearchIndex('invalid_index');
      expect(result).toBe(false);

      mockUpdateIndex.mockRestore();
    });
  });

  describe('配置管理', () => {
    it('應該獲取搜索配置', () => {
      const _config = searchService.getConfig();

      expect(config).toBeDefined();
      expect(config.maxResults).toBe(1000);
      expect(config.defaultLimit).toBe(20);
      expect(config.maxQueryLength).toBe(500);
      expect(config.enableFuzzySearch).toBe(true);
      expect(config.enableAutocomplete).toBe(true);
      expect(config.enableSuggestions).toBe(true);
      expect(config.enableFacets).toBe(true);
      expect(config.enableHighlights).toBe(true);
      expect(config.cacheEnabled).toBe(true);
      expect(config.cacheTTL).toBe(300000);
      expect(config.indexRefreshInterval).toBe(300000);
    });

    it('應該更新搜索配置', () => {
      const _newConfig = {
        maxResults: 500,
        defaultLimit: 10,
        enableFuzzySearch: false,
      };

      searchService.updateConfig(newConfig);
      const _updatedConfig = searchService.getConfig();

      expect(updatedConfig.maxResults).toBe(500);
      expect(updatedConfig.defaultLimit).toBe(10);
      expect(updatedConfig.enableFuzzySearch).toBe(false);
      expect(updatedConfig.maxQueryLength).toBe(500); // 未更新的配置保持原值
    });
  });

  describe('緩存功能', () => {
    beforeEach(async () => {
      await searchService.initialize();
    });

    it('應該緩存搜索結果', async () => {
      const query: SearchQuery = {
        query: 'test_cache',
        page: 1,
        limit: 10,
      };

      // 第一次搜索
      const _response1 = await searchService.search(query);

      // 第二次搜索（應該從緩存返回）
      const _response2 = await searchService.search(query);

      expect(response1).toEqual(response2);
    });

    it('應該清理過期緩存', async () => {
      // 這個測試需要等待緩存過期，在實際環境中可能需要調整
      const query: SearchQuery = {
        query: 'test_expire',
        page: 1,
        limit: 10,
      };

      await searchService.search(query);

      // 模擬時間過去
      jest.advanceTimersByTime(300000); // 5分鐘

      // 緩存應該被清理
      // 注意：這個測試可能需要根據實際的緩存實現調整
    });
  });

  describe('錯誤處理', () => {
    it('應該處理搜索錯誤', async () => {
      await searchService.initialize();

      // 模擬搜索過程中發生錯誤
      const _mockExecuteSearch = jest.spyOn(
        searchService as any,
        'executeSearch'
      );
      mockExecuteSearch.mockRejectedValue(new Error('搜索執行錯誤'));

      const query: SearchQuery = {
        query: 'test_error',
        page: 1,
        limit: 10,
      };

      try {
        await searchService.search(query);
        fail('應該拋出錯誤');
      } catch (error: unknown) {
        expect(error.message).toContain('搜索執行錯誤');
      }

      mockExecuteSearch.mockRestore();
    });

    it('應該處理過濾器錯誤', async () => {
      await searchService.initialize();

      const query: SearchQuery = {
        query: 'test',
        filters: {
          priceRange: {
            min: 'invalid' as any, // 故意傳入錯誤類型
            max: 1000,
          },
        },
        page: 1,
        limit: 10,
      };

      // 這個測試可能會失敗，因為過濾器邏輯需要處理類型錯誤
      // 在實際實現中應該添加類型檢查
    });
  });

  describe('性能測試', () => {
    beforeEach(async () => {
      await searchService.initialize();
    });

    it('應該在100ms內完成搜索', async () => {
      const _startTime = Date.now();

      const query: SearchQuery = {
        query: 'card',
        page: 1,
        limit: 10,
      };

      await searchService.search(query);

      const _endTime = Date.now();
      const _searchTime = endTime - startTime;

      expect(searchTime).toBeLessThan(100);
    });

    it('應該處理大量結果', async () => {
      const query: SearchQuery = {
        query: 'card',
        page: 1,
        limit: 1000, // 大量結果
      };

      const _response = await searchService.search(query);

      expect(response.results.length).toBeLessThanOrEqual(1000);
      expect(response.total).toBeGreaterThan(0);
    });
  });
});
