# 開發者指南

## 🔧 CardStrategy 開發者完整指南

本指南將幫助開發者了解 CardStrategy 項目的開發環境、架構和開發流程。

### 🎯 項目概述

CardStrategy 是一個全棧卡片管理應用，包含：

- **前端**: React Native + Expo (移動端) + React (Web端)
- **後端**: Node.js + Express + PostgreSQL
- **AI 服務**: OpenAI + Google PaLM
- **雲服務**: Render + Cloudinary + Sentry

### 🛠️ 開發環境設置

#### 系統要求

- **Node.js**: 18.0.0+
- **npm**: 8.0.0+
- **Git**: 2.0.0+
- **PostgreSQL**: 14.0+
- **Redis**: 6.0+ (可選)

#### 開發工具推薦

- **IDE**: VS Code
- **終端**: iTerm2 (macOS) / Windows Terminal
- **數據庫工具**: pgAdmin / DBeaver
- **API 測試**: Postman / Insomnia

### 📁 項目結構

```
cardstrategy/
├── src/                    # 前端源代碼
│   ├── components/         # React 組件
│   ├── screens/           # 頁面組件
│   ├── services/          # API 服務
│   ├── store/             # Redux 狀態管理
│   ├── utils/             # 工具函數
│   ├── types/             # TypeScript 類型
│   └── i18n/              # 國際化
├── backend/               # 後端源代碼
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 數據模型
│   │   ├── routes/        # 路由
│   │   ├── middleware/    # 中間件
│   │   └── utils/         # 工具函數
│   └── tests/             # 後端測試
├── docs/                  # 文檔
├── scripts/               # 腳本文件
└── .github/               # GitHub Actions
```

### 🚀 開發流程

#### 1. 環境準備

```bash
# 克隆項目
git clone https://github.com/your-username/cardstrategy.git
cd cardstrategy

# 安裝依賴
npm install
cd backend && npm install && cd ..

# 設置環境變量
cp env.example .env
# 編輯 .env 文件
```

#### 2. 數據庫設置

```bash
# 創建數據庫
createdb cardstrategy_dev

# 運行遷移
cd backend
npm run migrate

# 填充測試數據
npm run seed
```

#### 3. 啟動開發服務器

```bash
# 啟動後端
cd backend
npm run dev

# 啟動前端 (新終端)
npm start
```

### 📝 代碼規範

#### TypeScript 規範

```typescript
// 接口定義
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// 類型別名
type UserRole = 'admin' | 'user' | 'moderator';

// 枚舉
enum CardRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  MYTHIC = 'mythic'
}
```

#### React 組件規範

```typescript
// 函數組件
interface CardItemProps {
  card: Card;
  onPress: (card: Card) => void;
  showPrice?: boolean;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  onPress,
  showPrice = true
}) => {
  return (
    <TouchableOpacity onPress={() => onPress(card)}>
      <Text>{card.name}</Text>
      {showPrice && <Text>{card.price}</Text>}
    </TouchableOpacity>
  );
};
```

#### API 服務規範

```typescript
// API 服務類
class CardService {
  private baseUrl = '/api/cards';

  async getCards(params?: CardQueryParams): Promise<ApiResponse<Card[]>> {
    try {
      const response = await apiService.get(this.baseUrl, { params });
      return this.validateResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private validateResponse(response: any): ApiResponse<Card[]> {
    // 驗證邏輯
  }

  private handleError(error: any): Error {
    // 錯誤處理邏輯
  }
}
```

### 🧪 測試開發

#### 單元測試

```typescript
// 服務測試
describe('CardService', () => {
  let cardService: CardService;
  let mockApiService: jest.Mocked<ApiService>;

  beforeEach(() => {
    mockApiService = createMockApiService();
    cardService = new CardService(mockApiService);
  });

  it('應該成功獲取卡片列表', async () => {
    const mockCards = [createMockCard()];
    mockApiService.get.mockResolvedValue({
      success: true,
      data: mockCards
    });

    const result = await cardService.getCards();

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockCards);
  });
});
```

#### 組件測試

```typescript
// 組件測試
describe('CardItem Component', () => {
  it('應該正確渲染卡片信息', () => {
    const mockCard = createMockCard();
    const onPress = jest.fn();

    const { getByText } = render(
      <CardItem card={mockCard} onPress={onPress} />
    );

    expect(getByText(mockCard.name)).toBeTruthy();
    expect(getByText(mockCard.price.toString())).toBeTruthy();
  });
});
```

### 🔄 Git 工作流

#### 分支策略

