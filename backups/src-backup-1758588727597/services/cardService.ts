/**
 * 卡片服務
 * 提供卡片管理功能
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
   * 初始化卡片服務
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      logger.warn('CardService 已經初始化');
      return true;
    }

    try {
      // 確保 API 服務已初始化
      if (!apiService.isServiceAvailable()) {
        await apiService.initialize();
      }

      this.isInitialized = true;
      logger.info('CardService 初始化成功');
      return true;
    } catch (error) {
      logger.error('CardService 初始化失敗:', error);
      return false;
    }
  }

  /**
   * 獲取卡片列表
   */
  public async getCards(filters?: Record<string, any>): Promise<Card[]> {
    if (!this.isInitialized) {
      throw new Error('CardService 未初始化');
    }

    try {
      const response = await apiService.get('/cards', { params: filters });
      // 處理不同的響應格式
      if (response.success && response.data) {
        // 如果是 MSW 格式：{ success: true, data: { cards: [...] } }
        if (response.data.cards && Array.isArray(response.data.cards)) {
          return response.data.cards;
        }
        // 如果是直接數組格式
        if (Array.isArray(response.data)) {
          return response.data;
        }
      }
      return [];
    } catch (error) {
      logger.error('獲取卡片列表失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取單個卡片
   */
  public async getCard(id: string): Promise<Card | null> {
    if (!this.isInitialized) {
      throw new Error('CardService 未初始化');
    }

    try {
      const response = await apiService.get(`/cards/${id}`);
      // 處理不同的響應格式
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error('獲取卡片失敗:', error);
      // 如果是 404 錯誤，返回 null
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * 創建卡片
   */
  public async createCard(data: CardCreateRequest): Promise<Card> {
    if (!this.isInitialized) {
      throw new Error('CardService 未初始化');
    }

    try {
      const response = await apiService.post('/cards', data);
      return response.data;
    } catch (error) {
      logger.error('創建卡片失敗:', error);
      throw error;
    }
  }

  /**
   * 更新卡片
   */
  public async updateCard(data: CardUpdateRequest): Promise<Card> {
    if (!this.isInitialized) {
      throw new Error('CardService 未初始化');
    }

    try {
      const response = await apiService.put(`/cards/${data.id}`, data);
      return response.data;
    } catch (error) {
      logger.error('更新卡片失敗:', error);
      throw error;
    }
  }

  /**
   * 刪除卡片
   */
  public async deleteCard(id: string): Promise<boolean> {
    if (!this.isInitialized) {
      throw new Error('CardService 未初始化');
    }

    try {
      await apiService.delete(`/cards/${id}`);
      return true;
    } catch (error) {
      logger.error('刪除卡片失敗:', error);
      throw error;
    }
  }

  /**
   * 搜索卡片
   */
  public async searchCards(
    query: string,
    filters?: Record<string, any>
  ): Promise<Card[]> {
    if (!this.isInitialized) {
      throw new Error('CardService 未初始化');
    }

    try {
      const response = await apiService.get('/cards/search', {
        params: { q: query, ...filters },
      });
      return response.data || [];
    } catch (error) {
      logger.error('搜索卡片失敗:', error);
      throw error;
    }
  }

  /**
   * 檢查服務狀態
   */
  public isServiceAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * 獲取服務統計
   */
  public getStats(): unknown {
    return {
      isInitialized: this.isInitialized,
    };
  }
}

// 導出單例實例
export const cardService = CardService.getInstance();
