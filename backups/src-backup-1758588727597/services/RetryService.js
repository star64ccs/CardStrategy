// 重試機制服務
class RetryService {
  constructor() {
    this.defaultConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2,
      jitter: true
    };
  }

  // 指數退避重試
  async retry(fn, config = {}) {
    const options = { ...this.defaultConfig, ...config };
    let lastError;

    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt === options.maxRetries) {
          break;
        }

        if (!this.isRetryableError(error)) {
          throw error;
        }

        const delay = this.calculateDelay(attempt, options);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  // 計算延遲時間
  calculateDelay(attempt, options) {
    let delay = options.baseDelay * Math.pow(options.backoffFactor, attempt);
    delay = Math.min(delay, options.maxDelay);

    if (options.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return Math.floor(delay);
  }

  // 判斷錯誤是否可重試
  isRetryableError(error) {
    const retryableCodes = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNREFUSED',
      'NETWORK_ERROR'
    ];

    return retryableCodes.includes(error.code) || 
           error.status >= 500 ||
           error.message.includes('timeout');
  }

  // 睡眠函數
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new RetryService();
