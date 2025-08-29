import type {
  AnimationConfig,
  AnimationEvent,
  AnimationManagerConfig,
  AnimationPerformance,
  AnimationPreferences,
  AnimationServiceInterface,
  AnimationState,
  Keyframe,
  PresetAnimation,
} from '../types/animation';

/**
 * 動畫服務類 - 單例模式
 * 負責管理所有動畫、性能優化、偏好設置等
 */
export class AnimationService implements AnimationServiceInterface {
  private static instance: AnimationService;

  // 動畫管理
  private readonly animations: Map<
    string,
    {
      config: AnimationConfig;
      state: AnimationState;
      element?: HTMLElement;
      animation?: Animation;
    }
  > = new Map();

  // 事件監聽器
  private readonly eventListeners: Map<
    string,
    Set<(event: AnimationEvent) => void>
  > = new Map();

  // 偏好設置
  private preferences: AnimationPreferences = {
    reducedMotion: false,
    prefersAnimation: true,
    animationDuration: 'normal',
    animationIntensity: 'normal',
  };

  // 性能監控
  private readonly performanceMonitoring = {
    enabled: false,
    metrics: {
      fps: 60,
      frameTime: 16.67,
      droppedFrames: 0,
      memoryUsage: 0,
      cpuUsage: 0,
    },
  };

  // 預設動畫
  private readonly presets: Map<string, PresetAnimation> = new Map();

  // 全局配置
  private readonly globalConfig: AnimationManagerConfig = {
    maxConcurrentAnimations: 10,
    performanceThreshold: 30, // fps 閾值
    enablePerformanceMonitoring: true,
    enablePrefersReducedMotion: true,
    defaultEasing: 'ease-out',
    defaultDuration: 300,
  };

