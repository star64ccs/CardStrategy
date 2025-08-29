// 響應式組件類型定義

import type { Breakpoint, ResponsiveValue } from './layout';

// 響應式圖片組件屬性
export interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: ResponsiveValue<string>;
  srcSet?: ResponsiveValue<string>;
  width?: ResponsiveValue<number | string>;
  height?: ResponsiveValue<number | string>;
  aspectRatio?: ResponsiveValue<string>;
  objectFit?: ResponsiveValue<
    'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  >;
  objectPosition?: ResponsiveValue<string>;
  lazy?: boolean;
  placeholder?: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

// 響應式表格組件屬性
export interface ResponsiveTableProps {
  data: unknown[];
  columns: ResponsiveTableColumn[];
  sortable?: boolean;
  pagination?: ResponsiveTablePagination;
  searchable?: boolean;
  selectable?: boolean;
  responsive?: ResponsiveTableResponsive;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

export interface ResponsiveTableColumn {
  key: string;
  title: string;
  dataIndex: string;
  width?: ResponsiveValue<string | number>;
  minWidth?: ResponsiveValue<string | number>;
  maxWidth?: ResponsiveValue<string | number>;
  align?: ResponsiveValue<'left' | 'center' | 'right'>;
  sortable?: boolean;
  render?: (value: unknown, record: unknown, index: number) => React.ReactNode;
  responsive?: ResponsiveValue<boolean>;
  priority?: ResponsiveValue<number>;
}

export interface ResponsiveTablePagination {
  current: number;
  pageSize: ResponsiveValue<number>;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => string;
  onChange?: (page: number, pageSize: number) => void;
}

export interface ResponsiveTableResponsive {
  breakpoint: Breakpoint;
  scroll?: boolean;
  columns?: string[];
  transform?: (data: unknown[]) => any[];
}

// 響應式表單組件屬性
export interface ResponsiveFormProps {
  layout?: ResponsiveValue<'horizontal' | 'vertical' | 'inline'>;
  labelCol?: ResponsiveValue<{ span: number; offset?: number }>;
  wrapperCol?: ResponsiveValue<{ span: number; offset?: number }>;
  labelAlign?: ResponsiveValue<'left' | 'right'>;
  colon?: boolean;
  requiredMark?: boolean | 'optional';
  scrollToFirstError?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  children: React.ReactNode;
  onSubmit?: (values: unknown) => void;
  onValuesChange?: (changedValues: unknown, allValues: unknown) => void;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

export interface ResponsiveFormItemProps {
  label?: React.ReactNode;
  name?: string | string[];
  rules?: ResponsiveFormRule[];
  validateStatus?: 'success' | 'warning' | 'error' | 'validating';
  help?: React.ReactNode;
  extra?: React.ReactNode;
  required?: boolean;
  hidden?: ResponsiveValue<boolean>;
  span?: ResponsiveValue<number>;
  offset?: ResponsiveValue<number>;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

export interface ResponsiveFormRule {
  required?: boolean;
  message?: string;
  pattern?: RegExp;
  min?: number;
  max?: number;
  len?: number;
  type?:
    | 'string'
    | 'number'
    | 'boolean'
    | 'method'
    | 'regexp'
    | 'integer'
    | 'float'
    | 'object'
    | 'enum'
    | 'date'
    | 'url'
    | 'hex'
    | 'email';
  validator?: (rule: unknown, value: unknown) => Promise<void> | void;
}

// 響應式導航組件屬性
export interface ResponsiveNavigationProps {
  mode?: ResponsiveValue<'horizontal' | 'vertical' | 'inline'>;
  theme?: ResponsiveValue<'light' | 'dark'>;
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  openKeys?: string[];
  defaultOpenKeys?: string[];
  items: ResponsiveNavigationItem[];
  collapsed?: ResponsiveValue<boolean>;
  collapsedWidth?: ResponsiveValue<number>;
  trigger?: React.ReactNode;
  onSelect?: (selectedKeys: string[]) => void;
  onOpenChange?: (openKeys: string[]) => void;
  onCollapse?: (collapsed: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

export interface ResponsiveNavigationItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  children?: ResponsiveNavigationItem[];
  responsive?: ResponsiveValue<boolean>;
  priority?: ResponsiveValue<number>;
}

// 響應式卡片組件屬性（擴展現有Card組件）
export interface ResponsiveCardProps {
  // 基礎屬性
  title?: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;

