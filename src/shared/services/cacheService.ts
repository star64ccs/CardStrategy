import { logger } from '../../core/utils/logger';
import { CacheStorage } from '../../core/utils/storage';

/**
 * 緩存服務
 * 處理數據緩存相關功能
 */
export class CacheService {
  private static instance: CacheService;

  private constructor() {}

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * 設置緩存
   */
  async set(key: string, data: unknown, expiry?: number): Promise<void> {
    try {
      await CacheStorage.setCache(key, data, expiry);
    } catch (error) {
      logger.error('設置緩存失敗:', { error, key });
    }
  }

  /**
   * 獲取緩存
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      return await CacheStorage.getCache<T>(key);
    } catch (error) {
      logger.error('獲取緩存失敗:', { error, key });
      return null;
    }
  }
}

// 導出單例實例
export const _cacheService = CacheService.getInstance();
