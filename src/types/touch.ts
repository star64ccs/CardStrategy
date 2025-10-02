// 觸控優化相OffClass型定義

// 觸控點Interface
export interface Touch {
  identifier: number;
  target: EventTarget;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  radiusX?: number;
  radiusY?: number;
  rotationAngle?: number;
  force?: number;
}

// 觸控手勢Class型
export type TouchGestureType =
  | 'tap'
  | 'doubleTap'
  | 'longPress'
  | 'swipe'
  | 'pinch'
  | 'rotate'
  | 'pan';

// 觸控手勢方向
export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

// 觸控手勢Configure
export interface TouchGestureConfig {
  type: TouchGestureType;
  enabled?: boolean;
  threshold?: number;
  timeout?: number;
  minDistance?: number;
  maxDistance?: number;
  minDuration?: number;
  maxDuration?: number;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

// 觸控EventData
export interface TouchEventData {
  type: TouchGestureType;
  x: number;
  y: number;
  deltaX?: number;
  deltaY?: number;
  scale?: number;
  rotation?: number;
  duration: number;
  timestamp: number;
  touches: Touch[];
  target: EventTarget | null;
}

// 觸控手勢ComponentProperty
export interface TouchGestureProps {
  children: React.ReactNode;
  onTap?: (event: TouchEventData) => void;
  onDoubleTap?: (event: TouchEventData) => void;
  onLongPress?: (event: TouchEventData) => void;
  onSwipe?: (direction: SwipeDirection, event: TouchEventData) => void;
  onPinch?: (scale: number, event: TouchEventData) => void;
  onRotate?: (rotation: number, event: TouchEventData) => void;
  onPan?: (deltaX: number, deltaY: number, event: TouchEventData) => void;
  config?: Partial<TouchGestureConfig>;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

// 觸控反饋Class型
export type TouchFeedbackType =
  | 'ripple'
  | 'scale'
  | 'opacity'
  | 'color'
  | 'custom';

// 觸控反饋Configure
export interface TouchFeedbackConfig {
  type: TouchFeedbackType;
  duration?: number;
  scale?: number;
  opacity?: number;
  color?: string;
  rippleColor?: string;
  rippleSize?: number;
  customAnimation?: string;
  disabled?: boolean;
}

// 觸控反饋ComponentProperty
export interface TouchFeedbackProps {
  children: React.ReactNode;
  feedback?: TouchFeedbackConfig;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

// 滾動優化Configure
export interface ScrollOptimizationConfig {
  enabled?: boolean;
  momentum?: boolean;
  bounce?: boolean;
  deceleration?: number;
  snapToInterval?: number;
  snapToAlignment?: 'start' | 'center' | 'end';
  showsHorizontalScrollIndicator?: boolean;
  showsVerticalScrollIndicator?: boolean;
  contentInset?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  scrollIndicatorInsets?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

// 滾動ComponentProperty
export interface OptimizedScrollViewProps {
  children: React.ReactNode;
  horizontal?: boolean;
  vertical?: boolean;
  optimization?: ScrollOptimizationConfig;
  onScroll?: (event: unknown) => void;
  onScrollBeginDrag?: () => void;
  onScrollEndDrag?: () => void;
  onMomentumScrollBegin?: () => void;
  onMomentumScrollEnd?: () => void;
  className?: string;
  style?: React.CSSProperties;
  contentContainerStyle?: React.CSSProperties;
  showsScrollIndicator?: boolean;
  scrollEnabled?: boolean;
  bounces?: boolean;
  alwaysBounceHorizontal?: boolean;
  alwaysBounceVertical?: boolean;
  automaticallyAdjustContentInsets?: boolean;
  automaticallyAdjustKeyboardInsets?: boolean;
  automaticallyAdjustScrollIndicatorInsets?: boolean;
  contentInsetAdjustmentBehavior?:
    | 'automatic'
    | 'scrollableAxes'
    | 'never'
    | 'always';
  directionalLockEnabled?: boolean;
  indicatorStyle?: 'default' | 'black' | 'white';
  keyboardDismissMode?: 'none' | 'on-drag' | 'interactive';
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  maintainVisibleContentPosition?: {
    minIndexForVisible?: number;
    autoscrollToTopThreshold?: number;
  };
  maximumZoomScale?: number;
  minimumZoomScale?: number;
  nestedScrollEnabled?: boolean;
  onContentSizeChange?: (width: number, height: number) => void;
  onLayout?: (event: unknown) => void;
  onScrollToTop?: () => void;
  pagingEnabled?: boolean;
  refreshControl?: React.ReactElement;
  removeClippedSubviews?: boolean;
  scrollEventThrottle?: number;
  scrollIndicatorInsets?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  scrollPerfTag?: string;
  scrollToOverflowEnabled?: boolean;
  scrollsToTop?: boolean;
  sendMomentumEvents?: boolean;
  snapToInterval?: number;
  snapToOffsets?: number[];
  snapToStart?: boolean;
  snapToEnd?: boolean;
  zoomScale?: number;
}

// 觸控TestConfigure
export interface TouchTestConfig {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  platform: 'ios' | 'android' | 'web';
  gestures: TouchGestureType[];
  feedbackTypes: TouchFeedbackType[];
  scrollOptimization: boolean;
  performance: boolean;
  accessibility: boolean;
}

// 觸控Test結果
export interface TouchTestResult {
  deviceType: string;
  platform: string;
  gestures: {
    [key in TouchGestureType]?: {
      success: boolean;
      latency: number;
      accuracy: number;
      error?: string;
    };
  };
  feedback: {
    [key in TouchFeedbackType]?: {
      success: boolean;
      duration: number;
      visualQuality: number;
      error?: string;
    };
  };
  scroll: {
    smoothness: number;
    responsiveness: number;
    momentum: boolean;
    bounce: boolean;
    error?: string;
  };
  performance: {
    fps: number;
    memoryUsage: number;
    cpuUsage: number;
    error?: string;
  };
  accessibility: {
    keyboardSupport: boolean;
    screenReaderSupport: boolean;
    focusManagement: boolean;
    error?: string;
  };
  overall: {
    score: number;
    recommendations: string[];
  };
}

// 觸控ServiceConfigure
export interface TouchServiceConfig {
  enableGestures: boolean;
  enableFeedback: boolean;
  enableScrollOptimization: boolean;
  enablePerformanceMonitoring: boolean;
  enableAccessibilitySupport: boolean;
  defaultConfig: {
    gestures: Partial<TouchGestureConfig>;
    feedback: Partial<TouchFeedbackConfig>;
    scroll: Partial<ScrollOptimizationConfig>;
  };
}

// 觸控ServiceEvent
export interface TouchServiceEvent {
  type: 'gesture' | 'feedback' | 'scroll' | 'performance' | 'accessibility';
  data: TouchEventData | TouchFeedbackConfig | ScrollOptimizationConfig | any;
  timestamp: number;
  source: string;
}

// 觸控ServiceInterface
export interface TouchService {
  // 手勢Manage
  registerGesture(componentId: string, config: TouchGestureConfig): void;
  unregisterGesture(componentId: string): void;
  getGestureConfig(componentId: string): TouchGestureConfig | null;

