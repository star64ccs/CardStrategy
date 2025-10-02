// 設計系統類型定義
// 支持 WCAG 2.1 AA 標準的可訪問性設計系統

// 設計令牌類型
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

  // 狀態顏色
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

  // 行高
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
  // 過渡時間
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };

  // 緩動函數
  easing: {
    linear: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };

  // 動畫類型
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

// 動畫配置
export interface AnimationConfig {
  from: Record<string, any>;
  to: Record<string, any>;
  duration?: number;
  easing?: string;
  delay?: number;
}

// 響應式斷點
export interface Breakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

// 主題類型
export type ThemeType = 'light' | 'dark' | 'highContrast';

// 主題配置
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

// 組件庫類型
export interface ComponentLibrary {
  // 原子組件
  atoms: {
    Button: ComponentConfig;
    Input: ComponentConfig;
    Label: ComponentConfig;
    Icon: ComponentConfig;
    Badge: ComponentConfig;
  };

  // 分子組件
  molecules: {
    Card: ComponentConfig;
    Modal: ComponentConfig;
    Dropdown: ComponentConfig;
    Tabs: ComponentConfig;
    Alert: ComponentConfig;
  };

  // 有機體組件
  organisms: {
    Header: ComponentConfig;
    Footer: ComponentConfig;
    Navigation: ComponentConfig;
    Sidebar: ComponentConfig;
    Form: ComponentConfig;
  };

  // 模板組件
  templates: {
    Page: ComponentConfig;
    Layout: ComponentConfig;
    Dashboard: ComponentConfig;
  };
}

// 組件配置
export interface ComponentConfig {
  name: string;
  variants: Record<string, ComponentVariant>;
  defaultVariant: string;
  props: Record<string, PropConfig>;
}

// 組件變體
export interface ComponentVariant {
  name: string;
  styles: Record<string, any>;
  props?: Record<string, any>;
}

// 屬性配置
export interface PropConfig {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  default?: unknown;
  description?: string;
  options?: unknown[];
}

// 設計系統配置
export interface DesignSystemConfig {
  name: string;
  version: string;
  themes: Record<ThemeType, Theme>;
  components: ComponentLibrary;
  tokens: DesignToken[];
  accessibility: AccessibilityConfig;
}

// 可訪問性配置
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

  // 動畫偏好
  animationPreferences: {
    reduceMotion: boolean;
    prefersReducedMotion: boolean;
  };

  // 字體大小偏好
  fontSizePreferences: {
    minimum: number;
    maximum: number;
    step: number;
  };
}

// 設計系統狀態
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

// 主題切換事件
export interface ThemeChangeEvent {
  from: ThemeType;
  to: ThemeType;
  timestamp: number;
}

// 組件註冊事件
export interface ComponentRegisterEvent {
  componentName: string;
  config: ComponentConfig;
  timestamp: number;
}

// 設計令牌更新事件
export interface TokenUpdateEvent {
  tokenName: string;
  oldValue: string | number;
  newValue: string | number;
  timestamp: number;
}

// 可訪問性更新事件
export interface AccessibilityUpdateEvent {
  setting: string;
  oldValue: unknown;
  newValue: unknown;
  timestamp: number;
}

// 設計系統事件
export interface BaseDesignSystemEvent {
  type: string;
  timestamp: number;
}

export type DesignSystemEvent =
  | (ThemeChangeEvent & BaseDesignSystemEvent)
  | (ComponentRegisterEvent & BaseDesignSystemEvent)
  | (TokenUpdateEvent & BaseDesignSystemEvent)
  | (AccessibilityUpdateEvent & BaseDesignSystemEvent);

// 設計系統服務接口
export interface DesignSystemService {
  // 主題管理
  getCurrentTheme(): ThemeType;
  setTheme(theme: ThemeType): void;
  getTheme(theme: ThemeType): Theme;
  getAllThemes(): Record<ThemeType, Theme>;

  // 組件管理
  registerComponent(name: string, config: ComponentConfig): void;
  getComponent(name: string): ComponentConfig | null;
  getAllComponents(): ComponentLibrary;
  updateComponent(name: string, config: Partial<ComponentConfig>): void;

  // 令牌管理
  getToken(name: string): DesignToken | null;
  getAllTokens(): DesignToken[];
  updateToken(name: string, value: string | number): void;
  addToken(token: DesignToken): void;

  // 可訪問性管理
  getAccessibilityConfig(): AccessibilityConfig;
  updateAccessibilityConfig(config: Partial<AccessibilityConfig>): void;
  checkContrastRatio(color1: string, color2: string): number;
  isAccessible(
    foreground: string,
    background: string,
    size?: 'normal' | 'large'
  ): boolean;

  // 事件管理
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
