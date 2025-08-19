# ONE PIECE TCG 使用指南

## 📋 概述

本指南詳細介紹如何在卡片策略平台中使用 ONE PIECE Trading Card Game (TCG) 功能。ONE PIECE TCG 是基於著名動漫系列《海賊王》的集換式卡片遊戲，由 Bandai Namco 發行。

## 🎯 功能特性

### 核心功能
- ✅ **牌組構建**: 創建和管理 ONE PIECE 牌組
- ✅ **卡片管理**: 瀏覽和搜索 ONE PIECE 卡片
- ✅ **錦標賽系統**: 參與 ONE PIECE 錦標賽
- ✅ **排行榜**: 查看 ONE PIECE 玩家排名
- ✅ **分析功能**: 獲取遊戲數據分析
- ✅ **社交分享**: 在社交媒體上分享 ONE PIECE 內容

### 遊戲特色
- **領導者系統**: 以草帽海賊團成員為領導者
- **顏色系統**: 紅、藍、綠、紫、黑五種顏色
- **卡片類型**: 領導者、角色、事件、場地
- **稀有度**: 普通、非普通、稀有、超稀有、秘密稀有

## 🚀 快速開始

### 1. 初始化服務

```typescript
import { cardGameSupportService } from '../services/cardGameSupportService';

// 初始化 ONE PIECE TCG 服務
await cardGameSupportService.initialize();
```

### 2. 獲取遊戲信息

```typescript
// 獲取 ONE PIECE 遊戲詳細信息
const onePieceGame = await cardGameSupportService.getGame('onepiece');

console.log('遊戲名稱:', onePieceGame.name);
console.log('發行商:', onePieceGame.publisher);
console.log('描述:', onePieceGame.description);
console.log('特色:', onePieceGame.metadata);
```

### 3. 創建牌組

```typescript
// 創建路飛領導者牌組
const luffyDeck = await cardGameSupportService.createDeck('user123', {
  gameId: 'onepiece',
  name: '路飛領導者牌組',
  description: '以蒙奇·D·路飛為領導者的草帽海賊團主題牌組',
  cards: ['luffy-leader', 'zoro-character', 'nami-character', 'usopp-character'],
  format: 'Standard',
  isPublic: true,
  isCompetitive: true
});
```

## 🎮 牌組管理

### 創建牌組

```typescript
// 創建索隆劍士牌組
const zoroDeck = await cardGameSupportService.createDeck('user123', {
  gameId: 'onepiece',
  name: '索隆劍士牌組',
  description: '以羅羅諾亞·索隆為領導者的劍士主題牌組',
  cards: ['zoro-leader', 'mihawk-character', 'brook-character', 'sword-event'],
  format: 'Standard',
  isPublic: true,
  isCompetitive: true
});
```

### 獲取用戶牌組

```typescript
// 獲取用戶的所有 ONE PIECE 牌組
const userDecks = await cardGameSupportService.getUserDecks('user123', 'onepiece');

userDecks.forEach(deck => {
  console.log(`牌組: ${deck.name}`);
  console.log(`描述: ${deck.description}`);
  console.log(`卡片數量: ${deck.stats.totalCards}`);
  console.log(`勝率: ${deck.stats.winRate}%`);
});
```

### 更新牌組

```typescript
// 更新牌組信息
const updatedDeck = await cardGameSupportService.updateDeck('deck-id', {
  name: '更新的路飛牌組',
  description: '經過優化的路飛領導者牌組',
  cards: ['luffy-leader-v2', 'zoro-character-v2', 'nami-character-v2']
});
```

### 刪除牌組

```typescript
// 刪除牌組
await cardGameSupportService.deleteDeck('deck-id', 'user123');
```

## 🏆 錦標賽系統

### 創建錦標賽

```typescript
// 創建 ONE PIECE 錦標賽
const tournament = await cardGameSupportService.createTournament({
  gameId: 'onepiece',
  name: 'ONE PIECE TCG 海賊王錦標賽',
  description: '歡迎所有海賊王粉絲參加的盛大錦標賽！',
  format: 'Standard',
  startDate: new Date('2024-05-01'),
  endDate: new Date('2024-05-02'),
  entryFee: 100,
  prizePool: 5000,
  maxParticipants: 64
});
```