  // 反饋Manage
  registerFeedback(componentId: string, config: TouchFeedbackConfig): void;
  unregisterFeedback(componentId: string): void;
  getFeedbackConfig(componentId: string): TouchFeedbackConfig | null;

  // 滾動優化
  registerScroll(componentId: string, config: ScrollOptimizationConfig): void;
  unregisterScroll(componentId: string): void;
  getScrollConfig(componentId: string): ScrollOptimizationConfig | null;

  // Test功能
  runTouchTest(config: TouchTestConfig): Promise<TouchTestResult>;
  generateTestReport(results: TouchTestResult[]): string;

  // 性能Monitor
  trackPerformance(componentId: string, metrics: unknown): void;
  getPerformanceReport(): unknown;

  // EventManage
  onEvent(callback: (event: TouchServiceEvent) => void): void;
  emitEvent(event: TouchServiceEvent): void;

  // ConfigureManage
  updateConfig(config: Partial<TouchServiceConfig>): void;
  getConfig(): TouchServiceConfig;
}

// 觸控 Hook ReturnValue
export interface UseTouchReturn {
  // 手勢Status
  isPressed: boolean;
  isHovered: boolean;
  isFocused: boolean;

  // 手勢Data
  gestureData: TouchEventData | null;
  lastGesture: TouchGestureType | null;

  // EventHandle器
  handlers: {
    onTouchStart: (event: React.TouchEvent) => void;
    onTouchMove: (event: React.TouchEvent) => void;
    onTouchEnd: (event: React.TouchEvent) => void;
    onMouseDown: (event: React.MouseEvent) => void;
    onMouseMove: (event: React.MouseEvent) => void;
    onMouseUp: (event: React.MouseEvent) => void;
    onKeyDown: (event: React.KeyboardEvent) => void;
    onKeyUp: (event: React.KeyboardEvent) => void;
  };

  // ToolFunction
  utils: {
    isTouchDevice: () => boolean;
    getTouchPoint: (event: React.TouchEvent | React.MouseEvent) => {
      x: number;
      y: number;
    };
    calculateDistance: (
      point1: { x: number; y: number },
      point2: { x: number; y: number }
    ) => number;
    calculateAngle: (
      point1: { x: number; y: number },
      point2: { x: number; y: number }
    ) => number;
  };
}

// 觸控TestToolProperty
export interface TouchTestToolProps {
  config?: Partial<TouchTestConfig>;
  onTestComplete?: (results: TouchTestResult) => void;
  onTestError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
  visible?: boolean;
}
