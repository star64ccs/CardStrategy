/* eslint-env jest */

/**
 * Test隔離Settings
 * 確保每個Test在獨立的環境中運Row
 */

// GlobalTest隔離Settings
beforeAll(() => {
  // 清理GlobalStatus
  global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
});

beforeEach(() => {
  // 每個Test前清理
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
  
  // 清理計時器
  jest.clearAllTimers();
  
  // 不Reset模組Cache，避免破壞 mock
  // jest.resetModules();
});

afterEach(() => {
  // 每個Test後清理
  jest.clearAllMocks();
  jest.clearAllTimers();
});

afterAll(() => {
  // 所有Test後清理
  jest.clearAllMocks();
  jest.clearAllTimers();
  // 不Reset模組Cache，避免破壞 mock
  // jest.resetModules();
});

// 模組隔離
const originalRequire = require;
const moduleCache = new Map();

// 隔離模組加載
function isolatedRequire(modulePath) {
  const cacheKey = modulePath;
  
  if (!moduleCache.has(cacheKey)) {
    // Clear模組Cache
    delete require.cache[require.resolve(modulePath)];
    const module = originalRequire(modulePath);
    moduleCache.set(cacheKey, module);
  }
  
  return moduleCache.get(cacheKey);
}

// Export隔離Settings
module.exports = {
  isolatedRequire,
  moduleCache,
};
