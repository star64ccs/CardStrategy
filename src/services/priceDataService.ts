import { apiService, ApiResponse } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';
import { validateInput, validateApiResponse } from '../utils/validationService';
import { z } from 'zod';

// 價格平台類型
export type PricePlatform =
  | 'SNKR'
  | 'MERCARI'
  | 'EBAY'
  | 'TCGPLAYER'
  | 'CARDMARKET'
  | 'PRICE_CHARTING'
  | 'PSA'
  | 'BGS'
  | 'CGC';

// 鑑定機構類型
export type GradingAgency = 'PSA' | 'BGS' | 'CGC';

// 價格數據點
export interface PriceDataPoint {
  platform: PricePlatform;
  price: number;
  currency: string;
  date: string;
  condition?: string;
  grade?: string;
  source: 'api' | 'scraper';
  confidence: number; // 0-1
  metadata?: {
    listingId?: string;
    seller?: string;
    location?: string;
    shipping?: number;
    auction?: boolean;
    buyNow?: boolean;
  };
}

// 歷史價格數據
export interface HistoricalPriceData {
  cardId: string;
  cardName: string;
  platform: PricePlatform;
  priceHistory: PriceDataPoint[];
  statistics: {
    averagePrice: number;
    medianPrice: number;
    minPrice: number;
    maxPrice: number;
    priceVolatility: number;
    totalListings: number;
    lastUpdated: string;
  };
  trends: {
    direction: 'rising' | 'falling' | 'stable';
    changePercentage: number;
    changePeriod: string;
  };
}

// 鑑定機構數據
export interface GradingAgencyData {
  agency: GradingAgency;
  cardId: string;
  cardName: string;
  distribution: {
    totalGraded: number;
    gradeDistribution: {
      [grade: string]: number; // e.g., "10": 150, "9": 300, etc.
    };
    populationReport: {
      [grade: string]: {
        count: number;
        percentage: number;
        lastUpdated: string;
      };
    };
    recentGrades: {
      date: string;
      grade: string;
      count: number;
    }[];
  };
  marketImpact: {
    averagePriceByGrade: {
      [grade: string]: number;
    };
    premiumByGrade: {
      [grade: string]: number; // 相對於未鑑定卡片的溢價
    };
  };
  lastUpdated: string;
}

// 平台配置
export interface PlatformConfig {
  name: PricePlatform;
  baseUrl: string;
  hasApi: boolean;
  apiKey?: string;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  robotsTxt: string;
  scrapingRules: {
    allowedPaths: string[];
    disallowedPaths: string[];
    delayBetweenRequests: number; // milliseconds
    userAgent: string;
  };
}

// 爬蟲結果
export interface ScrapingResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata: {
    platform: PricePlatform;
    url: string;
    timestamp: string;
    responseTime: number;
    statusCode: number;
  };
}

// 價格數據收集服務
class PriceDataService {
  private platformConfigs: Map<PricePlatform, PlatformConfig> = new Map();

  constructor() {
    this.initializePlatformConfigs();
  }

