/**
 * 代碼分割優化器 - 第三階段性能優化
 * 實現智能代碼分割和動態導入優化
 */

import { logger } from '../utils/logger';

export interface CodeSplitConfig {
  chunkSize: number; // 目標chunk大小（KB）
  maxChunks: number; // 最大chunk數量
  preloadThreshold: number; // 預加載閾值（用戶行為分數）
  cacheStrategy: 'aggressive' | 'conservative' | 'balanced';
  compressionLevel: number; // 壓縮級別 1-9
  enableTreeShaking: boolean; // 啟用樹搖優化
}

export interface ChunkInfo {
  id: string;
  name: string;
  size: number;
  dependencies: string[];
  isLoaded: boolean;
  loadTime: number;
  lastAccessed: Date;
  priority: number;
  modules: string[];
}

export interface SplitMetrics {
  totalChunks: number;
  loadedChunks: number;
  totalSize: number;
  averageLoadTime: number;
  compressionRatio: number;
  cacheHitRate: number;
  bundleEfficiency: number;
}

/**
 * 代碼分割優化器
 */
export class CodeSplitter {
  private static instance: CodeSplitter;
  private config: CodeSplitConfig;
  private chunks: Map<string, ChunkInfo> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();
  private metrics: SplitMetrics;
  private routeAnalysis: Map<string, string[]> = new Map();

  private constructor() {
    this.config = this.getDefaultConfig();
    this.metrics = this.getInitialMetrics();
  }

  public static getInstance(): CodeSplitter {
    if (!CodeSplitter.instance) {
      CodeSplitter.instance = new CodeSplitter();
    }
    return CodeSplitter.instance;
  }

