import { logger } from './logger';

// 重試配置
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

// 默認重試配置
const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1秒
  maxDelay: 10000, // 10秒
  backoffMultiplier: 2,
  retryableErrors: [
    'NETWORK_ERROR',
    'SERVICE_UNAVAILABLE',
    'DATABASE_CONNECTION_ERROR',
    'TIMEOUT_ERROR',
    'RATE_LIMIT_EXCEEDED',
  ],
};

// 延遲函數
const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// 計算重試延遲
const calculateDelay = (attempt: number, config: RetryConfig): number => {
  const delay =
    config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
};

// 檢查是否應該重試
const shouldRetry = (error: any, config: RetryConfig): boolean => {
  // 檢查錯誤代碼
  if (error.code && config.retryableErrors.includes(error.code)) {
    return true;
  }

  // 檢查 HTTP 狀態碼
  if (error.status) {
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    return retryableStatusCodes.includes(error.status);
  }

  // 檢查網絡錯誤
  if (
    error.message &&
    (error.message.includes('Network Error') ||
      error.message.includes('timeout') ||
      error.message.includes('connection'))
  ) {
    return true;
  }

  return false;
};

// API 重試函數
export const withRetry = async <T>(
  apiCall: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const retryConfig = { ...defaultRetryConfig, ...config };
  let lastError: any;

  for (let attempt = 1; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      lastError = error;

      // 檢查是否應該重試
      if (
        attempt === retryConfig.maxRetries ||
        !shouldRetry(error, retryConfig)
      ) {
        logger.error(
          `API 調用失敗 (嘗試 ${attempt}/${retryConfig.maxRetries}):`,
          {
            error: error.message,
            code: error.code,
            status: error.status,
          }
        );
        throw error;
      }

      // 計算延遲時間
      const delayTime = calculateDelay(attempt, retryConfig);

      logger.warn(
        `API 調用失敗，${delayTime}ms 後重試 (${attempt}/${retryConfig.maxRetries}):`,
        {
          error: error.message,
          code: error.code,
          status: error.status,
        }
      );

      // 等待後重試
      await delay(delayTime);
    }
  }

  throw lastError;
};

// 創建重試配置
export const createRetryConfig = (
  config: Partial<RetryConfig>
): RetryConfig => {
  return { ...defaultRetryConfig, ...config };
};

// 特定 API 的重試配置
export const apiRetryConfigs = {
  auth: createRetryConfig({
    maxRetries: 2,
    baseDelay: 500,
    retryableErrors: ['NETWORK_ERROR', 'SERVICE_UNAVAILABLE'],
  }),

  cards: createRetryConfig({
    maxRetries: 3,
    baseDelay: 1000,
    retryableErrors: [
      'NETWORK_ERROR',
      'SERVICE_UNAVAILABLE',
      'RATE_LIMIT_EXCEEDED',
    ],
  }),

  market: createRetryConfig({
    maxRetries: 2,
    baseDelay: 2000,
    retryableErrors: ['NETWORK_ERROR', 'SERVICE_UNAVAILABLE'],
  }),

  ai: createRetryConfig({
    maxRetries: 1,
    baseDelay: 3000,
    retryableErrors: ['SERVICE_UNAVAILABLE', 'TIMEOUT_ERROR'],
  }),
};

// 帶有重試的 API 調用包裝器
export const retryableApiCall = <T>(
  apiCall: () => Promise<T>,
  apiType: keyof typeof apiRetryConfigs = 'cards'
): Promise<T> => {
  const config = apiRetryConfigs[apiType];
  return withRetry(apiCall, config);
};
