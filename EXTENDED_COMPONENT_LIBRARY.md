# 🎨 CardStrategy 擴展組件庫

## 📋 **概述**

CardStrategy 擴展組件庫提供了豐富的 UI 組件，基於深色主題配金色元素的設計系統，為卡牌投資與收藏管理平台提供完整的用戶界面解決方案。

## 🧩 **組件分類**

### **1. 基礎組件 (Core Components)**

#### **Button 按鈕組件**

```typescript
import { Button } from '../components/common';

// 主要按鈕
<Button
  title="登入"
  onPress={handleLogin}
  variant="primary"
  size="large"
/>

// 次要按鈕
<Button
  title="取消"
  onPress={handleCancel}
  variant="secondary"
  size="medium"
/>

// 幽靈按鈕
<Button
  title="了解更多"
  onPress={handleLearnMore}
  variant="ghost"
  size="small"
/>
```

**特性：**

- 三種變體：`primary`、`secondary`、`ghost`
- 三種尺寸：`small`、`medium`、`large`
- 支持載入狀態和禁用狀態
- 支持圖標和自定義樣式

#### **Card 卡片組件**

```typescript
import { Card } from '../components/common';

// 默認卡片
<Card variant="default" padding="medium">
  <Text>卡片內容</Text>
</Card>

// 提升卡片
<Card variant="elevated" padding="large">
  <Text>重要內容</Text>
</Card>

// 可點擊卡片
<Card variant="outlined" onPress={handlePress}>
  <Text>可點擊卡片</Text>
</Card>
```

**特性：**

- 三種變體：`default`、`elevated`、`outlined`
- 四種內邊距：`none`、`small`、`medium`、`large`
- 支持點擊事件和自定義樣式

#### **Input 輸入框組件**

```typescript
import { Input } from '../components/common';

<Input
  label="電子郵件"
  placeholder="請輸入您的電子郵件"
  value={email}
  onChangeText={setEmail}
  leftIcon="mail-outline"
  error={errors.email}
  secureTextEntry={false}
  keyboardType="email-address"
/>
```

**特性：**

- 支持左側和右側圖標
- 密碼可見性切換
- 錯誤狀態顯示
- 多種鍵盤類型
- 多行文本支持

### **2. 顯示組件 (Display Components)**

#### **Badge 徽章組件**

```typescript
import { Badge } from '../components/common';

// 狀態徽章
<Badge text="成功" variant="success" size="medium" />

// 計數徽章
<Badge text="99+" variant="error" size="small" />

// 金色徽章
<Badge text="VIP" variant="gold" size="large" showDot />

// 默認徽章
<Badge text="標籤" variant="default" size="medium" />
```

**特性：**

- 六種變體：`default`、`success`、`warning`、`error`、`info`、`gold`
- 三種尺寸：`small`、`medium`、`large`
- 支持點狀指示器
- 圓角設計

#### **Avatar 頭像組件**

```typescript
import { Avatar } from '../components/common';

// 圖片頭像
<Avatar
  source="https://example.com/avatar.jpg"
  size="large"
  variant="circle"
  status="online"
/>

// 縮寫頭像
<Avatar
  initials="JS"
  size="medium"
  variant="rounded"
  showBorder
  borderColor={theme.colors.gold.primary}
/>

// 默認頭像
<Avatar
  size="small"
  variant="square"
/>
```

**特性：**

- 支持圖片、縮寫和默認圖標
- 四種尺寸：`small`、`medium`、`large`、`xlarge`
- 三種形狀：`circle`、`rounded`、`square`
- 在線狀態指示器
- 邊框支持

#### **LoadingSpinner 載入指示器**

```typescript
import { LoadingSpinner } from '../components/common';

// 旋轉載入器
<LoadingSpinner
  size="medium"
  color={theme.colors.gold.primary}
  text="載入中..."
  variant="spinner"
/>

// 脈衝載入器
<LoadingSpinner
  size="large"
  variant="pulse"
  text="處理中"
/>

// 點狀載入器
<LoadingSpinner
  size="small"
  variant="dots"
/>
```

**特性：**

- 三種動畫：`spinner`、`pulse`、`dots`
- 三種尺寸：`small`、`medium`、`large`
- 自定義顏色和文字
- 流暢的動畫效果

#### **ProgressBar 進度條**

```typescript
import { ProgressBar } from '../components/common';

// 默認進度條
<ProgressBar
  progress={75}
  variant="default"
  size="medium"
  showLabel
/>

// 成功進度條
<ProgressBar
  progress={100}
  variant="success"
  size="large"
  animated={true}
/>

// 金色進度條
<ProgressBar
  progress={50}
  variant="gold"
  size="small"
/>
```

**特性：**

- 五種變體：`default`、`success`、`warning`、`error`、`gold`
- 三種尺寸：`small`、`medium`、`large`
- 動畫支持
- 標籤顯示

### **3. 交互組件 (Interactive Components)**

#### **Modal 模態框**

