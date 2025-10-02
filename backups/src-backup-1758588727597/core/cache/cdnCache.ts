/**
 * CDN 緩存管理器
 * 提供內容分發網絡優化和預加載功能
 */

import { logger } from '../../utils/logger';

export interface CDNConfig {
  baseUrl: string;
  apiKey?: string;
  region?: string;
  cacheTTL?: number;
  enableCompression?: boolean;
  enableWebP?: boolean;
  enableLazyLoading?: boolean;
  maxConcurrentRequests?: number;
}

export interface CDNAsset {
  url: string;
  type: 'image' | 'video' | 'document' | 'script' | 'stylesheet';
  size: number;
  lastModified: number;
  etag: string;
  contentType: string;
  compressed: boolean;
  webp: boolean;
  cached: boolean;
}

export interface CDNStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  compressedAssets: number;
  webpAssets: number;
  averageResponseTime: number;
  bandwidthSaved: number;
  hitRate: number;
}

export interface PreloadOptions {
  priority: 'high' | 'medium' | 'low';
  prefetch: boolean;
  crossorigin?: boolean;
  as?: string;
}

class CDNCache {
  private static instance: CDNCache;
  private config: CDNConfig;
  private stats: CDNStats;
  private assetCache: Map<string, CDNAsset> = new Map();
  private preloadQueue: Set<string> = new Set();
  private isInitialized: boolean = false;