  // 響應式佈局
  layout?: ResponsiveValue<'vertical' | 'horizontal'>;
  imagePosition?: ResponsiveValue<'top' | 'bottom' | 'left' | 'right'>;
  imageRatio?: ResponsiveValue<string>;

  // 響應式尺寸
  size?: ResponsiveValue<'small' | 'default' | 'large'>;
  width?: ResponsiveValue<string | number>;
  height?: ResponsiveValue<string | number>;
  minWidth?: ResponsiveValue<string | number>;
  maxWidth?: ResponsiveValue<string | number>;

  // 響應式間距
  padding?: ResponsiveValue<string | number>;
  margin?: ResponsiveValue<string | number>;
  gap?: ResponsiveValue<string | number>;

  // 響應式顯示
  showHeader?: ResponsiveValue<boolean>;
  showImage?: ResponsiveValue<boolean>;
  showActions?: ResponsiveValue<boolean>;
  showFooter?: ResponsiveValue<boolean>;

  // 響應式內容
  contentCollapse?: ResponsiveValue<boolean>;
  contentMaxHeight?: ResponsiveValue<string | number>;
  showExpandButton?: ResponsiveValue<boolean>;

  // 其他屬性
  hoverable?: boolean;
  bordered?: boolean;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

// 響應式測試工具類型
export interface ResponsiveTestConfig {
  breakpoints: Record<Breakpoint, number>;
  devices: ResponsiveTestDevice[];
  orientations: ('portrait' | 'landscape')[];
  userAgents: string[];
}

export interface ResponsiveTestDevice {
  name: string;
  width: number;
  height: number;
  userAgent: string;
  pixelRatio: number;
  touch: boolean;
}

export interface ResponsiveTestResult {
  component: string;
  device: string;
  breakpoint: Breakpoint;
  orientation: string;
  passed: boolean;
  issues: string[];
  screenshots?: string[];
  performance: {
    renderTime: number;
    memoryUsage: number;
    interactionTime: number;
  };
}

// 響應式組件註冊
export interface ResponsiveComponentRegistration {
  name: string;
  category: 'image' | 'table' | 'form' | 'navigation' | 'card' | 'other';
  responsive: boolean;
  breakpoints: Breakpoint[];
  props: Record<string, any>;
  defaultProps?: Record<string, any>;
  variants?: string[];
  accessible?: boolean;
  performance?: {
    renderTime: number;
    memoryUsage: number;
    bundleSize: number;
  };
}

// 響應式組件事件
export interface ResponsiveComponentEvent {
  type:
    | 'componentRender'
    | 'breakpointChange'
    | 'performanceIssue'
    | 'accessibilityIssue';
  componentName: string;
  breakpoint: Breakpoint;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  timestamp: number;
  data?: unknown;
}

// 響應式組件服務接口
export interface ResponsiveComponentService {
  // 組件管理
  registerComponent(component: ResponsiveComponentRegistration): void;
  getComponent(name: string): ResponsiveComponentRegistration | null;
  getAllComponents(): ResponsiveComponentRegistration[];

  // 響應式測試
  testComponent(
    componentName: string,
    config: ResponsiveTestConfig
  ): Promise<ResponsiveTestResult[]>;
  generateTestReport(results: ResponsiveTestResult[]): string;

  // 性能監控
  trackPerformance(
    componentName: string,
    breakpoint: Breakpoint,
    metrics: unknown
  ): void;
  getPerformanceReport(componentName?: string): unknown;

  // 事件管理
  onComponentEvent(
    callback: (event: ResponsiveComponentEvent) => void
  ): () => void;
  emitEvent(event: ResponsiveComponentEvent): void;
}