```typescript
import { Modal } from '../components/common';

<Modal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  title="確認操作"
  size="medium"
  showCloseButton
  closeOnBackdropPress
>
  <Text>模態框內容</Text>
</Modal>
```

**特性：**

- 四種尺寸：`small`、`medium`、`large`、`full`
- 自定義標題和關閉按鈕
- 背景點擊關閉
- 流暢的動畫效果

#### **Switch 開關**

```typescript
import { Switch } from '../components/common';

<Switch
  value={isEnabled}
  onValueChange={setIsEnabled}
  variant="gold"
  size="medium"
  disabled={false}
/>
```

**特性：**

- 五種變體：`default`、`success`、`warning`、`error`、`gold`
- 三種尺寸：`small`、`medium`、`large`
- 禁用狀態支持
- 流暢的切換動畫

#### **Tooltip 工具提示**

```typescript
import { Tooltip } from '../components/common';

<Tooltip
  content="這是一個工具提示"
  position="top"
  maxWidth={200}
  trigger="press"
>
  <Text>懸停查看提示</Text>
</Tooltip>
```

**特性：**

- 四種位置：`top`、`bottom`、`left`、`right`
- 三種觸發方式：`press`、`longPress`、`hover`
- 自定義最大寬度
- 箭頭指示器

### **4. 導航組件 (Navigation Components)**

#### **BottomTabBar 底部導航欄**

```typescript
import { BottomTabBar } from '../components/navigation';

const tabs = [
  { key: 'home', title: '首頁', icon: 'home-outline', activeIcon: 'home' },
  { key: 'cards', title: '卡牌', icon: 'card-outline', activeIcon: 'card' },
  { key: 'scan', title: '掃描', icon: 'camera-outline', activeIcon: 'camera' },
  { key: 'profile', title: '我的', icon: 'person-outline', activeIcon: 'person' },
];

<BottomTabBar
  tabs={tabs}
  activeTab={activeTab}
  onTabPress={setActiveTab}
/>
```

**特性：**

- 動態標籤配置
- 活動狀態指示器
- 圖標和文字支持
- 流暢的切換動畫

### **5. 專用組件 (Specialized Components)**

#### **CardGradingDisplay 卡片鑑定顯示**

```typescript
import { CardGradingDisplay } from '../components/cards';

const gradingResults = [
  {
    agency: 'PSA',
    overallGrade: 9.5,
    subGrades: {
      centering: 9.5,
      corners: 9.0,
      edges: 9.5,
      surface: 9.5,
    },
    confidence: 95,
    estimatedValue: 2500,
  },
  // ... 更多鑑定結果
];

<CardGradingDisplay
  cardName="皮卡丘 VMAX"
  cardImage="https://example.com/card.jpg"
  gradingResults={gradingResults}
  onViewDetails={handleViewDetails}
  onShare={handleShare}
/>
```

**特性：**

- 多機構鑑定結果顯示
- 子評分詳情
- 信心度進度條
- 預估價值顯示
- 分享和詳情操作

#### **CardPriceChart 卡片價格圖表**

```typescript
import { CardPriceChart } from '../components/cards';

const priceData = [
  { date: '2024-01-01', price: 100, volume: 50 },
  { date: '2024-01-02', price: 120, volume: 60 },
  // ... 更多價格數據
];

<CardPriceChart
  cardName="皮卡丘 VMAX"
  priceData={priceData}
  currentPrice={150}
  priceChange={30}
  priceChangePercent={25}
  timeRange="1M"
  onTimeRangeChange={setTimeRange}
  onViewDetails={handleViewDetails}
/>
```

**特性：**

- 互動式價格圖表
- 多時間範圍選擇
- 價格變化指示器
- 統計信息顯示
- 點擊數據點查看詳情

#### **CardCollectionManager 卡片收藏管理**

```typescript
import { CardCollectionManager } from '../components/cards';

<CardCollectionManager
  cards={userCards}
  totalValue={50000}
  totalCards={150}
  onCardPress={handleCardPress}
  onAddCard={handleAddCard}
  onEditCard={handleEditCard}
  onDeleteCard={handleDeleteCard}
  onToggleForSale={handleToggleForSale}
  onToggleWishlist={handleToggleWishlist}
  onExportCollection={handleExport}
  onImportCollection={handleImport}
/>
```

**特性：**

- 網格和列表視圖切換
- 多種篩選和排序選項
- 批量操作支持
- 收藏統計信息
- 導入/導出功能

#### **AIRecommendationCard AI 推薦卡片**

```typescript
import { AIRecommendationCard } from '../components/ai';

<AIRecommendationCard
  recommendation={aiRecommendation}
  userBudget={1000}
  onViewDetails={handleViewDetails}
  onAddToWishlist={handleAddToWishlist}
  onBuyNow={handleBuyNow}
  onDismiss={handleDismiss}
  onShare={handleShare}
/>
```

**特性：**

- AI 智能推薦顯示
- 風險等級評估
- 投資時長建議
- 市場趨勢分析
- 推薦理由展開
- 預算匹配檢查

