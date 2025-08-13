import { apiService } from './apiService';
import { Card, CardFilters, Pagination } from '@/types';

class CardService {
  // 獲取卡牌詳情
  async getCard(cardId: string): Promise<Card> {
    const response = await apiService.get<Card>(`/cards/${cardId}`);
    if (!response.data) {
      throw new Error('獲取卡牌詳情失敗：無效的響應數據');
    }
    return response.data;
  }

  // 識別卡牌
  async recognizeCard(imageUri: string): Promise<Card> {
    const response = await apiService.post<Card>('/cards/recognize', { imageUri });
    if (!response.data) {
      throw new Error('卡牌識別失敗：無效的響應數據');
    }
    return response.data;
  }

  // 搜索卡牌
  async searchCards(
    query: string,
    filters?: CardFilters
  ): Promise<{ cards: Card[]; pagination: Pagination }> {
    const response = await apiService.get<{ cards: Card[]; pagination: Pagination }>('/cards/search', {
      params: { query, ...filters }
    });
    if (!response.data) {
      throw new Error('搜索卡牌失敗：無效的響應數據');
    }
    return response.data;
  }

  // 過濾卡牌
  async filterCards(
    filters: CardFilters
  ): Promise<{ cards: Card[]; pagination: Pagination }> {
    const response = await apiService.get<{ cards: Card[]; pagination: Pagination }>('/cards/filter', {
      params: filters
    });
    if (!response.data) {
      throw new Error('過濾卡牌失敗：無效的響應數據');
    }
    return response.data;
  }

  // 分析卡牌條件
  async analyzeCondition(
    cardId: string,
    imageUri?: string
  ): Promise<{
    condition: string;
    centering: number;
    corners: number;
    edges: number;
    surface: number;
    overall: number;
    confidence: number;
  }> {
    const response = await apiService.post<{
      condition: string;
      centering: number;
      corners: number;
      edges: number;
      surface: number;
      overall: number;
      confidence: number;
    }>(`/cards/${cardId}/condition`, { imageUri });
    if (!response.data) {
      throw new Error('條件分析失敗：無效的響應數據');
    }
    return response.data;
  }

  // 驗證真偽
  async verifyAuthenticity(cardId: string, imageUri?: string): Promise<{
    isAuthentic: boolean;
    confidence: number;
    evidence: string[];
    recommendations: string[];
  }> {
    const response = await apiService.post<{
      isAuthentic: boolean;
      confidence: number;
      evidence: string[];
      recommendations: string[];
    }>(`/cards/${cardId}/authenticity`, { imageUri });
    if (!response.data) {
      throw new Error('真偽驗證失敗：無效的響應數據');
    }
    return response.data;
  }

  // 獲取價格歷史
  async getPriceHistory(cardId: string, timeframe: string): Promise<{
    dates: string[];
    prices: number[];
    volumes: number[];
  }> {
    const response = await apiService.get<{
      dates: string[];
      prices: number[];
      volumes: number[];
    }>(`/cards/${cardId}/price-history`, {
      params: { timeframe }
    });
    if (!response.data) {
      throw new Error('獲取價格歷史失敗：無效的響應數據');
    }
    return response.data;
  }

  // 獲取市場數據
  async getMarketData(cardId: string): Promise<{
    currentPrice: number;
    marketCap: number;
    volume24h: number;
    change24h: number;
    change7d: number;
    change30d: number;
    high24h: number;
    low24h: number;
  }> {
    const response = await apiService.get<{
      currentPrice: number;
      marketCap: number;
      volume24h: number;
      change24h: number;
      change7d: number;
      change30d: number;
      high24h: number;
      low24h: number;
    }>(`/cards/${cardId}/market-data`);
    if (!response.data) {
      throw new Error('獲取市場數據失敗：無效的響應數據');
    }
    return response.data;
  }

  // 獲取熱門卡牌
  async getPopularCards(): Promise<Card[]> {
    const response = await apiService.get<Card[]>('/cards/popular');
    if (!response.data) {
      throw new Error('獲取熱門卡牌失敗：無效的響應數據');
    }
    return response.data;
  }

  // 獲取最新卡牌
  async getLatestCards(): Promise<Card[]> {
    const response = await apiService.get<Card[]>('/cards/latest');
    if (!response.data) {
      throw new Error('獲取最新卡牌失敗：無效的響應數據');
    }
    return response.data;
  }

