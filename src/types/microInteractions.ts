// 微交互系統Class型定義

// 微交互Class型枚舉
export enum MicroInteractionType {
  BUTTON_CLICK = 'button_click',
  FORM_VALIDATION = 'form_validation',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
  PAGE_TRANSITION = 'page_transition',
  LIST_ANIMATION = 'list_animation',
  HOVER = 'hover',
  FOCUS = 'focus',
  SCROLL = 'scroll',
  DRAG = 'drag',
  SWIPE = 'swipe',
  PINCH = 'pinch',
  ROTATE = 'rotate',
}

// 微交互觸發器Class型
export enum TriggerType {
  CLICK = 'click',
  HOVER = 'hover',
  FOCUS = 'focus',
  SCROLL = 'scroll',
  DRAG = 'drag',
  SWIPE = 'swipe',
  PINCH = 'pinch',
  ROTATE = 'rotate',
  AUTO = 'auto',
  CUSTOM = 'custom',
}

// 微交互Status枚舉
export enum MicroInteractionStatus {
  IDLE = 'idle',
  TRIGGERED = 'triggered',
  PLAYING = 'playing',
  COMPLETED = 'completed',
  ERROR = 'error',
  DISABLED = 'disabled',
}

// 微交互可訪問性Configure
export interface MicroInteractionAccessibility {
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardOnly: boolean;
  focusIndicator: boolean;
  highContrast: boolean;
  voiceControl: boolean;
}

// 微交互StatusObject
export interface MicroInteractionState {
  id: string;
  type: MicroInteractionType;
  status: MicroInteractionStatus;
  config: MicroInteractionConfig;
  performance: MicroInteractionPerformance;
  accessibility: MicroInteractionAccessibility;
  isActive: boolean;
  startTime?: number;
  endTime?: number;
  duration?: number;
  error?: string;
}

// 微交互Configure
export interface MicroInteractionConfig {
  id: string;
  type: MicroInteractionType;
  trigger: TriggerType;
  duration: number;
  delay?: number;
  easing?: string;
  direction?: 'forward' | 'reverse' | 'alternate';
  iterations?: number;
  autoPlay?: boolean;
  disabled?: boolean;
  accessibility?: {
    reducedMotion?: boolean;
    screenReader?: boolean;
    keyboardOnly?: boolean;
  };
  performance?: {
    useTransform?: boolean;
    useOpacity?: boolean;
    useWillChange?: boolean;
    throttleScroll?: boolean;
  };
  custom?: Record<string, any>;
}

// 按鈕點擊動畫Configure
export interface ButtonClickConfig extends MicroInteractionConfig {
  type: MicroInteractionType.BUTTON_CLICK;
  ripple?: {
    enabled: boolean;
    color?: string;
    duration?: number;
    scale?: number;
  };
  scale?: {
    enabled: boolean;
    scale?: number;
    duration?: number;
  };
  shadow?: {
    enabled: boolean;
    intensity?: number;
    duration?: number;
  };
}

// Table單Verify動畫Configure
export interface FormValidationConfig extends MicroInteractionConfig {
  type: MicroInteractionType.FORM_VALIDATION;
  success?: {
    icon?: string;
    color?: string;
    duration?: number;
    shake?: boolean;
  };
  error?: {
    icon?: string;
    color?: string;
    duration?: number;
    shake?: boolean;
    shakeIntensity?: number;
  };
  warning?: {
    icon?: string;
    color?: string;
    duration?: number;
    pulse?: boolean;
  };
}

// 加載動畫Configure
export interface LoadingConfig extends MicroInteractionConfig {
  type: MicroInteractionType.LOADING;
  spinner?: {
    type: 'circular' | 'linear' | 'dots' | 'pulse' | 'wave';
    size?: number;
    color?: string;
    thickness?: number;
  };
  skeleton?: {
    enabled: boolean;
    rows?: number;
    height?: number;
    borderRadius?: number;
  };
  progress?: {
    enabled: boolean;
    type: 'determinate' | 'indeterminate';
    value?: number;
    color?: string;
  };
}

// Success/Error動畫Configure
export interface FeedbackConfig extends MicroInteractionConfig {
  type: MicroInteractionType.SUCCESS | MicroInteractionType.ERROR;
  icon?: {
    enabled: boolean;
    name?: string;
    size?: number;
    color?: string;
    animation?: 'bounce' | 'pulse' | 'shake' | 'rotate';
  };
  message?: {
    enabled: boolean;
    text?: string;
    duration?: number;
    position?: 'top' | 'bottom' | 'center';
  };
  background?: {
    enabled: boolean;
    color?: string;
    opacity?: number;
    blur?: boolean;
  };
}

// 頁面Switch動畫Configure
export interface PageTransitionConfig extends MicroInteractionConfig {
  type: MicroInteractionType.PAGE_TRANSITION;
  enter?: {
    animation: 'fade' | 'slide' | 'scale' | 'flip' | 'zoom';
    direction?: 'left' | 'right' | 'up' | 'down';
    duration?: number;
    easing?: string;
  };
  exit?: {
    animation: 'fade' | 'slide' | 'scale' | 'flip' | 'zoom';
    direction?: 'left' | 'right' | 'up' | 'down';
    duration?: number;
    easing?: string;
  };
  overlay?: {
    enabled: boolean;
    color?: string;
    opacity?: number;
    blur?: boolean;
  };
}

