import '@testing-library/jest-dom';
import { server } from './integration/setup-msw';

// 設置 MSW 服務器
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// 模擬 window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// 模擬 ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// 模擬 IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// 模擬 performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: jest.fn(() => Date.now()),
    getEntriesByType: jest.fn(() => []),
    mark: jest.fn(),
    measure: jest.fn(),
  },
});

// 模擬 localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// 模擬 sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// 模擬 fetch
global.fetch = jest.fn();

// 模擬 console 方法以避免測試中的噪音
const originalConsole = { ...console };
beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

// 設置測試超時時間
jest.setTimeout(30000);

// 模擬模組聯邦
jest.mock('webpack/lib/container/ModuleFederationPlugin', () => {
  return jest.fn().mockImplementation(() => ({
    apply: jest.fn(),
  }));
});

// 模擬動態導入
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  lazy: jest.fn((importFunc) => {
    const LazyComponent = jest.fn(() => {
      const [Component, setComponent] = React.useState(null);

      React.useEffect(() => {
        importFunc().then((module) => {
          setComponent(() => module.default);
        });
      }, []);

      return Component ? <Component /> : <div>Loading...</div>;
    });

    LazyComponent.displayName = 'LazyComponent';
    return LazyComponent;
  }),
}));

// 自定義測試工具函數
export const waitForElementToBeRemoved = (element: Element | null) => {
  return new Promise<void>((resolve) => {
    if (!element) {
      resolve();
      return;
    }

    const observer = new MutationObserver(() => {
      if (!document.contains(element)) {
        observer.disconnect();
        resolve();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
};

// 模擬用戶事件
export const mockUserEvent = {
  click: jest.fn(),
  type: jest.fn(),
  hover: jest.fn(),
  unhover: jest.fn(),
  tab: jest.fn(),
  keyboard: jest.fn(),
};

// 測試數據工廠
export const createMockCard = (overrides = {}) => ({
  id: 1,
  name: '測試卡片',
  price: 100,
  rarity: 'common',
  set: '測試系列',
  condition: 'mint',
  ...overrides,
});

export const createMockMarketData = (overrides = {}) => ({
  cardId: 1,
  currentPrice: 100,
  priceHistory: [90, 95, 100, 105, 110],
  trend: 'upward',
  volatility: 'medium',
  volume: 1000,
  ...overrides,
});

export const createMockAIPrediction = (overrides = {}) => ({
  cardId: 1,
  predictedPrice: 120,
  confidence: 0.85,
  timeframe: '1m',
  factors: ['market_trend', 'demand_increase'],
  ...overrides,
});

// 測試環境變數
process.env.NODE_ENV = 'test';
process.env.REACT_APP_API_URL = 'http://localhost:5000';
process.env.REACT_APP_ENVIRONMENT = 'test';

// 清理函數
export const cleanupTestEnvironment = () => {
  // 清理 DOM
  document.body.innerHTML = '';

  // 清理 localStorage
  localStorageMock.clear();

  // 清理 sessionStorage
  sessionStorageMock.clear();

  // 重置 fetch mock
  (global.fetch as jest.Mock).mockClear();

  // 重置 console mocks
  jest.clearAllMocks();
};

// 自動清理
afterEach(() => {
  cleanupTestEnvironment();
});

// 導出測試工具
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
