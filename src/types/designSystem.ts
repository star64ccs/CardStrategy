// 設計系統Class型定義
// Support WCAG 2.1 AA Standard的可訪問性設計系統

// 設計令牌Class型
export interface DesignToken {
  name: string;
  value: string | number;
  category:
    | 'color'
    | 'typography'
    | 'spacing'
    | 'border'
    | 'shadow'
    | 'animation';
  description?: string;
  usage?: string[];
}

// 顏色調色板
export interface ColorPalette {
  // 背景顏色
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    overlay: string;
    card: string;
    modal: string;
  };

  // 文字顏色
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
    link: string;
  };

  // 品牌顏色
  brand: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };

  // 邊框顏色
  border: {
    primary: string;
    secondary: string;
    focus: string;
    disabled: string;
  };

  // 陰影顏色
  shadow: {
    light: string;
    medium: string;
    heavy: string;
    focus: string;
  };

  // Status顏色
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
    neutral: string;
  };

  // 稀有度顏色
  rarity: {
    common: string;
    uncommon: string;
    rare: string;
    mythic: string;
    special: string;
    promo: string;
  };
}

// 字體系統
export interface Typography {
  // 字體大小
  sizes: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
    '5xl': number;
    '6xl': number;
  };

  // 字體粗細
  weights: {
    thin: string;
    light: string;
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
    extrabold: string;
    black: string;
  };

  // Row高
  lineHeights: {
    none: number;
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };

  // 字體間距
  letterSpacing: {
    tighter: number;
    tight: number;
    normal: number;
    wide: number;
    wider: number;
    widest: number;
  };

  // 字體族
  fonts: {
    sans: string;
    serif: string;
    mono: string;
  };
}

// 間距系統
export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
  '5xl': number;
  '6xl': number;
}

// 邊框系統
export interface BorderRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  full: number;
}

// 陰影系統
export interface Shadow {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  focus: string;
}

// 動畫系統
export interface Animation {
  // 過渡Time
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };

  // 緩動Function
  easing: {
    linear: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };

  // 動畫Class型
  types: {
    fadeIn: AnimationConfig;
    fadeOut: AnimationConfig;
    slideUp: AnimationConfig;
    slideDown: AnimationConfig;
    slideLeft: AnimationConfig;
    slideRight: AnimationConfig;
    scaleIn: AnimationConfig;
    scaleOut: AnimationConfig;
    rotate: AnimationConfig;
  };
}

// 動畫Configure
export interface AnimationConfig {
  from: Record<string, any>;
  to: Record<string, any>;
  duration?: number;
  easing?: string;
  delay?: number;
}

// Response式斷點
export interface Breakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

// ThemeClass型
export type ThemeType = 'light' | 'dark' | 'highContrast';

// ThemeConfigure
export interface Theme {
  type: ThemeType;
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadow: Shadow;
  animation: Animation;
  breakpoints: Breakpoints;
}

// ComponentLibraryClass型
export interface ComponentLibrary {
  // 原子Component
  atoms: {
    Button: ComponentConfig;
    Input: ComponentConfig;
    Label: ComponentConfig;
    Icon: ComponentConfig;
    Badge: ComponentConfig;
  };

  // 分子Component
  molecules: {
    Card: ComponentConfig;
    Modal: ComponentConfig;
    Dropdown: ComponentConfig;
    Tabs: ComponentConfig;
    Alert: ComponentConfig;
  };

  // 有機體Component
  organisms: {
    Header: ComponentConfig;
    Footer: ComponentConfig;
    Navigation: ComponentConfig;
    Sidebar: ComponentConfig;
    Form: ComponentConfig;
  };

  // 模板Component
  templates: {
    Page: ComponentConfig;
    Layout: ComponentConfig;
    Dashboard: ComponentConfig;
  };
}

// ComponentConfigure
export interface ComponentConfig {
  name: string;
  variants: Record<string, ComponentVariant>;
  defaultVariant: string;
  props: Record<string, PropConfig>;
}

