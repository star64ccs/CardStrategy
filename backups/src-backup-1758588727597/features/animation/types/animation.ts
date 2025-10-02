// 動畫優化類型定義
export interface AnimationConfig {
  // 動畫類型
  type:
    | 'fade'
    | 'slide'
    | 'scale'
    | 'rotate'
    | 'bounce'
    | 'spring'
    | 'timing'
    | 'decay';

  // 動畫參數
  duration: number; // 動畫持續時間 (毫秒)
  delay: number; // 延遲時間 (毫秒)
  easing: EasingType; // 緩動函數

  // 動畫屬性
  from: AnimationValue;
  to: AnimationValue;

  // 高級選項
  useNativeDriver: boolean; // 是否使用原生驅動
  isInteraction: boolean; // 是否為交互動畫
  iterations: number; // 重複次數 (-1 為無限)
  loop: boolean; // 是否循環
}

export interface AnimationValue {
  opacity?: number;
  translateX?: number;
  translateY?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  rotate?: string;
  rotateX?: string;
  rotateY?: string;
  [key: string]: unknown;
}

export type EasingType =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'bounce'
  | 'elastic'
  | 'back'
  | 'quad'
  | 'cubic'
  | 'sin'
  | 'circle'
  | 'exp';

export interface AnimationState {
  config: AnimationConfig;
  isEnabled: boolean;
  isReduced: boolean; // 是否減少動畫
  performanceMode: 'high' | 'medium' | 'low';
  isLoading: boolean;
  error: string | null;
}

export interface AnimationPreset {
  id: string;
  name: string;
  description: string;
  config: AnimationConfig;
  category: 'entrance' | 'exit' | 'transition' | 'feedback' | 'loading';
}

export interface AnimationEvent {
  type:
    | 'animation_start'
    | 'animation_end'
    | 'animation_cancel'
    | 'performance_warning';
  animationId?: string;
  duration?: number;
  timestamp: number;
  data?: unknown;
}

export interface AnimationManager {
  // 動畫管理
  createAnimation(config: AnimationConfig): string;
  startAnimation(animationId: string): Promise<void>;
  stopAnimation(animationId: string): void;
  pauseAnimation(animationId: string): void;
  resumeAnimation(animationId: string): void;

  // 預設動畫
  getPresets(): AnimationPreset[];
  getPreset(presetId: string): AnimationPreset | null;
  createPreset(preset: Omit<AnimationPreset, 'id'>): string;

  // 性能管理
  setPerformanceMode(mode: 'high' | 'medium' | 'low'): void;
  enableReducedMotion(enabled: boolean): void;
  isReducedMotionEnabled(): boolean;

  // 事件管理
  addEventListener(listener: (event: AnimationEvent) => void): void;
  removeEventListener(listener: (event: AnimationEvent) => void): void;
}

// 動畫組件屬性
export interface AnimationProps {
  // 基本屬性
  animation?: AnimationConfig | string; // 可以是配置對象或預設ID
  delay?: number;
  duration?: number;
  easing?: EasingType;

  // 觸發條件
  trigger?:
    | 'mount'
    | 'unmount'
    | 'focus'
    | 'blur'
    | 'press'
    | 'hover'
    | 'scroll';
  threshold?: number; // 觸發閾值

  // 性能選項
  useNativeDriver?: boolean;
  isInteraction?: boolean;

  // 回調函數
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
  onAnimationCancel?: () => void;

  // 子組件
  children: React.ReactNode;
}

// 動畫工具類型
export interface AnimationTools {
  // 動畫創建工具
  createFadeAnimation(
    from: number,
    to: number,
    duration?: number
  ): AnimationConfig;
  createSlideAnimation(
    direction: 'left' | 'right' | 'up' | 'down',
    distance?: number
  ): AnimationConfig;
  createScaleAnimation(
    from: number,
    to: number,
    duration?: number
  ): AnimationConfig;
  createRotateAnimation(
    from: number,
    to: number,
    duration?: number
  ): AnimationConfig;
  createBounceAnimation(distance?: number, duration?: number): AnimationConfig;
  createSpringAnimation(
    to: AnimationValue,
    config?: SpringConfig
  ): AnimationConfig;

  // 動畫組合
  createSequence(animations: AnimationConfig[]): AnimationConfig;
  createParallel(animations: AnimationConfig[]): AnimationConfig;
  createStagger(
    animations: AnimationConfig[],
    staggerDelay?: number
  ): AnimationConfig;