  // 獲取推薦卡牌
  async getRecommendedCards(): Promise<Card[]> {
    const response = await apiService.get<Card[]>('/cards/recommended');
    if (!response.data) {
      throw new Error('獲取推薦卡牌失敗：無效的響應數據');
    }
    return response.data;
  }

  // 獲取卡牌系列
  async getCardSets(): Promise<{
    id: string;
    name: string;
    code: string;
    releaseDate: string;
    totalCards: number;
  }[]> {
    const response = await apiService.get<{
      id: string;
      name: string;
      code: string;
      releaseDate: string;
      totalCards: number;
    }[]>('/cards/sets');
    if (!response.data) {
      throw new Error('獲取卡牌系列失敗：無效的響應數據');
    }
    return response.data;
  }

  // 獲取系列中的卡牌
  async getCardsBySet(setId: string): Promise<{ cards: Card[]; pagination: Pagination }> {
    const response = await apiService.get<{ cards: Card[]; pagination: Pagination }>(`/cards/sets/${setId}/cards`);
    if (!response.data) {
      throw new Error('獲取系列卡牌失敗：無效的響應數據');
    }
    return response.data;
  }

  // 獲取藝術家列表
  async getArtists(): Promise<string[]> {
    const response = await apiService.get<string[]>('/cards/artists');
    if (!response.data) {
      throw new Error('獲取藝術家列表失敗：無效的響應數據');
    }
    return response.data;
  }

  // 獲取稀有度列表
  async getRarities(): Promise<string[]> {
    const response = await apiService.get<string[]>('/cards/rarities');
    if (!response.data) {
      throw new Error('獲取稀有度列表失敗：無效的響應數據');
    }
    return response.data;
  }

  // 獲取卡牌類型列表
  async getCardTypes(): Promise<string[]> {
    const response = await apiService.get<string[]>('/cards/types');
    if (!response.data) {
      throw new Error('獲取卡牌類型列表失敗：無效的響應數據');
    }
    return response.data;
  }

  // 獲取相似卡牌
  async getSimilarCards(cardId: string): Promise<Card[]> {
    const response = await apiService.get<Card[]>(`/cards/${cardId}/similar`);
    if (!response.data) {
      throw new Error('獲取相似卡牌失敗：無效的響應數據');
    }
    return response.data;
  }

  // 設置價格警報
  async setPriceAlert(cardId: string, targetPrice: number, type: 'above' | 'below'): Promise<{
    id: string;
    cardId: string;
    cardName: string;
    targetPrice: number;
    currentPrice: number;
    triggered: boolean;
  }> {
    const response = await apiService.post<{
      id: string;
      cardId: string;
      cardName: string;
      targetPrice: number;
      currentPrice: number;
      triggered: boolean;
    }>('/cards/price-alerts', {
      cardId,
      targetPrice,
      type
    });
    if (!response.data) {
      throw new Error('設置價格警報失敗：無效的響應數據');
    }
    return response.data;
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
    const response = await apiService.get<{
      id: string;
      cardId: string;
      cardName: string;
      targetPrice: number;
      currentPrice: number;
      triggered: boolean;
    }[]>('/cards/price-alerts');
    if (!response.data) {
      throw new Error('獲取價格警報失敗：無效的響應數據');
    }
    return response.data;
  }

  // 刪除價格警報
  async deletePriceAlert(alertId: string): Promise<void> {
    await apiService.delete(`/cards/price-alerts/${alertId}`);
  }

  // 獲取卡牌統計
  async getCardStatistics(cardId: string): Promise<{
    totalOwned: number;
    averagePrice: number;
    priceRange: { min: number; max: number };
    marketTrend: 'stable' | 'up' | 'down';
    popularity: number;
  }> {
    const response = await apiService.get<{
      totalOwned: number;
      averagePrice: number;
      priceRange: { min: number; max: number };
      marketTrend: 'stable' | 'up' | 'down';
      popularity: number;
    }>(`/cards/${cardId}/statistics`);
    if (!response.data) {
      throw new Error('獲取卡牌統計失敗：無效的響應數據');
    }
    return response.data;
  }
}

export const cardService = new CardService();
export default cardService;
