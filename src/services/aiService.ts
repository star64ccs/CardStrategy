import { apiService } from './apiService';
import { AIAnalysis, AIChatMessage, InvestmentAdvice } from '@/types';

class AIService {
  // 卡牌分析
  async analyzeCard(cardId: string, imageUrl?: string): Promise<AIAnalysis> {
    const response = await apiService.post<AIAnalysis>('/ai/analyze-card', {
      cardId,
      imageUrl
    });
    return response.data!;
  }

  // 條件分析
  async analyzeCondition(cardId: string, imageUrl: string): Promise<{
    condition: string;
    centering: number;
    corners: number;
    edges: number;
    surface: number;
    overall: number;
    confidence: number;
  }> {
    const response = await apiService.post('/ai/analyze-condition', {
      cardId,
      imageUrl
    });
    return response.data!;
  }

  // 真偽檢測
  async verifyAuthenticity(cardId: string, imageUrl: string): Promise<{
    isAuthentic: boolean;
    confidence: number;
    evidence: string[];
    recommendations: string[];
  }> {
    const response = await apiService.post('/ai/verify-authenticity', {
      cardId,
      imageUrl
    });
    return response.data!;
  }

  // 價格預測
  async predictPrice(cardId: string, timeframe: string): Promise<{
    predictedPrice: number;
    confidence: number;
    factors: string[];
    trend: 'up' | 'down' | 'stable';
  }> {
    const response = await apiService.post('/ai/predict-price', {
      cardId,
      timeframe
    });
    return response.data!;
  }

  // AI 聊天
  async sendMessage(message: string, context?: any): Promise<AIChatMessage> {
    const response = await apiService.post<AIChatMessage>('/ai/chat', {
      message,
      context
    });
    return response.data!;
  }

  // 獲取聊天歷史
  async getChatHistory(limit: number = 50): Promise<AIChatMessage[]> {
    const response = await apiService.get<AIChatMessage[]>(`/ai/chat/history?limit=${limit}`);
    return response.data!;
  }

  // 清除聊天歷史
  async clearChatHistory(): Promise<void> {
    await apiService.delete('/ai/chat/history');
  }

  // 投資建議
  async getInvestmentAdvice(cardId: string): Promise<InvestmentAdvice> {
    const response = await apiService.get<InvestmentAdvice>(`/ai/investment-advice/${cardId}`);
    return response.data!;
  }

  // 市場洞察
  async getMarketInsights(cardId?: string): Promise<{
    insights: string[];
    trends: string[];
    recommendations: string[];
  }> {
    const url = cardId ? `/ai/market-insights/${cardId}` : '/ai/market-insights';
    const response = await apiService.get(url);
    return response.data!;
  }

  // 生成投資報告
  async generateInvestmentReport(cardIds: string[]): Promise<{
    report: string;
    summary: string;
    recommendations: InvestmentAdvice[];
  }> {
    const response = await apiService.post('/ai/generate-report', {
      cardIds
    });
    return response.data!;
  }
}

export const aiService = new AIService();
export default aiService;
