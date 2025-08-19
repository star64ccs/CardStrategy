import { apiService } from './apiService';
import { Investment, InvestmentAdvice, Portfolio } from '@/types';
import { validateInput, validateApiResponse } from '../utils/validationService';
import {
  InvestmentSchema,
  PortfolioSchema,
  PortfolioStatisticsSchema
} from '../utils/validationSchemas';
import { z } from 'zod';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// 添加投資請求驗證模式
const AddInvestmentRequestSchema = z.object({
  cardId: z.string().uuid('無效的卡牌 ID'),
  type: z.enum(['buy', 'sell', 'hold']),
  amount: z.number().positive('投資金額必須為正數'),
  quantity: z.number().int().positive('數量必須為正整數'),
  entryPrice: z.number().positive('入場價格必須為正數'),
  notes: z.string().max(500, '備註不能超過 500 個字元').optional()
});

// 價格警報請求驗證模式
const PriceAlertRequestSchema = z.object({
  cardId: z.string().uuid('無效的卡牌 ID'),
  targetPrice: z.number().positive('目標價格必須為正數'),
  type: z.enum(['above', 'below'])
});

class InvestmentService {
  // 獲取用戶投資
  async getInvestments(): Promise<Investment[]> {
    try {
      const response = await apiService.get<Investment[]>('/investments');
      const validationResult = validateApiResponse(z.array(InvestmentSchema), response.data);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '投資數據驗證失敗');
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 獲取單個投資
  async getInvestment(investmentId: string): Promise<Investment> {
    try {
      const validationResult = validateInput(z.object({ investmentId: z.string().uuid('無效的投資 ID') }), { investmentId });
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '投資 ID 驗證失敗');
      }
      const response = await apiService.get<Investment>(`/investments/${investmentId}`);
      const responseValidation = validateApiResponse(InvestmentSchema, response.data);
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '投資數據驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 添加投資
  async addInvestment(data: {
    cardId: string;
    type: 'buy' | 'sell' | 'hold';
    amount: number;
    quantity: number;
    entryPrice: number;
    notes?: string;
  }): Promise<Investment> {
    try {
      const validationResult = validateInput(AddInvestmentRequestSchema, data);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '投資數據驗證失敗');
      }
      const response = await apiService.post<Investment>('/investments', validationResult.data);
      const responseValidation = validateApiResponse(InvestmentSchema, response.data);
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '投資數據驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 更新投資
  async updateInvestment(investmentId: string, data: Partial<Investment>): Promise<Investment> {
    try {
      const validationResult = validateInput(z.object({ investmentId: z.string().uuid('無效的投資 ID') }), { investmentId });
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '投資 ID 驗證失敗');
      }
      const response = await apiService.put<Investment>(`/investments/${investmentId}`, data);
      const responseValidation = validateApiResponse(InvestmentSchema, response.data);
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '投資數據驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 移除投資
  async removeInvestment(investmentId: string): Promise<void> {
    try {
      const validationResult = validateInput(z.object({ investmentId: z.string().uuid('無效的投資 ID') }), { investmentId });
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '投資 ID 驗證失敗');
      }
      await apiService.delete(`/investments/${investmentId}`);
    } catch (error) {
      throw error;
    }
  }

  // 獲取投資組合
  async getPortfolio(): Promise<Portfolio> {
    try {
      const response = await apiService.get<Portfolio>('/investments/portfolio');
      const validationResult = validateApiResponse(PortfolioSchema, response.data);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '投資組合數據驗證失敗');
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 獲取投資建議
  async getInvestmentAdvice(cardId: string): Promise<InvestmentAdvice> {
    try {
      const validationResult = validateInput(z.object({ cardId: z.string().uuid('無效的卡牌 ID') }), { cardId });
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '卡牌 ID 驗證失敗');
      }
      const response = await apiService.get<InvestmentAdvice>(`/investments/advice/${cardId}`);
      const responseValidation = validateApiResponse(z.object({
        cardId: z.string(),
        recommendation: z.enum(['buy', 'sell', 'hold']),
        confidence: z.number().min(0).max(1),
        reasoning: z.array(z.string()),
        priceTarget: z.number().positive(),
        riskLevel: z.enum(['low', 'medium', 'high'])
      }), response.data);
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '投資建議數據驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 獲取投資統計
  async getInvestmentStatistics(): Promise<{
    totalValue: number;
    totalProfitLoss: number;
    totalProfitLossPercentage: number;
    bestPerformer?: Investment;
    worstPerformer?: Investment;
    recentTransactions: any[];
  }> {
    try {
      const response = await apiService.get('/investments/statistics');
      const validationResult = validateApiResponse(PortfolioStatisticsSchema, response.data);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '投資統計數據驗證失敗');
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 設置價格警報
  async setPriceAlert(cardId: string, targetPrice: number, type: 'above' | 'below'): Promise<{
    id: string;
    cardId: string;
    targetPrice: number;
    type: string;
    isActive: boolean;
  }> {
    try {
      const validationResult = validateInput(PriceAlertRequestSchema, { cardId, targetPrice, type });
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '價格警報數據驗證失敗');
      }
      const response = await apiService.post('/investments/price-alerts', validationResult.data);
      const responseValidation = validateApiResponse(z.object({
        id: z.string().uuid(),
        cardId: z.string().uuid(),
        targetPrice: z.number().positive(),
        type: z.string(),
        isActive: z.boolean()
      }), response.data);
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '價格警報數據驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 獲取價格警報
  async getPriceAlerts(): Promise<{
    id: string;
    cardId: string;
    cardName: string;
    targetPrice: number;
    currentPrice: number;
    triggered: boolean;
  }[]> {
    try {
      const response = await apiService.get('/investments/price-alerts');
      const validationResult = validateApiResponse(z.array(z.object({
        id: z.string().uuid(),
        cardId: z.string().uuid(),
        cardName: z.string(),
        targetPrice: z.number().positive(),
        currentPrice: z.number().positive(),
        triggered: z.boolean()
      })), response.data);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '價格警報數據驗證失敗');
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 刪除價格警報
  async deletePriceAlert(alertId: string): Promise<void> {
    try {
      const validationResult = validateInput(z.object({ alertId: z.string().uuid('無效的警報 ID') }), { alertId });
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '警報 ID 驗證失敗');
      }
      await apiService.delete(`/investments/price-alerts/${alertId}`);
    } catch (error) {
      throw error;
    }
  }

  // 獲取投資歷史
  async getInvestmentHistory(filters?: any): Promise<{
    investments: Investment[];
    pagination: any;
  }> {
    try {
      if (filters) {
        const filterValidation = validateInput(z.object({
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          type: z.enum(['buy', 'sell', 'hold']).optional(),
          cardId: z.string().uuid().optional(),
          limit: z.number().int().min(1).max(100).optional(),
          offset: z.number().int().min(0).optional()
        }), filters);
        if (!filterValidation.isValid) {
          throw new Error(filterValidation.errorMessage || '過濾器驗證失敗');
        }
      }

      const response = await apiService.get('/investments/history', { params: filters });
      const responseValidation = validateApiResponse(z.object({
        investments: z.array(InvestmentSchema),
        pagination: z.object({
          total: z.number().int().min(0),
          page: z.number().int().min(1),
          limit: z.number().int().min(1),
          totalPages: z.number().int().min(0)
        })
      }), response.data);
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '投資歷史數據驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 導出投資報告
  async exportInvestmentReport(format: 'pdf' | 'csv' | 'json' = 'pdf'): Promise<string> {
    try {
      const validationResult = validateInput(z.object({ format: z.enum(['pdf', 'csv', 'json']) }), { format });
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '導出格式驗證失敗');
      }
      const response = await apiService.get(`/investments/export?format=${format}`);
      const responseValidation = validateApiResponse(z.string(), response.data);
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '導出結果驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 獲取市場趨勢
  async getMarketTrends(): Promise<{
    trendingUp: string[];
    trendingDown: string[];
    stable: string[];
  }> {
    try {
      const response = await apiService.get('/investments/market-trends');
      const validationResult = validateApiResponse(z.object({
        trendingUp: z.array(z.string()),
        trendingDown: z.array(z.string()),
        stable: z.array(z.string())
      }), response.data);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '市場趨勢數據驗證失敗');
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 獲取風險分析
  async getRiskAnalysis(): Promise<{
    riskLevel: 'low' | 'medium' | 'high';
    factors: string[];
    recommendations: string[];
  }> {
    try {
      const response = await apiService.get('/investments/risk-analysis');
      const validationResult = validateApiResponse(z.object({
        riskLevel: z.enum(['low', 'medium', 'high']),
        factors: z.array(z.string()),
        recommendations: z.array(z.string())
      }), response.data);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '風險分析數據驗證失敗');
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }
}

export const investmentService = new InvestmentService();
export default investmentService;