// Component變體
export interface ComponentVariant {
  name: string;
  styles: Record<string, any>;
  props?: Record<string, any>;
}

// PropertyConfigure
export interface PropConfig {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  default?: unknown;
  description?: string;
  options?: unknown[];
}

// 設計系統Configure
export interface DesignSystemConfig {
  name: string;
  version: string;
  themes: Record<ThemeType, Theme>;
  components: ComponentLibrary;
  tokens: DesignToken[];
  accessibility: AccessibilityConfig;
}

// 可訪問性Configure
export interface AccessibilityConfig {
  // 顏色對比度
  contrastRatios: {
    normal: number; // 4.5:1 for normal text
    large: number; // 3:1 for large text
    ui: number; // 3:1 for UI components
  };

  // 焦點指示器
  focusIndicator: {
    color: string;
    width: number;
    style: 'solid' | 'dashed' | 'dotted';
  };

  // 動畫Preferences
  animationPreferences: {
    reduceMotion: boolean;
    prefersReducedMotion: boolean;
  };

  // 字體大小Preferences
  fontSizePreferences: {
    minimum: number;
    maximum: number;
    step: number;
  };
}

// 設計系統Status
export interface DesignSystemState {
  currentTheme: ThemeType;
  themes: Record<ThemeType, Theme>;
  components: ComponentLibrary;
  tokens: DesignToken[];
  accessibility: AccessibilityConfig;
  isLoading: boolean;
  error: string | null;
}

// 設計系統動作
export interface DesignSystemAction {
  type: string;
  payload?: unknown;
}

// ThemeSwitchEvent
export interface ThemeChangeEvent {
  from: ThemeType;
  to: ThemeType;
  timestamp: number;
}

// ComponentRegisterEvent
export interface ComponentRegisterEvent {
  componentName: string;
  config: ComponentConfig;
  timestamp: number;
}

// 設計令牌UpdateEvent
export interface TokenUpdateEvent {
  tokenName: string;
  oldValue: string | number;
  newValue: string | number;
  timestamp: number;
}

// 可訪問性UpdateEvent
export interface AccessibilityUpdateEvent {
  setting: string;
  oldValue: unknown;
  newValue: unknown;
  timestamp: number;
}

// 設計系統Event
export interface BaseDesignSystemEvent {
  type: string;
  timestamp: number;
}

export type DesignSystemEvent =
  | (ThemeChangeEvent & BaseDesignSystemEvent)
  | (ComponentRegisterEvent & BaseDesignSystemEvent)
  | (TokenUpdateEvent & BaseDesignSystemEvent)
  | (AccessibilityUpdateEvent & BaseDesignSystemEvent);

// 設計系統ServiceInterface
export interface DesignSystemService {
  // ThemeManage
  getCurrentTheme(): ThemeType;
  setTheme(theme: ThemeType): void;
  getTheme(theme: ThemeType): Theme;
  getAllThemes(): Record<ThemeType, Theme>;

  // ComponentManage
  registerComponent(name: string, config: ComponentConfig): void;
  getComponent(name: string): ComponentConfig | null;
  getAllComponents(): ComponentLibrary;
  updateComponent(name: string, config: Partial<ComponentConfig>): void;

  // 令牌Manage
  getToken(name: string): DesignToken | null;
  getAllTokens(): DesignToken[];
  updateToken(name: string, value: string | number): void;
  addToken(token: DesignToken): void;

  // 可訪問性Manage
  getAccessibilityConfig(): AccessibilityConfig;
  updateAccessibilityConfig(config: Partial<AccessibilityConfig>): void;
  checkContrastRatio(color1: string, color2: string): number;
  isAccessible(
    foreground: string,
    background: string,
    size?: 'normal' | 'large'
  ): boolean;

  // EventManage
  subscribe(
    event: string,
    callback: (event: DesignSystemEvent) => void
  ): () => void;
  unsubscribe(
    event: string,
    callback: (event: DesignSystemEvent) => void
  ): void;
  emit(event: DesignSystemEvent): void;
}