### 報名錦標賽

```typescript
// 報名錦標賽
const participant = await cardGameSupportService.joinTournament(
  tournament.id,
  'user123',
  'luffy-deck-id'
);
```

### 獲取錦標賽信息

```typescript
// 獲取錦標賽詳細信息
const tournamentInfo = await cardGameSupportService.getTournament('tournament-id');

// 獲取即將舉行的錦標賽
const upcomingTournaments = await cardGameSupportService.getGameTournaments('onepiece', 'upcoming');
```

## 📊 排行榜和分析

### 獲取排行榜

```typescript
// 獲取 ONE PIECE 排行榜
const rankings = await cardGameSupportService.getGameRankings('onepiece', '2024-Spring');

// 顯示前10名
rankings.slice(0, 10).forEach(rank => {
  console.log(`${rank.rank}. ${rank.playerName} - ${rank.points}分`);
});
```

### 獲取用戶排名

```typescript
// 獲取用戶在 ONE PIECE 中的排名
const userRanking = await cardGameSupportService.getUserRanking('user123', 'onepiece', '2024-Spring');

if (userRanking) {
  console.log(`排名: ${userRanking.rank}`);
  console.log(`積分: ${userRanking.points}`);
  console.log(`遊戲場數: ${userRanking.gamesPlayed}`);
  console.log(`勝率: ${userRanking.winRate}%`);
}
```

### 遊戲分析

```typescript
// 獲取 ONE PIECE 遊戲分析
const analytics = await cardGameSupportService.getGameAnalytics('user123', 'onepiece', 'month');

console.log('總遊戲場數:', analytics.stats.totalGames);
console.log('勝率:', analytics.stats.winRate);
console.log('最愛領導者:', analytics.stats.favoriteLeaders);
console.log('最常用卡片:', analytics.stats.mostUsedCards);
```

## 📱 社交媒體集成

### 分享牌組

```typescript
import { socialMediaIntegrationService } from '../services/socialMediaIntegrationService';

// 在Twitter上分享ONE PIECE牌組
const post = await socialMediaIntegrationService.publishPost('user123', {
  platformId: 'twitter',
  content: {
    text: '剛剛創建了我的路飛領導者牌組！🏴‍☠️ #ONEPIECETCG #海賊王 #路飛',
    hashtags: ['ONEPIECETCG', '海賊王', '路飛', '草帽海賊團']
  }
});
```

### 分享錦標賽信息

```typescript
// 在Facebook上分享錦標賽信息
const tournamentPost = await socialMediaIntegrationService.publishPost('user123', {
  platformId: 'facebook',
  content: {
    text: 'ONE PIECE TCG 海賊王錦標賽即將開始！獎金池高達5000元！🏆',
    hashtags: ['ONEPIECETCG', '海賊王錦標賽', 'TCG比賽']
  }
});
```

### 分享卡片收藏

```typescript
// 在Instagram上分享卡片收藏
const instagramPost = await socialMediaIntegrationService.publishPost('user123', {
  platformId: 'instagram',
  content: {
    text: '我的ONE PIECE卡片收藏展示 📸 #ONEPIECETCG #卡片收藏',
    hashtags: ['ONEPIECETCG', '卡片收藏', '海賊王']
  }
});
```

## 🎯 領導者系統

### 支持的領導者

ONE PIECE TCG 支持以下領導者：

- **蒙奇·D·路飛** - 草帽海賊團船長
- **羅羅諾亞·索隆** - 劍士
- **娜美** - 航海士
- **烏索普** - 狙擊手
- **山治** - 廚師
- **托尼托尼·喬巴** - 醫生
- **妮可·羅賓** - 考古學家
- **弗蘭奇** - 船匠
- **布魯克** - 音樂家
- **甚平** - 舵手

### 領導者牌組示例

```typescript
// 路飛領導者牌組
const luffyDeck = {
  leader: 'luffy-leader',
  characters: ['zoro-character', 'nami-character', 'usopp-character'],
  events: ['gomu-gomu-pistol', 'gear-second'],
  stages: ['thousand-sunny']
};

// 索隆領導者牌組
const zoroDeck = {
  leader: 'zoro-leader',
  characters: ['mihawk-character', 'brook-character', 'law-character'],
  events: ['three-sword-style', 'ashura'],
  stages: ['baratie']
};
```

