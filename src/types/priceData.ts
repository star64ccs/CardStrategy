/**
 * 價格平台Class型
 */
export interface PricePlatform {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  lastUpdate: Date;
  reliability: number;
}

/**
 * 評級機構Class型
 */
export interface GradingAgency {
  id: string;
  name: string;
  abbreviation: string;
  isActive: boolean;
  reliability: number;
}

/**
 * 歷史價格DataClass型
 */
export interface HistoricalPriceData {
  cardId: string;
  platform: string;
  date: string;
  price: number;
  volume: number;
  condition: string;
}

/**
 * 評級機構DataClass型
 */
export interface GradingAgencyData {
  cardId: string;
  agency: string;
  grade: string;
  price: number;
  lastUpdate: Date;
  reliability: number;
}

/**
 * 價格AlertClass型
 */
export interface PriceAlert {
  id: string;
  cardId: string;
  userId: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: Date;
}

/**
 * 市場StatisticsClass型
 */
export interface MarketStats {
  totalCards: number;
  averagePrice: number;
  priceChange24h: number;
  volume24h: number;
  trendingCards: string[];
}
