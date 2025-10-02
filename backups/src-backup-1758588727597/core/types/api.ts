import { Card } from './cards';
import type { BaseEntity, Address } from './common';

// 交易相關類型
export interface Transaction extends BaseEntity {
  userId: string;
  cardId: string;
  type: TransactionType;
  quantity: number;
  price: number;
  totalAmount: number;
  fees: number;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  metadata: TransactionMetadata;
}

export type TransactionType =
  | 'purchase'
  | 'sale'
  | 'trade'
  | 'gift'
  | 'auction';

export type TransactionStatus =
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod =
  | 'credit_card'
  | 'paypal'
  | 'bank_transfer'
  | 'crypto'
  | 'cash';

export interface TransactionMetadata {
  platform: string;
  transactionId: string;
  notes?: string;
  shippingAddress?: Address;
  trackingNumber?: string;
}

// 市場相關類型
export interface MarketDataEntity extends BaseEntity {
  cardId: string;
  price: number;
  volume: number;
  change24h: number;
  change7d: number;
  change30d: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  lastUpdated: Date;
}

// 投資相關類型
export interface Investment extends BaseEntity {
  userId: string;
  cardId: string;
  type: InvestmentType;
  amount: number;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  entryValue: number; // 添加 entryValue
  profitLoss: number;
  profitLossPercentage: number;
  status: InvestmentStatus;
  notes?: string;
}

export type InvestmentType = 'buy' | 'sell' | 'hold';
export type InvestmentStatus = 'active' | 'completed' | 'cancelled';

// 投資建議類型
export interface InvestmentAdvice {
  cardId: string;
  recommendation: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
  expectedValue: number;
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
}

// 投資組合類型
export interface Portfolio {
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  bestPerformer?: Investment;
  worstPerformer?: Investment;
  recentTransactions: Transaction[];
  performanceHistory: PortfolioPerformance[];
}

export interface PortfolioStatistics {
  totalInvestments: number;
  activeInvestments: number;
  completedInvestments: number;
  averageReturn: number;
  bestReturn: number;
  worstReturn: number;
}

export interface PortfolioPerformance {
  date: Date;
  value: number;
  profitLoss: number;
  profitLossPercentage: number;
}

// 市場趨勢類型
export interface MarketTrend {
  cardId: string;
  trend: 'rising' | 'falling' | 'stable';
  changePercentage: number;
  volume: number;
  confidence: number;
  timeframe: string;
}

// 價格歷史類型
export interface PriceHistory {
  cardId: string;
  dates: string[];
  prices: number[];
  volumes: number[];
}

// Redux 投資狀態類型
export interface InvestmentState {
  investments: Investment[];
  portfolio: Portfolio;
  isLoading: boolean;
  error: string | null;
  selectedInvestment: Investment | null;
  investmentAdvice: InvestmentAdvice | null;
  statistics: PortfolioStatistics | null;
  isAdding: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  portfolioValue: number;
  totalProfitLoss: number;
  profitLossPercentage: number;
}

export interface MarketState {
  marketData: MarketDataEntity[] | null;
  priceHistory: PriceHistory[];
  isLoading: boolean;
  error: string | null;
  marketTrends: MarketTrend[] | null;
}
