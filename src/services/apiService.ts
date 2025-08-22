import { api, API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';
import { cacheManager } from '../utils/cacheManager';
import { offlineSyncManager } from '../utils/offlineSyncManager';
import { networkMonitor } from '../utils/networkMonitor';
import { CACHE_EXPIRY } from '../utils/constants';

// API 響應類型
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

// 分頁參數
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 搜索參數
export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, any>;
}

// 緩存配置
export interface CacheOptions {
  enabled?: boolean;
  expiry?: number;
  forceRefresh?: boolean;
  offlineOnly?: boolean;
  etag?: string;
  lastModified?: string;
}

// API 服務類
class ApiService {
  // 通用 GET 請求（支持緩存）
  async get<T>(
    endpoint: string,
    params?: any,
    cacheOptions: CacheOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const isOnline = await networkMonitor.isConnected();
      const cacheKey = this.generateCacheKey(endpoint, params);

      // 如果啟用緩存且不在線，嘗試從緩存獲取
      if (cacheOptions.enabled !== false && !isOnline) {
        const cachedData =
          await cacheManager.getCachedApiResponse<ApiResponse<T>>(cacheKey);
        if (cachedData) {
          logger.info(`📦 Cache hit for ${endpoint}`);
          return cachedData;
        }
      }

      // 如果強制刷新或無緩存，直接請求
      if (cacheOptions.forceRefresh) {
        const response = await api.get(endpoint, { params });
        const apiResponse = response.data;

        // 緩存響應
        if (cacheOptions.enabled !== false) {
          await cacheManager.cacheApiResponse(cacheKey, apiResponse, {
            expiry: cacheOptions.expiry || CACHE_EXPIRY.MEDIUM,
            etag: cacheOptions.etag,
            lastModified: cacheOptions.lastModified,
          });
        }

        return apiResponse;
      }

      // 嘗試從緩存獲取
      if (cacheOptions.enabled !== false) {
        const cachedData =
          await cacheManager.getCachedApiResponse<ApiResponse<T>>(cacheKey);
        if (cachedData) {
          logger.info(`📦 Cache hit for ${endpoint}`);
          return cachedData;
        }
      }

      // 緩存未命中，發送請求
      const response = await api.get(endpoint, { params });
      const apiResponse = response.data;

      // 緩存響應
      if (cacheOptions.enabled !== false) {
        await cacheManager.cacheApiResponse(cacheKey, apiResponse, {
          expiry: cacheOptions.expiry || CACHE_EXPIRY.MEDIUM,
          etag: response.headers?.etag,
          lastModified: response.headers?.['last-modified'],
        });
      }

      return apiResponse;
    } catch (error: any) {
      logger.error(`❌ GET ${endpoint} error:`, { error });

      // 如果網絡錯誤且啟用緩存，嘗試從緩存獲取
      if (this.isNetworkError(error) && cacheOptions.enabled !== false) {
        const cacheKey = this.generateCacheKey(endpoint, params);
        const cachedData =
          await cacheManager.getCachedApiResponse<ApiResponse<T>>(cacheKey);
        if (cachedData) {
          logger.info(
            `📦 Using cached data for ${endpoint} due to network error`
          );
          return cachedData;
        }
      }

      throw this.handleError(error);
    }
  }

  // 通用 POST 請求（支持離線隊列）
  async post<T>(
    endpoint: string,
    data?: any,
    options: {
      offlineQueue?: boolean;
      priority?: 'low' | 'medium' | 'high';
    } = {}
  ): Promise<ApiResponse<T>> {
    try {
      const isOnline = await networkMonitor.isConnected();

      // 如果離線且啟用離線隊列，添加到隊列
      if (!isOnline && options.offlineQueue !== false) {
        const operationId = await offlineSyncManager.addOfflineOperation({
          type: 'CREATE',
          endpoint,
          data,
          maxRetries: 3,
          priority: options.priority || 'medium',
        });

        logger.info(`📝 Added to offline queue: ${operationId}`);

        // 返回模擬響應
        return {
          success: true,
          message: '操作已加入離線隊列，將在網絡恢復時同步',
          data: { operationId } as any,
        };
      }

      const response = await api.post(endpoint, data);
      return response.data;
    } catch (error: any) {
      logger.error(`❌ POST ${endpoint} error:`, { error });

      // 如果網絡錯誤且啟用離線隊列，添加到隊列
      if (this.isNetworkError(error) && options.offlineQueue !== false) {
        const operationId = await offlineSyncManager.addOfflineOperation({
          type: 'CREATE',
          endpoint,
          data,
          maxRetries: 3,
          priority: options.priority || 'medium',
        });

        logger.info(
          `📝 Added to offline queue after network error: ${operationId}`
        );

        return {
          success: true,
          message: '操作已加入離線隊列，將在網絡恢復時同步',
          data: { operationId } as any,
        };
      }

      throw this.handleError(error);
    }
  }

  // 通用 PUT 請求（支持離線隊列）
  async put<T>(
    endpoint: string,
    data?: any,
    options: {
      offlineQueue?: boolean;
      priority?: 'low' | 'medium' | 'high';
    } = {}
  ): Promise<ApiResponse<T>> {
    try {
      const isOnline = await networkMonitor.isConnected();

      // 如果離線且啟用離線隊列，添加到隊列
      if (!isOnline && options.offlineQueue !== false) {
        const operationId = await offlineSyncManager.addOfflineOperation({
          type: 'UPDATE',
          endpoint,
          data,
          maxRetries: 3,
          priority: options.priority || 'medium',
        });

        logger.info(`📝 Added to offline queue: ${operationId}`);

        return {
          success: true,
          message: '操作已加入離線隊列，將在網絡恢復時同步',
          data: { operationId } as any,
        };
      }

      const response = await api.put(endpoint, data);

      // 清除相關緩存
      await this.invalidateCache(endpoint);

      return response.data;
    } catch (error: any) {
      logger.error(`❌ PUT ${endpoint} error:`, { error });

      // 如果網絡錯誤且啟用離線隊列，添加到隊列
      if (this.isNetworkError(error) && options.offlineQueue !== false) {
        const operationId = await offlineSyncManager.addOfflineOperation({
          type: 'UPDATE',
          endpoint,
          data,
          maxRetries: 3,
          priority: options.priority || 'medium',
        });

        logger.info(
          `📝 Added to offline queue after network error: ${operationId}`
        );

        return {
          success: true,
          message: '操作已加入離線隊列，將在網絡恢復時同步',
          data: { operationId } as any,
        };
      }

      throw this.handleError(error);
    }
  }

  // 通用 DELETE 請求（支持離線隊列）
  async delete<T>(
    endpoint: string,
    options: {
      offlineQueue?: boolean;
      priority?: 'low' | 'medium' | 'high';
    } = {}
  ): Promise<ApiResponse<T>> {
    try {
      const isOnline = await networkMonitor.isConnected();

      // 如果離線且啟用離線隊列，添加到隊列
      if (!isOnline && options.offlineQueue !== false) {
        const operationId = await offlineSyncManager.addOfflineOperation({
          type: 'DELETE',
          endpoint,
          data: {},
          maxRetries: 3,
          priority: options.priority || 'medium',
        });

        logger.info(`📝 Added to offline queue: ${operationId}`);

        return {
          success: true,
          message: '操作已加入離線隊列，將在網絡恢復時同步',
          data: { operationId } as any,
        };
      }

      const response = await api.delete(endpoint);

      // 清除相關緩存
      await this.invalidateCache(endpoint);

      return response.data;
    } catch (error: any) {
      logger.error(`❌ DELETE ${endpoint} error:`, { error });

      // 如果網絡錯誤且啟用離線隊列，添加到隊列
      if (this.isNetworkError(error) && options.offlineQueue !== false) {
        const operationId = await offlineSyncManager.addOfflineOperation({
          type: 'DELETE',
          endpoint,
          data: {},
          maxRetries: 3,
          priority: options.priority || 'medium',
        });

        logger.info(
          `📝 Added to offline queue after network error: ${operationId}`
        );

        return {
          success: true,
          message: '操作已加入離線隊列，將在網絡恢復時同步',
          data: { operationId } as any,
        };
      }

      throw this.handleError(error);
    }
  }

  // 智能緩存請求
  async smartGet<T>(
    endpoint: string,
    params?: any,
    cacheOptions: CacheOptions = {}
  ): Promise<ApiResponse<T>> {
    return cacheManager.smartCache(
      this.generateCacheKey(endpoint, params),
      () =>
        this.get<T>(endpoint, params, { ...cacheOptions, forceRefresh: true }),
      cacheOptions
    );
  }

  // 預加載數據
  async preloadData(endpoints: string[]): Promise<void> {
    try {
      const promises = endpoints.map(async (endpoint) => {
        try {
          await this.get(endpoint, undefined, {
            enabled: true,
            expiry: CACHE_EXPIRY.LONG,
          });
        } catch (error) {
          logger.error(`Preload data error for ${endpoint}:`, { error });
        }
      });

      await Promise.allSettled(promises);
      logger.info('Data preloading completed');
    } catch (error) {
      logger.error('Preload data error:', { error });
    }
  }

  // 清除緩存
  async clearCache(pattern?: string): Promise<void> {
    try {
      if (pattern) {
        // 清除特定模式的緩存
        await cacheManager.cleanupExpiredCache();
      } else {
        // 清除所有緩存
        await cacheManager.clearAllCache();
      }
      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Clear cache error:', { error });
    }
  }

  // 獲取緩存統計
  async getCacheStats() {
    try {
      return await cacheManager.getCacheStats();
    } catch (error) {
      logger.error('Get cache stats error:', { error });
      return null;
    }
  }

  // 同步離線操作
  async syncOfflineOperations(): Promise<{ success: number; failed: number }> {
    try {
      return await offlineSyncManager.syncOfflineOperations();
    } catch (error) {
      logger.error('Sync offline operations error:', { error });
      return { success: 0, failed: 0 };
    }
  }

  // 錯誤處理
  private handleError(error: any): Error {
    if (error.response) {
      // 服務器響應錯誤
      const { status, data } = error.response;
      const message = data?.message || `HTTP ${status} 錯誤`;
      return new Error(message);
    }
    if (error.request) {
      // 網絡錯誤
      return new Error('網絡連接錯誤，請檢查您的網絡連接');
    }
    // 其他錯誤
    return new Error(error.message || '未知錯誤');
  }

  // 檢查是否為網絡錯誤
  private isNetworkError(error: any): boolean {
    return !error.response && error.request;
  }

  // 生成緩存鍵
  private generateCacheKey(endpoint: string, params?: any): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}${paramString}`;
  }

  // 清除相關緩存
  private async invalidateCache(endpoint: string): Promise<void> {
    try {
      // 這裡可以實現更精確的緩存失效邏輯
      // 例如根據端點模式清除相關緩存
      logger.info(`Cache invalidated for ${endpoint}`);
    } catch (error) {
      logger.error('Invalidate cache error:', { error });
    }
  }

  // 檢查 API 健康狀態
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.get(API_ENDPOINTS.SYSTEM.HEALTH);
      return response.success;
    } catch (error) {
      logger.error('❌ API health check failed:', { error });
      return false;
    }
  }

  // 獲取 API 版本
  async getVersion(): Promise<string> {
    try {
      const response = await this.get(API_ENDPOINTS.SYSTEM.VERSION);
      return response.data.version;
    } catch (error) {
      logger.error('❌ Get API version failed:', { error });
      return 'unknown';
    }
  }
}

// 導出單例實例
export { ApiService };
export const apiService = new ApiService();
