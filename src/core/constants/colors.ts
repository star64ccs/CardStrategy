// 顏色Constant定義
export const _COLORS = {
  // 主色調
  PRIMARY: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // 主色
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // 輔助色
  SECONDARY: {
    50: '#F3E5F5',
    100: '#E1BEE7',
    200: '#CE93D8',
    300: '#BA68C8',
    400: '#AB47BC',
    500: '#9C27B0', // 輔助色
    600: '#8E24AA',
    700: '#7B1FA2',
    800: '#6A1B9A',
    900: '#4A148C',
  },

  // Success色
  SUCCESS: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Success色
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },

  // Warning色
  WARNING: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107', // Warning色
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },

  // Error色
  ERROR: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336', // Error色
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },

  // Information色
  INFO: {
    50: '#E1F5FE',
    100: '#B3E5FC',
    200: '#81D4FA',
    300: '#4FC3F7',
    400: '#29B6F6',
    500: '#03A9F4', // Information色
    600: '#039BE5',
    700: '#0288D1',
    800: '#0277BD',
    900: '#01579B',
  },

  // 中性色
  NEUTRAL: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // 灰度
  GRAY: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // 白色和黑色
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  TRANSPARENT: 'transparent',

  // 背景色
  BACKGROUND: {
    PRIMARY: '#FFFFFF',
    SECONDARY: '#F5F5F5',
    TERTIARY: '#EEEEEE',
    DARK: '#121212',
    DARK_SECONDARY: '#1E1E1E',
    DARK_TERTIARY: '#2D2D2D',
  },

  // 文字色
  TEXT: {
    PRIMARY: '#212121',
    SECONDARY: '#757575',
    TERTIARY: '#9E9E9E',
    DISABLED: '#BDBDBD',
    INVERSE: '#FFFFFF',
    INVERSE_SECONDARY: 'rgba(255, 255, 255, 0.7)',
    INVERSE_TERTIARY: 'rgba(255, 255, 255, 0.5)',
  },

  // 邊框色
  BORDER: {
    LIGHT: '#E0E0E0',
    MEDIUM: '#BDBDBD',
    DARK: '#9E9E9E',
    FOCUS: '#2196F3',
    ERROR: '#F44336',
  },

  // 陰影色
  SHADOW: {
    LIGHT: 'rgba(0, 0, 0, 0.1)',
    MEDIUM: 'rgba(0, 0, 0, 0.2)',
    DARK: 'rgba(0, 0, 0, 0.3)',
  },

  // 卡片稀有度顏色
  RARITY: {
    COMMON: '#9E9E9E',
    UNCOMMON: '#4CAF50',
    RARE: '#2196F3',
    MYTHIC: '#9C27B0',
    SPECIAL: '#FF9800',
    PROMO: '#F44336',
  },

  // 卡片Condition顏色
  CONDITION: {
    MINT: '#4CAF50',
    NEAR_MINT: '#8BC34A',
    EXCELLENT: '#CDDC39',
    GOOD: '#FFEB3B',
    LIGHT_PLAYED: '#FF9800',
    PLAYED: '#FF5722',
    POOR: '#F44336',
  },

  // 市場趨勢顏色
  TREND: {
    RISING: '#4CAF50',
    FALLING: '#F44336',
    STABLE: '#9E9E9E',
  },

  // 投資Status顏色
  INVESTMENT: {
    PROFIT: '#4CAF50',
    LOSS: '#F44336',
    NEUTRAL: '#9E9E9E',
  },
} as const;

// Theme顏色
export const _THEME_COLORS = {
  LIGHT: {
    PRIMARY: COLORS.PRIMARY[500],
    SECONDARY: COLORS.SECONDARY[500],
    BACKGROUND: COLORS.BACKGROUND.PRIMARY,
    SURFACE: COLORS.BACKGROUND.SECONDARY,
    TEXT: COLORS.TEXT.PRIMARY,
    TEXT_SECONDARY: COLORS.TEXT.SECONDARY,
    BORDER: COLORS.BORDER.LIGHT,
    SHADOW: COLORS.SHADOW.LIGHT,
  },
  DARK: {
    PRIMARY: COLORS.PRIMARY[400],
    SECONDARY: COLORS.SECONDARY[400],
    BACKGROUND: COLORS.BACKGROUND.DARK,
    SURFACE: COLORS.BACKGROUND.DARK_SECONDARY,
    TEXT: COLORS.TEXT.INVERSE,
    TEXT_SECONDARY: COLORS.TEXT.INVERSE_SECONDARY,
    BORDER: COLORS.BORDER.DARK,
    SHADOW: COLORS.SHADOW.DARK,
  },
} as const;

// 漸變色
export const _GRADIENTS = {
  PRIMARY: ['#2196F3', '#1976D2'],
  SECONDARY: ['#9C27B0', '#7B1FA2'],
  SUCCESS: ['#4CAF50', '#388E3C'],
  WARNING: ['#FFC107', '#FFA000'],
  ERROR: ['#F44336', '#D32F2F'],
  INFO: ['#03A9F4', '#0288D1'],
  SUNSET: ['#FF6B6B', '#4ECDC4'],
  OCEAN: ['#667eea', '#764ba2'],
  FOREST: ['#11998e', '#38ef7d'],
  FIRE: ['#f093fb', '#f5576c'],
} as const;
