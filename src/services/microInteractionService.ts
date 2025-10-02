// 微交互ServiceClass
import type {
  ButtonClickConfig,
  FeedbackConfig,
  FormValidationConfig,
  ListAnimationConfig,
  LoadingConfig,
  MicroInteractionConfig,
  MicroInteractionEvent,
  MicroInteractionManagerConfig,
  MicroInteractionPerformance,
  MicroInteractionServiceInterface,
  MicroInteractionState,
  MicroInteractionStats,
  PageTransitionConfig,
} from '../types/microInteractions';
import {
  MicroInteractionStatus,
  MicroInteractionType,
} from '../types/microInteractions';

// DefaultConfigure
const DEFAULT_CONFIG: MicroInteractionManagerConfig = {
  enabled: true,
  performanceMode: false,
  accessibilityMode: false,
  debugMode: false,
  maxConcurrent: 10,
  throttleDelay: 16,
  defaultDuration: 300,
  defaultEasing: 'ease-out',
};

export class MicroInteractionService
  implements MicroInteractionServiceInterface
{
  private static instance: MicroInteractionService;
  private config: MicroInteractionManagerConfig;
  private readonly interactions: Map<string, MicroInteractionConfig> =
    new Map();
  private readonly states: Map<string, MicroInteractionState> = new Map();
  private readonly performances: Map<string, MicroInteractionPerformance> =
    new Map();
  private readonly eventListeners: Map<string, ((data: unknown) => void)[]> =
    new Map();
  private readonly activeAnimations: Map<string, Animation> = new Map();
  private performanceMonitoring = false;
  private readonly stats: MicroInteractionStats = {
    totalInteractions: 0,
    successfulInteractions: 0,
    failedInteractions: 0,
    averageDuration: 0,
    performanceScore: 0,
    accessibilityScore: 0,
    userSatisfactionScore: 0,
  };

  private constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.detectUserPreferences();
  }

  public static getInstance(): MicroInteractionService {
    if (!MicroInteractionService.instance) {
      MicroInteractionService.instance = new MicroInteractionService();
    }
    return MicroInteractionService.instance;
  }

  // InitializeService
  public async initialize(
    config: Partial<MicroInteractionManagerConfig> = {}
  ): Promise<void> {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.detectUserPreferences();

    if (this.config.performanceMode) {
      this.enablePerformanceMonitoring(true);
    }

    this.emit('initialized', { config: this.config });
  }

  // Register微交互
  public register(config: MicroInteractionConfig): string {
    const _id = config.id || this.generateId();
    const _finalConfig = this.mergeWithDefaults(config);

    this.interactions.set(id, finalConfig);
    this.states.set(id, {
      id,
      config: finalConfig,
      status: MicroInteractionStatus.IDLE,
      progress: 0,
    } as any);

    this.emit('registered', { id, config: finalConfig });
    return id;
  }

  // Logout微交互
  public unregister(id: string): void {
    this.stop(id);
    this.interactions.delete(id);
    this.states.delete(id);
    this.performances.delete(id);
    this.activeAnimations.delete(id);

    this.emit('unregistered', { id });
  }

  // 觸發微交互
  public async trigger(id: string, data?: Record<string, any>): Promise<void> {
    const _config = this.interactions.get(id);
    if (!config || config.disabled) {
      throw new Error(`微交互 ${id} 不存在或已禁用`);
    }

    const _state = this.states.get(id);
    if (!state) {
      throw new Error(`微交互 ${id} 狀態不存在`);
    }

    if (this.getActiveCount() >= this.config.maxConcurrent) {
      throw new Error('達到最大並發限制');
    }

    try {
      state.status = MicroInteractionStatus.TRIGGERED;
      state.startTime = performance.now();
      (state as any).data = data;
      (state as any).progress = 0;

      const event: MicroInteractionEvent = {
        id,
        type: config.type,
        trigger: config.trigger,
        timestamp: Date.now(),
        data,
      };

      this.emit('triggered', event);
      await this.executeAnimation(id, config, data);

      (state as any).status = MicroInteractionStatus.COMPLETED;
      (state as any).endTime = performance.now();
      (state as any).progress = 1;

      this.updateStats(state);
      this.emit('completed', event);
    } catch (error) {
      state.status = MicroInteractionStatus.ERROR;
      state.error = error instanceof Error ? error.message : '未知Error';
      state.endTime = performance.now();

      this.stats.failedInteractions++;
      this.emit('error', { id, error: state.error });
      throw error;
    }
  }

  // Stop微交互
  public stop(id: string): void {
    const _animation = this.activeAnimations.get(id);
    if (animation) {
      animation.cancel();
      this.activeAnimations.delete(id);
    }

    const _state = this.states.get(id);
    if (state) {
      (state as any).status = MicroInteractionStatus.IDLE;
      (state as any).progress = 0;
    }

    this.emit('stopped', { id });
  }

  // Reset微交互
  public reset(id: string): void {
    this.stop(id);

    const _state = this.states.get(id);
    if (state) {
      (state as any).status = MicroInteractionStatus.IDLE;
      (state as any).progress = 0;
      (state as any).startTime = undefined;
      (state as any).endTime = undefined;
      (state as any).error = undefined;
      (state as any).data = undefined;
    }

    this.emit('reset', { id });
  }

  // BatchOperation
  public async triggerMultiple(
    ids: string[],
    data?: Record<string, any>
  ): Promise<void> {
    const _promises = ids.map(id => this.trigger(id, data));
    await Promise.all(promises);
  }

  public stopAll(): void {
    this.activeAnimations.forEach(animation => {
      animation.cancel();
    });
    this.activeAnimations.clear();

    this.states.forEach(state => {
      (state as any).status = MicroInteractionStatus.IDLE;
      (state as any).progress = 0;
    });

    this.emit('stoppedAll', {});
  }

  public resetAll(): void {
    this.stopAll();

    this.states.forEach(state => {
      (state as any).status = MicroInteractionStatus.IDLE;
      (state as any).progress = 0;
      (state as any).startTime = undefined;
      (state as any).endTime = undefined;
      (state as any).error = undefined;
      (state as any).data = undefined;
    });

    this.emit('resetAll', {});
  }

  // StatusQuery
  public getState(id: string): MicroInteractionState | null {
    return this.states.get(id) || null;
  }

  public getProgress(id: string): number {
    const _state = this.states.get(id);
    return state ? (state as any).progress : 0;
  }

  public isPlaying(id: string): boolean {
    const _state = this.states.get(id);
    return state ? state.status === MicroInteractionStatus.PLAYING : false;
  }

  public isCompleted(id: string): boolean {
    const _state = this.states.get(id);
    return state ? state.status === MicroInteractionStatus.COMPLETED : false;
  }

  public hasError(id: string): boolean {
    const _state = this.states.get(id);
    return state ? state.status === MicroInteractionStatus.ERROR : false;
  }

  // 性能Monitor
  public getPerformance(id: string): MicroInteractionPerformance | null {
    return this.performances.get(id) || null;
  }

  public getStats(): MicroInteractionStats {
    return { ...this.stats };
  }

  public enablePerformanceMonitoring(enabled: boolean): void {
    this.performanceMonitoring = enabled;
    this.emit('performanceMonitoringChanged', { enabled });
  }

  // ConfigureManage
  public updateConfig(
    id: string,
    config: Partial<MicroInteractionConfig>
  ): void {
    const _existingConfig = this.interactions.get(id);
    if (!existingConfig) {
      throw new Error(`微交互 ${id} 不存在`);
    }

    const _updatedConfig = { ...existingConfig, ...config };
    this.interactions.set(id, updatedConfig);

    const _state = this.states.get(id);
    if (state) {
      state.config = updatedConfig;
    }

    this.emit('configUpdated', { id, config: updatedConfig });
  }

  public getConfig(id: string): MicroInteractionConfig | null {
    return this.interactions.get(id) || null;
  }

  // Event監聽
  public on(event: string, callback: (data: unknown) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  public off(event: string, callback: (data: unknown) => void): void {
    const _listeners = this.eventListeners.get(event);
    if (listeners) {
      const _index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // 銷毀Service
  public destroy(): void {
    this.stopAll();
    this.interactions.clear();
    this.states.clear();
    this.performances.clear();
    this.activeAnimations.clear();
    this.eventListeners.clear();

    MicroInteractionService.instance = null as any;
  }

  // PrivateMethod
  private detectUserPreferences(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      try {
        const _mediaQuery = window.matchMedia(
          '(prefers-reduced-motion: reduce)'
        );
        if (mediaQuery.matches) {
          this.config.accessibilityMode = true;
          this.config.defaultDuration = 0;
        }
      } catch (error) {
        console.warn('無法檢測 prefers-reduced-motion:', error);
      }
    }
  }

  private mergeWithDefaults(
    config: MicroInteractionConfig
  ): MicroInteractionConfig {
    const _defaults = {
      duration: this.config.defaultDuration,
      easing: this.config.defaultEasing,
      accessibility: {
        reducedMotion: this.config.accessibilityMode,
        screenReader: this.config.accessibilityMode,
        keyboardOnly: false,
      },
      performance: {
        useTransform: true,
        useOpacity: true,
        useWillChange: this.config.performanceMode,
        throttleScroll: true,
      },
    };

    return {
      ...defaults,
      ...config,
      accessibility: { ...defaults.accessibility, ...config.accessibility },
      performance: { ...defaults.performance, ...config.performance },
    };
  }

  private async executeAnimation(
    id: string,
    config: MicroInteractionConfig,
    data?: Record<string, any>
  ): Promise<void> {
    const _element = this.findElement(id, data);
    if (!element) {
      throw new Error(`找不到元素: ${id}`);
    }

    const _state = this.states.get(id)!;
    state.status = MicroInteractionStatus.PLAYING;

    const _keyframes = this.generateKeyframes(config, data);
    const _options = this.generateAnimationOptions(config);

    const _animation = element.animate(keyframes, options);
    this.activeAnimations.set(id, animation);

    if (this.performanceMonitoring) {
      this.startPerformanceMonitoring(id);
    }

    return new Promise((resolve, reject) => {
      animation.onfinish = () => {
        this.activeAnimations.delete(id);
        resolve();
      };

      animation.oncancel = () => {
        this.activeAnimations.delete(id);
        reject(new Error('動畫被取消'));
      };
    });
  }

  private findElement(id: string, data?: Record<string, any>): Element | null {
    if (data?.element) {
      return data.element;
    }

    if (typeof document !== 'undefined') {
      return (
        document.getElementById(id) ||
        document.querySelector(`[data-micro-interaction="${id}"]`)
      );
    }

    return null;
  }

  private generateKeyframes(
    config: MicroInteractionConfig,
    data?: Record<string, any>
  ): Keyframe[] {
    switch (config.type) {
      case MicroInteractionType.BUTTON_CLICK:
        return this.generateButtonClickKeyframes(
          config as ButtonClickConfig,
          data
        );
      case MicroInteractionType.FORM_VALIDATION:
        return this.generateFormValidationKeyframes(
          config as FormValidationConfig,
          data
        );
      case MicroInteractionType.LOADING:
        return this.generateLoadingKeyframes(config as LoadingConfig, data);
      case MicroInteractionType.SUCCESS:
      case MicroInteractionType.ERROR:
        return this.generateFeedbackKeyframes(config as FeedbackConfig, data);
      case MicroInteractionType.PAGE_TRANSITION:
        return this.generatePageTransitionKeyframes(
          config as PageTransitionConfig,
          data
        );
      case MicroInteractionType.LIST_ANIMATION:
        return this.generateListAnimationKeyframes(
          config as ListAnimationConfig,
          data
        );
      default:
        return [{ opacity: 1 }, { opacity: 0.8 }, { opacity: 1 }];
    }
  }

  private generateButtonClickKeyframes(
    config: ButtonClickConfig,
    data?: Record<string, any>
  ): Keyframe[] {
    const keyframes: Keyframe[] = [];

    if (config.scale?.enabled) {
      keyframes.push(
        { transform: 'scale(1)' },
        { transform: `scale(${config.scale.scale || 0.95})` },
        { transform: 'scale(1)' }
      );
    }

    if (config.shadow?.enabled) {
      keyframes.push(
        { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
        {
          boxShadow: `0 4px 8px rgba(0,0,0,${config.shadow.intensity || 0.2})`,
        },
        { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
      );
    }

    return keyframes.length > 0
      ? keyframes
      : [{ opacity: 1 }, { opacity: 0.8 }, { opacity: 1 }];
  }

  private generateFormValidationKeyframes(
    config: FormValidationConfig,
    data?: Record<string, any>
  ): Keyframe[] {
    const _validationState = data?.validationState || 'success';

    if (validationState === 'error' && config.error?.shake) {
      return [
        { transform: 'translateX(0)' },
        { transform: `translateX(-${config.error.shakeIntensity || 10}px)` },
        { transform: `translateX(${config.error.shakeIntensity || 10}px)` },
        { transform: `translateX(-${config.error.shakeIntensity || 10}px)` },
        { transform: `translateX(${config.error.shakeIntensity || 10}px)` },
        { transform: 'translateX(0)' },
      ];
    }

    if (validationState === 'warning' && config.warning?.pulse) {
      return [{ opacity: 1 }, { opacity: 0.5 }, { opacity: 1 }];
    }

    return [{ opacity: 1 }, { opacity: 0.8 }, { opacity: 1 }];
  }

  private generateLoadingKeyframes(
    config: LoadingConfig,
    data?: Record<string, any>
  ): Keyframe[] {
    if (config.spinner?.type === 'circular') {
      return [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }];
    }

    if (config.spinner?.type === 'pulse') {
      return [
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0.5, transform: 'scale(0.8)' },
        { opacity: 1, transform: 'scale(1)' },
      ];
    }

    return [{ opacity: 1 }, { opacity: 0.5 }, { opacity: 1 }];
  }

  private generateFeedbackKeyframes(
    config: FeedbackConfig,
    data?: Record<string, any>
  ): Keyframe[] {
    if (config.icon?.animation === 'bounce') {
      return [
        { transform: 'scale(1)' },
        { transform: 'scale(1.2)' },
        { transform: 'scale(1)' },
      ];
    }

    if (config.icon?.animation === 'shake') {
      return [
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(-10deg)' },
        { transform: 'rotate(10deg)' },
        { transform: 'rotate(-10deg)' },
        { transform: 'rotate(10deg)' },
        { transform: 'rotate(0deg)' },
      ];
    }

    return [{ opacity: 0 }, { opacity: 1 }];
  }

  private generatePageTransitionKeyframes(
    config: PageTransitionConfig,
    data?: Record<string, any>
  ): Keyframe[] {
    const _animation = data?.direction === 'exit' ? config.exit : config.enter;

    switch (animation?.animation) {
      case 'fade':
        return [{ opacity: 0 }, { opacity: 1 }];
      case 'slide':
        const _direction = animation.direction || 'left';
        const _transforms = {
          left: ['translateX(-100%)', 'translateX(0)'],
          right: ['translateX(100%)', 'translateX(0)'],
          up: ['translateY(-100%)', 'translateY(0)'],
          down: ['translateY(100%)', 'translateY(0)'],
        };
        return [
          { transform: transforms[direction][0] },
          { transform: transforms[direction][1] },
        ];
      case 'scale':
        return [
          { transform: 'scale(0.8)', opacity: 0 },
          { transform: 'scale(1)', opacity: 1 },
        ];
      default:
        return [{ opacity: 0 }, { opacity: 1 }];
    }
  }

  private generateListAnimationKeyframes(
    config: ListAnimationConfig,
    data?: Record<string, any>
  ): Keyframe[] {
    const _animation = data?.direction === 'exit' ? config.exit : config.enter;

    switch (animation?.animation) {
      case 'fade':
        return [{ opacity: 0 }, { opacity: 1 }];
      case 'slide':
        const _direction = animation.direction || 'up';
        const _transforms = {
          left: ['translateX(-20px)', 'translateX(0)'],
          right: ['translateX(20px)', 'translateX(0)'],
          up: ['translateY(-20px)', 'translateY(0)'],
          down: ['translateY(20px)', 'translateY(0)'],
        };
        return [
          { opacity: 0, transform: transforms[direction][0] },
          { opacity: 1, transform: transforms[direction][1] },
        ];
      case 'scale':
        return [
          { opacity: 0, transform: 'scale(0.8)' },
          { opacity: 1, transform: 'scale(1)' },
        ];
      default:
        return [{ opacity: 0 }, { opacity: 1 }];
    }
  }

  private generateAnimationOptions(
    config: MicroInteractionConfig
  ): KeyframeAnimationOptions {
    return {
      duration: config.duration,
      easing: config.easing || this.config.defaultEasing,
      delay: config.delay || 0,
      iterations: config.iterations || 1,
      direction: (config.direction as PlaybackDirection) || 'normal',
      fill: 'forwards',
    };
  }

  private startPerformanceMonitoring(id: string): void {
    const _startTime = performance.now();
    let frameCount = 0;
    let lastFrameTime = startTime;

    const _measureFrame = () => {
      frameCount++;
      const _currentTime = performance.now();
      const _frameTime = currentTime - lastFrameTime;
      lastFrameTime = currentTime;

      if (currentTime - startTime < 1000) {
        requestAnimationFrame(measureFrame);
      } else {
        const _duration = currentTime - startTime;
        const _averageFPS = frameCount / (duration / 1000);

        this.performances.set(id, {
          id,
          startTime,
          endTime: currentTime,
          duration,
          frameCount,
          averageFPS,
        });
      }
    };

    requestAnimationFrame(measureFrame);
  }

  private updateStats(state: MicroInteractionState): void {
    this.stats.totalInteractions++;

    if (state.status === MicroInteractionStatus.COMPLETED) {
      this.stats.successfulInteractions++;

      if (state.startTime && state.endTime) {
        const _duration = state.endTime - state.startTime;
        this.stats.averageDuration =
          (this.stats.averageDuration *
            (this.stats.successfulInteractions - 1) +
            duration) /
          this.stats.successfulInteractions;
      }
    } else if (state.status === MicroInteractionStatus.ERROR) {
      this.stats.failedInteractions++;
    }

    this.stats.performanceScore = this.calculatePerformanceScore();
  }

  private calculatePerformanceScore(): number {
    const _performances = Array.from(this.performances.values());
    if (performances.length === 0) return 0;

    const _avgFPS =
      performances.reduce((sum, p) => sum + p.averageFPS, 0) /
      performances.length;
    const _avgDuration =
      performances.reduce((sum, p) => sum + p.duration, 0) /
      performances.length;

    const _fpsScore = Math.min((avgFPS / 60) * 100, 100);
    const _durationScore = Math.max(0, 100 - avgDuration / 10);

    return (fpsScore + durationScore) / 2;
  }

  private getActiveCount(): number {
    return Array.from(this.states.values()).filter(
      state => state.status === MicroInteractionStatus.PLAYING
    ).length;
  }

  private generateId(): string {
    return `micro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private emit(event: string, data: unknown): void {
    const _listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`微交互事件監聽器Error: ${event}`, error);
        }
      });
    }
  }
}

// Export單例Instance
export const _microInteractionService = MicroInteractionService.getInstance();
