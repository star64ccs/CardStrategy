const cors = require('cors');

// 安全的CORS配置
const corsOptions = {
  origin: (origin, callback) => {
    // 允許的域名列表
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://yourdomain.com',
      // 添加生產環境域名
    ];

    // 在開發環境允許沒有origin的請求
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('不允許的CORS來源'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['X-CSRF-Token'],
  maxAge: 86400 // 24小時
};

// CORS錯誤處理
const corsErrorHandler = (err, req, res, next) => {
  if (err.message === '不允許的CORS來源') {
    res.status(403).json({
      error: '跨域請求被拒絕',
      message: '請檢查請求來源是否被允許'
    });
  } else {
    next(err);
  }
};

module.exports = {
  corsOptions,
  corsErrorHandler
};