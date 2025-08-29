/* eslint-env jest */

/**
 * 測試隔離設置
 * 確保每個測試在獨立的環境中運行
 */

// 全局測試隔離設置
beforeAll(() => {
  // 清理全局狀態
  global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
});

beforeEach(() => {
  // 每個測試前清理
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
  
  // 清理計時器
  jest.clearAllTimers();
  
  // 不重置模組緩存，避免破壞 mock
  // jest.resetModules();
});

afterEach(() => {
  // 每個測試後清理
  jest.clearAllMocks();
  jest.clearAllTimers();
});

afterAll(() => {
  // 所有測試後清理
  jest.clearAllMocks();
  jest.clearAllTimers();
  // 不重置模組緩存，避免破壞 mock
  // jest.resetModules();
});

// 模組隔離
const originalRequire = require;
const moduleCache = new Map();

// 隔離模組加載
function isolatedRequire(modulePath) {
  const cacheKey = modulePath;
  
  if (!moduleCache.has(cacheKey)) {
    // 清除模組緩存
    delete require.cache[require.resolve(modulePath)];
    const module = originalRequire(modulePath);
    moduleCache.set(cacheKey, module);
  }
  
  return moduleCache.get(cacheKey);
}

// 導出隔離設置
module.exports = {
  isolatedRequire,
  moduleCache,
};
