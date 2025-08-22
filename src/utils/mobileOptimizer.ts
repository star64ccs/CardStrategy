import { Dimensions, Platform, PixelRatio, StatusBar } from 'react-native';
import { logger } from '@/utils/logger';

// 移動端配置
export interface MobileConfig {
  enableTouchOptimization: boolean;
  enableGestureHandling: boolean;
  enableResponsiveDesign: boolean;
  enableMobilePerformance: boolean;
  enableOfflineMode: boolean;
  enablePushNotifications: boolean;
  enableHapticFeedback: boolean;
  enableBiometricAuth: boolean;
  enableVoiceCommands: boolean;
  enableARFeatures: boolean;
}

// 手勢配置
export interface GestureConfig {
  enableSwipeNavigation: boolean;
  enablePinchZoom: boolean;
  enableLongPress: boolean;
  enableDoubleTap: boolean;
  enablePullToRefresh: boolean;
  enableSwipeToDelete: boolean;
  enableSwipeToArchive: boolean;
  enableSwipeToShare: boolean;
}

// 響應式設計配置
export interface ResponsiveConfig {
  breakpoints: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  fontScales: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  spacingScales: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

// 移動端性能指標
export interface MobilePerformanceMetrics {
  touchResponseTime: number;
  gestureRecognitionTime: number;
  renderTime: number;
  memoryUsage: number;
  batteryImpact: number;
  networkEfficiency: number;
  offlineCapability: number;
  lastUpdated: Date;
}

// 手勢事件
export interface GestureEvent {
  type: 'swipe' | 'pinch' | 'longPress' | 'doubleTap' | 'pull' | 'tap';
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  velocity?: number;
  scale?: number;
  duration?: number;
  timestamp: number;
  target?: any;
}

// 移動端優化器
export class MobileOptimizer {
  private config: MobileConfig;
  private gestureConfig: GestureConfig;
  private responsiveConfig: ResponsiveConfig;
  private performanceMetrics: MobilePerformanceMetrics;
  private gestureHandlers: Map<string, Function> = new Map();
  private touchStartTime: number = 0;
  private touchStartPosition: { x: number; y: number } = { x: 0, y: 0 };
  private lastTapTime: number = 0;
  private isLongPressActive: boolean = false;
  private longPressTimer: NodeJS.Timeout | null = null;

  constructor(config: MobileConfig = {}) {
    this.config = {
      enableTouchOptimization: true,
      enableGestureHandling: true,
      enableResponsiveDesign: true,
      enableMobilePerformance: true,
      enableOfflineMode: true,
      enablePushNotifications: true,
      enableHapticFeedback: true,
      enableBiometricAuth: true,
      enableVoiceCommands: true,
      enableARFeatures: true,
      ...config,
    };

    this.gestureConfig = {
      enableSwipeNavigation: true,
      enablePinchZoom: true,
      enableLongPress: true,
      enableDoubleTap: true,
      enablePullToRefresh: true,
      enableSwipeToDelete: true,
      enableSwipeToArchive: true,
      enableSwipeToShare: true,
    };

    this.responsiveConfig = {
      breakpoints: {
        xs: 320,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
      },
      fontScales: {
        xs: 0.8,
        sm: 0.9,
        md: 1.0,
        lg: 1.1,
        xl: 1.2,
      },
      spacingScales: {
        xs: 0.8,
        sm: 0.9,
        md: 1.0,
        lg: 1.1,
        xl: 1.2,
      },
    };

    this.performanceMetrics = {
      touchResponseTime: 0,
      gestureRecognitionTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      batteryImpact: 0,
      networkEfficiency: 0,
      offlineCapability: 0,
      lastUpdated: new Date(),
    };

    this.init();
  }

  // 初始化
  private init(): void {
    if (this.config.enableTouchOptimization) {
      this.setupTouchOptimization();
    }

    if (this.config.enableGestureHandling) {
      this.setupGestureHandling();
    }

    if (this.config.enableMobilePerformance) {
      this.startPerformanceMonitoring();
    }

    logger.info('[Mobile Optimizer] 移動端優化器初始化完成');
  }

