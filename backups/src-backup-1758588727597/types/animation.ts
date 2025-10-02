// 動畫系統類型定義
export interface AnimationConfig {
  // 基本動畫配置
  duration: number; // 動畫持續時間（毫秒）
  easing: EasingFunction; // 緩動函數
  delay?: number; // 延遲時間（毫秒）
  iterations?: number; // 重複次數，-1 表示無限循環
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'; // 動畫方向
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'; // 填充模式

  // 性能優化
  willChange?: boolean; // 是否啟用 will-change
  transform3d?: boolean; // 是否使用 3D 變換
  backfaceVisibility?: boolean; // 是否隱藏背面

  // 偏好設置
  respectMotionPreference?: boolean; // 是否尊重用戶的動畫偏好
  reducedMotion?: boolean; // 是否啟用減少動畫模式
}

export interface TransitionConfig extends AnimationConfig {
  // 過渡動畫特定配置
  property: string | string[]; // 要過渡的屬性
  from: unknown; // 起始值
  to: unknown; // 結束值

  // 觸發條件
  trigger?: 'hover' | 'focus' | 'click' | 'scroll' | 'load' | 'custom';
  threshold?: number; // 觸發閾值（用於滾動觸發）

  // 過渡效果
  stagger?: number; // 錯開時間（用於多元素）
  cascade?: boolean; // 是否級聯觸發
}

export interface KeyframeConfig {
  // 關鍵幀配置
  keyframes: Keyframe[]; // 關鍵幀數組
  name?: string; // 動畫名稱

  // 動畫配置
  config: AnimationConfig;

  // 自定義屬性
  customProperties?: Record<string, any>;
}

export interface Keyframe {
  offset: number; // 關鍵幀位置 (0-1)
  properties: Record<string, any>; // 屬性值
  easing?: EasingFunction; // 該關鍵幀的緩動函數
}

// 緩動函數類型
export type EasingFunction =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'cubic-bezier'
  | 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  | 'steps'
  | string
  | ((t: number) => number); // 自定義緩動函數

// 動畫性能監控
export interface PerformanceMonitoring {
  enabled: boolean;
  metrics: {
    fps: number;
    frameTime: number;
    droppedFrames: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

// 全局動畫配置
export interface GlobalAnimationConfig {
  defaultDuration: number;
  defaultEasing: EasingFunction;
  maxConcurrentAnimations: number;
  performanceThreshold: number;
  enablePerformanceMonitoring: boolean;
  enablePrefersReducedMotion: boolean;
}

// 動畫狀態
export interface AnimationState {
  // 動畫配置
  animations: Record<string, SingleAnimationState>;
  preferences: AnimationPreferences;
  performanceMonitoring: PerformanceMonitoring;
  presets: Record<string, AnimationConfig>;
  globalConfig: GlobalAnimationConfig;
  isInitialized: boolean;
  error: string | null;
}

// 單個動畫狀態
export interface SingleAnimationState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  progress: number;
  direction: 'forward' | 'reverse' | 'alternate' | 'alternate-reverse';
}

// 動畫事件
export interface AnimationEvent {
  type: 'start' | 'end' | 'pause' | 'resume' | 'cancel' | 'iteration';
  timestamp: number;
  animation: AnimationConfig;
  target?: HTMLElement;
}

// 動畫偏好設置
export interface AnimationPreferences {
  reducedMotion: boolean;
  prefersAnimation: boolean;
  animationDuration: 'fast' | 'normal' | 'slow';
  animationIntensity: 'minimal' | 'normal' | 'intense';
}

// 預設動畫配置
export interface PresetAnimation {
  name: string;
  config: AnimationConfig;
  description: string;
  category: 'entrance' | 'exit' | 'attention' | 'transition';
}

// 動畫性能指標
export interface AnimationPerformance {
  fps: number;
  frameTime: number;
  droppedFrames: number;
  memoryUsage: number;
  cpuUsage: number;
}

// 動畫管理器配置
export interface AnimationManagerConfig {
  maxConcurrentAnimations: number;
  performanceThreshold: number;
  enablePerformanceMonitoring: boolean;
  enablePrefersReducedMotion: boolean;
  defaultEasing: EasingFunction;
  defaultDuration: number;
}

// 動畫組件 Props
export interface AnimationProps {
  // 基本配置
  config?: Partial<AnimationConfig>;
  children: React.ReactNode;

