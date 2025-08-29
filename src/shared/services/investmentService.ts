import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * 投資組合
 */
export interface InvestmentPortfolio {
  id: string;
  userId: string;
  name: string;
  description?: string;
  cards: PortfolioCard[];
  totalValue: number;
  totalReturn: number;
  returnPercentage: number;
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 投資組合中的卡牌
 */
export interface PortfolioCard {
  cardId: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  return: number;
  returnPercentage: number;
  lastUpdated: Date;
}

/**
 * 投資建議
 */
export interface InvestmentAdvice {
  id: string;
  userId: string;
  cardId: string;
  type: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
  priceTarget?: number;
  timeframe: 'short' | 'medium' | 'long';
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: Date;
}

/**
 * 市場分析
 */
export interface MarketAnalysis {
  cardId: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercentage: number;
  volume: number;
  marketCap?: number;
  trend: 'up' | 'down' | 'stable';
  support: number;
  resistance: number;
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  lastUpdated: Date;
}

/**
 * 創建投資組合請求
 */
export interface CreatePortfolioRequest {
  name: string;
  description?: string;
  riskLevel: InvestmentPortfolio['riskLevel'];
}

/**
 * 添加卡牌到投資組合請求
 */
export interface AddCardToPortfolioRequest {
  cardId: string;
  quantity: number;
  price: number;
}

/**
 * 投資服務
 */
export class InvestmentService {
  private readonly baseUrl = '/api/investment';

