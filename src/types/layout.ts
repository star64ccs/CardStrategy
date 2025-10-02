// 佈局系統Class型定義

// Response式斷點Class型
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

// 斷點Configure
export interface BreakpointConfig {
  xs: number; // 0-575px
  sm: number; // 576-767px
  md: number; // 768-991px
  lg: number; // 992-1199px
  xl: number; // 1200-1399px
  xxl: number; // 1400px+
}

// Response式ValueClass型
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

// 基礎佈局ComponentProperty
export interface BaseLayoutProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}

// Container ComponentProperty
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

// Grid ComponentProperty
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

// Grid Item ComponentProperty
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

// Flex ComponentProperty
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

// Stack ComponentProperty
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

// ResponsiveProvider ComponentProperty
export interface ResponsiveProviderProps {
  children: React.ReactNode;
  breakpoints?: Partial<BreakpointConfig>;
  defaultBreakpoint?: Breakpoint;
  onBreakpointChange?: (breakpoint: Breakpoint) => void;
}

// Response式Status
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

// Response式Event
export interface ResponsiveEvent {
  type: 'breakpointChange' | 'resize' | 'orientationChange';
  breakpoint: Breakpoint;
  previousBreakpoint?: Breakpoint;
  windowWidth: number;
  windowHeight: number;
  timestamp: number;
}

// 佈局ServiceInterface
export interface LayoutService {
  // Response式Manage
  getCurrentBreakpoint(): Breakpoint;
  getResponsiveValue<T>(value: ResponsiveValue<T>): T;
  isBreakpoint(breakpoint: Breakpoint): boolean;
  isAboveBreakpoint(breakpoint: Breakpoint): boolean;
  isBelowBreakpoint(breakpoint: Breakpoint): boolean;

  // EventManage
  onBreakpointChange(callback: (event: ResponsiveEvent) => void): () => void;
  onResize(callback: (event: ResponsiveEvent) => void): () => void;

  // ToolMethod
  getBreakpointConfig(): BreakpointConfig;
  getResponsiveState(): ResponsiveState;
}

// 佈局ComponentRegister
export interface LayoutComponentRegistration {
  name: string;
  category: 'container' | 'grid' | 'flex' | 'stack' | 'responsive';
  props: Record<string, any>;
  defaultProps?: Record<string, any>;
  variants?: string[];
  responsive?: boolean;
  accessible?: boolean;
}

// 佈局系統Configure
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

// 佈局系統Status
export interface LayoutSystemState {
  responsive: ResponsiveState;
  components: Record<string, LayoutComponentRegistration>;
  config: LayoutSystemConfig;
  isLoading: boolean;
  error: string | null;
}

// 佈局系統Event
export interface LayoutSystemEvent {
  type: 'componentRegister' | 'breakpointChange' | 'configUpdate' | 'error';
  componentName?: string;
  breakpoint?: Breakpoint;
  config?: Partial<LayoutSystemConfig>;
  error?: string;
  timestamp: number;
}
