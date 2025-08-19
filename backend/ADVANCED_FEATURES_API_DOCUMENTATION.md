# CardStrategy 高級功能 API 文檔

## 概述

CardStrategy 高級功能包括實時通知系統、WebSocket 支持、批量操作 API 和數據導出功能。這些功能提供了更強大的數據處理和用戶交互能力。

## 目錄

1. [實時通知系統](#實時通知系統)
2. [WebSocket 支持](#websocket-支持)
3. [批量操作 API](#批量操作-api)
4. [數據導出功能](#數據導出功能)
5. [錯誤代碼](#錯誤代碼)

---

## 實時通知系統

### 概述

實時通知系統支持多種通知渠道，包括 WebSocket、電子郵件、推送通知和短信。系統提供模板化的通知內容和調度功能。

### 通知類型

- **價格變動通知**: 當卡片價格發生顯著變化時
- **投資建議通知**: AI 生成的投資建議
- **系統維護通知**: 系統維護和更新信息
- **安全警報通知**: 安全相關的重要信息
- **新功能通知**: 新功能發布和更新

### 通知渠道

- **WebSocket**: 實時推送
- **電子郵件**: 詳細通知內容
- **推送通知**: 移動端推送
- **短信**: 緊急通知

---

## WebSocket 支持

### 連接

```javascript
// 前端連接示例
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### 事件

#### 客戶端到服務器

- `join-room`: 加入房間
- `leave-room`: 離開房間
- `private-message`: 發送私信
- `room-message`: 發送房間消息
- `broadcast-message`: 廣播消息
- `user-status-update`: 更新用戶狀態
- `heartbeat`: 心跳檢測

#### 服務器到客戶端

- `notification`: 接收通知
- `user-joined`: 用戶加入房間
- `user-left`: 用戶離開房間
- `private-message`: 接收私信
- `room-message`: 接收房間消息
- `broadcast-message`: 接收廣播消息
- `connection-stats`: 連接統計

### 房間管理

```javascript
// 加入房間
socket.emit('join-room', { roomName: 'general' });

// 離開房間
socket.emit('leave-room', { roomName: 'general' });

// 發送房間消息
socket.emit('room-message', {
  roomName: 'general',
  message: 'Hello everyone!',
  timestamp: new Date().toISOString()
});
```

---

## 批量操作 API

### 概述

批量操作 API 使用 Redis 支持的 Bull.js 隊列系統，支持異步處理大量數據操作。

### 端點

#### 提交批量操作

```http
POST /api/batch/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "batch-cards",
  "data": {
    "operation": "bulk-update",
    "cards": [
      {
        "id": 1,
        "currentPrice": 150.00
      },
      {
        "id": 2,
        "currentPrice": 200.00
      }
    ]
  },
  "options": {
    "priority": "normal",
    "delay": 0
  }
}
```

#### 獲取作業狀態

```http
GET /api/batch/status/:jobId
Authorization: Bearer <token>
```

#### 取消作業

```http
DELETE /api/batch/cancel/:jobId
Authorization: Bearer <token>
```

#### 獲取隊列統計

```http
GET /api/batch/stats
Authorization: Bearer <token>
```

### 批量操作類型

#### 卡片批量操作

- `create`: 批量創建卡片
- `update`: 批量更新卡片
- `delete`: 批量刪除卡片
- `bulk-update`: 批量更新卡片價格

#### 投資批量操作

- `create`: 批量創建投資
- `update`: 批量更新投資
- `delete`: 批量刪除投資
- `calculate-returns`: 批量計算回報

#### 市場數據批量操作

- `create`: 批量創建市場數據
- `update`: 批量更新市場數據
- `aggregate`: 批量聚合數據
- `cleanup`: 批量清理舊數據

#### 用戶批量操作

- `update`: 批量更新用戶
- `deactivate`: 批量停用用戶
- `activate`: 批量啟用用戶
- `send-notification`: 批量發送通知

---

## 數據導出功能

### 概述

數據導出功能支持多種格式的數據導出，包括 Excel、CSV、PDF 和 JSON。支持過濾條件和自定義選項。

### 端點

#### 導出卡片數據

```http
GET /api/export/cards?format=excel&name=Charizard&rarity=Legendary&limit=1000
```

**查詢參數:**
- `format`: 導出格式 (excel, csv, pdf, json)
- `name`: 卡片名稱過濾
- `setName`: 系列名稱過濾
- `rarity`: 稀有度過濾
- `cardType`: 卡片類型過濾
- `minPrice`: 最低價格
- `maxPrice`: 最高價格
- `limit`: 記錄數量限制

#### 導出投資數據

```http
GET /api/export/investments?format=pdf&isActive=true&limit=500
Authorization: Bearer <token>
```

**查詢參數:**
- `format`: 導出格式 (excel, csv, pdf, json)
- `isActive`: 活躍狀態過濾
- `minPurchasePrice`: 最低購買價格
- `maxPurchasePrice`: 最高購買價格
- `limit`: 記錄數量限制

#### 導出市場數據

```http
GET /api/export/market?format=csv&cardId=123&startDate=2024-01-01&endDate=2024-12-31
```

**查詢參數:**
- `format`: 導出格式 (excel, csv, pdf, json)
- `cardId`: 卡片 ID 過濾
- `startDate`: 開始日期
- `endDate`: 結束日期
- `limit`: 記錄數量限制

#### 導出用戶數據 (僅管理員)

```http
GET /api/export/users?format=excel&role=user&isActive=true
Authorization: Bearer <admin-token>
```

**查詢參數:**
- `format`: 導出格式 (excel, csv, pdf, json)
- `role`: 用戶角色過濾
- `isActive`: 活躍狀態過濾
- `startDate`: 開始日期
- `endDate`: 結束日期
- `limit`: 記錄數量限制

#### 生成投資組合報告

```http
GET /api/export/portfolio?format=pdf
Authorization: Bearer <token>
```

**查詢參數:**
- `format`: 報告格式 (pdf, excel, json)

#### 批量導出

```http
POST /api/export/batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "exports": [
    {
      "type": "cards",
      "format": "excel",
      "filters": {
        "rarity": "Legendary"
      },
      "options": {
        "limit": 1000
      }
    },
    {
      "type": "investments",
      "format": "pdf",
      "filters": {
        "isActive": true
      }
    },
    {
      "type": "portfolio",
      "format": "excel"
    }
  ]
}
```

#### 下載導出文件

```http
GET /api/export/download/filename_timestamp.xlsx
Authorization: Bearer <token>
```

#### 獲取導出統計 (僅管理員)

```http
GET /api/export/stats
Authorization: Bearer <admin-token>
```

#### 清理過期文件 (僅管理員)

```http
DELETE /api/export/cleanup?daysToKeep=7
Authorization: Bearer <admin-token>
```

### 導出格式詳情

#### Excel 格式

- 支持多個工作表
- 自動調整列寬
- 標題樣式設置
- 數據格式化

#### CSV 格式

- UTF-8 編碼
- 標準 CSV 格式
- 自動處理特殊字符

#### PDF 格式

- 專業報告格式
- 自動分頁
- 表格和圖表支持
- 投資組合報告專用模板

#### JSON 格式

- 結構化數據
- 包含元數據信息
- 易於程序處理

### 投資組合報告

投資組合報告包含以下內容：

1. **投資組合摘要**
   - 總投資數量
   - 總成本
   - 當前價值
   - 總回報
   - 回報率

2. **最佳表現者**
   - 前 5 個最佳表現的投資
   - 回報率和當前價值

3. **投資詳情**
   - 所有投資的詳細信息
   - 卡片信息
   - 購買和當前價格
   - 回報計算

---

## 錯誤代碼

### WebSocket 錯誤

- `WEBSOCKET_AUTH_ERROR`: WebSocket 認證失敗
- `WEBSOCKET_RATE_LIMIT`: WebSocket 速率限制
- `WEBSOCKET_ROOM_FULL`: 房間已滿
- `WEBSOCKET_INVALID_MESSAGE`: 無效消息格式

### 批量操作錯誤

- `BATCH_OPERATION_ERROR`: 批量操作失敗
- `BATCH_JOB_NOT_FOUND`: 作業不存在
- `BATCH_JOB_CANCELLED`: 作業已取消
- `BATCH_QUEUE_FULL`: 隊列已滿

### 數據導出錯誤

- `EXPORT_CARDS_ERROR`: 導出卡片數據失敗
- `EXPORT_INVESTMENTS_ERROR`: 導出投資數據失敗
- `EXPORT_MARKET_ERROR`: 導出市場數據失敗
- `EXPORT_USERS_ERROR`: 導出用戶數據失敗
- `PORTFOLIO_REPORT_ERROR`: 生成投資組合報告失敗
- `BATCH_EXPORT_ERROR`: 批量導出失敗
- `EXPORT_STATS_ERROR`: 獲取導出統計失敗
- `EXPORT_CLEANUP_ERROR`: 清理過期文件失敗
- `DOWNLOAD_ERROR`: 下載文件失敗
- `INVALID_FILENAME`: 無效文件名格式
- `FILE_NOT_FOUND`: 文件不存在

### 通知錯誤

- `NOTIFICATION_SEND_ERROR`: 發送通知失敗
- `NOTIFICATION_TEMPLATE_ERROR`: 通知模板錯誤
- `NOTIFICATION_CHANNEL_ERROR`: 通知渠道錯誤

---

## 使用示例

### 前端 WebSocket 集成

```javascript
import io from 'socket.io-client';

class WebSocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    this.socket = io('http://localhost:5000', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('WebSocket 已連接');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('WebSocket 已斷開');
    });

    this.socket.on('notification', (notification) => {
      console.log('收到通知:', notification);
      this.showNotification(notification);
    });
  }

  joinRoom(roomName) {
    if (this.isConnected) {
      this.socket.emit('join-room', { roomName });
    }
  }

  sendMessage(roomName, message) {
    if (this.isConnected) {
      this.socket.emit('room-message', {
        roomName,
        message,
        timestamp: new Date().toISOString()
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
```

### 數據導出集成

```javascript
class DataExportManager {
  async exportCards(format, filters = {}) {
    const params = new URLSearchParams({
      format,
      ...filters
    });

    const response = await fetch(`/api/export/cards?${params}`);
    const result = await response.json();

    if (result.success) {
      // 下載文件
      window.open(`/api/export/download/${result.data.filename}`);
    } else {
      throw new Error(result.message);
    }
  }

  async generatePortfolioReport(format = 'pdf') {
    const response = await fetch(`/api/export/portfolio?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    const result = await response.json();

    if (result.success) {
      window.open(`/api/export/download/${result.data.filename}`);
    } else {
      throw new Error(result.message);
    }
  }

  async batchExport(exports) {
    const response = await fetch('/api/export/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ exports })
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  }
}
```

### 批量操作集成

```javascript
class BatchOperationManager {
  async submitBatchOperation(type, data, options = {}) {
    const response = await fetch('/api/batch/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({
        type,
        data,
        options
      })
    });

    const result = await response.json();

    if (result.success) {
      return result.data.jobId;
    } else {
      throw new Error(result.message);
    }
  }

  async getJobStatus(jobId) {
    const response = await fetch(`/api/batch/status/${jobId}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  }

  async cancelJob(jobId) {
    const response = await fetch(`/api/batch/cancel/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  }
}
```

---

## 配置說明

### 環境變量

```bash
# Redis 配置
REDIS_URL=redis://localhost:6379

# 電子郵件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 文件存儲配置
EXPORT_DIRECTORY=./exports
MAX_FILE_SIZE=10485760  # 10MB

# WebSocket 配置
WS_HEARTBEAT_INTERVAL=30000
WS_CONNECTION_TIMEOUT=60000
```

### 服務配置

```javascript
// WebSocket 服務配置
const wsConfig = {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'],
  heartbeatInterval: 30000,
  connectionTimeout: 60000
};

// 通知服務配置
const notificationConfig = {
  email: {
    from: process.env.SMTP_USER,
    templates: {
      priceChange: './templates/price-change.html',
      investmentAdvice: './templates/investment-advice.html'
    }
  },
  scheduling: {
    priceCheckInterval: '0 * * * *', // 每小時
    marketSummaryInterval: '0 9 * * *', // 每天上午9點
    weeklyReportInterval: '0 9 * * 1' // 每週一上午9點
  }
};

// 批量操作配置
const batchConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  },
  queue: {
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50
    }
  }
};
```

---

## 性能考慮

### WebSocket 性能

- 連接池管理
- 心跳檢測
- 自動重連機制
- 消息隊列緩衝

### 批量操作性能

- Redis 隊列持久化
- 作業優先級管理
- 並發處理控制
- 內存使用優化

### 數據導出性能

- 流式處理大文件
- 異步文件生成
- 文件壓縮
- 自動清理機制

---

## 安全考慮

### WebSocket 安全

- JWT 認證
- 速率限制
- 消息驗證
- 連接超時

### 數據導出安全

- 文件類型驗證
- 路徑遍歷防護
- 用戶權限檢查
- 文件大小限制

### 批量操作安全

- 作業驗證
- 資源限制
- 錯誤處理
- 日誌記錄

---

## 監控和日誌

### 監控指標

- WebSocket 連接數
- 通知發送成功率
- 批量作業完成率
- 文件導出統計

### 日誌記錄

- 連接事件
- 錯誤詳情
- 性能指標
- 用戶操作

---

## 故障排除

### 常見問題

1. **WebSocket 連接失敗**
   - 檢查 JWT 令牌
   - 驗證 CORS 配置
   - 確認服務器狀態

2. **通知發送失敗**
   - 檢查 SMTP 配置
   - 驗證模板文件
   - 確認用戶權限

3. **批量操作超時**
   - 檢查 Redis 連接
   - 調整作業優先級
   - 優化數據處理邏輯

4. **文件導出失敗**
   - 檢查磁盤空間
   - 驗證文件權限
   - 確認數據庫連接

### 調試工具

- WebSocket 連接測試
- 隊列狀態監控
- 文件導出日誌
- 性能分析工具
