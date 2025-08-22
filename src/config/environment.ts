// 環境配置
export interface Environment {
  apiBaseUrl: string;
  apiTimeout: number;
  enableLogging: boolean;
  enableAnalytics: boolean;
  enableCrashReporting: boolean;
  maxRetries: number;
  cacheExpiry: number;
  imageQuality: number;
  maxImageSize: number;
}

// 開發環境配置
const development: Environment = {
  apiBaseUrl: 'https://cardstrategy-api.onrender.com/api', // 使用 Render API 進行開發
  apiTimeout: 10000,
  enableLogging: true,
  enableAnalytics: false,
  enableCrashReporting: false,
  maxRetries: 3,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes
  imageQuality: 0.8,
  maxImageSize: 5 * 1024 * 1024, // 5MB
};

// 測試環境配置
const staging: Environment = {
  apiBaseUrl: 'https://cardstrategy-api.onrender.com/api',
  apiTimeout: 15000,
  enableLogging: true,
  enableAnalytics: true,
  enableCrashReporting: false,
  maxRetries: 3,
  cacheExpiry: 10 * 60 * 1000, // 10 minutes
  imageQuality: 0.8,
  maxImageSize: 5 * 1024 * 1024, // 5MB
};

// 生產環境配置
const production: Environment = {
  apiBaseUrl: 'https://cardstrategy-api.onrender.com/api',
  apiTimeout: 20000,
  enableLogging: false,
  enableAnalytics: true,
  enableCrashReporting: true,
  maxRetries: 5,
  cacheExpiry: 30 * 60 * 1000, // 30 minutes
  imageQuality: 0.9,
  maxImageSize: 10 * 1024 * 1024, // 10MB
};

// 根據環境變量選擇配置
const getEnvironment = (): Environment => {
  const env = (process.env as any)['NODE_ENV'] || 'development';

  switch (env) {
    case 'production':
      return production;
    case 'staging':
      return staging;
    case 'development':
    default:
      return development;
  }
};

// 導出當前環境配置
export const environment = getEnvironment();

// 導出環境檢查函數
export const isDevelopment = () =>
  (process.env as any)['NODE_ENV'] === 'development';
export const isStaging = () => (process.env as any)['NODE_ENV'] === 'staging';
export const isProduction = () =>
  (process.env as any)['NODE_ENV'] === 'production';

// 導出便捷方法
export const getApiUrl = (endpoint: string): string => {
  return `${environment.apiBaseUrl}${endpoint}`;
};

export const getImageUrl = (path: string): string => {
  return `${environment.apiBaseUrl}/images${path}`;
};
