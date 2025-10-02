import { logger } from '../../core/utils/logger';
import { CacheStorage } from '../../core/utils/storage';

/**
 * CacheService
 * HandleDataCache相Off功能
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
   * SettingsCache
   */
  async set(key: string, data: unknown, expiry?: number): Promise<void> {
    try {
      await CacheStorage.setCache(key, data, expiry);
    } catch (error) {
      logger.error('Settings緩存Failed:', { error, key });
    }
  }

  /**
   * GetCache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      return await CacheStorage.getCache<T>(key);
    } catch (error) {
      logger.error('Get緩存Failed:', { error, key });
      return null;
    }
  }
}

// Export單例Instance
export const _cacheService = CacheService.getInstance();
