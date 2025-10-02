import type {
  AnimationConfig,
  AnimationPreset,
  AnimationEvent,
  AnimationManager,
  AnimationTools,
  SpringConfig,
  AnimationStats,
} from '../types/animation';
import { DEFAULT_ANIMATION_PRESETS } from '../types/animation';

class AnimationService implements AnimationManager, AnimationTools {
  private static instance: AnimationService;
  private readonly animations: Map<string, AnimationConfig> = new Map();
  private readonly presets: AnimationPreset[] = [...DEFAULT_ANIMATION_PRESETS];
  private readonly eventListeners: ((event: AnimationEvent) => void)[] = [];
  private isReducedMotion = false;
  private performanceMode: 'high' | 'medium' | 'low' = 'medium';
  private stats: AnimationStats = {
    totalAnimations: 0,
    activeAnimations: 0,
    averageDuration: 0,
    performanceScore: 100,
    frameDrops: 0,
    memoryUsage: 0,
    lastUpdateTime: Date.now(),
  };

  private constructor() {}

  static getInstance(): AnimationService {
    if (!AnimationService.instance) {
      AnimationService.instance = new AnimationService();
    }
    return AnimationService.instance;
  }

  // 動畫Manage
  createAnimation(config: AnimationConfig): string {
    const _animationId = `animation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.animations.set(animationId, config);
    this.stats.totalAnimations++;
    return animationId;
  }

  async startAnimation(animationId: string): Promise<void> {
    const _animation = this.animations.get(animationId);
    if (!animation) {
      throw new Error(`Animation not found: ${animationId}`);
    }

    if (this.isReducedMotion) {
      // 如果Enable減少動畫，直接Skip動畫
      this.emitEvent({
        type: 'animation_start',
        animationId,
        timestamp: Date.now(),
      });

      setTimeout(() => {
        this.emitEvent({
          type: 'animation_end',
          animationId,
          duration: 0,
          timestamp: Date.now(),
        });
      }, 0);
      return;
    }

    this.stats.activeAnimations++;

    this.emitEvent({
      type: 'animation_start',
      animationId,
      timestamp: Date.now(),
    });

    // 模擬動畫執Row
    setTimeout(() => {
      this.stats.activeAnimations--;
      this.emitEvent({
        type: 'animation_end',
        animationId,
        duration: animation.duration,
        timestamp: Date.now(),
      });
    }, animation.duration);
  }

  stopAnimation(animationId: string): void {
    const _animation = this.animations.get(animationId);
    if (animation) {
      this.stats.activeAnimations--;
      this.emitEvent({
        type: 'animation_cancel',
        animationId,
        timestamp: Date.now(),
      });
    }
  }

  pauseAnimation(animationId: string): void {
    // 在實際Apply中，這裡應該Pause動畫
    console.log('Pausing animation:', animationId);
  }

  resumeAnimation(animationId: string): void {
    // 在實際Apply中，這裡應該Restore動畫
    console.log('Resuming animation:', animationId);
  }

  // 預設動畫
  getPresets(): AnimationPreset[] {
    return [...this.presets];
  }

  getPreset(presetId: string): AnimationPreset | null {
    return this.presets.find(p => p.id === presetId) || null;
  }

  createPreset(preset: Omit<AnimationPreset, 'id'>): string {
    const newPreset: AnimationPreset = {
      ...preset,
      id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    this.presets.push(newPreset);
    return newPreset.id;
  }

  // 性能Manage
  setPerformanceMode(mode: 'high' | 'medium' | 'low'): void {
    this.performanceMode = mode;

    // Root據性能模式調整動畫
    switch (mode) {
      case 'low':
        this.enableReducedMotion(true);
        break;
      case 'high':
        this.enableReducedMotion(false);
        break;
      default:
        // medium 模式保持當前Settings
        break;
    }
  }

  enableReducedMotion(enabled: boolean): void {
    this.isReducedMotion = enabled;
  }

  isReducedMotionEnabled(): boolean {
    return this.isReducedMotion;
  }

  // EventManage
  addEventListener(listener: (event: AnimationEvent) => void): void {
    this.eventListeners.push(listener);
  }

  removeEventListener(listener: (event: AnimationEvent) => void): void {
    const _index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  // 動畫Tool實現
  createFadeAnimation(
    from: number,
    to: number,
    duration = 300
  ): AnimationConfig {
    return {
      type: 'timing',
      duration,
      delay: 0,
      easing: 'ease-out',
      from: { opacity: from },
      to: { opacity: to },
      useNativeDriver: true,
      isInteraction: false,
      iterations: 1,
      loop: false,
    };
  }

  createSlideAnimation(
    direction: 'left' | 'right' | 'up' | 'down',
    distance = 100
  ): AnimationConfig {
    const from: unknown = { opacity: 0 };
    const to: unknown = { opacity: 1 };

    switch (direction) {
      case 'left':
        from.translateX = -distance;
        to.translateX = 0;
        break;
      case 'right':
        from.translateX = distance;
        to.translateX = 0;
        break;
      case 'up':
        from.translateY = -distance;
        to.translateY = 0;
        break;
      case 'down':
        from.translateY = distance;
        to.translateY = 0;
        break;
    }

    return {
      type: 'timing',
      duration: 400,
      delay: 0,
      easing: 'ease-out',
      from,
      to,
      useNativeDriver: true,
      isInteraction: false,
      iterations: 1,
      loop: false,
    };
  }

  createScaleAnimation(
    from: number,
    to: number,
    duration = 300
  ): AnimationConfig {
    return {
      type: 'spring',
      duration,
      delay: 0,
      easing: 'bounce',
      from: { scale: from, opacity: 0 },
      to: { scale: to, opacity: 1 },
      useNativeDriver: true,
      isInteraction: false,
      iterations: 1,
      loop: false,
    };
  }

  createRotateAnimation(
    from: number,
    to: number,
    duration = 500
  ): AnimationConfig {
    return {
      type: 'timing',
      duration,
      delay: 0,
      easing: 'ease-in-out',
      from: { rotate: `${from}deg` },
      to: { rotate: `${to}deg` },
      useNativeDriver: true,
      isInteraction: false,
      iterations: 1,
      loop: false,
    };
  }

  createBounceAnimation(distance = 20, duration = 600): AnimationConfig {
    return {
      type: 'spring',
      duration,
      delay: 0,
      easing: 'bounce',
      from: { scale: 1 },
      to: { scale: 1 + distance / 100 },
      useNativeDriver: true,
      isInteraction: true,
      iterations: 1,
      loop: false,
    };
  }

  createSpringAnimation(
    to: unknown,
    config: SpringConfig = {}
  ): AnimationConfig {
    return {
      type: 'spring',
      duration: 500,
      delay: 0,
      easing: 'bounce',
      from: {},
      to,
      useNativeDriver: true,
      isInteraction: false,
      iterations: 1,
      loop: false,
    };
  }

  // 動畫組合
  createSequence(animations: AnimationConfig[]): AnimationConfig {
    // 簡化實現，實際應該Create序Column動畫
    return animations[0] || this.createFadeAnimation(0, 1);
  }

  createParallel(animations: AnimationConfig[]): AnimationConfig {
    // 簡化實現，實際應該CreateParallel動畫
    return animations[0] || this.createFadeAnimation(0, 1);
  }

  createStagger(
    animations: AnimationConfig[],
    staggerDelay = 100
  ): AnimationConfig {
    // 簡化實現，實際應該Create錯On動畫
    return animations[0] || this.createFadeAnimation(0, 1);
  }

  // 動畫插Value
  interpolate(
    value: number,
    inputRange: number[],
    outputRange: unknown[]
  ): unknown {
    // 簡化的插Value實現
    if (inputRange.length !== outputRange.length) {
      throw new Error('Input and output ranges must have the same length');
    }

    if (inputRange.length === 0) {
      return outputRange[0];
    }

    // 找到最接近的範圍
    for (let i = 0; i < inputRange.length - 1; i++) {
      if (value >= inputRange[i] && value <= inputRange[i + 1]) {
        const _ratio =
          (value - inputRange[i]) / (inputRange[i + 1] - inputRange[i]);
        if (
          typeof outputRange[i] === 'number' &&
          typeof outputRange[i + 1] === 'number'
        ) {
          return outputRange[i] + (outputRange[i + 1] - outputRange[i]) * ratio;
        }
        return outputRange[i];
      }
    }

    return outputRange[outputRange.length - 1];
  }

  interpolateColor(
    value: number,
    inputRange: number[],
    outputRange: string[]
  ): string {
    // 簡化的顏色插Value實現
    return this.interpolate(value, inputRange, outputRange);
  }

  // 性能Monitor
  getAnimationStats(): AnimationStats {
    this.stats.lastUpdateTime = Date.now();
    return { ...this.stats };
  }

  clearAnimationStats(): void {
    this.stats = {
      totalAnimations: 0,
      activeAnimations: 0,
      averageDuration: 0,
      performanceScore: 100,
      frameDrops: 0,
      memoryUsage: 0,
      lastUpdateTime: Date.now(),
    };
  }

  // PrivateMethod
  private emitEvent(event: AnimationEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.warn('Animation event listener error:', error);
      }
    });
  }
}

export default AnimationService;
