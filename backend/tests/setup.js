// 測試環境設置
process.env.NODE_ENV = 'test';

// 設置測試數據庫配置
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'cardstrategy_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'password';

// 設置 JWT 密鑰
process.env.JWT_SECRET = 'test-jwt-secret-key';

// 設置 Redis 配置
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';

// 設置其他環境變量
process.env.PORT = '3001';
process.env.API_VERSION = 'v1';
process.env.TZ = 'UTC';

// 全局測試超時
jest.setTimeout(30000);

// 全局錯誤處理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// 模擬 console 方法以避免測試輸出噪音
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// 模擬文件系統操作
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn()
}));

// 模擬路徑操作
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => args.join('/'))
}));

// 模擬 TensorFlow.js
jest.mock('@tensorflow/tfjs-node', () => ({
  loadLayersModel: jest.fn(),
  save: jest.fn(),
  tensor: jest.fn(),
  sequential: jest.fn(() => ({
    add: jest.fn().mockReturnThis(),
    compile: jest.fn().mockReturnThis(),
    fit: jest.fn().mockResolvedValue({ history: { loss: [0.5], accuracy: [0.8] } }),
    predict: jest.fn().mockReturnValue([[[100]]]),
    save: jest.fn().mockResolvedValue({})
  })),
  layers: {
    dense: jest.fn(() => ({})),
    lstm: jest.fn(() => ({})),
    gru: jest.fn(() => ({})),
    dropout: jest.fn(() => ({}))
  },
  losses: {
    meanSquaredError: jest.fn()
  },
  optimizers: {
    adam: jest.fn()
  }
}));

// 模擬 Redis
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn().mockResolvedValue(),
    disconnect: jest.fn().mockResolvedValue(),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    expire: jest.fn().mockResolvedValue(1),
    on: jest.fn()
  }))
}));

// 模擬 Bull 隊列
jest.mock('bull', () => {
  return jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: 'test-job-id' }),
    process: jest.fn(),
    on: jest.fn(),
    close: jest.fn().mockResolvedValue(),
    getJob: jest.fn().mockResolvedValue({
      id: 'test-job-id',
      data: {},
      progress: jest.fn(),
      finished: jest.fn()
    }),
    getJobs: jest.fn().mockResolvedValue([]),
    clean: jest.fn().mockResolvedValue([])
  }));
});

// 模擬 Socket.IO
jest.mock('socket.io', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    of: jest.fn().mockReturnThis(),
    use: jest.fn(),
    attach: jest.fn(),
    listen: jest.fn(),
    close: jest.fn()
  }));
});

// 模擬 Nodemailer
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-message-id',
      response: 'OK'
    })
  })
}));

// 模擬 Multer
jest.mock('multer', () => {
  return jest.fn().mockImplementation(() => {
    return {
      single: jest.fn().mockReturnValue((req, res, next) => {
        req.file = {
          fieldname: 'image',
          originalname: 'test.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          size: 1024,
          destination: '/tmp',
          filename: 'test.jpg',
          path: '/tmp/test.jpg'
        };
        next();
      }),
      array: jest.fn().mockReturnValue((req, res, next) => {
        req.files = [];
        next();
      })
    };
  });
});

// 模擬 Sharp
jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => ({
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-image')),
    toFile: jest.fn().mockResolvedValue({}),
    metadata: jest.fn().mockResolvedValue({
      width: 800,
      height: 600,
      format: 'jpeg'
    })
  }));
});

// 模擬 ExcelJS
jest.mock('exceljs', () => ({
  Workbook: jest.fn().mockImplementation(() => ({
    addWorksheet: jest.fn().mockReturnValue({
      addRow: jest.fn(),
      addRows: jest.fn(),
      getColumn: jest.fn().mockReturnValue({
        width: 15
      })
    }),
    xlsx: {
      writeFile: jest.fn().mockResolvedValue(),
      writeBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-excel'))
    }
  }))
}));

// 模擬 PDFKit
jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => ({
    pipe: jest.fn().mockReturnThis(),
    font: jest.fn().mockReturnThis(),
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    addPage: jest.fn().mockReturnThis(),
    end: jest.fn().mockResolvedValue()
  }));
});

// 模擬 Node-Cron
jest.mock('node-cron', () => ({
  schedule: jest.fn().mockReturnValue({
    start: jest.fn(),
    stop: jest.fn()
  })
}));

// 模擬 UUID
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid')
}));

// 模擬 Moment
jest.mock('moment', () => {
  const moment = jest.requireActual('moment');
  return jest.fn((date) => moment(date || '2024-01-01'));
});

// 模擬 Lodash
jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  debounce: jest.fn((fn) => fn),
  throttle: jest.fn((fn) => fn)
}));

// 模擬 Joi
jest.mock('joi', () => ({
  ...jest.requireActual('joi'),
  validate: jest.fn().mockReturnValue({ error: null, value: {} })
}));

// 模擬 AWS SDK
jest.mock('aws-sdk', () => ({
  S3: jest.fn().mockImplementation(() => ({
    upload: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({ Location: 'https://s3.amazonaws.com/test-bucket/test.jpg' })
    }),
    getObject: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({ Body: Buffer.from('fake-file') })
    }),
    deleteObject: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({})
    })
  }))
}));

// 模擬 Multer-S3
jest.mock('multer-s3', () => {
  return jest.fn().mockImplementation(() => {
    return {
      single: jest.fn().mockReturnValue((req, res, next) => {
        req.file = {
          fieldname: 'image',
          originalname: 'test.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          size: 1024,
          bucket: 'test-bucket',
          key: 'test.jpg',
          acl: 'public-read',
          location: 'https://s3.amazonaws.com/test-bucket/test.jpg'
        };
        next();
      })
    };
  });
});

