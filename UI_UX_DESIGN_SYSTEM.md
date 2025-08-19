# 🎨 CardStrategy UI/UX 設計系統

## 📋 **設計理念**

CardStrategy 採用現代化的深色主題設計，以金色作為主要強調色，營造高端、專業的卡牌投資與收藏管理平台形象。

### 🎯 **設計原則**
- **專業性**：深色背景配金色元素，體現高端感
- **可讀性**：高對比度確保內容清晰易讀
- **一致性**：統一的設計語言和組件系統
- **易用性**：直觀的交互設計和清晰的視覺層次

## 🎨 **色彩系統**

### **主色調**
```typescript
// 深色背景系
background: {
  primary: '#0A0E1A',      // 主背景色 - 深藍黑色
  secondary: '#1A1F2E',    // 次要背景色 - 稍淺的深藍
  tertiary: '#2A2F3E',     // 第三級背景色 - 卡片背景
  overlay: 'rgba(10, 14, 26, 0.8)', // 遮罩層
}

// 金色強調色系
gold: {
  primary: '#FFD700',      // 主金色
  secondary: '#FFA500',    // 次要金色 - 橙色調
  tertiary: '#FF8C00',     // 第三級金色 - 深橙色
  light: '#FFF8DC',        // 淺金色 - 文字用
  dark: '#B8860B',         // 深金色 - 按鈕懸停
}
```

### **文字顏色**
```typescript
text: {
  primary: '#FFFFFF',      // 主要文字 - 白色
  secondary: '#E0E0E0',    // 次要文字 - 淺灰
  tertiary: '#B0B0B0',     // 第三級文字 - 中灰
  disabled: '#666666',     // 禁用文字 - 深灰
  gold: '#FFD700',         // 金色文字
}
```

### **狀態顏色**
```typescript
status: {
  success: '#4CAF50',      // 成功 - 綠色
  warning: '#FF9800',      // 警告 - 橙色
  error: '#F44336',        // 錯誤 - 紅色
  info: '#2196F3',         // 信息 - 藍色
}
```

### **卡片稀有度顏色**
```typescript
rarity: {
  common: '#9E9E9E',       // 普通 - 灰色
  uncommon: '#4CAF50',     // 非普通 - 綠色
  rare: '#2196F3',         // 稀有 - 藍色
  mythic: '#FF9800',       // 神話 - 橙色
  special: '#E91E63',      // 特殊 - 粉紅色
  promo: '#9C27B0',        // 宣傳 - 紫色
}
```

## 📝 **字體系統**

### **字體大小**
```typescript
sizes: {
  xs: 12,      // 標籤、徽章
  sm: 14,      // 次要文字
  base: 16,    // 正文
  lg: 18,      // 小標題
  xl: 20,      // 標題
  '2xl': 24,   // 大標題
  '3xl': 30,   // 頁面標題
  '4xl': 36,   // 主要標題
  '5xl': 48,   // 英雄標題
}
```

### **字體粗細**
```typescript
weights: {
  light: '300',      // 輕量
  normal: '400',     // 正常
  medium: '500',     // 中等
  semibold: '600',   // 半粗
  bold: '700',       // 粗體
  extrabold: '800',  // 特粗
}
```

## 📏 **間距系統**

```typescript
spacing: {
  xs: 4,       // 最小間距
  sm: 8,       // 小間距
  md: 16,      // 中等間距
  lg: 24,      // 大間距
  xl: 32,      // 特大間距
  '2xl': 48,   // 超大間距
  '3xl': 64,   // 最大間距
  '4xl': 96,   // 極大間距
}
```

## 🔲 **圓角系統**

```typescript
borderRadius: {
  none: 0,     // 無圓角
  sm: 4,       // 小圓角
  md: 8,       // 中等圓角
  lg: 12,      // 大圓角
  xl: 16,      // 特大圓角
  '2xl': 24,   // 超大圓角
  full: 9999,  // 完全圓角
}
```

## 🎭 **組件系統**

### **按鈕組件**
```typescript
// 主要按鈕 - 金色背景
primary: {
  backgroundColor: '#FFD700',
  color: '#0A0E1A',
  borderColor: '#FFD700',
  shadow: '0 4px 16px rgba(255, 215, 0, 0.2)',
}

// 次要按鈕 - 透明背景，金色邊框
secondary: {
  backgroundColor: 'transparent',
  color: '#FFD700',
  borderColor: '#FFD700',
  borderWidth: 1,
}

// 幽靈按鈕 - 完全透明
ghost: {
  backgroundColor: 'transparent',
  color: '#FFFFFF',
  borderColor: 'transparent',
}
```

### **卡片組件**
```typescript
// 默認卡片
default: {
  backgroundColor: '#2A2F3E',
  borderColor: '#333333',
  borderWidth: 1,
  borderRadius: 12,
  shadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
}

// 提升卡片 - 更強陰影
elevated: {
  shadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
}

// 輪廓卡片 - 金色邊框
outlined: {
  borderColor: '#FFD700',
  borderWidth: 2,
  shadow: 'none',
}
```

