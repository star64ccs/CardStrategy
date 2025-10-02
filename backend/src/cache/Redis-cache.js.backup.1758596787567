const redis = require('redis');

class RedisCache {
  constructor() {
    this.client = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || null,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          return new Error('Redis服務器拒絕連接');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error('重試時間已達上限');
        }
        if (options.attempt > 10) {
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    this.client.on('error', (err) => {
      console.error('Redis錯誤:', err);
    });
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      await this.connect();
      const serialized = JSON.stringify(value);
      await this.client.setEx(key, ttl, serialized);
      return true;
    } catch (error) {
      console.error('Redis SET錯誤:', error);
      return false;
    }
  }

  async get(key) {
    try {
      await this.connect();
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET錯誤:', error);
      return null;
    }
  }

  async del(key) {
    try {
      await this.connect();
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL錯誤:', error);
      return false;
    }
  }

  async flush() {
    try {
      await this.connect();
      await this.client.flushAll();
      return true;
    } catch (error) {
      console.error('Redis FLUSH錯誤:', error);
      return false;
    }
  }

  async close() {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }
}

module.exports = new RedisCache();