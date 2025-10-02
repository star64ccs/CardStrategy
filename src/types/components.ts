// 基礎ComponentClass型定義
import type { CSSProperties, ReactNode } from 'react';

import type { ThemeType } from './designSystem';

// 基礎ComponentProperty
export interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean;
  role?: string;
  tabIndex?: number;
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
}

// Component尺寸
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'small';

// Component變體
export type ComponentVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'
  | 'outline'
  | 'ghost';

// ComponentStatus
export type ComponentState =
  | 'default'
  | 'hover'
  | 'active'
  | 'focus'
  | 'disabled'
  | 'loading';

// Button Component
export interface ButtonProps extends BaseComponentProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  state?: ComponentState;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  href?: string;
  target?: string;
  rel?: string;
  form?: string;
  name?: string;
  value?: string;
}

// Input Component
export interface InputProps
  extends Omit<BaseComponentProps, 'onKeyDown' | 'onFocus' | 'onBlur'> {
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'url'
    | 'search'
    | 'date'
    | 'time'
    | 'datetime-local';
  variant?: ComponentVariant;
  size?: ComponentSize;
  state?: ComponentState;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  name?: string;
  id?: string;
  form?: string;
  list?: string;
  step?: number;
  min?: number;
  max?: number;
  multiple?: boolean;
  accept?: string;
  capture?: string;
  onChange?: (
    value: string,
    event?: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyPress?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onInput?: (event: React.FormEvent<HTMLInputElement>) => void;
  onInvalid?: (event: React.FormEvent<HTMLInputElement>) => void;
  onSelect?: (event: React.SyntheticEvent<HTMLInputElement>) => void;
  onCut?: (event: React.ClipboardEvent<HTMLInputElement>) => void;
  onCopy?: (event: React.ClipboardEvent<HTMLInputElement>) => void;
  onPaste?: (event: React.ClipboardEvent<HTMLInputElement>) => void;
  onCompositionStart?: (
    event: React.CompositionEvent<HTMLInputElement>
  ) => void;
  onCompositionEnd?: (event: React.CompositionEvent<HTMLInputElement>) => void;
  onCompositionUpdate?: (
    event: React.CompositionEvent<HTMLInputElement>
  ) => void;
  error?: string;
  helperText?: string;
  label?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  onIconClick?: () => void;
}

// Card Component
export interface CardProps extends BaseComponentProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  padding?: ComponentSize;
  margin?: ComponentSize;
  border?: boolean;
  borderRadius?: ComponentSize;
  hoverable?: boolean;
  clickable?: boolean;
  loading?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  media?: ReactNode;
  actions?: ReactNode;
  onCardClick?: () => void;
}

// Modal Component
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: ComponentVariant;
  title?: string;
  subtitle?: string;
  closeButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
  centered?: boolean;
  fullScreen?: boolean;
  animation?: 'fade' | 'slide' | 'scale' | 'none';
  animationDuration?: number;
  zIndex?: number;
  header?: ReactNode;
  footer?: ReactNode;
  body?: ReactNode;
  overlay?: ReactNode;
  onOpen?: () => void;
  onOpened?: () => void;
  onClosed?: () => void;
}

// Navigation Component
export interface NavigationProps extends BaseComponentProps {
  variant?: 'horizontal' | 'vertical' | 'tabs' | 'breadcrumb' | 'pagination';
  size?: ComponentSize;
  items: NavigationItem[];
  activeItem?: string;
  onItemClick?: (item: NavigationItem) => void;
  collapsible?: boolean;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  responsive?: boolean;
  mobileMenu?: boolean;
  logo?: ReactNode;
  actions?: ReactNode;
}

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
  children?: NavigationItem[];
  onClick?: () => void;
}

// Loading Component
export interface LoadingProps extends BaseComponentProps {
  variant?: 'spinner' | 'dots' | 'bars' | 'pulse' | 'skeleton';
  size?: ComponentSize;
  color?: string;
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  zIndex?: number;
  duration?: number;
  loop?: boolean;
}

// Toast Component
export interface ToastProps extends BaseComponentProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message?: string;
  duration?: number;
  closable?: boolean;
  action?: ReactNode;
  icon?: ReactNode;
  position?:
    | 'top-left'
    | 'top-right'
    | 'top-center'
    | 'bottom-left'
    | 'bottom-right'
    | 'bottom-center';
  onClose?: () => void;
  onAction?: () => void;
}

// Toast Manage器
export interface ToastManagerProps {
  toasts: ToastProps[];
  position?: ToastProps['position'];
  maxToasts?: number;
  onRemove?: (id: string) => void;
}

// ComponentThemeConfigure
export interface ComponentThemeConfig {
  theme: ThemeType;
  variant: ComponentVariant;
  size: ComponentSize;
  state: ComponentState;
}

// Component樣式Configure
export interface ComponentStyleConfig {
  base: CSSProperties;
  variants: Record<ComponentVariant, CSSProperties>;
  sizes: Record<ComponentSize, CSSProperties>;
  states: Record<ComponentState, CSSProperties>;
}

// ComponentEvent
export interface ComponentEvent {
  type: string;
  component: string;
  action: string;
  data?: unknown;
  timestamp: number;
}

// ComponentRegisterConfigure
export interface ComponentRegistration {
  name: string;
  component: React.ComponentType<any>;
  props: Record<string, any>;
  theme: ComponentThemeConfig;
  style: ComponentStyleConfig;
  accessibility: {
    role?: string;
    ariaLabel?: string;
    keyboardSupport?: boolean;
    focusManagement?: boolean;
  };
}

// ComponentLibraryConfigure
export interface ComponentLibraryConfig {
  components: Record<string, ComponentRegistration>;
  themes: Record<ThemeType, Record<string, ComponentStyleConfig>>;
  globalStyles: CSSProperties;
  breakpoints: Record<string, number>;
  spacing: Record<ComponentSize, number>;
  typography: Record<ComponentSize, CSSProperties>;
}