### **輸入框組件**
```typescript
input: {
  backgroundColor: '#1A1F2E',
  borderColor: '#333333',
  borderWidth: 1,
  borderRadius: 8,
  color: '#FFFFFF',
  placeholderColor: '#B0B0B0',
}

// 聚焦狀態
focused: {
  borderColor: '#FFD700',
  shadow: '0 0 0 4px rgba(255, 215, 0, 0.3)',
}

// 錯誤狀態
error: {
  borderColor: '#F44336',
}
```

## 🎬 **動畫系統**

### **過渡時間**
```typescript
duration: {
  fast: 150,   // 快速過渡
  normal: 300, // 正常過渡
  slow: 500,   // 慢速過渡
}
```

### **緩動函數**
```typescript
easing: {
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
}
```

### **動畫類型**
```typescript
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
}
```

## 📱 **響應式設計**

### **斷點系統**
```typescript
maxWidth: {
  sm: 640,   // 小屏幕
  md: 768,   // 中等屏幕
  lg: 1024,  // 大屏幕
  xl: 1280,  // 特大屏幕
  '2xl': 1536, // 超大屏幕
}
```

### **容器高度**
```typescript
height: {
  header: 64,    // 頁面頭部
  button: 48,    // 按鈕高度
  input: 48,     // 輸入框高度
  card: 200,     // 卡片高度
}
```

## 🎨 **視覺層次**

### **陰影系統**
```typescript
shadow: {
  light: '0 2px 8px rgba(0, 0, 0, 0.3)',      // 輕微陰影
  medium: '0 4px 16px rgba(0, 0, 0, 0.4)',    // 中等陰影
  heavy: '0 8px 32px rgba(0, 0, 0, 0.5)',     // 重陰影
  gold: '0 4px 16px rgba(255, 215, 0, 0.2)',  // 金色陰影
}
```

### **邊框系統**
```typescript
border: {
  primary: '#333333',    // 主要邊框
  secondary: '#444444',  // 次要邊框
  gold: '#FFD700',       // 金色邊框
}
```

## 🔧 **使用指南**

### **按鈕使用**
```typescript
// 主要操作按鈕
<Button
  title="登入"
  onPress={handleLogin}
  variant="primary"
  size="large"
/>

// 次要操作按鈕
<Button
  title="取消"
  onPress={handleCancel}
  variant="secondary"
  size="medium"
/>
```

### **卡片使用**
```typescript
// 內容卡片
<Card variant="elevated" padding="medium">
  <Text>卡片內容</Text>
</Card>

// 可點擊卡片
<Card variant="outlined" onPress={handlePress}>
  <Text>可點擊卡片</Text>
</Card>
```

### **輸入框使用**
```typescript
<Input
  label="電子郵件"
  placeholder="請輸入您的電子郵件"
  value={email}
  onChangeText={setEmail}
  leftIcon="mail-outline"
  error={errors.email}
/>
```

## 🎯 **設計最佳實踐**

### **色彩使用**
1. **主要操作**：使用金色 (`#FFD700`)
2. **次要操作**：使用白色或灰色
3. **警告狀態**：使用橙色 (`#FF9800`)
4. **錯誤狀態**：使用紅色 (`#F44336`)
5. **成功狀態**：使用綠色 (`#4CAF50`)

### **字體使用**
1. **頁面標題**：使用 `3xl` 大小，`bold` 粗細
2. **區塊標題**：使用 `xl` 大小，`semibold` 粗細
3. **正文內容**：使用 `base` 大小，`normal` 粗細
4. **次要文字**：使用 `sm` 大小，`medium` 粗細

### **間距使用**
1. **組件間距**：使用 `md` (16px)
2. **區塊間距**：使用 `lg` (24px)
3. **頁面間距**：使用 `xl` (32px)
4. **內部間距**：使用 `sm` (8px)

### **圓角使用**
1. **按鈕**：使用 `lg` (12px)
2. **卡片**：使用 `lg` (12px)
3. **輸入框**：使用 `md` (8px)
4. **徽章**：使用 `sm` (4px)

## 📋 **設計檢查清單**

### **視覺一致性**
- [ ] 所有組件使用統一的色彩系統
- [ ] 字體大小和粗細符合設計規範
- [ ] 間距和圓角使用標準值
- [ ] 陰影效果保持一致

### **可訪問性**
- [ ] 文字對比度符合 WCAG 標準
- [ ] 按鈕和可點擊元素有足夠的觸摸區域
- [ ] 錯誤狀態有清晰的視覺提示
- [ ] 支持深色模式

### **用戶體驗**
- [ ] 交互反饋及時且清晰
- [ ] 載入狀態有適當的指示器
- [ ] 錯誤信息友好且有用
- [ ] 導航結構清晰易懂

## 🚀 **未來發展**

### **計劃中的改進**
1. **動畫系統**：增加更多微交互動畫
2. **主題系統**：支持淺色主題切換
3. **組件庫**：擴展更多專用組件
4. **設計令牌**：建立完整的設計令牌系統

### **技術實現**
1. **TypeScript**：完整的類型定義
2. **Storybook**：組件文檔和測試
3. **自動化測試**：視覺回歸測試
4. **性能優化**：組件懶加載和優化

---

*本設計系統將持續更新和完善，確保 CardStrategy 應用程序提供最佳的用戶體驗。*