// 模擬 Fluent-FFmpeg
jest.mock('fluent-ffmpeg', () => {
  return jest.fn().mockImplementation(() => ({
    input: jest.fn().mockReturnThis(),
    output: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    run: jest.fn().mockResolvedValue(),
    save: jest.fn().mockResolvedValue()
  }));
});

// 模擬 Express-WS
jest.mock('express-ws', () => jest.fn());

// 模擬 WS
jest.mock('ws', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    send: jest.fn(),
    close: jest.fn()
  }));
});

// 模擬 EventEmitter2
jest.mock('eventemitter2', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    removeAllListeners: jest.fn()
  }));
});

// 模擬 Circuit Breaker
jest.mock('circuit-breaker-js', () => {
  return jest.fn().mockImplementation(() => ({
    fire: jest.fn().mockResolvedValue('success'),
    fallback: jest.fn(),
    onSuccess: jest.fn(),
    onTimeout: jest.fn(),
    onReject: jest.fn(),
    onFallback: jest.fn(),
    onOpen: jest.fn(),
    onHalfOpen: jest.fn(),
    onClose: jest.fn()
  }));
});

// 模擬 Retry
jest.mock('retry', () => ({
  operation: jest.fn().mockReturnValue({
    attempt: jest.fn(),
    retry: jest.fn(),
    stop: jest.fn()
  })
}));

// 模擬 Backoff
jest.mock('backoff', () => ({
  exponential: jest.fn().mockReturnValue({
    backoff: jest.fn(),
    failAfter: jest.fn(),
    on: jest.fn(),
    start: jest.fn(),
    stop: jest.fn()
  })
}));

// 模擬 Rate Limiter Flexible
jest.mock('rate-limiter-flexible', () => ({
  RateLimiterRedis: jest.fn().mockImplementation(() => ({
    consume: jest.fn().mockResolvedValue({ remainingPoints: 9, msBeforeNext: 60000 }),
    get: jest.fn().mockResolvedValue({ remainingPoints: 10, msBeforeNext: 0 }),
    resetKey: jest.fn().mockResolvedValue()
  })),
  RateLimiterMemory: jest.fn().mockImplementation(() => ({
    consume: jest.fn().mockResolvedValue({ remainingPoints: 9, msBeforeNext: 60000 }),
    get: jest.fn().mockResolvedValue({ remainingPoints: 10, msBeforeNext: 0 }),
    resetKey: jest.fn().mockResolvedValue()
  }))
}));

// 模擬 Express Slow Down
jest.mock('express-slow-down', () => jest.fn(() => (req, res, next) => next()));

// 模擬 Express Brute
jest.mock('express-brute', () => {
  return jest.fn().mockImplementation(() => ({
    prevent: jest.fn().mockReturnValue((req, res, next) => next()),
    reset: jest.fn().mockResolvedValue()
  }));
});

// 模擬 Express Brute (簡化版本)
jest.mock('express-brute', () => {
  return jest.fn().mockImplementation(() => ({
    prevent: jest.fn().mockReturnValue((req, res, next) => next()),
    reset: jest.fn().mockResolvedValue()
  }));
});


// 全局測試工具函數
global.testUtils = {
  // 創建測試用戶
  createTestUser: async (userData = {}) => {
    const User = require('../../src/models/User');
    const bcrypt = require('bcryptjs');

    const defaultData = {
      username: 'testuser',
      email: 'test@example.com',
      password: await bcrypt.hash('testpassword123', 10),
      role: 'user',
      ...userData
    };

    return await User.create(defaultData);
  },

  // 創建測試卡片
  createTestCard: async (cardData = {}) => {
    const Card = require('../../src/models/Card');

    const defaultData = {
      name: 'Test Card',
      setName: 'Test Set',
      rarity: 'Rare',
      cardType: 'Creature',
      currentPrice: 100,
      marketCap: 1000000,
      totalSupply: 1000,
      imageUrl: 'https://example.com/card.jpg',
      description: 'Test card description',
      ...cardData
    };

    return await Card.create(defaultData);
  },

  // 創建測試投資
  createTestInvestment: async (userId, cardId, investmentData = {}) => {
    const Investment = require('../../src/models/Investment');

    const defaultData = {
      userId,
      cardId,
      quantity: 1,
      purchasePrice: 100,
      purchaseDate: new Date(),
      ...investmentData
    };

    return await Investment.create(defaultData);
  },

  // 清理測試數據
  cleanupTestData: async () => {
    const User = require('../../src/models/User');
    const Card = require('../../src/models/Card');
    const Investment = require('../../src/models/Investment');
    const MarketData = require('../../src/models/MarketData');

    await User.destroy({ where: {} });
    await Card.destroy({ where: {} });
    await Investment.destroy({ where: {} });
    await MarketData.destroy({ where: {} });
  },

  // 生成測試 JWT token
  generateTestToken: (userId, role = 'user') => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET || 'test-jwt-secret-key',
      { expiresIn: '1h' }
    );
  },

  // 等待指定時間
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // 模擬請求
  mockRequest: (data = {}) => ({
    body: {},
    query: {},
    params: {},
    headers: {},
    user: null,
    ...data
  }),

  // 模擬響應
  mockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.redirect = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    res.getHeader = jest.fn();
    return res;
  },

  // 模擬下一個中間件
  mockNext: () => jest.fn()
};
