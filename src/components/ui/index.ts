// UI 組件庫索引
export { default as Button } from './Button';
export { default as Card } from './Card';
export { default as Input } from './Input';
export { default as Loading } from './Loading';
export { default as Modal } from './Modal';
export { default as Toast } from './Toast';

// 響應式組件
export { ResponsiveCard } from './ResponsiveCard';
export { ResponsiveForm, ResponsiveFormItem } from './ResponsiveForm';
export { ResponsiveImage } from './ResponsiveImage';
export { ResponsiveNavigation } from './ResponsiveNavigation';
export { ResponsiveTable } from './ResponsiveTable';
export { ResponsiveTestTool } from './ResponsiveTestTool';

// 觸控優化組件
export { OptimizedScrollView } from './OptimizedScrollView';
export { TouchFeedback } from './TouchFeedback';
export { TouchGesture } from './TouchGesture';
export { TouchTestTool } from './TouchTestTool';

// 可訪問性組件
export { AccessibilityTestTool } from './AccessibilityTestTool';
export { ComponentAccessibilityTestTool } from './ComponentAccessibilityTestTool';
export { FocusManager } from './FocusManager';
export { ScreenReader } from './ScreenReader';

// 重新導出類型
export type {
  BaseComponentProps,
  ButtonProps,
  CardProps,
  ComponentSize,
  ComponentState,
  ComponentVariant,
  InputProps,
  LoadingProps,
  ModalProps,
  ToastProps,
} from '../../types/components';

// 響應式組件類型
export type {
  ResponsiveCardProps,
  ResponsiveFormItemProps,
  ResponsiveFormProps,
  ResponsiveImageProps,
  ResponsiveNavigationProps,
  ResponsiveTableProps,
} from '../../types/responsive';

// 觸控組件類型
export type {
  OptimizedScrollViewProps,
  ScrollOptimizationConfig,
  SwipeDirection,
  TouchEventData,
  TouchFeedbackConfig,
  TouchFeedbackProps,
  TouchFeedbackType,
  TouchGestureConfig,
  TouchGestureProps,
  TouchGestureType,
  TouchTestConfig,
  TouchTestResult,
  TouchTestToolProps,
} from '../../types/touch';

// 可訪問性組件類型
export type {
  ARIAProps,
  AccessibilityComponentProps,
  AccessibilityConfig,
  AccessibilityEvent,
  AccessibilityIssue,
  AccessibilityProps,
  AccessibilityService,
  AccessibilityServiceConfig,
  AccessibilityServiceEvent,
  AccessibilityState,
  AccessibilitySuggestion,
  AccessibilityTestConfig,
  AccessibilityTestResult,
  AccessibilityTestToolProps,
  FocusManagerConfig,
  FocusManagerProps,
  FocusManagerState,
  KeyboardNavigationConfig,
  ScreenReaderConfig,
  ScreenReaderProps,
  UseAccessibilityReturn,
} from '../../types/accessibility';