#### **CardScannerOverlay 卡片掃描覆蓋層**

```typescript
import { CardScannerOverlay } from '../components/scan';

<CardScannerOverlay
  isScanning={isScanning}
  isProcessing={isProcessing}
  scanResult={scanResult}
  onCapture={handleCapture}
  onToggleFlash={handleToggleFlash}
  onSwitchCamera={handleSwitchCamera}
  onClose={handleClose}
  flashEnabled={flashEnabled}
  cameraType={cameraType}
/>
```

**特性：**

- 掃描區域指示器
- 動畫掃描線效果
- 實時處理狀態
- 掃描結果顯示
- 相機控制功能
- 掃描提示信息

## 🎯 **使用最佳實踐**

### **組件組合**

```typescript
// 卡片列表項目
<Card variant="elevated" padding="medium">
  <View style={styles.cardHeader}>
    <Avatar
      source={card.imageUrl}
      size="medium"
      variant="rounded"
    />
    <View style={styles.cardInfo}>
      <Text style={styles.cardName}>{card.name}</Text>
      <Badge text={card.rarity} variant="gold" size="small" />
    </View>
    <Tooltip content="查看詳情" position="left">
      <Button
        title="詳情"
        onPress={() => handleViewDetails(card)}
        variant="secondary"
        size="small"
      />
    </Tooltip>
  </View>

  <ProgressBar
    progress={card.condition}
    variant="success"
    size="small"
    showLabel
  />
</Card>
```

### **載入狀態處理**

```typescript
// 載入狀態
{isLoading ? (
  <LoadingSpinner
    size="large"
    text="載入卡牌資料中..."
    variant="spinner"
  />
) : (
  <CardList cards={cards} />
)}
```

### **錯誤狀態處理**

```typescript
// 錯誤狀態
{error ? (
  <Card variant="outlined" padding="large">
    <View style={styles.errorContainer}>
      <Ionicons
        name="alert-circle"
        size={48}
        color={theme.colors.status.error}
      />
      <Text style={styles.errorText}>{error}</Text>
      <Button
        title="重試"
        onPress={handleRetry}
        variant="primary"
        size="medium"
      />
    </View>
  </Card>
) : (
  <CardList cards={cards} />
)}
```

## 🔧 **自定義主題**

### **擴展設計令牌**

```typescript
// 自定義組件樣式
const customStyles = {
  card: {
    backgroundColor: theme.colors.background.tertiary,
    borderColor: theme.colors.gold.primary,
    borderWidth: 2,
    borderRadius: theme.borderRadius.xl,
  },
  button: {
    backgroundColor: theme.colors.gold.secondary,
    shadowColor: theme.colors.gold.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
};
```

### **組件變體擴展**

```typescript
// 自定義按鈕變體
const CustomButton = styled(Button)`
  &.premium {
    background: linear-gradient(
      135deg,
      ${theme.colors.gold.primary},
      ${theme.colors.gold.secondary}
    );
    border: none;
    shadow: 0 8px 32px rgba(255, 215, 0, 0.3);
  }
`;
```

## 📱 **響應式設計**

### **適配不同屏幕**

```typescript
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const getResponsiveSize = () => {
  if (width < 375) return 'small';
  if (width < 768) return 'medium';
  return 'large';
};

<Button
  title="操作"
  size={getResponsiveSize()}
  variant="primary"
/>
```

### **動態佈局**

```typescript
const isTablet = width >= 768;

<View style={[styles.container, isTablet && styles.tabletContainer]}>
  <Card style={[styles.card, isTablet && styles.tabletCard]}>
    {/* 內容 */}
  </Card>
</View>
```

## 🚀 **性能優化**

### **組件懶加載**

```typescript
import { lazy, Suspense } from 'react';

const CardGradingDisplay = lazy(() => import('./CardGradingDisplay'));

<Suspense fallback={<LoadingSpinner size="medium" />}>
  <CardGradingDisplay {...props} />
</Suspense>
```

### **記憶化組件**

```typescript
import React, { memo } from 'react';

const CardItem = memo(({ card, onPress }) => (
  <Card onPress={() => onPress(card)}>
    <Text>{card.name}</Text>
  </Card>
));
```

## 📋 **組件檢查清單**

### **開發前檢查**

- [ ] 組件是否遵循設計系統規範
- [ ] 是否支持所有必要的變體和尺寸
- [ ] 是否包含適當的 TypeScript 類型定義
- [ ] 是否支持自定義樣式覆蓋

### **測試檢查**

- [ ] 組件在不同尺寸下的顯示效果
- [ ] 交互狀態的視覺反饋
- [ ] 無障礙功能的支持
- [ ] 性能表現

### **文檔檢查**

- [ ] 組件 API 文檔是否完整
- [ ] 使用示例是否清晰
- [ ] 最佳實踐是否明確
- [ ] 常見問題是否解答

---

_本擴展組件庫將持續更新和完善，為 CardStrategy 應用提供最佳的用戶體驗和開發體驗。_