  private constructor(config: CDNConfig) {
    this.config = {
      cacheTTL: 86400, // 24小時
      enableCompression: true,
      enableWebP: true,
      enableLazyLoading: true,
      maxConcurrentRequests: 10,
      ...config,
    };

    this.stats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      compressedAssets: 0,
      webpAssets: 0,
      averageResponseTime: 0,
      bandwidthSaved: 0,
      hitRate: 0,
    };
  }

  public static getInstance(config?: CDNConfig): CDNCache {
    if (!CDNCache.instance) {
      if (!config) {
        throw new Error(
          'CDN configuration is required for first initialization'
        );
      }
      CDNCache.instance = new CDNCache(config);
    }
    return CDNCache.instance;
  }

  /**
   * 初始化 CDN 緩存
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 模擬初始化過程
      await new Promise(resolve => setTimeout(resolve, 100));

      this.isInitialized = true;
      logger.info('CDN cache initialized successfully', {
        baseUrl: this.config.baseUrl,
        region: this.config.region,
        compression: this.config.enableCompression,
        webp: this.config.enableWebP,
      });

      // 啟動預加載優化
      this.startPreloadOptimization();
    } catch (error) {
      logger.error('Failed to initialize CDN cache', error);
      throw error;
    }
  }

  /**
   * 獲取優化的資源 URL
   */
  public async getOptimizedUrl(
    originalUrl: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
      compression?: boolean;
    } = {}
  ): Promise<string> {
    const startTime = Date.now();

    try {
      this.stats.totalRequests++;

      // 檢查緩存
      const cacheKey = this.getCacheKey(originalUrl, options);
      const cachedAsset = this.assetCache.get(cacheKey);

      if (cachedAsset && !this.isExpired(cachedAsset)) {
        this.stats.cacheHits++;
        this.updateStats(startTime);

        logger.debug('CDN cache hit', {
          url: originalUrl,
          cacheKey,
          type: cachedAsset.type,
        });

        return cachedAsset.url;
      }

      // 生成優化的 URL
      const optimizedUrl = await this.generateOptimizedUrl(
        originalUrl,
        options
      );

      // 緩存資產信息
      const asset: CDNAsset = {
        url: optimizedUrl,
        type: this.getAssetType(originalUrl),
        size: await this.getAssetSize(optimizedUrl),
        lastModified: Date.now(),
        etag: this.generateETag(optimizedUrl),
        contentType: this.getContentType(originalUrl),
        compressed: options.compression !== false,
        webp: options.format === 'webp' || this.config.enableWebP,
        cached: true,
      };

      this.assetCache.set(cacheKey, asset);
      this.stats.cacheMisses++;

      if (asset.compressed) {
        this.stats.compressedAssets++;
      }
      if (asset.webp) {
        this.stats.webpAssets++;
      }

      this.updateStats(startTime);

      logger.debug('CDN optimized URL generated', {
        original: originalUrl,
        optimized: optimizedUrl,
        type: asset.type,
        size: asset.size,
      });

      return optimizedUrl;
    } catch (error) {
      logger.error('CDN optimization error', { url: originalUrl, error });
      this.updateStats(startTime);
      return originalUrl; // 回退到原始 URL
    }
  }

  /**
   * 預加載資源
   */
  public async preloadAsset(
    url: string,
    options: PreloadOptions = { priority: 'medium', prefetch: true }
  ): Promise<boolean> {
    try {
      if (this.preloadQueue.has(url)) {
        return true; // 已在預加載隊列中
      }

      this.preloadQueue.add(url);

      // 根據優先級安排預加載
      const delay = this.getPreloadDelay(options.priority);

      setTimeout(async () => {
        try {
          await this.preloadAssetInternal(url, options);
        } catch (error) {
          logger.warn('Asset preload failed', { url, error });
        } finally {
          this.preloadQueue.delete(url);
        }
      }, delay);

      logger.debug('Asset queued for preload', {
        url,
        priority: options.priority,
      });
      return true;
    } catch (error) {
      logger.error('Asset preload error', { url, error });
      return false;
    }
  }

  /**
   * 批量預加載資源
   */
  public async preloadAssets(
    assets: Array<{ url: string; options?: PreloadOptions }>
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    // 限制並發請求
    const chunks = this.chunkArray(
      assets,
      this.config.maxConcurrentRequests || 10
    );

    for (const chunk of chunks) {
      const promises = chunk.map(async ({ url, options }) => {
        try {
          const result = await this.preloadAsset(url, options);
          return result ? 'success' : 'failed';
        } catch (error) {
          logger.error('Batch preload error', { url, error });
          return 'failed';
        }
      });

      const results = await Promise.all(promises);

      results.forEach(result => {
        if (result === 'success') {
          success++;
        } else {
          failed++;
        }
      });

      // 批次間延遲，避免過載
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    logger.info('Batch preload completed', {
      total: assets.length,
      success,
      failed,
    });

    return { success, failed };
  }

  /**
   * 清除 CDN 緩存
   */
  public async purgeCache(url?: string): Promise<boolean> {
    try {
      if (url) {
        // 清除特定 URL 的緩存
        const keysToDelete = Array.from(this.assetCache.keys()).filter(key =>
          key.includes(url)
        );

        keysToDelete.forEach(key => {
          this.assetCache.delete(key);
        });

        logger.info('CDN cache purged for URL', {
          url,
          keys: keysToDelete.length,
        });
      } else {
        // 清除所有緩存
        this.assetCache.clear();
        logger.info('CDN cache purged completely');
      }

      return true;
    } catch (error) {
      logger.error('CDN cache purge error', { url, error });
      return false;
    }
  }

  /**
   * 獲取 CDN 統計信息
   */
  public getStats(): CDNStats {
    const totalRequests = this.stats.totalRequests;
    this.stats.hitRate =
      totalRequests > 0 ? (this.stats.cacheHits / totalRequests) * 100 : 0;

    return { ...this.stats };
  }

  /**
   * 獲取緩存的資產信息
   */
  public getCachedAsset(url: string): CDNAsset | null {
    const keys = Array.from(this.assetCache.keys()).filter(key =>
      key.includes(url)
    );

    if (keys.length === 0) {
      return null;
    }

    // 返回最新的緩存資產
    let latestAsset: CDNAsset | null = null;
    let latestTime = 0;

    keys.forEach(key => {
      const asset = this.assetCache.get(key);
      if (asset && asset.lastModified > latestTime) {
        latestAsset = asset;
        latestTime = asset.lastModified;
      }
    });

    return latestAsset;
  }

  /**
   * 健康檢查
   */
  public async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      // 測試基本功能
      const testUrl = `${this.config.baseUrl}/health-check`;
      const optimizedUrl = await this.getOptimizedUrl(testUrl);

      return {
        healthy: true,
        details: {
          initialized: this.isInitialized,
          stats: this.getStats(),
          cacheSize: this.assetCache.size,
          preloadQueue: this.preloadQueue.size,
          config: {
            baseUrl: this.config.baseUrl,
            compression: this.config.enableCompression,
            webp: this.config.enableWebP,
          },
        },
      };
    } catch (error) {
      logger.error('CDN health check failed', error);
      return {
        healthy: false,
        details: {
          initialized: this.isInitialized,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private async preloadAssetInternal(
    url: string,
    options: PreloadOptions
  ): Promise<void> {
    // 模擬預加載過程
    const optimizedUrl = await this.getOptimizedUrl(url);

    // 在實際環境中，這裡會發送預加載請求
    logger.debug('Asset preloaded', {
      url,
      optimizedUrl,
      priority: options.priority,
    });
  }

  private generateOptimizedUrl(originalUrl: string, options: any): string {
    const url = new URL(originalUrl, this.config.baseUrl);

    // 添加優化參數
    if (options.width) {
      url.searchParams.set('w', options.width.toString());
    }
    if (options.height) {
      url.searchParams.set('h', options.height.toString());
    }
    if (options.quality) {
      url.searchParams.set('q', options.quality.toString());
    }
    if (options.format) {
      url.searchParams.set('f', options.format);
    }
    if (this.config.enableCompression) {
      url.searchParams.set('compress', '1');
    }

    return url.toString();
  }

  private getCacheKey(url: string, options: any): string {
    const optionsString = JSON.stringify(options);
    return `${url}:${optionsString}`;
  }

  private getAssetType(url: string): CDNAsset['type'] {
    const extension = url.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'svg':
        return 'image';
      case 'mp4':
      case 'webm':
      case 'ogg':
        return 'video';
      case 'pdf':
      case 'doc':
      case 'docx':
        return 'document';
      case 'js':
        return 'script';
      case 'css':
        return 'stylesheet';
      default:
        return 'image'; // 默認類型
    }
  }

  private async getAssetSize(url: string): Promise<number> {
    // 模擬獲取資產大小
    return Math.floor(Math.random() * 1024 * 1024) + 1024; // 1KB - 1MB
  }

  private generateETag(url: string): string {
    // 生成簡單的 ETag
    return `"${Buffer.from(url).toString('base64').substring(0, 16)}"`;
  }

  private getContentType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'svg':
        return 'image/svg+xml';
      case 'js':
        return 'application/javascript';
      case 'css':
        return 'text/css';
      default:
        return 'application/octet-stream';
    }
  }

  private isExpired(asset: CDNAsset): boolean {
    const ttl = this.config.cacheTTL || 86400;
    return Date.now() - asset.lastModified > ttl * 1000;
  }

  private getPreloadDelay(priority: string): number {
    switch (priority) {
      case 'high':
        return 0;
      case 'medium':
        return 500;
      case 'low':
        return 2000;
      default:
        return 500;
    }
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private updateStats(startTime: number): void {
    const responseTime = Date.now() - startTime;
    const totalRequests = this.stats.totalRequests;

    this.stats.averageResponseTime =
      (this.stats.averageResponseTime * (totalRequests - 1) + responseTime) /
      totalRequests;
  }

  private startPreloadOptimization(): void {
    // 定期清理過期緩存
    setInterval(
      () => {
        const now = Date.now();
        const ttl = (this.config.cacheTTL || 86400) * 1000;

        let cleanedCount = 0;
        for (const [key, asset] of this.assetCache.entries()) {
          if (now - asset.lastModified > ttl) {
            this.assetCache.delete(key);
            cleanedCount++;
          }
        }

        if (cleanedCount > 0) {
          logger.debug('CDN cache cleaned up expired assets', {
            count: cleanedCount,
          });
        }
      },
      30 * 60 * 1000
    ); // 每30分鐘清理一次
  }
}

export default CDNCache;
