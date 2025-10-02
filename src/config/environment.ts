// 環境Configure
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

// On發環境Configure
const development: Environment = {
  apiBaseUrl: 'https://cardstrategy-api.onrender.com/api', // 使用 Render API 進RowOn發
  apiTimeout: 10000,
  enableLogging: true,
  enableAnalytics: false,
  enableCrashReporting: false,
  maxRetries: 3,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes
  imageQuality: 0.8,
  maxImageSize: 5 * 1024 * 1024, // 5MB
};

// Test環境Configure
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

// 生產環境Configure
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

// Root據環境VariableSelectConfigure
const _getEnvironment = (): Environment => {
  const _env = (process.env as any)['NODE_ENV'] || 'development';

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

// Export當前環境Configure
export const _environment = getEnvironment();

// Export環境CheckFunction
export const _isDevelopment = () =>
  (process.env as any)['NODE_ENV'] === 'development';
export const _isStaging = () => (process.env as any)['NODE_ENV'] === 'staging';
export const _isProduction = () =>
  (process.env as any)['NODE_ENV'] === 'production';

// Export便捷Method
export const _getApiUrl = (endpoint: string): string => {
  return `${environment.apiBaseUrl}${endpoint}`;
};

export const _getImageUrl = (path: string): string => {
  return `${environment.apiBaseUrl}/images${path}`;
};
