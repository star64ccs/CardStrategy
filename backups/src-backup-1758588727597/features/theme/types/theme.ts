// 主題類型定義
export interface ThemeColors {
  // 基礎顏色
  primary: string;
  secondary: string;
  accent: string;

  // 背景顏色
  background: string;
  surface: string;
  card: string;

  // 文字顏色
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };

  // 邊框顏色
  border: string;
  divider: string;

  // 狀態顏色
  success: string;
  warning: string;
  error: string;
  info: string;

  // 特殊顏色
  overlay: string;
  shadow: string;
  highlight: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeTypography {
  fontFamily: {
    regular: string;
    medium: string;
    bold: string;
    mono: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface ThemeBorderRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface ThemeShadows {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface Theme {
  id: string;
  name: string;
  type: 'light' | 'dark' | 'auto';
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
}

export interface ThemeConfig {
  defaultTheme: string;
  availableThemes: string[];
  autoThemeEnabled: boolean;
  systemThemeDetection: boolean;
  themePersistence: boolean;
}

export interface ThemeState {
  currentTheme: Theme;
  availableThemes: Theme[];
  config: ThemeConfig;
  isAutoTheme: boolean;
  systemTheme: 'light' | 'dark';
  isLoading: boolean;
  error: string | null;
}

export interface ThemeChangeRequest {
  themeId: string;
  persist?: boolean;
}

export interface ThemePreview {
  theme: Theme;
  preview: string; // Base64 encoded preview image
}

export interface ThemeCustomization {
  themeId: string;
  customizations: Partial<ThemeColors>;
}

export interface ThemeEvent {
  type: 'theme_changed' | 'theme_loaded' | 'theme_error';
  themeId?: string;
  timestamp: number;
  data?: unknown;
}

export interface ThemeManager {
  getCurrentTheme(): Theme;
  setTheme(themeId: string): Promise<void>;
  toggleTheme(): Promise<void>;
  getAvailableThemes(): Theme[];
  isDarkMode(): boolean;
  isAutoThemeEnabled(): boolean;
  getSystemTheme(): 'light' | 'dark';
  setAutoTheme(enabled: boolean): Promise<void>;
  customizeTheme(customization: ThemeCustomization): Promise<void>;
  resetTheme(): Promise<void>;
  exportTheme(themeId: string): Promise<string>;
  importTheme(themeData: string): Promise<void>;
}
