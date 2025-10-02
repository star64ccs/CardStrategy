import type { Card } from '../../core/types';
import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * SearchService
 * HandleSearch相Off功能
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
   * Search卡牌
   */
  async searchCards(query: string): Promise<Card[]> {
    try {
      const _response = await api.get<Card[]>('/search/cards', {
        params: { q: query },
      });

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('搜索Failed');
      }
    } catch (error) {
      logger.error('搜索Failed:', { error, query });
      throw error;
    }
  }
}

// Export單例Instance
export const _searchService = SearchService.getInstance();
