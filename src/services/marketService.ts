import { apiService } from './apiService';
import { MarketData, PriceHistory } from '@/types';

class MarketService {
  // 獲取市場數據
  async getMarketData(cardId?: string): Promise<MarketData[]> {
    const url = cardId ? `/market/data/${cardId}` : '/market/data';
    const response = await apiService.get<MarketData[]>(url);
    return response.data!;
  }

  // 獲取價格歷史
  async getPriceHistory(cardId: string, period: string = '30d'): Promise<PriceHistory> {
    const response = await apiService.get<PriceHistory>(`/market/price-history/${cardId}?period=${period}`);
    return response.data!;
  }

  // 獲取市場趨勢
  async getMarketTrends(): Promise<{
    trendingUp: string[];
    trendingDown: string[];
    stable: string[];
    overallTrend: 'up' | 'down' | 'stable';
  }> {
    const response = await apiService.get('/market/trends');
    return response.data!;
  }

  // 獲取熱門卡牌
  async getPopularCards(limit: number = 20): Promise<{
    id: string;
    name: string;
    price: number;
    change24h: number;
    volume: number;
  }[]> {
    const response = await apiService.get(`/market/popular?limit=${limit}`);
    return response.data!;
  }

  // 獲取市場統計
  async getMarketStatistics(): Promise<{
    totalVolume: number;
    averagePrice: number;
    totalCards: number;
    activeTraders: number;
  }> {
    const response = await apiService.get('/market/statistics');
    return response.data!;
  }

  // 搜索市場
  async searchMarket(query: string, filters?: any): Promise<{
    cards: any[];
    pagination: any;
  }> {
    const response = await apiService.get('/market/search', {
      params: { query, ...filters }
    });
    return response.data!;
  }

  // 獲取市場新聞
  async getMarketNews(limit: number = 10): Promise<{
    id: string;
    title: string;
    summary: string;
    publishedAt: string;
    source: string;
    url: string;
  }[]> {
    const response = await apiService.get(`/market/news?limit=${limit}`);
    return response.data!;
  }

  // 獲取市場分析
  async getMarketAnalysis(cardId?: string): Promise<{
    analysis: string;
    factors: string[];
    predictions: string[];
    recommendations: string[];
  }> {
    const url = cardId ? `/market/analysis/${cardId}` : '/market/analysis';
    const response = await apiService.get(url);
    return response.data!;
  }

  // 獲取交易量數據
  async getVolumeData(cardId: string, period: string = '7d'): Promise<{
    dates: string[];
    volumes: number[];
    averageVolume: number;
  }> {
    const response = await apiService.get(`/market/volume/${cardId}?period=${period}`);
    return response.data!;
  }

  // 獲取市場比較
  async compareCards(cardIds: string[]): Promise<{
    cards: {
      id: string;
      name: string;
      price: number;
      change24h: number;
      volume: number;
      marketCap: number;
    }[];
  }> {
    const response = await apiService.post('/market/compare', { cardIds });
    return response.data!;
  }

  // 獲取市場警報
  async getMarketAlerts(): Promise<{
    id: string;
    type: 'price_spike' | 'volume_surge' | 'market_crash';
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: string;
  }[]> {
    const response = await apiService.get('/market/alerts');
    return response.data!;
  }

  // 設置市場監控
  async setMarketWatch(cardIds: string[]): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiService.post('/market/watch', { cardIds });
    return response.data!;
  }

  // 獲取市場報告
  async getMarketReport(period: string = 'monthly'): Promise<{
    summary: string;
    highlights: string[];
    data: any;
    recommendations: string[];
  }> {
    const response = await apiService.get(`/market/report?period=${period}`);
    return response.data!;
  }
}

export const marketService = new MarketService();
export default marketService;
