import { Portfolio, Investment } from '../../core/types';
import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * 投資組合項目Class型
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
 * 投資組合StatisticsClass型
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
 * 投資組合Service
 * Handle投資組合相Off功能
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
   * GetUser投資組合
   */
  async getPortfolio(): Promise<PortfolioItem[]> {
    try {
      const _response = await api.get<PortfolioItem[]>('/portfolio');

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Get投資組合Failed');
      }
    } catch (error) {
      logger.error('Get投資組合Failed:', { error });
      throw error;
    }
  }

  /**
   * Add投資組合項目
   */
  async addPortfolioItem(
    item: Omit<PortfolioItem, 'id' | 'lastUpdated'>
  ): Promise<PortfolioItem> {
    try {
      const _response = await api.post<PortfolioItem>('/portfolio', item);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('添加投資組合項目Failed');
      }
    } catch (error) {
      logger.error('添加投資組合項目Failed:', { error, item });
      throw error;
    }
  }

  /**
   * Update投資組合項目
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
        throw new Error('Update投資組合項目Failed');
      }
    } catch (error) {
      logger.error('Update投資組合項目Failed:', { error, id, updates });
      throw error;
    }
  }

  /**
   * Delete投資組合項目
   */
  async removePortfolioItem(id: string): Promise<void> {
    try {
      const _response = await api.delete(`/portfolio/${id}`);

      if (!response.success) {
        throw new Error('Delete投資組合項目Failed');
      }
    } catch (error) {
      logger.error('Delete投資組合項目Failed:', { error, id });
      throw error;
    }
  }

  /**
   * Get投資組合Statistics
   */
  async getPortfolioStats(): Promise<PortfolioStats> {
    try {
      const _response = await api.get<PortfolioStats>('/portfolio/stats');

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Get投資組合統計Failed');
      }
    } catch (error) {
      logger.error('Get投資組合統計Failed:', { error });
      throw error;
    }
  }
}

// Export單例Instance
export const _portfolioService = PortfolioService.getInstance();