  // 設置觸摸優化
  private setupTouchOptimization(): void {
    // 優化觸摸響應時間
    const startTime = Date.now();

    // 設置觸摸事件監聽器
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), {
      passive: true,
    });
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), {
      passive: true,
    });
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), {
      passive: true,
    });

    this.performanceMetrics.touchResponseTime = Date.now() - startTime;
  }

  // 設置手勢處理
  private setupGestureHandling(): void {
    // 註冊手勢處理器
    this.registerGestureHandler('swipe', this.handleSwipe.bind(this));
    this.registerGestureHandler('pinch', this.handlePinch.bind(this));
    this.registerGestureHandler('longPress', this.handleLongPress.bind(this));
    this.registerGestureHandler('doubleTap', this.handleDoubleTap.bind(this));
    this.registerGestureHandler('pull', this.handlePull.bind(this));
  }

  // 處理觸摸開始
  private handleTouchStart(event: TouchEvent): void {
    this.touchStartTime = Date.now();
    const touch = event.touches[0];
    this.touchStartPosition = { x: touch.clientX, y: touch.clientY };

    // 長按檢測
    if (this.gestureConfig.enableLongPress) {
      this.isLongPressActive = false;
      this.longPressTimer = setTimeout(() => {
        this.isLongPressActive = true;
        this.triggerGesture('longPress', { duration: 500 });
      }, 500);
    }
  }

  // 處理觸摸結束
  private handleTouchEnd(event: TouchEvent): void {
    const endTime = Date.now();
    const duration = endTime - this.touchStartTime;
    const touch = event.changedTouches[0];
    const endPosition = { x: touch.clientX, y: touch.clientY };

    // 清除長按計時器
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    // 如果不是長按，檢測其他手勢
    if (!this.isLongPressActive) {
      const distance = Math.sqrt(
        Math.pow(endPosition.x - this.touchStartPosition.x, 2) +
          Math.pow(endPosition.y - this.touchStartPosition.y, 2)
      );

      if (distance > 50) {
        // 滑動手勢
        const direction = this.getSwipeDirection(
          this.touchStartPosition,
          endPosition
        );
        this.triggerGesture('swipe', { direction, distance, duration });
      } else if (duration < 300) {
        // 點擊手勢
        const timeSinceLastTap = endTime - this.lastTapTime;
        if (timeSinceLastTap < 300) {
          // 雙擊
          this.triggerGesture('doubleTap', { duration });
          this.lastTapTime = 0;
        } else {
          this.lastTapTime = endTime;
        }
      }
    }

    this.isLongPressActive = false;
  }

  // 處理觸摸移動
  private handleTouchMove(event: TouchEvent): void {
    // 清除長按計時器
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  // 獲取滑動方向
  private getSwipeDirection(
    start: { x: number; y: number },
    end: { x: number; y: number }
  ): 'left' | 'right' | 'up' | 'down' {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > absDeltaY) {
      return deltaX > 0 ? 'right' : 'left';
    }
    return deltaY > 0 ? 'down' : 'up';
  }

  // 觸發手勢事件
  private triggerGesture(type: string, data: any): void {
    const handler = this.gestureHandlers.get(type);
    if (handler) {
      const startTime = Date.now();
      handler(data);
      this.performanceMetrics.gestureRecognitionTime = Date.now() - startTime;
    }
  }

  // 註冊手勢處理器
  registerGestureHandler(type: string, handler: Function): void {
    this.gestureHandlers.set(type, handler);
  }

  // 處理滑動手勢
  private handleSwipe(data: any): void {
    logger.info('[Mobile Optimizer] 滑動手勢:', data);

    // 根據方向執行相應操作
    switch (data.direction) {
      case 'left':
        // 向左滑動 - 可能是返回或刪除
        break;
      case 'right':
        // 向右滑動 - 可能是前進或確認
        break;
      case 'up':
        // 向上滑動 - 可能是刷新或加載更多
        break;
      case 'down':
        // 向下滑動 - 可能是下拉刷新
        break;
    }
  }

  // 處理縮放手勢
  private handlePinch(data: any): void {
    logger.info('[Mobile Optimizer] 縮放手勢:', data);
  }

  // 處理長按手勢
  private handleLongPress(data: any): void {
    logger.info('[Mobile Optimizer] 長按手勢:', data);
  }

  // 處理雙擊手勢
  private handleDoubleTap(data: any): void {
    logger.info('[Mobile Optimizer] 雙擊手勢:', data);
  }

  // 處理拉動手勢
  private handlePull(data: any): void {
    logger.info('[Mobile Optimizer] 拉動手勢:', data);
  }

  // 響應式設計工具
  getResponsiveValue(values: {
    xs?: any;
    sm?: any;
    md?: any;
    lg?: any;
    xl?: any;
  }): any {
    const { width } = Dimensions.get('window');

    if (
      width >= this.responsiveConfig.breakpoints.xl &&
      values.xl !== undefined
    ) {
      return values.xl;
    } else if (
      width >= this.responsiveConfig.breakpoints.lg &&
      values.lg !== undefined
    ) {
      return values.lg;
    } else if (
      width >= this.responsiveConfig.breakpoints.md &&
      values.md !== undefined
    ) {
      return values.md;
    } else if (
      width >= this.responsiveConfig.breakpoints.sm &&
      values.sm !== undefined
    ) {
      return values.sm;
    }
    return values.xs || values.sm || values.md || values.lg || values.xl;
  }

  // 獲取響應式字體大小
  getResponsiveFontSize(baseSize: number): number {
    const scale = this.getResponsiveValue(this.responsiveConfig.fontScales);
    return Math.round(baseSize * scale);
  }

  // 獲取響應式間距
  getResponsiveSpacing(baseSpacing: number): number {
    const scale = this.getResponsiveValue(this.responsiveConfig.spacingScales);
    return Math.round(baseSpacing * scale);
  }

  // 檢查設備類型
  isMobile(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  isTablet(): boolean {
    const { width, height } = Dimensions.get('window');
    const aspectRatio = height / width;
    return aspectRatio <= 1.6;
  }

  isSmallScreen(): boolean {
    const { width } = Dimensions.get('window');
    return width < this.responsiveConfig.breakpoints.sm;
  }

  // 獲取設備信息
  getDeviceInfo(): any {
    return {
      platform: Platform.OS,
      version: Platform.Version,
      isMobile: this.isMobile(),
      isTablet: this.isTablet(),
      isSmallScreen: this.isSmallScreen(),
      dimensions: Dimensions.get('window'),
      pixelRatio: PixelRatio.get(),
      statusBarHeight: StatusBar.currentHeight || 0,
    };
  }

  // 開始性能監控
  private startPerformanceMonitoring(): void {
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 5000);
  }

  // 更新性能指標
  private updatePerformanceMetrics(): void {
    // 模擬性能數據收集
    this.performanceMetrics.renderTime = Math.random() * 100;
    this.performanceMetrics.memoryUsage = Math.random() * 100;
    this.performanceMetrics.batteryImpact = Math.random() * 100;
    this.performanceMetrics.networkEfficiency = Math.random() * 100;
    this.performanceMetrics.offlineCapability = Math.random() * 100;
    this.performanceMetrics.lastUpdated = new Date();
  }

  // 獲取性能指標
  getPerformanceMetrics(): MobilePerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  // 啟用觸覺反饋
  enableHapticFeedback(): void {
    if (this.config.enableHapticFeedback && Platform.OS === 'ios') {
      // iOS 觸覺反饋實現
      logger.info('[Mobile Optimizer] 啟用觸覺反饋');
    }
  }

  // 啟用生物識別認證
  enableBiometricAuth(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.config.enableBiometricAuth) {
        // 生物識別認證實現
        logger.info('[Mobile Optimizer] 啟用生物識別認證');
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  // 啟用語音命令
  enableVoiceCommands(): void {
    if (this.config.enableVoiceCommands) {
      // 語音命令實現
      logger.info('[Mobile Optimizer] 啟用語音命令');
    }
  }

  // 啟用 AR 功能
  enableARFeatures(): void {
    if (this.config.enableARFeatures) {
      // AR 功能實現
      logger.info('[Mobile Optimizer] 啟用 AR 功能');
    }
  }

  // 優化圖片加載
  optimizeImageLoading(
    imageUrl: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
    } = {}
  ): string {
    const { width, height, quality = 80, format = 'webp' } = options;

    // 根據設備像素比調整尺寸
    const pixelRatio = PixelRatio.get();
    const adjustedWidth = width ? Math.round(width * pixelRatio) : undefined;
    const adjustedHeight = height ? Math.round(height * pixelRatio) : undefined;

    // 構建優化後的 URL
    let optimizedUrl = imageUrl;
    if (adjustedWidth || adjustedHeight) {
      optimizedUrl += `?w=${adjustedWidth}&h=${adjustedHeight}&q=${quality}&f=${format}`;
    }

    return optimizedUrl;
  }

  // 預加載資源
  preloadResources(resources: string[]): Promise<void> {
    return new Promise((resolve) => {
      const promises = resources.map((url) => {
        return new Promise<void>((resolveResource) => {
          const img = new Image();
          img.onload = () => resolveResource();
          img.onerror = () => resolveResource();
          img.src = url;
        });
      });

      Promise.all(promises).then(() => resolve());
    });
  }

  // 清理資源
  cleanup(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }

    // 移除事件監聽器
    document.removeEventListener(
      'touchstart',
      this.handleTouchStart.bind(this)
    );
    document.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    document.removeEventListener('touchmove', this.handleTouchMove.bind(this));
  }
}

// 創建單例實例
export const mobileOptimizer = new MobileOptimizer();

// 導出工具函數
export const getResponsiveValue = (values: any) =>
  mobileOptimizer.getResponsiveValue(values);
export const getResponsiveFontSize = (size: number) =>
  mobileOptimizer.getResponsiveFontSize(size);
export const getResponsiveSpacing = (spacing: number) =>
  mobileOptimizer.getResponsiveSpacing(spacing);
export const isMobile = () => mobileOptimizer.isMobile();
export const isTablet = () => mobileOptimizer.isTablet();
export const isSmallScreen = () => mobileOptimizer.isSmallScreen();
export const getDeviceInfo = () => mobileOptimizer.getDeviceInfo();
export const optimizeImageLoading = (url: string, options?: any) =>
  mobileOptimizer.optimizeImageLoading(url, options);
export const preloadResources = (resources: string[]) =>
  mobileOptimizer.preloadResources(resources);