- **main**: 生產環境代碼
- **develop**: 開發環境代碼
- **feature/***: 功能開發分支
- **bugfix/***: 錯誤修復分支
- **hotfix/***: 緊急修復分支

#### 提交規範

```bash
# 提交格式
<type>(<scope>): <subject>

# 類型
feat:     新功能
fix:      錯誤修復
docs:     文檔更新
style:    代碼格式
refactor: 重構
test:     測試
chore:    構建過程或輔助工具的變動

# 示例
feat(card): 添加卡片掃描功能
fix(auth): 修復登錄驗證問題
docs(api): 更新 API 文檔
```

### 📦 構建和部署

#### 本地構建

```bash
# 前端構建
npm run build:web
npm run build:mobile

# 後端構建
cd backend
npm run build
```

#### 部署流程

```bash
# 自動部署
./scripts/deploy.sh

# 手動部署
npm run deploy:staging
npm run deploy:production
```

### 🔍 調試技巧

#### 前端調試

```typescript
// 使用 React Native Debugger
import { debug } from 'react-native';

// 使用 Flipper
import { Flipper } from 'react-native-flipper';

// 使用 Sentry
import * as Sentry from '@sentry/react-native';
```

#### 後端調試

```javascript
// 使用 Winston 日誌
import { logger } from './utils/logger';

logger.info('用戶登錄', { userId, timestamp });
logger.error('數據庫連接失敗', { error: err.message });

// 使用 New Relic
const newrelic = require('newrelic');
newrelic.recordCustomEvent('CardScan', { cardId, scanTime });
```

### 📊 性能優化

#### 前端優化

```typescript
// 使用 React.memo
const CardItem = React.memo(({ card, onPress }) => {
  return <TouchableOpacity onPress={() => onPress(card)}>
    <Text>{card.name}</Text>
  </TouchableOpacity>;
});

// 使用 useMemo
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// 使用 useCallback
const handlePress = useCallback((card) => {
  onCardPress(card);
}, [onCardPress]);
```

#### 後端優化

```javascript
// 數據庫查詢優化
const getCards = async (params) => {
  const query = Card.query()
    .select('id', 'name', 'price', 'rarity')
    .where('active', true)
    .orderBy('created_at', 'desc')
    .limit(params.limit)
    .offset(params.offset);

  return await query;
};

// 緩存優化
const getCachedCards = async (key) => {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const cards = await getCards();
  await redis.setex(key, 3600, JSON.stringify(cards));
  return cards;
};
```

### 🔒 安全最佳實踐

#### 前端安全

```typescript
// 輸入驗證
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

// XSS 防護
import DOMPurify from 'dompurify';

const sanitizedHtml = DOMPurify.sanitize(userInput);
```

#### 後端安全

```javascript
// 身份驗證中間件
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '未提供令牌' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '令牌無效' });
    }
    req.user = user;
    next();
  });
};

// SQL 注入防護
const getCardById = async (id) => {
  return await Card.query().findById(id);
};
```

### 📈 監控和分析

#### 性能監控

```javascript
// 使用 New Relic
const newrelic = require('newrelic');

// 自定義指標
newrelic.recordMetric('Custom/CardScan/Duration', scanDuration);
newrelic.recordMetric('Custom/CardScan/Success', successRate);

// 錯誤追蹤
newrelic.noticeError(new Error('掃描失敗'), {
  cardId: cardId,
  scanType: scanType
});
```

#### 日誌管理

```javascript
// 結構化日誌
logger.info('用戶操作', {
  userId: user.id,
  action: 'card_scan',
  cardId: card.id,
  timestamp: new Date().toISOString(),
  metadata: {
    scanDuration: duration,
    scanQuality: quality
  }
});
```

### 🤝 團隊協作

#### 代碼審查

- 所有代碼必須經過 PR 審查
- 使用 GitHub 的 PR 模板
- 確保測試覆蓋率達標
- 遵循代碼規範

#### 文檔維護

- 及時更新 API 文檔
- 維護開發文檔
- 記錄重要決策
- 更新變更日誌

### 📚 學習資源

#### 官方文檔

- [React Native 文檔](https://reactnative.dev/)
- [Expo 文檔](https://docs.expo.dev/)
- [Node.js 文檔](https://nodejs.org/docs/)
- [PostgreSQL 文檔](https://www.postgresql.org/docs/)

#### 社區資源

- [React Native 社區](https://github.com/react-native-community)
- [Expo 社區](https://forums.expo.dev/)
- [Node.js 社區](https://nodejs.org/en/community/)

---

**版本**: 1.0.0  
**最後更新**: 2024-12-19  
**狀態**: 開發者指南完成 ✅
