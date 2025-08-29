const redis = require('redis');
const { logger } = require('../src/utils/logger');

/**
 * Redis 配置和連接管理
 */
class RedisConfig {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  /**
   * 創建 Redis 客戶端
   */
  createClient() {
    try {
      // 從環境變量獲取 Redis 配置
      const redisUrl = process.env.REDIS_URL;

      if (!redisUrl) {
        logger.warn('REDIS_URL 環境變量未設置，使用默認配置');
        // 使用默認配置
        this.client = redis.createClient({
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD,
          retry_strategy: (options) => {
            if (options.error && options.error.code === 'ECONNREFUSED') {
              logger.error('Redis 服務器拒絕連接');
              return new Error('Redis 服務器拒絕連接');
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
              logger.error('Redis 重試時間超過1小時');
              return new Error('Redis 重試時間超過1小時');
            }
            if (options.attempt > 10) {
              logger.error('Redis 重試次數超過10次');
              return undefined;
            }
            return Math.min(options.attempt * 100, 3000);
          },
        });
      } else {
        // 使用 REDIS_URL
        this.client = redis.createClient({
          url: redisUrl,
          retry_strategy: (options) => {
            if (options.error && options.error.code === 'ECONNREFUSED') {
              logger.error('Redis 服務器拒絕連接');
              return new Error('Redis 服務器拒絕連接');
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
              logger.error('Redis 重試時間超過1小時');
              return new Error('Redis 重試時間超過1小時');
            }
            if (options.attempt > 10) {
              logger.error('Redis 重試次數超過10次');
              return undefined;
            }
            return Math.min(options.attempt * 100, 3000);
          },
        });
      }

      // 設置事件監聽器
      this.client.on('connect', () => {
        logger.info('Redis 客戶端已連接');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        logger.info('Redis 客戶端已準備就緒');
      });

      this.client.on('error', (err) => {
        logger.error('Redis 連接錯誤:', err);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        logger.info('Redis 連接已關閉');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        logger.info('Redis 正在重新連接...');
      });

      return this.client;
    } catch (error) {
      logger.error('創建 Redis 客戶端失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取 Redis 客戶端
   */
  getClient() {
    if (!this.client) {
      this.client = this.createClient();
    }
    return this.client;
  }

  /**
   * 連接到 Redis
   */
  async connect() {
    try {
      const client = this.getClient();
      await client.connect();
      return client;
    } catch (error) {
      logger.error('Redis 連接失敗:', error);
      throw error;
    }
  }

  /**
   * 斷開 Redis 連接
   */
  async disconnect() {
    try {
      if (this.client) {
        await this.client.quit();
        this.client = null;
        this.isConnected = false;
        logger.info('Redis 連接已斷開');
      }
    } catch (error) {
      logger.error('斷開 Redis 連接失敗:', error);
      throw error;
    }
  }

  /**
   * 檢查連接狀態
   */
  isConnected() {
    return this.isConnected;
  }

  /**
   * 健康檢查
   */
  async healthCheck() {
    try {
      const client = this.getClient();
      await client.ping();
      return true;
    } catch (error) {
      logger.error('Redis 健康檢查失敗:', error);
      return false;
    }
  }
}

// 創建單例實例
const redisConfig = new RedisConfig();

module.exports = redisConfig;