  // 觸發條件
  trigger?: 'hover' | 'focus' | 'click' | 'scroll' | 'load' | 'custom';
  threshold?: number;

  // 回調函數
  onStart?: (event: AnimationEvent) => void;
  onEnd?: (event: AnimationEvent) => void;
  onPause?: (event: AnimationEvent) => void;
  onResume?: (event: AnimationEvent) => void;

  // 樣式
  className?: string;
  style?: React.CSSProperties;

  // 可訪問性
  'aria-label'?: string;
  'aria-describedby'?: string;
}

// 過渡組件 Props
export interface TransitionProps extends AnimationProps {
  // 過渡配置
  transition: TransitionConfig;

  // 狀態控制
  in?: boolean;
  appear?: boolean;
  unmountOnExit?: boolean;

  // 過渡階段
  onEnter?: (node: HTMLElement) => void;
  onEntering?: (node: HTMLElement) => void;
  onEntered?: (node: HTMLElement) => void;
  onExit?: (node: HTMLElement) => void;
  onExiting?: (node: HTMLElement) => void;
  onExited?: (node: HTMLElement) => void;
}

// 關鍵幀組件 Props
export interface KeyframeProps extends AnimationProps {
  // 關鍵幀配置
  keyframes: KeyframeConfig;

  // 播放控制
  autoPlay?: boolean;
  loop?: boolean;
  reverse?: boolean;

  // 時間控制
  startTime?: number;
  endTime?: number;

  // 性能優化
  optimizeForPerformance?: boolean;
  useTransform3d?: boolean;
}

// 動畫 Hook 返回值
export interface UseAnimationReturn {
  // 狀態
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  currentTime: number;

  // 控制方法
  play: () => void;
  pause: () => void;
  stop: () => void;
  reverse: () => void;
  restart: () => void;

  // 設置
  setProgress: (progress: number) => void;
  setSpeed: (speed: number) => void;

  // 事件
  onStart: (callback: (event: AnimationEvent) => void) => void;
  onEnd: (callback: (event: AnimationEvent) => void) => void;
  onPause: (callback: (event: AnimationEvent) => void) => void;
  onResume: (callback: (event: AnimationEvent) => void) => void;

  // 性能
  performance: AnimationPerformance;
}

// 動畫服務接口
export interface AnimationServiceInterface {
  // 基本操作
  createAnimation(config: AnimationConfig): string;
  playAnimation(id: string): Promise<void>;
  pauseAnimation(id: string): void;
  stopAnimation(id: string): void;

  // 批量操作
  playAll(): Promise<void>;
  pauseAll(): void;
  stopAll(): void;

  // 配置管理
  updateConfig(id: string, config: Partial<AnimationConfig>): void;
  getConfig(id: string): AnimationConfig | null;

  // 性能監控
  getPerformance(): AnimationPerformance;
  enablePerformanceMonitoring(enabled: boolean): void;

  // 偏好設置
  updatePreferences(preferences: Partial<AnimationPreferences>): void;
  getPreferences(): AnimationPreferences;

  // 預設動畫
  registerPreset(preset: PresetAnimation): void;
  getPreset(name: string): PresetAnimation | null;
  getAllPresets(): PresetAnimation[];

  // 事件監聽
  on(event: string, callback: (event: AnimationEvent) => void): void;
  off(event: string, callback: (event: AnimationEvent) => void): void;

  // 清理
  destroy(): void;
}