  // 初始化平台配置
  private initializePlatformConfigs(): void {
    const configs: PlatformConfig[] = [
      {
        name: 'SNKR',
        baseUrl: 'https://www.nike.com',
        hasApi: false,
        rateLimit: { requestsPerMinute: 10, requestsPerHour: 100 },
        robotsTxt: 'https://www.nike.com/robots.txt',
        scrapingRules: {
          allowedPaths: ['/t/*', '/product/*'],
          disallowedPaths: ['/cart/*', '/checkout/*', '/account/*'],
          delayBetweenRequests: 2000,
          userAgent: 'CardStrategy-Bot/1.0 (+https://cardstrategy.com/bot)',
        },
      },
      {
        name: 'MERCARI',
        baseUrl: 'https://www.mercari.com',
        hasApi: false,
        rateLimit: { requestsPerMinute: 5, requestsPerHour: 50 },
        robotsTxt: 'https://www.mercari.com/robots.txt',
        scrapingRules: {
          allowedPaths: ['/item/*', '/search/*'],
          disallowedPaths: ['/user/*', '/cart/*', '/checkout/*'],
          delayBetweenRequests: 3000,
          userAgent: 'CardStrategy-Bot/1.0 (+https://cardstrategy.com/bot)',
        },
      },
      {
        name: 'EBAY',
        baseUrl: 'https://www.ebay.com',
        hasApi: true,
        apiKey: process.env.EBAY_API_KEY,
        rateLimit: { requestsPerMinute: 20, requestsPerHour: 200 },
        robotsTxt: 'https://www.ebay.com/robots.txt',
        scrapingRules: {
          allowedPaths: ['/itm/*', '/sch/*'],
          disallowedPaths: ['/usr/*', '/cart/*', '/checkout/*'],
          delayBetweenRequests: 1500,
          userAgent: 'CardStrategy-Bot/1.0 (+https://cardstrategy.com/bot)',
        },
      },
      {
        name: 'TCGPLAYER',
        baseUrl: 'https://www.tcgplayer.com',
        hasApi: true,
        apiKey: process.env.TCGPLAYER_API_KEY,
        rateLimit: { requestsPerMinute: 30, requestsPerHour: 300 },
        robotsTxt: 'https://www.tcgplayer.com/robots.txt',
        scrapingRules: {
          allowedPaths: ['/product/*', '/search/*'],
          disallowedPaths: ['/cart/*', '/checkout/*', '/account/*'],
          delayBetweenRequests: 1000,
          userAgent: 'CardStrategy-Bot/1.0 (+https://cardstrategy.com/bot)',
        },
      },
      {
        name: 'CARDMARKET',
        baseUrl: 'https://www.cardmarket.com',
        hasApi: true,
        apiKey: process.env.CARDMARKET_API_KEY,
        rateLimit: { requestsPerMinute: 25, requestsPerHour: 250 },
        robotsTxt: 'https://www.cardmarket.com/robots.txt',
        scrapingRules: {
          allowedPaths: ['/en/*', '/de/*', '/fr/*'],
          disallowedPaths: ['/cart/*', '/checkout/*', '/account/*'],
          delayBetweenRequests: 1200,
          userAgent: 'CardStrategy-Bot/1.0 (+https://cardstrategy.com/bot)',
        },
      },
      {
        name: 'PRICE_CHARTING',
        baseUrl: 'https://www.pricecharting.com',
        hasApi: false,
        rateLimit: { requestsPerMinute: 8, requestsPerHour: 80 },
        robotsTxt: 'https://www.pricecharting.com/robots.txt',
        scrapingRules: {
          allowedPaths: ['/game/*', '/product/*'],
          disallowedPaths: ['/cart/*', '/checkout/*', '/account/*'],
          delayBetweenRequests: 2500,
          userAgent: 'CardStrategy-Bot/1.0 (+https://cardstrategy.com/bot)',
        },
      },
      {
        name: 'PSA',
        baseUrl: 'https://www.psacard.com',
        hasApi: false,
        rateLimit: { requestsPerMinute: 5, requestsPerHour: 50 },
        robotsTxt: 'https://www.psacard.com/robots.txt',
        scrapingRules: {
          allowedPaths: ['/pop/*', '/cert/*'],
          disallowedPaths: ['/account/*', '/cart/*', '/checkout/*'],
          delayBetweenRequests: 4000,
          userAgent: 'CardStrategy-Bot/1.0 (+https://cardstrategy.com/bot)',
        },
      },
      {
        name: 'BGS',
        baseUrl: 'https://www.beckett.com',
        hasApi: false,
        rateLimit: { requestsPerMinute: 5, requestsPerHour: 50 },
        robotsTxt: 'https://www.beckett.com/robots.txt',
        scrapingRules: {
          allowedPaths: ['/grading/*', '/population/*'],
          disallowedPaths: ['/account/*', '/cart/*', '/checkout/*'],
          delayBetweenRequests: 4000,
          userAgent: 'CardStrategy-Bot/1.0 (+https://cardstrategy.com/bot)',
        },
      },
      {
        name: 'CGC',
        baseUrl: 'https://www.cgccards.com',
        hasApi: false,
        rateLimit: { requestsPerMinute: 5, requestsPerHour: 50 },
        robotsTxt: 'https://www.cgccards.com/robots.txt',
        scrapingRules: {
          allowedPaths: ['/population/*', '/cert/*'],
          disallowedPaths: ['/account/*', '/cart/*', '/checkout/*'],
          delayBetweenRequests: 4000,
          userAgent: 'CardStrategy-Bot/1.0 (+https://cardstrategy.com/bot)',
        },
      },
    ];

    configs.forEach((config) => {
      this.platformConfigs.set(config.name, config);
    });
  }