  // 性能監控相關
  private readonly frameCount = 0;
  private lastFrameTime = 0;
  private readonly performanceObserver?: PerformanceObserver;
  private animationFrameId?: number;

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): AnimationService {
    if (!AnimationService.instance) {
      AnimationService.instance = new AnimationService();
    }
    return AnimationService.instance;
  }

  /**
   * 初始化服務
   */
  private initializeService(): void {
    // 檢測用戶偏好設置
    this.detectUserPreferences();

    // 註冊預設動畫
    this.registerDefaultPresets();

    // 初始化性能監控
    if (this.globalConfig.enablePerformanceMonitoring) {
      this.enablePerformanceMonitoring(true);
    }

    // 監聽頁面可見性變化
    document.addEventListener(
      'visibilitychange',
      this.handleVisibilityChange.bind(this)
    );

    // 監聽窗口大小變化
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  /**
   * 檢測用戶偏好設置
   */
  private detectUserPreferences(): void {
    // 檢測 prefers-reduced-motion
    if (
      this.globalConfig.enablePrefersReducedMotion &&
      typeof window !== 'undefined' &&
      window.matchMedia
    ) {
      try {
        const _mediaQuery = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        );
        this.preferences.reducedMotion = mediaQuery.matches;

        mediaQuery.addEventListener('change', e => {
          this.preferences.reducedMotion = e.matches;
          this.emit('preferencesChanged', {
            type: 'start' as any,
            timestamp: Date.now(),
            animation: {} as AnimationConfig,
          });
        });
      } catch (error) {
        console.warn('無法檢測 prefers-reduced-motion:', error);
      }
    }

    // 檢測 prefers-animation
    if (typeof window !== 'undefined' && window.matchMedia) {
      try {
        const _animationQuery = window.matchMedia(
          '(prefers-animation: no-preference)'
        );
        this.preferences.prefersAnimation = animationQuery.matches;
      } catch (error) {
        console.warn('無法檢測 prefers-animation:', error);
      }
    }
  }

  /**
   * 註冊預設動畫
   */
  private registerDefaultPresets(): void {
    const defaultPresets: PresetAnimation[] = [
      {
        name: 'fadeIn',
        config: {
          duration: 300,
          easing: 'ease-out',
          fillMode: 'forwards',
        },
        description: '淡入動畫',
        category: 'entrance',
      },
      {
        name: 'fadeOut',
        config: {
          duration: 300,
          easing: 'ease-in',
          fillMode: 'forwards',
        },
        description: '淡出動畫',
        category: 'exit',
      },
      {
        name: 'slideIn',
        config: {
          duration: 400,
          easing: 'ease-out',
          fillMode: 'forwards',
        },
        description: '滑入動畫',
        category: 'entrance',
      },
      {
        name: 'slideOut',
        config: {
          duration: 400,
          easing: 'ease-in',
          fillMode: 'forwards',
        },
        description: '滑出動畫',
        category: 'exit',
      },
      {
        name: 'scaleIn',
        config: {
          duration: 300,
          easing: 'ease-out',
          fillMode: 'forwards',
        },
        description: '縮放進入動畫',
        category: 'entrance',
      },
      {
        name: 'scaleOut',
        config: {
          duration: 300,
          easing: 'ease-in',
          fillMode: 'forwards',
        },
        description: '縮放退出動畫',
        category: 'exit',
      },
      {
        name: 'rotateIn',
        config: {
          duration: 500,
          easing: 'ease-out',
          fillMode: 'forwards',
        },
        description: '旋轉進入動畫',
        category: 'entrance',
      },
      {
        name: 'bounce',
        config: {
          duration: 600,
          easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          iterations: 1,
        },
        description: '彈跳動畫',
        category: 'attention',
      },
      {
        name: 'pulse',
        config: {
          duration: 1000,
          easing: 'ease-in-out',
          iterations: -1,
          direction: 'alternate',
        },
        description: '脈衝動畫',
        category: 'attention',
      },
    ];

    defaultPresets.forEach(preset => this.registerPreset(preset));
  }

  /**
   * 創建動畫
   */
  public createAnimation(config: AnimationConfig): string {
    const _id = `animation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 檢查是否超過最大動畫數量
    if (this.animations.size >= this.globalConfig.maxConcurrentAnimations) {
      console.warn('達到最大動畫數量限制，將停止最舊的動畫');
      this.stopOldestAnimation();
    }

    // 應用偏好設置
    const _finalConfig = this.applyPreferences(config);

    this.animations.set(id, {
      config: finalConfig,
      state: {
        status: 'idle',
        isPlaying: false,
        isPaused: false,
        currentTime: 0,
        progress: 0,
        direction: 'normal',
      } as any,
    });

    this.emit('animationCreated', {
      type: 'start',
      timestamp: Date.now(),
      animation: finalConfig,
    });

    return id;
  }

  /**
   * 播放動畫
   */
  public async playAnimation(id: string): Promise<void> {
    const _animation = this.animations.get(id);
    if (!animation) {
      throw new Error(`動畫 ${id} 不存在`);
    }

    // 檢查是否應該播放動畫
    if (
      this.preferences.reducedMotion &&
      animation.config.respectMotionPreference
    ) {
      console.log('用戶偏好減少動畫，跳過播放');
      return;
    }

    try {
      if (animation.element) {
        // 使用 Web Animations API
        const _keyframes = this.generateKeyframes(animation.config);
        const _options = this.generateAnimationOptions(animation.config);

        animation.animation = animation.element.animate(
          keyframes as any,
          options
        );

        animation.animation.onfinish = () => {
          (animation.state as any).isPlaying = false;
          (animation.state as any).progress = 1;
          this.emit('animationEnded', {
            type: 'end',
            timestamp: Date.now(),
            animation: animation.config,
            target: animation.element,
          });
        };

        animation.animation.oncancel = () => {
          (animation.state as any).isPlaying = false;
          this.emit('animationCancelled', {
            type: 'cancel',
            timestamp: Date.now(),
            animation: animation.config,
            target: animation.element,
          });
        };

        (animation.state as any).isPlaying = true;
        (animation.state as any).isPaused = false;

        this.emit('animationStarted', {
          type: 'start',
          timestamp: Date.now(),
          animation: animation.config,
          target: animation.element,
        });
      }
    } catch (error) {
      console.error('播放動畫失敗:', error);
      throw error;
    }
  }

  /**
   * 暫停動畫
   */
  public pauseAnimation(id: string): void {
    const _animation = this.animations.get(id);
    if (!animation) {
      throw new Error(`動畫 ${id} 不存在`);
    }

    if (animation.animation) {
      animation.animation.pause();
      (animation.state as any).isPaused = true;

      this.emit('animationPaused', {
        type: 'pause',
        timestamp: Date.now(),
        animation: animation.config,
        target: animation.element,
      });
    }
  }

  /**
   * 停止動畫
   */
  public stopAnimation(id: string): void {
    const _animation = this.animations.get(id);
    if (!animation) {
      throw new Error(`動畫 ${id} 不存在`);
    }

    if (animation.animation) {
      animation.animation.cancel();
      (animation.state as any).isPlaying = false;
      (animation.state as any).isPaused = false;
      (animation.state as any).progress = 0;

      this.emit('animationStopped', {
        type: 'cancel',
        timestamp: Date.now(),
        animation: animation.config,
        target: animation.element,
      });
    }
  }

  /**
   * 播放所有動畫
   */
  public async playAll(): Promise<void> {
    const _promises = Array.from(this.animations.keys()).map(id =>
      this.playAnimation(id)
    );
    await Promise.all(promises);
  }

  /**
   * 暫停所有動畫
   */
  public pauseAll(): void {
    this.animations.forEach((_, id) => this.pauseAnimation(id));
  }

  /**
   * 停止所有動畫
   */
  public stopAll(): void {
    this.animations.forEach((_, id) => this.stopAnimation(id));
  }

  /**
   * 更新動畫配置
   */
  public updateConfig(id: string, config: Partial<AnimationConfig>): void {
    const _animation = this.animations.get(id);
    if (!animation) {
      throw new Error(`動畫 ${id} 不存在`);
    }

    const _updatedConfig = { ...animation.config, ...config };
    animation.config = this.applyPreferences(updatedConfig);

    // 如果動畫正在播放，重新啟動
    if ((animation.state as any).isPlaying) {
      this.stopAnimation(id);
      this.playAnimation(id);
    }
  }

  /**
   * 獲取動畫配置
   */
  public getConfig(id: string): AnimationConfig | null {
    const _animation = this.animations.get(id);
    return animation ? animation.config : null;
  }

  /**
   * 獲取性能指標
   */
  public getPerformance(): AnimationPerformance {
    return this.performanceMonitoring.metrics;
  }

  /**
   * 啟用性能監控
   */
  public enablePerformanceMonitoring(enabled: boolean): void {
    this.performanceMonitoring.enabled = enabled;

    if (enabled) {
      this.startPerformanceMonitoring();
    } else {
      this.stopPerformanceMonitoring();
    }
  }

  /**
   * 更新偏好設置
   */
  public updatePreferences(preferences: Partial<AnimationPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };

    // 重新應用所有動畫的偏好設置
    this.animations.forEach((animation, id) => {
      animation.config = this.applyPreferences(animation.config);
    });

    this.emit('preferencesChanged', {
      type: 'start',
      timestamp: Date.now(),
      animation: {} as AnimationConfig,
    });
  }

  /**
   * 獲取偏好設置
   */
  public getPreferences(): AnimationPreferences {
    return { ...this.preferences };
  }

  /**
   * 註冊預設動畫
   */
  public registerPreset(preset: PresetAnimation): void {
    this.presets.set(preset.name, preset);
  }

  /**
   * 獲取預設動畫
   */
  public getPreset(name: string): PresetAnimation | null {
    return this.presets.get(name) || null;
  }

  /**
   * 獲取所有預設動畫
   */
  public getAllPresets(): PresetAnimation[] {
    return Array.from(this.presets.values());
  }

  /**
   * 事件監聽
   */
  public on(event: string, callback: (event: AnimationEvent) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
  }

  /**
   * 移除事件監聽
   */
  public off(event: string, callback: (event: AnimationEvent) => void): void {
    const _listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * 銷毀服務
   */
  public destroy(): void {
    this.stopAll();
    this.stopPerformanceMonitoring();
    this.animations.clear();
    this.eventListeners.clear();
    this.presets.clear();
  }

  /**
   * 應用偏好設置到動畫配置
   */
  private applyPreferences(config: AnimationConfig): AnimationConfig {
    const _newConfig = { ...config };

    if (this.preferences.reducedMotion && config.respectMotionPreference) {
      newConfig.duration = Math.min(config.duration, 100);
      newConfig.easing = 'linear';
    }

    // 根據用戶偏好調整動畫強度
    switch (this.preferences.animationIntensity) {
      case 'minimal':
        newConfig.duration = Math.min(config.duration, 200);
        break;
      case 'intense':
        newConfig.duration = Math.max(config.duration, 500);
        break;
    }

    return newConfig;
  }

  /**
   * 生成關鍵幀
   */
  private generateKeyframes(config: AnimationConfig): Keyframe[] {
    // 這裡可以根據配置生成具體的關鍵幀
    // 簡化實現，返回基本的關鍵幀
    return [
      { offset: 0, properties: { opacity: 0, transform: 'translateY(20px)' } },
      { offset: 1, properties: { opacity: 1, transform: 'translateY(0)' } },
    ];
  }

  /**
   * 生成動畫選項
   */
  private generateAnimationOptions(
    config: AnimationConfig
  ): KeyframeAnimationOptions {
    return {
      duration: config.duration,
      easing: typeof config.easing === 'string' ? config.easing : 'ease-out',
      delay: config.delay || 0,
      iterations: config.iterations || 1,
      direction: config.direction || 'normal',
      fill: config.fillMode || 'none',
    };
  }

  /**
   * 停止最舊的動畫
   */
  private stopOldestAnimation(): void {
    const _oldestId = this.animations.keys().next().value;
    if (oldestId) {
      this.stopAnimation(oldestId);
      this.animations.delete(oldestId);
    }
  }

  /**
   * 開始性能監控
   */
  private startPerformanceMonitoring(): void {
    this.lastFrameTime = performance.now();
    this.animationFrameId = requestAnimationFrame(
      this.monitorPerformance.bind(this)
    );
  }

  /**
   * 停止性能監控
   */
  private stopPerformanceMonitoring(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }

  /**
   * 監控性能
   */
  private monitorPerformance(currentTime: number): void {
    if (!this.performanceMonitoring.enabled) return;

    const _deltaTime = currentTime - this.lastFrameTime;
    const _fps = 1000 / deltaTime;

    this.performanceMonitoring.metrics.fps = fps;
    this.performanceMonitoring.metrics.frameTime = deltaTime;

    if (fps < this.globalConfig.performanceThreshold) {
      this.performanceMonitoring.metrics.droppedFrames++;
    }

    this.lastFrameTime = currentTime;
    this.animationFrameId = requestAnimationFrame(
      this.monitorPerformance.bind(this)
    );
  }

  /**
   * 處理頁面可見性變化
   */
  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.pauseAll();
    } else {
      // 頁面重新可見時，可以選擇是否恢復動畫
    }
  }

  /**
   * 處理窗口大小變化
   */
  private handleResize(): void {
    // 可以根據窗口大小調整動畫參數
  }

  /**
   * 發送事件
   */
  private emit(event: string, data: AnimationEvent): void {
    const _listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('事件回調執行失敗:', error);
        }
      });
    }
  }
}

// 導出單例實例
export const _animationService = AnimationService.getInstance();
