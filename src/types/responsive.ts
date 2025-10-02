// Response式ComponentClass型定義

import type { Breakpoint, ResponsiveValue } from './layout';

// Response式Graph片ComponentProperty
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

// Response式Table格ComponentProperty
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

// Response式Table單ComponentProperty
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

// Response式導航ComponentProperty
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

// Response式卡片ComponentProperty（Extension現有CardComponent）
export interface ResponsiveCardProps {
  // 基礎Property
  title?: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;

  // Response式佈局
  layout?: ResponsiveValue<'vertical' | 'horizontal'>;
  imagePosition?: ResponsiveValue<'top' | 'bottom' | 'left' | 'right'>;
  imageRatio?: ResponsiveValue<string>;

  // Response式尺寸
  size?: ResponsiveValue<'small' | 'default' | 'large'>;
  width?: ResponsiveValue<string | number>;
  height?: ResponsiveValue<string | number>;
  minWidth?: ResponsiveValue<string | number>;
  maxWidth?: ResponsiveValue<string | number>;

  // Response式間距
  padding?: ResponsiveValue<string | number>;
  margin?: ResponsiveValue<string | number>;
  gap?: ResponsiveValue<string | number>;

  // Response式Show
  showHeader?: ResponsiveValue<boolean>;
  showImage?: ResponsiveValue<boolean>;
  showActions?: ResponsiveValue<boolean>;
  showFooter?: ResponsiveValue<boolean>;

  // Response式Content
  contentCollapse?: ResponsiveValue<boolean>;
  contentMaxHeight?: ResponsiveValue<string | number>;
  showExpandButton?: ResponsiveValue<boolean>;

  // 其他Property
  hoverable?: boolean;
  bordered?: boolean;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

// Response式TestToolClass型
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

// Response式ComponentRegister
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

// Response式ComponentEvent
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

// Response式ComponentServiceInterface
export interface ResponsiveComponentService {
  // ComponentManage
  registerComponent(component: ResponsiveComponentRegistration): void;
  getComponent(name: string): ResponsiveComponentRegistration | null;
  getAllComponents(): ResponsiveComponentRegistration[];

  // Response式Test
  testComponent(
    componentName: string,
    config: ResponsiveTestConfig
  ): Promise<ResponsiveTestResult[]>;
  generateTestReport(results: ResponsiveTestResult[]): string;

  // 性能Monitor
  trackPerformance(
    componentName: string,
    breakpoint: Breakpoint,
    metrics: unknown
  ): void;
  getPerformanceReport(componentName?: string): unknown;

  // EventManage
  onComponentEvent(
    callback: (event: ResponsiveComponentEvent) => void
  ): () => void;
  emitEvent(event: ResponsiveComponentEvent): void;
}
