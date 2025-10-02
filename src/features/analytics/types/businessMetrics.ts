// 業務指標AnalysisClass型定義

export interface BusinessMetrics {
  // 基礎指標
  revenue: RevenueMetrics;
  profit: ProfitMetrics;
  growth: GrowthMetrics;
  efficiency: EfficiencyMetrics;
  market: MarketMetrics;
  customer: CustomerMetrics;
  operational: OperationalMetrics;
  financial: FinancialMetrics;
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  averageRevenuePerUser: number;
  revenueGrowthRate: number;
  revenueByProduct: Record<string, number>;
  revenueByRegion: Record<string, number>;
  revenueByChannel: Record<string, number>;
  revenueByTimeframe: {
    daily: number[];
    weekly: number[];
    monthly: number[];
    quarterly: number[];
    yearly: number[];
  };
}

export interface ProfitMetrics {
  grossProfit: number;
  netProfit: number;
  grossProfitMargin: number;
  netProfitMargin: number;
  operatingProfit: number;
  operatingMargin: number;
  profitGrowthRate: number;
  profitByProduct: Record<string, number>;
  profitByRegion: Record<string, number>;
  costBreakdown: {
    costOfGoodsSold: number;
    operatingExpenses: number;
    marketingExpenses: number;
    researchAndDevelopment: number;
    administrativeExpenses: number;
  };
}

export interface GrowthMetrics {
  userGrowthRate: number;
  revenueGrowthRate: number;
  marketShareGrowth: number;
  productAdoptionRate: number;
  featureUsageGrowth: number;
  geographicExpansion: number;
  customerAcquisitionGrowth: number;
  retentionGrowth: number;
  growthBySegment: Record<string, number>;
  growthByTimeframe: {
    daily: number[];
    weekly: number[];
    monthly: number[];
    quarterly: number[];
    yearly: number[];
  };
}

export interface EfficiencyMetrics {
  customerAcquisitionCost: number;
  customerLifetimeValue: number;
  paybackPeriod: number;
  conversionRate: number;
  churnRate: number;
  retentionRate: number;
  averageOrderValue: number;
  inventoryTurnover: number;
  assetUtilization: number;
  employeeProductivity: number;
  efficiencyByChannel: Record<string, number>;
  efficiencyByProduct: Record<string, number>;
}

export interface MarketMetrics {
  marketShare: number;
  marketSize: number;
  marketGrowthRate: number;
  competitivePosition: number;
  brandAwareness: number;
  customerSatisfaction: number;
  netPromoterScore: number;
  marketPenetration: number;
  marketByRegion: Record<string, number>;
  marketBySegment: Record<string, number>;
  competitiveAnalysis: {
    competitors: string[];
    ourPosition: number;
    competitiveAdvantages: string[];
    threats: string[];
  };
}

export interface CustomerMetrics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerSatisfaction: number;
  customerLifetimeValue: number;
  customerAcquisitionCost: number;
  customerRetentionRate: number;
  customerChurnRate: number;
  averageOrderValue: number;
  customerBySegment: Record<string, number>;
  customerByRegion: Record<string, number>;
  customerByProduct: Record<string, number>;
  customerBehavior: {
    averageSessionDuration: number;
    sessionFrequency: number;
    featureUsage: Record<string, number>;
    purchaseFrequency: number;
    supportTickets: number;
  };
}

export interface OperationalMetrics {
  orderFulfillmentRate: number;
  averageOrderProcessingTime: number;
  inventoryAccuracy: number;
  supplierPerformance: number;
  qualityMetrics: {
    defectRate: number;
    returnRate: number;
    customerComplaints: number;
    productQualityScore: number;
  };
  operationalEfficiency: {
    employeeProductivity: number;
    systemUptime: number;
    responseTime: number;
    throughput: number;
  };
  operationalByRegion: Record<string, number>;
  operationalByProduct: Record<string, number>;
}

export interface FinancialMetrics {
  cashFlow: {
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
    freeCashFlow: number;
  };
  liquidity: {
    currentRatio: number;
    quickRatio: number;
    cashRatio: number;
    workingCapital: number;
  };
  solvency: {
    debtToEquityRatio: number;
    debtToAssetRatio: number;
    interestCoverageRatio: number;
    debtServiceCoverageRatio: number;
  };
  profitability: {
    returnOnAssets: number;
    returnOnEquity: number;
    returnOnInvestment: number;
    returnOnCapitalEmployed: number;
  };
  financialByPeriod: {
    daily: FinancialPeriodMetrics;
    weekly: FinancialPeriodMetrics;
    monthly: FinancialPeriodMetrics;
    quarterly: FinancialPeriodMetrics;
    yearly: FinancialPeriodMetrics;
  };
}