  // 獲取歷史價格數據
  async getHistoricalPrices(
    cardId: string,
    platforms: PricePlatform[] = [
      'EBAY',
      'TCGPLAYER',
      'CARDMARKET',
      'PRICE_CHARTING',
    ],
    timeRange: { start: string; end: string } = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天前
      end: new Date().toISOString(),
    }
  ): Promise<ApiResponse<HistoricalPriceData[]>> {
    try {
      const validationResult = validateInput(
        z.object({
          cardId: z.string().min(1, '卡牌ID不能為空'),
          platforms: z.array(
            z.enum([
              'SNKR',
              'MERCARI',
              'EBAY',
              'TCGPLAYER',
              'CARDMARKET',
              'PRICE_CHARTING',
              'PSA',
              'BGS',
              'CGC',
            ])
          ),
          timeRange: z.object({
            start: z.string().datetime(),
            end: z.string().datetime(),
          }),
        }),
        { cardId, platforms, timeRange }
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '參數驗證失敗');
      }

      const response = await apiService.post<HistoricalPriceData[]>(
        API_ENDPOINTS.PRICE_DATA.HISTORICAL_PRICES,
        { cardId, platforms, timeRange }
      );

      const responseValidation = validateApiResponse(
        z.array(
          z.object({
            cardId: z.string(),
            cardName: z.string(),
            platform: z.enum([
              'SNKR',
              'MERCARI',
              'EBAY',
              'TCGPLAYER',
              'CARDMARKET',
              'PRICE_CHARTING',
              'PSA',
              'BGS',
              'CGC',
            ]),
            priceHistory: z.array(
              z.object({
                platform: z.enum([
                  'SNKR',
                  'MERCARI',
                  'EBAY',
                  'TCGPLAYER',
                  'CARDMARKET',
                  'PRICE_CHARTING',
                  'PSA',
                  'BGS',
                  'CGC',
                ]),
                price: z.number().positive(),
                currency: z.string(),
                date: z.string(),
                condition: z.string().optional(),
                grade: z.string().optional(),
                source: z.enum(['api', 'scraper']),
                confidence: z.number().min(0).max(1),
                metadata: z
                  .object({
                    listingId: z.string().optional(),
                    seller: z.string().optional(),
                    location: z.string().optional(),
                    shipping: z.number().optional(),
                    auction: z.boolean().optional(),
                    buyNow: z.boolean().optional(),
                  })
                  .optional(),
              })
            ),
            statistics: z.object({
              averagePrice: z.number(),
              medianPrice: z.number(),
              minPrice: z.number(),
              maxPrice: z.number(),
              priceVolatility: z.number(),
              totalListings: z.number(),
              lastUpdated: z.string(),
            }),
            trends: z.object({
              direction: z.enum(['rising', 'falling', 'stable']),
              changePercentage: z.number(),
              changePeriod: z.string(),
            }),
          })
        ),
        response.data
      );

      if (!responseValidation.isValid) {
        throw new Error(
          responseValidation.errorMessage || '歷史價格數據驗證失敗'
        );
      }

      return {
        ...response,
        data: responseValidation.data!,
      };
    } catch (error: any) {
      logger.error('❌ Get historical prices error:', { error: error.message });
      throw error;
    }
  }

  // 獲取鑑定機構數據
  async getGradingAgencyData(
    cardId: string,
    agencies: GradingAgency[] = ['PSA', 'BGS', 'CGC']
  ): Promise<ApiResponse<GradingAgencyData[]>> {
    try {
      const validationResult = validateInput(
        z.object({
          cardId: z.string().min(1, '卡牌ID不能為空'),
          agencies: z.array(z.enum(['PSA', 'BGS', 'CGC'])),
        }),
        { cardId, agencies }
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '參數驗證失敗');
      }

      const response = await apiService.post<GradingAgencyData[]>(
        API_ENDPOINTS.PRICE_DATA.GRADING_DATA,
        { cardId, agencies }
      );

      const responseValidation = validateApiResponse(
        z.array(
          z.object({
            agency: z.enum(['PSA', 'BGS', 'CGC']),
            cardId: z.string(),
            cardName: z.string(),
            distribution: z.object({
              totalGraded: z.number(),
              gradeDistribution: z.record(z.string(), z.number()),
              populationReport: z.record(
                z.string(),
                z.object({
                  count: z.number(),
                  percentage: z.number(),
                  lastUpdated: z.string(),
                })
              ),
              recentGrades: z.array(
                z.object({
                  date: z.string(),
                  grade: z.string(),
                  count: z.number(),
                })
              ),
            }),
            marketImpact: z.object({
              averagePriceByGrade: z.record(z.string(), z.number()),
              premiumByGrade: z.record(z.string(), z.number()),
            }),
            lastUpdated: z.string(),
          })
        ),
        response.data
      );

      if (!responseValidation.isValid) {
        throw new Error(
          responseValidation.errorMessage || '鑑定機構數據驗證失敗'
        );
      }

      return {
        ...response,
        data: responseValidation.data!,
      };
    } catch (error: any) {
      logger.error('❌ Get grading agency data error:', {
        error: error.message,
      });
      throw error;
    }
  }

  // 獲取平台推薦
  async getRecommendedPlatforms(): Promise<
    ApiResponse<{
      pricePlatforms: {
        platform: PricePlatform;
        reliability: number; // 0-1
        dataQuality: number; // 0-1
        updateFrequency: string;
        coverage: string;
        description: string;
      }[];
      gradingAgencies: {
        agency: GradingAgency;
        reliability: number;
        dataQuality: number;
        updateFrequency: string;
        coverage: string;
        description: string;
      }[];
    }>
  > {
    try {
      const response = await apiService.get(
        API_ENDPOINTS.PRICE_DATA.RECOMMENDED_PLATFORMS
      );

      const responseValidation = validateApiResponse(
        z.object({
          pricePlatforms: z.array(
            z.object({
              platform: z.enum([
                'SNKR',
                'MERCARI',
                'EBAY',
                'TCGPLAYER',
                'CARDMARKET',
                'PRICE_CHARTING',
                'PSA',
                'BGS',
                'CGC',
              ]),
              reliability: z.number().min(0).max(1),
              dataQuality: z.number().min(0).max(1),
              updateFrequency: z.string(),
              coverage: z.string(),
              description: z.string(),
            })
          ),
          gradingAgencies: z.array(
            z.object({
              agency: z.enum(['PSA', 'BGS', 'CGC']),
              reliability: z.number().min(0).max(1),
              dataQuality: z.number().min(0).max(1),
              updateFrequency: z.string(),
              coverage: z.string(),
              description: z.string(),
            })
          ),
        }),
        response.data
      );

      if (!responseValidation.isValid) {
        throw new Error(
          responseValidation.errorMessage || '平台推薦數據驗證失敗'
        );
      }

      return {
        ...response,
        data: responseValidation.data!,
      };
    } catch (error: any) {
      logger.error('❌ Get recommended platforms error:', {
        error: error.message,
      });
      throw error;
    }
  }

  // 檢查平台狀態
  async checkPlatformStatus(platforms: PricePlatform[]): Promise<
    ApiResponse<{
      [platform: string]: {
        status: 'online' | 'offline' | 'limited';
        lastCheck: string;
        responseTime: number;
        error?: string;
      };
    }>
  > {
    try {
      const validationResult = validateInput(
        z.object({
          platforms: z.array(
            z.enum([
              'SNKR',
              'MERCARI',
              'EBAY',
              'TCGPLAYER',
              'CARDMARKET',
              'PRICE_CHARTING',
              'PSA',
              'BGS',
              'CGC',
            ])
          ),
        }),
        { platforms }
      );

      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '平台列表驗證失敗');
      }

      const response = await apiService.post(
        API_ENDPOINTS.PRICE_DATA.PLATFORM_STATUS,
        { platforms }
      );

      const responseValidation = validateApiResponse(
        z.record(
          z.string(),
          z.object({
            status: z.enum(['online', 'offline', 'limited']),
            lastCheck: z.string(),
            responseTime: z.number(),
            error: z.string().optional(),
          })
        ),
        response.data
      );

      if (!responseValidation.isValid) {
        throw new Error(
          responseValidation.errorMessage || '平台狀態數據驗證失敗'
        );
      }

      return {
        ...response,
        data: responseValidation.data!,
      };
    } catch (error: any) {
      logger.error('❌ Check platform status error:', { error: error.message });
      throw error;
    }
  }

  // 獲取平台配置
  getPlatformConfig(platform: PricePlatform): PlatformConfig | undefined {
    return this.platformConfigs.get(platform);
  }

  // 獲取所有平台配置
  getAllPlatformConfigs(): PlatformConfig[] {
    return Array.from(this.platformConfigs.values());
  }
}

// 導出價格數據服務實例
export { PriceDataService };
export const priceDataService = new PriceDataService();