## 🎨 顏色系統

### 顏色類型

ONE PIECE TCG 使用五種顏色系統：

- **紅色 (Red)** - 代表熱情和力量
- **藍色 (Blue)** - 代表智慧和策略
- **綠色 (Green)** - 代表自然和成長
- **紫色 (Purple)** - 代表神秘和魔法
- **黑色 (Black)** - 代表黑暗和邪惡

### 顏色策略

```typescript
// 單色牌組
const redDeck = {
  color: 'Red',
  strategy: 'Aggressive',
  focus: 'Direct damage and power'
};

// 雙色牌組
const redBlueDeck = {
  colors: ['Red', 'Blue'],
  strategy: 'Control-Aggro',
  focus: 'Balance between power and control'
};
```

## 📈 卡片類型

### 主要卡片類型

1. **領導者 (Leader)**
   - 牌組的核心卡片
   - 決定牌組的顏色和策略
   - 擁有特殊能力

2. **角色 (Character)**
   - 主要的戰鬥單位
   - 擁有攻擊力和生命值
   - 具有特殊效果

3. **事件 (Event)**
   - 一次性效果卡片
   - 提供戰術優勢
   - 影響遊戲節奏

4. **場地 (Stage)**
   - 持續效果卡片
   - 提供環境加成
   - 影響雙方玩家

## 🔧 配置選項

### 啟用 ONE PIECE TCG

```typescript
// 在服務配置中啟用 ONE PIECE TCG
const config = {
  enableOnePiece: true,
  // 其他配置...
};

const cardGameService = new CardGameSupportService(config);
```

### 自定義配置

```typescript
// 自定義 ONE PIECE TCG 配置
const onePieceConfig = {
  enableTournaments: true,
  enableRankings: true,
  enableAnalytics: true,
  maxDeckSize: 50,
  tournamentEntryFee: 100,
  prizePoolMultiplier: 50
};
```

## 📚 最佳實踐

### 牌組構建建議

1. **選擇合適的領導者**
   - 根據個人喜好和策略選擇
   - 考慮領導者的特殊能力
   - 確保與牌組主題一致

2. **平衡卡片類型**
   - 角色卡片：40-60%
   - 事件卡片：20-30%
   - 場地卡片：10-20%

3. **顏色協調**
   - 確保卡片顏色與領導者一致
   - 避免過多不同顏色的卡片
   - 考慮顏色之間的協同效果

### 錦標賽策略

1. **賽前準備**
   - 熟悉牌組構成
   - 練習關鍵組合
   - 了解對手常用牌組

2. **比賽技巧**
   - 保持冷靜和專注
   - 合理使用資源
   - 適應對手策略

3. **賽後分析**
   - 記錄比賽過程
   - 分析勝負原因
   - 改進牌組構成

## 🐛 故障排除

### 常見問題

1. **牌組創建失敗**
   - 檢查卡片ID是否正確
   - 確認卡片數量符合限制
   - 驗證顏色搭配是否正確

2. **錦標賽報名失敗**
   - 確認錦標賽狀態
   - 檢查參賽費用
   - 驗證牌組格式

3. **分析數據不準確**
   - 等待數據同步
   - 檢查時間範圍設置
   - 確認遊戲記錄完整

### 錯誤代碼

- `ONE_PIECE_DECK_INVALID` - 牌組格式無效
- `ONE_PIECE_TOURNAMENT_FULL` - 錦標賽已滿
- `ONE_PIECE_CARD_NOT_FOUND` - 卡片不存在
- `ONE_PIECE_LEADER_MISMATCH` - 領導者不匹配

## 📞 支持

如果您在使用 ONE PIECE TCG 功能時遇到問題，請：

1. 查看本指南的故障排除部分
2. 檢查錯誤日誌
3. 聯繫技術支持團隊

## 🔄 更新日誌

### v1.0.0 (2024-12-19)
- ✅ 初始 ONE PIECE TCG 支持
- ✅ 基礎牌組管理功能
- ✅ 錦標賽系統
- ✅ 排行榜功能
- ✅ 社交媒體集成
- ✅ 遊戲分析功能

---

**最後更新**: 2024-12-19  
**版本**: 1.0.0  
**狀態**: 已完成
