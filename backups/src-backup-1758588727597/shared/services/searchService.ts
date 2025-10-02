import type { Card } from '../../core/types';
import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * 搜索服務
 * 處理搜索相關功能
 */
export class SearchService {
  private static instance: SearchService;

  private constructor() {}

  static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * 搜索卡牌
   */
  async searchCards(query: string): Promise<Card[]> {
    try {
      const response = await api.get<Card[]>('/search/cards', {
        params: { q: query },
      });

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('搜索失敗');
      }
    } catch (error) {
      logger.error('搜索失敗:', { error, query });
      throw error;
    }
  }
}

// 導出單例實例
export const searchService = SearchService.getInstance();
