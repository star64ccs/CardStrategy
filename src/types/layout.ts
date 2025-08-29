// 佈局系統類型定義

// 響應式斷點類型
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

// 斷點配置
export interface BreakpointConfig {
  xs: number; // 0-575px
  sm: number; // 576-767px
  md: number; // 768-991px
  lg: number; // 992-1199px
  xl: number; // 1200-1399px
  xxl: number; // 1400px+
}

// 響應式值類型
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

// 基礎佈局組件屬性
export interface BaseLayoutProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}

// Container 組件屬性
export interface ContainerProps extends BaseLayoutProps {
  maxWidth?: ResponsiveValue<'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full'>;
  fluid?: boolean;
  centered?: boolean;
  padding?: ResponsiveValue<string | number>;
  margin?: ResponsiveValue<string | number>;
  background?: string;
  border?: string;
  borderRadius?: ResponsiveValue<string | number>;
  shadow?: ResponsiveValue<'none' | 'sm' | 'md' | 'lg' | 'xl'>;
}

// Grid 組件屬性
export interface GridProps extends BaseLayoutProps {
  columns?: ResponsiveValue<number>;
  gap?: ResponsiveValue<string | number>;
  rowGap?: ResponsiveValue<string | number>;
  columnGap?: ResponsiveValue<string | number>;
  alignItems?: ResponsiveValue<
    'start' | 'center' | 'end' | 'stretch' | 'baseline'
  >;
  justifyItems?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch'>;
  alignContent?: ResponsiveValue<
    | 'start'
    | 'center'
    | 'end'
    | 'stretch'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
  >;
  justifyContent?: ResponsiveValue<
    | 'start'
    | 'center'
    | 'end'
    | 'stretch'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
  >;
  autoRows?: ResponsiveValue<string>;
  autoColumns?: ResponsiveValue<string>;
  templateRows?: ResponsiveValue<string>;
  templateColumns?: ResponsiveValue<string>;
  areas?: ResponsiveValue<string[]>;
}

// Grid Item 組件屬性
export interface GridItemProps extends BaseLayoutProps {
  column?: ResponsiveValue<number | string>;
  row?: ResponsiveValue<number | string>;
  columnSpan?: ResponsiveValue<number>;
  rowSpan?: ResponsiveValue<number>;
  area?: ResponsiveValue<string>;
  alignSelf?: ResponsiveValue<
    'start' | 'center' | 'end' | 'stretch' | 'baseline'
  >;
  justifySelf?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch'>;
  order?: ResponsiveValue<number>;
}

// Flex 組件屬性
export interface FlexProps extends BaseLayoutProps {
  direction?: ResponsiveValue<
    'row' | 'column' | 'row-reverse' | 'column-reverse'
  >;
  wrap?: ResponsiveValue<'nowrap' | 'wrap' | 'wrap-reverse'>;
  alignItems?: ResponsiveValue<
    'start' | 'center' | 'end' | 'stretch' | 'baseline'
  >;
  justifyContent?: ResponsiveValue<
    | 'start'
    | 'center'
    | 'end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
  >;
  alignContent?: ResponsiveValue<
    | 'start'
    | 'center'
    | 'end'
    | 'stretch'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
  >;
  gap?: ResponsiveValue<string | number>;
  flex?: ResponsiveValue<string | number>;
  grow?: ResponsiveValue<number>;
  shrink?: ResponsiveValue<number>;
  basis?: ResponsiveValue<string>;
  order?: ResponsiveValue<number>;
  alignSelf?: ResponsiveValue<
    'start' | 'center' | 'end' | 'stretch' | 'baseline'
  >;
}

// Stack 組件屬性
export interface StackProps extends BaseLayoutProps {
  direction?: ResponsiveValue<'vertical' | 'horizontal'>;
  spacing?: ResponsiveValue<string | number>;
  align?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch' | 'baseline'>;
  justify?: ResponsiveValue<
    | 'start'
    | 'center'
    | 'end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
  >;
  wrap?: ResponsiveValue<boolean>;
  divider?: React.ReactNode;
  dividerProps?: Record<string, any>;
}

// ResponsiveProvider 組件屬性
export interface ResponsiveProviderProps {
  children: React.ReactNode;
  breakpoints?: Partial<BreakpointConfig>;
  defaultBreakpoint?: Breakpoint;
  onBreakpointChange?: (breakpoint: Breakpoint) => void;
}

// 響應式狀態
export interface ResponsiveState {
  currentBreakpoint: Breakpoint;
  breakpoints: BreakpointConfig;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeScreen: boolean;
  windowWidth: number;
  windowHeight: number;
}

// 響應式事件
export interface ResponsiveEvent {
  type: 'breakpointChange' | 'resize' | 'orientationChange';
  breakpoint: Breakpoint;
  previousBreakpoint?: Breakpoint;
  windowWidth: number;
  windowHeight: number;
  timestamp: number;
}

// 佈局服務接口
export interface LayoutService {
  // 響應式管理
  getCurrentBreakpoint(): Breakpoint;
  getResponsiveValue<T>(value: ResponsiveValue<T>): T;
  isBreakpoint(breakpoint: Breakpoint): boolean;
  isAboveBreakpoint(breakpoint: Breakpoint): boolean;
  isBelowBreakpoint(breakpoint: Breakpoint): boolean;

  // 事件管理
  onBreakpointChange(callback: (event: ResponsiveEvent) => void): () => void;
  onResize(callback: (event: ResponsiveEvent) => void): () => void;

  // 工具方法
  getBreakpointConfig(): BreakpointConfig;
  getResponsiveState(): ResponsiveState;
}

// 佈局組件註冊
export interface LayoutComponentRegistration {
  name: string;
  category: 'container' | 'grid' | 'flex' | 'stack' | 'responsive';
  props: Record<string, any>;
  defaultProps?: Record<string, any>;
  variants?: string[];
  responsive?: boolean;
  accessible?: boolean;
}

// 佈局系統配置
export interface LayoutSystemConfig {
  breakpoints: BreakpointConfig;
  defaultBreakpoint: Breakpoint;
  enableResponsive: boolean;
  enableAccessibility: boolean;
  enableAnimations: boolean;
  containerMaxWidths: Record<string, string>;
  gridColumns: number;
  defaultSpacing: string;
  defaultGap: string;
}

// 佈局系統狀態
export interface LayoutSystemState {
  responsive: ResponsiveState;
  components: Record<string, LayoutComponentRegistration>;
  config: LayoutSystemConfig;
  isLoading: boolean;
  error: string | null;
}

// 佈局系統事件
export interface LayoutSystemEvent {
  type: 'componentRegister' | 'breakpointChange' | 'configUpdate' | 'error';
  componentName?: string;
  breakpoint?: Breakpoint;
  config?: Partial<LayoutSystemConfig>;
  error?: string;
  timestamp: number;
}