  // 動畫插值
  interpolate(
    value: number,
    inputRange: number[],
    outputRange: unknown[]
  ): unknown;
  interpolateColor(
    value: number,
    inputRange: number[],
    outputRange: string[]
  ): string;

  // 性能監控
  getAnimationStats(): AnimationStats;
  clearAnimationStats(): void;
}

export interface SpringConfig {
  tension?: number;
  friction?: number;
  mass?: number;
  stiffness?: number;
  damping?: number;
  velocity?: number;
  overshootClamping?: boolean;
  restDisplacementThreshold?: number;
  restSpeedThreshold?: number;
}

// 動畫統計
export interface AnimationStats {
  totalAnimations: number;
  activeAnimations: number;
  averageDuration: number;
  performanceScore: number; // 0-100
  frameDrops: number;
  memoryUsage: number;
  lastUpdateTime: number;
}

// 預設動畫配置
export const DEFAULT_ANIMATION_PRESETS: AnimationPreset[] = [
  {
    id: 'fade-in',
    name: '淡入',
    description: '元素淡入動畫',
    category: 'entrance',
    config: {
      type: 'timing',
      duration: 300,
      delay: 0,
      easing: 'ease-out',
      from: { opacity: 0 },
      to: { opacity: 1 },
      useNativeDriver: true,
      isInteraction: false,
      iterations: 1,
      loop: false,
    },
  },
  {
    id: 'fade-out',
    name: '淡出',
    description: '元素淡出動畫',
    category: 'exit',
    config: {
      type: 'timing',
      duration: 300,
      delay: 0,
      easing: 'ease-in',
      from: { opacity: 1 },
      to: { opacity: 0 },
      useNativeDriver: true,
      isInteraction: false,
      iterations: 1,
      loop: false,
    },
  },
  {
    id: 'slide-in-left',
    name: '左滑入',
    description: '從左側滑入',
    category: 'entrance',
    config: {
      type: 'timing',
      duration: 400,
      delay: 0,
      easing: 'ease-out',
      from: { translateX: -100, opacity: 0 },
      to: { translateX: 0, opacity: 1 },
      useNativeDriver: true,
      isInteraction: false,
      iterations: 1,
      loop: false,
    },
  },
  {
    id: 'slide-in-right',
    name: '右滑入',
    description: '從右側滑入',
    category: 'entrance',
    config: {
      type: 'timing',
      duration: 400,
      delay: 0,
      easing: 'ease-out',
      from: { translateX: 100, opacity: 0 },
      to: { translateX: 0, opacity: 1 },
      useNativeDriver: true,
      isInteraction: false,
      iterations: 1,
      loop: false,
    },
  },
  {
    id: 'scale-in',
    name: '縮放進入',
    description: '縮放進入動畫',
    category: 'entrance',
    config: {
      type: 'spring',
      duration: 500,
      delay: 0,
      easing: 'bounce',
      from: { scale: 0, opacity: 0 },
      to: { scale: 1, opacity: 1 },
      useNativeDriver: true,
      isInteraction: false,
      iterations: 1,
      loop: false,
    },
  },
  {
    id: 'bounce',
    name: '彈跳',
    description: '彈跳動畫',
    category: 'feedback',
    config: {
      type: 'spring',
      duration: 600,
      delay: 0,
      easing: 'bounce',
      from: { scale: 1 },
      to: { scale: 1.1 },
      useNativeDriver: true,
      isInteraction: true,
      iterations: 1,
      loop: false,
    },
  },
  {
    id: 'shake',
    name: '搖晃',
    description: '搖晃動畫',
    category: 'feedback',
    config: {
      type: 'timing',
      duration: 500,
      delay: 0,
      easing: 'ease-in-out',
      from: { translateX: 0 },
      to: { translateX: 0 },
      useNativeDriver: true,
      isInteraction: true,
      iterations: 3,
      loop: false,
    },
  },
  {
    id: 'pulse',
    name: '脈衝',
    description: '脈衝動畫',
    category: 'loading',
    config: {
      type: 'timing',
      duration: 1000,
      delay: 0,
      easing: 'ease-in-out',
      from: { opacity: 1 },
      to: { opacity: 0.3 },
      useNativeDriver: true,
      isInteraction: false,
      iterations: -1,
      loop: true,
    },
  },
];