export interface FinancialPeriodMetrics {
  revenue: number;
  expenses: number;
  profit: number;
  cashFlow: number;
  assets: number;
  liabilities: number;
  equity: number;
}

export interface BusinessMetricsFilter {
  dateRange?: {
    start: Date;
    end: Date;
  };
  products?: string[];
  regions?: string[];
  channels?: string[];
  customerSegments?: string[];
  timeframes?: ('daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly')[];
  includeHistorical?: boolean;
  includeProjections?: boolean;
  includeComparisons?: boolean;
}

export interface BusinessMetricsReport {
  id: string;
  title: string;
  description: string;
  period: {
    start: Date;
    end: Date;
  };
  filter?: BusinessMetricsFilter;
  metrics: BusinessMetrics;
  insights: BusinessMetricsInsight[];
  recommendations: BusinessMetricsRecommendation[];
  alerts: BusinessMetricsAlert[];
  status: 'pending' | 'completed' | 'failed';
  generatedAt: Date;
  version: string;
}

export interface BusinessMetricsInsight {
  id: string;
  type: 'positive' | 'negative' | 'neutral' | 'opportunity' | 'risk';
  category:
    | 'revenue'
    | 'profit'
    | 'growth'
    | 'efficiency'
    | 'market'
    | 'customer'
    | 'operational'
    | 'financial';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  dataPoints: {
    metric: string;
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  timestamp: Date;
}

export interface BusinessMetricsRecommendation {
  id: string;
  type:
    | 'action'
    | 'strategy'
    | 'optimization'
    | 'investment'
    | 'risk_mitigation';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: {
    metric: string;
    improvement: number;
    timeframe: string;
  };
  implementation: {
    steps: string[];
    resources: string[];
    timeline: string;
    cost: number;
  };
  risks: string[];
  dependencies: string[];
  timestamp: Date;
}

export interface BusinessMetricsAlert {
  id: string;
  type: 'threshold' | 'trend' | 'anomaly' | 'forecast' | 'comparison';
  severity: 'critical' | 'high' | 'medium' | 'low';
  category:
    | 'revenue'
    | 'profit'
    | 'growth'
    | 'efficiency'
    | 'market'
    | 'customer'
    | 'operational'
    | 'financial';
  title: string;
  description: string;
  metric: string;
  currentValue: number;
  thresholdValue: number;
  deviation: number;
  trend: 'up' | 'down' | 'stable';
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface BusinessMetricsConfig {
  enabled: boolean;
  updateInterval: number;
  retentionPeriod: number;
  alertThresholds: {
    revenue: {
      minGrowth: number;
      maxDecline: number;
    };
    profit: {
      minMargin: number;
      maxDecline: number;
    };
    customer: {
      maxChurn: number;
      minRetention: number;
    };
    operational: {
      minEfficiency: number;
      maxDefectRate: number;
    };
  };
  dataSources: {
    sales: boolean;
    marketing: boolean;
    operations: boolean;
    finance: boolean;
    customer: boolean;
  };
  exportFormats: ('json' | 'csv' | 'excel' | 'pdf')[];
  realTimeUpdates: boolean;
  historicalData: boolean;
  forecasting: boolean;
  comparisons: boolean;
}

export interface BusinessMetricsExportOptions {
  format: 'json' | 'csv' | 'excel' | 'pdf';
  includeMetrics: boolean;
  includeInsights: boolean;
  includeRecommendations: boolean;
  includeAlerts: boolean;
  includeHistorical: boolean;
  includeProjections: boolean;
  includeComparisons: boolean;
  anonymize: boolean;
  compress: boolean;
}

export interface BusinessMetricsAnalysisResponse {
  metrics: BusinessMetrics;
  insights: BusinessMetricsInsight[];
  recommendations: BusinessMetricsRecommendation[];
  alerts: BusinessMetricsAlert[];
  summary: {
    overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
    keyMetrics: string[];
    trends: {
      positive: string[];
      negative: string[];
      stable: string[];
    };
    opportunities: string[];
    risks: string[];
  };
  metadata: {
    generatedAt: Date;
    dataPoints: number;
    timeRange: {
      start: Date;
      end: Date;
    };
    version: string;
  };
}
