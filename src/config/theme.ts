import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// 色彩系統
export const colors = {
  // 主色調 - 深藍色系
  primary: '#1C2B3A', // 主色
  primary50: '#E3F2FD',
  primary100: '#BBDEFB',
  primary200: '#90CAF9',
  primary300: '#64B5F6',
  primary400: '#42A5F5',
  primary500: '#1C2B3A',
  primary600: '#1A237E',
  primary700: '#1976D2',
  primary800: '#1565C0',
  primary900: '#0D47A1',

  // 輔助色 - 金銅色系
  secondary: '#CBA135', // 輔助色
  secondary50: '#FFF8E1',
  secondary100: '#FFECB3',
  secondary200: '#FFE082',
  secondary300: '#FFD54F',
  secondary400: '#FFCA28',
  secondary500: '#CBA135',
  secondary600: '#FFB300',
  secondary700: '#FFA000',
  secondary800: '#FF8F00',
  secondary900: '#FF6F00',

  // 電光藍色系
  accent: '#00BFFF', // 電光藍
  accent50: '#E1F5FE',
  accent100: '#B3E5FC',
  accent200: '#81D4FA',
  accent300: '#4FC3F7',
  accent400: '#29B6F6',
  accent500: '#00BFFF',
  accent600: '#039BE5',
  accent700: '#0288D1',
  accent800: '#0277BD',
  accent900: '#01579B',

  // 中性色系
  neutral: '#9E9E9E',
  neutral50: '#FAFAFA',
  neutral100: '#F5F5F5',
  neutral200: '#EEEEEE',
  neutral300: '#E0E0E0',
  neutral400: '#BDBDBD',
  neutral500: '#9E9E9E',
  neutral600: '#757575',
  neutral700: '#616161',
  neutral800: '#424242',
  neutral900: '#212121',

  // 石墨灰色系
  gray: '#3A3A3A', // 石墨灰
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#3A3A3A',

  // 背景色系
  background: '#F5F7FA', // 冷白
  backgroundLight: '#F5F7FA',
  backgroundDark: '#121212',
  backgroundPaper: '#FFFFFF',
  backgroundPaperDark: '#1E1E1E',

  // 狀態色系
  success: '#4CAF50',
  success50: '#E8F5E8',
  success100: '#C8E6C9',
  success500: '#4CAF50',
  success600: '#388E3C',
  success700: '#2E7D32',

  warning: '#FF9800',
  warning50: '#FFF3E0',
  warning100: '#FFE0B2',
  warning500: '#FF9800',
  warning600: '#F57C00',
  warning700: '#EF6C00',

  error: '#F44336',
  error50: '#FFEBEE',
  error100: '#FFCDD2',
  error500: '#F44336',
  error600: '#E53935',
  error700: '#D32F2F',

  info: '#2196F3',
  info50: '#E3F2FD',
  info100: '#BBDEFB',
  info500: '#2196F3',
  info600: '#1E88E5',
  info700: '#1976D2',

  // 文字色系
  text: '#1C2B3A',
  textPrimary: '#1C2B3A',
  textSecondary: '#6B7280',
  textDisabled: '#9CA3AF',
  textInverse: '#FFFFFF',
  textLink: '#00BFFF',

  // 邊框色系
  border: '#E5E7EB',
  borderLight: '#E5E7EB',
  borderDark: '#374151',
  borderFocus: '#00BFFF',
  borderError: '#F44336',

  // 陰影色系
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.15)',
  shadowDark: 'rgba(0, 0, 0, 0.25)',

  // 簡化的顏色屬性 - 用於組件
  white: '#FFFFFF',
  black: '#000000',
  backgroundSecondary: '#F3F4F6'
};

// 字體系統
export const typography = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    light: 'Inter-Light',
    thin: 'Inter-Thin'
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  },

  fontWeight: {
    thin: '100',
    light: '300',
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
    black: '900'
  }
};

// 間距系統
export const spacing = {
  xsmall: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
  '5xl': 128
};

// 圓角系統
export const borderRadius = {
  none: 0,
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999
};

// 陰影系統
export const shadows = {
  sm: {
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  base: {
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  md: {
    shadowColor: colors.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5
  },
  lg: {
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8
  },
  xl: {
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12
  }
};

// 斷點系統
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

// 動畫系統
export const animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out'
  }
};

// 尺寸系統
export const dimensions = {
  screen: {
    width,
    height
  },
  header: {
    height: 56
  },
  tabBar: {
    height: 60
  },
  button: {
    height: {
      sm: 32,
      md: 40,
      lg: 48
    },
    minWidth: {
      sm: 80,
      md: 100,
      lg: 120
    }
  },
  input: {
    height: 48,
    paddingHorizontal: 16
  },
  card: {
    padding: 16,
    margin: 8
  }
};

// 主題配置
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  animation,
  dimensions
};

// 深色主題覆蓋
export const darkTheme = {
  ...theme,
  colors: {
    ...colors,
    background: {
      light: '#121212',
      dark: '#000000',
      paper: '#1E1E1E',
      paperDark: '#2D2D2D'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      disabled: '#666666',
      inverse: '#1C2B3A',
      link: '#00BFFF'
    },
    border: {
      light: '#374151',
      dark: '#6B7280',
      focus: '#00BFFF',
      error: '#F44336'
    }
  }
};

// 主題類型
export type Theme = typeof theme;
export type DarkTheme = typeof darkTheme;

// 主題模式
export type ThemeMode = 'light' | 'dark' | 'auto';

// 主題上下文類型
export interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  mode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

// 組件主題類型
export interface ComponentTheme {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  animation: typeof animation;
  dimensions: typeof dimensions;
}

// 導出默認主題
export default theme;
