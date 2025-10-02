// 市場價格系統類型定義
export enum PriceSource {
  MARKETPLACE = 'marketplace',
  AUCTION = 'auction',
  PRIVATE_SALE = 'private_sale',
  ESTIMATE = 'estimate',
  ANALYTICS = 'analytics',
}

export enum PriceTrend {
  RISING = 'rising',
  FALLING = 'falling',
  STABLE = 'stable',
  VOLATILE = 'volatile',
}

export enum MarketStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  MAINTENANCE = 'maintenance',
}

export enum PriceAlertType {
  ABOVE = 'above',
  BELOW = 'below',
  PERCENTAGE_CHANGE = 'percentage_change',
  VOLUME_SPIKE = 'volume_spike',
}

export interface PriceData {
  id: string;
  cardId: string;
  price: number;
  currency: string;
  source: PriceSource;
  timestamp: string;
  condition: string;
  location?: string;
  seller?: string;
  volume?: number;
  confidence?: number;
  metadata?: {
    auctionEndTime?: string;
    reservePrice?: number;
    buyNowPrice?: number;
    shippingCost?: number;
    taxAmount?: number;
    [key: string]: unknown;
  };
}

export interface MarketPrice {
  id: string;
  cardId: string;
  currentPrice: number;
  currency: string;
  priceChange: number;
  priceChangePercent: number;
  trend: PriceTrend;
  volume24h: number;
  volumeChange: number;
  lastUpdated: string;
  sources: PriceSource[];
  confidence: number;
  marketStatus: MarketStatus;
  priceHistory: PriceData[];
  metadata?: {
    marketCap?: number;
    circulatingSupply?: number;
    totalSupply?: number;
    [key: string]: unknown;
  };
}

export interface PriceHistory {
  id: string;
  cardId: string;
  period: string;
  data: {
    timestamp: string;
    price: number;
    volume: number;
    change: number;
    changePercent: number;
  }[];
  statistics: {
    high: number;
    low: number;
    average: number;
    median: number;
    volatility: number;
    volumeTotal: number;
  };
}

export interface PriceAlert {
  id: string;
  userId: string;
  cardId: string;
  type: PriceAlertType;
  threshold: number;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
  metadata?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    [key: string]: unknown;
  };
}

export interface MarketAnalysis {
  id: string;
  cardId: string;
  analysisDate: string;
  summary: string;
  trend: PriceTrend;
  confidence: number;
  factors: {
    marketDemand: number;
    supplyLevel: number;
    competition: number;
    seasonality: number;
    newsImpact: number;
  };
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  timeHorizon: 'short' | 'medium' | 'long';
}

export interface PriceRequest {
  cardId: string;
  condition?: string;
  location?: string;
  includeHistory?: boolean;
  period?: string;
  sources?: PriceSource[];
}

export interface PriceResponse {
  success: boolean;
  data: MarketPrice;
  history?: PriceHistory;
  analysis?: MarketAnalysis;
  alerts?: PriceAlert[];
  error?: string;
}

export interface PriceStats {
  totalCards: number;
  activeMarkets: number;
  totalVolume24h: number;
  averagePriceChange: number;
  trendingCards: string[];
  topGainers: string[];
  topLosers: string[];
  marketStatus: MarketStatus;
}

export interface PriceConfig {
  updateInterval: number;
  maxHistoryDays: number;
  confidenceThreshold: number;
  alertCheckInterval: number;
  sources: PriceSource[];
  enabledFeatures: string[];
}

export interface PriceServiceConfig {
  apiKey?: string;
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  cacheEnabled: boolean;
  cacheExpiry: number;
}
