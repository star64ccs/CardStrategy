/**
 * 卡片Service
 * 提供卡片Manage功能
 */

import { logger } from '../utils/logger';

import { apiService } from './apiService';

export interface Card {
  id: string;
  name: string;
  series: string;
  number: string;
  rarity: string;
  condition: string;
  price: number;
  imageUrl?: string;
  description?: string;
  artist?: string;
  releaseDate?: string;
}

export interface CardCreateRequest {
  name: string;
  series: string;
  number: string;
  rarity: string;
  condition: string;
  price: number;
  imageUrl?: string;
  description?: string;
  artist?: string;
  releaseDate?: string;
}

export interface CardUpdateRequest extends Partial<CardCreateRequest> {
  id: string;
}

class CardService {
  private static instance: CardService;
  private isInitialized = false;

  public static getInstance(): CardService {
    if (!CardService.instance) {
      CardService.instance = new CardService();
    }
    return CardService.instance;
  }

  /**
   * Initialize卡片Service
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      logger.warn('CardService 已經初始化');
      return true;
    }

    try {
      // 確保 API Service已Initialize
      if (!apiService.isServiceAvailable()) {
        await apiService.initialize();
      }

      this.isInitialized = true;
      logger.info('CardService InitializeSuccess');
      return true;
    } catch (error) {
      logger.error('CardService InitializeFailed:', error);
      return false;
    }
  }

  /**
   * Get卡片List
   */
  public async getCards(filters?: Record<string, any>): Promise<Card[]> {
    if (!this.isInitialized) {
      throw new Error('CardService 未初始化');
    }

    try {
      const _response = await apiService.get('/cards', { params: filters });
      // Handle不同的Response格式
      if (response.success && response.data) {
        // 如果Yes MSW 格式：{ success: true, data: { cards: [...] } }
        if (response.data.cards && Array.isArray(response.data.cards)) {
          return response.data.cards;
        }
        // 如果Yes直接Array格式
        if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      return [];
    } catch (error) {
      logger.error('Get卡片列表Failed:', error);
      throw error;
    }
  }

  /**
   * GetSingle卡片
   */
  public async getCard(id: string): Promise<Card | null> {
    if (!this.isInitialized) {
      throw new Error('CardService 未初始化');
    }

    try {
      const _response = await apiService.get(`/cards/${id}`);
      // Handle不同的Response格式
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error('Get卡片Failed:', error);
      // 如果Yes 404 Error，Return null
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create卡片
   */
  public async createCard(data: CardCreateRequest): Promise<Card> {
    if (!this.isInitialized) {
      throw new Error('CardService 未初始化');
    }

    try {
      const _response = await apiService.post('/cards', data);
      return response.data;
    } catch (error) {
      logger.error('Create卡片Failed:', error);
      throw error;
    }
  }

  /**
   * Update卡片
   */
  public async updateCard(data: CardUpdateRequest): Promise<Card> {
    if (!this.isInitialized) {
      throw new Error('CardService 未初始化');
    }

    try {
      const _response = await apiService.put(`/cards/${data.id}`, data);
      return response.data;
    } catch (error) {
      logger.error('Update卡片Failed:', error);
      throw error;
    }
  }

  /**
   * Delete卡片
   */
  public async deleteCard(id: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('CardService 未初始化');
    }

    try {
      await apiService.delete(`/cards/${id}`);
      return true;
    } catch (error) {
      logger.error('Delete卡片Failed:', error);
      throw error;
    }
  }

  /**
   * Search卡片
   */
  public async searchCards(
    query: string,
    filters?: Record<string, any>
  ): Promise<Card[]> {
    if (!this.isInitialized) {
      throw new Error('CardService 未初始化');
    }

    try {
      const _response = await apiService.get('/cards/search', {
        params: { q: query, ...filters },
      });
      return response.data || [];
    } catch (error) {
      logger.error('搜索卡片Failed:', error);
      throw error;
    }
  }

  /**
   * CheckServiceStatus
   */
  public isServiceAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * GetServiceStatistics
   */
  public getStats(): unknown {
    return {
      isInitialized: this.isInitialized,
    };
  }
}

// Export單例Instance
export const _cardService = CardService.getInstance();
