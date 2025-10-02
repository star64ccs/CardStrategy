/**
 * E2E測試設置文件
 * 完整用戶流程，關鍵路徑測試
 */

import '@testing-library/jest-native/extend-expect';
import { configure } from '@testing-library/react-native';

// 配置測試庫
configure({
  asyncUtilTimeout: 30000,
  getElementError: (message, container) => {
    const error = new Error(message);
    error.stack = null;
    return error;
  },
});

// 全局測試設置
beforeAll(async () => {
  // E2E測試前的全局設置
});

beforeEach(() => {
  // 清理所有模擬
  jest.clearAllMocks();
});

afterEach(() => {
  // 重置所有模擬
  jest.resetAllMocks();
});

afterAll(async () => {
  // E2E測試後的清理
});

// 模擬全局對象
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// 模擬 React Native 平台
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn(obj => obj.ios),
}));

// 模擬 AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// 模擬 Expo 模組
jest.mock('expo', () => ({
  ...jest.requireActual('expo'),
  Linking: {
    openURL: jest.fn(),
  },
}));

// 模擬網路請求
global.fetch = jest.fn();

// 使用真實計時器進行E2E測試
jest.useRealTimers();

// 設置測試環境變量
process.env.NODE_ENV = 'test';
process.env.API_BASE_URL = 'http://localhost:3000';

// 模擬設備信息
jest.mock('expo-device', () => ({
  osName: 'iOS',
  osVersion: '15.0',
  deviceName: 'iPhone 13',
  isDevice: true,
}));

// 模擬文件系統
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock/document/',
  cacheDirectory: 'file:///mock/cache/',
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
}));
