// 動畫系統Class型定義
export interface AnimationConfig {
  // 基本動畫Configure
  duration: number; // 動畫持續Time（毫Second）
  easing: EasingFunction; // 緩動Function
  delay?: number; // 延遲Time（毫Second）
  iterations?: number; // Duplicate次數，-1 Table示無限循環
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'; // 動畫方向
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both'; // 填充模式

  // 性能優化
  willChange?: boolean; // YesNoEnable will-change
  transform3d?: boolean; // YesNo使用 3D 變換
  backfaceVisibility?: boolean; // YesNoHide背面

  // PreferencesSettings
  respectMotionPreference?: boolean; // YesNo尊重User的動畫Preferences
  reducedMotion?: boolean; // YesNoEnable減少動畫模式
}

export interface TransitionConfig extends AnimationConfig {
  // 過渡動畫SpecificConfigure
  property: string | string[]; // 要過渡的Property
  from: unknown; // 起始Value
  to: unknown; // EndValue

  // 觸發Condition
  trigger?: 'hover' | 'focus' | 'click' | 'scroll' | 'load' | 'custom';
  threshold?: number; // 觸發閾Value（用於滾動觸發）

  // 過渡效果
  stagger?: number; // 錯OnTime（用於多Element）
  cascade?: boolean; // YesNo級聯觸發
}

export interface KeyframeConfig {
  // OffKey幀Configure
  keyframes: Keyframe[]; // OffKey幀Array
  name?: string; // 動畫名稱

  // 動畫Configure
  config: AnimationConfig;

  // CustomProperty
  customProperties?: Record<string, any>;
}

export interface Keyframe {
  offset: number; // OffKey幀位置 (0-1)
  properties: Record<string, any>; // PropertyValue
  easing?: EasingFunction; // 該OffKey幀的緩動Function
}

// 緩動FunctionClass型
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
  | ((t: number) => number); // Custom緩動Function

// 動畫性能Monitor
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

// Global動畫Configure
export interface GlobalAnimationConfig {
  defaultDuration: number;
  defaultEasing: EasingFunction;
  maxConcurrentAnimations: number;
  performanceThreshold: number;
  enablePerformanceMonitoring: boolean;
  enablePrefersReducedMotion: boolean;
}

// 動畫Status
export interface AnimationState {
  // 動畫Configure
  animations: Record<string, SingleAnimationState>;
  preferences: AnimationPreferences;
  performanceMonitoring: PerformanceMonitoring;
  presets: Record<string, AnimationConfig>;
  globalConfig: GlobalAnimationConfig;
  isInitialized: boolean;
  error: string | null;
}

// Single動畫Status
export interface SingleAnimationState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  progress: number;
  direction: 'forward' | 'reverse' | 'alternate' | 'alternate-reverse';
}

// 動畫Event
export interface AnimationEvent {
  type: 'start' | 'end' | 'pause' | 'resume' | 'cancel' | 'iteration';
  timestamp: number;
  animation: AnimationConfig;
  target?: HTMLElement;
}

// 動畫PreferencesSettings
export interface AnimationPreferences {
  reducedMotion: boolean;
  prefersAnimation: boolean;
  animationDuration: 'fast' | 'normal' | 'slow';
  animationIntensity: 'minimal' | 'normal' | 'intense';
}

// 預設動畫Configure
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

// 動畫Manage器Configure
export interface AnimationManagerConfig {
  maxConcurrentAnimations: number;
  performanceThreshold: number;
  enablePerformanceMonitoring: boolean;
  enablePrefersReducedMotion: boolean;
  defaultEasing: EasingFunction;
  defaultDuration: number;
}

// 動畫Component Props
export interface AnimationProps {
  // 基本Configure
  config?: Partial<AnimationConfig>;
  children: React.ReactNode;

  // 觸發Condition
  trigger?: 'hover' | 'focus' | 'click' | 'scroll' | 'load' | 'custom';
  threshold?: number;

  // CallbackFunction
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

// 過渡Component Props
export interface TransitionProps extends AnimationProps {
  // 過渡Configure
  transition: TransitionConfig;

  // StatusControl
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

// OffKey幀Component Props
export interface KeyframeProps extends AnimationProps {
  // OffKey幀Configure
  keyframes: KeyframeConfig;

  // 播放Control
  autoPlay?: boolean;
  loop?: boolean;
  reverse?: boolean;

  // TimeControl
  startTime?: number;
  endTime?: number;

  // 性能優化
  optimizeForPerformance?: boolean;
  useTransform3d?: boolean;
}

// 動畫 Hook ReturnValue
export interface UseAnimationReturn {
  // Status
  isPlaying: boolean;
  isPaused: boolean;
  progress: number;
  currentTime: number;

  // ControlMethod
  play: () => void;
  pause: () => void;
  stop: () => void;
  reverse: () => void;
  restart: () => void;

  // Settings
  setProgress: (progress: number) => void;
  setSpeed: (speed: number) => void;

  // Event
  onStart: (callback: (event: AnimationEvent) => void) => void;
  onEnd: (callback: (event: AnimationEvent) => void) => void;
  onPause: (callback: (event: AnimationEvent) => void) => void;
  onResume: (callback: (event: AnimationEvent) => void) => void;

  // 性能
  performance: AnimationPerformance;
}

// 動畫ServiceInterface
export interface AnimationServiceInterface {
  // 基本Operation
  createAnimation(config: AnimationConfig): string;
  playAnimation(id: string): Promise<void>;
  pauseAnimation(id: string): void;
  stopAnimation(id: string): void;

  // BatchOperation
  playAll(): Promise<void>;
  pauseAll(): void;
  stopAll(): void;

  // ConfigureManage
  updateConfig(id: string, config: Partial<AnimationConfig>): void;
  getConfig(id: string): AnimationConfig | null;

  // 性能Monitor
  getPerformance(): AnimationPerformance;
  enablePerformanceMonitoring(enabled: boolean): void;

  // PreferencesSettings
  updatePreferences(preferences: Partial<AnimationPreferences>): void;
  getPreferences(): AnimationPreferences;

  // 預設動畫
  registerPreset(preset: PresetAnimation): void;
  getPreset(name: string): PresetAnimation | null;
  getAllPresets(): PresetAnimation[];

  // Event監聽
  on(event: string, callback: (event: AnimationEvent) => void): void;
  off(event: string, callback: (event: AnimationEvent) => void): void;

  // 清理
  destroy(): void;
}
