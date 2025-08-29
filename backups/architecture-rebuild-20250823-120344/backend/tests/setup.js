/* eslint-env jest */

// 測試環境設置
require('dotenv').config({ path: '.env.test' });

// 設置測試環境變量
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'cardstrategy_test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';

// 全局測試超時
jest.setTimeout(10000);

// 清理控制台輸出
beforeEach(() => {
  jest.clearAllMocks();
});

// 測試完成後清理
afterAll(async () => {
  // 清理測試數據庫連接
  if (global.testDb) {
    await global.testDb.close();
  }

  // 清理測試 Redis 連接
  if (global.testRedis) {
    await global.testRedis.disconnect();
  }
});

// 全局測試工具函數
global.testUtils = {
  // 創建測試用戶
  createTestUser: (userData = {}) => ({
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    role: 'user',
    ...userData,
  }),

  // 創建測試卡片
  createTestCard: (cardData = {}) => ({
    id: 1,
    name: 'Test Card',
    type: 'monster',
    rarity: 'common',
    price: 10.0,
    ...cardData,
  }),

  // 模擬請求對象
  mockRequest: (data = {}) => ({
    body: {},
    query: {},
    params: {},
    headers: {},
    ...data,
  }),

  // 模擬響應對象
  mockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  },

  // 模擬下一個函數
  mockNext: jest.fn(),

  // 等待指定時間
  wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

  // 生成隨機字符串
  randomString: (length = 10) => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // 生成隨機郵箱
  randomEmail: () => `test-${Date.now()}@example.com`,

  // 生成隨機用戶名
  randomUsername: () => `user-${Date.now()}`,

  // 清理測試數據
  cleanupTestData: async () => {
    // 這裡可以添加清理測試數據的邏輯
    // console.log('Cleaning up test data...');
  },
};

// 模擬 console 方法以避免測試輸出
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// 模擬 process.exit
process.exit = jest.fn();

// 設置測試數據庫配置
process.env.TEST_DB_CONFIG = JSON.stringify({
  host: 'localhost',
  port: 5432,
  database: 'cardstrategy_test',
  username: 'postgres',
  password: 'password',
  dialect: 'postgres',
  logging: false,
});

// 設置測試 Redis 配置
process.env.TEST_REDIS_CONFIG = JSON.stringify({
  host: 'localhost',
  port: 6379,
  password: null,
  db: 1,
});

// 錯誤處理
process.on('unhandledRejection', (reason, promise) => {
  // console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  // console.error('Uncaught Exception:', error);
});