// List動畫Configure
export interface ListAnimationConfig extends MicroInteractionConfig {
  type: MicroInteractionType.LIST_ANIMATION;
  stagger?: {
    enabled: boolean;
    delay?: number;
    easing?: string;
  };
  enter?: {
    animation: 'fade' | 'slide' | 'scale' | 'bounce' | 'flip';
    direction?: 'left' | 'right' | 'up' | 'down';
    duration?: number;
    easing?: string;
  };
  exit?: {
    animation: 'fade' | 'slide' | 'scale' | 'bounce' | 'flip';
    direction?: 'left' | 'right' | 'up' | 'down';
    duration?: number;
    easing?: string;
  };
  reorder?: {
    enabled: boolean;
    animation: 'slide' | 'scale' | 'flip';
    duration?: number;
    easing?: string;
  };
}

// 微交互Status
export interface MicroInteractionState {
  id: string;
  type: MicroInteractionType;
  status: MicroInteractionStatus;
  config: MicroInteractionConfig;
  performance: MicroInteractionPerformance;
  accessibility: MicroInteractionAccessibility;
  isActive: boolean;
  startTime?: number;
  endTime?: number;
  duration?: number;
  error?: string;
}

// 微交互Event
export interface MicroInteractionEvent {
  id: string;
  type: MicroInteractionType;
  trigger: TriggerType;
  timestamp: number;
  data?: Record<string, any>;
}

// 微交互Manage器Configure
export interface MicroInteractionManagerConfig {
  enabled: boolean;
  performanceMode: boolean;
  accessibilityMode: boolean;
  debugMode: boolean;
  maxConcurrent: number;
  throttleDelay: number;
  defaultDuration: number;
  defaultEasing: string;
}

// 微交互性能指標
export interface MicroInteractionPerformance {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  frameCount: number;
  averageFPS: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

// 微交互Statistics
export interface MicroInteractionStats {
  totalInteractions: number;
  successfulInteractions: number;
  failedInteractions: number;
  averageDuration: number;
  performanceScore: number;
  accessibilityScore: number;
  userSatisfactionScore: number;
}

// React Component Props
export interface MicroInteractionProps {
  config: MicroInteractionConfig;
  children: React.ReactNode;
  onStart?: (event: MicroInteractionEvent) => void;
  onComplete?: (event: MicroInteractionEvent) => void;
  onError?: (error: string) => void;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

// 按鈕微交互 Props
export interface ButtonMicroInteractionProps extends MicroInteractionProps {
  config: ButtonClickConfig;
  onClick?: (event: React.MouseEvent) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  onMouseUp?: (event: React.MouseEvent) => void;
  onTouchStart?: (event: React.TouchEvent) => void;
  onTouchEnd?: (event: React.TouchEvent) => void;
}

// Table單微交互 Props
export interface FormMicroInteractionProps extends MicroInteractionProps {
  config: FormValidationConfig;
  validationState: 'idle' | 'validating' | 'success' | 'error' | 'warning';
  message?: string;
  onValidationChange?: (state: string, message?: string) => void;
}

// 加載微交互 Props
export interface LoadingMicroInteractionProps extends MicroInteractionProps {
  config: LoadingConfig;
  loading: boolean;
  progress?: number;
  message?: string;
  onComplete?: () => void;
}

// 反饋微交互 Props
export interface FeedbackMicroInteractionProps extends MicroInteractionProps {
  config: FeedbackConfig;
  show: boolean;
  message?: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

// 頁面Switch微交互 Props
export interface PageTransitionMicroInteractionProps
  extends MicroInteractionProps {
  config: PageTransitionConfig;
  in: boolean;
  onEnter?: () => void;
  onExit?: () => void;
  onEntered?: () => void;
  onExited?: () => void;
}

// List微交互 Props
export interface ListMicroInteractionProps extends MicroInteractionProps {
  config: ListAnimationConfig;
  items: unknown[];
  keyExtractor: (item: unknown, index: number) => string;
  renderItem: (item: unknown, index: number) => React.ReactNode;
  onItemEnter?: (item: unknown, index: number) => void;
  onItemExit?: (item: unknown, index: number) => void;
}

// Hook ReturnValue
export interface UseMicroInteractionReturn {
  trigger: (data?: Record<string, any>) => void;
  stop: () => void;
  reset: () => void;
  state: MicroInteractionState;
  progress: number;
  isPlaying: boolean;
  isCompleted: boolean;
  hasError: boolean;
  performance: MicroInteractionPerformance | null;
}

// 微交互ServiceInterface
export interface MicroInteractionServiceInterface {
  // 核心Method
  initialize(config: MicroInteractionManagerConfig): Promise<void>;
  register(config: MicroInteractionConfig): string;
  unregister(id: string): void;
  trigger(id: string, data?: Record<string, any>): Promise<void>;
  stop(id: string): void;
  reset(id: string): void;

  // BatchOperation
  triggerMultiple(ids: string[], data?: Record<string, any>): Promise<void>;
  stopAll(): void;
  resetAll(): void;

  // StatusQuery
  getState(id: string): MicroInteractionState | null;
  getProgress(id: string): number;
  isPlaying(id: string): boolean;
  isCompleted(id: string): boolean;
  hasError(id: string): boolean;

  // 性能Monitor
  getPerformance(id: string): MicroInteractionPerformance | null;
  getStats(): MicroInteractionStats;
  enablePerformanceMonitoring(enabled: boolean): void;

  // ConfigureManage
  updateConfig(id: string, config: Partial<MicroInteractionConfig>): void;
  getConfig(id: string): MicroInteractionConfig | null;

  // Event監聽
  on(event: string, callback: (data: unknown) => void): void;
  off(event: string, callback: (data: unknown) => void): void;

  // 清理
  destroy(): void;
}
