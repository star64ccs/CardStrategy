// CardStrategy 設計系統
// 基於深色背景配金色元素的現代化設計風格

export const colors = {
  // 主色調 - 深色背景
  background: {
    primary: '#0A0E1A', // 主背景色 - 深藍黑色
    secondary: '#1A1F2E', // 次要背景色 - 稍淺的深藍
    tertiary: '#2A2F3E', // 第三級背景色 - 卡片背景
    overlay: 'rgba(10, 14, 26, 0.8)', // 遮罩層
  },

  // 金色系 - 主要強調色
  gold: {
    primary: '#FFD700', // 主金色
    secondary: '#FFA500', // 次要金色 - 橙色調
    tertiary: '#FF8C00', // 第三級金色 - 深橙色
    light: '#FFF8DC', // 淺金色 - 文字用
    dark: '#B8860B', // 深金色 - 按鈕懸停
  },

  // 文字顏色
  text: {
    primary: '#FFFFFF', // 主要文字 - 白色
    secondary: '#E0E0E0', // 次要文字 - 淺灰
    tertiary: '#B0B0B0', // 第三級文字 - 中灰
    disabled: '#666666', // 禁用文字 - 深灰
    gold: '#FFD700', // 金色文字
  },

  // 狀態顏色
  status: {
    success: '#4CAF50', // 成功 - 綠色
    warning: '#FF9800', // 警告 - 橙色
    error: '#F44336', // 錯誤 - 紅色
    info: '#2196F3', // 信息 - 藍色
  },

  // 卡片稀有度顏色
  rarity: {
    common: '#9E9E9E', // 普通 - 灰色
    uncommon: '#4CAF50', // 非普通 - 綠色
    rare: '#2196F3', // 稀有 - 藍色
    mythic: '#FF9800', // 神話 - 橙色
    special: '#E91E63', // 特殊 - 粉紅色
    promo: '#9C27B0', // 宣傳 - 紫色
  },

  // 邊框和分割線
  border: {
    primary: '#333333', // 主要邊框
    secondary: '#444444', // 次要邊框
    gold: '#FFD700', // 金色邊框
  },

  // 陰影
  shadow: {
    light: '0 2px 8px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.4)',
    heavy: '0 8px 32px rgba(0, 0, 0, 0.5)',
    gold: '0 4px 16px rgba(255, 215, 0, 0.2)',
  },
};

export const typography = {
  // 字體大小
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // 字體粗細
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // 行高
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // 字體間距
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const layout = {
  // 容器最大寬度
  maxWidth: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },

  // 間距
  padding: {
    screen: 16,
    card: 20,
    button: 16,
  },

  // 高度
  height: {
    header: 64,
    button: 48,
    input: 48,
    card: 200,
  },
};

export const animations = {
  // 過渡時間
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },

  // 緩動函數
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },

  // 動畫類型
  types: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    slideUp: {
      from: { transform: 'translateY(20px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
    scaleIn: {
      from: { transform: 'scale(0.9)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
    },
  },
};

// 組件樣式預設
export const componentStyles = {
  // 按鈕樣式
  button: {
    primary: {
      backgroundColor: colors.gold.primary,
      color: colors.background.primary,
      borderColor: colors.gold.primary,
      shadow: colors.shadow.gold,
    },
    secondary: {
      backgroundColor: 'transparent',
      color: colors.gold.primary,
      borderColor: colors.gold.primary,
      borderWidth: 1,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.text.primary,
      borderColor: 'transparent',
    },
  },

  // 卡片樣式
  card: {
    backgroundColor: colors.background.tertiary,
    borderColor: colors.border.primary,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    shadow: colors.shadow.medium,
  },

  // 輸入框樣式
  input: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.primary,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    color: colors.text.primary,
    placeholderColor: colors.text.tertiary,
  },

  // 導航樣式
  navigation: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.primary,
    borderTopWidth: 1,
  },
};

// 主題配置
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  layout,
  animations,
  componentStyles,
};

export default theme;
