export interface MarketData {
  id: string;
  cardId: string;
  cardName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  timestamp: string;
}

export interface PriceAlert {
  id: string;
  cardId: string;
  cardName: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: string;
}

export interface MarketTrend {
  id: string;
  cardId: string;
  cardName: string;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  factors: string[];
  prediction: number;
  timestamp: string;
}

export interface MarketInsight {
  id: string;
  title: string;
  description: string;
  type: 'price_spike' | 'volume_surge' | 'trend_change' | 'market_opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedCards: string[];
  createdAt: string;
}

export interface TradingVolume {
  id: string;
  cardId: string;
  cardName: string;
  volume: number;
  averageVolume: number;
  volumeChange: number;
  period: '1h' | '24h' | '7d' | '30d';
  timestamp: string;
}

export interface MarketAnalysisState {
  marketData: MarketData[];
  priceAlerts: PriceAlert[];
  marketTrends: MarketTrend[];
  marketInsights: MarketInsight[];
  tradingVolumes: TradingVolume[];
  loading: boolean;
  error: string | null;
  selectedTimeframe: '1h' | '24h' | '7d' | '30d';
  selectedCards: string[];
}
