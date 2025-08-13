import { apiService } from './apiService';
import { Investment, InvestmentAdvice, Portfolio } from '@/types';

class InvestmentService {
  // 獲取用戶投資
  async getInvestments(): Promise<Investment[]> {
    const response = await apiService.get<Investment[]>('/investments');
    return response.data!;
  }

  // 獲取單個投資
  async getInvestment(investmentId: string): Promise<Investment> {
    const response = await apiService.get<Investment>(`/investments/${investmentId}`);
    return response.data!;
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
    const response = await apiService.post<Investment>('/investments', data);
    return response.data!;
  }

  // 更新投資
  async updateInvestment(investmentId: string, data: Partial<Investment>): Promise<Investment> {
    const response = await apiService.put<Investment>(`/investments/${investmentId}`, data);
    return response.data!;
  }

  // 移除投資
  async removeInvestment(investmentId: string): Promise<void> {
    await apiService.delete(`/investments/${investmentId}`);
  }

  // 獲取投資組合
  async getPortfolio(): Promise<Portfolio> {
    const response = await apiService.get<Portfolio>('/investments/portfolio');
    return response.data!;
  }

  // 獲取投資建議
  async getInvestmentAdvice(cardId: string): Promise<InvestmentAdvice> {
    const response = await apiService.get<InvestmentAdvice>(`/investments/advice/${cardId}`);
    return response.data!;
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
    const response = await apiService.get('/investments/statistics');
    return response.data!;
  }

  // 設置價格警報
  async setPriceAlert(cardId: string, targetPrice: number, type: 'above' | 'below'): Promise<{
    id: string;
    cardId: string;
    targetPrice: number;
    type: string;
    isActive: boolean;
  }> {
    const response = await apiService.post('/investments/price-alerts', {
      cardId,
      targetPrice,
      type
    });
    return response.data!;
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
    const response = await apiService.get('/investments/price-alerts');
    return response.data!;
  }

  // 刪除價格警報
  async deletePriceAlert(alertId: string): Promise<void> {
    await apiService.delete(`/investments/price-alerts/${alertId}`);
  }

  // 獲取投資歷史
  async getInvestmentHistory(filters?: any): Promise<{
    investments: Investment[];
    pagination: any;
  }> {
    const response = await apiService.get('/investments/history', { params: filters });
    return response.data!;
  }

  // 導出投資報告
  async exportInvestmentReport(format: 'pdf' | 'csv' | 'json' = 'pdf'): Promise<string> {
    const response = await apiService.get(`/investments/export?format=${format}`);
    return response.data!;
  }

  // 獲取市場趨勢
  async getMarketTrends(): Promise<{
    trendingUp: string[];
    trendingDown: string[];
    stable: string[];
  }> {
    const response = await apiService.get('/investments/market-trends');
    return response.data!;
  }

  // 獲取風險分析
  async getRiskAnalysis(): Promise<{
    riskLevel: 'low' | 'medium' | 'high';
    factors: string[];
    recommendations: string[];
  }> {
    const response = await apiService.get('/investments/risk-analysis');
    return response.data!;
  }
}

export const investmentService = new InvestmentService();
export default investmentService;
