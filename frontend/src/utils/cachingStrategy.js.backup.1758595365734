// 緩存策略
class CachingStrategy {
  constructor() {
    this.cacheConfig = {
      localStorage: {
        maxSize: 10 * 1024 * 1024, // 10MB
        ttl: 24 * 60 * 60 * 1000 // 24小時
      },
      sessionStorage: {
        maxSize: 5 * 1024 * 1024, // 5MB
        ttl: 60 * 60 * 1000 // 1小時
      },
      memory: {
        maxSize: 50 * 1024 * 1024, // 50MB
        ttl: 30 * 60 * 1000 // 30分鐘
      }
    };

    this.memoryCache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      size: 0
    };
  }

  // LocalStorage 緩存
  localStorage = {
    set: (key, value, ttl = this.cacheConfig.localStorage.ttl) => {
      try {
        const item = {
          value,
          timestamp: Date.now(),
          ttl
        };
        localStorage.setItem(key, JSON.stringify(item));
      } catch (error) {
        console.warn('LocalStorage 設置失敗:', error);
        this.cleanupLocalStorage();
      }
    },

    get: (key) => {
      try {
        const item = localStorage.getItem(key);
        if (!item) return null;

        const parsed = JSON.parse(item);
        const now = Date.now();

        if (now - parsed.timestamp > parsed.ttl) {
          localStorage.removeItem(key);
          return null;
        }

        return parsed.value;
      } catch (error) {
        console.warn('LocalStorage 讀取失敗:', error);
        return null;
      }
    },

    remove: (key) => {
      localStorage.removeItem(key);
    },

    clear: () => {
      localStorage.clear();
    }
  };

  // SessionStorage 緩存
  sessionStorage = {
    set: (key, value, ttl = this.cacheConfig.sessionStorage.ttl) => {
      try {
        const item = {
          value,
          timestamp: Date.now(),
          ttl
        };
        sessionStorage.setItem(key, JSON.stringify(item));
      } catch (error) {
        console.warn('SessionStorage 設置失敗:', error);
        this.cleanupSessionStorage();
      }
    },

    get: (key) => {
      try {
        const item = sessionStorage.getItem(key);
        if (!item) return null;

        const parsed = JSON.parse(item);
        const now = Date.now();

        if (now - parsed.timestamp > parsed.ttl) {
          sessionStorage.removeItem(key);
          return null;
        }

        return parsed.value;
      } catch (error) {
        console.warn('SessionStorage 讀取失敗:', error);
        return null;
      }
    },

    remove: (key) => {
      sessionStorage.removeItem(key);
    },

    clear: () => {
      sessionStorage.clear();
    }
  };

  // 內存緩存
  memory = {
    set: (key, value, ttl = this.cacheConfig.memory.ttl) => {
      const now = Date.now();
      this.memoryCache.set(key, {
        value,
        timestamp: now,
        ttl
      });

      this.cacheStats.size += this.calculateSize(value);
      this.cleanupMemoryCache();
    },

    get: (key) => {
      const item = this.memoryCache.get(key);
      if (!item) {
        this.cacheStats.misses++;
        return null;
      }

      const now = Date.now();
      if (now - item.timestamp > item.ttl) {
        this.memoryCache.delete(key);
        this.cacheStats.misses++;
        return null;
      }

      this.cacheStats.hits++;
      return item.value;
    },

    remove: (key) => {
      const item = this.memoryCache.get(key);
      if (item) {
        this.cacheStats.size -= this.calculateSize(item.value);
      }
      this.memoryCache.delete(key);
    },

    clear: () => {
      this.memoryCache.clear();
      this.cacheStats.size = 0;
    }
  };

  // 計算數據大小
  calculateSize(data) {
    return new Blob([JSON.stringify(data)]).size;
  }

  // 清理過期緩存
  cleanupLocalStorage() {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach(key => {
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (item && item.timestamp && now - item.timestamp > item.ttl) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        localStorage.removeItem(key);
      }
    });
  }

  // 清理 SessionStorage
  cleanupSessionStorage() {
    const keys = Object.keys(sessionStorage);
    const now = Date.now();

    keys.forEach(key => {
      try {
        const item = JSON.parse(sessionStorage.getItem(key));
        if (item && item.timestamp && now - item.timestamp > item.ttl) {
          sessionStorage.removeItem(key);
        }
      } catch (error) {
        sessionStorage.removeItem(key);
      }
    });
  }

  // 清理內存緩存
  cleanupMemoryCache() {
    const now = Date.now();
    const maxSize = this.cacheConfig.memory.maxSize;

    // 清理過期項目
    for (const [key, item] of this.memoryCache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.memoryCache.delete(key);
        this.cacheStats.size -= this.calculateSize(item.value);
      }
    }

    // 如果仍然超過大小限制，清理最舊的項目
    if (this.cacheStats.size > maxSize) {
      const sortedEntries = Array.from(this.memoryCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      while (this.cacheStats.size > maxSize && sortedEntries.length > 0) {
        const [key, item] = sortedEntries.shift();
        this.memoryCache.delete(key);
        this.cacheStats.size -= this.calculateSize(item.value);
      }
    }
  }

  // 獲取緩存統計
  getStats() {
    return {
      ...this.cacheStats,
      memorySize: this.memoryCache.size,
      hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) || 0
    };
  }

  // 智能緩存選擇
  smartCache = {
    set: (key, value, options = {}) => {
      const { priority = 'normal', ttl } = options;

      switch (priority) {
        case 'high':
          this.memory.set(key, value, ttl);
          this.localStorage.set(key, value, ttl);
          break;
        case 'medium':
          this.memory.set(key, value, ttl);
          break;
        case 'low':
          this.sessionStorage.set(key, value, ttl);
          break;
        default:
          this.memory.set(key, value, ttl);
      }
    },

    get: (key) => {
      // 優先從內存緩存獲取
      let value = this.memory.get(key);
      if (value) return value;

      // 從 LocalStorage 獲取
      value = this.localStorage.get(key);
      if (value) {
        this.memory.set(key, value);
        return value;
      }

      // 從 SessionStorage 獲取
      value = this.sessionStorage.get(key);
      if (value) {
        this.memory.set(key, value);
        return value;
      }

      return null;
    }
  };

  // Service Worker 緩存
  serviceWorker = {
    // 註冊 Service Worker
    register: async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker 註冊成功:', registration);
          return registration;
        } catch (error) {
          console.error('Service Worker 註冊失敗:', error);
          return null;
        }
      }
      return null;
    },

    // 更新 Service Worker
    update: async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
        }
      }
    }
  };
}

export default new CachingStrategy();