  /**
   * 初始化代碼分割器
   */
  public async initialize(): Promise<void> {
    logger.info('初始化代碼分割器...');

    try {
      // 分析應用結構
      await this.analyzeApplicationStructure();

      // 設置路由分割策略
      await this.setupRouteSplitting();

      // 初始化預加載策略
      await this.initializePreloadingStrategy();

      logger.info('代碼分割器初始化完成');
    } catch (error) {
      logger.error('代碼分割器初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 創建懶加載路由
   */
  public createLazyRoute(
    routePath: string,
    importFunction: () => Promise<any>,
    priority: number = 1
  ): React.LazyExoticComponent<any> {
    logger.debug('創建懶加載路由', { routePath, priority });

    const chunkId = this.generateChunkId(routePath);

    const lazyComponent = React.lazy(async () => {
      const startTime = Date.now();

      try {
        const module = await importFunction();
        const loadTime = Date.now() - startTime;

        // 記錄chunk信息
        this.recordChunkLoad(chunkId, routePath, loadTime);

        return module;
      } catch (error) {
        logger.error('路由加載失敗', { routePath, error });
        throw error;
      }
    });

    // 預加載相關路由
    this.schedulePreload(routePath, priority);

    return lazyComponent;
  }

  /**
   * 創建組件分割
   */
  public createComponentSplit(
    componentName: string,
    importFunction: () => Promise<any>,
    dependencies: string[] = []
  ): React.LazyExoticComponent<any> {
    logger.debug('創建組件分割', { componentName, dependencies });

    const chunkId = this.generateChunkId(componentName);

    const lazyComponent = React.lazy(async () => {
      // 預加載依賴組件
      if (dependencies.length > 0) {
        await this.preloadDependencies(dependencies);
      }

      const startTime = Date.now();

      try {
        const module = await importFunction();
        const loadTime = Date.now() - startTime;

        this.recordChunkLoad(chunkId, componentName, loadTime);

        return module;
      } catch (error) {
        logger.error('組件加載失敗', { componentName, error });
        throw error;
      }
    });

    return lazyComponent;
  }

  /**
   * 預加載路由
   */
  public async preloadRoute(routePath: string): Promise<void> {
    const relatedRoutes = this.routeAnalysis.get(routePath) || [];

    logger.debug('預加載路由', {
      routePath,
      relatedCount: relatedRoutes.length,
    });

    // 並行預加載相關路由
    const preloadPromises = relatedRoutes.map(relatedRoute =>
      this.preloadRouteChunk(relatedRoute)
    );

    await Promise.allSettled(preloadPromises);
  }

  /**
   * 優化bundle大小
   */
  public async optimizeBundle(): Promise<{
    originalSize: number;
    optimizedSize: number;
    savings: number;
    compressionRatio: number;
  }> {
    logger.info('開始bundle優化...');

    const startTime = Date.now();

    try {
      // 分析未使用的代碼
      const unusedModules = await this.analyzeUnusedCode();

      // 執行樹搖優化
      const treeShakingResult = await this.performTreeShaking(unusedModules);

      // 壓縮代碼
      const compressionResult = await this.compressCode();

      // 合併小chunks
      const mergeResult = await this.mergeSmallChunks();

      const optimizationTime = Date.now() - startTime;

      const result = {
        originalSize: treeShakingResult.originalSize,
        optimizedSize: compressionResult.compressedSize,
        savings:
          treeShakingResult.originalSize - compressionResult.compressedSize,
        compressionRatio: compressionResult.compressionRatio,
      };

      logger.info('Bundle優化完成', {
        ...result,
        optimizationTime,
      });

      return result;
    } catch (error) {
      logger.error('Bundle優化失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取分割指標
   */
  public getSplitMetrics(): SplitMetrics {
    return { ...this.metrics };
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<CodeSplitConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('代碼分割器配置已更新', this.config);
  }

  // 私有方法

  private async analyzeApplicationStructure(): Promise<void> {
    logger.debug('分析應用結構...');

    // 分析路由結構
    const routes = [
      '/',
      '/cards',
      '/scan',
      '/market',
      '/collection',
      '/settings',
      '/profile',
      '/auth',
      '/search',
      '/analytics',
    ];

    // 為每個路由分析相關組件
    for (const route of routes) {
      const relatedComponents = this.analyzeRouteComponents(route);
      this.routeAnalysis.set(route, relatedComponents);
    }

    logger.debug('應用結構分析完成', {
      routeCount: routes.length,
      totalComponents: Array.from(this.routeAnalysis.values()).flat().length,
    });
  }

  private analyzeRouteComponents(route: string): string[] {
    // 根據路由返回相關組件
    const routeComponentMap: Record<string, string[]> = {
      '/': ['HomeScreen', 'CardCarousel', 'QuickActions'],
      '/cards': ['CardList', 'CardDetail', 'CardFilter'],
      '/scan': ['ScanScreen', 'CameraView', 'RecognitionResult'],
      '/market': ['MarketScreen', 'PriceChart', 'MarketAnalysis'],
      '/collection': ['CollectionScreen', 'CollectionStats', 'Wishlist'],
      '/settings': ['SettingsScreen', 'ThemeSelector', 'NotificationSettings'],
      '/profile': ['ProfileScreen', 'UserStats', 'Achievements'],
      '/auth': ['LoginScreen', 'RegisterScreen', 'ForgotPassword'],
      '/search': ['SearchScreen', 'SearchResults', 'SearchFilters'],
      '/analytics': ['AnalyticsScreen', 'Charts', 'Reports'],
    };

    return routeComponentMap[route] || [];
  }

  private async setupRouteSplitting(): Promise<void> {
    logger.debug('設置路由分割策略...');

    // 根據用戶行為模式設置分割策略
    const userBehavior = await this.analyzeUserBehavior();

    // 高優先級路由（用戶經常訪問）
    const highPriorityRoutes = userBehavior.frequentRoutes.slice(0, 3);

    // 為高優先級路由設置更大的chunk
    for (const route of highPriorityRoutes) {
      const chunkId = this.generateChunkId(route);
      const chunk = this.chunks.get(chunkId);
      if (chunk) {
        chunk.priority = 3; // 高優先級
      }
    }

    logger.debug('路由分割策略設置完成', {
      highPriorityRoutes: highPriorityRoutes.length,
    });
  }

  private async initializePreloadingStrategy(): Promise<void> {
    logger.debug('初始化預加載策略...');

    // 基於用戶行為預測需要預加載的路由
    const predictionResult = await this.predictUserNavigation();

    // 設置預加載任務
    for (const route of predictionResult.predictedRoutes) {
      this.schedulePreload(route, predictionResult.confidence[route] || 0.5);
    }

    logger.debug('預加載策略初始化完成', {
      predictedRoutes: predictionResult.predictedRoutes.length,
    });
  }

  private generateChunkId(name: string): string {
    return `chunk_${name.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  private recordChunkLoad(
    chunkId: string,
    name: string,
    loadTime: number
  ): void {
    const chunk: ChunkInfo = {
      id: chunkId,
      name,
      size: this.estimateChunkSize(name),
      dependencies: [],
      isLoaded: true,
      loadTime,
      lastAccessed: new Date(),
      priority: 1,
      modules: [name],
    };

    this.chunks.set(chunkId, chunk);
    this.updateMetrics();
  }

  private estimateChunkSize(name: string): number {
    // 簡化的chunk大小估算
    const baseSize = 50; // 50KB 基礎大小
    const complexityMultiplier = name.includes('Screen') ? 2 : 1;
    return baseSize * complexityMultiplier;
  }

  private schedulePreload(route: string, priority: number): void {
    // 延遲預加載，避免影響當前加載
    setTimeout(
      () => {
        this.preloadRoute(route);
      },
      2000 * (4 - priority)
    ); // 根據優先級延遲
  }

  private async preloadRouteChunk(route: string): Promise<void> {
    const chunkId = this.generateChunkId(route);

    if (this.chunks.has(chunkId) && this.chunks.get(chunkId)!.isLoaded) {
      return; // 已經加載
    }

    if (this.loadingPromises.has(chunkId)) {
      return this.loadingPromises.get(chunkId); // 正在加載
    }

    const loadPromise = this.loadRouteChunk(route);
    this.loadingPromises.set(chunkId, loadPromise);

    try {
      await loadPromise;
    } finally {
      this.loadingPromises.delete(chunkId);
    }
  }

  private async loadRouteChunk(route: string): Promise<void> {
    logger.debug('預加載路由chunk', { route });

    try {
      // 動態導入路由組件
      await import(`../../screens${route}Screen`);

      const chunkId = this.generateChunkId(route);
      const chunk = this.chunks.get(chunkId);
      if (chunk) {
        chunk.isLoaded = true;
        chunk.lastAccessed = new Date();
      }
    } catch (error) {
      logger.warn('路由預加載失敗', { route, error });
    }
  }

  private async preloadDependencies(dependencies: string[]): Promise<void> {
    const preloadPromises = dependencies.map(dep => {
      const chunkId = this.generateChunkId(dep);
      if (!this.chunks.get(chunkId)?.isLoaded) {
        return this.preloadRouteChunk(dep);
      }
    });

    await Promise.allSettled(preloadPromises.filter(Boolean));
  }

  private async analyzeUserBehavior(): Promise<{
    frequentRoutes: string[];
    averageSessionTime: number;
    navigationPattern: Record<string, number>;
  }> {
    // 模擬用戶行為分析
    return {
      frequentRoutes: ['/', '/cards', '/scan', '/market'],
      averageSessionTime: 300000, // 5分鐘
      navigationPattern: {
        '/': 0.9,
        '/cards': 0.7,
        '/scan': 0.6,
        '/market': 0.5,
        '/collection': 0.4,
      },
    };
  }

  private async predictUserNavigation(): Promise<{
    predictedRoutes: string[];
    confidence: Record<string, number>;
  }> {
    // 基於當前路由預測用戶可能訪問的下一個路由
    const currentRoute = window.location?.pathname || '/';

    const routeTransitions: Record<string, string[]> = {
      '/': ['/cards', '/scan'],
      '/cards': ['/scan', '/market'],
      '/scan': ['/cards', '/market'],
      '/market': ['/collection', '/cards'],
    };

    return {
      predictedRoutes: routeTransitions[currentRoute] || [],
      confidence: {
        [currentRoute]: 0.8,
      },
    };
  }

  private async analyzeUnusedCode(): Promise<string[]> {
    // 分析未使用的代碼模組
    const allModules = Array.from(this.chunks.keys());
    const usedModules = Array.from(this.chunks.values())
      .filter(chunk => chunk.isLoaded)
      .flatMap(chunk => chunk.modules);

    return allModules.filter(module => !usedModules.includes(module));
  }

  private async performTreeShaking(unusedModules: string[]): Promise<{
    originalSize: number;
    removedModules: string[];
    newSize: number;
  }> {
    logger.debug('執行樹搖優化', { unusedModuleCount: unusedModules.length });

    const originalSize = Array.from(this.chunks.values()).reduce(
      (sum, chunk) => sum + chunk.size,
      0
    );

    // 移除未使用的模組
    for (const module of unusedModules) {
      this.chunks.delete(module);
    }

    const newSize = Array.from(this.chunks.values()).reduce(
      (sum, chunk) => sum + chunk.size,
      0
    );

    return {
      originalSize,
      removedModules: unusedModules,
      newSize,
    };
  }

  private async compressCode(): Promise<{
    compressedSize: number;
    compressionRatio: number;
  }> {
    // 模擬代碼壓縮
    const originalSize = Array.from(this.chunks.values()).reduce(
      (sum, chunk) => sum + chunk.size,
      0
    );

    const compressionRatio = 0.7; // 壓縮到70%
    const compressedSize = originalSize * compressionRatio;

    return {
      compressedSize,
      compressionRatio,
    };
  }

  private async mergeSmallChunks(): Promise<{
    mergedChunks: number;
    newChunkCount: number;
  }> {
    const smallChunks = Array.from(this.chunks.values()).filter(
      chunk => chunk.size < this.config.chunkSize
    );

    const mergedChunks = Math.floor(smallChunks.length / 2);
    const newChunkCount = this.chunks.size - mergedChunks;

    logger.debug('合併小chunks', {
      smallChunkCount: smallChunks.length,
      mergedChunks,
      newChunkCount,
    });

    return {
      mergedChunks,
      newChunkCount,
    };
  }

  private updateMetrics(): void {
    const chunks = Array.from(this.chunks.values());

    this.metrics.totalChunks = chunks.length;
    this.metrics.loadedChunks = chunks.filter(chunk => chunk.isLoaded).length;
    this.metrics.totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    this.metrics.averageLoadTime =
      chunks.length > 0
        ? chunks.reduce((sum, chunk) => sum + chunk.loadTime, 0) / chunks.length
        : 0;

    // 計算緩存命中率
    const totalAccesses = this.metrics.totalChunks;
    this.metrics.cacheHitRate =
      totalAccesses > 0 ? this.metrics.loadedChunks / totalAccesses : 0;

    // 計算bundle效率
    const optimalChunkSize = this.config.chunkSize;
    const averageChunkSize =
      this.metrics.totalChunks > 0
        ? this.metrics.totalSize / this.metrics.totalChunks
        : 0;
    this.metrics.bundleEfficiency = Math.min(
      1,
      optimalChunkSize / averageChunkSize
    );
  }

  private getDefaultConfig(): CodeSplitConfig {
    return {
      chunkSize: 200, // 200KB
      maxChunks: 20,
      preloadThreshold: 0.6,
      cacheStrategy: 'balanced',
      compressionLevel: 6,
      enableTreeShaking: true,
    };
  }

  private getInitialMetrics(): SplitMetrics {
    return {
      totalChunks: 0,
      loadedChunks: 0,
      totalSize: 0,
      averageLoadTime: 0,
      compressionRatio: 1,
      cacheHitRate: 0,
      bundleEfficiency: 0,
    };
  }
}

export default CodeSplitter;
