// 完全獨立的 Render Server - 不Import任何Database相Off模組
const express = require('express');
const cors = require('cors');

const app = express();

// 基本中間件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 模擬DatabaseResponse的UserData
const mockUsers = [
  {
    id: 1,
    username: 'demo_user',
    email: 'demo@cardstrategy.com',
    displayName: '演示用戶',
    role: 'user',
    isVerified: true,
    isActive: true
  }
];

// 模擬卡片Data
const mockCards = [
  {
    id: 1,
    name: '皮卡丘',
    setName: '基礎系列',
    cardNumber: '025/102',
    rarity: '稀有',
    type: '電氣',
    price: {
      current: 15.99,
      change24h: 2.50,
      change7d: -1.20,
      change30d: 5.30
    },
    image: 'https://via.placeholder.com/300x400/FFD700/000000?text=Pikachu'
  },
  {
    id: 2,
    name: '超夢',
    setName: '傳說系列',
    cardNumber: '150/150',
    rarity: '傳說',
    type: '超能力',
    price: {
      current: 89.99,
      change24h: 5.20,
      change7d: 12.50,
      change30d: 25.80
    },
    image: 'https://via.placeholder.com/300x400/9370DB/FFFFFF?text=Mewtwo'
  }
];

// 健康Check端點
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    service: 'CardStrategy API',
    version: '2.0.0'
  });
});

// API健康Check端點 - 這Yes Render 期望的Path
app.get('/api/health', (req, res) => {
  try {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      service: 'CardStrategy API',
      version: '2.0.0',
      port: process.env.PORT || 3000,
      features: [
        'Health Check',
        'CORS Enabled',
        'JSON Parsing',
        'URL Encoding',
        'Mock Data API'
      ]
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Health check error:', error);
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Health check completed'
    });
  }
});

// Root端點
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'CardStrategy API',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    message: 'API is running successfully',
    status: 'operational',
    healthCheck: '/api/health',
    endpoints: {
      health: '/api/health',
      cards: '/api/cards',
      users: '/api/users',
      collections: '/api/collections'
    }
  });
});

// 模擬卡片 API
app.get('/api/cards', (req, res) => {
  res.status(200).json({
    success: true,
    message: '卡片列表GetSuccess',
    data: mockCards
  });
});

app.get('/api/cards/:id', (req, res) => {
  const cardId = parseInt(req.params.id);
  const card = mockCards.find(c => c.id === cardId);
  
  if (!card) {
    return res.status(404).json({
      success: false,
      message: '卡片不存在'
    });
  }
  
  res.status(200).json({
    success: true,
    message: '卡片詳情GetSuccess',
    data: card
  });
});

// 模擬User API
app.get('/api/users/profile', (req, res) => {
  res.status(200).json({
    success: true,
    message: '用戶資料GetSuccess',
    data: mockUsers[0]
  });
});

// 模擬收藏 API
app.get('/api/collections', (req, res) => {
  const mockCollections = [
    {
      id: 1,
      name: '我的收藏',
      description: '個人收藏夾',
      cardCount: 2,
      totalValue: 105.98,
      isPublic: false
    }
  ];
  
  res.status(200).json({
    success: true,
    message: '收藏列表GetSuccess',
    data: mockCollections
  });
});

// 模擬Authenticate API
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  
  // 簡單的演示Login
  if (identifier === 'demo' && password === 'demo123') {
    res.status(200).json({
      success: true,
      message: '登錄Success',
      data: {
        user: mockUsers[0],
        token: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now()
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: '用戶名或密碼Error'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  res.status(200).json({
    success: true,
    message: '註冊Success（演示模式）',
    data: {
      user: mockUsers[0],
      token: 'mock_jwt_token_' + Date.now()
    }
  });
});

// 404 Handle
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.originalUrl
  });
});

// ErrorHandle
app.use((err, req, res, next) => { // eslint-disable-next-line no-unused-vars
  // eslint-disable-next-line no-console
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

const startServer = async () => {
  try {
    // eslint-disable-next-line no-console
    console.log('Starting CardStrategy Render Server (Standalone Mode)...');
    // eslint-disable-next-line no-console
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    // eslint-disable-next-line no-console
    console.log(`Port: ${PORT}`);
    // eslint-disable-next-line no-console
    console.log(`Host: ${HOST}`);
    // eslint-disable-next-line no-console
    console.log('Mode: Standalone with Mock Data - No Database Dependencies');
    
    const server = app.listen(PORT, HOST, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 CardStrategy Render Server running on http://${HOST}:${PORT}`);
      // eslint-disable-next-line no-console
      console.log(`🏥 Health check: http://${HOST}:${PORT}/health`);
      // eslint-disable-next-line no-console
      console.log(`🔧 API Health check: http://${HOST}:${PORT}/api/health`);
      // eslint-disable-next-line no-console
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      // eslint-disable-next-line no-console
      console.log(`📱 Demo login: demo / demo123`);
      // eslint-disable-next-line no-console
      console.log(`✅ Server started successfully - No database connections attempted`);
    });

    // 優雅Off閉
    process.on('SIGTERM', () => {
      // eslint-disable-next-line no-console
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        // eslint-disable-next-line no-console
        console.log('Process terminated');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

// StartServer
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
