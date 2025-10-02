// API 超時配置
export const timeoutConfig = {
  // 不同操作的超時時間
  operations: {
    quick: 5000,      // 快速操作 (5秒)
    standard: 15000,  // 標準操作 (15秒)
    slow: 30000,      // 慢操作 (30秒)
    upload: 60000     // 文件上傳 (60秒)
  },

  // API 端點超時設置
  endpoints: {
    '/api/auth/login': 10000,
    '/api/cards/search': 15000,
    '/api/upload': 60000,
    '/api/ai/recognize': 30000,
    '/api/ai/predict': 20000
  },

  // 重試配置
  retry: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000
  }
};

// 獲取超時時間
export function getTimeout(endpoint) {
  return timeoutConfig.endpoints[endpoint] || timeoutConfig.operations.standard;
}

export default timeoutConfig;
