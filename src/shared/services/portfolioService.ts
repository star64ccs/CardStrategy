import { Portfolio, Investment } from '../../core/types';
import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * 投資組合項目類型
 */
export interface PortfolioItem {
  id: string;
  cardId: string;
  cardName: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  lastUpdated: Date;
  notes?: string;
}

/**
 * 投資組合統計類型
 */
export interface PortfolioStats {
  totalItems: number;
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  bestPerformer?: PortfolioItem;
  worstPerformer?: PortfolioItem;
}

/**
 * 投資組合服務
 * 處理投資組合相關功能
 */
export class PortfolioService {
  private static instance: PortfolioService;

  private constructor() {}

  static getInstance(): PortfolioService {
    if (!PortfolioService.instance) {
      PortfolioService.instance = new PortfolioService();
    }
    return PortfolioService.instance;
  }

  /**
   * 獲取用戶投資組合
   */
  async getPortfolio(): Promise<PortfolioItem[]> {
    try {
      const _response = await api.get<PortfolioItem[]>('/portfolio');

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('獲取投資組合失敗');
      }
    } catch (error) {
      logger.error('獲取投資組合失敗:', { error });
      throw error;
    }
  }

  /**
   * 添加投資組合項目
   */
  async addPortfolioItem(
    item: Omit<PortfolioItem, 'id' | 'lastUpdated'>
  ): Promise<PortfolioItem> {
    try {
      const _response = await api.post<PortfolioItem>('/portfolio', item);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('添加投資組合項目失敗');
      }
    } catch (error) {
      logger.error('添加投資組合項目失敗:', { error, item });
      throw error;
    }
  }

  /**
   * 更新投資組合項目
   */
  async updatePortfolioItem(
    id: string,
    updates: Partial<PortfolioItem>
  ): Promise<PortfolioItem> {
    try {
      const _response = await api.put<PortfolioItem>(
        `/portfolio/${id}`,
        updates
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('更新投資組合項目失敗');
      }
    } catch (error) {
      logger.error('更新投資組合項目失敗:', { error, id, updates });
      throw error;
    }
  }

  /**
   * 刪除投資組合項目
   */
  async removePortfolioItem(id: string): Promise<void> {
    try {
      const _response = await api.delete(`/portfolio/${id}`);

      if (!response.success) {
        throw new Error('刪除投資組合項目失敗');
      }
    } catch (error) {
      logger.error('刪除投資組合項目失敗:', { error, id });
      throw error;
    }
  }

  /**
   * 獲取投資組合統計
   */
  async getPortfolioStats(): Promise<PortfolioStats> {
    try {
      const _response = await api.get<PortfolioStats>('/portfolio/stats');

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('獲取投資組合統計失敗');
      }
    } catch (error) {
      logger.error('獲取投資組合統計失敗:', { error });
      throw error;
    }
  }
}

// 導出單例實例
export const _portfolioService = PortfolioService.getInstance();