  /**
   * 創建投資組合
   */
  async createPortfolio(data: CreatePortfolioRequest): Promise<any> {
    try {
      logger.info('創建投資組合:', {
        name: data.name,
        riskLevel: data.riskLevel,
      });

      const _response = await api.post(`${this.baseUrl}/portfolios`, data);

      if (response.success) {
        logger.info('投資組合創建成功:', { id: (response.data as any)?.id });
        return {
          success: true,
          data: response.data,
          message: '投資組合創建成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('投資組合創建失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '投資組合創建失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('創建投資組合時發生錯誤:', error);
      return {
        success: false,
        message: '創建投資組合時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取用戶投資組合列表
   */
  async getUserPortfolios(userId: string): Promise<any> {
    try {
      logger.info('獲取用戶投資組合列表:', { userId });

      const _response = await api.get(
        `${this.baseUrl}/portfolios/user/${userId}`
      );

      if (response.success) {
        logger.info('投資組合列表獲取成功:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data || [],
          message: '投資組合列表獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取投資組合列表失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取投資組合列表失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取投資組合列表時發生錯誤:', error);
      return {
        success: false,
        message: '獲取投資組合列表時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取投資組合詳情
   */
  async getPortfolio(portfolioId: string): Promise<any> {
    try {
      logger.info('獲取投資組合詳情:', { portfolioId });

      const _response = await api.get(
        `${this.baseUrl}/portfolios/${portfolioId}`
      );

      if (response.success) {
        logger.info('投資組合詳情獲取成功:', {
          id: (response.data as any)?.id,
        });
        return {
          success: true,
          data: response.data,
          message: '投資組合詳情獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取投資組合詳情失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取投資組合詳情失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取投資組合詳情時發生錯誤:', error);
      return {
        success: false,
        message: '獲取投資組合詳情時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 添加卡牌到投資組合
   */
  async addCardToPortfolio(
    portfolioId: string,
    data: AddCardToPortfolioRequest
  ): Promise<any> {
    try {
      logger.info('添加卡牌到投資組合:', {
        portfolioId,
        cardId: data.cardId,
        quantity: data.quantity,
      });

      const _response = await api.post(
        `${this.baseUrl}/portfolios/${portfolioId}/cards`,
        data
      );

      if (response.success) {
        logger.info('卡牌添加成功:', { portfolioId, cardId: data.cardId });
        return {
          success: true,
          data: response.data,
          message: '卡牌添加成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('添加卡牌失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '添加卡牌失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('添加卡牌到投資組合時發生錯誤:', error);
      return {
        success: false,
        message: '添加卡牌到投資組合時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 從投資組合移除卡牌
   */
  async removeCardFromPortfolio(
    portfolioId: string,
    cardId: string,
    quantity: number
  ): Promise<any> {
    try {
      logger.info('從投資組合移除卡牌:', { portfolioId, cardId, quantity });

      const _response = await api.delete(
        `${this.baseUrl}/portfolios/${portfolioId}/cards/${cardId}`,
        {
          data: { quantity },
        }
      );

      if (response.success) {
        logger.info('卡牌移除成功:', { portfolioId, cardId });
        return {
          success: true,
          message: '卡牌移除成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('移除卡牌失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '移除卡牌失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('從投資組合移除卡牌時發生錯誤:', error);
      return {
        success: false,
        message: '從投資組合移除卡牌時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取投資建議
   */
  async getInvestmentAdvice(userId: string, cardId?: string): Promise<any> {
    try {
      logger.info('獲取投資建議:', { userId, cardId });

      const _params = cardId ? new URLSearchParams({ cardId }) : '';
      const _response = await api.get(
        `${this.baseUrl}/advice/${userId}${params ? `?${params}` : ''}`
      );

      if (response.success) {
        logger.info('投資建議獲取成功:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data || [],
          message: '投資建議獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取投資建議失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取投資建議失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取投資建議時發生錯誤:', error);
      return {
        success: false,
        message: '獲取投資建議時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 生成投資建議
   */
  async generateInvestmentAdvice(cardId: string, userId: string): Promise<any> {
    try {
      logger.info('生成投資建議:', { cardId, userId });

      const _response = await api.post(`${this.baseUrl}/advice/generate`, {
        cardId,
        userId,
      });

      if (response.success) {
        logger.info('投資建議生成成功:', { id: (response.data as any)?.id });
        return {
          success: true,
          data: response.data,
          message: '投資建議生成成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('生成投資建議失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '生成投資建議失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('生成投資建議時發生錯誤:', error);
      return {
        success: false,
        message: '生成投資建議時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取市場分析
   */
  async getMarketAnalysis(cardId: string): Promise<any> {
    try {
      logger.info('獲取市場分析:', { cardId });

      const _response = await api.get(
        `${this.baseUrl}/market-analysis/${cardId}`
      );

      if (response.success) {
        logger.info('市場分析獲取成功:', { cardId });
        return {
          success: true,
          data: response.data,
          message: '市場分析獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取市場分析失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取市場分析失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取市場分析時發生錯誤:', error);
      return {
        success: false,
        message: '獲取市場分析時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取投資組合表現
   */
  async getPortfolioPerformance(
    portfolioId: string,
    timeframe: '1d' | '1w' | '1m' | '3m' | '1y' = '1m'
  ): Promise<any> {
    try {
      logger.info('獲取投資組合表現:', { portfolioId, timeframe });

      const _response = await api.get(
        `${this.baseUrl}/portfolios/${portfolioId}/performance?timeframe=${timeframe}`
      );

      if (response.success) {
        logger.info('投資組合表現獲取成功:', { portfolioId });
        return {
          success: true,
          data: response.data,
          message: '投資組合表現獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取投資組合表現失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取投資組合表現失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取投資組合表現時發生錯誤:', error);
      return {
        success: false,
        message: '獲取投資組合表現時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取服務狀態
   */
  async getServiceStats(): Promise<any> {
    try {
      logger.info('獲取投資服務狀態');

      const _response = await api.get(`${this.baseUrl}/health`);

      return {
        success: true,
        data: {
          service: 'investment',
          status: response.success ? 'healthy' : 'unhealthy',
          timestamp: new Date(),
          endpoints: {
            portfolios: `${this.baseUrl}/portfolios`,
            advice: `${this.baseUrl}/advice`,
            marketAnalysis: `${this.baseUrl}/market-analysis`,
            performance: `${this.baseUrl}/portfolios/:id/performance`,
          },
        },
        message: '投資服務狀態獲取成功',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('獲取投資服務狀態時發生錯誤:', error);
      return {
        success: false,
        message: '獲取投資服務狀態時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取投資列表
   */
  async getInvestments(): Promise<any> {
    try {
      logger.info('獲取投資列表');

      const _response = await api.get(`${this.baseUrl}/investments`);

      if (response.success) {
        logger.info('投資列表獲取成功');
        return {
          success: true,
          data: response.data,
          message: '投資列表獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取投資列表失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取投資列表失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取投資列表時發生錯誤:', error);
      return {
        success: false,
        message: '獲取投資列表時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 添加投資
   */
  async addInvestment(investmentData: unknown): Promise<any> {
    try {
      logger.info('添加投資:', { investmentData });

      const _response = await api.post(
        `${this.baseUrl}/investments`,
        investmentData
      );

      if (response.success) {
        logger.info('投資添加成功');
        return {
          success: true,
          data: response.data,
          message: '投資添加成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('添加投資失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '添加投資失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('添加投資時發生錯誤:', error);
      return {
        success: false,
        message: '添加投資時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 更新投資
   */
  async updateInvestment(id: string, investmentData: unknown): Promise<any> {
    try {
      logger.info('更新投資:', { id, investmentData });

      const _response = await api.put(
        `${this.baseUrl}/investments/${id}`,
        investmentData
      );

      if (response.success) {
        logger.info('投資更新成功');
        return {
          success: true,
          data: response.data,
          message: '投資更新成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('更新投資失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '更新投資失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('更新投資時發生錯誤:', error);
      return {
        success: false,
        message: '更新投資時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 移除投資
   */
  async removeInvestment(investmentId: string): Promise<any> {
    try {
      logger.info('移除投資:', { investmentId });

      const _response = await api.delete(
        `${this.baseUrl}/investments/${investmentId}`
      );

      if (response.success) {
        logger.info('投資移除成功');
        return {
          success: true,
          data: response.data,
          message: '投資移除成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('移除投資失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '移除投資失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('移除投資時發生錯誤:', error);
      return {
        success: false,
        message: '移除投資時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取用戶投資組合（無參數版本）
   */
  async getUserPortfolio(): Promise<any> {
    try {
      logger.info('獲取用戶投資組合');

      const _response = await api.get(`${this.baseUrl}/portfolio`);

      if (response.success) {
        logger.info('用戶投資組合獲取成功');
        return {
          success: true,
          data: response.data,
          message: '用戶投資組合獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取用戶投資組合失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取用戶投資組合失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取用戶投資組合時發生錯誤:', error);
      return {
        success: false,
        message: '獲取用戶投資組合時發生錯誤',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 獲取投資統計
   */
  async getInvestmentStatistics(): Promise<any> {
    try {
      logger.info('獲取投資統計');

      const _response = await api.get(`${this.baseUrl}/statistics`);

      if (response.success) {
        logger.info('投資統計獲取成功');
        return {
          success: true,
          data: response.data,
          message: '投資統計獲取成功',
          timestamp: new Date(),
        };
      } else {
        logger.error('獲取投資統計失敗:', { message: response.message });
        return {
          success: false,
          message: response.message || '獲取投資統計失敗',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('獲取投資統計時發生錯誤:', error);
      return {
        success: false,
        message: '獲取投資統計時發生錯誤',
        timestamp: new Date(),
      };
    }
  }
}

export const _investmentService = new InvestmentService();
