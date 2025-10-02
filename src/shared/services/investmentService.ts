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
 * 市場Analysis
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
 * Create投資組合Request
 */
export interface CreatePortfolioRequest {
  name: string;
  description?: string;
  riskLevel: InvestmentPortfolio['riskLevel'];
}

/**
 * Add卡牌到投資組合Request
 */
export interface AddCardToPortfolioRequest {
  cardId: string;
  quantity: number;
  price: number;
}

/**
 * 投資Service
 */
export class InvestmentService {
  private readonly baseUrl = '/api/investment';

  /**
   * Create投資組合
   */
  async createPortfolio(data: CreatePortfolioRequest): Promise<any> {
    try {
      logger.info('創建投資組合:', {
        name: data.name,
        riskLevel: data.riskLevel,
      });

      const _response = await api.post(`${this.baseUrl}/portfolios`, data);

      if (response.success) {
        logger.info('投資組合CreateSuccess:', { id: (response.data as any)?.id });
        return {
          success: true,
          data: response.data,
          message: '投資組合CreateSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('投資組合CreateFailed:', { message: response.message });
        return {
          success: false,
          message: response.message || '投資組合CreateFailed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Create投資組合時發生Error:', error);
      return {
        success: false,
        message: 'Create投資組合時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetUser投資組合List
   */
  async getUserPortfolios(userId: string): Promise<any> {
    try {
      logger.info('獲取用戶投資組合列表:', { userId });

      const _response = await api.get(
        `${this.baseUrl}/portfolios/user/${userId}`
      );

      if (response.success) {
        logger.info('投資組合列表GetSuccess:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data || [],
          message: '投資組合列表GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get投資組合列表Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get投資組合列表Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get投資組合列表時發生Error:', error);
      return {
        success: false,
        message: 'Get投資組合列表時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get投資組合詳情
   */
  async getPortfolio(portfolioId: string): Promise<any> {
    try {
      logger.info('獲取投資組合詳情:', { portfolioId });

      const _response = await api.get(
        `${this.baseUrl}/portfolios/${portfolioId}`
      );

      if (response.success) {
        logger.info('投資組合詳情GetSuccess:', {
          id: (response.data as any)?.id,
        });
        return {
          success: true,
          data: response.data,
          message: '投資組合詳情GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get投資組合詳情Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get投資組合詳情Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get投資組合詳情時發生Error:', error);
      return {
        success: false,
        message: 'Get投資組合詳情時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Add卡牌到投資組合
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
        logger.info('卡牌添加Success:', { portfolioId, cardId: data.cardId });
        return {
          success: true,
          data: response.data,
          message: '卡牌添加Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('添加卡牌Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '添加卡牌Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('添加卡牌到投資組合時發生Error:', error);
      return {
        success: false,
        message: '添加卡牌到投資組合時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * 從投資組合Remove卡牌
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
        logger.info('卡牌移除Success:', { portfolioId, cardId });
        return {
          success: true,
          message: '卡牌移除Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('移除卡牌Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '移除卡牌Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('從投資組合移除卡牌時發生Error:', error);
      return {
        success: false,
        message: '從投資組合移除卡牌時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get投資建議
   */
  async getInvestmentAdvice(userId: string, cardId?: string): Promise<any> {
    try {
      logger.info('獲取投資建議:', { userId, cardId });

      const _params = cardId ? new URLSearchParams({ cardId }) : '';
      const _response = await api.get(
        `${this.baseUrl}/advice/${userId}${params ? `?${params}` : ''}`
      );

      if (response.success) {
        logger.info('投資建議GetSuccess:', {
          count: (response.data as any[])?.length,
        });
        return {
          success: true,
          data: response.data || [],
          message: '投資建議GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get投資建議Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get投資建議Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get投資建議時發生Error:', error);
      return {
        success: false,
        message: 'Get投資建議時發生Error',
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
        logger.info('投資建議生成Success:', { id: (response.data as any)?.id });
        return {
          success: true,
          data: response.data,
          message: '投資建議生成Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('生成投資建議Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '生成投資建議Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('生成投資建議時發生Error:', error);
      return {
        success: false,
        message: '生成投資建議時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get市場Analysis
   */
  async getMarketAnalysis(cardId: string): Promise<any> {
    try {
      logger.info('獲取市場分析:', { cardId });

      const _response = await api.get(
        `${this.baseUrl}/market-analysis/${cardId}`
      );

      if (response.success) {
        logger.info('市場分析GetSuccess:', { cardId });
        return {
          success: true,
          data: response.data,
          message: '市場分析GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get市場分析Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get市場分析Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get市場分析時發生Error:', error);
      return {
        success: false,
        message: 'Get市場分析時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get投資組合Table現
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
        logger.info('投資組合表現GetSuccess:', { portfolioId });
        return {
          success: true,
          data: response.data,
          message: '投資組合表現GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get投資組合表現Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get投資組合表現Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get投資組合表現時發生Error:', error);
      return {
        success: false,
        message: 'Get投資組合表現時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetServiceStatus
   */
  async getServiceStats(): Promise<any> {
    try {
      logger.info('Get投資Service狀態');

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
        message: '投資Service狀態GetSuccess',
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Get投資Service狀態時發生Error:', error);
      return {
        success: false,
        message: 'Get投資Service狀態時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get投資List
   */
  async getInvestments(): Promise<any> {
    try {
      logger.info('獲取投資列表');

      const _response = await api.get(`${this.baseUrl}/investments`);

      if (response.success) {
        logger.info('投資列表GetSuccess');
        return {
          success: true,
          data: response.data,
          message: '投資列表GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get投資列表Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get投資列表Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get投資列表時發生Error:', error);
      return {
        success: false,
        message: 'Get投資列表時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Add投資
   */
  async addInvestment(investmentData: unknown): Promise<any> {
    try {
      logger.info('添加投資:', { investmentData });

      const _response = await api.post(
        `${this.baseUrl}/investments`,
        investmentData
      );

      if (response.success) {
        logger.info('投資添加Success');
        return {
          success: true,
          data: response.data,
          message: '投資添加Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('添加投資Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '添加投資Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('添加投資時發生Error:', error);
      return {
        success: false,
        message: '添加投資時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Update投資
   */
  async updateInvestment(id: string, investmentData: unknown): Promise<any> {
    try {
      logger.info('更新投資:', { id, investmentData });

      const _response = await api.put(
        `${this.baseUrl}/investments/${id}`,
        investmentData
      );

      if (response.success) {
        logger.info('投資UpdateSuccess');
        return {
          success: true,
          data: response.data,
          message: '投資UpdateSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Update投資Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Update投資Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Update投資時發生Error:', error);
      return {
        success: false,
        message: 'Update投資時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Remove投資
   */
  async removeInvestment(investmentId: string): Promise<any> {
    try {
      logger.info('移除投資:', { investmentId });

      const _response = await api.delete(
        `${this.baseUrl}/investments/${investmentId}`
      );

      if (response.success) {
        logger.info('投資移除Success');
        return {
          success: true,
          data: response.data,
          message: '投資移除Success',
          timestamp: new Date(),
        };
      } else {
        logger.error('移除投資Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || '移除投資Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('移除投資時發生Error:', error);
      return {
        success: false,
        message: '移除投資時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GetUser投資組合（無ParameterVersion）
   */
  async getUserPortfolio(): Promise<any> {
    try {
      logger.info('獲取用戶投資組合');

      const _response = await api.get(`${this.baseUrl}/portfolio`);

      if (response.success) {
        logger.info('用戶投資組合GetSuccess');
        return {
          success: true,
          data: response.data,
          message: '用戶投資組合GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get用戶投資組合Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get用戶投資組合Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get用戶投資組合時發生Error:', error);
      return {
        success: false,
        message: 'Get用戶投資組合時發生Error',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get投資Statistics
   */
  async getInvestmentStatistics(): Promise<any> {
    try {
      logger.info('獲取投資統計');

      const _response = await api.get(`${this.baseUrl}/statistics`);

      if (response.success) {
        logger.info('投資統計GetSuccess');
        return {
          success: true,
          data: response.data,
          message: '投資統計GetSuccess',
          timestamp: new Date(),
        };
      } else {
        logger.error('Get投資統計Failed:', { message: response.message });
        return {
          success: false,
          message: response.message || 'Get投資統計Failed',
          timestamp: new Date(),
        };
      }
    } catch (error) {
      logger.error('Get投資統計時發生Error:', error);
      return {
        success: false,
        message: 'Get投資統計時發生Error',
        timestamp: new Date(),
      };
    }
  }
}

export const _investmentService = new InvestmentService();
