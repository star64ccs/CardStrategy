require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// 基本中間件
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 100, // 限制每個 IP 100 個請求
  message: {
    success: false,
    message: '請求過於頻繁，請稍後再試',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

app.use('/api', limiter);

// 健康檢查端點
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CardStrategy Backend API 運行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    status: 'healthy'
  });
});

// 測試端點
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: '測試端點正常',
    data: {
      message: 'Hello from CardStrategy Backend!',
      timestamp: new Date().toISOString()
    }
  });
});

// 卡片相關端點（模擬數據）
app.get('/api/cards', (req, res) => {
  const mockCards = [
    {
      id: 1,
      name: '青眼白龍',
      description: '傳說中的最強龍族卡片',
      rarity: 'UR',
      price: 9999.99,
      imageUrl: 'https://example.com/blue-eyes-white-dragon.jpg',
      condition: 'mint',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      name: '黑魔導',
      description: '強大的魔法師卡片',
      rarity: 'SR',
      price: 2999.99,
      imageUrl: 'https://example.com/dark-magician.jpg',
      condition: 'near-mint',
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      name: '真紅眼黑龍',
      description: '傳說中的黑龍',
      rarity: 'UR',
      price: 7999.99,
      imageUrl: 'https://example.com/red-eyes-black-dragon.jpg',
      condition: 'excellent',
      createdAt: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    message: '卡片列表獲取成功',
    data: mockCards
  });
});

// 用戶認證端點（模擬）
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // 模擬驗證
  if (email === 'test@cardstrategy.com' && password === 'password123') {
    res.json({
      success: true,
      message: '登錄成功',
      data: {
        user: {
          id: 1,
          name: '測試用戶',
          email: 'test@cardstrategy.com',
          role: 'user'
        },
        token: `mock-jwt-token-${  Date.now()}`
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: '郵箱或密碼錯誤',
      code: 'INVALID_CREDENTIALS'
    });
  }
});

// 卡片掃描端點（模擬）
app.post('/api/cards/scan', (req, res) => {
  const { imageData } = req.body;

  // 模擬掃描結果
  const scanResult = {
    cardName: '青眼白龍',
    confidence: 0.95,
    estimatedPrice: 9999.99,
    condition: 'mint',
    rarity: 'UR',
    description: '傳說中的最強龍族卡片',
    recommendations: [
      '建議進行專業鑑定',
      '市場價格穩定',
      '收藏價值極高'
    ]
  };

  res.json({
    success: true,
    message: '卡片掃描完成',
    data: scanResult
  });
});

// 市場數據端點（模擬）
app.get('/api/market/trends', (req, res) => {
  const mockTrends = {
    topGainers: [
      { name: '青眼白龍', change: '+15%', price: 9999.99 },
      { name: '黑魔導', change: '+8%', price: 2999.99 },
      { name: '真紅眼黑龍', change: '+12%', price: 7999.99 }
    ],
    topLosers: [
      { name: '普通卡片A', change: '-5%', price: 100.00 },
      { name: '普通卡片B', change: '-3%', price: 50.00 }
    ],
    marketSummary: {
      totalVolume: 150000,
      activeCards: 1250,
      averagePrice: 2500
    }
  };

  res.json({
    success: true,
    message: '市場趨勢獲取成功',
    data: mockTrends
  });
});

// 投資組合端點（模擬）
app.get('/api/investments/portfolio', (req, res) => {
  const mockPortfolio = {
    totalValue: 25000,
    totalCards: 15,
    performance: {
      totalReturn: 12.5,
      monthlyReturn: 2.3,
      yearlyReturn: 15.8
    },
    cards: [
      {
        id: 1,
        name: '青眼白龍',
        quantity: 1,
        avgPrice: 8500,
        currentPrice: 9999.99,
        return: 17.6
      },
      {
        id: 2,
        name: '黑魔導',
        quantity: 2,
        avgPrice: 2800,
        currentPrice: 2999.99,
        return: 7.1
      }
    ]
  };

  res.json({
    success: true,
    message: '投資組合獲取成功',
    data: mockPortfolio
  });
});

// 根端點
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'CardStrategy Backend API',
    version: '1.0.0',
    description: '卡片策略投資平台後端 API',
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      cards: '/api/cards',
      auth: '/api/auth/login',
      scan: '/api/cards/scan',
      market: '/api/market/trends',
      portfolio: '/api/investments/portfolio'
    },
    features: [
      '卡片管理',
      '市場分析',
      '投資組合追蹤',
      '卡片掃描識別',
      '價格預測'
    ]
  });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('服務器錯誤:', err);
  res.status(500).json({
    success: false,
    message: '內部服務器錯誤',
    error: process.env.NODE_ENV === 'development' ? err.message : '請稍後再試'
  });
});

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '端點不存在',
    path: req.originalUrl,
    availableEndpoints: [
      '/api/health',
      '/api/test',
      '/api/cards',
      '/api/auth/login',
      '/api/cards/scan',
      '/api/market/trends',
      '/api/investments/portfolio'
    ]
  });
});

// 啟動服務器
app.listen(PORT, () => {
  console.log('🚀 CardStrategy Backend 服務器已啟動');
  console.log(`📍 端口: ${PORT}`);
  console.log(`🌐 地址: http://localhost:${PORT}`);
  console.log(`🔗 健康檢查: http://localhost:${PORT}/api/health`);
  console.log(`📅 啟動時間: ${new Date().toISOString()}`);
  console.log('✨ 功能: 卡片管理、市場分析、投資組合追蹤');
  console.log('🔧 模式: 簡化版本（無 AI 依賴）');
});

// 優雅關閉
process.on('SIGINT', () => {
  console.log('\n🛑 正在關閉服務器...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 正在關閉服務器...');
  process.exit(0);
});
